'use client';

import React, { useState, useMemo } from 'react';
import * as THREE from 'three';
import { useRoomStore } from '@/store/useRoomStore';
import { cartridgeProjects, languages } from '@/data/resumeData';
import { WavingFlag } from '../WavingFlag';
import type { CartridgeProject } from '@/types/room';
import { DeskLamp } from '../DeskLamp';

interface WorkstationDeskProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

/**
 * Creates a canvas texture for the "W / Premium Partner" standing book
 */
function createPartnerSpineTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as any);

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Jet black matte cover
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, 128, 512);

    // Subtle blue accent square at top
    ctx.fillStyle = '#0284C7';
    ctx.fillRect(24, 40, 80, 80);

    // "W" Logo
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 52px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('W', 64, 80);

    // Vertical text "Premium Partner"
    ctx.save();
    ctx.translate(64, 300);
    ctx.rotate(Math.PI / 2);
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('PREMIUM PARTNER', 0, 0);
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates an ultra-sharp, realistic 2048x900 computer screen display
 * rendered directly onto the 3D ultrawide monitor's glass surface.
 */
function createMonitorScreenTexture(
  activeProject: CartridgeProject | null,
  isHovered: boolean
): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as any);

  const W = 2048;
  const H = 900;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Safe, universal rounded rectangle using native standard canvas path
  const fillRoundedRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fillStyle: string
  ) => {
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    const radius = Math.min(r, w / 2, h / 2);
    if (radius > 0) {
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
    } else {
      ctx.rect(x, y, w, h);
    }
    ctx.closePath();
    ctx.fill();
  };

  const strokeRoundedRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    strokeStyle: string,
    lineWidth: number = 1
  ) => {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    const radius = Math.min(r, w / 2, h / 2);
    if (radius > 0) {
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
    } else {
      ctx.rect(x, y, w, h);
    }
    ctx.closePath();
    ctx.stroke();
  };

  try {

  if (!activeProject) {
    // ========================================================
    // 1. DEFAULT BETTAYEB_OS WORKSPACE (VS Code + macOS Menu)
    // ========================================================
    // Deep midnight desktop wallpaper
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#090D16');
    bgGrad.addColorStop(0.5, '#0E1322');
    bgGrad.addColorStop(1, '#070A12');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle background isometric dot grid
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    for (let x = 30; x < W; x += 40) {
      for (let y = 50; y < H; y += 40) {
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Top macOS Menu Bar
    ctx.fillStyle = '#111726';
    ctx.fillRect(0, 0, W, 42);
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 41, W, 1);

    // Menu Bar Left Items
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('  BettayebOS', 20, 21);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '14px system-ui, sans-serif';
    const menuItems = ['File', 'Edit', 'View', 'Run', 'Terminal', 'Window', 'Help'];
    let mx = 170;
    menuItems.forEach((item) => {
      ctx.fillText(item, mx, 21);
      mx += ctx.measureText(item).width + 24;
    });

    // Menu Bar Right Items
    ctx.textAlign = 'right';
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(W - 250, 21, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText('SYSTEM READY', W - 150, 21);
    ctx.fillText('21:00:25  •  100%', W - 30, 21);

    // Main VS Code Editor Window
    const winX = 36;
    const winY = 64;
    const winW = W - 72;
    const winH = H - 100;

    // Window shadow & body
    fillRoundedRect(winX, winY, winW, winH, 12, '#0B0F19');
    strokeRoundedRect(winX, winY, winW, winH, 12, 'rgba(255, 255, 255, 0.12)', 1.5);

    // Window Title Bar
    fillRoundedRect(winX, winY, winW, 46, 12, '#161D2E');
    // Traffic Light Window Controls
    ctx.fillStyle = '#EF4444'; // Red
    ctx.beginPath();
    ctx.arc(winX + 28, winY + 23, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F59E0B'; // Yellow
    ctx.beginPath();
    ctx.arc(winX + 50, winY + 23, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10B981'; // Green
    ctx.beginPath();
    ctx.arc(winX + 72, winY + 23, 7, 0, Math.PI * 2);
    ctx.fill();

    // Editor Tabs
    fillRoundedRect(winX + 110, winY + 8, 220, 38, 6, '#0B0F19');
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(winX + 110, winY + 8, 220, 3); // Active tab indicator line
    ctx.fillStyle = '#F8FAFC';
    ctx.font = '13px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('📄 EngineerProfile.tsx', winX + 130, winY + 28);

    fillRoundedRect(winX + 338, winY + 8, 160, 38, 6, '#131929');
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('⚡ projects.json', winX + 355, winY + 28);

    ctx.fillStyle = '#64748B';
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Abdelkarim Bettayeb — Visual Studio Code', winX + winW / 2, winY + 24);

    // Left Sidebar: File Tree (width 260px)
    const sbW = 260;
    ctx.fillStyle = '#080C14';
    ctx.fillRect(winX, winY + 46, sbW, winH - 82);
    ctx.strokeStyle = '#1E293B';
    ctx.beginPath();
    ctx.moveTo(winX + sbW, winY + 46);
    ctx.lineTo(winX + sbW, winY + winH - 36);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('EXPLORER: PORTFOLIO', winX + 20, winY + 74);

    ctx.font = '13px system-ui, monospace';
    ctx.fillStyle = '#94A3B8';
    const files = [
      '▾ src',
      '    ▾ components',
      '        Room.tsx',
      '        Workstation.tsx',
      '    ▸ data',
      '    📄 EngineerProfile.tsx',
      '    ⚡ projects.json',
      '    📜 Resume.pdf',
    ];
    let fy = winY + 104;
    files.forEach((file) => {
      if (file.includes('EngineerProfile')) {
        fillRoundedRect(winX + 10, fy - 14, sbW - 20, 24, 4, '#1E293B');
        ctx.fillStyle = '#38BDF8';
      } else {
        ctx.fillStyle = '#94A3B8';
      }
      ctx.fillText(file, winX + 24, fy);
      fy += 26;
    });

    // Main Code Editor Area
    const codeX = winX + sbW + 30;
    let cy = winY + 85;
    const lineHeight = 28;

    const codeLines: Array<{ line: number; tokens: Array<[string, string]> }> = [
      {
        line: 1,
        tokens: [
          ['import ', '#C084FC'],
          ['{ ', '#E2E8F0'],
          ['Engineer', '#38BDF8'],
          [', ', '#E2E8F0'],
          ['FullStackExperience', '#38BDF8'],
          [' } ', '#E2E8F0'],
          ['from ', '#C084FC'],
          ["'@bettayeb/engineer';", '#FDE047'],
        ],
      },
      { line: 2, tokens: [] },
      {
        line: 3,
        tokens: [
          ['export const ', '#C084FC'],
          ['leadDeveloper', '#60A5FA'],
          [': ', '#E2E8F0'],
          ['Engineer', '#38BDF8'],
          [' = {', '#E2E8F0'],
        ],
      },
      {
        line: 4,
        tokens: [
          ['  name', '#93C5FD'],
          [': ', '#E2E8F0'],
          ['"Abdelkarim Bettayeb"', '#4ADE80'],
          [',', '#E2E8F0'],
        ],
      },
      {
        line: 5,
        tokens: [
          ['  role', '#93C5FD'],
          [': ', '#E2E8F0'],
          ['"Senior Full-Stack Web Developer & Software Engineer"', '#4ADE80'],
          [',', '#E2E8F0'],
        ],
      },
      {
        line: 6,
        tokens: [
          ['  experience', '#93C5FD'],
          [': ', '#E2E8F0'],
          ['"9+ Years Building Production Systems"', '#4ADE80'],
          [',', '#E2E8F0'],
        ],
      },
      {
        line: 7,
        tokens: [
          ['  coreStack', '#93C5FD'],
          [': [', '#E2E8F0'],
          ['"React"', '#FDE047'],
          [', ', '#E2E8F0'],
          ['"Next.js"', '#FDE047'],
          [', ', '#E2E8F0'],
          ['"TypeScript"', '#FDE047'],
          [', ', '#E2E8F0'],
          ['"Node.js"', '#FDE047'],
          [', ', '#E2E8F0'],
          ['"PostgreSQL"', '#FDE047'],
          [', ', '#E2E8F0'],
          ['"C++"', '#FDE047'],
          ['],', '#E2E8F0'],
        ],
      },
      {
        line: 8,
        tokens: [
          ['  rating', '#93C5FD'],
          [': ', '#E2E8F0'],
          ['"5.0 / 5.0 (30+ Verified Commercial Contracts)"', '#4ADE80'],
          [',', '#E2E8F0'],
        ],
      },
      {
        line: 9,
        tokens: [
          ['  availability', '#93C5FD'],
          [': ', '#E2E8F0'],
          ['"READY FOR NEW CHALLENGES & HIGH-IMPACT ROLES"', '#38BDF8'],
        ],
      },
      {
        line: 10,
        tokens: [['};', '#E2E8F0']],
      },
      { line: 11, tokens: [] },
      {
        line: 12,
        tokens: [
          [
            '// 🎮 HINT: Click or drag any retro game cartridge on the bookshelf to run live project demo',
            '#64748B',
          ],
        ],
      },
      {
        line: 13,
        tokens: [
          [
            '// 🖱️ Click anywhere on this screen to open full resume, experience & case studies',
            '#0284C7',
          ],
        ],
      },
    ];

    ctx.font = '15px monospace';
    codeLines.forEach((row) => {
      // Line number
      ctx.textAlign = 'right';
      ctx.fillStyle = '#475569';
      ctx.fillText(String(row.line), codeX - 24, cy);

      // Code tokens
      ctx.textAlign = 'left';
      let tx = codeX;
      row.tokens.forEach(([text, color]) => {
        ctx.fillStyle = color;
        ctx.fillText(text, tx, cy);
        tx += ctx.measureText(text).width;
      });
      cy += lineHeight;
    });

    // Blinking cursor
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(codeX + 665, winY + 85 + 12 * lineHeight - 14, 9, 18);

    // Call to Action Banner on Screen
    if (isHovered) {
      fillRoundedRect(codeX, H - 145, 620, 36, 8, '#0284C7');
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText('▶ CLICK MONITOR TO OPEN FULL PORTFOLIO CASE STUDY', codeX + 20, H - 123);
    }

    // Bottom Status Bar
    fillRoundedRect(winX, winY + winH - 36, winW, 36, 12, '#0284C7');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillText('⑂ main*   |   ⊗ 0   ⚠ 0   |   UTF-8   |   TypeScript React   |   BettayebOS 9.2', winX + 20, winY + winH - 14);
    ctx.textAlign = 'right';
    ctx.fillText('Click to launch full case studies ▶   ', winX + winW - 20, winY + winH - 14);

  } else {
    // ========================================================
    // 2. ACTIVE CARTRIDGE PROJECT SHOWCASE (Full Browser / App Window)
    // ========================================================
    const projectColor = activeProject.color || '#38BDF8';

    // Desktop background with project accent glow
    ctx.fillStyle = '#090D16';
    ctx.fillRect(0, 0, W, H);

    const grad = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, W / 1.5);
    grad.addColorStop(0, `${projectColor}25`);
    grad.addColorStop(1, '#00000000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Top Menu Bar
    ctx.fillStyle = '#111726';
    ctx.fillRect(0, 0, W, 42);
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 41, W, 1);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('  BettayebOS', 20, 21);

    ctx.fillStyle = projectColor;
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillText(`● CARTRIDGE LOADED: ${activeProject.title.toUpperCase()}`, 170, 21);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText('LIVE PROJECT PREVIEW  •  21:00:25', W - 30, 21);

    // Main Browser Showcase Window
    const winX = 36;
    const winY = 64;
    const winW = W - 72;
    const winH = H - 100;

    fillRoundedRect(winX, winY, winW, winH, 12, '#0B0F19');
    strokeRoundedRect(winX, winY, winW, winH, 12, projectColor, 2);

    // Browser Chrome Header
    fillRoundedRect(winX, winY, winW, 64, 12, '#161D2E');

    // Traffic light buttons
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(winX + 28, winY + 32, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(winX + 50, winY + 32, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(winX + 72, winY + 32, 7, 0, Math.PI * 2);
    ctx.fill();

    // Browser URL Bar
    const urlX = winX + 110;
    const urlW = winW - 240;
    fillRoundedRect(urlX, winY + 14, urlW, 36, 8, '#0B0F19');
    strokeRoundedRect(urlX, winY + 14, urlW, 36, 8, 'rgba(255, 255, 255, 0.1)', 1);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#10B981';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('🔒 https://', urlX + 18, winY + 32);
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 14px system-ui, sans-serif';
    const displayUrl = activeProject.url.replace(/^https?:\/\//, '');
    ctx.fillText(displayUrl, urlX + 90, winY + 32);

    // Window Interior: 2-Column Split
    // Left Column: Project Overview & Specs (55% width)
    const leftW = Math.floor(winW * 0.54);
    const rightW = winW - leftW;
    const contY = winY + 64;
    const contH = winH - 64;

    // Left Panel Details
    const lx = winX + 44;
    let ly = contY + 44;

    // Tag Pill
    fillRoundedRect(lx, ly, 180, 28, 14, `${projectColor}33`);
    strokeRoundedRect(lx, ly, 180, 28, 14, projectColor, 1);
    ctx.fillStyle = projectColor;
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillText('● SYSTEM ACTIVE', lx + 18, ly + 14);

    ly += 54;
    // Main Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 38px system-ui, sans-serif';
    ctx.fillText(activeProject.title, lx, ly);

    ly += 32;
    // Subtitle
    ctx.fillStyle = '#94A3B8';
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText(activeProject.subtitle, lx, ly);

    ly += 36;
    // Key Highlight Banner Box
    fillRoundedRect(lx, ly, leftW - 88, 88, 10, '#131A2B');
    strokeRoundedRect(lx, ly, leftW - 88, 88, 10, `${projectColor}55`, 1.5);

    ctx.fillStyle = projectColor;
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText('★ KEY METRICS & RESULTS:', lx + 20, ly + 28);

    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.fillText(activeProject.metrics, lx + 20, ly + 58);

    ly += 114;
    // Description Paragraphs
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '16px system-ui, sans-serif';
    const desc = activeProject.description[0] || '';
    // Simple wrap
    const words = desc.split(' ');
    let line = '';
    let lineY = ly;
    words.forEach((word: string) => {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > leftW - 90) {
        ctx.fillText(line, lx, lineY);
        line = word + ' ';
        lineY += 26;
      } else {
        line = test;
      }
    });
    ctx.fillText(line, lx, lineY);

    // Tech Stack Badges
    const stackY = contY + contH - 120;
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillText('TECH ARCHITECTURE:', lx, stackY - 14);

    let sx = lx;
    activeProject.stack.forEach((tech: string) => {
      const tagText = tech.toUpperCase();
      const tw = ctx.measureText(tagText).width + 24;
      fillRoundedRect(sx, stackY, tw, 28, 6, '#1E293B');
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(tagText, sx + 12, stackY + 14);
      sx += tw + 10;
    });

    // Big Action Button drawn directly on screen
    const btnY = contY + contH - 64;
    const btnW = leftW - 88;
    fillRoundedRect(lx, btnY, btnW, 44, 8, isHovered ? projectColor : '#1E293B');
    strokeRoundedRect(lx, btnY, btnW, 44, 8, projectColor, 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = isHovered ? '#0F172A' : '#FFFFFF';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText('👉 CLICK MONITOR TO OPEN FULL CASE STUDY & LIVE DEMO ◀', lx + btnW / 2, btnY + 22);

    // Right Column: Interactive UI Wireframe / Visual Preview
    const rx = winX + leftW + 20;
    const rw = rightW - 40;
    const ry = contY + 36;
    const rh = contH - 60;

    // Mockup card background
    fillRoundedRect(rx, ry, rw, rh, 10, '#101626');
    strokeRoundedRect(rx, ry, rw, rh, 10, 'rgba(255, 255, 255, 0.08)', 1);

    // Mockup Nav Header
    fillRoundedRect(rx, ry, rw, 38, 10, '#182035');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText(`⚡ ${activeProject.title}`, rx + 18, ry + 19);

    // Mockup Hero Section
    fillRoundedRect(rx + 20, ry + 56, rw - 40, 140, 8, `${projectColor}18`);
    strokeRoundedRect(rx + 20, ry + 56, rw - 40, 140, 8, `${projectColor}44`, 1);
    ctx.fillStyle = projectColor;
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('PRODUCTION PREVIEW', rx + 40, ry + 110);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('High performance architecture with verified test suite', rx + 40, ry + 140);

    // Mockup Data Cards (3 grid cards)
    const cardY = ry + 215;
    const cardW = (rw - 60) / 3;
    const stats = [
      { label: 'Latency', val: '< 12ms' },
      { label: 'Uptime', val: '99.98%' },
      { label: 'Satisfaction', val: '100%' },
    ];
    stats.forEach((st, i) => {
      const cx = rx + 20 + i * (cardW + 10);
      fillRoundedRect(cx, cardY, cardW, 80, 8, '#161D30');
      strokeRoundedRect(cx, cardY, cardW, 80, 8, 'rgba(255, 255, 255, 0.06)', 1);
      ctx.fillStyle = '#64748B';
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillText(st.label.toUpperCase(), cx + 14, cardY + 28);
      ctx.fillStyle = projectColor;
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.fillText(st.val, cx + 14, cardY + 56);
    });

    // Mockup Live Code Snippet Box
    const codeSnippetY = cardY + 98;
    const codeSnippetH = rh - (codeSnippetY - ry) - 20;
    fillRoundedRect(rx + 20, codeSnippetY, rw - 40, codeSnippetH, 8, '#080C14');
    strokeRoundedRect(rx + 20, codeSnippetY, rw - 40, codeSnippetH, 8, 'rgba(255, 255, 255, 0.06)', 1);

    ctx.fillStyle = '#38BDF8';
    ctx.font = '12px monospace';
    ctx.fillText('// Verified Deployment Artifact', rx + 36, codeSnippetY + 24);
    ctx.fillStyle = '#4ADE80';
    ctx.fillText('const deploy = await cluster.verifyAndShip({', rx + 36, codeSnippetY + 46);
    ctx.fillStyle = '#FDE047';
    ctx.fillText('  ssl: true, redundancy: "multi-region", testCoverage: "94%"', rx + 36, codeSnippetY + 68);
    ctx.fillStyle = '#4ADE80';
    ctx.fillText('});', rx + 36, codeSnippetY + 90);
    }
  } catch (err) {
    console.error('Failed to draw monitor screen texture:', err);
  }

  // Generate Three.js CanvasTexture
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

export function WorkstationDesk({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: WorkstationDeskProps) {
  const [screenHovered, setScreenHovered] = useState(false);
  const activeCartridge = useRoomStore((state) => state.activeCartridge);
  const setActiveZone = useRoomStore((state) => state.setActiveZone);
  const setActiveStation = useRoomStore((state) => state.setActiveStation);

  const activeProject = activeCartridge ? cartridgeProjects[activeCartridge] : null;

  const partnerSpineTexture = useMemo(() => createPartnerSpineTexture(), []);

  // Generate monitor screen texture directly onto texture map
  const screenTexture = useMemo(
    () => createMonitorScreenTexture(activeProject, screenHovered),
    [activeProject, screenHovered]
  );

  const handleMonitorClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setActiveZone('workstation');
  };

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* =========================================
          1. Mid-Century Modern Teak Desk
         ========================================= */}
      <group position={[0, 1.4, 0]}>
        {/* Warm Teak Tabletop (Smooth Chamfered Finish) */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.35, 0.07, 1.25]} />
          <meshStandardMaterial color="#CF6B2C" roughness={0.45} />
        </mesh>
        {/* Tabletop Apron / Under-frame */}
        <mesh position={[0, -0.05, 0]} castShadow>
          <boxGeometry args={[3.15, 0.04, 1.08]} />
          <meshStandardMaterial color="#B45309" roughness={0.5} />
        </mesh>

        {/* 4 Mid-Century Tapered Round Wooden Legs with Brass Ferrules */}
        {[
          [-1.42, -0.68, -0.48, 0.12, -0.12],
          [1.42, -0.68, -0.48, 0.12, 0.12],
          [-1.42, -0.68, 0.48, -0.12, -0.12],
          [1.42, -0.68, 0.48, -0.12, 0.12],
        ].map(([lx, ly, lz, rx, rz], i) => (
          <group key={i} position={[lx, ly, lz]} rotation={[rx, 0, rz]}>
            {/* Tapered Wood Leg */}
            <mesh castShadow>
              <cylinderGeometry args={[0.026, 0.016, 1.34, 16]} />
              <meshStandardMaterial color="#B45309" roughness={0.5} />
            </mesh>
            {/* Brass Cap / Ferrule at foot */}
            <mesh position={[0, -0.62, 0]} castShadow>
              <cylinderGeometry args={[0.017, 0.015, 0.08, 16]} />
              <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.9} />
            </mesh>
          </group>
        ))}

        {/* Vertical Black Spine Book / Partner Showcase on Right Side */}
        
        {/* Country Language Flags on Widened Desktop */}
        <group
          position={[1.15, 0.04, -0.1]}
          onClick={(e) => {
            e.stopPropagation();
            setActiveStation('flags');
          }}
        >
          {languages.map((flag, idx) => (
            <WavingFlag
              key={flag.name}
              flag={flag}
              position={[idx * 0.24 - 0.24, 0, 0]}
            />
          ))}
        </group>

        <group position={[1.42, 0.3, 0.15]} rotation={[0, 0.25, 0]} castShadow>
          <mesh castShadow>
            <boxGeometry args={[0.07, 0.54, 0.34]} />
            <meshStandardMaterial color="#0F172A" roughness={0.35} />
          </mesh>
          {/* Spine Face with W / Premium Partner texture */}
          <mesh position={[-0.036, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[0.34, 0.54]} />
            <meshBasicMaterial map={partnerSpineTexture} />
          </mesh>
        </group>
      </group>

      {/* =========================================
          2. Under-Desk Gaming Console (White PS5 Vertical)
         ========================================= */}
      <group position={[-0.72, 0.38, 0.15]} rotation={[0, -0.08, 0]}>
        {/* Black Glossy Core Body */}
        <mesh castShadow>
          <boxGeometry args={[0.09, 0.65, 0.34]} />
          <meshStandardMaterial color="#0B0F19" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Left Curved White Wing Faceplate */}
        <mesh position={[-0.055, 0.01, 0]} rotation={[0, 0, -0.04]} castShadow>
          <boxGeometry args={[0.014, 0.69, 0.36]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>
        {/* Right Curved White Wing Faceplate */}
        <mesh position={[0.055, 0.01, 0]} rotation={[0, 0, 0.04]} castShadow>
          <boxGeometry args={[0.014, 0.69, 0.36]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>
        {/* PS5 Blue LED Accent Strip */}
        <mesh position={[0, 0.31, 0.171]}>
          <planeGeometry args={[0.06, 0.01]} />
          <meshBasicMaterial color="#38BDF8" />
        </mesh>
        {/* PS5 Circular Stand Base */}
        <mesh position={[0, -0.34, 0]} receiveShadow>
          <cylinderGeometry args={[0.11, 0.12, 0.02, 20]} />
          <meshStandardMaterial color="#1E293B" roughness={0.5} />
        </mesh>
      </group>

      {/* =========================================
          3. Sleek Ultrawide Display (Silver Stand & Slim Bezel)
         ========================================= */}
      <group
        position={[0, 2.15, -0.18]}
        onClick={handleMonitorClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setScreenHovered(true);
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setScreenHovered(false);
          if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
        }}
      >
        {/* Aluminum Stand Base (Sleek Rectangular) */}
        <mesh position={[0, -0.73, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.34, 0.016, 0.22]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.25} metalness={0.85} />
        </mesh>
        {/* Aluminum Vertical Stem */}
        <mesh position={[0, -0.38, -0.04]} castShadow>
          <boxGeometry args={[0.06, 0.72, 0.03]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.25} metalness={0.85} />
        </mesh>

        {/* Monitor Rear Chassis */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.82, 0.86, 0.04]} />
          <meshStandardMaterial color="#1E2024" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Lower Silver Chin Bar (iMac / Studio Display Aesthetic) */}
        <mesh position={[0, -0.4, 0.022]} castShadow>
          <boxGeometry args={[1.82, 0.06, 0.015]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.25} metalness={0.85} />
        </mesh>

        {/* Realistic High-Res Screen Display Surface */}
        <mesh position={[0, 0.03, 0.022]}>
          <planeGeometry args={[1.78, 0.78]} />
          <meshStandardMaterial
            map={screenTexture}
            emissiveMap={screenTexture}
            emissive={new THREE.Color('#FFFFFF')}
            emissiveIntensity={screenHovered ? 0.95 : 0.75}
            roughness={0.15}
            metalness={0.05}
          />
        </mesh>

        {/* Protective Anti-Glare Front Glass Pane */}
        <mesh position={[0, 0.03, 0.024]}>
          <planeGeometry args={[1.78, 0.78]} />
          <meshStandardMaterial
            color="#FFFFFF"
            transparent
            opacity={0.06}
            roughness={0.08}
            metalness={0.9}
          />
        </mesh>
      </group>

      {/* =========================================
          4. Slim Keyboard & Apple-Style White Mouse
         ========================================= */}
      {/* Keyboard Base */}
      <group position={[0, 1.45, 0.14]}>
        <mesh castShadow>
          <boxGeometry args={[0.66, 0.016, 0.2]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Keyboard Keycap Surface */}
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[0.63, 0.008, 0.17]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
        </mesh>
      </group>

      {/* Minimalist White Wireless Mouse (Directly on Desk, No Bulky Pad) */}
      <group position={[0.48, 1.455, 0.14]}>
        <mesh castShadow>
          <boxGeometry args={[0.075, 0.022, 0.13]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.1} />
        </mesh>
      </group>

      {/* =========================================
          5. Forest Green Water Flask
         ========================================= */}
      <group position={[-0.52, 1.57, 0.14]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.048, 0.048, 0.26, 20]} />
          <meshStandardMaterial color="#166534" roughness={0.35} />
        </mesh>
        {/* Silver Neck & Cap */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.032, 0.036, 0.04, 16]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Cap Loop */}
        <mesh position={[0, 0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.018, 0.005, 8, 16]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* =========================================
          6. Interactive Desk Lamp
         ========================================= */}
      <DeskLamp position={[-0.86, 1.44, 0.08]} rotation={[0, 0.3, 0]} />
    </group>
  );
}
