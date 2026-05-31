import React, { useState } from "react";
import { 
  Terminal, 
  Server, 
  Code, 
  Layers, 
  ExternalLink,
  BookOpen, 
  CheckCircle, 
  Key, 
  Cloud, 
  Cpu,
  Info
} from "lucide-react";

export const CodeWalkthrough: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"architecture" | "server" | "frontend" | "deploy">("architecture");
  const [selectedServerLine, setSelectedServerLine] = useState<number | null>(null);
  const [selectedFrondendLine, setSelectedFrontendLine] = useState<number | null>(null);

  // Lista com explicações detalhadas para as partes chave de server.ts
  const serverExplanations = [
    {
      range: "Linhas 1 - 4",
      title: "Importação de Bibliotecas",
      code: 'import express from "express";\nimport path from "path";\nimport { createServer as createViteServer } from "vite";\nimport { GoogleGenAI } from "@google/genai";',
      description: "Importa o framework de servidor Express, o módulo integrado do Node para caminhos de arquivos 'path', o compilador do Vite para desenvolvimento dinâmico e o novo e oficial SDK do Google Gen AI para chamadas ao Gemini."
    },
    {
      range: "Linhas 10 - 11",
      title: "Ajustes de Limites do Express",
      code: "app.use(express.json({ limit: '15mb' }));\napp.use(express.urlencoded({ limit: '15mb', extended: true }));",
      description: "Por padrão, o Express limita o corpo da requisição a 100KB. Como o usuário enviará fotos matemáticas convertidas em Base64 (que são grandes), aumentamos o limite de requisição para até 15 Megabytes, permitindo uploads tranquilos."
    },
    {
      range: "Linhas 22 - 32",
      title: "Chave do Gemini e Inicialização Preguiçosa (Lazy)",
      code: "const apiKey = process.env.GEMINI_API_KEY;\nif (!apiKey) {\n  return res.status(500).json({ error: 'API_KEY_MISSING', ... });\n}\nconst ai = new GoogleGenAI({ apiKey });",
      description: "Padrão de segurança crítico: verifica se a chave secreta existe antes de iniciar o cliente e retornar as chamadas. Se não estiver configurada no painel de segredos, ele envia um erro amigável ao invés de derrubar o servidor."
    },
    {
      range: "Linhas 35 - 43",
      title: "As Diretrizes Socráticas",
      code: "const socraticSystemInstruction = `Você é o Tutor Socrático... \n1. NUNCA revele a resposta final diretamente... \n2. Apresente APENAS o primeiro passo lógico...\n3. Use LaTeX padrão: $$ [equação] $$...`;",
      description: "Este é o 'cérebro' pedagógico do tutor. Enviamos esta sistemática refinada nas configurações do Gemini para garantir que ele nunca estrague o aprendizado do aluno, mantendo perguntas indutivas e formatações LaTeX amigáveis."
    },
    {
      range: "Linhas 47 - 81",
      title: "Conversão do Histórico em Estrutura Multi-Partes",
      code: "const contentsPayload = [];\n// Mapeia histórico do chat para o formato do Gemini...\ncontentsPayload.push({ role: 'user', parts: [ { inlineData: { data, mimeType } } ] });",
      description: "Mapeia as imagens e textos que o usuário enviou até agora para a estrutura de conversas nativa da API do Gemini. Permite ao tutor se lembrar de todas as fotos e mensagens enviadas na sessão atual preservando o fluxo de raciocínio lógico."
    },
    {
      range: "Linhas 83 - 92",
      title: "A Requisição Multimodal do Gemini 3.5 Flash",
      code: "const response = await ai.models.generateContent({\n  model: 'gemini-3.5-flash',\n  contents: contentsPayload,\n  config: { systemInstruction, temperature: 0.7 }\n});",
      description: "Dispara a chamada para o modelo Gemini 3.5 Flash integrado com o nosso prompt socrático e a temperatura moderada (0.7) para equilibrar a precisão com a acolhida pedagógica. O retorno traz as instruções e a próxima pergunta do tutor."
    },
    {
      range: "Linhas 106 - 120",
      title: "Modo Dual: Desenvolvimento vs Produção",
      code: "if (process.env.NODE_ENV !== 'production') {\n  const vite = await createViteServer({ server: { middlewareMode: true } });\n  app.use(vite.middlewares);\n} else {\n  app.use(express.static('dist'));\n}",
      description: "Em Desenvolvimento, o Express atua como proxy roteando requisições ao compilador instantâneo do Vite. Em Produção, o Vite já compilou tudo para a pasta 'dist', então o Express apenas serve os arquivos estáticos de modo otimizado e rápido."
    }
  ];

  // Lista com explicações detalhadas para App.tsx
  const frontendExplanations = [
    {
      range: "Leitor de Arquivos",
      title: "Conversor de Arquivo para Base64",
      code: "const reader = new FileReader();\nreader.readAsDataURL(file);\nreader.onload = () => { const base64String = reader.result.split(',')[1]; };",
      description: "A API do Gemini requer que imagens sejam enviadas em blocos binários Base64. Utilizamos a classe nativa do navegador 'FileReader' para ler a imagem de cálculo fotografada e fatiamos a string de metadados para pegar apenas os dados puros da imagem."
    },
    {
      range: "Ciclo de Conversação",
      title: "Fluxo de Requisição de Chat",
      code: "const response = await fetch('/api/tutor/chat', {\n  method: 'POST',\n  body: JSON.stringify({ history: messages, message: prompt, image: upload })\n});\nconst data = await response.json();",
      description: "Envia todo o histórico da conversa e o novo formulário do aluno (incluindo possíveis fotos novas) para a nossa API protegida do Express `/api/tutor/chat`, mantendo a GEMINI_API_KEY totalmente oculta e segura no lado do servidor."
    },
    {
      range: "LaTeX & Render",
      title: "Decodificador de Fórmulas Matemáticas",
      code: "const blockParts = text.split('$$');\nconst formattedSymbols = cleanMathSymbols(block);\n// Renderiza em fontes clássicas serifadas italic",
      description: "Como importações de bibliotecas pesadas de fórmulas decimais geram quebras frequentes, o nosso componente personalizado 'MathText' quebra o texto por separadores '$' e '$$', limpa códigos LaTeX puros trocando-os por símbolos Unicode e monta o visual clássico de apostila escolar."
    },
    {
      range: "Pedagogia de Botões",
      title: "Ações de Atalho Socráticos",
      code: '<button onClick={() => triggerShortcut("Por que fizemos isso?")}>\n  💡 Por que fizemos isso?\n</button>',
      description: "Botões estilizados e ágeis que permitem ao aluno enviar comandos de atalhos em 1-clique (como 'Por que aplicamos essa regra?' ou 'Entendi! Qual é o próximo passo?') para tornar o chat dinâmico e amigável."
    }
  ];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm" id="code-walkthrough-component">
      {/* Cabeçalho do Walkthrough */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 relative">
        <div className="absolute top-2 right-2 bg-indigo-500/10 text-indigo-300 font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-indigo-400/20">
          Guia de Aprendizado
        </div>
        
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl md:text-2xl font-sans font-medium tracking-tight">
            Como este site funciona?
          </h2>
        </div>
        
        <p className="text-slate-300 text-xs md:text-sm max-w-3xl leading-relaxed">
          Você pediu para replicarmos o que cada linha de código faz para aprender melhor o processo completo de publicação. 
          Abaixo, explore o funcionamento da arquitetura full-stack, os segredos do backend no servidor e as etapas de colocação no ar.
        </p>
      </div>

      {/* Abas e Menus de Navegação */}
      <div className="flex flex-wrap border-b border-slate-200 bg-white">
        <button
          onClick={() => setActiveTab("architecture")}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs md:text-sm font-medium transition-colors border-b-2 outline-none ${
            activeTab === "architecture"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/20"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
          }`}
          id="tab-architecture"
        >
          <Layers className="w-4 h-4" />
          Estrutura do Projeto
        </button>

        <button
          onClick={() => setActiveTab("server")}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs md:text-sm font-medium transition-colors border-b-2 outline-none ${
            activeTab === "server"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/20"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
          }`}
          id="tab-server"
        >
          <Server className="w-4 h-4" />
          Backend (server.ts)
        </button>

        <button
          onClick={() => setActiveTab("frontend")}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs md:text-sm font-medium transition-colors border-b-2 outline-none ${
            activeTab === "frontend"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/20"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
          }`}
          id="tab-frontend"
        >
          <Code className="w-4 h-4" />
          Frontend (App.tsx & MathText)
        </button>

        <button
          onClick={() => setActiveTab("deploy")}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs md:text-sm font-medium transition-colors border-b-2 outline-none ${
            activeTab === "deploy"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/20"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
          }`}
          id="tab-deploy"
        >
          <Cloud className="w-4 h-4" />
          Como Publicar na Web
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className="p-5 md:p-6 bg-white min-h-[350px]">
        
        {/* ABA: ARQUITETURA */}
        {activeTab === "architecture" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-2">
                  <Terminal className="w-4 h-4" />
                  <span>1. Interface do Usuário</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  O aluno usa o cliente em React, seleciona problemas didáticos ou fotografa problemas no caderno, carregando a imagem localmente.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-2">
                  <Server className="w-4 h-4" />
                  <span>2. Servidor Exclusivo</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A nossa API Express recebe a foto em formato Base64. Ela cuida de blindar a chave secreta do Gemini, impedindo que hackers a roubem.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-2">
                  <Cpu className="w-4 h-4" />
                  <span>3. IA do Gemini 3.5</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Envia a imagem e instruções de raciocínio pedagógico para a inteligência de processamento visual para extrair apenas a primeira etapa do cálculo.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h3 className="font-semibold text-slate-800 mb-3 text-sm flex items-center gap-1.5">
                <Info className="w-4 h-4 text-indigo-500" />
                Tecnologias Utilizadas na Solução Publicável
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="bg-indigo-50/40 p-2.5 rounded border border-indigo-100/50 flex flex-col">
                  <span className="font-bold text-indigo-900 font-mono">@google/genai</span>
                  <span className="text-[10px] text-slate-500 mt-1">O SDK novíssimo oficial de alto desempenho do Google para o Gemini.</span>
                </div>
                <div className="bg-indigo-50/40 p-2.5 rounded border border-indigo-100/50 flex flex-col">
                  <span className="font-bold text-indigo-900 font-mono">Express</span>
                  <span className="text-[10px] text-slate-500 mt-1">Biblioteca robusta do Node para escutar rotas HTTP e endpoints lógicos.</span>
                </div>
                <div className="bg-indigo-50/40 p-2.5 rounded border border-indigo-100/50 flex flex-col">
                  <span className="font-bold text-indigo-900 font-mono">Esbuild</span>
                  <span className="text-[10px] text-slate-500 mt-1">Empacotador extremamente rápido que aglutina o código em um arquivo único.</span>
                </div>
                <div className="bg-indigo-50/40 p-2.5 rounded border border-indigo-100/50 flex flex-col">
                  <span className="font-bold text-indigo-900 font-mono">Vite & Tailwind</span>
                  <span className="text-[10px] text-slate-500 mt-1">Carrega estilos compilados instantâneos para visual moderno e leveza.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: BACKEND (SERVER.TS) */}
        {activeTab === "server" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 leading-snug">
              Clique nas seções correspondentes abaixo para ver o que cada bloco lógicos do arquivo primário <code className="bg-slate-100 px-1 rounded text-red-650 font-mono font-bold text-[11px] border border-slate-200">server.ts</code> realiza nos bastidores para realizar a mágica socrática:
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <div className="lg:col-span-2 flex flex-col gap-2">
                {serverExplanations.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedServerLine(index)}
                    className={`p-3 text-left border rounded-xl transition-all ${
                      selectedServerLine === index
                        ? "border-indigo-500 bg-indigo-55/60 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-450 hover:bg-slate-50"
                    }`}
                    id={`serv-line-btn-${index}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-indigo-600 font-mono">{item.range}</span>
                      <CheckCircle className={`w-3.5 h-3.5 text-emerald-500 transition-opacity ${selectedServerLine === index ? "opacity-100" : "opacity-0"}`} />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 block">{item.title}</span>
                  </button>
                ))}
              </div>

              <div className="lg:col-span-3 bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-850 font-mono text-xs overflow-auto flex flex-col justify-between min-h-[320px]">
                {selectedServerLine !== null ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[11px] font-bold text-indigo-400">Linhas analisadas: {serverExplanations[selectedServerLine].range}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{serverExplanations[selectedServerLine].title}</span>
                    </div>
                    <pre className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-850 overflow-x-auto text-[11px] text-indigo-200 leading-relaxed scrollbar-thin">
                      <code>{serverExplanations[selectedServerLine].code}</code>
                    </pre>
                    <div className="text-xs text-slate-300 font-sans leading-relaxed bg-indigo-950/40 p-3 rounded-lg border border-indigo-900/30">
                      <p className="font-semibold text-white mb-1">O que isso faz?</p>
                      {serverExplanations[selectedServerLine].description}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-10 text-slate-400 gap-3 font-sans">
                    <Server className="w-10 h-10 text-indigo-500 opacity-60 animate-pulse" />
                    <p className="text-xs font-medium">Selecione uma seção de código à esquerda para analisar linha por linha nos bastidores do Node.js.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABA: FRONTEND (APP.TSX) */}
        {activeTab === "frontend" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 leading-snug">
              O frontend do nosso tutor interativo controla a experiência visual de chat, conversão instantânea de mídias e estilização de LaTeX:
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <div className="lg:col-span-2 flex flex-col gap-2">
                {frontendExplanations.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedFrontendLine(index)}
                    className={`p-3 text-left border rounded-xl transition-all ${
                      selectedFrondendLine === index
                        ? "border-indigo-500 bg-indigo-55/60 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-450 hover:bg-slate-50"
                    }`}
                    id={`front-line-btn-${index}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-indigo-600 font-mono">Processo</span>
                      <CheckCircle className={`w-3.5 h-3.5 text-emerald-500 transition-opacity ${selectedFrondendLine === index ? "opacity-100" : "opacity-0"}`} />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 block">{item.title}</span>
                  </button>
                ))}
              </div>

              <div className="lg:col-span-3 bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-850 font-mono text-xs overflow-auto flex flex-col justify-between min-h-[320px]">
                {selectedFrondendLine !== null ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[11px] font-bold text-indigo-400">Processo Ativo</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{frontendExplanations[selectedFrondendLine].title}</span>
                    </div>
                    <pre className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-850 overflow-x-auto text-[11px] text-indigo-200 leading-relaxed scrollbar-thin">
                      <code>{frontendExplanations[selectedFrondendLine].code}</code>
                    </pre>
                    <div className="text-xs text-slate-300 font-sans leading-relaxed bg-indigo-950/40 p-3 rounded-lg border border-indigo-900/30">
                      <p className="font-semibold text-white mb-1">Explicação Teórica:</p>
                      {frontendExplanations[selectedFrondendLine].description}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-10 text-slate-400 gap-3 font-sans">
                    <Code className="w-10 h-10 text-indigo-500 opacity-60 animate-pulse" />
                    <p className="text-xs font-medium">Selecione uma lógica do frontend à esquerda para ver a explicação técnica e as linhas de código relacionadas.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABA: COMO PUBLICAR */}
        {activeTab === "deploy" && (
          <div className="space-y-5 text-slate-700">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
              <Cloud className="w-5 h-5 text-indigo-600" />
              Guia Completo para Colocar o Site no Ar (Publicação)
            </h3>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-xs md:text-sm">Configuração da Chave Secreta</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Como a nossa aplicação é totalmente segura, ela necessita da variável <code className="bg-slate-150 px-1 rounded font-mono text-red-650 text-[10px]">GEMINI_API_KEY</code>. No painel de publicação (como Google Cloud Run, Vercel ou Render), crie uma variável de ambiente chamada <code className="bg-slate-150 px-1 rounded font-mono text-slate-800 text-[10px]">GEMINI_API_KEY</code> e cole a chave secreta que você obteve do Google AI Studio.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-xs md:text-sm">Passo de Empacotamento (Build)</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Execute o script de build configurado no nosso <code className="bg-slate-150 px-1 rounded font-mono text-slate-800 text-[10px]">package.json</code> rodando o comando <code className="bg-slate-150 px-1.5 py-0.5 rounded font-mono text-xs text-indigo-700">npm run build</code>. 
                    Ele faz duas ações automáticas em sequência:
                  </p>
                  <ul className="list-disc pl-5 mt-1 text-[11px] text-slate-500 space-y-1">
                    <li>Compila a aplicação React estaticamente otimizada para o diretório <code className="font-mono text-[10px]">/dist</code>.</li>
                    <li>Chama o <code className="font-mono text-[10px]">esbuild</code> para reunir todas as dependências e o código do Express em um único arquivo otimizado do backend chamado <code className="font-mono text-[10px]">dist/server.cjs</code>.</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-xs md:text-sm">Script de Inicialização Pública (Start)</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Por fim, a plataforma executa o script de inicialização do servidor de produção: <code className="bg-slate-150 px-1.5 py-0.5 rounded font-mono text-xs text-indigo-700">npm run start</code> (que executa internamente <code className="font-mono text-[11px] text-slate-800">node dist/server.cjs</code>). O servidor Express sobe ouvindo as requisições públicas na porta <code className="font-mono text-[11px] text-slate-800">3000</code>, servindo o React estático compilado e roteando as chamadas matemáticas socráticas de IA.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/50 p-4 border border-dashed border-slate-250 rounded-xl mt-4 flex items-start gap-3">
              <Cloud className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-800 text-xs leading-normal">Pronto para colocar as mãos na massa?</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                  Este site possui todos os comandos e dependências corretas pré-configuradas de fábrica. Do topo direito da tela ou nas opções integradas do editor do AI Studio de desenvolvimento, você pode exportar em zip ou sincronizar seu repositório do Github com o Google Cloud Run para torná-lo ativo mundialmente em 1-clique!
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
