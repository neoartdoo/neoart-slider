/*global $,google,NProgress,window,console,document *//*jshint multistr: true */

/* ============================================================ */
/* Layout Config
/* ============================================================ */

//Enable or disable auto Scrolling
//================================
//1.true = enable auto scrolling
//1.false = disable auto scrolling
var autoScroller= true;

//Enable or disable title animations
//==================================
//1.true = enable title animations
//1.false = disable title animations
var animateTitles= true;

// set default post content alignment
//==================================
// 1. alternate left and right = "alternate"
// 2. align left  = "left"
// 3. align right  = "right"
// 4. center  = "center"
// 5. bottom left  = "bottomleft"
var defaultContentAlignment = "alternate";

//set defult post content reveal transition
//=========================================
// 1. same as alignment direction = "auto"
// 2. from bottom  = "bottom"
// 3. from left = "left"
// 4. from right = "right"
// 5. nothing = ""
// 6. fade in = "fade"
var defaultContentTransition = "bottom";

//default option to hide or not hide post button
//==============================================
// 1. Show button = false
// 2. Hide Button  = true
var defaultHideButton = false;

//default option to hide or show the post excerpt
//===============================================
// 1. Show excerpt = false
// 2. Hide excerpt  = true
var defaultHideExcerpt = false;

//Preset colours for tagged post backgrounds
//===============================================
//Enter the name of the tag on the left and the colour on the right
var taggedColors = {"tag-audio":"red","tag-video":"orange","tag-motion":"orange"};





var scrollStart=true;
var scrollEnd = false;
var scrollEvent = false;
var nav, scroll, slider, ajax, tagList, authorlist, gmaps,comments;
/* ============================================================ */
/* Load functions when page is loaded */
/* ============================================================ */
$(function(){
    NProgress.start();
    $('body').delay(300).css({ opacity: 0 }).fadeTo(500,1);
    if(document.addEventListener){ //dont run function if browser is lower than ie9
        ajax = new AjaxPageLoading();
    }
    nav = new Nav();
    tagList = new TagList();
    authorlist = new AuthorList();
    gmaps = new Gmaps();
    comments = new Comments();

    if($("body").hasClass("home-template") || $("body").hasClass("tag-template") || $("body").hasClass("archive-template") || $("body").hasClass("author-template")){
        scroll = new ScrollSystem();
        slider = new Slider();
    }
    $(".articleContent, .postItem .content, .postItem .media").fitVids({ignore:'.text .media'});// Re run fitvid.js
    if($("body").hasClass("post-template") || $("body").hasClass("page-template")){
        if($("body").hasClass("post-template") && !$("body").hasClass("page-template")){
            comments.load();
            $(".media").remove();
        }
    }

    $('.postItem .reflow').perfectScrollbar({suppressScrollX: true});

    NProgress.done();
    try{hljs.initHighlightingOnLoad();}catch(e){}
});



/* ============================================================ */
/* gmaps Loading  */
/* ============================================================ */

var Gmaps = function(){
    this.load = function(){
        if($("#gmaps").length > 0){
            var $gmaps = $("#gmaps");
            var lat = $gmaps.data("lat");
            var lng = $gmaps.data("lng");
            var center = new google.maps.LatLng(lat,lng);
            var map;
            var mapProp;
            var id = "gmaps";

            mapProp = {
                center:center,
                zoom:15,
                mapTypeId:google.maps.MapTypeId.ROADMAP
            };

            map=new google.maps.Map(document.getElementById(id),mapProp);

            var marker=new google.maps.Marker({
              position:center
              });
            marker.setMap(map);
        }
    };
    this.load();
};


/* ============================================================ */
/* Load Disqus comments */
/* ============================================================ */

