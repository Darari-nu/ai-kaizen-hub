最終更新: 2026-08-15
収録者: Opus / 規約: ../00_収録規約.md
⬛非公開: 81件 ／ 🔴宿題: 1件 ／ 🟠本人待ち: 1件
（数え方: 本文の表の行に付いた印を数えた実測値。`grep -E '^\|' | grep -c '⬛非公開'` で再現できる）

---

# 社内向けチャットボット / 社内FAQボット SaaS の公開価格

**収録目的**: Brain教材で使う「SaaS実費 月7万円＋初期20万円」（darari本人の社内ヒアリング値）の
公開価格による裏取り。

## 読む前の注意（収録者からの事実注記）

- 本ファイルの「月額」「初期費用」は、**実際にfetch/ブラウザで開いたページ本文に書かれていた数値のみ**。
- 各社の**提供会社名**は、料金ページ本文からの確認ではなく検索結果・比較サイト由来のものが多い。
  一次で確認できていないものは `（二次のみ）` を付けた。
- 日本のBtoB SaaSは料金非公開が多く、**本調査でも「価格ページに金額の記載なし」が多数**。
  それ自体を事実として記録している。

---

## 1. OfficeBot（ネオス株式会社（二次のみ））

| 項目 | 値 | 一次/二次 | 出典URL（実際に開いたページ） | 取得日 |
|---|---|---|---|---|
| 公開/要問い合わせ | **要問い合わせ（サイト上に価格の掲載なし）** | 一次 | https://officebot.jp/document-form/ | 2026-08-15 |
| 月額（最小プラン） | ⬛非公開（公式サイトに金額の記載なし。グローバルナビの「料金」リンクは資料請求フォーム https://officebot.jp/document-form/ に遷移する） | 一次 | https://officebot.jp/document-form/ | 2026-08-15 |
| 初期費用 | ⬛非公開（同上・記載なし） | 一次 | https://officebot.jp/document-form/ | 2026-08-15 |
| 最低契約期間 | ⬛非公開（記載なし） | 一次 | https://officebot.jp/document-form/ | 2026-08-15 |
| 無料トライアル | ⬛非公開（記載なし） | 一次 | https://officebot.jp/document-form/ | 2026-08-15 |
| 課金単位 | ⬛非公開（記載なし） | 一次 | https://officebot.jp/document-form/ | 2026-08-15 |

補足（事実のみ）:
- 資料請求ページのリード文に「リーズナブルな料金プラン」が**資料でわかること**として列挙されている（＝価格は資料内）。
- `officebot.jp` はWebFetch（HTTPクライアント）に対し403を返す。ブラウザ経由で閲覧して確認した。
  2026-08-15 追試: ブラウザUA付きcurlでは200が返る（403はUA判定によるbot遮断）。
  料金ページのURL候補 `/price/` `/pricing/` `/plan/` `/ryokin/` `/fee/` `/cost/` は**すべて404**、
  `sitemap.xml` の下位サイトマップ（misc / externals / seminar / case / interview / info）にも料金ページは存在しない。
  → 「料金ページが取れていない」のではなく「料金ページが存在しない」ことを確認した（⬛非公開の裏取り）。
- 二次情報（比較サイト・検索結果）でのOfficeBot価格は **「初期10万円／月額5万円〜」「初期35万円／月額15万円」「Essentials ¥3,000/月」** と
  **3系統に割れており、いずれも採用しない**（⬛非公開）。

---

## 2. HiTTO（社内向けAIチャットボット）

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| 公開/要問い合わせ | **要問い合わせ（金額の掲載なし）** | 一次 | https://hitto.jp/price/ | 2026-08-15 |
| 月額（最小プラン） | ⬛非公開（料金ページに金額の記載なし・要問い合わせ） | 一次 | https://hitto.jp/price/ | 2026-08-15 |
| 初期費用 | **「導入の初期費用はございません」** | 一次 | https://hitto.jp/price/ | 2026-08-15 |
| 最低契約期間 | ⬛非公開（記載なし） | 一次 | https://hitto.jp/price/ | 2026-08-15 |
| 無料トライアル | ⬛非公開（記載なし） | 一次 | https://hitto.jp/price/ | 2026-08-15 |
| 課金単位 | **利用者数に応じた月額課金**（「質問の数による課金はありません」「回答の数による課金はありません」と明記） | 一次 | https://hitto.jp/price/ | 2026-08-15 |
| 提供会社 | **株式会社マネーフォワード**（料金ページのフッターに社名・所在地「東京都港区芝浦3-1-21 田町ステーションタワーS 21F」、コピーライト表記 ©Money Forward, Inc.） | 一次 | https://hitto.jp/price/ | 2026-08-15 |

---

## 3. sAI Chat（株式会社サイシード（二次のみ））

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| 公開/要問い合わせ | **要問い合わせ（プラン名のみ公開、金額は非公開）** | 一次 | https://saichat.jp/saichat-price/ | 2026-08-15 |
| プラン構成 | Starter / Standard / DX の3プラン。料金は「初期費用＋月額費用」の構成と明記 | 一次 | https://saichat.jp/saichat-price/ | 2026-08-15 |
| 月額（最小プラン） | ⬛非公開（金額の記載なし・見積依頼案内） | 一次 | https://saichat.jp/saichat-price/ | 2026-08-15 |
| 初期費用 | ⬛非公開（金額の記載なし） | 一次 | https://saichat.jp/saichat-price/ | 2026-08-15 |
| 最低契約期間 | ⬛非公開（記載なし） | 一次 | https://saichat.jp/saichat-price/ | 2026-08-15 |
| 無料トライアル | ⬛非公開（記載なし） | 一次 | https://saichat.jp/saichat-price/ | 2026-08-15 |

補足: 二次（比較サイト）には「Starter 月額80,000円／初期300,000円」等の数値があるが、
一次で確認できないため**採用しない**。

---

## 4. PKSHA ChatAgent（旧 PKSHA Chatbot）

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| 公開/要問い合わせ | **要問い合わせ（製品ページに価格の記載なし）** | 一次 | https://aisaas.pkshatech.com/chatbot/ | 2026-08-15 |
| 月額（最小プラン） | ⬛非公開（記載なし） | 一次 | https://aisaas.pkshatech.com/chatbot/ | 2026-08-15 |
| 初期費用 | ⬛非公開（記載なし） | 一次 | https://aisaas.pkshatech.com/chatbot/ | 2026-08-15 |
| 最低契約期間 | ⬛非公開（記載なし） | 一次 | https://aisaas.pkshatech.com/chatbot/ | 2026-08-15 |
| 無料トライアル | ⬛非公開（記載なし） | 一次 | https://aisaas.pkshatech.com/chatbot/ | 2026-08-15 |
| 料金ページの存在 | ⬛非公開（**料金ページが存在しない**）。製品ページの全リンクを抽出しても price/plan/料金 系のリンクなし。`sitemap.xml`（全件）を走査しても料金ページはヒットせず、価格に触れるURLはコラム記事 `/cx-journal/article/chatbot-cost` 等のみ | 一次 | https://aisaas.pkshatech.com/sitemap.xml | 2026-08-15 |

---

## 5. KARAKURI chatbot（カラクリ株式会社（二次のみ））

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| 公開/要問い合わせ | **要問い合わせ（製品ページに価格・初期費用・最低契約期間・無料トライアルの記述なし）** | 一次 | https://karakuri.ai/service/cs/chatbot | 2026-08-15 |
| 月額（最小プラン） | ⬛非公開（記載なし） | 一次 | https://karakuri.ai/service/cs/chatbot | 2026-08-15 |
| 初期費用 | ⬛非公開（記載なし） | 一次 | https://karakuri.ai/service/cs/chatbot | 2026-08-15 |
| 最低契約期間 | ⬛非公開（記載なし） | 一次 | https://karakuri.ai/service/cs/chatbot | 2026-08-15 |
| 無料トライアル | ⬛非公開（記載なし） | 一次 | https://karakuri.ai/service/cs/chatbot | 2026-08-15 |

---

## 6. Helpfeel

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| 公開/要問い合わせ | **要問い合わせ（料金ページに金額の掲載なし）** | 一次 | https://www.helpfeel.com/pricing | 2026-08-15 |
| 料金の構成 | 「基本料金」＋「オプション料金」の2本立て。金額は利用内容・記事ページ数で変動と記載 | 一次 | https://www.helpfeel.com/pricing | 2026-08-15 |
| 月額（最小プラン） | ⬛非公開（金額の記載なし） | 一次 | https://www.helpfeel.com/pricing | 2026-08-15 |
| 初期費用 | ⬛非公開（金額の記載なし） | 一次 | https://www.helpfeel.com/pricing | 2026-08-15 |
| 最低契約期間 | ⬛非公開（記載なし） | 一次 | https://www.helpfeel.com/pricing | 2026-08-15 |
| 無料トライアル | ⬛非公開（記載なし） | 一次 | https://www.helpfeel.com/pricing | 2026-08-15 |

---

## 7. RICOH Chatbot Service（リコー） 🟢価格公開

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| 公開/要問い合わせ | **公開**（ENTERPRISEのみ個別見積） | 一次 | https://promo.digital.ricoh.com/chatbot/price/ | 2026-08-15 |
| 月額 STARTER | **18,000円（税抜）** | 一次 | https://promo.digital.ricoh.com/chatbot/price/ | 2026-08-15 |
| 月額 STANDARD | **50,000円〜（税抜）** | 一次 | https://promo.digital.ricoh.com/chatbot/price/ | 2026-08-15 |
| 月額 ENTERPRISE | 個別見積 | 一次 | https://promo.digital.ricoh.com/chatbot/price/ | 2026-08-15 |
| 初期費用 | **5,000円**（STARTER / STANDARD） | 一次 | https://promo.digital.ricoh.com/chatbot/price/ | 2026-08-15 |
| 初期費用 ENTERPRISE | ⬛非公開（記載なし） | 一次 | https://promo.digital.ricoh.com/chatbot/price/ | 2026-08-15 |
| 最低契約期間 | ⬛非公開（記載なし） | 一次 | https://promo.digital.ricoh.com/chatbot/price/ | 2026-08-15 |
| 無料トライアル | **あり（30日間）** | 一次 | https://promo.digital.ricoh.com/chatbot/price/ | 2026-08-15 |
| 課金単位 | **ユーザー課金なし**（サイト/契約単位） | 一次 | https://promo.digital.ricoh.com/chatbot/price/ | 2026-08-15 |
| 税込表記 | ⬛非公開（税込金額の記載なし） | 一次 | https://promo.digital.ricoh.com/chatbot/price/ | 2026-08-15 |

