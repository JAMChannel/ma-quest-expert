# ma-quest-expert

## プロジェクト概要

このプロジェクトは過去問学習アプリです。ユーザーが問題を解き、学習進捗を管理できる機能を提供します。

## 技術スタック

- **フロントエンド**: Next.js、React
- **スタイリング**: TailwindCSS、shadcn/ui
- **データベース**: SQLite with Prisma ORM
- **認証**: Google認証（NextAuth.js/Auth.js）

## 機能

- Google認証によるユーザー管理
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
5. 環境変数の設定（SQLiteを使用するため最小限）
   ```
   NEXTAUTH_SECRET="your-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```
6. データベースマイグレーションの実行
   ```bash
   npx prisma migrate dev --name init
   ```
7. シードデータの投入（オプション）
   ```bash
   npx prisma db seed
   ```
8. DBの内容を確認
   ```bash
   npx prisma studio
   ```
9. DBリセット
   ```bash
   npx prisma migrate reset
   ```

## データモデル

主要なデータモデルは以下の通りです：
- Question: 問題情報
- Choice: 選択肢情報
- User: ユーザー情報
- Attempt: 回答記録
- Account: 認証アカウント情報
- Session: ユーザーセッション情報
- VerificationToken: トークン検証

## 詳細なデータモデル設計

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// 頻出カテゴリを enum で定義
enum Category {
  TAX_RELATED       // 事業承継関連税制等
  LEGAL_RELATED     // 事業承継関連法制等
  ACCOUNTING        // M&A基礎知識・関連会計
  M_AND_A_LEGAL     // M&A関連法制等
}

model Question {
  id               String     @id @default(cuid())
  text             String
  title            String?    // 問題のタイトル（オプション）
  choices          Choice[]
  // 正答の選択肢を参照整合性付きで管理
  correctChoiceId  String?    @unique
  correctChoice    Choice?    @relation("CorrectChoice", fields: [correctChoiceId], references: [id])
  category         Category
  difficulty       Int
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt
  attempts         Attempt[]

  @@index([category])
  @@index([difficulty])
}

model Choice {
  id               String     @id @default(cuid())
  text             String
  order            Int?       // 表示順を管理したい場合に使用
  questionId       String
  question         Question   @relation(fields: [questionId], references: [id], onDelete: Cascade)
  // Question.correctChoice とのリレーション名を一致させる
  correctQuestion  Question?  @relation("CorrectChoice")
}

model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refreshToken       String?
  accessToken        String?
  expiresAt          Int?
  tokenType          String?
  scope              String?
  idToken            String?
  sessionState       String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String     @id @default(cuid())
  name          String?
  email         String?    @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  attempts      Attempt[]
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Attempt {
  id         String   @id @default(cuid())
  userId     String
  questionId String
  answer     String
  isCorrect  Boolean
  createdAt  DateTime @default(now())

  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
}
```

### モデル説明

1. **Question（問題）**:
   - 問題文、カテゴリ、難易度などの情報を格納
   - 選択肢や回答履歴との関連を持つ
   - Question（問題）:
      - id: 一意の識別子
      - text: 問題文
      - title: 問題のタイトル（オプション）
      - choices: 選択肢（Choiceモデルとの関連）
      - correctChoiceId: 正解の選択肢ID（オプション）
      - correctChoice: 正解の選択肢（参照整合性付き、オプション）
      - category: カテゴリ（enum型で定義）
      - difficulty: 難易度
      - createdAt: 作成日時
      - updatedAt: 更新日時
      - attempts: 回答履歴（Attemptモデルとの関連）

2. **Choice（選択肢）**:
   - 各問題に対する選択肢情報
   - 問題との関連を持つ
   - Choice（選択肢）:
     - id: 一意の識別子
     - text: 選択肢のテキスト
     - order: 表示順（オプション）
     - questionId: 関連する問題のID
     - question: 問題（Questionモデルとの関連）
     - correctQuestion: この選択肢が正解である問題（リレーション）

3. **User（ユーザー）**:
   - ユーザー情報の管理
   - 回答履歴との関連を持つ
   - Google認証情報を含む
   - User（ユーザー）:
     - id: 一意の識別子
     - name: ユーザー名（nullable）
     - email: メールアドレス（nullable）
     - emailVerified: メール確認日時
     - image: プロフィール画像URL
     - accounts: 認証アカウント情報
     - sessions: セッション情報
     - createdAt: 作成日時
     - updatedAt: 更新日時
     - attempts: 回答履歴（Attemptモデルとの関連）

4. **Account（アカウント）**:
   - 認証プロバイダー（Google）アカウント情報
   - トークンやプロバイダーIDなどの認証情報を保持
   - Account（アカウント）:
     - id: 一意の識別子
     - userId: ユーザーID
     - type: アカウントタイプ
     - provider: 認証プロバイダー（Google）
     - providerAccountId: プロバイダー側のID
     - refreshToken: 更新トークン
     - accessToken: アクセストークン
     - expiresAt: トークン有効期限
     - その他の認証情報

5. **Session（セッション）**:
   - ユーザーセッション情報
   - Session（セッション）:
     - id: 一意の識別子
     - sessionToken: セッショントークン
     - userId: ユーザーID
     - expires: 有効期限

6. **VerificationToken（検証トークン）**:
   - 各種検証に使用されるトークン情報
   - VerificationToken（検証トークン）:
     - identifier: 識別子
     - token: トークン文字列
     - expires: 有効期限

7. **Attempt（回答記録）**:
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
