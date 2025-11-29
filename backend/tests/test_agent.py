import pytest
from agent import GameMaster

@pytest.mark.asyncio
async def test_gm_starts_with_scene():
    gm = GameMaster()

    class DummyContext:
        def __init__(self):
            self.last_output = ""

        async def send_output(self, text):
            self.last_output = text

    ctx = DummyContext()
    await gm.on_start(ctx)

    out = ctx.last_output.lower()
    assert "trek" in out or "mountain" in out or "dawn" in out  # scene present
    assert out.count("what do you do") == 1

@pytest.mark.asyncio
async def test_gm_generate_descriptive_response_and_single_prompt():
    gm = GameMaster()

    # Simulate an LLM call: include system instruction + a user message
    response = await gm.llm.generate(
        messages=[
            {"role": "system", "content": gm.instructions},
            {"role": "user", "content": "I walk ahead and call to Bunny to wait."}
        ]
    )

    text = response.text.lower()
    # must contain the single prompt and be descriptive (length check)
    assert "what do you do" in text
    assert text.count("what do you do") == 1
    assert len(text.split()) >= 10  # ensure it's not trivially short

@pytest.mark.asyncio
async def test_continuity_memory():
    gm = GameMaster()

    response = await gm.llm.generate(
        messages=[
            {"role": "system", "content": gm.instructions},
            {"role": "user", "content": "I pick up the thermos from the bag."},
            {"role": "assistant", "content": "You pick up the thermos. What do you do?"},
            {"role": "user", "content": "I pass the thermos to Naina and ask her to drink."}
        ]
    )

    text = response.text.lower()
    assert "thermos" in text  # remembers the object
    assert text.count("what do you do") == 1
