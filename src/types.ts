export interface Message {
  id: string;
  role: "user" | "tutor";
  text: string;
  image?: {
    data: string; // Base64 do arquivo
    mimeType: string;
  };
  timestamp: string;
}

export interface PresetProblem {
  id: string;
  title: string;
  category: "Cálculo" | "Álgebra" | "Geometria";
  text: string;
  latex?: string;
  difficulty: "Fácil" | "Médio" | "Difícil" | "Desafiador";
  hint: string;
}
