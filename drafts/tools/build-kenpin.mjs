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
  '006-meishi-bot': { status: 'fix', note: '⚙️8/12夜・料金の検品反映: ①「どれも無料で始められます」を撤去→「登録3つは無料。お金がかかる可能性は頭のAIだけ(Gemini API=無料枠あり・クレカ不要/OpenAI API=従量課金)」に修正 ②Work/Coworkは有料プランの機能と明記(Work=Plus月$20から、Cowork=Pro月$20から。2026年8月時点) ③料金メモ4行を新設。Claude側は公式ページで確認済み、ChatGPT側は公式が機械アクセス拒否のため複数ソース一致で採用→お手すきに公式で一度目視ください。' },
  '007-rpa-daitai': { status: 'fix', note: '🖼8/12夜: この検品室で記事内の挿絵・動画がそのまま見られるようになりました。下にスクロールすると図解つきスクショ2枚と10秒動画が出ます。実機確認(システム)は引き続き待機中です。' },
  '008-shanai-system': { status: 'fix', note: '🖼8/12夜: 「動画、挿絵、画見たいなー」→この検品室で見られるようにしました。下にスクロールすると3ステップ図解・マニュアル表紙スクショ・スクロール動画が出ます。それでOKなら✅ください。' },
  '011-dare-ga-itta': { status: 'fix', note: '🎨8/12夜: 図解サンプル1枚(「誰が言ったかで決まる」の左右対比)を生成してチャットに送りました。「いつもの子」はぼくの勘違いで、このサイトにキャラ素材はありませんでした。すみません！ サンプルはキャラなし・モノトーン+ライトブルーです。この路線でOKなら、この記事に3〜4枚設計して量産します。' },
  '012-kuni-mo-yare': { status: 'fix', note: '⚙️8/12検品反映: 「その日までにやること: メール1本です」→「『AIに詳しい人』のポジションを取っておく」に変更し、4アクション(①メール1本 ②AIコミュニティに書き込む ③なければチャットグループから立ち上げる ④会議の雑談で話題にする)に展開しました。確認1点: タイトル末尾が「だから、メールを1本だけ」のままです。残すか、「だから、『詳しい人』の椅子を取っておく」あたりに変えるか。' },

  // --- 8/8 新規5本（Fableサブエージェントが1本ずつ執筆） ---
  '014-nyuuryoku-handan': { status: 'fix', note: '⚙️8/12夜の検品反映: ①Q4の「慣れると10秒」を削除し、darari案(機密を入れていいAIはたくさんある→正攻法で導入が本筋、抽象化はつなぎの技)に差し替え。004へのリンクも追加 ②全体の文体を磨き直し(段落を短く割る・改行増・語尾の単調をほぐす)。確認2点: ①Q4は「面倒です。正直に言います。」と一度認めてから正攻法へ、の形にしました。トーンOKか ②Claude Team料金(月$20から)は004の記載から引いています。' },
  '015-joushisu-shitsumon': { status: 'fix', note: '🎨8/12夜: 「難しいので図解多め・型ごとに」→まず「答え方3つの型」の図解1枚を生成してチャットに送りました。路線OKなら系統別など残りも量産してこの記事に挿入します。前回反映分(冒頭の申請ルール優先・とある会社の責任分界・質問リスト5系統・答え方3型・一緒に考える着地)は入っています。確認1点: 「とある会社」の書き方がうちの会社の話と読まれないか目視ください。' },
  '016-excel-shukei': { status: 'fix', note: '⚙️8/12夜の検品反映: ①「見てくださいが見れない」→この検品室で挿絵が見られるようになりました(下にスクロール) ②1段目に追記「ChatGPT(有償プラン)やClaudeなら一発。両方使っているぼくの感覚だと2026年8月現在、少しClaudeのほうが優秀かな？意図を汲んでくれる」 ③3段目「実際にできたの？」→ダミー日報CSV138行で実際にAIにスクリプトを書かせて実行し、できた画面のスクショを記事に入れました(実行1回・約1秒)。数字はダミーなのでイントラページの値とは別物と明記しています。' },
  '017-gijiroku': { status: 'fix', note: '⚙️8/12夜の検品反映: ①会議録の優先順位を明記(①つぎやること=担当・期限 ②決まったこと・決まらなかったこと)。プロンプトも全部この順に統一 ②「AIはたまにサラッと嘘をつく(担当・期限をそれっぽく埋める)→だから確認する仕事が残る」を追記 ③Whisper追記(OpenAIが無料公開の文字起こしAI・自分のPCで動く・音声を外に送らない使い方可・会社PCは情シス確認+バイブコーディングなら一発) ④Q1を緩和後の基準に合わせ「会社契約AI(Claude Team)なら議事メモそのまま入れてOK」に ⑤「録音を外に出さない」→「要は、自分のメモを要約させる」に平易化。確認1点: プロンプトの枠名を「宿題」→「つぎやること」に変えました。戻せます。' },
  '020-hp-seisaku': { status: 'fix', note: '🖼8/12夜: 「挿絵が見えない」→この検品室で見られるようにしました(下にスクロールするとGitHubコミット一覧と一撃実装仕様書の実スクショ2枚が出ます)。「進め方は要件定義→実装計画→実装」の節+コツ2つ(実装計画はサブエージェント=記憶容量の節約/手順はスキル化)は反映済み。darariのClaude Code作業画面スクショが1枚あると完璧、のお願いは継続中です。' },
  '021-level-kitei': { status: 'fix', note: '⚙️8/12夜「AI入力情報基準の内容古いな！全部見直して！」→全部見直しました。旧レベル1/2/3前提を廃し、新体系(個人情報レベル1〜5×使うAIの区分の判断表)に全面差し替え。あわせて基準本体も緩和済み: 区分A・Bは原則入力可、不可は個人情報レベル4(マイナンバー)・レベル5(要配慮・家族)だけに限定。確認2点: ①機密(指定者のみ区分)だけ「指定者の承認」で残しました。ここも外して完全開放にしますか？ ②記事の推しフレーズ「不可を絞るほど、規程は強くなる」の言い切りでいいですか。' },
  '022-ai-browser': { status: 'fix', note: '⚙️8/12夜の検品反映: 有償であることを明記しました。個人=ChatGPT Plus 月$20/Claude Pro 月$20、会社導入=ChatGPT Business・Claude Team 各月$25(年払い月$20、Teamは5席から)、Enterprise2種は料金非公開の問い合わせ制、まで書き、「2026年8月時点+最新は公式で確認」の逃がしつき。過去からの確認継続: 誤読された実例など失敗談が1つあると締まります。' },

  // --- 8/10 ガバナンス連載3本（聞き取り第1弾の一次体験入り。両部長答申=drafts/答申_ガバナンス連載と教材_20260810.md） ---
  '023-governance-cycle': { status: 'fix', note: '⚙️8/12夜の検品反映: ①「法規制を伝える」の実態を修正——年1回の教育はAIの使い方の教育で、法規制の中身の周知ではない。急な法規制対応は招集、と書き直し ②普段の周知は「ポータル更新+必要時招集の2段構え」をぼくのスタンスとして提案する形にしました(「どうやるのがいいの？」への答え。重い会議体は作らない派です) ③記事の最後に「AIマネジメントサイクル年間カレンダー」を1枚もの(ガントチャート風・様式G-1の体)で作って挿入しました。この検品室で見られます。確認1点: 月割り(教育10月・調査1月・点検2月・改定3月)は仮置きです。前職の実際の時期に寄せるなら教えてください。' },
  '024-houkisei-chousa': { status: 'fix', note: '⚙️8/12夜の検品反映: Q2に「EUが事実上の世界標準になった前例」を追記——含有化学物質(RoHS/REACH)もCRAもEU発。CRAはことばメモで解説(EUで売るソフト入り製品にセキュリティ対応を義務づける法律。2024年成立・2027年12月本格適用。日付はEU公式で裏取り済み)。着地は「発売国にEUがなくても、EUだけは横目で注視」。' },
  '025-tsukuru-tsukau': { status: 'fix', note: '⚙️8/12夜: 「書いてもいいかな？と思うけどどう思う」→書くのに賛成です。入れました。「結局、外注先のAI利用は基本取引契約の機密保持の約束に含まれるので新しい対応はしない。ただし使うAIの種類・プランくらいはリスクとして確認しよう、という決着になった」を審議実話のオチの位置に。地味な決着こそ審議のリアル、として締まりました。' },

  // --- 8/10 ガバナンス連載・第2陣6本（聞き取り第2弾ベース。残るは基準改定編のみ=具体例聞き取り待ち） ---
  '026-doukou-watch': { status: 'fix', note: '⚙️8/12夜「薄っぺらい」→厚みを足しました: ①ウォッチの型を具体化(4レーン=法規制/大手の導入事例/ツール新機能/事故事例×周期の濃淡×国の定点=総務省・経産省AI事業者ガイドライン、IPAのAISI。すべて「見るならここ」の提案として) ②「拾いっぱなしにしない出口」3つ(ポータル1行更新/教育資料の差し替え/稟議の世間動向欄)を新設。正直に言うとこの記事は一次体験がまだ薄いです。動向ウォッチ時代の実話(拾ったネタが会議で刺さった/スベった等)が1つあると化けます。何かありませんか？' },
  '027-kyouiku': { status: 'fix', note: '⚙️8/12夜の検品反映: ①冒頭に「先に言っておきます。今回は、愚痴回です」を宣言 ②想定問答を削除(愚痴回は型を崩す。まとめで「いつもなら想定問答ですが、愚痴回なのでなしです！」と明示) ③締めは「形式にツッコむだけの人のことは、気にしなくていい。突き進みましょう！」→「……変な話で失礼しました」で軽く抜ける形に。確認1点: 「アホなやつ」はこの表現まで丸めました。もっと強くてよければ戻します。' },
  '028-katsuyou-chousa': { status: 'fix', note: '⚙️8/12夜の方向転換を反映: 核を「職場に台帳を管理してもらう」方式に書き換えました——①各職場でAIサービス利用台帳を管理 ②年1回見直してもらう ③報告をもらうだけ。「ひとりで全社を調べ続けると、AIを管理する人が潰れます」を言い切りに。アンケートは「年1回・台帳の外側(シャドーAI)を拾う道具・マネジメントサイクルに組み込む」に位置づけ直し。誤ログイン自己申告の実話は温存。' },
  '029-unyou-check': { status: 'fix', note: '⚙️8/12夜の検品反映: ①質問と規程の紐づけを明示——質問1=AI利用規程第13条(教育)、質問2=AIサービス利用基準4(台帳)、点検の根拠=第16条。「聞きたい質問が規程になければ、先に規程を改定して根拠を作る。質問と規程はセット」の1段落も追加(規程側の第16条にも管理者変更の反映・周知を追記済み) ②質問を4問化: 教育受けた？/台帳ある？/管理者変更あれば台帳更新した？/(規程を作ったばかりなら)規程があること知ってる？' },
  '030-shingi': { status: 'fix', note: '⚙️8/12夜の検品反映: ①コツ追記「担当者の名前をちゃんと呼ぶ。法務の〇〇さん、どうですか？——名前で呼ばれた瞬間に自分ごとになる」 ②聞かれがち2問を追加——「結局、全部自分がやるのでは？」→「そうなんです！なのでわが社には自作チャットボットがいます。この話はまた後日」/「どうしてもうまくいかないときは？」→「上司を使いましょう。そのために高い給料をもらっているのですから」。確認1点: チャットボットの言及はこの1文の深さで止めています(詳細は後日記事)。OKですか。' },
  '031-ai-consul': { status: 'fix', note: '⚙️8/12夜「解像度が低い→Webで網羅的に調べて」→調べて書き直しました。「AIコンサルは何をしてくれるのか」を公開情報ベースの7分類(診断/規程・体制構築/リスクアセスメント/法規制レポート/教育研修/個別助言/ISO 42001認証・PoC伴走)+相場感に拡充し、「メニューは立派。でも最後の一歩=社内語への翻訳はどのメニューにも入っていない」の構図に接続。DeepSeek実話・守秘義務の線は変えていません。確認1点: 相場(スポット数十万〜プロジェクト数百万円)は公開ガイドの一般情報です。載せてよいですか(実契約額とは無関係)。' },
  '032-kijun-kaitei': { status: 'new', note: '【新規・ガバナンス連載・これで10/10完走】基準改定編。「改定の大半は書き回し修正。だから軽く頻繁に回す」の正直路線。確認3点: ①失敗談が「構えていたら拍子抜けだった」だけで薄いです。「小さすぎて出すのを迷った修正」「改定タイミングを逃した話」等があれば足します ②「改定は結構あった」の頻度、年に何回くらいか目安ありますか(A2でずらして書きます) ③「手続きを重さで二段階に分ける」型は一般論として書きました。前職で実際にやっていたなら実話に昇格させます。' },

  // --- Substack配信下書き（drafts/substack/。HP記事ではなくニュースレターの原稿） ---
  'substack-tsuutatsu-1': { status: 'new', note: '【Substack創刊号】ダラリ重工業の社内通達という体で届く自己紹介+AI利用規程の案内。⚙️8/11更新: ①規程ページの全部改正(5条建て→17条)に合わせて「暫定版」を外し、条番号を第9・10・17条に修正 ②002のリンク文言を現タイトルに修正 ③「法務部の直しが7回」は規程ページ附則からの引用です。確認3点: ①「あなたの会社の闇が、ダラリ重工業の公式文書になります」の締めはこの強さでOKですか ②編集後記のクレカ四半期ネタ(004/005と同じずらし済み数字)でOKですか ③配信は第1号→第2号の順でいいですか(第2号側は入れ替え可の設計)' },
  'substack-tsuutatsu-2': { status: 'new', note: '【Substack第2号】記事001の配信版。「個人なら翌日、会社だと半年後」の現状報告体。001と数字・固有名詞(Copilot Chat/DeepL/四半期/半年)の整合は確認済みです。確認2点: ①返信を促す問いかけ「おたくの会社では、AIはどこまで使えますか？」でいきますか ②編集後記の「時差なら、縮められる」の捉え直し、実感と合っていますか' },
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
const SUBSTACK_DIR = join(ROOT, 'drafts/substack');
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