var Comments = function(){
    var disqus_shortname = $("#disqus_thread").attr('data-username');
    var disqus_identifier = $("#disqus_thread").attr("data-ghostid");
    var that = this;
    var setup = false;

    this.load = function(){
        if($(".post-template").length > 0){
            var overThere = that;
            setTimeout(function(){
                if(that.createdDisqus()){
                    that.reloadDisqus();
                }
            },1500);
        }
    };

    this.createdDisqus = function(){
        if(!setup){
            var dsq = document.createElement('script');
            dsq.type = 'text/javascript';
            dsq.async = true;
            dsq.id=	'disquscomment_include';
            dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
            setup = true;
            return false;
        }else{
            return true;
        }
    };
    this.reloadDisqus = function(){
        disqus_identifier = $("#disqus_thread").attr("data-ghostid");
        DISQUS.reset({
            reload: true,
            config: function () {
                this.page.identifier = disqus_identifier;
                this.page.url = window.location.href;
            }
        });
    };
};



/* ============================================================ */
/* Create mobile menu */
/* ============================================================ */

var Nav = function(){
    var navLinks = [];
    var that = this;
    this.load = function(){
        $(".mobileMenuButton").on('click',function(){
            if($('#mainNavCheck:checkbox:checked').length > 0){
                that.closeMobileMenu();
            }else{
                $("body").addClass("mobileMenu");
            }
        });
        $(".navContainer .navLinks").contents().clone().appendTo($(".mobileMenuContainer .navLinks"));

        $(".mobileMenuContainer .navLinks a").on('click',function(){
            that.closeMobileMenu();
        });
        var timeout,timeout2;
        this.closeMobileMenu = function(){
            $(".mobileMenuContainer").attr("style","visibility:visible;");
            clearTimeout(timeout);
            clearTimeout(timeout2);
            timeout = setTimeout(function(){
                $('#mainNavCheck').prop('checked', false);
                timeout2 = setTimeout(function(){
                    $("body").removeClass("mobileMenu");
                    $(".mobileMenuContainer").attr("style","");
                },350);
            },800);
        };
        this.navHighlightLoad();
    };

    this.navHighlightLoad = function(){
        navLinks = [];
        $(".nav .navLinks").find("li a").each(function(i,e){
            var URLlink=$(this).attr("href").toLowerCase().replace(/^.*\/\/[^\/]+/i,"").toLowerCase().split("/")[1];
            navLinks.push({link:URLlink,item:i});
        });
        that.navHighlight();
    };

    this.navHighlight = function(){
        var currentState = History.getState().url.toLowerCase().replace(/^.*\/\/[^\/]+/i,"").toLowerCase().split("/")[1];
        $(".navLinks li a").removeClass("active");
        $(navLinks).each(function(i,e){
            if(e.link == "tag" && currentState == "tag" || e.link == "alltags" && currentState == "alltags"){
                $(".navLinks .tagList").addClass("active");
                return false;
            }else if(e.link==currentState){
                $(".navLinks").last().find("li a").eq(e.item).addClass("active");
                $(".navLinks").first().find("li a").eq(e.item).addClass("active");
                return false;
            }
        });
    };

    this.load();
};

