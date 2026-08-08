/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import MathMarkdown from './MathMarkdown';
import { Sparkles, ArrowRight, Loader2, BookOpen, AlertCircle, ListOrdered, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { AppMode } from '../types';

function buildPromptContext(mode: AppMode, parameters: any): string {
  if (mode === "riemann") {
    return `在微积分学习中，“黎曼和逼近”是理解定积分核心。
用户当前正在研究的配置如下：
- 函数：f(x) = ${parameters.funcLabel}在区间 [${parameters.a}, ${parameters.b}]。
- 当前分割区间数 N：${parameters.n}。
- 逼近方式：${parameters.sumTypeLabel} (如左微元、右微元、中点微元等)。
- 算出的分割段宽 dx：${parameters.dx}。
- 黎曼和近似值：${parameters.riemannSum}。
- 极限定积分精确值：${parameters.exact}。
- 当前的绝对误差：${parameters.error}。`;
  } else if (mode === "area") {
    return `在微积分学习中，“面积与原函数累积（微积分基本定理）”是核心。
用户当前操作：
- 被积函数：f(t) = ${parameters.funcLabel}。
- 区间：从 a = ${parameters.a} 开始累积。
- 当前滑块扫过的累积终点：x = ${parameters.xCurrent}。
- 累积形成的积分面积：A(x) = ∫[a, x] f(t) dt = ${parameters.accumulatedArea}。`;
  } else if (mode === "distance") {
    return `在物理与微积分中，“路程累积（速度的积分）”是极佳案例。
用户当前观察一个模拟移动的物体：
- 速度曲线：v(t) = ${parameters.velocityProfileLabel}。
- 模拟时间范围：从 t = 0 到 t = ${parameters.tMax} 秒。
- 当前时刻：t_current = ${parameters.tCurrent} 秒。
- 此时物体的瞬时运动速度 v(t_current) = ${parameters.vCurrent} m/s。
- 通过积分累积得到的总位移 s(t_current) = ∫[0, t_current] v(u) du = ${parameters.distance} 米。`;
  } else if (mode === "probability") {
    return `在概率论中，连续随机变量的“底面积分（概率密度积分）”代表事件发生的概率。
用户配置的高斯正态分布 PDF 的参数为：
- 均值 (μ)：${parameters.mean}
- 标准差 (σ)：${parameters.stdDev}
- 被积分的事件区间：[${parameters.x1}, ${parameters.x2}]
- 积分概率 P(${parameters.x1} <= X <= ${parameters.x2}) = ∫[x1, x2] f(x) dx = ${(parameters.prob * 100).toFixed(4)}%`;
  } else if (mode === "energy") {
    return `在物理学与工程中，“能量累积（变力做功 F·dx 或 功率累积 P·dt）”是直观的积分体现。
用户当前通过拖拽滑块来压缩弹簧，变力做功存储弹性势能（胡克定律）：
- 劲度系数 k：${parameters.k} N/m
- 弹簧被压缩的拉伸位移 x：${parameters.x} 米 (当前状态)
- 此时施加的实时胡克变力：F(x) = k·x = ${parameters.force} 牛顿
- 积分变力做功（弹性势能）：E_p = ∫[0, x] k·u du = 1/2 k x^2 = ${parameters.energy} 焦耳`;
  }
  return "";
}

const SYSTEM_INSTRUCTION_BASE = `你是一位才华横溢、充满温情的微积分专家、数学科普家。
你的任务是引导用户理解微积分的直观美学、本质思想：面积累积、从离散向连续的发展，而不是枯燥的公式记忆。
在解答中，要：
1. 深入浅出地解释用户当前交互页面上发生的数学变化。例如：如果分割数 N 较大，赞美他们逼近了极限；如果 N 较小，揭示离散误差的直观几何呈现。
2. 语言淡雅大方、亲切鼓励、带有启发性，排版使用优雅的 Markdown。
3. 【极重要：必须全量使用漂亮规范的 KaTeX / LaTeX 格式来书写所有数学公式、符号与表达式】：
   - 禁止使用普通英文文本（如 f(x)、dx、sigma）、Markdown 加粗普通文本（如 **F = k*x**）或普通的 code 块包裹（如 \`dx\`）来书写数学对象。
   - 所有独立成行的大公式、求和公式、导数与定积分公式，必须全部包裹在双美元符号中，例如：$$\\int_{a}^{b} f(t) \\, dt = F(b) - F(a)$$ 或 $$\\lim_{N \\to \\infty} \\sum_{i=1}^{N} f(x_i) \\Delta x$$ 或 $$E_p = \\frac{1}{2}kx^2$$。
   - 所有行内出现的任何变量名、自变量、极小元、均值、标准差、函数符号、常数，例如 $x$、$t$、$f(x)$、$dx$、$\\sigma$、$\\mu$、$k$、$v(t)$ 等，必须全部包裹在单美元符号中，例如：$x$、$t_i$、$f(x)$、$\\sigma$、$\\mu$、$k$、$F=kx$。
4. 结合用户所选的具体模型和参数进行分析，算术数字要自然贴切，指出微积分基本定理的惊人之处。
5. 如果是用户提问，请专业通俗地予以解答并延伸。`;

function cleanAndParseJSON(rawText: string) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  cleaned = cleaned.trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      return JSON.parse(cleaned);
    }
    throw err;
  }
}


