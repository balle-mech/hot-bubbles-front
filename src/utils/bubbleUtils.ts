// 記事のインデックスを0〜1の正規化された人気スコアに変換する
// index=0が最人気（1を返す）、index=total-1が最低（0を返す）
export const calculateNormalized = (index: number, total: number): number => {
  if (total <= 1) return 1
  return (total - 1 - index) / (total - 1)
}

// 正規化されたスコアをバブルの半径(px)に変換する (40〜140)
export const calculateRadius = (normalized: number): number => {
  return 40 + normalized * 100
}

// 正規化されたスコアをフォントサイズ(px)に変換する (10〜18)
export const calculateFontSize = (normalized: number): number => {
  return 10 + normalized * 8
}