---

## 8. ChatPlus（チャットプラス） 🟢価格公開

※社内向け専用ではなくWeb接客/問い合わせ全般だが、AIチャットボットプランを持つため比較対象として収録。

| プラン | 月額（月契約・税抜） | 月額（年契約・税抜） | 初期費用 |
|---|---|---|---|
| ミニマム | **1,980円/月** | **1,500円/月** | **0円** |
| ビジネスライト | **10,800円/月** | **9,800円/月** | **0円** |
| プレミアム | **30,000円/月** | **28,000円/月** | **0円** |
| AIライト | **54,000円/月** | **50,000円/月** | **0円** |
| オートAI | **88,000円〜/月** | **80,000円〜/月** | **0円** |

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| 公開/要問い合わせ | **公開** | 一次 | https://chatplus.jp/chat/plan/ | 2026-08-15 |
| 上記プラン表 | 上記のとおり（すべて税抜） | 一次 | https://chatplus.jp/chat/plan/ | 2026-08-15 |
| 無料トライアル | **あり（10日間）** | 一次 | https://chatplus.jp/chat/plan/ | 2026-08-15 |
| 最低契約期間 | ⬛非公開（明記なし。年契約/月契約の別のみ） | 一次 | https://chatplus.jp/chat/plan/ | 2026-08-15 |
| 課金単位 | サイト数による課金（ユーザー課金ではない） | 一次 | https://chatplus.jp/chat/plan/ | 2026-08-15 |
| 「AIチャットボットプラン 月額150,000円」 | ⬛非公開（**不採用**）。プラン表（`/chat/plan/`）と、旧「AIチャットボット」の**後継製品**「AI Agent Plus」の製品ページ（`/service/aiagentplus/`）の両方を開いたが、150,000円という数値はどちらにも存在しない | 一次 | https://chatplus.jp/service/aiagentplus/ | 2026-08-15 |

### 8-2. ChatPlus「AI Agent Plus（旧 AIチャットボット）」（2026-08-15 追加取得）

ページ見出しは「AI AgentPlus(旧AIチャットボット)は、初期費用0円・月額制でご利用いただけるサービスです」。
**「月額利用料」という見出しはあるが、その金額が本文に書かれていない**（初期費用の「0円」だけが数値として掲載されている）。

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| 初期費用 | **0円** | 一次 | https://chatplus.jp/service/aiagentplus/ | 2026-08-15 |
| 月額利用料（本体） | ⬛非公開（見出しのみで金額の記載なし。ページタイトルは「月額1,500円～」表記） | 一次 | https://chatplus.jp/service/aiagentplus/ | 2026-08-15 |
| 標準に含まれるアカウント数 | **5ID** | 一次 | https://chatplus.jp/service/aiagentplus/ | 2026-08-15 |
| 標準に含まれるサイト数 | **1サイト**（検証環境は1サイトに付帯） | 一次 | https://chatplus.jp/service/aiagentplus/ | 2026-08-15 |
| オプション 追加オペレーター（〜5ID） | **2,500円/月・人** | 一次 | https://chatplus.jp/service/aiagentplus/ | 2026-08-15 |
| オプション 追加オペレーター（6〜45ID） | **3,500円/月・人** | 一次 | https://chatplus.jp/service/aiagentplus/ | 2026-08-15 |
| オプション 追加オペレーター（46ID以上） | 別途お見積り | 一次 | https://chatplus.jp/service/aiagentplus/ | 2026-08-15 |
| オプション LINE連携 | **10,000円〜/月** | 一次 | https://chatplus.jp/service/aiagentplus/ | 2026-08-15 |
| オプション Salesforce連携 | **10,000円〜/月** | 一次 | https://chatplus.jp/service/aiagentplus/ | 2026-08-15 |
| 税表記 | **「※金額は全て税抜き価格です」と明記** | 一次 | https://chatplus.jp/service/aiagentplus/ | 2026-08-15 |
| 追加エージェント | 応相談（金額の記載なし） | 一次 | https://chatplus.jp/service/aiagentplus/ | 2026-08-15 |

同ページに、比較用として「（他社の）初期費用 数百万円〜」という記述がある（ChatPlus自身の価格ではない）。

---

## 9. sinclo（シンクロ） 🟢価格一部公開

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| 公開/要問い合わせ | **月額のみ公開**（初期費用は資料請求） | 一次 | https://chat.sinclo.jp/price/ | 2026-08-15 |
| 月額 コスト重視プラン | **10,000円〜** | 一次 | https://chat.sinclo.jp/price/ | 2026-08-15 |
| 月額 成果重視プラン | **50,000円〜** | 一次 | https://chat.sinclo.jp/price/ | 2026-08-15 |
| 税抜/税込 | ⬛非公開（記載なし） | 一次 | https://chat.sinclo.jp/price/ | 2026-08-15 |
| 初期費用 | ⬛非公開（金額の記載なし。「詳しい料金はサービス紹介資料に記載」） | 一次 | https://chat.sinclo.jp/price/ | 2026-08-15 |
| 最低契約期間 | ⬛非公開（記載なし） | 一次 | https://chat.sinclo.jp/price/ | 2026-08-15 |
| 無料トライアル | **あり（14日間）** | 一次 | https://chat.sinclo.jp/price/ | 2026-08-15 |
| 課金単位 | ⬛非公開（記載なし） | 一次 | https://chat.sinclo.jp/price/ | 2026-08-15 |

---

## 10. AI-FAQボット（株式会社L is B） 🟢価格公開

課金単位は**QA数**（ユーザー数課金ではない）。金額はすべて**税別**と明記。

| QA数 | 月額（税別） |
|---|---|
| 1〜100問 | **30,000円** |
| 101〜200問 | **40,000円** |
| 201〜300問 | **50,000円** |
| 301〜400問 | **60,000円** |
| 401〜500問 | **70,000円** |
| 501〜600問 | **80,000円** |
| 601〜700問 | **90,000円** |
| 701〜800問 | **100,000円** |
| 801〜900問 | **110,000円** |
| 901〜1,000問 | **120,000円** |
| 1,001問以上 | 要問い合わせ |

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| 公開/要問い合わせ | **公開** | 一次 | https://faq-bot.ai/ja/plan/ | 2026-08-15 |
| 初期費用 | ⬛非公開（料金ページに記載なし。二次では「0円」とあるが一次未確認） | 一次 | https://faq-bot.ai/ja/plan/ | 2026-08-15 |
| 最低契約期間 | ⬛非公開（記載なし） | 一次 | https://faq-bot.ai/ja/plan/ | 2026-08-15 |
| 無料トライアル | **あり（30日間 / QA数100問まで）** | 一次 | https://faq-bot.ai/ja/plan/ | 2026-08-15 |
| 年間一括払い | 「10か月分」相当の割引ありと記載 | 一次 | https://faq-bot.ai/ja/plan/ | 2026-08-15 |

---

## 11. ChatSense（株式会社ナレッジセンス（二次のみ）） 🟢価格公開

※社内FAQ専用ではなく法人向けChatGPT/RAG。社内問い合わせ用途の対極（従量・低単価）として収録。

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| 公開/要問い合わせ | **公開**（エンタープライズのみ見積） | 一次 | https://chatsense.jp/ | 2026-08-15 |
| スターター | **月額0円 / 初期費用0円**（チーム合計30回/月まで、クレカ不要） | 一次 | https://chatsense.jp/ | 2026-08-15 |
| ビジネス 月額 | **980円〜/人/月** | 一次 | https://chatsense.jp/ | 2026-08-15 |
| ビジネス 初期費用 | **0円** | 一次 | https://chatsense.jp/ | 2026-08-15 |
| 従量超過 | GPT-5.4 mini: 100万トークン/月まで定額、以降 **1円/千トークン**／GPT-5.5: 10万トークン/月まで定額、以降 **4円/千トークン** | 一次 | https://chatsense.jp/ | 2026-08-15 |
| エンタープライズ | 月額・初期費用ともに「お見積り」 | 一次 | https://chatsense.jp/ | 2026-08-15 |
| 最低契約期間 | **なし**（ビジネスプランの説明に「最低利用期間・最低利用人数なし」と明記） | 一次 | https://chatsense.jp/ | 2026-08-15 |
| 最低利用人数 | **1人〜**（比較表内） | 一次 | https://chatsense.jp/ | 2026-08-15 |
| 無料トライアル | **あり**（クレジットカード登録不要） | 一次 | https://chatsense.jp/ | 2026-08-15 |
| 自動更新 | **あり**（「基本的に全ての有料プランにおいて、支払い契約は自動更新」。無料プランへのダウングレードで解約） | 一次 | https://chatsense.jp/law/terms-of-sale | 2026-08-15 |
| 返金 | 不可（「購入確定後のキャンセル・返金についてはお受けできません」） | 一次 | https://chatsense.jp/law/terms-of-sale | 2026-08-15 |
| 税抜/税込 | ⬛非公開（トップページの料金表・特定商取引法に基づく表記のいずれにも税の別の記載なし。特商法ページの販売価格欄は「サービスページ等の料金表にて、プラン毎に表示される金額」とだけ書かれている） | 一次 | https://chatsense.jp/law/terms-of-sale | 2026-08-15 |

---

## 12. exaBase 生成AI（株式会社エクサウィザーズ）

