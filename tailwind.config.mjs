/** @type {import('tailwindcss').Config} */
// トークンは要件定義v1「白ベース・エディトリアル」準拠。
// AI Reg Atlasの金・音楽レーン(night/snow/rust/ice)とはブランド分離。
export default {
  content: ['./src/**/*.{astro,html,js,ts,md,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FBFAF7', // コピー用紙の白
        ink: '#1C1B18',   // 墨
        nezu: '#6E6A61',  // 鼠（二次テキスト）
        rule: '#E3E0D8',  // 罫線
        shu: '#C73E2E',   // 朱肉（承認印・CTAのみ）
        'shu-pale': '#F7E8E4',
        dusk: '#141821',  // ダーク没入ヒーローの地色（イラストの青灰夜に合わせる）
        kinari: '#F4F0E7', // セクション背景の生成り（リズムづけ用）
      },
      fontFamily: {
        display: ['"Shippori Mincho B1"', '"Zen Old Mincho"', 'serif'],
        body: ['"BIZ UDPMincho"', '"Zen Old Mincho"', 'serif'],
      },
      maxWidth: {
        prose: '42rem',
        site: '60rem',
      },
    },
  },
  plugins: [],
};
