export type ActiveModuleTab =
  | "modeling"
  | "sandbox"
  | "trajectory"
  | "convergence"
  | "applications"
  | "code"
  | "ai"
  | "knowledge";

export type ApproximationMethod =
  | "left"
  | "right"
  | "midpoint"
  | "trapezoid"
  | "simpson"
  | "upper_darboux"
  | "lower_darboux";

export interface PresetFunction {
  id: string;
  name: string;
  expression: string;
  displayLatex: string;
  antiderivativeLatex: string;
  defaultA: number;
  defaultB: number;
  defaultN: number;
  category: "polynomial" | "trig" | "exponential" | "rational" | "standard";
  evaluate: (x: number) => number;
  evaluateAntiderivative: (x: number) => number;
}

export interface RiemannSlice {
  index: number;
  xLeft: number;
  xRight: number;
  width: number;
  xSample: number;
  height: number;
  area: number;
  // For trapezoid
  heightLeft?: number;
  heightRight?: number;
  // For Darboux
  supVal?: number;
  infVal?: number;
}

export interface ApproximationResult {
  method: ApproximationMethod;
  n: number;
  value: number;
  exactValue: number;
  absError: number;
  relError: number;
  slices: RiemannSlice[];
  computationTimeMs: number;
}

export interface ConvergencePoint {
  n: number;
  leftError: number;
  rightError: number;
  midpointError: number;
  trapezoidError: number;
  simpsonError: number;
}

export interface ClassicCaseStudy {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  description: string;
  latexFormula: string;
  parameterName: string;
  paramMin: number;
  paramMax: number;
  paramDefault: number;
  paramStep: number;
  paramUnit: string;
  funcA: (x: number, param: number) => number;
  funcB?: (x: number, param: number) => number;
  domain: [number, number];
  computeExact: (param: number) => number;
  computeApprox: (param: number, n: number) => number;
  unitResult: string;
  physicalMeaning: string;
  engineeringApplication: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai" | "system";
  text: string;
  timestamp: string;
}

export interface ExperimentReportData {
  title: string;
  author: string;
  date: string;
  functionName: string;
  functionExpr: string;
  latexExpr: string;
  a: number;
  b: number;
  n: number;
  method: ApproximationMethod;
  approxValue: number;
  exactValue: number;
  absError: number;
  relError: number;
  convergenceSlopeEstimate: string;
  selectedCaseStudy?: string;
  aiNotes?: string[];
  userNotes: string;
}
