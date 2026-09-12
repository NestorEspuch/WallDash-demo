import { useState, useEffect } from 'react'
import { supabase, getTabletPin, updateTabletPin } from '../services/supabase'
import { useProfiles } from '../contexts/ProfileContext'
import ColorPicker from '../components/ColorPicker'
import MenstruationReport from '../components/MenstruationReport'

export default function ProfileSettings({ user, onLogout }) {
  const { profiles } = useProfiles()
  const [profile, setProfile] = useState(null)
  const [username, setUsername] = useState('')
  const [color, setColor] = useState('morado')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [familiar, setFamiliar] = useState(null)
  const [familiarColor, setFamiliarColor] = useState('morado')
  const [familiarSaving, setFamiliarSaving] = useState(false)
  const [familiarSaved, setFamiliarSaved] = useState(false)

  const [showPinModal, setShowPinModal] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinSaving, setPinSaving] = useState(false)
  const [pinMessage, setPinMessage] = useState('')

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile(data)
          setUsername(data.username || '')
          setColor(data.color || 'morado')
        }
      })
    getTabletPin().then(setCurrentPin)
  }, [user])

  useEffect(() => {
    if (profiles.length === 0) return
    const fam = profiles.find((p) => p.is_familiar)
    if (fam) {
      setFamiliar(fam)
      setFamiliarColor(fam.color || 'morado')
    }
  }, [profiles])

  const handleSaveProfile = async () => {
    setSaving(true)
    setSaved(false)
    await supabase
      .from('profiles')
      .update({ username: username.trim(), color })
      .eq('id', user.id)
    setSaving(false)
    setSaved(true)
  }

  const handleSaveFamiliar = async () => {
    if (!familiar) return
    setFamiliarSaving(true)
    setFamiliarSaved(false)
    await supabase
      .from('profiles')
      .update({ color: familiarColor })
      .eq('id', familiar.id)
    setFamiliarSaving(false)
    setFamiliarSaved(true)
  }

  const handlePinSubmit = async (e) => {
    e.preventDefault()
    setPinMessage('')

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinMessage('El PIN debe tener 4 dígitos.')
      return
    }

    if (newPin !== confirmPin) {
      setPinMessage('Los PIN nuevos no coinciden.')
      return
    }

    setPinSaving(true)
    const { error } = await updateTabletPin(newPin)
    setPinSaving(false)

    if (error) {
      setPinMessage('Error al guardar. Inténtalo de nuevo.')
      return
    }

    setCurrentPin(newPin)
    setNewPin('')
    setConfirmPin('')
    setPinMessage('PIN actualizado correctamente ✓')
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-neum-text">Mi perfil</h2>

        <div>
          <label className="text-neum-text-muted text-xs">Email</label>
          <p className="text-neum-text mt-1">{user?.email}</p>
        </div>

        <div>
          <label className="text-neum-text-muted text-xs">Nombre de usuario</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-neum-sm bg-neum-surface shadow-neum-inset-sm
              px-4 py-3 text-neum-text placeholder-neum-text-muted mt-1
              focus:outline-none focus:ring-2 focus:ring-neum-primary-light transition-shadow"
          />
        </div>

        <div>
          <label className="text-neum-text-muted text-xs block mb-2">Mi color</label>
          <ColorPicker value={color} onChange={setColor} disabledColors={['rojo']} />
          <div className="flex items-center gap-2 mt-3">
            <span className="w-6 h-6 rounded-full" style={{ backgroundColor: `var(--ev-${color})` }} />
            <span className="text-neum-text-muted text-sm capitalize">{color}</span>
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="w-full rounded-neum-sm bg-neum-surface shadow-neum-sm
            active:shadow-neum-inset-sm active:translate-y-px transition-[box-shadow,transform] duration-150
            text-neum-primary px-8 py-4 text-lg font-medium disabled:opacity-50
            flex items-center justify-center gap-2"
        >
          {saving && <div className="w-5 h-5 rounded-full border-[3px] border-current border-t-transparent animate-spin" />}
          {saving ? 'Guardando...' : saved ? 'Guardado ✓' : 'Guardar perfil'}
        </button>
      </div>

      <hr className="border-neum-text-muted/20" />

      <div className="flex flex-col gap-6">
        <h3 className="text-lg font-bold text-neum-text">Color Familiar</h3>
        <p className="text-neum-text-muted text-sm">
          Este color se usa para los eventos asignados a "Familiar" (todos).
        </p>

        <ColorPicker value={familiarColor} onChange={setFamiliarColor} disabledColors={['rojo']} />
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full" style={{ backgroundColor: `var(--ev-${familiarColor})` }} />
          <span className="text-neum-text-muted text-sm capitalize">{familiarColor}</span>
        </div>

        <button
          onClick={handleSaveFamiliar}
          disabled={familiarSaving}
          className="w-full rounded-neum-sm bg-neum-surface shadow-neum-sm
            active:shadow-neum-inset-sm active:translate-y-px transition-[box-shadow,transform] duration-150
            text-neum-primary px-8 py-3 text-base font-medium disabled:opacity-50
            flex items-center justify-center gap-2"
        >
          {familiarSaving && <div className="w-5 h-5 rounded-full border-[3px] border-current border-t-transparent animate-spin" />}
          {familiarSaving ? 'Guardando...' : familiarSaved ? 'Guardado ✓' : 'Guardar color familiar'}
        </button>
      </div>

      <hr className="border-neum-text-muted/20" />

      <div className="flex flex-col gap-6">
        <h3 className="text-lg font-bold text-neum-text">Menstruación</h3>
        <p className="text-neum-text-muted text-sm">
          Perfil fijo para seguimiento del ciclo. El color rojo está reservado.
        </p>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full" style={{ backgroundColor: 'var(--ev-rojo)' }} />
          <span className="text-neum-text-muted text-sm">Rojo (fijo)</span>
        </div>
        <button
          onClick={() => setShowReport(true)}
          className="w-full rounded-neum-sm bg-neum-surface shadow-neum-sm
            active:shadow-neum-inset-sm active:translate-y-px transition-[box-shadow,transform] duration-150
            text-neum-primary px-8 py-3 text-base font-medium"
        >
          Informe de ciclo
        </button>
      </div>

      <hr className="border-neum-text-muted/20" />

      <button
        onClick={() => setShowPinModal(true)}
        className="w-full rounded-neum-sm bg-neum-surface shadow-neum-sm
          active:shadow-neum-inset-sm active:translate-y-px transition-[box-shadow,transform] duration-150
          text-neum-primary px-8 py-3 text-base font-medium"
      >
        Cambiar PIN de la Tablet
      </button>

      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowPinModal(false)}>
          <div className="w-full max-w-sm rounded-neum bg-neum-surface shadow-neum p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-neum-text mb-6">PIN de la Tablet</h3>

            <div className="rounded-neum bg-neum-bg shadow-neum-inset p-4 mb-6">
              <p className="text-neum-text-muted text-sm mb-1">PIN actual</p>
              <p className="text-neum-text text-2xl font-bold tracking-widest">{currentPin}</p>
            </div>

            <form onSubmit={handlePinSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-neum-text-muted text-xs">Nuevo PIN</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="4 dígitos"
                  className="w-full rounded-neum-sm bg-neum-surface shadow-neum-inset-sm
                    px-4 py-3 text-neum-text placeholder-neum-text-muted mt-1 text-2xl tracking-widest text-center
                    focus:outline-none focus:ring-2 focus:ring-neum-primary-light transition-shadow"
                />
              </div>

              <div>
                <label className="text-neum-text-muted text-xs">Confirmar nuevo PIN</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Repite el PIN"
                  className="w-full rounded-neum-sm bg-neum-surface shadow-neum-inset-sm
                    px-4 py-3 text-neum-text placeholder-neum-text-muted mt-1 text-2xl tracking-widest text-center
                    focus:outline-none focus:ring-2 focus:ring-neum-primary-light transition-shadow"
                />
              </div>

              {pinMessage && (
                <p className={`text-sm text-center ${pinMessage.includes('✓') ? 'text-green-400' : 'text-red-400'}`}>
                  {pinMessage}
                </p>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => { setShowPinModal(false); setPinMessage(''); setNewPin(''); setConfirmPin('') }}
                  className="flex-1 rounded-neum-sm bg-neum-surface shadow-neum-sm
                    active:shadow-neum-inset-sm active:translate-y-px transition-[box-shadow,transform] duration-150
                    text-neum-text px-6 py-3 text-base"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pinSaving}
                  className="flex-1 rounded-neum-sm bg-neum-surface shadow-neum-sm
                    active:shadow-neum-inset-sm active:translate-y-px transition-[box-shadow,transform] duration-150
                    text-neum-primary px-6 py-3 text-base font-medium disabled:opacity-50
                    flex items-center justify-center gap-2"
                >
                  {pinSaving && <div className="w-5 h-5 rounded-full border-[3px] border-current border-t-transparent animate-spin" />}
                  {pinSaving ? 'Guardando...' : 'Cambiar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={onLogout}
        className="w-full rounded-neum-sm bg-neum-surface shadow-neum-sm
          active:shadow-neum-inset-sm active:translate-y-px transition-[box-shadow,transform] duration-150
          text-red-400 px-6 py-3 text-base mt-2"
      >
        Cerrar sesión
      </button>

      {showReport && (
        <MenstruationReport
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  )
}
