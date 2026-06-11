# 球馆预约平台 API 接口文档

基础路径：`/api`（前端 nginx 反代到后端 `http://backend:3000/`）

响应格式（由 TransformInterceptor 统一包装）：
```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

错误响应（由 HttpExceptionFilter 统一包装）：
```json
{
  "code": 400,
  "message": "错误描述",
  "timestamp": "2026-06-10T12:00:00.000Z"
}
```

---

## 1. 认证模块 `/auth`

### POST /auth/register
注册新用户。

**请求体：**
```json
{
  "username": "string (必填, 唯一)",
  "password": "string (必填, 最少6位)",
  "phone": "string (必填, 唯一)",
  "nickname": "string (必填)",
  "skill_level": "beginner | intermediate | advanced (必填)"
}
```

**成功响应 `data`：**
```json
{
  "id": 1,
  "username": "zhangsan",
  "phone": "13800138000",
  "nickname": "张三",
  "skill_level": "intermediate",
  "credit_score": 100,
  "banned_until": null,
  "created_at": "2026-06-10T12:00:00.000Z",
  "updated_at": "2026-06-10T12:00:00.000Z"
}
```

**错误码：** 409 用户名已存在

---

### POST /auth/login
用户登录。

**请求体：**
```json
{
  "username": "string",
  "password": "string"
}
```

**成功响应 `data`：**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "zhangsan",
    "nickname": "张三",
    "skill_level": "intermediate",
    "credit_score": 100
  }
}
```

**错误码：** 401 用户名或密码错误

---

## 2. 球馆模块 `/venues`

### GET /venues
获取所有球馆列表。

**成功响应 `data`：**
```json
[
  {
    "id": 1,
    "name": "朝阳社区乒乓球馆",
    "address": "朝阳区建国路88号",
    "phone": "010-65001001",
    "open_time": "08:00:00",
    "close_time": "22:00:00",
    "created_at": "...",
    "updated_at": "..."
  }
]
```

---

### GET /venues/:venueId
获取单个球馆详情。

**路径参数：** `venueId` (number)

**成功响应 `data`：** 同上单个球馆对象

**错误码：** 404 球馆不存在

---

### GET /venues/:venueId/tables
获取球馆下的球台列表。

**路径参数：** `venueId` (number)

**成功响应 `data`：**
```json
[
  { "id": 1, "venue_id": 1, "name": "1号台", "created_at": "...", "updated_at": "..." },
  { "id": 2, "venue_id": 1, "name": "2号台", "created_at": "...", "updated_at": "..." }
]
```

---

### GET /venues/:venueId/slots?date=YYYY-MM-DD
获取球馆某日的球台时段网格（核心接口）。

**路径参数：** `venueId` (number)
**查询参数：** `date` (YYYY-MM-DD 格式)

**成功响应 `data`：**
```json
[
  {
    "table_id": 1,
    "table_name": "1号台",
    "slots": [
      { "hour": 8, "status": "available" },
      { "hour": 9, "status": "occupied" },
      { "hour": 10, "status": "available" }
    ]
  },
  {
    "table_id": 2,
    "table_name": "2号台",
    "slots": [
      { "hour": 8, "status": "available" },
      { "hour": 9, "status": "available" },
      { "hour": 10, "status": "occupied" }
    ]
  }
]
```

> `status` 取值：`available`（空闲，可预约）、`occupied`（已占用，含 pending_payment 和 paid 状态）

---

## 3. 预约模块 `/bookings`

> 以下接口均需 JWT 认证（Header: `Authorization: Bearer <token>`）

### POST /bookings
创建预约（锁定球台时段）。

**需要守卫：** JwtAuthGuard + CreditGuard（信用分≥60且未被封禁）

**请求体：**
```json
{
  "table_id": 1,
  "venue_id": 1,
  "date": "2026-06-10",
  "hour_slot": 14
}
```

> `hour_slot` 表示整点时段编号，如 14 表示 14:00-15:00

**成功响应 `data`：**
```json
{
  "id": 1,
  "user_id": 1,
  "table_id": 1,
  "venue_id": 1,
  "date": "2026-06-10",
  "hour_slot": 14,
  "status": "pending_payment",
  "booking_type": "solo",
  "match_request_id": null,
  "paid_at": null,
  "cancelled_at": null,
  "created_at": "2026-06-10T12:00:00.000Z",
  "updated_at": "2026-06-10T12:00:00.000Z"
}
```

**错误码：**
- 400 信用分不足，无法预约
- 400 账号已被封禁，无法预约
- 409 同一日期同一时段已有其他预约
- 409 该球台时段已被占用
- 409 该球台时段正在被其他用户预约中

---

### POST /bookings/:id/pay
支付预约。

**路径参数：** `id` (预约ID)

**成功响应 `data`：** 同上，`status` 变为 `paid`，`paid_at` 有值

