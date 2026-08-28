import React, { useState, useMemo, useEffect } from "react";
import { MathFormula } from "./MathFormula";
import {
  X,
  Search,
  BookOpen,
  Copy,
  Check,
  Zap,
  Tag,
  HelpCircle,
  Flame,
  Layers,
  Sparkles,
} from "lucide-react";

export interface FormulaItem {
  id: string;
  category: "algebraic" | "trig" | "exponential" | "special_ftc";
  name: string;
  latex: string;
  note?: string;
  presetExpression?: string; // If user wants to quickly test in sandbox
  tags: string[];
}

const FORMULA_DATABASE: FormulaItem[] = [
  // 1. 幂函数与代数函数类
  {
    id: "power_rule",
    category: "algebraic",
    name: "幂函数基本积分公式",
    latex: "\\int x^\\alpha \\, dx = \\frac{x^{\\alpha+1}}{\\alpha+1} + C \\quad (\\alpha \\neq -1)",
    note: "微积分最基础幂律，α=-1 时退化为对数形式",
    presetExpression: "x^3",
    tags: ["幂函数", "基本公式", "多项式", "x^n"],
  },
  {
    id: "reciprocal_rule",
    category: "algebraic",
    name: "倒数与对数积分",
    latex: "\\int \\frac{1}{x} \\, dx = \\ln|x| + C",
    note: "注意定义域与绝对值符号，导数为双曲线分支",
    presetExpression: "1/x",
    tags: ["对数", "倒数", "1/x", "ln"],
  },
  {
    id: "arctan_std",
    category: "algebraic",
    name: "标准反正切积分",
    latex: "\\int \\frac{1}{1+x^2} \\, dx = \\arctan x + C",
    note: "有理函数积分基础项，极限逼近 π/2",
    presetExpression: "1/(1+x^2)",
    tags: ["arctan", "反正切", "有理函数", "1/(1+x^2)"],
  },
  {
    id: "arctan_general",
    category: "algebraic",
    name: "广义反正切积分公式",
    latex: "\\int \\frac{1}{a^2+x^2} \\, dx = \\frac{1}{a} \\arctan\\left(\\frac{x}{a}\\right) + C \\quad (a > 0)",
    note: "换元法直接推导，系数注意提取 1/a",
    tags: ["arctan", "广义形式", "二次多项式"],
  },
  {
    id: "arcsin_std",
    category: "algebraic",
    name: "标准反正弦积分",
    latex: "\\int \\frac{1}{\\sqrt{1-x^2}} \\, dx = \\arcsin x + C",
    note: "根式代换典型结果，|x| < 1",
    presetExpression: "1/sqrt(1-x^2)",
    tags: ["arcsin", "反正弦", "根式", "圆"],
  },
  {
    id: "arcsin_general",
    category: "algebraic",
    name: "广义反正弦积分公式",
    latex: "\\int \\frac{1}{\\sqrt{a^2-x^2}} \\, dx = \\arcsin\\left(\\frac{x}{a}\\right) + C \\quad (a > 0)",
    note: "三角代换 x = a*sin(t) 的标准型",
    tags: ["arcsin", "三角代换", "根式"],
  },
  {
    id: "log_radical_plus",
    category: "algebraic",
    name: "反双曲/根式对数积分 (+)",
    latex: "\\int \\frac{1}{\\sqrt{x^2+a^2}} \\, dx = \\ln\\left(x + \\sqrt{x^2+a^2}\\right) + C",
    note: "欧拉代换或双曲代换 x=a*sinh(t)",
    tags: ["根式", "对数", "欧拉代换", "sinh"],
  },
  {
    id: "log_radical_minus",
    category: "algebraic",
    name: "反双曲/根式对数积分 (-)",
    latex: "\\int \\frac{1}{\\sqrt{x^2-a^2}} \\, dx = \\ln\\left|x + \\sqrt{x^2-a^2}\\right| + C",
    note: "割线代换 x=a*sec(t) 的标准积分",
    tags: ["根式", "割线代换", "对数"],
  },
  {
    id: "partial_fraction_diff",
    category: "algebraic",
    name: "平方差有理分式积分",
    latex: "\\int \\frac{1}{x^2-a^2} \\, dx = \\frac{1}{2a}\\ln\\left|\\frac{x-a}{x+a}\\right| + C",
    note: "部分分式分解 1/(x-a) - 1/(x+a)",
    tags: ["部分分式", "有理函数", "分解"],
  },

  // 2. 指数与对数函数类
  {
    id: "exp_natural",
    category: "exponential",
    name: "自然指数函数",
    latex: "\\int e^x \\, dx = e^x + C",
    note: "导数与原函数均等于自身的唯美函数",
    presetExpression: "e^x",
    tags: ["exp", "e^x", "自然指数"],
  },
  {
    id: "exp_linear",
    category: "exponential",
    name: "一次复合指数积分",
    latex: "\\int e^{kx} \\, dx = \\frac{1}{k}e^{kx} + C \\quad (k \\neq 0)",
    note: "第一类换元法（凑微分）基础",
    presetExpression: "exp(2*x)",
    tags: ["凑微分", "e^kx", "指数"],
  },
  {
    id: "exp_general_base",
    category: "exponential",
    name: "任意底数指数积分",
    latex: "\\int a^x \\, dx = \\frac{a^x}{\\ln a} + C \\quad (a > 0, a \\neq 1)",
    note: "换底公式转化：a^x = e^(x*ln a)",
    presetExpression: "2^x",
    tags: ["a^x", "指数", "换底"],
  },
  {
    id: "ln_integral",
    category: "exponential",
    name: "自然对数分部积分",
    latex: "\\int \\ln x \\, dx = x\\ln x - x + C",
    note: "经典分部积分法：令 u=ln x, dv=dx",
    presetExpression: "ln(x)",
    tags: ["ln x", "对数", "分部积分"],
  },
  {
    id: "poly_exp_by_parts",
    category: "exponential",
    name: "多项式乘指数 (x·e^x)",
    latex: "\\int x e^x \\, dx = (x - 1)e^x + C",
    note: "分部积分或表格法 (Tabular Integration) 一阶示范",
    presetExpression: "x * exp(x)",
    tags: ["分部积分", "表格法", "x*e^x"],
  },
  {
    id: "poly_exp_reduction",
    category: "exponential",
    name: "高阶多项式指数降阶递推",
    latex: "\\int x^n e^x \\, dx = x^n e^x - n \\int x^{n-1} e^x \\, dx",
    note: "降阶递推公式，可直接展开为 n 阶表格法",
    tags: ["递推公式", "高阶分部", "表格法"],
  },

  // 3. 三角与反三角函数类
  {
    id: "sin_integral",
    category: "trig",
    name: "正弦函数积分",
    latex: "\\int \\sin x \\, dx = -\\cos x + C",
    note: "注意负号，周期为 2π",
    presetExpression: "sin(x)",
    tags: ["sin", "正弦", "三角函数"],
  },
  {
    id: "cos_integral",
    category: "trig",
    name: "余弦函数积分",
    latex: "\\int \\cos x \\, dx = \\sin x + C",
    note: "在 [0, π/2] 面积积分为 1",
    presetExpression: "cos(x)",
    tags: ["cos", "余弦", "三角函数"],
  },
  {
    id: "tan_integral",
    category: "trig",
    name: "正切函数积分",
    latex: "\\int \\tan x \\, dx = -\\ln|\\cos x| + C = \\ln|\\sec x| + C",
    note: "凑微分法：sin x / cos x dx = -d(cos x)/cos x",
    tags: ["tan", "正切", "凑微分"],
  },
  {
    id: "cot_integral",
    category: "trig",
    name: "余切函数积分",
    latex: "\\int \\cot x \\, dx = \\ln|\\sin x| + C",
    note: "凑微分法：cos x / sin x dx = d(sin x)/sin x",
    tags: ["cot", "余切", "对数"],
  },
  {
    id: "sec_squared",
    category: "trig",
    name: "正割平方积分 (tan导数逆)",
    latex: "\\int \\sec^2 x \\, dx = \\tan x + C",
    note: "1/cos²(x) 的直接积分原函数",
    presetExpression: "1/(cos(x)^2)",
    tags: ["sec^2", "tan", "导数逆"],
  },
  {
    id: "csc_squared",
    category: "trig",
    name: "余割平方积分 (cot导数逆)",
    latex: "\\int \\csc^2 x \\, dx = -\\cot x + C",
    note: "1/sin²(x) 的直接积分原函数",
    tags: ["csc^2", "cot", "导数逆"],
  },
  {
    id: "sec_integral",
    category: "trig",
    name: "正割函数奇巧积分",
    latex: "\\int \\sec x \\, dx = \\ln|\\sec x + \\tan x| + C",
    note: "经典技巧：分子分母同乘 (sec x + tan x)",
    tags: ["sec", "正割", "积分技巧"],
  },
  {
    id: "csc_integral",
    category: "trig",
    name: "余割函数积分",
    latex: "\\int \\csc x \\, dx = \\ln|\\csc x - \\cot x| + C = \\ln\\left|\\tan\\frac{x}{2}\\right| + C",
    note: "半角正切万能代换变形",
    tags: ["csc", "余割", "半角"],
  },
  {
    id: "sin_squared",
    category: "trig",
    name: "正弦平方降幂积分",
    latex: "\\int \\sin^2 x \\, dx = \\frac{x}{2} - \\frac{\\sin 2x}{4} + C",
    note: "倍角降幂公式：sin²x = (1 - cos 2x) / 2",
    presetExpression: "sin(x)^2",
    tags: ["sin^2", "倍角公式", "降幂"],
  },
  {
    id: "cos_squared",
    category: "trig",
    name: "余弦平方降幂积分",
    latex: "\\int \\cos^2 x \\, dx = \\frac{x}{2} + \\frac{\\sin 2x}{4} + C",
    note: "倍角降幂公式：cos²x = (1 + cos 2x) / 2",
    presetExpression: "cos(x)^2",
    tags: ["cos^2", "倍角公式", "降幂"],
  },
  {
    id: "arcsin_by_parts",
    category: "trig",
    name: "反正弦函数分部积分",
    latex: "\\int \\arcsin x \\, dx = x\\arcsin x + \\sqrt{1-x^2} + C",
    note: "分部积分令 u=arcsin x, dv=dx",
    tags: ["arcsin", "反三角", "分部积分"],
  },
  {
    id: "arctan_by_parts",
    category: "trig",
    name: "反正切函数分部积分",
    latex: "\\int \\arctan x \\, dx = x\\arctan x - \\frac{1}{2}\\ln(1+x^2) + C",
    note: "分部积分令 u=arctan x, dv=dx",
    tags: ["arctan", "反三角", "分部积分"],
  },

  // 4. 定积分核心定理、FTC 与拓展公式
  {
    id: "ftc1_derivative",
    category: "special_ftc",
    name: "微积分第一基本定理 (变上限求导)",
    latex: "\\frac{d}{dx}\\left[\\int_a^x f(t)\\,dt\\right] = f(x)",
    note: "揭示积分是微分的逆运算，变上限连续必可导",
    tags: ["FTC 1", "变上限", "导数逆运算", "核心定理"],
  },
  {
    id: "ftc1_chain_rule",
    category: "special_ftc",
    name: "复合变限积分莱布尼茨求导法则",
    latex: "\\frac{d}{dx}\\left[\\int_{\\psi(x)}^{\\phi(x)} f(t)\\,dt\\right] = f(\\phi(x))\\phi'(x) - f(\\psi(x))\\psi'(x)",
    note: "考研/大学微积分高频考点，链式法则与 FTC 结合",
    tags: ["莱布尼茨公式", "复合变限", "链式法则"],
  },
  {
    id: "ftc2_newton_leibniz",
    category: "special_ftc",
    name: "微积分第二基本定理 (牛顿-莱布尼茨)",
    latex: "\\int_a^b f(x)\\,dx = F(b) - F(a) = \\left. F(x) \\right|_a^b",
    note: "定积分计算基石，全局累积等于原函数端点差",
    tags: ["FTC 2", "牛顿莱布尼茨", "原函数", "基础"],
  },
  {
    id: "integration_by_parts",
    category: "special_ftc",
    name: "不定/定积分分部积分法则",
    latex: "\\int_a^b u(x)v'(x)\\,dx = \\left[ u(x)v(x) \\right]_a^b - \\int_a^b v(x)u'(x)\\,dx",
    note: "经典反导口诀：反对幂指三 (LIATE / 反三角-对数-幂-指-三角)",
    tags: ["分部积分", "LIATE", "反对幂指三"],
  },
  {
    id: "symmetry_properties",
    category: "special_ftc",
    name: "对称区间奇偶定积分化简",
    latex: "\\int_{-a}^a f(x)\\,dx = \\begin{cases} 0, & f(-x) = -f(x) \\text{ (奇函数)} \\\\ 2\\int_0^a f(x)\\,dx, & f(-x) = f(x) \\text{ (偶函数)} \\end{cases}",
    note: "对称性化简，大幅降低运算复杂度",
    tags: ["奇偶性", "对称区间", "极速化简"],
  },
  {
    id: "wallis_formula",
    category: "special_ftc",
    name: "华里士公式 (点火公式 / Wallis)",
    latex: "I_n = \\int_0^{\\frac{\\pi}{2}} \\sin^n x \\, dx = \\int_0^{\\frac{\\pi}{2}} \\cos^n x \\, dx = \\frac{n-1}{n} I_{n-2}",
    note: "n 为偶数时乘 π/2，n 为奇数时乘 1",
    tags: ["点火公式", "华里士", "Wallis", "考研必备"],
  },
];

