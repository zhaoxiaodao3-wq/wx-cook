# 后端对接说明

后端项目：`E:\code\minipro\cookbook-server`  
接口文档：`API_DOC.md`  
服务挂载：`/api/v1`（见 `app/main.py`），静态文件 `/uploads`

## 路径核对（前端 ↔ 服务端）

| 前端 `api/*.ts` | 服务端 `app/api/v1` | 状态 |
|-----------------|---------------------|------|
| `POST /auth/wechat-login` | `auth.py` | ✓ |
| `GET/PATCH /users/me` | `users.py` | ✓ |
| `POST /users/me/avatar` | `users.py` | ✓ |
| `GET /users/me/recipes\|favorites\|reviews` | `users.py` | ✓ |
| `GET /recipes`、`/ranked`、`/{id}`、`POST /recipes` | `recipes.py` | ✓ |
| `POST/DELETE /recipes/{id}/favorite` | `favorites.py` | ✓ |
| `POST/DELETE /recipes/{id}/reviews` | `reviews.py` | ✓ |
| `POST/DELETE /recipes/{id}/suggestions` | `recipe_suggestions.py` | ✓ |
| `POST /upload/image` | `upload.py` | ✓ |
| `GET /meta/filters` | `meta.py` | ✓ |
| `GET /categories` | `categories.py` | ✓（前端可按需接入） |

> 仓库内仍有旧版 `dishes/*` 路由文件，**未**挂到 `api/v1/__init__.py`，请勿对接。

## 多环境自动切换

配置在 `config/env.profiles.ts`，运行时由 `config/runtime.ts` 根据微信小程序环境选择：

| 微信环境 | `envVersion` | API 地址来源 |
|----------|--------------|--------------|
| 开发者工具 | `develop` | `http://localhost:8000` |
| 手机开发版 / 预览 | `develop` | `http://{DEVELOP_LAN_HOST}:8000`（局域网 IP） |
| 体验版 | `trial` | `TRIAL_ENDPOINTS` |
| 正式版 | `release` | `RELEASE_ENDPOINTS` |

### 你需要改的配置

1. **真机调试开发版**：在 `config/env.profiles.ts` 把 `DEVELOP_LAN_HOST` 改成你电脑的局域网 IP（与手机同 WiFi）。
2. **体验 / 正式**：把 `TRIAL_ENDPOINTS`、`RELEASE_ENDPOINTS` 里的域名改成已备案、已加入微信「服务器域名」的 HTTPS 地址。

启动时控制台会打印当前环境，例如：

```text
[API] 环境=开发(develop) api=http://localhost:8000/api/v1
```

### 开发时强制切换环境（可选）

```javascript
import { setApiEnvOverride } from '@/config/index'

// 在开发者工具控制台执行：强制走体验环境
setApiEnvOverride('trial')

// 恢复自动识别
setApiEnvOverride(null)
```

## 本地联调

1. 启动 `cookbook-server`（默认 `8000`）
2. 微信开发者工具勾选「不校验合法域名」
3. 小程序一键登录（后端 `.env` 配置 `WECHAT_APP_ID` / `WECHAT_APP_SECRET`，或留空走 `dev_{code}` 模拟 openid）

未配置有效域名（仍含 `your-staging-domain` 等占位符）时，`hasApiServer()` 为 false，开发者工具可继续用本地 Mock。

## 常见问题：`GET /users/me` 返回 401

| 原因 | 处理 |
|------|------|
| 未带 `Authorization: Bearer <JWT>` | 先完成「微信一键登录」，确认本地 session 含真实 token |
| 本地仍是 `dev_token`（以前 Mock 登录残留） | 清除小程序缓存或退出后重新登录 |
| 后端配置了微信 AppSecret，但 `code` 无效导致从未登录成功 | 检查 `cookbook-server/.env` 中 `WECHAT_APP_ID/SECRET` 是否与小程序 AppID 一致；本地调试可暂时清空 Secret 走 `dev_{code}` |
| JWT 过期或数据库用户被删 | 重新登录；401 时前端会自动清 session 并提示 |

请求头示例：`Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`（JWT 含两个 `.`）

## 常见问题：`POST /auth/wechat-login` 登录失败

接口路径正确：`POST http://localhost:8000/api/v1/auth/wechat-login`

请求体示例（与你 curl 一致）：

```json
{"code":"uni.login 返回的 code","nickName":"微信用户","avatarUrl":""}
```

### 后端两种模式

| `.env` 配置 | 行为 |
|-------------|------|
| `WECHAT_APP_ID` **和** `WECHAT_APP_SECRET` **都为空** | 本地开发模式：`openid = dev_{code}`，不调用微信服务器 |
| **两者都填了** | 真实模式：用 `code` 调微信 `jscode2session`，必须 AppID/AppSecret 正确 |

### 当前最可能的原因：`invalid appsecret`

若响应为：

```json
{"detail":"微信登录失败: invalid appsecret, ..."}
```

说明 **AppSecret 填错或已重置**，与小程序 AppID `wx3af404a2d48c2787` 不匹配。

**本地联调（推荐）**：编辑 `cookbook-server/.env`，暂时清空：

```env
WECHAT_APP_ID=
WECHAT_APP_SECRET=
```

重启后端后再登录，会走 `dev_{code}` 模拟 openid。