**错误码：**
- 400 预约状态不允许支付
- 409 该球台时段已被他人支付，预约已失效（并发场景，后者收到此提示）

---

### POST /bookings/:id/cancel
取消预约。

**路径参数：** `id` (预约ID)

**取消规则：**
- 距开始时间 ≥ 2小时：免费取消
- 距开始时间 < 2小时（且状态为 paid）：扣除5分信用分，若扣后<60则封禁7天

**成功响应 `data`：** `status` 变为 `cancelled`，`cancelled_at` 有值

**错误码：** 400 预约状态不允许取消

---

### GET /bookings/mine
获取当前用户的预约列表。

**成功响应 `data`：** Booking 对象数组，按创建时间倒序

---

## 4. 找球友模块 `/match`

> 以下接口均需 JWT 认证

### POST /match/requests
发布找球友请求。

**需要守卫：** JwtAuthGuard + CreditGuard

**请求体：**
```json
{
  "venue_id": 1,
  "date": "2026-06-10",
  "hour_slot": 14
}
```

> `skill_level` 自动取当前用户的注册技术水平

**成功响应 `data`：**
```json
{
  "id": 1,
  "user_id": 1,
  "venue_id": 1,
  "skill_level": "intermediate",
  "preferred_date": "2026-06-10",
  "hour_slot": 14,
  "status": "open",
  "matched_user_id": null,
  "matched_booking_id": null,
  "created_at": "2026-06-10T12:00:00.000Z",
  "updated_at": "2026-06-10T12:00:00.000Z"
}
```

---

### GET /match/requests/:id/recommendations
获取推荐对手列表。

**路径参数：** `id` (找球友请求ID)

**匹配逻辑说明：**
1. 从 `match_requests` 表中查找同一球馆、同一日期、同一时段、状态为 `open` 且非本人的请求
2. 按 `skill_level` 差值排序：同级(差值0)优先 → 相邻级(差值1)次之 → 跨级(差值2)最后
3. 等级映射：`beginner=0, intermediate=1, advanced=2`

**成功响应 `data`：**
```json
[
  {
    "match_request_id": 2,
    "user_id": 5,
    "nickname": "李四",
    "skill_level": "intermediate"
  },
  {
    "match_request_id": 3,
    "user_id": 8,
    "nickname": "王五",
    "skill_level": "beginner"
  }
]
```

---

### POST /match/requests/:id/confirm
确认匹配（选择对手）。

**需要守卫：** JwtAuthGuard + CreditGuard

**路径参数：** `id` (对方找球友请求ID)

**业务逻辑：**
1. 验证对方请求状态为 `open`
2. 查找该球馆该时段的空闲球台
3. 自动创建两张 `paid` 状态的 booking（双方各一张，booking_type=match）
4. 更新对方 match_request 状态为 `matched`

**成功响应 `data`：**
```json
{
  "match_request": { "id": 2, "status": "matched", "matched_user_id": 1, "matched_booking_id": 10 },
  "bookings": [
    { "id": 10, "user_id": 5, "status": "paid", "booking_type": "match" },
    { "id": 11, "user_id": 1, "status": "paid", "booking_type": "match" }
  ]
}
```

**错误码：**
- 404 找球友请求不存在或已匹配
- 400 不能匹配自己的请求
- 400 该球馆没有可用球台
- 400 该时段没有可用球台

---

### GET /match/requests/mine
获取当前用户的找球友请求列表。

**成功响应 `data`：** MatchRequest 对象数组，按创建时间倒序

---

## 5. 守卫说明

### JwtAuthGuard
- 从 `Authorization: Bearer <token>` 提取 JWT
- 验证 token 有效性（7天有效期）
- 将 `{ id, username, credit_score, banned_until }` 注入 `request.user`

### CreditGuard
- 从 `request.user` 获取用户 ID
- 从数据库实时查询用户状态
- 若 `credit_score < 60`：返回 403 "信用分不足，无法操作"
- 若 `banned_until > now`：返回 403 "账号已被封禁至 YYYY-MM-DD"

---

## 6. 定时任务

### 过期预约自动释放
- **执行频率：** 每分钟一次（@Cron(EVERY_MINUTE)）
- **逻辑：** 查找 `status=pending_payment` 且 `created_at ≤ 15分钟前` 的预约，自动设为 `expired`

---

## 7. 并发控制策略

| 场景 | 策略 |
|------|------|
| 同一球台同时段被多人预约 | 创建预约时使用 QueryRunner 事务，先查再插，配合数据库唯一索引 `(table_id, date, hour_slot, status)` 防止重复 |
| 同一用户同时段预约不同球台 | 创建前查询 `user_id + date + hour_slot + status=paid`，防止一人同时段重复预约 |
| 支付时被抢先 | 支付前再次检查是否有 paid 状态的冲突记录，若有则将当前预约标记为 expired 并返回 409 |
