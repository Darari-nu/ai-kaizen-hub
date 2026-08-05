# 画像親レシピ「JTCの日常×頭部の超現実」v3

みどり脳の親レシピ②キャラクター・世界観型。**2026-08-05 darari裁定で確定**（v1朱一点静物・v2ハンコ頭はボツ→`drafts/images/`に退避）。
トップヒーロー・記事ヒーロー・OGP・挿絵すべてこの世界観。**記事には必ずヒーロー画像を付ける**。

## 世界観（固定・変えない）

- **舞台**: どこにでもあるJTCの日常（残業のデスク、会議室、工場の休憩室、終電、廊下…）
- **人物**: ワイシャツ/作業着の会社員。**頭部だけが超現実**に置き換わる（そこが記事のテーマを語る）
- **光**: 画面に**一点だけ有彩色の光**（金魚の金、信号の青、鳥の暖光、夜明けの空…）。それ以外はくすんだ青灰
- **画風**: 疾走感のある緻密な手描きインク線（走り書きのエネルギー）、憂いと希望の詩情。写真ではなくイラスト
- **NG**: 文字・ロゴ／ハンコ・革靴・ビジネス鞄（2026-08-05裁定「印鑑とか靴とか鞄から抜けよう」）／実在製品・実在企業

## スタイルリファレンス（生成時にCodexに必ず開かせる）

- `drafts/images/reference-2-birdcage.jpeg`（鳥かご頭・高架下）
- `drafts/images/reference-3-aquarium.jpeg`（水槽頭・コインランドリー）
- `drafts/images/reference-4-flowers.jpeg`（花の頭・ダイナー）
- `public/images/hero.png`（確定トップヒーロー。シリーズの基準として毎回参照させる）

## ベースプロンプト（{SCENE+HEAD}を差し替える）

```
dense energetic hand-drawn ink line illustration, muted blue-gray tones,
an office worker in {SCENE}, his head is {SURREAL HEAD} with a single
softly glowing colored accent, everyday Japanese workplace, melancholic
yet hopeful poetic atmosphere, no text, no letters, no logos
```

- **比率ルール（2026-08-05記録・理由つき）**
  - トップヒーロー = **縦4:5**。現レイアウト（パターン2）は画像を画面右側42%〜にobject-cover配置し、モバイルでは全面に敷くため、表示領域がほぼ正方形〜縦長。16:9だと主役がクロップ外に出る
  - 記事ヒーロー・OGP = **横16:9**。記事タイトル下の横長スロットとX/DiscordのOGPカードの比率
  - ※例外: レイアウトを「画像を背景に全面敷き」に変更した場合のみ、トップヒーローは16:9〜21:9に切り替える（左側が暗い画像が必要）
- 頭部の超現実は**記事のテーマの隠喩**として選ぶ（下の台帳参照）

## 子レシピ台帳（生成したら追記）

| 用途 | 頭部＝隠喩 | ファイル |
|---|---|---|
| トップヒーロー(4:5) | 扉の開いた鳥かご＋飛び立つ光る鳥＝正規ルートで自由になる | `hero.png` |
| 001 AIルール3点セット | 信号機・青だけ点灯＝ルールが「進んでいい」の合図になる | `articles/001-ai-rules-starter.png` |
| 002 ChatGPT禁止 | 閉じた鳥かご・中で鳥が灯る＝禁止で閉じ込められた可能性 | `articles/002-chatgpt-kinshi.png` |
| OGP共通(16:9) | 頭が夜明けの空＝頭の中にはもう夜明けが来ている | `og-default.png` |
| 挿絵在庫 | 頭から花咲く残業デスク／金魚水槽頭と自販機 | `drafts/images/hero-candidates/v2-a.png` / `v2-b.png` |
| 001 JTC AI事情 | 潜望鏡頭＝キュービクルの中から観察して実況 | `articles/001-jtc-ai-jijou.png` |
| 3軸ビジュアル(1:1) | 記録=光るペン先／AIカイゼン=工具箱の若葉／ガバナンス=天秤の灯り（人物なし静物・小物版の子レシピ） | `axis/kiroku.png` `axis/kaizen.png` `axis/governance.png` |

## 検品（親レシピ固有）

- 有彩色の光が一点だけか
- 文字・ロゴ・ハンコ・革靴・ビジネス鞄が出ていないか
- 線の密度と青灰トーンが既存シリーズと並べて揃っているか
- 頭部の隠喩が記事テーマと繋がっているか（説明できない隠喩は選び直す）
