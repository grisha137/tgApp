# 📚 API Документация

Полная документация API для Telegram Mini App - Idle Clicker Game.

## 🔐 Аутентификация

API использует JWT токены для авторизации. Получите токен через endpoint `/api/auth/telegram`.

### Headers
```
Authorization: Bearer <access_token>
```

### Ошибки аутентификации
- `401 Unauthorized` - Невалидный токен или истёк срок действия

---

## 📤 Auth Endpoints

### POST /api/auth/telegram
Аутентификация через Telegram initData.

**Request Body:**
```json
{
  "initData": "auth_date=1700000000&hash=abc123&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%7D"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "telegram_id": 123456789,
    "username": "testuser",
    "first_name": "Test",
    "last_name": "User",
    "language_code": "ru",
    "coins": 0,
    "total_clicks": 0,
    "total_coins_earned": 0,
    "created_at": "2024-01-20T10:00:00",
    "last_login": "2024-01-20T10:00:00"
  }
}
```

**Error (401):**
```json
{
  "detail": "Неверная подпись initData"
}
```

### GET /api/auth/me
Получить информацию о текущем пользователе.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "id": 1,
  "telegram_id": 123456789,
  "username": "testuser",
  "first_name": "Test",
  "last_name": "User",
  "language_code": "ru",
  "coins": 1500,
  "total_clicks": 250,
  "total_coins_earned": 2000,
  "created_at": "2024-01-20T10:00:00",
  "last_login": "2024-01-20T10:00:00"
}
```

---

## 🎮 Game Endpoints

### GET /api/game/state
Получить полное состояние игры с расчётом оффлайн-дохода.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "telegram_id": 123456789,
    "username": "testuser",
    "first_name": "Test",
    "coins": 1500,
    "total_clicks": 250,
    "total_coins_earned": 2000,
    "created_at": "2024-01-20T10:00:00",
    "last_login": "2024-01-20T10:00:00"
  },
  "game_state": {
    "coins": 1500,
    "passive_income_per_sec": 0.5,
    "click_damage_level": 3,
    "passive_income_level": 2,
    "total_play_time_seconds": 3600,
    "total_clicks": 250,
    "last_offline_calculation": "2024-01-20T11:00:00"
  },
  "upgrades": [
    {
      "id": 1,
      "upgrade_type": "click_damage",
      "level": 3,
      "purchase_count": 3,
      "total_spent": 345,
      "current_price": 397,
      "current_value": 2.25,
      "name": "Сила клика",
      "description": "Увеличивает количество монет за клик",
      "icon": "⚡",
      "max_level": 50
    },
    {
      "id": 2,
      "upgrade_type": "passive_income",
      "level": 2,
      "purchase_count": 2,
      "total_spent": 2300,
      "current_price": 1320,
      "current_value": 0.144,
      "name": "Пассивный доход",
      "description": "Увеличивает количество монет в секунду",
      "icon": "💰",
      "max_level": 50
    }
  ],
  "daily_reward": {
    "id": 1,
    "last_claim_date": "2024-01-19T10:00:00",
    "current_streak": 5,
    "max_streak": 10,
    "total_rewards_claimed": 30,
    "next_claim_available_at": "2024-01-20T10:00:00",
    "available": true,
    "next_claim_in_seconds": 0,
    "reward_amount": 1000
  },
  "last_offline_income": 360
}
```

### POST /api/game/click
Обработать клики.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "count": 1
}
```

**Ограничения:**
- `count`: 1-10 кликов за запрос
- Максимум 100 кликов за 10 секунд (rate limiting)

**Response (200 OK):**
```json
{
  "coins": 1505,
  "coins_gained": 5,
  "passive_income": 0.5,
  "click_damage": 5.0,
  "total_clicks": 251
}
```

---

## ⚡ Upgrades Endpoints

### POST /api/upgrades/purchase
Купить апгрейд.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "upgrade_type": "click_damage"
}
```

