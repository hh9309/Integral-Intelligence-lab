/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { VELOCITY_PROFILES } from '../mathUtils';
import { Slider } from './ui-mini';
import { Play, Pause, RotateCcw, Car, Gauge, Milestone, Route } from 'lucide-react';

interface DistanceRoadTripProps {
  onStateUpdate: (summaryData: any) => void;
}

export default function DistanceRoadTrip({ onStateUpdate }: DistanceRoadTripProps) {
  const [profileId, setProfileId] = useState<string>("constant");
  const [tCurrent, setTCurrent] = useState<number>(0.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const timerRef = useRef<any>(null);

  const selectedProfile = useMemo(() => {
    return VELOCITY_PROFILES.find(p => p.id === profileId) || VELOCITY_PROFILES[0];
  }, [profileId]);

  const maxT = 10.0;

  // Calculate current velocity and accumulated distance at tCurrent
  const currentV = useMemo(() => {
    return selectedProfile.expr(tCurrent);
  }, [selectedProfile, tCurrent]);

  const currentS = useMemo(() => {
    // Distance s(t) = antiderivative(t) - antiderivative(0)
    return selectedProfile.integral(tCurrent) - selectedProfile.integral(0);
  }, [selectedProfile, tCurrent]);

  const totalSFor10s = useMemo(() => {
    return selectedProfile.integral(maxT) - selectedProfile.integral(0);
  }, [selectedProfile]);

  // Sync state data back to parent
  useMemo(() => {
    const data = {
      velocityProfileLabel: selectedProfile.label,
      tMax: maxT.toFixed(1),
      tCurrent: tCurrent.toFixed(2),
      vCurrent: currentV.toFixed(2),
      distance: currentS.toFixed(3)
    };

    setTimeout(() => {
      onStateUpdate(data);
    }, 0);
  }, [selectedProfile, tCurrent, currentV, currentS]);

  // Simulation timer loop
  useEffect(() => {
    if (isPlaying) {
      const fps = 40;
      const step = 10 / (10 * fps); // standard speed: 10s simulation takes exactly 10s of real time
      timerRef.current = setInterval(() => {
        setTCurrent((prev) => {
          let next = prev + step;
          if (next >= maxT) {
            next = 0.0; // loop back
          }
          return next;
        });
      }, 1000 / fps);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const resetSimulation = () => {
    setIsPlaying(false);
    setTCurrent(0.0);
  };

  // Dimensions of double curves (width = 320, height = 180)
  const plotW = 320;
  const plotH = 175;
  const pl = 40;
  const pr = 15;
  const pt = 15;
  const pb = 25;

  const scaleX = (t: number) => {
    return pl + (t / maxT) * (plotW - pl - pr);
  };

  // Plot Velocity v(t) Scale
  const scaleYV = (v: number) => {
    const vMaxPlot = selectedProfile.vMax;
    return plotH - pb - (v / vMaxPlot) * (plotH - pt - pb);
  };

  // Plot Distance s(t) Scale
  const scaleYS = (s: number) => {
    const sMaxPlot = totalSFor10s;
    return plotH - pb - (s / sMaxPlot) * (plotH - pt - pb);
  };

  // Points representing curves
  const vPoints = useMemo(() => {
    const pts = [];
    for (let t = 0; t <= maxT; t += 0.1) {
      pts.push(`${scaleX(t)},${scaleYV(selectedProfile.expr(t))}`);
    }
    return pts.join(" ");
  }, [selectedProfile]);

  const sPoints = useMemo(() => {
    const pts = [];
    for (let t = 0; t <= maxT; t += 0.1) {
      const dist = selectedProfile.integral(t) - selectedProfile.integral(0);
      pts.push(`${scaleX(t)},${scaleYS(dist)}`);
    }
    return pts.join(" ");
  }, [selectedProfile, totalSFor10s]);

  // Shaded area representing s(tCurrent) on velocity curve
  const vShadedArea = useMemo(() => {
    if (tCurrent <= 0) return "";
    const pts = [];
    pts.push(`${scaleX(0)},${scaleYV(0)}`);
    for (let t = 0; t <= tCurrent; t += 0.05) {
      pts.push(`${scaleX(t)},${scaleYV(selectedProfile.expr(t))}`);
    }
    pts.push(`${scaleX(tCurrent)},${scaleYV(0)}`);
    return pts.join(" ");
  }, [selectedProfile, tCurrent]);

  return (
    <div id="distance-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Visual highway simulations */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
        
        {/* Double side-by-side plots: Left (Velocity), Right (Distance) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Left Plot: Velocity v(t) */}
          <div className="bg-slate-50/50 border border-slate-200/50 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Gauge className="size-3.5 text-indigo-600" />
                瞬时速度 v(t) 与积分面积
              </span>
              <span className="text-xs text-indigo-600 font-mono font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/45">
                v = {currentV.toFixed(2)} m/s
              </span>
            </div>

            <svg viewBox={`0 0 ${plotW} ${plotH}`} className="w-full max-h-[175px] md:max-h-[190px] text-[9px] font-mono select-none">
              <line x1={scaleX(0)} y1={scaleYV(0)} x2={scaleX(maxT)} y2={scaleYV(0)} stroke="#475569" strokeWidth="1.2" />
              <line x1={scaleX(0)} y1={scaleYV(0)} x2={scaleX(0)} y2={scaleYV(selectedProfile.vMax)} stroke="#475569" strokeWidth="1.2" />

              {/* Shaded Integral representing Distance */}
              {vShadedArea && <polygon points={vShadedArea} fill="url(#velGrad)" />}

              {/* Velocity profile curve - made thicker (strokeWidth 3.5) */}
              <polyline points={vPoints} fill="none" stroke="#4f46e5" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Time tracker line */}
              <line x1={scaleX(tCurrent)} y1={scaleYV(0)} x2={scaleX(tCurrent)} y2={scaleYV(selectedProfile.vMax)} stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 2" />

              {/* Coordinate texts */}
              <text x={scaleX(0)} y={scaleYV(0) + 14} textAnchor="middle" className="fill-slate-500 font-semibold text-[9px] font-mono">0</text>
              <text x={scaleX(maxT)} y={scaleYV(0) + 14} textAnchor="middle" className="fill-slate-500 font-semibold text-[9px] font-mono">10s</text>
              <text x={scaleX(tCurrent)} y={scaleYV(currentV) - 7} textAnchor="middle" className="fill-indigo-950 font-bold bg-white text-[10px] px-1 font-mono">{tCurrent.toFixed(1)}s</text>
              
              <text x={scaleX(0) - 6} y={scaleYV(0) + 3} textAnchor="end" className="fill-slate-500 font-mono text-[9px]">0</text>
              <text x={scaleX(0) - 6} y={scaleYV(selectedProfile.vMax) + 3} textAnchor="end" className="fill-slate-500 font-mono text-[9px]">{selectedProfile.vMax.toFixed(0)}</text>
              
              <text x={plotW / 2} y={plotH - 2} textAnchor="middle" className="fill-slate-600 font-sans font-semibold text-[9px]">时间 t (秒)</text>
              <text x={scaleX(0) - 6} y={scaleYV(selectedProfile.vMax) - 6} textAnchor="start" className="fill-slate-600 font-sans font-semibold text-[9px]">v (m/s)</text>

              <defs>
                <linearGradient id="velGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.05" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Right Plot: Distance s(t) */}
          <div className="bg-slate-50/50 border border-slate-200/50 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Route className="size-3.5 text-indigo-600" />
                路程累积 s(t) 积分曲线
              </span>
              <span className="text-xs text-indigo-600 font-mono font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/45">
                s = {currentS.toFixed(2)} m
              </span>
            </div>

            <svg viewBox={`0 0 ${plotW} ${plotH}`} className="w-full max-h-[175px] md:max-h-[190px] text-[9px] font-mono select-none">
              <line x1={scaleX(0)} y1={scaleYS(0)} x2={scaleX(maxT)} y2={scaleYS(0)} stroke="#475569" strokeWidth="1.2" />
              <line x1={scaleX(0)} y1={scaleYS(0)} x2={scaleX(0)} y2={scaleYS(totalSFor10s)} stroke="#475569" strokeWidth="1.2" />

              {/* Faded historical curve - thicker */}
              <polyline points={sPoints} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 2" />

              {/* Distance accumulated line path - made thicker (strokeWidth 4) */}
              {tCurrent > 0 && (
                <polyline
                  points={sPoints.split(" ").slice(0, Math.ceil((tCurrent / maxT) * 100) + 1).join(" ")}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Scanning indicator */}
              <circle cx={scaleX(tCurrent)} cy={scaleYS(currentS)} r="5.5" fill="#4f46e5" className="stroke-white stroke-[2]" />

              {/* Coordinate texts */}
              <text x={scaleX(0)} y={scaleYS(0) + 14} textAnchor="middle" className="fill-slate-500 font-semibold text-[9px] font-mono">0</text>
              <text x={scaleX(maxT)} y={scaleYS(0) + 14} textAnchor="middle" className="fill-slate-500 font-semibold text-[9px] font-mono">10s</text>
              
              <text x={scaleX(0) - 6} y={scaleYS(0) + 3} textAnchor="end" className="fill-slate-500 font-mono text-[9px]">0</text>
              <text x={scaleX(0) - 6} y={scaleYS(totalSFor10s) + 3} textAnchor="end" className="fill-slate-500 font-mono text-[9px]">{totalSFor10s.toFixed(0)}m</text>

              <text x={plotW / 2} y={plotH - 2} textAnchor="middle" className="fill-slate-600 font-sans font-semibold text-[9px]">时间 t (秒)</text>
              <text x={scaleX(0) - 6} y={scaleYS(totalSFor10s) - 6} textAnchor="start" className="fill-slate-600 font-sans font-semibold text-[9px]">s 累加路程 (m)</text>
            </svg>
          </div>

        </div>

        {/* Physical simulation: Car driving on a bright, beautiful road */}
        <div className="bg-slate-50 border border-slate-205 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[140px] select-none shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-700 mb-2 font-medium">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <Milestone className="size-4 text-rose-500 animate-pulse" />
              物理运动情境模拟：小车行驶跑道
            </span>
            <span className="font-mono text-xs">
              速度 = <strong className="text-rose-600 font-bold text-sm">{currentV.toFixed(2)}</strong> m/s | 累计位移 = <strong className="text-indigo-600 font-extrabold text-sm">{currentS.toFixed(2)}</strong> m
            </span>
          </div>

          {/* Road highway lane - much wider, elegant light-asphalt grey */}
          <div className="relative w-full h-16 bg-slate-800 border-y-2 border-slate-600 rounded-xl my-3 flex items-center justify-between shadow-inner">
            
            {/* Dashed divider */}
            <div className="absolute left-0 right-0 h-0 border-t-2 border-dashed border-amber-300 opacity-80" />

            {/* Glowing trajectory trail on the road (運動軌跡更清晰) */}
            <div 
              className="absolute left-0 h-12 bg-gradient-to-r from-emerald-400/10 via-indigo-500/25 to-rose-450/40 rounded-l-lg pointer-events-none"
              style={{
                width: `${Math.min(96, (currentS / totalSFor10s) * 96)}%`,
                marginLeft: '4px',
              }}
            />

            {/* Milepost signs - bright and clean */}
            <div className="absolute inset-x-4 flex justify-between text-[10px] text-slate-300 top-1 font-mono font-bold select-none">
              <span>0m</span>
              <span>{(totalSFor10s * 0.25).toFixed(0)}m</span>
              <span>{(totalSFor10s * 0.5).toFixed(0)}m</span>
              <span>{(totalSFor10s * 0.75).toFixed(0)}m</span>
              <span>{totalSFor10s.toFixed(0)}m</span>
            </div>

            {/* Simulated moving car icon - larger, colorful, closer to real look */}
            <div
              className="absolute transition-transform duration-75 flex flex-col items-center"
              style={{
                left: `calc(4px + ${Math.min(88, (currentS / totalSFor10s) * 89)}%)`,
                top: '8px',
                transform: `scale(${1 + currentV / 25})` // squashes slightly at higher speed
              }}
            >
              <Car className="size-9 text-rose-600 fill-rose-500 drop-shadow-[0_3px_6px_rgba(0,0,0,0.6)]" />
              {/* Wheels dust / smoke particles */}
              <div className="flex gap-4.5 mt-0.5">
                <div className="size-1.5 bg-amber-400 rounded-full animate-ping opacity-75" />
                <div className="size-1.5 bg-amber-400 rounded-full animate-ping opacity-75" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Control Station Side panel */}
      <div className="lg:col-span-4 flex flex-col gap-5">
        
        {/* Play/Pause controls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h4 className="font-semibold text-slate-850 text-sm mb-3.5">模拟运行器</h4>
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                isPlaying
                  ? 'border-red-200 bg-red-50 text-red-650 hover:bg-red-100'
                  : 'border-indigo-200 bg-indigo-55/10 text-indigo-900 hover:bg-indigo-100'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="size-4" fill="currentColor" />
                  暂停模拟
                </>
              ) : (
                <>
                  <Play className="size-4" fill="currentColor" />
                  开始运行 (t)
                </>
              )}
            </button>
            <button
              onClick={resetSimulation}
              className="px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-slate-600 flex items-center justify-center cursor-pointer"
              title="重置到起点"
            >
              <RotateCcw className="size-4" />
            </button>
          </div>
        </div>

        {/* Velocity Profile Selector */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h4 className="font-semibold text-slate-850 text-sm mb-3">速度变化模式 v(t)</h4>
          <div className="space-y-2">
            {VELOCITY_PROFILES.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setProfileId(p.id);
                  setTCurrent(0.0);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                  profileId === p.id
                    ? 'border-indigo-500 bg-indigo-50/40 text-indigo-950 font-bold'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/40 text-slate-600'
                }`}
              >
                <span>{p.label}</span>
                {profileId === p.id && <div className="size-1.5 rounded-full bg-indigo-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Scrub Time Controller */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-850 text-sm">时间轴进度 (t)</h4>
            <span className="font-mono text-indigo-650 font-bold text-sm bg-indigo-50 border border-indigo-110 px-2.5 py-0.5 rounded-md">
              t = {tCurrent.toFixed(2)}s
            </span>
          </div>
          <Slider
            min={0}
            max={maxT}
            step={0.05}
            value={tCurrent}
            onChange={(val) => {
              setIsPlaying(false);
              setTCurrent(val);
            }}
            colorClass="text-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-2">
            <span>出发 t = 0s</span>
            <span>拖拽可手动微调积时</span>
            <span>终点 t = 10s</span>
          </div>
        </div>

        {/* Road Physics Explanation */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between flex-1">
          <div className="space-y-3.5">
            <h4 className="text-slate-800 font-bold text-sm flex items-center gap-2">
              <Route className="size-4 text-indigo-600" />
              速度的面积为什么是路程？
            </h4>
            
            <p className="text-xs text-slate-500 leading-relaxed text-wrap">
              微小的矩形面积 <code className="font-mono bg-slate-100">dS = v(t) · dt</code>，也就是“速度乘以极微小的时间段”，这恰恰是<strong>短时间内的微小位移</strong>。
            </p>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex gap-1.5">
                <span className="text-indigo-600 font-bold">●</span>
                <span>将这些微分位移 <code className="font-mono bg-slate-100">dS</code> 在大时间轴上连续累加起来，得到的极限总面积就等于<strong>实时的宏观总路程 s(t)</strong>。</span>
              </li>
            </ul>

            <div className="bg-slate-100/40 p-3 rounded-xl border border-dashed border-slate-200 text-[11px] text-slate-700 space-y-1.5 font-mono">
              <span className="text-[10px] text-slate-450 uppercase font-semibold">当前累积参数</span>
              <div className="flex justify-between">
                <span>积分上限 t</span>
                <span className="font-bold text-slate-800">{tCurrent.toFixed(2)}s</span>
              </div>
              <div className="flex justify-between">
                <span>∫[0,t] v(u)du</span>
                <span className="font-bold text-indigo-600">{currentS.toFixed(3)}米</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
