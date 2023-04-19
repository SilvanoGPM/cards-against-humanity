import { useEffect } from 'react';

export function Ad(): JSX.Element {
  useEffect(() => {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-8489649559992587"
      data-ad-slot="2604905399"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
