"""Константы приложения."""

from enum import Enum


class UpgradeType(str, Enum):
    """Типы апгрейдов."""
    CLICK_DAMAGE = "click_damage"
    PASSIVE_INCOME = "passive_income"


class UpgradeInfo:
    """Информация об апгрейдах."""
    
    UPGRADES = {
        UpgradeType.CLICK_DAMAGE: {
            "name": "Сила клика",
            "description": "Увеличивает количество монет за клик",
            "icon": "⚡",
            "base_price": 100,
            "base_value": 1.0,
            "multiplier": 1.5,
            "max_level": 50,
        },
        UpgradeType.PASSIVE_INCOME: {
            "name": "Пассивный доход",
            "description": "Увеличивает количество монет в секунду",
            "icon": "💰",
            "base_price": 1000,
            "base_value": 0.1,
            "multiplier": 1.2,
            "max_level": 50,
        },
    }
    
    @classmethod
    def get_upgrade_info(cls, upgrade_type: UpgradeType) -> dict:
        """Получить информацию об апгрейде."""
        return cls.UPGRADES[upgrade_type]
    
    @classmethod
    def get_all_upgrades(cls) -> dict:
        """Получить все типы апгрейдов."""
        return cls.UPGRADES


class LogLevel(str, Enum):
    """Уровни логирования."""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    SECURITY = "security"
