# 飞书个人会话总结助手 · Web

React + TypeScript + Vite + Ant Design。员工与管理员共用一个前端，权限由后端逐请求校验。当前是首个本地开发版本，真实飞书与生产环境尚未验收。

## 启动

使用 `.nvmrc` 指定的 Node 22，确保使用与 Node 配套的 npm（`node --version` / `npm --version`）。

```bash
npm ci
npm run dev
```

更新依赖前先停止 Vite，再运行 `npm ci`，完成后重新启动。不要在开发服务运行期间替换 `node_modules`，否则旧进程可能仍引用已失效的依赖缓存，出现白屏和脚本 504。

遇到依赖缓存异常时，停止旧进程后执行 `npm run dev -- --force`，再刷新浏览器。启动验收需在最后一次依赖安装之后检查首页、登录后页面及刷新，不以生产构建通过代替开发页面验证。

后端需运行在本机 8000 端口；Vite 通过 `/api`、`/auth` 同域代理访问。配套后端 README 包含 PostgreSQL、迁移与 runner 启动步骤。默认页面：<http://localhost:5173>。

后端仅在明确启用本地 Mock 时提供以下入口：

- `/auth/dev/login/demo-a`
- `/auth/dev/login/demo-b`
- `/auth/dev/login/demo-admin`

用不同浏览器 Profile/隐身窗口验证不同用户。演示任务不会读取真实飞书或发送消息。不要在同一浏览器会话中把不同标签页当成独立账号。

## 页面

- `/`：消息授权状态、每日时间、启用/暂停/停用、立即总结。
- `/runs`、`/runs/:id`：个人任务历史、执行/覆盖/送达状态、阶段和安全错误分类。
- `/admin/users`：授权用户、启用状态、时间和最近检查；支持搜索与筛选。
- `/admin/runs`、`/admin/runs/:id`：跨用户任务监控，仅元数据。

页面不展示聊天正文或总结正文；最终总结通过飞书私发本人。当前任务列表默认最近7天，日期选择控件待补充。状态轮询不延长登录空闲期限，仅用户操作触发活动更新。

## 接口与鉴权

`src/api/generated.ts` 来自后端 `contracts/openapi.json`。同步经过评审的契约后运行：

```bash
npm run generate:api
npm run typecheck
```

响应类型别名位于 `src/api/types.ts`，不要手写复制响应字段。Cookie 使用浏览器同域请求，CSRF 保存在内存中，仅修改操作发送；前端不保存飞书凭证，不把会话放入 localStorage。前端隐藏入口只是交互措施，不能替代后端鉴权。

生产前端不需要任何秘密 `VITE_*` 变量。Nginx 路由、TLS、API 代理和部署编排的唯一来源是后端 `deploy/`。

## 验证

```bash
npm test
npm run build
npm audit
```

端到端测试需独立干净的本地演示库，API、runner、Vite 已启动：

```bash
npx playwright install chromium
npx playwright test
```

测试使用两个员工和一个管理员的独立浏览器上下文，验证保存设置、任务完成、用户隔离与管理员查看；不调用真实飞书。重复测试应使用新的演示库或等待手动任务5分钟限频窗口，不绕过业务限流。

## Git 约定

独立仓库；锁文件、契约和生成类型一同提交。每次 commit 除主题外，正文写清变更和验证结果。安全边界、会话处理、轮询原因等必要位置保留注释。实现差距统一记录于后端 `docs/IMPLEMENTATION_STATUS.md`。