/* ============================================================ */
/* Get all tags */
/* ============================================================ */
var TagList = function(){
    var url = '/sitemap-tags.xml';
    var that = this;

    var $makeTaglist = $("#container .articleContent .makeTagList");
    var $menuTagList = $(".navLinks ul ul");

    this.load = function(){
        $makeTaglist = $("#container .articleContent .makeTagList");
        $menuTagList = $(".navLinks ul ul");
        if($menuTagList.find("li").length === 0){
            $.ajax({
                type: "GET",
                url: url,
                dataType: "xml",
                success: this.parseXml,
                fail: this.failLoad
            });
        }else if($makeTaglist.find("li").length < 1){
            that.renderPostTagList();
        }
    };
    this.parseXml = function(xml){
        var array = $(xml).find("url");
        var arrayLength = array.length -1;
        $menuTagList.append('<li class="all ajaxPageLink"><a class="ajaxPageLink" href="/alltags">All</a></li>');
        array.each(function(i){
            var url = $('loc',this).text();
            var name = url.replace(/^.*\/\/[^\/]+\/tag\//i,"").replace("/","");
            $menuTagList.append('<li class="tag-'+name+'"><a class="ajaxPageLink" href="'+url+'"><div>'+name+'</div></a></li>');

            if(i >=arrayLength){
                if($makeTaglist.find("li").length === 0){
                    that.renderPostTagList();
                }
            }

        });
        nav.navHighlightLoad();
    };
    this.renderPostTagList = function(){
        $menuTagList.first().find("li").clone().appendTo($makeTaglist);
        $makeTaglist.find(".all").remove();
        $makeTaglist.find("li").eq(0).addClass("first");
        $makeTaglist.find("li").eq(-1).addClass("last");
    };

    this.failLoad = function(){
        console.log( "Error: The url 'sitemap-tags.xml' is missing or can't be reached" );
    };
    this.load();
};

/* ============================================================ */
/* Get all authors */
/* ============================================================ */
var AuthorList = function(){
    var url = '/sitemap-authors.xml';
    var that = this;
    var $makeAuthorlist = $(".makeAuthorList");

    this.load = function(){
        $makeAuthorlist = $(".makeAuthorList");
        if($makeAuthorlist.find("li").not(".first").length === 0){
            $.ajax({
                type: "GET",
                url: url,
                dataType: "xml",
                success: this.parseXml,
                fail: this.failLoad
            });
        }
    };
    this.parseXml = function(xml){
        var array = $(xml).find("url");
        var arrayLength = array.length -1;
        array.each(function(i){
            var authorUrl = $('loc',this).not("image\\:loc").text();
            var name = authorUrl.replace(/^.*\/\/[^\/]+\/author\//i,"").replace("/","");
            $makeAuthorlist.append('<li class="author-'+name+'"><a class="ajaxPageLink" href="'+authorUrl+'"><div>'+name.replace("-"," ")+'</div></a><span>, </span></li>');
            if(i === 0){
                $makeAuthorlist.find("li").addClass("first");
            }
            if(i === arrayLength){
                $makeAuthorlist.find("li").last().find("span").remove();
                if(i !== 0){
                    $makeAuthorlist.find("li").last().addClass("last");
                }
            }
        });
    };

    this.failLoad = function(){
        console.log( "Error: The url 'sitemap-author.xml' is missing or can't be reached" );
    };
    this.load();
};

/* ============================================================ */
/* Render homepage slider */
/* ============================================================ */
var Slider = function(){
    var $posts = $(".slider .postItem");
    this.post = function(){};
    var that = this;
    var $ajaxedContainer = $(".ajaxedContainer");

    this.posts = function(){};

    this.load = function(){
        this.posts.color();
        this.posts.align();
        this.posts.titleTransitions();
        this.posts.negative();
        this.posts.hideContent();
        this.posts.contentImage();

    };

    this.posts.hideContent = function(){
        if(defaultHideExcerpt === false || defaultHideButton === false){
            $(".post").each(function(i){
                var t = $(this);
                var showButton = t.find("div[data-button]").attr('data-button');
                if(showButton === "false"){
                    t.addClass("hideButton");
                }
                var showExcerpt = t.find("div[data-excerpt]").attr('data-excerpt');
                if(showExcerpt === "false"){
                    t.addClass("hideExcerpt");
                }
            });
        }else{
            if(defaultHideExcerpt === true){
                $(".post").addClass("hideButton");
            }
            if(defaultHideButton === true){
                $(".post").addClass("hideExcerpt");
            }
        }
    };

    this.posts.negative = function(){
        $(".post").each(function(i){
            var t = $(this);
            var textNegative = t.find("div[data-negative]").attr('data-negative');
            if(textNegative === "true"){
                t.addClass("negative");
            }
        });
    };

    this.posts.align = function(){
        $(".post").each(function(i){
            var t = $(this);

            var postCustomAlign = t.find("div[data-align]").attr('data-align');
            if(postCustomAlign !== undefined){
                if(postCustomAlign == "left"){
                    t.addClass("alignLeft");
                }
                else if(postCustomAlign == "right"){
                    t.addClass("alignRight");
                }
                else if(postCustomAlign == "center" || postCustomAlign == "centre" ){
                    t.addClass("alignCenter");
                }
                else if(postCustomAlign == "bottomleft"){
                    t.addClass("alignBottomLeft");
                }

            }else{
                if(defaultContentAlignment == "alternate"){
                    if (i % 2 === 0) {
                        t.addClass("alignLeft");
                    }else {
                        t.addClass("alignRight");
                    }
                }else if(defaultContentAlignment == "left"){
                    t.addClass("alignLeft");
                }
                else if(defaultContentAlignment == "right"){
                    t.addClass("alignRight");
                }
                else if(defaultContentAlignment == "center" || defaultContentAlignment == "centre"){
                    t.addClass("alignCenter");
                }
                else if(defaultContentAlignment == "bottomleft"){
                    t.addClass("alignBottomLeft");
                }

                if(animateTitles){
                    if(!autoScroller){t.addClass("animateContent");}
                }
            }
        });
    };

    this.posts.titleTransitions = function(){
        $(".post").each(function(i){
            var t = $(this);
            var postCustomTransition = t.find("div[data-transition]").attr('data-transition');

                if(postCustomTransition !== undefined){
                    if(postCustomTransition == "left"){
                        t.addClass("transitionLeft");
                    }
                    else if(postCustomTransition == "right"){
                        t.addClass("transitionRight");
                    }
                    else if(postCustomTransition == "bottom"){
                        t.addClass("transitionBottom");
                    }
                    else if(postCustomTransition == "bottomleft"){
                        t.addClass("transitionBottomLeft");
                    }
                    else if(postCustomTransition == "fade"){
                        t.addClass("transitionFade");
                    }

                }else if(defaultContentTransition != "auto"){
                    if(defaultContentTransition == "left"){
                        t.addClass("transitionLeft");
                    }
                    else if(defaultContentTransition == "right"){
                        t.addClass("transitionRight");
                    }
                    else if(defaultContentTransition == "bottom"){
                        t.addClass("transitionBottom");
                    }
                    else if(defaultContentTransition == "bottomleft"){
                        t.addClass("transitionBottomLeft");
                    }
                    else if(defaultContentTransition == "fade"){
                        t.addClass("transitionFade");
                    }
                    if(animateTitles){
                        if(!autoScroller){t.addClass("animateContent");}
                    }
                }
        });
    };

    this.posts.contentImage = function(){
        $(".post").each(function(i){
            if($(".mediaExtract .media", this).length<=0 && $(".mediaExtract img[src$='#media']",this).length<=0){
                $(this).addClass("contentHasNoMedia");
            }else if($(".mediaExtract img[src$='#media']",this).length>=1){
                $(".content", this).append("<div class='media'></div>");
                $(".mediaExtract img[src$='#media']", this).appendTo($(".media", this));
            }else if($(".mediaExtract .media",this).length>=1){

                if($(".media", this).closest("div")[0].className =="media"){
                    $("div.media", this).appendTo($(".content", this));
                }else{
                    $(".content", this).append("<div class='media'>");
                    $(".media", this).appendTo($("div.media", this));
                    $(".media *", this).removeClass("media");
                }
            }
        });
        $(".mediaExtract").remove();
    };

    this.posts.color = function(){
        $posts.each(function(){
            var t = $(this);
            var selector = t.find("div[data-color]");
            var col = selector.attr('data-color');
            if($(this).hasClass("noCoverImage")){
                if (selector.length > 0){
                    t.find(".contentWrapper").css({background:col});
                }else{
                    tagToColor(t);
                }
            }
        });
        function tagToColor(t){
            var matchClass = t.attr("class").split(" ").toString().match(/tag-.*/i);
            $.each(taggedColors, function(i2,e2){
                if(matchClass==i2){
                    t.find(".contentWrapper").css({background:e2});
                }
            });
        }
    };

    this.post.open = function(item){
        $("body").addClass("showPost");
        item.addClass("showPost");
        that.post.animatePostContent($ajaxedContainer.find(".articleContent").children());
        scroll.simpleGoToPost(item.index(), true);
    };

    this.getOpened = function(){
        var i = $(".postItem.showPost").index();
        return i;
    };

    this.post.close = function(){
        $("body").removeClass("showPost");
        $posts.removeClass("showPost");

    };

    this.post.animatePostContent = function(s){
        var $selector = s;
        var that = this;
        var len = $selector.length;

        this.load = function(){
            $selector.addClass("scrollTransition hidden");
            that.onScroll();
        };

        this.onScroll = function(){
            var contentItems = [];
            if($selector.hasClass("hidden")){
                $selector.each(function(i,e){
                    if($(this).offset().top+35 < $($ajaxedContainer).height() + $($ajaxedContainer).scrollTop() && ($(this).offset().top+$(this).height()+35) > $($ajaxedContainer).scrollTop() && $selector.hasClass("hidden")){
                        contentItems.push($(this));
                    }
                    if(i == len -1){
                        $(contentItems).each(function(j,e){
                            setTimeout(function(){$(e).removeClass("hidden");},(50*j));
                        });
                    }
                });
            }
        };
        that.load();

        $(".articleContainer").scroll(function () {
            that.onScroll();
        });
    };

    this.load();
};

/* ============================================================ */
/* Sliders auto scrolling system */
/* ============================================================ */
var ScrollSystem = function(){
    var postsOffsetArray = [];
    var animationTime=400;
    var that = this;
    var $dots;
    var $posts = $(".slider .postItem");
    var currentPost;
    var mouseOver = false;
    var timeoutId;
    var count=0;
    var count2=0;
    var div="#container";
    var $scrollDiv = $(div);

    this.load = function(){

        that.getPostOffsetPositions();
        that.toClosest();
        that.pagination();
        currentPost = that.findClosestPostIndex();
        setTimeout(function(){
            that.pagination.onClick($( ".pagePaginationContainer .dot" ).eq(0));
            $(".pagination .prev").addClass("fade");
        },50);
        $("#container").on('scroll',function(){
            if($("body").hasClass("home-template") || $("body").hasClass("tag-template") || $("body").hasClass("archive-template") || $("body").hasClass("author-template")){
                var i = that.findClosestPostIndex();
                that.pagination.onClick($( ".pagePaginationContainer .dot" ).eq(i));
                if(!autoScroller){
                    $(".slider .postItem").eq(i).removeClass("animateContent");
                }
            }
        });

        $(".slider").swipe( {
            swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
                if($("body").hasClass("home-template") || $("body").hasClass("tag-template") || $("body").hasClass("archive-template") || $("body").hasClass("author-template")){
                    if(direction == "down"){
                        that.toPrev();
                    }else if(direction == "up"){
                        that.toNext();
                    }
                }
            },
            threshold:120
        });

        $("body").on('click','.next',function(){
            that.toNext();
        });
        $("body").on('click','.prev',function(){
            that.toPrev();
        });

        $( window ).resize(function() {
            if($("body").hasClass("home-template") || $("body").hasClass("tag-template") || $("body").hasClass("archive-template") || $("body").hasClass("author-template") || $("body").hasClass("showPost")){
                that.getPostOffsetPositions();
                if(!$("body").hasClass("showPost")){
                    that.simpleGoToPost($(".postItem.onShow").index());
                }else{
                    that.simpleGoToPost(slider.getOpened());
                }
            }
        });

        if(autoScroller){
            $("html").addClass("autoScroller");
            $( ".postItem .reflow" ).mouseover(function() {
                var c = $(this).closest(".postItem").index();
                if( $(".postItem .reflow .content").eq(c).height() > $(".postItem .reflow").eq(c).height() ){
                    mouseOver = true;
                }else{
                    mouseOver = false;
                }
            });
            $( ".postItem  .reflow" ).mouseout(function() {
                mouseOver = false;
            });
            $("body").on('DOMMouseScroll mousewheel', function(e){
                if($("body").hasClass("home-template") || $("body").hasClass("tag-template") || $("body").hasClass("archive-template") || $("body").hasClass("author-template")){
                    that.autoScroll(e);
                }
            });
        }
    };

    this.findClosestPostIndex = function(){
        $scrollDiv = $(div);

        function closest(num, arr) {
            var curr = arr[0];
            var diff = Math.abs (num - curr);
            for (var val = 0; val < arr.length; val++) {
                var newdiff = Math.abs (num - arr[val]);
                if (newdiff < diff) {
                    diff = newdiff;
                    curr = val;
                }
            }
            return curr;
        }
        var curr = closest($("#container").scrollTop(), postsOffsetArray);
        currentPost = curr;

        $(".postItem").removeClass("onShow");
        $(".postItem").eq(curr).addClass("onShow");
        $(".pagination .next,.pagination .prev").removeClass("fade");
        if(curr <= 0){
            $(".pagination .prev").addClass("fade");
        }else if(curr >= (postsOffsetArray.length-1)){
            $(".pagination .next").addClass("fade");
        }

        return curr;
    };

    this.autoScroll = function(e){
        var time = 100;

        rateLimit(e);
        function rateLimit(e){
            var waiting = false;
            var callback = onWheel(e);
            var rtn = function(){
                if(waiting) return;
                waiting = true;
                setTimeout(function(){
                    waiting = false;
                    callback();
                }, time);
            };
            return rtn;
        }

        function onWheel(e){
            var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
            if(e.originalEvent.wheelDelta !==undefined){

                if(Math.abs(e.originalEvent.wheelDelta)>=80){
                    start();
                }
                if(Math.abs(e.originalEvent.wheelDelta)===12 ){
                    if( count2===0){
                        start();
                    }
                }
            }else if(e.originalEvent.detail !==undefined){
                if(Math.abs(e.originalEvent.detail)>=3){
                    start();
                }
                if(Math.abs(e.originalEvent.detail)===1 && count2===0){
                    start();
                }
            }
            count2++;

            function start(){
                if(count===0 && scrollStart && mouseOver === false){
                    scrollStart=false;
                    move(delta);
                }
                scrollEnd = false;
                clearTimeout(timeoutId);
                timeoutId = setTimeout(function(){
                    scrollEnd = true;
                    count = 0;
                    scrollStart = true;
                    count2=0;
                }, 150);
                count++;
            }

            function move(delta){
                if(delta < 0 ) {
                    scrollEvent=true;
                    that.toNext();
                }else {
                    scrollEvent=true;
                    that.toPrev();
                }
            }
        }
    };

    this.getPostOffsetPositions = function(){
        postsOffsetArray = [];
        $(".slider .postItem").each(function(){
            var postOffsetTop = $(this).position().top;
            postsOffsetArray.push(postOffsetTop);
        });
    };

    this.toClosest = function(smooth){
        currentPost = that.findClosestPostIndex();
        var newPos = $(".slider .postItem").eq(currentPost).position().top;
        if(smooth){
            $("#container").animate({ scrollTop: newPos },{complete:function(){
            }},{duration:animationTime});
        }else{
            $("#container").scrollTop(newPos);
        }
    };

    this.toNext = function(){
        that.getPostOffsetPositions();
        var c = that.findClosestPostIndex();
        if(postsOffsetArray.length > c+1){
            that.goToPost(c+1,true);
        }else{
            scrollEvent = false;
        }
    };

    this.toPrev = function(){
        that.getPostOffsetPositions();
        var c = that.findClosestPostIndex();
        if(c-1 >= 0){
            that.goToPost(c-1,true);
        }else{
            scrollEvent = false;
        }
    };

    this.simpleGoToPost = function(item ,smooth){
        var newPos = $(".slider .postItem").eq(item).position().top;
        if(smooth){
            $("#container").animate({ scrollTop: newPos },{complete:function(){
            }},{duration:animationTime});
        }else{
            $("#container").scrollTop(newPos);
        }
    };

    this.goToPost = function(postNum,smooth){
        var c = that.findClosestPostIndex();
        currentPost = postNum;
        var times = Math.abs(c - currentPost) > 3 ? 3 :Math.abs(c - currentPost);
        var difference = animationTime*times;
        var newPos = $(".slider .postItem").eq(postNum).position().top;
        this.animateTitles(postNum,difference);
        $(".post").removeClass("onShow");
        $(".post").eq(postNum).addClass("onShow");
        if(smooth){
            $("#container").animate({ scrollTop: newPos },{duration: difference,complete:function(){
                scrollEvent = false;
            }});
        }else{
            $("#container").scrollTop(newPos);
            scrollEvent = false;
        }
    };
    var hidescroll;
    this.animateTitles = function(postNum,time){

        $posts = $(".slider .postItem");
        if(animateTitles){
            $posts.eq(postNum).addClass("animateContent");
            $('.postItem .reflow').perfectScrollbar("destroy");

            window.clearTimeout(hidescroll);
            setTimeout(function(){
                $posts.eq(postNum).removeClass("animateContent");
            },100);
            hidescroll = window.setTimeout(function(){
                $('.postItem .reflow').eq(postNum).find("h1").text();
                $('.postItem .reflow').perfectScrollbar("update");
                $('.postItem .reflow').eq(postNum).perfectScrollbar({suppressScrollX: true});
            },1000);

        }
    };

    this.pagination = function(){
        var $postPagContainer = $( ".pagePaginationContainer .content" );
        this.setup = function(){
            $(".slider .postItem").each(function(i){
                $postPagContainer.append("<div class='dot'><div><span class='onPage'>"+ (i+1) +"</span>╱<span class='ofPages'>"+$(".slider .postItem").length+"</span></div></div>");
            });
        };
        this.setup();

        that.pagination.onClick = function($dot){
            $( ".pagePaginationContainer .dot" ).removeClass("active");
            $dot.addClass("active");
            var move = (($postPagContainer.height())/2)-($dot.index()*24);
            $postPagContainer.css({"top":move});
        };

        $( ".pagePaginationContainer .content .dot" ).on('click',function() {
            if(!$(this).hasClass("active")){
                if(!scrollEvent){
                    scrollEvent=true;
                    that.goToPost($(this).index(),true);
                }
            }
        });
    };

    this.load();
};

/* ============================================================ */
/* Ajax Loading  */
/* ============================================================ */

var AjaxPageLoading = function(){

    $(".ajaxedContainer").addClass("ready");
    var loading = false;
    var timeOut;
    var History = window.History;

    // Check if history is enabled for the browser
    if ( ! History.enabled) {
        return false;
    }
    var that = this;
    var pageClasses = '#container';
    var $mainContainer = $(".main");
    var $AjaxContainer = $(".ajaxContent");
    var clicked = false;
    var $body = $('body');

    var onClickLink = function(classes, pageRenderType){
        $body.on('click', classes, function(e) { // for standard pages
            e.preventDefault();
            firstLoad = false;
            if (loading === false) {
                var currentState = History.getState();
                var $selector = $(this);
                var $item = $(this).parents(".postItem");
                var url = $(this).attr('href');
                if (url.replace(/^.*\/\/[^\/]+/, '') !== currentState.url.replace(/^.*\/\/[^\/]+/, '')) {
                    $.get(url, function(data) {
                        clicked = true;
                        loading = true;
                        pageRenderType(data, url, $item,true,currentState);
                    }).fail(this.failLoad);
                }
            }
        });
    };
    onClickLink(".ajaxPageLink", function(data, url,item,historyChange,currentState){that.renderPage(data, url, item,historyChange,currentState);} );
    onClickLink(".ajaxSliderPostLink", function(data, url,item,historyChange,currentState){that.renderPostPage(data, url, item,historyChange,currentState);} );
    onClickLink(".ajaxCloseLink", function(data, url,item,historyChange,currentState){that.closePostPage(data, url, item,historyChange,currentState);} );

    History.Adapter.bind(window, 'statechange', function() {
        NProgress.start();
        if(clicked === false){
            var State = History.getState();
            $.get(State.url, function(data) {
                that.renderPage(data,State.url,"",false,History.savedStates[History.savedStates.length -2]);
            }).fail(this.failLoad);
        }
        clicked = false;
    });

    that.renderPage = function(data, url,item,historyChange,currentState){
        var title = data.match(/<title>(.*?)<\/title>/);
        if(historyChange){
            History.pushState({}, title[1],url);//Trigger change state
        }
        var $newContent = $(data).find(".main").contents();
        clearTimeout(timeOut);

        $(".innerWrapper").dequeue().stop().fadeOut( 300, function() {
            that.updatePageClasses(data);
            nav.navHighlight();
            $(".innerWrapper").show().css({ opacity: 0 });
            $mainContainer.show().html($newContent);
            tagList.load();
            authorlist.load();
            gmaps.load();
            $('.postItem .reflow').perfectScrollbar({suppressScrollX: true});
            timeOut = window.setTimeout(function() {
                if($(".home-template, .tag-template, .archive-template, .author-template").length > 0){
                    $(".ajaxedContainer").addClass("ready");
                    scroll = new ScrollSystem();
                    slider = new Slider();
                    $(".pagination").html($(data).filter(".pagination").contents());
                    $(".postContent,.articleContent, .postItem .content, .postItem .media").fitVids();// Re run fitvid.js
                }
                $(".innerWrapper").dequeue().stop().fadeTo(300,1);
                NProgress.done();
                loading = false;
            }, 400);
        });

    };

    that.renderPostPage = function(data, url,item,historyChange,currentState){
        $AjaxContainer = $(".ajaxContent");
        var title = data.match(/<title>(.*?)<\/title>/);
        $(".closePostButton").attr("href",currentState.url);
        if(historyChange){
            History.pushState({}, title[1],url);//Trigger change state
        }
        var $newContent = $(data).find(".main").contents();
        $AjaxContainer.show().html($newContent);
        $AjaxContainer.find(".media").remove();
        $(".articleContent").fitVids();// Re run fitvid.js
        window.setTimeout(function() {
            that.updatePageClasses(data);
            slider.post.open(item);
            comments.load();
            $('pre code').each(function(i, block) {
                try{hljs.highlightBlock(block);}catch(err){}
            });
            NProgress.done();
            loading = false;
        }, 500);
    };

    that.closePostPage = function(data, url,item,historyChange,currentState){
        clearTimeout(timeOut);
        var title = data.match(/<title>(.*?)<\/title>/);
        if(historyChange){
            History.pushState({}, title[1],url);//Trigger change state
        }
        that.updatePageClasses(data);
        if($(".slider .postItem").length > 0){
            slider.post.close();
            timeOut = window.setTimeout(function() {
                $AjaxContainer.show().html("");
                NProgress.done();
            }, 500);
        }else{
            that.renderPage(data, url);
        }

        loading = false;
    };

    this.updatePageClasses = function(data){
        $body.attr('class', $(pageClasses, data).attr('class') );
        $(pageClasses).attr('class', $(pageClasses, data).attr('class') );
    };

    this.failLoad = function(){
        console.log( "Error. Page may not exist or you have lost internet connection." );
    };
};