※2026-08-15時点の公式サイト上の製品名は「**エクサベース AI**」（`exawizards.com/exabase/gpt/`）。
価格改訂のお知らせ（2025-06-30付）では「exaBase 生成AI」表記。

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| 基本料金 | **900円 / 1ID**（価格改訂のお知らせ内「※基本料金の価格はこれまで通り、900円/1IDとなります。」） | 一次 | https://exawizards.com/archives/30467/ | 2026-08-15 |
| 課金期間の単位（900円/1IDが月額か否か） | ⬛非公開（お知らせページにも製品ページにもFAQにも「900円/1ID」の期間単位の明記なし。**別事実として**、FAQに「契約形態：月額制および従量課金制をご用意しています」とあるが、900円/1IDと結び付けた記述ではないため、月額と断定できない） | 一次 | https://exawizards.com/exabase/gpt/faq/ | 2026-08-15 |
| 契約形態 | **「月額制および従量課金制をご用意しています」**（FAQ。続けて「詳しい料金については、サービス資料をご覧いただくか、お問い合わせください」） | 一次 | https://exawizards.com/exabase/gpt/faq/ | 2026-08-15 |
| 従量料金 | Premium 約30%引き／Standard 約10%引き／Economy 変更なし（2025年7月適用の改訂内容。改訂後の実額の記載なし） | 一次 | https://exawizards.com/archives/30467/ | 2026-08-15 |
| 従量料金の実額 | ⬛非公開（改訂率のみ。製品ページ・FAQとも実額なし、資料DL／問い合わせ誘導） | 一次 | https://exawizards.com/exabase/gpt/faq/ | 2026-08-15 |
| 初期費用 | ⬛非公開（製品ページ・FAQとも記載なし） | 一次 | https://exawizards.com/exabase/gpt/faq/ | 2026-08-15 |
| 最低ID数 | ⬛非公開（法人版の製品ページ・FAQとも記載なし） | 一次 | https://exawizards.com/exabase/gpt/faq/ | 2026-08-15 |
| 最低契約期間 | ⬛非公開（記載なし） | 一次 | https://exawizards.com/exabase/gpt/faq/ | 2026-08-15 |
| 無料トライアル | **あり（1週間の無料トライアルプラン）**。申込は問い合わせフォーム経由 | 一次 | https://exawizards.com/exabase/gpt/faq/ | 2026-08-15 |
| 導入までの期間 | 「最短1週間での導入が可能」 | 一次 | https://exawizards.com/exabase/gpt/faq/ | 2026-08-15 |

※FAQの各回答はアコーディオン内でJS描画されるため、ブラウザで全項目を展開して取得した。

### 12-2. エクサベース AI for自治体 🟢価格公開（2026-08-15 追加取得）

**同社製品で唯一、月額の実額が公開されているページ。**（自治体向けであり、法人向けの価格ではない）

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| 月額 | **6.5万円から**（「月額固定料金」「同時アクセス数の上限に応じた固定料金」） | 一次 | https://exawizards.com/exabase/gpt/gov/ | 2026-08-15 |
| 課金単位 | **アカウント発行無制限**（ユーザー課金ではない。同時アクセス数の上限で決まる） | 一次 | https://exawizards.com/exabase/gpt/gov/ | 2026-08-15 |
| ファイルアップロード | 無料・アップロード数の制限なし | 一次 | https://exawizards.com/exabase/gpt/gov/ | 2026-08-15 |
| 税抜/税込 | ⬛非公開（記載なし） | 一次 | https://exawizards.com/exabase/gpt/gov/ | 2026-08-15 |
| 初期費用 | ⬛非公開（記載なし。「料金のお見積もりはお気軽にお問い合わせください」） | 一次 | https://exawizards.com/exabase/gpt/gov/ | 2026-08-15 |
| 最低契約期間 | ⬛非公開（記載なし） | 一次 | https://exawizards.com/exabase/gpt/gov/ | 2026-08-15 |

---

## 13. HRBrain（社内問い合わせ／AI Assistant）

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| 公開/要問い合わせ | **要問い合わせ（金額の記載なし）** | 一次 | https://www.hrbrain.jp/price | 2026-08-15 |
| 課金単位 | 「月額料金制」「ご利用人数に合わせて金額が変動します」 | 一次 | https://www.hrbrain.jp/price | 2026-08-15 |
| 月額（最小プラン） | ⬛非公開（金額の記載なし） | 一次 | https://www.hrbrain.jp/price | 2026-08-15 |
| 初期費用 | ⬛非公開（金額の記載なし） | 一次 | https://www.hrbrain.jp/price | 2026-08-15 |
| 最低契約期間 | ⬛非公開（記載なし） | 一次 | https://www.hrbrain.jp/price | 2026-08-15 |
| 無料トライアル | ⬛非公開（記載なし） | 一次 | https://www.hrbrain.jp/price | 2026-08-15 |

---

## 14. My-ope office（株式会社mofmof（二次のみ））

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| 販売状況 | **「ただいま販売を一時停止させて頂いております。」**（料金表ダウンロードフォームの直下に記載） | 一次 | https://www.my-ope.net/fee/ | 2026-08-15 |
| 公開/要問い合わせ | **料金ページに金額の掲載なし**（料金表はダウンロード形式） | 一次 | https://www.my-ope.net/fee/ | 2026-08-15 |
| プラン構成 | ライト / スタンダード / エンタープライズ | 一次 | https://www.my-ope.net/ | 2026-08-15 |
| 課金の考え方 | 「社員数や会話数で変動しない月額固定」「ユーザー数、QA登録数、トラフィック量などによる追加課金は一切ない」 | 一次 | https://www.my-ope.net/ | 2026-08-15 |
| オプション（外部チャットツール連携） | **初期設定費 4.8万円／月額 3万円** | 一次 | https://www.my-ope.net/ | 2026-08-15 |
| 基本の月額 | ⬛非公開（金額の記載なし） | 一次 | https://www.my-ope.net/fee/ | 2026-08-15 |
| 基本の初期費用 | ⬛非公開（金額の記載なし） | 一次 | https://www.my-ope.net/fee/ | 2026-08-15 |
| 最低契約期間 | ⬛非公開（記載なし） | 一次 | https://www.my-ope.net/fee/ | 2026-08-15 |
| 無料トライアル | ⬛非公開（記載なし） | 一次 | https://www.my-ope.net/fee/ | 2026-08-15 |

---

## 15. AI Messenger Chatbot

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| サイトの状態 | `https://www.ai-messenger.jp/chatbot/price/` は **301で `https://www.aiworker.jp/` へリダイレクト**（別ホスト） | 一次 | https://www.ai-messenger.jp/chatbot/price/ | 2026-08-15 |
| 移転先の製品 | **「AI Worker Platform」**（フッター表記 © 2026 **AI Shift Inc.**）。本文に「サイバーエージェントの独自大規模言語モデルの開発知見と、400社を超えるAI導入支援の経験を活かして開発」 | 一次 | https://www.aiworker.jp/ai-worker | 2026-08-15 |
| 公開/要問い合わせ | **要問い合わせ**。FAQ「費用感を知りたいのですが、どのように確認できますか？」の回答が「導入規模や目的に応じて費用が異なります。詳細につきましては、お気軽にお問い合わせください。企業状況に合わせて最適なプランをご提案いたします。」 | 一次 | https://www.aiworker.jp/ai-worker | 2026-08-15 |
| 月額 | ⬛非公開（サイト全体に金額の記載なし） | 一次 | https://www.aiworker.jp/ai-worker | 2026-08-15 |
| 初期費用 | ⬛非公開（記載なし） | 一次 | https://www.aiworker.jp/ai-worker | 2026-08-15 |
| 最低契約期間 | ⬛非公開（記載なし。**別事実として**FAQに「課題のヒアリングから設計・構築まで、最低3か月程度です」とあるが、これは**導入期間**であって契約期間ではない） | 一次 | https://www.aiworker.jp/ai-worker | 2026-08-15 |
| 無料トライアル | ⬛非公開（トライアルの記載なし。あるのは無料セミナー・資料ダウンロード・個別相談の3導線のみ） | 一次 | https://www.aiworker.jp/ai-worker | 2026-08-15 |
| 料金ページの存在 | ⬛非公開（`sitemap-static.xml` の全19URLに料金ページなし。`/price/` `/pricing/` `/plan/` はいずれも404） | 一次 | https://www.aiworker.jp/sitemap.xml | 2026-08-15 |

補足: 二次（比較サイト）には「初期費用50万円〜／月額15万円〜」があるが**一次未確認のため採用しない**。

到達方法の記録（2026-08-15）: `aiworker.jp` は素のHTTPクライアントに403を返すが、**ブラウザUAを付けたcurlでは200**。
ただし中身はNuxtのSPAで、HTMLソースには本文が一切入っていない（33KBのシェルのみ）。
**ブラウザでレンダリングして本文を取得した。** ホスト名は `www.` 必須（`aiworker.jp` 単体は名前解決に失敗）。

---

## 16. チャットディーラーAI（株式会社ラクス（二次のみ））

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| サイトの状態 | `https://www.chatdealer.jp/`・`https://chatdealer.jp/`・`/ai/` はいずれも **`https://www.rakus.co.jp/`（コーポレートサイトのトップ）へリダイレクト**。製品サイトが単独では存在しない | 一次 | https://www.chatdealer.jp/ | 2026-08-15 |
| ラクス社サイト内での製品の扱い | **掲載なし**。公開サービス一覧ページの製品は「楽楽クラウド」「ラクスライトクラウド」「オウンドメディア」の3系統のみで、チャットディーラーの記載がない | 一次 | https://www.rakus.co.jp/service/ | 2026-08-15 |
| 料金ページの存在 | ⬛非公開（**製品ページ自体が存在しない**） | 一次 | https://www.rakus.co.jp/sitemap_index.xml | 2026-08-15 |
| 月額 | ⬛非公開（到達可能な公開ページが存在しない） | 一次 | https://www.rakus.co.jp/service/ | 2026-08-15 |
| 初期費用 | ⬛非公開（同上） | 一次 | https://www.rakus.co.jp/service/ | 2026-08-15 |
| 最低契約期間 | ⬛非公開（同上） | 一次 | https://www.rakus.co.jp/service/ | 2026-08-15 |
| 無料トライアル | ⬛非公開（同上） | 一次 | https://www.rakus.co.jp/service/ | 2026-08-15 |
| 公開/要問い合わせ | ⬛非公開（同上） | 一次 | https://www.rakus.co.jp/service/ | 2026-08-15 |

