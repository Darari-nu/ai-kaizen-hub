import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = '/Volumes/DevSSD/Vibe_Website/260805_Darari-nu_HP/src/content/articles';
const OUT = '/tmp/kenpin.html';

const NOTES = {
  '001-jtc-ai-jijou': '✅8/7本人検品OK。',
  '002-ai-rules-starter': '✅8/7検品OK+追記反映: Q4に「どのくらい効果あるの？と聞かれるパターン→また後日書きますね」を追加済み。',
  '003-chatgpt-kinshi': '🔄8/7二度目の書き換え: 「禁止の会社は今や少数派。多いのは禁止してないのに実質使えない会社」を軸に再構成。社内エピソードは「ぼくの会社は禁止してない(申請制)。それでもこうなる」の文脈に移動して矛盾解消。想定問答に「申請制なら問題ないでしょ？→申請ゼロなら禁止と同じ」を追加。再検品を。',
  '004-claude-team': '🔄8/7追記反映: 情シス確認リストに「サービス自体のセキュリティ/事故時の履歴/SSO」を追加、「ぼくが管理者・台帳管理・半期棚卸し(Claude Code製アプリで)」の先出しを追加。法務に「同意画面スクショ保管」を追加(電帳法の名指しは裏取り不能のため入れず、実務メリットで書いた)。クレカ1ヶ月オチは反映済み。再検品を。',
  '005-hiyou-taikoka': '🔄8/7追記反映: 時間短縮が弱い理由に「上司が聞いているのは、で、人が減るの？」を追加。数字は8/6裁定のまま。再検品を。',
  '006-meishi-bot': '🔄8/7反映: 「役員向け」→「管理職向け」に変更、初出に「(わかりやすさのための、ぼくの架空会社です)」を追加。実物リポ(line-business-card-bot)のまるっと解説はネタ帳に登録済み(続編候補)。再検品を。',
  '007-rpa-daitai': '🔄8/7反映: 安定のコツ末尾に「迷ったらスクショでAIに聞けば一発/拡張機能のAIならスクショも不要」を追加(008へ内部リンク)。記述粒度の会社バレ確認は引き続きお願いします。',
  '008-shanai-system': 'あなたのキモ(スクショで聞く/Claude Codeで手順書)を核に構成。実体験の温度で直せる箇所があれば。',
  '010-ai-kenshu': '台本は「たたき台の合体版(A→B→C)」で書きました。A/B/C単体に変える場合は一言ください。',
  '011-dare-ga-itta': 'Asana実録をダラリ重工業に翻訳(ツール名は「あるタスク管理ツール」)。ぼかし加減これでOK？',
  '012-kuni-mo-yare': '政府文書はWebで裏取り済み(AI推進法2025.9施行/基本計画2025.12.23閣議決定/2026.7.14改定)。「様子見こそ最大のリスク」は趣旨要約なので、原文PDFと突き合わせたい人はことばメモのリンクから。',
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
  return { slug: f.replace('.md', ''), fm, raw, note: NOTES[f.replace('.md', '')] || '' };
});

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const toc = articles.map((a) => `
  <a class="toc-item" href="#${a.slug}">
    <span class="toc-no">No.${String(a.fm.number).padStart(3, '0')}</span>
    <span class="toc-title">${esc(a.fm.title)}</span>
    <span class="chip">${esc(a.fm.series)}</span>
  </a>`).join('');

const sections = articles.map((a) => `
<article id="${a.slug}" data-slug="${a.slug}">
  <header>
    <p class="meta"><span class="chip">${esc(a.fm.series)}</span> No.${String(a.fm.number).padStart(3, '0')}｜draft <span class="save-state" id="state-${a.slug}"></span></p>
    <h2>${esc(a.fm.title)}</h2>
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
  <p class="lead">社外秘（あなた専用）｜draft ${articles.length}本｜2026-08-06版</p>
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
