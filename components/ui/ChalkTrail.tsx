import { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  life: number;
}

export const ChalkTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (reducedMotion || !finePointer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const points: Point[] = [];
    let rafId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      points.push({ x: e.clientX, y: e.clientY, life: 1 });
      if (points.length > 60) points.shift();
    };
    window.addEventListener('mousemove', onMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        const prev = points[i - 1];

        const jx = (Math.random() - 0.5) * 1.5;
        const jy = (Math.random() - 0.5) * 1.5;

        ctx.beginPath();
        ctx.moveTo(prev.x + jx, prev.y + jy);
        ctx.lineTo(point.x, point.y);
        ctx.strokeStyle = `rgba(242, 239, 230, ${0.28 * point.life})`;
        ctx.lineWidth = 2.2 * point.life;
        ctx.stroke();
      }

      for (let i = points.length - 1; i >= 0; i--) {
        points[i].life -= 0.022;
        if (points[i].life <= 0) points.splice(i, 1);
      }

      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 99999,
      }}
    />
  );
};
