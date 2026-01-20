"""API роутеры."""

from routers.auth import auth_router
from routers.game import game_router
from routers.upgrades import upgrades_router
from routers.rewards import rewards_router
from routers.users import users_router

__all__ = [
    "auth_router",
    "game_router",
    "upgrades_router",
    "rewards_router",
    "users_router",
]
