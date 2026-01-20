# 🏗️ Архитектура проекта

Подробное описание архитектуры, паттернов и решений, использованных в проекте.

## 📐 Общая архитектура

Проект построен по архитектуре клиент-сервер с чётким разделением ответственности:

```
┌─────────────────────────────────────────────────────────┐
│                      Client Layer                     │
│                  (React + TypeScript)                  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
                     │ (JWT Auth)
┌────────────────────┴────────────────────────────────────┐
│                   Server Layer                        │
│                    (FastAPI)                           │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐     │
│  │  Routes  │→ │ Services │→ │      Models      │     │
│  └──────────┘  └──────────┘  └──────────────────┘     │
└────────────────────┬────────────────────────────────────┘
                     │ SQL
┌────────────────────┴────────────────────────────────────┐
│                Data Layer (PostgreSQL)                  │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Frontend Архитектура

### Компонентная структура

Frontend построен на компонентной архитектуре React с использованием TypeScript.

```
src/
├── components/      # Переиспользуемые UI компоненты
├── pages/          # Страницы (маршруты)
├── hooks/          # React hooks для бизнес-логики
├── services/       # API клиенты и интеграции
├── types/          # TypeScript типы
└── utils/          # Утилиты (форматирование, анимации)
```

### Основные паттерны

#### 1. Компонентная композиция
Компоненты разделены на UI и логические:

```typescript
// UI компонент - только рендеринг
interface ClickButtonProps {
  onClick: (event: React.MouseEvent) => void;
  clickDamage: number;
}

// Использование хука для бизнес-логики
const { handleClick } = useGameState();
```

#### 2. Custom Hooks
Бизнес-логика инкапсулирована в хуки:

```typescript
// src/hooks/useGameState.ts
export const useGameState = () => {
  const [gameState, setGameState] = useState(null);
  const handleClick = useCallback(...)
  const purchaseUpgrade = useCallback(...)
  return { gameState, handleClick, purchaseUpgrade };
};
```

#### 3. API Service Pattern
Вся работа с API вынесена в отдельный сервис:

```typescript
// src/services/api.ts
const apiClient = axios.create({ baseURL: '/api' });
export const api = {
  async getGameState() { ... },
  async click(count) { ... },
  ...
};
```

### State Management

Используется локальный state в компонентах + Context API для глобального состояния:

```typescript
// Локальный state
const [gameState, setGameState] = useState(null);

// Через хук - логика и state вместе
const { gameState, handleClick, purchaseUpgrade } = useGameState();
```

### React Router

Навигация реализована через React Router v6:

```typescript
<Router>
  <Routes>
    <Route path="/" element={<GamePage />} />
    <Route path="/upgrades" element={<UpgradesPage />} />
    ...
  </Routes>
</Router>
```

### Типизация

Все типы определены централизованно:

```typescript
// src/types/index.ts
export interface User { ... }
export interface GameState { ... }
export interface Upgrade { ... }
```

## 🎯 Backend Архитектура

### Слоистая архитектура

Backend построен по трёхуровневой архитектуре:

```
┌─────────────────────────────────────────┐
│         Routes Layer (API)             │  <- Обработка HTTP запросов
├─────────────────────────────────────────┤
│        Services Layer                  │  <- Бизнес-логика
├─────────────────────────────────────────┤
│         Data Access Layer              │  <- Работа с БД
└─────────────────────────────────────────┘
```

### Роутеры (Routes Layer)

**Назначение:** Обработка HTTP запросов, валидация, авторизация.

```python
# routers/game.py
@router.post("/click")
async def click(
    request: ClickRequest,
    current_user: User = Depends(get_current_user),  # Авторизация
    db: AsyncSession = Depends(get_db)                # БД сессия
):
    response = await GameService.process_clicks(...)
    return response
```

### Сервисы (Services Layer)

**Назначение:** Бизнес-логика, изолированная от HTTP.

```python
# services/game_service.py
class GameService:
    @staticmethod
    async def process_clicks(
        user: User,
        game_state: GameState,
        request: ClickRequest,
        db: AsyncSession
    ) -> ClickResponse:
        # Бизнес-логика без HTTP зависимостей
        click_damage = calculate_click_damage(...)
        coins_gained = click_damage * request.count
        ...
```

### Модели (Data Access Layer)

**Назначение:** SQLAlchemy ORM модели для работы с БД.

```python
# models/game.py
class GameState(Base):
    __tablename__ = "game_states"
    
    id = Column(Integer, primary_key=True)
    coins = Column(BigInteger, default=0)
    ...
```

### Pydantic Схемы

**Назначение:** Валидация данных и сериализация.

```python
# schemas/game.py
class ClickRequest(BaseModel):
    count: int = Field(default=1, ge=1, le=10)

class ClickResponse(BaseModel):
    coins: int
    coins_gained: int
    ...
