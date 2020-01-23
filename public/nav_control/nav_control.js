import { constant, includes } from 'lodash';
import { element } from 'angular';
import { getInjected } from 'ui/chrome';
import { uiModules } from 'ui/modules';

import { chromeHeaderNavControlsRegistry } from 'ui/registry/chrome_header_nav_controls';
import '../components/notification_center';
import template from './nav_control.html';
import 'ui/angular-bootstrap';

import React from 'react';
import ReactDOM from 'react-dom';
import { EuiToolTip } from '@elastic/eui';

chromeHeaderNavControlsRegistry.register((NotificationCenter) =>({
  name: 'notification_center',
  order: 1000,
  side: 'right',
  render(el){ 
    ReactDOM.render(
      <EuiToolTip
      position="bottom"
      content="Notification Center"
      >
      <NotificationNav/>
      </EuiToolTip>
      ,el
      );

    return () => ReactDOM.unmountComponentAtNode(el);
  }
}));

class NotificationNav extends React.Component {
  componentDidMount() {
    angular.bootstrap(this.container, ['notification_center']);
  }
  componentWillUnmount() {
  }
  render = () => (
    <div
    ref={c => { this.container = c; }}
    dangerouslySetInnerHTML={{ __html: '<notification-nav></notifications-nav>' }}
    />
    )
}

const supportDarkTheme = getInjected('notificationCenter.supportDarkTheme', true);
const module = uiModules.get('notification_center', []);
module.directive('notificationNav', () => {
  return {
    restrict: 'E',
    template,
    controller: ($scope, $compile, $document, NotificationCenter) => {
      function initNotificationCenter() {
        const $elem = $scope.$notificationCenter = $compile(`<notification-center/>`)($scope)
        .toggleClass('support-dark-theme', supportDarkTheme)
        .appendTo('.app-wrapper-panel');
        $document.on('click', () => $elem.hide());
        $elem.on('click', e => e.stopPropagation());
      };

      $scope.openNotificationCenter = event => {
        event.preventDefault();
        if (!$scope.$notificationCenter) {
          initNotificationCenter();
        } else {
          $scope.$notificationCenter.toggle();
        }
        event.stopPropagation();
      };
    }
  }
})