探索の記録（2026-08-15・網羅の根拠）:
`www.rakus.co.jp/sitemap_index.xml` が指す**全13サイトマップ**（コーポレート本体 + 楽楽クラウド10製品[seisan / meisai / hanbai / kintai /
denshihozon / seikyu / saikenkanri / jinjiroumu / mailmarketing / jidootai] + news + recruit）を取得し、
`chat` を含むURLが**1件も存在しない**ことを確認した。`/service/chatdealer/` `/service/chatdealer_ai/` も404。
→ 「ラクス社サイト内に製品ページを探す」という宿題は**探し尽くした**。存在しないことが結論。
（注: 製品の提供終了を告知する一次文書は見つけていない。「提供終了した」とは書けない。書けるのは
「2026-08-15時点で、ラクス社の公開サイト上に製品ページも公開価格も存在しない」まで。）

---

## 17. ObotAI

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| 料金ページURL | **`https://obot-ai.com/fee/`**（ページタイトル「料金プラン【株式会社 ObotAI】」）。`/price/` ではなく `/fee/`。`page-sitemap.xml` から特定 | 一次 | https://obot-ai.com/page-sitemap.xml | 2026-08-15 |
| 公開/要問い合わせ | **要問い合わせ（料金ページに金額が一切なく、問い合わせフォームへの誘導のみ）** | 一次 | https://obot-ai.com/fee/ | 2026-08-15 |
| 月額 | ⬛非公開（料金ページに金額の記載なし） | 一次 | https://obot-ai.com/fee/ | 2026-08-15 |
| 初期費用 | ⬛非公開（記載なし） | 一次 | https://obot-ai.com/fee/ | 2026-08-15 |
| 最低契約期間 | ⬛非公開（記載なし） | 一次 | https://obot-ai.com/fee/ | 2026-08-15 |
| 無料トライアル | ⬛非公開（記載なし） | 一次 | https://obot-ai.com/fee/ | 2026-08-15 |

補足（事実のみ）:
- 料金ページ `/fee/` の本文は実質的に問い合わせ導線だけで、「お問い合わせ頂いた方には、下記資料をお送りしております」として
  **「ObotAI 価格表」「Minutz 価格表」**の2点が列挙されている（＝価格は資料内）。
- 特定商取引法に基づく表記（`/tokutei-index/`）はサービス別に分かれているが、掲載があるのは
  「リアルタイム同時翻訳」「多言語SEO AIエージェント」の2サービスのみで、**チャットボット製品の表記はない**。
- 会社所在地は「神奈川県川崎市幸区中幸町3-31-2 DAIKYO KENKI KAWASAKI BLDG. 8F」（`/tokutei-index/` 本文）。

---

# 汎用の土台系（比較の対極 / 従量課金）

## 18. Microsoft Copilot Studio 🟢価格公開

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| 事前購入（クレジットパック） | **¥29,985 / パック / 月**（25,000 Copilot クレジット） | 一次 | https://www.microsoft.com/ja-jp/microsoft-365-copilot/pricing/copilot-studio | 2026-08-15 |
| 従量課金制 | 「支払いは利用した分だけ」（事前契約不要）。**単価の記載なし** | 一次 | https://www.microsoft.com/ja-jp/microsoft-365-copilot/pricing/copilot-studio | 2026-08-15 |
| 従量課金の単価（円/1 Copilot クレジット） | 🔴宿題（**未解決**。下記「宿題の記録」参照） | - | - | 2026-08-15 |
| 前払い購入の割引 | 「Copilot クレジット コミット ユニットを前払いで購入すると、コストを最大 20% 削減できます」 | 一次 | https://www.microsoft.com/ja-jp/microsoft-365-copilot/pricing/copilot-studio | 2026-08-15 |
| プリペイド枯渇時 | 自動で従量課金制に切り替え | 一次 | https://www.microsoft.com/ja-jp/microsoft-365-copilot/pricing/copilot-studio | 2026-08-15 |
| 初期費用 | ⬛非公開（記載なし） | 一次 | https://www.microsoft.com/ja-jp/microsoft-365-copilot/pricing/copilot-studio | 2026-08-15 |
| 最低契約期間 | ⬛非公開（記載なし） | 一次 | https://www.microsoft.com/ja-jp/microsoft-365-copilot/pricing/copilot-studio | 2026-08-15 |
| 無料試用 | **あり**（「無料で試す」） | 一次 | https://www.microsoft.com/ja-jp/microsoft-365-copilot/pricing/copilot-studio | 2026-08-15 |

参考（別ページ）:

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| Microsoft 365 Copilot | **¥4,497 ユーザー/月相当、年払い** | 一次 | https://www.microsoft.com/ja-jp/microsoft-copilot/microsoft-copilot-studio | 2026-08-15 |

### 18-2. Copilot クレジットの消費レート（2026-08-15 追加取得）

「1回の応答で何クレジット減るか」の表。**円換算の単価ではない**（円/クレジットは非公開のまま）。
右列は「Microsoft 365 Copilot のライセンスを持つユーザーが使った場合」の扱い。

| エージェント機能 | 請求レート | M365 Copilotライセンス保有者 |
|---|---|---|
| 従来型の回答 | **1 Copilot クレジット** | 無料 |
| 生成回答 | **2 Copilot クレジット** | 無料 |
| エージェントアクション | **5 Copilot クレジット** | 無料 |
| メッセージのテナントグラフの基盤設定 | **10 Copilot クレジット** | 無料 |
| エージェント フロー アクション（100アクションあたり） | **13 Copilot クレジット** | 無料 |
| AIツール テキスト/生成AI（基本）回答10件ごと | **1Kトークンあたり 0.1 Copilot クレジット**（10件で 1 クレジット） | 無料 |
| AIツール テキスト/生成AI（標準）回答10件ごと | **1,000トークンあたり 1.5 Copilot クレジット**（10件で 15 クレジット） | 無料 |
| AIツール テキスト/生成AI（プレミアム）回答10件ごと | **1Kトークンあたり 10 Copilot クレジット**（10件で 100 クレジット） | 無料 |
| ページごとのコンテンツ処理ツール | **8 Copilot クレジット** | 無料 |
| 音声：クラシック音声・クラシックオーケストレーション（1分あたり） | **10 Copilot クレジット** | Included |
| 音声：GenAI音声（1分あたり） | **35 Copilot クレジット** | Included |
| 音声：プレミアムGenAI音声（1分あたり） | **75 Copilot クレジット** | Included |

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| 上記レート表 | 上記のとおり | 一次 | https://learn.microsoft.com/ja-jp/microsoft-copilot-studio/requirements-messages-management | 2026-08-15 |
| 未使用クレジットの繰越 | **なし**（「毎月の購入容量が適用され、未使用のCopilotクレジットは翌月に引き継がれません」） | 一次 | https://learn.microsoft.com/ja-jp/microsoft-copilot-studio/requirements-messages-management | 2026-08-15 |
| 適用範囲 | 「これらの料金は、Copilot Studio が提供するすべての言語モデルに適用されます」。持ち込みモデル（Azure Foundry含む）は別課金のため除外 | 一次 | https://learn.microsoft.com/ja-jp/microsoft-copilot-studio/requirements-messages-management | 2026-08-15 |

**🔴 宿題の記録（Copilot Studio 円/クレジット単価）**:
価格ページ（`microsoft.com/.../pricing/copilot-studio`）が公開しているのは**前払いパックの ¥29,985 / 25,000クレジット だけ**で、
従量課金制メーターの「円/1クレジット」は書かれていない。ライセンスガイドPDFを取りに行ったが、
`aka.ms/CopilotStudioLicensingGuide` と `go.microsoft.com/fwlink/?linkid=2320884` は**どちらもBing検索トップにリダイレクト**され、
PDFに到達できなかった。Learn側（`billing-licensing` / `requirements-messages-management`）にも円建て単価はなかった。
→ **次にやること**: Power Platform ライセンスガイドPDFの実URLを特定する／Azureポータルの料金計算ツールで従量メーター単価を確認する。
（**⚠️ ¥29,985 ÷ 25,000 の割り算で単価を出して書かないこと。** 前払いパックと従量課金は別メニューで、
前払いには「最大20%削減」と明記があるため、割り算の結果は従量単価と一致しない。）

---

## 19. Zendesk 🟢価格公開（ユーザー＝エージェント課金）

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| Support Team | **$19 エージェント/月（年払い）** | 一次 | https://www.zendesk.co.jp/pricing/ | 2026-08-15 |
| Suite Team | **$55 エージェント/月（年払い）** | 一次 | https://www.zendesk.co.jp/pricing/ | 2026-08-15 |
| Suite Professional | **$115 エージェント/月（年払い）** | 一次 | https://www.zendesk.co.jp/pricing/ | 2026-08-15 |
| Suite Enterprise + Copilot | 営業担当に問い合わせ | 一次 | https://www.zendesk.co.jp/pricing/ | 2026-08-15 |
| アドオン Copilot | **$50 エージェント/月（年払い）** | 一次 | https://www.zendesk.co.jp/pricing/ | 2026-08-15 |
| AIエージェント | 全Suiteプランに含まれ、「自動解決」ごとの従量課金 | 一次 | https://www.zendesk.co.jp/pricing/ | 2026-08-15 |
| アドオン Workforce Engagement Bundle | **$50 エージェント/月（年払い）** | 一次 | https://www.zendesk.co.jp/pricing/ | 2026-08-15 |
| アドオン Contact Center | **$83 エージェント/月（年払い）** | 一次 | https://www.zendesk.co.jp/pricing/ | 2026-08-15 |
| AIエージェント自動解決の単価 | ⬛非公開。**単価を公開しない旨が明記されている**:「料金は、AIエージェントがもたらした『解決』という成果にもとづく従量課金制です」「AIエージェントの解決は、**各解決がもたらす価値にもとづいて料金が設定されます**」 | 一次 | https://www.zendesk.co.jp/service/ai/ai-agents/ | 2026-08-15 |
| 初期費用 | ⬛非公開（記載なし） | 一次 | https://www.zendesk.co.jp/pricing/ | 2026-08-15 |
| 最低契約期間 | ⬛非公開（年払い/月払いの別のみ、期間の明記なし） | 一次 | https://www.zendesk.co.jp/pricing/ | 2026-08-15 |
| 無料トライアル | **あり（Support Team は14日間）** | 一次 | https://www.zendesk.co.jp/pricing/ | 2026-08-15 |
| 円建て価格 | ⬛非公開（**日本語サイトでもUSD建てのみ**。ページタイトル自体が「Zendeskの料金プラン \| 月額$19から」） | 一次 | https://www.zendesk.co.jp/pricing/ | 2026-08-15 |

