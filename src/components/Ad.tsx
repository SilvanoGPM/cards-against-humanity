export function Ad(): JSX.Element {
  const isDev = import.meta.env.MODE === 'development';

  return (
    <>
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8489649559992587"
        crossOrigin="anonymous"
      />
      <ins
        className="adsbygoogle"
        style={{ display: 'block', backgroundColor: 'gray' }}
        data-ad-client="ca-pub-8489649559992587"
        data-ad-slot="2604905399"
        data-ad-format="auto"
        data-adtest={isDev ? 'on' : 'off'}
        data-full-width-responsive="true"
      />
      <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
    </>
  );
}
