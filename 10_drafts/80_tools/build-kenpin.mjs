import { readFileSync, readdirSync, writeFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = '/Volumes/DevSSD/Vibe_Website/260805_Darari-nu_HP';
const DIR = join(ROOT, 'src/content/articles');

// 2館制（2026-08-19 darari指示「検品ファイルが重くなりすぎたので2つに分けて」）
// 第1館 = 記事001〜032＋Substack原稿（既存URL）／第2館 = 記事033以降＋新設ページ紹介
// 使い方: node build-kenpin.mjs      → 第1館 /tmp/kenpin.html
//         node build-kenpin.mjs 2    → 第2館 /tmp/kenpin2.html
const VOL = process.argv[2] === '2' ? 2 : 1;
const VOL1_URL = 'https://claude.ai/code/artifact/81fd4910-daef-412b-bc58-13b13cf7f122';
const VOL2_URL = 'https://claude.ai/code/artifact/77633bc0-f512-4ad3-a84f-9937a5d91d3a';
const PUBLIC = join(ROOT, 'public');
const OUT = VOL === 2 ? '/tmp/kenpin2.html' : '/tmp/kenpin.html';

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
    if (kb > 512) { map[p] = { tooBig: true, kb: Math.round(kb) }; continue; } // 512KB超は埋め込まず公開サイトへのリンクにする（2026-08-19軽量化）
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
        execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '55', '-Z', '640', src, '--out', thumb], { stdio: 'ignore' });
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
  '006-meishi-bot': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。検証実録・登録3つ・料金は保持。特典(AIへの依頼文)と想定問答3問を新設。次回予告(E2)を削除。⚠️失敗談が薄いです(サーバー寄り道のみ。名刺Bot作りの実失敗があれば一言ください)。' },
  '007-rpa-daitai': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。実物画像3枚・動画は保持。失敗談(雑な指示で迷走)を実演後に配置、「ブラウザで動く場合限定」の通用条件を明記、特典(依頼文)を新設。' },
  '008-shanai-system': { status: 'fix', note: '🆕8/19: 新カード方式（ルール列挙ゼロ・カード6枚+見本だけで執筆）の試作1本目として再々構成しました。195行→135行。想定問答なし（新裁定どおり）。旧構成の「プロジェクト/スキルに置く」「手順書ごと作らせる」「文言だけ打ち込む逃げ道」は削除。⚠️失敗談なし（材料に本人の実話が無いため作らず。「分類1」実演の直後が差し込み適所です）。Copilot実物スクショは画面収録の許可待ち。旧方式との読み比べをお願いします。＋8/19検品反映: 自己紹介(こんにちは、だらリーヌです！)を追加しました。' },
  '011-dare-ga-itta': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。8/13検品OKの本文はほぼ温存(図解3枚込み)。——・じゃあ・って除去と冒頭の心の声追加のみ。' },
  '012-kuni-mo-yare': { status: 'fix', note: '🆕8/19カード方式で再執筆（ルール列挙ゼロ・カード6枚+材料のみ。自己紹介入り）。想定問答4問を全削除して本文に吸収（解説回のため）。失敗談なし（裏付け実話が無いため作らず）。8/21公開予定の返事も引き続きお待ちしています。' },

  // --- 8/8 新規5本（Fableサブエージェントが1本ずつ執筆） ---
  '014-nyuuryoku-handan': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。抽象化ビフォー/アフター・3ステップ・立ち話テスト保持。失敗談(スマホChatGPT・勘で捌いた)を共感位置へ。B6対応で「導入して」→「7名分申請して」。約2割短縮。' },
  '015-joushisu-shitsumon': { status: 'fix', note: '🆕8/19カード方式で再執筆（ルール列挙ゼロ・カード6枚+材料のみ。自己紹介入り）。想定問答は理由つきで維持し5問→3問に（この記事は実際に情シスへ持って行く場面がある）。型①の枝解説を1文に圧縮。「聞かれる側と聞く側、両方やった人間です」の名乗りに。' },
  '016-excel-shukei': { status: 'fix', note: '🆕8/19カード方式で再執筆（ルール列挙ゼロ・カード6枚+材料のみ。自己紹介入り）。ご指定のストーリーは不変。想定問答5問を全削除（申請・説得の場面が無い記事のため）。様式内の転記指示を引用→「……転記、公式ルールなんです」のツッコミ型に。⚠️失敗談「検算せずに出しかけた」は引き続き本人確認待ちです。' },
  '017-gijiroku': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。内職失敗談の削除(G)・PCメモ・Zoom/Teams録音は維持。プロンプト・ダミー練習保持。⚠️失敗談なしの構成です(内職削除後、記事内に他の実話がないため)。' },
  '020-hp-seisaku': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。8/13検品OKの実物・タイムライン・エピソードは全部保持。Cloudflare訂正済み。「別の記事で解説します」の次回予告を削除。' },
  '021-level-kitei': { status: 'fix', note: '🆕8/19カード方式で再執筆（ルール列挙ゼロ・カード6枚+材料のみ。自己紹介入り）。表・レベル・整合は一字も不変。想定問答3問を削除（「法務の直し7回」の小ネタも一緒に消えています。惜しければ戻します）。冒頭で「一律禁止は思考停止」と言い切る形に。' },
  '022-ai-browser': { status: 'fix', note: '🆕8/19カード方式で再執筆（ルール列挙ゼロ・カード6枚+材料のみ。自己紹介入り）。想定問答3問を全削除（個人作業の記事のため）。特典プロンプトと料金表は一字も不変。名刺Bot登録3つの実体験を共感位置に。' },

  // --- 8/10 ガバナンス連載3本（聞き取り第1弾の一次体験入り。両部長答申=10_drafts/答申_ガバナンス連載と教材_20260810.md） ---
  '023-governance-cycle': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。実物カレンダー中盤配置・9工程は維持。特典(自社版カレンダーの叩き台プロンプト)を新設→要確認。パブコメ実話は聞き取りメモ準拠で「EU」と明示しない形に修正。次回予告削除。' },
  '024-houkisei-chousa': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。「EUだけは例外(速報だけ拾う)」を冒頭宣言。日本の状況・AI Reg Atlas導線維持。特典(発売国リストの叩き台)を新設→要確認。⚠️「全部追って潰れかけた」の一次体験は裏付けメモになく、共感は一般化した書き方です。' },
  '025-tsukuru-tsukau': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。約2割短縮。失敗談(見取り図に穴=外注先がAIを使う案件)を実演後に配置。特典(申請3点をAIと埋めるプロンプト)を新設→要確認。' },

  // --- 8/10 ガバナンス連載・第2陣6本（聞き取り第2弾ベース。残るは基準改定編のみ=具体例聞き取り待ち） ---
  '026-doukou-watch': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。DeepSeek実話・4レーン維持。コンサル失敗談を共感位置へ。特典(他社動向ディープリサーチ用プロンプト)を新設→要確認。' },
  '027-kyouiku': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。愚痴回スタイル(E9・冒頭宣言・想定問答なし)は維持。実話を先に出す順序替えが主。' },
  '028-katsuyou-chousa': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。台帳方式・誤ログイン自己申告の実話は維持。共感1拍と図解コメント2点を追加。' },
  '029-unyou-check': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。4問リスト・規程との紐づけ維持。特典(規程から点検質問を作るプロンプト)を新設→要確認。' },
  '030-shingi': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。パブコメたらいまわし実話を共感位置へ。名前で呼ぶコツ・上司を使う回答・チャットボット言及の深さは不変。' },
  '031-ai-consul': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。メニュー7つ・料金・出典維持(説明は圧縮)。DeepSeek失敗談を引用→一言ツッコミ型に。ぼかし水準は不変。' },
  '032-kijun-kaitei': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。「軽く頻繁に回す」主張・一般論の明示は維持。⚠️失敗談は「大ごとと構えたら拍子抜け」のみで薄いです(改定の実話があれば一言ください)。' },

  // --- Substack配信下書き（10_drafts/10_substack/。HP記事ではなくニュースレターの原稿） ---
  'substack-tsuutatsu-1': { status: 'new', note: '【Substack創刊号・これが出ると創刊です】ダラリ重工業の社内通達という体で届く自己紹介+AI利用規程の案内。🔎8/14創刊前の最終点検済み: 本文の記載事実(全17条・第1/9/10/17条の内容・「法務部の直しが7回」・クレカ四半期はイントラの決裁権限表に実物あり・002のタイトル・リンクURL)がすべて現在のサイト実体と一致していることを再確認しました。機械検査0件。確認3点: ①「あなたの会社の闇が、ダラリ重工業の公式文書になります」の締めはこの強さでOKですか ②編集後記のクレカ四半期ネタ(004/005と同じずらし済み数字)でOKですか ③配信は第1号→第2号の順でいいですか(第2号側は入れ替え可の設計)。※創刊はHP第1弾4本(001/002/004/005)の公開が先です。4本は検品済みなので「第1弾GO」の一言でぼくが公開作業までやります。' },
  'substack-tsuutatsu-2': { status: 'new', note: '【Substack第2号】記事001の配信版。「個人なら翌日、会社だと半年後」の現状報告体。🔎8/14点検済み: 001と数字・固有名詞(Copilot Chat/DeepL/四半期/半年)の整合、リンクURL・記事タイトルの一致を再確認。機械検査0件。確認2点: ①返信を促す問いかけ「おたくの会社では、AIはどこまで使えますか？」でいきますか ②編集後記の「時差なら、縮められる」の捉え直し、実感と合っていますか' },

  // --- 8/15 資料庫まとめ書き5本（検証済み一次だけを弾に、Fable並列執筆。図解・OGP画像は検品後にimage-gen-midoriで発注） ---
  '033-hojokin-kaimei': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。正式名称・5枠の表・締切・出典3リンクは一字も変えず保持。WAF誤報告・404の失敗談も維持。' },
  '034-ai-kinshi-ritsu': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。0.4%/1.4%/3.5%の数字・母数・出典・転載禁止の断りは全部保持。「幅でまとめかけた」失敗談も維持。' },
  '035-muryou-ai-chizu': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。83か所の数字・内訳は全部保持。/free-ai/ページへのリンクを冒頭に新設。失敗談3件を共感位置へ。' },
  '036-shikaku-muryou': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。5資格の調査結果・受験料(E8)は全部保持。特典をE14書式(#見出し+箇条書き)に構造化。' },
  '037-ringi-zero-kouza': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。785件・0件×3などの数字保持。B6対応「申請を通しました」→「7名分、申請しました」。' },

  // --- 8/16 資料庫まとめ書き第2陣6本（フレームは第1陣と同じ「ぼくがAIに調べさせた実況」） ---
  '038-tasha-jirei': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。一次発表縛り・事例の中身は保持。失敗談(日立70%等が崩れた)を共感位置へ。冒頭の「ぼくも急いで貼った」描写は裏付けがないため削除。⚠️タイトルの「置いていきます」を残すか一言ください。' },
  '039-magobiki-kenshou': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。3ステップ手順・遡り実例は保持。孫引きリスト事件を共感位置へ。' },
  '040-kitei-link-shu': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。リンク集11者17本・タグ・注記は全文保持。版ズレ失敗談はリンク集の後に配置。' },
  '041-ecrs-jidouka': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。ECRSの主張・例3つ保持。特典をE14書式化、通用条件とQ3を追加。⚠️失敗談はテーマと遠い調査事故のみで薄いです。' },
  '042-kyt-ai-risk': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。C1(設備・機械の安全はAIに任せない)は2箇所で維持。4ラウンド表保持。厚労省定義を引用→ツッコミ型に。' },
  '043-kojinjouhou-kaisei': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。公布日・条番号・PPCリンク・質問文3本は一字も変えず保持。失敗談(404・版ズレ)を前半へ。' },

  // --- 8/16 第3陣5本(Obsidian台帳+採用ログの★素材。数字は実測値のまま) ---
  '044-sashimodoshi-ppt': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。パワポ2週間の実話・当時メモ引用は保持。特典(3人の立場の想定ツッコミ洗い出しプロンプト)を新設→要確認。' },
  '045-ai-shain-ikusei': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。事件1〜3の日付・数字は不変。絵文字は既存の👉のみ残置。' },
  '046-api-key-jiko': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。直書き→約10時間公開の時系列・鍵の3か条・会社ルール前置き(C3)は保持。' },
  '047-ponkotsu-pc': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。GitHub Actions/Pagesの事実・料金出典保持。失敗談3件(惨敗・Pages不可・7時間停止)配置換えのみ。' },
  '048-dummy-data': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。不良報告書の見本・3ステップ保持。失敗談(初日から本物メモ)を共感位置へ。特典をE14書式化。' },

  '049-tanoshisa-iriguchi': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。darari原文の言葉を最優先で保持(社長が一番ウケた等)。⚠️失敗談「便利です一本槍で空振り」は原文に明記がなく既存記事の敷衍です。実話として合っていますか。' },

  '050-reishou-shinai': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。原文の言葉(健全な行動・空気3連・ガバナンスの定義)は保持。⚠️「ぼくは止めきれなかった」の反省は原文に明記なし。実感として合っていますか。' },

  '051-ryousan-checklist': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。12項目・ISO対応表・A4注意は保持。⚠️失敗談は「泣く場面を近くで見た」どまりで薄いです(一次の実話があれば一言ください)。' },

  '052-jouhou-jidou': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。GitHub Actions・403・User-Agent等の技術的事実は全部保持。👉絵文字を除去。' },

  // --- 8/17 第4陣4本(資料庫の大物統計・事例の深掘り。事前添削は執筆時に鉄則注入済み) ---
  '053-mawari-tsukatteru': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。3調査の数字・母数保持。タイトルの「って様子見」→「と様子見」に変更(って禁止対応)。' },
  '054-dena-workflow': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。時系列と出典4リンクは原型維持。前置き宣言の削除と素の反応の追加のみ。' },
  '055-shimadzu-3nen': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。「3,000人超」対「約3,000人」の失敗談・出典保持。前置き削除と話し言葉見出し化のみ。' },
  '056-kouka-jitan': { status: 'fix', note: '⚙️8/18「全部書き直し」指示: v4(PASONA型)で全面再構成+AI臭除去+Codex検品済み。91.6%/3.9%・IPA/総務省出典保持。前置き削除のみ。' },

  // --- 8/15 新設ページ2つ(未公開・push前。詳細は各紹介文) ---
  'page-llm-cost': { status: 'new', note: '【新設ページ①・未公開】darari承認済みの「トークン数→月額」計算機の実装報告。動作検証済み。確認3点: ①入力の既定値の肌感 ②為替150円仮置き表記 ③SaaS公開価格帯(月0〜12万円)への言及の書き方' },
  'page-muryou-ai': { status: 'new', note: '【新設ページ②・未公開】83か所の常設一覧。イケハヤ・西野両部長の合同答申を反映(「地図」の語を排除/独断宣言/再検証予約のSubstack導線/ダラリ重工業は出さない)。確認3点: ①ページ名 ②スタンス宣言の文言 ③実名の罠注記をこのまま出すか' },

  // --- 8/19 本人Obsidianメモ4本→当日執筆(カード方式。素材の正本=10_drafts/素材_darari原文_*_20260819.md) ---
  '058-gaichuusaki-ai': { status: 'new', note: '🆕8/19本人メモ「ベンダー・フリーランスのAI利用ガイド」から新規執筆(カード方式)。発注側→フリーランス側の二部構成。想定問答3問あり(外注先への返事・発注者からの質問という実場面がある記事のため)。⚠️Q1「一律禁止より管理確認が現実的」とQ2「確認の重さは預けるものの重さで変わる」はメモからの敷衍で、審議の明示的な結論ではありません(主観マーカーつきにしています)。失敗談は025の「初回相談で固まった」の再利用のみ。実際の外注先とのやり取りの実話が1つあれば教えてください。' },
  '059-eu-toumeisei': { status: 'new', note: '🆕8/19本人メモ「EU AI Act透明性義務」から新規執筆(カード方式)。解説回=S中心・結論ファースト。SNSラベル=第50条対応と断定しない留保は遵守。060と姉妹・相互リンク。⚠️「罰金もある本気の法律」は024の性格づけの流用で、第50条違反の罰金額そのものは未確認・不記載です。失敗談ゼロ。「日本は関係ないで済まない理由」の節に、前職でEU規制の玉突きを見た実話が1つあると締まります。' },
  '060-kinshi-ai': { status: 'new', note: '🆕8/19本人メモ「EU AI Actの禁止AIとその意図」から新規執筆(カード方式)。禁止5例の現場語訳+軍事等は適用範囲外の面白ポイント。4段の呼称は059と統一。「映画で見たやつだ」「土俵の外」などは声の演出で、法的な新事実の追加はありません。失敗談は024のこんがらがり話の再利用のみ。CTAのSubstack直リンクは他記事の慣行(サイト側の自動導線)に合わせて外しました。' },
  '061-jibun-data': { status: 'new', note: '🆕8/19本人メモ「AI時代の自分データ活用」から新規執筆(カード方式・AIカイゼン軸)。「もったいない」と「持ち出してよい」は別の話、が芯。⚠️確認2点: ①「ぼく自身まだ考え方を整理した段階」(抽出は未実施)と書きました。実際に試していたら教えてください ②冒頭の「家のAIに書かせると自分っぽくない」はメモの用途欄から逆算した読者シーンです。文体特徴の例示(「結論を先に書く」等)は作例。失敗談は014の自分宛てメール実話の再利用。' },
};
// Brain教材の検品はこのページではやらない（2026-08-17 darari指示で専用の検品室に分離。build-kenpin-brain.mjs 参照）

