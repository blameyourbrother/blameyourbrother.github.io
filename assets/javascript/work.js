$(document).ready(function () {
  $('.work-gallery').on('click', '.gallery-cta', function (ev) {
    ev.stopPropagation();

    var backdrop = $('.work-slideshow-backdrop').show();
    $('.work-slideshow').slick({
      onInit: function () {
        backdrop.css('opacity', 1);
      },
      onReInit: function () {
        backdrop.css('opacity', 1);
      }
    });
  });

  $('.work-slideshow-backdrop').on('click', function (ev) {
    var $target = $(ev.target);
    if (!$target.hasClass('work-slideshow-backdrop')) {
      return;
    }
    $target.hide().css('opacity', 0);
    $('.work-slideshow').unslick();
  });
});
