var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_genai = require("@google/genai");
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var aiClient = null;
function getGeminiClient() {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("MISSING_API_KEY");
  }
  aiClient = new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
  return aiClient;
}
app.post("/api/insight", async (req, res) => {
  try {
    const { mode, parameters, customPrompt, isStepByStep } = req.body;
    let gemini;
    try {
      gemini = getGeminiClient();
    } catch (e) {
      if (e.message === "MISSING_API_KEY") {
        return res.status(200).json({
          success: false,
          errorType: "MISSING_KEY",
          message: `### \u{1F4A1} \u9700\u8981\u914D\u7F6E API Key
\u4E3A\u4E86\u89E3\u9501\u5F3A\u5927\u7684 **AI \u6570\u5B66\u6D1E\u5BDF\u670D\u52A1**\uFF0C\u8BF7\u5728 AI Studio \u7F16\u8F91\u5668\u7684\u53F3\u4FA7\u63A7\u5236\u9762\u677F **Settings > Secrets** \u4E2D\u6DFB\u52A0\u4E00\u4E2A\u540D\u4E3A \`GEMINI_API_KEY\` \u7684\u5BC6\u94A5\uFF0C\u5E76\u586B\u5165\u60A8\u7684 Gemini API \u5BC6\u94A5\u3002

*(\u5F53\u524D\u5E94\u7528\u4ECD\u5728\u672C\u5730\u8FD0\u884C\uFF0C\u60A8\u53EF\u4EE5\u6B63\u5E38\u4F53\u9A8C\u4E94\u4E2A\u5173\u5361\u7684\u5FAE\u79EF\u5206\u56FE\u5F62\u4EA4\u4E92\uFF0C\u4E0D\u53D7\u5F71\u54CD\u3002)*`
        });
      }
      throw e;
    }
    let promptContext = "";
    if (mode === "riemann") {
      promptContext = `\u5728\u5FAE\u79EF\u5206\u5B66\u4E60\u4E2D\uFF0C\u201C\u9ECE\u66FC\u548C\u903C\u8FD1\u201D\u662F\u7406\u89E3\u5B9A\u79EF\u5206\u6838\u5FC3\u3002
\u7528\u6237\u5F53\u524D\u6B63\u5728\u7814\u7A76\u7684\u914D\u7F6E\u5982\u4E0B\uFF1A
- \u51FD\u6570\uFF1Af(x) = ${parameters.funcLabel}\u5728\u533A\u95F4 [${parameters.a}, ${parameters.b}]\u3002
- \u5F53\u524D\u5206\u5272\u533A\u95F4\u6570 N\uFF1A${parameters.n}\u3002
- \u903C\u8FD1\u65B9\u5F0F\uFF1A${parameters.sumTypeLabel} (\u5982\u5DE6\u5FAE\u5143\u3001\u53F3\u5FAE\u5143\u3001\u4E2D\u70B9\u5FAE\u5143\u7B49)\u3002
- \u7B97\u51FA\u7684\u5206\u5272\u6BB5\u5BBD dx\uFF1A${parameters.dx}\u3002
- \u9ECE\u66FC\u548C\u8FD1\u4F3C\u503C\uFF1A${parameters.riemannSum}\u3002
- \u6781\u9650\u5B9A\u79EF\u5206\u7CBE\u786E\u503C\uFF1A${parameters.exact}\u3002
- \u5F53\u524D\u7684\u7EDD\u5BF9\u8BEF\u5DEE\uFF1A${parameters.error}\u3002`;
    } else if (mode === "area") {
      promptContext = `\u5728\u5FAE\u79EF\u5206\u5B66\u4E60\u4E2D\uFF0C\u201C\u9762\u79EF\u4E0E\u539F\u51FD\u6570\u7D2F\u79EF\uFF08\u5FAE\u79EF\u5206\u57FA\u672C\u5B9A\u7406\uFF09\u201D\u662F\u6838\u5FC3\u3002
\u7528\u6237\u5F53\u524D\u64CD\u4F5C\uFF1A
- \u88AB\u79EF\u51FD\u6570\uFF1Af(t) = ${parameters.funcLabel}\u3002
- \u533A\u95F4\uFF1A\u4ECE a = ${parameters.a} \u5F00\u59CB\u7D2F\u79EF\u3002
- \u5F53\u524D\u6ED1\u5757\u626B\u8FC7\u7684\u7D2F\u79EF\u7EC8\u70B9\uFF1Ax = ${parameters.xCurrent}\u3002
- \u7D2F\u79EF\u5F62\u6210\u7684\u79EF\u5206\u9762\u79EF\uFF1AA(x) = \u222B[a, x] f(t) dt = ${parameters.accumulatedArea}\u3002`;
    } else if (mode === "distance") {
      promptContext = `\u5728\u7269\u7406\u4E0E\u5FAE\u79EF\u5206\u4E2D\uFF0C\u201C\u8DEF\u7A0B\u7D2F\u79EF\uFF08\u901F\u5EA6\u7684\u79EF\u5206\uFF09\u201D\u662F\u6781\u4F73\u6848\u4F8B\u3002
\u7528\u6237\u5F53\u524D\u89C2\u5BDF\u4E00\u4E2A\u6A21\u62DF\u79FB\u52A8\u7684\u7269\u4F53\uFF1A
- \u901F\u5EA6\u66F2\u7EBF\uFF1Av(t) = ${parameters.velocityProfileLabel}\u3002
- \u6A21\u62DF\u65F6\u95F4\u8303\u56F4\uFF1A\u4ECE t = 0 \u5230 t = ${parameters.tMax} \u79D2\u3002
- \u5F53\u524D\u65F6\u523B\uFF1At_current = ${parameters.tCurrent} \u79D2\u3002
- \u6B64\u65F6\u7269\u4F53\u7684\u77AC\u65F6\u8FD0\u52A8\u901F\u5EA6 v(t_current) = ${parameters.vCurrent} m/s\u3002
- \u901A\u8FC7\u79EF\u5206\u7D2F\u79EF\u5F97\u5230\u7684\u603B\u4F4D\u79FB s(t_current) = \u222B[0, t_current] v(u) du = ${parameters.distance} \u7C73\u3002`;
    } else if (mode === "probability") {
      promptContext = `\u5728\u6982\u7387\u8BBA\u4E2D\uFF0C\u8FDE\u7EED\u968F\u673A\u53D8\u91CF\u7684\u201C\u5E95\u9762\u79EF\u5206\uFF08\u6982\u7387\u5BC6\u5EA6\u79EF\u5206\uFF09\u201D\u4EE3\u8868\u4E8B\u4EF6\u53D1\u751F\u7684\u6982\u7387\u3002
\u7528\u6237\u914D\u7F6E\u7684\u9AD8\u65AF\u6B63\u6001\u5206\u5E03 PDF \u7684\u53C2\u6570\u4E3A\uFF1A
- \u5747\u503C (\u03BC)\uFF1A${parameters.mean}
- \u6807\u51C6\u5DEE (\u03C3)\uFF1A${parameters.stdDev}
- \u88AB\u79EF\u5206\u7684\u4E8B\u4EF6\u533A\u95F4\uFF1A[${parameters.x1}, ${parameters.x2}]
- \u79EF\u5206\u6982\u7387 P(${parameters.x1} <= X <= ${parameters.x2}) = \u222B[x1, x2] f(x) dx = ${(parameters.prob * 100).toFixed(4)}%`;
    } else if (mode === "energy") {
      promptContext = `\u5728\u7269\u7406\u5B66\u4E0E\u5DE5\u7A0B\u4E2D\uFF0C\u201C\u80FD\u91CF\u7D2F\u79EF\uFF08\u53D8\u529B\u505A\u529F F\xB7dx \u6216 \u529F\u7387\u7D2F\u79EF P\xB7dt\uFF09\u201D\u662F\u76F4\u89C2\u7684\u79EF\u5206\u4F53\u73B0\u3002
\u7528\u6237\u5F53\u524D\u901A\u8FC7\u62D6\u62FD\u6ED1\u5757\u6765\u538B\u7F29\u5F39\u7C27\uFF0C\u53D8\u529B\u505A\u529F\u5B58\u50A8\u5F39\u6027\u52BF\u80FD\uFF08\u80E1\u514B\u5B9A\u5F8B\uFF09\uFF1A
- \u52B2\u5EA6\u7CFB\u6570 k\uFF1A${parameters.k} N/m
- \u5F39\u7C27\u88AB\u538B\u7F29\u7684\u62C9\u4F38\u4F4D\u79FB x\uFF1A${parameters.x} \u7C73 (\u5F53\u524D\u72B6\u6001)
- \u6B64\u65F6\u65BD\u52A0\u7684\u5B9E\u65F6\u80E1\u514B\u53D8\u529B\uFF1AF(x) = k\xB7x = ${parameters.force} \u725B\u987F
- \u79EF\u5206\u53D8\u529B\u505A\u529F\uFF08\u5F39\u6027\u52BF\u80FD\uFF09\uFF1AE_p = \u222B[0, x] k\xB7u du = 1/2 k x^2 = ${parameters.energy} \u7126\u8033`;
    }
    const systemInstruction = `\u4F60\u662F\u4E00\u4F4D\u624D\u534E\u6A2A\u6EA2\u3001\u5145\u6EE1\u6E29\u60C5\u7684\u5FAE\u79EF\u5206\u4E13\u5BB6\u3001\u6570\u5B66\u79D1\u666E\u5BB6\u3002
\u4F60\u7684\u4EFB\u52A1\u662F\u5F15\u5BFC\u7528\u6237\u7406\u89E3\u5FAE\u79EF\u5206\u7684\u76F4\u89C2\u7F8E\u5B66\u3001\u672C\u8D28\u601D\u60F3\uFF1A\u9762\u79EF\u7D2F\u79EF\u3001\u4ECE\u79BB\u6563\u5411\u8FDE\u7EED\u7684\u53D1\u5C55\uFF0C\u800C\u4E0D\u662F\u67AF\u71E5\u7684\u516C\u5F0F\u8BB0\u5FC6\u3002
\u5728\u89E3\u7B54\u4E2D\uFF0C\u8981\uFF1A
1. \u6DF1\u5165\u6D45\u51FA\u5730\u89E3\u91CA\u7528\u6237\u5F53\u524D\u4EA4\u4E92\u9875\u9762\u4E0A\u53D1\u751F\u7684\u6570\u5B66\u53D8\u5316\u3002\u4F8B\u5982\uFF1A\u5982\u679C\u5206\u5272\u6570 N \u8F83\u5927\uFF0C\u8D5E\u7F8E\u4ED6\u4EEC\u903C\u8FD1\u4E86\u6781\u9650\uFF1B\u5982\u679C N \u8F83\u5C0F\uFF0C\u63ED\u793A\u79BB\u6563\u8BEF\u5DEE\u7684\u76F4\u89C2\u51E0\u4F55\u5448\u73B0\u3002
2. \u8BED\u8A00\u6DE1\u96C5\u5927\u65B9\u3001\u4EB2\u5207\u9F13\u52B1\u3001\u5E26\u6709\u542F\u53D1\u6027\uFF0C\u6392\u7248\u4F7F\u7528\u4F18\u96C5\u7684 Markdown\u3002
3. \u3010\u6781\u91CD\u8981\uFF1A\u5FC5\u987B\u5168\u91CF\u4F7F\u7528\u6F02\u4EAE\u89C4\u8303\u7684 KaTeX / LaTeX \u683C\u5F0F\u6765\u4E66\u5199\u6240\u6709\u6570\u5B66\u516C\u5F0F\u3001\u7B26\u53F7\u4E0E\u8868\u8FBE\u5F0F\u3011\uFF1A
   - \u7981\u6B62\u4F7F\u7528\u666E\u901A\u82F1\u6587\u6587\u672C\uFF08\u5982 f(x)\u3001dx\u3001sigma\uFF09\u3001Markdown \u52A0\u7C97\u666E\u901A\u6587\u672C\uFF08\u5982 **F = k*x**\uFF09\u6216\u666E\u901A\u7684 code \u5757\u5305\u88F9\uFF08\u5982 \`dx\`\uFF09\u6765\u4E66\u5199\u6570\u5B66\u5BF9\u8C61\u3002
   - \u6240\u6709\u72EC\u7ACB\u6210\u884C\u7684\u5927\u516C\u5F0F\u3001\u6C42\u548C\u516C\u5F0F\u3001\u5BFC\u6570\u4E0E\u5B9A\u79EF\u5206\u516C\u5F0F\uFF0C\u5FC5\u987B\u5168\u90E8\u5305\u88F9\u5728\u53CC\u7F8E\u5143\u7B26\u53F7\u4E2D\uFF0C\u4F8B\u5982\uFF1A$$\\int_{a}^{b} f(t) \\, dt = F(b) - F(a)$$ \u6216 $$\\lim_{N \\to \\infty} \\sum_{i=1}^{N} f(x_i) \\Delta x$$ \u6216 $$E_p = \\frac{1}{2}kx^2$$\u3002
   - \u6240\u6709\u884C\u5185\u51FA\u73B0\u7684\u4EFB\u4F55\u53D8\u91CF\u540D\u3001\u81EA\u53D8\u91CF\u3001\u6781\u5C0F\u5143\u3001\u5747\u503C\u3001\u6807\u51C6\u5DEE\u3001\u51FD\u6570\u7B26\u53F7\u3001\u5E38\u6570\uFF0C\u4F8B\u5982 $x$\u3001$t$\u3001$f(x)$\u3001$dx$\u3001$\\sigma$\u3001$\\mu$\u3001$k$\u3001$v(t)$ \u7B49\uFF0C\u5FC5\u987B\u5168\u90E8\u5305\u88F9\u5728\u5355\u7F8E\u5143\u7B26\u53F7\u4E2D\uFF0C\u4F8B\u5982\uFF1A$x$\u3001$t_i$\u3001$f(x)$\u3001$\\sigma$\u3001$\\mu$\u3001$k$\u3001$F=kx$\u3002
4. \u7ED3\u5408\u7528\u6237\u6240\u9009\u7684\u5177\u4F53\u6A21\u578B\u548C\u53C2\u6570\u8FDB\u884C\u5206\u6790\uFF0C\u7B97\u672F\u6570\u5B57\u8981\u81EA\u7136\u8D34\u5207\uFF0C\u6307\u51FA\u5FAE\u79EF\u5206\u57FA\u672C\u5B9A\u7406\u7684\u60CA\u4EBA\u4E4B\u5904\u3002
5. \u5982\u679C\u662F\u7528\u6237\u63D0\u95EE\uFF0C\u8BF7\u4E13\u4E1A\u901A\u4FD7\u5730\u4E88\u4EE5\u89E3\u7B54\u5E76\u5EF6\u4F38\u3002`;
    let userMessage = "";
    let config = {
      systemInstruction,
      temperature: 0.7
    };
    if (isStepByStep) {
      const stepSystemInstruction = systemInstruction + `
\u4F60\u5FC5\u987B\u5C06\u5F53\u524D\u7684\u6570\u5B66\u7269\u7406\u6A21\u578B\u5206\u89E3\u4E3A 3 \u81F3 4 \u4E2A\u6E05\u6670\u3001\u7B80\u7EC3\u3001\u5FAA\u5E8F\u6E10\u8FDB\u7684\u63A8\u5BFC\u4E0E\u51E0\u4F55\u5206\u6790\u6B65\u9AA4\uFF0C\u8BA9\u8BFB\u8005\u53EF\u4EE5\u50CF\u9605\u8BFB\u8FDE\u73AF\u753B\u4E00\u6837\u7CBE\u7EC6\u8DDF\u968F\u3002\u6BCF\u4E2A\u6B65\u9AA4\u5E94\u542B\uFF1A
- title: \u6B65\u9AA4\u5BF9\u5E94\u7684\u5C0F\u6807\u9898 (\u4F8B\u5982\uFF1A'\u6B65\u9AA4\u4E00\uFF1A\u611F\u77E5\u533A\u95F4\u5212\u5206')
- content: \u7528\u901A\u4FD7\u751F\u52A8\u3001\u4E25\u8C28\u4F18\u96C5\u7684 Markdown \u8BED\u8A00\u6DF1\u5165\u5256\u6790\u8FD9\u4E00\u6B65\u5BF9\u5E94\u7684\u516C\u5F0F\u6F14\u53D8\u3001\u6570\u503C\u5927\u5C0F\u4E0E\u76F4\u89C2\u7F8E\u611F\uFF0C\u5E76\u4E25\u683C\u9075\u5B88\u4E0A\u8FF0 KaTeX \u683C\u5F0F\u8981\u6C42\u4E66\u5199\u6BCF\u4E00\u6B65\u6240\u6709\u7684\u6570\u5B66\u516C\u5F0F\u4E0E\u5B57\u6BCD\u53D8\u91CF\u3002`;
      config = {
        systemInstruction: stepSystemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            steps: {
              type: import_genai.Type.ARRAY,
              description: "3\u81F34\u4E2A\u5FAA\u5E8F\u6E10\u8FDB\u7684\u5256\u6790\u6B65\u9AA4",
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  title: { type: import_genai.Type.STRING, description: "\u6B65\u9AA4\u7684\u5C0F\u6807\u9898" },
                  content: { type: import_genai.Type.STRING, description: "\u6B65\u9AA4\u7684 Markdown \u8BE6\u7EC6\u89E3\u6790\u5185\u5BB9\uFF0C\u7ED3\u5408\u5F53\u524D\u6570\u503C\u8FDB\u884C\u9488\u5BF9\u6027\u5206\u6790" }
                },
                required: ["title", "content"]
              }
            },
            summary: { type: import_genai.Type.STRING, description: "\u4E00\u53E5\u8BDD\u77ED\u5C0F\u7CBE\u70BC\u7684\u6570\u5B66\u7269\u7406\u603B\u7ED3" }
          },
          required: ["steps", "summary"]
        }
      };
      userMessage = `\u8BF7\u9488\u5BF9\u4EE5\u4E0B\u6A21\u578B\u4E0E\u53C2\u6570\uFF0C\u751F\u6210\u4E00\u4E2A\u5305\u542B3-4\u6B65\u7684\u6570\u5B66\u7269\u7406\u63A8\u5BFC\u5206\u6B65\u6559\u5B66\u6F14\u793A\uFF1A

\u5F53\u524D\u72B6\u6001\u4E0A\u4E0B\u6587\uFF1A
${promptContext}`;
    } else {
      userMessage = customPrompt ? `\u7ED3\u5408\u5F53\u524D\u7684\u6570\u5B66\u6A21\u578B\u4E0A\u4E0B\u6587\uFF1A
${promptContext}

\u6211\u7684\u63D0\u95EE\u662F\uFF1A
${customPrompt}` : `\u8BF7\u5BF9\u5F53\u524D\u6A21\u578B\u4E0B\u7684\u72B6\u6001\u8FDB\u884C\u4E00\u6B21\u7CBE\u5F69\u751F\u52A8\u3001\u6DE1\u96C5\u5927\u65B9\u7684\u6DF1\u5EA6\u6570\u5B66\u6D1E\u5BDF\u4E0E\u79D1\u666E\u5206\u6790\u3002

\u5F53\u524D\u72B6\u6001\u4E0A\u4E0B\u6587\uFF1A
${promptContext}`;
    }
    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userMessage,
      config
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
            title: "\u63A8\u5BFC\u5206\u6790",
            content: "\u5F53\u524D\u7531\u4E8E\u89E3\u6790\u683C\u5F0F\u95EE\u9898\uFF0C\u5DF2\u4E3A\u60A8\u6E32\u67D3\u666E\u901A\u7248\u6D1E\u5BDF\u54CD\u5E94\u3002\n\n" + (response.text || "")
          }
        ];
        summary = "\u8BA1\u7B97\u5B8C\u6210";
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
        text: response.text
      });
    }
  } catch (err) {
    console.error("Gemini API Error:", err);
    res.status(500).json({
      success: false,
      message: "\u6570\u5B66\u535A\u58EB\u5F00\u5C0F\u5DEE\u4E86\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u6216\u68C0\u67E5\u914D\u7F6E\uFF01Error: " + err.message
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Development modes: Vite middleware loaded.");
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
    console.log("Production modes: Serving static build from dist.");
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Integral Universe Server is running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
