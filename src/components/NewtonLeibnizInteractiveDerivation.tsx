import React, { useState, useMemo } from "react";
import { MathFormula, MathText } from "./MathFormula";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Maximize2,
  TrendingUp,
} from "lucide-react";

export interface DerivationStep {
  stepNumber: number;
  title: string;
  shortLabel: string;
  mathStatement: string;
  explanation: string;
  geometricIntuition: string;
  keyTheorem: string;
  visualState: {
    showBaseArea: boolean; // Show area [a, x]
    showDeltaSlice: boolean; // Show slice [x, x+dx]
    showMeanValueRect: boolean; // Show height f(xi) rect
    showLimitArrow: boolean; // Show derivative restoration
    showFullIntegral: boolean; // Show [a, b]
    activeXi: boolean; // Mark point xi
    xPos: number; // relative pos
    dxPos: number; // relative width
  };
}

const STEPS: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "第一步：构造变上限累积函数 Φ(x)",
    shortLabel: "1. 构造变上限函数",
    mathStatement: "\\Phi(x) = \\int_a^x f(t) \\, dt \\quad (x \\in [a, b])",
    explanation:
      "固定区间下限 $a$，将积分上限设为自变量 $x$。$\\Phi(x)$ 描述了随着上界 $x$ 向右推进，曲边图形所围成的累积面积的变化规律。",
    geometricIntuition:
      "从起点 $a$ 到当前考察点 $x$ 的下方深蓝色填充区域，即为累积面积函数 $\\Phi(x)$ 的当前几何量值。",
    keyTheorem: "微积分基础定义：定积分作为累积面积的函数",
    visualState: {
      showBaseArea: true,
      showDeltaSlice: false,
      showMeanValueRect: false,
      showLimitArrow: false,
      showFullIntegral: false,
      activeXi: false,
      xPos: 0.45,
      dxPos: 0.18,
    },
  },
  {
    stepNumber: 2,
    title: "第二步：赋予微小增量 Δx，考察面积差 ΔΦ",
    shortLabel: "2. 微元面积切片",
    mathStatement: "\\Delta\\Phi = \\Phi(x + \\Delta x) - \\Phi(x) = \\int_x^{x+\\Delta x} f(t) \\, dt",
    explanation:
      "给自变量 $x$ 一个增量 $\\Delta x$，累积函数产生增量 $\\Delta\\Phi$。根据定积分对区间的可加性，$\\Delta\\Phi$ 正好是在微区间 $[x, x + \\Delta x]$ 上所截取的垂直曲边梯形切片。",
    geometricIntuition:
      "高亮琥珀色垂直切片表示因 $x$ 移动 $\\Delta x$ 而新增的局部微元面积，正是连接微分与积分的微元核心！",
    keyTheorem: "定积分的区间可加性：$\\int_a^{x+\\Delta x} f(t) \\, dt = \\int_a^x f(t) \\, dt + \\int_x^{x+\\Delta x} f(t) \\, dt$",
    visualState: {
      showBaseArea: true,
      showDeltaSlice: true,
      showMeanValueRect: false,
      showLimitArrow: false,
      showFullIntegral: false,
      activeXi: false,
      xPos: 0.45,
      dxPos: 0.18,
    },
  },
  {
    stepNumber: 3,
    title: "第三步：应用积分第一中值定理，以直代曲",
    shortLabel: "3. 积分中值定理",
    mathStatement: "\\exists \\xi \\in [x, x + \\Delta x], \\quad \\int_x^{x+\\Delta x} f(t) \\, dt = f(\\xi) \\Delta x",
    explanation:
      "因为被积函数 $f(t)$ 在闭区间上连续，由积分第一中值定理，曲边窄条切片面积 $\\Delta\\Phi$ 可以严格等价转化为一个宽度为 $\\Delta x$、高度为 $f(\\xi)$ 的标准矩形面积！",
    geometricIntuition:
      "图中虚线标注的等效矩形：顶部的弯曲边缘被一条水平基准线 $f(\\xi)$ 精确替代，多余与不足的微小三角区面积完美相互抵消。",
    keyTheorem: "连续函数的积分第一中值定理：$\\int_a^b f(x) \\, dx = f(\\xi)(b-a)$",
    visualState: {
      showBaseArea: true,
      showDeltaSlice: true,
      showMeanValueRect: true,
      showLimitArrow: false,
      showFullIntegral: false,
      activeXi: true,
      xPos: 0.45,
      dxPos: 0.18,
    },
  },
  {
    stepNumber: 4,
    title: "第四步：构造差商并求极限，完成导数恢复 (FTC 1)",
    shortLabel: "4. 差商求极限 (FTC 1)",
    mathStatement: "\\Phi'(x) = \\lim_{\\Delta x \\to 0} \\frac{\\Delta\\Phi}{\\Delta x} = \\lim_{\\Delta x \\to 0} f(\\xi) = f(x)",
    explanation:
      "两端同除以 $\\Delta x$ 得到平均变化率 $\\frac{\\Delta\\Phi}{\\Delta x} = f(\\xi)$。当 $\\Delta x \\to 0$ 时，介点 $\\xi$ 被夹逼迫使趋近于 $x$（$x \\le \\xi \\le x+\\Delta x$），由 $f(t)$ 的连续性得 $\\lim_{\\Delta x \\to 0} f(\\xi) = f(x)$。",
    geometricIntuition:
      "当切片宽度 $\\Delta x$ 缩减为零时，矩形收缩为一条垂线，其高度恰好就是该处的瞬时曲线高度 $f(x)$！这证明了变上限积分的导数就是被积函数本身。",
    keyTheorem: "夹逼定理与连续函数复合极限性质：$\\frac{d}{dx}\\left[\\int_a^x f(t) \\, dt\\right] = f(x)$",
    visualState: {
      showBaseArea: true,
      showDeltaSlice: true,
      showMeanValueRect: true,
      showLimitArrow: true,
      showFullIntegral: false,
      activeXi: true,
      xPos: 0.45,
      dxPos: 0.04,
    },
  },
  {
    stepNumber: 5,
    title: "第五步：建立与任意已知原函数 F(x) 的常数联系",
    shortLabel: "5. 原函数常数偏移",
    mathStatement: "\\Phi'(x) = f(x) = F'(x) \\implies \\Phi(x) = F(x) + C \\quad (C \\text{ 为常数})",
    explanation:
      "设 $F(x)$ 为被积函数 $f(x)$ 的任意一个已知原函数（即 $F'(x) = f(x)$）。因为导数相同的两个函数必然仅相差一个常数 $C$，故 $\\Phi(x)$ 与 $F(x)$ 之间满足刚性平移关系。",
    geometricIntuition:
      "累积面积函数 $\\Phi(x)$ 的几何曲线形态与任意原函数 $F(x)$ 完全平行，两者在纵轴上仅有固定高度 $C$ 的常数偏移。",
    keyTheorem: "拉格朗日中值定理的重要推论：导数恒相等的函数必差一常数",
    visualState: {
      showBaseArea: true,
      showDeltaSlice: false,
      showMeanValueRect: false,
      showLimitArrow: false,
      showFullIntegral: true,
      activeXi: false,
      xPos: 0.7,
      dxPos: 0.05,
    },
  },
  {
    stepNumber: 6,
    title: "第六步：代入区间端点确定常数 C，导出最终公式 (FTC 2)",
    shortLabel: "6. 端点代入导出公式",
    mathStatement: "\\int_a^b f(x) \\, dx = \\Phi(b) - \\Phi(a) = [F(b) + C] - [F(a) + C] = F(b) - F(a) = \\left. F(x) \\right|_a^b",
    explanation:
      "代入下限 $x = a$：$\\Phi(a) = \\int_a^a f(t)\\,dt = 0 \\implies 0 = F(a) + C \\implies C = -F(a)$。再代入上限 $x = b$：$\\Phi(b) = \\int_a^b f(t)\\,dt = F(b) + C = F(b) - F(a)$。牛顿-莱布尼茨公式严格获证！",
    geometricIntuition:
      "从 $a$ 到 $b$ 的全域总曲边梯形面积，恰好等于原函数在右端点的量值 $F(b)$ 减去在左端点的量值 $F(a)$！化整为零，再聚零为整。",
    keyTheorem: "牛顿-莱布尼茨公式：$\\int_a^b f(x) \\, dx = F(b) - F(a) = \\left. F(x) \\right|_a^b$",
    visualState: {
      showBaseArea: true,
      showDeltaSlice: false,
      showMeanValueRect: false,
      showLimitArrow: false,
      showFullIntegral: true,
      activeXi: false,
      xPos: 1.0,
      dxPos: 0.0,
    },
  },
];

