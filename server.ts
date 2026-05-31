import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Inicialização da porta padrão para o Cloud Run e proxies (Porta 3000)
const PORT = 3000;

async function startServer() {
  const app = express();

  // Configurar limites maiores para permitir upload de fotos em Base64
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // Endpoint de saúde da API
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      message: "Servidor do Tutor Socrático está operacional."
    });
  });

  // Endpoint principal do tutor socrático utilizando a API do Gemini
  app.post("/api/tutor/chat", async (req, res) => {
    try {
      const { history, message, image } = req.body;

      // Verificação de segurança obrigatória para API Key do Gemini (Inicialização Preguiçosa/Lazy)
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        console.warn("[Alerta] GEMINI_API_KEY não foi configurada nas variáveis de ambiente (.env).");
        return res.status(500).json({
          error: "API_KEY_MISSING",
          message: "A chave de API do Gemini (GEMINI_API_KEY) não está configurada! Por favor, adicione-a no painel Secrets (Configurações) no topo esquerdo do AI Studio para que o tutor possa responder."
        });
      }

      // Inicializa o cliente do Gemini do pacote oficial @google/genai
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Configuração instrucional socrática detalhada para o modelo Gemini
      const socraticSystemInstruction = `Você é o "Tutor Socrático de Matemática", um professor de matemática extremamente compassivo, amigável, didático e paciente. Seu objetivo é ajudar estudantes a resolverem e compreenderem problemas de álgebra, cálculo, trigonometria e geometria, agindo como um mentor que senta ao lado deles para ensiná-los a pensar, e não como uma calculadora que apenas cospe respostas.

Siga estas instruções estritas para manter o método socrático:
1. NUNCA revele a resposta final do problema diretamente sob hipótese alguma de primeira.
2. Reconheça o problema enviado (seja em imagem ou texto) com muito entusiasmo e de forma acolhedora (ex: "Que problema interessante de limite! Vamos desvendar juntos?").
3. Apresente APENAS o primeiro passo lógico para a resolução. Por exemplo, incentive-os a simplificar a fração primeiro, encontrar as raízes, ou definir qual técnica de integração usar.
4. Faça sempre uma pergunta aberta e encorajadora no final de cada mensagem para convidar o aluno a fazer o próximo movimento (ex: "Qual você acha que é o próximo termo aqui?", "Como podemos reescrever essa base?").
5. Se o aluno disser "Estou travado", pedir ajuda ou perguntar "Por que fizemos isso?", NÃO avance para a resposta. Explique apenas a teoria conceitual por trás daquele passo específico de forma extremamente clara, amigável e intuitiva (use analogias se couber). Em seguida, convide-o novamente a dar o passo.
6. Use formatação Markdown impecável. Para equações matemáticas ou fórmulas, utilize LaTeX padrão: use $$ [equação em bloco] $$ em sua própria linha ou $ [equação em linha] $ no meio do texto para que o site renderize as equações maravilhosamente bem.
7. Comunique-se inteiramente em português brasileiro, mantendo um tom encorajador, otimista de "você é capaz!". Celebre cada pequeno progresso do estudante!`;

      // Montar os conteúdos no formato exigido pela nova API do Gemini
      // contents: Array de { role: 'user' | 'model', parts: [ { text }, { inlineData } ] }
      const contentsPayload: any[] = [];

      // Mapear mensagens anteriores para o modelo histórico do Gemini
      if (Array.isArray(history) && history.length > 0) {
        for (const msg of history) {
          const parts: any[] = [];
          
          if (msg.image) {
            parts.push({
              inlineData: {
                mimeType: msg.image.mimeType || "image/jpeg",
                data: msg.image.data,
              },
            });
          }
          
          if (msg.text) {
            parts.push({ text: msg.text });
          }

          contentsPayload.push({
            role: msg.role === "tutor" ? "model" : "user",
            parts: parts.length > 0 ? parts : [{ text: "" }],
          });
        }
      }

      // Adicionar a mensagem de entrada atual do estudante
      const currentParts: any[] = [];
      if (image && image.data) {
        currentParts.push({
          inlineData: {
            mimeType: image.mimeType || "image/jpeg",
            data: image.data,
          },
        });
      }

      if (message) {
        currentParts.push({ text: message });
      } else if (image && image.data && currentParts.length === 1) {
        // Se enviou apenas uma imagem sem texto, estimulamos o Gemini a iniciar a análise
        currentParts.push({ text: "Analise esta imagem matemática e me ajude com o primeiro passo de forma socrática, por favor." });
      }

      contentsPayload.push({
        role: "user",
        parts: currentParts,
      });

      // Executa a chamada chamando a API de geração de conteúdo do Gemini 3.5 Flash
      // que suporta imagens, textos e velocidade ultra rápida para chat
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentsPayload,
        config: {
          systemInstruction: socraticSystemInstruction,
          temperature: 0.7,
        },
      });

      const tutorTextResponse = response.text || "Desculpe, tive dificuldades para gerar uma resposta. Vamos tentar reescrever o problema?";

      return res.json({
        role: "tutor",
        text: tutorTextResponse,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error("Erro ao chamar a API do Gemini:", error);
      return res.status(500).json({
        error: "GEMINI_API_ERROR",
        message: "Ocorreu um erro ao processar sua pergunta com o tutor de IA.",
        details: error.message || error.toString()
      });
    }
  });

  // Configuração do Vite em modo Middleware de Desenvolvimento vs produção estática
  if (process.env.NODE_ENV !== "production") {
    console.log("Iniciando Vite em modo Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Iniciando servidor de Produção com arquivos compilados...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Ouvindo na porta 3000 do container
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Tutor Socrático online na porta ${PORT} (http://localhost:${PORT})`);
  });
}

startServer();
