import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import * as d3Force from 'd3-force'
import { calculateNormalized, calculateRadius, calculateFontSize } from '../utils/bubbleUtils'

interface NewsArticle {
  title: string
  url: string
  urlToImage?: string
  description?: string
  source: { name: string }
  publishedAt: string
}

interface BubbleNode extends d3Force.SimulationNodeDatum {
  id: number
  article: NewsArticle
  radius: number
  color: string
  fontSize: number
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B739', '#52B788', '#E76F51', '#2A9D8F',
]

export default function NewsMap() {
  const [bubbleNodes, setBubbleNodes] = useState<BubbleNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const simulationRef = useRef<d3Force.Simulation<BubbleNode, undefined> | null>(null)

  const fetchNews = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          country: 'us',
          category: 'general',
          pageSize: 50,
          apiKey: import.meta.env.VITE_NEWS_API_KEY,
        },
      })

      const articles: NewsArticle[] = res.data.articles || []
      const total = articles.length
      const containerWidth = window.innerWidth - 100
      const containerHeight = window.innerHeight - 300

      const nodes: BubbleNode[] = articles.map((article, index) => {
        const normalized = calculateNormalized(index, total)
        return {
          id: index,
          article,
          radius: calculateRadius(normalized),
          fontSize: calculateFontSize(normalized),
          color: COLORS[index % COLORS.length],
          x: containerWidth / 2 + (Math.random() - 0.5) * 200,
          y: containerHeight / 2 + (Math.random() - 0.5) * 200,
        }
      })

      // シミュレーション開始
      if (simulationRef.current) simulationRef.current.stop()
      simulationRef.current = d3Force
        .forceSimulation<BubbleNode>(nodes)
        .force('charge', d3Force.forceManyBody().strength(30))
        .force('collision', d3Force.forceCollide<BubbleNode>().radius(d => d.radius + 5))
        .force('center', d3Force.forceCenter(containerWidth / 2, containerHeight / 2))
        .force('x', d3Force.forceX(containerWidth / 2).strength(0.05))
        .force('y', d3Force.forceY(containerHeight / 2).strength(0.05))
        .alphaDecay(0.02)
        .on('tick', () => setBubbleNodes([...nodes]))

      setBubbleNodes(nodes)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      setError(e.response?.data?.message ?? e.message ?? 'ニュースの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
    return () => { simulationRef.current?.stop() }
  }, [])

  if (loading) {
    return (
      <div className="news-cloud-container loading">
        <p>ニュースを読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="news-cloud-container error">
        <p>{error}</p>
        <button onClick={fetchNews} className="retry-button">再読み込み</button>
      </div>
    )
  }

  return (
    <div className="news-cloud-container">
      <div className="news-cloud">
        {bubbleNodes.map((node) => {
          const size = node.radius * 2
          return (
            <a
              key={node.id}
              href={node.article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="news-bubble"
              title={node.article.description ?? node.article.title}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                fontSize: `${node.fontSize}px`,
                left: `${(node.x ?? 0) - node.radius}px`,
                top: `${(node.y ?? 0) - node.radius}px`,
                backgroundColor: node.color,
              }}
            >
              <div className="bubble-content">
                <div className="bubble-title">{node.article.title}</div>
                <div className="bubble-source">{node.article.source.name}</div>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