自動解決単価について確認した範囲（2026-08-15）: 日本語料金ページ `/pricing/`、AIエージェント製品ページ `/service/ai/ai-agents/`、
米国サイト `zendesk.com/pricing/`、ヘルプセンター記事 `About automated resolutions for AI agents` の4つ。
**いずれにも「1自動解決あたり◯ドル」に相当する単価の記載はなかった。**

### 19-2. Zendesk 従業員向けサービス（Employee Service） 🟢価格公開（2026-08-15 追加取得）

**社内向け（従業員サービス／社内ヘルプデスク）専用の料金ページ。本台帳の主題に最も近いZendesk製品。**
カスタマーサービス版とは別建ての価格。

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| Suite Team | **$29 エージェント/月（年払い）** | 一次 | https://www.zendesk.co.jp/pricing/employee-service-pricing/ | 2026-08-15 |
| Suite Growth | **$59 エージェント/月（年払い）** | 一次 | https://www.zendesk.co.jp/pricing/employee-service-pricing/ | 2026-08-15 |
| Suite Professional | **$99 エージェント/月（年払い）** | 一次 | https://www.zendesk.co.jp/pricing/employee-service-pricing/ | 2026-08-15 |
| アドオン Copilot | **$50 エージェント/月（年払い）** | 一次 | https://www.zendesk.co.jp/pricing/employee-service-pricing/ | 2026-08-15 |
| アドオン Quality Assurance | **$35 エージェント/月（年払い）** | 一次 | https://www.zendesk.co.jp/pricing/employee-service-pricing/ | 2026-08-15 |
| アドオン Advanced Data Privacy and Protection | **$50 エージェント/月（年払い）** | 一次 | https://www.zendesk.co.jp/pricing/employee-service-pricing/ | 2026-08-15 |
| 課金単位 | **エージェント（サポート担当者）課金**。「ライセンス数（サポート担当者ごと、月単位）」 | 一次 | https://www.zendesk.co.jp/pricing/employee-service-pricing/ | 2026-08-15 |
| 無料トライアル | **あり（14日間）**。トライアルはSuite Professionalの全機能 | 一次 | https://www.zendesk.co.jp/pricing/employee-service-pricing/ | 2026-08-15 |
| AIエージェントの扱い | Suite Team（最下位プラン）から「AIエージェント」「AIナレッジベース」「AIアクションビルダー」を含む | 一次 | https://www.zendesk.co.jp/pricing/employee-service-pricing/ | 2026-08-15 |
| 初期費用 | ⬛非公開（記載なし） | 一次 | https://www.zendesk.co.jp/pricing/employee-service-pricing/ | 2026-08-15 |
| 最低契約期間 | ⬛非公開（年払い/月払いの別のみ） | 一次 | https://www.zendesk.co.jp/pricing/employee-service-pricing/ | 2026-08-15 |
| 円建て価格 | ⬛非公開（USD表記のみ） | 一次 | https://www.zendesk.co.jp/pricing/employee-service-pricing/ | 2026-08-15 |

---

## 20. Google Dialogflow CX / Conversational Agents 🟢価格公開（完全従量）

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| Chat / Flows | **$0.007 / 1 count** | 一次 | https://cloud.google.com/dialogflow/pricing?hl=ja | 2026-08-15 |
| Chat / Playbooks | **$0.012 / 1 count** | 一次 | https://cloud.google.com/dialogflow/pricing?hl=ja | 2026-08-15 |
| Voice / Flows | **$0.001 / 1 second** | 一次 | https://cloud.google.com/dialogflow/pricing?hl=ja | 2026-08-15 |
| Voice / Playbooks | **$0.002 / 1 second** | 一次 | https://cloud.google.com/dialogflow/pricing?hl=ja | 2026-08-15 |
| Data Store インデックス保存 | **無料枠 10 GiB/月、超過分 $5.00 / GiB / 月** | 一次 | https://cloud.google.com/dialogflow/pricing?hl=ja | 2026-08-15 |
| 設計時リクエスト | 無料 | 一次 | https://cloud.google.com/dialogflow/pricing?hl=ja | 2026-08-15 |
| 月額固定費 | **なし**（"You only pay for what you use"） | 一次 | https://cloud.google.com/dialogflow/pricing?hl=ja | 2026-08-15 |
| 初期費用 | **なし**（記載上、固定の初期費用の概念なし） | 一次 | https://cloud.google.com/dialogflow/pricing?hl=ja | 2026-08-15 |
| Dialogflow ES の単価 | **取得済み → 下記 20-2** | 一次 | https://cloud.google.com/products/dialogflow-es/pricing?hl=ja | 2026-08-15 |

補足: `cloud.google.com/dialogflow/pricing?hl=ja` は
`cloud.google.com/products/conversational-agents/pricing?hl=ja` へリダイレクトする（製品名がConversational Agentsに変更されている）。

### 20-2. Dialogflow ES 🟢価格公開（2026-08-15 追加取得）

ES料金ページの正しいURLは `https://cloud.google.com/products/dialogflow-es/pricing`。
（`/dialogflow/es/pricing` は `docs.cloud.google.com` へリダイレクトされて404になる。前回はこれで詰まっていた）
ページ本文の位置づけは「Dialogflow ES is an older agent building platform that is suitable for smaller and simpler agents.」。
表は **Free Trial（無料枠。リクエスト量に上限あり）／有料** の2列構成。

| 機能 | Free Trial | 料金 |
|---|---|---|
| Text（音声を含まない DetectIntent / StreamingDetectIntent） | no charge | **$0.002 / 1 count** |
| Audio input（音声認識・STT） | no charge | **$0.0065 / 15 second** |
| Audio output（音声合成・TTS） | **$4.00 / 1,000,000 count** | **$16.00 / 1,000,000 count** |
| Knowledge connectors (Beta) | no charge | no charge |
| Sentiment analysis（5,000〜1,000,000 count） | Not available | **$1.00 / 1,000 count（月・アカウント単位）** |
| Sentiment analysis（1,000,000〜5,000,000 count） | Not available | **$0.50 / 1,000 count（月・アカウント単位）** |
| Sentiment analysis（5,000,000 count 以上） | Not available | **$0.25 / 1,000 count（月・アカウント単位）** |
| ES phone gateway（Tolled number） | no charge | **$0.05 / 1 minute** |
| ES phone gateway（Toll-free number） | Not available | **$0.06 / 1 minute** |
| Mega agent（インテント 2,000以下） | no charge | **$0.002 / 1 count** |
| Mega agent（インテント 2,000超） | no charge | **$0.006 / 1 count** |
| Design-time write requests（エージェントの作成・更新） | no charge | **$0** |
| Design-time read requests（一覧・取得） | no charge | **$0** |
| Other session requests（セッションエンティティ・コンテキスト操作） | no charge | **$0** |

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| 上記単価表 | 上記のとおり（すべてUSD） | 一次 | https://cloud.google.com/products/dialogflow-es/pricing?hl=ja | 2026-08-15 |
| 音声の端数処理 | 15秒単位に切り上げ（7秒×3リクエスト＝45秒として課金） | 一次 | https://cloud.google.com/products/dialogflow-es/pricing?hl=ja | 2026-08-15 |
| 通話時間の端数処理 | 分単位に切り上げ（61秒＝2分として課金） | 一次 | https://cloud.google.com/products/dialogflow-es/pricing?hl=ja | 2026-08-15 |
| 月額固定費 / 初期費用 | **なし**（完全従量） | 一次 | https://cloud.google.com/products/dialogflow-es/pricing?hl=ja | 2026-08-15 |
| 円建て価格 | ⬛非公開（USD表記のみ） | 一次 | https://cloud.google.com/products/dialogflow-es/pricing?hl=ja | 2026-08-15 |

---

## 21. Amazon Lex 🟢価格公開（完全従量）

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| テキストリクエスト | **0.004 USD / リクエスト**（音声）／**0.00075 USD / リクエスト**（テキスト） | 一次 | https://aws.amazon.com/jp/lex/pricing/ | 2026-08-15 |
| 自動チャットボットデザイナー | トレーニング **0.50 USD / 分** | 一次 | https://aws.amazon.com/jp/lex/pricing/ | 2026-08-15 |
| ストリーミング会話（音声間隔） | **0.0065 USD / 15秒の音声間隔**（無音・処理時間・待機を含む。15秒単位に切り上げ） | 一次 | https://aws.amazon.com/jp/lex/pricing/ | 2026-08-15 |
| ストリーミング会話（テキスト） | **0.0020 USD / リクエスト** | 一次 | https://aws.amazon.com/jp/lex/pricing/ | 2026-08-15 |
| 円建て価格 | ⬛非公開（日本語ページでもUSD表記のみ） | 一次 | https://aws.amazon.com/jp/lex/pricing/ | 2026-08-15 |
| 無料利用枠 | 2025年7月15日以降のAWS新規顧客に最大200 USDの無料利用枠クレジット。無料プランはアカウント作成後6か月間。全クレジットはアカウント作成日から12か月以内に使用 | 一次 | https://aws.amazon.com/jp/lex/pricing/ | 2026-08-15 |
| 月額固定費 | **なし** | 一次 | https://aws.amazon.com/jp/lex/pricing/ | 2026-08-15 |
| 初期費用 | **なし** | 一次 | https://aws.amazon.com/jp/lex/pricing/ | 2026-08-15 |

