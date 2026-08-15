// 007/008用の実機メディア撮影スクリプト（2026-08-10 darari指示「スクショを図解付きで。動画も」）
// devサーバー(4322)の会議録発行システムを、Playwrightで実際に操作して撮る。
// 生成物: public/videos/007-kaigiroku-auto.mp4 / public/images/articles/007-kaigiroku-zukai.jpg
//        public/videos/008-manual-scroll.mp4 / public/images/articles/008-flow-zukai.jpg / 008-manual-top.jpg
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';

const BASE = 'http://localhost:4322';
const ROOT = '/Volumes/DevSSD/Vibe_Website/260805_Darari-nu_HP';
const TMP = '/tmp/capture-media';
mkdirSync(TMP, { recursive: true });
mkdirSync(`${ROOT}/public/videos`, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 朱色ラベルを画像に重ねる図解コンポーザ
async function annotate(browser, imgPath, labels, outJpg, width = 1280) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 2 });
  const items = labels
    .map(
      (l, i) => `
      <div style="position:absolute;left:${l.x}px;top:${l.y}px;display:flex;align-items:flex-start;gap:6px;">
        <span style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;
          background:#C73E2E;color:#fff;font-weight:800;font-size:17px;border:2.5px solid #fff;
          box-shadow:0 1px 5px rgba(0,0,0,.45);flex:none;">${i + 1}</span>
        <span style="background:rgba(199,62,46,.95);color:#fff;font-weight:700;font-size:15px;line-height:1.4;
          padding:4px 10px;border-radius:3px;box-shadow:0 1px 5px rgba(0,0,0,.35);max-width:330px;">${l.text}</span>
      </div>`
    )
    .join('');
  await page.setContent(
    `<body style="margin:0;font-family:'Hiragino Kaku Gothic ProN',sans-serif;">
       <div style="position:relative;width:${width}px;">
         <img src="data:image/png;base64,${readFileSync(imgPath).toString('base64')}" style="width:${width}px;display:block;" />
         ${items}
       </div>
     </body>`
  );
  await page.waitForLoadState('networkidle');
  const el = page.locator('div[style*="position:relative"]');
  await el.screenshot({ path: `${TMP}/annotated.png` });
  execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', `${TMP}/annotated.png`, '--out', outJpg], { stdio: 'ignore' });
  await page.close();
  console.log('annotated →', outJpg);
}

function webmToMp4(dir, outMp4) {
  const webm = readdirSync(dir).find((f) => f.endsWith('.webm'));
  execFileSync('ffmpeg', ['-y', '-i', `${dir}/${webm}`, '-vf', 'scale=1280:-2', '-c:v', 'libx264', '-crf', '27', '-pix_fmt', 'yuv420p', '-an', outMp4], { stdio: 'ignore' });
  console.log('video →', outMp4);
}

const FILL = [
  ['category', '定例会議'],
  ['dest', '部内のみ'],
  ['genre', '改善'],
  ['workplace', 'AI活用推進室'],
];
const TYPE = [
  ['approver', '製造部長'],
  ['title', '第2ライン 段取り改善 定例'],
];
const BODY = '・段取り時間の実測結果を共有（前月比マイナス12%）\n・治具の置き場を変更（担当: 田中、期限: 8/22）\n・次回は改善提案の審査を実施';

const browser = await chromium.launch();

// ---------- 007: 自動入力の動画 ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, recordVideo: { dir: `${TMP}/v007`, size: { width: 1280, height: 860 } } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/company/intranet/kaigiroku/`, { waitUntil: 'networkidle' });
  await sleep(1200);
  for (const [id, v] of FILL) { await page.selectOption(`#${id}`, { label: v }); await sleep(500); }
  for (const [id, v] of TYPE) { await page.click(`#${id}`); await page.type(`#${id}`, v, { delay: 45 }); await sleep(350); }
  await page.fill('#heldon', '2026-08-10'); await sleep(400);
  await page.click('#body'); await page.type('#body', BODY, { delay: 14 }); await sleep(600);
  await page.click('#submit-btn');
  await page.waitForSelector('#result:not(.hidden)');
  await sleep(2200);
  await ctx.close();
  webmToMp4(`${TMP}/v007`, `${ROOT}/public/videos/007-kaigiroku-auto.mp4`);
}

