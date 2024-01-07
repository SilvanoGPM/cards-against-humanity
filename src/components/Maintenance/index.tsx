import { Colors } from '@blueprintjs/core';
import qrCode from '../../assets/qrcode.png';
import { WhiteLogo } from '../Card/Logos';
import styles from './styles.module.scss';

export function Maintance(): JSX.Element {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <WhiteLogo />
      </div>

      <div className={styles.textWrapper}>
        <h1>Site em manutenção 🚧</h1>
        <p style={{ color: Colors.GRAY1 }}>
          Deseja auxiliar no projeto? Considere me pagar um café 😊
        </p>
      </div>

      <img alt="QRCode do Pix" src={qrCode} />
    </div>
  );
}
