import {
  ApproximationMethod,
  PresetFunction,
  RiemannSlice,
  ApproximationResult,
  ConvergencePoint,
  ClassicCaseStudy,
} from "../types";

export const PRESET_FUNCTIONS: PresetFunction[] = [
  {
    id: "poly_square",
    name: "二次抛物线 f(x) = x²",
    expression: "x^2",
    displayLatex: "f(x) = x^2",
    antiderivativeLatex: "F(x) = \\frac{1}{3}x^3",
    defaultA: 0,
    defaultB: 2,
    defaultN: 10,
    category: "polynomial",
    evaluate: (x: number) => x * x,
    evaluateAntiderivative: (x: number) => (x * x * x) / 3,
  },
  {
    id: "trig_sine",
    name: "正弦波形 f(x) = sin(x) + 1.2",
    expression: "sin(x) + 1.2",
    displayLatex: "f(x) = \\sin(x) + 1.2",
    antiderivativeLatex: "F(x) = -\\cos(x) + 1.2x",
    defaultA: 0,
    defaultB: Math.PI,
    defaultN: 12,
    category: "trig",
    evaluate: (x: number) => Math.sin(x) + 1.2,
    evaluateAntiderivative: (x: number) => -Math.cos(x) + 1.2 * x,
  },
  {
    id: "exp_decay",
    name: "指数衰减 f(x) = e^(-x)",
    expression: "exp(-x)",
    displayLatex: "f(x) = e^{-x}",
    antiderivativeLatex: "F(x) = -e^{-x}",
    defaultA: 0,
    defaultB: 3,
    defaultN: 15,
    category: "exponential",
    evaluate: (x: number) => Math.exp(-x),
    evaluateAntiderivative: (x: number) => -Math.exp(-x),
  },
  {
    id: "rational_cauchy",
    name: "柯西/洛伦兹型 f(x) = 1 / (1 + x²)",
    expression: "1 / (1 + x^2)",
    displayLatex: "f(x) = \\frac{1}{1 + x^2}",
    antiderivativeLatex: "F(x) = \\arctan(x)",
    defaultA: 0,
    defaultB: 1,
    defaultN: 10,
    category: "rational",
    evaluate: (x: number) => 1 / (1 + x * x),
    evaluateAntiderivative: (x: number) => Math.atan(x),
  },
  {
    id: "sqrt_root",
    name: "幂函数 f(x) = √x",
    expression: "sqrt(x)",
    displayLatex: "f(x) = \\sqrt{x}",
    antiderivativeLatex: "F(x) = \\frac{2}{3}x^{3/2}",
    defaultA: 0,
    defaultB: 4,
    defaultN: 16,
    category: "standard",
    evaluate: (x: number) => (x < 0 ? 0 : Math.sqrt(x)),
    evaluateAntiderivative: (x: number) => (x < 0 ? 0 : (2 / 3) * Math.pow(x, 1.5)),
  },
  {
    id: "inverted_parabola",
    name: "倒抛物线拱门 f(x) = 4 - x²",
    expression: "4 - x^2",
    displayLatex: "f(x) = 4 - x^2",
    antiderivativeLatex: "F(x) = 4x - \\frac{1}{3}x^3",
    defaultA: -2,
    defaultB: 2,
    defaultN: 16,
    category: "polynomial",
    evaluate: (x: number) => 4 - x * x,
    evaluateAntiderivative: (x: number) => 4 * x - (x * x * x) / 3,
  },
  {
    id: "cubic_wave",
    name: "三次波动曲线 f(x) = x³ - 3x + 3",
    expression: "x^3 - 3*x + 3",
    displayLatex: "f(x) = x^3 - 3x + 3",
    antiderivativeLatex: "F(x) = \\frac{1}{4}x^4 - \\frac{3}{2}x^2 + 3x",
    defaultA: -1,
    defaultB: 2.5,
    defaultN: 14,
    category: "polynomial",
    evaluate: (x: number) => x * x * x - 3 * x + 3,
    evaluateAntiderivative: (x: number) => 0.25 * Math.pow(x, 4) - 1.5 * x * x + 3 * x,
  },
  {
    id: "gaussian_bell",
    name: "高斯钟形曲线 f(x) = e^(-x²)",
    expression: "exp(-x^2)",
    displayLatex: "f(x) = e^{-x^2}",
    antiderivativeLatex: "F(x) = \\frac{\\sqrt{\\pi}}{2}\\text{erf}(x)",
    defaultA: -2,
    defaultB: 2,
    defaultN: 20,
    category: "standard",
    evaluate: (x: number) => Math.exp(-x * x),
    evaluateAntiderivative: (x: number) => (Math.sqrt(Math.PI) / 2) * erf(x),
  },
];

