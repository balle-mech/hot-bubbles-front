<script lang="ts" setup>
import { defineProps } from 'vue'

const props = defineProps({
  result: Object,
  size: String,
})
</script>

<template>
  <div :class="['news-item', size]">
    <a :href="result.source_url">{{ result.title }}</a>
  </div>
</template>

<style scoped>
.news-item {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 95%;
  height: 100%;
  align-content: center;
}

.news-item.large {
  font-size: 1.5rem;
  background-color: #f8d7da;
}

.news-item.medium {
  font-size: 1.25rem;
  background-color: #fff3cd;
}

.news-item.small {
  font-size: 1rem;
  background-color: #d4edda;
}
</style>
