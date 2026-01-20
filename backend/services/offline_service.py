"""Сервис оффлайн-дохода."""

from datetime import datetime
from core.config import get_settings

settings = get_settings()


class OfflineService:
    """Сервис оффлайн-дохода."""
    
    @staticmethod
    async def calculate_offline_income(
        game_state,
        last_calculation: datetime,
        current_time: datetime
    ) -> int:
        """
        Рассчитать оффлайн-доход.
        
        Args:
            game_state: Состояние игры
            last_calculation: Время последнего расчёта
            current_time: Текущее время
            
        Returns:
            Количество заработанных монет
        """
        passive_income = game_state.passive_income_per_sec
        
        if passive_income <= 0:
            return 0
        
        # Расчёт времени оффлайна в секундах
        offline_seconds = int(
            (current_time - last_calculation).total_seconds()
        )
        
        if offline_seconds <= 0:
            return 0
        
        # Ограничение максимального времени оффлайна
        max_seconds = settings.OFFLINE_INCOME_MAX_HOURS * 3600
        calculated_seconds = min(offline_seconds, max_seconds)
        
        # Расчёт дохода
        offline_income = int(passive_income * calculated_seconds)
        
        return offline_income
