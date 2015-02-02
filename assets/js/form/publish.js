angular.module('excavator.form.publish', []).

factory('form.set.publish', [
  '$q',
  'backend.form.publish',
  'backend.form.unpublish',
  'func.panic',
  'func.panic.confirm',
  'i18n.translate',
  function (
    $q,
    publish,
    unpublish,
    panic,
    confirm,
    tr
  ) {
    return function (currentForm) {
      var deferred = $q.defer();
      if (!angular.isObject(currentForm)) {
        panic(tr('forms::You must create a form first, so you can ' +
          'set its publish state.'));
        deferred.reject();
        return deferred.promise;
      }
      var promise;
      if (currentForm.published) {
        promise = confirm(
          tr('forms::Are you sure you want to unpublish {{title}} ?', {
            title: currentForm.title
          }),
          undefined,
          { class: 'btn-danger',
            text: tr('forms::Yes, unpublish this form') },
          { text: tr('forms::Cancel') }
        ).then(function () {
          return unpublish(currentForm._id).catch(panic);
        });
      } else {
        promise = confirm(
          tr('forms::Are you sure you want to publish {{title}} ?', {
            title: currentForm.title
          }),
          undefined,
          { class: 'btn-success',
            text: tr('forms::Yes, publish this form') },
          { text: tr('forms::Cancel') }
        ).then(function () {
          return publish(currentForm._id).catch(panic);
        });
      }

      promise = promise.then(function (res) {
        currentForm.published = res.data.published;
      });
      return promise;
    };
  }
]);
