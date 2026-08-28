import React, { useState } from "react";
import { MathFormula, MathText } from "./MathFormula";
import {
  Layers,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  BookMarked,
  Scale,
} from "lucide-react";

export const ModelingFoundation: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [deltaX, setDeltaX] = useState<number>(0.5);
  const [showFTCProof, setShowFTCProof] = useState<boolean>(true);

  const modelingStages = [
    {
      title: "1. 划分与分割 (Partition)",
      icon: "①",
      badge: "网格剖分",
      formula: "a = x_0 < x_1 < x_2 < \\dots < x_n = b, \\quad \\Delta x_i = x_i - x_{i-1}",
      desc: "在闭区间 $[a,b]$ 上任意插入 $n-1$ 个分点，将区间划分为 $n$ 个小区间 $[x_{i-1}, x_i]$。记小区间长度的最大值为模长 $\\lambda = \\max_{1 \\le i \\le n} \\Delta x_i$。",
      concept: "以直代曲的基础准备：将复杂大问题离散化为微小均匀或非均匀切片。",
    },
    {
      title: "2. 局部近似 (Local Approximation)",
      icon: "②",
      badge: "以常代变",
      formula: "\\xi_i \\in [x_{i-1}, x_i], \\quad \\Delta A_i \\approx f(\\xi_i) \\Delta x_i",
      desc: "在每个小区间 $[x_{i-1}, x_i]$ 内任取一点 $\\xi_i$（如左端点、中点、右端点或达布界点），以窄矩形面积 $f(\\xi_i) \\Delta x_i$ 近似代替该区间上的曲边梯形真实面积。",
      concept: "微分思维核心：局部极小范围内，连续曲线的高度变化可近似视为常数。",
    },
    {
      title: "3. 黎曼累加求和 (Riemann Summation)",
      icon: "③",
      badge: "离散总和",
      formula: "S_n = \\sum_{i=1}^n f(\\xi_i) \\Delta x_i = f(\\xi_1)\\Delta x_1 + f(\\xi_2)\\Delta x_2 + \\dots + f(\\xi_n)\\Delta x_n",
      desc: "将这 $n$ 个窄矩形面积全部相加，得到整个曲边梯形面积的离散黎曼和近似值 $S_n$。",
      concept: "积零成整：利用代数求和汇总所有局部切片贡献。",
    },
    {
      title: "4. 无限细分取极限 (Infinitesimal Limit)",
      icon: "④",
      badge: "积分确立",
      formula: "\\int_a^b f(x) \\, dx = \\lim_{\\lambda \\to 0} \\sum_{i=1}^n f(\\xi_i) \\Delta x_i = \\lim_{n \\to \\infty} \\sum_{i=1}^n f(x_i^*) \\Delta x",
      desc: "当分割无限细密（即模长 $\\lambda \\to 0$ 且 $n \\to \\infty$）时，若该极限存在且与区间的划分方式及 $\\xi_i$ 的选取无关，则称 $f(x)$ 在 $[a,b]$ 上黎曼可积，该极限值称为定积分。",
      concept: "质的飞跃：通过无穷极限过程，将近似的离散矩形和转化为精确的几何与物理总量。",
    },
  ];

  // FTC Step-by-step derivation data
  const ftcSteps = [
    {
      title: "定义变上限积分函数",
      formula: "\\Phi(x) = \\int_a^x f(t) \\, dt \\quad (x \\in [a, b])",
      annotation: "$\\Phi(x)$ 几何上表示从起始点 $a$ 到动态上界 $x$ 的曲边梯形累积面积。",
    },
    {
      title: "构建导数增量比（差商）",
      formula: "\\frac{\\Delta \\Phi}{\\Delta x} = \\frac{\\Phi(x + \\Delta x) - \\Phi(x)}{\\Delta x} = \\frac{1}{\\Delta x} \\left[ \\int_a^{x+\\Delta x} f(t) \\, dt - \\int_a^x f(t) \\, dt \\right]",
      annotation: "利用定积分对区间的可加性：$\\int_a^{x+\\Delta x} f(t)\\,dt = \\int_a^x f(t)\\,dt + \\int_x^{x+\\Delta x} f(t)\\,dt$，简化分子为小条带积分。",
    },
    {
      title: "应用积分中值定理",
      formula: "\\frac{\\Delta \\Phi}{\\Delta x} = \\frac{1}{\\Delta x} \\int_x^{x+\\Delta x} f(t) \\, dt = \\frac{1}{\\Delta x} \\cdot \\left[ f(\\xi) \\cdot \\Delta x \\right] = f(\\xi)",
      annotation: "其中 $\\xi$ 介于 $x$ 与 $x + \\Delta x$ 之间。注意分母中的 $\\Delta x$ 与几何条带宽度完全对消！",
    },
    {
      title: "令增量趋于零并取极限（FTC 第一基本定理）",
      formula: "\\Phi'(x) = \\lim_{\\Delta x \\to 0} \\frac{\\Delta \\Phi}{\\Delta x} = \\lim_{\\Delta x \\to 0} f(\\xi) = f(x) \\quad (\\because f \\text{ 连续}, \\xi \\to x)",
      annotation: "【核心结论】：变上限积分函数 $\\Phi(x)$ 的导数恰好等于被积函数本身 $f(x)$，证明了连续函数必有原函数！",
    },
    {
      title: "导出牛顿-莱布尼茨公式（FTC 第二基本定理）",
      formula: "\\int_a^b f(x) \\, dx = \\Phi(b) - \\Phi(a) = F(b) - F(a) = \\left. F(x) \\right|_a^b",
      annotation: "设 $F(x)$ 为 $f(x)$ 的任意原函数，则 $\\Phi(x) = F(x) + C$。由于 $\\Phi(a)=0$，得 $C=-F(a)$，故 $\\Phi(b)=F(b)-F(a)$。",
    },
  ];

  return (
    <div id="modeling-foundation-section" className="space-y-6">
      {/* Overview Hero Card */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700 mb-3">
            <BookMarked className="w-3.5 h-3.5" />
            <span>模块 1 · 定积分与微积分基本定理精细化建模</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-sans">
            从黎曼切片分割到微积分第一、第二基本定理
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-3xl leading-relaxed">
            微积分学两座最壮丽的丰碑：一是以黎曼和为代表的“以直代曲、无限累加”宏观积分思想；二是牛顿与莱布尼茨所揭示的“微分与积分互为逆运算”的内在本质联系。
          </p>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">定积分形式化定义 (Riemann Integral)</span>
              <div className="mt-2 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <MathFormula formula="\int_a^b f(x) \, dx = \lim_{\|\lambda\| \to 0} \sum_{i=1}^n f(\xi_i) \Delta x_i" block />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">牛顿-莱布尼茨公式 (Fundamental Theorem of Calculus)</span>
              <div className="mt-2 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <MathFormula formula="\int_a^b f(x) \, dx = F(b) - F(a) = \left. F(x) \right|_a^b" block />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Stage Modeling Methodology Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>定积分四步建模法（分割 · 近似 · 求和 · 取极限）</span>
          </h3>
          <span className="text-xs text-slate-500">点击阶段查看深度数理内涵</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modelingStages.map((stage, idx) => {
            const isCurrent = activeStep === idx;
            return (
              <div
                key={idx}
                id={`modeling-stage-card-${idx}`}
                onClick={() => setActiveStep(idx)}
                className={`p-5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isCurrent
                    ? "bg-blue-50/60 border-blue-400 shadow-sm ring-1 ring-blue-300"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center font-mono">
                      {stage.icon}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                      {stage.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">{stage.title}</h4>
                  <div className="p-2 rounded-lg bg-white border border-slate-200 mb-3 shadow-2xs">
                    <MathFormula formula={stage.formula} className="text-xs text-blue-950" block />
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    <MathText text={stage.desc} />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 italic">
                  💡 {stage.concept}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Newton-Leibniz and Variable Upper Limit Interactive Derivation */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" />
              <span>微积分基本定理 (FTC) 严格代数推导链</span>
            </h3>
            <div className="text-xs text-slate-500 mt-0.5">
              <MathText text="变上限积分 $\Phi(x) = \int_a^x f(t) \, dt$ 与导数关系 $\Phi'(x) = f(x)$ 的严格数理证明" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFTCProof(!showFTCProof)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
            >
              {showFTCProof ? "收起推导" : "展开推导步骤"}
            </button>
          </div>
        </div>

        {showFTCProof && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {ftcSteps.map((step, idx) => (
                <div
                  key={idx}
                  id={`ftc-step-${idx}`}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 mb-1">{step.title}</h4>
                      <div className="text-xs text-slate-600">
                        <MathText text={step.annotation} />
                      </div>
                    </div>
                  </div>
                  <div className="min-w-[280px] p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs text-center">
                    <MathFormula formula={step.formula} className="text-xs font-serif" block />
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Strip Visualizer for deltaX -> 0 */}
            <div className="mt-4 p-5 rounded-xl bg-blue-50/50 border border-blue-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>微元条带极限演示：当条带宽度 <MathFormula formula="\Delta x \to 0" /> 时面积增量比</span>
                  </h4>
                  <p className="text-xs text-slate-600">
                    拖动滑块观察差商 <MathFormula formula="\frac{\Delta \Phi}{\Delta x} = \frac{\text{条带面积}}{\Delta x}" /> 逼近瞬时高度 <MathFormula formula="f(x)" />
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500">增量宽度 <MathFormula formula="\Delta x" />:</span>
                  <input
                    id="slider-delta-x"
                    type="range"
                    min="0.01"
                    max="1.0"
                    step="0.01"
                    value={deltaX}
                    onChange={(e) => setDeltaX(parseFloat(e.target.value))}
                    className="w-32 accent-blue-600 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-blue-700 min-w-[3rem]">
                    {deltaX.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500">条带微元面积 <MathFormula formula="\Delta \Phi" /></span>
                  <p className="text-sm font-mono font-bold text-slate-800 mt-1">
                    ≈ {(deltaX * (1 + 0.5 * deltaX * deltaX)).toFixed(4)}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500">差商比值 <MathFormula formula="\frac{\Delta \Phi}{\Delta x}" /></span>
                  <p className="text-sm font-mono font-bold text-blue-600 mt-1">
                    = {(1 + 0.5 * deltaX * deltaX).toFixed(4)}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500">极限理论值 <MathFormula formula="f(x) \ (x=1)" /></span>
                  <p className="text-sm font-mono font-bold text-emerald-600 mt-1">
                    = 1.0000 (精确吻合)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

