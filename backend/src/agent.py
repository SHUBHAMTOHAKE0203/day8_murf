import json
import os
import logging
import asyncio
from typing import Annotated, Literal, Optional
from dataclasses import dataclass
from dotenv import load_dotenv
from pydantic import Field
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    RoomInputOptions,
    WorkerOptions,
    cli,
    function_tool,
    RunContext,
)

from livekit.plugins import murf, silero, google, deepgram, noise_cancellation
from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("agent")
load_dotenv(".env.local")

CONTENT_FILE = "../shared-data/day4_tutor_content.json"

def load_content():
    path = os.path.join(os.path.dirname(__file__), CONTENT_FILE)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

COURSE_CONTENT = load_content()

@dataclass
class TutorState:
    current_topic_id: str | None = None
    current_topic_data: dict | None = None
    mode: Literal["learn", "quiz", "teach_back"] = "learn"

    def set_topic(self, topic_id: str):
        topic = next((t for t in COURSE_CONTENT if t["id"] == topic_id), None)
        if topic:
            self.current_topic_id = topic_id
            self.current_topic_data = topic
            return True
        return False

@dataclass
class Userdata:
    tutor_state: TutorState
    agent_session: Optional[AgentSession] = None

@function_tool
async def select_topic(
    ctx: RunContext[Userdata],
    topic_id: Annotated[str, Field(description="Topic id to study")]
) -> str:
    state = ctx.userdata.tutor_state
    if state.set_topic(topic_id.lower()):
        return f"Topic set to {state.current_topic_data['title']}. Ask user if they want learn, quiz, or teach back."
    available = ", ".join([t["id"] for t in COURSE_CONTENT])
    return f"Topic not found. Available: {available}"

@function_tool
async def set_learning_mode(
    ctx: RunContext[Userdata],
    mode: Annotated[str, Field(description="learn, quiz, teach_back")]
) -> str:
    state = ctx.userdata.tutor_state
    state.mode = mode.lower()
    session = ctx.userdata.agent_session

    if session:
        if state.mode == "learn":
            session.tts.update_options(voice="en-US-matthew", style="Promo")
            instruction = state.current_topic_data["summary"]
        elif state.mode == "quiz":
            session.tts.update_options(voice="en-US-alicia", style="Conversational")
            instruction = state.current_topic_data["sample_question"]
        elif state.mode == "teach_back":
            session.tts.update_options(voice="en-US-ken", style="Promo")
            instruction = "Explain the topic to me as if I am a beginner."
        else:
            return "Invalid mode."
    else:
        instruction = ""

    return f"Switched to {state.mode}. {instruction}"

@function_tool
async def evaluate_teaching(
    ctx: RunContext[Userdata],
    user_explanation: Annotated[str, Field(description="User explanation")]
) -> str:
    return "Evaluate the user's explanation for accuracy, clarity, errors, and score out of 10."

class TutorAgent(Agent):
    def __init__(self):
        topics = ", ".join([f"{t['id']} ({t['title']})" for t in COURSE_CONTENT])
        super().__init__(
            instructions=f"""
            You are a CS tutor. Topics: {topics}.
            Modes: learn, quiz, teach_back.
            Ask user for a topic first.
            Use tools to switch modes and evaluate teach-back explanations.
            """,
            tools=[select_topic, set_learning_mode, evaluate_teaching],
        )

def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()

async def entrypoint(ctx: JobContext):
    userdata = Userdata(tutor_state=TutorState())

    session = AgentSession(
        stt=deepgram.STT(model="nova-3"),
        llm=google.LLM(model="gemini-2.5-flash"),
        tts=murf.TTS(
            voice="en-US-matthew",
            style="Promo",
            text_pacing=True,
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        userdata=userdata,
    )

    userdata.agent_session = session

    await session.start(
        agent=TutorAgent(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC()
        ),
    )

    await ctx.connect()

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))