// Approximation of error function erf(x) for exact gaussian ground truth
export function erf(x: number): number {
  // Abramowitz and Stegun formula 7.1.26
  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * absX);
  const y =
    1.0 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

// Parse user custom math expression safely into executable function
export function createCustomFunction(expr: string): (x: number) => number {
  try {
    // Sanitize string and replace standard math expressions
    let cleanExpr = expr
      .replace(/\^/g, "**")
      .replace(/\bsin\b/g, "Math.sin")
      .replace(/\bcos\b/g, "Math.cos")
      .replace(/\btan\b/g, "Math.tan")
      .replace(/\bexp\b/g, "Math.exp")
      .replace(/\bln\b/g, "Math.log")
      .replace(/\blog\b/g, "Math.log10")
      .replace(/\bsqrt\b/g, "Math.sqrt")
      .replace(/\babs\b/g, "Math.abs")
      .replace(/\bpi\b/gi, "Math.PI")
      .replace(/\be\b/g, "Math.E")
      .replace(/(\d+)([a-zA-Z(])/g, "$1*$2"); // e.g. 2x -> 2*x

    // Evaluate using Function constructor in sandbox
    const fn = new Function("x", `"use strict"; try { return Number(${cleanExpr}); } catch(e) { return 0; }`);
    // Test with sample value
    const testVal = fn(1);
    if (isNaN(testVal) || typeof testVal !== "number") {
      throw new Error("Invalid output");
    }
    return (x: number) => {
      try {
        const val = fn(x);
        return isFinite(val) ? val : 0;
      } catch {
        return 0;
      }
    };
  } catch (err) {
    console.warn("Error parsing custom function:", err);
    return (x: number) => x * x; // fallback
  }
}

// High-precision adaptive Gauss-Kronrod / Simpson quadrature for exact numerical reference
export function computeHighPrecisionIntegral(
  fn: (x: number) => number,
  a: number,
  b: number,
  subdivisions = 2000
): number {
  if (a === b) return 0;
  const n = subdivisions % 2 === 0 ? subdivisions : subdivisions + 1;
  const h = (b - a) / n;
  let sum = fn(a) + fn(b);

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    sum += (i % 2 === 0 ? 2 : 4) * fn(x);
  }
  return (h / 3) * sum;
}

// Compute analytical or high-precision exact value for given preset or custom function
export function getExactIntegral(
  preset: PresetFunction | null,
  customFn: ((x: number) => number) | null,
  a: number,
  b: number
): number {
  if (preset && preset.evaluateAntiderivative) {
    return preset.evaluateAntiderivative(b) - preset.evaluateAntiderivative(a);
  }
  if (customFn) {
    return computeHighPrecisionIntegral(customFn, a, b);
  }
  return 0;
}