取得方法の注記（2026-08-15）: ストリーミング会話の**本文（説明文）側は単価がJSプレースホルダ**
（`{priceOf!lex/...}`）のままで数値が入らない。上記の値は同ページの
**「料金の例」表の「ユニットあたりのコスト」列**に実数で書かれていたもの（音声間隔 8,000回×0.0065 USD＝52.00 USD、
テキスト 2,000回×0.0020 USD＝4.00 USD、合計56.00 USD）。**同ページ本文内の数値**である。

---

## 22. OpenAI API 🟢価格公開（完全従量）

| モデル | 入力（per 1M tokens） | 出力（per 1M tokens） |
|---|---|---|
| gpt-5.6-sol | **$5.00** | **$30.00** |
| gpt-5.6-terra | **$2.00** | **$12.00** |
| gpt-5.6-luna | **$0.20** | **$1.20** |
| gpt-5.5 | **$5.00** | **$30.00** |
| gpt-5.4 | **$2.50** | **$15.00** |
| gpt-5.4-mini | **$0.75** | **$4.50** |
| gpt-5.4-nano | **$0.20** | **$1.25** |
| gpt-5.2 | **$1.75** | **$14.00** |
| gpt-5.1 | **$1.25** | **$10.00** |
| gpt-5 | **$1.25** | **$10.00** |
| gpt-5-mini | **$0.25** | **$2.00** |
| gpt-5-nano | **$0.05** | **$0.40** |

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| 上記単価（Short context） | 上記のとおり | 一次 | https://developers.openai.com/api/docs/pricing | 2026-08-15 |
| 月額固定費 / 初期費用 | **なし** | 一次 | https://developers.openai.com/api/docs/pricing | 2026-08-15 |
| Long context の単価 | **取得済み → 下表 22-2** | 一次 | https://developers.openai.com/api/docs/pricing | 2026-08-15 |
| キャッシュ入力の単価 | **取得済み → 下表 22-2 / 22-3** | 一次 | https://developers.openai.com/api/docs/pricing | 2026-08-15 |
| 円建て価格 | ⬛非公開（USD表記のみ） | 一次 | https://developers.openai.com/api/docs/pricing | 2026-08-15 |

補足: `platform.openai.com/docs/pricing` は `developers.openai.com/api/docs/pricing` へ301リダイレクトする。

### 22-2. Short context / Long context / Cached input / Cache writes（Standard・2026-08-15 追加取得）

単位はすべて **per 1M tokens（USD）**。「-」はページ上で「-」と表記されているもの（設定なし）。
`「All models」のタブを開かないと出ない表`のため、ブラウザでレンダリングして取得した。

| Model | Short 入力 | Short キャッシュ入力 | Short キャッシュ書込 | Short 出力 | Long 入力 | Long キャッシュ入力 | Long キャッシュ書込 | Long 出力 |
|---|---|---|---|---|---|---|---|---|
| gpt-5.6-sol | $5.00 | $0.50 | $6.25 | $30.00 | $10.00 | $1.00 | $12.50 | $45.00 |
| gpt-5.6-terra | $2.00 | $0.20 | $2.50 | $12.00 | $4.00 | $0.40 | $5.00 | $18.00 |
| gpt-5.6-luna | $0.20 | $0.02 | $0.25 | $1.20 | $0.40 | $0.04 | $0.50 | $1.80 |
| gpt-5.5 | $5.00 | $0.50 | - | $30.00 | $10.00 | $1.00 | - | $45.00 |
| gpt-5.5-pro | $30.00 | - | - | $180.00 | $60.00 | - | - | $270.00 |
| gpt-5.4 | $2.50 | $0.25 | - | $15.00 | $5.00 | $0.50 | - | $22.50 |
| gpt-5.4-mini | $0.75 | $0.075 | - | $4.50 | - | - | - | - |
| gpt-5.4-nano | $0.20 | $0.02 | - | $1.25 | - | - | - | - |
| gpt-5.4-pro | $30.00 | - | - | $180.00 | $60.00 | - | - | $270.00 |

### 22-3. Long context の区分がないモデル（入力／キャッシュ入力／出力のみ）

| Model | 入力 | キャッシュ入力 | 出力 |
|---|---|---|---|
| gpt-5.2 | $1.75 | $0.175 | $14.00 |
| gpt-5.2-pro | $21.00 | - | $168.00 |
| gpt-5.1 | $1.25 | $0.125 | $10.00 |
| gpt-5 | $1.25 | $0.125 | $10.00 |
| gpt-5-mini | $0.25 | $0.025 | $2.00 |
| gpt-5-nano | $0.05 | $0.005 | $0.40 |
| gpt-5-pro | $15.00 | - | $120.00 |
| gpt-4.1 | $2.00 | $0.50 | $8.00 |
| gpt-4.1-mini | $0.40 | $0.10 | $1.60 |
| gpt-4.1-nano | $0.10 | $0.025 | $0.40 |
| gpt-4o | $2.50 | $1.25 | $10.00 |
| gpt-4o-mini | $0.15 | $0.075 | $0.60 |
| o4-mini | $1.10 | $0.275 | $4.40 |
| o3 | $2.00 | $0.50 | $8.00 |
| o3-mini | $1.10 | $0.55 | $4.40 |
| o3-pro | $20.00 | - | $80.00 |
| o1 | $15.00 | $7.50 | $60.00 |
| o1-pro | $150.00 | - | $600.00 |

| 項目 | 値 | 一次/二次 | 出典URL | 取得日 |
|---|---|---|---|---|
| 上記 22-2 / 22-3 の表 | 上記のとおり（per 1M tokens・USD・Standard） | 一次 | https://developers.openai.com/api/docs/pricing | 2026-08-15 |

同ページには Standard 以外に **Batch / Flex / Fast mode** のタブがあり、gpt-5.6系の値は次のとおり（Short/Long・入力/キャッシュ入力/キャッシュ書込/出力）:

| Model | Batch Short | Batch Long | Flex Short | Flex Long | Fast Short | Fast Long |
|---|---|---|---|---|---|---|
| gpt-5.6-sol | $2.50 / $0.25 / $3.125 / $15.00 | $5.00 / $0.50 / $6.25 / $22.50 | $2.50 / $0.25 / $3.125 / $15.00 | $5.00 / $0.50 / $6.25 / $22.50 | $10.00 / $1.00 / $12.50 / $60.00 | $20.00 / $2.00 / $25.00 / $90.00 |
| gpt-5.6-terra | $1.00 / $0.10 / $1.25 / $6.00 | $2.00 / $0.20 / $2.50 / $9.00 | $1.00 / $0.10 / $1.25 / $6.00 | $2.00 / $0.20 / $2.50 / $9.00 | $4.00 / $0.40 / $5.00 / $24.00 | $8.00 / $0.80 / $10.00 / $36.00 |
| gpt-5.6-luna | $0.10 / $0.01 / $0.125 / $0.60 | $0.20 / $0.02 / $0.25 / $0.90 | $0.10 / $0.01 / $0.125 / $0.60 | $0.20 / $0.02 / $0.25 / $0.90 | $0.40 / $0.04 / $0.50 / $2.40 | $0.80 / $0.08 / $1.00 / $3.60 |

その他、同ページ本文にあった注記:
- データレジデンシー対応リージョンのエンドポイントは、2026年3月5日以降にリリースされた対象モデルで **10%上乗せ**。
- Amazon Bedrock 経由のOpenAIモデルはAWS請求となり、OpenAI直販の価格と異なる場合がある。
- 「Priority processing」は2026年7月30日に「Fast mode」へ改称。

---

# 価格が公開されていたサービスの一覧

**月額・初期費用のいずれかが料金ページ本文に実額で書かれていたもの（一次のみ）。**

## 月額（日本円・最小プラン）の分布

| サービス | 月額（実額） | 課金単位 | 税表記 | 出典URL |
|---|---|---|---|---|
| ChatSense（スターター） | **0円** | 人/月（チーム合計30回/月まで） | 記載なし | https://chatsense.jp/ |
| exaBase 生成AI | **900円 / 1ID**（期間単位の明記なし） | ID | 記載なし | https://exawizards.com/archives/30467/ |
| ChatSense（ビジネス） | **980円〜/人/月** | ユーザー課金 | 記載なし | https://chatsense.jp/ |
| ChatPlus（ミニマム・年契約） | **1,500円/月** | サイト課金 | 税抜 | https://chatplus.jp/chat/plan/ |
| ChatPlus（ミニマム・月契約） | **1,980円/月** | サイト課金 | 税抜 | https://chatplus.jp/chat/plan/ |
| Microsoft 365 Copilot | **¥4,497 ユーザー/月（年払い）** | ユーザー課金 | 記載なし | https://www.microsoft.com/ja-jp/microsoft-copilot/microsoft-copilot-studio |
| ChatPlus（ビジネスライト・年契約） | **9,800円/月** | サイト課金 | 税抜 | https://chatplus.jp/chat/plan/ |
| sinclo（コスト重視） | **10,000円〜** | 記載なし | 記載なし | https://chat.sinclo.jp/price/ |
| RICOH Chatbot Service（STARTER） | **18,000円** | ユーザー課金なし | 税抜 | https://promo.digital.ricoh.com/chatbot/price/ |
| ChatPlus（プレミアム・年契約） | **28,000円/月** | サイト課金 | 税抜 | https://chatplus.jp/chat/plan/ |
| Copilot Studio（クレジットパック） | **¥29,985 / パック / 月**（25,000クレジット） | クレジット | 記載なし | https://www.microsoft.com/ja-jp/microsoft-365-copilot/pricing/copilot-studio |
| AI-FAQボット（QA 1〜100問） | **30,000円** | QA数 | 税別 | https://faq-bot.ai/ja/plan/ |
| My-ope office（外部連携オプションのみ） | **30,000円**（オプション） | オプション | 記載なし | https://www.my-ope.net/ |
| ChatPlus（AIライト・年契約） | **50,000円/月** | サイト課金 | 税抜 | https://chatplus.jp/chat/plan/ |
| RICOH Chatbot Service（STANDARD） | **50,000円〜** | ユーザー課金なし | 税抜 | https://promo.digital.ricoh.com/chatbot/price/ |
| sinclo（成果重視） | **50,000円〜** | 記載なし | 記載なし | https://chat.sinclo.jp/price/ |
| エクサベース AI for自治体 | **65,000円〜**（月額固定・同時アクセス数上限で決定） | アカウント無制限 | 記載なし | https://exawizards.com/exabase/gpt/gov/ |
| AI-FAQボット（QA 401〜500問） | **70,000円** | QA数 | 税別 | https://faq-bot.ai/ja/plan/ |
| ChatPlus（オートAI・年契約） | **80,000円〜/月** | サイト課金 | 税抜 | https://chatplus.jp/chat/plan/ |
| AI-FAQボット（QA 701〜800問） | **100,000円** | QA数 | 税別 | https://faq-bot.ai/ja/plan/ |
| AI-FAQボット（QA 901〜1,000問） | **120,000円** | QA数 | 税別 | https://faq-bot.ai/ja/plan/ |

