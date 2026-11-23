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
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 76,
          background: '#09090B',
          color: '#F5F5F7',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <svg width="68" height="68" viewBox="10 10 44 44" fill="none">
            <path d="M11 52L27.5 11H36.5L21 52H11Z" fill="#F5F5F7" />
            <path d="M27.5 11H36.5L53 52H43L27.5 11Z" fill="#F5F5F7" fillOpacity="0.72" />
            <path d="M32 27.5L39.56 47.5H24.44L32 27.5Z" fill="#FF572E" />
          </svg>
          <div style={{ fontSize: 22, color: '#FF572E', letterSpacing: 4, textTransform: 'uppercase' }}>
            Swiss-Industrial Atelier - 3D Portfolio
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 78, fontWeight: 700, letterSpacing: -2, lineHeight: 1.04 }}>
            {personalInfo.name}
          </div>
          <div style={{ fontSize: 36, color: '#A4A4AE', marginTop: 18 }}>
            {personalInfo.role}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32, fontSize: 22, color: '#8A8A94' }}>
          <span>9+ Years Experience</span>
          <span>/</span>
          <span>30+ Commercial Systems</span>
          <span>/</span>
          <span style={{ color: '#FF572E' }}>5.0 / 5.0 Rating</span>
        </div>
      </div>
    ),
    size
  );
}
