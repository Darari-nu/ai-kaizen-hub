import { readFileSync, readdirSync, writeFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = '/Volumes/DevSSD/Vibe_Website/260805_Darari-nu_HP';
const DIR = join(ROOT, 'src/content/articles');
const PUBLIC = join(ROOT, 'public');
const OUT = '/tmp/kenpin.html';

// ヒーロー画像をdataURIで埋め込む（Artifactは外部ホストへの通信が禁止のため）
// 元画像は数MBあるので、macOSのsipsで幅720pxのjpegサムネを作ってから埋める
const CACHE = '/tmp/kenpin-thumbs';
mkdirSync(CACHE, { recursive: true });

// 記事本文中の挿絵（![alt](/images/...)）と動画（<video src="/videos/...">）も
// dataURIで埋め込む（2026-08-12 darari指摘「挿絵は見れないのか？動画も」対応）。
// 挿絵は幅560pxサムネ、動画は3MBまでそのまま埋める（超えたら注記のみ）。
function inlineMediaMap(raw) {
  const map = {};
  const imgPaths = [...raw.matchAll(/!\[[^\]]*\]\((\/[^)]+)\)/g)].map((m) => m[1]);
  for (const p of imgPaths) {
    const src = join(PUBLIC, p.replace(/^\//, ''));
    if (!existsSync(src)) { map[p] = { missing: true }; continue; }
    const thumb = join(CACHE, 'inline_' + p.replace(/\//g, '_') + '.jpg');
    try {
      if (!existsSync(thumb) || statSync(thumb).mtimeMs < statSync(src).mtimeMs) {
        execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '55', '-Z', '560', src, '--out', thumb], { stdio: 'ignore' });
      }
      map[p] = { img: `data:image/jpeg;base64,${readFileSync(thumb).toString('base64')}` };
    } catch { map[p] = { missing: true }; }
  }
  const vidPaths = [...raw.matchAll(/<video[^>]*src="(\/[^"]+)"/g)].map((m) => m[1]);
  for (const p of vidPaths) {
    const src = join(PUBLIC, p.replace(/^\//, ''));
    if (!existsSync(src)) { map[p] = { missing: true }; continue; }
    const kb = statSync(src).size / 1024;
    if (kb > 3072) { map[p] = { tooBig: true, kb: Math.round(kb) }; continue; }
    map[p] = { video: `data:video/mp4;base64,${readFileSync(src).toString('base64')}` };
  }
  return map;
}
function embedImage(ogImage) {
  if (!ogImage) return null;
  const base = ogImage.replace(/^\//, '').replace(/\.[^.]+$/, '');
  for (const ext of ['.webp', '.png', '.jpg', '.jpeg']) {
    const src = join(PUBLIC, base + ext);
    if (!existsSync(src)) continue;
    const origKb = Math.round(statSync(src).size / 1024);
    const thumb = join(CACHE, base.replace(/\//g, '_') + '.jpg');
    try {
      if (!existsSync(thumb) || statSync(thumb).mtimeMs < statSync(src).mtimeMs) {
        execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '62', '-Z', '720', src, '--out', thumb], { stdio: 'ignore' });
      }
      const buf = readFileSync(thumb);
      return { uri: `data:image/jpeg;base64,${buf.toString('base64')}`, path: base + ext, kb: origKb };
    } catch {
      return { failed: true, path: base + ext, kb: origKb };
    }
  }
  return null;
}

// status: 'ok'=本人検品済み / 'fix'=指示を反映したので再検品 / 'new'=初回検品待ち
const NOTES = {
  '001-jtc-ai-jijou': { status: 'ok', note: '8/7本人検品OK。以降の修正指示なし。' },
  '002-ai-rules-starter': { status: 'ok', note: '8/7検品OK。Q4に「どのくらい効果あるの？と聞かれるパターン→また後日書きますね」を追加済み。' },
  '004-claude-team': { status: 'ok', note: '8/8本人検品OK。専門用語の平易化まで反映済み。' },
  '005-hiyou-taikoka': { status: 'ok', note: '8/8本人検品OK。本人の加筆(「目に見える証明が難しい」「自分が社長だったらそう思っちゃいます」「人件費」)を取り込み済み。' },
  '006-meishi-bot': { status: 'ok', note: '✅8/13検品OK「もんだいなし」。ありがとうございます！' },
  '007-rpa-daitai': { status: 'ok', note: '✅8/13検品OK「修正なし」。ありがとうございます！' },
  '008-shanai-system': { status: 'fix', note: '⚙️8/13夜の検品反映・初見殺し化: ①会議録システムに謎項目「分類1(1・2・3・4・9)/分類2(A・B・C)/分類3(1・2・3)」を実装。画面にヒントなし、注意書きは「選択を誤った会議録は差戻しとなります」と脅すだけ ②答えはマニュアル付録A(76ページ)にだけ記載(分類1=主管部門コード。9=その他は事前照会が必要。コードの由来は1998年導入・2011年廃止の旧システム、というオチつき) ③本文に「この分類1、なんだと思います？…慣れればわかる。でも初見殺しですよね」の流れを追記し、スクショも分類1を赤枠強調した実物で撮り直しました。' },
  '011-dare-ga-itta': { status: 'ok', note: '✅8/13検品OK「修正なし」(図解3枚込み)。ありがとうございます！' },
  '012-kuni-mo-yare': { status: 'ok', note: '✅8/13検品OK「おけ！」。ありがとうございます！(タイトル末尾「だから、メールを1本だけ」はこのまま公開します)' },

  // --- 8/8 新規5本（Fableサブエージェントが1本ずつ執筆） ---
  '014-nyuuryoku-handan': { status: 'ok', note: '✅8/13検品OK「いいかな！」。ありがとうございます！' },
  '015-joushisu-shitsumon': { status: 'fix', note: '🔎8/13検品「よさそう！プロンプトだけあとで見る」→ 🎁特典プロンプト(記事のいちばん最後のコードブロック)の確認だけお待ちしています。【】を埋めて実際に1回使ってみてもらうのが一番早いです。OKならこの記事は✅にします。' },
  '016-excel-shukei': { status: 'fix', note: '⚙️8/13検品反映: 「作り方を教える」から「そのまま使えるものを渡す」見せ方に変更——①冒頭に「この記事はコピペ用プロンプト3本つき。【】だけ書き換えればそのまま使えます」を宣言 ②各プロンプト直前を「渡す」トーンに ③プロンプト内の装置名・列名・ファイル名を【】穴埋め式に整形。技術内容・実演スクショ・失敗談は不変。確認1点: プロンプト1は列名・計算式まで【】にして穴埋め多めです。読みにくければ装置名・ファイル名だけに減らせます。' },
  '017-gijiroku': { status: 'fix', note: '⚙️8/13検品反映: ①「最後は自分で確認」を具体化——重要な論点は会議中に自分でも一言メモ→AIの議事録と突き合わせ→食い違った箇所だけ録音か本人に確認、の流れを追加 ②失敗談は「削除」ではなく圧縮+接続で存置しました。理由: 後半の紙メモ・「自分のメモを要約させる」の前提になっていて、新しく足した「自分でもメモ」の実体験証拠として機能するため。浮いて見えた原因(唐突な導入・在宅禁止や社長講話の脇道)を削って本流に繋ぎ直しています。それでも削りたければ一声ください。' },
  '020-hp-seisaku': { status: 'ok', note: '✅8/13検品OK「概ねOK。大きな修正は不要」。ありがとうございます！(darariのClaude Code作業画面スクショはいつでも歓迎です)' },
  '021-level-kitei': { status: 'fix', note: '⚙️8/13検品反映(D6): 「入れていい」の一般論言い切りを6箇所直し、すべて「ダラリ重工業では、この条件なら入れてよいと判断しました」の自社判断表現に統一。「あなたの会社が同じ結論になるとは限らない。持ち帰るのはレベル分け×AI区分の考え方、線は自社で引き直して」の注意も新設しました。判断表・実話は不変。確認1点: Q1「(レベル分けを社内で)決めていいんです」は可否ではなく制度の説明なので言い切りのまま残しています。' },
  '022-ai-browser': { status: 'fix', note: '⚙️8/13検品反映: 管理画面はログイン必須でこちらから実物スクショが撮れない(偽造は禁止)ため、🎁特典として「設定画面を一緒にスクショしていく案内プロンプト」を記事末尾に新設+冒頭で予告しました。darariがデスクトップアプリに貼ると、AIが1枚ずつ「どの画面を・どの状態で・どこを撮るか」を案内し、毎回キー写り込みチェックの声かけをする設計(撮るのは5枚: LINE×2/Google Cloud×2/APIキー×1)。撮れたスクショが揃ったら本文に差し込みます。確認1点: 5枚のリストでカバー範囲は足りますか？' },

  // --- 8/10 ガバナンス連載3本（聞き取り第1弾の一次体験入り。両部長答申=10_drafts/答申_ガバナンス連載と教材_20260810.md） ---
  '023-governance-cycle': { status: 'fix', note: '⚙️8/13検品反映: ①カレンダーを記事末尾の「おまけ」から中盤へ移動し、見出しを「これが全体像です: 1年に割り付けた実物カレンダー」に格上げ(「工程を掘り下げる前に、先に実物を見てください」の導入) ②図解2枚を追加——9工程を5種類に束ねた円環サイクル図(1周=1年×数年くり返す)と、たらいまわし実話の構造図(押し付け合い→着地→「誰がやるかを先に決める」)。カレンダー本体もv2(マイルストーン分解版)です。確認継続1点: カレンダーの月割り(教育10月・調査1月・点検2月・改定3月)は仮置きです。実際の時期に寄せるなら教えてください。' },
  '024-houkisei-chousa': { status: 'fix', note: '⚙️8/13検品反映: ①新節「で、日本はいまどうなの？」を追加——AI推進法(2025年9月全面施行・罰則で縛らない推進アプローチ)+AI事業者ガイドライン(ソフトロー・第1.2版2026年3月)をEU対比で短く。名称・日付は公式資料で裏取り済み ②AI Reg Atlasの比較表ページ(13カ国×7軸ヒートマップ /matrix/)へ直リンクし、「詳しい比較は表へ、記事からは絞り方だけ持ち帰る」構成に。確認1点: 日本の説明はこの2点に絞りました。実務者向けに足すべきもの(個情法との関係等)があれば一言ください。(CRA解説・RoHS前例の追記は8/12反映済み)' },
  '025-tsukuru-tsukau': { status: 'fix', note: '🎨8/13検品反映: 図解2枚を挿入しました——①作る側(発売国・用途・技術)と使う側(用途・サービス・機密レベル)の左右対比が最後に共通チェック3点(倫理・セキュリティ・法務)へ合流する見取り図 ②「AIを使いたい」の申請1枚が審議側から見ると3つの確認に分解される流れ図(「先に3つ書いて出せば話が早い」で締めに直結)。本文は前回反映版のまま不変。この検品室で見られます。' },

  // --- 8/10 ガバナンス連載・第2陣6本（聞き取り第2弾ベース。残るは基準改定編のみ=具体例聞き取り待ち） ---
  '026-doukou-watch': { status: 'fix', note: '⚙️8/12夜「薄っぺらい」→厚みを足しました: ①ウォッチの型を具体化(4レーン=法規制/大手の導入事例/ツール新機能/事故事例×周期の濃淡×国の定点=総務省・経産省AI事業者ガイドライン、IPAのAISI。すべて「見るならここ」の提案として) ②「拾いっぱなしにしない出口」3つ(ポータル1行更新/教育資料の差し替え/稟議の世間動向欄)を新設。⚙️8/12深夜・実話いただき追記: 新節「アンテナは、人からも生えます」——DeepSeekの存在を最初に教えてくれたのは海外の事業部の人だった(毎日ウォッチしていたのに)。「なんか見かけたら教えて」と言って回るのも立派なウォッチ網、の学びで031へ接続。確認1点: 「海外の事業部の人」の粒度で会社特定は大丈夫か目視ください(031と同じぼかし水準です)。' },
  '027-kyouiku': { status: 'fix', note: '⚙️8/12夜の検品反映: ①冒頭に「先に言っておきます。今回は、愚痴回です」を宣言 ②想定問答を削除(愚痴回は型を崩す。まとめで「いつもなら想定問答ですが、愚痴回なのでなしです！」と明示) ③締めは「形式にツッコむだけの人のことは、気にしなくていい。突き進みましょう！」→「……変な話で失礼しました」で軽く抜ける形に。確認1点: 「アホなやつ」はこの表現まで丸めました。もっと強くてよければ戻します。' },
  '028-katsuyou-chousa': { status: 'fix', note: '⚙️8/12夜の方向転換を反映: 核を「職場に台帳を管理してもらう」方式に書き換えました——①各職場でAIサービス利用台帳を管理 ②年1回見直してもらう ③報告をもらうだけ。「ひとりで全社を調べ続けると、AIを管理する人が潰れます」を言い切りに。アンケートは「年1回・台帳の外側(シャドーAI)を拾う道具・マネジメントサイクルに組み込む」に位置づけ直し。誤ログイン自己申告の実話は温存。' },
  '029-unyou-check': { status: 'fix', note: '⚙️8/12夜の検品反映: ①質問と規程の紐づけを明示——質問1=AI利用規程第13条(教育)、質問2=AIサービス利用基準4(台帳)、点検の根拠=第16条。「聞きたい質問が規程になければ、先に規程を改定して根拠を作る。質問と規程はセット」の1段落も追加(規程側の第16条にも管理者変更の反映・周知を追記済み) ②質問を4問化: 教育受けた？/台帳ある？/管理者変更あれば台帳更新した？/(規程を作ったばかりなら)規程があること知ってる？' },
  '030-shingi': { status: 'fix', note: '⚙️8/12夜の検品反映: ①コツ追記「担当者の名前をちゃんと呼ぶ。法務の〇〇さん、どうですか？——名前で呼ばれた瞬間に自分ごとになる」 ②聞かれがち2問を追加——「結局、全部自分がやるのでは？」→「そうなんです！なのでわが社には自作チャットボットがいます。この話はまた後日」/「どうしてもうまくいかないときは？」→「上司を使いましょう。そのために高い給料をもらっているのですから」。確認1点: チャットボットの言及はこの1文の深さで止めています(詳細は後日記事)。OKですか。' },
  '031-ai-consul': { status: 'fix', note: '⚙️8/12夜「解像度が低い→Webで網羅的に調べて」→調べて書き直しました。「AIコンサルは何をしてくれるのか」を公開情報ベースの7分類(診断/規程・体制構築/リスクアセスメント/法規制レポート/教育研修/個別助言/ISO 42001認証・PoC伴走)+相場感に拡充し、「メニューは立派。でも最後の一歩=社内語への翻訳はどのメニューにも入っていない」の構図に接続。DeepSeek実話・守秘義務の線は変えていません。確認1点: 相場(スポット数十万〜プロジェクト数百万円)は公開ガイドの一般情報です。載せてよいですか(実契約額とは無関係)。' },
  '032-kijun-kaitei': { status: 'new', note: '【新規・ガバナンス連載・これで10/10完走】基準改定編。「改定の大半は書き回し修正。だから軽く頻繁に回す」の正直路線。確認3点: ①失敗談が「構えていたら拍子抜けだった」だけで薄いです。「小さすぎて出すのを迷った修正」「改定タイミングを逃した話」等があれば足します ②「改定は結構あった」の頻度、年に何回くらいか目安ありますか(A2でずらして書きます) ③「手続きを重さで二段階に分ける」型は一般論として書きました。前職で実際にやっていたなら実話に昇格させます。' },

  // --- Substack配信下書き（10_drafts/substack/。HP記事ではなくニュースレターの原稿） ---
  'substack-tsuutatsu-1': { status: 'new', note: '【Substack創刊号・これが出ると創刊です】ダラリ重工業の社内通達という体で届く自己紹介+AI利用規程の案内。🔎8/14創刊前の最終点検済み: 本文の記載事実(全17条・第1/9/10/17条の内容・「法務部の直しが7回」・クレカ四半期はイントラの決裁権限表に実物あり・002のタイトル・リンクURL)がすべて現在のサイト実体と一致していることを再確認しました。機械検査0件。確認3点: ①「あなたの会社の闇が、ダラリ重工業の公式文書になります」の締めはこの強さでOKですか ②編集後記のクレカ四半期ネタ(004/005と同じずらし済み数字)でOKですか ③配信は第1号→第2号の順でいいですか(第2号側は入れ替え可の設計)。※創刊はHP第1弾4本(001/002/004/005)の公開が先です。4本は検品済みなので「第1弾GO」の一言でぼくが公開作業までやります。' },
  'substack-tsuutatsu-2': { status: 'new', note: '【Substack第2号】記事001の配信版。「個人なら翌日、会社だと半年後」の現状報告体。🔎8/14点検済み: 001と数字・固有名詞(Copilot Chat/DeepL/四半期/半年)の整合、リンクURL・記事タイトルの一致を再確認。機械検査0件。確認2点: ①返信を促す問いかけ「おたくの会社では、AIはどこまで使えますか？」でいきますか ②編集後記の「時差なら、縮められる」の捉え直し、実感と合っていますか' },
};

const files = readdirSync(DIR).filter((f) => f.endsWith('.md') && !f.startsWith('_')).sort();
const articles = files.map((f) => {
  const raw = readFileSync(join(DIR, f), 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const fm = Object.fromEntries(
    m[1].split('\n').filter((l) => l.includes(':')).map((l) => {
      const i = l.indexOf(':');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^'(.*)'$/, '$1')];
    })
  );
  const slug = f.replace('.md', '');
  const meta = NOTES[slug] || { status: 'new', note: '' };
  return { slug, fm, raw, status: meta.status, note: meta.note, hero: embedImage(fm.ogImage), media: inlineMediaMap(raw) };
});

// Substack配信下書き（frontmatterなし。配信タイトル案の行をタイトルに使う）
const SUBSTACK_DIR = join(ROOT, '10_drafts/substack');
if (existsSync(SUBSTACK_DIR)) {
  for (const f of readdirSync(SUBSTACK_DIR).filter((f) => f.endsWith('.md')).sort()) {
    const raw = readFileSync(join(SUBSTACK_DIR, f), 'utf8');
    const title = (raw.match(/^配信タイトル案: (.+)$/m) || [, f.replace('.md', '')])[1];
    const no = (f.match(/\d+/) || ['?'])[0];
    const slug = `substack-tsuutatsu-${no}`;
    const meta = NOTES[slug] || { status: 'new', note: '' };
    articles.push({
      slug,
      fm: { title, series: 'Substack', number: `S-${no}` },
      raw, status: meta.status, note: meta.note, hero: null, media: inlineMediaMap(raw),
    });
  }
}

const STATUS = {
  ok: { label: '✅ 検品ずみ', cls: 'st-ok' },
  fix: { label: '🔄 指示を反映（再検品おねがいします）', cls: 'st-fix' },
  new: { label: '🆕 検品まち', cls: 'st-new' },
};
const done = articles.filter((a) => a.status === 'ok').length;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const toc = articles.map((a) => `
  <a class="toc-item" href="#${a.slug}">
    <span class="toc-no">No.${String(a.fm.number).padStart(3, '0')}</span>
    <span class="toc-title">${esc(a.fm.title)}</span>
    <span class="badge ${STATUS[a.status].cls}">${STATUS[a.status].label.replace(/（.*/, '')}</span>
  </a>`).join('');

const sections = articles.map((a) => `
<article id="${a.slug}" data-slug="${a.slug}">
  <header>
    <p class="meta"><span class="chip">${esc(a.fm.series)}</span> No.${String(a.fm.number).padStart(3, '0')}｜draft <span class="save-state" id="state-${a.slug}"></span></p>
    <p class="badge-row"><span class="badge ${STATUS[a.status].cls}">${STATUS[a.status].label}</span></p>
    <h2>${esc(a.fm.title)}</h2>
    ${a.fm.hook ? `<p class="hook">📣 メニュー呼び込み文: ${esc(a.fm.hook)}</p>` : ''}
    ${a.hero
      ? a.hero.failed
        ? `<p class="imgnote">（挿絵 ${esc(a.hero.path)} の縮小に失敗しました）</p>`
        : `<figure class="hero"><img src="${a.hero.uri}" alt="" loading="lazy"><figcaption>挿絵: ${esc(a.hero.path)}（元ファイル ${a.hero.kb}KB・ここでは縮小表示）</figcaption></figure>`
      : `<p class="imgnote">（挿絵はまだありません: ${esc(a.fm.ogImage || '未設定')}）</p>`}
    ${a.note ? `<div class="note"><b>🔎 検品メモ</b><br>${esc(a.note)}</div>` : ''}
    <div class="btns">
      <button class="btn btn-edit" data-act="edit" data-slug="${a.slug}">✏️ 修正する</button>
    </div>
    <p class="status" id="status-${a.slug}"></p>
  </header>
  <div class="editor" id="editor-${a.slug}" hidden>
    <textarea id="ta-${a.slug}" spellcheck="false"></textarea>
    <div class="btns">
      <button class="btn btn-save" data-act="save" data-slug="${a.slug}">💾 ドライブに保存</button>
      <button class="btn btn-ghost" data-act="copy" data-slug="${a.slug}">📋 全文コピー</button>
      <button class="btn btn-ghost" data-act="cancel" data-slug="${a.slug}">やめる</button>
    </div>
  </div>
  <div class="body" id="body-${a.slug}"></div>
  <script type="text/plain" id="md-${a.slug}">${esc(a.raw)}</script>
  <p class="top"><a href="#toc">↑ 目次にもどる</a></p>
</article>`).join('\n');

const html = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AIカイゼン 検品室</title>
<style>
:root{--paper:#FBFAF7;--ink:#1C1B18;--nezu:#6E6A61;--rule:#E3E0D8;--shu:#C73E2E;--card:#F4F0E7;--ok:#2E7D4F;}
@media (prefers-color-scheme: dark){:root{--paper:#14181F;--ink:#ECEAE4;--nezu:#9A968C;--rule:#2A303B;--shu:#D96A5A;--card:#1B2029;--ok:#5FB584;}}
:root[data-theme="dark"]{--paper:#14181F;--ink:#ECEAE4;--nezu:#9A968C;--rule:#2A303B;--shu:#D96A5A;--card:#1B2029;--ok:#5FB584;}
:root[data-theme="light"]{--paper:#FBFAF7;--ink:#1C1B18;--nezu:#6E6A61;--rule:#E3E0D8;--shu:#C73E2E;--card:#F4F0E7;--ok:#2E7D4F;}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font-family:"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif;line-height:1.9;font-size:16px;}
.wrap{max-width:40rem;margin:0 auto;padding:1.2rem 1.1rem 4rem;}
h1{font-size:1.5rem;letter-spacing:.05em;margin:.4rem 0 0;}
h1 span{color:var(--shu)}
.lead{color:var(--nezu);font-size:.85rem;margin:.4rem 0 0;}
.conn{font-size:.8rem;margin:.6rem 0 0;color:var(--nezu)}
.conn b{color:var(--ok)}
.conn .bad{color:var(--shu)}
.howto{background:var(--card);border-left:3px solid var(--shu);padding:.8rem 1rem;font-size:.85rem;margin:1.2rem 0;line-height:1.8;}
#toc{display:block;margin:1.6rem 0 0;border-top:2px solid var(--ink);}
.toc-item{display:flex;gap:.6rem;align-items:baseline;padding:.7rem .1rem;border-bottom:1px solid var(--rule);text-decoration:none;color:var(--ink);}
.toc-no{font-size:.75rem;color:var(--nezu);white-space:nowrap;}
.toc-title{flex:1;font-size:.92rem;font-weight:600;}
.chip{font-size:.65rem;letter-spacing:.15em;color:var(--shu);border:1px solid var(--shu);padding:.1rem .45rem;white-space:nowrap;align-self:center;}
article{margin-top:3.5rem;border-top:2px solid var(--ink);padding-top:1.2rem;}
article .meta{font-size:.75rem;color:var(--nezu);display:flex;gap:.6rem;align-items:center;margin:0 0 .5rem;flex-wrap:wrap;}
.save-state{color:var(--ok);font-weight:700;}
article h2{font-size:1.25rem;line-height:1.6;margin:.2rem 0 1rem;text-wrap:balance;}
.note{background:var(--card);border-left:3px solid var(--shu);padding:.7rem .9rem;font-size:.83rem;margin:0 0 .8rem;}
.badge{font-size:.7rem;padding:.15rem .5rem;border:1px solid currentColor;white-space:nowrap;}
.st-ok{color:var(--ok)}
.st-fix{color:var(--shu)}
.st-new{color:var(--nezu)}
.badge-row{margin:0 0 .4rem}
.toc-item .badge{align-self:center}
.hero{margin:0 0 .9rem}
.hero img{width:100%;height:auto;display:block;border:1px solid var(--rule);}
.hero figcaption{font-size:.7rem;color:var(--nezu);margin-top:.25rem;}
.imgnote{font-size:.75rem;color:var(--nezu);margin:0 0 .8rem;}
.hook{font-size:.85rem;font-weight:700;color:var(--shu);margin:.2rem 0 .6rem;}
.btns{display:flex;gap:.6rem;margin:.4rem 0 .6rem;flex-wrap:wrap;}
.btn{font-family:inherit;font-size:.85rem;padding:.55rem 1rem;border:1px solid var(--ink);background:var(--paper);color:var(--ink);cursor:pointer;}
.btn-save{background:var(--shu);border-color:var(--shu);color:#fff;font-weight:700;}
.btn-edit{background:var(--ink);color:var(--paper);}
.btn-ghost{border-color:var(--rule);color:var(--nezu);}
.btn:focus-visible{outline:2px solid var(--shu);outline-offset:2px;}
.btn[disabled]{opacity:.5;cursor:wait;}
.status{font-size:.8rem;color:var(--nezu);margin:.2rem 0 .6rem;min-height:1em;}
.status.err{color:var(--shu);}
.status.ok{color:var(--ok);}
.editor textarea{width:100%;min-height:65vh;font-family:ui-monospace,Menlo,monospace;font-size:16px;line-height:1.7;padding:.8rem;border:1px solid var(--rule);background:var(--card);color:var(--ink);}
.body h3{font-size:1.05rem;border-top:1px solid var(--rule);padding-top:1.2rem;margin:2rem 0 .6rem;}
.body h4{font-size:.95rem;margin:1.4rem 0 .4rem;}
.body p{margin:.9rem 0;}
.body ul,.body ol{padding-left:1.4rem;margin:.9rem 0;}
.body li{margin:.35rem 0;}
.body blockquote{background:var(--card);border-left:3px solid var(--shu);margin:1rem 0;padding:.7rem .9rem;font-size:.92em;}
.body blockquote p{margin:.4rem 0}
.body a{color:var(--shu);text-underline-offset:3px;}
.body .int{border-bottom:1px dashed var(--nezu);color:var(--nezu);}
.body .fm{font-size:.72rem;color:var(--nezu);background:var(--card);padding:.5rem .7rem;overflow-x:auto;white-space:pre;}
.top{margin:2rem 0 0;font-size:.8rem;}
.top a{color:var(--nezu)}
a:focus-visible{outline:2px solid var(--shu);outline-offset:2px;}
</style>
<div class="wrap">
  <p class="lead">社外秘（あなた専用）｜全${articles.length}本｜✅検品ずみ ${done}本 / のこり ${articles.length - done}本</p>
  <h1>AIカイゼン <span>検品室</span></h1>
  <p class="conn" id="conn">Googleドライブ連携: 確認中…</p>
  <div class="howto">
    <b>使い方</b><br>
    「✏️ 修正する」→本文(Markdown)を直す→「💾 ドライブに保存」で、あなたのGoogleドライブに「検品_記事名_日時.md」が保存されます。<br>
    保存し終わったら、チャットで「<b>検品回収して</b>」と一言ください。たまがドライブから回収してサイトに反映します。<br>
    初回は接続の確認が出るので許可してください。チャットに「ここ直して」でもOK。灰色の点線の語は未公開サイト内リンクです。
  </div>
  <nav id="toc">${toc}</nav>
  ${sections}
</div>
<script>
const MEDIA=${JSON.stringify(Object.fromEntries(articles.map((a) => [a.slug, a.media])))};
const state={};   // slug -> {md}
let DRIVE=null;   // resolved server name (Google Drive)

const $=(id)=>document.getElementById(id);
const setStatus=(slug,msg,cls)=>{const el=$('status-'+slug);el.textContent=msg;el.className='status'+(cls?' '+cls:'');};

const mdInline=(s)=>s
  .replace(/\\*\\*(.+?)\\*\\*/g,'<b>$1</b>')
  .replace(/\\[(.+?)\\]\\((https?:[^)]+)\\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>')
  .replace(/\\[(.+?)\\]\\((\\/[^)]*)\\)/g,'<span class="int">$1</span>');

function render(slug, raw){
  const m = raw.match(/^---\\n([\\s\\S]*?)\\n---\\n?([\\s\\S]*)$/);
  const fmText = m ? m[1] : '';
  const body = m ? m[2] : raw;
  const lines = body.split('\\n');
  let html = fmText ? '<div class="fm">'+fmText.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</div>' : '';
  let list=null, quote=false, para=[];
  const eschtml=(s)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const flushP=()=>{ if(para.length){ html+='<p>'+mdInline(eschtml(para.join('\\n')).replace(/\\n/g,'<br>'))+'</p>'; para=[]; } };
  const flushL=()=>{ if(list){ html+='</'+list+'>'; list=null; } };
  const flushQ=()=>{ if(quote){ html+='</blockquote>'; quote=false; } };
  const media = MEDIA[slug]||{};
  for(const line of lines){
    const l=line.trimEnd();
    const img=l.match(/^!\\[([^\\]]*)\\]\\((\\/[^)]+)\\)$/);
    const vid=l.match(/^<video[^>]*src="(\\/[^"]+)"/);
    if(img){ flushP();flushL();flushQ();
      const m=media[img[2]];
      if(m&&m.img) html+='<figure class="hero"><img src="'+m.img+'" alt="" loading="lazy"><figcaption>挿絵: '+eschtml(img[2])+'（縮小表示）</figcaption></figure>';
      else html+='<p class="imgnote">（画像がまだありません: '+eschtml(img[2])+'）</p>';
    }
    else if(vid){ flushP();flushL();flushQ();
      const m=media[vid[1]];
      if(m&&m.video) html+='<video controls muted playsinline preload="metadata" style="width:100%;border:1px solid var(--rule)" src="'+m.video+'"></video><p class="imgnote">動画: '+eschtml(vid[1])+'</p>';
      else if(m&&m.tooBig) html+='<p class="imgnote">（動画 '+eschtml(vid[1])+' は'+m.kb+'KBと大きいためここでは省略。本番サイトで確認してください）</p>';
      else html+='<p class="imgnote">（動画がまだありません: '+eschtml(vid[1])+'）</p>';
    }
    else if(/^### /.test(l)){ flushP();flushL();flushQ(); html+='<h4>'+mdInline(eschtml(l.slice(4)))+'</h4>'; }
    else if(/^## /.test(l)){ flushP();flushL();flushQ(); html+='<h3>'+mdInline(eschtml(l.slice(3)))+'</h3>'; }
    else if(/^> ?/.test(l)){ flushP();flushL(); if(!quote){html+='<blockquote>';quote=true;} html+='<p>'+mdInline(eschtml(l.replace(/^> ?/,'')))+'</p>'; }
    else if(/^- /.test(l)){ flushP();flushQ(); if(list!=='ul'){flushL();html+='<ul>';list='ul';} html+='<li>'+mdInline(eschtml(l.slice(2)))+'</li>'; }
    else if(/^\\d+\\. /.test(l)){ flushP();flushQ(); if(list!=='ol'){flushL();html+='<ol>';list='ol';} html+='<li>'+mdInline(eschtml(l.replace(/^\\d+\\. /,'')))+'</li>'; }
    else if(l===''){ flushP();flushL();flushQ(); }
    else { para.push(l); }
  }
  flushP();flushL();flushQ();
  $('body-'+slug).innerHTML=html;
}

// 初期表示: ビルド時に埋め込んだ内容
document.querySelectorAll('article[data-slug]').forEach(el=>{
  const slug=el.dataset.slug;
  const raw=$('md-'+slug).textContent;
  state[slug]={md:raw};
  render(slug, raw);
});

const ERRCOPY={
  needs_reauth:'Googleドライブ連携の認証が切れています。claude.aiの設定→コネクタでGoogle Driveを再接続してください。',
  server_not_connected:'Google Driveコネクタが未接続です。claude.aiの設定→コネクタでGoogle Driveを追加してください。',
  selection_required:'Google Driveコネクタが複数あります。表示された選択ダイアログでどれか1つを選んでください。',
  not_granted:'このページにコネクタ利用の許可が出ていません。ページを開き直して許可してください。',
  capability_disabled:'この環境では保存機能が使えません。「📋 全文コピー」でコピーしてチャットに貼ってください。',
  blocked_by_policy:'組織ポリシーでブロックされています。「📋 全文コピー」でチャットに貼ってください。',
};
function errMsg(e, isWrite){
  if(e && e.code==='server_unavailable' && isWrite) return '⚠️ 通信不安定: 保存されたか不明です。ドライブに「検品_」ファイルができているか確認して、なければもう一度保存してください。';
  if(e && ERRCOPY[e.code]) return ERRCOPY[e.code];
  if(e && e.code==='tool_error') return '保存エラー: '+(e.message||'ツールが失敗を返しました')+' 「📋 全文コピー」でチャットに貼ってもOKです。';
  return 'エラー('+((e&&e.code)||'不明')+'): '+((e&&e.message)||'')+' 「📋 全文コピー」でチャットに貼ってもOKです。';
}

function openEditor(slug){
  $('ta-'+slug).value=state[slug].md;
  $('editor-'+slug).hidden=false;
  $('body-'+slug).hidden=true;
}
function closeEditor(slug){
  $('editor-'+slug).hidden=true;
  $('body-'+slug).hidden=false;
}

function stamp(){
  const d=new Date();
  const p=(n)=>String(n).padStart(2,'0');
  return d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes())+p(d.getSeconds());
}

async function save(slug, btn){
  const md=$('ta-'+slug).value;
  if(!window.claude?.mcp || !DRIVE){ setStatus(slug,'ドライブ連携が使えない環境です。「📋 全文コピー」でコピーしてチャットに貼ってください。','err'); return; }
  btn.disabled=true; setStatus(slug,'ドライブに保存中…');
  try{
    await window.claude.mcp.callTool(DRIVE,'create_file',{
      title:'検品_'+slug+'_'+stamp()+'.md',
      textContent:md,
      contentMimeType:'text/markdown',
      disableConversionToGoogleType:true,
    });
    state[slug]={md:md};
    render(slug, md);
    closeEditor(slug);
    $('state-'+slug).textContent='✓ ドライブ保存済み';
    setStatus(slug,'ドライブに保存しました ✓ あとでチャットで「検品回収して」と言えば反映されます','ok');
  }catch(e){ setStatus(slug, errMsg(e,true), 'err'); }
  btn.disabled=false;
}

async function copyMd(slug){
  const ed=$('editor-'+slug);
  const md=ed.hidden ? state[slug].md : $('ta-'+slug).value;
  try{
    await navigator.clipboard.writeText(md);
    setStatus(slug,'全文をコピーしました。チャットに貼って「反映して」でOKです','ok');
  }catch(_){
    const ta=$('ta-'+slug); ed.hidden=false; ta.value=md; ta.select();
    setStatus(slug,'コピーできなかったので全選択しました。手動でコピーしてください','err');
  }
}

document.addEventListener('click',(ev)=>{
  const b=ev.target.closest('button[data-act]');
  if(!b) return;
  const slug=b.dataset.slug;
  if(b.dataset.act==='edit') openEditor(slug);
  else if(b.dataset.act==='cancel') closeEditor(slug);
  else if(b.dataset.act==='copy') copyMd(slug);
  else if(b.dataset.act==='save') save(slug, b);
});

(async function init(){
  const conn=$('conn');
  if(!window.claude || window.claude.mcp===undefined){
    conn.innerHTML='Googleドライブ連携: <span class="bad">この表示環境では使えません</span>（読むのはOK。直しは📋コピー→チャットへ）';
    return;
  }
  try{
    const r=await window.claude.mcp.listTools();
    const s=(r.servers||[]).find(x=>x.tools&&x.tools.length);
    if(s){ DRIVE=s.server; conn.innerHTML='Googleドライブ連携: <b>接続済み（'+s.server+'）</b> — 保存すると「検品_記事名_日時.md」がドライブにできます'; }
    else { conn.innerHTML='Googleドライブ連携: <span class="bad">未接続</span> — claude.aiの設定→コネクタでGoogle Driveを接続すると、このページから保存できます'; }
  }catch(e){
    conn.innerHTML='Googleドライブ連携: <span class="bad">確認できませんでした</span>（'+((e&&e.code)||'')+'）読むのはOK。直しは📋コピー→チャットへ';
  }
})();
</script>`;

writeFileSync(OUT, html);
console.log('written', html.length, 'chars,', articles.length, 'articles');
