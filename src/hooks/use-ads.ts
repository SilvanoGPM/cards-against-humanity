import { useAuth } from '@/contexts/AuthContext';
import Repository from '@/lib/Repository';
import { playAd } from '@/lib/ads';
import { useToast } from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { v4 as uuid } from 'uuid';

type AdsTimeout = { expiresIn: number; userUUID: string };

const adsTimeoutKey = 'adsTimeout';

export function useAds(onSuccess: () => void) {
  const toast = useToast();
  const { user, isAdmin } = useAuth();

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

    const userUUID = timeoutToAds?.userUUID || uuid();

    toast({
      title: 'Assistir anúncio',
      description: 'Um anúncio será exibido, aguarde até o final para jogar!',
      status: 'info',
    });

    playAd({
      userId: userUUID,
      onFinished: (status, message) => {
        if (isAdmin) {
          console.log(status, message);
        }

        setIsPlayingAd(false);

        if (status === 'ok' || !message) {
          Repository.save(adsTimeoutKey, {
            userUUID,

            // 5 minutos
            expiresIn: Date.now() + 1000 * 60 * 5,
          });

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
  }, [onSuccess, user, isAdmin]);

  return { isPlayingAd, playAd: handlePlayAd };
}
