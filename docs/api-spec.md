# 小圈子菜谱小程序 — 后端接口规格

**版本**：1.0  
**日期**：2026-06-04  
**前端技术栈**：uni-app + Vue 3 + Pinia  
**目标平台**：微信小程序  

本文档根据当前前端源码（`stores/*`、`pages/*`、`data/recipes.ts`）整理，供后端实现与联调使用。

---

## 一、现状说明

| 项目 | 现状 |
|------|------|
| 网络请求 | **无** `uni.request` / `fetch`，全部为 Mock + Pinia 内存 |
| 登录 | 固定 Mock 用户 `user-001`，未接微信登录 |
| 图片 | `uni.chooseImage` 仅本地临时路径，未上传 OSS |
| 草稿 | `uploadStore` 已实现 `uni.setStorageSync('recipe_drafts')`，**上传页未接入** |
| 持久化 | 刷新后用户发布、收藏、评价等数据丢失 |

设计文档（`docs/superpowers/specs/2026-06-04-recipe-platform-design.md`）原定为纯前端原型；本文档描述**产品化所需**的全部接口。

---

## 二、通用约定

### 2.1 Base URL

```
https://your-api.example.com/api/v1
```

### 2.2 认证

除标注「无需登录」的接口外，请求头需携带：

```
Authorization: Bearer <access_token>
```

登录接口用微信 `code` 换取 `token` 与用户资料。

### 2.3 统一响应格式

**成功：**

```json
{
  "code": 0,
  "message": "ok",
  "data": { }
}
```

**失败：**

```json
{
  "code": 40001,
  "message": "参数错误",
  "data": null
}
```

建议 HTTP 状态码与业务 `code` 分离：4xx/5xx 表示传输层错误，业务错误仍返回 200 + 非 0 `code`（或按团队规范统一）。

### 2.4 分页

列表类接口统一 Query：

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `page` | number | 1 | 页码，从 1 开始 |
| `pageSize` | number | 10 | 每页条数，建议最大 50 |

**分页响应：**

```json
{
  "items": [],
  "total": 100,
  "page": 1,
  "pageSize": 10,
  "hasMore": true
}
```

### 2.5 时间格式

统一 ISO 8601 字符串，例如：`2026-06-04T08:00:00.000Z`。

---

## 三、数据模型

与 `data/recipes.ts` 保持一致。

### 3.1 User

```typescript
interface User {
  id: string
  name: string
  avatar: string      // 完整 URL
  bio: string
}
```

### 3.2 Recipe（详情）

```typescript
interface Ingredient {
  name: string
  amount: string    // 可为空，前端按份数缩放时会 parseFloat
  unit: string
}

interface Step {
  id: number        // 前端发布时用时间戳；后端可自增或 UUID
  desc: string
  image?: string    // 步骤图 URL，可选
}

interface Recipe {
  id: string
  title: string
  coverImage: string
  author: User
  rating: number           // 0–5，保留 1 位小数
  ratingCount: number
  createdAt: string
  duration: number         // 分钟
  difficulty: '简单' | '中等' | '困难'
  category: 'breakfast' | 'lunch' | 'dinner' | 'dessert'
  cuisine: string          // 如：川菜、粤菜、其他
  tags: string[]           // 如：减脂、素食、精选、快手菜
  servings: number         // 基准份数，默认 2
  ingredients: Ingredient[]
  steps: Step[]
  tips: string             // 厨神贴士，可空
  crowd: string            // 适合人群，可空
  reviews: Review[]
  suggestions: Suggestion[]
}
```

### 3.3 RecipeListItem（列表精简）

列表页、卡片不需要完整 `reviews`/`suggestions`：

```typescript
interface RecipeListItem {
  id: string
  title: string
  coverImage: string
  author: Pick<User, 'id' | 'name' | 'avatar'>
  rating: number
  ratingCount: number
  createdAt: string
  duration: number
  difficulty: string
  category: string
  cuisine: string
  tags: string[]
  servings: number
  isFavorite?: boolean   // 登录用户时返回
}
```

### 3.4 Review

