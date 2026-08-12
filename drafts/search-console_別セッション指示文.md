# Google Search Console 登録 — ブラウザ操作セッション用の指示文（2026-08-12作成）

darariがブラウザ操作用の別Claude Codeセッションに貼る指示文。Cloudflare接続のときと同じ方式。

---

Google Search Console の登録作業をお願いします。ブラウザ操作（playwright MCP）で進めてください。
ぼく（darari）が横にいるので、ログイン画面が出たら一旦止めて、ぼくに操作を渡してください。
パスワード・認証コードは絶対にチャットに書かせないでください。

## 背景
- 静的サイト「AIカイゼン」を https://darari-nu.com で公開済み（Cloudflare Pages。DNSはCloudflareで管理）
- sitemapは https://darari-nu.com/sitemap-index.xml に生成済み（robots.txtにも記載済み）
- 目的: Search Consoleに「ドメイン」プロパティを登録し、sitemapを送信する

## やること（この順番で）

### Phase A: プロパティ登録
1. https://search.google.com/search-console を開く → Googleログインはぼくがやる
2. 「プロパティを追加」→ 種類は「**ドメイン**」を選び、darari-nu.com を入力
   （URLプレフィックス型ではなくドメイン型。wwwや将来のサブドメインまで一括計測できるため）
3. 所有権確認用のTXTレコード（google-site-verification=… という文字列）が表示されたらコピーして控える

### Phase B: CloudflareのDNSにTXTを1行追加
4. 新しいタブで https://dash.cloudflare.com → ログインはぼく
5. darari-nu.com → DNS → Add record: **Type=TXT / Name=@ / Content=（手順3の値）/ TTL=Auto**
6. Search Consoleのタブに戻って「確認」を押す。失敗したら数分待って再試行（DNSの反映待ち。最大で数十分）

### Phase C: sitemap送信と仕上げ
7. 所有権確認が通ったら、左メニュー「サイトマップ」→ `https://darari-nu.com/sitemap-index.xml` を入力して送信 → ステータスが「成功しました」になるのを確認
8. 完了報告として次を教えて: ①所有権確認OKの画面 ②sitemap送信のステータス ③詰まった箇所

## 注意
- Cloudflareの既存DNSレコードは消さない・編集しない（TXTを1行**足すだけ**）
- 登録直後は「データを処理しています」表示が数日続くのが正常。何も出なくても焦らない
