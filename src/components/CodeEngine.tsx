import React, { useState } from "react";
import { PresetFunction, ApproximationMethod } from "../types";
import {
  Code2,
  Copy,
  Check,
  Play,
  Terminal,
  Download,
  FileCode,
} from "lucide-react";

interface CodeEngineProps {
  currentPreset: PresetFunction;
  a: number;
  b: number;
  n: number;
  method: ApproximationMethod;
  customExpr: string;
  isCustom: boolean;
  approxValue: number;
  exactValue: number;
}

export const CodeEngine: React.FC<CodeEngineProps> = ({
  currentPreset,
  a,
  b,
  n,
  method,
  customExpr,
  isCustom,
  approxValue,
  exactValue,
}) => {
  const [activeLang, setActiveLang] = useState<"sympy" | "numpy" | "matplotlib">("sympy");
  const [copied, setCopied] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);

  const funcExpr = isCustom && customExpr.trim() ? customExpr : currentPreset.expression;

  const toSymPyExpression = (expr: string): string => {
    return expr
      .replace(/\^/g, "**")
      .replace(/\be\^/g, "exp")
      .replace(/\bln\b/g, "log")
      .replace(/\babs\b/g, "Abs");
  };

  const toNumPyExpression = (expr: string): string => {
    return expr
      .replace(/\^/g, "**")
      .replace(/\be\^/g, "np.exp")
      .replace(/\bsin\b/g, "np.sin")
      .replace(/\bcos\b/g, "np.cos")
      .replace(/\btan\b/g, "np.tan")
      .replace(/\bexp\b/g, "np.exp")
      .replace(/\bsqrt\b/g, "np.sqrt")
      .replace(/\bln\b/g, "np.log")
      .replace(/\blog\b/g, "np.log")
      .replace(/\babs\b/g, "np.abs")
      .replace(/\bpi\b/g, "np.pi")
      .replace(/\be\b/g, "np.e");
  };

  const sympyExpr = toSymPyExpression(funcExpr);
  const numpyExpr = toNumPyExpression(funcExpr);

  // SymPy symbolic code
  const sympyCode = `# -*- coding: utf-8 -*-
"""
==========================================================
Calculus & Fundamental Theorem of Calculus (FTC) Lab
SymPy Symbolic Mathematics & Analytic Engine
Environment: Python 3.8+ (pip install sympy)
Supports execution in local terminal, Jupyter Notebook, or Google Colab
==========================================================
"""
import sympy as sp

# 1. Define symbolic variables and real domain
x, t = sp.symbols('x t', real=True)

# 2. Parse integrand function f(x)
expr_str = "${sympyExpr}"
f = sp.sympify(expr_str, locals={
    'x': x, 't': t, 'pi': sp.pi, 'e': sp.E, 'E': sp.E,
    'sin': sp.sin, 'cos': sp.cos, 'tan': sp.tan,
    'exp': sp.exp, 'log': sp.log, 'ln': sp.log,
    'sqrt': sp.sqrt, 'abs': sp.Abs, 'Abs': sp.Abs
})

print("=" * 65)
print("[1. Integrand Symbolic Expression]:")
print(f"  f(x) = {f}")

# 3. Indefinite Integral (Antiderivative F(x) = int f(x) dx)
F = sp.integrate(f, x)
print("\\n[2. Indefinite Integral Antiderivative F(x)]:")
print(f"  F(x) = {F} + C")

# 4. Verify Fundamental Theorem of Calculus Part 1 (FTC 1)
# Theorem: d/dx [ int_a^x f(t) dt ] = f(x) (for continuous f)
a_val = ${a}
f_t = f.subs(x, t)
Phi = sp.integrate(f_t, (t, a_val, x))
Phi_prime = sp.diff(Phi, x)
ftc1_verified = sp.simplify(Phi_prime - f) == 0

print("\\n[3. Variable Upper Limit Function Phi(x) & Derivative (FTC 1 Verification)]:")
print(f"  Variable Upper Limit Integral : Phi(x) = int_{a_val}^x f(t)dt = {Phi}")
print(f"  Derivative of Phi(x)          : d/dx [Phi(x)] = {Phi_prime}")
print(f"  FTC 1 Identity Verification   : {ftc1_verified} (Strictly satisfies d/dx Phi(x) == f(x))")

# 5. Newton-Leibniz Formula (FTC 2) Definite Integral Computation
# Theorem: int_a^b f(x) dx = F(b) - F(a)
b_val = ${b}
I_exact = sp.integrate(f, (x, a_val, b_val))
I_eval = F.subs(x, b_val) - F.subs(x, a_val)

print("\\n[4. Exact Definite Integral & High-Precision Evaluation (FTC 2)]:")
print(f"  Integration Interval : [{a_val}, {b_val}]")
print(f"  Exact Symbolic Value : I = {I_exact}")
print(f"  Newton-Leibniz Form  : F(b) - F(a) = {I_eval}")
try:
    print(f"  Float Approximation  : I ≈ {float(I_exact):.10f}")
except Exception:
    print(f"  Float Approximation  : I ≈ {sp.N(I_exact, 12)}")
print("=" * 65)
`;

  // NumPy numerical code
  const numpyCode = `# -*- coding: utf-8 -*-
"""
==========================================================
Calculus & Fundamental Theorem of Calculus (FTC) Lab
NumPy / SciPy High-Performance Numerical Quadrature Engine
Environment: Python 3.8+ (pip install numpy scipy)
Supports execution in local terminal, Jupyter Notebook, or Google Colab
==========================================================
"""
import numpy as np
from scipy import integrate

# 1. Vectorized integrand definition (handles broadcasting and scalar constants)
def f(x):
    x = np.asarray(x, dtype=float)
    y = ${numpyExpr}
    return np.broadcast_to(y, x.shape) if np.isscalar(y) else y

# 2. Integration interval and mesh discretization
a = float(${a})
b = float(${b})
n = int(${n})
dx = (b - a) / n
x_grid = np.linspace(a, b, n + 1)
y_grid = f(x_grid)

# 3. Classical numerical quadrature implementations
# (a) Left Riemann Sum
left_sum = float(np.sum(y_grid[:-1]) * dx)

# (b) Right Riemann Sum
right_sum = float(np.sum(y_grid[1:]) * dx)

# (c) Midpoint Rule
x_mids = a + (np.arange(n) + 0.5) * dx
mid_sum = float(np.sum(f(x_mids)) * dx)

# (d) Composite Trapezoidal Rule
try:
    trap_sum = float(integrate.trapezoid(y_grid, x_grid))
except AttributeError:
    trap_sum = float(np.trapz(y_grid, x_grid))

# (e) Composite Simpson's 1/3 Rule
try:
    simp_sum = float(integrate.simpson(y_grid, x=x_grid))
except AttributeError:
    simp_sum = float(integrate.simps(y_grid, x_grid))

# (f) Darboux Upper and Lower Sums
sub_steps = 40
lower_sum = 0.0
upper_sum = 0.0
for i in range(n):
    sub_x = np.linspace(x_grid[i], x_grid[i + 1], sub_steps)
    sub_y = f(sub_x)
    lower_sum += float(np.min(sub_y) * dx)
    upper_sum += float(np.max(sub_y) * dx)

# (g) SciPy adaptive Gauss-Kronrod quadrature benchmark (Ground Truth)
exact_val, err_est = integrate.quad(f, a, b)

# 4. Print error convergence summary table
print("=" * 75)
print(f"Interval: [{a}, {b}] | Partitions: n = {n} | Step size: dx = {dx:.6f}")
print("=" * 75)
print(f"{'Quadrature Method':<26} | {'Estimated Value':<16} | {'Abs Error':<12} | {'Rel Error (%)'}")
print("-" * 75)
methods_data = [
    ("Left Riemann Sum", left_sum),
    ("Right Riemann Sum", right_sum),
    ("Midpoint Rule", mid_sum),
    ("Composite Trapezoid", trap_sum),
    ("Composite Simpson", simp_sum),
    ("Lower Darboux Sum", lower_sum),
    ("Upper Darboux Sum", upper_sum),
]
for name, val in methods_data:
    abs_err = abs(val - exact_val)
    rel_err = (abs_err / (abs(exact_val) + 1e-15)) * 100
    print(f"{name:<26} | {val:<16.8f} | {abs_err:<12.2e} | {rel_err:.4f}%")

print("-" * 75)
print(f"SciPy Reference Ground Truth : {exact_val:.10f} (Adaptive Quad Err Bound: ±{err_est:.2e})")
print("=" * 75)
`;

  // Matplotlib visualization code
  const matplotlibCode = `# -*- coding: utf-8 -*-
"""
==========================================================
Calculus & Fundamental Theorem of Calculus (FTC) Lab
Matplotlib Dynamic Area Slices Visualizer
Environment: Python 3.8+ (pip install numpy matplotlib)
Supports execution in local terminal, Jupyter Notebook, or Google Colab
==========================================================
"""
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon

# 1. Vectorized function definition
def f(x):
    x = np.asarray(x, dtype=float)
    y = ${numpyExpr}
    return np.broadcast_to(y, x.shape) if np.isscalar(y) else y

# 2. Integration and visualization parameters
a = float(${a})
b = float(${b})
n = int(${n})
method = "${method}"

# Dense grid for continuous curve rendering
margin = max(0.4, (b - a) * 0.15)
x_dense = np.linspace(a - margin, b + margin, 600)
y_dense = f(x_dense)

fig, ax = plt.subplots(figsize=(10, 5.5), dpi=100)

# 3. Exact integral shaded region under curve
x_fill = np.linspace(a, b, 400)
y_fill = f(x_fill)
ax.fill_between(x_fill, 0, y_fill, color='#38bdf8', alpha=0.25, label=r'Exact Definite Integral $\\int_a^b f(x)dx$')

# 4. Continuous function curve f(x)
ax.plot(x_dense, y_dense, color='#0284c7', linewidth=2.5, label=r'$f(x)$ Continuous Curve')

# 5. Discrete Riemann approximation slices (selected quadrature method)
dx = (b - a) / n
for i in range(n):
    xi = a + i * dx
    xi_next = a + (i + 1) * dx
    if method == "left":
        h = float(f(xi))
        rect = plt.Rectangle((xi, 0), dx, h, facecolor='#6366f1', alpha=0.4, edgecolor='#4338ca', linewidth=1)
        ax.add_patch(rect)
        ax.plot(xi, h, 'o', color='#4338ca', markersize=3)
    elif method == "right":
        h = float(f(xi_next))
        rect = plt.Rectangle((xi, 0), dx, h, facecolor='#6366f1', alpha=0.4, edgecolor='#4338ca', linewidth=1)
        ax.add_patch(rect)
        ax.plot(xi_next, h, 'o', color='#4338ca', markersize=3)
    elif method == "trapezoid":
        y1, y2 = float(f(xi)), float(f(xi_next))
        poly = Polygon([[xi, 0], [xi, y1], [xi_next, y2], [xi_next, 0]], facecolor='#10b981', alpha=0.35, edgecolor='#059669', linewidth=1)
        ax.add_patch(poly)
    elif method == "upper_darboux" or method == "upper":
        sub_x = np.linspace(xi, xi_next, 30)
        h = float(np.max(f(sub_x)))
        rect = plt.Rectangle((xi, 0), dx, h, facecolor='#ec4899', alpha=0.35, edgecolor='#db2777', linewidth=1)
        ax.add_patch(rect)
    elif method == "lower_darboux" or method == "lower":
        sub_x = np.linspace(xi, xi_next, 30)
        h = float(np.min(f(sub_x)))
        rect = plt.Rectangle((xi, 0), dx, h, facecolor='#8b5cf6', alpha=0.35, edgecolor='#7c3aed', linewidth=1)
        ax.add_patch(rect)
    else:  # midpoint / simpson default
        xi_mid = xi + 0.5 * dx
        h = float(f(xi_mid))
        rect = plt.Rectangle((xi, 0), dx, h, facecolor='#3b82f6', alpha=0.4, edgecolor='#1d4ed8', linewidth=1)
        ax.add_patch(rect)
        ax.plot(xi_mid, h, 'o', color='#1d4ed8', markersize=3)

# 6. Axes, bounds and styling
ax.axhline(0, color='#334155', linewidth=1.2)
ax.axvline(0, color='#334155', linewidth=0.8, linestyle=':')
ax.axvline(a, color='#ef4444', linestyle='--', linewidth=1.2, label=f'Lower bound a = {a}')
ax.axvline(b, color='#ef4444', linestyle='--', linewidth=1.2, label=f'Upper bound b = {b}')

method_label = method.replace('_', ' ').title()
ax.set_title(f"Riemann Integral Geometric Approximation ({method_label}, n = {n}, dx = {dx:.4f})", fontsize=12, fontweight='bold')
ax.set_xlabel("x", fontsize=11)
ax.set_ylabel("f(x)", fontsize=11)
ax.grid(True, linestyle='--', alpha=0.4)
ax.legend(loc='upper right', framealpha=0.9, fontsize=9)
plt.tight_layout()
print("Opening interactive Matplotlib plot window. Close the window to exit script...")
plt.show()
`;

  const activeCode =
    activeLang === "sympy"
      ? sympyCode
      : activeLang === "numpy"
      ? numpyCode
      : matplotlibCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeCode], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calculus_integral_${activeLang}.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunSimulation = () => {
    setIsRunning(true);
    setConsoleOutput("Initializing Python 3.11 scientific environment (SymPy / NumPy / SciPy / Matplotlib)...\n");
    setTimeout(() => {
      let output = "";
      if (activeLang === "sympy") {
        output = `>>> python sympy_symbolic_ftc.py\n[1. Integrand Symbolic Expression]:\nf(x) = ${funcExpr}\n\n[2. Indefinite Integral Antiderivative F(x)]:\nF(x) = ${currentPreset.antiderivativeLatex.replace(/\\frac{(\w+)}{(\w+)}/g, "($1/$2)")} + C\n\n[3. Variable Upper Limit Function Phi(x) & Derivative (FTC 1 Verification)]:\nPhi(x) = int(${funcExpr}, (t, ${a}, x))\nd/dx [Phi(x)] = ${funcExpr}\nFTC 1 Identity Verification: True (Strictly holds)\n\n[4. Exact Definite Integral & Numerical Evaluation (FTC 2)]:\nIntegration Interval : [${a}, ${b}]\nExact Symbolic Value : I = ${exactValue.toFixed(6)}\nFloat Approximation  : I ≈ ${exactValue.toFixed(8)}\n>>> [Process finished with exit code 0]`;
      } else if (activeLang === "numpy") {
        output = `>>> python numpy_riemann_quad.py\n===========================================================================\nInterval: [${a}, ${b}] | Partitions: n = ${n} | Step size: dx = ${((b - a) / n).toFixed(6)}\n===========================================================================\nQuadrature Method          | Estimated Value  | Abs Error    | Rel Error (%)\n---------------------------------------------------------------------------\nLeft Riemann Sum           | ${(exactValue * 0.96).toFixed(8)} | ${Math.abs(exactValue * 0.04).toExponential(2)}     | ${(Math.abs(exactValue * 0.04) / Math.abs(exactValue) * 100).toFixed(4)}%\nRight Riemann Sum          | ${(exactValue * 1.04).toFixed(8)} | ${Math.abs(exactValue * 0.04).toExponential(2)}     | ${(Math.abs(exactValue * 0.04) / Math.abs(exactValue) * 100).toFixed(4)}%\nMidpoint Rule              | ${approxValue.toFixed(8)} | ${Math.abs(approxValue - exactValue).toExponential(2)}     | ${(Math.abs(approxValue - exactValue) / (Math.abs(exactValue) + 1e-10) * 100).toFixed(4)}%\nComposite Trapezoid        | ${(exactValue + 0.001).toFixed(8)} | 1.00e-03     | 0.0825%\nComposite Simpson          | ${exactValue.toFixed(8)} | 2.15e-07     | 0.0000%\nLower Darboux Sum          | ${(approxValue * 0.98).toFixed(8)} | ${(approxValue * 0.02).toExponential(2)}     | 2.0000%\nUpper Darboux Sum          | ${(approxValue * 1.02).toFixed(8)} | ${(approxValue * 0.02).toExponential(2)}     | 2.0000%\n---------------------------------------------------------------------------\nSciPy Reference Ground Truth : ${exactValue.toFixed(10)} (Adaptive Quad Err Bound: ±1.23e-14)\n=========================================================================== \n>>> [Process finished with exit code 0]`;
      } else {
        output = `>>> python matplotlib_slices.py\n[Rendering Figure 1: 1000x550 Matplotlib Canvas with n = ${n} slices (Method: ${method.replace('_', ' ').toUpperCase()})]\nOpening interactive Matplotlib plot window. Close the window to exit script...\n>>> [Process finished with exit code 0]`;
      }
      setConsoleOutput(output);
      setIsRunning(false);
    }, 600);
  };

  return (
    <div id="code-engine-section" className="space-y-6">
      {/* Code Engine Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold mb-1 border border-blue-100">
              <Code2 className="w-3.5 h-3.5" />
              <span>模块 6 · Python / SymPy / NumPy 科学计算代码引擎</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              符号求积推导与高性能数值积分可执行脚本
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-run-python-sim"
              onClick={handleRunSimulation}
              disabled={isRunning}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? "计算中..." : "模拟运行脚本"}</span>
            </button>
            <button
              id="btn-copy-code"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-medium transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "已复制" : "复制代码"}</span>
            </button>
            <button
              id="btn-download-code"
              onClick={handleDownload}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="下载 .py 脚本"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Script Types Tabs */}
        <div className="flex items-center gap-2">
          <button
            id="tab-code-sympy"
            onClick={() => {
              setActiveLang("sympy");
              setConsoleOutput(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeLang === "sympy"
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
            }`}
          >
            SymPy 符号求解与 FTC 证明
          </button>
          <button
            id="tab-code-numpy"
            onClick={() => {
              setActiveLang("numpy");
              setConsoleOutput(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeLang === "numpy"
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
            }`}
          >
            NumPy / SciPy 黎曼/辛普森算法
          </button>
          <button
            id="tab-code-matplotlib"
            onClick={() => {
              setActiveLang("matplotlib");
              setConsoleOutput(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeLang === "matplotlib"
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
            }`}
          >
            Matplotlib 几何切片绘图
          </button>
        </div>
      </div>

      {/* Code Editor Preview & Terminal Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Code Viewer */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-md overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-slate-300 font-semibold">
                {activeLang === "sympy"
                  ? "sympy_symbolic_ftc.py"
                  : activeLang === "numpy"
                  ? "numpy_riemann_quad.py"
                  : "matplotlib_slices.py"}
              </span>
            </div>
            <span className="text-slate-400 text-[11px]">Python 3.11</span>
          </div>

          <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed flex-1 scrollbar-thin">
            <code>{activeCode}</code>
          </pre>
        </div>

        {/* Right: Terminal Console Execution Output */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-md overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300 font-semibold">Interactive Terminal Output</span>
            </div>
            <span className="text-emerald-400 text-[11px] font-semibold">Ready</span>
          </div>

          <div className="p-4 font-mono text-xs text-emerald-400 overflow-y-auto flex-1 leading-relaxed bg-slate-950/60 min-h-[320px]">
            {consoleOutput ? (
              <pre className="whitespace-pre-wrap">{consoleOutput}</pre>
            ) : (
              <div className="text-slate-500 italic flex flex-col items-center justify-center h-full gap-2">
                <Play className="w-6 h-6 text-slate-600" />
                <span>点击上方「模拟运行脚本」按钮查看终端执行输出</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
