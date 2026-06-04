'use client';

import { useEffect, useRef, useState } from 'react';
import { getDailyStudyData, formatDuration } from '@/lib/study-storage';
import { useTranslation } from '@/hooks/useTranslation';

interface StudyChartProps {
  days?: number;
}

export function StudyChart({ days = 7 }: StudyChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<{ date: string; duration: number }[]>([]);
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
    setData(getDailyStudyData(days));
  }, [days]);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear
    ctx.clearRect(0, 0, width, height);

    const maxDuration = Math.max(...data.map(d => d.duration), 1);

    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Draw bars
    const barWidth = Math.min(chartWidth / data.length * 0.6, 40);
    const barGap = chartWidth / data.length;

    data.forEach((item, i) => {
      const x = padding.left + barGap * i + (barGap - barWidth) / 2;
      const barHeight = (item.duration / maxDuration) * chartHeight;
      const y = padding.top + chartHeight - barHeight;

      // Gradient
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, '#4CAF50');
      gradient.addColorStop(1, '#8BC34A');
      ctx.fillStyle = gradient;

      // Draw bar with rounded top
      const radius = Math.min(barWidth / 2, 4);
      ctx.beginPath();
      ctx.moveTo(x, y + barHeight);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, y + barHeight);
      ctx.closePath();
      ctx.fill();

      // Label (date)
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px var(--font-pixel), monospace';
      ctx.textAlign = 'center';
      const dateLabel = item.date.slice(5); // MM-DD
      ctx.fillText(dateLabel, x + barWidth / 2, height - padding.bottom + 15);

      // Value on top of bar
      if (item.duration > 0) {
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 10px var(--font-pixel), monospace';
        ctx.fillText(`${item.duration}min`, x + barWidth / 2, y - 5);
      }
    });

    // Y-axis labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px var(--font-pixel), monospace';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const value = Math.round((maxDuration / 4) * (4 - i));
      const y = padding.top + (chartHeight / 4) * i;
      ctx.fillText(`${value}m`, padding.left - 8, y + 4);
    }
  }, [data]);

  if (!mounted) {
    return <div className="mc-card bg-white p-4 h-64 animate-pulse" />;
  }

  return (
    <div className="mc-card bg-white p-4 sm:p-6">
      <h3 className="text-lg font-bold text-[#333] mb-4">?? {t('History.statsTitle')} - {days} ???</h3>
      <div className="w-full h-64">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block' }}
        />
      </div>
      <div className="mt-4 text-center text-sm text-gray-500">
        {t('StudyStats.totalDuration')}: {formatDuration(data.reduce((sum, d) => sum + d.duration, 0))}
      </div>
    </div>
  );
}
