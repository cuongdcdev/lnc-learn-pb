import { useState, useEffect } from 'react';
import { ClayButton } from './ClayButton';
import { useTranslation } from '../contexts/LanguageContext';

import { twMerge } from 'tailwind-merge';
import { soundManager } from '../lib/sounds';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface QuizProps {
  questions: Question[];
  onComplete?: (score: number, total: number) => void;
}

export function Quiz({ questions, onComplete }: QuizProps) {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<Record<number, number>>({}); // questionIndex -> selectedOptionIndex

  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Sync sound settings
    chrome.storage.local.get('soundEffects', (data) => {
       const enabled = data.soundEffects !== undefined ? !!data.soundEffects : true;
       soundManager.init(enabled);
    });
  }, []);

  // Helper to safely access options, handling potential undefined/null
  const getOptions = (q: Question): string[] => Array.isArray(q.options) ? q.options : [];

  const handleSelect = (qIndex: number, optIndex: number) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
    soundManager.play('select');
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };
  
  const handleCheck = () => {
      setShowResults(true);
      const score = calculateScore();
      if (score === questions.length) {
          soundManager.play('complete');
      } else if (score > 0) {
          soundManager.play('success');
      } else {
          soundManager.play('error');
      }
      
      if (onComplete) {
          onComplete(score, questions.length);
      }
  };

  const answeredCount = Object.keys(answers).length;
  // Enable check if all questions are answered
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  const handleDownloadCSV = () => {
    // CSV Header
    const headers = ["questionname", "questiontext", "A", "B", "C", "D", "Answer 1"];
    
    // CSV Rows
    const rows = questions.map((q, idx) => {
      const options = getOptions(q);
      // Ensure we have exactly 4 options or fill with empty strings 
      const safeOptions = [...options, "", "", "", ""].slice(0, 4);
      
      const answerChar = String.fromCharCode(65 + q.correctIndex); // 0 -> A, 1 -> B, etc.
      
      // Escape generic quotes for CSV
      const escape = (str: string) => `"${str.replace(/"/g, '""')}"`;

      return [
        `Q${idx + 1}`,
        escape(q.question), 
        ...safeOptions.map(escape),
        answerChar
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n"); // Add BOM for Excel
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `quiz_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAnki = () => {
    // Anki CSV format: Front,Back
    // Front: Question + Options (HTML formatted for clarity)
    // Back: Answer + Explanation

    const rows = questions.map((q) => {
        const options = getOptions(q);
        const optionsHtml = options.map((opt, i) => {
            const label = String.fromCharCode(65 + i);
            return `<div><b>${label}.</b> ${opt}</div>`;
        }).join("");

        const front = `<h3>${q.question}</h3><br/>${optionsHtml}`;
        
        const answerLabel = String.fromCharCode(65 + q.correctIndex);
        const correctAnswerText = options[q.correctIndex] || "";
        const back = `<div><b>✅ ${answerLabel}</b> - ${correctAnswerText}</div><br/><i>${q.explanation || ""}</i>`;

        // Escape quotes by doubling them, wrap fields in quotes
        const escape = (str: string) => `"${str.replace(/"/g, '""')}"`;
        
        return `${escape(front)},${escape(back)}`;
    });

    const csvContent = "#html:true\n" + rows.join("\n"); // No header for basic Anki import usually, or just data
    // Anki handles UTF-8 well usually, BOM helps on Windows
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `lnc_anki_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-extrabold text-lg text-lnc-ink-black">{t('quiz.title')}</h3>
        <span className="text-xs font-mono text-lnc-ink-grey bg-gray-100 px-2 py-1 rounded-neo-sm border-2 border-lnc-ink-light">
          {answeredCount}/{questions.length} {t('quiz.answered')}
        </span>
      </div>

      {questions.map((q, qIdx) => {
        const selected = answers[qIdx];
        const isCorrect = selected === q.correctIndex;
        const options = getOptions(q);

        return (
          <div key={qIdx} className="neo-card p-4 mb-4 relative overflow-visible">
            {/* Question Header */}
            <div className="mb-4">
              <span className="text-[9px] font-extrabold text-lnc-ink-grey uppercase tracking-widest mb-1.5 inline-block bg-gray-100 px-2 py-0.5 rounded-neo-sm border-2 border-lnc-ink-light">{t('quiz.questionPrefix')} {qIdx + 1}</span>
              <p className="font-bold text-lnc-ink-black leading-snug text-sm">{q.question}</p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {options.map((opt: string, optIdx: number) => {
                let statusClass = "bg-white border-2 border-lnc-ink-light shadow-neo-2 hover:border-lnc-ink-black hover:shadow-neo-hover";
                let icon = null;

                if (showResults) {
                   if (optIdx === q.correctIndex) {
                     statusClass = "bg-green-100 border-2 border-lnc-ink-black text-green-900 shadow-neo-1";
                     icon = "✓";
                   } else if (answers[qIdx] === optIdx) {
                     statusClass = "bg-red-100 border-2 border-lnc-ink-black text-red-900 shadow-none opacity-80";
                     icon = "✕";
                   } else {
                     statusClass = "bg-gray-50 border-2 border-gray-200 text-gray-400 opacity-50 shadow-none";
                   }
                } else {
                   if (answers[qIdx] === optIdx) {
                     statusClass = "bg-lnc-teal text-white border-2 border-lnc-ink-black shadow-neo-1 font-bold transform translate-x-[2px] translate-y-[2px]";
                   }
                }

                return (
                  <div 
                    key={optIdx}
                    onClick={() => handleSelect(qIdx, optIdx)}
                    className={twMerge(
                      "group p-3 rounded-neo-sm cursor-pointer transition-all duration-100 text-xs flex justify-between items-center select-none",
                      statusClass
                    )}
                  >
                    <span className="flex-1 font-medium">{opt}</span>
                    {icon && <span className="ml-2 font-bold bg-white/20 px-1.5 rounded-full text-sm">{icon}</span>}
                    {!showResults && answers[qIdx] === optIdx && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white ml-2 animate-pulse shadow-sm"></span>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Explanation / Result Feedback */}
            {showResults && (
              <div className={twMerge(
                "mt-4 p-3 rounded-neo-sm text-sm transition-all duration-500 animate-in fade-in slide-in-from-top-2 border-2 border-lnc-ink-black shadow-neo-1",
                isCorrect ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"
              )}>
                <div className="font-bold mb-1 flex items-center gap-2">
                  {isCorrect ? (
                    <><span>🎉</span> <span>{t('quiz.correct')}</span></>
                  ) : (
                    <><span>🤔</span> <span>{t('quiz.incorrect')}</span></>
                  )}
                </div>
                {q.explanation && <p className="text-xs opacity-90 leading-relaxed">{q.explanation}</p>}
              </div>
            )}
          </div>
        );
      })}

      {/* Footer / Controls */}
      <div className="sticky bottom-0 bg-lnc-bg/95 backdrop-blur-sm px-3 py-2 -mx-4 border-t-2 border-lnc-ink-black flex justify-between items-center z-10 gap-2">
         <div className="flex items-center gap-2">
           {/* Download Options - Compact Icons */}
           <div className="flex items-center gap-1">
             <button 
                 onClick={handleDownloadCSV}
                 className="w-8 h-8 flex items-center justify-center bg-white border-2 border-lnc-ink-black rounded-neo-sm shadow-neo-2 hover:shadow-neo-hover active:shadow-neo-pressed active:translate-y-[2px] transition-all text-lnc-ink-black"
                 title={t('quiz.downloadCSV')}
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                 </svg>
             </button>
             <button 
                 onClick={handleDownloadAnki}
                 className="w-8 h-8 flex items-center justify-center bg-white border-2 border-lnc-ink-black rounded-neo-sm shadow-neo-2 hover:shadow-neo-hover active:shadow-neo-pressed active:translate-y-[2px] transition-all text-lnc-ink-black"
                 title={t('quiz.downloadAnki')}
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                 </svg>
             </button>
           </div>

           {/* Score Display (Compact) */}
           {showResults && (
             <span className="text-xs font-bold text-lnc-ink-grey ml-2 animate-in fade-in border-l-2 border-lnc-ink-light pl-2 h-6 flex items-center">
               {t('quiz.score')}:&nbsp;
               <span className={
                  calculateScore() === questions.length ? "text-green-600 font-extrabold" : "text-lnc-ink-black font-extrabold"
               }>{calculateScore()}</span>/{questions.length}
             </span>
           )}
         </div>

          <div className="flex gap-2">
            {!showResults ? (
                <ClayButton 
                onClick={handleCheck} 
                disabled={!allAnswered}
                className={twMerge(
                    "px-4 py-1.5 text-xs font-extrabold shadow-neo-1 hover:shadow-neo-hover active:shadow-neo-pressed active:translate-y-[2px] transition-all border-2 border-lnc-ink-black rounded-neo-sm",
                    !allAnswered ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-500 shadow-none border-gray-300" : "bg-lnc-teal text-white"
                )}
                >
                {t('quiz.checkAnswers')}
                </ClayButton>
            ) : (
                <button 
                    onClick={() => {
                    setShowResults(false);
                    setAnswers({});
                    }} 
                    className="px-4 py-1.5 text-xs font-bold bg-white text-lnc-ink-black border-2 border-lnc-ink-black rounded-neo-sm shadow-neo-2 hover:shadow-neo-hover active:shadow-neo-pressed active:translate-y-[2px] transition-all"
                >
                    {t('quiz.resetQuiz')}
                </button>
            )}
          </div>
      </div>
    </div>
  );
}
