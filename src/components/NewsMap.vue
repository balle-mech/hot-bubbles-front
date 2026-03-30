<script lang="ts" setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import axios from 'axios'
import * as d3Force from 'd3-force'

interface NewsArticle {
  title: string
  url: string
  urlToImage?: string
  description?: string
  source: {
    name: string
  }
  publishedAt: string
}

interface BubbleNode extends d3Force.SimulationNodeDatum {
  id: number
  article: NewsArticle
  radius: number
  color: string
  fontSize: number
  popularity: number
}

const articles = ref<NewsArticle[]>([])
const bubbleNodes = ref<BubbleNode[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const newsApiKey = import.meta.env.VITE_NEWS_API_KEY

let simulation: d3Force.Simulation<BubbleNode, undefined> | null = null

// 物理シミュレーションの初期化
const initSimulation = () => {
  if (bubbleNodes.value.length === 0) return

  const containerWidth = window.innerWidth - 100
  const containerHeight = window.innerHeight - 300

  // 力学シミュレーションを作成
  simulation = d3Force
    .forceSimulation<BubbleNode>(bubbleNodes.value)
    .force('charge', d3Force.forceManyBody().strength(30)) // 互いに反発
    .force('collision', d3Force.forceCollide<BubbleNode>().radius(d => d.radius + 5)) // 衝突検出
    .force('center', d3Force.forceCenter(containerWidth / 2, containerHeight / 2)) // 中心に引き寄せ
    .force('x', d3Force.forceX(containerWidth / 2).strength(0.05)) // X軸方向の弱い力
    .force('y', d3Force.forceY(containerHeight / 2).strength(0.05)) // Y軸方向の弱い力
    .alphaDecay(0.02) // ゆっくり収束
    .on('tick', () => {
      // 各ティックで位置を更新
      bubbleNodes.value = [...bubbleNodes.value]
    })
}

// ニュース記事を取得
const fetchNews = async () => {
  try {
    loading.value = true
    error.value = null

    // News API v2/top-headlines エンドポイントを使用（人気の記事を取得）
    const res = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: 'us', // 国コード (us=アメリカ, jp=日本)
        category: 'general', // カテゴリ (general, business, technology, sports など)
        pageSize: 50, // 取得記事数
        apiKey: newsApiKey
      }
    })

    console.log('API Response:', res.data)
    console.log('Articles count:', res.data.articles?.length)
    console.log('Status:', res.data.status)

    articles.value = res.data.articles || []

    // 泡ノードを作成
    const containerWidth = window.innerWidth - 100
    const containerHeight = window.innerHeight - 300

    bubbleNodes.value = articles.value.map((article, index) => {
      // 人気度を計算
      const popularity = articles.value.length - index
      const maxPopularity = articles.value.length
      const minPopularity = 1
      const normalized = (popularity - minPopularity) / (maxPopularity - minPopularity)

      // 泡のサイズとフォントサイズ
      const radius = 40 + normalized * 100 // 40px ~ 140px
      const fontSize = 10 + normalized * 8

      // ランダムな色
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
        '#F8B739', '#52B788', '#E76F51', '#2A9D8F'
      ]
      const color = colors[Math.floor(Math.random() * colors.length)]

      return {
        id: index,
        article,
        radius,
        fontSize,
        color,
        popularity: Math.round(normalized * 100),
        x: containerWidth / 2 + (Math.random() - 0.5) * 200, // 中心付近からスタート
        y: containerHeight / 2 + (Math.random() - 0.5) * 200
      }
    })

    // シミュレーション開始
    initSimulation()
  } catch (err: any) {
    console.error('Error fetching news:', err)
    console.error('Error response:', err.response)
    console.error('API Key:', newsApiKey ? 'exists' : 'missing')
    error.value = err.response?.data?.message || err.message || 'ニュースの取得に失敗しました'
  } finally {
    loading.value = false
  }
}

