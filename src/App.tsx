/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Infinity as InfinityIcon,
  Layers,
  TrendingUp,
  Activity,
  Percent,
  Zap,
  BookOpen,
  HelpCircle,
  Clock,
} from 'lucide-react';

import { AppMode, RiemannConfig, AreaConfig, ProbabilityConfig } from './types';
import RiemannSums from './components/RiemannSums';
import AreaAccumulator from './components/AreaAccumulator';
import DistanceRoadTrip from './components/DistanceRoadTrip';
import ProbabilityDensity from './components/ProbabilityDensity';
import EnergySpring from './components/EnergySpring';
import AiInsightBox from './components/AiInsightBox';

export default function App() {
  const [mode, setMode] = useState<AppMode>('riemann');

  // Interactive local states preserved across views
  const [riemannConfig, setRiemannConfig] = useState<RiemannConfig>({
    functionId: 'sine',
    n: 16,
    sumType: 'mid',
  });

  const [areaConfig, setAreaConfig] = useState<AreaConfig>({
    functionId: 'sine',
    xCurrent: 1.5708, // midpoint of [0, pi]
  });

  const [probabilityConfig, setProbabilityConfig] = useState<ProbabilityConfig>({
    mean: 0.0,
    stdDev: 1.0,
    x1: -1.0,
    x2: 1.0,
  });

  const [activeParameters, setActiveParameters] = useState<any>({});

  // Tab definitions
  const tabs = [
    {
      id: 'riemann',
      label: '黎曼和逼近',
      desc: '离散逼近极限之美',
      icon: Layers,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-300',
    },
    {
      id: 'area',
      label: '面积累积',
      desc: '微积分基本定理 F(x)',
      icon: TrendingUp,
      color: 'bg-sky-500',
      textColor: 'text-sky-700',
      borderColor: 'border-sky-300',
    },
    {
      id: 'distance',
      label: '路程累积',
      desc: '物理学：速度与位移',
      icon: Activity,
      color: 'bg-amber-500',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-300',
    },
    {
      id: 'probability',
      label: '概率密度积分',
      desc: '事件发生的底面面积',
      icon: Percent,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-700',
      borderColor: 'border-indigo-300',
    },
    {
      id: 'energy',
      label: '能量累积过程',
      desc: '变力做功与势能转化',
      icon: Zap,
      color: 'bg-rose-500',
      textColor: 'text-rose-700',
      borderColor: 'border-rose-300',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
      {/* Upper Navigation bar with Elegant displays (No telemetry, clean headers) */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 shrink-0 shadow-sm relative z-10 select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo brand and subtitle */}
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-serif shadow-md shadow-indigo-100">
              <InfinityIcon className="size-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 tracking-tight text-xl font-sans flex items-center gap-2">
                积分宇宙 <span className="font-sans font-normal text-slate-400 text-sm">Integral Universe</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                从“离散面积”走向“连续累积体系”的交互微积分视觉探索
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 text-xs bg-indigo-50 border border-indigo-100/80 px-3.5 py-1.5 rounded-full font-sans text-indigo-700 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span>AI 洞察模式 · 实时计算精度同步</span>
            </div>
          </div>

        </div>
      </header>

      {/* Primary content area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:py-8 space-y-6 flex flex-col justify-start">
        
        {/* Workspace Tab Grid Selector - 5 interactive mathematical modes */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = mode === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id as AppMode)}
                className={`group px-4 py-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-[86px] md:h-[94px] shadow-sm select-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 ${
                  isActive
                    ? `border-indigo-500 bg-white shadow-md shadow-indigo-50/55`
                    : 'border-slate-200 bg-white/75 hover:bg-white hover:border-slate-350'
                }`}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute top-4 right-4 size-2 rounded-full bg-indigo-600" />
                )}

                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500 group-hover:bg-slate-100'
                  }`}>
                    <Icon className="size-4" />
                  </div>
                  <span className={`text-xs md:text-sm font-semibold transition-colors ${
                    isActive ? 'text-slate-900 font-bold' : 'text-slate-600'
                  }`}>
                    {tab.label}
                  </span>
                </div>
                
                <span className="text-[10px] md:text-[11.5px] text-slate-400 truncate">
                  {tab.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Visual Work Area */}
        <div className="flex-1 min-h-[460px] flex items-stretch">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full flex flex-col justify-between"
            >
              {mode === 'riemann' && (
                <RiemannSums
                  config={riemannConfig}
                  onChange={setRiemannConfig}
                  onStateUpdate={setActiveParameters}
                />
              )}
              {mode === 'area' && (
                <AreaAccumulator
                  config={areaConfig}
                  onChange={setAreaConfig}
                  onStateUpdate={setActiveParameters}
                />
              )}
              {mode === 'distance' && (
                <DistanceRoadTrip
                  onStateUpdate={setActiveParameters}
                />
              )}
              {mode === 'probability' && (
                <ProbabilityDensity
                  config={probabilityConfig}
                  onChange={setProbabilityConfig}
                  onStateUpdate={setActiveParameters}
                />
              )}
              {mode === 'energy' && (
                <EnergySpring
                  onStateUpdate={setActiveParameters}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* AI Insight Section */}
        <div className="shrink-0">
          <AiInsightBox mode={mode} parameters={activeParameters} />
        </div>

      </main>

      {/* Elegant minimalist footer */}
      <footer className="bg-white border-t border-slate-250/70 py-4 px-6 shrink-0 text-center select-none text-[10px] md:text-xs text-slate-450">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} 积分宇宙 | 连续累积科普实验平台</span>
          <div className="flex gap-4 font-mono text-slate-400">
            <span>定积分: F(b) - F(a) = ∫[a,b] f(x)dx</span>
            <span className="text-slate-200">|</span>
            <span>数学之美在乎追求极限</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
