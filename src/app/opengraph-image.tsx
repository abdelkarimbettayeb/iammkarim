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
          justifyContent: 'center',
          padding: 80,
          background: '#0B0F19',
          color: 'white',
        }}
      >
        <div style={{ fontSize: 28, color: '#fbbf24', letterSpacing: 4, textTransform: 'uppercase' }}>
          Interactive 3D Portfolio
        </div>
        <div style={{ fontSize: 84, fontWeight: 700, marginTop: 24 }}>{personalInfo.name}</div>
        <div style={{ fontSize: 40, color: '#cbd5e1', marginTop: 16 }}>{personalInfo.role}</div>
      </div>
    ),
    size
  );
}
