(function($) {
    $(document).ready(function() {
        
        var _viewport_width = $(window).width(),
            $mobile_menu = $('nav.mobile_expanded'),
            $sidebar = $('#mysidebar'),
            $footer = $('#footer'),
            footertotop, scrolltop, difference;


        $mobile_menu.css('visibility', 'visible');

        $('header nav.mobile').on('click', '.hamburger', function(e){
            e.preventDefault();
            if($('body').hasClass('menu_open')){
                $('body').removeClass('menu_open');
            }
            else {
                $('body').addClass('menu_open');    
            }
        });

        $(window).resize(function(e){
            _viewport_width = $(window).width();

            if(_viewport_width > 768) {
                $('body').removeClass('menu_open');     
            }
        });

        $(window).scroll(function(e) {
            _viewport_width = $(window).width();

            if(_viewport_width >= 992) {
                //prevent sidebar from overlapping footer
                footertotop = $footer.position().top;
                scrolltop = $(document).scrollTop() + $sidebar.outerHeight() + 170;
                difference = scrolltop-footertotop;

                if (scrolltop > footertotop) {
                    $sidebar.css('margin-top',  40-difference);
                }
                else  {
                    $sidebar.css('margin-top', 40);
                }
            }
        });

        var gsearch = document.getElementById('search-input');
        gsearch.addEventListener('keydown', function (e) {
            if (e.keyCode != 13) {
                return;
            }
            var obj = {
                q: gsearch.value,
                cx: '014222686769097698638:i_krv_mjv4w',
                key: 'AIzaSyCMGfdDaSfjqv5zYoS0mTJnOT3e9MURWkU'
            };
            $.getJSON('https://www.googleapis.com/customsearch/v1', obj, function (data) {
                var div = $('<div/>');
                if (data.items) {
                    data.items.forEach(function(item) {
                        var h = $('<div/>', {class: 'search-title'});
                        h.append($('<a/>', {href: item.link}).html(item.htmlTitle));
                        var r = $('<div/>', {class: 'search-item'});
                        r.append(h);
                        r.append($('<div/>', {class: 'search-link'}).html(item.formattedUrl));
                        r.append($('<div/>', {class: 'search-snippet'}).html(item.htmlSnippet));
                        div.append(r);
                    });
                }
                $('.post-content').html(div);
            });
        });
    });
})(jQuery);

