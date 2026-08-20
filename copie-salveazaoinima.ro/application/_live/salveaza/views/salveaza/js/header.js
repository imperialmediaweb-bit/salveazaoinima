// $(function() {
//     $(window).on("scroll", function() {
//
//         if($(window).scrollTop() > 40) {
//             $(".nav-header").addClass('sticky');
//         } else {
//             $(".nav-header").removeClass('sticky');
//         }
//     });
// }(jQuery));



function sticktothetop() {
    var window_top = $(window).scrollTop();
    var top = $('.email-top').offset().top;
    if (window_top > top) {
        $('.nav-header').addClass('sticky');
        // $('.trigger-img').height($('.abs-14y').outerHeight());
    } else {
        $('.nav-header').removeClass('sticky');
        // $('.trigger-img').height(0);
    }
}
$(function() {
    $(window).scroll(sticktothetop);
    sticktothetop();
});

if ( $(window).width() < 500 ) {
    $('.show-content').on("click", function () {
        $('.left-menu').toggleClass("hide-elem");
        $('.icon-r').toggleClass("rotate-i");
    })
}

$('.info-click').on("click", function () {
    $('.ul-hide').toggle();
    $('.icon-info').toggleClass("rotate-info");
})

if ( $(window).width() < 500 ) {
    $('.collapse.expansive').on("click", function () {
        $('.dropdown-menu.row').toggleClass('show-menu');
    });
}

if ( $(window).width() < 500 ) {
    $('.navbar-toggle').on("click", function (){
        $('.btn-add-case').toggleClass("btn-resp");
    });


}

// header active class
// $(document).ready(function () {
//     var header = document.getElementById("ul-nav");
//     var btns = header.getElementsByClassName("navbar-element");
//     for (var i = 0; i < btns.length; i++) {
//         btns[i].addEventListener("click", function() {
//             var current = document.getElementsByClassName("active-nav");
//             current[0].className = current[0].className.replace(" active-nav", "");
//             this.className += " active-nav";
//         });
//     }
// });