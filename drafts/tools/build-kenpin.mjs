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
  '006-meishi-bot': { status: 'fix', note: '8/8反映: 「いつもの」削除、完成形LINEスクショ+AIブラウザの一文とスクショを記事内に配置しました。⚠️安全のため2箇所加工しています: ①LINEスクショはスプレッドシートの実URLが写っていたので、その手前でカット ②ブラウザのスクショは左サイドバーにDara系リポ名が写っていたので(レーン分離)、サイドバーごとカット。仕上がりを見て、問題なければOKください。' },
  '007-rpa-daitai': { status: 'fix', note: '8/8反映: ①RPAのいいところ(プロUIと素人UIの差/AIで縮む)を追加 ②ダラリ重工業の会議録発行システムを実際に作りました(/company/intranet/kaigiroku/ で遊べます)。AIが自動入力→発行番号取得した実スクショ2枚を記事に掲載。生成画像でアプリ画面を偽造するのは誤解を招くのでやめ、実際に動くもので撮る方式にしました。実物の雰囲気と離れすぎていないか見てください。' },
  '008-shanai-system': { status: 'fix', note: '8/8反映: 分厚いマニュアルを実際に作りました(/company/intranet/kaigiroku-manual/ 第7版・全87ページの体。改訂履歴7回中3回が誤字修正)。記事から実物にリンクし、読ませるコツ3つを追加: ①先にAIに「1トピック1ブロック」に変換させる(ツェッテルカステン式) ②ChatGPT/Claudeならプロジェクト、Claude Code/Codexならスキル化で毎回渡さない ③出典(章番号)を言わせて更新漏れに気づく。' },
  '011-dare-ga-itta': { status: 'fix', note: '8/8全面書き直し: 攻略1〜3を削除し、「この構造はどうしようもない」と言い切る着地に。AIがスマホになる日に備えて、頭の中のことをデータに残す=準備、で締め。確認3点: ①「攻略法を書くつもりでした→やめました」というメタな折り返しを入れています(嫌なら消せます) ②タスクツールに手順を放り込んでいた話を「ぼくなりの準備だった」と回収(後付け解釈なので実感と違えば弱めます) ③スマホ比喩は世間一般の話として書きました。' },
  '012-kuni-mo-yare': { status: 'fix', note: '8/8再書き直し: テクの列挙を削除。「印刷して振りかざしても動かない。ふーんで終わる」と正直に言った上で、風向きが変わる日は来る→親しい人にメール1本の種まき→来たる時期に備えましょう、の着地に。確認3点: ①darariの検品コメントの言葉を読者の心の声に転用しています ②タイトルで結論を割っています(「だから、メールを1本だけ」) ③「この流れが後ろに下がるとは考えにくい」は文書裏付けのない言い切りです。' },

  // --- 8/8 新規5本（Fableサブエージェントが1本ずつ執筆。挿絵はまだありません） ---
  '013-vps-jiken': { status: 'new', note: '【新規・記録】006から切り出したVPS事件。確認したいこと3つ: ①「締め出されたときの戻り道=VPS管理画面のコンソール」を後から知った、という補足は実体験と合っていますか ②「サーバーに置いていたのは検証用の自分の名刺データだけ」の言い方でOKか(実際はAPIキーも置いていたはず) ③復旧の経緯を「なんとか復旧して」とぼかしています。覚えていれば1〜2行足すと生々しくなります' },
  '014-nyuuryoku-handan': { status: 'new', note: '【新規・ガバナンス】002の実践編。抽象化テクが核。確認したいこと3つ: ①ビフォー例文「ダラリ精工さま向けの減速機DR-2200・第3工場の鋳造ライン」は架空の作例です。実在情報と紛らわしくないですか ②「慣れると10秒」「立ち話テスト」は説明用の言い回しで実測ではありません ③失敗談の締め「いまのぼくなら止める側です」(前職のメール転送を正規ルート外と自己評価)、この強さでOKか' },
  '015-joushisu-shitsumon': { status: 'new', note: '【新規・ガバナンス】004の情シスパート深掘り。台帳管理+半期棚卸しの先出しが目玉。確認したいこと3つ: ①失敗談を「運用を先出ししなかったら質問が延々続いたはず」という推測形で書いています。実際の温度感と合っていますか(何往復あったか) ②逃げ道の「質問を1つに絞って再送」「上司に30分の打ち合わせを頼む」は一般アドバイスで実体験ではありません ③Q1の「情シスに来る申請の大半は丸投げ」の言い切り、前職の見立てとして自然ですか' },
  '016-excel-shukei': { status: 'new', note: '【新規・AIカイゼン】貼って聞く→数式を書かせる→プログラムを書かせる、の3段。各段にコピペ用プロンプトつき。確認したいこと3つ: ①失敗談「除きたい行を伝えておらず全行を足していた」は実体験と齟齬ないですか ②3段目の「ゲームと違って軽い」(ポンコツPCの補足)は残しますか ③Q4「人間の部下に集計を頼むときと同じ」→部下のいない読者には「同僚に頼むとき」の方がいいかも' },
  '017-gijiroku': { status: 'new', note: '【新規・AIカイゼン】議事録を「清書する仕事」から「確認する仕事」へ。確認したいこと3つ: ①失敗談の「会議中にPCでメモ→内職と注意された」に「あとでAIに渡せて合理的だと思っていた」という動機を足しています。記憶と合っていますか ②Q1で「議事メモはレベル2、取引先情報や原価が乗るとレベル3」と規程を引いています。設定と矛盾ないですか ③Q3の「読まずにハンコを押すのと同じ」の比喩(ハンコ頭の社長は以前却下したので、気になるなら差し替えます)' },
  '018-meishi-bot-kaisetsu': { status: 'new', note: '【新規・AIカイゼン】006の続編。実物リポ(line-business-card-bot)のコードを一次資料に「写真1枚がシートの1行になるまでの旅」を駅ごとに解説。発見: 猫が弾かれたのはプロンプト内の「動物…は名刺ではない」の1行でした。確認したいこと3つ: ①失敗談3点(未起動/.envの改行エラー/ポート5000がAirPlayと競合→5001)はリポのLog.md記載ベース。記憶と合っていますか ②「GPT-5-nano」とモデル実名を出しています。伏せるなら言ってください ③「順番に確認してひとつずつ潰せました」の手応え、実感と合っていますか。※Make.com置き換えの経緯はネタとして美味しいので別記事候補にしています' },
  '019-jidoka-hikkoshi': { status: 'new', note: '【新規・記録】Make.comから自作Pythonへの引っ越し実録(blueprint.json+Log.mdが一次資料)。発見: LINEの返信文がMake版とPython版で1字も違わず一致=使う側は引っ越しに気づけない。シナリオ名が「【最新】名刺自動化よみとるくん」だったのをオチに使用。確認3点: ①「設計図をAIに添えて頼んだ」と書きましたが、実際は設計図を見ながら自分で要件定義を書いたなら表現を弱めます ②Make.com実名で書いています(伏せるなら一括置換可) ③「名刺1枚で7回ぶん無料枠が減る」の課金カウントは一般仕様知識です。上限警告を実際に見た体験があれば足してください。' },
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
  return { slug, fm, raw, status: meta.status, note: meta.note, hero: embedImage(fm.ogImage) };
});

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
  for(const line of lines){
    const l=line.trimEnd();
    if(/^### /.test(l)){ flushP();flushL();flushQ(); html+='<h4>'+mdInline(eschtml(l.slice(4)))+'</h4>'; }
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