**正式联调**：到 [微信公众平台](https://mp.weixin.qq.com) → 开发 → 开发管理 → 开发设置，复制与 AppID 对应的 **AppSecret**，更新 `.env` 后重启。

### 其他常见错误

| 响应 detail | 原因 | 处理 |
|-------------|------|------|
| `invalid code` / `code been used` | `code` 只能用一次，或 curl 复用了旧 code | 小程序里重新点「一键登录」，不要手动复用 Network 里的 code |
| `昵称不能为空` | nickName 为空 | 一键登录默认传「微信用户」，一般不会出现 |
| `500` | 数据库异常 | 执行 `migrate_db.py` 并重启后端 |

## 常见问题：多个接口同时 500

`/users/me`、`/meta/filters`、`/recipes`、`/recipes/ranked` 全部 500，通常是 **PostgreSQL 表结构与代码不一致**（缺列、缺表），不是小程序问题。

### 处理步骤

1. 确认 PostgreSQL 已启动，且存在库 `cookbook`
2. 在 `cookbook-server` 目录执行迁移（可重复执行）：

```bash
cd E:\code\minipro\cookbook-server
py -3 migrate_db.py
```

3. **重启** uvicorn（改代码或迁库后必须重启）
4. 浏览器访问 `http://localhost:8000/health/db`，应返回 `{"status":"ok","database":"connected"}`
5. 再访问 `http://localhost:8000/api/v1/meta/filters`，应返回 `code: 0`

### 500 响应里看具体原因

重启后端后，Network 面板里 500 响应的 `message` 字段会带数据库错误，例如：

- `column dishes.status does not exist` → 未执行 `migrate_db.py`
- `relation "favorites" does not exist` → 同上
- `connection refused` → PostgreSQL 未启动或 `.env` 里 `DATABASE_URL` 不对

### 标签筛选曾有的后端 bug

`tag=精选` 曾导致 500（JSONB 查询写法错误），已在 `app/models/dish.py` + `app/services/dish.py` 修复，需重启后端生效。

## 常见问题：体验版 / 正式版请求一直 Pending

体验版不会走 `localhost`，会使用 `config/env.profiles.ts` 里的线上地址：

```text
https://cookbook-server-qdi6.onrender.com/api/v1
```

Pending（一直转圈、无响应）**几乎总是微信域名白名单问题**，不是代码 bug。

### 必做：配置微信公众平台合法域名

登录 [微信公众平台](https://mp.weixin.qq.com) → **开发** → **开发管理** → **开发设置** → **服务器域名**

AppID：`wx3af404a2d48c2787`

| 类型 | 填写的域名（不要带路径） |
|------|--------------------------|
| **request 合法域名** | `https://cookbook-server-qdi6.onrender.com` |
| **uploadFile 合法域名** | `https://cookbook-server-qdi6.onrender.com` |
| **downloadFile 合法域名**（封面图） | `https://cookbook-server-qdi6.onrender.com` |

注意：

- 只填 **https://域名**，不要写 `/api/v1`
- 体验版、正式版都会校验，**开发者工具里勾选「不校验合法域名」对体验版无效**
- 修改域名后需重新上传体验版，有时需等几分钟生效

### 自检步骤

1. 手机浏览器打开：`https://cookbook-server-qdi6.onrender.com/health`  
   应看到 `{"status":"ok"}`（若很久才出来，是 Render 冷启动，正常）
2. 体验版启动时看控制台：`[API] 环境=体验(trial) api=https://cookbook-server-qdi6.onrender.com/api/v1`
3. 若 fail 提示 `url not in domain list` → 域名白名单未配好
4. 若 timeout → 服务器冷启动或网络差，等 30～60 秒再试

### Render 后端环境变量

体验版登录需要 Render 上配置正确的：

```env
WECHAT_APP_ID=wx3af404a2d48c2787
WECHAT_APP_SECRET=你的AppSecret
DATABASE_URL=你的PostgreSQL连接串
SECRET_KEY=随机字符串
```

Secret 错误或数据库连不上会导致登录失败（一般不是 Pending，而是 400/500）。

## 常见问题：体验版图片加载不出来

体验版图片地址形如：

```text
https://cookbook-server-qdi6.onrender.com/uploads/xxx.png
```

### 原因 1：微信 downloadFile 合法域名未配置（必查）

`<image src="https://...">` 走 **downloadFile 合法域名**，与 request 域名分开配置。

在微信公众平台 → 服务器域名，除 request 外还需配置：

| 类型 | 域名 |
|------|------|
| downloadFile 合法域名 | `https://cookbook-server-qdi6.onrender.com` |

若封面用了第三方图床（如 picsum），也要把对应域名加入 downloadFile。

### 原因 2：Render 本地 uploads 目录文件已丢失（很常见）

Render 免费实例的磁盘是**临时的**，重启/重新部署后 `uploads/` 里的图片会消失，但数据库里仍保留 `/uploads/xxx.png` 路径 → 浏览器打开也是 **404**。

**验证**：手机浏览器访问某张封面完整 URL，若 404 即属此情况。

**处理**：

1. 短期：在体验版里**重新上传**带封面的菜谱（Render 上暂时能显示，但下次部署仍可能丢）
2. 长期：后端接入 **Supabase Storage / OSS** 等持久化对象存储（见 `cookbook-server/docs/OPERATIONS.md`）

### 原因 3：数据库里存了 localhost 完整 URL

本地开发时若写入 `http://localhost:8000/uploads/...`，体验版手机无法访问。

前端 `utils/media.ts` 已支持将 localhost/LAN 地址**重写**为当前环境的 `fileBaseUrl`；仍建议在 Render 环境重新发布带图的菜谱。

### 自检清单

1. downloadFile 合法域名已配置并重新上传体验版
2. 浏览器能打开：`https://cookbook-server-qdi6.onrender.com/uploads/某文件名.png`（不是 404）
3. 控制台 Network 里图片 URL 不是 `localhost`
