# CLAUDE.md

このファイルは、このリポジトリで作業する Claude Code 向けのガイドです。

## プロジェクト概要

`create-next-app` で作成した Next.js (App Router) のアプリケーションです。

- Next.js 16.4.0 / React 19.3.0 / TypeScript 5(`strict` 有効)
- スタイリング: Tailwind CSS 4(`@tailwindcss/turbopack` 経由)
- Lint: ESLint 9(`eslint-config-next`)
- パッケージマネージャー: npm(`package-lock.json` あり)

## コマンド

```bash
npm run dev     # 開発サーバー起動 (http://localhost:3000)。Docker で起動済みのため Claude は実行しない
npm run build   # 本番ビルド
npm run start   # 本番サーバー起動(要 build)
npm run lint    # ESLint 実行
```

テストランナーは未導入です。

## ディレクトリ構成

- `app/` — App Router のルート。`layout.tsx`(ルートレイアウト)、`page.tsx`(トップページ)、`globals.css`
- `public/` — 静的ファイル
- `next.config.ts` — Next.js 設定。`cacheComponents` と `partialPrefetching` を有効化、CSS は Turbopack の `@tailwindcss/turbopack` ローダーで処理
- `tsconfig.json` — パスエイリアス `@/*` はプロジェクトルートを指す(例: `@/app/...`)

## 開発時の注意

- アプリは Docker で起動済みのため、`npm run dev` は実行しない。
- git コマンドは実行しない。
- 作業の最後に、変更したファイルを一覧で表示する。

- `cacheComponents` が有効なため、キャッシュと動的レンダリングの扱いに注意する。実装前に `node_modules/next/dist/docs/` などで該当バージョンのドキュメントを確認すること(Next.js 16 は以前のバージョンから挙動が変わっている可能性がある)。
- 型は `strict` で検査される。`any` を避け、`npx tsc --noEmit` で型エラーがないことを確認する。
- 変更後は `npm run lint` を通す。
- `.next/`、`node_modules/`、`tsconfig.tsbuildinfo` は生成物なので編集しない。

## 機密情報

- `.env` には秘密情報が含まれる可能性があり、`.claude/settings.json` の権限設定で Claude からの読み取りは拒否されている。内容の読み取りや出力、コミットをしない。
- 環境変数が必要な場合は、変数名のみを案内し、値はユーザーに設定してもらう。

## 言語

- ユーザーとのやり取り、コミットメッセージ、コメント、ドキュメントは日本語で書く。
