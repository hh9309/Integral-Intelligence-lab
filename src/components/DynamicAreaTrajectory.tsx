import React, { useState, useMemo, useEffect, useRef } from "react";
import { PresetFunction } from "../types";
import {
  PRESET_FUNCTIONS,
  createCustomFunction,
  computeHighPrecisionIntegral,
} from "../utils/mathEngine";
import { MathFormula, MathText } from "./MathFormula";
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Compass,
} from "lucide-react";

interface DynamicAreaTrajectoryProps {
  currentPreset: PresetFunction;
  a: number;
  b: number;
  customExpr: string;
  isCustom: boolean;
}

export const DynamicAreaTrajectory: React.FC<DynamicAreaTrajectoryProps> = ({
  currentPreset,
  a,
  b,
  customExpr,
  isCustom,
}) => {
  const [currentX, setCurrentX] = useState<number>((a + b) / 2);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const animFrameRef = useRef<number | null>(null);

  // Active mathematical function f(t)
  const activeFn = useMemo(() => {
    if (isCustom && customExpr.trim()) {
      return createCustomFunction(customExpr);
    }
    return currentPreset.evaluate;
  }, [isCustom, customExpr, currentPreset]);

  // Antiderivative accumulator function F(x) = \int_a^x f(t) dt
  const evaluateAccumulator = useMemo(() => {
    return (xVal: number) => {
      if (xVal <= a) return 0;
      if (!isCustom && currentPreset.evaluateAntiderivative) {
        return (
          currentPreset.evaluateAntiderivative(xVal) -
          currentPreset.evaluateAntiderivative(a)
        );
      }
      return computeHighPrecisionIntegral(activeFn, a, xVal, 200);
    };
  }, [isCustom, currentPreset, activeFn, a]);

  // Sync current upper limit within [a, b]
  useEffect(() => {
    setCurrentX((prev) => Math.max(a, Math.min(b, prev)));
  }, [a, b]);

  // Animation loop
  useEffect(() => {
    if (isPlaying) {
      const step = ((b - a) / 200) * speed;
      const interval = setInterval(() => {
        setCurrentX((prev) => {
          if (prev >= b) {
            return a;
          }
          return Math.min(b, prev + step);
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [isPlaying, a, b, speed]);

  // Current instantaneous values
  const currentFVal = activeFn(currentX); // Height f(x)
  const currentAccumulatedArea = evaluateAccumulator(currentX); // Cumulative area F(x)

  // SVG coordinate planes setup
  const svgWidth = 800;
  const svgHeight = 260;
  const pad = { top: 25, right: 30, bottom: 35, left: 55 };
  const pWidth = svgWidth - pad.left - pad.right;
  const pHeight = svgHeight - pad.top - pad.bottom;

  // Domain & Ranges
  const domainMin = a - (b - a) * 0.1;
  const domainMax = b + (b - a) * 0.1;

  // Calculate y bounds for f(t)
  const { fMinY, fMaxY, FMinY, FMaxY } = useMemo(() => {
    let minF = 0;
    let maxF = 0;
    let minAcc = 0;
    let maxAcc = 0;
    const steps = 80;

    for (let i = 0; i <= steps; i++) {
      const x = domainMin + (i / steps) * (domainMax - domainMin);
      const yf = activeFn(x);
      if (isFinite(yf)) {
        if (yf < minF) minF = yf;
        if (yf > maxF) maxF = yf;
      }
      const yAcc = evaluateAccumulator(x);
      if (isFinite(yAcc)) {
        if (yAcc < minAcc) minAcc = yAcc;
        if (yAcc > maxAcc) maxAcc = yAcc;
      }
    }

    const marginF = (maxF - minF) * 0.2 || 1;
    const marginAcc = (maxAcc - minAcc) * 0.2 || 1;

    return {
      fMinY: Math.min(0, minF - marginF * 0.3),
      fMaxY: Math.max(1, maxF + marginF),
      FMinY: Math.min(0, minAcc - marginAcc * 0.3),
      FMaxY: Math.max(1, maxAcc + marginAcc),
    };
  }, [domainMin, domainMax, activeFn, evaluateAccumulator]);

  const mapX = (x: number) => pad.left + ((x - domainMin) / (domainMax - domainMin)) * pWidth;
  const mapY_f = (y: number) => pad.top + pHeight - ((y - fMinY) / (fMaxY - fMinY)) * pHeight;
  const mapY_F = (y: number) => pad.top + pHeight - ((y - FMinY) / (FMaxY - FMinY)) * pHeight;

  const yZero_f = mapY_f(0);
  const yZero_F = mapY_F(0);

  // Full curves
  const curvePath_f = useMemo(() => {
    const pts: string[] = [];
    const steps = 150;
    for (let i = 0; i <= steps; i++) {
      const x = domainMin + (i / steps) * (domainMax - domainMin);
      const y = activeFn(x);
      if (isFinite(y)) {
        pts.push(`${i === 0 ? "M" : "L"} ${mapX(x).toFixed(1)} ${mapY_f(y).toFixed(1)}`);
      }
    }
    return pts.join(" ");
  }, [domainMin, domainMax, activeFn, fMinY, fMaxY]);

  const fullTrajectoryPath_F = useMemo(() => {
    const pts: string[] = [];
    const steps = 150;
    for (let i = 0; i <= steps; i++) {
      const x = a + (i / steps) * (b - a);
      const y = evaluateAccumulator(x);
      if (isFinite(y)) {
        pts.push(`${i === 0 ? "M" : "L"} ${mapX(x).toFixed(1)} ${mapY_F(y).toFixed(1)}`);
      }
    }
    return pts.join(" ");
  }, [a, b, evaluateAccumulator, FMinY, FMaxY]);

  // Active cumulative fill on f(t) from a to currentX
  const activeAreaPath_f = useMemo(() => {
    if (currentX <= a) return "";
    const pts: string[] = [];
    const steps = 80;
    const startX = mapX(a);
    const endX = mapX(currentX);

    pts.push(`M ${startX.toFixed(1)} ${yZero_f.toFixed(1)}`);
    for (let i = 0; i <= steps; i++) {
      const x = a + (i / steps) * (currentX - a);
      const y = activeFn(x);
      pts.push(`L ${mapX(x).toFixed(1)} ${mapY_f(y).toFixed(1)}`);
    }
    pts.push(`L ${endX.toFixed(1)} ${yZero_f.toFixed(1)} Z`);
    return pts.join(" ");
  }, [a, currentX, activeFn, yZero_f, fMinY, fMaxY]);

  // Traced path on F(x) up to currentX
  const tracedPath_F = useMemo(() => {
    if (currentX <= a) return "";
    const pts: string[] = [];
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const x = a + (i / steps) * (currentX - a);
      const y = evaluateAccumulator(x);
      pts.push(`${i === 0 ? "M" : "L"} ${mapX(x).toFixed(1)} ${mapY_F(y).toFixed(1)}`);
    }
    return pts.join(" ");
  }, [a, currentX, evaluateAccumulator, FMinY, FMaxY]);

  // Tangent line on F(x) at currentX: slope = f(currentX)
  const tangentLine_F = useMemo(() => {
    const slope = currentFVal;
    const x0 = currentX;
    const y0 = currentAccumulatedArea;
    const delta = (b - a) * 0.12 || 0.5;

    const x1 = x0 - delta;
    const y1 = y0 - slope * delta;
    const x2 = x0 + delta;
    const y2 = y0 + slope * delta;

    return {
      x1: mapX(x1),
      y1: mapY_F(y1),
      x2: mapX(x2),
      y2: mapY_F(y2),
      slope,
    };
  }, [currentX, currentAccumulatedArea, currentFVal, a, b, FMinY, FMaxY]);

  return (
    <div id="dynamic-trajectory-section" className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold mb-1 border border-blue-100">
              <Activity className="w-3.5 h-3.5" />
              <span>模块 3 · 变上限积分与动态累积面积 2D 轨迹演播</span>
            </div>
            <div className="text-lg font-bold text-slate-900">
              <MathText text="同屏渲染原函数 $f(t)$ 与变上限积分函数 $\Phi(x) = \int_a^x f(t) \, dt$" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-play-trajectory"
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? "暂停演播" : "自动扫描演播"}</span>
            </button>
            <button
              id="btn-reset-trajectory"
              onClick={() => {
                setIsPlaying(false);
                setCurrentX(a);
              }}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="重置至下限 a"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Upper Limit Slider Control */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span>交互拖动变上限 x:</span>
              <span className="font-mono text-blue-700 font-extrabold text-sm">
                x = {currentX.toFixed(3)}
              </span>
            </label>
            <p className="text-[11px] text-slate-500">
              积分区间 [a={a}, b={b}]，当前扫描进度: {(((currentX - a) / (b - a || 1)) * 100).toFixed(1)}%
            </p>
          </div>

          <div className="flex-1 max-w-md flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">a={a}</span>
            <input
              id="slider-dynamic-upper-limit"
              type="range"
              min={a}
              max={b}
              step={(b - a) / 300 || 0.01}
              value={currentX}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentX(parseFloat(e.target.value));
              }}
              className="flex-1 accent-blue-600 cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-400">b={b}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">速度:</span>
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
                  speed === s ? "bg-blue-600 text-white font-bold" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Synchronized Dual Coordinate Planes */}
      <div className="grid grid-cols-1 gap-5">
        {/* Plane 1: Original Integrand f(t) and dynamic area fill */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="font-bold text-slate-800">原被积函数 y = f(t) 与动态扫描面积</span>
            </div>
            <div className="font-mono text-slate-600 text-[11px]">
              瞬时高度 f(x) = <span className="font-bold text-blue-600">{currentFVal.toFixed(4)}</span>
            </div>
          </div>

          <div className="relative w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-800">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none">
              <defs>
                <linearGradient id="dynamicAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.15" />
                </linearGradient>
              </defs>

              {/* Axes */}
              <line x1={pad.left} y1={yZero_f} x2={pad.left + pWidth} y2={yZero_f} stroke="#475569" strokeWidth="1" />
              <line x1={mapX(0)} y1={pad.top + pHeight} x2={mapX(0)} y2={pad.top} stroke="#475569" strokeWidth="1" />

              {/* Dynamic Fill Area */}
              <path d={activeAreaPath_f} fill="url(#dynamicAreaFill)" />

              {/* Curve f(t) */}
              <path d={curvePath_f} fill="none" stroke="#38bdf8" strokeWidth="2.5" />

              {/* Scanning Needle Line at x */}
              <line
                x1={mapX(currentX)}
                y1={pad.top}
                x2={mapX(currentX)}
                y2={pad.top + pHeight}
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4,3"
              />
              <circle
                cx={mapX(currentX)}
                cy={mapY_f(currentFVal)}
                r="4.5"
                fill="#f59e0b"
                stroke="#0f172a"
                strokeWidth="2"
              />

              <text
                x={mapX(currentX)}
                y={pad.top + 14}
                fill="#f59e0b"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
              >
                x = {currentX.toFixed(2)}
              </text>
            </svg>
          </div>
        </div>

        {/* Plane 2: Accumulator Function F(x) = \int_a^x f(t)dt with dynamic tangent */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
              <div className="font-bold text-slate-800">
                <MathText text="变上限积分原函数轨迹 $\Phi(x) = \int_a^x f(t) \, dt$ 及其导数切线" />
              </div>
            </div>
            <div className="font-mono text-slate-600 text-[11px]">
              累积面积 Φ(x) = <span className="font-bold text-blue-600">{currentAccumulatedArea.toFixed(4)}</span> |
              切线斜率 k = Φ'(x) = <span className="font-bold text-amber-500">{currentFVal.toFixed(4)}</span>
            </div>
          </div>

          <div className="relative w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-800">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none">
              {/* Axes */}
              <line x1={pad.left} y1={yZero_F} x2={pad.left + pWidth} y2={yZero_F} stroke="#475569" strokeWidth="1" />
              <line x1={mapX(0)} y1={pad.top + pHeight} x2={mapX(0)} y2={pad.top} stroke="#475569" strokeWidth="1" />

              {/* Full ghost trajectory */}
              <path
                d={fullTrajectoryPath_F}
                fill="none"
                stroke="#475569"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />

              {/* Dynamic traced curve */}
              <path d={tracedPath_F} fill="none" stroke="#60a5fa" strokeWidth="3" />

              {/* Tangent Line at (currentX, F(currentX)) */}
              <line
                x1={tangentLine_F.x1}
                y1={tangentLine_F.y1}
                x2={tangentLine_F.x2}
                y2={tangentLine_F.y2}
                stroke="#f59e0b"
                strokeWidth="2.5"
              />

              {/* Pointer node */}
              <circle
                cx={mapX(currentX)}
                cy={mapY_F(currentAccumulatedArea)}
                r="5"
                fill="#60a5fa"
                stroke="#fbbf24"
                strokeWidth="2.5"
              />

              <text
                x={mapX(currentX) + 10}
                y={mapY_F(currentAccumulatedArea) - 10}
                fill="#60a5fa"
                fontSize="11"
                fontWeight="bold"
                fontFamily="monospace"
              >
                ({currentX.toFixed(2)}, {currentAccumulatedArea.toFixed(3)})
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Live FTC Verification Card */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs font-bold text-sm">
            FTC
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">
              <MathText text="微积分第一基本定理直观互验：$\Phi'(x) \equiv f(x)$" />
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              <MathText text={`观察原函数 $\\Phi(x)$ 图像上的金黄色切线斜率，其瞬时倾斜度恰好完全等于上方被积函数的高度 $f(x) = ${currentFVal.toFixed(4)}$！`} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-blue-200 shadow-2xs shrink-0">
          <div className="text-center font-mono">
            <span className="text-[10px] text-slate-400 block">导数斜率 Φ'(x)</span>
            <span className="text-sm font-bold text-amber-600">{currentFVal.toFixed(4)}</span>
          </div>
          <span className="text-slate-300 font-bold">=</span>
          <div className="text-center font-mono">
            <span className="text-[10px] text-slate-400 block">原高度 f(x)</span>
            <span className="text-sm font-bold text-blue-600">{currentFVal.toFixed(4)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
