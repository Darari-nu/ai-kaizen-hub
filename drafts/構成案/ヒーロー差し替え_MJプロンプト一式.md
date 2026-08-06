# ヒーロー差し替え用 Midjourneyプロンプト一式（2026-08-06）

darari方針: Codex産ヒーローは仮。MJの当たりが出たら差し替える。
**差し替え方法: 生成した画像を下記の同名ファイルに上書き保存 → push（それだけ）**
記事用は16:9、トップだけ4:5。定型サフィックス込み。

| ファイル | シーン |
|---|---|
| `public/images/hero.png` | 終電×開いた鳥かご（4:5） |
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
