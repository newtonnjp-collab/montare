import React from "react";
import { PresetProblem } from "../types";
import { HelpCircle, Sigma, BarChart2, Award } from "lucide-react";

interface PresetProblemsProps {
  onSelect: (problem: PresetProblem) => void;
}

const SAMPLE_PROBLEMS: PresetProblem[] = [
  {
    id: "quad-1",
    title: "Equação de Segundo Grau",
    category: "Álgebra",
    text: "Quero resolver a equação quadrática x^2 - 5x + 6 = 0 passo a passo.",
    latex: "x^2 - 5x + 6 = 0",
    difficulty: "Fácil",
    hint: "Útil para treinar fatoração ou fórmula de Bhaskara socraticamente.",
  },
  {
    id: "deriv-1",
    title: "Regra da Cadeia no Cálculo",
    category: "Cálculo",
    text: "Encontre a derivada da função f(x) = sen(x^2) usando a regra da cadeia de forma passo a passo.",
    latex: "f(x) = \\sin(x^2)",
    difficulty: "Médio",
    hint: "Excelente para entender funções compostas e derivadas parciais.",
  },
  {
    id: "integ-1",
    title: "Integral por Substituição",
    category: "Cálculo",
    text: "Resolva a integral indefinida de x * e^(x^2) dx passo a passo.",
    latex: "\\int x \\cdot e^{x^2} \\, dx",
    difficulty: "Difícil",
    hint: "Treina a escolha da variável u e seu diferencial du.",
  },
  {
    id: "lim-1",
    title: "Limite Fundamental Trigonométrico",
    category: "Cálculo",
    text: "Preciso provar por que o limite de sen(x)/x quando x tende a 0 é igual a 1, usando o Teorema do Confronto socraticamente.",
    latex: "\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1",
    difficulty: "Desafiador",
    hint: "Desafio clássico que envolve raciocínio geométrico profundo e simplificação.",
  }
];

export const PresetProblems: React.FC<PresetProblemsProps> = ({ onSelect }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <HelpCircle className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-slate-800 text-sm md:text-base">
          Escolha um Exercício de Demonstração
        </h3>
      </div>
      
      <p className="text-xs text-slate-500 leading-snug">
        Não tem uma imagem matemática à mão? Selecione uma das questões interativas abaixo para ver como o Tutor Socrático orienta você passo a passo:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
        {SAMPLE_PROBLEMS.map((prob) => {
          // Determina a cor do badge de dificuldade
          const difficultyColors = {
            "Fácil": "bg-emerald-50 text-emerald-700 border-emerald-100",
            "Médio": "bg-amber-50 text-amber-700 border-amber-100",
            "Difícil": "bg-orange-50 text-orange-700 border-orange-100",
            "Desafiador": "bg-rose-50 text-rose-700 border-rose-100",
          };

          return (
            <button
              key={prob.id}
              onClick={() => onSelect(prob)}
              className="flex flex-col text-left p-3.5 bg-white border border-slate-250 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all active:scale-[0.99] outline-none group relative overflow-hidden"
              id={`preset-btn-${prob.id}`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/20 rounded-full blur-xl group-hover:scale-150 transition-transform" />
              
              <div className="flex items-center justify-between w-full mb-1 border-b border-slate-50 pb-1.5 z-10">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Sigma className="w-3 h-3 text-indigo-400" />
                  {prob.category}
                </span>

                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${difficultyColors[prob.difficulty]}`}>
                  {prob.difficulty}
                </span>
              </div>

              <h4 className="font-semibold text-slate-800 text-sm leading-tight mb-2 group-hover:text-indigo-600 transition-colors z-10">
                {prob.title}
              </h4>

              {prob.latex && (
                <div className="font-serif italic text-xs bg-slate-50/80 text-indigo-700 border border-indigo-100/30 px-2 py-1 rounded w-full text-center mb-2 font-medium z-10">
                  {prob.latex.replace(/\\\\/g, "\\")}
                </div>
              )}

              <p className="text-[11px] text-slate-500 line-clamp-2 md:line-clamp-3 leading-snug flex-1 border-tl border-slate-100 pt-1.5 z-10 font-sans">
                {prob.hint}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
