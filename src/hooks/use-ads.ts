import Repository from '@/lib/Repository';
import { playAd } from '@/lib/ads';
import { useToast } from '@chakra-ui/react';
import { useCallback } from 'react';

type AdsTimeout = { expiresIn: number };

const adsTimeoutKey = 'adsTimeout';

export function useAds(onSuccess: () => void) {
  const toast = useToast();

  const handlePlayAd = useCallback(() => {
    const timeoutToAds = Repository.get<AdsTimeout>(adsTimeoutKey);

    if (timeoutToAds && Date.now() < timeoutToAds.expiresIn) {
      return onSuccess();
    }

    Repository.save(adsTimeoutKey, { expiresIn: Date.now() + 1000 * 60 * 5 }); // 5 minutos

    toast({
      title: 'Assistir anúncio',
      description: 'Ads estão sendo exibidos, aguarde até o final para jogar!',
      status: 'info',
    });

    playAd({
      userId: 'userId',
      onFinished: (status, message) => {
        if (status === 'ok') {
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
  }, [onSuccess]);

  return handlePlayAd;
}
