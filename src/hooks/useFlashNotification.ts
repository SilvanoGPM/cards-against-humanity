import { AppToaster } from '@/components/Toast';
import { Intent, IToastProps } from '@blueprintjs/core';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useFlashNotification(route: string): void {
  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    if (location?.state) {
      const { warning, danger, success, primary, ...state } =
        location.state as {
          warning: IToastProps;
          danger: IToastProps;
          success: IToastProps;
          primary: IToastProps;
        };

      const notifications: {
        [key: string]: IToastProps;
      } = {
        warning,
        danger,
        success,
        primary,
      };

      const perfomedNotifications = Object.keys(notifications).map(
        (notification) => {
          const props = notifications[notification];
          const intent = notification as Intent;

          if (props) {
            AppToaster.show({ ...props, intent });
            return 1;
          }

          return 0;
        }
      );

      const hasNotification = perfomedNotifications.includes(1);

      if (hasNotification) {
        // Limpando o estado quando recaregar a página.
        navigate(route, { state, replace: true });
      }
    }
  }, [location, navigate, route]);
}
