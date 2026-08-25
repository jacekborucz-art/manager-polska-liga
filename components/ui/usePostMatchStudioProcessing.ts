import { useCallback, useRef } from 'react';
import { useProcessing } from './ProcessingOverlay';

/**
 * Opens the global processing overlay before the expensive end-of-match work.
 * The processing provider waits for two animation frames, which guarantees that
 * the hint is painted before league results, player statistics and match history
 * are synchronized. The local ref also blocks a rapid double click from applying
 * the same match result twice before React has disabled the button.
 */
export const usePostMatchStudioProcessing = () => {
  const { isProcessing, runWithProcessing } = useProcessing();
  const isLaunchingRef = useRef(false);

  const openPostMatchStudio = useCallback((task: () => void | Promise<void>) => {
    if (isLaunchingRef.current || isProcessing) return;
    isLaunchingRef.current = true;

    void runWithProcessing(task, {
      title: 'Studio pomeczowe',
      status: 'Aktualizuję wyniki, tabele oraz statystyki spotkania',
      minVisibleMs: 650,
    }).catch(error => {
      console.error('Post-match studio processing failed:', error);
    }).finally(() => {
      isLaunchingRef.current = false;
    });
  }, [isProcessing, runWithProcessing]);

  return {
    isPreparingStudio: isProcessing || isLaunchingRef.current,
    openPostMatchStudio,
  };
};
