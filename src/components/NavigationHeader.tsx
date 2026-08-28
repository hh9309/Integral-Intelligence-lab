import React from "react";
import {
  Layers,
  Activity,
  GitCommit,
  TrendingDown,
  BookOpen,
  Code2,
  Bot,
  Compass,
  FileDown,
  Sparkles,
  BookMarked,
} from "lucide-react";

export type TabId =
  | "modeling"
  | "sandbox"
  | "trajectory"
  | "convergence"
  | "applications"
  | "code"
  | "ai"
  | "knowledge"
  | "report";

interface NavigationHeaderProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  onOpenAI: () => void;
  onOpenReport: () => void;
  onOpenFormulas: () => void;
  functionName?: string;
  n?: number;
  exactValue?: number;
  approxValue?: number;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenAI,
  onOpenReport,
  onOpenFormulas,
  functionName,
  n,
  exactValue,
  approxValue,
}) => {
  const tabs = [
    { id: "modeling" as TabId, label: "1. 建模基础", icon: BookOpen, desc: "定积分与FTC形式化定义" },
    { id: "sandbox" as TabId, label: "2. 2D逼近沙盒", icon: Layers, desc: "黎曼和切片分割动态填充" },
    { id: "trajectory" as TabId, label: "3. 动态面积轨迹", icon: Activity, desc: "变上限积分与原函数生成" },
    { id: "convergence" as TabId, label: "4. 误差收敛演播", icon: TrendingDown, desc: "O(1/n²)收敛阶与极限过程" },
    { id: "applications" as TabId, label: "5. 六大案例", icon: GitCommit, desc: "旋转体/弧长/变力做功等" },
    { id: "code" as TabId, label: "6. 代码引擎", icon: Code2, desc: "SymPy/NumPy算法源码" },
    { id: "ai" as TabId, label: "7. AI诊断导师", icon: Bot, desc: "微积分大模型解题与答疑" },
    { id: "knowledge" as TabId, label: "8. 知识导引", icon: Compass, desc: "以直代曲与理论图谱" },
  ];

  return (
    <header id="lab-main-header" className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner with Brand, Lab ID and Live Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100">
              <span className="font-serif text-2xl font-bold italic leading-none">∫</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-800 tracking-tight font-sans">
                  积分与微积分基本定理实验室
                </h1>
                <span className="px-2.5 py-0.5 bg-slate-100 rounded text-[11px] text-slate-600 font-mono font-medium border border-slate-200/80">
                  LAB_ID: 2024_CAL_01
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  v4.0 PRO
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                黎曼和与微积分基本定理精细化演播 · 交互式切片逼近 · 变上限原函数 · 符号与数值计算引擎
              </p>
            </div>
          </div>

          {/* Quick Metrics Slice & Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {functionName && (
              <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">被积式:</span>
                  <span className="font-mono font-semibold text-slate-700">{functionName}</span>
                </div>
                {n !== undefined && (
                  <>
                    <span className="text-slate-300">|</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-medium">切片 n:</span>
                      <span className="font-mono font-bold text-blue-600">{n}</span>
                    </div>
                  </>
                )}
                {exactValue !== undefined && (
                  <>
                    <span className="text-slate-300">|</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-medium">真值:</span>
                      <span className="font-mono font-bold text-emerald-600">{exactValue.toFixed(5)}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Quick Trigger for Integral Formulas Quick Reference Drawer */}
            <button
              id="btn-trigger-formula-drawer"
              onClick={onOpenFormulas}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100/80 text-amber-800 border border-amber-200 text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95 group"
              title="查阅常用微积分与积分公式表"
            >
              <BookMarked className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
              <span>积分公式表</span>
              <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.2 rounded bg-amber-200/60 text-amber-900 font-mono">
                速查
              </span>
            </button>

            <button
              id="btn-trigger-report-modal"
              onClick={onOpenReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>导出实验报告</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center space-x-1.5 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`group relative flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-bold shadow-2xs border border-blue-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
