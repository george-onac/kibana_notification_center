export function getNotificationClasses(notif = {}) {
  const color = ((type) => {
    switch (type) {
      case 'banner':
        return 'success';
      case 'danger':
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    };
  })(notif.type);

  const icon = notif.type || 'info-circle';
  return `kuiIcon--${color} fa-${icon}`;
};
