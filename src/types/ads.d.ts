interface AdBreakPlacementInfo {
  breakType: string;
  breakName: string;
  breakFormat: 'interstitial' | 'reward';
  breakStatus: 'error' | 'noAdPreloaded' | 'viewed' | string;
}

interface AdBreakOptions {
  type: 'preroll' | 'start' | 'pause' | 'next' | 'browse' | 'reward';
  name?: string;
  beforeAd?: () => void;
  afterAd?: () => void;
  adBreakDone?: (placementInfo: AdBreakPlacementInfo) => void;
  beforeReward?: (showAdFn: () => void) => void;
  adDismissed?: () => void;
  adViewed?: () => void;
}

declare let adBreak: (options: AdBreakOptions) => void;

declare let adConfig: (options: {
  preloadAdBreaks?: 'on' | 'auto'; // Ad preloading strategy
  sound?: 'on' | 'off'; // This game has sound
  onReady?: () => void; // Called when API has initialised and adBreak() is ready
}) => void;
