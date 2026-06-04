import { ImageResponse } from 'next/og'
export const runtime = 'edge'
export const contentType = 'image/png'
export const size = {
  width: 180,
  height: 180,
}

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)',
          color: 'white',
          borderRadius: 40,
          fontFamily: 'sans-serif',
          fontSize: 96,
          fontWeight: 700,
        }}
      >
        B
      </div>
    ),
    size,
  )
}
