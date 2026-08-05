# AGENTS.md

纯前端个人技术博客展示站点。Vue 3 + TypeScript + Vite + Vue Router + Element Plus + Tailwind + markdown-it/highlight.js。无后端、无鉴权、无测试、无 lint。

## 命令

- `npm run dev` — 开发服务器 :5173
- `npm run typecheck` — `vue-tsc --noEmit`
- `npm run build` — 执行 `vue-tsc --noEmit && vite build`（typecheck 已包含在 build 中）
- `npm run preview` — 预览生产构建产物

修改后请用 `npm run typecheck` 和 `npm run build` 验证。项目没有测试套件。

## 数据层：全部为 Mock

- 所有 `/api` 请求都会在浏览器内被 `src/mock/index.ts` 拦截（axios 请求拦截器设置 `config.adapter`）。不会真正访问网络；`vite.config.ts` 中的 `/api` 代理目标是遗留配置。
- Mock 状态保存在内存中，刷新页面即重置（mock 文章在详情获取时 `viewCount` 会自增）。
- 修改站点内容（文章/分类/标签/项目）请编辑 `src/mock/data.ts`。新增接口请在 `setupMock()` 中增加分支并返回 `ok(data)` / `fail(msg, 404)`。
- 注意：在拦截器执行时 URL 中还没有查询字符串。`setupMock` 会把 `config.params` 和 URL 查询串合并到一个 `params` 对象中——读取 `pageSize`、`page`、筛选条件、`keyword` 都要从这个合并对象中取，绝不要从 `url` 读取。

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
