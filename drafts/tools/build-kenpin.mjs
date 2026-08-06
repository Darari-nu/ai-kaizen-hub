import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = '/Volumes/DevSSD/Vibe_Website/260805_Darari-nu_HP/src/content/articles';
const OUT = '/tmp/kenpin.html';

const NOTES = {
  '001-jtc-ai-jijou': 'Copilotの「機密OK」の理由づけ(学習に使われない契約)と「GPT-5系」のぼかし表現、これでOK？',
  '002-ai-rules-starter': '3点セットの中身は前職経験の再構成。実務者として監修を。',
  '003-chatgpt-kinshi': '✅8/6裁定反映済み: 公開OK。白状を「AIは個人スマホのChatGPT」版に修正し、「斜め前の席の人が申請なしで使ってるのが丸見え」を追加。仕上がりの最終読み合わせだけお願いします。',
  '004-claude-team': '✅8/6裁定反映済み: 005と統一(SaaS計12万のうちRPA単体5万/Team7名・$20/月$140≒2万円ちょっと)。実数(RPA7万・5人・$200/年)からはぼかし済み。このぼかし加減でOKか確認を。',
  '005-hiyou-taikoka': '✅8/6裁定反映済み: 004と統一(RPA5万→Team7名約2.2万=差引約2.8万ダウン)。公式$20/席と矛盾しない値にしてあります。定性(金額化しない)はそのまま。最終確認を。',
  '006-meishi-bot': 'ダラリ重工業事例に翻訳済み(「役員向けアプリを外注」前提)。この設定でOK？',
  '007-rpa-daitai': '会議録発行システム・勤務管理システムの記述粒度、これで会社バレ的に大丈夫？',
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
      <button class="btn btn-ghost" data-act="reload" data-slug="${a.slug}">🔄 最新を読み込む</button>
    </div>
    <p class="status" id="status-${a.slug}"></p>
  </header>
  <div class="editor" id="editor-${a.slug}" hidden>
    <textarea id="ta-${a.slug}" spellcheck="false"></textarea>
    <div class="btns">
      <button class="btn btn-save" data-act="save" data-slug="${a.slug}">💾 保存してコミット</button>
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
  <p class="conn" id="conn">GitHub連携: 確認中…</p>
  <div class="howto">
    <b>使い方</b><br>
    「✏️ 修正する」→本文(Markdown)を直す→「💾 保存してコミット」で、そのままGitHubに保存されます（あなたのGitHub連携で動きます）。<br>
    初回は接続の確認が出るので許可してください。チャットに「ここ直して」でもOK。灰色の点線の語は未公開サイト内リンクです。
  </div>
  <nav id="toc">${toc}</nav>
  ${sections}
</div>
<script>
const OWNER='Darari-nu', REPO='ai-kaizen-hub', BRANCH='main';
const state={};   // slug -> {sha, md}
let GH=null;      // resolved server name

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
  state[slug]={sha:null, md:raw};
  render(slug, raw);
});

function extract(result){
  const texts=[];
  for(const b of (result.content||[])){
    if(typeof b.text==='string') texts.push(b.text);
    if(b.resource && typeof b.resource.text==='string') texts.push(b.resource.text);
  }
  if(typeof result.payload==='string') texts.push(result.payload);
  let sha=null, body=null;
  for(const t of texts){
    const m=t.match(/SHA: ([0-9a-f]{40})/);
    if(m) sha=m[1];
  }
  const cands=texts.filter(t=>t.startsWith('---\\n')||t.includes('\\n---\\n'));
  body=cands.sort((a,b)=>b.length-a.length)[0]||null;
  if(!body){
    body=texts.filter(t=>!/^successfully/.test(t)).sort((a,b)=>b.length-a.length)[0]||null;
  }
  return {sha, body};
}

const ERRCOPY={
  needs_reauth:'GitHub連携の認証が切れています。claude.aiの設定→コネクタでGitHubを再接続してください。',
  server_not_connected:'GitHubコネクタが未接続です。claude.aiの設定→コネクタでGitHubを追加してください。',
  not_granted:'このページにコネクタ利用の許可が出ていません。ページを開き直して許可してください。',
  capability_disabled:'この環境では編集機能が使えません。チャットで「ここ直して」と送ってください。',
  blocked_by_policy:'組織ポリシーでブロックされています。',
};
function errMsg(e, isWrite){
  if(e && e.code==='server_unavailable' && isWrite) return '⚠️ 通信不安定: コミットされたか不明です。GitHubのcommit履歴を確認してから、必要ならもう一度保存してください。';
  if(e && ERRCOPY[e.code]) return ERRCOPY[e.code];
  if(e && e.code==='tool_error') return '保存エラー: '+(e.message||'ツールが失敗を返しました');
  return 'エラー('+((e&&e.code)||'不明')+'): '+((e&&e.message)||'');
}