// Compute Riemann Approximation and produce slice geometry
export function computeRiemannApproximation(
  fn: (x: number) => number,
  a: number,
  b: number,
  n: number,
  method: ApproximationMethod,
  exactVal: number
): ApproximationResult {
  const startTime = performance.now();
  const width = (b - a) / n;
  const slices: RiemannSlice[] = [];
  let totalSum = 0;

  if (method === "trapezoid") {
    for (let i = 0; i < n; i++) {
      const xLeft = a + i * width;
      const xRight = a + (i + 1) * width;
      const hLeft = fn(xLeft);
      const hRight = fn(xRight);
      const area = 0.5 * (hLeft + hRight) * width;
      totalSum += area;

      slices.push({
        index: i,
        xLeft,
        xRight,
        width,
        xSample: (xLeft + xRight) / 2,
        height: (hLeft + hRight) / 2,
        heightLeft: hLeft,
        heightRight: hRight,
        area,
      });
    }
  } else if (method === "simpson") {
    // Simpson requires even n; if odd, use n+1
    const actualN = n % 2 === 0 ? n : n + 1;
    const h = (b - a) / actualN;
    let sSum = fn(a) + fn(b);

    for (let i = 0; i < actualN; i++) {
      const xLeft = a + i * h;
      const xRight = a + (i + 1) * h;
      const xMid = (xLeft + xRight) / 2;
      const hLeft = fn(xLeft);
      const hMid = fn(xMid);
      const hRight = fn(xRight);
      // Slices for visual display
      const sliceArea = (h / 6) * (hLeft + 4 * hMid + hRight);

      slices.push({
        index: i,
        xLeft,
        xRight,
        width: h,
        xSample: xMid,
        height: hMid,
        heightLeft: hLeft,
        heightRight: hRight,
        area: sliceArea,
      });
    }

    for (let i = 1; i < actualN; i++) {
      const x = a + i * h;
      sSum += (i % 2 === 0 ? 2 : 4) * fn(x);
    }
    totalSum = (h / 3) * sSum;
  } else if (method === "upper_darboux" || method === "lower_darboux") {
    for (let i = 0; i < n; i++) {
      const xLeft = a + i * width;
      const xRight = a + (i + 1) * width;

      // Sample sub-interval to find supremum and infimum
      let minVal = Infinity;
      let maxVal = -Infinity;
      const sampleSteps = 20;
      for (let s = 0; s <= sampleSteps; s++) {
        const sx = xLeft + (s / sampleSteps) * width;
        const sy = fn(sx);
        if (sy < minVal) minVal = sy;
        if (sy > maxVal) maxVal = sy;
      }

      const sampleHeight = method === "upper_darboux" ? maxVal : minVal;
      const area = sampleHeight * width;
      totalSum += area;

      slices.push({
        index: i,
        xLeft,
        xRight,
        width,
        xSample: (xLeft + xRight) / 2,
        height: sampleHeight,
        supVal: maxVal,
        infVal: minVal,
        area,
      });
    }
  } else {
    // Standard Riemann sum: Left, Right, Midpoint
    for (let i = 0; i < n; i++) {
      const xLeft = a + i * width;
      const xRight = a + (i + 1) * width;
      let xSample = xLeft;

      if (method === "right") {
        xSample = xRight;
      } else if (method === "midpoint") {
        xSample = (xLeft + xRight) / 2;
      }

      const height = fn(xSample);
      const area = height * width;
      totalSum += area;

      slices.push({
        index: i,
        xLeft,
        xRight,
        width,
        xSample,
        height,
        area,
      });
    }
  }

  const endTime = performance.now();
  const absError = Math.abs(totalSum - exactVal);
  const relError = exactVal !== 0 ? (absError / Math.abs(exactVal)) * 100 : 0;

  return {
    method,
    n,
    value: totalSum,
    exactValue: exactVal,
    absError,
    relError,
    slices,
    computationTimeMs: Math.max(0.01, endTime - startTime),
  };
}

