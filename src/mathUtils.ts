/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MathFunction, VelocityProfile } from "./types";

// Standard Riemann / Area functions
export const RIEMANN_FUNCTIONS: MathFunction[] = [
  {
    id: "sine",
    label: "f(x) = sin(x) + 1.2",
    expr: (x) => Math.sin(x) + 1.2,
    integral: (x) => -Math.cos(x) + 1.2 * x,
    range: [0, Math.PI], // [0, 3.14159]
  },
  {
    id: "cubic",
    label: "f(x) = 0.5x³ - 1.5x² + x + 1.5",
    expr: (x) => 0.5 * Math.pow(x, 3) - 1.5 * Math.pow(x, 2) + x + 1.5,
    integral: (x) => 0.125 * Math.pow(x, 4) - 0.5 * Math.pow(x, 3) + 0.5 * Math.pow(x, 2) + 1.5 * x,
    range: [0, 2.5],
  },
  {
    id: "exponential",
    label: "f(x) = 2.0 * e^(-0.5x)",
    expr: (x) => 2.0 * Math.exp(-0.5 * x),
    integral: (x) => -4.0 * Math.exp(-0.5 * x),
    range: [0, 4.0],
  },
];

// Velocity curves for Road Trip Distance Accumulation
export const VELOCITY_PROFILES: VelocityProfile[] = [
  {
    id: "constant",
    label: "匀速行驶: v(t) = 4 m/s",
    expr: () => 4.0,
    integral: (t) => 4.0 * t,
    vMax: 6.0,
  },
  {
    id: "acceleration",
    label: "匀加速行驶: v(t) = 0.8t m/s (变加速)",
    expr: (t) => 0.8 * t,
    integral: (t) => 0.4 * Math.pow(t, 2),
    vMax: 10.0,
  },
  {
    id: "sinusoidal",
    label: "周期性波动: v(t) = 2*cos(t) + 3 m/s",
    expr: (t) => 2.0 * Math.cos(t) + 3.0,
    integral: (t) => 2.0 * Math.sin(t) + 3.0 * t,
    vMax: 6.0,
  },
  {
    id: "damping",
    label: "滑行减速: v(t) = 8 * e^(-0.3t) m/s",
    expr: (t) => 8.0 * Math.exp(-0.3 * t),
    integral: (t) => (8.0 / -0.3) * Math.exp(-0.3 * t) - (8.0 / -0.3),
    vMax: 10.0,
  },
];

// Helper to calculate normal distribution PDF
export function normalPDF(x: number, mean: number, stdDev: number): number {
  const coeff = 1.0 / (stdDev * Math.sqrt(2 * Math.PI));
  const exp = Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2)));
  return coeff * exp;
}

// Numerical integration using Midpoint Sum (runs 1000 steps for perfect CDF lookup)
export function integrateNormal(x1: number, x2: number, mean: number, stdDev: number, steps: number = 200): number {
  const start = Math.min(x1, x2);
  const end = Math.max(x1, x2);
  const dx = (end - start) / steps;
  let sum = 0;
  for (let i = 0; i < steps; i++) {
    const x = start + (i + 0.5) * dx;
    sum += normalPDF(x, mean, stdDev);
  }
  return sum * dx;
}
