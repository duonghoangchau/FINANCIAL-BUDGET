import { ImageResponse } from 'next/og'
export const runtime = 'edge'
export const contentType = 'image/png'
export const size = {
  width: 512,
  height: 512,
}

export default function Icon() {
  return new ImageResponse(
    (
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
            inset: 36,
            borderRadius: 120,
            border: '10px solid rgba(255,255,255,0.16)',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 280,
            height: 280,
            borderRadius: 88,
            background: 'rgba(255,255,255,0.08)',
            boxShadow: '0 18px 60px rgba(0, 0, 0, 0.25)',
          }}
        >
          <div
            style={{
              fontSize: 136,
              lineHeight: 1,
            }}
          >
            B
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 46,
              fontWeight: 700,
              letterSpacing: '-0.04em',
            }}
          >
            BudgetFlow
          </div>
        </div>
      </div>
    ),
    size,
  )
}
