import React, { useState } from "react";
import { CLASSIC_CASE_STUDIES } from "../utils/mathEngine";
import { ClassicCaseStudy } from "../types";
import { MathFormula, MathText } from "./MathFormula";
import {
  Maximize2,
  Cylinder,
  Activity,
  TrendingUp,
  Zap,
  BarChart3,
  Sliders,
  CheckCircle,
  HelpCircle,
  Lightbulb,
} from "lucide-react";

export const ClassicApplications: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(CLASSIC_CASE_STUDIES[0].id);
  const [paramValue, setParamValue] = useState<number>(CLASSIC_CASE_STUDIES[0].paramDefault);
  const [caseN, setCaseN] = useState<number>(20);

  const activeCase = CLASSIC_CASE_STUDIES.find((c) => c.id === selectedCaseId) || CLASSIC_CASE_STUDIES[0];

  const handleSelectCase = (c: ClassicCaseStudy) => {
    setSelectedCaseId(c.id);
    setParamValue(c.paramDefault);
  };

  const exactResult = activeCase.computeExact(paramValue);
  const approxResult = activeCase.computeApprox(paramValue, caseN);
  const absError = Math.abs(approxResult - exactResult);

  const getCaseIcon = (name: string) => {
    switch (name) {
      case "Maximize2": return <Maximize2 className="w-4 h-4" />;
      case "Cylinder": return <Cylinder className="w-4 h-4" />;
      case "Activity": return <Activity className="w-4 h-4" />;
      case "TrendingUp": return <TrendingUp className="w-4 h-4" />;
      case "Zap": return <Zap className="w-4 h-4" />;
      case "BarChart3": return <BarChart3 className="w-4 h-4" />;
      default: return <Maximize2 className="w-4 h-4" />;
    }
  };

  // 2D Canvas / SVG preview for the active case
  const svgWidth = 680;
  const svgHeight = 340;
  const pad = { top: 32, right: 35, bottom: 45, left: 55 };
  const plotW = svgWidth - pad.left - pad.right;
  const plotH = svgHeight - pad.top - pad.bottom;

  // Render specialized visualization for each case
  const renderCaseCanvas = () => {
    switch (activeCase.id) {
      case "case_probability_density": {
        // Normal Distribution Bell Curve PDF & CDF
        const xMin = -3.8;
        const xMax = 3.8;
        const yMax = 0.44; // Peak is 1/sqrt(2pi) approx 0.3989
        const z = paramValue;

        const toSvgX = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * plotW;
        const toSvgY = (y: number) => svgHeight - pad.bottom - (y / yMax) * plotH;

        // Generate smooth bell curve points
        const numCurvePts = 120;
        const curvePoints: string[] = [];
        for (let i = 0; i <= numCurvePts; i++) {
          const x = xMin + (i / numCurvePts) * (xMax - xMin);
          const y = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
          curvePoints.push(`${i === 0 ? "M" : "L"} ${toSvgX(x).toFixed(1)} ${toSvgY(y).toFixed(1)}`);
        }
        const curvePathStr = curvePoints.join(" ");

        // Generate shaded integrated area path [-z, z]
        const zClamped = Math.min(xMax, Math.max(0.1, z));
        const numAreaPts = 60;
        const areaPoints: string[] = [`M ${toSvgX(-zClamped).toFixed(1)} ${toSvgY(0).toFixed(1)}`];
        for (let i = 0; i <= numAreaPts; i++) {
          const x = -zClamped + (i / numAreaPts) * (2 * zClamped);
          const y = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
          areaPoints.push(`L ${toSvgX(x).toFixed(1)} ${toSvgY(y).toFixed(1)}`);
        }
        areaPoints.push(`L ${toSvgX(zClamped).toFixed(1)} ${toSvgY(0).toFixed(1)} Z`);
        const areaPathStr = areaPoints.join(" ");

        // Micro-element slices for [-z, z]
        const dz = (2 * zClamped) / caseN;
        const slices = Array.from({ length: caseN }).map((_, i) => {
          const x1 = -zClamped + i * dz;
          const x2 = -zClamped + (i + 1) * dz;
          const xMid = (x1 + x2) / 2;
          const yMid = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * xMid * xMid);

          const px1 = toSvgX(x1);
          const px2 = toSvgX(x2);
          const pyMid = toSvgY(yMid);
          const pyBase = toSvgY(0);

          return {
            x: px1,
            y: pyMid,
            width: Math.max(1, px2 - px1 - 0.5),
            height: pyBase - pyMid,
          };
        });

        // Sigma tick marks
        const sigmaTicks = [-3, -2, -1, 0, 1, 2, 3];
        const probPct = (exactResult * 100).toFixed(2);

        return (
          <g>
            {/* Grid horizontal guidelines */}
            {[0.1, 0.2, 0.3, 0.4].map((y) => (
              <g key={`y-grid-${y}`}>
                <line
                  x1={pad.left}
                  y1={toSvgY(y)}
                  x2={svgWidth - pad.right}
                  y2={toSvgY(y)}
                  stroke="#334155"
                  strokeDasharray="3 3"
                  strokeWidth="0.8"
                />
                <text x={pad.left - 8} y={toSvgY(y) + 3} fill="#64748b" fontSize="10" textAnchor="end">
                  {y.toFixed(1)}
                </text>
              </g>
            ))}

            {/* Sigma vertical guidelines */}
            {sigmaTicks.map((s) => (
              <g key={`sigma-${s}`}>
                <line
                  x1={toSvgX(s)}
                  y1={pad.top}
                  x2={toSvgX(s)}
                  y2={svgHeight - pad.bottom}
                  stroke={s === 0 ? "#475569" : "#1e293b"}
                  strokeDasharray={s === 0 ? undefined : "2 2"}
                  strokeWidth={s === 0 ? 1.2 : 0.8}
                />
                <text x={toSvgX(s)} y={svgHeight - pad.bottom + 16} fill="#94a3b8" fontSize="10" textAnchor="middle">
                  {s === 0 ? "0 (μ)" : `${s > 0 ? "+" : ""}${s}σ`}
                </text>
              </g>
            ))}

            {/* Shaded Area Under [-z, z] */}
            <path d={areaPathStr} fill="url(#caseAreaGrad)" opacity="0.6" />

            {/* Discrete Micro-Element Slices */}
            {slices.map((sl, i) => (
              <rect
                key={`slice-${i}`}
                x={sl.x}
                y={sl.y}
                width={sl.width}
                height={sl.height}
                fill="url(#caseAreaGrad)"
                stroke="#60a5fa"
                strokeWidth="0.8"
                opacity="0.85"
              />
            ))}

            {/* Bell Curve Outline */}
            <path d={curvePathStr} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

            {/* Left and Right Boundary Lines at -z and +z */}
            <line
              x1={toSvgX(-zClamped)}
              y1={toSvgY(0)}
              x2={toSvgX(-zClamped)}
              y2={toSvgY((1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * zClamped * zClamped))}
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
            <line
              x1={toSvgX(zClamped)}
              y1={toSvgY(0)}
              x2={toSvgX(zClamped)}
              y2={toSvgY((1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * zClamped * zClamped))}
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="4 2"
            />

            {/* Highlight Marker Dots */}
            <circle
              cx={toSvgX(-zClamped)}
              cy={toSvgY((1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * zClamped * zClamped))}
              r="4.5"
              fill="#fbbf24"
              stroke="#78350f"
              strokeWidth="1.5"
            />
            <circle
              cx={toSvgX(zClamped)}
              cy={toSvgY((1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * zClamped * zClamped))}
              r="4.5"
              fill="#fbbf24"
              stroke="#78350f"
              strokeWidth="1.5"
            />

            {/* Confidence Label in SVG */}
            <g transform={`translate(${toSvgX(0)}, ${pad.top + 15})`}>
              <rect x="-85" y="-14" width="170" height="26" rx="13" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" opacity="0.9" />
              <text x="0" y="3" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
                置信概率 P({(-z).toFixed(2)}σ ≤ X ≤ {z.toFixed(2)}σ) ≈ {probPct}%
              </text>
            </g>

            {/* Peak indicator */}
            <text x={toSvgX(0)} y={toSvgY(0.3989) - 8} fill="#94a3b8" fontSize="10" textAnchor="middle">
              f(0) = 1/√(2π) ≈ 0.3989
            </text>
          </g>
        );
      }

      case "case_irregular_area": {
        // Area between y = sqrt(x) and y = x^2
        const xMin = 0;
        const xMax = 1.1;
        const yMax = 1.1;
        const xCut = paramValue;

        const toSvgX = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * plotW;
        const toSvgY = (y: number) => svgHeight - pad.bottom - (y / yMax) * plotH;

        const numPts = 80;
        const curve1Pts: string[] = [];
        const curve2Pts: string[] = [];
        for (let i = 0; i <= numPts; i++) {
          const x = (i / numPts) * 1.0;
          const y1 = Math.sqrt(x);
          const y2 = x * x;
          curve1Pts.push(`${i === 0 ? "M" : "L"} ${toSvgX(x).toFixed(1)} ${toSvgY(y1).toFixed(1)}`);
          curve2Pts.push(`${i === 0 ? "M" : "L"} ${toSvgX(x).toFixed(1)} ${toSvgY(y2).toFixed(1)}`);
        }

        const dx = xCut / caseN;
        const slices = Array.from({ length: caseN }).map((_, i) => {
          const x1 = i * dx;
          const x2 = (i + 1) * dx;
          const xMid = (x1 + x2) / 2;
          const yTop = Math.sqrt(xMid);
          const yBot = xMid * xMid;

          const px1 = toSvgX(x1);
          const px2 = toSvgX(x2);
          const pyTop = toSvgY(yTop);
          const pyBot = toSvgY(yBot);

          return {
            x: px1,
            y: pyTop,
            width: Math.max(1, px2 - px1 - 0.5),
            height: Math.max(2, pyBot - pyTop),
          };
        });

        return (
          <g>
            {/* Grid */}
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((v) => (
              <g key={`grid-irr-${v}`}>
                <line x1={toSvgX(v)} y1={pad.top} x2={toSvgX(v)} y2={svgHeight - pad.bottom} stroke="#1e293b" strokeDasharray="2 2" />
                <line x1={pad.left} y1={toSvgY(v)} x2={svgWidth - pad.right} y2={toSvgY(v)} stroke="#1e293b" strokeDasharray="2 2" />
                <text x={toSvgX(v)} y={svgHeight - pad.bottom + 16} fill="#94a3b8" fontSize="10" textAnchor="middle">{v.toFixed(1)}</text>
                <text x={pad.left - 8} y={toSvgY(v) + 3} fill="#94a3b8" fontSize="10" textAnchor="end">{v.toFixed(1)}</text>
              </g>
            ))}

            {/* Slices between curves */}
            {slices.map((sl, i) => (
              <rect key={`irr-sl-${i}`} x={sl.x} y={sl.y} width={sl.width} height={sl.height} fill="url(#caseAreaGrad)" stroke="#60a5fa" strokeWidth="0.8" opacity="0.85" />
            ))}

            {/* Curves */}
            <path d={curve1Pts.join(" ")} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
            <path d={curve2Pts.join(" ")} fill="none" stroke="#f43f5e" strokeWidth="2.5" />

            {/* Boundary line at x_max */}
            <line x1={toSvgX(xCut)} y1={toSvgY(0)} x2={toSvgX(xCut)} y2={toSvgY(Math.sqrt(xCut))} stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 2" />

            <text x={toSvgX(0.7)} y={toSvgY(Math.sqrt(0.7)) - 10} fill="#38bdf8" fontSize="11" fontWeight="bold">y₁ = √x (上边界)</text>
            <text x={toSvgX(0.85)} y={toSvgY(0.85 * 0.85) + 16} fill="#f43f5e" fontSize="11" fontWeight="bold">y₂ = x² (下边界)</text>
          </g>
        );
      }

      case "case_solid_revolution": {
        // Solid of revolution 3D Disk method
        const xMin = 0;
        const xMax = 5.2;
        const yMax = 2.8;
        const h = paramValue;

        const toSvgX = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * plotW;
        const toSvgY = (y: number) => svgHeight / 2 - (y / yMax) * (plotH / 2);

        const dx = h / caseN;
        const disks = Array.from({ length: caseN }).map((_, i) => {
          const x = (i + 0.5) * dx;
          const r = Math.sqrt(x);
          const px = toSvgX(x);
          const rx = Math.max(3, (dx / (xMax - xMin)) * plotW * 0.8);
          const ry = (r / yMax) * (plotH / 2);

          return { px, rx, ry, r };
        });

        // Top & bottom profile curves
        const numPts = 60;
        const topPts: string[] = [];
        const botPts: string[] = [];
        for (let i = 0; i <= numPts; i++) {
          const x = (i / numPts) * h;
          const r = Math.sqrt(x);
          topPts.push(`${i === 0 ? "M" : "L"} ${toSvgX(x).toFixed(1)} ${toSvgY(r).toFixed(1)}`);
          botPts.push(`${i === 0 ? "M" : "L"} ${toSvgX(x).toFixed(1)} ${toSvgY(-r).toFixed(1)}`);
        }

        return (
          <g>
            {/* Center axis line */}
            <line x1={pad.left} y1={svgHeight / 2} x2={svgWidth - pad.right} y2={svgHeight / 2} stroke="#64748b" strokeWidth="1.2" strokeDasharray="6 3" />
            <text x={svgWidth - pad.right} y={svgHeight / 2 - 8} fill="#94a3b8" fontSize="10" textAnchor="end">旋转对称轴 (x轴)</text>

            {/* Sliced 3D Cylindrical Disks */}
            {disks.map((d, i) => (
              <ellipse
                key={`disk-${i}`}
                cx={d.px}
                cy={svgHeight / 2}
                rx={d.rx}
                ry={d.ry}
                fill="#3b82f6"
                fillOpacity="0.25"
                stroke="#60a5fa"
                strokeWidth="1"
              />
            ))}

            {/* Profile curves */}
            <path d={topPts.join(" ")} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
            <path d={botPts.join(" ")} fill="none" stroke="#38bdf8" strokeWidth="2.5" />

            {/* End Cap Ellipse */}
            <ellipse
              cx={toSvgX(h)}
              cy={svgHeight / 2}
              rx={12}
              ry={(Math.sqrt(h) / yMax) * (plotH / 2)}
              fill="#fbbf24"
              fillOpacity="0.4"
              stroke="#fbbf24"
              strokeWidth="2"
            />

            <text x={toSvgX(h / 2)} y={toSvgY(Math.sqrt(h / 2)) - 10} fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
              母线 r(x) = √x, 微元体积 dV = π·r(x)²·dx
            </text>
          </g>
        );
      }

      case "case_arc_length": {
        // Arc Length of Parabola y = 0.5 x^2
        const xMin = -3.2;
        const xMax = 3.2;
        const yMax = 5.0;
        const a = paramValue;

        const toSvgX = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * plotW;
        const toSvgY = (y: number) => svgHeight - pad.bottom - (y / yMax) * plotH;

        const numCurvePts = 100;
        const curvePts: string[] = [];
        for (let i = 0; i <= numCurvePts; i++) {
          const x = xMin + (i / numCurvePts) * (xMax - xMin);
          const y = 0.5 * x * x;
          curvePts.push(`${i === 0 ? "M" : "L"} ${toSvgX(x).toFixed(1)} ${toSvgY(y).toFixed(1)}`);
        }

        const dx = (2 * a) / caseN;
        const segments = Array.from({ length: caseN }).map((_, i) => {
          const x1 = -a + i * dx;
          const x2 = -a + (i + 1) * dx;
          const y1 = 0.5 * x1 * x1;
          const y2 = 0.5 * x2 * x2;
          return {
            x1: toSvgX(x1),
            y1: toSvgY(y1),
            x2: toSvgX(x2),
            y2: toSvgY(y2),
          };
        });

        return (
          <g>
            {/* Grid */}
            {[-3, -2, -1, 0, 1, 2, 3].map((v) => (
              <g key={`grid-arc-${v}`}>
                <line x1={toSvgX(v)} y1={pad.top} x2={toSvgX(v)} y2={svgHeight - pad.bottom} stroke="#1e293b" strokeDasharray="2 2" />
                <text x={toSvgX(v)} y={svgHeight - pad.bottom + 16} fill="#94a3b8" fontSize="10" textAnchor="middle">{v}</text>
              </g>
            ))}

            {/* Smooth Parabola */}
            <path d={curvePts.join(" ")} fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Chord Line Segments (ds approximation) */}
            {segments.map((seg, i) => (
              <g key={`seg-${i}`}>
                <line x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2} stroke="#38bdf8" strokeWidth="2.5" />
                <circle cx={seg.x1} cy={seg.y1} r="2.5" fill="#fbbf24" />
              </g>
            ))}
            <circle cx={segments[segments.length - 1].x2} cy={segments[segments.length - 1].y2} r="2.5" fill="#fbbf24" />

            {/* Boundary markers */}
            <line x1={toSvgX(-a)} y1={toSvgY(0)} x2={toSvgX(-a)} y2={toSvgY(0.5 * a * a)} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 2" />
            <line x1={toSvgX(a)} y1={toSvgY(0)} x2={toSvgX(a)} y2={toSvgY(0.5 * a * a)} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 2" />

            <text x={toSvgX(0)} y={toSvgY(1.0)} fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
              微元折线段 ds = √(dx² + dy²) = √(1 + [f'(x)]²)dx
            </text>
          </g>
        );
      }

      case "case_kinematics_distance": {
        // v(t) = 3t^2 - 2t + 4
        const xMin = 0;
        const xMax = 6.2;
        const yMax = 110;
        const T = paramValue;

        const toSvgX = (t: number) => pad.left + ((t - xMin) / (xMax - xMin)) * plotW;
        const toSvgY = (v: number) => svgHeight - pad.bottom - (v / yMax) * plotH;

        const numPts = 80;
        const curvePts: string[] = [];
        for (let i = 0; i <= numPts; i++) {
          const t = (i / numPts) * 6.0;
          const v = 3 * t * t - 2 * t + 4;
          curvePts.push(`${i === 0 ? "M" : "L"} ${toSvgX(t).toFixed(1)} ${toSvgY(v).toFixed(1)}`);
        }

        const dt = T / caseN;
        const slices = Array.from({ length: caseN }).map((_, i) => {
          const t1 = i * dt;
          const t2 = (i + 1) * dt;
          const tMid = (t1 + t2) / 2;
          const vMid = 3 * tMid * tMid - 2 * tMid + 4;

          const px1 = toSvgX(t1);
          const px2 = toSvgX(t2);
          const py = toSvgY(vMid);
          const pyBase = toSvgY(0);

          return {
            x: px1,
            y: py,
            width: Math.max(1, px2 - px1 - 0.5),
            height: pyBase - py,
          };
        });

        return (
          <g>
            {/* Grid */}
            {[20, 40, 60, 80, 100].map((v) => (
              <g key={`grid-kin-${v}`}>
                <line x1={pad.left} y1={toSvgY(v)} x2={svgWidth - pad.right} y2={toSvgY(v)} stroke="#1e293b" strokeDasharray="2 2" />
                <text x={pad.left - 8} y={toSvgY(v) + 3} fill="#94a3b8" fontSize="10" textAnchor="end">{v}</text>
              </g>
            ))}
            {[1, 2, 3, 4, 5, 6].map((t) => (
              <g key={`grid-kin-t-${t}`}>
                <line x1={toSvgX(t)} y1={pad.top} x2={toSvgX(t)} y2={svgHeight - pad.bottom} stroke="#1e293b" strokeDasharray="2 2" />
                <text x={toSvgX(t)} y={svgHeight - pad.bottom + 16} fill="#94a3b8" fontSize="10" textAnchor="middle">{t}s</text>
              </g>
            ))}

            {/* Slices under v(t) */}
            {slices.map((sl, i) => (
              <rect key={`kin-sl-${i}`} x={sl.x} y={sl.y} width={sl.width} height={sl.height} fill="url(#caseAreaGrad)" stroke="#60a5fa" strokeWidth="0.8" opacity="0.85" />
            ))}

            {/* v(t) curve */}
            <path d={curvePts.join(" ")} fill="none" stroke="#38bdf8" strokeWidth="2.5" />

            {/* Boundary at T */}
            <line x1={toSvgX(T)} y1={toSvgY(0)} x2={toSvgX(T)} y2={toSvgY(3 * T * T - 2 * T + 4)} stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 2" />

            <text x={toSvgX(T / 2)} y={toSvgY(25)} fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
              位移微元 ds = v(t)dt, 面积累加 = 总路程 s(T)
            </text>
          </g>
        );
      }

      case "case_variable_work": {
        // F(x) = 200 * x
        const xMin = 0;
        const xMax = 0.52;
        const yMax = 110;
        const X = paramValue;

        const toSvgX = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * plotW;
        const toSvgY = (F: number) => svgHeight - pad.bottom - (F / yMax) * plotH;

        const dx = X / caseN;
        const slices = Array.from({ length: caseN }).map((_, i) => {
          const x1 = i * dx;
          const x2 = (i + 1) * dx;
          const xMid = (x1 + x2) / 2;
          const FMid = 200 * xMid;

          const px1 = toSvgX(x1);
          const px2 = toSvgX(x2);
          const py = toSvgY(FMid);
          const pyBase = toSvgY(0);

          return {
            x: px1,
            y: py,
            width: Math.max(1, px2 - px1 - 0.5),
            height: pyBase - py,
          };
        });

        return (
          <g>
            {/* Grid */}
            {[20, 40, 60, 80, 100].map((F) => (
              <g key={`grid-work-${F}`}>
                <line x1={pad.left} y1={toSvgY(F)} x2={svgWidth - pad.right} y2={toSvgY(F)} stroke="#1e293b" strokeDasharray="2 2" />
                <text x={pad.left - 8} y={toSvgY(F) + 3} fill="#94a3b8" fontSize="10" textAnchor="end">{F}N</text>
              </g>
            ))}
            {[0.1, 0.2, 0.3, 0.4, 0.5].map((x) => (
              <g key={`grid-work-x-${x}`}>
                <line x1={toSvgX(x)} y1={pad.top} x2={toSvgX(x)} y2={svgHeight - pad.bottom} stroke="#1e293b" strokeDasharray="2 2" />
                <text x={toSvgX(x)} y={svgHeight - pad.bottom + 16} fill="#94a3b8" fontSize="10" textAnchor="middle">{x.toFixed(1)}m</text>
              </g>
            ))}

            {/* Work Slices */}
            {slices.map((sl, i) => (
              <rect key={`work-sl-${i}`} x={sl.x} y={sl.y} width={sl.width} height={sl.height} fill="url(#caseAreaGrad)" stroke="#60a5fa" strokeWidth="0.8" opacity="0.85" />
            ))}

            {/* Hooke line F = kx */}
            <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(0.5)} y2={toSvgY(100)} stroke="#38bdf8" strokeWidth="2.5" />

            {/* Boundary at X */}
            <line x1={toSvgX(X)} y1={toSvgY(0)} x2={toSvgX(X)} y2={toSvgY(200 * X)} stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 2" />

            <text x={toSvgX(X / 2)} y={toSvgY(15)} fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
              变力微元功 dW = F(x)dx = (kx)dx, 弹性势能 E_p = 1/2 k X²
            </text>
          </g>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div id="classic-applications-section" className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold mb-1 border border-blue-100">
              <span>模块 5 · 六大经典微积分工程与物理应用案例库</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              一键加载与 2D 微元切片仿真演播
            </h2>
          </div>
        </div>

        {/* 6 Case Badges Selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {CLASSIC_CASE_STUDIES.map((c) => {
            const isSelected = c.id === selectedCaseId;
            return (
              <button
                key={c.id}
                id={`case-tab-${c.id}`}
                onClick={() => handleSelectCase(c)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-blue-50/80 border-blue-300 ring-1 ring-blue-200 shadow-2xs"
                    : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5 text-blue-600">
                  {getCaseIcon(c.iconName)}
                  <span className="font-bold text-xs truncate text-slate-900">{c.title.split(". ")[1]}</span>
                </div>
                <span className="text-[10px] text-slate-500 line-clamp-1">{c.physicalMeaning}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Simulation Stage for Selected Case */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Geometric and Physical Simulation */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">{activeCase.title}</h3>
              <div className="text-xs text-slate-500 mt-0.5">
                <MathText text={activeCase.subtitle} />
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              工程应用模式
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <MathFormula formula={activeCase.latexFormula} block />
          </div>

          {/* Interactive Parameter Sliders */}
          <div className="space-y-3 p-4 bg-blue-50/40 rounded-xl border border-blue-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>{activeCase.parameterName}:</span>
                  <span className="font-mono text-blue-700 font-bold">
                    {paramValue.toFixed(2)} {activeCase.paramUnit}
                  </span>
                </div>
                <input
                  id="slider-case-param"
                  type="range"
                  min={activeCase.paramMin}
                  max={activeCase.paramMax}
                  step={activeCase.paramStep}
                  value={paramValue}
                  onChange={(e) => setParamValue(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>微元分割切片数 n:</span>
                  <span className="font-mono text-blue-700 font-bold">{caseN}</span>
                </div>
                <input
                  id="slider-case-n"
                  type="range"
                  min={2}
                  max={100}
                  value={caseN}
                  onChange={(e) => setCaseN(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Presets for Probability Density (CDF) */}
            {activeCase.id === "case_probability_density" && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
                <span className="text-slate-500 font-medium mr-1">统计工程常数一键置信度:</span>
                {[
                  { label: "1.00σ (68.27%)", val: 1.0 },
                  { label: "1.96σ (95.00%)", val: 1.96 },
                  { label: "2.00σ (95.45%)", val: 2.0 },
                  { label: "2.58σ (99.00%)", val: 2.58 },
                  { label: "3.00σ (99.73%)", val: 3.0 },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setParamValue(item.val)}
                    className={`px-2 py-0.5 rounded-md border transition-all cursor-pointer font-mono ${
                      Math.abs(paramValue - item.val) < 0.02
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2D Case Visualizer Canvas */}
          <div className="relative w-full overflow-hidden rounded-xl bg-slate-950 border border-slate-800 p-2 shadow-inner">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none">
              <defs>
                <linearGradient id="caseAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.25" />
                </linearGradient>
              </defs>

              {/* Main Axes */}
              <line
                x1={pad.left}
                y1={svgHeight - pad.bottom}
                x2={svgWidth - pad.right}
                y2={svgHeight - pad.bottom}
                stroke="#64748b"
                strokeWidth="1.2"
              />
              <line
                x1={pad.left}
                y1={pad.top}
                x2={pad.left}
                y2={svgHeight - pad.bottom}
                stroke="#64748b"
                strokeWidth="1.2"
              />

              {/* Render Specialized Geometry */}
              {renderCaseCanvas()}

              <text
                x={svgWidth - pad.right}
                y={svgHeight - pad.bottom + 32}
                fill="#94a3b8"
                fontSize="11"
                textAnchor="end"
                fontFamily="monospace"
              >
                自变量轴
              </text>
              <text
                x={pad.left}
                y={pad.top - 12}
                fill="#94a3b8"
                fontSize="11"
                fontFamily="monospace"
              >
                被积微元强度 f(x)
              </text>
            </svg>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium">离散数值求积</span>
              <p className="text-base font-mono font-bold text-blue-700 mt-0.5">
                {approxResult.toFixed(4)} {activeCase.unitResult}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium">解析理论真解</span>
              <p className="text-base font-mono font-bold text-emerald-600 mt-0.5">
                {exactResult.toFixed(4)} {activeCase.unitResult}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium">逼近残差</span>
              <p className="text-base font-mono font-bold text-rose-600 mt-0.5">
                {absError < 1e-4 ? absError.toExponential(2) : absError.toFixed(4)}
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Engineering and Physics Knowledge Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-blue-600">
              <Lightbulb className="w-4 h-4" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">物理微元机制</h4>
            </div>
            <div className="text-xs text-slate-600 leading-relaxed">
              <MathText text={activeCase.physicalMeaning} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle className="w-4 h-4" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">工程实践落地</h4>
            </div>
            <div className="text-xs text-slate-600 leading-relaxed">
              <MathText text={activeCase.engineeringApplication} />
            </div>
          </div>

          <div className="bg-blue-50/60 rounded-xl p-5 border border-blue-100 space-y-2">
            <h4 className="text-xs font-bold text-blue-900">微元法 (Differential Element) 核心法则</h4>
            <div className="text-[11px] text-blue-800 leading-relaxed space-y-1">
              <div>
                <MathText text="1. 选取自变量 $x$，并在微分小区间 $[x, x+dx]$ 上取特征微元；" />
              </div>
              <div>
                <MathText text="2. 忽略高阶无穷小量，写出物理量微元 $dQ = g(x) \\, dx$；" />
              </div>
              <div>
                <MathText text="3. 在整个积分域 $[a, b]$ 上实施连续求和：$Q = \\int_a^b g(x) \\, dx$。" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
