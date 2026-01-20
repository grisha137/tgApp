"""Схемы Pydantic для API."""

from schemas.game import (
    UserSchema,
    GameStateSchema,
    UpgradeSchema,
    DailyRewardSchema,
    ClickRequest,
    ClickResponse,
    UpgradeRequest,
    UpgradeResponse,
    DailyRewardResponse,
    UserStatsSchema,
    GameFullStateSchema,
)

__all__ = [
    "UserSchema",
    "GameStateSchema",
    "UpgradeSchema",
    "DailyRewardSchema",
    "ClickRequest",
    "ClickResponse",
    "UpgradeRequest",
    "UpgradeResponse",
    "DailyRewardResponse",
    "UserStatsSchema",
    "GameFullStateSchema",
]
