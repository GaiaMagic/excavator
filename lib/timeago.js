function timeAgo (oldtime, newtime) {
  oldtime = +oldtime || +new Date;
  newtime = +newtime || +new Date;

  var tr = this.tr;
  if (typeof tr !== 'function') {
    tr = function (string) { return string; };
  }

  function fill (number) {
    return { n: Math.floor(number) };
  }

  var seconds = Math.abs(+newtime - +oldtime) / 1000;
  if (seconds < 10)  return tr('timeago::just now');
  if (seconds < 60)  return tr('timeago::{{n}} seconds ago', fill(seconds));
  if (seconds < 90)  return tr('timeago::1 minute ago');

  var minutes = seconds / 60;
  if (minutes < 60)  return tr('timeago::{{n}} minutes ago', fill(minutes));
  if (minutes < 120) return tr('timeago::1 hour ago');

  var hours = minutes / 60;
  if (hours < 24)    return tr('timeago::{{n}} hours ago', fill(hours));
  if (hours < 48)    return tr('timeago::1 day ago');

  var days = hours / 24;
  if (days < 7)      return tr('timeago::{{n}} days ago', fill(days));

  var weeks = days / 7;
  if (weeks < 2)     return tr('timeago::1 week ago');
  if (weeks < 5)     return tr('timeago::{{n}} weeks ago', fill(weeks));
  if (days < 60)     return tr('timeago::1 month ago');

  var months = days / 30;
  if (days < 365)    return tr('timeago::{{n}} months ago', fill(months));

  var years = days / 365;
  if (years < 2)     return tr('timeago::1 year ago');
                     return tr('timeago::{{n}} years ago', fill(years));
}

module.exports = timeAgo;