**取れた月額の実額レンジ（日本円）: 0円 〜 120,000円**
（ChatPlusのオートAIと AI-FAQボット上位帯を除く大半は 30,000円以下）

## 初期費用の分布

**本調査で「初期費用の実額」が料金ページ本文に書かれていたのは以下の4件だけ。**

| サービス | 初期費用（実額） | 出典URL |
|---|---|---|
| HiTTO | **0円**（「導入の初期費用はございません」） | https://hitto.jp/price/ |
| ChatPlus（全プラン） | **0円** | https://chatplus.jp/chat/plan/ |
| ChatSense（スターター/ビジネス） | **0円** | https://chatsense.jp/ |
| ChatPlus AI Agent Plus（旧AIチャットボット） | **0円**（2026-08-15 追加） | https://chatplus.jp/service/aiagentplus/ |
| RICOH Chatbot Service（STARTER/STANDARD） | **5,000円** | https://promo.digital.ricoh.com/chatbot/price/ |
| （参考）My-ope office 外部チャットツール連携オプション | **48,000円**（本体の初期費用ではない） | https://www.my-ope.net/ |

**取れた初期費用の実額: 0円 / 5,000円 / （オプションで 48,000円）のみ。**
本調査の範囲では、**初期費用として 10万円以上の実額を公開していたサービスは 0件**。
（2026-08-15の追加調査でも、初期費用に10万円以上の実額を出しているサービスは増えなかった）

## USD建て・従量課金（固定月額・初期費用なし）

| サービス | 単価 | 出典URL |
|---|---|---|
| Dialogflow CX（Chat/Flows） | $0.007 / 1 count | https://cloud.google.com/dialogflow/pricing?hl=ja |
| Dialogflow CX（Chat/Playbooks） | $0.012 / 1 count | https://cloud.google.com/dialogflow/pricing?hl=ja |
| Amazon Lex（テキスト） | $0.00075 / リクエスト | https://aws.amazon.com/jp/lex/pricing/ |
| Amazon Lex（音声） | $0.004 / リクエスト | https://aws.amazon.com/jp/lex/pricing/ |
| OpenAI API（gpt-5.4-mini） | 入力 $0.75 / 出力 $4.50 per 1M tokens | https://developers.openai.com/api/docs/pricing |
| OpenAI API（gpt-5-nano） | 入力 $0.05 / 出力 $0.40 per 1M tokens | https://developers.openai.com/api/docs/pricing |
| Zendesk（Suite Team） | $55 エージェント/月（年払い） | https://www.zendesk.co.jp/pricing/ |
| Dialogflow **ES**（Text） | $0.002 / 1 count | https://cloud.google.com/products/dialogflow-es/pricing?hl=ja |
| Dialogflow **ES**（Audio input） | $0.0065 / 15 second | https://cloud.google.com/products/dialogflow-es/pricing?hl=ja |
| Amazon Lex（ストリーミング音声） | $0.0065 / 15秒の音声間隔 | https://aws.amazon.com/jp/lex/pricing/ |
| Amazon Lex（ストリーミングテキスト） | $0.0020 / リクエスト | https://aws.amazon.com/jp/lex/pricing/ |
| **Zendesk 従業員向けサービス（Suite Team）** | **$29 エージェント/月（年払い）** | https://www.zendesk.co.jp/pricing/employee-service-pricing/ |
| **Zendesk 従業員向けサービス（Suite Growth）** | **$59 エージェント/月（年払い）** | https://www.zendesk.co.jp/pricing/employee-service-pricing/ |
| **Zendesk 従業員向けサービス（Suite Professional）** | **$99 エージェント/月（年払い）** | https://www.zendesk.co.jp/pricing/employee-service-pricing/ |

（下の4行は2026-08-15の追加取得。Zendesk従業員向けサービスは**社内向け用途そのもの**で、
Zendeskのカスタマーサービス版（$19/$55/$115）より安い価格帯が公開されている）

## 「月7万円＋初期20万円」との位置関係（数字の事実のみ）

- **月70,000円**という水準に**到達または超過する公開月額**が確認できたのは、
  収録22サービス中 **2サービス3プラン**:
  - AI-FAQボット QA401〜500問 **70,000円**／QA701〜800問 **100,000円**／QA901〜1,000問 **120,000円**（税別）
  - ChatPlus オートAI **80,000円〜/月**（年契約・税抜）
- **月70,000円未満**の公開月額は **17プラン**（0円〜50,000円〜の帯）。
- **初期200,000円**という水準を公開していたサービスは **0件**。
  公開されていた初期費用の実額は **0円（3社）・5,000円（1社）** のみ。
- **価格を一切公開していなかった（要問い合わせ）サービス**: **11サービス**
  （OfficeBot / sAI Chat / PKSHA ChatAgent / KARAKURI / Helpfeel / HRBrain / ObotAI /
  HiTTO（初期0円のみ公開・月額非公開）/ My-ope office（販売停止）/ AI Messenger（サイト移転）/ チャットディーラーAI（サイト統合））

### 2026-08-15 追加調査による更新（数え直し）

上の箇条書きは追加調査**前**の集計。新たに日本円の実額が1件増えた（エクサベース AI for自治体 65,000円〜）ので、
月額の分布を数え直すと以下になる。

- 月額（日本円）の実額が公開されていたプラン: **21プラン**
- うち **月70,000円以上**: **4プラン / 2サービス**
  （AI-FAQボット 70,000円・100,000円・120,000円[税別]、ChatPlus オートAI 80,000円〜/月[年契約・税抜]）
- うち **月70,000円未満**: **17プラン**（0円 〜 65,000円〜 の帯）
- **初期200,000円**という水準を公開していたサービスは引き続き **0件**。
- 上記に加え、追加調査で「価格を公開していないこと」が**より強い根拠で確定**したもの:
  - **OfficeBot** — 料金ページのURL候補6種がすべて404、サイトマップにも料金ページなし
  - **PKSHA ChatAgent** — サイトマップ全件走査で料金ページの不存在を確認
  - **ObotAI** — 料金ページ `/fee/` は実在するが金額ゼロ行、価格表は資料請求で送付
  - **AI Messenger（移転先 AI Worker Platform）** — FAQで「費用は導入規模・目的により異なる、要問い合わせ」と明言
  - **チャットディーラーAI** — ラクス社の全13サイトマップに製品ページが存在しない
  - **Zendesk AIエージェント** — 「各解決がもたらす価値にもとづいて料金が設定されます」と、単価を出さない旨を明記
- **日本語サイトなのにUSD建てのみ**だったもの: Zendesk（両ページ）／Amazon Lex／Dialogflow CX・ES／OpenAI API。
  日本円の実額が取れるのは国内ベンダーとMicrosoftのみ。

---

# 調査の穴（⬛ / 🔴 / 🟠 の3分類）

規約 `../00_収録規約.md`「穴の3分類」で仕分けたもの。
**⬛は穴ではない。「調べた結果、公開されていなかった」という確定した事実。**

## ⬛ 非公開（対応不要。これ自体が結論）— 81件

一次で「金額の記載なし／要問い合わせ／資料請求のみ」を確認したもの:
OfficeBot / HiTTO（月額のみ非公開）/ sAI Chat / PKSHA ChatAgent / KARAKURI chatbot /
Helpfeel / HRBrain / ObotAI / My-ope office /
**AI Messenger（移転先 AI Worker Platform）/ チャットディーラーAI / exaBase 生成AI（法人版の実額）/
ChatPlus AI Agent Plus（月額本体）/ Zendesk AIエージェント自動解決単価**

→ **社内向け（社内FAQ・社内問い合わせ）に特化した製品ほど価格非公開**、
　 **Web接客・汎用FAQ寄りの製品（ChatPlus / RICOH / sinclo / AI-FAQボット）ほど価格公開**、
　 という分布になっている（これは収録した一次データの並びから読める事実であり、評価ではない）。

- **最低契約期間**を公開しているサービスは、2026-08-15の追加調査で **1件** 見つかった
  （ChatSense: 「最低利用期間・最低利用人数なし」＝期間の定めが無いことを明記）。それ以外は依然として記載なし。
- **税抜/税込**の表記が無いサービスが複数ある（sinclo・ChatSense・Copilot Studio・exaBase）。
  ChatSenseは特定商取引法に基づく表記まで確認したが、そこにも税の別はなかった。