```typescript
interface Review {
  id: string
  userId: string
  userName: string
  userAvatar: string
  rating: number    // 1–5 整数
  date: string
}
```

**业务规则**：同一用户对同一菜谱仅一条评分（upsert）；删除后重算 `rating`、`ratingCount`。

### 3.5 Suggestion

```typescript
interface Suggestion {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string   // 最长 500 字
  date: string
}
```

**业务规则**：同一用户对同一菜谱仅一条建议（upsert）。

### 3.6 Draft（草稿）

与 `stores/upload.ts` 对齐，供后续接入上传页：

```typescript
interface Draft {
  id: string
  title: string
  step: number              // 当前表单步骤 0–3
  coverImage: string
  duration: number
  difficulty: string
  servings: number
  ingredients: Ingredient[]
  steps: Step[]
  category: string
  cuisine: string
  tags: string[]
  crowd: string
  tips: string
  savedAt: string
}
```

### 3.7 枚举（可前端写死，也可接口下发）

| 类型 | 值 |
|------|-----|
| category | `breakfast` / `lunch` / `dinner` / `dessert` |
| difficulty | `简单` / `中等` / `困难` |
| cuisine（前端常量） | `川菜` / `粤菜` / `鲁菜` / `苏菜` / `其他` |
| tags（前端常量） | `减脂` / `素食` / `精选` / `快手菜` |

---

## 四、接口清单总览

| 模块 | 方法 | 路径 | 登录 |
|------|------|------|------|
| 认证 | POST | `/auth/wechat-login` | 否 |
| 用户 | GET | `/users/me` | 是 |
| 用户 | PATCH | `/users/me` | 是 |
| 用户 | POST | `/users/me/avatar` | 是 |
| 菜谱 | GET | `/recipes` | 可选 |
| 菜谱 | GET | `/recipes/ranked` | 否 |
| 菜谱 | GET | `/recipes/:id` | 可选 |
| 菜谱 | POST | `/recipes` | 是 |
| 菜谱 | PATCH | `/recipes/:id` | 是（作者） |
| 菜谱 | DELETE | `/recipes/:id` | 是（作者） |
| 我的菜谱 | GET | `/users/me/recipes` | 是 |
| 评分 | POST | `/recipes/:id/reviews` | 是 |
| 评分 | DELETE | `/recipes/:id/reviews/me` | 是 |
| 我的评分 | GET | `/users/me/reviews` | 是 |
| 建议 | POST | `/recipes/:id/suggestions` | 是 |
| 建议 | DELETE | `/recipes/:id/suggestions/me` | 是 |
| 收藏 | GET | `/users/me/favorites` | 是 |
| 收藏 | POST | `/recipes/:id/favorite` | 是 |
| 收藏 | DELETE | `/recipes/:id/favorite` | 是 |
| 草稿 | GET | `/drafts` | 是 |
| 草稿 | PUT | `/drafts/:id` | 是 |
| 草稿 | DELETE | `/drafts/:id` | 是 |
| 草稿 | POST | `/drafts/:id/publish` | 是 |
| 上传 | POST | `/upload/image` | 是 |
| 元数据 | GET | `/meta/filters` | 否 |

---

## 五、接口详细说明

### 5.1 认证

#### 前端登录流程（已实现，`LoginGate` + `stores/auth.ts`）

**一键登录（未登录时）** — 必须调后端完成真实登录：

| 步骤 | 前端实现 | 说明 |
|------|----------|------|
| 1 | 点击 **「微信一键登录」** | `uni.login()` 取 `code` |
| 2 | `POST /auth/wechat-login` | 提交 `code` + `nickName: "微信用户"` + `avatarUrl: ""` |
| 3 | 本地 `user_session_v5` | 保存 `token`、`user`、`wechatProfile`（登录时快照） |

**勿使用** `getUserProfile` 做一键登录（真机仅返回「微信用户」+ 空头像）。

**资料完善（已登录，`pages/settings`）** — 使用微信头像昵称填写能力：

