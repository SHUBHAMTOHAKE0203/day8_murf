import logging
import os
import json
import datetime
from dotenv import load_dotenv
from typing import List, Dict

from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    RoomInputOptions,
    WorkerOptions,
    cli,
    tokenize,
    function_tool,
    RunContext,
    metrics,
    MetricsCollectedEvent,
)
from livekit.plugins import murf, silero, google, deepgram, noise_cancellation
from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("agent")
load_dotenv(".env.local")


class Assistant(Agent):
    def __init__(self):
        super().__init__(
            instructions="You are a friendly grocery ordering assistant. Help users order food and groceries."
        )

        base = os.path.join(os.path.dirname(__file__), "..", "data")

        self.catalog = self._load_json(os.path.join(base, "catalog.json"))
        recipes = self._load_json(os.path.join(base, "recipes.json"))

        # Convert recipes list → dict for lookup
        self.recipes = {
            r["name"].lower(): r["items"]
            for r in recipes.get("recipes", [])
        }

        self.cart: List[Dict] = []

    def _load_json(self, path):
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        logger.warning(f"Missing file: {path}")
        return {}

    def _find_item(self, name: str):
        return next(
            (x for x in self.catalog if name.lower() in x["name"].lower()), None
        )

    @function_tool
    async def add_to_cart(self, context: RunContext, item: str, quantity: int = 1):
        # Check if it's a recipe
        if item.lower() in self.recipes:
            added_texts = []
            for entry in self.recipes[item.lower()]:
                await self.add_to_cart(context, entry["item"], entry["quantity"])
                added_texts.append(f"{entry['quantity']} x {entry['item']}")
            return f"I added ingredients for {item}: " + ", ".join(added_texts)

        # Regular single item
        matched = self._find_item(item)
        if not matched:
            return f"Item '{item}' not found in catalog."

        existing = next((x for x in self.cart if x["name"] == matched["name"]), None)
        if existing:
            existing["quantity"] += quantity
        else:
            self.cart.append({
                "name": matched["name"],
                "quantity": quantity,
                "price": matched["price"]
            })
        return f"Added {quantity} x {matched['name']}."

    @function_tool
    async def show_cart(self, context: RunContext):
        if not self.cart:
            return "Your cart is empty."
        return "\n".join([f"{x['quantity']} x {x['name']}" for x in self.cart])

    @function_tool
    async def update_cart(self, context: RunContext, item: str, quantity: int):
        existing = next((x for x in self.cart if item.lower() in x["name"].lower()), None)
        if not existing:
            return f"{item} is not in your cart."

        if quantity <= 0:
            self.cart.remove(existing)
            return f"Removed {existing['name']}."

        existing["quantity"] = quantity
        return f"Updated {existing['name']} to {quantity}."

    @function_tool
    async def place_order(self, context: RunContext):
        if not self.cart:
            return "Your cart is empty — add something first!"

        orders_dir = os.path.join(os.path.dirname(__file__), "..", "orders")
        os.makedirs(orders_dir, exist_ok=True)

        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        total = sum(x["quantity"] * x.get("price", 0) for x in self.cart)

        order = {
            "items": self.cart,
            "total": total,
            "timestamp": timestamp,
        }

        filename = os.path.join(orders_dir, f"order_{timestamp}.json")
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(order, f, indent=2)

        self.cart = []  # reset cart
        return f"Order placed! Total: ${total:.2f}. Saved to {filename}."


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
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
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
    )

    await session.start(
        agent=Assistant(),
        room=ctx.room,
        room_input_options=RoomInputOptions(noise_cancellation=noise_cancellation.BVC()),
    )
    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))
