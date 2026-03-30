import { useState } from 'react'
import {
  Download, Lock, Edit2, Check, X, RotateCcw,
  ShieldCheck, ShieldOff, ExternalLink, Package,
  Users, AlertTriangle,
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { Button } from '@/shared/components/Button'
import { Badge } from '@/shared/components/Badge'
import { Modal } from '@/shared/components/Modal'
import { useAuthStore } from '@/modules/auth/store'
import { useDownloadsStore } from '@/shared/store/downloads'
import { formatDate } from '@/shared/utils/format'
import type { DownloadRelease } from '@/shared/store/downloads'

// ─── Platform SVG icons ───────────────────────────────────────────
function WindowsIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  )
}

function LinuxIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.276-.975.585-.32.31-.366.79-.288 1.253.145.854.428 1.696.434 2.606.006.822-.195 1.604-.451 2.378-.057.168-.11.336-.157.505a1.77 1.77 0 00-.053.397c0 .617.304 1.208.816 1.557.463.307 1.063.36 1.576.147.563-.229.993-.775.898-1.35-.097-.58-.64-.909-1.191-.833-.177.025-.342.084-.497.163l-.021-.013c-.021-.026-.028-.06-.02-.09a.83.83 0 00.06-.137c.049-.114.096-.234.156-.352.127-.253.317-.481.568-.62.5-.286 1.062-.172 1.499.14.437.312.69.824.66 1.355-.073 1.28-1.061 2.26-2.262 2.482a2.893 2.893 0 01-1.966-.318c-.548-.31-.99-.816-1.203-1.447-.215-.637-.198-1.408.065-2.09.254-.66.742-1.219 1.422-1.528.313-.14.645-.22.97-.26v-.004c.004-.127.017-.251.04-.373.055-.304.19-.578.368-.826.096-.131.195-.261.297-.38.137-.163.268-.322.39-.478.5-.653.774-1.389.854-2.195.063-.605.032-1.22-.063-1.84a7.474 7.474 0 00-.274-1.087c-.378-1.121-1.045-2.056-1.686-2.84-.641-.784-1.25-1.427-1.597-2.069-.347-.641-.434-1.3-.33-2.077.1-.76.391-1.546.742-2.185.352-.641.763-1.126 1.115-1.419.35-.292.638-.369.847-.334.46.08.884.523 1.093 1.098.42 1.153.258 2.814.07 4.302C8.76 11.8 8.56 13.15 8.5 14.465c-.053 1.071.03 2.153.337 3.135.307.979.84 1.876 1.592 2.57.377.348.8.63 1.24.849.44.217.896.367 1.352.454.461.088.912.112 1.34.08a5.793 5.793 0 001.174-.238c.36-.116.686-.27.977-.455a4.607 4.607 0 001.317-1.218c.349-.46.604-.98.73-1.543.127-.564.12-1.17-.017-1.756-.136-.586-.41-1.143-.779-1.617-.37-.473-.833-.858-1.342-1.1a3.31 3.31 0 00-.633-.204c.065-.19.113-.384.145-.582.166-1.056-.077-2.167-.58-3.093-.504-.926-1.257-1.673-2.077-2.19-.82-.517-1.706-.8-2.498-.852-.792-.051-1.49.132-1.944.501-.451.367-.64.894-.573 1.443.066.55.374 1.121.829 1.578.456.456 1.062.805 1.696.967.634.162 1.294.137 1.879-.095.584-.231 1.092-.67 1.41-1.28.323-.614.43-1.405.203-2.24a3.856 3.856 0 00-.134-.41c.174-.044.344-.1.506-.167.486-.2.9-.497 1.144-.888.243-.391.303-.873.12-1.354-.182-.48-.611-.934-1.207-1.22-.595-.285-1.349-.4-2.12-.302-.77.098-1.56.417-2.196.944-.635.526-1.117 1.256-1.283 2.138a3.59 3.59 0 00.196 1.896c.275.585.735 1.067 1.297 1.372.562.305 1.228.437 1.878.37.65-.068 1.283-.353 1.77-.842l.003-.003c.217.114.458.197.718.249.52.104 1.077.074 1.587-.1.51-.173.971-.492 1.3-.939.33-.447.529-1.023.526-1.636-.002-.62-.207-1.275-.571-1.847-.365-.573-.899-1.064-1.541-1.39-.641-.326-1.39-.488-2.117-.452-.728.036-1.434.267-2.003.664-.57.398-1.003.965-1.194 1.62-.19.655-.13 1.397.161 2.066.293.67.79 1.267 1.443 1.672.653.406 1.462.62 2.26.571a3.9 3.9 0 001.17-.216c.176.128.37.242.577.338a3.74 3.74 0 001.73.327c.617-.038 1.23-.26 1.734-.638a3.16 3.16 0 001.068-1.428c.229-.59.27-1.273.098-1.92a3.42 3.42 0 00-.955-1.671c-.456-.44-1.066-.762-1.74-.903-.672-.14-1.41-.09-2.083.17-.672.261-1.278.73-1.68 1.37-.4.638-.591 1.44-.49 2.244.1.805.484 1.61 1.069 2.22.584.61 1.371 1.025 2.2 1.15a4.03 4.03 0 001.29-.013c.2.226.427.437.677.63a4.86 4.86 0 001.617.77c.575.148 1.175.166 1.73.05.555-.116 1.064-.38 1.462-.762.398-.382.685-.881.79-1.445.106-.563.026-1.194-.24-1.778-.265-.584-.697-1.116-1.243-1.51-.547-.394-1.208-.648-1.883-.723-.675-.074-1.364.03-1.96.317-.595.288-1.097.754-1.395 1.341a2.775 2.775 0 00-.26 1.584c.09.546.35 1.085.742 1.52a3.2 3.2 0 001.41.89c.557.168 1.156.16 1.69-.033.535-.192 1.003-.567 1.297-1.07.292-.503.393-1.138.275-1.748-.118-.61-.467-1.189-.957-1.599-.49-.41-1.12-.649-1.756-.666-.635-.017-1.27.185-1.76.571-.49.387-.82.958-.883 1.585-.063.628.135 1.294.52 1.82.384.525.951.907 1.57 1.06.62.153 1.283.075 1.847-.237.562-.31 1.022-.833 1.245-1.467.224-.634.21-1.382-.028-2.02-.24-.638-.713-1.174-1.298-1.497-.584-.323-1.282-.434-1.95-.31-.667.124-1.306.509-1.75 1.084-.445.576-.695 1.348-.66 2.12.034.773.348 1.554.888 2.124.54.57 1.304.928 2.094.97.79.04 1.607-.247 2.19-.796.582-.548.936-1.366.94-2.2.003-.837-.35-1.69-.933-2.277-.581-.587-1.394-.928-2.22-.92-.825.01-1.644.38-2.218.98-.574.6-.902 1.452-.87 2.31.03.858.414 1.713 1.02 2.287.606.574 1.448.874 2.288.82.84-.053 1.675-.436 2.226-1.076.55-.64.824-1.543.737-2.433-.088-.89-.535-1.78-1.19-2.332-.655-.552-1.528-.765-2.376-.618-.848.148-1.674.65-2.165 1.38-.49.73-.644 1.71-.44 2.61.203.9.72 1.736 1.44 2.245.72.51 1.643.682 2.51.475.868-.207 1.67-.803 2.13-1.596.46-.793.574-1.818.326-2.725-.248-.907-.84-1.71-1.607-2.167-.767-.457-1.71-.566-2.587-.297-.878.27-1.687.916-2.126 1.736-.438.82-.502 1.845-.188 2.73.314.887.994 1.66 1.825 2.07.83.41 1.81.458 2.687.133.877-.325 1.645-1.032 2.047-1.896.4-.864.432-1.916.09-2.82-.342-.904-1.066-1.676-1.934-2.07-.867-.392-1.88-.406-2.782-.037-.9.37-1.69 1.08-2.074 1.945-.383.865-.35 1.907.077 2.766.427.86 1.188 1.544 2.076 1.843.888.3 1.904.214 2.728-.24.824-.453 1.46-1.28 1.715-2.211.255-.93.116-2.007-.354-2.842-.47-.835-1.266-1.47-2.166-1.694-.9-.225-1.927-.037-2.743.516-.815.553-1.418 1.474-1.58 2.48-.163 1.005.136 2.08.776 2.833.64.752 1.617 1.183 2.61 1.154.992-.029 1.978-.5 2.594-1.27.617-.77.86-1.857.652-2.838-.21-.98-.837-1.854-1.654-2.33-.816-.476-1.84-.555-2.734-.21-.896.344-1.661 1.1-1.98 1.988a2.93 2.93 0 00.08 2.24c.421.682 1.113 1.118 1.837 1.208.725.09 1.49-.178 2.015-.725.524-.547.793-1.366.714-2.163-.08-.797-.52-1.558-1.15-2.012a2.584 2.584 0 00-2.12-.401c-.744.213-1.388.78-1.672 1.495-.283.714-.2 1.592.22 2.27.417.677 1.133 1.124 1.883 1.162.75.038 1.526-.326 1.969-.94.443-.613.519-1.491.208-2.215-.31-.724-.98-1.265-1.718-1.39a2.278 2.278 0 00-1.956.567c-.527.45-.818 1.152-.775 1.853.043.7.416 1.384.98 1.8.563.415 1.316.544 1.99.347.672-.197 1.265-.717 1.52-1.375.254-.657.162-1.464-.24-2.063-.402-.6-1.085-.985-1.79-.993a2.12 2.12 0 00-1.715.855c-.413.575-.51 1.386-.25 2.054.261.67.859 1.172 1.516 1.265.657.092 1.358-.218 1.736-.796.377-.577.395-1.397.046-2.007-.35-.61-1.017-.97-1.693-.907-.675.062-1.316.554-1.578 1.186-.262.63-.147 1.42.286 1.936.434.516 1.134.745 1.792.581.66-.164 1.243-.742 1.378-1.399.136-.656-.134-1.408-.668-1.796-.534-.39-1.305-.413-1.882-.062-.576.351-.927 1.043-.876 1.722.051.68.51 1.318 1.098 1.567.587.25 1.31.095 1.76-.408.45-.502.525-1.262.195-1.854-.33-.59-1.01-.937-1.686-.864-.675.073-1.3.555-1.519 1.207-.218.65-.034 1.41.465 1.84.499.428 1.246.495 1.82.163.574-.332.896-1.023.795-1.67-.1-.65-.617-1.212-1.25-1.384-.633-.171-1.363.08-1.73.66-.368.578-.303 1.376.16 1.869.462.493 1.218.594 1.78.238.56-.356.833-1.082.66-1.72-.174-.637-.764-1.085-1.408-1.099-.644-.013-1.279.424-1.496 1.037-.217.613-.01 1.337.499 1.693.508.357 1.243.332 1.72-.06.477-.39.651-1.072.434-1.655-.218-.582-.814-.95-1.413-.912-.598.038-1.147.468-1.314 1.048-.168.58.034 1.25.5 1.545.466.294 1.128.21 1.523-.2.394-.41.46-1.064.163-1.553-.296-.49-.916-.726-1.488-.57-.572.156-1.001.695-1.007 1.283-.007.59.408 1.143.967 1.273.559.131 1.166-.171 1.417-.691.25-.52.097-1.177-.36-1.527-.456-.35-1.12-.305-1.534.106-.414.41-.437 1.094-.057 1.54.381.447 1.063.533 1.543.2.48-.333.63-.993.353-1.509-.278-.517-.92-.727-1.452-.494-.533.232-.803.857-.62 1.407.182.55.75.854 1.305.71.554-.143.89-.718.763-1.273-.126-.555-.67-.895-1.222-.79-.551.106-.91.658-.813 1.208.097.55.617.923 1.162.855.546-.068.928-.593.89-1.14-.037-.546-.52-.963-1.063-.954-.542.01-.978.473-.974 1.014.004.54.452.983.99 1.009.537.027.999-.418 1.054-.956.054-.537-.32-1.037-.854-1.123-.532-.086-1.047.278-1.171.805-.124.527.187 1.083.71 1.239.522.156 1.093-.106 1.28-.622.186-.517-.033-1.118-.512-1.337-.48-.218-1.069.006-1.297.487-.228.48-.022 1.08.454 1.338.475.257 1.102.039 1.37-.493.267-.533.058-1.19-.474-1.482-.53-.292-1.212-.058-1.497.488-.283.546-.044 1.27.529 1.587.572.317 1.304.073 1.593-.578.289-.65.032-1.435-.588-1.757-.621-.32-1.387-.052-1.653.633-.266.686.027 1.53.666 1.868.638.336 1.432.044 1.7-.67.267-.713-.035-1.598-.673-1.944-.636-.345-1.46-.032-1.72.728-.257.76.05 1.68.714 2.027.665.348 1.499.015 1.754-.77.254-.784-.053-1.748-.714-2.09-.66-.344-1.516-.003-1.77.793-.253.796.05 1.78.712 2.115.664.336 1.525.002 1.785-.78.26-.78-.036-1.742-.692-2.076-.655-.333-1.504.002-1.765.784-.262.781.024 1.733.67 2.06.647.328 1.482-.007 1.746-.78.264-.774-.005-1.708-.632-2.023-.627-.315-1.435.025-1.697.79-.262.763 0 1.663.596 1.967.595.303 1.357-.05 1.61-.804.252-.755 0-1.616-.554-1.9-.553-.285-1.268.09-1.516.836z" />
    </svg>
  )
}

function AppleIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

// ─── Edit Release Modal ───────────────────────────────────────────
function EditReleaseModal({
  release,
  open,
  onClose,
}: {
  release: DownloadRelease
  open: boolean
  onClose: () => void
}) {
  const { updateRelease, resetRelease } = useDownloadsStore()
  const [form, setForm] = useState({
    downloadUrl: release.downloadUrl,
    version: release.version,
    fileSize: release.fileSize,
    releaseDate: release.releaseDate,
    changelog: release.changelog.join('\n'),
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSave = () => {
    updateRelease(release.id, {
      ...form,
      changelog: form.changelog.split('\n').map((l) => l.trim()).filter(Boolean),
    })
    onClose()
  }

  const handleReset = () => {
    resetRelease(release.id)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Editar — ${release.label} (${release.sublabel})`}
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw size={13} className="mr-1" />
            Restaurar padrão
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-fg-dim mb-1.5">
            URL de Download
          </label>
          <input
            value={form.downloadUrl}
            onChange={set('downloadUrl')}
            placeholder="https://releases.seudominio.com/pdv/..."
            className="w-full h-9 px-3 rounded-lg bg-surface-2 border border-[var(--border)] text-sm text-fg placeholder:text-fg-dim focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-fg-dim mb-1.5">Versão</label>
            <input
              value={form.version}
              onChange={set('version')}
              placeholder="1.0.0"
              className="w-full h-9 px-3 rounded-lg bg-surface-2 border border-[var(--border)] text-sm text-fg font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-fg-dim mb-1.5">Tamanho</label>
            <input
              value={form.fileSize}
              onChange={set('fileSize')}
              placeholder="245 MB"
              className="w-full h-9 px-3 rounded-lg bg-surface-2 border border-[var(--border)] text-sm text-fg font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-fg-dim mb-1.5">Lançamento</label>
            <input
              type="date"
              value={form.releaseDate}
              onChange={set('releaseDate')}
              className="w-full h-9 px-3 rounded-lg bg-surface-2 border border-[var(--border)] text-sm text-fg focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-fg-dim mb-1.5">
            Changelog <span className="normal-case">(uma linha por item)</span>
          </label>
          <textarea
            value={form.changelog}
            onChange={set('changelog')}
            rows={5}
            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-[var(--border)] text-sm text-fg resize-none focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
      </div>
    </Modal>
  )
}

// ─── Platform icon map ────────────────────────────────────────────
const PLATFORM_ICON: Record<string, React.ReactNode> = {
  windows:         <WindowsIcon size={28} />,
  linux_deb:       <LinuxIcon size={28} />,
  linux_appimage:  <LinuxIcon size={28} />,
  macos:           <AppleIcon size={28} />,
}

const PLATFORM_COLOR: Record<string, string> = {
  windows:         '#0078d4',
  linux_deb:       '#f9a825',
  linux_appimage:  '#f9a825',
  macos:           '#999999',
}

// ─── Release Card ─────────────────────────────────────────────────
function ReleaseCard({
  release,
  isSuperadmin,
}: {
  release: DownloadRelease
  isSuperadmin: boolean
}) {
  const [editOpen, setEditOpen] = useState(false)
  const { updateRelease } = useDownloadsStore()
  const color = PLATFORM_COLOR[release.platform] ?? 'var(--accent)'
  const hasUrl = !!release.downloadUrl

  return (
    <>
      <div className={cn(
        'bg-surface-1 border border-[var(--border)] rounded-card p-5 flex flex-col gap-4 transition-all',
        !release.enabled && 'opacity-50',
      )}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${color}18`, color }}
            >
              {PLATFORM_ICON[release.platform]}
            </div>
            <div>
              <p className="text-sm font-semibold text-fg">{release.label}</p>
              <p className="text-xs text-fg-muted mt-0.5">{release.sublabel}</p>
            </div>
          </div>
          {isSuperadmin && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => updateRelease(release.id, { enabled: !release.enabled })}
                className={cn(
                  'p-1.5 rounded-lg text-xs transition-colors',
                  release.enabled
                    ? 'text-fg-muted hover:text-red hover:bg-red/10'
                    : 'text-green hover:bg-green/10',
                )}
                title={release.enabled ? 'Desativar' : 'Ativar'}
              >
                {release.enabled ? <Check size={13} /> : <X size={13} />}
              </button>
              <button
                onClick={() => setEditOpen(true)}
                className="p-1.5 rounded-lg text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors"
                title="Editar"
              >
                <Edit2 size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[10px] font-mono text-fg-dim">
          <span className="px-1.5 py-0.5 rounded bg-surface-2 border border-[var(--border)]">v{release.version}</span>
          <span>{release.fileSize}</span>
          <span>·</span>
          <span>{formatDate(release.releaseDate)}</span>
        </div>

        {/* Changelog */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-fg-dim">Novidades</p>
          <ul className="space-y-1">
            {release.changelog.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-xs text-fg-muted leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Download button */}
        <div className="mt-auto pt-1">
          {hasUrl ? (
            <a
              href={release.downloadUrl}
              download={release.filename}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center justify-center gap-2 w-full h-9 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]',
                !release.enabled && 'pointer-events-none opacity-40',
              )}
              style={{ background: color }}
            >
              <Download size={14} />
              Baixar {release.filename.split('.').pop()?.toUpperCase()}
            </a>
          ) : (
            <div className={cn(
              'flex items-center justify-center gap-2 w-full h-9 rounded-lg text-xs font-medium',
              isSuperadmin
                ? 'bg-surface-2 border border-dashed border-[var(--border)] text-fg-dim cursor-pointer hover:border-[var(--accent)]/50 hover:text-fg transition-colors'
                : 'bg-surface-2 text-fg-dim cursor-not-allowed',
            )}
              onClick={isSuperadmin ? () => setEditOpen(true) : undefined}
            >
              {isSuperadmin ? (
                <><ExternalLink size={12} /> Configurar URL de download</>
              ) : (
                <><Lock size={12} /> Link não configurado</>
              )}
            </div>
          )}
        </div>
      </div>

      <EditReleaseModal release={release} open={editOpen} onClose={() => setEditOpen(false)} />
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────
export default function DownloadsPage() {
  const user = useAuthStore((s) => s.user)
  const { releases, technicianAccess, setTechnicianAccess } = useDownloadsStore()

  const isSuperadmin = user?.role === 'superadmin'
  const isTechnician = user?.role === 'technician'

  // Technician sem acesso liberado
  if (isTechnician && !technicianAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center">
          <Lock size={28} className="text-fg-dim" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-fg">Acesso não liberado</h2>
          <p className="text-sm text-fg-muted mt-1 max-w-xs">
            Os downloads do PDV ainda não foram liberados para técnicos. Entre em contato com o superadmin.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-fg flex items-center gap-2">
            <Package size={20} className="text-[var(--accent)]" />
            Downloads do PDV Desktop
          </h1>
          <p className="text-sm text-fg-muted mt-0.5">
            Instaladores do aplicativo PDV para todas as plataformas
          </p>
        </div>
        <Badge variant="neutral" className="font-mono">
          v{releases[0]?.version ?? '—'}
        </Badge>
      </div>

      {/* Access control (superadmin only) */}
      {isSuperadmin && (
        <div className="bg-surface-1 border border-[var(--border)] rounded-card p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                technicianAccess ? 'bg-green/15 text-green' : 'bg-surface-2 text-fg-dim',
              )}>
                {technicianAccess ? <ShieldCheck size={18} /> : <ShieldOff size={18} />}
              </div>
              <div>
                <p className="text-sm font-semibold text-fg">Acesso para Técnicos</p>
                <p className="text-xs text-fg-muted mt-0.5">
                  {technicianAccess
                    ? 'Técnicos podem visualizar e baixar os instaladores do PDV.'
                    : 'Técnicos não têm acesso aos downloads no momento.'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Users size={12} className="text-fg-dim" />
                  <span className="text-[10px] font-mono text-fg-dim">
                    Afeta: role <span className="text-fg">technician</span>
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setTechnicianAccess(!technicianAccess)}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors shrink-0 mt-0.5',
                technicianAccess ? 'bg-green' : 'bg-surface-3',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                  technicianAccess ? 'translate-x-5' : 'translate-x-0.5',
                )}
              />
            </button>
          </div>

          {!technicianAccess && (
            <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-yellow/8 border border-yellow/20">
              <AlertTriangle size={13} className="text-yellow shrink-0 mt-0.5" />
              <p className="text-xs text-yellow/90">
                Técnicos que acessarem <code className="font-mono bg-black/20 px-1 rounded">/downloads</code> verão uma tela de acesso negado.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Releases grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {releases.map((release) => (
          <ReleaseCard key={release.id} release={release} isSuperadmin={isSuperadmin} />
        ))}
      </div>

      {/* Note (superadmin) */}
      {isSuperadmin && (
        <p className="text-xs text-fg-dim text-center">
          Clique em <Edit2 size={10} className="inline" /> para configurar a URL de download de cada plataforma.
          Os arquivos podem ser hospedados em qualquer serviço (S3, GitHub Releases, CDN própria, etc).
        </p>
      )}
    </div>
  )
}
