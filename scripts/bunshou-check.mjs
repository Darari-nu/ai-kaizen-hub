#!/usr/bin/env node
// 文章の機械検査（Hooks用）
// - ルール台帳: drafts/添削の学び/ng-rules.json（正規表現＋グッドパターン）
// - 文書集計検査: 同じ文末（ます。です。等）が3文以上連続したら警告
// 使い方:
//   node scripts/bunshou-check.mjs <file.md>...   手動検査（scope外のファイルも強制検査）
//   node scripts/bunshou-check.mjs --hook         PostToolUseフックから（stdinにJSON）
//   node scripts/bunshou-check.mjs --stop         Stopフックから（このセッションで書いた対象ファイルを再検査）

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RULES_PATH = path.join(REPO, 'drafts', '添削の学び', 'ng-rules.json');
const ENDING_RUN_LIMIT = 4; // 同一文末がこの数以上連続でwarn（検品済み記事に3連続は普通にあるため）

function loadRules() {
  return JSON.parse(fs.readFileSync(RULES_PATH, 'utf8')).rules.filter(r => r.enabled !== false);
}

// 検査対象のスコープ判定。対象外は null
function scopeOf(file) {
  const rel = path.relative(REPO, path.resolve(file)).split(path.sep).join('/');
  if (rel.startsWith('..') || !rel.endsWith('.md')) return null;
  if (rel.startsWith('src/content/articles/') && path.basename(rel) !== '_template.md') return 'articles';
  if (rel.startsWith('drafts/substack/')) return 'substack';
  return null;
}

// frontmatter・コードフェンス・HTMLコメントの行をマスクした行配列を返す（行番号は保つ）
function maskedLines(content) {
  const lines = content.split('\n');
  const out = [];
  let inFence = false;
  let inComment = false;
  let inFM = false;
  lines.forEach((line, i) => {
    let masked = false;
    if (i === 0 && line.trim() === '---') { inFM = true; masked = true; }
    else if (inFM) { masked = true; if (line.trim() === '---') inFM = false; }
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; masked = true; }
    else if (inFence) masked = true;
    if (!masked) {
      if (inComment) { masked = true; if (line.includes('-->')) inComment = false; }
      else if (line.includes('<!--')) { masked = true; if (!line.includes('-->')) inComment = true; }
    }
    out.push(masked ? '' : line);
  });
  return out;
}

// マッチ位置を含む文を切り出す
function sentenceAt(line, index, length) {
  const terms = /[。！？!?]/g;
  let start = 0;
  let m;
  while ((m = terms.exec(line)) !== null) {
    if (m.index < index) start = m.index + 1;
    else break;
  }
  terms.lastIndex = index + length;
  const end = (m = terms.exec(line)) !== null ? m.index + 1 : line.length;
  return line.slice(start, end).trim();
}

function endingCategory(sentence) {
  const s = sentence.replace(/[」』）)"']*[。！？!?]$/, '');
  for (const e of ['ました', 'でした', 'ません', 'ます', 'です']) {
    if (s.endsWith(e)) return e;
  }
  return null;
}

function checkFile(file, scope) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = maskedLines(content);
  const rules = loadRules().filter(r => r.scope === 'all' || r.scope === scope || scope === 'force');
  const findings = [];

  for (const rule of rules) {
    const re = new RegExp(rule.pattern, 'g');
    lines.forEach((line, i) => {
      let m;
      re.lastIndex = 0;
      while ((m = re.exec(line)) !== null) {
        findings.push({
          id: rule.id, label: rule.label, severity: rule.severity,
          line: i + 1, matched: m[0],
          sentence: sentenceAt(line, m.index, m[0].length),
          good: rule.good,
        });
        if (m.index === re.lastIndex) re.lastIndex++;
      }
    });
  }

  // 文末単調（同じ文末が連続）: 見出しでリセット、リスト・引用・表の行は数えない
  let run = { cat: null, count: 0, line: 0, sample: '' };
  const flushRun = () => {
    if (run.cat && run.count >= ENDING_RUN_LIMIT) {
      findings.push({
        id: 'DOC-001', label: `文末単調（「${run.cat}。」が${run.count}文連続）`, severity: 'error',
        line: run.line, matched: `${run.cat}。×${run.count}`, sentence: run.sample,
        good: ['連続のどれか1文の文末を変える。体言止め・短文・「〜ですよね？」の問いかけ・独り言（F参照）。darari裁定「4連発は普通に直したい」（8/15）'],
      });
    }
    run = { cat: null, count: 0, line: 0, sample: '' };
  };
  lines.forEach((line, i) => {
    const t = line.trim();
    if (t.startsWith('#')) { flushRun(); return; }
    if (t === '' || /^([-*>|]|\d+\.)/.test(t)) return;
    for (const part of t.split(/(?<=[。！？!?])/)) {
      const s = part.trim();
      if (!/[。！？!?]$/.test(s)) continue;
      const cat = endingCategory(s);
      if (cat && cat === run.cat) { run.count++; }
      else { flushRun(); if (cat) run = { cat, count: 1, line: i + 1, sample: s }; }
    }
  });
  flushRun();

  findings.sort((a, b) => a.line - b.line);
  return findings;
}

