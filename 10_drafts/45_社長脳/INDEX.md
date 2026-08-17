# 社長脳 — ツェッテルカステン索引

実在の社長メッセージをWeb調査で集め、**型（テーマ・構文・様式）だけを抽出**したナレッジベース。
tamaリポの memory/ 方式（1ファイル1事実・frontmatter・索引にトリガーを書く）に倣う。
目的: ダラリ重工業社長 **陀楽進** の「ありがたい話」を安定して量産する → 将来「AI社長にしてみた」の土台。

⚠️ 運用ルール: 実在の企業・経営者の文章は**引用しない**（型の抽出のみ。出典はリンクで残す）。
実在人物の戯画化はしない（RULES A系）。陀楽進はあくまで「JTCあるあるの平均値」。

## 人格の正本（書くときは必ずここから）

- [IDENTITY_陀楽進.md](IDENTITY_陀楽進.md) — **社長メッセージを書く前に必読**。人格・思想・文体規則・ありがたい話の型

## 型ノート（notes/）

- [nento-no-kata.md](notes/nento-no-kata.md) — **年頭挨拶を書くとき**。マクロ経済→変化→追い風→方針→健康、の5段構成
- [henka-tsuikaze.md](notes/henka-tsuikaze.md) — **「変化」を語るとき**。変化=脅威と言わず「追い風に変える」構文
- [genten-kaiki.md](notes/genten-kaiki.md) — **迷走期・不祥事後・周年に使う**。原点回帰・Back to Basics構文
- [sangen-shugi.md](notes/sangen-shugi.md) — **製造業社長の背骨**。三現主義（現場・現物・現実）。現場に行けと言う社長ほど行かない問題
- [hitozukuri.md](notes/hitozukuri.md) — **人材の話をするとき**。「モノづくりは人づくり」・技能伝承・面談推し
- [dx-ai-jinzai.md](notes/dx-ai-jinzai.md) — **AI・DXを語るとき**。道具でなく「人とセット」で語る型。慎重派社長のAI言及テンプレ
- [souritsu-kunwa.md](notes/souritsu-kunwa.md) — **創立記念のとき**。感謝→先人の苦労→社員のおかげ→未来への務め、の4段
- [anzen-kunji.md](notes/anzen-kunji.md) — **安全大会のとき**。「ご安全に」・安全第一は全てに優先・慢心を戒める
- [eto-kojiseigo.md](notes/eto-kojiseigo.md) — **年頭の枕に使う**。干支・故事成語の使い方（2026=丙午）
- [keisu-no-mahou.md](notes/keisu-no-mahou.md) — **数値目標を語るとき**。「前年比◯%」が方針階層を下るほど濃くなる現象（ダラリ重工業の様式美と接続）

## 使い方

1. メッセージの種類を決める（年頭／創立記念／安全大会／中計／随時訓話）
2. 該当する型ノートを読む → IDENTITY_陀楽進.md の文体規則で書く
3. 出力先: `/company/message/`（src/pages/company/message.astro）
4. 新しい型を見つけたら notes/ に1ファイル追加してここに1行足す
