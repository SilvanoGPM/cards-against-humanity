export interface PlayAdParams {
  userId: string;
  onFinished: (status: 'error' | 'ok', message?: string) => void;
}

const possibleErrorsMessages: Record<string, string> = {
  'ad-blocker': 'Ad blocker detectado, por favor desative para jogar',
  'network-error': 'Erro de rede, por favor tente novamente',
  'cors-error': 'Erro de CORS, por favor tente novamente',
  'ad-interrupted': 'Assista o vídeo até o final!',
  'ad-rejected': 'Por favor, assiste o anúncio antes de jogar',
  'ad-violation': 'Por favor, assiste o anúncio antes de jogar',
};

export function playAd({ onFinished, userId }: PlayAdParams) {
  try {
    const options = {
      userId,
      zoneId: 2050,
      accountId: 7968,
      siteId: 8503,
      adStatusCb: (status: AdStatus) => {
        if (status === 'ad-watched' || status === 'ad-rewarded') {
          return onFinished('ok');
        }

        if (status in possibleErrorsMessages) {
          const message = possibleErrorsMessages[status];

          return onFinished('error', message);
        }

        const skippedStatuses = [
          'ad-started',
          'sys-closing',
          'ad-initready',
          'ad-rewarded',
        ];

        if (skippedStatuses.includes(status)) {
          return;
        }

        return onFinished('ok');
      },
    };

    invokeApplixirVideoUnit(options);
  } catch {
    onFinished('error');
  }
}
