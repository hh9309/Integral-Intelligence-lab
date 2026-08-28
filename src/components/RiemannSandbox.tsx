import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ApproximationMethod,
  PresetFunction,
  RiemannSlice,
} from "../types";
import {
  PRESET_FUNCTIONS,
  createCustomFunction,
  computeRiemannApproximation,
  getExactIntegral,
} from "../utils/mathEngine";
import { MathFormula } from "./MathFormula";
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Maximize2,
  Info,
  Check,
  ChevronRight,
  Eye,
  Crosshair,
  Layers,
  Sparkles,
  FastForward,
  Repeat,
  Zap,
} from "lucide-react";

interface RiemannSandboxProps {
  currentPreset: PresetFunction;
  onSelectPreset: (p: PresetFunction) => void;
  n: number;
  setN: (n: number | ((prev: number) => number)) => void;
  a: number;
  setA: (a: number) => void;
  b: number;
  setB: (b: number) => void;
  method: ApproximationMethod;
  setMethod: (m: ApproximationMethod) => void;
  customExpr: string;
  setCustomExpr: (s: string) => void;
  isCustom: boolean;
  setIsCustom: (b: boolean) => void;
}

export const RiemannSandbox: React.FC<RiemannSandboxProps> = ({
  currentPreset,
  onSelectPreset,
  n,
  setN,
  a,
  setA,
  b,
  setB,
  method,
  setMethod,
  customExpr,
  setCustomExpr,
  isCustom,
  setIsCustom,
}) => {
  const [hoveredSlice, setHoveredSlice] = useState<RiemannSlice | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<"0.5x" | "1x" | "2x" | "4x">("1x");
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [showCurveArea, setShowCurveArea] = useState<boolean>(true);
  const [showSamplePoints, setShowSamplePoints] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Active mathematical function
  const activeFn = useMemo(() => {
    if (isCustom && customExpr.trim()) {
      return createCustomFunction(customExpr);
    }
    return currentPreset.evaluate;
  }, [isCustom, customExpr, currentPreset]);

  // Exact integral calculation
  const exactVal = useMemo(() => {
    if (isCustom) {
      return getExactIntegral(null, activeFn, a, b);
    }
    return getExactIntegral(currentPreset, null, a, b);
  }, [isCustom, activeFn, currentPreset, a, b]);

  // Riemann approximation result
  const approxResult = useMemo(() => {
    return computeRiemannApproximation(activeFn, a, b, n, method, exactVal);
  }, [activeFn, a, b, n, method, exactVal]);

  // Animation player for dynamic partition n
  useEffect(() => {
    if (!isPlaying) return;

    const speedMs =
      playSpeed === "0.5x" ? 220 : playSpeed === "1x" ? 100 : playSpeed === "2x" ? 50 : 22;

    const timer = setInterval(() => {
      setN((prev) => {
        if (prev >= 150) {
          if (isLooping) {
            return 1;
          } else {
            setIsPlaying(false);
            return 150;
          }
        }
        if (prev < 12) return prev + 1;
        if (prev < 30) return prev + 2;
        if (prev < 60) return prev + 3;
        if (prev < 100) return prev + 5;
        return Math.min(150, prev + 8);
      });
    }, speedMs);

    return () => clearInterval(timer);
  }, [isPlaying, playSpeed, isLooping, setN]);

  const handleTogglePlay = () => {
    if (!isPlaying && n >= 145) {
      setN(1);
    }
    setIsPlaying((prev) => !prev);
  };

  const handleStep = (delta: number) => {
    setIsPlaying(false);
    setN((prev) => Math.min(150, Math.max(1, prev + delta)));
  };

  const handleResetN = () => {
    setIsPlaying(false);
    setN(10);
  };

  // SVG Coordinate mapping helpers
  const svgWidth = 800;
  const svgHeight = 420;
  const padding = { top: 30, right: 30, bottom: 45, left: 55 };

  // Calculate domain and range for visual plotting
  const { xMin, xMax, yMin, yMax, plotWidth, plotHeight } = useMemo(() => {
    const marginX = (b - a) * 0.15 || 0.5;
    const calcXMin = a - marginX;
    const calcXMax = b + marginX;

    // Sample function values to determine y bounds
    let minY = 0;
    let maxY = 0;
    const steps = 120;
    for (let i = 0; i <= steps; i++) {
      const x = calcXMin + (i / steps) * (calcXMax - calcXMin);
      const y = activeFn(x);
      if (isFinite(y)) {
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }

    const marginY = (maxY - minY) * 0.15 || 1;
    const calcYMin = Math.min(0, minY - marginY * 0.5);
    const calcYMax = Math.max(1, maxY + marginY);

    return {
      xMin: calcXMin,
      xMax: calcXMax,
      yMin: calcYMin,
      yMax: calcYMax,
      plotWidth: svgWidth - padding.left - padding.right,
      plotHeight: svgHeight - padding.top - padding.bottom,
    };
  }, [a, b, activeFn]);

  const mapX = (x: number) =>
    padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth;
  const mapY = (y: number) =>
    padding.top + plotHeight - ((y - yMin) / (yMax - yMin)) * plotHeight;
  const yZero = mapY(0);

  // Generate continuous function curve path
  const curvePath = useMemo(() => {
    const points: string[] = [];
    const steps = 240;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = activeFn(x);
      if (isFinite(y)) {
        const px = mapX(x);
        const py = mapY(y);
        points.push(`${i === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`);
      }
    }
    return points.join(" ");
  }, [xMin, xMax, activeFn, yMin, yMax, plotWidth, plotHeight]);

  // Exact area fill path under curve between [a, b]
  const exactAreaPath = useMemo(() => {
    const points: string[] = [];
    const steps = 150;
    const startPx = mapX(a);
    const endPx = mapX(b);

    points.push(`M ${startPx.toFixed(2)} ${yZero.toFixed(2)}`);
    for (let i = 0; i <= steps; i++) {
      const x = a + (i / steps) * (b - a);
      const y = activeFn(x);
      if (isFinite(y)) {
        points.push(`L ${mapX(x).toFixed(2)} ${mapY(y).toFixed(2)}`);
      }
    }
    points.push(`L ${endPx.toFixed(2)} ${yZero.toFixed(2)} Z`);
    return points.join(" ");
  }, [a, b, activeFn, yMin, yMax, xMin, xMax, plotWidth, plotHeight, yZero]);

  // Grid lines
  const gridLines = useMemo(() => {
    const xTicks: number[] = [];
    const yTicks: number[] = [];
    const xSpan = xMax - xMin;
    const xStep = xSpan <= 4 ? 0.5 : xSpan <= 10 ? 1 : 2;

    const firstXTick = Math.ceil(xMin / xStep) * xStep;
    for (let x = firstXTick; x <= xMax; x += xStep) {
      xTicks.push(Number(x.toFixed(2)));
    }

    const ySpan = yMax - yMin;
    const yStep = ySpan <= 4 ? 0.5 : ySpan <= 10 ? 1 : 2;
    const firstYTick = Math.ceil(yMin / yStep) * yStep;
    for (let y = firstYTick; y <= yMax; y += yStep) {
      yTicks.push(Number(y.toFixed(2)));
    }

    return { xTicks, yTicks };
  }, [xMin, xMax, yMin, yMax]);

  const methodOptions: { id: ApproximationMethod; label: string; formula: string; desc: string }[] = [
    { id: "left", label: "左端点法 (Left)", formula: "x_i^* = x_{i-1}", desc: "以每个区间左端点函数值作为矩形高度" },
    { id: "right", label: "右端点法 (Right)", formula: "x_i^* = x_i", desc: "以每个区间右端点函数值作为矩形高度" },
    { id: "midpoint", label: "中点法 (Midpoint)", formula: "x_i^* = \\frac{x_{i-1}+x_i}{2}", desc: "以中点高度构造矩形，误差为 O(1/n²)" },
    { id: "trapezoid", label: "梯形法 (Trapezoidal)", formula: "A_i = \\frac{f(x_{i-1})+f(x_i)}{2}\\Delta x", desc: "以弦割线连接两端构成梯形，误差 O(1/n²)" },
    { id: "simpson", label: "辛普森法 (Simpson's)", formula: "A_i = \\frac{\\Delta x}{6}(f_{L}+4f_{M}+f_{R})", desc: "以二次抛物线拟合三点，误差达 O(1/n⁴)" },
    { id: "upper_darboux", label: "达布上和 (Upper Darboux)", formula: "M_i = \\sup_{x \\in I_i} f(x)", desc: "取区间内上确界高度，必然外包真实面积" },
    { id: "lower_darboux", label: "达布下和 (Lower Darboux)", formula: "m_i = \\inf_{x \\in I_i} f(x)", desc: "取区间内下确界高度，必然内接真实面积" },
  ];

  return (
    <div id="riemann-sandbox-section" className="space-y-6">
      {/* Control Panel Slice */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
        {/* Preset Function Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-800">函数选择与区间配置:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {PRESET_FUNCTIONS.map((p) => (
              <button
                key={p.id}
                id={`preset-btn-${p.id}`}
                onClick={() => {
                  setIsCustom(false);
                  onSelectPreset(p);
                  setA(p.defaultA);
                  setB(p.defaultB);
                  setN(p.defaultN);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  !isCustom && currentPreset.id === p.id
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
                }`}
              >
                {p.name.split(" ")[0]}
              </button>
            ))}
            <button
              id="custom-func-btn"
              onClick={() => setIsCustom(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isCustom
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
              }`}
            >
              ✍️ 自定义表达式
            </button>
          </div>
        </div>

        {/* Custom expression input if selected */}
        {isCustom && (
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-semibold text-blue-900">f(x) =</span>
            <input
              id="custom-expr-input"
              type="text"
              value={customExpr}
              onChange={(e) => setCustomExpr(e.target.value)}
              placeholder="例如: x^2 - sin(x) + 2 或 1/(1+x^2)"
              className="flex-1 px-3 py-1.5 bg-white rounded-lg border border-blue-200 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-[11px] text-slate-500">支持 x^2, sin(x), cos(x), exp(x), sqrt(x) 等</span>
          </div>
        )}

        {/* Parameter Sliders, Interval, Method Selector & Dynamic Animation */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {/* Method selector (5 cols on desktop) */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600">
              逼近法则 (Approximation Method)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-1.5">
              {methodOptions.map((opt) => (
                <button
                  key={opt.id}
                  id={`method-btn-${opt.id}`}
                  onClick={() => setMethod(opt.id)}
                  className={`p-2 rounded-lg text-xs font-medium border text-left transition-all cursor-pointer ${
                    method === opt.id
                      ? "bg-blue-50 text-blue-700 border-blue-300 font-bold shadow-2xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="truncate text-[11px]">{opt.label.split(" ")[0]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Interval [a, b] configuration (3 cols on desktop) */}
          <div className="md:col-span-3 space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800">
              积分区间配置 [a, b]
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-[10px] text-slate-500 mb-0.5">下限 a</label>
                <input
                  id="input-interval-a"
                  type="number"
                  step="0.5"
                  value={a}
                  onChange={(e) => setA(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-center font-bold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <span className="text-slate-400 font-mono text-xs pt-4">~</span>
              <div className="flex-1">
                <label className="block text-[10px] text-slate-500 mb-0.5">上限 b</label>
                <input
                  id="input-interval-b"
                  type="number"
                  step="0.5"
                  value={b}
                  onChange={(e) => setB(parseFloat(e.target.value) || 1)}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-center font-bold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
              <span>区间跨度: {Math.abs(b - a).toFixed(2)}</span>
              <button
                type="button"
                onClick={() => {
                  setA(currentPreset.defaultA);
                  setB(currentPreset.defaultB);
                }}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                恢复默认
              </button>
            </div>
          </div>

          {/* Partition count N slider & Dynamic Animation Controls (5 cols on desktop) */}
          <div className="md:col-span-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>分割数</span>
                <span className="font-mono text-blue-700 font-bold bg-blue-100/70 px-2 py-0.5 rounded text-xs">
                  n = {n}
                </span>
              </label>

              {/* Step Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleStep(-5)}
                  disabled={n <= 1}
                  className="px-1.5 py-0.5 text-[11px] font-mono rounded bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer disabled:opacity-40"
                  title="分割数 -5"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => handleStep(1)}
                  disabled={n >= 150}
                  className="px-1.5 py-0.5 text-[11px] font-mono rounded bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer disabled:opacity-40"
                  title="分割数 +1"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => handleStep(5)}
                  disabled={n >= 150}
                  className="px-1.5 py-0.5 text-[11px] font-mono rounded bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer disabled:opacity-40"
                  title="分割数 +5"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => handleStep(10)}
                  disabled={n >= 150}
                  className="px-1.5 py-0.5 text-[11px] font-mono rounded bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer disabled:opacity-40"
                  title="分割数 +10"
                >
                  +10
                </button>
              </div>
            </div>

            <input
              id="slider-riemann-n"
              type="range"
              min="1"
              max="150"
              value={n}
              onChange={(e) => {
                setIsPlaying(false);
                setN(parseInt(e.target.value));
              }}
              className="w-full accent-blue-600 cursor-pointer"
            />
            
            {/* Quick preset chips for n */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              {[2, 5, 10, 20, 50, 100, 150].map((presetN) => (
                <button
                  key={presetN}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setN(presetN);
                  }}
                  className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    n === presetN
                      ? "bg-blue-600 text-white font-bold"
                      : "bg-white hover:bg-slate-200 text-slate-600 border border-slate-200"
                  }`}
                >
                  n={presetN}
                </button>
              ))}
            </div>

            {/* Animation Control Bar */}
            <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  id="btn-play-partition"
                  type="button"
                  onClick={handleTogglePlay}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                    isPlaying
                      ? "bg-amber-500 hover:bg-amber-600 text-white animate-pulse"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>暂停演播 (n={n})</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>随分割数演播逼近</span>
                    </>
                  )}
                </button>

                <button
                  id="btn-reset-partition"
                  type="button"
                  onClick={handleResetN}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                  title="重置为 n=10"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Speed and Loop options */}
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-medium">速度:</span>
                  {(["0.5x", "1x", "2x", "4x"] as const).map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setPlaySpeed(spd)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                        playSpeed === spd
                          ? "bg-blue-600 text-white font-bold"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {spd}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-1 cursor-pointer select-none text-[11px]">
                  <input
                    type="checkbox"
                    checked={isLooping}
                    onChange={(e) => setIsLooping(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3 h-3"
                  />
                  <span className="text-slate-500">循环演播</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2D Sandbox Coordinate View */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
        {/* Canvas Toolbar & Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">2D 交互式逼近沙盒</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-[11px] border border-slate-200">
              Δx = {((b - a) / n).toFixed(4)}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-600">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showCurveArea}
                onChange={(e) => setShowCurveArea(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>真实曲边面积底衬</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showSamplePoints}
                onChange={(e) => setShowSamplePoints(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>介点采样标桩</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>网格刻度</span>
            </label>
          </div>
        </div>

        {/* Dynamic SVG 2D Visualization Plane */}
        <div className="relative w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
          {isPlaying && (
            <div className="absolute top-3 left-3 right-3 sm:right-auto z-10 flex flex-wrap items-center gap-2 sm:gap-3 px-3.5 py-2 rounded-xl bg-slate-950/90 backdrop-blur-md border border-blue-500/50 text-blue-300 text-xs font-mono shadow-xl">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="font-bold text-white tracking-wide">演播逼近中</span>
              </div>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span>n = <strong className="text-amber-300">{n}</strong></span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span>Δx = <strong className="text-cyan-300">{((b - a) / n).toFixed(4)}</strong></span>
              <span className="text-slate-600 hidden md:inline">|</span>
              <span className="hidden md:inline">S_n = <strong className="text-emerald-300">{approxResult.value.toFixed(5)}</strong></span>
              <span className="text-slate-600 hidden lg:inline">|</span>
              <span className="hidden lg:inline">真实面积 = <strong className="text-slate-200">{exactVal.toFixed(5)}</strong></span>
              <span className="text-slate-600 hidden xl:inline">|</span>
              <span className="hidden xl:inline">误差 = <strong className="text-rose-300">{approxResult.absError.toExponential(2)}</strong></span>
            </div>
          )}

          <svg
            id="riemann-sandbox-svg"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto select-none"
            style={{ minHeight: "340px", maxHeight: "460px" }}
          >
            <defs>
              <linearGradient id="exactAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="sliceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="hoverSliceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.6" />
              </linearGradient>
            </defs>

            {/* Background Grids */}
            {showGrid && (
              <g className="opacity-15">
                {gridLines.xTicks.map((x) => (
                  <line
                    key={`gx-${x}`}
                    x1={mapX(x)}
                    y1={padding.top}
                    x2={mapX(x)}
                    y2={padding.top + plotHeight}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                ))}
                {gridLines.yTicks.map((y) => (
                  <line
                    key={`gy-${y}`}
                    x1={padding.left}
                    y1={mapY(y)}
                    x2={padding.left + plotWidth}
                    y2={mapY(y)}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                ))}
              </g>
            )}

            {/* Coordinate Axes */}
            <line
              x1={padding.left}
              y1={yZero}
              x2={padding.left + plotWidth + 10}
              y2={yZero}
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <line
              x1={mapX(0)}
              y1={padding.top + plotHeight}
              x2={mapX(0)}
              y2={padding.top - 10}
              stroke="#64748b"
              strokeWidth="1.5"
            />

            {/* Axis Tick Labels */}
            {gridLines.xTicks.map((x) => (
              <text
                key={`lbl-x-${x}`}
                x={mapX(x)}
                y={yZero + 18}
                fontSize="11"
                fill="#94a3b8"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {x}
              </text>
            ))}
            {gridLines.yTicks.map((y) => (
              <text
                key={`lbl-y-${y}`}
                x={padding.left - 10}
                y={mapY(y) + 4}
                fontSize="11"
                fill="#94a3b8"
                textAnchor="end"
                fontFamily="monospace"
              >
                {y}
              </text>
            ))}

            {/* Exact Area Background Fill */}
            {showCurveArea && (
              <path d={exactAreaPath} fill="url(#exactAreaGrad)" />
            )}

            {/* Riemann Slices Rendering */}
            {approxResult.slices.map((slice) => {
              const x1 = mapX(slice.xLeft);
              const x2 = mapX(slice.xRight);
              const width = Math.max(1, x2 - x1);
              const isHovered = hoveredSlice?.index === slice.index;

              if (method === "trapezoid") {
                const yL = mapY(slice.heightLeft || 0);
                const yR = mapY(slice.heightRight || 0);
                const trapPoints = `${x1},${yZero} ${x1},${yL} ${x2},${yR} ${x2},${yZero}`;

                return (
                  <polygon
                    key={`slice-trap-${slice.index}`}
                    points={trapPoints}
                    fill={isHovered ? "url(#hoverSliceGrad)" : "url(#sliceGrad)"}
                    stroke={isHovered ? "#fbbf24" : "#818cf8"}
                    strokeWidth={n > 80 ? "0.5" : "1"}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredSlice(slice)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  />
                );
              }

              // Rectangle slices (Left, Right, Midpoint, Darboux)
              const yTop = mapY(slice.height);
              const heightPx = Math.abs(yZero - yTop);
              const topY = slice.height >= 0 ? yTop : yZero;

              return (
                <rect
                  key={`slice-rect-${slice.index}`}
                  x={x1}
                  y={topY}
                  width={width}
                  height={Math.max(1, heightPx)}
                  fill={isHovered ? "url(#hoverSliceGrad)" : "url(#sliceGrad)"}
                  stroke={isHovered ? "#fbbf24" : "#818cf8"}
                  strokeWidth={n > 80 ? "0.5" : "1"}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredSlice(slice)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              );
            })}

            {/* Sample Point Nodes */}
            {showSamplePoints && n <= 50 && (
              <g>
                {approxResult.slices.map((slice) => {
                  const sx = mapX(slice.xSample);
                  const sy = mapY(slice.height);
                  return (
                    <circle
                      key={`sample-pt-${slice.index}`}
                      cx={sx}
                      cy={sy}
                      r="3.5"
                      fill="#38bdf8"
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                  );
                })}
              </g>
            )}

            {/* Function Curve f(x) */}
            <path
              d={curvePath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Range Boundary Markers for a and b */}
            <line
              x1={mapX(a)}
              y1={padding.top}
              x2={mapX(a)}
              y2={padding.top + plotHeight}
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="4,4"
            />
            <line
              x1={mapX(b)}
              y1={padding.top}
              x2={mapX(b)}
              y2={padding.top + plotHeight}
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="4,4"
            />
            <text
              x={mapX(a)}
              y={padding.top + 15}
              fill="#38bdf8"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
            >
              x = a ({a})
            </text>
            <text
              x={mapX(b)}
              y={padding.top + 15}
              fill="#38bdf8"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
            >
              x = b ({b})
            </text>
          </svg>

          {/* Hovered Slice Float Inspector Tag */}
          {hoveredSlice && (
            <div
              className="absolute top-3 right-3 bg-slate-800/90 backdrop-blur-md p-3 rounded-lg border border-slate-700 text-xs text-white shadow-lg pointer-events-none"
              style={{ minWidth: "210px" }}
            >
              <div className="flex items-center justify-between font-bold text-amber-400 mb-1">
                <span>切片 #{hoveredSlice.index + 1} / {n}</span>
                <span className="font-mono">Δx = {hoveredSlice.width.toFixed(4)}</span>
              </div>
              <div className="space-y-0.5 text-[11px] text-slate-300 font-mono">
                <div>区间: [{hoveredSlice.xLeft.toFixed(3)}, {hoveredSlice.xRight.toFixed(3)}]</div>
                <div>采样点 ξ: {hoveredSlice.xSample.toFixed(4)}</div>
                <div>切片高度 f(ξ): {hoveredSlice.height.toFixed(4)}</div>
                <div className="pt-1 mt-1 border-t border-slate-700 text-amber-300 font-bold">
                  切片面积 ΔA = {hoveredSlice.area.toFixed(5)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Real-time Calculation Statistics Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">黎曼求和 S_n</span>
            <div className="mt-1 text-lg font-mono font-bold text-blue-700">
              {approxResult.value.toFixed(6)}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              计算用时 {approxResult.computationTimeMs.toFixed(2)} ms
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">解析精确值 I</span>
            <div className="mt-1 text-lg font-mono font-bold text-emerald-600">
              {approxResult.exactValue.toFixed(6)}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">牛顿-莱布尼茨真实解</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">绝对误差 |S_n - I|</span>
            <div className="mt-1 text-lg font-mono font-bold text-rose-600">
              {approxResult.absError < 1e-6
                ? approxResult.absError.toExponential(4)
                : approxResult.absError.toFixed(6)}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              逼近残差量
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">相对误差百分比</span>
            <div className="mt-1 text-lg font-mono font-bold text-amber-600">
              {approxResult.relError.toFixed(4)} %
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {approxResult.relError < 0.1 ? "极高精度达成" : "继续细分可减小"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
