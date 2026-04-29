import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import NewsMap from './NewsMap'

vi.mock('axios')
const mockedAxios = vi.mocked(axios)

const mockArticles = [
  {
    title: '最も人気のニュース',
    url: 'https://example.com/1',
    source: { name: 'Source A' },
    description: '説明1',
    publishedAt: '2026-03-30T00:00:00Z',
  },
  {
    title: '2番目のニュース',
    url: 'https://example.com/2',
    source: { name: 'Source B' },
    description: '説明2',
    publishedAt: '2026-03-30T00:00:00Z',
  },
  {
    title: '3番目のニュース',
    url: 'https://example.com/3',
    source: { name: 'Source C' },
    description: '説明3',
    publishedAt: '2026-03-30T00:00:00Z',
  },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('NewsMap', () => {
  it('ローディング中はローディングメッセージを表示する', () => {
    mockedAxios.get = vi.fn().mockReturnValue(new Promise(() => {})) // 永遠に解決しない
    render(<NewsMap />)
    expect(screen.getByText('ニュースを読み込み中...')).toBeInTheDocument()
  })

  it('API成功時に記事タイトルを表示する', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: { articles: mockArticles } })
    render(<NewsMap />)
    await waitFor(() => {
      expect(screen.getByText('最も人気のニュース')).toBeInTheDocument()
      expect(screen.getByText('2番目のニュース')).toBeInTheDocument()
    })
  })

  it('API成功時にソース名を表示する', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: { articles: mockArticles } })
    render(<NewsMap />)
    await waitFor(() => {
      expect(screen.getByText('Source A')).toBeInTheDocument()
    })
  })

  it('記事はリンクとして表示される', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: { articles: mockArticles } })
    render(<NewsMap />)
    await waitFor(() => {
      const link = screen.getByText('最も人気のニュース').closest('a')
      expect(link).toHaveAttribute('href', 'https://example.com/1')
      expect(link).toHaveAttribute('target', '_blank')
    })
  })

  it('APIエラー時はエラーメッセージを表示する', async () => {
    mockedAxios.get = vi.fn().mockRejectedValue({
      response: { data: { message: 'API rate limit exceeded' } },
    })
    render(<NewsMap />)
    await waitFor(() => {
      expect(screen.getByText('API rate limit exceeded')).toBeInTheDocument()
    })
  })

  it('エラー時に再読み込みボタンを表示する', async () => {
    mockedAxios.get = vi.fn().mockRejectedValue({ message: 'Network Error' })
    render(<NewsMap />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '再読み込み' })).toBeInTheDocument()
    })
  })

  it('再読み込みボタンクリックで再フェッチする', async () => {
    const user = userEvent.setup()
    mockedAxios.get = vi
      .fn()
      .mockRejectedValueOnce({ message: 'Network Error' })
      .mockResolvedValueOnce({ data: { articles: mockArticles } })

    render(<NewsMap />)
    await waitFor(() => screen.getByRole('button', { name: '再読み込み' }))
    await user.click(screen.getByRole('button', { name: '再読み込み' }))
    await waitFor(() => {
      expect(screen.getByText('最も人気のニュース')).toBeInTheDocument()
    })
  })

  it('最初の記事のバブルが最後の記事より大きい', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: { articles: mockArticles } })
    render(<NewsMap />)
    await waitFor(() => {
      const links = screen.getAllByRole('link')
      const firstSize = parseInt(links[0].style.width)
      const lastSize = parseInt(links[links.length - 1].style.width)
      expect(firstSize).toBeGreaterThan(lastSize)
    })
  })
})
