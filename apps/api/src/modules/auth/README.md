# Auth Module

Модуль аутентифікації на основі сесій (express-session + Redis).

## Архітектура

```
auth/
├── account/          # Реєстрація, профіль, зміна email/пароля
├── session/          # Логін, логаут, управління сесіями
├── verification/     # Верифікація email
├── password-recovery/ # Відновлення пароля
└── deactivate/       # Деактивація/реактивація акаунту
```

## Аутентифікація

Використовується `AuthGuard` (глобальний, підключений через `APP_GUARD`).

**Логіка guard:**

1. Якщо endpoint має `@Public()` — пропускає без перевірки
2. Читає `req.session.userId`
3. Завантажує користувача з БД і кладе в `req.user`
4. Перевіряє що акаунт не деактивований

**Декоратори:**

- `@Public()` — позначає endpoint як публічний
- `@User()` — отримує поточного користувача з `req.user`
- `@User('id')` — отримує конкретне поле користувача

---

## Endpoints

### Account — `/auth`

| Метод  | Маршрут          | Публічний | Опис                          |
| ------ | ---------------- | --------- | ----------------------------- |
| `POST` | `/auth/register` | ✅        | Реєстрація нового користувача |
| `GET`  | `/auth/profile`  | ❌        | Профіль поточного користувача |
| `PUT`  | `/auth/email`    | ❌        | Зміна email                   |
| `PUT`  | `/auth/password` | ❌        | Зміна пароля                  |

#### `POST /auth/register`

```json
// Body
{
  "name": "John Doe",       // 2-50 символів
  "email": "john@mail.com",
  "password": "secret123"   // 6-100 символів
}

// Response 201
{
  "message": "User created successfully",
  "user": { "id", "name", "email", "isEmailVerified", "createdAt" }
}
```

> Після реєстрації автоматично відправляється токен верифікації email.

#### `GET /auth/profile`

```json
// Response 200
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@mail.com",
  "avatar": null,
  "defaultCurrency": "UAH",
  "isEmailVerified": true,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

#### `PUT /auth/email`

```json
// Body
{ "email": "newemail@mail.com" }

// Response 200
{ "message": "Email changed successfully. Please verify your new email." }
```

#### `PUT /auth/password`

```json
// Body
{
  "oldPassword": "secret123",
  "newPassword": "newsecret456"  // 6-100 символів
}

// Response 200
{ "message": "Password changed successfully" }
```

---

### Session — `/auth/session`

| Метод    | Маршрут                     | Публічний | Опис                     |
| -------- | --------------------------- | --------- | ------------------------ |
| `POST`   | `/auth/session/login`       | ✅        | Вхід в систему           |
| `POST`   | `/auth/session/logout`      | ❌        | Вихід з системи          |
| `GET`    | `/auth/session/findByUser`  | ❌        | Всі сесії користувача    |
| `GET`    | `/auth/session/findCurrent` | ❌        | Поточна сесія            |
| `DELETE` | `/auth/session/clear`       | ✅        | Очистити cookie сесії    |
| `DELETE` | `/auth/session/:id`         | ❌        | Видалити конкретну сесію |

#### `POST /auth/session/login`

```json
// Body
{
  "email": "john@mail.com",
  "password": "secret123"
}

// Response 200 — встановлює session cookie
{
  "message": "Login successful",
  "user": { "id", "name", "email", "isEmailVerified" }
}
```

> Якщо email не верифікований — повертає `400` і повторно відправляє токен верифікації.

#### `POST /auth/session/logout`

```json
// Response 200 — знищує сесію в Redis і очищає cookie
{ "message": "Logout successful" }
```

#### `GET /auth/session/findByUser`

```json
// Response 200 — всі сесії крім поточної, відсортовані за датою
[
  {
    "id": "session-id",
    "userId": "uuid",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "metadata": { "location": {...}, "device": {...}, "ip": "..." }
  }
]
```

#### `DELETE /auth/session/clear`

Видаляє тільки cookie на клієнті (без знищення сесії в Redis). Корисно коли сесія вже протухла.

#### `DELETE /auth/session/:id`

Видаляє конкретну сесію іншого пристрою з Redis.

---

### Verification — `/auth`

| Метод  | Маршрут        | Публічний | Опис                         |
| ------ | -------------- | --------- | ---------------------------- |
| `POST` | `/auth/verify` | ✅        | Верифікація email за токеном |

#### `POST /auth/verify`

```json
// Body
{ "token": "uuid-v4-token" }

