import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, PresetFunction, ApproximationMethod } from "../types";
import { MathFormula } from "./MathFormula";
import {
  Bot,
  Send,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
  RotateCcw,
  Settings,
  Key,
  Cpu,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  Info,
} from "lucide-react";

export type LLMModelId = "gemini-3-flash" | "deepseek-v4-pro";

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreset: PresetFunction;
  a: number;
  b: number;
  n: number;
  method: ApproximationMethod;
  customExpr: string;
  isCustom: boolean;
  approxValue: number;
  exactValue: number;
  absError: number;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  currentPreset,
  a,
  b,
  n,
  method,
  customExpr,
  isCustom,
  approxValue,
  exactValue,
  absError,
}) => {
  const [selectedModel, setSelectedModel] = useState<LLMModelId>(() => {
    return (localStorage.getItem("calc_llm_model") as LLMModelId) || "gemini-3-flash";
  });

  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem("calc_gemini_api_key") || "";
  });

  const [deepseekApiKey, setDeepseekApiKey] = useState<string>(() => {
    return localStorage.getItem("calc_deepseek_api_key") || "";
  });

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showKeyText, setShowKeyText] = useState<boolean>(false);
  const [configSuccessMsg, setConfigSuccessMsg] = useState<string>("");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: "您好！我是您的微积分大模型 AI 诊断与答疑导师。支持对定积分定义、微积分基本定理 (FTC 1/2)、分部与换元技巧、达布和以及瑕积分敛散性进行严格推导。请在右上角 ⚙️ 设置中配置 API-Key 即可发起智能诊断！",
      timestamp: "刚刚",
    },
  ]);
  const [inputVal, setInputVal] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickQuestions = [
    "为什么函数可积不一定需要连续？",
    "牛顿-莱布尼茨公式为什么严格要求连续？",
    "如何判断瑕积分 ∫₀¹ (1/xᵖ) dx 或 1/xᵖ 的敛散性？",
    "分部积分法与表格法 (Tabular Method) 技巧",
    "第一类换元与第二类换元核心区别是什么？",
    "诊断当前仿真实验的积分难度与收敛阶",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  const funcStr = isCustom && customExpr.trim() ? customExpr : currentPreset.expression;
  const currentApiKey = selectedModel === "gemini-3-flash" ? geminiApiKey : deepseekApiKey;

  const handleSaveConfig = () => {
    localStorage.setItem("calc_llm_model", selectedModel);
    localStorage.setItem("calc_gemini_api_key", geminiApiKey.trim());
    localStorage.setItem("calc_deepseek_api_key", deepseekApiKey.trim());
    setConfigSuccessMsg("配置已保存！");
    setTimeout(() => {
      setConfigSuccessMsg("");
      setShowSettings(false);
    }, 1200);
  };

  const callLLM = async (query: string): Promise<string> => {
    const systemPrompt = `你是一位世界顶级的微积分与数学分析特聘教授、微积分实验室智能导师。
你的核心专长：
1. 定积分定义、黎曼和（左/右/中点/梯形/辛普森法）、达布上和与下和极限推导；
2. 微积分第一基本定理（变上限积分求导 \\frac{d}{dx}\\int_a^x f(t)dt = f(x)）与第二基本定理（牛顿-莱布尼茨公式）；
3. 积分求解技巧精讲（第一类/第二类换元积分法、分部积分法、有理分式展开法）；
4. 瑕积分（反常积分）的敛散性诊断（比较审敛法、柯西主值、瑕点判定）；
5. 物理与工程几何应用（曲线弧长、旋转体体积、变力做功）。

回复风格要求：
- 严格严谨、逻辑清晰、公式规范（使用标准的 LaTeX 数学公式 $...$ 行内或 $$...$$ 独立行）；
- 采用“几何直观 + 代数推导 + 物理隐喻”三位一体的方式解答；
- 提供清晰的分步推导与总结，中文简体。`;

    const promptWithContext = `【当前实验室仿真状态】
- 目标函数: f(x) = ${funcStr}
- 积分区间: [${a}, ${b}]
- 分割数 n: ${n}
- 逼近法则: ${method}
- 黎曼和: ≈ ${approxValue}, 解析精确值 = ${exactValue}
- 绝对误差: ${absError.toExponential(4)}

【用户提问】
${query}`;

    // 1. Gemini 3 Flash API
    if (selectedModel === "gemini-3-flash") {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey.trim()}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: promptWithContext }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(
          errJson.error?.message || `Gemini API 请求失败 (HTTP ${res.status}): 请检查 API-Key。`
        );
      }
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "抱歉，未生成有效回复。";
    }

    // 2. DeepSeek V4 Pro
    if (selectedModel === "deepseek-v4-pro") {
      const endpoint = "https://api.deepseek.com/chat/completions";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${deepseekApiKey.trim()}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: promptWithContext },
          ],
          temperature: 0.6,
          max_tokens: 2048,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(
          errJson.error?.message || `DeepSeek API 请求失败 (HTTP ${res.status}): 请检查 API-Key。`
        );
      }
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "抱歉，未生成有效回复。";
    }

    throw new Error("未知的模型选择");
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputVal;
    if (!query.trim() || isLoading) return;

    if (!currentApiKey.trim()) {
      setShowSettings(true);
      const warnMsg: ChatMessage = {
        id: `sys-${Date.now()}`,
        sender: "system",
        text: `【提示】当前选择的模型为 **${
          selectedModel === "gemini-3-flash" ? "gemini 3 flash" : "deepseek-v4-pro"
        }**，需要输入 API-Key 才能调用。请在上方设置栏中输入密钥并点击确认。`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, warnMsg]);
      return;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal("");
    setIsLoading(true);

    try {
      const aiReply = await callLLM(query);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: `❌ 大模型调用失败: ${err?.message || "网络请求异常"}。请核对 ⚙️ 设置中的 API-Key。`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render AI response with markdown and math formulas
  const renderMessageContent = (text: string) => {
    const parts = text.split("\n\n");
    return (
      <div className="space-y-2 text-xs leading-relaxed">
        {parts.map((p, idx) => {
          if (p.startsWith("$$") && p.endsWith("$$")) {
            const rawFormula = p.slice(2, -2).trim();
            return <MathFormula key={idx} formula={rawFormula} block />;
          }
          return (
            <p key={idx} className="whitespace-pre-wrap">
              {p}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
      <div
        id="ai-assistant-modal-container"
        className={`bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col transition-all overflow-hidden ${
          isExpanded
            ? "w-full max-w-4xl h-[90vh]"
            : "w-full max-w-2xl h-[80vh] max-h-[640px]"
        }`}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-700 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <Bot className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">微积分大模型 AI 诊断与答疑导师</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-medium">
                  {selectedModel === "gemini-3-flash" ? "gemini 3 flash" : "deepseek-v4-pro"}
                </span>
              </div>
              <p className="text-[11px] text-blue-100/90">
                当前环境上下文: f(x)={funcStr}, 区间 [{a}, {b}], n={n}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Gear settings button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                showSettings ? "bg-white text-blue-700" : "hover:bg-white/15 text-white"
              }`}
              title="大模型与 API-Key 设置"
            >
              <Settings className={`w-4 h-4 ${showSettings ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg hover:bg-white/15 transition-colors cursor-pointer text-white/80 hover:text-white"
              title={isExpanded ? "还原窗口" : "最大化窗口"}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/15 transition-colors cursor-pointer text-white/80 hover:text-white"
              title="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Settings Drawer in Modal */}
        {showSettings && (
          <div className="p-3.5 bg-slate-100 border-b border-slate-200 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Settings className="w-3.5 h-3.5 text-blue-600" />
                大模型设置 (浏览器直接调用)
              </span>
              <span className="text-[10px] text-slate-500">密钥保存在本地浏览器</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* 1. Model Selection */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  1. 选择大模型:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedModel("gemini-3-flash")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer ${
                      selectedModel === "gemini-3-flash"
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    gemini 3 flash
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedModel("deepseek-v4-pro")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer ${
                      selectedModel === "deepseek-v4-pro"
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    deepseek-v4-pro
                  </button>
                </div>
              </div>

              {/* 2. Key Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-600">
                    2. 手工输入 API-Key:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowKeyText(!showKeyText)}
                    className="text-[10px] text-slate-500 hover:text-slate-700"
                  >
                    {showKeyText ? "隐藏" : "显示"}
                  </button>
                </div>
                {selectedModel === "gemini-3-flash" ? (
                  <input
                    type={showKeyText ? "text" : "password"}
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="请输入 Gemini API-Key (AIzaSy...)"
                    className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                  />
                ) : (
                  <input
                    type={showKeyText ? "text" : "password"}
                    value={deepseekApiKey}
                    onChange={(e) => setDeepseekApiKey(e.target.value)}
                    placeholder="请输入 DeepSeek API-Key (sk-...)"
                    className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                  />
                )}
              </div>
            </div>

            {/* 3. Confirm button */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-emerald-600 font-medium">{configSuccessMsg}</span>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                确认并保存
              </button>
            </div>
          </div>
        )}

        {/* Quick Question Chips Bar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> 快捷提问:
          </span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-slate-600 text-[11px] whitespace-nowrap transition-all cursor-pointer shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat History Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            const isSystem = msg.sender === "system";

            if (isSystem) {
              return (
                <div key={msg.id} className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>{renderMessageContent(msg.text)}</div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-2xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-2xs ${
                    isUser
                      ? "bg-blue-600 text-white rounded-br-xs"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-70">
                    <span className="font-semibold">{isUser ? "我的提问" : "AI 数学导师"}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  {renderMessageContent(msg.text)}
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex gap-2.5 justify-start items-center">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 shadow-2xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>AI 导师正在分步严格推导与数理诊断中...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="ai-chat-input"
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="随时提问微积分问题，例如“为什么变上限积分可导必须要求连续？”..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <button
              id="btn-send-ai-chat"
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>发送</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

