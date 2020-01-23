import { chain } from 'lodash';
import { element } from 'angular';
import moment from 'moment-timezone';
import { uiModules } from 'ui/modules';
import { toastNotifications } from 'ui/notify';
import { StoredNotifications } from './lib/stored_notifications';
import { StoredConfig } from './lib/stored_config';
import { pollingNotifications } from './lib/polling_notifications';
import { getNotificationClasses } from './lib/get_notification_classes';
import template from './template.html';
import './index.less';

import React from 'react';
import ReactDOM from 'react-dom';

const module = uiModules.get('notification_center', ['ngSanitize']);
module.run(pollingNotifications);

module.service('NotificationCenter', () => {
  var notifications = new StoredNotifications().load();
  const config = new StoredConfig({
    pollingInterval: 10000,
    lastPulledAt: Date.now()
  }).load().save();

  return {
    notifications,
    config
  };
});

module.directive('notificationCenter', (NotificationCenter, $filter) => {
  return {
    restrict: 'E',
    template,
    controller: ($scope) => {
      const notifs = $scope.notifs = NotificationCenter.notifications;
      $scope.$watchCollection(() => toastNotifications.list, change => {
        const timestamp = new Date().valueOf();
        const newNotifs = chain(change)
        .filter(notif => !notif.timestamp)
        .forEach(notif => notif.timestamp = timestamp)
        .value();
        if (newNotifs.length) {
          notifs.merge(...newNotifs);
        }
      });

      function setDateFormat(format) {
        $scope.dateFormat = format;
      };

      function setDefaultTimezone(tz) {
        moment.tz.setDefault(tz);
      }

      function setStartDayOfWeek(day) {
        const dow = moment.weekdays().indexOf(day);
        moment.updateLocale(moment.locale(), { week: { dow } });
      }

      setDateFormat('MMMM Do YYYY, HH:mm:ss.SSS');
      setDefaultTimezone('browser');
      setStartDayOfWeek('Sunday');

      $scope.moment = moment;
      $scope.getNotificationClasses = getNotificationClasses;
    }
  };
});
