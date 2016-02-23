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
            var scroll_top = $(window).scrollTop();

            // different scroll points for when header should size down in height
            // based on browser width
            var header_resize_y = 0;
            if(_viewport_width > 1200){
                header_resize_y = 75;
            }
            else if(_viewport_width > 992){
                header_resize_y = 25;
            }
            if(scroll_top > header_resize_y){
                $('header').removeClass('default').addClass('scrolled');
                if(_viewport_width > 991) {
                    $sidebar.css({'top': '95px'});
                }else{
                    $sidebar.css({'top': 'auto'});  
                }
            }
            else {
                $('header').removeClass('scrolled').addClass('default'); 
                $sidebar.css({'top': 'auto'});   
            }


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
        });
    });
})(jQuery);



