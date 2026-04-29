# ステアリングドキュメント: VueからReactへの移行

## 作業の要求内容

### 機能説明
既存のVue 3実装と全く同じ機能をReact + TypeScriptで再実装する。

### 現在の機能（移行対象）
- News API (`/v2/top-headlines`) からニュース記事を取得
- 記事をバブル（円形）UIで表示
- 掲載順（人気度）に応じて泡のサイズを変える（radius: 40px〜140px）
- `d3-force` 物理シミュレーションにより泡同士が反発・重ならない
- ホバー時に泡が拡大（scale 1.2）し、記事タイトルとソース名を表示
- ローディング・エラー・リトライのUI
- フェードインアニメーション

### 受け入れ条件
- Vueの全機能がReactで動作すること
- TDDで実装すること（テストを先に書いてから実装）
- デバッグ用の表示は削除すること
- 既存のVueファイルは削除し、Reactで完全に置き換えること

### 制約事項
- TDDで進める（Red → Green → Refactor）
- テストフレームワーク: Vitest + @testing-library/react
- スタイリング: Tailwind CSS（既存と同様）
- d3-forceは引き続き使用

---

## 変更内容の設計

### 変更コンポーネント

| 対象 | 変更内容 |
|------|---------|
| `package.json` | react, react-dom, @testing-library/react, vitest等を追加。vue関連を削除 |
| `vite.config.ts` | Vue pluginをReact pluginに変更 |
| `src/main.ts` | Vue appをReact rootに変更 |
| `src/App.tsx` | Vue SFCからReact FCに変更 |
| `src/components/NewsMap.tsx` | Vue SFCからReact FCに変更（d3-forceロジックはそのまま） |
| `src/components/NewsMap.test.tsx` | 新規：TDDのテストファイル |

### 実装アプローチ（TDD）

各コンポーネントを以下の順序でTDDで実装する：

1. **NewsMap テスト → 実装**
   - ローディング状態の表示
   - エラー状態の表示とリトライボタン
   - 記事取得後のバブル表示
   - バブルのサイズが人気順に対応しているか

2. **d3-force シミュレーションのロジックテスト → 実装**
   - `calculateRadius` の計算ロジック
   - `calculateFontSize` の計算ロジック

### 影響範囲
- Vueファイルをすべて削除・置き換え
- ルーティングはReact Routerに変更

---

## タスクリスト

- [x] Reactと関連パッケージのインストール、Vueを削除
- [x] vite.config.ts, tsconfig等の設定変更
- [x] `calculateRadius`, `calculateFontSize` のユーティリティテスト → 実装 (10テスト Green)
- [x] `NewsMap` コンポーネントのテスト → 実装 (8テスト Green)
- [x] src/main.tsx, App.tsx の作成、Vueファイル削除
- [x] デバッグ表示の削除
- [x] 動作確認（http://localhost:5173/）

## 結果

- テスト合計: 18テスト全部Green
- ブランチ: feat/migrate-vue-to-react
