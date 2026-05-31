// src/app/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Encyclo — Azərbaycanın Biznes Ensiklopediyası'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0F172A',
          color: 'white',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, fontStyle: 'italic', marginBottom: 20 }}>
          Encyclo
        </div>
        <div style={{ fontSize: 28, opacity: 0.8, textAlign: 'center', maxWidth: 600 }}>
          Azərbaycanın Biznes Ensiklopediyası
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 18,
            opacity: 0.6,
          }}
        >
          Şirkətlər • Məhsullar • Xidmətlər
        </div>
      </div>
    ),
    { ...size }
  )
}
