import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any;
  }
}

export function Ad(): JSX.Element {
  useEffect(() => {
    window.addEventListener('load', () => {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    });
  }, []);

  return (
    <div style={{ width: '100%' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8489649559992587"
        data-ad-slot="2604905399"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
