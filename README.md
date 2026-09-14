# 合租生活管家

面向合租年轻人的生活协同管理应用：费用 AA 分摊、清洁值日排班、公共物品库存、室友公约投票，前后端分离架构。

## 1. 技术栈

| 层 | 技术 |
|------|------|
| 前端 | React 18 + Vite 5 + Tailwind CSS 3 + React Router 6 + framer-motion + lucide-react |
| 后端 | Node.js + Express 4（REST API） |
| 数据持久化 | JSON 文件（`server/data/db.json`），首次启动自动写入演示数据 |
| 数据库 | 无（无需额外安装） |

## 2. 环境要求

- Node.js ≥ 18
- npm ≥ 9

## 3. 安装依赖

在项目根目录执行：

```bash
npm install
```

## 4. 启动

### 开发模式（推荐）

一条命令同时启动后端 API 与前端开发服务器：

```bash
npm run dev
```

- 前端：http://localhost:5173（Vite 已配置代理，`/api` 请求自动转发到后端）
- 后端：http://localhost:3001

### 分开启动

```bash
npm run server   # 仅启动后端 API（端口 3001）
npm run client   # 仅启动前端开发服务器（端口 5173）
```

### 生产构建

```bash
npm run build    # 构建前端产物到 dist/
npm start        # 启动后端 API（端口 3001）
```

> 生产部署时，将 `dist/` 交给任意静态托管（Nginx / Vercel / Netlify），并部署 `server/` 到 Node 服务即可。API 地址可通过 Nginx 反向代理保持 `/api` 前缀不变。

## 5. 首次使用

启动后打开 http://localhost:5173 ，三种进入方式：

1. **创建房屋**：填写房屋名称和昵称，成为房主，系统生成 6 位邀请码
2. **加入房屋**：输入室友分享的邀请码和昵称
3. **体验演示数据**：点击「先体验演示数据」按钮（演示房屋邀请码 `DEMO01`）

房屋与身份信息保存在浏览器 localStorage 中，下次访问自动进入；侧边栏底部可退出房屋切换身份。

## 6. API 概览

后端所有接口以 `/api` 为前缀，完整房屋数据通过 `GET /api/houses/:id` 获取（含实时结算计算）。

| 模块 | 接口 |
|------|------|
| 房屋 | `POST /api/houses`（创建）、`POST /api/houses/join`（凭码加入）、`GET /api/houses/:id` |
| 室友 | `POST /api/houses/:id/roommates` |
| 费用 | `POST/DELETE /api/houses/:id/expenses[/:eid]` |
| 值日 | `POST/DELETE /api/houses/:id/tasks[/:tid]`、`PATCH .../tasks/:tid`（打卡） |
| 物品 | `POST/DELETE /api/houses/:id/items[/:iid]`、`POST .../items/:iid/use`（消耗）、`POST .../items/:iid/restock`（补货） |
| 公约 | `POST/DELETE /api/houses/:id/rules[/:rid]`、`POST .../rules/:rid/vote`（投票） |

## 7. 数据说明

- 所有数据持久化在 `server/data/db.json`，无外部数据库依赖
- **重置数据**：停止服务后删除 `server/data/db.json`，重启后自动重新生成演示数据
- 结算规则：按「垫付总额 − 分摊总额」计算每人净收支，自动生成最小转账的债务关系（谁欠谁、欠多少）

## 8. 项目结构

```
home_help/
├── index.html              # 前端入口 HTML
├── vite.config.js          # Vite 配置（含 /api 代理）
├── tailwind.config.js      # Tailwind 主题（陶土色/鼠尾草绿配色）
├── postcss.config.js
├── src/                    # 前端源码
│   ├── main.jsx            # 入口（Router + HouseProvider）
│   ├── App.jsx             # 路由定义
│   ├── api.js              # API 请求封装
│   ├── utils.js            # 金额/日期格式化等工具
│   ├── store/HouseContext.jsx  # 全局状态（房屋/身份/操作）
│   ├── components/Layout.jsx   # 布局（侧边导航/底部 Tab/通用组件）
│   └── pages/              # Welcome / Dashboard / Expenses / Cleaning / Items / Rules
├── server/
│   ├── index.js            # Express 路由
│   ├── store.js            # 数据持久化、种子数据、结算算法
│   └── data/db.json        # 数据文件（自动生成）
└── package.json
```

## 9. 常见问题

**Q: `npm install` 报 `EACCES` 权限错误？**
全局 npm 缓存中有 root 属主文件，执行以下命令修复后重装：

```bash
sudo chown -R $(id -u):$(id -g) ~/.npm
```

**Q: 端口被占用？**
后端默认 3001，可通过环境变量修改：`PORT=4000 npm run server`；前端端口在 `vite.config.js` 中调整。

**Q: 页面显示「房屋不存在」？**
数据文件可能被重置过，localStorage 里的旧房屋 ID 已失效。点击退出房屋，重新创建或凭邀请码加入即可。
