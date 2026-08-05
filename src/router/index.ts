import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/components/FrontLayout.vue'),
      children: [
        { path: '', name: 'home', component: () => import('@/views/Home.vue'), meta: { title: '首页' } },
        { path: 'articles', name: 'article-list', component: () => import('@/views/ArticleList.vue'), meta: { title: '文章列表' } },
        { path: 'article/:id', name: 'article-detail', component: () => import('@/views/ArticleDetail.vue'), meta: { title: '文章详情' } },
        { path: 'projects', name: 'project-list', component: () => import('@/views/ProjectList.vue'), meta: { title: '项目展示' } },
        { path: 'project/:id', name: 'project-detail', component: () => import('@/views/ProjectDetail.vue'), meta: { title: '项目详情' } },
        { path: 'about', name: 'about', component: () => import('@/views/About.vue'), meta: { title: '关于我' } },
        { path: 'search', name: 'search', component: () => import('@/views/Search.vue'), meta: { title: '搜索' } }
      ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

router.afterEach((to) => {
  const base = '个人技术博客'
  document.title = to.meta.title ? `${String(to.meta.title)} - ${base}` : base
})

export default router
