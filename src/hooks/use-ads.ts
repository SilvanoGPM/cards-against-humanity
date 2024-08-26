import { useAuth } from '@/contexts/AuthContext';
import Repository from '@/lib/Repository';
import { playAd } from '@/lib/ads';
import { useToast } from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { v5 as uuidv5 } from 'uuid';

const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

type AdsTimeout = { expiresIn: number };

const adsTimeoutKey = 'adsTimeout';

export function useAds(onSuccess: () => void) {
  const toast = useToast();
  const { user } = useAuth();

  const [isPlayingAd, setIsPlayingAd] = useState(false);

  const handlePlayAd = useCallback(() => {
    if (!user) {
      return toast({
        title: 'Faça login',
        description: 'Para realizar está ação é necessário estar logado',
        status: 'warning',
      });
    }

    const timeoutToAds = Repository.get<AdsTimeout>(adsTimeoutKey);

    if (timeoutToAds && Date.now() < timeoutToAds.expiresIn) {
      return onSuccess();
    }

    setIsPlayingAd(true);

    Repository.save(adsTimeoutKey, { expiresIn: Date.now() + 1000 * 60 * 5 }); // 5 minutos

    toast({
      title: 'Assistir anúncio',
      description: 'Um anúncio será exibido, aguarde até o final para jogar!',
      status: 'info',
    });

    const userId = uuidv5(NAMESPACE, user.uid);

    playAd({
      userId,
      onFinished: (status, message) => {
        setIsPlayingAd(false);

        if (status === 'ok' || !message) {
          onSuccess();
          return;
        }

        if (status === 'error') {
          toast({
            title: 'Aconteceu um problema',
            description: message,
            status: 'info',
          });

          return;
        }
      },
    });
  }, [onSuccess, user]);

  return { isPlayingAd, playAd: handlePlayAd };
}