export const NewtonLeibnizInteractiveDerivation: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const step = STEPS[currentStepIndex];

  // Auto-play timer
  React.useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= STEPS.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  // SVG Geometry Calculation (Continuous smooth curve f(t) = 0.4 + 0.3*sin(1.8*t) + 0.5*t^1.2)
  const svgWidth = 560;
  const svgHeight = 240;
  const margin = { top: 25, right: 30, bottom: 40, left: 45 };

  const plotW = svgWidth - margin.left - margin.right;
  const plotH = svgHeight - margin.top - margin.bottom;

  // Domain [0, 4]
  const aVal = 0.5;
  const bVal = 3.5;

  // Target curve function
  const f = (t: number) => {
    return 0.35 + 0.25 * Math.sin(1.6 * t - 0.5) + 0.12 * t * t;
  };

  // Coordinates mapping
  const scaleX = (x: number) => margin.left + ((x - 0) / 4) * plotW;
  const scaleY = (y: number) => margin.top + plotH - ((y - 0) / 2.2) * plotH;

  // Current parameters based on step
  const currentX = useMemo(() => {
    if (step.visualState.xPos >= 1.0) return bVal;
    return aVal + step.visualState.xPos * (bVal - aVal);
  }, [step]);

  const currentDx = useMemo(() => {
    return step.visualState.dxPos * (bVal - aVal);
  }, [step]);

  const currentXPlusDx = Math.min(bVal, currentX + currentDx);
  const currentXi = currentX + 0.55 * currentDx;
  const fXi = f(currentXi);

  // Generate curve path
  const curvePath = useMemo(() => {
    let d = "";
    const samples = 100;
    for (let i = 0; i <= samples; i++) {
      const t = (i / samples) * 4;
      const sx = scaleX(t);
      const sy = scaleY(f(t));
      if (i === 0) d += `M ${sx} ${sy}`;
      else d += ` L ${sx} ${sy}`;
    }
    return d;
  }, []);

  // Area [a, x] path
  const areaPhiPath = useMemo(() => {
    if (!step.visualState.showBaseArea) return "";
    let d = `M ${scaleX(aVal)} ${scaleY(0)}`;
    const samples = 40;
    for (let i = 0; i <= samples; i++) {
      const t = aVal + (i / samples) * (currentX - aVal);
      d += ` L ${scaleX(t)} ${scaleY(f(t))}`;
    }
    d += ` L ${scaleX(currentX)} ${scaleY(0)} Z`;
    return d;
  }, [currentX, step.visualState.showBaseArea]);

  // Delta Slice [x, x+dx] path
  const areaDeltaPath = useMemo(() => {
    if (!step.visualState.showDeltaSlice || currentDx <= 0.001) return "";
    let d = `M ${scaleX(currentX)} ${scaleY(0)}`;
    const samples = 20;
    for (let i = 0; i <= samples; i++) {
      const t = currentX + (i / samples) * (currentXPlusDx - currentX);
      d += ` L ${scaleX(t)} ${scaleY(f(t))}`;
    }
    d += ` L ${scaleX(currentXPlusDx)} ${scaleY(0)} Z`;
    return d;
  }, [currentX, currentXPlusDx, currentDx, step.visualState.showDeltaSlice]);

  return (
    <div
      id="newton-leibniz-derivation-container"
      className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
    >
      {/* Header Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>核心推导 · 几何与代数交互可视化</span>
          </div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            牛顿-莱布尼茨公式严格分步推导
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
              FTC 1 & FTC 2
            </span>
          </h3>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          <button
            id="btn-nl-prev"
            disabled={currentStepIndex === 0}
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex((p) => Math.max(0, p - 1));
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors cursor-pointer"
            title="上一步"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            id="btn-nl-play"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
              isPlaying
                ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                : "bg-indigo-600 text-white hover:bg-indigo-500"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>暂停演示</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>自动演播</span>
              </>
            )}
          </button>

          <button
            id="btn-nl-next"
            disabled={currentStepIndex === STEPS.length - 1}
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex((p) => Math.min(STEPS.length - 1, p + 1));
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors cursor-pointer"
            title="下一步"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            id="btn-nl-reset"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(0);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer ml-1"
            title="重置至第一步"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Step Indicators Ribbon */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-5 py-2.5 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {STEPS.map((s, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;
            return (
              <button
                key={s.stepNumber}
                id={`btn-step-tab-${s.stepNumber}`}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIndex(idx);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs scale-102 font-bold"
                    : isCompleted
                    ? "bg-white text-indigo-900 hover:bg-indigo-50/80 border border-indigo-200/80"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono ${
                    isActive
                      ? "bg-white text-indigo-700 font-bold"
                      : isCompleted
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {s.stepNumber}
                </span>
                <span>{s.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Dual Layout */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Mathematical Formalism & Detailed Reasoning (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-xs font-bold font-mono">
                STEP {step.stepNumber} / {STEPS.length}
              </span>
              <h4 className="text-base font-bold text-slate-900">{step.title}</h4>
            </div>
            <div className="text-xs text-slate-600 leading-relaxed">
              <MathText text={step.explanation} />
            </div>
          </div>

          {/* Latex Display Box */}
          <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 shadow-inner flex items-center justify-center overflow-x-auto">
            <MathFormula formula={step.mathStatement} block className="text-sm font-semibold" />
          </div>

          {/* Geometric Interpretation Callout */}
          <div className="p-3.5 bg-gradient-to-r from-amber-50/80 to-amber-100/40 rounded-xl border border-amber-200/80 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>几何对应与以直代曲直观：</span>
            </div>
            <div className="text-slate-700 leading-relaxed">
              <MathText text={step.geometricIntuition} />
            </div>
          </div>

          {/* Underlying Theorem & Axiom */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block">【底层数学支撑定理】</span>
            <div className="text-slate-800 font-medium">
              <MathText text={step.keyTheorem} />
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic SVG Geometric Function Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-950 rounded-2xl p-4 border border-slate-800 shadow-inner text-slate-100 flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-indigo-300">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              动态几何拓扑平面 y = f(t)
            </span>
            <span className="text-[10px] text-slate-500">步长 Δx 动态逼近</span>
          </div>

          {/* SVG Canvas */}
          <div className="w-full relative flex items-center justify-center py-2">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto max-h-[260px] select-none"
            >
              <defs>
                {/* Gradient for base cumulative area Phi(x) */}
                <linearGradient id="nl-phi-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.1" />
                </linearGradient>
                {/* Gradient for slice Delta Phi */}
                <linearGradient id="nl-delta-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#b45309" stopOpacity="0.25" />
                </linearGradient>
                {/* Hatch pattern for Mean value rectangle */}
                <pattern
                  id="hatch-rect"
                  width="6"
                  height="6"
                  patternTransform="rotate(45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <line x1="0" y1="0" x2="0" y2="6" stroke="#fbbf24" strokeWidth="1.2" opacity="0.6" />
                </pattern>
              </defs>

              {/* Grid lines */}
              <line
                x1={margin.left}
                y1={scaleY(0)}
                x2={svgWidth - margin.right}
                y2={scaleY(0)}
                stroke="#475569"
                strokeWidth="1.5"
              />
              <line
                x1={margin.left}
                y1={margin.top}
                x2={margin.left}
                y2={scaleY(0)}
                stroke="#475569"
                strokeWidth="1.5"
              />

              {/* Base Cumulative Area Phi(x) Shading */}
              {step.visualState.showBaseArea && (
                <path d={areaPhiPath} fill="url(#nl-phi-grad)" />
              )}

              {/* Delta Slice Shading */}
              {step.visualState.showDeltaSlice && (
                <path d={areaDeltaPath} fill="url(#nl-delta-grad)" />
              )}

              {/* Mean Value Equivalent Rectangle f(xi) * dx */}
              {step.visualState.showMeanValueRect && currentDx > 0.01 && (
                <g>
                  {/* Rectangle fill */}
                  <rect
                    x={scaleX(currentX)}
                    y={scaleY(fXi)}
                    width={scaleX(currentXPlusDx) - scaleX(currentX)}
                    height={scaleY(0) - scaleY(fXi)}
                    fill="url(#hatch-rect)"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  {/* Horizontal mean line f(xi) */}
                  <line
                    x1={scaleX(currentX) - 10}
                    y1={scaleY(fXi)}
                    x2={scaleX(currentXPlusDx) + 10}
                    y2={scaleY(fXi)}
                    stroke="#f59e0b"
                    strokeWidth="2"
                  />
                  {/* Text for f(xi) */}
                  <text
                    x={scaleX(currentXi)}
                    y={scaleY(fXi) - 6}
                    fill="#fde68a"
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    f(ξ)
                  </text>
                </g>
              )}

              {/* Curve f(t) */}
              <path d={curvePath} fill="none" stroke="#60a5fa" strokeWidth="2.5" />

              {/* Points & Vertical Droplines */}
              {/* x = a */}
              <line
                x1={scaleX(aVal)}
                y1={scaleY(0)}
                x2={scaleX(aVal)}
                y2={scaleY(f(aVal))}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <text
                x={scaleX(aVal)}
                y={scaleY(0) + 16}
                fill="#94a3b8"
                fontSize="11"
                textAnchor="middle"
                fontWeight="bold"
              >
                a
              </text>

              {/* x = b */}
              <line
                x1={scaleX(bVal)}
                y1={scaleY(0)}
                x2={scaleX(bVal)}
                y2={scaleY(f(bVal))}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <text
                x={scaleX(bVal)}
                y={scaleY(0) + 16}
                fill="#94a3b8"
                fontSize="11"
                textAnchor="middle"
                fontWeight="bold"
              >
                b
              </text>

              {/* Current x */}
              <line
                x1={scaleX(currentX)}
                y1={scaleY(0)}
                x2={scaleX(currentX)}
                y2={scaleY(f(currentX))}
                stroke="#60a5fa"
                strokeWidth="1.8"
              />
              <circle
                cx={scaleX(currentX)}
                cy={scaleY(f(currentX))}
                r="3.5"
                fill="#38bdf8"
              />
              <text
                x={scaleX(currentX)}
                y={scaleY(0) + 16}
                fill="#38bdf8"
                fontSize="11"
                textAnchor="middle"
                fontWeight="bold"
              >
                x
              </text>

              {/* Current x + dx */}
              {step.visualState.showDeltaSlice && currentDx > 0.02 && (
                <g>
                  <line
                    x1={scaleX(currentXPlusDx)}
                    y1={scaleY(0)}
                    x2={scaleX(currentXPlusDx)}
                    y2={scaleY(f(currentXPlusDx))}
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={scaleX(currentXPlusDx)}
                    y={scaleY(0) + 16}
                    fill="#f59e0b"
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    x+Δx
                  </text>
                </g>
              )}

              {/* Point xi on curve */}
              {step.visualState.activeXi && currentDx > 0.02 && (
                <g>
                  <circle
                    cx={scaleX(currentXi)}
                    cy={scaleY(f(currentXi))}
                    r="4"
                    fill="#f59e0b"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={scaleX(currentXi)}
                    y1={scaleY(0)}
                    x2={scaleX(currentXi)}
                    y2={scaleY(f(currentXi))}
                    stroke="#f59e0b"
                    strokeWidth="1"
                    strokeDasharray="1 2"
                  />
                  <text
                    x={scaleX(currentXi)}
                    y={scaleY(0) + 26}
                    fill="#fde68a"
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    ξ
                  </text>
                </g>
              )}

              {/* Limit Derivative Arrow for Step 4 */}
              {step.visualState.showLimitArrow && (
                <g>
                  <path
                    d={`M ${scaleX(currentX) + 18} ${scaleY(f(currentX)) - 10} L ${scaleX(currentX) + 3} ${scaleY(f(currentX))}`}
                    stroke="#10b981"
                    strokeWidth="2"
                    markerEnd="url(#arrow-green)"
                  />
                  <text
                    x={scaleX(currentX) + 30}
                    y={scaleY(f(currentX)) - 15}
                    fill="#34d399"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    Φ&apos;(x) = f(x)
                  </text>
                </g>
              )}

              {/* Legend inside SVG */}
              <text x={svgWidth - margin.right - 10} y={margin.top + 10} fill="#60a5fa" fontSize="11" textAnchor="end" fontWeight="bold">
                y = f(t)
              </text>
              <text x={margin.left + 8} y={scaleY(0) - 8} fill="#93c5fd" fontSize="10" fontWeight="bold">
                Φ(x) = ∫_a^x f(t)dt
              </text>
            </svg>
          </div>

          {/* Visual Legend Tags */}
          <div className="w-full pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-blue-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500/50 border border-blue-400"></span>
              <span>累积区域 Φ(x)</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/60 border border-amber-400"></span>
              <span>切片增量 ΔΦ</span>
            </div>
            <div className="flex items-center gap-1.5 text-yellow-300">
              <span className="w-2.5 h-2.5 border border-yellow-400 border-dashed"></span>
              <span>中值矩形 f(ξ)Δx</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>导数恢复 Φ&apos;(x)=f(x)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
