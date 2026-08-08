/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Markdown from 'react-markdown';
import katex from 'katex';

interface MathMarkdownProps {
  children: string;
}

// Render inline math matching $ ... $
function renderMathInText(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\$([^\$\n]+?)\$/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const beforeText = text.slice(lastIndex, match.index);
    if (beforeText) {
      parts.push(beforeText);
    }

    const latex = match[1];
    try {
      const html = katex.renderToString(latex, {
        displayMode: false,
        throwOnError: false,
      });
      parts.push(
        <span
          key={`math-inline-${match.index}`}
          dangerouslySetInnerHTML={{ __html: html }}
          className="inline-block px-1 align-middle text-indigo-750 font-bold"
        />
      );
    } catch (e) {
      parts.push(`$${latex}$`);
    }

    lastIndex = regex.lastIndex;
  }

  const afterText = text.slice(lastIndex);
  if (afterText) {
    parts.push(afterText);
  }

  return parts;
}

// Recursively traverse and replace formulas in React nodes
function renderMathInNode(node: React.ReactNode): React.ReactNode {
  if (typeof node === 'string') {
    // Replace double dollars first (block math)
    const blocks: React.ReactNode[] = [];
    const doubleDollarRegex = /\$\$([\s\S]+?)\$\$/g;
    let lastIndex = 0;
    let match;

    while ((match = doubleDollarRegex.exec(node)) !== null) {
      const beforeText = node.slice(lastIndex, match.index);
      if (beforeText) {
        blocks.push(...renderMathInText(beforeText));
      }

      const latex = match[1];
      try {
        const html = katex.renderToString(latex, {
          displayMode: true,
          throwOnError: false,
        });
        blocks.push(
          <div
            key={`math-block-${match.index}`}
            dangerouslySetInnerHTML={{ __html: html }}
            className="katex-block-container my-4 text-center overflow-x-auto w-full max-w-full text-indigo-900 bg-indigo-50/20 py-2.5 rounded-lg border border-indigo-100/30"
          />
        );
      } catch (e) {
        blocks.push(`$$${latex}$$`);
      }

      lastIndex = doubleDollarRegex.lastIndex;
    }

    const afterText = node.slice(lastIndex);
    if (afterText) {
      blocks.push(...renderMathInText(afterText));
    }

    if (blocks.length === 1 && typeof blocks[0] === 'string') {
      return blocks[0];
    }
    return <React.Fragment>{blocks}</React.Fragment>;
  }

  if (React.isValidElement(node) && node.props) {
    const childrenProp = (node.props as any).children;
    if (childrenProp) {
      const childrenArray = React.Children.toArray(childrenProp);
      const mappedChildren = childrenArray.map((child, idx) => (
        <React.Fragment key={idx}>{renderMathInNode(child)}</React.Fragment>
      ));
      return React.cloneElement(node, {} as any, ...mappedChildren);
    }
  }

  return node;
}

export default function MathMarkdown({ children }: MathMarkdownProps) {
  // We render standard Markdown and intercept text elements
  return (
    <div className="math-markdown-host">
      <Markdown
        components={{
          p: (props: any) => {
            const { node, children, ...rest } = props;
            return <p {...rest}>{renderMathInNode(children)}</p>;
          },
          li: (props: any) => {
            const { node, children, ...rest } = props;
            return <li {...rest}>{renderMathInNode(children)}</li>;
          },
          h1: (props: any) => {
            const { node, children, ...rest } = props;
            return <h1 {...rest}>{renderMathInNode(children)}</h1>;
          },
          h2: (props: any) => {
            const { node, children, ...rest } = props;
            return <h2 {...rest}>{renderMathInNode(children)}</h2>;
          },
          h3: (props: any) => {
            const { node, children, ...rest } = props;
            return <h3 {...rest}>{renderMathInNode(children)}</h3>;
          },
          h4: (props: any) => {
            const { node, children, ...rest } = props;
            return <h4 {...rest}>{renderMathInNode(children)}</h4>;
          },
          span: (props: any) => {
            const { node, children, ...rest } = props;
            return <span {...rest}>{renderMathInNode(children)}</span>;
          },
          div: (props: any) => {
            const { node, children, ...rest } = props;
            return <div {...rest}>{renderMathInNode(children)}</div>;
          },
          strong: (props: any) => {
            const { node, children, ...rest } = props;
            return <strong {...rest}>{renderMathInNode(children)}</strong>;
          },
        }}
      >
        {children}
      </Markdown>
    </div>
  );
}