| 步骤 | 前端实现 | 说明 |
|------|----------|------|
| 1 | `open-type="chooseAvatar"` | 选头像，得到 `wxfile://` |
| 2 | `input type="nickname"` | 可选用微信昵称 |
| 3 | 保存 | `PATCH /users/me`；临时头像先 `POST /upload/image` |

**未配置 `API_BASE_URL` 时**：仅微信开发者工具可走本地模拟登录；真机须配置后端。

**进入小程序**：`init()` 读本地 session；无 session 则全屏 `LoginGate`；已登录不弹窗。

---

#### POST `/auth/wechat-login`

微信小程序登录（**必须实现**，P0）。

**请求：**

```json
{
  "code": "uni.login 返回，5 分钟有效，只能使用一次",
  "nickName": "昵称；一键登录传「微信用户」，设置页完善时传用户填写值",
  "avatarUrl": "https CDN 地址；一键登录可传空字符串；wxfile 临时路径建议传空，改头像走上传接口"
}
```

**后端处理建议：**

1. 用 `code` 调微信 `auth.code2Session` 换取 `openid`（及 `session_key`，如需）。
2. 按 `openid` 查找或创建用户；`nickName` 写入用户表 `name`。
3. 若 `avatarUrl` 非空且为 `https://`，写入 `avatar`；若为空，保留原头像或默认图（前端随后可能调上传接口）。
4. 签发 `token`（JWT 或自研 session），返回用户信息。

**响应 `data`：**

```json
{
  "token": "jwt 或 session token",
  "expiresIn": 7200,
  "user": {
    "id": "u_abc123",
    "name": "用户填写的昵称",
    "avatar": "https://cdn.example.com/avatar/xxx.jpg",
    "bio": ""
  }
}
```

**错误码建议：**

| code | 说明 |
|------|------|
| 40001 | `code` 无效或已过期 |
| 40002 | `nickName` 为空或超长（建议 ≤32） |
| 50001 | 微信 code2Session 失败 |

**与上传接口配合（推荐）：**

```
用户选头像(wxfile) → login(code, nickName, avatarUrl:"")
  → 返回 token
  → POST /upload/image (Bearer token, file)
  → 返回 { url }
  → 可选：PATCH /users/me { avatar: url }
```

前端在 `hasApiServer()` 为 true 时已按此顺序自动执行上传（见 `stores/auth.ts`）。

---

#### 登录相关本地存储结构（前端，非接口）

键名：`user_session_v4`（`config/index.ts`）

```json
{
  "token": "xxx",
  "user": { "id": "", "name": "", "avatar": "", "bio": "" },
  "wechatProfile": { "name": "登录时昵称", "avatar": "登录时头像 URL" }
}
```

`wechatProfile` 供设置页「恢复微信头像与昵称」使用（仅恢复 name/avatar，不改 bio）。

---

### 5.2 用户

#### GET `/users/me`

个人中心、设置页拉取当前用户与统计。

**响应 `data`：**

```json
{
  "id": "user-001",
  "name": "美食爱好者",
  "avatar": "https://...",
  "bio": "热爱分享美食",
  "stats": {
    "uploads": 3,
    "reviews": 5,
    "suggestions": 2,
    "favorites": 8
  }
}
```

对应页面：`pages/profile/index.vue`。

---

#### PATCH `/users/me`

更新昵称、简介。

**请求：**

```json
{
  "name": "新昵称",
  "bio": "一句话介绍"
}
```

**响应 `data`：** 完整 `User` 对象。

对应页面：`pages/settings/index.vue`（`updateProfile`）。

---

#### POST `/users/me/avatar`

上传头像（`multipart/form-data`，字段名 `file`）。

**响应 `data`：**

```json
{
  "avatarUrl": "https://cdn.../avatar/xxx.jpg"
}
```

前端选图后先调此接口，再 `PATCH /users/me` 或在本接口内一并更新。

---

### 5.3 菜谱

#### GET `/recipes`

首页瀑布流、发现页列表、搜索。

**Query：**

| 参数 | 说明 |
|------|------|
| `q` | 关键词；匹配标题、食材名、标签（与前端 `filteredRecipes` 一致） |
| `category` | `breakfast`/`lunch`/`dinner`/`dessert`；不传或 `all` 表示全部 |
| `cuisine` | 菜系，如 `川菜` |
| `tag` | 单个标签，如 `减脂` |
| `sort` | `rating`（评分降序）/ `createdAt`（最新） |
| `page` / `pageSize` | 分页 |

