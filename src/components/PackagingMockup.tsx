import type { ProductId } from '../types'

interface PackagingMockupProps {
  productId: ProductId
  variantLabel?: string
  sizeLabel: string
}

interface Palette {
  body: string
  bodyDark: string
  band: string
  window: string
  windowDetail: string
}

const PALETTES: Record<ProductId, Palette> = {
  crayfish: {
    body: '#23272E',
    bodyDark: '#16191D',
    band: '#E8590C',
    window: '#F4C9A8',
    windowDetail: '#C9470A',
  },
  dryfish: {
    body: '#E8590C',
    bodyDark: '#A3380C',
    band: '#16191D',
    window: '#D9B48A',
    windowDetail: '#6A2911',
  },
  palmoil: {
    body: '#B3260E',
    bodyDark: '#7A1A0A',
    band: '#16191D',
    window: '#E8590C',
    windowDetail: '#FAF9F6',
  },
}

const PRODUCT_LABEL: Record<ProductId, string> = {
  crayfish: 'CRAYFISH',
  dryfish: 'DRY FISH',
  palmoil: 'PALM OIL',
}

/** Branded packaging illustration: stand-up pouch or bottle. */
export function PackagingMockup({ productId, variantLabel, sizeLabel }: PackagingMockupProps) {
  const p = PALETTES[productId]
  const gradId = `grad-${productId}`
  const shineId = `shine-${productId}`

  if (productId === 'palmoil') {
    return (
      <svg viewBox="0 0 200 240" className="h-full w-full" role="img" aria-label={`INIDA ${PRODUCT_LABEL[productId]} ${sizeLabel}`}>
        <defs>
          <linearGradient id={gradId} x1="0" x2="1">
            <stop offset="0%" stopColor={p.bodyDark} />
            <stop offset="45%" stopColor={p.body} />
            <stop offset="100%" stopColor={p.bodyDark} />
          </linearGradient>
          <linearGradient id={shineId} x1="0" x2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <ellipse cx="100" cy="228" rx="52" ry="7" fill="#16191D" opacity="0.12" />
        {/* cap */}
        <rect x="84" y="14" width="32" height="22" rx="4" fill="#16191D" />
        <rect x="84" y="30" width="32" height="4" fill="#E8590C" />
        {/* neck */}
        <path d="M88 36 h24 v14 c0 8 28 14 28 34 v-0 H60 v0 c0-20 28-26 28-34z" fill={`url(#${gradId})`} />
        {/* body */}
        <rect x="56" y="80" width="88" height="146" rx="16" fill={`url(#${gradId})`} />
        <rect x="70" y="84" width="10" height="136" rx="5" fill={`url(#${shineId})`} />
        {/* label */}
        <rect x="56" y="112" width="88" height="82" fill="#FAF9F6" />
        <rect x="56" y="112" width="88" height="6" fill="#E8590C" />
        <text x="100" y="140" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontWeight="700" fontSize="20" fill="#16191D" letterSpacing="2">INIDA</text>
        <text x="100" y="157" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="8.5" fill="#E8590C" letterSpacing="2">RED PALM OIL</text>
        <line x1="76" y1="166" x2="124" y2="166" stroke="#CDD1D7" strokeWidth="1" />
        <text x="100" y="182" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="500" fontSize="8" fill="#5B6472">{sizeLabel}</text>
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 200 240" className="h-full w-full" role="img" aria-label={`INIDA ${PRODUCT_LABEL[productId]} ${variantLabel ?? ''} ${sizeLabel}`}>
      <defs>
        <linearGradient id={gradId} x1="0" x2="1">
          <stop offset="0%" stopColor={p.bodyDark} />
          <stop offset="40%" stopColor={p.body} />
          <stop offset="100%" stopColor={p.bodyDark} />
        </linearGradient>
        <linearGradient id={shineId} x1="0" x2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="228" rx="64" ry="7" fill="#16191D" opacity="0.12" />
      {/* pouch body with gusset bottom */}
      <path d="M44 22 h112 l6 186 c0 10 -8 16 -18 16 H56 c-10 0 -18 -6 -18 -16z" fill={`url(#${gradId})`} />
      {/* seal strip + tear notch */}
      <rect x="44" y="22" width="112" height="14" fill={p.bodyDark} />
      <rect x="44" y="40" width="112" height="2" fill="#000" opacity="0.15" />
      <circle cx="100" cy="29" r="3.5" fill="#FAF9F6" opacity="0.9" />
      <path d="M58 46 q4 90 -2 166" stroke={`url(#${shineId})`} strokeWidth="10" fill="none" />
      {/* brand band */}
      <rect x="40" y="58" width="120" height="30" fill={p.band} />
      <text x="100" y="80" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontWeight="700" fontSize="20" fill="#FAF9F6" letterSpacing="3">INIDA</text>
      {/* product window */}
      <rect x="66" y="100" width="68" height="56" rx="28" fill={p.window} />
      <g fill={p.windowDetail} opacity="0.75">
        <circle cx="84" cy="120" r="4" />
        <circle cx="98" cy="134" r="5" />
        <circle cx="114" cy="118" r="3.5" />
        <circle cx="118" cy="138" r="4" />
        <circle cx="90" cy="142" r="3" />
        <circle cx="104" cy="114" r="2.5" />
      </g>
      <text x="100" y="176" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="11" fill="#FAF9F6" letterSpacing="2.5">{PRODUCT_LABEL[productId]}</text>
      {variantLabel && (
        <text x="100" y="191" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="500" fontSize="7.5" fill="#FAF9F6" opacity="0.8" letterSpacing="1">{variantLabel.toUpperCase()}</text>
      )}
      <text x="100" y="208" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="500" fontSize="7.5" fill="#FAF9F6" opacity="0.7">{sizeLabel}</text>
    </svg>
  )
}
