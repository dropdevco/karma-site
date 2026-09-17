import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { useCameraScanner } from './useCameraScanner'

interface CameraViewProps {
  active: boolean
  onDecode: (rawValue: string) => void
}

/**
 * getUserMedia requires an explicit user gesture on iOS Safari, so this only
 * ever activates from `active` flipping true in direct response to the
 * staff member tapping something — never automatically on page load.
 */
export function CameraView({ active, onDecode }: CameraViewProps) {
  const { t } = useTranslation('scanner')
  const { videoRef, status, errorMessage, torchSupported, torchOn, toggleTorch } = useCameraScanner({
    active,
    onDecode,
  })

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-card bg-karma-ink">
      <video
        ref={videoRef}
        className={cn('h-full w-full object-cover', status !== 'running' && 'opacity-0')}
        playsInline
        muted
        autoPlay
      />

      {status === 'starting' && (
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <p className="font-display text-lg font-semibold text-white">{t('camera.starting')}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-karma-ink px-6 text-center">
          <p className="font-display text-lg font-bold text-white">{t('camera.errorTitle')}</p>
          <p className="text-sm text-white/80">
            {errorMessage === 'NotAllowedError' ? t('camera.permissionDenied') : t('camera.genericError')}
          </p>
        </div>
      )}

      {status === 'running' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-56 w-56 rounded-2xl border-4 border-white/80" aria-hidden="true" />
        </div>
      )}

      {torchSupported && status === 'running' && (
        <button
          type="button"
          onClick={toggleTorch}
          className={cn(
            'absolute bottom-4 right-4 rounded-full px-5 py-3 font-display text-sm font-bold shadow-lg transition-colors',
            torchOn ? 'bg-white text-karma-ink' : 'bg-black/50 text-white',
          )}
        >
          {torchOn ? t('camera.torchOff') : t('camera.torchOn')}
        </button>
      )}
    </div>
  )
}
