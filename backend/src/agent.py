import logging
import os
from dotenv import load_dotenv

from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    RoomInputOptions,
    WorkerOptions,
    cli,
    RunContext,
)
from livekit.plugins import murf, silero, google, deepgram, noise_cancellation
from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("agent")
load_dotenv(".env.local")

# -------------------------------------------------------
# DAY 8 – YEH JAWAANI HAI DEEWANI – VOICE GAME MASTER (ADITI WEDDING)
# -------------------------------------------------------
GAME_MASTER_PROMPT = """
You are a Game Master narrating an interactive story in the Bollywood movie
'Yeh Jawaani Hai Deewani', starting from Aditi's wedding.

Tone & Style:
- Filmy, youthful, energetic, and warm.
- Produce 2–5 sentence paragraphs with cinematic detail: sight, sound, music, emotions.
- Include casual Hinglish/dialogue occasionally.
- Keep output plain text (no *, _, markdown, or special characters).

Important Rules:
- Stay in character as a Bollywood-style GM.
- Follow the movie’s sequence starting from Aditi’s wedding.
- Maintain continuity with chat history: remember characters, locations, past choices.
- End every message with "What do you do?" exactly once.
- Keep responses short and cinematic (4–5 sentences max).
"""

class GameMaster(Agent):
    def __init__(self):
        super().__init__(instructions=GAME_MASTER_PROMPT)
        self.scene_step = 0  # Track story progression

    async def on_start(self, ctx: RunContext):
        """Opening scene: Aditi's wedding."""
        opening = (
            "The wedding hall is buzzing with energy. Fairy lights twinkle above, "
            "guests laugh and chatter, and the aroma of flowers fills the air. "
            "Bunny, dressed sharply, spots Naina entering, her eyes wide with nostalgia. "
            "Aditi glows in her bridal lehenga, while Avi fumbles with the camera, capturing every moment. "
            "What do you do?"
        )
        await ctx.send_output(opening)
        self.scene_step = 1

# -----------------------------------------
# PREWARM
# -----------------------------------------
def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()

# -----------------------------------------
# ENTRYPOINT
# -----------------------------------------
async def entrypoint(ctx: JobContext):
    session = AgentSession(
        stt=deepgram.STT(model="nova-3"),
        llm=google.LLM(model="gemini-2.5-flash"),
        tts=murf.TTS(
            voice="Aman",  # Use "Karan" or "Aman"
            style="Conversation",
            text_pacing=True,
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
    )

    await session.start(
        agent=GameMaster(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC()
        ),
    )

    await ctx.connect()

# -----------------------------------------
# RUN APP
# -----------------------------------------
if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm
        )
    )
