import { NeumCard, NeumButton } from '../components/ui'

function YouTubeMusicIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-16 h-16">
      <circle cx="12" cy="12" r="12" fill="#FF0000"/>
      <path d="M10 16.5V7.5l7 4.5-7 4.5Z" fill="#fff"/>
    </svg>
  )
}

export default function YouTubeScreen() {
  const openYTMusic = () => {
    window.location.href = 'https://music.youtube.com'
  }

  return (
    <div className="w-screen h-screen bg-neum-bg flex items-center justify-center p-8">
      <NeumCard className="flex flex-col items-center gap-6 p-10">
        <YouTubeMusicIcon />
        <p className="text-neum-text text-2xl font-medium">YouTube Music</p>
        <p className="text-neum-text-muted text-sm text-center">Al pulsar acceder&aacute;s a YouTube Music en pantalla completa</p>
        <NeumButton primary onClick={openYTMusic}>
          Abrir YouTube Music
        </NeumButton>
      </NeumCard>
    </div>
  )
}
