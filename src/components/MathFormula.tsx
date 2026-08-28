import React, { useMemo } from "react";
import katex from "katex";

/**
 * Refines LaTeX math strings for superior mathematical typography.
 * Standardizes differential spacing (\,dx, \,dt, \,du, etc.),
 * integral limits, brackets, and sums.
 */
export function formatIntegralLatex(raw: string): string {
  if (!raw) return "";
  let formula = raw.trim();

  // Fix integral differential spacing: e.g. dx, dt, du, dy, dz, ds, d\theta when directly preceded by tokens without \,
  formula = formula.replace(
    /([^\\](?:\\right[\)\]\}|.]|[0-9a-zA-Z\)\}\]])\s*)(d[xytuvwsz]|d\\theta|d\\phi|d\\tau|d\\rho|d\\mu|d\\lambda)\b/g,
    (match, p1, p2) => {
      if (p1.endsWith("\\,") || p1.endsWith("\\ ") || p1.endsWith("\\quad")) {
        return match;
      }
      return `${p1}\\,${p2}`;
    }
  );

  // Standardize d/dx fraction brackets
  formula = formula.replace(/\\frac\{d\}\{dx\}\s*\\int/g, "\\frac{d}{dx}\\left[\\int");

  return formula;
}

interface MathFormulaProps {
  formula: string;
  block?: boolean;
  className?: string;
}

/**
 * Standard KaTeX Formula component for rendering pure LaTeX expressions.
 */
export const MathFormula: React.FC<MathFormulaProps> = ({
  formula,
  block = false,
  className = "",
}) => {
  const html = useMemo(() => {
    try {
      const refined = formatIntegralLatex(formula);
      return katex.renderToString(refined, {
        displayMode: block,
        throwOnError: false,
        output: "html",
        strict: false,
      });
    } catch (err) {
      console.warn("KaTeX render error for formula:", formula, err);
      return formula;
    }
  }, [formula, block]);

  return (
    <span
      className={`${block ? "block my-2 text-center overflow-x-auto py-1" : "inline-block align-middle"} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

/**
 * Parses inline math ($...$, \(...\)), bold markdown (**...**), and inline code (`...`)
 * returning a flat list of React inline elements.
 */
function parseInlineMathTokens(rawText: string, keyPrefix: string): React.ReactNode[] {
  if (!rawText) return [];

  // Match:
  // 1. $$...$$
  // 2. \[...\]
  // 3. $...$
  // 4. \(...\)
  // 5. **...**
  // 6. `...`
  const regex =
    /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$(?:\\\$|[^\$\n])+\$|\\\([\s\S]+?\\\)|\*\*[^*]+?\*\*|`[^`]+?`)/g;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(rawText)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <span key={`${keyPrefix}-t-${lastIndex}`}>
          {rawText.slice(lastIndex, match.index)}
        </span>
      );
    }

    const matchedStr = match[0];
    const idx = match.index;

    if (matchedStr.startsWith("$$") && matchedStr.endsWith("$$")) {
      nodes.push(
        <MathFormula
          key={`${keyPrefix}-bmath-${idx}`}
          formula={matchedStr.slice(2, -2).trim()}
          block
        />
      );
    } else if (matchedStr.startsWith("\\[") && matchedStr.endsWith("\\]")) {
      nodes.push(
        <MathFormula
          key={`${keyPrefix}-bmath-${idx}`}
          formula={matchedStr.slice(2, -2).trim()}
          block
        />
      );
    } else if (matchedStr.startsWith("$") && matchedStr.endsWith("$")) {
      nodes.push(
        <MathFormula
          key={`${keyPrefix}-imath-${idx}`}
          formula={matchedStr.slice(1, -1).trim()}
          block={false}
        />
      );
    } else if (matchedStr.startsWith("\\(") && matchedStr.endsWith("\\)")) {
      nodes.push(
        <MathFormula
          key={`${keyPrefix}-imath-${idx}`}
          formula={matchedStr.slice(2, -2).trim()}
          block={false}
        />
      );
    } else if (matchedStr.startsWith("**") && matchedStr.endsWith("**")) {
      const inner = matchedStr.slice(2, -2);
      nodes.push(
        <strong key={`${keyPrefix}-bold-${idx}`} className="font-bold text-slate-900">
          {parseInlineMathTokens(inner, `${keyPrefix}-bold-${idx}`)}
        </strong>
      );
    } else if (matchedStr.startsWith("`") && matchedStr.endsWith("`")) {
      nodes.push(
        <code
          key={`${keyPrefix}-code-${idx}`}
          className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-blue-700 border border-slate-200"
        >
          {matchedStr.slice(1, -1)}
        </code>
      );
    }

    lastIndex = match.index + matchedStr.length;
  }

  if (lastIndex < rawText.length) {
    nodes.push(
      <span key={`${keyPrefix}-t-${lastIndex}`}>
        {rawText.slice(lastIndex)}
      </span>
    );
  }

  return nodes;
}

interface MathTextProps {
  text: string;
  className?: string;
  inline?: boolean;
}

/**
 * Converts text containing Markdown-style math ($...$, $$...$$, \[...\], \(...\))
 * and ascii math notations into properly formatted KaTeX elements.
 */
export const MathText: React.FC<MathTextProps> = ({
  text,
  className = "",
  inline = false,
}) => {
  const isMultiline = useMemo(() => text && text.includes("\n\n"), [text]);

  const content = useMemo(() => {
    if (!text) return null;

    if (!isMultiline || inline) {
      return parseInlineMathTokens(text, "inline");
    }

    const paragraphs = text.split(/\n\n+/);
    return paragraphs.map((para, pIdx) => {
      const trimmed = para.trim();
      if (
        (trimmed.startsWith("$$") && trimmed.endsWith("$$") && trimmed.length >= 4) ||
        (trimmed.startsWith("\\[") && trimmed.endsWith("\\]") && trimmed.length >= 4)
      ) {
        const blockFormula = trimmed.slice(2, -2).trim();
        return (
          <div key={`p-block-${pIdx}`} className="my-2.5 overflow-x-auto text-center">
            <MathFormula formula={blockFormula} block />
          </div>
        );
      }

      return (
        <div key={`para-${pIdx}`} className="whitespace-pre-wrap leading-relaxed">
          {parseInlineMathTokens(para, `para-${pIdx}`)}
        </div>
      );
    });
  }, [text, isMultiline, inline]);

  if (!text) return null;

  if (inline || !isMultiline) {
    return <span className={`math-text-inline ${className}`}>{content}</span>;
  }

  return <div className={`math-text-container space-y-2 ${className}`}>{content}</div>;
};
