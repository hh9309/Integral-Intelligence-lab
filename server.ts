import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

// Parse JSON request bodies
app.use(express.json());

// Lazy-initialized Gemini Client helper
let aiClient: GoogleGenAI | null = null;

function getGeminiClient() {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("MISSING_API_KEY");
  }
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
  return aiClient;
}

// AI Insight Endpoint
app.post("/api/insight", async (req, res) => {
  try {
    const { mode, parameters, customPrompt, isStepByStep } = req.body;

    let gemini;
    try {
      gemini = getGeminiClient();
    } catch (e: any) {
      if (e.message === "MISSING_API_KEY") {
        return res.status(200).json({
          success: false,
          errorType: "MISSING_KEY",
          message: `### 💡 需要配置 API Key
为了解锁强大的 **AI 数学洞察服务**，请在 AI Studio 编辑器的右侧控制面板 **Settings > Secrets** 中添加一个名为 \`GEMINI_API_KEY\` 的密钥，并填入您的 Gemini API 密钥。

*(当前应用仍在本地运行，您可以正常体验五个关卡的微积分图形交互，不受影响。)*`,
        });
      }
      throw e;
    }

    // Construct a beautiful mathematical context prompting Gemini
    let promptContext = "";
    if (mode === "riemann") {
      promptContext = `在微积分学习中，“黎曼和逼近”是理解定积分核心。
用户当前正在研究的配置如下：
- 函数：f(x) = ${parameters.funcLabel}在区间 [${parameters.a}, ${parameters.b}]。
- 当前分割区间数 N：${parameters.n}。
- 逼近方式：${parameters.sumTypeLabel} (如左微元、右微元、中点微元等)。
- 算出的分割段宽 dx：${parameters.dx}。
- 黎曼和近似值：${parameters.riemannSum}。
- 极限定积分精确值：${parameters.exact}。
- 当前的绝对误差：${parameters.error}。`;
    } else if (mode === "area") {
      promptContext = `在微积分学习中，“面积与原函数累积（微积分基本定理）”是核心。
用户当前操作：
- 被积函数：f(t) = ${parameters.funcLabel}。
- 区间：从 a = ${parameters.a} 开始累积。
- 当前滑块扫过的累积终点：x = ${parameters.xCurrent}。
- 累积形成的积分面积：A(x) = ∫[a, x] f(t) dt = ${parameters.accumulatedArea}。`;
    } else if (mode === "distance") {
      promptContext = `在物理与微积分中，“路程累积（速度的积分）”是极佳案例。
用户当前观察一个模拟移动的物体：
- 速度曲线：v(t) = ${parameters.velocityProfileLabel}。
- 模拟时间范围：从 t = 0 到 t = ${parameters.tMax} 秒。
- 当前时刻：t_current = ${parameters.tCurrent} 秒。
- 此时物体的瞬时运动速度 v(t_current) = ${parameters.vCurrent} m/s。
- 通过积分累积得到的总位移 s(t_current) = ∫[0, t_current] v(u) du = ${parameters.distance} 米。`;
    } else if (mode === "probability") {
      promptContext = `在概率论中，连续随机变量的“底面积分（概率密度积分）”代表事件发生的概率。
用户配置的高斯正态分布 PDF 的参数为：
- 均值 (μ)：${parameters.mean}
- 标准差 (σ)：${parameters.stdDev}
- 被积分的事件区间：[${parameters.x1}, ${parameters.x2}]
- 积分概率 P(${parameters.x1} <= X <= ${parameters.x2}) = ∫[x1, x2] f(x) dx = ${(parameters.prob * 100).toFixed(4)}%`;
    } else if (mode === "energy") {
      promptContext = `在物理学与工程中，“能量累积（变力做功 F·dx 或 功率累积 P·dt）”是直观的积分体现。
用户当前通过拖拽滑块来压缩弹簧，变力做功存储弹性势能（胡克定律）：
- 劲度系数 k：${parameters.k} N/m
- 弹簧被压缩的拉伸位移 x：${parameters.x} 米 (当前状态)
- 此时施加的实时胡克变力：F(x) = k·x = ${parameters.force} 牛顿
- 积分变力做功（弹性势能）：E_p = ∫[0, x] k·u du = 1/2 k x^2 = ${parameters.energy} 焦耳`;
    }

    const systemInstruction = `你是一位才华横溢、充满温情的微积分专家、数学科普家。
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

    let userMessage = "";
    let config: any = {
      systemInstruction,
      temperature: 0.7,
    };

    if (isStepByStep) {
      const stepSystemInstruction = systemInstruction + `\n你必须将当前的数学物理模型分解为 3 至 4 个清晰、简练、循序渐进的推导与几何分析步骤，让读者可以像阅读连环画一样精细跟随。每个步骤应含：\n- title: 步骤对应的小标题 (例如：'步骤一：感知区间划分')\n- content: 用通俗生动、严谨优雅的 Markdown 语言深入剖析这一步对应的公式演变、数值大小与直观美感，并严格遵守上述 KaTeX 格式要求书写每一步所有的数学公式与字母变量。`;
      
      config = {
        systemInstruction: stepSystemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              description: "3至4个循序渐进的剖析步骤",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "步骤的小标题" },
                  content: { type: Type.STRING, description: "步骤的 Markdown 详细解析内容，结合当前数值进行针对性分析" }
                },
                required: ["title", "content"]
              }
            },
            summary: { type: Type.STRING, description: "一句话短小精炼的数学物理总结" }
          },
          required: ["steps", "summary"]
        }
      };

      userMessage = `请针对以下模型与参数，生成一个包含3-4步的数学物理推导分步教学演示：\n\n当前状态上下文：\n${promptContext}`;
    } else {
      userMessage = customPrompt 
        ? `结合当前的数学模型上下文：\n${promptContext}\n\n我的提问是：\n${customPrompt}`
        : `请对当前模型下的状态进行一次精彩生动、淡雅大方的深度数学洞察与科普分析。\n\n当前状态上下文：\n${promptContext}`;
    }

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userMessage,
      config,
    });

    if (isStepByStep) {
      let steps = [];
      let summary = "";
      try {
        const parsed = JSON.parse(response.text || "{}");
        steps = parsed.steps || [];
        summary = parsed.summary || "";
      } catch (parseErr) {
        console.error("Failed to parse steps JSON:", parseErr, response.text);
        steps = [
          {
            title: "推导分析",
            content: "当前由于解析格式问题，已为您渲染普通版洞察响应。\n\n" + (response.text || "")
          }
        ];
        summary = "计算完成";
      }
      res.json({
        success: true,
        isStepByStep: true,
        steps,
        summary
      });
    } else {
      res.json({
        success: true,
        isStepByStep: false,
        text: response.text,
      });
    }
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    res.status(500).json({
      success: false,
      message: "数学博士开小差了，请稍后再试或检查配置！Error: " + err.message,
    });
  }
});

// Setup Vite middleware in Development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Development modes: Vite middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production modes: Serving static build from dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Integral Universe Server is running on port ${PORT}`);
  });
}

startServer();
