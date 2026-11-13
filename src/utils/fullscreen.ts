import { useState, useEffect, useCallback } from 'react';

// Checks if any browser vendor has an active fullscreen element
export function isFullscreenActive(): boolean {
  if (typeof document === 'undefined') return false;
  const doc = document as any;
  return Boolean(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );
}

// Request fullscreen on document or specific element with full browser prefix support
export async function requestFullscreenSafe(elem: Element = document.documentElement): Promise<boolean> {
  if (typeof document === 'undefined') return false;
  if (isFullscreenActive()) return true;

  const el = elem as any;
  try {
    if (el.requestFullscreen) {
      await el.requestFullscreen({ navigationUI: 'hide' } as any);
      return true;
    } else if (el.webkitRequestFullscreen) {
      await el.webkitRequestFullscreen();
      return true;
    } else if (el.mozRequestFullScreen) {
      await el.mozRequestFullScreen();
      return true;
    } else if (el.msRequestFullscreen) {
      await el.msRequestFullscreen();
      return true;
    }
  } catch (err) {
    // Expected when browser requires direct user interaction or permissions policy denies it
    return false;
  }
  return false;
}

// Exit fullscreen cleanly
export async function exitFullscreenSafe(): Promise<boolean> {
  if (typeof document === 'undefined') return false;
  if (!isFullscreenActive()) return true;

  const doc = document as any;
  try {
    if (doc.exitFullscreen) {
      await doc.exitFullscreen();
      return true;
    } else if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
      return true;
    } else if (doc.mozCancelFullScreen) {
      await doc.mozCancelFullScreen();
      return true;
    } else if (doc.msExitFullscreen) {
      await doc.msExitFullscreen();
      return true;
    }
  } catch (err) {
    return false;
  }
  return false;
}

/**
 * Hook to inspect and manually control full screen:
 * - Synchronizes reactive `isFullscreen` state when browser fullscreen state changes
 * - Does NOT automatically force or request fullscreen on mount or interaction
 */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(isFullscreenActive());

  const enter = useCallback(async () => {
    const success = await requestFullscreenSafe();
    setIsFullscreen(isFullscreenActive());
    return success;
  }, []);

  const exit = useCallback(async () => {
    const success = await exitFullscreenSafe();
    setIsFullscreen(isFullscreenActive());
    return success;
  }, []);

  const toggle = useCallback(async () => {
    if (isFullscreenActive()) {
      return await exit();
    } else {
      return await enter();
    }
  }, [enter, exit]);

  useEffect(() => {
    const update = () => {
      setIsFullscreen(isFullscreenActive());
    };

    // Standard & vendor-prefixed fullscreen events
    document.addEventListener('fullscreenchange', update);
    document.addEventListener('webkitfullscreenchange', update);
    document.addEventListener('mozfullscreenchange', update);
    document.addEventListener('MSFullscreenChange', update);

    return () => {
      document.removeEventListener('fullscreenchange', update);
      document.removeEventListener('webkitfullscreenchange', update);
      document.removeEventListener('mozfullscreenchange', update);
      document.removeEventListener('MSFullscreenChange', update);
    };
  }, []);

  return {
    isFullscreen,
    enterFullscreen: enter,
    exitFullscreen: exit,
    toggleFullscreen: toggle
  };
}

// Backwards-compatible alias for any residual references
export const useAlwaysFullscreen = useFullscreen;
