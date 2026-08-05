// サイト全体の設定。サイト名はまだ迷い中なので、ここ1箇所を変えれば全ページに反映される。
export const SITE = {
  name: 'AIカイゼン',
  tagline: '会社にAIを、正規ルートで。',
  description:
    '製造業の中の人・だらリーヌが、会社にAIを正規に申請→導入→使い倒すまでを実況する無料学習サイト。',
  url: 'https://darari-nu.com',
  author: 'だらリーヌ',
  substackUrl: 'https://dararinu.substack.com',
  substackEmbedUrl: 'https://dararinu.substack.com/embed',
  // フッターのおまけカード（音楽・スタンプは専用ページを作らない。2026-08-05裁定）
  extras: [
    {
      title: 'ダラリ重工業株式会社',
      desc: '記事の舞台になる架空のJTC。社長挨拶が味わい深い',
      href: '/company/',
    },
    {
      title: 'Dara',
      desc: 'AI音楽ユニット。Sunoで公開中',
      href: 'https://suno.com/@darari_nu',
    },
    {
      title: 'coban',
      desc: 'AI音楽。繊細な女性ボーカル',
      href: 'https://suno.com/@coban3137',
    },
    {
      title: 'LINEスタンプ',
      desc: 'ただいま制作中',
      href: null,
    },
  ],
} as const;
