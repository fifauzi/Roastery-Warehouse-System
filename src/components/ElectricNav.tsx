import React, { useRef, useEffect, useState } from 'react';
import { NavTab } from './Sidebar';

interface ElectricNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingRequestsCount: number;
  lowStockCount: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export const ElectricNav: React.FC<ElectricNavProps> = ({
  activeTab,
  onSelectTab,
  pendingRequestsCount,
  lowStockCount,
}) => {
  const tabs: { id: NavTab; label: string; badge?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'pipeline', label: 'Pipeline', badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined },
    { id: 'green_beans', label: 'Green Beans' },
    { id: 'roasted_beans', label: 'Roasted Batches' },
    { id: 'packaging', label: 'Packaging', badge: lowStockCount > 0 ? lowStockCount : undefined },
    { id: 'surat_jalan', label: 'Surat Jalan' },
    { id: 'executive_admin', label: 'Reports & Admin' },
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const buttonRefs = useRef<Map<NavTab, HTMLButtonElement>>(new Map());

  // Lerp tracking state
  const stateRef = useRef({
    currentX: 0,
    currentWidth: 0,
    targetX: 0,
    targetWidth: 0,
    isInitialized: false,
    particles: [] as Particle[],
  });

  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  // Update target coordinates when activeTab changes or on mount/resize
  useEffect(() => {
    const updateTarget = () => {
      const btn = buttonRefs.current.get(activeTab);
      const container = containerRef.current;
      if (!btn || !container) return;

      const btnRect = btn.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const targetX = btnRect.left - containerRect.left;
      const targetWidth = btnRect.width;

      const state = stateRef.current;
      state.targetX = targetX;
      state.targetWidth = targetWidth;

      if (!state.isInitialized) {
        state.currentX = targetX;
        state.currentWidth = targetWidth;
        state.isInitialized = true;
        setIndicatorStyle({ left: targetX, width: targetWidth, opacity: 1 });
      }
    };

    updateTarget();
    window.addEventListener('resize', updateTarget);
    return () => window.removeEventListener('resize', updateTarget);
  }, [activeTab]);

  // Electric Canvas & Lerp Animation Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const state = stateRef.current;
      const container = containerRef.current;

      if (container) {
        // Sync canvas resolution with container
        if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
          canvas.width = container.clientWidth;
          canvas.height = container.clientHeight;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Lerp interpolation (smoothing factor 0.16)
      const dx = state.targetX - state.currentX;
      const dw = state.targetWidth - state.currentWidth;
      state.currentX += dx * 0.16;
      state.currentWidth += dw * 0.16;

      const isMoving = Math.abs(dx) > 0.8;
      const progress = isMoving ? 1 : 0.4;

      // Spawn electric sparks & comet particles when moving or idle
      if (isMoving && Math.random() < 0.85) {
        const direction = Math.sign(dx);
        const headX = direction > 0 ? state.currentX + state.currentWidth : state.currentX;
        state.particles.push({
          x: headX + (Math.random() - 0.5) * 8,
          y: canvas.height - 4 + (Math.random() - 0.5) * 6,
          vx: -direction * (Math.random() * 2 + 1),
          vy: (Math.random() - 0.5) * 1.5,
          life: 0,
          maxLife: 15 + Math.random() * 10,
          size: Math.random() * 2 + 1,
          color: Math.random() > 0.4 ? '#60a5fa' : '#ffffff',
        });
      } else if (Math.random() < 0.2) {
        // Idle micro-sparks along the electric beam
        state.particles.push({
          x: state.currentX + Math.random() * state.currentWidth,
          y: canvas.height - 3 + (Math.random() - 0.5) * 4,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -Math.random() * 1.2,
          life: 0,
          maxLife: 10 + Math.random() * 8,
          size: Math.random() * 1.5 + 0.8,
          color: Math.random() > 0.5 ? '#93c5fd' : '#ffffff',
        });
      }

      // Draw Electric Arc & Laser Glow Line
      const y = canvas.height - 3.5;
      const xStart = state.currentX + 4;
      const xEnd = state.currentX + state.currentWidth - 4;

      if (xEnd > xStart) {
        // 1. Broad outer ambient blue glow
        ctx.save();
        ctx.shadowColor = '#60a5fa';
        ctx.shadowBlur = 14;
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.45)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(xStart, y);
        ctx.lineTo(xEnd, y);
        ctx.stroke();
        ctx.restore();

        // 2. Focused cyan electric plasma beam
        ctx.save();
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(xStart, y);
        ctx.lineTo(xEnd, y);
        ctx.stroke();
        ctx.restore();

        // 3. Ultra-bright white core filament with lightning jitter
        ctx.save();
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 4;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(xStart, y);

        // Electric micro-noise filament
        const steps = 6;
        const stepWidth = (xEnd - xStart) / steps;
        for (let i = 1; i < steps; i++) {
          const jitterY = isMoving ? (Math.random() - 0.5) * 1.6 : (Math.random() - 0.5) * 0.4;
          ctx.lineTo(xStart + i * stepWidth, y + jitterY);
        }
        ctx.lineTo(xEnd, y);
        ctx.stroke();
        ctx.restore();

        // 4. Comet head spark when in motion
        if (isMoving) {
          const leadX = dx > 0 ? xEnd : xStart;
          ctx.save();
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(leadX, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Update and draw particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const alpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.life >= p.maxLife) {
          state.particles.splice(i, 1);
        }
      }

      // Sync React state for underlying background pill
      setIndicatorStyle({
        left: state.currentX,
        width: state.currentWidth,
        opacity: state.isInitialized ? 1 : 0,
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative hidden xl:flex items-center bg-[#1b1410]/90 border border-[#382b22] rounded-full p-1 shadow-inner overflow-hidden select-none"
    >
      {/* Background Soft Pill Slider (Lerped) */}
      <div
        className="absolute top-1 bottom-1 rounded-full bg-[#362920]/80 transition-all pointer-events-none border border-[#4d3a2e]/60"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
          opacity: indicatorStyle.opacity,
          boxShadow: '0 0 15px rgba(96, 165, 250, 0.15)',
        }}
      />

      {/* Electric Nav Particle & Lightning Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
      />

      {/* Navigation Tab Buttons */}
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) buttonRefs.current.set(tab.id, el);
              else buttonRefs.current.delete(tab.id);
            }}
            onClick={() => onSelectTab(tab.id)}
            className={`relative z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              isActive
                ? 'text-white font-semibold drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                : 'text-[#9c8b7f] hover:text-[#f5ece5]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="w-4 h-4 rounded-full bg-[#e07a48] text-white text-[9px] font-mono font-bold flex items-center justify-center">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
