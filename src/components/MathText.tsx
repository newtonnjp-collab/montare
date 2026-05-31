import React from "react";

interface MathTextProps {
  text: string;
}

/**
 * Filtra e embeleza a notação LaTeX bruta em símbolos matemáticos legíveis
 * para exibição sem bibliotecas externas pesadas e propensas a erros de compilação.
 */
function cleanMathSymbols(latex: string): string {
  return latex
    .replace(/\\int/g, "∫")
    .replace(/\\approx/g, "≈")
    .replace(/\\infty/g, "∞")
    .replace(/\\pi/g, "π")
    .replace(/\\partial/g, "∂")
    .replace(/\\sum/g, "∑")
    .replace(/\\Delta/g, "Δ")
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\theta/g, "θ")
    .replace(/\\lambda/g, "λ")
    .replace(/\\sigma/g, "σ")
    .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1 / $2)")
    .replace(/\^\{([^}]+)\}/g, "<sup>$1</sup>")
    .replace(/\^([0-9a-zA-Z+-]+)/g, "<sup>$1</sup>")
    .replace(/_\{([^}]+)\}/g, "<sub>$1</sub>")
    .replace(/_([0-9a-zA-Z])/g, "<sub>$1</sub>")
    .replace(/\\to/g, " → ")
    .replace(/\\cdot/g, " · ")
    .replace(/\\le/g, " ≤ ")
    .replace(/\\ge/g, " ≥ ")
    .replace(/\\ne/g, " ≠ ")
    .replace(/\\pm/g, " ± ")
    .replace(/\\times/g, " × ")
    .replace(/\\div/g, " ÷ ")
    .replace(/\\limits/g, "")
    .replace(/\\,/g, " ")
    .replace(/\\;/g, "  ")
    .replace(/\\quad/g, "    ")
    .replace(/\\qquad/g, "      ")
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\sin/g, "sen")
    .replace(/\\cos/g, "cos")
    .replace(/\\tan/g, "tan")
    .replace(/\\ln/g, "ln")
    .replace(/\\log/g, "log")
    .replace(/\\ differential/g, "d")
    .replace(/\\dx/g, "dx")
    .replace(/\\dy/g, "dy")
    .replace(/\\,/g, "");
}

/**
 * Renderiza textos mistos (texto normal, negrito, listas) com suporte a tags HTML seguras (.e.g sub e sup)
 */
const FormattedSubText: React.FC<{ rawText: string }> = ({ rawText }) => {
  // Parse bolding (**text**)
  const boldParts = rawText.split("**");
  
  return (
    <span>
      {boldParts.map((part, index) => {
        const isBold = index % 2 === 1;
        
        // Verifica se há tags HTML básicas que geramos, como sup e sub
        const hasTags = /<sup|<sub/.test(part);

        if (isBold) {
          if (hasTags) {
            return (
              <strong 
                key={index} 
                className="font-bold text-slate-800"
                dangerouslySetInnerHTML={{ __html: cleanMathSymbols(part) }} 
              />
            );
          }
          return <strong key={index} className="font-bold text-slate-900">{part}</strong>;
        } else {
          if (hasTags) {
            return (
              <span 
                key={index} 
                dangerouslySetInnerHTML={{ __html: cleanMathSymbols(part) }} 
              />
            );
          }
          return <span key={index}>{part}</span>;
        }
      })}
    </span>
  );
};

export const MathText: React.FC<MathTextProps> = ({ text }) => {
  if (!text) return null;

  // 1. Dividir em blocos de equações grandes (separados por $$)
  const blockParts = text.split("$$");

  return (
    <div className="space-y-3 text-slate-700 leading-relaxed text-sm md:text-base">
      {blockParts.map((block, blockIdx) => {
        const isBlockMath = blockIdx % 2 === 1;

        if (isBlockMath) {
          // Renderização de Equações em Bloco grandes (LaTeX centralizado)
          const formattedSymbols = cleanMathSymbols(block.trim());
          return (
            <div 
              key={blockIdx} 
              className="my-4 py-4 px-6 bg-slate-50 border-y border-slate-100 rounded-xl text-center font-serif text-lg md:text-xl text-indigo-700 overflow-x-auto shadow-sm select-all scrollbar-thin"
              dangerouslySetInnerHTML={{ __html: formattedSymbols }}
            />
          );
        } else {
          // Renderização de textos normais (que podem conter equações em linha $)
          const inlineParts = block.split("$");

          return (
            <div key={blockIdx} className="space-y-2">
              {inlineParts.map((inlineBlock, inlineIdx) => {
                const isInlineMath = inlineIdx % 2 === 1;

                if (isInlineMath) {
                  // Renderização de Fórmulas Matemáticas leves em linha $...$
                  const cleanedInline = cleanMathSymbols(inlineBlock.trim());
                  return (
                    <span 
                      key={inlineIdx} 
                      className="inline-block font-serif italic text-indigo-600 bg-indigo-50/55 px-1.5 py-0.5 rounded border border-indigo-100/50 mx-1 select-all"
                      dangerouslySetInnerHTML={{ __html: cleanedInline }}
                    />
                  );
                } else {
                  // Linhas normais (processa listas e parágrafos)
                  const lines = inlineBlock.split("\n");
                  
                  return (
                    <div key={inlineIdx} className="space-y-1.5">
                      {lines.map((line, lineIdx) => {
                        const trimmedLine = line.trim();
                        if (trimmedLine === "") return null;

                        // Verifica se é um item de lista não ordenada (- ou *)
                        const isListItem = trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ");
                        // Verifica se é uma lista nomeada (1., 2. etc.)
                        const isNumberedItem = /^\d+\.\s/.test(trimmedLine);

                        if (isListItem) {
                          const itemText = trimmedLine.substring(2);
                          return (
                            <ul key={lineIdx} className="list-disc pl-5 space-y-1 my-1">
                              <li className="text-slate-700 pl-1">
                                <FormattedSubText rawText={itemText} />
                              </li>
                            </ul>
                          );
                        } else if (isNumberedItem) {
                          const matchNum = trimmedLine.match(/^(\d+\.)\s(.*)/);
                          if (matchNum) {
                            return (
                              <div key={lineIdx} className="flex items-start gap-2 pl-2 my-1.5">
                                <span className="font-bold text-indigo-600 mr-1">{matchNum[1]}</span>
                                <span className="text-slate-700 flex-1">
                                  <FormattedSubText rawText={matchNum[2]} />
                                </span>
                              </div>
                            );
                          }
                        }

                        // Parágrafo comun
                        return (
                          <p key={lineIdx} className="text-slate-700 text-justify md:text-[15px]">
                            <FormattedSubText rawText={line} />
                          </p>
                        );
                      })}
                    </div>
                  );
                }
              })}
            </div>
          );
        }
      })}
    </div>
  );
};