// ---------- 007: 図解つきスクショ ----------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 1100 }, deviceScaleFactor: 2 });
  await page.goto(`${BASE}/company/intranet/kaigiroku/`, { waitUntil: 'networkidle' });
  for (const [id, v] of FILL) await page.selectOption(`#${id}`, { label: v });
  for (const [id, v] of TYPE) await page.fill(`#${id}`, v);
  await page.fill('#heldon', '2026-08-10');
  await page.fill('#body', BODY);
  await page.click('#submit-btn');
  await page.waitForSelector('#result:not(.hidden)');
  const form = await page.locator('#gijiroku-form').boundingBox();
  const btn = await page.locator('#submit-btn').boundingBox();
  const res = await page.locator('#result').boundingBox();
  const clip = { x: 0, y: Math.max(0, form.y - 60), width: 1280, height: Math.min(1100, res.y + res.height + 30 - (form.y - 60)) };
  await page.screenshot({ path: `${TMP}/007-filled.png`, clip });
  const oy = clip.y;
  await annotate(browser, `${TMP}/007-filled.png`, [
    { x: form.x + 620, y: form.y - oy + 10, text: '入力欄はぜんぶAIが埋めた（ぼくは見てるだけ）' },
    { x: btn.x + btn.width + 16, y: btn.y - oy - 6, text: '「発行」もAIが押す' },
    { x: res.x + 460, y: res.y - oy - 2, text: '発行番号が取れたら完了。ここまで約20秒' },
  ], `${ROOT}/public/images/articles/007-kaigiroku-zukai.jpg`);
  await page.close();
}

// ---------- 008: マニュアルのスクロール動画 ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, recordVideo: { dir: `${TMP}/v008`, size: { width: 1280, height: 860 } } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/company/intranet/kaigiroku-manual/`, { waitUntil: 'networkidle' });
  await sleep(1500);
  const height = await page.evaluate(() => document.body.scrollHeight);
  const steps = 40;
  for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, height / steps); await sleep(130); }
  await sleep(1500);
  await ctx.close();
  webmToMp4(`${TMP}/v008`, `${ROOT}/public/videos/008-manual-scroll.mp4`);
}

// ---------- 008: マニュアル先頭スクショ + 流れの図解 ----------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  await page.goto(`${BASE}/company/intranet/kaigiroku-manual/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${TMP}/008-manual-top.png`, clip: { x: 0, y: 0, width: 1280, height: 860 } });
  await annotate(browser, `${TMP}/008-manual-top.png`, [
    { x: 860, y: 120, text: '第7版・全87ページ。人間は読まない。AIに読ませる' },
  ], `${ROOT}/public/images/articles/008-manual-top.jpg`);

  await page.goto(`${BASE}/company/intranet/kaigiroku/`, { waitUntil: 'networkidle' });
  const form = await page.locator('#gijiroku-form').boundingBox();
  await page.screenshot({ path: `${TMP}/008-screen.png`, clip: { x: 0, y: 0, width: 1280, height: Math.min(880, form.y + form.height) } });
  await annotate(browser, `${TMP}/008-screen.png`, [
    { x: 80, y: 60, text: 'この画面をスクショして、AIに貼る' },
    { x: 80, y: 130, text: '「宛先を全社にして再発行したい。どこを押せばいい？」と聞く' },
    { x: 80, y: 200, text: 'マニュアル87ページはAIに読ませてあるので、章番号つきで答えが返る' },
  ], `${ROOT}/public/images/articles/008-flow-zukai.jpg`);
  await page.close();
}

await browser.close();
console.log('ALL DONE');
