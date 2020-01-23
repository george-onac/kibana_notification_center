export function getNotificationClasses(notif = {}) {
  var icon;
  switch(notif.type){
    case  'error':
    icon = 'warning';
    break;
    case 'info':
    icon = 'info-circle';
    break;
    default:
    icon = notif.type;
    break;

  }
  return `kuiIcon--${notif.type} fa-${icon}`;
};