- **日本語サイトでもUSD建てのみ**: Zendesk（カスタマーサービス版・従業員向け版とも）／Amazon Lex／
  Dialogflow CX・ES／OpenAI API。

### ⬛が48件→81件に増えた理由（2026-08-15）

**新たに「価格を隠しはじめた会社」が増えたのではない。** 内訳は2つだけ:

1. **🔴宿題を追いかけ切って⬛に確定したもの — 24件**
   「こちらの都合で取れていなかった」のではなく「そもそも公開されていない」と分かった。
   AI Messenger 5件／チャットディーラーAI 5件／ObotAI 4件／exaBase 5件／
   Zendesk 2件／ChatSense 1件／PKSHA 1件／ChatPlus 1件。
2. **新しく収録した製品セクションに元から含まれていた⬛ — 約9件**
   エクサベース AI for自治体（税表記・初期費用・最低契約期間）、
   ChatPlus AI Agent Plus（月額本体）、Zendesk 従業員向けサービス（初期費用・最低契約期間・円建て）、
   Dialogflow ES・Amazon Lex・OpenAI API（いずれも円建て価格）。

つまり **⬛の増加は調査が進んだ証拠であって、悪化ではない。**
「日本のBtoB SaaSは価格を出さない」という主張の根拠は、この81件の方にある。

## 🔴 宿題（公開されているはずだが、こちらの都合で取れていない）— 1件

| 対象 | 状況 | 次にやること |
|---|---|---|
| Copilot Studio の従量課金**単価**（円/1 Copilot クレジット） | 価格ページは前払いパック ¥29,985 / 25,000クレジット のみ公開。ライセンスガイドPDFへの短縮URL（`aka.ms/CopilotStudioLicensingGuide`、`go.microsoft.com/fwlink/?linkid=2320884`）が**どちらもBing検索トップにリダイレクト**され、PDFに到達できず。Learn（`billing-licensing` / `requirements-messages-management`）にも円建て単価はなかった | Power Platform ライセンスガイドPDFの実URLを特定する／Azureポータルの料金計算ツールで従量メーターの単価を見る。**割り算で単価を作らないこと**（前払いは「最大20%削減」と明記があり、従量単価と一致しない） |

### 2026-08-15 に潰した宿題（記録）

前回の33件のうち32件を処理した。**実額・実データが新たに取れた8件**:

| 対象 | 取れた値 | 出典URL |
|---|---|---|
| HiTTO 提供会社 | **株式会社マネーフォワード** | https://hitto.jp/price/ |
| ChatSense 最低契約期間 | **最低利用期間・最低利用人数なし** | https://chatsense.jp/ |
| exaBase 無料トライアル | **あり（1週間の無料トライアルプラン）** | https://exawizards.com/exabase/gpt/faq/ |
| ObotAI 料金ページURL | **`/fee/`**（`/price/` ではない） | https://obot-ai.com/fee/ |
| Dialogflow ES の単価 | 全15行の単価表 | https://cloud.google.com/products/dialogflow-es/pricing?hl=ja |
| Amazon Lex ストリーミング会話 | **0.0065 USD/15秒間隔・0.0020 USD/テキストリクエスト** | https://aws.amazon.com/jp/lex/pricing/ |
| OpenAI API Long context | 全モデルのShort/Long対照表 | https://developers.openai.com/api/docs/pricing |
| OpenAI API キャッシュ入力 | 全モデルのキャッシュ入力・キャッシュ書込 | https://developers.openai.com/api/docs/pricing |

**ついでに取れた新規データ**（宿題ではなかったが、追いかける過程で見つかった一次の実額）:

| 対象 | 値 | 出典URL |
|---|---|---|
| エクサベース AI for自治体 | **月額 65,000円〜**（月額固定・アカウント無制限） | https://exawizards.com/exabase/gpt/gov/ |
| Zendesk 従業員向けサービス | **$29 / $59 / $99 エージェント・月（年払い）** | https://www.zendesk.co.jp/pricing/employee-service-pricing/ |
| ChatPlus AI Agent Plus | 初期費用 0円／追加オペレーター 2,500〜3,500円/月・人／LINE・Salesforce連携 各10,000円〜/月（税抜） | https://chatplus.jp/service/aiagentplus/ |
| Copilot Studio クレジット消費レート | 従来型回答1／生成回答2／エージェントアクション5 クレジット ほか | https://learn.microsoft.com/ja-jp/microsoft-copilot-studio/requirements-messages-management |

### 到達できなかったサイトを抜いた方法（次回のために記録）

| 技 | 効いた相手 |
|---|---|
| **ブラウザUA付きcurl** | `aiworker.jp`（403→200）、`officebot.jp`（403→200）、`obot-ai.com`、`rakus.co.jp` |
| **`/sitemap.xml` からURLを特定** | ObotAI の料金ページが `/price/` ではなく **`/fee/`** だと判明。PKSHA・ラクス・OfficeBotの「料金ページ不存在」の証明にも使用 |
| **ブラウザでレンダリング** | `aiworker.jp`（NuxtのSPAでHTMLに本文なし）、exaBase FAQ（アコーディオン内をJS描画）、OpenAI価格表（「All models」タブ） |
| **「料金の例」の表を読む** | Amazon Lex。説明文側の単価はJSプレースホルダのままだが、例示表には実数が入っていた |
| **後継製品・移転先を追う** | AI Messenger→AI Worker Platform（AI Shift）、ChatPlus AIチャットボット→AI Agent Plus |

**HTTP 403は遮断とは限らず、UA判定であることが多い。** 今回 `aiworker.jp` と `officebot.jp` はどちらもUAだけで抜けた。

## 🟠 本人待ち（darari本人しか埋められない）— 1件

| 対象 | 内容 | なぜ本人しか埋められないか |
|---|---|---|
| **「月7万＋初期20万」の内訳** | ライセンス費のみか、構築・FAQ作成・運用代行を含むか、ユーザー数は何名か | darari本人の**社内ヒアリング値**。公開情報には存在しない |

（参考）`officebot.jp` は価格が資料請求のみ（⬛非公開）。資料内の実額を見るには**資料請求＝本人判断**が要るため、
台帳の値としては⬛のまま置いている。上の1件には数えていない。

## 参考A: 採用しなかった二次情報（一次で裏が取れず）

以下は比較サイト・検索結果にのみ存在し、一次で確認できなかったため**本台帳の数値としては採用していない**。
将来一次で裏が取れたら差し替える。

| サービス | 二次に出ていた数値 | 問題点 |
|---|---|---|
| OfficeBot | 「初期10万／月5万〜」「初期35万／月15万」「Essentials ¥3,000/月」 | **3系統に矛盾**。どれも一次未確認 |
| sAI Chat | 「Starter 月80,000円／初期300,000円」ほか | 一次は「金額の記載なし」 |
| AI Messenger Chatbot | 「初期50万円〜／月15万円〜」 | **2026-08-15更新**: 移転先サイトに到達できたが、FAQで「費用は導入規模・目的により異なる、要問い合わせ」と明記されており、金額の記載は一切なかった。**引き続き採用しない** |
| exaBase 生成AI | 「最低50ID／初年度640,000円〜」「中小企業応援プラン 初年度424,000円〜」「Standard 7円/1,000文字」「Premium 10円/1,000文字」 | 出所は販売代理店サイト・比較サイト。**エクサウィザーズ自身の公開ページ（製品ページ・FAQ・価格改訂のお知らせ）には一切これらの数値がない**。一次未確認のため採用しない |
| チャットディーラーAI | 「初期費用＋月額費用」「14日間の無料トライアル」 | **2026-08-15更新**: ラクス社の公開サイトに製品ページ自体が存在せず、一次で確認できない。採用しない |
| My-ope office | 「初期120,000円／月85,000円」「月160,000円〜」 | **2系統に矛盾**。一次は金額非掲載＋販売停止 |
| KARAKURI | 「POC 150〜250万円」「最低契約期間1年」「1回答あたり約20円」 | 一次は記載なし |
| Helpfeel | 「初期25万円〜／月5万円〜」 | 一次は記載なし |
| AI-FAQボット | 「初期費用0円」 | 料金ページ本文には初期費用の記載を確認できず |
| ChatPlus | 「AIチャットボットプラン 月額150,000円」 | **2026-08-15更新**: 現行プラン表と、後継製品「AI Agent Plus（旧AIチャットボット）」の製品ページの**両方**を開いたが150,000円は存在しない。採用しない |

## 参考B: 数字を並べるときの注意（分類外・穴ではない）

1. 公開されている月額の多くは**ユーザー数無制限のサイト課金**（RICOH・ChatPlus・My-ope）で、
   一方 HiTTO・HRBrain・ChatSense・Microsoft は**ユーザー数課金**。単純比較できない。
2. exaBase 生成AI の「900円/1ID」は価格改訂のお知らせ内の記載で、**期間単位（月額か）が明記されていない**。
   FAQには「契約形態：月額制および従量課金制をご用意しています」とあるが、900円/1IDと結び付けた記述ではないため、
   **「月額900円/ID」と書いてはいけない。**
3. 価格・レートは変動する。**取得日 2026-08-15 から6ヶ月経過したら取り直すこと**（規約4）。
4. 「月額◯円〜」の「〜」に注意。sinclo・RICOH STANDARD・ChatPlusオートAI・エクサベース自治体版はすべて
   **下限値**であって、その額で使える構成が明示されているわけではない。
5. Zendeskは**カスタマーサービス版（$19/$55/$115）と従業員向け版（$29/$59/$99）で別建て**。
   社内向けの比較に使うなら従業員向け版の方。混同しない。
6. AI Worker Platform（AI Messengerの移転先）のFAQにある「最低3か月程度」は
   **導入期間**であって最低契約期間ではない。契約期間として引用しない。
7. Amazon Lex のリクエスト＆レスポンス型（0.004 USD/音声・0.00075 USD/テキスト）と
   ストリーミング型（0.0065 USD/15秒間隔・0.0020 USD/テキスト）は**別の課金モデル**。並べて足さない。
