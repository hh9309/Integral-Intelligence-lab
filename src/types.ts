/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppMode = 'riemann' | 'area' | 'distance' | 'probability' | 'energy';

// Function interface for Plotting
export interface MathFunction {
  id: string;
  label: string; // e.g. f(x) = sin(x) + 1.2
  expr: (x: number) => number;
  integral: (x: number) => number; // antiderivative F(x) where F'(x) = f(x)
  range: [number, number]; // default [a, b] for plotting
}

export type RiemannSumType = 'left' | 'right' | 'mid' | 'trapezoid';

export interface RiemannConfig {
  functionId: string;
  n: number; // partition count
  sumType: RiemannSumType;
}

export interface AreaConfig {
  functionId: string;
  xCurrent: number; // sweep slider
}

export interface VelocityProfile {
  id: string;
  label: string;
  expr: (t: number) => number;
  integral: (t: number) => number; // distance antiderivative
  vMax: number;
}

export interface ProbabilityConfig {
  mean: number;
  stdDev: number;
  x1: number;
  x2: number;
}

export interface EnergyConfig {
  k: number; // spring stiffness
  xCurrent: number; // displacement
}