**响应 `data`：** 分页结构，`items` 为 `RecipeListItem[]`。

**前端映射：**

- `pages/home/index.vue`：`sort=rating` → 排行榜；`sort=createdAt` → 最新；分类 Tab
- `pages/recipes/index.vue`：搜索 + 菜系 + 标签筛选
- 路由 `?query=西红柿` → 设置 `q=西红柿`

---

#### GET `/recipes/ranked`

首页「评分榜」Top N（可与 `/recipes?sort=rating` 合并，单独接口便于缓存）。

**Query：** `limit`（默认 10）

**响应 `data`：** `RecipeListItem[]`

对应：`recipeStore.topRanked`（`ratingCount > 0` 才上榜）。

---

#### GET `/recipes/:id`

菜谱详情。

**响应 `data`：** 完整 `Recipe`（含 `reviews`、`suggestions`）。

**可选字段（登录时）：**

```json
{
  "...": "...",
  "isFavorite": true,
  "myReview": { "id": "...", "rating": 5 },
  "mySuggestion": { "id": "...", "content": "..." }
}
```

便于详情页展示「已收藏」「我的评分/建议」及删除按钮。

对应：`pages/recipe-detail/index.vue`。

---

#### POST `/recipes`

发布菜谱。

**请求：**

```json
{
  "title": "红烧肉",
  "coverImage": "https://cdn.../cover.jpg",
  "duration": 60,
  "difficulty": "中等",
  "category": "lunch",
  "cuisine": "其他",
  "tags": ["精选"],
  "servings": 2,
  "ingredients": [
    { "name": "五花肉", "amount": "500", "unit": "g" }
  ],
  "steps": [
    { "id": 1717488000000, "desc": "焯水...", "image": "https://..." }
  ],
  "tips": "小火慢炖",
  "crowd": "老少皆宜"
}
```

**校验（与前端 `canSubmit` 一致）：**

- `title` 必填
- `ingredients` 至少 1 项 `name` 非空
- `steps` 至少 1 项 `desc` 非空

**响应 `data`：** 创建后的完整 `Recipe`（`author` 为当前用户，`rating=0`，`reviews=[]`）。

对应：`pages/upload/index.vue` → `recipeStore.addRecipe`。

**说明**：前端 Step 3 UI 目前仅分类+贴士；`cuisine`/`tags`/`servings` 有字段但部分用默认值，后端仍应接收完整 body。

---

#### PATCH `/recipes/:id`

更新菜谱（部分字段）。

**权限**：仅作者。

**请求：** `Partial<Recipe>` 创建字段（不含 `reviews`/`suggestions`）。

**说明**：Store 已有 `updateRecipe`，UI 未做编辑页，接口建议预留。

---

#### DELETE `/recipes/:id`

删除菜谱。

**权限**：作者（或管理员）。

**说明**：Store 已有 `deleteRecipe`，UI 未接入。

---

#### GET `/users/me/recipes`

「我的上传」已发布列表。

**Query：** `page`, `pageSize`, 可选 `status`（`published` / `draft` / `pending`，若未来做审核）

**响应 `data`：** 分页 `RecipeListItem[]`。

对应：`pages/my-uploads/index.vue` Tab「已发布」。

---

### 5.4 评分（Reviews）

#### POST `/recipes/:id/reviews`

提交或更新评分（幂等 upsert）。

**请求：**

```json
{
  "rating": 5
}
```

**校验：** `rating` 为 1–5 整数。

**响应 `data`：**

```json
{
  "review": { "id": "...", "userId": "...", "rating": 5, "date": "..." },
  "recipeRating": 4.8,
  "ratingCount": 12
}
```

对应：`RatingModal` → `rateRecipe` + `userStore.addReview`。

---

#### DELETE `/recipes/:id/reviews/me`

删除当前用户对该菜谱的评分。

**响应 `data`：**