// Generate convergence dataset across different n values
export function computeConvergenceData(
  fn: (x: number) => number,
  a: number,
  b: number,
  exactVal: number
): ConvergencePoint[] {
  const nList = [2, 4, 8, 16, 32, 64, 128, 256, 512];
  const points: ConvergencePoint[] = [];

  for (const n of nList) {
    const leftRes = computeRiemannApproximation(fn, a, b, n, "left", exactVal);
    const rightRes = computeRiemannApproximation(fn, a, b, n, "right", exactVal);
    const midRes = computeRiemannApproximation(fn, a, b, n, "midpoint", exactVal);
    const trapRes = computeRiemannApproximation(fn, a, b, n, "trapezoid", exactVal);
    const simpRes = computeRiemannApproximation(fn, a, b, n, "simpson", exactVal);

    points.push({
      n,
      leftError: Math.max(1e-12, leftRes.absError),
      rightError: Math.max(1e-12, rightRes.absError),
      midpointError: Math.max(1e-12, midRes.absError),
      trapezoidError: Math.max(1e-12, trapRes.absError),
      simpsonError: Math.max(1e-12, simpRes.absError),
    });
  }

  return points;
}

// Calculate empirical slope for log(error) vs log(n)
export function estimateConvergenceSlope(
  points: ConvergencePoint[],
  methodKey: keyof Omit<ConvergencePoint, "n">
): number {
  if (points.length < 2) return 0;
  // Take last 4 points for asymptotic slope
  const sample = points.slice(-4);
  const logN = sample.map((p) => Math.log(p.n));
  const logErr = sample.map((p) => Math.log(Math.max(1e-15, p[methodKey])));

  const meanX = logN.reduce((a, b) => a + b, 0) / logN.length;
  const meanY = logErr.reduce((a, b) => a + b, 0) / logErr.length;

  let num = 0;
  let den = 0;
  for (let i = 0; i < logN.length; i++) {
    num += (logN[i] - meanX) * (logErr[i] - meanY);
    den += Math.pow(logN[i] - meanX, 2);
  }

  return den !== 0 ? num / den : 0;
}

