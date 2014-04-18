$(document).ready(function () {
  $('#header h2').on('click', function (ev) {
    $(ev.target).closest('#header').toggleClass('open');
  });
});
