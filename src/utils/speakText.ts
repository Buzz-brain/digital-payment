export function speakText(text: string, lang: string = 'en') {
  if ('speechSynthesis' in window) {
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  }
}
