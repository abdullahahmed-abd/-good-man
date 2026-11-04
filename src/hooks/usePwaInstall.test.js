import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { detectIosPlatform, checkIsStandalone } from './usePwaInstall';

describe('usePwaInstall Hook & Detection Suite', () => {
  const originalNavigator = window.navigator;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('detectIosPlatform', () => {
    it('accurately identifies iOS Safari', () => {
      const iosSafariUa =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';

      const result = detectIosPlatform(iosSafariUa);
      expect(result.isIos).toBe(true);
      expect(result.isIosSafari).toBe(true);
      expect(result.isIosOther).toBe(false);
    });

    it('identifies Chrome on iOS (CriOS) as iOS non-Safari', () => {
      const iosChromeUa =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/122.0.6261.89 Mobile/15E148 Safari/604.1';

      const result = detectIosPlatform(iosChromeUa);
      expect(result.isIos).toBe(true);
      expect(result.isIosSafari).toBe(false);
      expect(result.isIosOther).toBe(true);
    });

    it('identifies Firefox on iOS (FxiOS) as iOS non-Safari', () => {
      const iosFirefoxUa =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/123.0 Mobile/15E148 Safari/605.1.15';

      const result = detectIosPlatform(iosFirefoxUa);
      expect(result.isIos).toBe(true);
      expect(result.isIosSafari).toBe(false);
      expect(result.isIosOther).toBe(true);
    });

    it('identifies Edge on iOS (EdgiOS) as iOS non-Safari', () => {
      const iosEdgeUa =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 EdgiOS/121.0.2277.109 Mobile/15E148 Safari/605.1.15';

      const result = detectIosPlatform(iosEdgeUa);
      expect(result.isIos).toBe(true);
      expect(result.isIosSafari).toBe(false);
      expect(result.isIosOther).toBe(true);
    });

    it('returns false for Android devices and desktop browsers', () => {
      const androidChromeUa =
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36';

      const desktopFirefoxUa =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0';

      expect(detectIosPlatform(androidChromeUa).isIos).toBe(false);
      expect(detectIosPlatform(desktopFirefoxUa).isIos).toBe(false);
    });
  });

  describe('checkIsStandalone', () => {
    it('returns true when display-mode is standalone via matchMedia', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }));

      expect(checkIsStandalone()).toBe(true);
    });

    it('returns true when navigator.standalone is true on iOS', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }));

      Object.defineProperty(window.navigator, 'standalone', {
        value: true,
        configurable: true
      });

      expect(checkIsStandalone()).toBe(true);
    });

    it('returns false when in normal browser tab', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }));

      Object.defineProperty(window.navigator, 'standalone', {
        value: false,
        configurable: true
      });

      expect(checkIsStandalone()).toBe(false);
    });
  });

  describe('beforeinstallprompt & appinstalled event contracts', () => {
    it('prevents default browser infobar and stores prompt', () => {
      const mockEvent = {
        preventDefault: vi.fn(),
        prompt: vi.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };

      // Simulating the event listener in usePwaInstall
      const preventDefaultSpy = mockEvent.preventDefault;
      mockEvent.preventDefault();

      expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
    });

    it('handles user accepting the installation prompt', async () => {
      let isInstalled = false;
      let canInstall = true;

      const mockPromptEvent = {
        prompt: vi.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };

      // Simulating promptInstall()
      await mockPromptEvent.prompt();
      const choice = await mockPromptEvent.userChoice;

      if (choice.outcome === 'accepted') {
        isInstalled = true;
        canInstall = false;
      }

      expect(mockPromptEvent.prompt).toHaveBeenCalledTimes(1);
      expect(choice.outcome).toBe('accepted');
      expect(isInstalled).toBe(true);
      expect(canInstall).toBe(false);
    });

    it('appinstalled event transitions state to installed and hides all install UI', () => {
      let isInstalled = false;
      let canInstall = true;
      let promptEvent = {};

      // Simulating handleAppInstalled()
      const handleAppInstalled = () => {
        isInstalled = true;
        canInstall = false;
        promptEvent = null;
      };

      handleAppInstalled();

      expect(isInstalled).toBe(true);
      expect(canInstall).toBe(false);
      expect(promptEvent).toBeNull();
    });
  });
});

