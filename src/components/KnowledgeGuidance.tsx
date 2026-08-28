import React, { useState } from "react";
import { MathFormula, MathText } from "./MathFormula";
import { NewtonLeibnizInteractiveDerivation } from "./NewtonLeibnizInteractiveDerivation";
import {
  Compass,
  BookOpen,
  Sparkles,
  GitMerge,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Scale,
  Zap,
  Layers,
  FileCheck,
  TrendingUp,
} from "lucide-react";

export type KnowledgeTab =
  | "intuition"
  | "nl_derivation"
  | "darboux"
  | "theorems"
  | "mean_value"
  | "techniques"
  | "improper"
  | "counterexamples";

export const KnowledgeGuidance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<KnowledgeTab>("intuition");

  return (
    <div id="knowledge-guidance-section" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold mb-1 border border-blue-100">
              <Compass className="w-3.5 h-3.5" />
              <span>模块 8 · 微积分基本定理与黎曼积分知识导引 (Knowledge Guidance)</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              数学思想 Intuition、核心定理、积分技巧体系与瑕积分诊断图谱
            </h2>
          </div>
        </div>

        {/* Tab Switcher: 8 Curated Core Modules */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            id="tab-know-intuition"
            onClick={() => setActiveTab("intuition")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "intuition"
                ? "bg-blue-600 text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
            }`}
          >
            💡 几何与代数 Intuition (以直代曲)
          </button>
          <button
            id="tab-know-nl-derivation"
            onClick={() => setActiveTab("nl_derivation")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "nl_derivation"
                ? "bg-indigo-600 text-white shadow-xs font-bold ring-2 ring-indigo-300"
                : "bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200/80 font-bold"
            }`}
          >
            🔬 牛顿-莱布尼茨公式几何分步推导
          </button>
          <button
            id="tab-know-darboux"
            onClick={() => setActiveTab("darboux")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "darboux"
                ? "bg-blue-600 text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
            }`}
          >
            📐 达布大和与小和 (Darboux Sums)
          </button>
          <button
            id="tab-know-theorems"
            onClick={() => setActiveTab("theorems")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "theorems"
                ? "bg-blue-600 text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
            }`}
          >
            📜 黎曼可积三大充分条件
          </button>
          <button
            id="tab-know-mean-value"
            onClick={() => setActiveTab("mean_value")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "mean_value"
                ? "bg-blue-600 text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
            }`}
          >
            ⚖️ 积分中值定理与广义加权
          </button>
          <button
            id="tab-know-techniques"
            onClick={() => setActiveTab("techniques")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "techniques"
                ? "bg-blue-600 text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
            }`}
          >
            🎯 积分计算技巧
          </button>
          <button
            id="tab-know-improper"
            onClick={() => setActiveTab("improper")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "improper"
                ? "bg-blue-600 text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
            }`}
          >
            ⚡ 反常与瑕积分敛散性诊断
          </button>
          <button
            id="tab-know-counterexamples"
            onClick={() => setActiveTab("counterexamples")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "counterexamples"
                ? "bg-blue-600 text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
            }`}
          >
            ⚠️ 经典病态反例 (狄利克雷/黎曼函数)
          </button>
        </div>
      </div>

      {/* 1. 几何与代数 Intuition (以直代曲) */}
      {activeTab === "intuition" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Lightbulb className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">以直代曲：微分与积分的哲学互逆</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                微分学关注“局部线性化”——将弯曲的曲线放大到极致，局部看起来就像一条笔直的切线；
                <br /><br />
                积分学关注“全局累积和”——将弯曲的曲边图形切片成无数细直的小矩形条，通过代数求和汇总全局。
              </p>
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100">
                <h4 className="text-xs font-bold text-blue-900 mb-1">互逆性的物理隐喻：</h4>
                <div className="text-xs text-blue-800 leading-relaxed">
                  <MathText text="“微分是求瞬时变化的速率（例如速度 $v(t) = \frac{ds}{dt}$），积分是从瞬时变化率恢复全局总量（例如位移 $s(t) = \int_{t_0}^t v(\tau) \, d\tau$）。”" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Scale className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">微积分基本定理的双重角色</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-blue-700 block mb-0.5">FTC 1: 变上限积分求导定理</span>
                  <MathFormula formula="\frac{d}{dx} \left[ \int_a^x f(t) \, dt \right] = f(x)" block />
                  <p className="text-[11px] text-slate-500 mt-1">
                    【理论意义】：宣告了任何闭区间连续函数必然拥有原函数，搭建了从定积分构造原函数的理论桥梁。
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 block mb-0.5">FTC 2: 牛顿-莱布尼茨公式</span>
                    <button
                      onClick={() => setActiveTab("nl_derivation")}
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-700 font-bold hover:underline cursor-pointer"
                    >
                      <span>交互推导演播</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                  <MathFormula formula="\int_a^b f(x) \, dx = F(b) - F(a) = \left. F(x) \right|_a^b" block />
                  <p className="text-[11px] text-slate-500 mt-1">
                    【计算意义】：彻底摆脱了复杂的黎曼求和极限计算，把求定积分简化为寻找原函数并在两端做差！
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive derivation widget preview inside intuition */}
          <div className="pt-2">
            <NewtonLeibnizInteractiveDerivation />
          </div>
        </div>
      )}

      {/* 2. 交互式牛顿-莱布尼茨公式几何分步推导 */}
      {activeTab === "nl_derivation" && (
        <div className="space-y-4">
          <NewtonLeibnizInteractiveDerivation />
        </div>
      )}

      {/* 3. 达布大和与小和 */}
      {activeTab === "darboux" && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">达布大和 (Upper Sum) 与达布小和 (Lower Sum) 夹逼准则</h3>
            <div className="text-xs text-slate-500 mt-1">
              <MathText text="达布和避免了介点 $\xi_i$ 选取的任意性，直接通过区间确界构建绝对上界与下界。" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/70">
              <h4 className="text-xs font-bold text-amber-900 mb-2">达布上和 U(P, f) (Upper Darboux Sum)</h4>
              <MathFormula formula="U(P, f) = \sum_{i=1}^n M_i \Delta x_i, \quad M_i = \sup_{x \in [x_{i-1}, x_i]} f(x)" block />
              <p className="text-xs text-amber-800 mt-2">
                由各小区间上确界外切构成的阶梯图形面积，总是大于或等于真实积分值。
              </p>
            </div>

            <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-200/70">
              <h4 className="text-xs font-bold text-sky-900 mb-2">达布下和 L(P, f) (Lower Darboux Sum)</h4>
              <MathFormula formula="L(P, f) = \sum_{i=1}^n m_i \Delta x_i, \quad m_i = \inf_{x \in [x_{i-1}, x_i]} f(x)" block />
              <p className="text-xs text-sky-800 mt-2">
                由各小区间下确界内接构成的阶梯图形面积，总是小于或等于真实积分值。
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 mb-1">黎曼可积的达布充要条件：</h4>
            <MathFormula formula="\lim_{\|\lambda\| \to 0} [U(P, f) - L(P, f)] = \lim_{\|\lambda\| \to 0} \sum_{i=1}^n \omega_i \Delta x_i = 0" block />
            <div className="text-xs text-slate-600 mt-1">
              <MathText text="其中 $\omega_i = M_i - m_i$ 称为函数在小区间上的振幅。只要振幅与区间的加权总和趋于零，函数便严格黎曼可积！" />
            </div>
          </div>
        </div>
      )}

      {/* 4. 黎曼可积三大充分条件 */}
      {activeTab === "theorems" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h4 className="text-sm font-bold text-slate-900">连续性充分定理</h4>
              <div className="text-xs text-slate-600 leading-relaxed">
                <MathText text="若函数 $f(x)$ 在有界闭区间 $[a,b]$ 上**连续**，则 $f(x)$ 在 $[a,b]$ 上**必黎曼可积**。" />
              </div>
              <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                应用最广泛的经典定理
              </span>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
              <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h4 className="text-sm font-bold text-slate-900">单调有界充分定理</h4>
              <div className="text-xs text-slate-600 leading-relaxed">
                <MathText text="若函数 $f(x)$ 在闭区间 $[a,b]$ 上**单调**（单调增或单调减），则 $f(x)$ 在 $[a,b]$ 上**必黎曼可积**。" />
              </div>
              <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200">
                允许包含无穷个可数间断点
              </span>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
              <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h4 className="text-sm font-bold text-slate-900">有限间断点充分定理</h4>
              <div className="text-xs text-slate-600 leading-relaxed">
                <MathText text="若有界函数 $f(x)$ 在闭区间 $[a,b]$ 上**仅有有限个间断点**，则 $f(x)$ 在 $[a,b]$ 上**必黎曼可积**。" />
              </div>
              <span className="inline-block px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-semibold border border-sky-200">
                有限个跳跃间断不影响总面积
              </span>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-900">
                ⭐ 进阶核心：牛顿-莱布尼茨公式 (微积分基本定理 FTC)
              </span>
              <p className="text-xs text-indigo-700">
                从“以直代曲”到变上限积分导数恢复，探索定积分与原函数的严格数学桥梁。
              </p>
            </div>
            <button
              onClick={() => setActiveTab("nl_derivation")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <span>查看分步几何推导</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. 积分中值定理与广义加权 */}
      {activeTab === "mean_value" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-blue-600">
              <Scale className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900">积分第一中值定理 (Mean Value Theorem)</h3>
            </div>
            <div className="text-xs text-slate-600">
              <MathText text="若 $f(x)$ 在闭区间 $[a, b]$ 上连续，则至少存在一点 $\xi \in [a, b]$，使得：" />
            </div>
            <MathFormula formula="\int_a^b f(x) \, dx = f(\xi)(b - a)" block />
            <div className="p-3 bg-blue-50/70 rounded-lg text-xs text-blue-900">
              <MathText text="**几何直观**：存在一个高度为 $f(\xi)$ 的平均矩形，其面积恰好严格等于曲边梯形的真实定积分面积。" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-indigo-600">
              <Zap className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900">广义加权积分第一中值定理</h3>
            </div>
            <div className="text-xs text-slate-600">
              <MathText text="设 $f(x), g(x)$ 在 $[a, b]$ 上连续，且权函数 $g(x)$ 在 $[a, b]$ 上**不变号**，则存在 $\xi \in [a, b]$：" />
            </div>
            <MathFormula formula="\int_a^b f(x)g(x) \, dx = f(\xi) \int_a^b g(x) \, dx" block />
            <div className="p-3 bg-indigo-50/70 rounded-lg text-xs text-indigo-900">
              <strong>工程意义</strong>：广泛应用于加权期望、物理质心坐标以及泰勒余项的积分形式推导。
            </div>
          </div>
        </div>
      )}

      {/* 6. 积分计算技巧 (换元/分部/表格法) */}
      {activeTab === "techniques" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2.5">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
              换元积分法
            </span>
            <h4 className="text-xs font-bold text-slate-900">第一类与第二类换元</h4>
            <div className="text-xs space-y-1 text-slate-600">
              <p><strong>第一类 (凑微分)</strong>：</p>
              <MathFormula formula="\int f(g(x))g'(x) \, dx = \int f(u) \, du" block />
              <p className="mt-1"><strong>第二类 (变量置换)</strong>：</p>
              <MathFormula formula="\int f(x) \, dx = \int f(\psi(t))\psi'(t) \, dt" block />
            </div>
            <p className="text-[11px] text-slate-500">定积分换元牢记：<strong>换元必换限，反代免回代</strong>。</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2.5">
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
              分部积分法
            </span>
            <h4 className="text-xs font-bold text-slate-900">反对幂指三 (LIATE) 选 u 序</h4>
            <MathFormula formula="\int_a^b u \, dv = \left[ uv \right]_a^b - \int_a^b v \, du" block />
            <p className="text-xs text-slate-600">
              选取 u 优先级别口诀：
              <br />
              <strong>反</strong>三角 &rarr; <strong>对</strong>数 &rarr; <strong>幂</strong>函数 &rarr; <strong>指</strong>数 &rarr; <strong>三</strong>角。
            </p>
            <p className="text-[11px] text-slate-500">排在前面者设为 u 便于求导降次，排在后面者设为 v' 便于原函数积分。</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2.5">
            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded">
              表格积分法
            </span>
            <h4 className="text-xs font-bold text-slate-900">多项式 × 指数/三角快速求积</h4>
            <div className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] font-mono leading-relaxed">
              列 D (求导) | 符号 (+/-) | 列 I (积分)
              <br />
              多项式逐阶求导至 0
              <br />
              指数/三角函数连续求积分
            </div>
            <p className="text-[11px] text-slate-500">
              斜向连线乘积加减求和，瞬间解决连续多次分部积分繁琐计算！
            </p>
          </div>
        </div>
      )}

      {/* 7. 反常与瑕积分敛散性诊断 */}
      {activeTab === "improper" && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">反常积分 (无穷限) 与瑕积分 (无界函数) 敛散性速查判定</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200/70">
              <h4 className="text-xs font-bold text-rose-900 mb-1">【类型 1】无穷限反常积分 p-判别准则</h4>
              <MathFormula formula="\int_1^{+\infty} \frac{1}{x^p} \, dx = \begin{cases} \text{收敛}, & p > 1 \\ \text{发散}, & p \le 1 \end{cases}" block />
              <div className="text-xs text-rose-800 mt-2">
                <MathText text="**物理直观**：当 $x \to +\infty$ 时，曲线衰减速率必须严格快于 $\frac{1}{x}$，面积积分才能收敛为有限值。" />
              </div>
            </div>

            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/70">
              <h4 className="text-xs font-bold text-amber-900 mb-1">【类型 2】瑕点瑕积分 (x=0 处爆破) p-判别准则</h4>
              <MathFormula formula="\int_0^1 \frac{1}{x^p} \, dx = \begin{cases} \text{收敛}, & p < 1 \\ \text{发散}, & p \ge 1 \end{cases}" block />
              <div className="text-xs text-amber-800 mt-2">
                <MathText text="**对比注意**：瑕积分在奇点附近的收敛指数条件与无穷限**正好相反**！只有爆破指数 $p < 1$ 时面积才收敛。" />
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 mb-1">极限审敛法 (Limit Comparison Test)：</h4>
            <div className="text-xs text-slate-600 leading-relaxed">
              <MathText text="若 $\lim_{x \to +\infty} \frac{f(x)}{g(x)} = c \in (0, +\infty)$，则反常积分 $\int_a^{+\infty} f(x) \, dx$ 与 $\int_a^{+\infty} g(x) \, dx$ 的敛散性完全相同！" />
            </div>
          </div>
        </div>
      )}

      {/* 8. 经典反例与瑕点诊断 */}
      {activeTab === "counterexamples" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900">经典不可积反例：狄利克雷函数 D(x)</h3>
            </div>
            <MathFormula formula="D(x) = \begin{cases} 1, & x \in \mathbb{Q} \text{ (有理数)} \\ 0, & x \notin \mathbb{Q} \text{ (无理数)} \end{cases}" block />
            <div className="text-xs text-slate-600 leading-relaxed space-y-1">
              <MathText text="在任何小区间 $[x_{i-1}, x_i]$ 内均包含无穷多个有理数与无理数，故上确界 $M_i = 1$，下确界 $m_i = 0$。" />
              <MathText text="达布大和 $U(P, D) = b - a$，达布小和 $L(P, D) = 0$。两者的差恒为 $b - a \neq 0$。" />
              <p className="text-rose-700 font-semibold mt-1">
                结论：狄利克雷函数在任何有限区间上均<strong>严格黎曼不可积</strong>！
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900">奇妙的可积反例：黎曼函数 R(x)</h3>
            </div>
            <MathFormula formula="R(x) = \begin{cases} \frac{1}{q}, & x = \frac{p}{q} \in (0, 1] \text{ (既约真分数)} \\ 0, & x \in (0, 1] \text{ 无理数或 } x = 0 \end{cases}" block />
            <div className="text-xs text-slate-600 leading-relaxed space-y-1">
              <MathText text="黎曼函数在所有无理数点连续，在所有有理数点间断（间断点稠密）。" />
              <MathText text="但由于间断点集为可数集（勒贝格测度为零），根据勒贝格可积准则，黎曼函数在 $[0, 1]$ 上**严格黎曼可积**，且定积分值严格为零：" />
              <MathFormula formula="\int_0^1 R(x) \, dx = 0" block />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

