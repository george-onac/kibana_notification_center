import { chain } from 'lodash';
import { getVisible, addBasePath } from 'ui/chrome';
import { addSystemApiHeader } from 'ui/system_api';
import { toastNotifications } from 'ui/notify';
var loaded = false;

export function pollingNotifications($timeout, $http, NotificationCenter) {
  if(loaded == true){
    return;
  }
  loaded = true;

  const { config } = NotificationCenter;
  const notify = {};
  $timeout(function pullNotifications() {
    return $http.get(addBasePath('/api/notification_center/notification'), {
      headers: addSystemApiHeader({}),
      params: {
        from: config.get('lastPulledAt'),
        size: config.get('maxSize')
      }
    })
    .then(({ data }) => {
      const notifications = data || [];
      const lastPulledAt = chain(notifications)
      .forEach(notification => {
        var iconType= null;
        var color = notification.type;
        var title = notification.type.charAt(0).toUpperCase() + notification.type.slice(1);
        switch (notification.type) {
          case 'error':
          iconType ='alert';
          color = 'danger';
          break;
          case 'success':
          iconType = 'check'
          break;
          case 'warning':
          iconType = 'help'
          break;
          case 'info':
          iconType = 'check';
          color = 'primary';
          break;
        }

        var toast = {
          text: notification.content,
          type: notification.type,
          title: title,
          color: color,
          iconType: iconType
        }
        toastNotifications.add(toast);
      })
      .map('timestamp')
      .max()
      .value();

      if (lastPulledAt > 0) {
        config.set('lastPulledAt', lastPulledAt);
        config.save();
        //todo -- update notifications number
      }
    })
    .then(() => $timeout(pullNotifications, config.get('pollingInterval')));
  }, config.get('pollingInterval'));
};