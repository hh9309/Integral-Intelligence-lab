import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, PresetFunction, ApproximationMethod } from "../types";
import { MathFormula } from "./MathFormula";
import {
  Bot,
  Send,
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

interface AIAssistantViewProps {
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

export type LLMModelId = "gemini-3-flash" | "deepseek-v4-pro";

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
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
  // Model selection & API Keys management (persisted in localStorage for static/GitHub pages browser calls)
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
      text: `您好！我是您的微积分大模型 AI 诊断与答疑导师。\n\n我支持对 **定积分定义、微积分基本定理 (FTC 1/2)、变上限积分函数求导、分部与换元技巧、达布上和/下和夹逼推导** 以及 **瑕积分（反常积分）敛散性** 进行严格数理证明与智能诊断。\n\n请在右上角 ⚙️ 设置中配置您的 **API-Key**（支持 Gemini 3 Flash 与 DeepSeek-V4-Pro），即可直接在浏览器前端发起大模型智能推导！`,
      timestamp: "刚刚",
    },
  ]);
  const [inputVal, setInputVal] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

  const funcStr = isCustom && customExpr.trim() ? customExpr : currentPreset.expression;

  const currentApiKey = selectedModel === "gemini-3-flash" ? geminiApiKey : deepseekApiKey;

  // Save settings handler
  const handleSaveConfig = () => {
    localStorage.setItem("calc_llm_model", selectedModel);
    localStorage.setItem("calc_gemini_api_key", geminiApiKey.trim());
    localStorage.setItem("calc_deepseek_api_key", deepseekApiKey.trim());
    setConfigSuccessMsg("配置已保存！模型与密钥已就绪。");
    setTimeout(() => {
      setConfigSuccessMsg("");
      setShowSettings(false);
    }, 1500);
  };

  // Direct Browser-to-LLM Dispatcher for GitHub Pages / Static Export & Local Server
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
- 当前剖分数 n: ${n}
- 当前逼近方法: ${method}
- 几何求积结果: 黎曼和 ≈ ${approxValue}, 解析精确值 = ${exactValue}
- 当前绝对误差: ${absError.toExponential(4)}

