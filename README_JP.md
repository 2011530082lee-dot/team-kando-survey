# 感度高いアンケート｜公開版

この版は、回答データをブラウザ内の `window.storage` ではなく Supabase に保存する構成です。
Supabase は公開用の publishable key + RLS を使い、回答者には INSERT のみ許可します。
回答内容の読み取りは公開ページからできないため、管理者は Supabase の Table Editor で確認してください。

## 1. Supabaseを作る
1. https://supabase.com/ で無料プロジェクトを作成
2. SQL Editorを開く
3. `supabase/schema.sql` の内容を貼り付けて実行
4. Project Settings → API Keys から Project URL と Publishable key を確認

※ブラウザに置くのは Publishable key です。Secret key / service_role key は絶対に入れないでください。

## 2. ローカル設定
`.env.example` を `.env.local` にコピーして、以下を設定します。

VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...

## 3. 起動
npm install
npm run dev

## 4. 公開
GitHubへこのフォルダをpushし、VercelでNew Project → GitHubリポジトリを選択 → Deploy。
Vite + ReactはVercelで追加設定なしでデプロイできます。

## 5. 回答を見る
Supabase → Table Editor → `survey_responses` を開くと回答一覧を確認できます。
CSVでの集計が必要なら、このテーブルからエクスポートしてExcel等で分析できます。

## セキュリティ
この公開版では、回答者にSELECT権限を与えていません。したがって、公開URLから他の人の回答は読めません。
管理画面をWeb上に作る場合は、別途管理者認証を入れることを推奨します。
