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
};

export function playAd({ onFinished, userId }: PlayAdParams) {
  try {
    const options = {
      userId,
      zoneId: 2050,
      accountId: 7968,
      siteId: 8503,
      adStatusCb: (status: AdStatus) => {
        if (status === 'ad-watched') {
          return onFinished('ok');
        }

        if (status in possibleErrorsMessages) {
          const message = possibleErrorsMessages[status];

          return onFinished('error', message);
        }
      },
    };

    invokeApplixirVideoUnit(options);
  } catch {
    onFinished('error');
  }
}
