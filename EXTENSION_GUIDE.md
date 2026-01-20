# 🚀 Гайд по расширению функционала

Подробное руководство по добавлению новых функций в Telegram Mini App.

## 📋 Содержание

1. [Добавление новых апгрейдов](#добавление-новых-апгрейдов)
2. [Добавление новых API эндпоинтов](#добавление-новых-api-эндпоинтов)
3. [Добавление новых страниц на фронтенде](#добавление-новых-страниц-на-фронтенде)
4. [Добавление новых игровых механик](#добавление-новых-игровых-механик)
5. [Добавление системы достижений](#добавление-системы-достижений)
6. [Добавление排行榜 (Leaderboard)](#добавление-рейтинга-leaderboard)

---

## 🔧 Добавление новых апгрейдов

### Шаг 1: Обновить константы

```python
# backend/core/constants.py
class UpgradeType(str, Enum):
    CLICK_DAMAGE = "click_damage"
    PASSIVE_INCOME = "passive_income"
    CRITICAL_CHANCE = "critical_chance"  # Новый тип

class UpgradeInfo:
    UPGRADES = {
        # ... существующие ...
        UpgradeType.CRITICAL_CHANCE: {
            "name": "Шанс крита",
            "description": "Шанс двойного урона при клике",
            "icon": "💥",
            "base_price": 500,
            "base_value": 0.05,  # 5% на уровне 1
            "multiplier": 1.1,    # +10% за уровень
            "max_level": 50,
        },
    }
```

### Шаг 2: Обновить модель

```python
# backend/models/game.py
class GameState(Base):
    # ... существующие поля ...
    critical_chance_level = Column(Integer, default=0, nullable=False)
```

### Шаг 3: Обновить логику клика

```python
# backend/services/game_service.py
@staticmethod
async def process_clicks(...):
    # ... существующий код ...
    
    # Добавляем логику крита
    from models import GameState
    critical_chance = UpgradeService.calculate_upgrade_value(
        "critical_chance",
        game_state.critical_chance_level
    )
    
    is_critical = random.random() < critical_chance
    multiplier = 2 if is_critical else 1
    
    coins_gained = int(click_damage * count * multiplier)
    
    # ... обновление БД ...
```

### Шаг 4: Обновить фронтенд

```typescript
// frontend/src/pages/GamePage.tsx
const criticalChance = gameState
  ? 0.05 * Math.pow(1.1, gameState.critical_chance_level)
  : 0;

// Добавить в UI
<div className="text-orange-400">
  Шанс крита: {(criticalChance * 100).toFixed(1)}%
</div>
```

---

## 🌐 Добавление новых API эндпоинтов

### Шаг 1: Создать Pydantic схему

```python
# backend/schemas/game.py
class NewFeatureRequest(BaseModel):
    param1: str
    param2: int = Field(default=10, ge=1, le=100)

class NewFeatureResponse(BaseModel):
    success: bool
    result: int
    message: Optional[str] = None
```

### Шаг 2: Создать сервис

```python
# backend/services/new_feature_service.py
class NewFeatureService:
    @staticmethod
    async def process_new_feature(
        user: User,
        request: NewFeatureRequest,
        db: AsyncSession
    ) -> NewFeatureResponse:
        # Бизнес-логика
        result = calculate_result(request.param1, request.param2)
        
        # Обновление БД если нужно
        user.last_activity = datetime.utcnow()
        await db.commit()
        
        return NewFeatureResponse(
            success=True,
            result=result,
            message="Success!"
        )
```

### Шаг 3: Создать роутер

```python
# backend/routers/new_feature.py
from fastapi import APIRouter, Depends
from database import get_db
from schemas.game import NewFeatureRequest, NewFeatureResponse
from services.new_feature_service import NewFeatureService
from routers.auth import get_current_user
from models import User

router = APIRouter(prefix="/api/new-feature", tags=["new-feature"])

@router.post("/action", response_model=NewFeatureResponse)
async def new_feature_action(
    request: NewFeatureRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await NewFeatureService.process_new_feature(
        current_user,
        request,
        db
    )
```

### Шаг 4: Зарегистрировать роутер

```python
# backend/main.py
from routers import new_feature_router

app.include_router(new_feature_router)
```

### Шаг 5: Добавить в API клиент (фронтенд)

```typescript
// frontend/src/services/api.ts
async newFeatureAction(param1: string, param2: number): Promise<NewFeatureResponse> {
  const response = await apiClient.post('/new-feature/action', {
    param1,
    param2,
  });
  return response.data;
}
```

---

## 📱 Добавление новых страниц на фронтенде

### Шаг 1: Создать страницу

```typescript
// frontend/src/pages/NewPage.tsx
import React from 'react';
import { useGameState } from '../hooks/useGameState';

export const NewPage: React.FC = () => {
  const { gameState } = useGameState();

  return (
    <div className="pb-24 animate-slide-up">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-2">
          Новая страница
        </h1>
        {/* Контент страницы */}
      </div>
    </div>
  );
};
```

### Шаг 2: Добавить в типы

```typescript
// frontend/src/types/index.ts
export type TabType = 'game' | 'upgrades' | 'stats' | 'profile' | 'new';
```

### Шаг 3: Добавить в навигацию

```typescript
// frontend/src/components/Navigation.tsx
const TABS: TabConfig[] = [
  // ... существующие ...
  { id: 'new', label: 'Новое', icon: '✨' },
];
```

### Шаг 4: Добавить роут

```typescript
// frontend/src/App.tsx
<Route path="/new" element={<NewPage />} />
```

---

## 🎮 Добавление новых игровых механик

### Пример: Система achievements

#### Бэкенд

```python
# backend/models/achievement.py
class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    achievement_type = Column(String(50))
    unlocked_at = Column(DateTime, default=datetime.utcnow)
    
    # Связь
    user = relationship("User", back_populates="achievements")

# backend/models/user.py
class User(Base):
    # ... существующие поля ...
    achievements = relationship("Achievement", back_populates="user")
```

```python
# backend/services/achievement_service.py
class AchievementService:
    ACHIEVEMENTS = {
        "first_click": {"name": "Первый клик", "icon": "🖱️"},
        "hundred_clicks": {"name": "100 кликов", "icon": "💯"},
        "thousand_clicks": {"name": "1000 кликов", "icon": "🏆"},
        # ...
    }
    
    @staticmethod
    async def check_and_unlock(
        user_id: int,
        event_type: str,
        db: AsyncSession
    ):
        # Проверка и разблокировка достижений
        pass
```

#### Фронтенд

```typescript
// frontend/src/components/AchievementBadge.tsx
export const AchievementBadge: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-4">
      <div className="text-4xl mb-2">{achievement.icon}</div>
      <div className="text-white font-semibold">{achievement.name}</div>
      <div className="text-xs text-gray-400">
        Разблокировано: {formatDate(achievement.unlockedAt)}
      </div>
    </div>
  );
};
```

---

## 🏆 Добавление системы достижений

### Шаг 1: Создать модель достижений

```python
# backend/models/achievement.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Achievement(Base):
    """Модель достижений."""
    
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    achievement_type = Column(String(50), nullable=False)
    achievement_name = Column(String(100), nullable=False)
    achievement_icon = Column(String(10), nullable=False)
    
    unlocked_at = Column(DateTime, default=datetime.utcnow)
    
    # Связь
    user = relationship("User")
```

### Шаг 2: Добавить в модель User

```python
# backend/models/user.py
achievements = relationship("Achievement", back_populates="user")
```

### Шаг 3: Создать сервис достижений

```python
# backend/services/achievement_service.py
class AchievementService:
    """Сервис достижений."""
    
    ACHIEVEMENTS = {
        "first_click": {
            "name": "Первый клик",
            "icon": "🖱️",
            "condition": lambda total_clicks: total_clicks >= 1,
        },
        "hundred_clicks": {
            "name": "Сотня кликов",
            "icon": "💯",
            "condition": lambda total_clicks: total_clicks >= 100,
        },
        "thousand_clicks": {
            "name": "Тысяча кликов",
            "icon": "🏆",
            "condition": lambda total_clicks: total_clicks >= 1000,
        },
        "ten_thousand_clicks": {
            "name": "Десяток тысяч",
            "icon": "⭐",
            "condition": lambda total_clicks: total_clicks >= 10000,
        },
        "first_upgrade": {
            "name": "Первый апгрейд",
            "icon": "⚡",
            "condition": lambda total_upgrades: total_upgrades >= 1,
        },
        "rich": {
            "name": "Богач",
            "icon": "💰",
            "condition": lambda total_coins: total_coins >= 10000,
        },
    }
    
    @staticmethod
    async def check_achievements(
        user_id: int,
        game_state: GameState,
        db: AsyncSession
    ):
        """Проверить и разблокировать достижения."""
        from sqlalchemy import select
        from models import Achievement
        
        # Получить уже разблокированные
        result = await db.execute(
            select(Achievement).where(Achievement.user_id == user_id)
        )
        unlocked_types = {a.achievement_type for a in result.scalars().all()}
        
        # Проверить все достижения
        for achievement_type, achievement_info in AchievementService.ACHIEVEMENTS.items():
            if achievement_type in unlocked_types:
                continue
            
            # Проверить условие
            condition = achievement_info["condition"]
            
            if achievement_type in ["first_click", "hundred_clicks", "thousand_clicks", "ten_thousand_clicks"]:
                if condition(game_state.total_clicks):
                    await AchievementService._unlock_achievement(
                        user_id, achievement_type, achievement_info, db
                    )
            
            elif achievement_type == "first_upgrade":
                total_upgrades = sum([
                    game_state.click_damage_level,
                    game_state.passive_income_level
                ])
                if condition(total_upgrades):
                    await AchievementService._unlock_achievement(
                        user_id, achievement_type, achievement_info, db
                    )
            
            elif achievement_type == "rich":
                if condition(game_state.coins):
                    await AchievementService._unlock_achievement(
                        user_id, achievement_type, achievement_info, db
                    )
        
        await db.commit()
    
    @staticmethod
    async def _unlock_achievement(
        user_id: int,
        achievement_type: str,
        achievement_info: dict,
        db: AsyncSession
    ):
        """Разблокировать достижение."""
        from models import Achievement
        
        achievement = Achievement(
            user_id=user_id,
            achievement_type=achievement_type,
            achievement_name=achievement_info["name"],
            achievement_icon=achievement_info["icon"],
        )
        db.add(achievement)
```

### Шаг 4: Интегрировать в игровые действия

```python
# backend/services/game_service.py
async def process_clicks(...):
    # ... существующий код ...
    
    # Проверить достижения
    await AchievementService.check_achievements(user.id, game_state, db)
```

### Шаг 5: Создать API эндпоинт

```python
# backend/routers/achievements.py
@router.get("/")
async def get_achievements(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Achievement).where(Achievement.user_id == current_user.id)
    )
    achievements = result.scalars().all()
    return achievements
```

---

## 📊 Добавление рейтинга (Leaderboard)

### Шаг 1: Создать API эндпоинт

```python
# backend/routers/leaderboard.py
@router.get("/top")
async def get_leaderboard(
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import select, desc
    
    result = await db.execute(
        select(User, GameState)
        .join(GameState)
        .order_by(desc(GameState.coins))
        .limit(limit)
    )
    
    leaderboard = []
    rank = 1
    for user, game_state in result:
        leaderboard.append({
            "rank": rank,
            "user_id": user.id,
            "username": user.username or "Anonymous",
            "first_name": user.first_name,
            "coins": game_state.coins,
            "total_clicks": game_state.total_clicks,
        })
        rank += 1
    
    return leaderboard
```

### Шаг 2: Создать страницу лидерборда

```typescript
// frontend/src/pages/LeaderboardPage.tsx
export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const data = await api.getLeaderboard();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="pb-24">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-4">🏆 Рейтинг</h1>
        
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div key={entry.rank} className="bg-dark-card rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-primary-400">
                  #{entry.rank}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">
                    {entry.first_name}
                  </div>
                  <div className="text-sm text-gray-400">
                    @{entry.username || 'anonymous'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">
                    {formatCoins(entry.coins)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatCoins(entry.total_clicks)} кликов
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## 📝 Советы по расширению

### Следуйте существующим паттернам

1. **Бэкенд:** Routes → Services → Models
2. **Фронтенд:** Pages → Components → Hooks
3. **Типы:** Определяйте типы в `types/index.ts`

### Валидация на сервере

Никогда не доверяйте данным от клиента:
```python
# ❌ Плохо - доверяем клиенту
coins += request.coins_gained

# ✅ Хорошо - пересчитываем на сервере
coins += calculate_coins(request.count)
```

### Логирование

Добавляйте логирование для новых функций:
```python
log = UserLog(
    user_id=user.id,
    action_type="new_feature",
    action_details=f"Did something: {details}",
)
db.add(log)
```

### Тестирование

Добавляйте тесты для новой функциональности:
```python
async def test_new_feature():
    response = await NewFeatureService.process_new_feature(...)
    assert response.success is True
```

### Документация

Обновляйте документацию:
- Добавьте новые эндпоинты в `API.md`
- Обновите архитектуру в `ARCHITECTURE.md`
- Добавьте инструкции в этот гайд

---

## 🚀 Пример: Добавление механики "Spin to Win"

### Бэкенд

```python
# backend/models/spin.py
class SpinHistory(Base):
    __tablename__ = "spin_history"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    prize = Column(BigInteger)
    spin_time = Column(DateTime, default=datetime.utcnow)
```

```python
# backend/services/spin_service.py
class SpinService:
    REWARDS = [
        {"min": 100, "max": 500, "probability": 0.6},
        {"min": 500, "max": 1000, "probability": 0.3},
        {"min": 1000, "max": 2000, "probability": 0.08},
        {"min": 2000, "max": 5000, "probability": 0.019},
        {"min": 5000, "max": 10000, "probability": 0.001},
    ]
    
    @staticmethod
    async def spin(user_id: int, db: AsyncSession) -> int:
        """Вращение колеса фортуны."""
        import random
        
        # Выбор награды
        rand = random.random()
        cumulative = 0.0
        
        for reward in SpinService.REWARDS:
            cumulative += reward["probability"]
            if rand <= cumulative:
                prize = random.randint(reward["min"], reward["max"])
                break
        
        # Начисление
        # ... обновление coins ...
        
        # Логирование
        spin = SpinHistory(user_id=user_id, prize=prize)
        db.add(spin)
        
        return prize
```

### Фронтенд

```typescript
// frontend/src/components/SpinWheel.tsx
export const SpinWheel: React.FC = () => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  
  const handleSpin = async () => {
    setSpinning(true);
    const prize = await api.spin();
    setResult(prize);
    setTimeout(() => setSpinning(false), 3000);
  };
  
  return (
    <div className="text-center">
      <button
        onClick={handleSpin}
        disabled={spinning}
        className={`
          w-64 h-64 rounded-full border-8 border-yellow-500
          ${spinning ? 'animate-spin' : ''}
        `}
      >
        🎰
      </button>
      {result !== null && (
        <div className="text-4xl font-bold text-white mt-4">
          +{result} 💰
        </div>
      )}
    </div>
  );
};
```

---

Этот гайд поможет вам расширять приложение по вашим потребностям. Помните о безопасности, тестировании и документации! 🚀