function report(file, findings) {
  const rel = path.relative(REPO, file);
  const errors = findings.filter(f => f.severity === 'error');
  const warns = findings.filter(f => f.severity === 'warn');
  const out = [];
  out.push(`【文章機械検査】${rel}: NG ${errors.length}件 / 要判断 ${warns.length}件`);
  out.push('NGワードだけの単語差し替えは禁止。検出箇所を含む文を丸ごと書き直すこと。');
  out.push('');
  findings.forEach((f, n) => {
    const tag = f.severity === 'error' ? 'NG' : '要判断';
    out.push(`${n + 1}. [${tag}][${f.id} ${f.label}] L${f.line}: 「${f.matched}」`);
    out.push(`   該当文: ${f.sentence || '(文の切り出しに失敗。該当行を確認)'}`);
    f.good.forEach(g => out.push(`   直し方: ${g}`));
  });
  out.push('');
  out.push('直すのは今回の編集で自分が書いた文だけ。darari検品済みの既存文は直さない（本人の言葉が正）。');
  out.push('書き直したら同じ検査が再度かかる。ルールがおかしい場合は勝手に無効化せず、darariに確認する。');
  return out.join('\n');
}

function stateFile(sessionId) {
  return path.join(os.tmpdir(), `bunshou-check-${sessionId || 'unknown'}.txt`);
}

const mode = process.argv[2];

if (mode === '--hook') {
  const input = JSON.parse(fs.readFileSync(0, 'utf8'));
  const file = input?.tool_input?.file_path;
  if (!file) process.exit(0);
  const scope = scopeOf(file);
  if (!scope || !fs.existsSync(file)) process.exit(0);
  fs.appendFileSync(stateFile(input.session_id), path.resolve(file) + '\n');
  const findings = checkFile(file, scope);
  if (findings.length > 0) {
    console.error(report(file, findings));
    process.exit(2); // stderrがエージェントにフィードバックされる（処理は止めない）
  }
  process.exit(0);
} else if (mode === '--stop') {
  const input = JSON.parse(fs.readFileSync(0, 'utf8'));
  if (input?.stop_hook_active) process.exit(0); // 無限ブロック防止
  const sf = stateFile(input?.session_id);
  if (!fs.existsSync(sf)) process.exit(0);
  const files = [...new Set(fs.readFileSync(sf, 'utf8').split('\n').filter(Boolean))].filter(f => fs.existsSync(f));
  const blocks = [];
  for (const f of files) {
    const scope = scopeOf(f);
    if (!scope) continue;
    const errors = checkFile(f, scope).filter(x => x.severity === 'error');
    if (errors.length) blocks.push(report(f, errors));
  }
  if (blocks.length) {
    console.error('セッション終了前の全体再検査でNGが残っている。書き直すまで完了報告しないこと。\n\n' + blocks.join('\n\n'));
    process.exit(2); // 完了をブロック
  }
  fs.unlinkSync(sf);
  process.exit(0);
} else {
  // 手動検査
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error('使い方: node scripts/bunshou-check.mjs <file.md>... | --hook | --stop');
    process.exit(1);
  }
  let hasError = false;
  for (const f of files) {
    const findings = checkFile(f, scopeOf(f) || 'force');
    if (findings.length === 0) {
      console.log(`【文章機械検査】${path.relative(REPO, f)}: 問題なし`);
    } else {
      console.log(report(f, findings));
      if (findings.some(x => x.severity === 'error')) hasError = true;
    }
  }
  process.exit(hasError ? 1 : 0);
}
