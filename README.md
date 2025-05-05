# ma-quest-expert

## プロジェクト概要

このプロジェクトは過去問学習アプリです。ユーザーが問題を解き、学習進捗を管理できる機能を提供します。

## 技術スタック

- **フロントエンド**: Next.js、React
- **スタイリング**: TailwindCSS、shadcn/ui
- **データベース**: PostgreSQL with Prisma ORM

## 機能

- 問題の管理（作成・編集・削除）
- 問題一覧表示と検索機能
- 問題回答機能
- 学習進捗管理
- 苦手分野の特定

## インストール手順

1. リポジトリをクローン
2. 依存関係をインストール
   ```bash
   npm install
   ```
3. shadcn/uiをインストール
   ```bash
   npx shadcn-ui@latest init
   ```
4. Prismaをセットアップ
   ```bash
   npm install prisma @prisma/client
   npx prisma init
   ```
5. PostgreSQLデータベースを設定

## データモデル

主要なデータモデルは以下の通りです：
- Question: 問題情報
- Option: 選択肢情報
- User: ユーザー情報
- Attempt: 回答記録

## 詳細なデータモデル設計

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Question {
  id          String    @id @default(cuid())
  text        String
  options     Option[]
  answer      String
  category    String
  subCategory String?
  difficulty  Int
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  attempts    Attempt[]
}

model Option {
  id         String   @id @default(cuid())
  text       String
  questionId String
  question   Question @relation(fields: [questionId], references: [id])
}

model User {
  id        String    @id @default(cuid())
  name      String
  email     String    @unique
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  attempts  Attempt[]
}

model Attempt {
  id         String   @id @default(cuid())
  userId     String
  questionId String
  answer     String
  isCorrect  Boolean
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id])
  question   Question @relation(fields: [questionId], references: [id])
}
```

### モデル説明

1. **Question（問題）**:
   - 問題文、カテゴリ、難易度などの情報を格納
   - 選択肢や回答履歴との関連を持つ
   - Question（問題）:
      - id: 一意の識別子
      - text: 問題文
      - options: 選択肢（Optionモデルとの関連）
      - answer: 正解
      - category: カテゴリ
      - subCategory: サブカテゴリ（オプション）
      - difficulty: 難易度
      - createdAt: 作成日時
      - updatedAt: 更新日時
      - attempts: 回答履歴（Attemptモデルとの関連）

2. **Option（選択肢）**:
   - 各問題に対する選択肢情報
   - 問題との関連を持つ
   - Option（選択肢）:
    - id: 一意の識別子
    - text: 選択肢のテキスト
    - questionId: 関連する問題のID
    - question: 問題（Questionモデルとの関連）

3. **User（ユーザー）**:
   - ユーザー情報の管理
   - 回答履歴との関連を持つ
   - User（ユーザー）:
    - id: 一意の識別子
    - name: ユーザー名
    - email: メールアドレス
    - createdAt: 作成日時
    - updatedAt: 更新日時
    - attempts: 回答履歴（Attemptモデルとの関連

4. **Attempt（回答記録）**:
   - ユーザーの回答履歴
   - 正誤情報や回答日時を記録
   - ユーザーと問題との関連を持つ
   - Attempt（回答記録）:
    - id: 一意の識別子
    - userId: ユーザーID
    - questionId: 問題ID
    - answer: ユーザーの回答
    - isCorrect: 正誤判定
    - createdAt: 回答日時
    - user: ユーザー（Userモデルとの関連）
    - question: 問題（Questionモデルとの関連）
