import { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';

interface AdBannerProps {
  zoneId: string;
}

export function AdBanner({ zoneId }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !containerRef.current) return;
    initialized.current = true;

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = `https://alwingulla.com/88/tag.min.js`;
    script.dataset.zone = zoneId;

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      initialized.current = false;
    };
  }, [zoneId]);

  return <Box ref={containerRef} w="full" my="4" />;
}
