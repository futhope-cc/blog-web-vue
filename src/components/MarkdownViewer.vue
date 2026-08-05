<template>
  <div class="prose-blog" v-html="html"></div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { renderMarkdownWithAnchors, type TocItem } from '@/utils/markdown'

const props = defineProps<{ content: string }>()
const emit = defineEmits<{ (e: 'toc', toc: TocItem[]): void }>()

const html = ref(renderMarkdownWithAnchors(props.content).html)

watch(
  () => props.content,
  (content) => {
    const { html: rendered, toc } = renderMarkdownWithAnchors(content)
    html.value = rendered
    emit('toc', toc)
  },
  { immediate: true }
)
</script>