// Response 200 — верифікує email і автоматично логінить користувача
{
  "message": "Email verified successfully",
  "user": { "id", "name", "email", "isEmailVerified" }
}
```

> Токен одноразовий, має TTL 5 хвилин.

---

### Password Recovery — `/auth/password-recovery`

| Метод  | Маршрут                                | Публічний | Опис                     |
| ------ | -------------------------------------- | --------- | ------------------------ |
| `POST` | `/auth/password-recovery/reset`        | ✅        | Запит на скидання пароля |
| `POST` | `/auth/password-recovery/new-password` | ✅        | Встановити новий пароль  |

#### `POST /auth/password-recovery/reset`

```json
// Body
{ "email": "john@mail.com" }

// Response 200 — завжди однакова відповідь (безпека)
{
  "message": "If an account with this email exists, a password reset link has been sent"
}
```

#### `POST /auth/password-recovery/new-password`

```json
// Body
{
  "password": "newsecret456",  // 6-100 символів
  "token": "uuid-v4-token"
}

// Response 200
{ "message": "Password reset successfully" }
```

---

### Deactivate — `/auth/deactivate`

| Метод  | Маршрут                       | Публічний | Опис                |
| ------ | ----------------------------- | --------- | ------------------- |
| `POST` | `/auth/deactivate`            | ❌        | Деактивація акаунту |
| `POST` | `/auth/deactivate/reactivate` | ✅        | Реактивація акаунту |

#### `POST /auth/deactivate`

Двохетапний процес:

**Крок 1** — без `pin`, відправляє код на email:

```json
// Body
{
  "email": "john@mail.com",
  "password": "secret123"
}

// Response 200
{ "message": "Check your email for deactivation code" }
```

**Крок 2** — з `pin`, деактивує акаунт:

```json
// Body
{
  "email": "john@mail.com",
  "password": "secret123",
  "pin": "123456"
}

// Response 200 — знищує всі сесії і виходить
```

#### `POST /auth/deactivate/reactivate`

```json
// Body
{
  "email": "john@mail.com",
  "token": "uuid-v4-token"
}

// Response 200
{ "message": "Account reactivated successfully" }
```

---

## Типові сценарії

### Реєстрація та верифікація

```
POST /auth/register → отримати токен на email
POST /auth/verify   → верифікувати email (автологін)
```

### Логін

```
POST /auth/session/login → отримати session cookie
GET  /auth/profile       → отримати дані профілю
```

### Відновлення пароля

```
POST /auth/password-recovery/reset        → отримати токен на email
POST /auth/password-recovery/new-password → встановити новий пароль
POST /auth/session/login                  → увійти з новим паролем
```

### Деактивація

```
POST /auth/deactivate (без pin) → отримати код на email
POST /auth/deactivate (з pin)   → деактивувати акаунт
POST /auth/deactivate/reactivate → реактивувати за токеном з email
```

---

## Коди відповідей

| Код   | Опис                                                                         |
| ----- | ---------------------------------------------------------------------------- |
| `200` | Успішна операція (login, logout, verify тощо)                                |
| `201` | Ресурс створено (register)                                                   |
| `400` | Невалідні дані або бізнес-логіка (email не верифікований, невірний пін тощо) |
| `401` | Не аутентифікований або невірні credentials                                  |
| `404` | Ресурс не знайдено                                                           |
| `409` | Конфлікт (email вже існує)                                                   |
