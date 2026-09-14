import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, CheckCircle2, AlertCircle, ScanLine, Keyboard } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
  title?: string;
  subtitle?: string;
  sampleCodes?: { label: string; code: string }[];
  mode?: 'barcode' | 'qrcode' | 'both';
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  title = 'Scan Barcode / QR Code',
  subtitle = 'Position the code within the frame to scan automatically',
  sampleCodes = [],
  mode = 'both',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scannedSuccess, setScannedSuccess] = useState<string | null>(null);

  // Web Audio scan beep
  const playScanBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch {
      // Audio not supported or blocked
    }
  };

  const handleSuccessCode = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    playScanBeep();
    setScannedSuccess(trimmed);
    setTimeout(() => {
      onScan(trimmed);
      onClose();
    }, 400);
  };

  // Start Camera
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setScannedSuccess(null);
    setCameraError(null);

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera device access is not supported on this browser.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setHasCameraPermission(true);

        // Native BarcodeDetector if available
        // @ts-expect-error BarcodeDetector is supported in modern Chromium/Android
        if (window.BarcodeDetector) {
          try {
            // @ts-expect-error BarcodeDetector
            const detector = new window.BarcodeDetector({
              formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e'],
            });

            const detectFrame = async () => {
              if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                try {
                  const barcodes = await detector.detect(videoRef.current);
                  if (barcodes && barcodes.length > 0) {
                    const raw = barcodes[0].rawValue;
                    if (raw) {
                      handleSuccessCode(raw);
                      return;
                    }
                  }
                } catch {
                  // Frame decode pass failed
                }
              }
              animationFrameRef.current = requestAnimationFrame(detectFrame);
            };

            animationFrameRef.current = requestAnimationFrame(detectFrame);
          } catch {
            // Detector init fallback
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setHasCameraPermission(false);
          const message = err instanceof Error ? err.message : 'Unable to access camera';
          setCameraError(message);
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-stone-800 bg-stone-900 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <ScanLine className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100">{title}</h3>
              <p className="text-xs text-stone-400">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-stone-400 hover:bg-stone-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Viewfinder Canvas Area */}
        <div className="relative aspect-4/3 w-full overflow-hidden bg-black flex items-center justify-center">
          {hasCameraPermission === false ? (
            <div className="flex flex-col items-center justify-center px-6 text-center text-stone-400">
              <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
              <p className="text-sm font-semibold text-stone-200">Camera Access Not Available</p>
              <p className="text-xs text-stone-400 mt-1 max-w-xs">
                {cameraError || 'Camera permission was denied or camera is not detected. Use manual entry or test shortcuts below.'}
              </p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full object-cover"
              />

              {/* Viewfinder Grid Overlay */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-56 w-72 sm:w-80 rounded-2xl border-2 border-amber-400/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 h-6 w-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 h-6 w-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 h-6 w-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                  {/* Animated laser scan line */}
                  <div className="absolute left-2 right-2 top-1/2 h-0.5 bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse" />

                  <div className="absolute -bottom-7 left-0 right-0 text-center">
                    <span className="rounded-md bg-stone-900/80 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                      Align barcode or QR code here
                    </span>
                  </div>
                </div>
              </div>

              {/* Flip camera control */}
              <button
                type="button"
                onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                className="absolute top-3 right-3 rounded-full bg-stone-900/70 p-2 text-stone-200 hover:bg-stone-900 hover:text-white backdrop-blur-xs"
                title="Switch Camera"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Success Flash Feedback */}
          {scannedSuccess && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-emerald-600/90 text-white animate-fade-in">
              <CheckCircle2 className="h-16 w-16 text-white animate-bounce" />
              <p className="mt-2 text-base font-bold">Code Detected!</p>
              <p className="font-mono text-sm tracking-wider">{scannedSuccess}</p>
            </div>
          )}
        </div>

        {/* Manual Keyboard Input Option */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/70 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualCode.trim()) {
                handleSuccessCode(manualCode);
              }
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Keyboard className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Or type barcode / code manually..."
                className="w-full rounded-xl border border-stone-700 bg-stone-900 pl-9 pr-3 py-2 text-xs text-white placeholder-stone-400 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500 disabled:opacity-40 transition-colors"
            >
              Enter
            </button>
          </form>

          {/* Sample quick test pills (handy for demo/testing without camera hardware) */}
          {sampleCodes.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-stone-400 mb-1.5">
                Quick Test Sample Codes:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sampleCodes.map((s) => (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => handleSuccessCode(s.code)}
                    className="rounded-lg border border-stone-800 bg-stone-900/90 px-2.5 py-1 text-[11px] text-stone-300 hover:border-amber-500 hover:text-amber-300 transition-colors"
                  >
                    <span className="font-medium text-stone-200">{s.label}</span>:{' '}
                    <span className="font-mono text-stone-400">{s.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
