import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  onPlaceholder?: string;
  isThinking?: boolean;
}

export function ChatInput({ onSend, disabled, onPlaceholder, isThinking = false }: ChatInputProps) {
  const { t } = useTranslation();
  const placeholder = onPlaceholder || t('app.inputPlaceholder');
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [input]);

  return (
    <div className="bg-transparent pt-1 mt-auto">
      <div className="relative flex items-end gap-1.5 bg-white rounded-neo p-1.5 shadow-neo-1 border-2 border-lnc-ink-black focus-within:shadow-neo-focus transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
             setInput(e.target.value);
             if (textareaRef.current) {
               textareaRef.current.style.height = 'auto';
               textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
             }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 resize-none text-xs max-h-[80px] py-2 px-3 text-lnc-ink-black placeholder-gray-400 font-medium"
          rows={1}
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || disabled}
          className={`
            p-2 rounded-lg transition-all flex-shrink-0 border-2 border-lnc-ink-black
            ${!input.trim() || disabled 
              ? 'text-gray-300 bg-gray-50 border-gray-200' 
              : 'bg-lnc-teal text-white shadow-neo-2 hover:shadow-neo-hover active:shadow-neo-pressed active:translate-x-[1px] active:translate-y-[1px]'
            }
          `}
        >
          {isThinking ? (
            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
