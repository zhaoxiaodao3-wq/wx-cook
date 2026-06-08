# 小程序操作手册（小圈子菜谱）

本文档说明 **本地开发如何启动与联调**，以及 **如何发布体验版 / 正式版**。

---

## 一、项目信息

| 项目 | 说明 |
|------|------|
| 项目路径 | `E:\code\菜谱小程序\大` |
| 技术栈 | uni-app + Vue 3 + Pinia |
| 小程序 AppID | `wx3af404a2d48c2787`（见 `project.wx.json`） |
| 后端项目 | `E:\code\minipro\cookbook-server` |

---

## 二、服务地址（多环境）

配置在 `config/env.profiles.ts`，运行时由 `config/runtime.ts` 按微信环境自动选择：

| 场景 | 微信 `envVersion` | API 地址 |
|------|-------------------|----------|
| 开发者工具 | `develop` | `http://localhost:8000/api/v1` |
| 手机真机预览（开发版） | `develop` | `http://{局域网IP}:8000/api/v1` |
| 体验版 | `trial` | `https://cookbook-server-qdi6.onrender.com/api/v1` |
| 正式版 | `release` | `https://cookbook-server-qdi6.onrender.com/api/v1` |

启动时控制台会打印当前环境，例如：

```text
[API] 环境=开发(develop) api=http://localhost:8000/api/v1
```

---

## 三、本地开发

### 3.1 环境要求

