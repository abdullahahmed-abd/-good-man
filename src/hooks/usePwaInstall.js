import { useState, useEffect, useCallback } from 'react';

/**
 * Checks if the application is running in standalone (installed PWA) mode.
 */
export function checkIsStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true ||
    (typeof document !== 'undefined' && document.referrer.includes('android-app://'))
  );
}

/**
 * Detects iOS device and determines if it is running Apple Safari or a third-party wrapper (Chrome, Firefox, etc.).
 */
export function detectIosPlatform(customUserAgent) {
  if (typeof window === 'undefined' && !customUserAgent) {
    return { isIos: false, isIosSafari: false, isIosOther: false };
  }

  const ua = customUserAgent || (typeof window !== 'undefined' ? window.navigator.userAgent : '') || '';
  const isIos = (
    /iPhone|iPad|iPod/i.test(ua) ||
    (typeof window !== 'undefined' && window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)
  );

  // On iOS, all non-Safari browsers report their own token (CriOS, FxiOS, EdgiOS, etc.)
  const isIosOther = isIos && /CriOS|FxiOS|OPiOS|EdgiOS|DuckDuckGo|Focus/i.test(ua);
  const isIosSafari = isIos && !isIosOther;

  return { isIos, isIosSafari, isIosOther };
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => checkIsStandalone());
  const [platform, setPlatform] = useState(() => detectIosPlatform());
  const [showIosModal, setShowIosModal] = useState(false);
  const [showFallbackModal, setShowFallbackModal] = useState(false);

  useEffect(() => {
    // 1. Initial standalone check
    const isStandalone = checkIsStandalone();
    setIsInstalled(isStandalone);
    setPlatform(detectIosPlatform());

    // 2. Listen to display-mode media query changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e) => {
      if (e.matches) {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleMediaChange);
    }

    // 3. Capture beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent browser default mini-infobar
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // 4. Listen to appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowIosModal(false);
      setShowFallbackModal(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleMediaChange);
      }
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Expose canInstall: true if native prompt is queued, OR if on iOS and not yet installed
  const canInstall = !isInstalled && (Boolean(deferredPrompt) || platform.isIos);

  const promptInstall = useCallback(async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
        return choice.outcome;
      } catch (err) {
        console.warn('PWA install prompt error:', err);
        return 'dismissed';
      }
    }

    if (platform.isIos) {
      setShowIosModal(true);
      return 'ios_instructions';
    }

    setShowFallbackModal(true);
    return 'unsupported';
  }, [deferredPrompt, platform.isIos]);

  return {
    isInstalled,
    canInstall,
    isIos: platform.isIos,
    isIosSafari: platform.isIosSafari,
    isIosOther: platform.isIosOther,
    promptInstall,
    showIosModal,
    setShowIosModal,
    showFallbackModal,
    setShowFallbackModal
  };
}

export default usePwaInstall;
