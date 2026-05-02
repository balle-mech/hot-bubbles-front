---
type: rule
---

# リポジトリ構造規約

## ディレクトリ構成の方針

- `src/components/` — UIコンポーネント。テストファイルは同ディレクトリに併置（`*.test.tsx`）
- `src/utils/` — UIに依存しない純粋なロジック。テストファイルを併置（`*.test.ts`）
- `src/test/` — テスト共通設定（`setup.ts` など）
- `.claude/docs/` — 仕様書（プロダクト要求、アーキテクチャ）
- `.claude/rules/` — 開発ルール・規約（本ファイルなど）
- `.claude/steering/active/` — 進行中のステアリングドキュメント
- `.claude/steering/archive/` — 完了済みのステアリングドキュメント

## ファイル命名規則

- コンポーネント: `PascalCase.tsx`（例: `NewsMap.tsx`）
- テスト: `PascalCase.test.tsx` / `camelCase.test.ts`
- ユーティリティ: `camelCase.ts`（例: `bubbleUtils.ts`）
- ステアリングドキュメント: `YYYYMMDD-{task-title}.md`
