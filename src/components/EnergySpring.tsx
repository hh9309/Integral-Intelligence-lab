/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Slider } from './ui-mini';
import { Zap, HelpCircle, Dumbbell, Play, Scale } from 'lucide-react';

interface EnergySpringProps {
  onStateUpdate: (summaryData: any) => void;
}

export default function EnergySpring({ onStateUpdate }: EnergySpringProps) {
  const [k, setK] = useState<number>(100); // Spring Constant in N/m
  const [xCurrent, setXCurrent] = useState<number>(0.8); // spring compression / displacement in meters

  // Force at current compression
  const force = useMemo(() => {
    return k * xCurrent; // F = k*x
  }, [k, xCurrent]);

  // Integrated Energy stored (elastic potential energy): E_p = 0.5 * k * x^2
  const energy = useMemo(() => {
    return 0.5 * k * Math.pow(xCurrent, 2);
  }, [k, xCurrent]);

  // Sync state data back to parent
  useMemo(() => {
    const data = {
      k: k,
      x: xCurrent.toFixed(3),
      force: force.toFixed(2),
      energy: energy.toFixed(4)
    };

    setTimeout(() => {
      onStateUpdate(data);
    }, 0);
  }, [k, xCurrent, force, energy]);

  // Dimension scaling for the Force-Position Plot (width = 300, height = 180)
  const plotW = 300;
  const plotH = 160;
  const pl = 35;
  const pr = 15;
  const pt = 15;
  const pb = 30;

  const maxValX = 1.6; // Max X to plot in meters
  // Max force value to scale Y axis. At k=200, x=1.5 => F=300N
  const maxValF = 320; 

  const scaleX = (x: number) => {
    return pl + (x / maxValX) * (plotW - pl - pr);
  };

  const scaleY = (f: number) => {
    return plotH - pb - (f / maxValF) * (plotH - pt - pb);
  };

  // Coordinates for shaded energy triangle (Work Done ∫[0,xCurrent] k·u du)
  const trianglePoints = useMemo(() => {
    if (xCurrent <= 0) return "";
    const pts = [];
    pts.push(`${scaleX(0)},${scaleY(0)}`);
    pts.push(`${scaleX(xCurrent)},${scaleY(force)}`);
    pts.push(`${scaleX(xCurrent)},${scaleY(0)}`);
    return pts.join(" ");
  }, [xCurrent, force]);

  // Build spring physical visual: SVG spiral coil points dynamically squishing
  const springPath = useMemo(() => {
    const leftAnchor = 35;
    // Compress spring as xCurrent increases
    const rightAnchor = 220 - xCurrent * 90; // squishes spring to left from 220 to 85 px
    const numCoils = 13;
    const pathParts = [];

    // Start with a straight lead-in
    pathParts.push(`M ${leftAnchor},40`);
    pathParts.push(`L ${leftAnchor + 10},40`);

    const coilSpan = (rightAnchor - 10 - (leftAnchor + 10));
    const step = coilSpan / (numCoils * 4); // 4 points per turn

    for (let i = 0; i <= numCoils * 4; i++) {
      const px = leftAnchor + 10 + i * step;
      // Oscillate Y height around midline of 40px
      const angle = (i * Math.PI) / 2;
      const py = 40 + Math.sin(angle) * 12; // amplitude of coils: 12px
      pathParts.push(`L ${px},${py}`);
    }

    // Straight lead-out to block
    pathParts.push(`L ${rightAnchor},40`);

    return pathParts.join(" ");
  }, [xCurrent]);

  const blockPositionX = 220 - xCurrent * 90;

  return (
    <div id="energy-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Visual Workspace */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
        
        {/* Spring Compression Animation on Left/Top, plot on Right/Bottom */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1">
          
          {/* Animated physical mechanical system */}
          <div className="md:col-span-6 bg-slate-50/50 rounded-xl border border-slate-200/50 p-4 flex flex-col justify-between min-h-[180px] select-none">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
              <Dumbbell className="size-4 text-indigo-600 animate-pulse" />
              胡克定律弹性位移模拟：弹簧受压
            </span>

            {/* Mechanics Canvas */}
            <div className="relative w-full h-24 bg-white border border-slate-200 rounded-lg flex items-center p-2 overflow-hidden shadow-inner">
              
              <svg className="w-full h-full text-[10px]">
                {/* Horizontal floor */}
                <line x1="10" y1="52" x2="280" y2="52" stroke="#e2e8f0" strokeWidth="2" />
                
                {/* Vertical left fixed wall */}
                <rect x="20" y="15" width="15" height="37" fill="#1e293b" rx="2" />
                <line x1="35" y1="15" x2="35" y2="52" stroke="#0f172a" strokeWidth="1.5" />

                {/* Draw Elastic spiral Spring */}
                <path
                  d={springPath}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Compression direction indicator */}
                {xCurrent > 0 && (
                  <path d={`M ${230} 22 L ${blockPositionX + 15} 22`} fill="none" stroke="#4f46e5" strokeWidth="1" strokeDasharray="3 2" />
                )}

                {/* Draggable block representing force client receiver */}
                <g transform={`translate(${blockPositionX}, 20)`}>
                  <rect x="0" y="0" width="30" height="32" fill="#475569" rx="4" className="stroke-slate-800 stroke-[1.5]" />
                  {/* Eyes/Grid design to make it look cute */}
                  <circle cx="9" cy="11" r="2.5" fill="#fff" />
                  <circle cx="21" cy="11" r="2.5" fill="#fff" />
                  <circle cx="9" cy="11" r="1" fill="#000" />
                  <circle cx="21" cy="11" r="1" fill="#000" />
                  <path d="M 11 20 Q 15 23 19 20" fill="none" stroke="#fff" strokeWidth="1.5" />
                </g>

                {/* Static indicator markers for extension limit */}
                <line x1="220" y1="52" x2="220" y2="60" stroke="#cbd5e1" strokeWidth="1" />
                <text x="220" y="69" textAnchor="middle" className="fill-slate-400 font-mono text-[8px]">0m (常态原长)</text>

                {xCurrent > 0.05 && (
                  <g>
                    <line x1={blockPositionX + 15} y1="52" x2={blockPositionX + 15} y2="60" stroke="#4f46e5" strokeWidth="1" />
                    <text x={blockPositionX + 15} y="69" textAnchor="middle" className="fill-indigo-700 font-bold font-mono text-[8px]">x={xCurrent.toFixed(2)}m</text>
                  </g>
                )}
              </svg>
            </div>

            {/* Elastic potential formula display with cute widgets */}
            <div className="flex justify-between items-center bg-white border border-slate-200 p-3 rounded-lg text-xs mt-2">
              <span className="text-slate-500 font-medium">弹性胡克变力:</span>
              <span className="font-mono font-bold text-indigo-650 bg-indigo-50/50 px-2.5 py-1 rounded border border-indigo-110/30">F = k·x = {force.toFixed(1)} N</span>
            </div>
          </div>

          {/* Graphical Plot of Work Done */}
          <div className="md:col-span-6 bg-slate-50/50 rounded-xl border border-slate-200/50 p-4 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5">
                <Scale className="size-4 text-indigo-600" />
                胡克变力示意图 F(x) = k·x
              </span>
              <span className="text-[10px] text-slate-400 font-mono">三角形面积即为累积能量</span>
            </span>

            <svg viewBox={`0 0 ${plotW} ${plotH}`} className="w-full max-h-[160px] text-[8px] font-mono select-none my-1">
              {/* Axes */}
              <line x1={scaleX(0)} y1={scaleY(0)} x2={scaleX(maxValX)} y2={scaleY(0)} stroke="#475569" strokeWidth="1" />
              <line x1={scaleX(0)} y1={scaleY(0)} x2={scaleX(0)} y2={scaleY(300)} stroke="#475569" strokeWidth="1" />

              {/* Faint dotted gridlines */}
              <line x1={scaleX(0)} y1={scaleY(150)} x2={scaleX(maxValX)} y2={scaleY(150)} stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1={scaleX(0)} y1={scaleY(300)} x2={scaleX(maxValX)} y2={scaleY(300)} stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1={scaleX(0.8)} y1={scaleY(0)} x2={scaleX(0.8)} y2={scaleY(300)} stroke="#f1f5f9" strokeDasharray="3 3" />

              {/* Shaded triangle representing work done */}
              {trianglePoints && (
                <polygon points={trianglePoints} fill="url(#energyGrad)" />
              )}

              {/* Linear Force Curve */}
              <line
                x1={scaleX(0)}
                y1={scaleY(0)}
                x2={scaleX(maxValX)}
                y2={scaleY(k * maxValX)}
                stroke="#4f46e5"
                strokeWidth="2"
              />

              {/* Glowing tracker dot */}
              {xCurrent > 0 && (
                <g>
                  <circle cx={scaleX(xCurrent)} cy={scaleY(force)} r="3.5" fill="#4f46e5" />
                  <line x1={scaleX(xCurrent)} y1={scaleY(0)} x2={scaleX(xCurrent)} y2={scaleY(force)} stroke="#4f46e5" strokeWidth="1" strokeDasharray="2 1" />
                </g>
              )}

              {/* Coordinate markings */}
              <text x={scaleX(0)} y={scaleY(0) + 11} textAnchor="middle" className="fill-slate-400">0</text>
              <text x={scaleX(1.5)} y={scaleY(0) + 11} textAnchor="middle" className="fill-slate-400">1.5m</text>
              
              <text x={scaleX(0) - 4} y={scaleY(0)} textAnchor="end" className="fill-slate-400">0</text>
              <text x={scaleX(0) - 4} y={scaleY(150)} textAnchor="end" className="fill-slate-400">150N</text>
              <text x={scaleX(0) - 4} y={scaleY(300)} textAnchor="end" className="fill-slate-400">300N</text>

              <text x={plotW / 2} y={plotH - 2} textAnchor="middle" className="fill-slate-500 font-sans font-medium">压缩位移 x (米)</text>
              <text x={scaleX(0) - 4} y={scaleY(300) - 4} textAnchor="start" className="fill-slate-500 font-sans font-medium">变力 F (牛)</text>

              <defs>
                <linearGradient id="energyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.04" />
                </linearGradient>
              </defs>
            </svg>
          </div>

        </div>

        {/* Dynamic Energy Bar displaying Joules stored */}
        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-xl space-y-2.5 select-none shadow-md">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 flex items-center gap-1.5 font-bold">
              <Zap className="size-4 text-indigo-400 animate-pulse" />
              当前累积弹性势能储存仓 Elastic Potential Energy Stored:
            </span>
            <span className="font-mono text-sm text-indigo-300 font-black tracking-wide">
              E_p = {energy.toFixed(3)} Joules (焦耳)
            </span>
          </div>
          
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-400 h-2 rounded-full transition-all duration-300 shadow-glow"
              style={{ width: `${Math.min(100, (energy / (0.5 * 200 * Math.pow(1.5, 2))) * 100)}%` }}
            />
          </div>
        </div>

      </div>

      {/* Control Station Side panel */}
      <div className="lg:col-span-4 flex flex-col gap-5">
        
        {/* Spring constant k Controller */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-850 text-sm">弹簧劲度系数 (k)</h4>
            <span className="font-mono text-indigo-650 font-bold text-sm bg-indigo-50 border border-indigo-110/30 px-2.5 py-0.5 rounded-md">
              k = {k} N/m
            </span>
          </div>
          <Slider
            min={20}
            max={200}
            step={10}
            value={k}
            onChange={(val) => setK(val)}
            colorClass="text-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-2">
            <span>20 N/m 松软皮筋</span>
            <span>系数越大，变力斜率越陡</span>
            <span>200 N/m 坚硬钢簧</span>
          </div>
        </div>

        {/* Displacement x Controller */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-850 text-sm">压缩深度 (x)</h4>
            <span className="font-mono text-indigo-650 font-bold text-sm bg-indigo-50 border border-indigo-110/30 px-2.5 py-0.5 rounded-md">
              x = {xCurrent.toFixed(2)} 米
            </span>
          </div>
          <Slider
            min={0.0}
            max={1.5}
            step={0.01}
            value={xCurrent}
            onChange={(val) => setXCurrent(val)}
            colorClass="text-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-2">
            <span>0.0m 自由无压</span>
            <span>拖动来压缩物理弹簧</span>
            <span>1.5m 极度压缩</span>
          </div>
        </div>

        {/* Calculus Physics Explanation */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between flex-1">
          <div className="space-y-3.5">
            <h4 className="text-slate-800 font-bold text-sm flex items-center gap-2">
              <Zap className="size-4 text-indigo-600" />
              变力做功的微积分奥秘
            </h4>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              如果拉拽或压缩弹簧，我们面对的阻力并不是恒定不变的，而是随着拉伸增加而同步暴增。这无法用简单的 <code className="font-mono bg-slate-100">W = F · S</code> 来计算所得功。
            </p>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex gap-1.5">
                <span className="text-indigo-600 font-bold">●</span>
                <span>在极其微小的极短位移 <code className="font-mono bg-slate-100 px-1 py-0.5">dx</code> 下，阻力认为恒定，其微分微功即为矩形面积 <code className="font-mono bg-slate-100 px-1">dW = F(x) · dx = (k·x) dx</code>。</span>
              </li>
              <li className="flex gap-1.5">
                <span className="text-indigo-600 font-bold">●</span>
                <span>把微小变功连续积分累加，刚好形成斜线下的一个<strong>三角形面积</strong>。面积公式为 <code className="font-mono bg-slate-100 px-1">1/2 k x²</code>，这也正是存储的弹性势能。</span>
              </li>
            </ul>

            <div className="bg-slate-100/40 p-3 rounded-xl border border-dashed border-slate-200 text-[11px] text-slate-700 space-y-1 font-mono">
              <span className="text-[10px] text-slate-450 uppercase font-semibold">积分功累加状态</span>
              <div className="flex justify-between mt-1">
                <span>∫[0,x] F(u) du</span>
                <span className="font-bold text-indigo-600">{energy.toFixed(3)} 焦耳</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
