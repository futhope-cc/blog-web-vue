# AGENTS.md

纯前端个人技术博客展示站点。Vue 3 + TypeScript + Vite + Vue Router + Element Plus + Tailwind + markdown-it/highlight.js。无后端、无鉴权、无测试、无 lint。

## 命令

- `npm run dev` — 开发服务器 :5173
- `npm run typecheck` — `vue-tsc --noEmit`
- `npm run build` — 执行 `vue-tsc --noEmit && vite build`（typecheck 已包含在 build 中）
- `npm run preview` — 预览生产构建产物

修改后请用 `npm run typecheck` 和 `npm run build` 验证。项目没有测试套件。

## 数据层：调用真实后端接口

- 所有 `/api` 请求通过 `vite.config.ts` 的 dev 代理转发到后端 `http://localhost:8081`（`/api` 是后端 context-path）。
- 接口契约见 `docs/前后台接口整合与评审.md`，后端工程在 `D:\code\project\java\blog-server`。
- 统一返回 `Result<T>`：`{ code, message, data }`，`code=0` 成功（见 `src/api/http.ts` 的 `request()`，非 0 会自动 ElMessage 并 throw）。分页为 `{ records, total, current, size }`。
- 前台只读接口：`GET /article/list`、`GET /article/{id}`、`GET /category/list`、`GET /tag/list`、`GET /project/list`、`GET /project/{id}`、`GET /profile`。请求参数用 `current/size`（不是 page/pageSize）。
- 与旧 mock 的字段差异（当前代码已按真实接口适配，改字段时注意）：
  - 文章列表/详情没有 `tags` 对象数组和 `likeCount`，改为 `tagNames: string[]`（详情另有 `tagIds`），发布时间用 `publishTime`。
  - 分类/标签列表无 `createTime`；分类含 `articleCount`。
  - `/profile` 返回 `techStack`（逗号分隔字符串）、`socialLinks`（JSON 字符串）、`email`、`gitee`，没有 `tagline/location/socials`。展示用 `src/utils/index.ts` 中的 `parseTechStack/parseSocialLinks/buildSocials/profileTagline` 等辅助函数映射。
  - 本地存储图片返回相对路径 `/files/...`，需经 `resolveFileUrl()` 补上 `/api` 前缀（dev 下由 `/api` 代理转发）。
- 无后台管理页面（不登录、无写操作）。`src/mock` 目录已删除，不要再依赖 mock。

## Tailwind 未启用 preflight

`tailwind.config.js` 设置了 `corePlugins.preflight: false`，因此浏览器默认样式不会被重置：

- `<a>` 链接保留默认下划线——不希望有下划线时要加 `no-underline`（如目录链接）。
- 默认 margin/padding 仍然生效；重置与排版由 Element Plus 的 CSS 和 `src/styles/main.css` 中的 `.prose-blog` 负责。

## 架构

- `src/main.ts` 全局注册了所有 `@element-plus/icons-vue` 图标——可以直接在模板中使用，或通过 `<component :is="...">`。
- 所有路由都是 `FrontLayout.vue` 的子路由（见 `src/router/index.ts`）。新增页面 = 添加子路由 + `src/views` 中对应的视图。
- 文章 markdown 由 `MarkdownViewer.vue` 通过 `renderMarkdownWithAnchors()`（`src/utils/markdown.ts`）渲染，它会注入标题 id 并输出目录（TOC），供文章详情页侧边栏使用。
- `@` 别名指向 `src`。TypeScript 为严格模式；类型定义在 `src/types/index.ts`。
- `echarts` 已安装并在 `vite.config.ts` 中做了分包，但未使用——保持现状即可，除非要清理。

## 设计意图（不要"修正"这些）

- 首页 = 深色科幻 hero（`#07041a`），各段落背景为刻意设计：最新文章段有意保持白色/浅色，项目展示 + 联系我段为深色 `#120b33`，页脚 slate-900。
- 纯展示站点：无登录/注册、无评论功能——这些是被刻意移除的，不要重新添加。
