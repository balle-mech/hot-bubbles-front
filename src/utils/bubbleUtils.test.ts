import { describe, it, expect } from 'vitest'
import { calculateRadius, calculateFontSize, calculateNormalized } from './bubbleUtils'

describe('calculateNormalized', () => {
  it('最初の記事（最人気）は1を返す', () => {
    expect(calculateNormalized(0, 10)).toBe(1)
  })

  it('最後の記事（最低人気）は0を返す', () => {
    expect(calculateNormalized(9, 10)).toBe(0)
  })

  it('中間の記事は0〜1の値を返す', () => {
    const result = calculateNormalized(4, 10)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(1)
  })

  it('記事が1件のときは1を返す', () => {
    expect(calculateNormalized(0, 1)).toBe(1)
  })
})

describe('calculateRadius', () => {
  it('normalized=1のとき最大radius(140)を返す', () => {
    expect(calculateRadius(1)).toBe(140)
  })

  it('normalized=0のとき最小radius(40)を返す', () => {
    expect(calculateRadius(0)).toBe(40)
  })

  it('normalized=0.5のとき中間値(90)を返す', () => {
    expect(calculateRadius(0.5)).toBe(90)
  })
})

describe('calculateFontSize', () => {
  it('normalized=1のとき最大fontSize(18)を返す', () => {
    expect(calculateFontSize(1)).toBe(18)
  })

  it('normalized=0のとき最小fontSize(10)を返す', () => {
    expect(calculateFontSize(0)).toBe(10)
  })

  it('normalized=0.5のとき中間値(14)を返す', () => {
    expect(calculateFontSize(0.5)).toBe(14)
  })
})
