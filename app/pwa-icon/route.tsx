import { ImageResponse } from 'next/og'
export const runtime = 'edge'

function getIconMarkup(size: number) {
  const corner = Math.round(size * 0.24)
  const inner = Math.round(size * 0.55)

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 45%, #065f46 100%)',
        color: 'white',
        position: 'relative',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: Math.round(size * 0.07),
          borderRadius: corner,
          border: `${Math.max(6, Math.round(size * 0.02))}px solid rgba(255,255,255,0.16)`,
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: inner,
          height: inner,
          borderRadius: Math.round(size * 0.17),
          background: 'rgba(255,255,255,0.08)',
          boxShadow: '0 18px 60px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div
          style={{
            fontSize: Math.round(size * 0.27),
            lineHeight: 1,
            fontWeight: 800,
          }}
        >
          B
        </div>
        {size >= 256 && (
          <div
            style={{
              marginTop: Math.round(size * 0.03),
              fontSize: Math.round(size * 0.09),
              fontWeight: 700,
              letterSpacing: '-0.04em',
            }}
          >
            BudgetFlow
          </div>
        )}
      </div>
    </div>
  )
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const requestedSize = Number(searchParams.get('size'))
  const size = requestedSize === 192 ? 192 : 512

  return new ImageResponse(getIconMarkup(size), {
    width: size,
    height: size,
  })
}
