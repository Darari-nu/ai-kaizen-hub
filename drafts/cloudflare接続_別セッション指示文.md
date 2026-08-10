# Cloudflare接続 — ブラウザ操作セッション用の指示文（2026-08-10作成）

darariがブラウザ操作用の別Claude Codeセッションに貼る指示文。本文はチャットログ(8/10)と同一。
完了後、darariがメインセッション(たま)に「Cloudflare接続完了」と伝える → Phase C残り(privacy追記・sitemap確認・公開手順書更新)はメイン側が実施。

---

Cloudflare接続の作業をお願いします。ブラウザ操作（playwright MCP）で進めてください。
ぼく（darari）が横にいるので、ログイン画面が出たら一旦止めて、ぼくに操作を渡してください。
パスワード・認証コードは絶対にチャットに書かせないでください。

## 背景
- 静的サイト「AIカイゼン」(Astro製) を Cloudflare Pages で公開し、独自ドメイン darari-nu.com を接続する
- ソース: GitHub Darari-nu/ai-kaizen-hub (Public・mainブランチ・push済み)
- Astro側の設定は完了済み (site=https://darari-nu.com, base=/, output=dist)。リポは触らないこと
- ドメイン darari-nu.com は Xserver で取得済み。現在メールは未使用（将来使いたい→後述の注意）

## やること（この順番で）

### Phase A: Pages接続と仮公開
1. https://dash.cloudflare.com を開く→ログインはぼくがやる（アカウントが無ければ無料プランで作成もぼくがやる）
2. Workers & Pages → Create → Pagesタブ → Connect to Git
3. GitHub連携の許可画面が出たらぼくに渡す → リポ Darari-nu/ai-kaizen-hub を選択
4. ビルド設定（正確に）: Framework preset=Astro / Build command=npm run build / Build output directory=dist
5. Save and Deploy → ビルド完了を待つ → 発行された https://*.pages.dev を開いて表示確認
   （記事は全部draftなのでトップと/company/だけ見えるのが正常）

### Phase B: darari-nu.com接続
6. ダッシュボード → Add a site → darari-nu.com → Freeプラン
7. 既存DNSレコードの自動スキャン結果が表示されたら、**全レコードをスクショ保存してから**続行
   （将来メールを使うときの控え。消さない・編集しない）
8. 表示されたネームサーバー2つ（*.ns.cloudflare.com）を控える
9. 新しいタブで Xserverアカウント管理画面を開く→ログインはぼく → ドメイン設定 → darari-nu.com のネームサーバーを Cloudflare の2つに変更
10. Cloudflare側がActiveになるまで待機（数分〜。長ければ一旦ここで中断してよい。その場合は再開手順を教えて）
11. Workers & Pages → 作ったプロジェクト → Custom domains → darari-nu.com を追加 → 続けて www.darari-nu.com も追加
12. https://darari-nu.com がHTTPSで表示されることを確認

### Phase C: 仕上げ
13. Pagesプロジェクト → Metrics → Web Analytics を有効化
14. 完了報告として次を教えて: ①pages.devのURL ②カスタムドメインのステータス ③スキャンでコピーされたDNSレコードの一覧（スクショ）④詰まった箇所

## 注意
- 既存DNSレコードは削除・変更しない（追加されるのはPages用のCNAMEのみ、それもCloudflareが自動でやる）
- メールは現在未使用なので、MX関連の警告が出ても「後で設定する」でスキップしてよい。
  将来メールを使うときは (a)Cloudflare Email Routing(無料転送) か (b)XserverメールのMXをCloudflareのDNSに書く、のどちらでも可能。今日は何もしない
- 課金が発生する選択肢（有料プラン、アドオン）は全部選ばない。すべて無料枠で完結する
- Xserver側でネームサーバー変更が見つからない・確認画面が想定と違うときは、推測で進めずスクショを撮って一旦停止
