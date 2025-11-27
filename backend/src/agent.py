# agent.py
"""
Fraud Alert Voice Agent (Day 6)
- Simple JSON DB (fraud_cases.json) used as persistence.
- Tools:
    - load_fraud_case(username)
    - verify_answer(answer)
    - get_transaction_summary()
    - update_fraud_case(updated_case)
- Safety: never asks for full card numbers, PINs, OTPs, or passwords.
"""
import json
import logging
import os
from typing import Any, Dict, Optional

from dotenv import load_dotenv

# Try importing LiveKit agent libs; fallback for unit tests / local use.
try:
    from livekit.agents import Agent, AgentSession, JobContext, JobProcess, MetricsCollectedEvent, RoomInputOptions, WorkerOptions, cli, metrics, tokenize, function_tool, RunContext
    from livekit.plugins import murf, silero, google, deepgram, noise_cancellation
    from livekit.plugins.turn_detector.multilingual import MultilingualModel
except Exception:
    Agent = object  # type: ignore
    def function_tool(fn): return fn  # type: ignore
    class RunContext: pass

logger = logging.getLogger("fraud_agent")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
logger.addHandler(handler)

load_dotenv(".env.local")

FRAUD_DB = os.environ.get("FRAUD_DB", "fraud_cases.json")


def load_fraud_db(path: str) -> Dict[str, Any]:
    if not os.path.exists(path):
        with open(path, "w", encoding="utf-8") as f:
            json.dump({}, f, indent=2)
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_fraud_db(path: str, db: Dict[str, Any]):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)


class FraudAgent(Agent):
    def __init__(self):
        instructions = (
            "You are a Fraud Alert Representative for a fictional bank. "
            "When a session starts, ask for username and load the fraud case using load_fraud_case(username). "
            "Use only non-sensitive verification (security question from the case). "
            "If verified: read merchant, amount, masked card ending, time, location; ask yes/no if user made it. "
            "If yes -> set status 'confirmed_safe'. If no -> set status 'confirmed_fraud' (mock actions like block card). "
            "If verification fails -> set status 'verification_failed' and end politely. "
            "Persist outcome with update_fraud_case(updated_case). Never ask for card numbers, PINs, OTPs, or passwords."
        )
        try:
            super().__init__(instructions=instructions)
        except Exception:
            self.instructions = instructions  # for tests when Agent base not available
        self.current_case: Optional[Dict[str, Any]] = None

    @function_tool
    async def load_fraud_case(self, ctx: RunContext, username: str) -> Dict[str, Any]:
        db = load_fraud_db(FRAUD_DB)
        case = db.get(username)
        if not case:
            logger.info("No case found for username=%s", username)
            return {"found": False}
        self.current_case = case.copy()
        logger.info("Loaded case for %s (merchant=%s amount=%s)", username, case.get("transactionName"), case.get("transactionAmount"))
        return {"found": True, "case": self.current_case}

    @function_tool
    async def verify_answer(self, ctx: RunContext, answer: str) -> Dict[str, Any]:
        if self.current_case is None:
            return {"error": "no_case_loaded", "verified": False}
        expected = str(self.current_case.get("securityAnswer", "")).strip().lower()
        given = str(answer or "").strip().lower()
        verified = (expected != "" and given == expected)
        logger.info("Verification: expected='%s' given='%s' => %s", expected, given, verified)
        return {"verified": verified}

    @function_tool
    async def get_transaction_summary(self, ctx: RunContext) -> Dict[str, Any]:
        if self.current_case is None:
            return {"error": "no_case_loaded"}
        c = self.current_case
        summary = (
            f"Transaction at {c.get('transactionName','UNKNOWN')} for {c.get('transactionAmount','an amount')}. "
            f"Card ending: {c.get('cardEnding','XXXX')}. Time: {c.get('transactionTime','unknown')}. "
            f"Location: {c.get('transactionLocation','unknown')}. Category: {c.get('transactionCategory','unknown')}."
        )
        return {"summary": summary, "case": c}

    @function_tool
    async def update_fraud_case(self, ctx: RunContext, updated_case: Dict[str, Any]) -> Dict[str, Any]:
        if not isinstance(updated_case, dict) or not updated_case.get("userName"):
            return {"status": "error", "message": "invalid_case"}
        db = load_fraud_db(FRAUD_DB)
        db[updated_case["userName"]] = updated_case
        save_fraud_db(FRAUD_DB, db)
        self.current_case = updated_case.copy()
        logger.info("Updated case for %s -> status=%s", updated_case["userName"], updated_case.get("status"))
        return {"status": "ok", "saved": updated_case}

    # helper to construct outcome
    def build_outcome_note_and_status(self, decision: str, note: Optional[str] = None) -> Dict[str, Any]:
        if self.current_case is None:
            raise RuntimeError("no case loaded")
        case = self.current_case.copy()
        if decision == "safe":
            case["status"] = "confirmed_safe"
            case["outcomeNote"] = note or "Customer confirmed transaction as legitimate."
        elif decision == "fraud":
            case["status"] = "confirmed_fraud"
            case["outcomeNote"] = note or "Customer denied transaction. Card blocked and dispute opened (mock)."
        else:
            case["status"] = "verification_failed"
            case["outcomeNote"] = note or "Verification failed; could not proceed."
        return case


# Prewarm and entrypoint included for completeness (run only if livekit libs available)
def prewarm(proc: JobProcess):
    try:
        logger.info("Prewarming VAD...")
        proc.userdata["vad"] = silero.VAD.load()
    except Exception:
        logger.info("Prewarm skipped.")


async def entrypoint(ctx: JobContext):
    ctx.log_context_fields = {"room": ctx.room.name}
    session = AgentSession(
        stt=deepgram.STT(model="nova-3"),
        llm=google.LLM(model="gemini-2.5-flash"),
        tts=murf.TTS(
            voice="en-US-matthew",
            style="Conversation",
            tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
            text_pacing=True,
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata.get("vad"),
        preemptive_generation=True,
    )

    usage_collector = metrics.UsageCollector()
    @session.on("metrics_collected")
    def _on_metrics_collected(ev: MetricsCollectedEvent):
        metrics.log_metrics(ev.metrics)
        usage_collector.collect(ev.metrics)

    async def log_usage():
        logger.info("Usage summary: %s", usage_collector.get_summary())
    ctx.add_shutdown_callback(log_usage)

    agent = FraudAgent()
    await session.start(agent=agent, room=ctx.room, room_input_options=RoomInputOptions(noise_cancellation=noise_cancellation.BVC()))
    await ctx.connect()


if __name__ == "__main__":
    try:
        cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))
    except Exception:
        logger.exception("LiveKit CLI failed to start (dependencies may be missing).")
