export function speak(text) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve()
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'es-ES'
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()

    const speak = () => {
      const voices = window.speechSynthesis.getVoices()
      const spanishVoice = voices.find((v) => v.lang.startsWith('es'))
      if (spanishVoice) utterance.voice = spanishVoice
      window.speechSynthesis.speak(utterance)
    }

    if (window.speechSynthesis.getVoices().length > 0) {
      speak()
    } else {
      window.speechSynthesis.onvoiceschanged = speak
    }
  })
}
