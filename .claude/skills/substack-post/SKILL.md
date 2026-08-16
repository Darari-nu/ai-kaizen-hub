---
name: substack-post
description: >
  Substack（dararinu.substack.com）への配信作業に必ず使う。「サブスタ投稿」「サブスタに配信」
  「配信用を作って」「サブスタ下書きに反映して」「配信ストック追加」「下書きを見せて」で発動。
  リポ内ストック（10_drafts/10_substack/）を正とし、内蔵ブラウザでSubstack下書きへ投入する。
  送信ボタンは絶対に押さない（darari本人が押す）。HP記事の公開（draft解除→push）やX投稿では発動しない。
---

# substack-post — リポ→Substack下書きの配信パイプライン

## 大原則（2026-08-15/16 darari裁定）

1. **記事そのまま方式**: 配信＝サイトに公開済みの記事をそのまま届ける。
   通達第N号フレーミング・演出ジョークは全面ボツ（`10_drafts/20_添削の学び/RULES.md` G・即鉄則）
2. **手順は必ず「リポ→サブスタ下書き」**: リポ内の配信用ファイルが正本。
   Substackエディタに直接書かない。直した時も必ずリポ側を先に直してから反映する
3. **送信はdarari本人**: 「続ける」「送信」ボタンは絶対に押さない。テストメール送信も本人の指示があった時だけ
4. 全文配信（途中で切って「続きはサイトで」はしない）。末尾にサイト回遊リンク1行のみ追加可

## ストック構造

```
10_drafts/10_substack/
  <記事番号>_<配信予定日YYYYMMDD>/   例: 001_20260815/
    配信用.md                        ← 正本（Title/Subtitle/サムネ/本文）
    （Substack限定の画像があればここに置く。記事OGPはpublic/側を参照でよい）
```

`配信用.md` のヘッダーに必ず書く: 状態（配信待ち/配信済み）・下書きリンク・更新履歴・元記事パス・サムネパス。
配信済みになったら状態を更新し、**配信URLを記録してコミットするまでが1配信**。

## 配信フロー

### 1. ストック作成（執筆はしない。転記だけ）

