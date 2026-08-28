import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Gemini features will return a mock or informative message.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy-key-for-init",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Chat and Calculus Diagnostic Assistant
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, context, model, apiKey } = req.body;

      const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY;

      if (!effectiveApiKey && model !== "deepseek-v4-pro") {
        return res.status(200).json({
          reply: `【系统提示】检测到尚未配置 API_KEY。\n\n针对您的微积分问题：\n**问题**：“${message}”\n\n**理论速查**：\n1. **黎曼可积性**：若函数 $f(x)$ 在有界闭区间 $[a,b]$ 上连续，或仅有有限个第一类间断点且有界，则 $f(x)$ 必黎曼可积。\n2. **微积分第一基本定理 (FTC 1)**：若 $f(t)$ 连续，则变上限积分 $\\Phi(x) = \\int_a^x f(t)dt$ 在 $[a,b]$ 上可导且 $\\Phi'(x) = f(x)$。\n3. **牛顿-莱布尼茨公式 (FTC 2)**：$\\int_a^b f(x)dx = F(b) - F(a)$，其中 $F'(x) = f(x)$。\n\n请在右上角 ⚙️ 大模型设置中配置您的 API-Key 即可发起大模型深度推导。`,
        });
      }

      const systemInstruction = `你是一位世界顶级的微积分与数学分析特聘教授、AI微积分实验室智能导师。
你的核心专长：
1. 定积分定义、黎曼和（左/右/中点/梯形/辛普森法）、达布上和与下和极限推导；
2. 微积分第一基本定理（变上限积分可导性 $\\frac{d}{dx}\\int_a^x f(t)dt = f(x)$）与第二基本定理（牛顿-莱布尼茨公式）；
3. 积分求解技巧精讲（第一类/第二类换元积分法、分部积分法、有理分式展开法）；
4. 瑕积分（反常积分）的敛散性诊断（比较审敛法、柯西主值、瑕点判定）；
5. 物理与工程几何应用（曲线弧长、旋转体体积-磁盘/圆柱壳法、变力做功、连续分布概率密度）。

回复风格要求：
- 严格严谨、逻辑清晰、公式规范（使用标准的 LaTeX 数学公式 $...$ 行内或 $$...$$ 独立行）；
- 善于采用“几何直观 + 代数推导 + 物理隐喻”三位一体的方式解答；
- 提供清晰的分步推导与总结；
- 语言使用中文简体，语气亲切大方、学术严谨。`;

      let promptWithContext = message;
      if (context) {
        promptWithContext = `【当前实验室仿真状态】\n- 目标函数: ${context.funcStr || "未指定"}\n- 积分区间: [${context.a ?? 0}, ${context.b ?? 1}]\n- 分割数 n: ${context.n ?? 10}\n- 当前逼近方法: ${context.method || "未指定"}\n- 计算结果: 黎曼和 ≈ ${context.riemannSum ?? "N/A"}, 解析精确值 = ${context.exactValue ?? "N/A"}\n\n【用户提问或诊断请求】\n${message}`;
      }

      // Handle DeepSeek if requested via server proxy
      if (model === "deepseek-v4-pro" && effectiveApiKey) {
        const dsRes = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${effectiveApiKey}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: promptWithContext },
            ],
            temperature: 0.6,
          }),
        });
        const dsData = (await dsRes.json()) as any;
        return res.json({
          reply: dsData.choices?.[0]?.message?.content || "DeepSeek 未返回有效文本",
        });
      }

      // Default to Google Gen AI (gemini-2.5-flash)
      const ai = new GoogleGenAI({
        apiKey: effectiveApiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptWithContext,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({
        reply: response.text || "抱歉，未生成有效回复，请重试。",
      });
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      res.status(500).json({
        error: "AI 思考分析时发生异常",
        details: error?.message || String(error),
      });
    }
  });

  // Vite middleware in dev, static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Integral Calculus Lab server running on http://localhost:${PORT}`);
  });
}

startServer();
