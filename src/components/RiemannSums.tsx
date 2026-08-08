/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { RIEMANN_FUNCTIONS } from '../mathUtils';
import { RiemannConfig, RiemannSumType } from '../types';
import { Slider } from './ui-mini'; // standard custom slider to avoid shadcn bloat
import { Grid, Layers, RefreshCw, ZoomIn, Info } from 'lucide-react';

interface RiemannSumsProps {
  config: RiemannConfig;
  onChange: (config: RiemannConfig) => void;
  onStateUpdate: (summaryData: any) => void;
}

export default function RiemannSums({ config, onChange, onStateUpdate }: RiemannSumsProps) {
  const selectedFunc = useMemo(() => {
    return RIEMANN_FUNCTIONS.find(f => f.id === config.functionId) || RIEMANN_FUNCTIONS[0];
  }, [config.functionId]);

  const [hoveredRect, setHoveredRect] = useState<{ index: number; x: number; y: number; val: number } | null>(null);

  const [a, b] = selectedFunc.range;
  const n = config.n;
  const sumType = config.sumType;

  // Exact math calculations
  const exactValue = useMemo(() => {
    return selectedFunc.integral(b) - selectedFunc.integral(a);
  }, [selectedFunc, a, b]);

  const { riemannSumValue, intervals } = useMemo(() => {
    const dx = (b - a) / n;
    let sum = 0;
    const items = [];

    for (let i = 0; i < n; i++) {
      const xLeft = a + i * dx;
      const xRight = xLeft + dx;
      let xEval = xLeft;
      let yEval = 0;

      if (sumType === 'left') {
        xEval = xLeft;
        yEval = selectedFunc.expr(xEval);
        sum += yEval * dx;
      } else if (sumType === 'right') {
        xEval = xRight;
        yEval = selectedFunc.expr(xEval);
        sum += yEval * dx;
      } else if (sumType === 'mid') {
        xEval = (xLeft + xRight) / 2;
        yEval = selectedFunc.expr(xEval);
        sum += yEval * dx;
      } else if (sumType === 'trapezoid') {
        const yL = selectedFunc.expr(xLeft);
        const yR = selectedFunc.expr(xRight);
        yEval = (yL + yR) / 2; // average height for trapezoid calculation
        sum += yEval * dx;
      }

      items.push({
        index: i,
        xLeft,
        xRight,
        xEval,
        yEval,
        yLeft: selectedFunc.expr(xLeft),
        yRight: selectedFunc.expr(xRight)
      });
    }

    // Call state update context to pass figures back to parent for AI analysis
    const formattedData = {
      funcLabel: selectedFunc.label,
      a: a.toFixed(3),
      b: b.toFixed(3),
      n: n,
      sumTypeLabel: sumType === 'left' ? '左极限求和' : sumType === 'right' ? '右极限求和' : sumType === 'mid' ? '中点极限求和' : '梯形极限求和',
      dx: dx.toFixed(4),
      riemannSum: sum.toFixed(5),
      exact: exactValue.toFixed(5),
      error: Math.abs(exactValue - sum).toFixed(5)
    };
    
    // Defer update slightly to prevent rendering warning
    setTimeout(() => {
      onStateUpdate(formattedData);
    }, 0);

    return { riemannSumValue: sum, intervals: items };
  }, [selectedFunc, a, b, n, sumType, exactValue]);

  // Dimension scaling settings for SVG canvas (SVG width = 640, height = 360)
  const svgWidth = 640;
  const svgHeight = 340;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  // Bounds for Y plotting (auto calculate to fit curves beautifully)
  const xMin = a - 0.2;
  const xMax = b + 0.2;
  const yMin = -0.2;
  const yMax = 3.5; // fits curves beautifully

  const scaleX = (x: number) => {
    return paddingLeft + ((x - xMin) / (xMax - xMin)) * (svgWidth - paddingLeft - paddingRight);
  };

  const scaleY = (y: number) => {
    return svgHeight - paddingBottom - ((y - yMin) / (yMax - yMin)) * (svgHeight - paddingTop - paddingBottom);
  };

  // Build function curve path
  const curvePoints = useMemo(() => {
    const points = [];
    const step = (xMax - xMin) / 150;
    for (let x = xMin; x <= xMax; x += step) {
      points.push(`${scaleX(x)},${scaleY(selectedFunc.expr(x))}`);
    }
    return points.join(' ');
  }, [selectedFunc, xMin, xMax]);

  return (
    <div id="riemann-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Visual Canvas Panel */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-semibold text-slate-900 text-base flex items-center gap-2">
              <Layers className="size-4 text-indigo-600 animate-pulse" />
              黎曼和动态几何逼近 (Riemann Area Approximation)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">区间 [{a.toFixed(1)}, {b.toFixed(1)}] · 鼠标悬停展示单个微积段 (dx) 的精细面积贡献值</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-500 bg-slate-50 border border-slate-105 px-3 py-1.5 rounded-lg">
            <span className="font-semibold text-indigo-600">dx = {((b - a) / n).toFixed(4)}</span>
          </div>
        </div>

        {/* Dynamic Mathematical SVG Canvas */}
        <div className="relative bg-slate-50/50 rounded-xl border border-slate-200/50 p-2 overflow-hidden flex-1 flex items-center justify-center min-h-[300px]">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-h-[360px] select-none text-[10px]">
            
            {/* Draw grid lines */}
            <g stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3">
              {/* Vertical grids */}
              {Array.from({ length: 9 }).map((_, i) => {
                const xVal = xMin + (i * (xMax - xMin)) / 8;
                return <line key={i} x1={scaleX(xVal)} y1={scaleY(yMin)} x2={scaleX(xVal)} y2={scaleY(yMax)} />;
              })}
              {/* Horizontal grids */}
              {Array.from({ length: 6 }).map((_, i) => {
                const yVal = yMin + (i * (yMax - yMin)) / 5;
                return <line key={i} x1={scaleX(xMin)} y1={scaleY(yVal)} x2={scaleX(xMax)} y2={scaleY(yVal)} />;
              })}
            </g>

            {/* Axes */}
            <line x1={scaleX(xMin)} y1={scaleY(0)} x2={scaleX(xMax)} y2={scaleY(0)} stroke="#475569" strokeWidth="1.5" />
            <line x1={scaleX(0)} y1={scaleY(yMin)} x2={scaleX(0)} y2={scaleY(yMax)} stroke="#475569" strokeWidth="1.5" />

            {/* Area limits indicators (dashed vertical limits) */}
            <line x1={scaleX(a)} y1={scaleY(0)} x2={scaleX(a)} y2={scaleY(selectedFunc.expr(a))} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
            <line x1={scaleX(b)} y1={scaleY(0)} x2={scaleX(b)} y2={scaleY(selectedFunc.expr(b))} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />

            {/* Draw Riemann approximation elements */}
            <g>
              {intervals.map((item) => {
                const xL = scaleX(item.xLeft);
                const xR = scaleX(item.xRight);
                const rectW = Math.max(0.5, xR - xL);
                
                if (sumType === 'trapezoid') {
                  const yL = scaleY(item.yLeft);
                  const yR = scaleY(item.yRight);
                  const y0 = scaleY(0);
                  const polygonPoints = `${xL},${y0} ${xL},${yL} ${xR},${yR} ${xR},${y0}`;
                  
                  return (
                    <polygon
                      key={item.index}
                      points={polygonPoints}
                      className="fill-indigo-500/15 stroke-indigo-500/40 hover:fill-indigo-500/30 hover:stroke-indigo-600 transition-colors"
                      onMouseEnter={(e) => setHoveredRect({
                        index: item.index,
                        x: (xL + xR) / 2,
                        y: (yL + yR) / 2,
                        val: item.yEval * ((b - a) / n)
                      })}
                      onMouseLeave={() => setHoveredRect(null)}
                    />
                  );
                } else {
                  const yTop = scaleY(item.yEval);
                  const yBase = scaleY(0);
                  const rectH = Math.max(0.5, yBase - yTop);

                  return (
                    <rect
                      key={item.index}
                      x={xL}
                      y={yTop}
                      width={rectW}
                      height={rectH}
                      className="fill-indigo-500/15 stroke-indigo-500/40 hover:fill-indigo-500/30 hover:stroke-indigo-600 transition-colors"
                      onMouseEnter={(e) => setHoveredRect({
                        index: item.index,
                        x: xL + rectW / 2,
                        y: yTop,
                        val: item.yEval * ((b - a) / n)
                      })}
                      onMouseLeave={() => setHoveredRect(null)}
                    />
                  );
                }
              })}
            </g>

            {/* Continuous curve plot */}
            <polyline
              points={curvePoints}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2.5"
            />

            {/* Exact Integration area shading (Very subtle outline or tint behind rectangles) */}
            <ellipse cx={scaleX(a)} cy={scaleY(selectedFunc.expr(a))} rx="3.5" ry="3.5" fill="#10b981" />
            <ellipse cx={scaleX(b)} cy={scaleY(selectedFunc.expr(b))} rx="3.5" ry="3.5" fill="#10b981" />

            {/* Labels and values on Axis */}
            <text x={scaleX(a)} y={scaleY(0) + 16} textAnchor="middle" className="fill-slate-600 font-mono font-semibold">a = {a.toFixed(1)}</text>
            <text x={scaleX(b)} y={scaleY(0) + 16} textAnchor="middle" className="fill-slate-600 font-mono font-semibold">b = {b.toFixed(1)}</text>
            <text x={scaleX(0) - 8} y={scaleY(yMin) + 10} textAnchor="end" className="fill-slate-600 font-mono">y</text>
            <text x={scaleX(xMax) - 6} y={scaleY(0) - 6} textAnchor="end" className="fill-slate-600 font-mono">x</text>

            <text x={svgWidth / 2} y={scaleY(yMax) + 10} textAnchor="middle" className="fill-slate-600 font-sans italic font-medium">f(x)</text>

            {/* Scale markings on axes */}
            {Array.from({ length: 5 }).map((_, i) => {
              const markerY = 1 + i * 0.7;
              if (markerY > yMax) return null;
              return (
                <g key={i} className="fill-slate-400 font-mono text-[9px]">
                  <line x1={scaleX(0) - 3} y1={scaleY(markerY)} x2={scaleX(0) + 3} y2={scaleY(markerY)} stroke="#64748b" strokeWidth="1" />
                  <text x={scaleX(0) - 6} y={scaleY(markerY) + 3} textAnchor="end">{markerY.toFixed(1)}</text>
                </g>
              );
            })}
          </svg>

          {/* Mouseover detailed popups */}
          {hoveredRect && (
            <div
              className="absolute bg-slate-900 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 text-xs font-mono pointer-events-none transform -translate-x-1/2 -translate-y-full flex flex-col shadow-md"
              style={{
                left: `${(hoveredRect.x / svgWidth) * 100}%`,
                top: `${(hoveredRect.y / svgHeight) * 100 - 10}%`
              }}
            >
              <span className="text-[10px] text-slate-400 leading-none mb-1">第 {hoveredRect.index + 1} 块微元面积</span>
              <span className="font-bold text-indigo-300">dS = {hoveredRect.val.toFixed(5)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Station Panel */}
      <div className="lg:col-span-4 flex flex-col gap-5">
        
        {/* Model Function Setting Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h4 className="font-semibold text-slate-850 text-sm mb-3">被积函数类型 (Functions)</h4>
          <div className="space-y-2">
            {RIEMANN_FUNCTIONS.map((f) => (
              <button
                key={f.id}
                onClick={() => onChange({ ...config, functionId: f.id })}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-all flex items-center justify-between ${
                  config.functionId === f.id
                    ? 'border-indigo-500 bg-indigo-50/45 text-indigo-950 font-bold'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/40 text-slate-600'
                }`}
              >
                <span>{f.label}</span>
                {config.functionId === f.id && <div className="size-1.5 rounded-full bg-indigo-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Rule Selector Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h4 className="font-semibold text-slate-850 text-sm mb-3">离散积分定界规则</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'left', label: '左矩黎曼和', desc: 'Eval at x_i' },
              { id: 'right', label: '右矩黎曼和', desc: 'Eval at x_{i+1}' },
              { id: 'mid', label: '中点黎曼和', desc: 'Eval at x_mid' },
              { id: 'trapezoid', label: '梯形求和', desc: 'Eval as slope' }
            ].map((rule) => (
              <button
                key={rule.id}
                onClick={() => onChange({ ...config, sumType: rule.id as RiemannSumType })}
                className={`px-3 py-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                  config.sumType === rule.id
                    ? 'border-indigo-500 bg-indigo-50/45 text-indigo-950 font-bold'
                    : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-slate-50/20'
                }`}
              >
                <span className="text-xs">{rule.label}</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">{rule.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quantization intervals count (N controller) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-850 text-sm">区间等分数 (N)</h4>
            <span className="font-mono text-indigo-600 font-bold text-sm bg-indigo-50 border border-indigo-100/60 px-2.5 py-0.5 rounded-md">
              {n} 等分
            </span>
          </div>
          <Slider
            min={4}
            max={100}
            step={1}
            value={n}
            onChange={(val) => onChange({ ...config, n: val })}
            colorClass="text-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-2">
            <span>4 低密度 (散沙)</span>
            <span>连续变化极限</span>
            <span>100 高密度 (丝滑)</span>
          </div>
        </div>

        {/* Precise Calculus Data Outputs (Indigo Theme card precisely matched custom mock design) */}
        <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-lg flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-indigo-200 text-xs font-bold uppercase tracking-widest flex items-center justify-between">
              累积总量比对 (Calculus comparison)
              <Info className="size-3.5 text-indigo-300" />
            </h3>

            {/* Sum comparison */}
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-indigo-100">离散黎曼累积 (Σ)</span>
                <span className="font-mono font-bold text-xl text-indigo-200">
                  {riemannSumValue.toFixed(5)}
                </span>
              </div>
              
              <div className="h-px bg-white/10 my-1"></div>

              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">连续定积分 (∫)</span>
                <span className="font-serif italic font-bold text-2xl text-white">
                  {exactValue.toFixed(5)}
                </span>
              </div>
            </div>

            {/* Error gauge */}
            <div className="border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-indigo-200">逼近绝对误差 (Δ)</span>
                <span className="font-mono text-xs text-amber-300 font-semibold">
                  {Math.abs(exactValue - riemannSumValue).toFixed(5)}
                </span>
              </div>
              
              {/* Dynamic status line describing error */}
              <p className="text-[11px] text-indigo-100/70 mt-2 leading-relaxed font-sans">
                {n < 16 
                  ? "区间数 N 较少，离散微元产生的锯齿误差较为明显。"
                  : "随着小积段 N 暴增，底宽 dx → 0，误差彻底在此融化！"
                }
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
