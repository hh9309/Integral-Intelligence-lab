import React, { useState, useMemo } from "react";
import { PresetFunction, ConvergencePoint } from "../types";
import {
  computeConvergenceData,
  estimateConvergenceSlope,
  getExactIntegral,
  createCustomFunction,
} from "../utils/mathEngine";
import { MathFormula, MathText } from "./MathFormula";
import {
  TrendingDown,
  LineChart,
  BarChart2,
  Sparkles,
  Info,
  Scale,
} from "lucide-react";

interface ErrorConvergenceProps {
  currentPreset: PresetFunction;
  a: number;
  b: number;
  customExpr: string;
  isCustom: boolean;
}

export const ErrorConvergence: React.FC<ErrorConvergenceProps> = ({
  currentPreset,
  a,
  b,
  customExpr,
  isCustom,
}) => {
  const [plotMode, setPlotMode] = useState<"loglog" | "linear">("loglog");
  const [selectedMethods, setSelectedMethods] = useState<{
    left: boolean;
    trapezoid: boolean;
    midpoint: boolean;
    simpson: boolean;
  }>({
    left: true,
    trapezoid: true,
    midpoint: true,
    simpson: true,
  });

  const activeFn = useMemo(() => {
    if (isCustom && customExpr.trim()) {
      return createCustomFunction(customExpr);
    }
    return currentPreset.evaluate;
  }, [isCustom, customExpr, currentPreset]);

  const exactVal = useMemo(() => {
    if (isCustom) {
      return getExactIntegral(null, activeFn, a, b);
    }
    return getExactIntegral(currentPreset, null, a, b);
  }, [isCustom, activeFn, currentPreset, a, b]);

  // Compute convergence dataset
  const convergenceData = useMemo(() => {
    return computeConvergenceData(activeFn, a, b, exactVal);
  }, [activeFn, a, b, exactVal]);

  // Calculate slopes
  const leftSlope = useMemo(() => estimateConvergenceSlope(convergenceData, "leftError"), [convergenceData]);
  const trapSlope = useMemo(() => estimateConvergenceSlope(convergenceData, "trapezoidError"), [convergenceData]);
  const midSlope = useMemo(() => estimateConvergenceSlope(convergenceData, "midpointError"), [convergenceData]);
  const simpSlope = useMemo(() => estimateConvergenceSlope(convergenceData, "simpsonError"), [convergenceData]);

  // SVG Chart Geometry
  const svgWidth = 800;
  const svgHeight = 360;
  const pad = { top: 30, right: 30, bottom: 45, left: 65 };
  const pWidth = svgWidth - pad.left - pad.right;
  const pHeight = svgHeight - pad.top - pad.bottom;

  // Domain & Ranges
  const minN = convergenceData[0]?.n || 2;
  const maxN = convergenceData[convergenceData.length - 1]?.n || 512;

  // Log values
  const logMinN = Math.log10(minN);
  const logMaxN = Math.log10(maxN);

  // Errors min & max
  const { minErr, maxErr, logMinErr, logMaxErr } = useMemo(() => {
    let minE = 1e-12;
    let maxE = 1;
    convergenceData.forEach((p) => {
      [p.leftError, p.trapezoidError, p.midpointError, p.simpsonError].forEach((err) => {
        if (err > maxE) maxE = err;
        if (err > 0 && err < minE) minE = err;
      });
    });
    return {
      minErr: minE,
      maxErr: maxE,
      logMinErr: Math.floor(Math.log10(minE)),
      logMaxErr: Math.ceil(Math.log10(maxE)),
    };
  }, [convergenceData]);

  const mapX = (nVal: number) => {
    if (plotMode === "loglog") {
      const logVal = Math.log10(nVal);
      return pad.left + ((logVal - logMinN) / (logMaxN - logMinN)) * pWidth;
    }
    return pad.left + ((nVal - minN) / (maxN - minN)) * pWidth;
  };

  const mapY = (errVal: number) => {
    const safeErr = Math.max(1e-15, errVal);
    if (plotMode === "loglog") {
      const logErr = Math.log10(safeErr);
      return pad.top + pHeight - ((logErr - logMinErr) / (logMaxErr - logMinErr)) * pHeight;
    }
    return pad.top + pHeight - ((safeErr - 0) / (maxErr - 0)) * pHeight;
  };

  // Generate paths for each method
  const getLinePath = (methodKey: keyof Omit<ConvergencePoint, "n">) => {
    const pts: string[] = [];
    convergenceData.forEach((pt, i) => {
      const x = mapX(pt.n);
      const y = mapY(pt[methodKey]);
      pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    });
    return pts.join(" ");
  };

  return (
    <div id="error-convergence-section" className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold mb-1 border border-blue-100">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>模块 4 · 分割数与逼近误差 (n vs Error) 2D 动态收敛演播</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              各积分数值算法收敛阶与极限逼近速度评定
            </h2>
          </div>

          {/* Coordinate Scale Toggle */}
          <div className="flex items-center gap-2">
            <div className="p-1 bg-slate-100 rounded-lg flex items-center gap-1 border border-slate-200">
              <button
                id="btn-scale-loglog"
                onClick={() => setPlotMode("loglog")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  plotMode === "loglog"
                    ? "bg-blue-600 text-white shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                双对数坐标 (Log-Log)
              </button>
              <button
                id="btn-scale-linear"
                onClick={() => setPlotMode("linear")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  plotMode === "linear"
                    ? "bg-blue-600 text-white shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                线性坐标 (Linear)
              </button>
            </div>
          </div>
        </div>

        {/* Method Visibility Toggles and Slope Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer select-none">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedMethods.left}
                onChange={(e) => setSelectedMethods({ ...selectedMethods, left: e.target.checked })}
                className="rounded text-rose-500 focus:ring-rose-500"
              />
              <span className="text-xs font-bold text-slate-700">左端点法</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              O(1/n) · 斜率 {leftSlope.toFixed(2)}
            </span>
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer select-none">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedMethods.trapezoid}
                onChange={(e) => setSelectedMethods({ ...selectedMethods, trapezoid: e.target.checked })}
                className="rounded text-amber-500 focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-slate-700">梯形法</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              O(1/n²) · 斜率 {trapSlope.toFixed(2)}
            </span>
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer select-none">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedMethods.midpoint}
                onChange={(e) => setSelectedMethods({ ...selectedMethods, midpoint: e.target.checked })}
                className="rounded text-sky-500 focus:ring-sky-500"
              />
              <span className="text-xs font-bold text-slate-700">中点法</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              O(1/n²) · 斜率 {midSlope.toFixed(2)}
            </span>
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer select-none">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedMethods.simpson}
                onChange={(e) => setSelectedMethods({ ...selectedMethods, simpson: e.target.checked })}
                className="rounded text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-700">辛普森法</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              O(1/n⁴) · 斜率 {simpSlope.toFixed(2)}
            </span>
          </label>
        </div>
      </div>

      {/* 2D Error Convergence Chart Canvas */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="relative w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-800">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none">
            {/* Grid lines */}
            <g className="opacity-15">
              {[2, 8, 32, 128, 512].map((nx) => (
                <line
                  key={`cgx-${nx}`}
                  x1={mapX(nx)}
                  y1={pad.top}
                  x2={mapX(nx)}
                  y2={pad.top + pHeight}
                  stroke="#94a3b8"
                  strokeDasharray="2,2"
                />
              ))}
              {plotMode === "loglog" &&
                [0, -2, -4, -6, -8, -10].map((ly) => (
                  <line
                    key={`cgy-${ly}`}
                    x1={pad.left}
                    y1={pad.top + pHeight - ((ly - logMinErr) / (logMaxErr - logMinErr)) * pHeight}
                    x2={pad.left + pWidth}
                    y2={pad.top + pHeight - ((ly - logMinErr) / (logMaxErr - logMinErr)) * pHeight}
                    stroke="#94a3b8"
                    strokeDasharray="2,2"
                  />
                ))}
            </g>

            {/* Axes */}
            <line x1={pad.left} y1={pad.top + pHeight} x2={pad.left + pWidth} y2={pad.top + pHeight} stroke="#64748b" strokeWidth="1.5" />
            <line x1={pad.left} y1={pad.top + pHeight} x2={pad.left} y2={pad.top} stroke="#64748b" strokeWidth="1.5" />

            {/* Axis Tick Labels */}
            {[2, 8, 32, 128, 512].map((nx) => (
              <text
                key={`lbl-nx-${nx}`}
                x={mapX(nx)}
                y={pad.top + pHeight + 20}
                fill="#94a3b8"
                fontSize="11"
                textAnchor="middle"
                fontFamily="monospace"
              >
                n={nx}
              </text>
            ))}

            {plotMode === "loglog"
              ? [0, -2, -4, -6, -8, -10].map((ly) => (
                  <text
                    key={`lbl-ly-${ly}`}
                    x={pad.left - 8}
                    y={pad.top + pHeight - ((ly - logMinErr) / (logMaxErr - logMinErr)) * pHeight + 4}
                    fill="#94a3b8"
                    fontSize="10"
                    textAnchor="end"
                    fontFamily="monospace"
                  >
                    10^{ly}
                  </text>
                ))
              : [0, 0.2, 0.4, 0.6, 0.8, 1.0].map((f) => {
                  const val = maxErr * f;
                  return (
                    <text
                      key={`lbl-lin-${f}`}
                      x={pad.left - 8}
                      y={pad.top + pHeight - f * pHeight + 4}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {val.toFixed(2)}
                    </text>
                  );
                })}

            {/* Curves */}
            {selectedMethods.left && (
              <path d={getLinePath("leftError")} fill="none" stroke="#f43f5e" strokeWidth="2.5" />
            )}
            {selectedMethods.trapezoid && (
              <path d={getLinePath("trapezoidError")} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
            )}
            {selectedMethods.midpoint && (
              <path d={getLinePath("midpointError")} fill="none" stroke="#0284c7" strokeWidth="2.5" />
            )}
            {selectedMethods.simpson && (
              <path d={getLinePath("simpsonError")} fill="none" stroke="#10b981" strokeWidth="3" />
            )}

            {/* Node Dots */}
            {convergenceData.map((pt) => (
              <g key={`dots-${pt.n}`}>
                {selectedMethods.left && (
                  <circle cx={mapX(pt.n)} cy={mapY(pt.leftError)} r="3.5" fill="#f43f5e" />
                )}
                {selectedMethods.trapezoid && (
                  <circle cx={mapX(pt.n)} cy={mapY(pt.trapezoidError)} r="3.5" fill="#f59e0b" />
                )}
                {selectedMethods.midpoint && (
                  <circle cx={mapX(pt.n)} cy={mapY(pt.midpointError)} r="3.5" fill="#0284c7" />
                )}
                {selectedMethods.simpson && (
                  <circle cx={mapX(pt.n)} cy={mapY(pt.simpsonError)} r="4" fill="#10b981" />
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Theoretical Error Bounds Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-700 block mb-1">
              梯形法理论误差上界 (Trapezoid Error Bound)
            </span>
            <div className="my-2 p-2 bg-white rounded-lg border border-slate-200 text-center">
              <MathFormula formula="|E_T| \le \frac{M_2 (b-a)^3}{12 n^2}" block />
            </div>
            <div className="text-[11px] text-slate-500 leading-relaxed">
              <MathText text="其中 $M_2 = \max |f''(x)|$。当分割数 $n$ 翻倍时，误差下降至原有的 $\frac{1}{4}$ ($O(1/n^2)$)。" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-700 block mb-1">
              辛普森法理论误差上界 (Simpson's Error Bound)
            </span>
            <div className="my-2 p-2 bg-white rounded-lg border border-slate-200 text-center">
              <MathFormula formula="|E_S| \le \frac{M_4 (b-a)^5}{180 n^4}" block />
            </div>
            <div className="text-[11px] text-slate-500 leading-relaxed">
              <MathText text="其中 $M_4 = \max |f^{(4)}(x)|$。当分割数 $n$ 翻倍时，误差急剧下降至原有的 $\frac{1}{16}$ ($O(1/n^4)$)。" />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 font-mono">分割数 n</th>
                <th className="px-4 py-2.5">左端点误差</th>
                <th className="px-4 py-2.5">梯形法误差</th>
                <th className="px-4 py-2.5">中点法误差</th>
                <th className="px-4 py-2.5 text-emerald-700 font-bold">辛普森法误差</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {convergenceData.map((row) => (
                <tr key={row.n} className="hover:bg-slate-50/80">
                  <td className="px-4 py-2 font-bold text-slate-800">{row.n}</td>
                  <td className="px-4 py-2 text-rose-600">{row.leftError.toExponential(3)}</td>
                  <td className="px-4 py-2 text-amber-600">{row.trapezoidError.toExponential(3)}</td>
                  <td className="px-4 py-2 text-sky-600">{row.midpointError.toExponential(3)}</td>
                  <td className="px-4 py-2 text-emerald-600 font-bold">{row.simpsonError.toExponential(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