- 元記事の**現行版**を `src/content/articles/` から読む（必ず読み直す。検品反映で変わっていることがある）
- `配信用.md` を作る: Title=記事titleから**「——」を除去**（削除または「。」に置換。darari 8/16「AIっぽいので」・RULES F1鉄則）、Subtitle=記事description、サムネ=記事ogImage、
  本文=記事本文そのまま＋末尾に「このニュースレターは、無料で学べるサイト「AIカイゼン」の記事をお届けしています。／👉 [サイトで他の記事も読む](https://darari-nu.com/)」
- 配信前チェック: `grep -nE '私は|僕は|※|一概には' 配信用.md` が0件、リンク先URLがcurlで200

### 2. Substack下書き投入（内蔵ブラウザ）

- `preview_start {url: "https://dararinu.substack.com/publish/post?type=newsletter"}`（既存下書きの更新なら
  `/publish/posts/drafts` から該当を開く）。ログインが要る時はdarariに依頼（認証情報は扱わない）
- **タイトル/サブタイトル**: Reactのtextareaなのでキー入力やcmd+Aは事故る。native setterで:

```js
const ta = document.querySelector('textarea[placeholder="タイトル"]');
Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(ta,'ここにタイトル');
ta.dispatchEvent(new Event('input',{bubbles:true}));
// サブタイトルは placeholder="サブタイトルを追加…" で同様
```

- **本文**: Markdown直typeは整形されず崩れるので**禁止**。HTML合成ペースト一択:

```js
const ed = document.querySelector('div[contenteditable="true"]');
ed.focus();
const dt = new DataTransfer();
dt.setData('text/html', html);  // <p><h2><strong><ul><ol><a>で組んだ本文
ed.dispatchEvent(new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true}));
```

- **サムネ（本文先頭画像）**: darari-nu.comにデプロイ済み画像をfetch→File化→ペースト。
  **必ず選択位置を先頭に同期してから**（同期を待たないと末尾に刺さる）:

```js
const first = ed.firstElementChild;
const sel = getSelection(); const r = document.createRange();
r.setStart(first.firstChild||first,0); r.collapse(true);
sel.removeAllRanges(); sel.addRange(r);
document.dispatchEvent(new Event('selectionchange'));
await new Promise(r=>setTimeout(r,600));            // ← ProseMirror同期待ち。必須
const blob = await (await fetch('https://darari-nu.com/images/articles/XXX.jpg')).blob();
const dtI = new DataTransfer();
dtI.items.add(new File([blob],'thumb.jpg',{type:'image/jpeg'}));
ed.dispatchEvent(new ClipboardEvent('paste',{clipboardData:dtI,bubbles:true,cancelable:true}));
```

- 本文だけ差し替える時（画像温存）: 先頭テキスト段落〜最終要素をRangeで選択→selectionchange→600ms待ち→HTMLペースト（選択が置換される）

### 3. 検証（貼りっぱなし禁止）

```js
// innerTextが配信用.mdと一致するか / リンクhref / 画像が先頭(figureIndex==0)か / substackcdnにアップロードされたか
```

を確認し、結果をdarariに報告する。ずれていたらcmd+Zで戻してやり直し。

### 3.5 タグ

投稿の「設定」→「タグを追加」で、**記事のseries（記録／カイゼン／ガバナンス）を1個だけ**付ける。
凝らない（タグはSubstackサイト内の整理用。SEO効果は薄い）。ドロップダウンはEscapeで閉じない
（選択が取り消されることがある）。閉じるのは「完了」ボタンで。

### 4. 本人確認→送信

- シークレット下書きリンクを取得して渡す（シェアポップアップのReact入力は`input.value`で読めないので、
  `document.scripts`のテキストを `/dararinu\.substack\.com\/p\/[a-z0-9-]+/` で検索して抽出する）
- プレビュー（モバイル/デスクトップ/メール）をペインで開いておく
- **「続ける」「送信」はdarariが押す。押したか聞くだけ。代行しない**

### 5. 配信後

- `配信用.md` の状態を「配信済み」にし、配信URLを記録
- 元記事が後から更新されたら: 配信済み分は追わない（メールは送信済みのため）。配信待ち分は必ず再同期
- コミット（別セッションのWIPを混ぜない）

## 罠（実戦で踏んだもの）

- 座標クリック→typeは入力位置がずれて本文が壊れることがある。テキスト投入は上のJS方式で行い、投入後に必ず全文照合
- 記事が検品で変わっていることがある。**投入直前に必ず元記事を読み直して差分チェック**
- クリップボードの読み取りは権限で不可。シェアリンクはscripts走査で取る
- `computer scroll` はペイン非表示時にタイムアウトする。スクロールはJS（scrollTop=0等）が確実
- **ペインのブラウザはmacのクリップボードと分離**。osascriptで画像をクリップボードに載せてcmd+Vしても届かない（何も起きないか別物が入る）。使わない
- **ページのCSPでlocalhostへのfetchは不可**。ローカルにしかない画像は、リポ（Darari-nu/ai-kaizen-hub・公開）にコミット&push→
  `https://raw.githubusercontent.com/Darari-nu/ai-kaizen-hub/main/<パス>`（日本語ファイル名はencodeURIComponent）をfetch→File化→ペースト。
  darari-nu.com/raw.githubusercontent.comへのfetchは通ることを確認済み
- **画像差し替えでRangeによるfigure選択→ペーストは「置換」にならず後ろに追加される**ことがある。差し替えは
  ①新画像をペースト→②古いfigureを実クリックで選択→Backspace、の2段でやり、最後にimg数=1を検証する
