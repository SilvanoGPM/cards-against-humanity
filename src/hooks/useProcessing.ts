import { useCallback, useEffect, useRef } from 'react';

interface UseProcessingReturn {
  enableProcessing: () => void;
  disableProcessing: () => void;
}

export function useProcessing(initialValue = false): UseProcessingReturn {
  const processingRef = useRef<boolean>(initialValue);

  const enableProcessing = useCallback(() => {
    processingRef.current = true;
  }, []);

  const disableProcessing = useCallback(() => {
    processingRef.current = false;
  }, []);

  useEffect(() => {
    function confirmExit(e: BeforeUnloadEvent): string | undefined {
      if (processingRef.current) {
        const confirmationMessage =
          'Deseja realmente sair? Suas alterações não salvas serão perdidas.';
        (e || window.event).returnValue = confirmationMessage;
        return confirmationMessage;
      }

      return undefined;
    }

    window.addEventListener('beforeunload', confirmExit);

    return () => {
      window.removeEventListener('beforeunload', confirmExit);
    };
  }, []);

  return { enableProcessing, disableProcessing };
}
