$(document).ready(function() {
  $(".work-gallery").on("click", ".gallery-cta", function(ev) {
    ev.stopPropagation();
    ev.preventDefault();

    var galleryIndex = $(ev.currentTarget).data("gallery-index");
    var backdrop = $(".work-slideshow-backdrop").show();
    var $slideshow = $(".work-slideshow");
    var init = function() {
      backdrop.css("opacity", 1);
      var attemptSlickGoTo = window.setInterval(function() {
        try {
          $slideshow.slickGoTo(galleryIndex);
          window.clearInterval(attemptSlickGoTo);
        } catch (e) {
          // ignore error
        }
      }, 200);
    };
    $slideshow.slick({
      onInit: init,
      onReInit: init,
      variableWidth: true
    });
  });

  $(".work-slideshow-backdrop").on("click", function(ev) {
    var $target = $(ev.target);
    if (!$target.hasClass("work-slideshow-backdrop")) {
      return;
    }
    $target.hide().css("opacity", 0);
    $(".work-slideshow").unslick();
  });

  $(".work-credits-toggle, .work-credits h4").on("click", function(ev) {
    $(ev.target)
      .closest(".work-credits")
      .toggleClass("open");
  });
});
