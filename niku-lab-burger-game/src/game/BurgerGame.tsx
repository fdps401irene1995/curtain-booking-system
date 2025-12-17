import React, { useEffect, useMemo, useRef, useState } from 'react';
import { discountFromLayers } from './discount';

type GamePhase = 'idle' | 'running' | 'ended';

type Vec2 = { x: number; y: number };

type Patty = {
  pos: Vec2;
  vel: Vec2;
  r: number;
  thrown: boolean;
  settled: boolean;
  missed: boolean;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatTime(sec: number) {
  const s = Math.max(0, sec);
  return `${s.toFixed(1)}s`;
}

function drawPill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const r = Math.min(h / 2, w / 2);
  // `roundRect` exists on modern browsers, but keep a safe fallback.
  // Avoid TS narrowing the fallback branch to `never`.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyCtx = ctx as any;
  if (typeof anyCtx.roundRect === 'function') {
    anyCtx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export default function BurgerGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<GamePhase>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [layers, setLayers] = useState<number>(0);
  const [throws, setThrows] = useState<number>(0);
  const [misses, setMisses] = useState<number>(0);

  const phaseRef = useRef<GamePhase>('idle');
  const timeLeftRef = useRef<number>(15);
  const shownTimeRef = useRef<number>(15);
  const layersRef = useRef<number>(0);

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<Vec2 | null>(null);
  const dragNowRef = useRef<Vec2 | null>(null);

  const pattyRef = useRef<Patty | null>(null);
  const stackXRef = useRef<number>(0);

  const discount = useMemo(() => discountFromLayers(layers), [layers]);

  const reset = () => {
    phaseRef.current = 'idle';
    timeLeftRef.current = 15;
    shownTimeRef.current = 15;
    layersRef.current = 0;
    setPhase('idle');
    setTimeLeft(15);
    setLayers(0);
    setThrows(0);
    setMisses(0);
    isDraggingRef.current = false;
    dragStartRef.current = null;
    dragNowRef.current = null;
    pattyRef.current = null;
    stackXRef.current = 0;
  };

  const start = () => {
    reset();
    phaseRef.current = 'running';
    setPhase('running');
  };

  const getCanvasSize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return { w: 800, h: 520, dpr: 1 };
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const w = Math.max(320, Math.floor(rect.width));
    const h = Math.max(420, Math.floor(rect.height));
    return { w, h, dpr };
  };

  const spawnPatty = (w: number, h: number) => {
    const r = Math.max(16, Math.min(22, Math.floor(w * 0.03)));
    const x = stackXRef.current || w * 0.5;
    const y = h * 0.22;
    if (!stackXRef.current) stackXRef.current = x;

    pattyRef.current = {
      pos: { x, y },
      vel: { x: 0, y: 0 },
      r,
      thrown: false,
      settled: false,
      missed: false,
    };
  };

  const isPattyFullyInside = (patty: Patty, xMin: number, xMax: number) => {
    return patty.pos.x - patty.r >= xMin && patty.pos.x + patty.r <= xMax;
  };

  const throwPatty = () => {
    const p = pattyRef.current;
    if (!p || p.thrown || p.settled || phaseRef.current !== 'running') return;

    const startPt = dragStartRef.current;
    const nowPt = dragNowRef.current;

    // Default: gentle upward toss if user taps the button / short drag.
    const dx = startPt && nowPt ? (startPt.x - nowPt.x) : 0;
    const dy = startPt && nowPt ? (startPt.y - nowPt.y) : 0;

    // Convert drag into velocity. Clamp so it stays playable on mobile.
    const vx = clamp(dx * 0.020, -7.5, 7.5);
    const vy = clamp(dy * 0.028, -12.5, -3.5);

    p.vel.x = vx;
    p.vel.y = vy;
    p.thrown = true;

    setThrows((t) => t + 1);

    // Clear drag visuals
    isDraggingRef.current = false;
    dragStartRef.current = null;
    dragNowRef.current = null;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let last = performance.now();

    const tick = (now: number) => {
      const { w, h, dpr } = getCanvasSize();
      const desiredW = Math.floor(w * dpr);
      const desiredH = Math.floor(h * dpr);
      if (canvas.width !== desiredW || canvas.height !== desiredH) {
        canvas.width = desiredW;
        canvas.height = desiredH;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      // Scene metrics
      const bunW = Math.min(300, Math.max(220, w * 0.42));
      const bunH = 28;
      const bunCenterX = w * 0.5;
      const bottomBunTopY = h * 0.84;
      const stackMargin = 14;
      const stackXMin = bunCenterX - bunW / 2 + stackMargin;
      const stackXMax = bunCenterX + bunW / 2 - stackMargin;
      const pattyThickness = 18;
      const stackSurfaceY = bottomBunTopY - layersRef.current * pattyThickness;

      // Ensure patty exists while running
      if (phaseRef.current === 'running' && !pattyRef.current) spawnPatty(w, h);

      // Update timer (in refs; update state at 0.1s granularity)
      if (phaseRef.current === 'running') {
        timeLeftRef.current = Math.max(0, timeLeftRef.current - dt);
        const shown = Math.floor(timeLeftRef.current * 10) / 10;
        if (shown !== shownTimeRef.current) {
          shownTimeRef.current = shown;
          setTimeLeft(shown);
        }
        if (timeLeftRef.current <= 0) {
          timeLeftRef.current = 0;
          shownTimeRef.current = 0;
          phaseRef.current = 'ended';
          setTimeLeft(0);
          setPhase('ended');
          isDraggingRef.current = false;
          dragStartRef.current = null;
          dragNowRef.current = null;
        }
      }

      // Physics
      const p = pattyRef.current;
      if (phaseRef.current === 'running' && p) {
        const gravity = 26.0;
        const air = 0.985;

        if (p.thrown && !p.settled) {
          p.vel.y += gravity * dt;
          p.vel.x *= air;
          p.vel.y *= air;

          p.pos.x += p.vel.x * (dt * 60);
          p.pos.y += p.vel.y * (dt * 60);

          // Side walls (soft)
          if (p.pos.x - p.r < 0) {
            p.pos.x = p.r;
            p.vel.x *= -0.55;
          }
          if (p.pos.x + p.r > w) {
            p.pos.x = w - p.r;
            p.vel.x *= -0.55;
          }

          // Stack collision (only counts if fully inside valid range)
          const hitSurface = p.pos.y + p.r >= stackSurfaceY;
          if (hitSurface) {
            const inside = !p.missed && isPattyFullyInside(p, stackXMin, stackXMax);
            if (inside) {
              // Snap & count
              p.pos.y = stackSurfaceY - p.r;
              p.vel.x = 0;
              p.vel.y = 0;
              p.settled = true;

              // Keep stack aligned to where it landed (optional). Clamp inside zone.
              stackXRef.current = clamp(p.pos.x, stackXMin + p.r, stackXMax - p.r);
              p.pos.x = stackXRef.current;

              layersRef.current += 1;
              setLayers(layersRef.current);

              // Spawn next after a beat
              window.setTimeout(() => {
                if (phaseRef.current === 'running') {
                  spawnPatty(w, h);
                }
              }, 120);
            } else {
              // Miss: bounce and then fall off
              if (!p.missed) {
                p.missed = true;
                setMisses((m) => m + 1);
              }
              p.vel.y *= -0.35;
              p.vel.x += (p.pos.x < bunCenterX ? -2.2 : 2.2);
              p.pos.y = stackSurfaceY - p.r;
            }
          }

          // Fell below screen: respawn
          if (p.pos.y - p.r > h + 40) {
            spawnPatty(w, h);
          }
        } else if (!p.thrown) {
          // If not thrown yet, keep patty at spawn, follow stack center
          p.pos.x = stackXRef.current || w * 0.5;
        }
      }

      // Draw
      ctx.clearRect(0, 0, w, h);

      // Stack zone guides
      ctx.save();
      ctx.strokeStyle = 'rgba(28,28,28,0.18)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.strokeRect(stackXMin, 26, stackXMax - stackXMin, bottomBunTopY - 26);
      ctx.setLineDash([]);
      ctx.restore();

      // Bottom bun
      ctx.save();
      ctx.fillStyle = 'rgba(28,28,28,0.10)';
      ctx.fillRect(0, bottomBunTopY + bunH, w, 999);

      ctx.fillStyle = 'rgba(28,28,28,0.12)';
      drawPill(ctx, bunCenterX - bunW / 2, bottomBunTopY, bunW, bunH);
      ctx.fill();
      ctx.restore();

      // Patties stack (visual only)
      ctx.save();
      for (let i = 0; i < layersRef.current; i++) {
        const y = bottomBunTopY - i * pattyThickness;
        const x = stackXRef.current || w * 0.5;
        ctx.fillStyle = 'rgba(28,28,28,0.82)';
        ctx.beginPath();
        ctx.ellipse(x, y - pattyThickness / 2, bunW * 0.30, pattyThickness / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Top bun (just for aesthetics; doesn't block HUD)
      ctx.save();
      const topY = bottomBunTopY - layersRef.current * pattyThickness - 22;
      ctx.fillStyle = 'rgba(28,28,28,0.08)';
      drawPill(ctx, bunCenterX - bunW / 2, topY, bunW, bunH);
      ctx.fill();
      ctx.restore();

      // Active patty
      if (p) {
        ctx.save();
        ctx.fillStyle = 'rgba(28,28,28,0.92)';
        ctx.beginPath();
        ctx.ellipse(p.pos.x, p.pos.y, p.r * 1.55, p.r, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Aim line while dragging
        if (phaseRef.current === 'running' && isDraggingRef.current && dragStartRef.current && dragNowRef.current && !p.thrown) {
          const a = dragStartRef.current;
          const b = dragNowRef.current;
          ctx.save();
          ctx.strokeStyle = 'rgba(28,28,28,0.65)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.restore();
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (phaseRef.current !== 'running') return;
    const canvas = canvasRef.current;
    const p = pattyRef.current;
    if (!canvas || !p || p.thrown) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Start drag only if user presses near the patty
    const dx = x - p.pos.x;
    const dy = y - p.pos.y;
    const near = dx * dx + dy * dy <= (p.r * 2.0) * (p.r * 2.0);
    if (!near) return;

    (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    dragStartRef.current = { x: p.pos.x, y: p.pos.y };
    dragNowRef.current = { x, y };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    dragNowRef.current = { x, y };
  };

  const onPointerUp = () => {
    if (!isDraggingRef.current) return;
    throwPatty();
  };

  return (
    <div className="panel">
      <div className="panelHeader">
        <div className="kpiRow" style={{ width: '100%' }}>
          <div className="kpi">
            <div className="kpiLabel">TIME</div>
            <div className="kpiValue">{formatTime(timeLeft)}</div>
          </div>
          <div className="kpi">
            <div className="kpiLabel">LAYERS</div>
            <div className="kpiValue">{layers}</div>
          </div>
          <div className="kpi">
            <div className="kpiLabel">DISCOUNT</div>
            <div className="kpiValue">NT${discount}</div>
          </div>
        </div>
      </div>

      <div className="gameWrap">
        <div className="controls" style={{ marginBottom: 10 }}>
          <button className="button buttonPrimary" onClick={start} disabled={phase === 'running'}>
            開始 15 秒
          </button>
          <button className="button" onClick={reset}>
            重置
          </button>
          <button
            className="button"
            onClick={() => {
              // Allow quick play: if not dragging, do a small auto-toss.
              const { w, h } = getCanvasSize();
              dragStartRef.current = { x: w * 0.5, y: h * 0.22 };
              dragNowRef.current = { x: w * 0.5 - (Math.random() * 120 - 60), y: h * 0.22 + 140 };
              throwPatty();
            }}
            disabled={phase !== 'running'}
          >
            快速丟一個
          </button>
          <div style={{ marginLeft: 'auto', color: 'rgba(28,28,28,0.7)', fontSize: 13 }}>
            丟法：按住肉排拖曳瞄準 → 放開丟出
          </div>
        </div>

        <div className="canvasWrap" style={{ height: 560 }}>
          <div className="hud" aria-hidden="true">
            <div className="hudCard">
              <div className="hudTitle">有效範圍</div>
              <div className="hudValue">只算框內</div>
              <div className="hudHint">肉排完全落在框內才算一層；超出範圍不計分。</div>
            </div>
            <div className="hudCard">
              <div className="hudTitle">結算折抵</div>
              <div className="hudValue">NT${discount}</div>
              <div className="hudHint">分數/折抵顯示固定置頂，不會被漢堡堆疊遮住。</div>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', touchAction: 'none', display: 'block' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          />

          {phase === 'idle' && (
            <div className="overlay">
              <div className="modal">
                <h2 className="modalTitle">15 秒丟肉排疊漢堡</h2>
                <div className="modalBody">
                  <div>把肉排丟進虛線框（有效範圍）並疊起來。</div>
                  <div>每多一層，<span className="modalStrong">折抵金額</span>就越高。</div>
                  <div style={{ marginTop: 10, color: 'rgba(28,28,28,0.72)' }}>按住肉排拖曳瞄準 → 放開丟出。</div>
                </div>
                <div className="modalActions">
                  <button className="button buttonPrimary" onClick={start}>開始 15 秒</button>
                </div>
              </div>
            </div>
          )}

          {phase === 'ended' && (
            <div className="overlay">
              <div className="modal">
                <h2 className="modalTitle">結算完成</h2>
                <div className="modalBody">
                  <div>
                    你成功疊了 <span className="modalStrong">{layers}</span> 層。
                  </div>
                  <div>
                    本次可折抵：<span className="modalStrong">NT${discount}</span>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    投擲：<span className="modalStrong">{throws}</span> 次，未計分：<span className="modalStrong">{misses}</span> 次。
                  </div>
                </div>
                <div className="modalActions">
                  <button className="button buttonPrimary" onClick={start}>再玩一次</button>
                  <button className="button" onClick={reset}>回到首頁</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