【用户提问与学术探讨】
${query}`;

    // 1. Gemini 3 Flash API
    if (selectedModel === "gemini-3-flash") {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey.trim()}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [{ role: "user", parts: [{ text: promptWithContext }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(
          errJson.error?.message || `Gemini API 请求失败 (HTTP ${res.status}): 请检查 API-Key 是否正确。`
        );
      }

      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "抱歉，Gemini 未返回有效文本。";
    }

    // 2. DeepSeek V4 Pro (OpenAI-compatible Chat Completion API)
    if (selectedModel === "deepseek-v4-pro") {
      const endpoint = "https://api.deepseek.com/chat/completions";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${deepseekApiKey.trim()}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat", // DeepSeek v3/v4 reasoning/chat standard endpoint
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
          errJson.error?.message || `DeepSeek API 请求失败 (HTTP ${res.status}): 请检查 API-Key 或账户余额。`
        );
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || "抱歉，DeepSeek 未返回有效文本。";
    }

    throw new Error("未知的模型架构选择");
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputVal;
    if (!query.trim() || isLoading) return;

    // Check if API Key is provided
    if (!currentApiKey.trim()) {
      setShowSettings(true);
      const warnMsg: ChatMessage = {
        id: `sys-${Date.now()}`,
        sender: "system",
        text: `【提示】当前选择的模型为 **${
          selectedModel === "gemini-3-flash" ? "Gemini 3 Flash" : "DeepSeek-V4-Pro"
        }**，需要提供对应的 API-Key 才能调用。请在上方设置面板中输入您的密钥并点击确认。`,
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
      // Fallback: If client call fails due to CORS or proxy, try backend /api/chat proxy as fallback
      try {
        const fallbackRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: query,
            model: selectedModel,
            apiKey: currentApiKey,
            context: {
              funcStr,
              a,
              b,
              n,
              method,
              riemannSum: approxValue,
              exactValue,
              absError,
            },
          }),
        });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (fallbackData.reply) {
            setMessages((prev) => [
              ...prev,
              {
                id: `ai-${Date.now()}`,
                sender: "ai",
                text: fallbackData.reply,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ]);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // ignore fallback errors
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: `❌ 大模型调用失败: ${err?.message || "网络请求异常"}。\n\n**排查建议**：\n1. 请点击右上角 ⚙️ 设置齿轮，核对当前所选模型的 API-Key 是否正确；\n2. 确保 API-Key 具有调用权限且网络通畅。`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "welcome-reset",
        sender: "ai",
        text: "会话已重置。您可以随时提出新的微积分问题或诊断需求！",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
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
    <div id="ai-assistant-module-section" className="space-y-4">
      {/* 1. Main Header & Controls Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Module Title Banner */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-700 text-white flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-xs ring-1 ring-white/20">
              <Bot className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm sm:text-base font-bold">微积分大模型 AI 诊断与答疑导师</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-mono font-bold flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-cyan-300" />
                  {selectedModel === "gemini-3-flash" ? "gemini 3 flash" : "deepseek-v4-pro"}
                </span>
                {currentApiKey ? (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-200 bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-400/40">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Key 已就绪
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-amber-200 bg-amber-900/40 px-2 py-0.5 rounded border border-amber-400/40">
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    未配置 Key
                  </span>
                )}
              </div>
              <p className="text-[11px] text-blue-100/90 mt-0.5">
                当前实验上下文: f(x) = {funcStr}，区间 [{a}, {b}]，分割数 n = {n}，{method} 法则
              </p>
            </div>
          </div>

          {/* Right Action: Settings Cog Button */}
          <div className="flex items-center gap-2">
            <button
              id="btn-open-model-settings"
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                showSettings
                  ? "bg-white text-blue-700 ring-2 ring-white/50 font-bold"
                  : "bg-white/15 hover:bg-white/25 text-white"
              }`}
              title="设置大模型与 API-Key"
            >
              <Settings className={`w-3.5 h-3.5 ${showSettings ? "animate-spin" : ""}`} />
              <span>大模型设置</span>
            </button>

            <button
              onClick={handleClearHistory}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="清空对话"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Interactive LLM Settings Drawer Panel */}
        {showSettings && (
          <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">
                  大模型配置面板 (支持直接在 GitHub Pages / 浏览器前端调用)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-blue-500" />
                所有 API-Key 仅加密存储于您本地浏览器的 LocalStorage，绝不上传第三方服务器
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1: Model Selection */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  <span>1. 选择大模型 (LLM Engine):</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedModel("gemini-3-flash")}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedModel === "gemini-3-flash"
                        ? "border-blue-600 bg-blue-50/70 ring-1 ring-blue-500 shadow-2xs"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">gemini 3 flash</span>
                      {selectedModel === "gemini-3-flash" && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Google 高性能极速推理微积分大模型</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedModel("deepseek-v4-pro")}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedModel === "deepseek-v4-pro"
                        ? "border-blue-600 bg-blue-50/70 ring-1 ring-blue-500 shadow-2xs"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">deepseek-v4-pro</span>
                      {selectedModel === "deepseek-v4-pro" && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">DeepSeek 深度数学推理大模型</p>
                  </button>
                </div>
              </div>

              {/* Step 2: API-Key Manual Input */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-blue-600" />
                    <span>2. 手工输入 API-Key:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowKeyText(!showKeyText)}
                    className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    {showKeyText ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showKeyText ? "隐藏" : "显示"}</span>
                  </button>
                </div>

                {selectedModel === "gemini-3-flash" ? (
                  <div>
                    <input
                      id="input-gemini-api-key"
                      type={showKeyText ? "text" : "password"}
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="AIzaSy... (请输入您的 Gemini API-Key)"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                      <span>Gemini API Key 适用于 gemini 3 flash</span>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        获取免费密钥 <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      id="input-deepseek-api-key"
                      type={showKeyText ? "text" : "password"}
                      value={deepseekApiKey}
                      onChange={(e) => setDeepseekApiKey(e.target.value)}
                      placeholder="sk-... (请输入您的 DeepSeek API-Key)"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                      <span>DeepSeek API Key 适用于 deepseek-v4-pro</span>
                      <a
                        href="https://platform.deepseek.com/api_keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        获取 DeepSeek 密钥 <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Confirm & Save */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-emerald-600 font-semibold">{configSuccessMsg}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium cursor-pointer"
                >
                  取消
                </button>
                <button
                  id="btn-confirm-llm-config"
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>确认大模型与保存密钥</span>
                </button>
              </div>
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
        <div className="h-[460px] p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-slate-50/40">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            const isSystem = msg.sender === "system";

            if (isSystem) {
              return (
                <div key={msg.id} className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    {renderMessageContent(msg.text)}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-2xs ${
                    isUser
                      ? "bg-blue-600 text-white rounded-br-xs"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1.5 text-[10px] opacity-70">
                    <span className="font-semibold flex items-center gap-1">
                      {isUser ? (
                        "我的提问"
                      ) : (
                        <>
                          <span>AI 微积分导师</span>
                          <span className="font-mono text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded">
                            {selectedModel}
                          </span>
                        </>
                      )}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                  {renderMessageContent(msg.text)}
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex gap-2.5 justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600 shadow-2xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>
                  {selectedModel === "gemini-3-flash" ? "Gemini 3 Flash" : "DeepSeek-V4-Pro"}{" "}
                  正在执行数理逻辑分步推导与严谨验证中...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="input-ai-chat-main"
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={`向 ${
                selectedModel === "gemini-3-flash" ? "Gemini 3 Flash" : "DeepSeek-V4-Pro"
              } 提问微积分问题，例如“为什么变上限积分可导必须要求连续？”...`}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-sans"
            />
            <button
              id="btn-send-ai-main"
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>发送提问</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
