# CLAUDE.md

対話は全て日本語で行なってください。
このファイルは、このリポジトリでコードを操作する際にClaude Code (claude.ai/code) にガイダンスを提供します。

## 開発コマンド

- **開発サーバー**: `yarn dev` (高速ビルドのためTurbopackを使用)
- **ビルド**: `yarn build`
- **本番サーバー**: `yarn start`
- **リント**: `yarn lint`
- **Storybook開発**: `yarn storybook`
- **Storybookビルド**: `yarn build-storybook`

## プロジェクト構成

これはApp Routerを使用したNext.js 15アプリケーションです：
- **フレームワーク**: Next.js 15.3.3 with React 19
- **スタイリング**: Tailwind CSS v4 (@tailwindcss/postcssを使用)
- **TypeScript**: 厳格な設定でのフルTypeScriptセットアップ  
- **パッケージマネージャー**: Yarn (注意: yarn.lockを使用、package-lock.jsonではない)
- **フォント**: next/font/googleからGeist SansとGeist Mono
- **画像編集**: fabric.js v6.7.0を使用した画像加工機能
- **コンポーネント開発**: Storybook v9を使用
- **テスト**: Vitest + Playwright

## コーディング規約
- interfaceではなくtypeを使うこと
- ファイルの最後は改行すること

## コンポーネント構造規約

### 単一コンポーネントの場合
ディレクトリ内にコンポーネントが1つだけの場合：
```
ComponentName/
├── ComponentName.tsx    # コンポーネント本体
├── types.ts            # 型定義
└── index.ts            # エクスポート
```

### 複数コンポーネントの場合
ディレクトリ内に複数のコンポーネントがある場合：
```
ComponentGroup/
├── ComponentA/
│   ├── ComponentA.tsx
│   ├── types.ts
│   └── index.ts
├── ComponentB/
│   ├── ComponentB.tsx
│   ├── types.ts
│   └── index.ts
└── index.ts            # 全体のエクスポート
```

### ルール
- 型定義は必ず`types.ts`ファイルに分離する
- 各コンポーネントに`index.ts`を作成してエクスポートを管理
- 複数コンポーネントがある場合のみ、コンポーネント名のディレクトリを作成

## コンポーネント分類

### UIコンポーネント (`src/components/ui/`)
再利用可能な基本UIコンポーネント：
- **Button**: プライマリ・デンジャーバリアント対応
- **Icon**: アイコンコンポーネント群（Frame系アイコン含む）
- **RadioGroup**: ラジオボタン・アイコンラジオボタン
- **SelectImage**: 画像選択コンポーネント
- **Slider**: 値調整用スライダー

### 機能コンポーネント (`src/components/feature/`)
ビジネスロジックを含む機能的コンポーネント：
- **ImageEditor**: fabric.jsを使った画像編集の中核コンポーネント
  - `utils.ts`: fabric.js関連のユーティリティ関数群
  - 高解像度保持・レスポンシブ表示・枠追加・画像保存機能

## React 19 記述規約

このプロジェクトではReact 19の最新記述方式を採用します：
- **ref**: `React.forwardRef`は使用せず、refをpropsとして直接受け取る
- **型定義**: `React.ComponentProps`を使用し、`ComponentPropsWithoutRef`は避ける
- **関数コンポーネント**: `({ ref, ...props }) => { }` の形式でrefを受け取る

## プロジェクト概要
プロジェクトはNext.js App Routerの規約に従います：
- メインアプリケーションコードは `src/app/` に配置
- ページコンポーネントは `src/app/page.tsx`
- ルートレイアウトは `src/app/layout.tsx`
- グローバルスタイルは `src/app/globals.css`

このアプリケーションは画像を加工することができるものです。
流れとしては、
1. 画像の選択・読み込み
2. 画像の加工
3. 画像の保存
となります。

PCでも利用したいですが、基本的にはSPからの利用を想定しています。

## 画像編集機能アーキテクチャ

### 技術スタック
- **fabric.js**: 高解像度Canvas操作・画像加工
- **ファイル処理**: FileReader API + Blob/DataURL
- **レスポンシブ対応**: CSS transform + 動的サイズ調整

### 画像処理フロー
1. **画像選択**: SelectImageコンポーネントでFile選択
2. **Canvas初期化**: fabric.js Canvas作成・高解像度設定
3. **表示最適化**: iPhone SE対応（320×380px最大）
4. **枠追加**: 水平・垂直・四方向の白枠をリアルタイム生成
5. **保存**: 元解像度でPNG出力・自動ダウンロード

### 重要な実装ポイント
- **高解像度保持**: 内部Canvasは元サイズ、表示はCSS変換
- **fabric.js型定義**: `@types/fabric`使用、型互換性に注意
- **レスポンシブCanvas**: `setupCanvas`でupper-canvas/lower-canvas両方調整


## 新しいルールの追加プロセス

ユーザーから今回限りではなく常に対応が必要だと思われる指示を受けた場合：

1. 「これを標準のルールにしますか？」と質問する
2. YESの回答を得た場合、CLAUDE.mdに追加ルールとして記載する
3. 以降は標準ルールとして常に適用する

このプロセスにより、プロジェクトのルールを継続的に改善していきます。