// 表示用のスタイルを計算
const styledArticles = computed(() => {
  return bubbleNodes.value.map(node => {
    return {
      article: node.article,
      bubbleSize: `${node.radius * 2}px`,
      fontSize: `${node.fontSize}px`,
      left: `${(node.x || 0) - node.radius}px`,
      top: `${(node.y || 0) - node.radius}px`,
      color: node.color,
      opacity: 0.85,
      popularity: node.popularity
    }
  })
})

onMounted(() => {
  fetchNews()
})

onUnmounted(() => {
  // シミュレーションを停止
  if (simulation) {
    simulation.stop()
  }
})
</script>

<template>
  <div class="news-cloud-container">
    <!-- デバッグ情報 -->
    <div style="position: fixed; top: 100px; right: 10px; background: #f0f0f0; padding: 10px; font-size: 12px; z-index: 1000;">
      <div>Loading: {{ loading }}</div>
      <div>Error: {{ error }}</div>
      <div>Articles: {{ articles.length }}</div>
      <div>API Key: {{ newsApiKey ? 'Set' : 'Not Set' }}</div>
    </div>

    <!-- ローディング表示 -->
    <div v-if="loading" class="loading">
      <p>ニュースを読み込み中...</p>
    </div>

    <!-- エラー表示 -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="fetchNews" class="retry-button">再読み込み</button>
    </div>

    <!-- バブル風ニュース表示（物理シミュレーション） -->
    <div v-else class="news-cloud">
      <a
        v-for="(item, index) in styledArticles"
        :key="index"
        :href="item.article.url"
        target="_blank"
        rel="noopener noreferrer"
        class="news-bubble"
        :style="{
          width: item.bubbleSize,
          height: item.bubbleSize,
          fontSize: item.fontSize,
          left: item.left,
          top: item.top,
          backgroundColor: item.color,
          opacity: item.opacity,
          transform: 'translate(0, 0)' // GPUアクセラレーション
        }"
        :title="item.article.description || item.article.title"
      >
        <div class="bubble-content">
          <div class="bubble-title">{{ item.article.title }}</div>
          <div class="bubble-source">{{ item.article.source.name }}</div>
        </div>
      </a>
    </div>
  </div>
</template>

<style scoped>
.news-cloud-container {
  width: 100%;
  min-height: calc(100vh - 200px);
  position: relative;
  padding: 2rem;
}

.loading, .error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  font-size: 1.2rem;
  color: #666;
}

.error {
  color: #d32f2f;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: #4ECDC4;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background-color: #45B7D1;
}

.news-cloud {
  position: relative;
  width: 100%;
  height: calc(100vh - 250px);
  min-height: 600px;
  overflow: hidden;
}

.news-bubble {
  position: absolute;
  text-decoration: none;
  transition: transform 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease, border-width 0.3s ease;
  cursor: pointer;
  border-radius: 50%; /* 完全な円形 */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 3px solid rgba(255, 255, 255, 0.3);
  will-change: transform;
}

.bubble-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1.5rem;
  width: 100%;
  height: 100%;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.bubble-title {
  font-weight: 700;
  line-height: 1.3;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  margin-bottom: 0.5rem;
}

.bubble-source {
  font-size: 0.7em;
  opacity: 0.9;
  font-weight: 500;
  margin-top: 0.3rem;
}

.news-bubble:hover {
  transform: scale(1.2);
  opacity: 1 !important;
  z-index: 100;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.35);
  border-width: 4px;
}

.news-bubble:hover .bubble-title {
  -webkit-line-clamp: 6;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .news-cloud {
    height: calc(100vh - 200px);
    min-height: 500px;
  }

  .bubble-content {
    padding: 1rem;
  }

  .bubble-title {
    -webkit-line-clamp: 3;
  }
}

/* 初期アニメーション */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 0.85;
    transform: scale(1);
  }
}

.news-cloud > a {
  animation: fadeIn 0.8s ease-out forwards;
}

.news-cloud > a:nth-child(n) {
  animation-delay: calc(var(--index, 0) * 0.03s);
}
</style>
