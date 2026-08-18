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
  '008-shanai-system': { status: 'fix', note: '⚙️8/18検品反映・サブエージェントが構成から書き直し: ①長さを約6割に圧縮(開発日程システム113ページ・ツェッテルカステン比喩・「後ろのアプリだけスクショ」技・022への脇道を削除) ②見出しを細分化し改行多め・段落1〜3文に ③タイトル「社内システムで迷ったら、ブラウザのAIボタンに聞く」(——なし) ④「基本は拡張機能、だめならスクショ」の主従を明示。分類1実例・87ページマニュアル・Anthropicエビデンス(49%減)・レベル規程は維持。確認1点: ブラウザ右側AI画面の実スクショは、EdgeをこのMacに入れてよければCopilot実物を撮って差し込みます(無料・公式配布)。OKなら「Edge入れてOK」と一言ください。＋8/18夜: AI臭除去パス(もとやま6分類のだらリーヌ版)とCodexセカンドオピニオン検品を通しました。' },
  '011-dare-ga-itta': { status: 'ok', note: '✅8/13検品OK「修正なし」(図解3枚込み)。ありがとうございます！' },
  '012-kuni-mo-yare': { status: 'fix', note: '⚙️8/18検品反映: ①タイトル「DXの次はAX？会社に降りてくる「人工知能基本計画」を現場語訳します」(AX入り・——なし) ②結論ファースト: 「補助金・支援策・業界ガイドラインの形で会社に降りてきますよ」を冒頭5段落目に昇格 ③AI臭のメタ前置き(「効くところだけ置いていきます」「事実だけ並べます」「言ってます。それも〜」等)を全て削除 ④図解コメント3箇所(降りてくる流れ図/年表/4方針の田の字)を設置——文章OK後に生成します。事実・日付・出典は8/17版のまま。確認1点: 8/21(金)公開予定はこのまま維持でよいですか。＋8/18夜: AI臭除去パス(もとやま6分類のだらリーヌ版)とCodexセカンドオピニオン検品を通しました。' },

  // --- 8/8 新規5本（Fableサブエージェントが1本ずつ執筆） ---
  '014-nyuuryoku-handan': { status: 'ok', note: '✅8/13検品OK「いいかな！」。ありがとうございます！' },
  '015-joushisu-shitsumon': { status: 'fix', note: '⚙️8/18検品反映: ①「7名分申請して、通しました」→「7名分申請しました」(descriptionの「通した当事者」も「申請した当事者」に) ②タイトルの——を「。」に ③段落分割を5箇所追加して改行多め ④図解を2箇所追加——「情シスが守りたい3つ」の図(そもそも節)と「3ステップ全体の流れ図」(やってみた節直下)。発注コメントを設置済みで、文章OK後に生成します ⑤特典プロンプトに「# 役割」見出しを追加し構造化。🎁特典プロンプトの中身確認は引き続きお待ちしています。＋8/18夜: AI臭除去パス(もとやま6分類のだらリーヌ版)とCodexセカンドオピニオン検品を通しました。' },
  '016-excel-shukei': { status: 'fix', note: '⚙️8/18ご指定のストーリーで全面書き直し: ビフォー=ひとり1台1Excel→数式入りまとめExcel→月次PPT手転記(転記が面倒/稼働率悪い時の各装置Excel行脚が面倒)→アフター=アプリ化・報告書ボタンでPPT・人はコメントだけ。タイトル「まとめExcelからPPTへ、毎月転記してません？その報告書、ボタンひとつになります」。ポータルにビフォー実物を新設: 様式S-3 設備稼働月報まとめExcel(装置別3シート+実数式のまとめシート・印鑑欄・「PPTへ転記すること」の赤字注記つき。集計値はイントラ7月度確定値と一致)。イントラ通達にも「様式S-3提出廃止(アプリ移行)」を追加。確認2点: ①失敗談は旧記事の「検算せずに出しかけた」を流用しました。実話として合っていますか ②アプリの作り方は書いていません(指定ストーリーに無いため)。実話で書ける材料があれば教えてください。＋8/18夜: AI臭除去パス(もとやま6分類のだらリーヌ版)とCodexセカンドオピニオン検品を通しました。' },
  '017-gijiroku': { status: 'fix', note: '⚙️8/18検品反映: ①「内職をするな」失敗談を今度こそ丸ごと削除しました(前回は圧縮存置のご相談にしていました。すみません。復活禁止でルール登録済み) ②紙メモ前提の記述を全部PCメモに修正(「ぼくはPCでメモを取ります」) ③Q2に「ZoomやTeamsなら標準の録音機能。オンライン会議ならボタンひとつ」を追記 ④タイトルの——を「。」に ⑤図解2箇所追加(役割分担図/PCメモ×AI議事録の照合フロー)——コメント設置済み、文章OK後に生成。＋8/18夜: AI臭除去パス(もとやま6分類のだらリーヌ版)とCodexセカンドオピニオン検品を通しました。' },
  '020-hp-seisaku': { status: 'fix', note: '⚙️8/18ご指摘の修正1点: 「GitHubが公開までやってくれる」→「コード置き場はGitHub、公開はCloudflare」に訂正しました(darari-nu.comの配信がCloudflareなのを確認済み)。あわせてタイトルの——を「。」に。それ以外は8/13検品OK版のままです。公開前に訂正箇所だけ目視ください。＋8/18夜: AI臭除去パス(もとやま6分類のだらリーヌ版)とCodexセカンドオピニオン検品を通しました。' },
  '021-level-kitei': { status: 'fix', note: '⚙️8/13検品反映(D6): 「入れていい」の一般論言い切りを6箇所直し、すべて「ダラリ重工業では、この条件なら入れてよいと判断しました」の自社判断表現に統一。「あなたの会社が同じ結論になるとは限らない。持ち帰るのはレベル分け×AI区分の考え方、線は自社で引き直して」の注意も新設しました。判断表・実話は不変。確認1点: Q1「(レベル分けを社内で)決めていいんです」は可否ではなく制度の説明なので言い切りのまま残しています。＋8/18夜: 文体パス(語尾2連続まで・AI臭除去・読みやすさ規則)とCodex検品を実施。Codexが「表と本文のズレ」を発見→本文側を表に合わせて修正(不可の行数の言い方・セルの言葉は可/不可の2つ)。' },
  '022-ai-browser': { status: 'fix', note: '⚙️8/13検品反映: 管理画面はログイン必須でこちらから実物スクショが撮れない(偽造は禁止)ため、🎁特典として「設定画面を一緒にスクショしていく案内プロンプト」を記事末尾に新設+冒頭で予告しました。darariがデスクトップアプリに貼ると、AIが1枚ずつ「どの画面を・どの状態で・どこを撮るか」を案内し、毎回キー写り込みチェックの声かけをする設計(撮るのは5枚: LINE×2/Google Cloud×2/APIキー×1)。撮れたスクショが揃ったら本文に差し込みます。確認1点: 5枚のリストでカバー範囲は足りますか？＋8/18夜: 文体パスとCodex検品を実施。「正直に言うと、万能ではないです」→「AIも画面を誤読します」等。' },

  // --- 8/10 ガバナンス連載3本（聞き取り第1弾の一次体験入り。両部長答申=10_drafts/答申_ガバナンス連載と教材_20260810.md） ---
  '023-governance-cycle': { status: 'fix', note: '⚙️8/13検品反映: ①カレンダーを記事末尾の「おまけ」から中盤へ移動し、見出しを「これが全体像です: 1年に割り付けた実物カレンダー」に格上げ(「工程を掘り下げる前に、先に実物を見てください」の導入) ②図解2枚を追加——9工程を5種類に束ねた円環サイクル図(1周=1年×数年くり返す)と、たらいまわし実話の構造図(押し付け合い→着地→「誰がやるかを先に決める」)。カレンダー本体もv2(マイルストーン分解版)です。確認継続1点: カレンダーの月割り(教育10月・調査1月・点検2月・改定3月)は仮置きです。実際の時期に寄せるなら教えてください。＋8/18夜: 文体パスとCodex検品を実施。Codexが「ポータル更新が9工程の一覧に無い」宙吊りを発見→「9工程とは別枠の手段」と明記。まとめの3連発も1文に圧縮。' },
  '024-houkisei-chousa': { status: 'fix', note: '⚙️8/13検品反映: ①新節「で、日本はいまどうなの？」を追加——AI推進法(2025年9月全面施行・罰則で縛らない推進アプローチ)+AI事業者ガイドライン(ソフトロー・第1.2版2026年3月)をEU対比で短く。名称・日付は公式資料で裏取り済み ②AI Reg Atlasの比較表ページ(13カ国×7軸ヒートマップ /matrix/)へ直リンクし、「詳しい比較は表へ、記事からは絞り方だけ持ち帰る」構成に。確認1点: 日本の説明はこの2点に絞りました。実務者向けに足すべきもの(個情法との関係等)があれば一言ください。(CRA解説・RoHS前例の追記は8/12反映済み)＋8/18夜: 文体パスとCodex検品を実施。「EUだけは例外(発売してなくても速報は拾う)」を冒頭に明記して後半との矛盾を解消。「自動的にクリア」の言い過ぎも修正。' },
  '025-tsukuru-tsukau': { status: 'fix', note: '🎨8/13検品反映: 図解2枚を挿入しました——①作る側(発売国・用途・技術)と使う側(用途・サービス・機密レベル)の左右対比が最後に共通チェック3点(倫理・セキュリティ・法務)へ合流する見取り図 ②「AIを使いたい」の申請1枚が審議側から見ると3つの確認に分解される流れ図(「先に3つ書いて出せば話が早い」で締めに直結)。本文は前回反映版のまま不変。この検品室で見られます。＋8/18夜: 文体パスとCodex検品を実施。リスト内に残っていた——6個を除去、「基本は2方向」に補正。' },

  // --- 8/10 ガバナンス連載・第2陣6本（聞き取り第2弾ベース。残るは基準改定編のみ=具体例聞き取り待ち） ---
  '026-doukou-watch': { status: 'fix', note: '⚙️8/12夜「薄っぺらい」→厚みを足しました: ①ウォッチの型を具体化(4レーン=法規制/大手の導入事例/ツール新機能/事故事例×周期の濃淡×国の定点=総務省・経産省AI事業者ガイドライン、IPAのAISI。すべて「見るならここ」の提案として) ②「拾いっぱなしにしない出口」3つ(ポータル1行更新/教育資料の差し替え/稟議の世間動向欄)を新設。⚙️8/12深夜・実話いただき追記: 新節「アンテナは、人からも生えます」——DeepSeekの存在を最初に教えてくれたのは海外の事業部の人だった(毎日ウォッチしていたのに)。「なんか見かけたら教えて」と言って回るのも立派なウォッチ網、の学びで031へ接続。確認1点: 「海外の事業部の人」の粒度で会社特定は大丈夫か目視ください(031と同じぼかし水準です)。' },
  '027-kyouiku': { status: 'fix', note: '⚙️8/12夜の検品反映: ①冒頭に「先に言っておきます。今回は、愚痴回です」を宣言 ②想定問答を削除(愚痴回は型を崩す。まとめで「いつもなら想定問答ですが、愚痴回なのでなしです！」と明示) ③締めは「形式にツッコむだけの人のことは、気にしなくていい。突き進みましょう！」→「……変な話で失礼しました」で軽く抜ける形に。確認1点: 「アホなやつ」はこの表現まで丸めました。もっと強くてよければ戻します。' },
  '028-katsuyou-chousa': { status: 'fix', note: '⚙️8/12夜の方向転換を反映: 核を「職場に台帳を管理してもらう」方式に書き換えました——①各職場でAIサービス利用台帳を管理 ②年1回見直してもらう ③報告をもらうだけ。「ひとりで全社を調べ続けると、AIを管理する人が潰れます」を言い切りに。アンケートは「年1回・台帳の外側(シャドーAI)を拾う道具・マネジメントサイクルに組み込む」に位置づけ直し。誤ログイン自己申告の実話は温存。' },
  '029-unyou-check': { status: 'fix', note: '⚙️8/12夜の検品反映: ①質問と規程の紐づけを明示——質問1=AI利用規程第13条(教育)、質問2=AIサービス利用基準4(台帳)、点検の根拠=第16条。「聞きたい質問が規程になければ、先に規程を改定して根拠を作る。質問と規程はセット」の1段落も追加(規程側の第16条にも管理者変更の反映・周知を追記済み) ②質問を4問化: 教育受けた？/台帳ある？/管理者変更あれば台帳更新した？/(規程を作ったばかりなら)規程があること知ってる？' },
  '030-shingi': { status: 'fix', note: '⚙️8/12夜の検品反映: ①コツ追記「担当者の名前をちゃんと呼ぶ。法務の〇〇さん、どうですか？——名前で呼ばれた瞬間に自分ごとになる」 ②聞かれがち2問を追加——「結局、全部自分がやるのでは？」→「そうなんです！なのでわが社には自作チャットボットがいます。この話はまた後日」/「どうしてもうまくいかないときは？」→「上司を使いましょう。そのために高い給料をもらっているのですから」。確認1点: チャットボットの言及はこの1文の深さで止めています(詳細は後日記事)。OKですか。' },
  '031-ai-consul': { status: 'fix', note: '⚙️8/12夜「解像度が低い→Webで網羅的に調べて」→調べて書き直しました。「AIコンサルは何をしてくれるのか」を公開情報ベースの7分類(診断/規程・体制構築/リスクアセスメント/法規制レポート/教育研修/個別助言/ISO 42001認証・PoC伴走)+相場感に拡充し、「メニューは立派。でも最後の一歩=社内語への翻訳はどのメニューにも入っていない」の構図に接続。DeepSeek実話・守秘義務の線は変えていません。確認1点: 相場(スポット数十万〜プロジェクト数百万円)は公開ガイドの一般情報です。載せてよいですか(実契約額とは無関係)。' },
  '032-kijun-kaitei': { status: 'new', note: '【新規・ガバナンス連載・これで10/10完走】基準改定編。「改定の大半は書き回し修正。だから軽く頻繁に回す」の正直路線。確認3点: ①失敗談が「構えていたら拍子抜けだった」だけで薄いです。「小さすぎて出すのを迷った修正」「改定タイミングを逃した話」等があれば足します ②「改定は結構あった」の頻度、年に何回くらいか目安ありますか(A2でずらして書きます) ③「手続きを重さで二段階に分ける」型は一般論として書きました。前職で実際にやっていたなら実話に昇格させます。' },

  // --- Substack配信下書き（10_drafts/10_substack/。HP記事ではなくニュースレターの原稿） ---
  'substack-tsuutatsu-1': { status: 'new', note: '【Substack創刊号・これが出ると創刊です】ダラリ重工業の社内通達という体で届く自己紹介+AI利用規程の案内。🔎8/14創刊前の最終点検済み: 本文の記載事実(全17条・第1/9/10/17条の内容・「法務部の直しが7回」・クレカ四半期はイントラの決裁権限表に実物あり・002のタイトル・リンクURL)がすべて現在のサイト実体と一致していることを再確認しました。機械検査0件。確認3点: ①「あなたの会社の闇が、ダラリ重工業の公式文書になります」の締めはこの強さでOKですか ②編集後記のクレカ四半期ネタ(004/005と同じずらし済み数字)でOKですか ③配信は第1号→第2号の順でいいですか(第2号側は入れ替え可の設計)。※創刊はHP第1弾4本(001/002/004/005)の公開が先です。4本は検品済みなので「第1弾GO」の一言でぼくが公開作業までやります。' },
  'substack-tsuutatsu-2': { status: 'new', note: '【Substack第2号】記事001の配信版。「個人なら翌日、会社だと半年後」の現状報告体。🔎8/14点検済み: 001と数字・固有名詞(Copilot Chat/DeepL/四半期/半年)の整合、リンクURL・記事タイトルの一致を再確認。機械検査0件。確認2点: ①返信を促す問いかけ「おたくの会社では、AIはどこまで使えますか？」でいきますか ②編集後記の「時差なら、縮められる」の捉え直し、実感と合っていますか' },

  // --- 8/15 資料庫まとめ書き5本（検証済み一次だけを弾に、Fable並列執筆。図解・OGP画像は検品後にimage-gen-midoriで発注） ---
  '033-hojokin-kaimei': { status: 'new', note: '【新規・資料庫5本の1】IT導入補助金→「デジタル化・AI導入補助金」改称の稟議直し。機械検査0件。5本共通: 失敗談は「ぼくがAIに調べさせたら○○だった」の実記録のみ(本人の手作業体験ではない)——この枠でOKかが最初の確認です。個別確認3点: ①4次締切8/25前に出すか(締切後なら文面差し替え) ②「大企業の自社利用には使えません」の言い切り(対象記載の裏返しで、明文条項は未確認) ③調査AIの実名+料金を書くか(現状は「AI」総称)' },
  '034-ai-kinshi-ritsu': { status: 'new', note: '【新規・資料庫5本の2】「AI禁止の会社は0.4%」統計もの。TDBは数値引用+リンクのみ(転載禁止対応)。確認3点: ①「250社に1社」「3割近くが方針未定」は収録値からの計算値です。残すか ②失敗談(禁止率の定義がバラバラで比較しかけて止まった)の体感が合っているか ③Q4の確認手順(規程集→上司→情シス)は一般的助言で裏付けなし。この粒度でよいか' },
  '035-muryou-ai-chizu': { status: 'new', note: '【新規・資料庫5本の3】83か所調査の記事版(常設ページP-2とセット)。確認3点: ①各サービスへの直リンクを張るか(現状なし。URLは資料庫に全件記録済み) ②実名の罠指摘のバランス(AI For Everyone・松尾研は実名/JDLAリンク集の陳腐化は伏せた) ③「最短ルート3点」の順位付けはぼくの判断です。よいか' },
  '036-shikaku-muryou': { status: 'new', note: '【新規・資料庫5本の4】無料だけで完結するAI資格は2つ(ITパスポート/AI実装検定B級)の損得計算。確認3点: ①ITパスポートの受験料額が資料になく「受験そのものは有料」とだけ書いた。金額を入れるか(要公式確認) ②想定問答の回答(評価・奨励金)は一般的助言。この粒度でよいか ③特典プロンプトの案内は「Web検索ができるAI」とだけ。実名+料金にするか' },
  '037-ringi-zero-kouza': { status: 'new', note: '【新規・資料庫5本の5・立ち位置宣言】国の785講座に「稟議」0件→だからぼくが書く、の記録回。想定問答は省略しました(宣言回のため)。確認3点: ①タイトルの反転構造でよいか(「0件でした」を出す直球案も作れます) ②失敗談のサイト名(動画200本→掲載71本)を伏せた判断でよいか ③「空いている席」の言い回しがトーンに合うか' },

  // --- 8/16 資料庫まとめ書き第2陣6本（フレームは第1陣と同じ「ぼくがAIに調べさせた実況」） ---
  '038-tasha-jirei': { status: 'new', note: '【新規・第2陣】「他社はどうしてるの？」に一次発表だけで答える実名事例集(パナ・三井化学・島津・村田ほか)。使用禁止数値(日立70%等)は失敗談の素材側に回しました。確認3点: ①冒頭「ぼくも止まりました」は実体験と合うか(無ければ削る) ②一次リンク11本の外部リンク多め構成でよいか ③ブリヂストン(2016年・非生成AI)を断りつきで足すか' },
  '039-magobiki-kenshou': { status: 'new', note: '【新規・第2陣】ネットの「97%削減」を一次まで遡る検証3ステップの実演。まとめ記事は批判せず「伝言ゲームで意味が削れる」トーン。確認3点: ①タイトルに97%の実数を出してよいか(ぼかす代案あり) ②日立システムズの顧客企業の実名記載可否(公式公開の事例ページ由来) ③失敗談「あやうく使うところでした」の強さ' },
  '040-kitei-link-shu': { status: 'new', note: '【新規・第2陣】公開されている生成AI規程のリンク集(11者17本)。雛形OK(出典表示)とリンクまでの二次利用区分をタグで明記。確認3点: ①東京都・IPA・大学勢を外した線引きでよいか ②Q1「1本だけ読むなら神戸市」の言い切りに同意か ③PDF直リンク(版固定・切れに弱い)か一覧ページ併記か' },
  '041-ecrs-jidouka': { status: 'new', note: '【新規・第2陣】自動化の前に「やめられないか」——ECRS(JIS Z 8141)×農水省の「Sだけやるな」をAI導入に写像。確認3点: ①失敗談の枠付け「この記事のために調べさせたら」→実際は用語辞書整備中の事故。弱めるか ②ECRS(イクルス)を現場で実際に聞くか(一次体験1行が欲しい) ③特典プロンプトは「勝手にやめさせない」安全側。この方針でよいか' },
  '042-kyt-ai-risk': { status: 'new', note: '【新規・第2陣】AIのリスク評価は毎朝のKYT4ラウンドで。執筆AIが厚労省ページを実取得照合し、ページに無いラウンド名は使っていません。確認3点: ①4R原文「私達はこうする」を一人称検査対応で言い換えた。図解では原文に戻すか ②「使い方が変わる節目で評価し直す」の実運用描写は合っているか ③冒頭の上司とのやりとりは「あるある」場面。実体験に差し替えるか' },
  '043-kojinjouhou-kaisei': { status: 'new', note: '【新規・第2陣・鮮度もの】令和8年7月17日公布の改正個情法の現場語訳(統計作成等=AI開発含む同意不要/課徴金新設/施行2年以内)。免責と「法務への質問文3本」特典つき。確認3点: ①失敗談(404・版ズレ)の帰属「ぼくがAIに調べさせて」でOKか ②内部リンク先014・021がまだdraft→公開順の判断 ③課徴金の詳細は踏み込んでいない。深掘りするか' },

  // --- 8/16 第3陣5本(Obsidian台帳+採用ログの★素材。数字は実測値のまま) ---
  '044-sashimodoshi-ppt': { status: 'new', note: '【新規・第3陣】確認だけで2週間のパワポ実録(台帳2025-11-14の生メモ引用+無限ループ)。確認する側を守る視点(D2)入り。確認3点: ①当時のメモの生の言い回しをそのまま載せてよいか ②工夫3つ(論点先集め・版1本・終点を先に聞く)は実際の心がけと合うか ③パワポの中身のぼかし粒度' },
  '045-ai-shain-ikusei': { status: 'new', note: '【新規・第3陣】AI社員を育てる記録——失敗のたびAI自身にルールを書かせる仕組み(self-corrections第1号・安全装置自体のバグ・通知3重障害)。確認3点: ①「たま」の名前を記事で初公開してよいか ②029(未公開)への内部リンクの扱い ③オチ「前途多難。」の温度感' },
  '046-api-key-jiko': { status: 'new', note: '【新規・第3陣】APIキー直書き+約10時間公開リポの2連事故と「鍵の3か条」。⚙️たま判断で「歌の字幕ツール」→「趣味の動画に字幕を付けるツール」に一般化済み(レーン分離)。確認3点: ①事故後に鍵の作り直しを実施したか(記事は実施前提) ②「気づいてすぐ戻した」の流れは事実か ③一般化の扱い(戻すことも可)' },
  '047-ponkotsu-pc': { status: 'new', note: '【新規・第3陣】Celeron/4GB/HDDで動かず→GitHub Actions無料枠(月2,000分中約1,200分)へ逃した実録+cronずれ7時間停止。SUNO・音楽の固有名詞ゼロに抽象化済み。確認3点: ①「コードはAIに書かせた」の言い切り可否 ②抽象化の扱い ③タイトル' },
  '048-dummy-data': { status: 'new', note: '【新規・第3陣】ダミーデータで練習する文化(darari採用2回の案)。ダラリ重工業の架空不良報告書サンプルを実物として掲載+様式名を入れるだけの特典プロンプト。確認3点: ①失敗談が014の再掲。使い回しでよいか ②「偏りを仕込んで答え合わせ」は実感と合うか ③**架空報告書の様式が実在帳票に寄りすぎていないか(A4の最終判断)**' },

  '049-tanoshisa-iriguchi': { status: 'new', note: '【新規・darari原文の記事化】「便利さより楽しさが効く」——本人がObsidian/チャットに投げた原文をだらリーヌ文体・8ブロックに整えたもの(原文正本=10_drafts/素材_darari原文_楽しさが入口_20260816.md。エピソード・数字は原文のまま)。変更点: 一人称補い/言い切り化(「〜かもしれません」→「4ヶ月の結論です」)/E8補足(Team月$20+無料版でも近いことは可)/想定問答4問新設。確認3点: ①失敗談の再構成「前半4ヶ月は便利です一本槍で空振り」は実態と合うか ②「社長キャラでも回答の中身はいつも通り」と書いてよいか ③スクショは自分のClaude画面で撮る認識でよいか' },

  '050-reishou-shinai': { status: 'new', note: '【新規・darari原文の記事化】「AIを使う人を馬鹿にしない」——前職ガバナンス時代の一次体験(原文正本=10_drafts/素材_darari原文_冷笑しない_20260816.md)。原文の流れ・エピソードはそのまま。変更点: ⚠️会議の引用「4ヶ月に一回」→「数ヶ月に一度」にぼかし済み(Q6掲載NG対応。戻すかは検品判断)/「シャドーAI」の説明1文追加/自省を「その場で止めきれていません」に一歩具体化/想定問答3問+つかみ新設。確認3点: ①「止めきれていません」の踏み込みは事実と合うか ②申請周期のぼかしのまま行くか ③「シャドーAI」のカタカナ語でよいか(「隠れて使うAI」に差し替え可)' },

  '051-ryousan-checklist': { status: 'new', note: '【新規・連載「ISO 9001×AIカイゼン」パイロット】量産開始前チェック12項目×AI(原文正本=10_drafts/素材_darari原文_ISO9001と量産移行_20260816.md)。12項目の中身・順番は原文のまま、言い回しだけ一般化(A4対応)。AI活用は全て「ぼくならこう使う」宣言フレーム(B2)・判断はAIに任せない縛り(C1)を一貫。失敗談は創作せず読者あるあるに圧縮(E9前例・要判断)。確認3点: ①経歴を「量産に送り出す現場を長く見てきた」とぼかした。「10年」「海外OEM」まで書くか ②12項目の並びが実在の社内様式に寄りすぎていないか(A4の本丸) ③「ISO審査でAI使用は問題？」に正直着地(まだ確かめていない・一緒に考える)でよいか' },

  '052-jouhou-jidou': { status: 'new', note: '【新規・darari投げ込み5連発の1本目】欲しい情報は自動で取れ——自作の情報収集サイト・通知の実録(AI Reg Atlas=024既出/3時間ごと自動集計=047既出/自動通知=台帳2026-03-30)。失敗談は詰まり2連(プロキシ遮断→中継→403→User-Agentで解決)の実測のみ。確認3点: ①AI Reg Atlasの比較表は「13カ国×7つの観点」で合っているか(実物未照合) ②通知の実例を「支払いメールの確認」まで書いてよいか(現状は「予定など」にぼかし) ③会社相手の自動収集への注意はC3の書き方で足りるか' },

  // --- 8/17 第4陣4本(資料庫の大物統計・事例の深掘り。事前添削は執筆時に鉄則注入済み) ---
  '053-mawari-tsukatteru': { status: 'new', note: '【新規・第4陣】利用率9.1%→52.2%(2年で約5.7倍)の統計もの。経験/業務利用/会社導入の3設問を混ぜない設計・年代別つき。確認3点: ①「約5.7倍」等は公表値からのぼく側計算(原典に印字なし)。残すか ②失敗談(3つの利用率を1本のグラフにまとめかけた)の体感 ③公開順=034が先(Q3で034へリンク)' },
  '054-dena-workflow': { status: 'new', note: '【新規・第4陣】DeNAの時系列3段(2020 Slack bot 5時間→58分・AIなし→リマインダーで20時間短縮・AIなし→法務確認LLMで91%減)。「AIは最後」の順番論。確認3点: ①**kintone・Slackの実名掲載の可否**(SaaS社名を出さない旧裁定との整合。他社の公開事例の事実記述という文脈) ②タイトルの「91%減らした会社」を「法務確認の待ち時間を〜」に伸ばすか ③038・044へのリンク=公開順の前提' },
  '055-shimadzu-3nen': { status: 'new', note: '【新規・第4陣】島津製作所が2年かけてAI判定の人チェックを一部やめた段階論。「最初から外すな、外す条件を先に決めろ」。確認3点: ①タイトルは「2年」にした(2023秋→2025秋。slugは3nenのまま) ②「なぜ外せたか」の2つの読み解きは「ぼくの解釈です」と宣言して書いた。よいか ③失敗談(二次の「3,000人超」→一次は「約3,000人」)の一人称化' },
  '056-kouka-jitan': { status: 'new', note: '【新規・第4陣】効果は効率化91.6% vs 売上向上3.9%→最初の稟議は時短で書け(005接続)。確認3点: ①失敗談(総務省86.4%の母集団限定を見落としかけた)を本人体験として出してよいか ②「複数回答なので合計100%超」は算術推定(原本の文言未確認) ③タイトル後半「時短に偏っていました」の言い切り(数字上の語は「効率化」)' },

  // --- 8/15 新設ページ2つ(未公開・push前。詳細は各紹介文) ---
  'page-llm-cost': { status: 'new', note: '【新設ページ①・未公開】darari承認済みの「トークン数→月額」計算機の実装報告。動作検証済み。確認3点: ①入力の既定値の肌感 ②為替150円仮置き表記 ③SaaS公開価格帯(月0〜12万円)への言及の書き方' },
  'page-muryou-ai': { status: 'new', note: '【新設ページ②・未公開】83か所の常設一覧。イケハヤ・西野両部長の合同答申を反映(「地図」の語を排除/独断宣言/再検証予約のSubstack導線/ダラリ重工業は出さない)。確認3点: ①ページ名 ②スタンス宣言の文言 ③実名の罠注記をこのまま出すか' },
};
// Brain教材の検品はこのページではやらない（2026-08-17 darari指示で専用の検品室に分離。build-kenpin-brain.mjs 参照）

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
