/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { RIEMANN_FUNCTIONS } from '../mathUtils';
import { AreaConfig } from '../types';
import { Slider } from './ui-mini';
import { Grid, HelpCircle, Activity, Info, TrendingUp } from 'lucide-react';

interface AreaAccumulatorProps {
  config: AreaConfig;
  onChange: (config: AreaConfig) => void;
  onStateUpdate: (summaryData: any) => void;
}

export default function AreaAccumulator({ config, onChange, onStateUpdate }: AreaAccumulatorProps) {
  const selectedFunc = useMemo(() => {
    return RIEMANN_FUNCTIONS.find(f => f.id === config.functionId) || RIEMANN_FUNCTIONS[0];
  }, [config.functionId]);

  const [a, b] = selectedFunc.range;
  const xCurrent = config.xCurrent === undefined ? a : config.xCurrent;

  // Calculate accumulated area: F(xCurrent) - F(a)
  const currentArea = useMemo(() => {
    return selectedFunc.integral(xCurrent) - selectedFunc.integral(a);
  }, [selectedFunc, xCurrent, a]);

  const totalArea = useMemo(() => {
    return selectedFunc.integral(b) - selectedFunc.integral(a);
  }, [selectedFunc, a, b]);

  // Update parent summary layout for AI insights
  useMemo(() => {
    const data = {
      funcLabel: selectedFunc.label,
      a: a.toFixed(3),
      xCurrent: xCurrent.toFixed(3),
      accumulatedArea: currentArea.toFixed(5)
    };
    
    setTimeout(() => {
      onStateUpdate(data);
    }, 0);
  }, [selectedFunc, xCurrent, currentArea, a]);

  // Canvas layout configurations
  const svgWidth = 620;
  const svgHeight = 200; // shorter height to stack two plots beautifully
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 15;
  const paddingBottom = 30;

  // Value limits
  const xMin = a - 0.2;
  const xMax = b + 0.2;
  const fMin = -0.1;
  const fMax = 3.5;

  const areaMin = -0.1;
  const areaMax = totalArea + 0.5;

  // Scale helpers
  const scaleX = (x: number) => {
    return paddingLeft + ((x - xMin) / (xMax - xMin)) * (svgWidth - paddingLeft - paddingRight);
  };

  const scaleYF = (y: number) => {
    return svgHeight - paddingBottom - ((y - fMin) / (fMax - fMin)) * (svgHeight - paddingTop - paddingBottom);
  };

  const scaleYFSum = (y: number) => {
    return svgHeight - paddingBottom - ((y - areaMin) / (areaMax - areaMin)) * (svgHeight - paddingTop - paddingBottom);
  };

  // Build f(t) curve points
  const fPoints = useMemo(() => {
    const points = [];
    const step = (xMax - xMin) / 120;
    for (let x = xMin; x <= xMax; x += step) {
      points.push(`${scaleX(x)},${scaleYF(selectedFunc.expr(x))}`);
    }
    return points.join(' ');
  }, [selectedFunc, xMin, xMax]);

  // Build F(x) antiderivative curve points up to xCurrent showing the historical path
  const FPoints = useMemo(() => {
    const points = [];
    const step = (xCurrent - a) / 100;
    if (xCurrent > a) {
      for (let x = a; x <= xCurrent + 0.001; x += step) {
        const yVal = selectedFunc.integral(x) - selectedFunc.integral(a);
        points.push(`${scaleX(x)},${scaleYFSum(yVal)}`);
      }
    }
    return points.join(' ');
  }, [selectedFunc, a, xCurrent]);

  // Complete F(x) path up to b (faded dotted guide)
  const FGuidePoints = useMemo(() => {
    const points = [];
    const step = (b - a) / 120;
    for (let x = a; x <= b; x += step) {
      const yVal = selectedFunc.integral(x) - selectedFunc.integral(a);
      points.push(`${scaleX(x)},${scaleYFSum(yVal)}`);
    }
    return points.join(' ');
  }, [selectedFunc, a, b]);

  // Build the filled area polygon coordinates for f(t) between a and xCurrent
  const areaFilledPoints = useMemo(() => {
    if (xCurrent <= a) return '';
    const points = [];
    const step = (xCurrent - a) / 100;
    
    // Start at bottom left (a, 0)
    points.push(`${scaleX(a)},${scaleYF(0)}`);
    
    // Follow the curve values
    for (let x = a; x <= xCurrent; x += step) {
      points.push(`${scaleX(x)},${scaleYF(selectedFunc.expr(x))}`);
    }
    
    // Bottom right (xCurrent, 0)
    points.push(`${scaleX(xCurrent)},${scaleYF(0)}`);
    
    return points.join(' ');
  }, [selectedFunc, a, xCurrent]);

  return (
    <div id="area-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Visual Workspace: Stacked graphs */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
        
        {/* Top Graph: Original Function with integration sweep */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 animate-pulse" />
              1. 被积原函数 f(t) 上的积体扫掠
            </span>
            <span className="text-[10px] font-mono text-slate-400">自变量 t 扫过区间 [a, x]</span>
          </div>

          <div className="bg-slate-50/50 rounded-xl border border-slate-200/50 p-1.5">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-h-[160px] select-none text-[9px]">
              {/* Grid */}
              <g stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3">
                {Array.from({ length: 9 }).map((_, i) => {
                  const xVal = xMin + (i * (xMax - xMin)) / 8;
                  return <line key={i} x1={scaleX(xVal)} y1={scaleYF(fMin)} x2={scaleX(xVal)} y2={scaleYF(fMax)} />;
                })}
              </g>

              {/* Base axis */}
              <line x1={scaleX(xMin)} y1={scaleYF(0)} x2={scaleX(xMax)} y2={scaleYF(0)} stroke="#475569" strokeWidth="1.2" />
              <line x1={scaleX(0)} y1={scaleYF(fMin)} x2={scaleX(0)} y2={scaleYF(fMax)} stroke="#475569" strokeWidth="1.2" />

              {/* Shaded Area */}
              {areaFilledPoints && (
                <polygon
                  points={areaFilledPoints}
                  fill="url(#areaGrad)"
                  className="stroke-indigo-500/30 font-semibold"
                />
              )}

              {/* Original plot */}
              <polyline points={fPoints} fill="none" stroke="#334155" strokeWidth="2" />

              {/* Sweeper vertical rule */}
              <line
                x1={scaleX(xCurrent)}
                y1={scaleYF(fMin)}
                x2={scaleX(xCurrent)}
                y2={scaleYF(fMax)}
                stroke="#4f46e5"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />

              {/* Left constant border marker */}
              <line x1={scaleX(a)} y1={scaleYF(fMin)} x2={scaleX(a)} y2={scaleYF(fMax)} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />

              {/* Gradient definition */}
              <defs>
                <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              <text x={scaleX(a)} y={scaleYF(0) + 12} textAnchor="middle" className="fill-slate-600 font-bold font-mono">a = {a.toFixed(1)}</text>
              <text x={scaleX(xCurrent)} y={scaleYF(selectedFunc.expr(xCurrent)) - 10} textAnchor="middle" className="fill-indigo-700 font-bold font-mono bg-white">x = {xCurrent.toFixed(2)}</text>
              <text x={scaleX(xMax) - 6} y={scaleYF(0) - 4} textAnchor="end" className="fill-slate-600 font-mono">t</text>
              <text x={scaleX(0) - 6} y={scaleYF(fMax) + 8} textAnchor="end" className="fill-slate-600 font-mono">f(t)</text>
            </svg>
          </div>
        </div>

        {/* Bottom Graph: Cumulative Area function F(x) */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-500 animate-pulse" />
              2. 累积面积原函数 A(x) = ∫[a, x] f(t) dt
            </span>
            <span className="text-[10px] font-mono text-slate-400">定积分的原函数物理实质是累加高度</span>
          </div>

          <div className="bg-slate-50/50 rounded-xl border border-slate-200/50 p-1.5">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-h-[160px] select-none text-[9px]">
              {/* Grid */}
              <g stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3">
                {Array.from({ length: 9 }).map((_, i) => {
                  const xVal = xMin + (i * (xMax - xMin)) / 8;
                  return <line key={i} x1={scaleX(xVal)} y1={scaleYFSum(areaMin)} x2={scaleX(xVal)} y2={scaleYFSum(areaMax)} />;
                })}
              </g>

              {/* Base axis */}
              <line x1={scaleX(xMin)} y1={scaleYFSum(0)} x2={scaleX(xMax)} y2={scaleYFSum(0)} stroke="#475569" strokeWidth="1.2" />
              <line x1={scaleX(0)} y1={scaleYFSum(areaMin)} x2={scaleX(0)} y2={scaleYFSum(areaMax)} stroke="#475569" strokeWidth="1.2" />

              {/* Dotted total guide */}
              {FGuidePoints && (
                <polyline points={FGuidePoints} fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 3" />
              )}

              {/* Drawing active accumulated curve */}
              {FPoints && (
                <polyline points={FPoints} fill="none" stroke="#4f46e5" strokeWidth="2.2" />
              )}

              {/* Scanning indicator rule */}
              <line
                x1={scaleX(xCurrent)}
                y1={scaleYFSum(areaMin)}
                x2={scaleX(xCurrent)}
                y2={scaleYFSum(areaMax)}
                stroke="#4f46e5"
                strokeWidth="1"
                strokeDasharray="4 2"
              />

              {/* Glowing tracker dot at head */}
              <circle
                cx={scaleX(xCurrent)}
                cy={scaleYFSum(currentArea)}
                r="5"
                fill="#4f46e5"
                className="stroke-white stroke-[1.5]"
              />
              <circle
                cx={scaleX(xCurrent)}
                cy={scaleYFSum(currentArea)}
                r="9"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="1"
                className="animate-ping"
              />

              <text x={scaleX(a)} y={scaleYFSum(0) + 12} textAnchor="middle" className="fill-slate-600 font-bold font-mono">a = {a.toFixed(1)}</text>
              <text x={scaleX(xCurrent) + 10} y={scaleYFSum(currentArea) - 4} textAnchor="start" className="fill-slate-900 font-bold font-mono bg-white rounded px-1.5 border border-slate-205">
                A({xCurrent.toFixed(2)}) = {currentArea.toFixed(4)}
              </text>
              
              <text x={scaleX(xMax) - 6} y={scaleYFSum(0) - 4} textAnchor="end" className="fill-slate-600 font-mono">x</text>
              <text x={scaleX(0) - 6} y={scaleYFSum(areaMax) + 8} textAnchor="end" className="fill-slate-600 font-mono">A(x)</text>
            </svg>
          </div>
        </div>

      </div>

      {/* Control Station Side panel */}
      <div className="lg:col-span-4 flex flex-col gap-5">
        
        {/* Math Function Picker */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h4 className="font-semibold text-slate-800 text-sm mb-3">数学测试曲线</h4>
          <div className="space-y-2">
            {RIEMANN_FUNCTIONS.map((f) => (
              <button
                key={f.id}
                onClick={() => onChange({ ...config, functionId: f.id, xCurrent: f.range[0] })}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-all flex items-center justify-between ${
                  config.functionId === f.id
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-900 font-semibold'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/40 text-slate-600'
                }`}
              >
                <span>{f.label}</span>
                {config.functionId === f.id && <div className="size-1.5 rounded-full bg-indigo-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Sweep X Controller */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-800 text-sm">积分终点 (x)</h4>
            <span className="font-mono text-indigo-700 font-bold text-sm bg-indigo-50 border border-indigo-100/60 px-2 py-0.5 rounded-md">
              x = {xCurrent.toFixed(2)}
            </span>
          </div>
          <Slider
            min={a}
            max={b}
            step={0.01}
            value={xCurrent}
            onChange={(val) => onChange({ ...config, xCurrent: val })}
            colorClass="text-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-2">
            <span>起点 a = {a.toFixed(1)}</span>
            <span>拖拽滑块给面积扫底</span>
            <span>终点 b = {b.toFixed(1)}</span>
          </div>
        </div>

        {/* Intuitive Theorem of Calculus interpretation */}
        <div className="bg-white border border-slate-205 rounded-2xl p-5 flex flex-col justify-between flex-1 shadow-sm">
          <div className="space-y-3.5">
            <h4 className="text-slate-800 font-bold text-sm flex items-center gap-2">
              <TrendingUp className="size-4 text-indigo-600" />
              微积分基本定理的直观实质
            </h4>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              观察上图，当您将自变量 <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">x</code> 向右拉动时：
            </p>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex gap-1.5">
                <span className="text-indigo-600 font-bold">●</span>
                <span>扫过被积函数顶部的<strong>“瞬时高度 f(t)”</strong>，就会作为面积的<strong>“变化速度”</strong>，瞬间加进原函数中。</span>
              </li>
              <li className="flex gap-1.5">
                <span className="text-indigo-600 font-bold">●</span>
                <span>累加出来的整体面积 <code className="font-mono bg-slate-100 px-1">A(x)</code> 的增长率（即切线斜率）在数学极值下严格等于原函数的高度。即：<strong>A'(x) = f(x)</strong>。</span>
              </li>
            </ul>

            <div className="border-t border-slate-200 pt-3.5 space-y-1 bg-slate-50/50 p-3 rounded-xl border-dashed border text-slate-750">
              <div className="flex items-center justify-between text-xs">
                <span>当前积分底面积 A({xCurrent.toFixed(2)})</span>
                <span className="font-mono font-bold text-indigo-600">{currentArea.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>总最大可得面积 A({b.toFixed(1)})</span>
                <span className="font-mono font-medium text-slate-500">{totalArea.toFixed(4)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