interface IntegralFormulaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPresetExpr?: (expr: string) => void;
}

export const IntegralFormulaDrawer: React.FC<IntegralFormulaDrawerProps> = ({
  isOpen,
  onClose,
  onApplyPresetExpr,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<
    "all" | "algebraic" | "exponential" | "trig" | "special_ftc"
  >("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Keyboard shortcut ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filter formulas
  const filteredFormulas = useMemo(() => {
    return FORMULA_DATABASE.filter((item) => {
      const matchCategory =
        activeCategory === "all" || item.category === activeCategory;
      if (!matchCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchLatex = item.latex.toLowerCase().includes(q);
      const matchNote = item.note?.toLowerCase().includes(q);
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));

      return matchName || matchLatex || matchNote || matchTags;
    });
  }, [activeCategory, searchQuery]);

  const handleCopyLatex = (item: FormulaItem) => {
    navigator.clipboard.writeText(item.latex);
    setCopiedId(item.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  if (!isOpen) return null;

  const categories = [
    { id: "all", label: "全部公式", icon: Layers, count: FORMULA_DATABASE.length },
    {
      id: "algebraic",
      label: "幂/代数/根式",
      icon: Tag,
      count: FORMULA_DATABASE.filter((f) => f.category === "algebraic").length,
    },
    {
      id: "exponential",
      label: "指数与对数",
      icon: Sparkles,
      count: FORMULA_DATABASE.filter((f) => f.category === "exponential").length,
    },
    {
      id: "trig",
      label: "三角/反三角",
      icon: Flame,
      count: FORMULA_DATABASE.filter((f) => f.category === "trig").length,
    },
    {
      id: "special_ftc",
      label: "FTC与重要定理",
      icon: Zap,
      count: FORMULA_DATABASE.filter((f) => f.category === "special_ftc").length,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Semi-transparent Backdrop with Blur */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        {/* Slide-over Container with Glassmorphism */}
        <aside
          id="integral-formula-drawer-panel"
          className="w-screen max-w-xl bg-white/95 backdrop-blur-md shadow-2xl border-l border-slate-200 flex flex-col transition-transform animate-in slide-in-from-right duration-300"
        >
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold tracking-tight">常用微积分与积分公式速查表</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 font-mono">
                    KaTeX 渲染
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  幂律、三角、对数、分部积分、微积分基本定理 (FTC) 及特殊公式
                </p>
              </div>
            </div>
            <button
              id="btn-close-formula-drawer"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors cursor-pointer"
              title="关闭速查表 (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Quick Category Filters */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
            {/* Search input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-formula-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索公式名称、LaTeX 代码、关键字 (如: sin, ln, 分部, 点火, arctan)..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-0.5"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`btn-formula-cat-${cat.id}`}
                    onClick={() => setActiveCategory(cat.id as any)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? "bg-blue-700 text-blue-100" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formulas List View */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-slate-100 scrollbar-thin">
            {filteredFormulas.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <HelpCircle className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-medium">未找到与 &quot;{searchQuery}&quot; 匹配的积分公式</p>
                <p className="text-xs text-slate-400">尝试使用其它关键字或清除搜索条件</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                  className="mt-2 text-xs text-blue-600 hover:underline cursor-pointer"
                >
                  重置筛选条件
                </button>
              </div>
            ) : (
              filteredFormulas.map((formula) => {
                const isCopied = copiedId === formula.id;
                return (
                  <div
                    key={formula.id}
                    id={`formula-card-${formula.id}`}
                    className="pt-3.5 first:pt-0 group relative bg-white hover:bg-slate-50/90 rounded-xl p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all"
                  >
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-800">
                            {formula.name}
                          </h4>
                          {formula.category === "special_ftc" && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                              核心定理/定积分
                            </span>
                          )}
                        </div>
                        {formula.note && (
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {formula.note}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {formula.presetExpression && onApplyPresetExpr && (
                          <button
                            id={`btn-apply-formula-${formula.id}`}
                            onClick={() => {
                              onApplyPresetExpr(formula.presetExpression!);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-semibold border border-blue-200 cursor-pointer transition-colors"
                            title="填入实验沙盒立即演播"
                          >
                            <Zap className="w-3 h-3 text-blue-600" />
                            <span>载入实验</span>
                          </button>
                        )}

                        <button
                          id={`btn-copy-formula-${formula.id}`}
                          onClick={() => handleCopyLatex(formula)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                            isCopied
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                          }`}
                          title="复制 LaTeX 源码"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>已复制</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-500" />
                              <span>LaTeX</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* KaTeX Formula Display Box */}
                    <div className="p-3 bg-slate-900 rounded-lg text-slate-100 overflow-x-auto my-2 border border-slate-800 shadow-inner flex items-center justify-center">
                      <MathFormula formula={formula.latex} block className="text-sm text-slate-100" />
                    </div>

                    {/* Tags footer */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      {formula.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              共收录 {FORMULA_DATABASE.length} 条高频公式与定理
            </span>
            <span className="text-[11px] text-slate-400">点击 &quot;LaTeX&quot; 可一键复制公式源码</span>
          </div>
        </aside>
      </div>
    </div>
  );
};