const files = readdirSync(DIR).filter((f) => f.endsWith('.md') && !f.startsWith('_')).sort();
let articles = files.map((f) => {
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
  return { slug, fm, raw, status: meta.status, note: meta.note, hero: embedImage(fm.ogImage), media: inlineMediaMap(raw), pubUrl: 'https://darari-nu.com/articles/' + slug + '/' };
});

// Substack配信下書き（frontmatterなし。配信タイトル案の行をタイトルに使う）
const SUBSTACK_DIR = join(ROOT, '10_drafts/10_substack');
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
      raw, status: meta.status, note: meta.note, hero: null, media: inlineMediaMap(raw), pubUrl: 'https://dararinu.substack.com/',
    });
  }
}

// 新設ページの紹介文（10_drafts/60_回覧資料/検品ページ紹介/*.md。HP記事でないページの検品用）
const PAGES_DIR = join(ROOT, '10_drafts/60_回覧資料/検品ページ紹介');
if (existsSync(PAGES_DIR)) {
  let pageNo = 0;
  for (const f of readdirSync(PAGES_DIR).filter((f) => f.endsWith('.md')).sort()) {
    const raw = readFileSync(join(PAGES_DIR, f), 'utf8');
    const title = raw.split('\n')[0].replace(/^#\s*/, '');
    pageNo += 1;
    const slug = 'page-' + f.replace('.md', '');
    const meta = NOTES[slug] || { status: 'new', note: '' };
    articles.push({
      slug,
      fm: { title, series: 'ページ', number: `P-${pageNo}` },
      raw, status: meta.status, note: meta.note, hero: null, media: inlineMediaMap(raw), pubUrl: (title.match(/（(\/[^・）]+)/) ? 'https://darari-nu.com' + title.match(/（(\/[^・）]+)/)[1] : null),
    });
  }
}

const STATUS = {
  ok: { label: '✅ 検品ずみ', cls: 'st-ok' },
  fix: { label: '🔄 指示を反映（再検品おねがいします）', cls: 'st-fix' },
  new: { label: '🆕 検品まち', cls: 'st-new' },
};
// 2館に振り分け: 数値番号<=32とSubstack(S-)は第1館、33以降とページ(P-)は第2館
const inVol = (a) => {
  const s = String(a.fm.number);
  if (/^\d+$/.test(s)) return parseInt(s, 10) <= 32 ? 1 : 2;
  return s.startsWith('P-') ? 2 : 1;
};
articles = articles.filter((a) => inVol(a) === VOL);

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
    ${a.pubUrl ? `<p class="puburl">公開先: <a href="${a.pubUrl}" target="_blank" rel="noopener">${a.pubUrl.replace('https://', '')}</a></p>` : ''}
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
<title>AIカイゼン 検品室${VOL === 2 ? ' 第2館' : ''}</title>
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
.puburl{font-size:.72rem;color:var(--nezu);margin:0 0 .5rem;}
.puburl a{color:var(--nezu);text-underline-offset:3px;}
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
  <h1>AIカイゼン <span>検品室</span>${VOL === 2 ? ' 第2館' : ' 第1館'}</h1>
  <p class="lead">${VOL === 2 ? '記事033〜＋新設ページはこの館' : '記事001〜032＋Substack原稿はこの館'}${VOL === 2 ? (VOL1_URL ? `｜<a href="${VOL1_URL}">第1館（001〜032）はこちら</a>` : '') : (VOL2_URL ? `｜<a href="${VOL2_URL}">第2館（033〜）はこちら</a>` : '｜第2館は準備中')}</p>
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
      else if(m&&m.tooBig) html+='<p class="imgnote">🎬 動画（'+m.kb+'KB）はページを軽くするため埋め込んでいません → <a href="https://darari-nu.com'+eschtml(vid[1])+'" target="_blank" rel="noopener">サイトで再生する</a></p>';
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