**Ограничения:**
- `upgrade_type`: `"click_damage"` или `"passive_income"`
- Максимум 1 покупка в 2 секунды (rate limiting)
- Максимальный уровень: 50

**Success Response (200 OK):**
```json
{
  "success": true,
  "new_coins": 1103,
  "upgrade": {
    "id": 1,
    "upgrade_type": "click_damage",
    "level": 4,
    "purchase_count": 4,
    "total_spent": 742,
    "current_price": 456,
    "current_value": 3.375,
    "name": "Сила клика",
    "description": "Увеличивает количество монет за клик",
    "icon": "⚡",
    "max_level": 50
  },
  "message": "Апгрейд 'Сила клика' улучшен до уровня 4!"
}
```

**Error Response (200 OK):**
```json
{
  "success": false,
  "new_coins": 1505,
  "upgrade": {
    "id": 1,
    "upgrade_type": "click_damage",
    "level": 3,
    "purchase_count": 3,
    "total_spent": 345,
    "current_price": 397,
    "current_value": 2.25,
    "name": "Сила клика",
    "description": "Увеличивает количество монет за клик",
    "icon": "⚡",
    "max_level": 50
  },
  "message": "Недостаточно монет. Требуется: 397"
}
```

---

## 🎁 Rewards Endpoints

### POST /api/rewards/daily
Получить ежедневную награду.

**Headers:** `Authorization: Bearer <token>`

**Success Response (200 OK):**
```json
{
  "coins_earned": 1000,
  "streak": 6,
  "next_claim_at": "2024-01-21T10:00:00",
  "max_streak": 10,
  "message": "Получено 1000 монет! Серия: 6 дней"
}
```

**Error Response (200 OK):**
```json
{
  "coins_earned": 0,
  "streak": 5,
  "next_claim_at": "2024-01-20T12:00:00",
  "max_streak": 10,
  "message": "Награда будет доступна через 1ч 30мин"
}
```

---

## 📊 Users Endpoints

### GET /api/users/stats
Получить статистику пользователя.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "rank": 42,
  "total_coins": 2000,
  "total_clicks": 250,
  "play_time_hours": 1.0,
  "achievements_count": 3,
  "click_damage_level": 3,
  "passive_income_level": 2,
  "passive_income_per_sec": 0.5,
  "current_streak": 5,
  "max_streak": 10,
  "total_upgrades_purchased": 5
}
```

---

## 🧪 Testing

### Пример cURL запросов

**Авторизация:**
```bash
curl -X POST http://localhost:8000/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"initData": "auth_date=1700000000&hash=test&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%7D"}'
```

**Получить состояние игры:**
```bash
curl http://localhost:8000/api/game/state \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Клик:**
```bash
curl -X POST http://localhost:8000/api/game/click \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"count": 1}'
```

**Купить апгрейд:**
```bash
curl -X POST http://localhost:8000/api/upgrades/purchase \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"upgrade_type": "click_damage"}'
```

**Получить ежедневную награду:**
```bash
curl -X POST http://localhost:8000/api/rewards/daily \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📋 HTTP Status Codes

| Code | Description |
|------|-------------|
| 200  | OK - Запрос выполнен успешно |
| 401  | Unauthorized - Проблемы с аутентификацией |
| 422  | Unprocessable Entity - Неверные данные запроса |
| 500  | Internal Server Error - Ошибка сервера |

---

## 🔒 Rate Limiting

| Endpoint | Limit |
|----------|-------|
| Все запросы | 1000/час на пользователя |
| POST /api/game/click | 100 кликов за 10 секунд |
| POST /api/upgrades/purchase | 1 покупка за 2 секунды |

При превышении лимита вернётся код 429.

---

## 📖 Swagger UI

Интерактивная документация доступна по адресу:
```
http://localhost:8000/docs
```

ReDoc документация:
```
http://localhost:8000/redoc
```

---

Для более подробной информации смотрите исходный код в `backend/routers/`.
