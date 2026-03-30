import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DownloadPlatform = 'windows' | 'linux_deb' | 'linux_appimage' | 'macos'

export interface DownloadRelease {
  id: DownloadPlatform
  platform: DownloadPlatform
  label: string
  sublabel: string
  filename: string
  version: string
  releaseDate: string
  fileSize: string
  downloadUrl: string
  changelog: string[]
  enabled: boolean
}

const DEFAULT_RELEASES: DownloadRelease[] = [
  {
    id: 'windows',
    platform: 'windows',
    label: 'Windows',
    sublabel: 'Windows 10 / 11 (64-bit)',
    filename: 'PDV-Setup-1.0.0.exe',
    version: '1.0.0',
    releaseDate: '2026-03-28',
    fileSize: '245 MB',
    downloadUrl: '',
    changelog: [
      'Lançamento inicial do PDV Desktop',
      'Suporte a leitora de código de barras USB',
      'Modo offline com sincronização automática',
      'Impressão de cupom fiscal 80mm',
    ],
    enabled: true,
  },
  {
    id: 'linux_deb',
    platform: 'linux_deb',
    label: 'Linux',
    sublabel: 'Debian / Ubuntu (.deb)',
    filename: 'pdv-1.0.0-amd64.deb',
    version: '1.0.0',
    releaseDate: '2026-03-28',
    fileSize: '189 MB',
    downloadUrl: '',
    changelog: [
      'Lançamento inicial do PDV Desktop',
      'Testado em Ubuntu 22.04 e Debian 12',
      'Requer libusb para periféricos',
    ],
    enabled: true,
  },
  {
    id: 'linux_appimage',
    platform: 'linux_appimage',
    label: 'Linux',
    sublabel: 'Qualquer distro (.AppImage)',
    filename: 'PDV-1.0.0-x86_64.AppImage',
    version: '1.0.0',
    releaseDate: '2026-03-28',
    fileSize: '220 MB',
    downloadUrl: '',
    changelog: [
      'Versão portátil, sem instalação necessária',
      'Compatível com qualquer distribuição x86_64',
      'Execute com: chmod +x PDV-*.AppImage && ./PDV-*.AppImage',
    ],
    enabled: true,
  },
  {
    id: 'macos',
    platform: 'macos',
    label: 'macOS',
    sublabel: 'macOS 12 Monterey ou superior',
    filename: 'PDV-1.0.0.dmg',
    version: '1.0.0',
    releaseDate: '2026-03-28',
    fileSize: '312 MB',
    downloadUrl: '',
    changelog: [
      'Lançamento inicial do PDV Desktop',
      'Suporte a Apple Silicon (M1/M2/M3) e Intel',
      'Integrado com Keychain para credenciais',
    ],
    enabled: true,
  },
]

interface DownloadsStore {
  releases: DownloadRelease[]
  technicianAccess: boolean
  setTechnicianAccess: (v: boolean) => void
  updateRelease: (id: DownloadPlatform, partial: Partial<DownloadRelease>) => void
  resetRelease: (id: DownloadPlatform) => void
}

export const useDownloadsStore = create<DownloadsStore>()(
  persist(
    (set) => ({
      releases: DEFAULT_RELEASES,
      technicianAccess: false,

      setTechnicianAccess: (v) => set({ technicianAccess: v }),

      updateRelease: (id, partial) =>
        set((s) => ({
          releases: s.releases.map((r) => r.id === id ? { ...r, ...partial } : r),
        })),

      resetRelease: (id) =>
        set((s) => ({
          releases: s.releases.map((r) =>
            r.id === id ? (DEFAULT_RELEASES.find((d) => d.id === id) ?? r) : r
          ),
        })),
    }),
    { name: 'admin-downloads-v1' },
  ),
)
