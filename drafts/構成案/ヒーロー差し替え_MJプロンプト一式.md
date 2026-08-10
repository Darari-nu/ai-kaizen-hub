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

**019 自動化の引っ越し**（設計図を手に隣の家へ／隠喩=同じ間取りをAIと建て直す）
```
surrealism / surrealist dreamlike scene, a tiny office worker carrying a rolled blueprint walking from a coin-operated vending-machine house toward an open handmade wooden house, identical furniture visible in both, one window glowing, thin ink lines --ar 16:9 --chaos 31 --sref https://s.mj.run/oRCXaN2Ky3k https://s.mj.run/J-yLghsMAL0 --stylize 1000 --p fdtv4ci --v 8.2
```

**020 このサイトをAIと作った**（画面の中で組み上がる家／隠喩=読んでいる場所が実物）
```
surrealism / surrealist dreamlike scene, a man watching a glowing house being assembled inside a computer monitor by many small mechanical hands, blueprints floating around the desk at night, thin ink lines --ar 16:9 --chaos 31 --sref https://s.mj.run/oRCXaN2Ky3k https://s.mj.run/J-yLghsMAL0 --stylize 1000 --p fdtv4ci --v 8.2
```

**021 レベル規程**（3つの箱に仕分ける／隠喩=同じ箱に入れない）
```
surrealism / surrealist dreamlike scene, an office worker calmly sorting floating paper documents into three large boxes labeled with one two three, one box glowing softly, a single sealed box pushed far away, thin ink lines --ar 16:9 --chaos 31 --sref https://s.mj.run/oRCXaN2Ky3k https://s.mj.run/J-yLghsMAL0 --stylize 1000 --p fdtv4ci --v 8.2
```

**022 AIブラウザ伴走**（同じ画面を見るふたつの視線／隠喩=隣で見ていてくれる）
```
surrealism / surrealist dreamlike scene, an office worker and a translucent glowing figure sitting side by side looking at the same computer screen, the glowing figure pointing at one button on the screen, night office, thin ink lines --ar 16:9 --chaos 31 --sref https://s.mj.run/oRCXaN2Ky3k https://s.mj.run/J-yLghsMAL0 --stylize 1000 --p fdtv4ci --v 8.2
```

**018 名刺Bot解説**（写真がシートの1行になるまでの旅／隠喩=中身が透けて見える機械）
```
surrealism / surrealist dreamlike scene, a small transparent machine on a desk showing its inner clockwork, a business card entering one side and a single glowing spreadsheet row emerging from the other, a curious cat watching beside it, thin ink lines --ar 16:9 --chaos 31 --sref https://s.mj.run/oRCXaN2Ky3k https://s.mj.run/J-yLghsMAL0 --stylize 1000 --p fdtv4ci --v 8.2
```

## ガバナンス連載023〜031用（2026-08-10追加。保存先は `public/images/articles/<番号>-<slug>.jpg`）

**023 マネジメントサイクル総論**（カレンダーの観覧車／隠喩=作って終わりでなく回り続ける）
```
surrealism / surrealist dreamlike scene, a slowly turning ferris wheel built from calendar pages above a tiny office desk at night, one gondola glowing softly, an office worker calmly turning a small hand crank, thin ink lines --ar 16:9 --chaos 31 --sref https://s.mj.run/oRCXaN2Ky3k https://s.mj.run/J-yLghsMAL0 --stylize 1000 --p fdtv4ci --v 8.2
```

**024 法規制は発売国だけ**（世界地図を畳む／隠喩=見る範囲を絞り、一番厳しい所に物差しを立てる）
```
surrealism / surrealist dreamlike scene, a vast paper world map spread across an office floor, an office worker folding it down into one small square where only a few countries remain, one region glowing softly, a single tall measuring stick planted there, thin ink lines --ar 16:9 --chaos 31 --sref https://s.mj.run/oRCXaN2Ky3k https://s.mj.run/J-yLghsMAL0 --stylize 1000 --p fdtv4ci --v 8.2
```