```

## 🗄️ База данных

### ER Диаграмма

```
┌──────────────┐
│    User      │
├──────────────┤
│ id (PK)      │
│ telegram_id  │◄──────────┐
│ username     │            │
│ coins        │            │
│ total_clicks │            │
│ ...          │            │
└──────────────┘            │
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  GameState   │    │   Upgrade    │    │ DailyReward  │
├──────────────┤    ├──────────────┤    ├──────────────┤
│ user_id (FK) │    │ user_id (FK) │    │ user_id (FK) │
│ coins        │    │ upgrade_type │    │ last_claim   │
│ passive_...  │    │ level        │    │ current_...  │
│ ...          │    │ ...          │    │ ...          │
└──────────────┘    └──────────────┘    └──────────────┘
                             │
                    ┌────────┴────────┐
                    │  UserLog       │
                    ├────────────────┤
                    │ user_id (FK)   │
                    │ action_type    │
                    │ ...            │
                    └────────────────┘
```

### Связи

- **User 1:1 GameState** - один пользователь, одно состояние игры
- **User 1:N Upgrade** - один пользователь, множество апгрейдов
- **User 1:1 DailyReward** - один пользователь, одна запись награды
- **User 1:N UserLog** - один пользователь, множество логов

### Индексы

```python
# Уникальные индексы для быстрого поиска
telegram_id = Column(BigInteger, unique=True, index=True)

# Индексы по внешним ключам
user_id = Column(Integer, ForeignKey("users.id"), index=True)
```

## 🔐 Безопасность

### Аутентификация

1. **Telegram initData Verification**
```python
def verify_telegram_init_data(init_data: str) -> dict:
    # HMAC-SHA256 проверка подписи
    # Проверка auth_date (не старше 300 сек)
    # Парсинг user данных
```

2. **JWT Tokens**
```python
def create_access_token(data: dict) -> str:
    # Создание JWT с expiry
    expire = datetime.utcnow() + timedelta(days=7)
    token = jwt.encode(data, SECRET_KEY, algorithm="HS256")
```

3. **Dependency Injection**
```python
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    # Декодирование JWT
    # Получение пользователя из БД
```

### Авторизация

Проверка прав через `Depends`:

```python
@router.post("/click")
async def click(
    current_user: User = Depends(get_current_user)  # Требует авторизацию
):
    # Пользователь авторизован
```

### Rate Limiting

```python
# Настройки в config.py
MAX_REQUESTS_PER_HOUR = 1000
MAX_CLICKS_PER_10_SECONDS = 100
MAX_UPGRADES_PER_2_SECONDS = 1
```

### Валидация

- **Серверная:** Проверка баланса перед покупкой
- **Серверная:** Проверка формул на сервере
- **Pydantic:** Валидация типов и диапазонов

## 🔄 Обработка запросов

### Типичный поток

```
1. Client → HTTP Request → Router
2. Router → Валидация → Service
3. Service → Бизнес-логика → Database
4. Database → Result → Service
5. Service → Response → Router
6. Router → HTTP Response → Client
```

### Пример: Клик

```python
# 1. Router принимает запрос
@router.post("/click")
async def click(request: ClickRequest, ...):
    # 2. Вызывает сервис
    response = await GameService.process_clicks(...)
    return response

# 3. Сервис выполняет логику
class GameService:
    async def process_clicks(...):
        # 4. Расчёт и обновление БД
        game_state.coins += coins_gained
        await db.commit()
        return ClickResponse(...)
```

## 🧪 Тестирование

### Unit Testing (сервисы)

```python
async def test_calculate_upgrade_price():
    price = UpgradeService.calculate_upgrade_price("click_damage", 0)
    assert price == 100  # base price
```

### Integration Testing (API)

```python
async def test_click_endpoint(client, auth_headers):
    response = await client.post(
        "/api/game/click",
        json={"count": 1},
        headers=auth_headers
    )
    assert response.status_code == 200
```

## 📦 Развертывание

### Docker Multi-stage

```dockerfile
# Builder stage
FROM node:18 as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

### Docker Compose

```yaml
services:
  backend:
    build: ./backend
    depends_on:
      postgres:
        condition: service_healthy
  
  frontend:
    build: ./frontend
    depends_on:
      - backend
```

## 🎨 Frontend Паттерны

### Component Props vs State

```typescript
// Props - данные, передаваемые извне
interface ComponentProps {
  title: string;
  onClick: () => void;
}

// State - внутреннее состояние компонента
const [isActive, setIsActive] = useState(false);
```

### Custom Hooks для переиспользования

```typescript
// Переиспользуемый хук для API запросов
const useApi = <T>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  // ...
  return { data, loading, error };
};
```

### useEffect для side effects

```typescript
useEffect(() => {
  fetchGameState();
  
  // Cleanup
  return () => {
    clearInterval(interval);
  };
}, [dependencies]);
```

## 🚀 Performance Optimization

### Backend

1. **Async I/O** - FastAPI + SQLAlchemy async
2. **Индексы** - оптимизированные запросы к БД
3. **Connection Pooling** - reuse DB connections

### Frontend

1. **Code Splitting** - React.lazy для lazy loading
2. **Memoization** - React.memo, useMemo, useCallback
3. **Debouncing** - отложенные обновления UI

## 📊 Мониторинг

### Логирование

```python
# Логи всех действий
log = UserLog(
    user_id=user.id,
    action_type="click",
    action_details=f"Batch click: {count} clicks",
    ip_address=ip_address
)
db.add(log)
```

### Метрики

- API response times
- Error rates
- Active users
- Game metrics (coins, clicks, etc.)

---

Эта архитектура обеспечивает масштабируемость, тестируемость и поддерживаемость проекта.