async function ghCall(tool, input, opts){
  return window.claude.mcp.callTool(GH, tool, input, opts);
}

async function reload(slug, silent){
  if(!GH){ if(!silent) setStatus(slug,'GitHub連携が未接続のため、表示は保存済みスナップショットです。','err'); return; }
  setStatus(slug,'読み込み中…');
  try{
    const r=await ghCall('get_file_contents',{owner:OWNER,repo:REPO,path:'src/content/articles/'+slug+'.md'},{cache:false});
    const {sha,body}=extract(r);
    if(body){ state[slug]={sha, md:body}; render(slug, body); setStatus(slug, sha?'最新版を読み込みました':'読み込みました(SHA取得できず: 保存時に再取得します)','ok'); }
    else setStatus(slug,'本文を取り出せませんでした。チャットで直してください。','err');
  }catch(e){ setStatus(slug, errMsg(e,false), 'err'); }
}

function openEditor(slug){
  $('ta-'+slug).value=state[slug].md;
  $('editor-'+slug).hidden=false;
  $('body-'+slug).hidden=true;
  if(GH && !state[slug].sha){ reload(slug, true).then(()=>{ if(state[slug].md) $('ta-'+slug).value=state[slug].md; }); }
}
function closeEditor(slug){
  $('editor-'+slug).hidden=true;
  $('body-'+slug).hidden=false;
}

async function save(slug, btn){
  if(!window.claude?.mcp || !GH){ setStatus(slug,'GitHub連携が使えない環境です。編集内容をコピーしてチャットに貼ってください。','err'); return; }
  const md=$('ta-'+slug).value;
  btn.disabled=true; setStatus(slug,'コミット中…');
  try{
    if(!state[slug].sha){
      const r0=await ghCall('get_file_contents',{owner:OWNER,repo:REPO,path:'src/content/articles/'+slug+'.md'},{cache:false});
      state[slug].sha=extract(r0).sha;
    }
    const input={owner:OWNER,repo:REPO,branch:BRANCH,path:'src/content/articles/'+slug+'.md',content:md,
      message:'検品修正: '+slug+'（検品室から）'};
    if(state[slug].sha) input.sha=state[slug].sha;
    const r=await ghCall('create_or_update_file', input);
    let p=r.payload;
    if(typeof p==='string'){ try{p=JSON.parse(p);}catch(_){p=null;} }
    const newSha=p&&p.content&&p.content.sha;
    state[slug]={sha:newSha||null, md:md};
    render(slug, md);
    closeEditor(slug);
    $('state-'+slug).textContent='✓ 保存済み';
    setStatus(slug,'GitHubにコミットしました ✓','ok');
  }catch(e){ setStatus(slug, errMsg(e,true), 'err'); }
  btn.disabled=false;
}

document.addEventListener('click',(ev)=>{
  const b=ev.target.closest('button[data-act]');
  if(!b) return;
  const slug=b.dataset.slug;
  if(b.dataset.act==='edit') openEditor(slug);
  else if(b.dataset.act==='cancel') closeEditor(slug);
  else if(b.dataset.act==='reload') reload(slug);
  else if(b.dataset.act==='save') save(slug, b);
});

(async function init(){
  const conn=$('conn');
  if(!window.claude || window.claude.mcp===undefined){
    conn.innerHTML='GitHub連携: <span class="bad">この表示環境では使えません</span>（読むのはOK。直しはチャットへ）';
    return;
  }
  try{
    const r=await window.claude.mcp.listTools();
    const s=(r.servers||[]).find(x=>x.tools&&x.tools.length);
    if(s){ GH=s.server; conn.innerHTML='GitHub連携: <b>接続済み（'+s.server+'）</b> — 保存ボタンでそのままコミットされます'; }
    else { conn.innerHTML='GitHub連携: <span class="bad">未接続</span> — claude.aiの設定→コネクタでGitHubを接続すると、このページから保存できます'; }
  }catch(e){
    conn.innerHTML='GitHub連携: <span class="bad">確認できませんでした</span>（'+((e&&e.code)||'')+'）読むのはOK。直しはチャットへ';
  }
})();
</script>`;

writeFileSync(OUT, html);
console.log('written', html.length, 'chars,', articles.length, 'articles');