**025 作る側と使う側**（ひとつの門から分かれる2本の廊下／隠喩=入口で道が分かれる）
```
surrealism / surrealist dreamlike scene, one small gate opening into two long corridors, one corridor lined with factory machines and the other lined with office desks, a signpost with two arrows where only one arrow glows, an office worker standing at the fork, thin ink lines --ar 16:9 --chaos 31 --sref https://s.mj.run/oRCXaN2Ky3k https://s.mj.run/J-yLghsMAL0 --stylize 1000 --p fdtv4ci --v 8.2
```

**026 動向ウォッチ**（望遠鏡頭の静かな見張り／隠喩=誰も教えてくれないから自分で見る）
```
surrealism / surrealist dreamlike scene, an office worker with a small telescope head standing alone on a tiny watchtower above a quiet sea of floating newspapers at night, one distant light on the horizon glowing softly, thin ink lines --ar 16:9 --chaos 31 --sref https://s.mj.run/oRCXaN2Ky3k https://s.mj.run/J-yLghsMAL0 --stylize 1000 --p fdtv4ci --v 8.2
```

**027 教育と形式指摘**（絵は光っているのに額縁だけ指される／隠喩=形式指摘は中身が通った合図）
```
surrealism / surrealist dreamlike scene, a presenter showing a softly glowing painting to a boardroom, the audience of suited figures with picture-frame heads all pointing politely at the frame corners instead of the painting, thin ink lines --ar 16:9 --chaos 31 --sref https://s.mj.run/oRCXaN2Ky3k https://s.mj.run/J-yLghsMAL0 --stylize 1000 --p fdtv4ci --v 8.2
```

**028 活用状況アンケート**（自分から差し出す1枚／隠喩=監視でなく自己申告で分かる）
```
surrealism / surrealist dreamlike scene, dusk office where many paper survey sheets drift gently into a small wooden mailbox, one office worker stepping forward holding up a single softly glowing sheet with both hands, thin ink lines --ar 16:9 --chaos 31 --sref https://s.mj.run/oRCXaN2Ky3k https://s.mj.run/J-yLghsMAL0 --stylize 1000 --p fdtv4ci --v 8.2
```

**029 運用チェック**（巨大チェックリストで2箇所だけ光る／隠喩=全部見ずに絞る）
```
surrealism / surrealist dreamlike scene, an enormous paper checklist scroll cascading down a staircase, an inspector with a magnifying glass head calmly circling only two glowing checkboxes among hundreds, thin ink lines --ar 16:9 --chaos 31 --sref https://s.mj.run/oRCXaN2Ky3k https://s.mj.run/J-yLghsMAL0 --stylize 1000 --p fdtv4ci --v 8.2
```

**030 審議・パブコメ**（円卓を回る書類と、歩いて回るひとり／隠喩=たらいまわしを止める聞き役）
```
surrealism / surrealist dreamlike scene, a ring of office desks where one document floats endlessly from desk to desk in a circle, a single calm office worker walking against the flow carrying a small glowing tray collecting handwritten notes, thin ink lines --ar 16:9 --chaos 31 --sref https://s.mj.run/oRCXaN2Ky3k https://s.mj.run/J-yLghsMAL0 --stylize 1000 --p fdtv4ci --v 8.2
```

**031 AIコンサル**（渡された完璧な紙を、手で書き直す／隠喩=正解の翻訳は自分の仕事）
```
surrealism / surrealist dreamlike scene, a tall consultant figure handing over a flawless crystal-clear document, a small office worker at a desk quietly rewriting it by fountain pen onto plain warm paper, the handwritten page glowing softly, thin ink lines --ar 16:9 --chaos 31 --sref https://s.mj.run/oRCXaN2Ky3k https://s.mj.run/J-yLghsMAL0 --stylize 1000 --p fdtv4ci --v 8.2
```
