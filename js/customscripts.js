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


        //hijack clicks on links, verify if anchor link and jump to div
        //$('body').on('click', 'a', function (e) {
        //    if (/#/.test(this.href)) {
        //        e.preventDefault();

        //        var hash = this.href.substring(this.href.indexOf('#')),
        //            fixedElementHeight = 50;

        //        $('html, body')
        //            .stop()
        //            .animate({
        //                scrollTop: $(hash).offset().top - fixedElementHeight
        //            }, 0);
        //    }
        //});
    });
})(jQuery);


// needed for nav tabs on pages. See Formatting > Nav tabs for more details.
// script from http://stackoverflow.com/questions/10523433/how-do-i-keep-the-current-tab-active-with-twitter-bootstrap-after-a-page-reload
$(function() {
    var json, tabsState;
    $('a[data-toggle="pill"], a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
        var href, json, parentId, tabsState;

        tabsState = localStorage.getItem("tabs-state");
        json = JSON.parse(tabsState || "{}");
        parentId = $(e.target).parents("ul.nav.nav-pills, ul.nav.nav-tabs").attr("id");
        href = $(e.target).attr('href');
        json[parentId] = href;

        return localStorage.setItem("tabs-state", JSON.stringify(json));
    });

    tabsState = localStorage.getItem("tabs-state");
    json = JSON.parse(tabsState || "{}");

    $.each(json, function(containerId, href) {
        return $("#" + containerId + " a[href=" + href + "]").tab('show');
    });

    $("ul.nav.nav-pills, ul.nav.nav-tabs").each(function() {
        var $this = $(this);
        if (!json[$this.attr("id")]) {
            return $this.find("a[data-toggle=tab]:first, a[data-toggle=pill]:first").tab("show");
        }
    });
});