interface AiInsightBoxProps {
  mode: AppMode;
  parameters: any;
}

export default function AiInsightBox({ mode, parameters }: AiInsightBoxProps) {
  const [insightText, setInsightText] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [missingKey, setMissingKey] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Step-by-Step states
  const [stepModeActive, setStepModeActive] = useState<boolean>(false);
  const [steps, setSteps] = useState<{ title: string; content: string }[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [summary, setSummary] = useState<string>("");

  // Large-model Custom Settings and API-Key
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem("ai_insight_api_key") || "");
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    const saved = localStorage.getItem("ai_insight_model");
    if (saved === "deepseek-reasoner") return "deepseek-v4-pro";
    return saved || "gemini-3.5-flash";
  });
  const [tempApiKey, setTempApiKey] = useState<string>(() => localStorage.getItem("ai_insight_api_key") || "");
  const [tempModel, setTempModel] = useState<string>(() => {
    const saved = localStorage.getItem("ai_insight_model");
    if (saved === "deepseek-reasoner") return "deepseek-v4-pro";
    return saved || "gemini-3.5-flash";
  });

  // Preset prompts tailored to each mode
  const presetPrompts: Record<AppMode, string[]> = {
    riemann: [
      "为什么当等分数 N 趋近于无穷大时，离散和的极限定值会完美等于连续面积？",
      "如果被积函数部分在 X 轴下方（取负值），黎曼和定积分是如何界定底面积分的？",
      "梯形求和逼近、辛普森规则与普通的矩形相比，在收敛逼近速度上有何区别？"
    ],
    area: [
      "为什么累积面积原函数 A(x) 的瞬时导数（变化率）严格等于被积函数的高度 f(x)？",
      "如果定积分的区间起点 a 改变了，累积面积函数的曲线形状与极值会发生如何平移？",
      "在不定积分中被我们随手写上的任意常数 'C'，在累加几何积图上代表什么物理本质？"
    ],
    distance: [
      "请科普：为什么自由落体或匀加速物体的路程积分公式中包含 1/2 t² 这个二次项变化？",
      "当加速度随时间本身也在发生变动时，速度与距离的高阶积分（多重积分）在物理中如何体现？",
      "车子变向倒退时，速度方向变成了负数。此时定积分算出来的 '位移' 与 '总路程' 怎么区分？"
    ],
    probability: [
      "为什么正态分布的 PDF 积分曲线（误差函数 erf）如此奇妙，不能被写成初等函数的解析式？",
      "标准差 σ 与均值 μ 的改变，在几何上是怎么精确形变高斯钟形曲线积分面积的？",
      "科普一下：定积分是怎样在连续概率论中帮助我们判断工厂零件故障率或考试等级预测的？"
    ],
    energy: [
      "为什么变力做功的累积，在几何上刚好是曲线拉伸下的面积？弹性势能与其梯度有何联系？",
      "如果重力属于变力（如重力公式 G*M*m/r²），我们如何用积分算出飞船逃逸地球的第二宇宙速度？",
      "物理工程中的功率随时间之积分累积等于能量。倘若存在机械阻尼摩擦损耗，定积分如何修正？"
    ]
  };

  const activePresets = presetPrompts[mode] || [];

  // Smoothly clean up when changing modes
  useEffect(() => {
    setInsightText("");
    setCustomPrompt("");
    setMissingKey(false);
    setErrorMessage("");
    setStepModeActive(false);
    setSteps([]);
    setCurrentStepIndex(0);
    setSummary("");
  }, [mode]);

  const generateInsightTextClient = async (isStep: boolean, prompt?: string) => {
    const selectedPrompt = prompt || customPrompt;
    if (!selectedPrompt && !prompt && !isStep) return;

    setIsLoading(true);
    setMissingKey(false);
    setErrorMessage("");
    setInsightText("");
    
    if (isStep) {
      setStepModeActive(false);
      setSteps([]);
      setCurrentStepIndex(0);
      setSummary("");
    }

    const context = buildPromptContext(mode, parameters);
    let userMessage = "";
    if (isStep) {
      userMessage = `请针对以下模型与参数，生成一个包含3-4步的数学物理推导分步教学演示：\n\n当前状态上下文：\n${context}`;
    } else {
      userMessage = selectedPrompt 
        ? `结合当前的数学模型上下文：\n${context}\n\n我的提问是：\n${selectedPrompt}`
        : `请对当前模型下的状态进行一次精彩生动、淡雅大方的深度数学洞察与科普分析。\n\n当前状态上下文：\n${context}`;
    }

    try {
      if (selectedModel === "gemini-3.5-flash") {
        let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
        
        let sysInstruction = SYSTEM_INSTRUCTION_BASE;
        let responseSchemaObj: any = undefined;
        let responseMimeType = "text/plain";

        if (isStep) {
          sysInstruction += `\n你必须将当前的数学物理模型分解为 3 至 4 个清晰、简练、循序渐进的推导与几何分析步骤，让读者可以像阅读连环画一样精细跟随。每个步骤应含：\n- title: 步骤对应的小标题 (例如：'步骤一：感知区间划分')\n- content: 用通俗生动、严谨优雅的 Markdown 语言深入剖析这一步对应的公式演变、数值大小与直观美感，并严格遵守上述 KaTeX 格式要求书写每一步所有的数学公式与字母变量。`;
          responseMimeType = "application/json";
          responseSchemaObj = {
            type: "OBJECT",
            properties: {
              steps: {
                type: "ARRAY",
                description: "3至4个循序渐进的剖析步骤",
                items: {
                  type: "OBJECT",
                  properties: {
                    title: { type: "STRING", description: "步骤的小标题" },
                    content: { type: "STRING", description: "步骤的 Markdown 详细解析内容，结合当前数值进行针对性分析" }
                  },
                  required: ["title", "content"]
                }
              },
              summary: { type: "STRING", description: "一句话短小精炼的数学物理总结" }
            },
            required: ["steps", "summary"]
          };
        }

        const body: any = {
          contents: [{
            role: "user",
            parts: [{ text: userMessage }]
          }],
          systemInstruction: {
            parts: [{ text: sysInstruction }]
          },
          generationConfig: {
            temperature: 0.7
          }
        };

        if (isStep) {
          body.generationConfig.responseMimeType = "application/json";
          body.generationConfig.responseSchema = responseSchemaObj;
        }

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const detailMsg = errData.error?.message || "HTTP status " + response.status;
          throw new Error(`Gemini API 错误: ${detailMsg}`);
        }

        const data = await response.json();
        const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (isStep) {
          try {
            const parsed = cleanAndParseJSON(textOutput);
            setSteps(parsed.steps || []);
            setSummary(parsed.summary || "");
            setCurrentStepIndex(0);
            setStepModeActive(true);
          } catch (parseErr) {
            console.error("解析 JSON 失败, 原始输出为:", textOutput);
            setSteps([
              {
                title: "数学推导分析",
                content: textOutput
              }
            ]);
            setSummary("完成");
            setStepModeActive(true);
          }
        } else {
          setInsightText(textOutput);
        }

      } else if (selectedModel === "deepseek-v4-pro" || selectedModel === "deepseek-reasoner") {
        const url = "https://api.deepseek.com/chat/completions";
        
        let sysInstruction = SYSTEM_INSTRUCTION_BASE;
        if (isStep) {
          sysInstruction += `\n你必须将当前的数学物理模型分解为 3 至 4 个清晰、简练、循序渐进的推导与几何分析步骤，让读者可以像阅读连环画一样精细跟随。
你必须仅输出符合下列 JSON Schema 结构的纯 JSON 对象，不要用 \`\`\` 包装，内容中必须包含：
- steps: 3至4个步骤的数组，其中包含 title 和 content (含 KaTeX 公式的 Markdown 解析)。
- summary: 一句话微积分大局思想总结。
你的输出必须是合法的 JSON 对象。`;
        }

        const body = {
          model: "deepseek-v4-pro",
          messages: [
            { role: "system", content: sysInstruction },
            { role: "user", content: userMessage }
          ],
          temperature: 0.7
        };

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify(body)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const detailMsg = errData.error?.message || "HTTP status " + response.status;
          throw new Error(`DeepSeek API 错误: ${detailMsg}`);
        }

        const data = await response.json();
        const textOutput = data.choices?.[0]?.message?.content || "";

        if (isStep) {
          try {
            const parsed = cleanAndParseJSON(textOutput);
            setSteps(parsed.steps || []);
            setSummary(parsed.summary || "");
            setCurrentStepIndex(0);
            setStepModeActive(true);
          } catch (parseErr) {
            console.error("解析 DeepSeek JSON 失败:", textOutput);
            setSteps([
              {
                title: "DeepSeek V4 Pro 深度推导",
                content: textOutput
              }
            ]);
            setSummary("完成");
            setStepModeActive(true);
          }
        } else {
          setInsightText(textOutput);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "浏览器直接发起 API 调用失败，请检查您的 Key 是否有效或控制台报错。");
    } finally {
      setIsLoading(false);
    }
  };

  const generateInsight = async (prompt?: string) => {
    const selectedPrompt = prompt || customPrompt;
    if (!selectedPrompt && !prompt) return;

    if (apiKey) {
      generateInsightTextClient(false, selectedPrompt);
      return;
    }

    setIsLoading(true);
    setMissingKey(false);
    setErrorMessage("");
    setInsightText("");
    setStepModeActive(false);
    setSteps([]);

    try {
      const response = await fetch("/api/insight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          parameters,
          customPrompt: selectedPrompt,
          isStepByStep: false
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        if (data.success) {
          setInsightText(data.text);
        } else if (data.errorType === "MISSING_KEY") {
          setMissingKey(true);
          setInsightText(`### 💡 需要配置 API Key
为了在当前浏览器或 GitHub Pages 静态托管环境中解锁强大的 **AI 数学/物理洞察服务**：
1. 请点击本模块右上角的 **⚙️ 齿轮设置** 图标，选择您需要的大模型并**配置您本人的 API Key**。
2. 此配置由于完全在浏览器端直接请求，不会通过任何中间第三方服务器，**完美支持您部署到 GitHub Pages 等纯静态环境**！`);
        } else {
          setErrorMessage(data.message || "获取解析失败");
        }
      } else {
        setErrorMessage("提示：当前没有可用的后端密钥，请点击本模块右上角小齿轮 ⚙️ 配置个人 API-Key 即可享受纯浏览器直连大模型服务。");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("提示：当前没有可用的后端密钥，请点击本模块右上角小齿轮 ⚙️ 配置个人 API-Key 即可享受纯浏览器直连大模型服务。");
    } finally {
      setIsLoading(false);
    }
  };

  const generateStepByStep = async () => {
    if (apiKey) {
      generateInsightTextClient(true);
      return;
    }

    setIsLoading(true);
    setMissingKey(false);
    setErrorMessage("");
    setInsightText("");
    setStepModeActive(false);
    setSteps([]);
    setCurrentStepIndex(0);
    setSummary("");

    try {
      const response = await fetch("/api/insight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          parameters,
          isStepByStep: true
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        if (data.success) {
          if (data.isStepByStep) {
            setSteps(data.steps || []);
            setSummary(data.summary || "");
            setCurrentStepIndex(0);
            setStepModeActive(true);
          } else {
            setInsightText(data.text || "");
            setStepModeActive(false);
          }
        } else if (data.errorType === "MISSING_KEY") {
          setMissingKey(true);
          setInsightText(`### 💡 需要配置 API Key
为了在当前浏览器或 GitHub Pages 静态托管环境中解锁强大的 **AI 数学/物理洞察服务**：
1. 请点击本模块右上角的 **⚙️ 齿轮设置** 图标，选择您需要的大模型并**配置您本人的 API Key**。
2. 此配置由于完全在浏览器端直接请求，不会通过任何中间第三方服务器，**完美支持您部署到 GitHub Pages 等纯静态环境**！`);
        } else {
          setErrorMessage(data.message || "获取分步推导失败");
        }
      } else {
        setErrorMessage("提示：当前没有可用的后端密钥，请点击本模块右上角小齿轮 ⚙️ 配置个人 API-Key 即可享受纯浏览器直连大模型服务。");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("提示：当前没有可用的后端密钥，请点击本模块右上角小齿轮 ⚙️ 配置个人 API-Key 即可享受纯浏览器直连大模型服务。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col space-y-5">
      
      {/* Box Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-650 border border-indigo-110/30">
            <Sparkles className="size-4 animate-pulse" fill="currentColor" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">AI 积分洞察</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">点击推荐问题、自主提问，或启动分步演示，由 AI 深度科普当前物理数学模型细节</p>
          </div>
        </div>
        
        {/* Settings gear trigger */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-xl transition-all border cursor-pointer flex items-center justify-center ${
            showSettings 
              ? "bg-indigo-50 border-indigo-200 text-indigo-600" 
              : "bg-white border-slate-200 text-slate-500 hover:text-indigo-650 hover:border-indigo-200"
          }`}
          title="设置大模型和 API-Key"
        >
          <Settings className={`size-4 ${showSettings ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Model Configuration Dropdown / Panel */}
      {showSettings && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Settings className="size-3.5 text-slate-500" />
              大模型接入配置
            </span>
            <button 
              onClick={() => setShowSettings(false)}
              className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors font-medium font-sans cursor-pointer"
            >
              收起
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. API-Key Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                <span>手工输入 API-Key:</span>
                {apiKey && (
                  <span className="text-[9px] text-emerald-600 font-mono font-bold">已保存现有 Key</span>
                )}
              </label>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder={tempModel === 'deepseek-v4-pro' || tempModel === 'deepseek-reasoner' ? "输入您的 DeepSeek API Key (sk-...)" : "输入您的 Gemini API Key (AIzaSy...)"}
                className="w-full px-3 py-2 rounded-lg border border-slate-250 text-xs bg-white text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
              />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {tempModel === 'deepseek-v4-pro' || tempModel === 'deepseek-reasoner' 
                  ? "直接在您的浏览器端发起大模型请求，保证密钥安全，不会传输存留到任何第三方后端数据库。" 
                  : "请输入有效的 Google Gemini API 密钥，可在 Google AI Studio 官方控制台申请获取。"}
              </p>
            </div>

            {/* 2. Model Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600">选择大模型:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTempModel("gemini-3.5-flash")}
                  className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                    tempModel === "gemini-3.5-flash"
                      ? "bg-indigo-50 text-indigo-750 border-indigo-500 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  gemini 3.5 flash
                </button>
                
                <button
                  type="button"
                  onClick={() => setTempModel("deepseek-v4-pro")}
                  className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                    tempModel === "deepseek-v4-pro" || tempModel === "deepseek-reasoner"
                      ? "bg-indigo-50 text-indigo-750 border-indigo-500 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  deepseek-v4-pro
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {tempModel === 'deepseek-v4-pro' || tempModel === 'deepseek-reasoner' 
                  ? "DeepSeek V4 Pro 旗舰大模型，能够提供逻辑绝佳的推导解答与完美排版的高阶公式分析。" 
                  : "Gemini 3.5 Flash 极速响应级别的大模型，支持原生的 JSON 结构化高精度学术模型分解。"}
              </p>
            </div>
          </div>

          {/* 3. Confirm Save */}
          <div className="flex justify-end pt-2 border-t border-slate-200/60 font-sans">
            <button
              type="button"
              onClick={() => {
                localStorage.setItem("ai_insight_api_key", tempApiKey.trim());
                localStorage.setItem("ai_insight_model", tempModel);
                setApiKey(tempApiKey.trim());
                setSelectedModel(tempModel);
                setShowSettings(false);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-md transition-all cursor-pointer"
            >
              确认大模型设置
            </button>
          </div>
        </div>
      )}

      {/* Preset Questions Grid */}
      <div className="space-y-2">
        <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">🎓 推荐探索问题（单击瞬间获得解答）：</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {activePresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCustomPrompt(preset);
                generateInsight(preset);
              }}
              disabled={isLoading}
              className="text-left px-3.5 py-3 rounded-xl border border-slate-200 bg-[#f8fafc]/30 hover:border-indigo-200 hover:bg-indigo-55/5 hover:text-indigo-950 transition-all font-sans text-xs text-slate-650 shadow-sm leading-relaxed flex items-start gap-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none disabled:opacity-50 cursor-pointer"
            >
              <BookOpen className="size-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{preset}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom query input container */}
      <div className="flex flex-col sm:flex-row gap-3">
        <textarea
          rows={1}
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="在此处输入您感兴趣的微积分疑问（比如：“请生动比较微分和积分如何互为逆运算”）..."
          className="flex-1 min-h-[44px] max-h-[120px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans placeholder-slate-400"
        />
        <div className="flex gap-2 sm:shrink-0">
          <button
            onClick={() => generateStepByStep()}
            disabled={isLoading}
            className="flex-1 sm:flex-initial bg-indigo-50 border border-indigo-200 text-indigo-750 hover:bg-indigo-100 transition-all text-xs font-bold px-4 py-3 rounded-xl shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isLoading && stepModeActive ? (
              <Loader2 className="size-4 animate-spin text-indigo-650" />
            ) : (
              <ListOrdered className="size-4 text-indigo-650" />
            )}
            分步演示
          </button>
          
          <button
            onClick={() => generateInsight()}
            disabled={isLoading || !customPrompt.trim()}
            className="flex-1 sm:flex-initial bg-indigo-600 border border-indigo-700 text-white hover:bg-indigo-700 transition-all text-xs font-bold px-5 py-3 rounded-xl shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isLoading && !stepModeActive ? (
              <Loader2 className="size-4 animate-spin text-white" />
            ) : (
              <>
                寻求解答
                <ArrowRight className="size-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dynamic answer container styling */}
      {(insightText || isLoading || errorMessage || (stepModeActive && steps.length > 0)) && (
        <div className="bg-[#f8fafc]/60 rounded-xl border border-slate-200/60 p-5 mt-2 min-h-[100px] flex flex-col justify-center relative shadow-sm">
          
          {/* Loading status panel */}
          {isLoading && !insightText && steps.length === 0 && (
            <div className="flex flex-col items-center justify-center space-y-3 py-6">
              <Loader2 className="size-8 animate-spin text-indigo-650" />
              <div className="text-center">
                <p className="text-xs font-bold text-slate-850 font-sans">
                  {stepModeActive || steps.length > 0 ? "数学家正在构建变力与逼近推导步骤..." : "积分数学家正在构建数学推导模型..."}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">分析瞬时高度、微分累积误差与几何微积分实质</p>
              </div>
            </div>
          )}

          {/* Regular generated mathematical response */}
          {insightText && !stepModeActive && (
            <div className={`transition-all duration-300 ${isLoading ? 'opacity-40' : 'opacity-100'}`}>
              
              {/* If API Key is missing, give nice styled notice */}
              {missingKey ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5 text-amber-850 bg-amber-50/50 rounded-xl p-4 border border-amber-200">
                    <AlertCircle className="size-5 shrink-0 text-amber-600 mt-0.5" />
                    <div className="text-xs leading-relaxed font-sans">
                      <MathMarkdown>{insightText}</MathMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                <div id="ai-response-body" className="markdown-body text-xs text-slate-700 leading-relaxed font-sans max-w-none space-y-3 prose prose-slate">
                  {/* Visual cute ribbon representing generated state */}
                  <div className="flex items-center gap-1.5 text-[10px] text-indigo-750 font-bold mb-3 bg-indigo-50 border border-indigo-110/30 px-2.5 py-1 rounded w-max mt-0">
                    <Sparkles className="size-3.5 text-indigo-600" />
                    来自 积分宇宙 AI 辩证洞察
                  </div>
                  <MathMarkdown>{insightText}</MathMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Step-by-Step Progression UI */}
          {stepModeActive && steps.length > 0 && !isLoading && (
            <div className="space-y-5">
              
              {/* Progress capsule pills */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div className="flex items-center gap-1.5 text-[10px] text-indigo-750 font-bold bg-indigo-50 border border-indigo-110/30 px-2.5 py-1 rounded w-max">
                  <ListOrdered className="size-3.5 text-indigo-650" />
                  微积分推导演示 [{currentStepIndex + 1} / {steps.length}]
                </div>
                
                {/* Horizontal progress capsules */}
                <div className="flex gap-1.5 items-center">
                  {steps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStepIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === currentStepIndex
                          ? "w-6 bg-indigo-600"
                          : idx < currentStepIndex
                          ? "w-2.5 bg-indigo-300"
                          : "w-2.5 bg-slate-200"
                      }`}
                      title={`跳转到第 ${idx + 1} 步`}
                    />
                  ))}
                </div>
              </div>

              {/* Active Step display */}
              <div className="bg-white rounded-xl border border-slate-150 p-4.5 space-y-3 shadow-inner">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                  步骤 {currentStepIndex + 1}
                </span>
                <h4 className="text-sm font-bold text-slate-800 mt-1">
                  {steps[currentStepIndex].title}
                </h4>
                <div className="markdown-body text-xs text-slate-650 leading-relaxed font-sans max-w-none space-y-2.5 prose prose-indigo">
                  <MathMarkdown>{steps[currentStepIndex].content}</MathMarkdown>
                </div>
              </div>

              {/* Footer Summary Insight */}
              {summary && (
                <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-3.5 flex items-start gap-2 text-emerald-800 text-xs">
                  <span className="text-emerald-600 shrink-0 select-none font-bold">💡 核心洞察：</span>
                  <div className="leading-relaxed font-sans font-medium text-emerald-900">
                    {summary}
                  </div>
                </div>
              )}

              {/* Step Navigation Controls */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-100 gap-3">
                <button
                  onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentStepIndex === 0}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-all shadow-sm disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                  上一步
                </button>

                {/* Dot steps select labels */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {steps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStepIndex(idx)}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-md border transition-all cursor-pointer ${
                        idx === currentStepIndex
                          ? "bg-indigo-650 text-white border-indigo-600"
                          : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      Step {idx + 1}
                    </button>
                  ))}
                </div>

                {currentStepIndex < steps.length - 1 ? (
                  <button
                    onClick={() => setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 border border-indigo-700 rounded-lg hover:bg-indigo-700 transition-all shadow-md flex items-center gap-1 cursor-pointer"
                  >
                    下一步
                    <ChevronRight className="size-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setStepModeActive(false);
                      setSteps([]);
                    }}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 border border-emerald-700 rounded-lg hover:bg-emerald-700 transition-all shadow-md flex items-center gap-1 cursor-pointer"
                  >
                    演示完成
                  </button>
                )}
              </div>

            </div>
          )}

          {/* System Error warnings */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 text-red-850 bg-red-50/50 rounded-xl p-4 border border-red-200 text-xs">
              <AlertCircle className="size-5 shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="font-bold">查询发生异常</p>
                <p className="mt-1 text-red-700 font-mono text-[11px]">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