- [HBuilderX](https://www.dcloud.io/hbuilderx.html) 或 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 本地运行的 `cookbook-server`（见后端操作手册）

### 3.2 启动后端（必须先做）

```powershell
cd E:\code\minipro\cookbook-server
py run.py
```

确认 `http://localhost:8000/health` 返回 `{"status":"ok"}`。

详细步骤见：`E:\code\minipro\cookbook-server\docs\OPERATIONS.md`

### 3.3 启动小程序

**方式一：HBuilderX（推荐）**

1. 用 HBuilderX 打开项目目录 `E:\code\菜谱小程序\大`
2. 菜单 **运行 → 运行到小程序模拟器 → 微信开发者工具**
3. 首次运行会自动打开微信开发者工具

**方式二：微信开发者工具**

1. 先用 HBuilderX 编译一次（生成 `unpackage/dist/dev/mp-weixin`）
2. 微信开发者工具 → **导入项目**
3. 目录选择：`E:\code\菜谱小程序\大\unpackage\dist\dev\mp-weixin`
4. AppID 填 `wx3af404a2d48c2787`

### 3.4 开发者工具必做设置

微信开发者工具 → **详情 → 本地设置**：

- ✅ 不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书

否则本地 `http://localhost:8000` 请求会被拦截。

### 3.5 手机真机调试本地后端

1. 电脑与手机连接同一 WiFi
2. 查电脑局域网 IP（PowerShell）：

```powershell
ipconfig
# 找到 IPv4，例如 192.168.1.105
```

3. 修改 `config/env.profiles.ts`：

```typescript
export const DEVELOP_LAN_HOST = '192.168.1.105'  // 改成你的 IP
```

4. 重新编译运行，手机扫码预览（开发版）
5. 确保电脑防火墙允许 8000 端口入站

### 3.6 开发时临时切到线上 API（可选）

在微信开发者工具控制台执行：

```javascript
// 强制走体验环境（线上 Render）
uni.setStorageSync('app_api_env_override', 'trial')
// 刷新小程序

// 恢复自动识别
uni.removeStorageSync('app_api_env_override')
```

---

## 四、发布到线上

### 4.1 发布前检查清单

- [ ] 后端已部署且 `/health` 正常（见后端操作手册）
- [ ] `config/env.profiles.ts` 中 `PRODUCTION_HOST` 指向正确线上域名
- [ ] 微信公众平台已配置服务器域名（见 4.3）
- [ ] Render 环境变量已配置 `WECHAT_APP_ID` / `WECHAT_APP_SECRET`

### 4.2 修改线上 API 地址

只需改 `config/env.profiles.ts` 一处：

```typescript
const PRODUCTION_HOST = 'https://cookbook-server-qdi6.onrender.com'
```

体验版（`trial`）和正式版（`release`）共用此地址。  
**开发环境不受影响**，仍走 `localhost:8000`。

### 4.3 微信公众平台配置

登录 https://mp.weixin.qq.com → **开发管理 → 开发设置 → 服务器域名**

添加以下域名（均需 HTTPS）：

```
https://cookbook-server-qdi6.onrender.com
```

需配置的类型：

| 类型 | 用途 |
|------|------|
| request 合法域名 | API 请求 |
| uploadFile 合法域名 | 上传图片 |
| downloadFile 合法域名 | 下载图片 / 资源 |

> 开发阶段可在开发者工具勾选「不校验合法域名」，但 **体验版 / 正式版必须配置**。

### 4.4 上传体验版

**HBuilderX：**

1. 菜单 **发行 → 小程序-微信**
2. 填写版本号、备注
3. 等待编译完成，自动打开微信开发者工具上传界面
4. 在微信开发者工具中点击 **上传**
5. 登录微信公众平台 → **管理 → 版本管理 → 开发版本** 可看到上传的包
6. 设为 **体验版**，扫码即可体验

**微信开发者工具直接上传：**

1. 打开编译产物目录（发行版在 `unpackage/dist/build/mp-weixin`）
2. 点击 **上传** → 填写版本信息

体验版会自动使用 `TRIAL_ENDPOINTS`（线上 Render 地址）。

### 4.5 提交审核 / 发布正式版

1. 微信公众平台 → **版本管理**
2. 从开发版本 **提交审核**
3. 审核通过后 **发布**
4. 正式版用户使用 `RELEASE_ENDPOINTS`（同为线上 Render 地址）

### 4.6 发布后端新版本

小程序 API 地址不变时，**只需更新后端**：

```powershell
cd E:\code\minipro\cookbook-server
git push origin main
```

Render 自动部署，小程序无需重新发版（除非改了 `PRODUCTION_HOST`）。

若后端域名变更，需：

1. 改 `config/env.profiles.ts` 的 `PRODUCTION_HOST`
2. 重新上传小程序
3. 更新微信服务器域名

---

## 五、配置文件速查

| 文件 | 作用 |
|------|------|
| `config/env.profiles.ts` | 各环境 API / 静态资源根地址 |
| `config/runtime.ts` | 按微信 envVersion 自动选环境 |
| `config/index.ts` | 对外导出配置 |
| `api/request.ts` | 统一请求封装（baseURL、token） |
| `project.wx.json` | 小程序 AppID、编译设置 |
| `manifest.json` | uni-app 应用配置 |

---

## 六、验证发布是否成功

### 体验版 / 正式版

1. 扫码打开小程序
2. 打开调试（体验版可在微信中开 vConsole，或开发者工具远程调试）
3. 确认控制台输出类似：

```text
[API] 环境=体验(trial) api=https://cookbook-server-qdi6.onrender.com/api/v1
```

4. 测试登录、浏览菜谱、上传等功能

### 线上后端快速自检

浏览器访问：

- https://cookbook-server-qdi6.onrender.com/health
- https://cookbook-server-qdi6.onrender.com/api/v1/categories

---

## 七、常见问题

### 开发者工具能访问，体验版不行

- 检查微信公众平台是否配置了 `https://cookbook-server-qdi6.onrender.com`
- 域名必须 HTTPS，不能填 IP 或 localhost

### 请求超时 / 首次很慢

Render 免费版休眠后首次唤醒需 30–60 秒，属正常现象。

### 登录失败 401

| 原因 | 处理 |
|------|------|
| 未登录或 token 过期 | 重新微信一键登录 |
| 本地残留旧 mock token | 清除小程序缓存后重登 |
| 后端微信 AppSecret 配置错误 | 检查 Render 环境变量 |

### 改了 `env.profiles.ts` 不生效

- HBuilderX 需重新 **运行 / 发行** 编译
- 不要只改 `unpackage` 下已编译的旧文件

---

## 八、相关文档

- 后端操作手册：`E:\code\minipro\cookbook-server\docs\OPERATIONS.md`
- 接口对接说明：`docs/backend-integration.md`
- API 规格：`docs/api-spec.md`
