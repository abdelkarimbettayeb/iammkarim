import { ImageResponse } from 'next/og';
import { personalInfo } from '@/data/resumeData';

export const alt = `${personalInfo.name} - ${personalInfo.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          padding: 40,
          background: '#18181C',
          color: '#EDEDF0',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 56,
            background: '#202026',
            borderRadius: 24,
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderTop: '4px solid #FF572E',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <svg width="62" height="62" viewBox="10 10 44 44" fill="none">
                <path d="M11 52L27.5 11H36.5L21 52H11Z" fill="#EDEDF0" />
                <path d="M27.5 11H36.5L53 52H43L27.5 11Z" fill="#EDEDF0" fillOpacity="0.72" />
                <path d="M32 27.5L39.56 47.5H24.44L32 27.5Z" fill="#FF572E" />
              </svg>
              <div style={{ fontSize: 20, color: '#FF572E', letterSpacing: 3.5, textTransform: 'uppercase' }}>
                Swiss-Industrial Atelier · 3D Portfolio
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 18px',
                borderRadius: 9999,
                background: '#26262D',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                fontSize: 18,
                color: '#A4A4B0',
              }}
            >
              <span>iamkarim.vercel.app</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 74, fontWeight: 700, letterSpacing: -2, lineHeight: 1.04, color: '#EDEDF0' }}>
              {personalInfo.name}
            </div>
            <div style={{ display: 'flex', fontSize: 34, color: '#A4A4B0', marginTop: 18 }}>
              {`${personalInfo.role} · TypeScript · React · Node.js · C++`}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 24,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: 22,
              color: '#92929F',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              <span>9+ Years Experience</span>
              <span>/</span>
              <span>32+ Commercial Platforms</span>
              <span>/</span>
              <span style={{ color: '#FF572E' }}>5.0 / 5.0 Client Rating</span>
            </div>
            <span style={{ color: '#10B981', fontSize: 20 }}>Open to Remote & Relocation</span>
          </div>
        </div>
      </div>
    ),
    size
  );
}