```json
{
  "recipeRating": 4.5,
  "ratingCount": 11
}
```

对应：详情页 `deleteMyReview`。

---

#### GET `/users/me/reviews`

「我的评价」列表。

**响应 `data`：**

```json
{
  "items": [
    {
      "recipeId": "1",
      "rating": 5,
      "date": "2026-06-01T00:00:00.000Z",
      "recipe": { /* RecipeListItem */ }
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 10,
  "hasMore": false
}
```

对应：`pages/my-uploads/index.vue` Tab「评价」。

---

### 5.5 建议（Suggestions）

#### POST `/recipes/:id/suggestions`

提交或更新建议（幂等 upsert）。

**请求：**

```json
{
  "content": "可以多放点姜"
}
```

**校验：** 非空，`content.length <= 500`。

**响应 `data`：** `Suggestion` 对象。

对应：`SuggestionModal` → `suggestRecipe` + `userStore.addSuggestion`。

---

#### DELETE `/recipes/:id/suggestions/me`

删除当前用户建议。

对应：详情页 `deleteMySuggestion`。

---

### 5.6 收藏

#### GET `/users/me/favorites`

收藏列表。

**响应 `data`：** 分页 `RecipeListItem[]`。

对应：`pages/my-uploads/index.vue` Tab「收藏」；`?tab=favorites` 深链。

---

#### POST `/recipes/:id/favorite`

添加收藏。

**响应 `data`：**

```json
{ "favorited": true }
```

---

#### DELETE `/recipes/:id/favorite`

取消收藏。

**响应 `data`：**

```json
{ "favorited": false }
```

对应：详情页 `toggleFavorite`、列表「取消」按钮。

---

### 5.7 草稿

#### GET `/drafts`

当前用户全部草稿。

**响应 `data`：** `Draft[]`。

---

#### PUT `/drafts/:id`

保存草稿（新建时客户端生成 `id`，或 `POST /drafts` 由服务端生成）。

**请求：** 完整 `Draft`（`savedAt` 可由服务端覆盖）。

**响应 `data`：** `Draft`。

**说明**：前端 `uploadStore.saveDraft` 已按此结构本地存储，联调时需上传页接入 Store。

---

#### DELETE `/drafts/:id`

删除草稿。

---

#### POST `/drafts/:id/publish`

草稿发布为正式菜谱。

**响应 `data`：** 创建后的 `Recipe`；成功后删除或归档该草稿。

---

### 5.8 媒体上传

#### POST `/upload/image`

通用图片上传（**登录后头像**、菜谱封面、步骤图等）。

**Auth：** 必需，`Authorization: Bearer <token>`

**请求：** `multipart/form-data`，字段名 `file`。

**响应 `data`：**

```json
{
  "url": "https://cdn.example.com/images/xxx.jpg"
}
```

**流程建议：**

1. 登录时 `chooseAvatar` 得到 `wxfile://` → 先 `POST /auth/wechat-login` 拿 token → 再本接口上传 → 得到 `https` URL 写入用户头像（前端已实现在 `stores/auth.ts`）。  
2. 发布菜谱：`uni.chooseImage` → 本接口 → `coverImage` / `steps[].image` 存 CDN URL。  
3. 设置页换头像：同 2。

当前未接后端时头像为本地临时路径，仅当前设备可见；**上线必须接本接口**。

---

### 5.9 元数据（可选）

#### GET `/meta/filters`

下发分类、菜系、标签、难度等（与 `data/recipes.ts` 常量一致）。

**响应 `data`：**

```json
{
  "categories": [
    { "key": "all", "label": "全部" },
    { "key": "breakfast", "label": "早餐" }
  ],
  "cuisines": ["川菜", "粤菜"],
  "tags": ["减脂", "素食"],
  "difficulties": ["简单", "中等", "困难"]
}
```

也可继续由前端写死，无强制接口。

---

## 六、页面 ↔ 接口对照

