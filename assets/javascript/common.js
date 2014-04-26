$(document).ready(function () {
  FastClick.attach(document.body);
  $('#header h2').on('click', function (ev) {
    $(ev.target).closest('#header').toggleClass('open');
  });
});
