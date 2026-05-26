# NEWS

一个 Lo-Fi 剪报墙风格的新闻聚合页，用来集中查看多个平台的实时热点。

## 功能

- 聚合展示抖音热点、微博热搜、B 站热榜、知乎热榜、GitHub 热榜和 AI 动态。
- 支持控制每行显示列数，最多 6 列，设置会保存在本地浏览器。
- 支持通过下拉多选控制展示哪些新闻源卡片。
- 支持拖拽卡片调整显示顺序，顺序会保存在本地浏览器。
- 内置周历和月历弹层，展示节假日和补班信息。
- 天气组件会一直显示状态：加载中、未获取到权限、获取失败或当前天气。
- 采用 Lo-Fi 剪报墙视觉：纸张背景、半调纹理、硬阴影、错位卡片和印章式标签。

## 技术栈

- React 18
- React Router 7
- TanStack React Query 5
- TypeScript
- Vite
- Tailwind CSS

## 本地运行

```bash
npm install
npm run dev
```

默认开发地址由 Vite 输出，通常是：

```bash
http://localhost:5173
```

## 构建

```bash
npm run build
```

预览构建结果：

```bash
npm run preview
```

## 数据源和代理

项目通过 `vite.config.ts` 配置开发环境代理，用于访问热榜、天气定位等接口：

- `/api/douyin`
- `/api/weibo`
- `/api/bilibili`
- `/api/zhihu`
- `/api/aihot`
- `/api/ipgeo`

这些代理只在 Vite 开发服务器中生效。如果部署到生产环境，需要在部署平台配置等价的反向代理或后端接口。

## 本地偏好存储

以下设置保存在浏览器 `localStorage` 中：

- `news-column-count`：每行显示列数。
- `news-visible-source-ids`：当前展示的新闻源。
- `news-source-order-ids`：新闻源卡片排序。

清理浏览器站点数据后会恢复默认设置。