| 页面 | 读接口 | 写接口 |
|------|--------|--------|
| `pages/home/index` | `GET /recipes/ranked`, `GET /recipes` | — |
| `pages/recipes/index` | `GET /recipes` | — |
| `pages/recipe-detail/index` | `GET /recipes/:id` | `POST/DELETE` 收藏、评分、建议 |
| `pages/upload/index` | `GET/PUT /drafts`（待接入） | `POST /upload/image`, `POST /recipes` |
| `pages/profile/index` | `GET /users/me` | — |
| `pages/my-uploads/index` | `GET /users/me/recipes`, `/favorites`, `/reviews` | `DELETE /favorite` |
| `pages/settings/index` | `GET /users/me` | `PATCH /users/me`, `POST /users/me/avatar` |

---

## 七、业务规则汇总

1. **评分**：一用户一菜谱一条；更新覆盖；删除后重算平均分与 `ratingCount`。  
2. **建议**：一用户一菜谱一条；`content` ≤ 500 字。  
3. **收藏**：多对多，无重复。  
4. **搜索**：标题、食材 `name`、标签（前端已实现，后端建议同样逻辑或全文检索）。  
5. **权限**：改删菜谱、删自己的评分/建议；不能删他人内容。  
6. **图片**：仅存储 CDN URL，不接受微信 `tmp` 路径入库。  

---

## 八、实现优先级建议

| 阶段 | 接口 | 原因 |
|------|------|------|
| P0 | `POST /auth/wechat-login`（code2Session + 注册） | 登录基础 |
| P0 | `POST /upload/image` | 登录头像、菜谱图片 |
| P0 | `GET/POST /recipes`、`GET /recipes/:id` | 核心浏览与发布 |
| P1 | 收藏、评分、建议 CRUD | 详情页互动 |
| P1 | `GET /users/me`、资料 PATCH、头像 | 个人中心 |
| P2 | `GET /users/me/recipes|favorites|reviews` | 我的列表 |
| P2 | 草稿 CRUD + publish | Store 已有，UI 待接 |
| P3 | `PATCH/DELETE /recipes/:id` | 编辑删除（UI 未做） |
| P3 | `GET /meta/filters` | 可选 |

---

## 九、前端联调待办（对接时）

- [ ] 新增 `api/request.ts` 封装 `uni.request`（baseURL、token、错误处理）  
- [ ] Pinia Store 的内存操作改为调用上述接口  
- [ ] `pages/upload` 接入 `uploadStore` 或服务端草稿  
- [ ] 发布/设置前增加 `uni.uploadFile`  
- [x] 进入小程序检查登录态 + `chooseAvatar` / `nickname` / `uni.login`（`LoginGate` + `stores/auth.ts`）  
- [ ] 配置 `config/index.ts` 中 `API_BASE_URL` 并联调 `POST /auth/wechat-login`  
- [ ] 登录后头像临时路径自动 `POST /upload/image`（`api/upload.ts` 已预留）  
- [ ] 首页/发现页「加载更多」改为服务端分页（当前为前端 `slice`）  

---

## 十、源码索引

| 文件 | 职责 |
|------|------|
| `data/recipes.ts` | 类型定义、Mock 数据、枚举 |
| `stores/recipe.ts` | 菜谱 CRUD、筛选、评分、建议 |
| `stores/user.ts` | 用户、收藏、个人评价/建议记录 |
| `stores/upload.ts` | 草稿 localStorage |
| `pages/upload/index.vue` | 四步发布表单 |
| `pages/recipe-detail/index.vue` | 详情、收藏、评分、建议 |
| `pages/my-uploads/index.vue` | 已发布 / 收藏 / 评价 |
| `components/RatingModal.vue` | 评分 1–5 |
| `components/SuggestionModal.vue` | 建议 ≤500 字 |
| `components/LoginGate.vue` | 登录：chooseAvatar + nickname |
| `components/PageShell.vue` | 未登录遮罩登录层 |
| `stores/auth.ts` | 登录、session、微信资料恢复 |
| `api/auth.ts` | `wechatLogin` |
| `api/upload.ts` | `uploadImage` |
| `utils/session.ts` | 本地登录态 `user_session_v4` |

---

**文档维护**：前端字段或页面变更时，请同步更新本章与 `data/recipes.ts` 类型定义。
