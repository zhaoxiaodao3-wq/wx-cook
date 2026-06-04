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
