import React from 'react';
import { Volume2 } from 'lucide-react';

interface TextToSpeechButtonProps {
  text: string;
  lang?: string;
  className?: string;
}

const TextToSpeechButton: React.FC<TextToSpeechButtonProps> = ({ text, lang = 'en', className }) => {
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in this browser.');
    }
  };

  return (
    <button
      type="button"
      aria-label="Read aloud"
      onClick={handleSpeak}
      className={className || 'p-2 rounded-full hover:bg-accent'}
    >
      <Volume2 className="w-5 h-5" />
    </button>
  );
};

export default TextToSpeechButton;
