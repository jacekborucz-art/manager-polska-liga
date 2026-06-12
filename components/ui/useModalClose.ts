import { useState, useCallback } from 'react';

export const useModalClose = (onClose: () => void) => {
  const [exiting, setExiting] = useState(false);

  const closeModal = useCallback(() => {
    setExiting(true);
    setTimeout(onClose, 200);
  }, [onClose]);

  const exitClass = exiting ? 'animate-modal-out' : 'animate-fade-in';

  return { closeModal, exitClass };
};
