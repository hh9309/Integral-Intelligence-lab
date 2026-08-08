/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { normalPDF, integrateNormal } from '../mathUtils';
import { ProbabilityConfig } from '../types';
import { Slider } from './ui-mini';
import { Percent, Shuffle, Sliders, Info, Milestone } from 'lucide-react';

interface ProbabilityDensityProps {
  config: ProbabilityConfig;
  onChange: (config: ProbabilityConfig) => void;
  onStateUpdate: (summaryData: any) => void;
}

export default function ProbabilityDensity({ config, onChange, onStateUpdate }: ProbabilityDensityProps) {
  const { mean, stdDev, x1, x2 } = config;

  // Make sure bounds are sorted for integration
  const xLower = useMemo(() => Math.min(x1, x2), [x1, x2]);
  const xUpper = useMemo(() => Math.max(x1, x2), [x1, x2]);

  // High precision numerical integration
  const probability = useMemo(() => {
    return integrateNormal(xLower, xUpper, mean, stdDev, 400);
  }, [xLower, xUpper, mean, stdDev]);

  // Sync state up to parent AI Insight
  useMemo(() => {
    const data = {
      mean: mean.toFixed(2),
      stdDev: stdDev.toFixed(2),
      x1: xLower.toFixed(3),
      x2: xUpper.toFixed(3),
      prob: probability
    };
    
    setTimeout(() => {
      onStateUpdate(data);
    }, 0);
  }, [mean, stdDev, xLower, xUpper, probability]);

  // Dimensions
  const svgWidth = 640;
  const svgHeight = 280;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  // X limits of standard plot: -4.5 to 4.5
  const xMin = -4.5;
  const xMax = 4.5;
  // Y limit: fits max normal peak (which is 1/(0.4 * sqrt(2*pi)) = ~1.0)
  const yMin = -0.05;
  const yMax = 1.05;

  const scaleX = (x: number) => {
    return paddingLeft + ((x - xMin) / (xMax - xMin)) * (svgWidth - paddingLeft - paddingRight);
  };

  const scaleY = (y: number) => {
    return svgHeight - paddingBottom - ((y - yMin) / (yMax - yMin)) * (svgHeight - paddingTop - paddingBottom);
  };

  // Build Gaussian curve points
  const gCurvePoints = useMemo(() => {
    const points = [];
    const step = (xMax - xMin) / 150;
    for (let x = xMin; x <= xMax; x += step) {
      points.push(`${scaleX(x)},${scaleY(normalPDF(x, mean, stdDev))}`);
    }
    return points.join(' ');
  }, [mean, stdDev]);

  // Build shaded integration region points between xLower and xUpper
  const shadedPoints = useMemo(() => {
    if (xLower >= xUpper) return '';
    const points = [];
    const step = (xUpper - xLower) / 100;

    // Start at baseline (xLower, 0)
    points.push(`${scaleX(xLower)},${scaleY(0)}`);
    
    // Graph boundary
    for (let x = xLower; x <= xUpper + 0.001; x += step) {
       points.push(`${scaleX(x)},${scaleY(normalPDF(x, mean, stdDev))}`);
    }

    // End at baseline (xUpper, 0)
    points.push(`${scaleX(xUpper)},${scaleY(0)}`);

    return points.join(' ');
  }, [mean, stdDev, xLower, xUpper]);

  return (
    <div id="prob-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Visual Canvas Panel */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        
        {/* Header summary */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
              <Percent className="size-4 text-indigo-650" />
              高斯正态分布底面积分（概率统计）
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">连续随机变量落于区间 [x1, x2] 的概率即为该段 PDF 的面积积分</p>
          </div>
          <span className="font-mono text-xs text-indigo-600 bg-indigo-50 border border-indigo-110 px-3 py-1.5 rounded-lg font-bold">
            P({xLower.toFixed(2)} ≤ X ≤ {xUpper.toFixed(2)}) = {(probability * 100).toFixed(2)}%
          </span>
        </div>

        {/* Math PDF SVG Canvas */}
        <div className="relative bg-slate-50/50 rounded-xl border border-slate-200/50 p-2 overflow-hidden flex-1 flex items-center justify-center min-h-[290px]">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-h-[300px] select-none text-[10px]">
            {/* Grid */}
            <g stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3">
              {Array.from({ length: 11 }).map((_, i) => {
                const xVal = xMin + (i * (xMax - xMin)) / 10;
                return <line key={i} x1={scaleX(xVal)} y1={scaleY(yMin)} x2={scaleX(xVal)} y2={scaleY(yMax)} />;
              })}
              {/* Horizontal grids */}
              {Array.from({ length: 6 }).map((_, i) => {
                const yVal = yMin + (i * (yMax - yMin)) / 5;
                if (yVal < 0) return null;
                return <line key={i} x1={scaleX(xMin)} y1={scaleY(yVal)} x2={scaleX(xMax)} y2={scaleY(yVal)} />;
              })}
            </g>

            {/* Baseline */}
            <line x1={scaleX(xMin)} y1={scaleY(0)} x2={scaleX(xMax)} y2={scaleY(0)} stroke="#475569" strokeWidth="1.5" />
            <line x1={scaleX(0)} y1={scaleY(yMin)} x2={scaleX(0)} y2={scaleY(yMax)} stroke="#475569" strokeWidth="1.2" strokeDasharray="5 5" />

            {/* Shaded Area representative of Probability */}
            {shadedPoints && (
              <polygon
                points={shadedPoints}
                fill="url(#probGrad)"
                className="stroke-indigo-400/30 stroke-1 hover:fill-indigo-400/35 transition-all"
              />
            )}

            {/* PDF Curve path */}
            <polyline
              points={gCurvePoints}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2.5"
            />

            {/* Lower Bound line indicator */}
            <line
              x1={scaleX(xLower)}
              y1={scaleY(0)}
              x2={scaleX(xLower)}
              y2={scaleY(normalPDF(xLower, mean, stdDev))}
              stroke="#4338ca"
              strokeWidth="1.5"
            />
            <circle cx={scaleX(xLower)} cy={scaleY(normalPDF(xLower, mean, stdDev))} r="3.5" fill="#4338ca" />

            {/* Upper Bound line indicator */}
            <line
              x1={scaleX(xUpper)}
              y1={scaleY(0)}
              x2={scaleX(xUpper)}
              y2={scaleY(normalPDF(xUpper, mean, stdDev))}
              stroke="#4338ca"
              strokeWidth="1.5"
            />
            <circle cx={scaleX(xUpper)} cy={scaleY(normalPDF(xUpper, mean, stdDev))} r="3.5" fill="#4338ca" />

            {/* Scale texts on X-axis */}
            {[-3, -2, -1, 0, 1, 2, 3].map((val) => (
              <g key={val}>
                <line x1={scaleX(val)} y1={scaleY(0)} x2={scaleX(val)} y2={scaleY(0) + 4} stroke="#475569" />
                <text x={scaleX(val)} y={scaleY(0) + 15} textAnchor="middle" className="fill-slate-600 font-mono font-semibold">{val}</text>
              </g>
            ))}

            <text x={scaleX(xLower)} y={scaleY(0) + 26} textAnchor="middle" className="fill-indigo-600 font-bold font-mono">x₁={xLower.toFixed(2)}</text>
            <text x={scaleX(xUpper)} y={scaleY(0) + 26} textAnchor="middle" className="fill-indigo-600 font-bold font-mono">x₂={xUpper.toFixed(2)}</text>

            <text x={scaleX(xMax) - 6} y={scaleY(0) - 6} textAnchor="end" className="fill-slate-500 font-mono">X (偏差度)</text>
            <text x={scaleX(0) + 6} y={scaleY(yMax) + 10} textAnchor="start" className="fill-indigo-805 font-mono">PDF f(x)</text>

            {/* Gradient definition */}
            <defs>
              <linearGradient id="probGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.05" />
              </linearGradient>
            </defs>
          </svg>
        </div>

      </div>

      {/* Control Station Panel */}
      <div className="lg:col-span-4 flex flex-col gap-5">
        
        {/* Sliders: Distribution Shape parameters */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h4 className="font-semibold text-slate-850 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Sliders className="size-4 text-indigo-600" />
            PDF 分布形状参数
          </h4>

          {/* Mean Slider (mu) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-500">均值 (μ) - 左右对称轴位置</span>
              <span className="font-mono text-xs text-indigo-650 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/60">{mean.toFixed(2)}</span>
            </div>
            <Slider
              min={-2.0}
              max={2.0}
              step={0.1}
              value={mean}
              onChange={(val) => onChange({ ...config, mean: val })}
              colorClass="text-indigo-600"
            />
          </div>

          {/* Standard Deviation (sigma) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-500">标准差 (σ) - 离散胖瘦度</span>
              <span className="font-mono text-xs text-indigo-650 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/60">{stdDev.toFixed(2)}</span>
            </div>
            <Slider
              min={0.4}
              max={1.8}
              step={0.05}
              value={stdDev}
              onChange={(val) => onChange({ ...config, stdDev: val })}
              colorClass="text-indigo-600"
            />
          </div>
        </div>

        {/* Sliders: Bounds of integration [x1, x2] */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex-1 justify-center flex flex-col">
          <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Percent className="size-4 text-indigo-600" />
            定积分区间边界 [x₁, x₂]
          </h4>

          {/* x1 slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-500">积分下限 (x₁)</span>
              <span className="font-mono text-xs text-indigo-650 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/60">{x1.toFixed(2)}</span>
            </div>
            <Slider
              min={-4.0}
              max={4.0}
              step={0.1}
              value={x1}
              onChange={(val) => onChange({ ...config, x1: val })}
              colorClass="text-indigo-600"
            />
          </div>

          {/* x2 slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-500">积分上限 (x₂)</span>
              <span className="font-mono text-xs text-indigo-650 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/60">{x2.toFixed(2)}</span>
            </div>
            <Slider
              min={-4.0}
              max={4.0}
              step={0.1}
              value={x2}
              onChange={(val) => onChange({ ...config, x2: val })}
              colorClass="text-indigo-600"
            />
          </div>
        </div>

        {/* Probability Meaning Box */}
        <div className="bg-indigo-900 text-white rounded-2xl p-5 shadow-md space-y-3.5">
          <h4 className="text-indigo-100 font-bold text-sm flex items-center gap-1.5">
            <Info className="size-4 text-indigo-300" />
            概率论之中的定积分
          </h4>
          <p className="text-xs text-indigo-200/90 leading-relaxed font-sans">
            连续随机变量在某一点的概率其实是“零”（无厚度线），只有在区间内累积才有物理意义。
          </p>
          <div className="bg-indigo-950/60 p-3.5 rounded-xl border border-indigo-800 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-indigo-205">随机事件区间范围</span>
              <span className="font-bold">[{xLower.toFixed(2)}, {xUpper.toFixed(2)}]</span>
            </div>
            <div className="flex justify-between items-center text-xs text-indigo-100 border-t border-indigo-800/80 pt-1.5 mt-1">
              <span>积分所得事件概率 P</span>
              <span className="font-bold text-sm text-amber-300">{(probability * 100).toFixed(4)}%</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
