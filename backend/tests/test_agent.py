import pytest
from agent import Assistant

@pytest.mark.asyncio
async def test_add_recipe():
    agent = Assistant()
    result = await agent.add_to_cart(None, "peanut butter sandwich")
    assert "ingredients for peanut butter sandwich" in result.lower()

@pytest.mark.asyncio
async def test_place_order():
    agent = Assistant()
    await agent.add_to_cart(None, "Eggs", 1)
    result = await agent.place_order(None)
    assert "order placed" in result.lower()
