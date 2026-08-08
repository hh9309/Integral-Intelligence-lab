/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  colorClass?: string;
}

export function Slider({ min, max, step = 1, value, onChange, colorClass = "text-indigo-600" }: SliderProps) {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div className="relative w-full flex items-center select-none py-2 focus-within:outline-none">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 transition-all"
        style={{
          background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${percent}%, #f1f5f9 ${percent}%, #f1f5f9 100%)`,
        }}
      />
    </div>
  );
}
