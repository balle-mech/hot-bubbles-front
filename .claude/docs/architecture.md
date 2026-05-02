---
type: spec
---

# 技術仕様書

## 技術スタック

- **フレームワーク**: React 19 + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **物理シミュレーション**: d3-force
- **ルーティング**: React Router
- **テスト**: Vitest + @testing-library/react

## 開発環境

Dockerコンテナで開発する。ホスト環境への影響を避けるため、ローカルでの`npm install`や直接実行はしない。

- `docker compose up dev` — 開発サーバー起動（ホットリロード、ポート5173）
- `docker compose run --rm build` — ビルド検証

## デプロイ戦略

### ホスティング

GitHub Pages（静的サイトホスティング）。

### 環境構成

| 環境 | トリガー | パス |
|---|---|---|
| ステージング | `develop`ブランチへのマージ | `/staging/` |
| 本番 | `main`ブランチへのマージ | `/{repo-name}/` |

### Viteのbase設定

GitHub Pagesはサブパス配信になるため、ビルド時に`base`を環境ごとに切り替える必要がある。設定は`vite.config.ts`で環境変数を参照して行う。

### ビルド検証方針

`vite dev`では検出されないビルドエラーがあるため、開発中も定期的に`docker compose run --rm build`でビルドを確認する。
