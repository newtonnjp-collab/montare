import React, { useState, useRef, useEffect } from "react";
import { 
  GraduationCap, 
  Sparkles, 
  Image as ImageIcon, 
  UploadCloud, 
  RotateCcw, 
  ArrowRight, 
  HelpCircle, 
  AlertCircle, 
  BookOpen, 
  Send,
  FileCode2,
  Trash2,
  CheckCircle2,
  ChevronRight,
  Info
} from "lucide-react";
import { Message, PresetProblem } from "./types";
import { MathText } from "./components/MathText";
import { PresetProblems } from "./components/PresetProblems";
import { CodeWalkthrough } from "./components/CodeWalkthrough";

export default function App() {
  const [activeTab, setActiveTab] = useState<"study" | "guide">("study");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [uploadedImage, setUploadedImage] = useState<{
    data: string;
    mimeType: string;
    previewUrl: string;
  } | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiError, setApiError] = useState<{ code: string; message: string; details?: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rolagem suave automática para a mensagem mais recente
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAnalyzing]);

  // Handler para processamento de arquivo de imagem carregado de forma local
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor, envie apenas arquivos de imagem (PNG, JPEG, GIF).");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Data = reader.result as string;
      // Captura apenas a string codificada Base64 retirando o cabeçalho "data:image/...;base64,"
      const cleanBase64 = base64Data.split(",")[1];
      
      setUploadedImage({
        data: cleanBase64,
        mimeType: file.type,
        previewUrl: base64Data
      });
      setApiError(null);
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Drag e drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Carregar um problema pré-definido (Preset)
  const handleSelectPreset = (problem: PresetProblem) => {
    setMessages([]);
    setInputText("");
    setUploadedImage(null);
    setApiError(null);
    
    // Dispara a pergunta inicial do problema de forma autônoma
    sendChatMessage(problem.text, null);
  };

  // Iniciar uma nova conversa limpando o estado atual
  const handleResetSession = () => {
    if (window.confirm("Deseja iniciar um novo exercício? Toda a conversa atual será limpa.")) {
      setMessages([]);
      setInputText("");
      setUploadedImage(null);
      setApiError(null);
    }
  };

  // Remover foto ativa anexada antes de enviar
  const handleRemoveAttachedImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Disparar uma mensagem ou comando rápido socrático predefinido
  const triggerShortcutQuery = (queryText: string) => {
    if (isAnalyzing) return;
    sendChatMessage(queryText, null);
  };

  // Função central para comunicação HTTP com o backend Express
  const sendChatMessage = async (textToSend: string, imageToSend: typeof uploadedImage) => {
    const timestamp = new Date().toISOString();
    const cleanText = textToSend.trim();

    if (!cleanText && !imageToSend) {
      return;
    }

    // Cria a mensagem do estudante localmente no chat
    const userMsgId = `student-${Date.now()}`;
    const newStudentMessage: Message = {
      id: userMsgId,
      role: "user",
      text: cleanText,
      image: imageToSend ? { data: imageToSend.data, mimeType: imageToSend.mimeType } : undefined,
      timestamp: timestamp
    };

    // Atualiza mensagens na tela e limpa os inputs do formulário de rascunho
    const updatedHistory = [...messages, newStudentMessage];
    setMessages(updatedHistory);
    setInputText("");
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setIsAnalyzing(true);
    setApiError(null);

    try {
      // Cria a requisição HTTP POST para o nosso servidor Express
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history: messages, // envia o log de mensagens anteriores para alimentar o contexto do Gemini
          message: cleanText,
          image: imageToSend ? { data: imageToSend.data, mimeType: imageToSend.mimeType } : null
        })
      });

      const data = await res.json();

      if (!res.ok) {
        // Se houver falha (como a falta da api key), captura o código de erro detalhado
        setApiError({
          code: data.error || "SERVER_ERROR",
          message: data.message || "Erro inesperado do servidor. Tente novamente.",
          details: data.details
        });
        setIsAnalyzing(false);
        return;
      }

      // Adiciona a resposta de herança socrática do tutor de IA na tela
      const tutorMessage: Message = {
        id: `tutor-${Date.now()}`,
        role: "tutor",
        text: data.text,
        timestamp: data.timestamp || new Date().toISOString()
      };

      setMessages(prev => [...prev, tutorMessage]);

    } catch (err: any) {
      console.error(err);
      setApiError({
        code: "CONNECTION_FAILED",
        message: "Não foi possível se comunicar com o servidor do tutor socrático. Verifique se o servidor Express está inicializado.",
        details: err.message || err.toString()
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnalyzing) return;
    sendChatMessage(inputText, uploadedImage);
  };

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col font-sans text-slate-800" id="socratic-tutor-root">
      
      {/* BARRA DE NAVEGAÇÃO SUPERIOR (HEADER) */}
      <header className="bg-white border-b border-slate-205 py-4 px-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md shadow-indigo-100 animate-pulse-slow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-slate-900 tracking-tight text-lg">
                  Tutor Matemático Socrático
                </h1>
                <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Método Ativo
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-none mt-1">
                Aprenda álgebra e cálculo pensando, guiado por uma IA paciente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("study")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold rounded-xl outline-none transition-all ${
                activeTab === "study"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-250 hover:bg-slate-50"
              }`}
              id="header-nav-study"
            >
              <GraduationCap className="w-4 h-4" />
              Estudo Interativo
            </button>

            <button
              onClick={() => setActiveTab("guide")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold rounded-xl outline-none transition-all ${
                activeTab === "guide"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-250 hover:bg-slate-50"
              }`}
              id="header-nav-guide"
            >
              <FileCode2 className="w-4 h-4" />
              Guia de Código e Publicação
            </button>
          </div>

        </div>
      </header>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col justify-between">
        
        {/* VIEW 1: ESTUDO INTERATIVO (CHAT SOCRÁTICO) */}
        {activeTab === "study" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
            
            {/* PAINEL ESQUERDO: ENVIO DE PROBLEMA & PRESETS */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* CARTÃO DE ENVIAR FOTO OU PROBLEMA */}
              <div className="bg-white border border-slate-205 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <h2 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-indigo-600" />
                    Enviar Problema Matemático
                  </h2>
                  
                  {messages.length > 0 && (
                    <button
                      onClick={handleResetSession}
                      className="text-xs text-rose-600 font-medium hover:text-rose-800 flex items-center gap-1 outline-none px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Reiniciar Sessão de Chat"
                      id="reset-session-btn"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Limpar Chat
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Tire uma foto de uma equação complexa do seu caderno de exercícios ou selecione qualquer problema abaixo para debater socraticamente com o tutor.
                </p>

                {/* ZONA DE ARRASTAR E SOLTAR IMAGEM */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    dragActive
                      ? "border-indigo-500 bg-indigo-50/30"
                      : "border-slate-250 bg-slate-50/50 hover:border-indigo-400 hover:bg-indigo-50/10"
                  }`}
                  id="drag-drop-zone"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {uploadedImage ? (
                    <div className="space-y-3 w-full" onClick={(e) => e.stopPropagation()}>
                      <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm flex items-center justify-center">
                        <img
                          src={uploadedImage.previewUrl}
                          alt="Matemática anexada"
                          className="max-w-full max-h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          onClick={handleRemoveAttachedImage}
                          className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow-md z-10 transition-colors outline-none"
                          title="Remover Imagem"
                          id="btn-remove-pasted-img"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-xs font-semibold text-slate-700 truncate max-w-[200px] mx-auto">
                        Imagem anexa de exercícios ready!
                      </div>
                      <p className="text-[10px] text-indigo-600 font-sans leading-none">
                        Clique em Enviar abaixo para começar o debate socrático!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-indigo-100/60 text-indigo-700 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto shadow-sm">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-semibold text-slate-800">
                        Arraste ou clique para carregar a foto do caderno
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Suporta formatos PNG, Jpeg, JPG e WebP.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* OUTRA OPÇÃO: SELETOR DE PRESETS / DEMONSTRAÇÕES */}
              <div className="bg-white border border-slate-205 rounded-2xl p-5 shadow-sm flex-1">
                <PresetProblems onSelect={handleSelectPreset} />
              </div>

            </div>

            {/* PAINEL DIREITO: TELA DE CHAT SOCRÁTICO */}
            <div className="lg:col-span-7 flex flex-col bg-white border border-slate-205 rounded-2xl overflow-hidden shadow-sm min-h-[500px]">
              
              {/* Barra de Status do Tutor */}
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 px-5 py-4 border-b border-indigo-100/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 text-white p-2 rounded-lg text-xs font-bold flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block leading-none">Tutor Conectado</span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1 flex items-center gap-1.5 leading-none">
                      Professor Socrático de IA
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-medium bg-white/85 border border-indigo-150 px-3 py-1.5 rounded-xl shadow-xs">
                  <Info className="w-3.5 h-3.5" />
                  <span>Método Heurístico</span>
                </div>
              </div>

              {/* Mensagem de Erro API (por exemplo, falta de chave no AI Studio) */}
              {apiError && (
                <div className="bg-rose-50 border-b border-rose-100 p-4 shrink-0 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <h4 className="font-bold text-rose-900">Configuração Requerida</h4>
                    <p className="text-rose-700 leading-relaxed mt-1">{apiError.message}</p>
                    
                    {apiError.code === "API_KEY_MISSING" && (
                      <div className="mt-3 bg-white/80 p-3 rounded-lg border border-rose-100 flex flex-col gap-2">
                        <p className="font-medium text-slate-800">Como resolver no AI Studio Build?</p>
                        <ol className="list-decimal pl-4 text-slate-650 space-y-1.5">
                          <li>Vá até o painel de <strong>Secrets (Símbolo de Chave 🗝️)</strong> no topo esquerdo do painel do AI Studio.</li>
                          <li>Adicione um novo segredo com o nome exato de <code className="font-mono text-red-600 bg-slate-100 px-1 rounded">GEMINI_API_KEY</code>.</li>
                          <li>Preencha a sua API Key obtida no Google AI Studio (disponível gratuitamente) e salve!</li>
                          <li>Pronto! A alteração se propagará em tempo de execução sem requisições adicionais.</li>
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Zona de Mensagens de Chat */}
              <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-stone-50/30 scrollbar-thin">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4 py-8">
                    <div className="bg-indigo-50 p-4 rounded-full text-indigo-600 animate-bounce-slow">
                      <GraduationCap className="w-10 h-10" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-slate-800 text-sm md:text-base">Nenhum cálculo ativado por enquanto</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Escolha um cálculo de demonstração à esquerda ou carregue uma imagem para começarmos! O tutor irá ler seu cálculo sem revelar a resposta final e guiará seu raciocínio.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {messages.map((msg) => {
                      const isTutor = msg.role === "tutor";
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3 max-w-[85%] md:max-w-[80%] ${
                            isTutor ? "mr-auto" : "ml-auto flex-row-reverse"
                          }`}
                        >
                          {/* Avatar do Emissor */}
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs shrink-0 select-none ${
                              isTutor
                                ? "bg-indigo-600 text-white"
                                : "bg-emerald-600 text-white"
                            }`}
                          >
                            {isTutor ? (
                              <Sparkles className="w-4 h-4" />
                            ) : (
                              <GraduationCap className="w-4 h-4" />
                            )}
                          </div>

                          {/* Caixa de Texto da Mensagem */}
                          <div className="space-y-2">
                            <div
                              className={`p-4 rounded-2xl text-justify shadow-xs ${
                                isTutor
                                  ? "bg-white text-slate-800 border border-slate-205 rounded-tl-none"
                                  : "bg-indigo-600 text-white rounded-tr-none"
                              }`}
                            >
                              {/* Se a mensagem do usuário continha imagem no histórico */}
                              {msg.image && msg.image.data && (
                                <div className="mb-3 max-w-[150px] rounded-lg overflow-hidden border border-white/20 bg-black/5">
                                  <img
                                    src={`data:${msg.image.mimeType || "image/jpeg"};base64,${msg.image.data}`}
                                    alt="Exercício consultado"
                                    className="w-full object-contain max-h-36"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              )}

                              {isTutor ? (
                                <MathText text={msg.text} />
                              ) : (
                                <p className="text-xs md:text-sm font-medium leading-relaxed whitespace-pre-wrap select-text">
                                  {msg.text}
                                </p>
                              )}
                            </div>
                            
                            <span className={`text-[9px] text-slate-400 block ${isTutor ? "text-left pl-1" : "text-right pr-1"}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Loader de Resposta / Professor pensando */}
                    {isAnalyzing && (
                      <div className="flex gap-3 max-w-[85%] mr-auto items-start">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center animate-spin-slow shadow-xs shrink-0 select-none">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="bg-white text-slate-700 border border-slate-205 p-4 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-3">
                          <div className="flex gap-1.5">
                            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                          <span className="text-xs font-semibold text-slate-500 font-sans">
                            Professor está analisando o cálculo...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Botões Rápidos/Socráticos de Atalho */}
              {messages.length > 0 && !isAnalyzing && (
                <div className="bg-slate-50/50 px-4 py-3 border-t border-slate-205 flex flex-wrap gap-2 justify-center shrink-0">
                  <button
                    onClick={() => triggerShortcutQuery("💡 Por que fizemos esse passo exatamente? Pode me explicar a lógica conceitual por trás dele?")}
                    className="bg-white border border-slate-250 hover:border-indigo-400 text-[11px] font-semibold text-slate-700 px-3 py-1.5 rounded-lg shadow-2xs hover:shadow-sm active:scale-95 transition-all outline-none"
                    id="shortcut-why"
                  >
                    💡 Por que fizemos isso?
                  </button>

                  <button
                    onClick={() => triggerShortcutQuery("🔍 Entendi! Qual é o próximo passo a tomar a partir daqui?")}
                    className="bg-white border border-slate-250 hover:border-indigo-400 text-[11px] font-semibold text-slate-700 px-3 py-1.5 rounded-lg shadow-2xs hover:shadow-sm active:scale-95 transition-all outline-none"
                    id="shortcut-next"
                  >
                    🔍 Qual é o próximo passo?
                  </button>

                  <button
                    onClick={() => triggerShortcutQuery("✏️ Fiquei um pouco confuso com o último termo que você usou. Pode reexplicar de forma mais simples?")}
                    className="bg-white border border-slate-250 hover:border-indigo-400 text-[11px] font-semibold text-slate-700 px-3 py-1.5 rounded-lg shadow-2xs hover:shadow-sm active:scale-95 transition-all outline-none"
                    id="shortcut-confused"
                  >
                    ✏️ Não entendi essa terminologia...
                  </button>
                </div>
              )}

              {/* Formulário de Envio de Mensagem do Aluno */}
              <div className="p-4 border-t border-slate-205 shrink-0 bg-white">
                <form onSubmit={handleSubmitMessage} className="flex gap-2.5 items-center">
                  
                  {/* Visualizador Flutuante de Imagem Pendente de Envio (se o aluno anexou) */}
                  {uploadedImage && (
                    <div className="absolute bottom-20 left-6 bg-white border border-slate-255 p-2 rounded-xl flex items-center gap-2.5 shadow-lg max-w-sm">
                      <img
                        src={uploadedImage.previewUrl}
                        alt="Preview para enviar"
                        className="w-10 h-10 rounded object-cover border border-slate-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-left text-[10px]">
                        <p className="font-bold text-slate-800">Foto matemático anexa</p>
                        <p className="text-slate-400 truncate w-32">Será enviada agora</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveAttachedImage}
                        className="text-rose-600 hover:text-rose-800 p-1 rounded-full hover:bg-slate-50"
                        id="btn-remove-attachment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      isAnalyzing 
                        ? "Aguarde o professor finalizar a análise..."
                        : uploadedImage 
                          ? "Descreva seu progresso ou adicione texto sobre sua foto..." 
                          : "Digite sua dúvida, responda ao tutor ou cole uma equação..."
                    }
                    className="flex-1 border border-slate-250 bg-slate-50/50 rounded-xl px-4 py-3 text-xs md:text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-150 outline-none transition-all pr-12 text-slate-850"
                    disabled={isAnalyzing}
                    id="student-prompt-input"
                  />

                  <button
                    type="submit"
                    disabled={isAnalyzing || (!inputText.trim() && !uploadedImage)}
                    className={`p-3 rounded-xl shadow-xs transition-all active:scale-[0.98] outline-none flex items-center justify-center ${
                      isAnalyzing || (!inputText.trim() && !uploadedImage)
                        ? "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-150 border border-indigo-700"
                    }`}
                    title="Enviar Mensagem"
                    id="submit-message-btn"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

            </div>

          </div>
        )}

        {/* VIEW 2: GUIA DE CÓDIGO E PUBLICAÇÃO (EDUCATIONAL WALKTHROUGH) */}
        {activeTab === "guide" && (
          <div className="flex-1 flex flex-col justify-center py-2">
            <CodeWalkthrough />
          </div>
        )}

      </main>

      {/* RODAPÉ DO SISTEMA (FOOTER) */}
      <footer className="bg-white border-t border-slate-205 py-4 px-6 mt-8 shadow-2xs shrink-0 text-center text-[11px] text-slate-400 font-sans flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl w-full mx-auto">
        <p>
          © 2026 Tutor Socrático de Matemática AI. Produzido com o framework pleno React e Google Gemini 3.5.
        </p>
        <p className="font-mono text-[9px] uppercase tracking-wider text-slate-300">
          Chassis Full-Stack • Cloud Deploy ready
        </p>
      </footer>

    </div>
  );
}