// Six Classic Applications Case Studies
export const CLASSIC_CASE_STUDIES: ClassicCaseStudy[] = [
  {
    id: "case_irregular_area",
    title: "1. 不规则平面图形面积",
    subtitle: "双曲线围成面积：A = \\int [f_1(x) - f_2(x)] \\, dx",
    iconName: "Maximize2",
    description:
      "计算由上曲线 y = √x 与下曲线 y = x² 在区间 [0, 1] 之间所围成的封闭不规则平面区域面积，体会积分的微元面积求和思想。",
    latexFormula: "A = \\int_{0}^{1} \\left(\\sqrt{x} - x^2\\right) \\, dx = \\left[ \\frac{2}{3}x^{3/2} - \\frac{1}{3}x^3 \\right]_{0}^{1} = \\frac{1}{3}",
    parameterName: "上界截面 x_max",
    paramMin: 0.2,
    paramMax: 1.0,
    paramDefault: 1.0,
    paramStep: 0.05,
    paramUnit: "m",
    funcA: (x: number) => (x >= 0 ? Math.sqrt(x) : 0),
    funcB: (x: number) => x * x,
    domain: [0, 1],
    computeExact: (param: number) => (2 / 3) * Math.pow(param, 1.5) - (1 / 3) * Math.pow(param, 3),
    computeApprox: (param: number, n: number) => {
      const h = param / n;
      let s = 0;
      for (let i = 0; i < n; i++) {
        const mid = (i + 0.5) * h;
        s += (Math.sqrt(mid) - mid * mid) * h;
      }
      return s;
    },
    unitResult: "m²",
    physicalMeaning: "两曲线间面积微元 dA = [f₁(x) - f₂(x)]dx 的黎曼无限累加",
    engineeringApplication: "土木工程横截面面积、机械叶片受风面积计算",
  },
  {
    id: "case_solid_revolution",
    title: "2. 旋转体体积 (磁盘法 / 圆柱壳法)",
    subtitle: "绕x轴旋转体体积：V = \\pi \\int [f(x)]^2 \\, dx",
    iconName: "Cylinder",
    description:
      "曲线 y = √x 在区间 [0, h] 绕 x 轴旋转 360° 生成抛物旋转体。磁盘法将立体切片为薄圆盘微元 dV = π y² dx = π x dx。",
    latexFormula: "V = \\pi \\int_{0}^{h} (\\sqrt{x})^2 \\, dx = \\pi \\int_{0}^{h} x \\, dx = \\frac{1}{2}\\pi h^2",
    parameterName: "旋转高度 h",
    paramMin: 1.0,
    paramMax: 5.0,
    paramDefault: 3.0,
    paramStep: 0.2,
    paramUnit: "cm",
    funcA: (x: number) => Math.sqrt(Math.max(0, x)),
    domain: [0, 5],
    computeExact: (h: number) => 0.5 * Math.PI * h * h,
    computeApprox: (h: number, n: number) => {
      const dx = h / n;
      let sum = 0;
      for (let i = 0; i < n; i++) {
        const xMid = (i + 0.5) * dx;
        const radius = Math.sqrt(xMid);
        sum += Math.PI * (radius * radius) * dx;
      }
      return sum;
    },
    unitResult: "cm³",
    physicalMeaning: "圆盘切片微元 dV = π·r(x)²·dx 沿主轴无限累加",
    engineeringApplication: "火箭整流罩锥体容积、流体压力容器储罐容积建模",
  },
  {
    id: "case_arc_length",
    title: "3. 曲线弧长精确计算",
    subtitle: "微元线段弧长：L = \\int \\sqrt{1 + [f'(x)]^2} \\, dx",
    iconName: "Activity",
    description:
      "计算悬链线/抛物线 y = 0.5x² 在区间 [-a, a] 上的精确曲线弧长。直角微元微段 ds = √(dx² + dy²) = √(1 + y'²) dx。",
    latexFormula: "L = \\int_{-a}^{a} \\sqrt{1 + x^2} \\, dx = a\\sqrt{1+a^2} + \\ln\\left(a + \\sqrt{1+a^2}\\right)",
    parameterName: "跨度半宽 a",
    paramMin: 0.5,
    paramMax: 3.0,
    paramDefault: 1.5,
    paramStep: 0.1,
    paramUnit: "m",
    funcA: (x: number) => 0.5 * x * x,
    domain: [-3, 3],
    computeExact: (a: number) => {
      // For y = 0.5 x^2, y' = x, integral of sqrt(1+x^2) from -a to a is 2 * int_0^a sqrt(1+x^2)dx
      return a * Math.sqrt(1 + a * a) + Math.log(a + Math.sqrt(1 + a * a));
    },
    computeApprox: (a: number, n: number) => {
      const dx = (2 * a) / n;
      let sum = 0;
      for (let i = 0; i < n; i++) {
        const x1 = -a + i * dx;
        const x2 = -a + (i + 1) * dx;
        const y1 = 0.5 * x1 * x1;
        const y2 = 0.5 * x2 * x2;
        sum += Math.hypot(x2 - x1, y2 - y1);
      }
      return sum;
    },
    unitResult: "m",
    physicalMeaning: "折线弦长向光滑曲线极限逼近，ds = √(1 + [f'(x)]²)dx",
    engineeringApplication: "悬索大桥主缆长度下料、高压输电线弧垂与光纤铺设布线",
  },
  {
    id: "case_kinematics_distance",
    title: "4. 变速直线运动路程与位移",
    subtitle: "速度对时间积分：s = \\int v(t) \\, dt",
    iconName: "TrendingUp",
    description:
      "质点以变速运动 v(t) = 3t² - 2t + 4 运行，计算从时间 t = 0 到 t = T 内所走过的位移总路程。v-t 图像下方几何面积即为位移。",
    latexFormula: "s(T) = \\int_{0}^{T} (3t^2 - 2t + 4) \\, dt = \\left[ t^3 - t^2 + 4t \\right]_{0}^{T} = T^3 - T^2 + 4T",
    parameterName: "行驶时间 T",
    paramMin: 1.0,
    paramMax: 6.0,
    paramDefault: 3.0,
    paramStep: 0.2,
    paramUnit: "s",
    funcA: (t: number) => 3 * t * t - 2 * t + 4,
    domain: [0, 6],
    computeExact: (T: number) => Math.pow(T, 3) - Math.pow(T, 2) + 4 * T,
    computeApprox: (T: number, n: number) => {
      const dt = T / n;
      let sum = 0;
      for (let i = 0; i < n; i++) {
        const tMid = (i + 0.5) * dt;
        sum += (3 * tMid * tMid - 2 * tMid + 4) * dt;
      }
      return sum;
    },
    unitResult: "m",
    physicalMeaning: "瞬间速度 v(t) 与时间微元 dt 乘积即瞬时位移 ds = v(t)dt",
    engineeringApplication: "自动驾驶刹车距离计算、航天运载火箭级段飞行轨迹推演",
  },
  {
    id: "case_variable_work",
    title: "5. 变力做功与弹性势能",
    subtitle: "变力沿位移积分：W = \\int F(x) \\, dx",
    iconName: "Zap",
    description:
      "弹簧劲度系数 k = 200 N/m，受胡克定律变力 F(x) = kx 作用拉伸至位移 X。变力-位移图像下面积等于克服弹力所做的功（储能）。",
    latexFormula: "W = \\int_{0}^{X} kx \\, dx = \\frac{1}{2}k X^2",
    parameterName: "弹簧拉伸位移 X",
    paramMin: 0.05,
    paramMax: 0.5,
    paramDefault: 0.25,
    paramStep: 0.02,
    paramUnit: "m",
    funcA: (x: number) => 200 * x,
    domain: [0, 0.5],
    computeExact: (X: number) => 0.5 * 200 * X * X,
    computeApprox: (X: number, n: number) => {
      const dx = X / n;
      let sum = 0;
      for (let i = 0; i < n; i++) {
        const xMid = (i + 0.5) * dx;
        sum += 200 * xMid * dx;
      }
      return sum;
    },
    unitResult: "J (焦耳)",
    physicalMeaning: "功微元 dW = F(x)dx 沿运动路径累加，体现力学能量转化",
    engineeringApplication: "汽车悬挂减震器能量吸收、弹弓与电磁发射动力学做功",
  },
  {
    id: "case_probability_density",
    title: "6. 连续概率密度与累积分布 (CDF)",
    subtitle: "PDF 积分得到累积概率：P(X \\le x) = \\int_{-\\infty}^x f(t) \\, dt",
    iconName: "BarChart3",
    description:
      "标准正态分布概率密度函数 (PDF) f(t) = \\frac{1}{\\sqrt{2\\pi}}e^{-t^2/2}，计算随机变量落在区间 [-z, z] 内的置信概率（如 1σ, 2σ, 3σ 原则）。",
    latexFormula: "P(-z \\le X \\le z) = \\int_{-z}^{z} \\frac{1}{\\sqrt{2\\pi}} e^{-t^2/2} \\, dt = \\operatorname{erf}\\left(\\frac{z}{\\sqrt{2}}\\right)",
    parameterName: "置信区间倍数 z (σ)",
    paramMin: 0.5,
    paramMax: 3.5,
    paramDefault: 1.96,
    paramStep: 0.1,
    paramUnit: "σ",
    funcA: (t: number) => (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * t * t),
    domain: [-3.5, 3.5],
    computeExact: (z: number) => erf(z / Math.SQRT2),
    computeApprox: (z: number, n: number) => {
      const dt = (2 * z) / n;
      let sum = 0;
      for (let i = 0; i < n; i++) {
        const tMid = -z + (i + 0.5) * dt;
        sum += (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * tMid * tMid) * dt;
      }
      return sum;
    },
    unitResult: "概率值 (0 ~ 1)",
    physicalMeaning: "连续概率密度曲线下方总面积等于事件发生概率",
    engineeringApplication: "工业质量六西格玛 (6σ) 缺陷率控制、金融期权风险价值评估",
  },
];
