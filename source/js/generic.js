$(function () {
    // Menu active state

    $('.top-bar .top-bar-section li').each(function () {
        var el = $(this),
            link = el.find('a')[0];
        if ($(link).attr('href') === window.location.pathname) {
            el.addClass('active');
        } else {
            el.removeClass('active')
        }
    })
});