# ヒーロー差し替え用 Midjourneyプロンプト一式（2026-08-06）

darari方針: Codex産ヒーローは仮。MJの当たりが出たら差し替える。
**差し替え方法: 生成した画像を下記の同名ファイルに上書き保存 → push（それだけ）**
記事用は16:9、トップだけ4:5。定型サフィックス込み。

| ファイル | シーン |
|---|---|
| ~~`public/images/hero.png`~~ | ✅差し替え済み(2026-08-06): MJ産「開いた鳥かご頭の男×白い鳥」16:9を`hero.webp`として採用。レイアウト側で対応済みのため4:5は不要になった |
| `public/images/articles/001-jtc-ai-jijou.png` | キュービクルの潜望鏡頭 |
| `public/images/articles/002-ai-rules-starter.png` | 3枚の紙×信号機頭（青点灯） |
| `public/images/articles/003-chatgpt-kinshi.png` | 閉じたPCの前×閉じた鳥かご頭 |
| `public/images/articles/004-claude-team.png` | 4つの扉、最後だけ開いて光る |
| `public/images/articles/005-hiyou-taikoka.png` | 2枚の紙、片方だけ光る |
| `public/images/articles/006-meishi-bot.png` | 名刺→光る鳥の群れ→台帳 |
| `public/images/articles/007-rpa-daitai.png` | 無人デスクで光る手がタイピング |

プロンプト本文はチャットログ(2026-08-06)参照。共通形:
```
surrealism / surrealist dreamlike scene, <シーン英語>, thin ink lines --ar 16:9 --chaos 31 --sref https://s.mj.run/oRCXaN2Ky3k https://s.mj.run/J-yLghsMAL0 --stylize 1000 --p fdtv4ci --v 8.2
```
（トップのみ --ar 4:5）

新記事のヒーローが必要になったら: 親レシピv3（.claude/skills/image-gen-midori/article-hero-recipe.md）の隠喩選定ルール（頭部or一点の光=記事テーマの隠喩）でシーンを決め、この共通形に流し込む。

## 新記事013〜017用（2026-08-08追加。スマホMJでもいけます。保存先は `public/images/articles/<番号>-<slug>.jpg`）

**013 VPS事件**（開けっ放しの入口に群がるもの／隠喩=無防備な公開）
```
surrealism / surrealist dreamlike scene, a man sleeping peacefully in an armchair beside a small glowing server shed whose door stands wide open at night, a swarm of dark paper moths streaming into the doorway from the darkness, one tiny key left in the lock glowing faintly, thin ink lines --ar 16:9 --chaos 31 --sref https://s.mj.run/oRCXaN2Ky3k https://s.mj.run/J-yLghsMAL0 --stylize 1000 --p fdtv4ci --v 8.2
```

**014 入力判断・抽象化**（固有名詞に貼られた白ラベル／隠喩=名前を伏せれば通れる）
```
surrealism / surrealist dreamlike scene, an office worker whose head is a paper document with all names neatly covered by small clean white labels, one label glowing softly, walking calmly through a gate made of filing cabinets, thin ink lines --ar 16:9 --chaos 31 --sref https://s.mj.run/oRCXaN2Ky3k https://s.mj.run/J-yLghsMAL0 --stylize 1000 --p fdtv4ci --v 8.2
```

**015 情シス質問リスト**（疑問符の行列と1冊の光る台帳／隠喩=先回りの答え）
```
surrealism / surrealist dreamlike scene, a long queue of floating question mark placards waiting in front of a tiny office counter window at night, behind the counter a calm clerk holding a single glowing ledger book, thin ink lines --ar 16:9 --chaos 31 --sref https://s.mj.run/oRCXaN2Ky3k https://s.mj.run/J-yLghsMAL0 --stylize 1000 --p fdtv4ci --v 8.2
```

**016 Excel集計引退**（紙の山脈と1枚の光る数式／隠喩=手作業が手順に変わる）
```
surrealism / surrealist dreamlike scene, mountains made of stacked spreadsheet papers, a tiny office worker climbing a staircase folded from the sheets, at the summit a single page with one glowing formula, thin ink lines --ar 16:9 --chaos 31 --sref https://s.mj.run/oRCXaN2Ky3k https://s.mj.run/J-yLghsMAL0 --stylize 1000 --p fdtv4ci --v 8.2
```

**017 議事録**（レコーダー頭の会議と3つの光るチェック箱／隠喩=清書から確認へ）
```
surrealism / surrealist dreamlike scene, a meeting room where people with cassette recorder heads sit around a long table, in the center one sheet of paper with three empty checkboxes glowing softly, thin ink lines --ar 16:9 --chaos 31 --sref https://s.mj.run/oRCXaN2Ky3k https://s.mj.run/J-yLghsMAL0 --stylize 1000 --p fdtv4ci --v 8.2
```

**018 名刺Bot解説**（写真がシートの1行になるまでの旅／隠喩=中身が透けて見える機械）
```
surrealism / surrealist dreamlike scene, a small transparent machine on a desk showing its inner clockwork, a business card entering one side and a single glowing spreadsheet row emerging from the other, a curious cat watching beside it, thin ink lines --ar 16:9 --chaos 31 --sref https://s.mj.run/oRCXaN2Ky3k https://s.mj.run/J-yLghsMAL0 --stylize 1000 --p fdtv4ci --v 8.2
```
