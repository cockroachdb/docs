(function($) {
    $(window).load(function() {
        
        var _viewport_width = $(window).width(),
            $mobile_menu = $('nav.mobile_expanded'),
            $sidebar = $('#mysidebar'),
            $footer = $('section.footer'),
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

            $(window).scroll();
        });

        $(window).on('scroll', function(){
            _viewport_width = $(window).width();

            if(_viewport_width >= 992) {
                //prevent sidebar from overlapping footer
                footertotop = $footer.position().top;
                scrolltop = $(document).scrollTop() + $sidebar.outerHeight() + 170;
                difference = scrolltop-footertotop;

                if (scrolltop > footertotop) {
                    $sidebar.css('padding-top',  65-difference);
                }
                else  {
                    $sidebar.css('padding-top', 65);
                }
            }else{
                $sidebar.css('padding-top', 40);
            }
        });

        $(window).scroll();
    });
})(jQuery);
