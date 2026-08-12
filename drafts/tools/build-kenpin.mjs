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
  '006-meishi-bot': { status: 'fix', note: '⚙️8/12検品反映: 「先にそろえる3つの登録」の頭に、①ここからは詳細手順ではなく概要 ②おすすめ2点(AIのWork/Cowork・CodexかClaude Codeのデスクトップアプリで左にブラウザ) ③人間は「一緒に取得しよう」と言うだけ、を追記しました。あわせて名刺の基準参照を新体系(個人情報取扱基準の「業務上の連絡先」+大量データ化は所属長承認)に更新。過去分の反映(LINEスクショ加工・Luna2択)は登録済みのままです。' },
  '007-rpa-daitai': { status: 'fix', note: '⏸8/12検品「システムまではっきり触らないと確認できないから時間かかる。ちょい待ち」→ そのまま待機中です。急ぎません、実機で確認できたら結果だけください。(8/10までの反映: 会議録発行システムの実物+図解スクショ+10秒動画は登録済み)' },
  '008-shanai-system': { status: 'fix', note: '⏸8/12検品「ふむいいかもね。図とか動画は別途確認必要」→ 図・動画の確認待ちで待機中です。(8/10までの反映: 実物マニュアル+3ステップ図解+スクロール動画は登録済み。darariの実機スクショが1枚あると完璧、のお願いも継続中)' },
  '011-dare-ga-itta': { status: 'fix', note: '✅8/12検品「いいね問題なし」ありがとうございます。図解・挿絵をたくさん入れる件: 支給いただいたCodex図解プロンプトを正本としてスキルに保存しました(image-gen-midori/zukai-prompt.md)。次のターンで、この記事のどの段落に何枚入れるかの設計→生成→検品出しまでやります。キャラクター画像はいつもの子(だらリーヌ)でいいですか？' },
  '012-kuni-mo-yare': { status: 'fix', note: '⚙️8/12検品反映: 「その日までにやること: メール1本です」→「『AIに詳しい人』のポジションを取っておく」に変更し、4アクション(①メール1本 ②AIコミュニティに書き込む ③なければチャットグループから立ち上げる ④会議の雑談で話題にする)に展開しました。確認1点: タイトル末尾が「だから、メールを1本だけ」のままです。残すか、「だから、『詳しい人』の椅子を取っておく」あたりに変えるか。' },

  // --- 8/8 新規5本（Fableサブエージェントが1本ずつ執筆） ---
  '014-nyuuryoku-handan': { status: 'fix', note: '⚙️8/12検品反映・全面書き直し: タイトルを『会議録、そのままAIに入れてません？』に変更し、darari案の流れ(会議録はAIの基本→そのままはダメな場合あり→機密を入れていいAIか？→AI入力基準を見る→社外相手はひと声、今だけ)で再構成しました。抽象化テク(A社に変える)・失敗談・立ち話テストは中盤に流用。基準側も再編済み(個人情報取扱基準を新設し、AI入力情報基準を「情報×使うAIの区分」のマトリクスに全部改定。意見はチャット報告に書きました)。確認2点: ①AIの説明を「会社契約=学習させない契約/個人・無料=機密NG」の二分に一般化しました。この粒度でOKか ②「時代が追いついたら聞かなくてよくなるはず」をdarariの言葉のまま主張にしています。' },
  '015-joushisu-shitsumon': { status: 'fix', note: '⚙️8/12検品反映: ①冒頭に「AI申請の決まりがある会社はそれに従いましょう！この記事は決まりがまだない場合の話」を明記 ②「とある会社は情シス=仕組みを作る係、判断は使う部門」+「これは驚いた」を追記 ③質問リストを実物ベースで5系統(データの行き先/ログイン認証/ユーザーと権限/クラウドの中の守り/ログと監視)に拡充(会社が分からないよう一般化済み) ④答え方を3つの型(自社認証基盤に乗せる=Google紐づきだと楽のコツ入り/クラウド側の公開情報・SOC 2等で示す/リスクを具体的に書いて受容提案)に整理 ⑤「わからなければ一緒に考える」で着地。確認2点: ①「とある会社」の書き方、うちの会社の話と読まれないか目視ください ②「守り3点に事故系を足すか」→足さない方がいい派です。あれは用途リスク(AI管理チームの領分)で、3点の切れ味が鈍るので。' },
  '016-excel-shukei': { status: 'fix', note: '⚙️8/12検品反映: 実例を「各装置の稼働率・エラー件数・不良率の月次集計」に差し替え、ダラリ重工業のイントラに集計ページの実物を新設しました(/company/intranet/kadou-shukei/ 。手集計約1日半→AIスクリプト約3分・毎朝速報、の体)。3段構成・プロンプト・失敗談は維持し、例文を稼働集計の文脈に書き換え。ページの実スクショも記事に挿入済みです。確認2点: ①架空側の設備構成(NC旋盤2台+マシニング1台+組立2ライン+画像検査装置)と数値の雰囲気、実際の職場と近すぎないか目視ください ②「手集計1日半→AI3分」の効果の匙加減(架空側の設定値です)。' },
  '017-gijiroku': { status: 'fix', note: '⚙️8/12検品反映: 冒頭で「会議録をAIに書かせるのは基本。ただし『そのまま入れていいか』は別問題」として014(会議録そのままAIに入れてません？)へ接続しました。旧レベル2/3の参照は新体系の言い方(議事メモ=社内限→固有名詞を伏せれば会社契約AIで可/取引先名・原価が乗ると社外秘)に更新。確認1点: 冒頭の接続を3段落入れています。つかみのテンポを削ぐようなら1段落に圧縮します。' },
  '018-meishi-bot-kaisetsu': { status: 'fix', note: '⚙️8/12検品「つまらん！」→全面再構成しました。新タイトル『猫の写真は、なぜ名刺Botに断られたのか』。006既出の「猫が断られた」を冒頭の謎にして、仕組み解説をそのまま犯人捜しの捜査に変換。オチは「実行役はif文、黒幕はプロンプトの日本語1行」。事実・失敗談3点・コード引用は現行のまま。確認2点: ①実リポのモデル名がGPT-5-nanoで合っているか ②「名刺と猫が各駅をどう進むか」の路線図図解を1枚発注してよいか(011でもらったプロンプト正本を使います)。' },
  '019-jidoka-hikkoshi': { status: 'fix', note: '⚙️8/12: ①「PowerAutomateもできるのかな？」→調べました。できます！フローをパッケージ(zip)に書き出すと中に設計図(definition.json)が入っていて、AIに渡せば同じ引っ越し相談ができます。想定問答Q4に追記しました ②013(VPS事件)がボツになったのでリンク2箇所を外し、本文の言い回しで吸収しました。確認1点: 「うーん。。。。どうなのか。。。。」の正体を一言ください(切り口を変えたい/ネタ自体が弱い/事実関係が怪しい、のどれかで)。' },
  '020-hp-seisaku': { status: 'fix', note: '⚙️8/12検品反映: ①実スクショ2枚を挿入しました。GitHubのコミット一覧(「darari指示」が並ぶ実物)と一撃実装仕様書(REQUESTS.md)の画面。どちらも公開リポの実ページです ②「進め方は要件定義→実装計画→実装」の節を新設し、コツ2つ(実装計画はサブエージェントに立てさせる前提=記憶容量の節約/よく使う手順はスキルという手順書ファイルにする)を追加。確認2点: ①コツ2つの説明、darariの意図と合っていますか ②darariのClaude Code作業画面のスクショが1枚あると臨場感が完璧です(会社情報が写らない範囲で)。' },
  '021-level-kitei': { status: 'new', note: '【新規・ガバナンス】「個人情報は入力禁止」の一行ルールをレベル規程に書き直す方法(ルールを書く側向け。014=入力する側との住み分けを冒頭で明示)。レベル表は持ち帰り可能なMarkdown表で掲載。確認3点: ①失敗談に「消耗すると一行ルールに流れたくなる誘惑を知っている」という心情解釈を足しています ②Q4「監査に強いのは、実は線を引いたほう」の断定の強さ ③タイトルの「同じ箱に入れない」メタファー(本文でも繰り返し使用)。⚙️8/10: 規程体系の整備に伴い、レベル表の参照を「AI利用規程・第3条」→「AI入力情報基準」(新ページ)に更新しました。' },
  '022-ai-browser': { status: 'new', note: '【新規・AIカイゼン】006の「また解説します」回収。スクショで聞く(008)→拡張機能→アプリ内ブラウザ(AIと同じ画面を見る)の進化3段階で整理。パスワードは自分で打つ等のC3注意つき。確認3点: ①失敗談が薄いです(誤読された実例など実体験があれば1段落ください) ②「頼み方の3ステップ」は型として書いた推測混じり ③「迷子の時間が、ほぼ消えます」は006の「超絶スムーズ」から起こした強さです。盛りすぎなら弱めます。' },

  // --- 8/10 ガバナンス連載3本（聞き取り第1弾の一次体験入り。両部長答申=drafts/答申_ガバナンス連載と教材_20260810.md） ---
  '023-governance-cycle': { status: 'new', note: '【新規・ガバナンス連載】マネジメントサイクル総論。たらいまわし実話(調査=法務・分析=法務×AI管理チーム共同)入り。確認3点: ①法務の「うちは調査だけ」を「誠実な答えだと思います」と肯定的に描きました。当時の実感と合いますか ②「毎年まわす」体裁で書きました。複数年回した(または回す設計で作った)理解でOKですか ③想定問答の問い合わせ例(「このツール使っていい？」等)は創作寄りです。実際に来た問い合わせの型があれば差し替えます。' },
  '024-houkisei-chousa': { status: 'new', note: '【新規・ガバナンス連載】発売国だけ・EU有無・一番厳しい所に基準。外注月200万＋自作ai-reg-atlas(「会社には言ってない」も書きました。NGなら消します)＋一枚図解を会議通知に添える運用入り。確認3点: ①会議のこんがらがり描写は記憶ベースの肉付けです。OKですか ②「一番厳しい国の基準に合わせる」対象(社内規程か製品要求か)を曖昧にしています。具体を足せますか ③Q4「上司に全世界見ておいてと言われたら」の返しは創作寄り。実際のやり取りがあれば差し替えます。' },
  '025-tsukuru-tsukau': { status: 'new', note: '【新規・ガバナンス連載】作る側/使う側の2方向見取り図。審議実話2件(外注先のAI扱い・採用AIハイリスク騒ぎ)入り。確認3点: ①外注先AI案件の審議の決着(基準に追記した等)を書ける範囲でもらえるとオチが強くなります ②「審議でざわついた」の温度感と会社特定要素の目視確認をお願いします ③タイトル長めです。短縮案「なんで質問攻めなの？——会社のAIは『作る側』と『使う側』で聞かれることが違います」も可。' },

  // --- 8/10 ガバナンス連載・第2陣6本（聞き取り第2弾ベース。残るは基準改定編のみ=具体例聞き取り待ち） ---
  '026-doukou-watch': { status: 'new', note: '【新規・ガバナンス連載】動向ウォッチ。Web検索で十分・Xは空白地帯・コンサルはぼやかす(そりゃそう)・オンプレ以外ブロックの覚悟。確認3点: ①Xの扱いを「拾っていたが同業者がほぼいない=空白地帯」に倒しました。実感が「Xで拾えて有利だった」寄りなら直します ②失敗談に「これなら自分で調べられたな…と一瞬思った」の心の声を足しています。温度感OKですか ③まとめの検索の型「業界名+AI+導入事例」は一般論です。実際に使った検索の型があれば差し替えます。' },
  '027-kyouiku': { status: 'new', note: '【新規・ガバナンス連載】教育編。形式指摘は中身が通った合図、の一本勝負。確認3点: ①タイトルに「グローバルな色使いにしろ」をそのまま出しました。指摘した本人が読んだら気づく可能性があります。この露出でOKですか ②失敗談の教訓「その場で聞けばよかった」は逆算です。実際は聞き返しました？(聞いたけど謎だったなら書き換えます) ③「呼ばれた人は何か指摘しないと帰れない→中身がまともだと形式に寄る」の理屈はぼくの一般化です。' },
  '028-katsuyou-chousa': { status: 'new', note: '【新規・ガバナンス連載】活用調査。アンケート+誤ログインの自己申告実話。確認3点: ①失敗談の型を「管理側の反省(間違えてログインできる状態の放置)」で代用しました。本人のやらかし(回収率が悲惨だった等)があれば差し替えます ②誤ログインの描写粒度はOKですか(部署・時期は伏せました。当事者範囲が気になるならさらにぼかせます) ③「きれいで空っぽの集計結果」の言い切りは誇張気味です。残すか削るか。' },
  '029-unyou-check': { status: 'new', note: '【新規・ガバナンス連載】運用チェック。教育実施率+台帳の2問に絞る型。確認3点: ①「責任者が決まらない件、お願いを続ける以上の決定打はなかった」は実態と合いますか(何か手を打っていたなら差し替え) ②「実質2つに絞った」と書きました。実際はもっと項目があったなら「中心はこの2つ」に弱めます ③失敗談が正規の「ぼくのやらかし」で埋まっていません。この題材で使える失敗談があれば1つください。' },
  '030-shingi': { status: 'new', note: '【新規・ガバナンス連載】審議・パブコメ。「なんかありますか？」と聞いて回る役がいれば回る。確認3点: ①「パブコメをぼくが引き取る→聞いて回る運用がここから始まった」の時系列にしました。実際は審議運用が先でパブコメは適用例なら直します ②たらいまわしの会話ディテール(「法務？いや技術も…」)は演出です ③読者が上司に言うセリフの一人称を「わたし」にしました。違和感あれば調整。' },
  '031-ai-consul': { status: 'new', note: '【新規・ガバナンス連載】AIコンサル。DeepSeek板挟みの核実話。⚠️会社特定対策: 市場名は「その市場」「現地に事業部門」にぼかし済み(残余リスク: 読者が中国売上大と推測する余地)。要目視。確認3点: ①「よその内情をペラペラ話すコンサルは、うちの内情もペラペラ話します」は一歩踏み込んだ一般論です。言い過ぎなら削ります ②「この件では有効に使えなかった」と限定しました。契約全体の実感と合いますか ③助言例「利用ルールを整備しましょう」等は創作気味。実際の言葉に近いものがあれば差し替えます。' },
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
  return { slug, fm, raw, status: meta.status, note: meta.note, hero: embedImage(fm.ogImage) };
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
      raw, status: meta.status, note: meta.note, hero: null,
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
