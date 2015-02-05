function IsAndroid()  
{
   var userAgentInfo = navigator.userAgent;  
   var Agents = new Array("Android");  
   var flag = false;  
   for (var v = 0; v < Agents.length; v++) {  
       if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = true; break; }  
   }  
   return flag;  
}

function IsIphone4 () {
    if (window.screen.width==320&&window.screen.height==480) {
        return true;
    }
    else {
         return false;
    }
   
}

function is_weixn(){  
    var ua = navigator.userAgent.toLowerCase();  
    
    if(ua.match(/MicroMessenger/i)=="micromessenger") {  
        return true;  
    } else {  
        return false;  
    }  
}          



function showWeiXinHint(){
    $("#weixin_hint").removeClass("f-dn");
}
function hideWeiXinHint(){
    $("#weixin_hint").addClass("f-dn");
}

function GetRequest() {
   var url = location.search; //获取url中"?"符后的字串
   var theRequest = new Object();
   if (url.indexOf("?") != -1) {
      var str = url.substr(1);
      strs = str.split("&");
      for(var i = 0; i < strs.length; i ++) {
         theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
      }
   }
   return theRequest;
}


function adaptive(){
    var w = $(window).width();
    $("body").css("font-size", 62.5 * w  / 320+"%");
    // console.log("devicew="+w);
}

function loadimg(pics, progressCallBack, completeCallback) {
    $(".loading_page").find(".animated").removeClass("f-dn");
    var index = 0;
    var len = pics.length;
    var img = new Image();
    var load = function () {
        img.src = pics[index];
        img.onload = function () {
            // 控制台显示加载图片信息
            // console.log('第' + index + '个img被预加载', img.src);
            progressCallBack(Math.floor(((index + 1) / len) * 100) + "%");
            i = index;
            index++;
            
            if (index < len) {
                load();
            } else {
                completeCallback()
            }
        }
        return img;
    }
    if (len > 0) {
        load();
    } else {
        completeCallback();
    }
    return {
        pics:pics,
        load:load,
        progress:progressCallBack,
        complete:completeCallback
    };
}

//字体自适应
window.onresize=adaptive;

$(function(){
    /*
     * 图片预加载
     * pics 预加载图片的对象数组
     * progressCallBack 加载中回调函数
     * completeCallback 图片加载完成回调函数
     */
     $(".m-progress").removeClass("f-dn");

    var weixin = 0,
        firstA = 0;
        firstPrize = 1,
        usedNumber = 0,
        tooLate = 0,
        totalSharedValue = 0,
        myShareValue = 0,
        myTotalShareValue = 0,
        lotteryValue = 0;
        
    var wishIndex = 0;
    //点击发送手机号
    var clicked = 0;
    var pics = new Array();
    //cookie中获取微信config需要的参数，后台给
    var jsapiTicket = $.cookie("jsticket"),
        openid = $.cookie("openid"),
        shareid = openid + '_' + Date.now(),
        jsapiElements = jsapiTicket.split(","),
        jsapiAppId = jsapiElements[0],
        jsapiTimestamp = parseInt(jsapiElements[1]),
        jsapiNonceStr = jsapiElements[2],
        jsapiSignature = jsapiElements[3];
    
    

     //自定义祝福语
    var wishTitleContent = ["“袋你任性袋你壕”","“Fun抢福袋我最拼”","“默默抢福袋 低调送祝福”",""];

    var wishContent = ["虽然我不是土豪，可今天就是要任性的给你送个C&A大福袋，快来看看我给你准备了什么!","为了给你送上新春祝福，我也是拼了！C&A福袋拿去，赶紧愉快地开始买买买吧！","C&A福袋已抢，我的祝福只能送到这里，新春一定要更时尚更幸福哟！"]; 

    //获取url中 shareid参数作为shareby
    var Request = GetRequest(),
        sharedBy = Request['sharedby'],
        originShareId = Request['shareid'],
        weixin =  sharedBy ? 1 : 0;
        
    
    $(document).find(".preload").each(function(e){
        if(this.src.indexOf("images")!=-1){
            pics.push(this.src+"?"+e);
        }
    });

    loadimg(pics,function(w){
        
        var len = pics.length;
        //console.log(w);
        var per = parseInt(w);
        //console.log(per);
        $(".loading_num").html(w);

    },function(){
        $(".loading_num").html('100%');
        adaptive();
        $(".loading_page").remove();
        //get lucky bag count
        $.ajax({
            url:'/luckybag',
            type:'GET',
            dataType:'json',
            success:function(response){
                var luckyCount = response.lotterycount;
                var count = [0, 0, 0, 0, 0, 0, 0];
                for(var i=0; i<7; i++){
                    count[i] = parseInt(luckyCount/Math.pow(10, 6-i)) % 10;
                }
                
                var numPics = ["images/0.png","images/1.png","images/2.png","images/3.png","images/4.png","images/5.png","images/6.png","images/7.png","images/8.png","images/9.png"];

                for(var i=0; i<7; i++){
                    var j=i+1;
                    
                    $("#num" + j).attr("src",numPics[count[i]]);
                    $("#num2" + j).attr("src",numPics[count[i]]);
                }
            }
        });
        
        //微信config
        wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: jsapiAppId, // 必填，公众号的唯一标识
            timestamp: jsapiTimestamp, // 必填，生成签名的时间戳
            nonceStr: jsapiNonceStr, // 必填，生成签名的随机串
            signature: jsapiSignature,// 必填，签名，见附录1
            jsApiList: ["onMenuShareTimeline","onMenuShareAppMessage","chooseImage","uploadImage","downloadImage"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });
        if(weixin === 1){
            $(".m-screen01").removeClass("f-dn");
            //获取原分享人头像
            $.ajax({
                url:'/originUser?shareid='+originShareId,
                type:'GET',
                dataType:'json',
                success:function(response){
                    var shareTitle = response.title;
                    var shareContent = response.content;
                    myShareValue = parseInt(response.value || 0);
                    myTotalShareValue = 200 - myShareValue;

                    $(".page0_cash").html(myTotalShareValue);
                    if(shareTitle.length === 0){
                        $(".page0_wishCus").removeClass("f-dn");
                        $("#page0_wishC").html(shareContent);
                    }  
                    else{
                        $(".page0_wishText").removeClass("f-dn");
                        $("#page0_wishTitle").html(shareTitle);
                        $("#page0_wish").html(shareContent);
                    }
                    
                    $(".profile0_image").attr("src",response.headimgurl);
                    $(".page0_shareId").html(response.nickname);
                    $(".page3_nickname").removeClass("f-dn");
                    $(".page3_nickname").html("从好友"+response.nickname+"那里");
                    $(".page4_nickname").removeClass("f-dn");
                    $(".page4_nickname").html("从好友"+response.nickname+"那里");

                }
            });
            $.ajax({
                url:'/users?sharedby='+sharedBy,
                type:'GET',
                dataType:'json',
                success:function(response){
                    //console.log(response);
                    
                    if($.isArray(response) && response.length > 0){
                        
                        for(var i=0; i < 4; i++){
                            var j = i+1;
                            
                            
                            if (response[i]) 
                            {                        
                                $(".profile" + j + "_image").attr("src",response[i].headimgurl);
                                $(".profile" + j + "_shareId").html(response[i].nickname);
                                $(".profile" + j + "_cash").html(parseInt(response[i].value));
                                $(".profile" + j ).removeClass("f-dn");
                            }
                        }

                        for(var i=0; i<response.length; i++){
                            totalSharedValue += parseInt(response[i].value);
                        }

                    }else{
                        //显示您是第一个抢红包的朋友
                        $(".page0_firstA").removeClass("f-dn");
                        
                    }
                        //红包已抢完  
                    if(totalSharedValue>=myTotalShareValue){
                        $('.lateInfo').removeClass("f-dn");
                        $('.lateBtn').removeClass("f-dn");
                    }
                }

            });
            //TODO: 通过Ajax调用 /users, 获得有多少好友已经抢过福袋，然后再进行处理
            if(firstA == 1){
                $(".page0_firstA").removeClass("f-dn");
                $(".page0_circle").addClass("f-dn");
            }
        }
        else{
             $(".m-screen0").removeClass("f-dn");
             $(".m-screen0").find(".animated").removeClass("f-ann");
        }

    });
    
    
    
    //分享各个参数初始化
    var shareUrl = "http://" + window.location.host + "?sharedby=" + openid 
                + "&shareid=" + shareid + "&utm_source=share&utm_medium=share&utm_campaign=CNYsocial",
        shareImg = "http://" + window.location.host + '/images/icon.jpg',
        random = Math.random(),
        title = random<0.5?'福袋已打包送到，我真的只能帮你到这儿了…':'福袋很多~可是抢抢也是会没了！你可以不着急，但真的得赶紧抢呀~';
    

    //微信分享朋友，分享朋友圈逻辑
    function weixinShare(){
        var arrayIndex = wishIndex;
        if (arrayIndex<=-100) 
        {
            arrayIndex = 3;
        };

        wx.onMenuShareAppMessage({
                title: title, // 分享标题
                desc: wishContent[arrayIndex], // 分享描述
                link: shareUrl, // 分享链接
                imgUrl: shareImg, // 分享图标
                success: function () { 
                    //tracking
                    ga('send', 'event', 'CNY-friends', 'success', 'click');
                    
                    // 用户确认分享后执行的回调函数
                    //分享成功后调用后台接口
                    $.ajax({
                        url: '/shareInfos',
                        type: 'post',
                        dataType: 'json',
                        data: {
                            openid: openid,
                            shareid: shareid,
                            sharedby: sharedBy,
                            value: lotteryValue,
                            title:wishTitleContent[wishIndex<=-100?3:wishIndex],
                            content:wishContent[wishIndex<=-100?3:wishIndex]
                        },
                        success:function(responseObj){
                            // alert(response.success);
                        }
                    }); 
                },
                cancel: function () { 
                    // 用户取消分享后执行的回调函数
                }
            });
            //分享给朋友圈
            wx.onMenuShareTimeline({
                title: title, // 分享标题
                desc:wishContent[wishIndex<=-100?3:wishIndex],
                link: shareUrl, // 分享链接
                imgUrl:shareImg, // 分享图标
                success: function () { 
                    //tracking
                    ga('send', 'event', 'CNY-social', 'success', 'click');
                    
                    // 用户确认分享后执行的回调函数
                    $.ajax({
                        url: '/shareInfos',
                        type: 'post',
                        dataType: 'json',
                        data: {
                            openid: openid,
                            shareid: shareid,
                            sharedby: sharedBy,
                            title:wishTitleContent[wishIndex<=-100?3:wishIndex],
                            content:wishContent[wishIndex<=-100?3:wishIndex]
                        },
                        success:function(responseObj){
                            // alert(response.success);
                        }
                    });
                },
                cancel: function () { 
                    // 用户取消分享后执行的回调函数
                }
            });
    }


    //微信接口初始化
    wx.ready(function(){
        
        // var arrayIndex = ;
        // var shareData = {
        //             openid:openid,
        //             shareid:shareid,
        //             title:wishTitleContent[wishIndex<=-100?3:wishIndex],
        //             content:wishContent[wishIndex<=-100?3:wishIndex]
        //         };
        weixinShare();

    });


    var imgURL = "",
        userMobile = "",
        awardCode = "",
        deviceWidth = $(window).width(),
        deviceHeight = $(window).height(),
        trackingCampaign = "color_riche";

    var  infoMasked = !1;
        
        
    var themeSrc = "images/poster-mobile-A.png";
    var themeSrc2 = "images/poster-mobile-A_1.jpg";
    
    var content;

    //iphone4适应
     if (IsIphone4()==true) {
        
        $(".page0_ip4").attr("src", "images/page0_bg_origin.jpg");
        $(".page1_ip4").attr("src", "images/page1_bg_origin.jpg");
        $(".page2_ip4").attr("src", "images/page2_bg_origin.jpg");
        $(".page3_ip4").attr("src", "images/page3_bg_origin.jpg");
        $(".page4_ip4").attr("src", "images/page3_bg_origin.jpg");
        $(".loading_ip4").attr("src","images/loading_image.jpg");
        $(".usedNumber_ip4").attr("src","images/usedNumber_origin.png");
        $(".campInfo_ip4").attr("src","images/campInfo_origin.jpg");
        $(".confirmWish_ip4").attr("src","images/confirmWish_origin.png");
        $(".lateInfo_ip4").attr("src","images/lateInfo_origin.png");


    };

    // 禁止文版被拖动
    document.body.style.userSelect = 'none';
    document.body.style.mozUserSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    //禁止图片被选中
    document.onselectstart = new Function('event.returnValue=false;');
    //禁止图片被拖动
    document.ondragstart = new Function('event.returnValue=false;');

    $(window).on('touchmove.scroll', function (e) {e.preventDefault();});
    $(window).on('scroll.scroll',function (e) {e.preventDefault();});
    

    $(".page1_info").click(function(e){
        infoMasked = !0;
        // ga('send', 'event', 'Hydrapower', 'Hydrapower/toshare', 'click');
        $(".activity_info").removeClass("f-dn");
        $(".activity_btn").removeClass("f-dn");

    });



    $(".activity_info").click(function(e){
        
        if(infoMasked){
            infoMasked = !1;
            $(".activity_info").addClass("f-dn");
            $(".activity_btn").addClass("f-dn"); 
        }
    });

    $(".activity_btn").click(function(e){
        
        if(infoMasked){
            infoMasked = !1;
            $(".activity_info").addClass("f-dn");
            $(".activity_btn").addClass("f-dn"); 
        }
    });

    $(".page1_belt").click(function(e){
         
         $(".m-screen0").addClass("animated fadeOutUp1");
         ga('send', 'event', 'CNY-social', 'move', 'click');
         //$('.m-screen0').addClass("f-dn");
         $('.m-screen1').removeClass("f-dn");
         $(".m-screen1").addClass("animated f-ad1 fadeInUp1");            
         $(".m-screen1").find(".animated").removeClass("f-ann")
    });

    function tearBag()
    {
        $(".m-screen0").addClass("animated fadeOutUp1");
         //$('.m-screen0').addClass("f-dn");
         $('.m-screen1').removeClass("f-dn");
         $(".m-screen1").addClass("animated f-ad1 fadeInUp1");   


         
         $(".m-screen1").find(".animated").removeClass("f-ann")
    };


    // 添加手势箭头
    // var startX,startY;
    // var belt = $("#page1_belt");
    // var beltWidth = 0.2 *screen.width;

    // var bgHeight = screen.width *960/640;

    // var pointRightX = parseInt(0.4 * screen.width + beltWidth);
    // var pointX = parseInt(0.4 * screen.width);
    // var pointY = 0.5 * bgHeight;
    // var pointBottomY = pointY + beltWidth*309/134;
    // // console.log(pointBottomY+"y: " + pointY);
    // var arrow = $(".page1_arrowMove");
    // var isSuccess = false;
    // var hammer = new Hammer(document.getElementById('page1_bg'));
    // hammer.on('panstart',function(e){
    //     isSuccess = false;
    //     // startX = e.center.x;
    //     // startY = e.center.y;
    //     // arrow.css("display","block");
    //     // arrow.css("left",startX);
    //     // arrow.css("top",startY);
    //     // arrow.css("width",0);   
    //     $(".page1_arrow").css("display","none");

    // });

    // hammer.on('panmove',function(e){
    //     oX = e.center.x;
    //     oY = e.center.y;
    //     dX = oX-startX;
    //     dY = oY-startY;
    //     var rotate = Math.atan2(dY,dX)*180/Math.PI;
    //     arrow.rotate(rotate);
    //     // arrow.rotate(90);
    //     arrow.css("width",dX>0?dX:-dX);
        


    //     if (oX>pointX && oX<pointRightX && (oY>pointY && oY<pointBottomY))
    //     {
    //         // console.log("tear success");
    //         isSuccess = true;
    //     }
    // });
    // hammer.on('panend',function(e){
    //     if(isSuccess)
    //     {
    //         tearBag();
    //         ga('send', 'event', 'CNY-social', 'move', 'click');
    //     }
    //     else
    //     {
    //         $(".page1_arrow").css("display","block");
    //     }
    //     arrow.css("display","none");
    // });

    //撕开福袋方法
     var sPoint = {
        x:0,
        y:0
    }

    var ePoint = {
        x:0,
        y:0
    }
    var isSuccess = false;

    var tearDistance = function(point1,point2){
        var distanceX = ePoint.x - sPoint.x;
        var distanceY = ePoint.y - sPoint.y;      
        console.log("distanceX:"+distanceX+",distanceY:"+distanceY);
        
    }


    var tearEvent = function(e){
        // console.log(e)
        var type = e.type;
        var touch = e.touches[0];
        switch(type){
            case "touchstart":
                
                sPoint.x = touch.pageX
                sPoint.y = touch.pageY
                ePoint.x = touch.pageX
                ePoint.y = touch.pageY
                $(".page1_arrow").css("display","none");
                console.log("s.x:"+sPoint.x+",s.y:"+sPoint.y)
                break;

            case "touchend":
              
                tearDistance(sPoint,ePoint);
                console.log("e.x:"+ePoint.x+",e.y:"+ePoint.y)
                tearDirection(sPoint,ePoint);
                $(".page1_arrow").css("display","block");
                break;

            case "touchmove":
                ePoint.x=touch.pageX
                ePoint.y=touch.pageY
                break;

        }
        

    }


    var tearSwiper = document.getElementById("tear");
    tearSwiper.addEventListener("touchstart",tearEvent);
    tearSwiper.addEventListener("touchmove",tearEvent);
    tearSwiper.addEventListener("touchend",tearEvent);    

    var tearDirection = function(sPoint,ePoint){
        var w = $(window).width();
        var h = $(window).height();
        var distanceX = ePoint.x - sPoint.x;
        var distance = distanceX*distanceX; 

        if(sPoint.y>h/2&&distance>10000){
            isSuccess = true;
            console.log("tear success");
        }
        if(isSuccess){
            tearBag();
            ga('send', 'event', 'CNY-social', 'move', 'click');
        }
        else{
            $(".page1_arrow").css("display","block");
            console.log("fail");
        }
    }


    /* 微信进入首页 */
    
     $(".m-screen1").find(".page2_phoneNumber").on('blur', 'input', function(){
            if($(this).attr('id') === 'input-mobile' ){
                if($.trim($(this).val()) === ''){
                    $(this).val('输入手机号马上抢福袋!');
                }
            }
        }).on('focus', 'input', function(){
            if($(this).attr('id') === 'input-mobile' ){
                if($.trim($(this).val()) === '输入手机号马上抢福袋!'){
                    $(this).val('');
                }
            } 
        });

     $(".m-screen01").find(".page0_phoneNumber").on('blur', 'input', function(){
            if($(this).attr('id') === 'input-mobile2' ){
                if($.trim($(this).val()) === ''){
                    $(this).val('输入手机号来抢ta的福袋!');
                }
            }
        }).on('focus', 'input', function(){
            if($(this).attr('id') === 'input-mobile2' ){
                if($.trim($(this).val()) === '输入手机号来抢ta的福袋!'){
                    $(this).val('');
                }
            } 
        });


    $("#confirmPhone").click(function(e){
        var phone = $("#input-mobile").val();
       
        var phoneRex =  /^(13[0-9]{9})|(14[0-9]{9})|(15[0-9]{9})|(18[0-9]{9})|(17[0-9]{9})$/;
        $("#confirmPhone").addClass("f-dn");
        if (phone=="" || phoneRex.test(phone)==false || phone.length>11){
            alert("您输入的手机号有误")
            $("#confirmPhone").removeClass("f-dn");
        }
        else if(!clicked){
            $.ajax({
                url: '/lottery',
                type: 'post',
                dataType: 'json',
                data: { 
                    mobile: phone,
                    openid:openid,
                    shareid:shareid,
                    sharedby:sharedBy
                },
                success:function(data){
                    // console.log(data);
                    clicked = 1;
                    if (data.success) 
                    {
    
                        console.log("value: "+data.data.value + "code: "+data.data.code);
                        lotteryValue = parseInt(data.data.value);
                        if (lotteryValue == 888) 
                        {
                            firstPrize = 1;
                            lotteryValue = 200;
                        }
                        else{
                            firstPrize = 0;
                            $(".page3_cash1").html(lotteryValue);
                            $(".page3_cash2").html(200-lotteryValue);
                            $(".page5_cash").html(lotteryValue);
                        }
                        $('.page2_confirm').removeClass("f-dn");
                        $('.page2_info').removeClass("f-dn");
                    }
                    else{
                        if (data.errorCode === 'PHONE_USED') 
                        {
                            $('.usedNumber').removeClass("f-dn");
                            $('.usedBtn').removeClass("f-dn");
                            $("#confirmPhone").removeClass("f-dn");
                        }
                        else if (data.errorCode === 'OVER') 
                        {
                            //活动结束
                            $('.lateInfo').removeClass("f-dn");
                            $('.lateBtn').removeClass("f-dn");
                            
                        };
    
                    }
                },
                error:function(data){
                    $("#confirmPhone").removeClass("f-dn");
                }
            });  
        }
        
  

    }); 

    $(".page0_confirmPhone").click(function(e){

        var phone = $("#input-mobile2").val();
       
        var phoneRex =  /^(13[0-9]{9})|(14[0-9]{9})|(15[0-9]{9})|(18[0-9]{9})|(17[0-9]{9})$/;
        console.log(phone);
        $(".page0_confirmPhone").addClass("f-dn");
        if (phone=="" || phoneRex.test(phone)==false || phone.length>11){
                    alert("您输入的手机号有误")
                    $(".page0_confirmPhone").removeClass("f-dn");
        }
        else{
            $.ajax({
            url: '/lottery',
            type: 'post',
            dataType: 'json',
            data: { 
                mobile: phone,
                openid: openid,
                shareid: shareid,
                sharedby: sharedBy
            },
            success:function(data){
                if (data.success) 
                {
                    // console.log("value: "+data.data.value + "code: "+data.data.code);
                    lotteryValue = parseInt(data.data.value);
                    if (lotteryValue == 888) 
                    {
                        firstPrize = 1;
                    }
                    else{
                        firstPrize = 0;
                        $(".page3_cash1").html(parseInt(data.data.value));
                        $(".page3_cash2").html(200-parseInt(data.data.value));
                        $(".page5_cash").html(parseInt(data.data.value));
                    }
                    $('.page2_confirm').removeClass("f-dn");
                    $('.page2_info').removeClass("f-dn");
                }
                else{
                    if (data.errorCode == 'PHONE_USED') 
                    {
                        $('.usedNumber').removeClass("f-dn");
                        $('.usedBtn').removeClass("f-dn");
                        $(".page0_confirmPhone").removeClass("f-dn");
                    }
                    else if (data.errorCode == 'OVER') 
                    {
                        //活动结束
                        $('.lateInfo').removeClass("f-dn");
                        $('.lateBtn').removeClass("f-dn");
                    };

                }
            },
            error:function(data){
                $(".page0_confirmPhone").removeClass("f-dn");
            }
        });
        }
           
    }); 

    

    $('.usedBtn').click(function(e){
        $('.usedNumber').addClass("f-dn");
        $('.usedBtn').addClass("f-dn");
    })

    $('.lateBtn').click(function(e){
        $('.lateInfo').addClass("f-dn");
        $('.lateBtn').addClass("f-dn");
        $(".m-screen01").addClass("f-dn");
        $(".m-screen0").removeClass("f-dn");
        $(".m-screen0").find(".animated").removeClass("f-ann");
    })

    $(".page2_confirm").click(function(e){
        
        $('.m-screen1').addClass("animated fadeOutUp1");
        //$('.m-screen1').addClass("f-dn");


        $('.page2_confirm').addClass("f-dn");
        $('.page2_info').addClass("f-dn");
        $('.m-screen01').addClass("animated fadeOutUp1");
        //$('.m-screen01').addClass("f-dn");


        if(firstPrize==0){

            $('.draw-screen1').removeClass("f-dn");
            $('.draw-screen1').addClass("animated f-ad1 fadeInUp1")
            $(".draw-screen1").find(".animated").removeClass("f-ann")

        }
        else{
            $('.draw-screen2').removeClass("f-dn"); 
            $('.draw-screen2').addClass("animated f-ad1 fadeInUp1")
            $(".draw-screen2").find(".animated").removeClass("f-ann")
        }
         
    });


    
    // 福袋页1

    $(".page3_guide").click(function(e){

        $(".draw-screen1").addClass("animated fadeOutUp1");
        //$(".draw-screen1").addClass("f-dn");
        $(".guide-screen1").removeClass("animated fadeOutDown");
        $(".guide-screen1").removeClass("f-dn");
        $(".guide-screen1").addClass("animated f-ad1 fadeInUp1");        
    })

    $(".page3_coupon").click(function(e){
        $(".draw-screen1").addClass("animated fadeOutUp1");
        //$(".draw-screen1").addClass("f-dn");
        $(".guide-screen1").removeClass("animated fadeOutDown");
        $(".guide-screen1").removeClass("f-dn");
        $(".guide-screen1").addClass("animated f-ad1 fadeInUp1");
    })

    $(".page5_back").click(function(e){

        $(".guide-screen1").addClass("animated fadeOutDown");
        //$(".guide-screen1").addClass("f-dn");

        $(".draw-screen1").removeClass("animated fadeOutUp1");
        $(".draw-screen1").removeClass("animated fadeInUp1");
        //$(".draw-screen1").removeCladd("animated faedInDown");
        $(".draw-screen1").removeClass("f-dn");
        $(".draw-screen1").addClass("animated fadeInDown");

    })
    
    $(".page3_send").click(function(e){
        $(".share-screen").removeClass("f-dn");

    })




    //滑动祝福语
    var maxIndex=3,
        minDistance = 30;

    // var tsPoint = {
    //     x:0,
    //     y:0
    // }

    // var tePoint = {
    //     x:0,
    //     y:0
    // }

    // var swpieDistance = function(point1,point2){
    //     var distanceX = tePoint.x - tsPoint.x;
    //     var distanceY = tePoint.y - tsPoint.y;
         
   

    //     if(wishIndex<0){
    //             wishIndex = wishIndex+maxIndex;
    //     }

    //      //console.log("distanceX:"+distanceX+",distanceY:"+distanceY);
        
    // }


    // var swipeEvent2 = function(e){
    //     // console.log(e)
    //     var type = e.type;
    //     var touch = e.touches[0];
    //     switch(type){
    //         case "touchstart":
                
    //             tsPoint.x = touch.pageX
    //             tsPoint.y = touch.pageY
    //             tePoint.x = touch.pageX
    //             tePoint.y = touch.pageY
    //             break;

    //         case "touchend":
              
    //             swipeDirection2(tsPoint,tePoint);
    //             swpieDistance(tsPoint,tePoint);
    //             break;
    //         case "touchmove":
    //             tePoint.x=touch.pageX
    //             tePoint.y=touch.pageY
    //             break;

    //     }
        

    // }


    // var wishSwiper2 = document.getElementById("wishSwiper2");
    // wishSwiper2.addEventListener("touchstart",swipeEvent2);
    // wishSwiper2.addEventListener("touchmove",swipeEvent2);
    // wishSwiper2.addEventListener("touchend",swipeEvent2);

    






    // var swipeDirection2 = function(tsPoint,tePoint){
    //     var distanceX = tePoint.x - tsPoint.x
    //     wishIndex = wishIndex%maxIndex;
    //     // console.log(wishIndex);
    //     if (distanceX > minDistance || distanceX < minDistance*(-1) ) {
    //         $(".page4_wishTitle1").removeClass("animated fadeOutRight1");
    //         $(".page4_wishTitle1").removeClass("animated fadeInLeft1");
    //         $(".page4_wishTitle2").removeClass("animated fadeOutRight1");
    //         $(".page4_wishTitle2").removeClass("animated fadeInLeft1");
    //         $(".page4_wishTitle3").removeClass("animated fadeOutRight1");
    //         $(".page4_wishTitle3").removeClass("animated fadeInLeft1");
    //         $(".page4_wishTitleC").removeClass("animated fadeOutRight1");
    //         $(".page4_wishTitleC").removeClass("animated fadeInLeft1");

    //         $(".page4_wishTitle1").removeClass("animated fadeOutLeft1");
    //         $(".page4_wishTitle1").removeClass("animated fadeInRight1");
    //         $(".page4_wishTitle2").removeClass("animated fadeOutLeft1");
    //         $(".page4_wishTitle2").removeClass("animated fadeInRight1");
    //         $(".page4_wishTitle3").removeClass("animated fadeOutLeft1");
    //         $(".page4_wishTitle3").removeClass("animated fadeInRight1");
    //         $(".page4_wishTitleC").removeClass("animated fadeOutLeft1");
    //         $(".page4_wishTitleC").removeClass("animated fadeInRight1");
    //     }
            

    //     if(distanceX > minDistance){
    //         console.log("往右滑");
            
            
    //         switch(wishIndex){
    //             case 0:    

    //                 $(".page4_wishTitle1").addClass("animated fadeOutRight1");
                    

    //                 $(".page4_wishTitle2").removeClass("f-ann");
    //                 $(".page4_wishTitle2").addClass("animated fadeInLeft1");
    //                 $(".page4_wishTitle3").addClass("f-ann");
    //                 $(".page4_wishTitleC").addClass("f-ann");
                    
    //                 wishIndex++;

                               
    //                 break;

    //             case 1:

    //                 $(".page4_wishTitle2").addClass("animated fadeOutRight1");
                    
    //                 $(".page4_wishTitle3").removeClass("f-ann");
    //                 $(".page4_wishTitle3").addClass("animated fadeInLeft1");
    //                 $(".page4_wishTitle1").addClass("f-ann");
    //                 $(".page4_wishTitleC").addClass("f-ann");
                    
    //                 wishIndex++;
                    
    //                 break;

    //             case 2:

    //                 $(".page4_wishTitle3").addClass("animated fadeOutRight1");
                   
    //                 $(".page4_wishTitle1").removeClass("f-ann");
    //                 $(".page4_wishTitle1").addClass("animated fadeInLeft1");
    //                 $(".page4_wishTitle2").addClass("f-ann");
    //                 $(".page4_wishTitleC").addClass("f-ann");
                   
    //                 wishIndex++;
    //                 break;

    //             default:
    //                 $(".page4_wishTitleC").addClass("animated fadeOutRight1");
    //                 $(".page4_wishTitle1").removeClass("f-ann");
    //                 $(".page4_wishTitle1").addClass("animated fadeInLeft1");
                    
                    
    //                 wishIndex =0;
    //                 break;


    //         }

            


            
           

            
    //     }else if (distanceX < minDistance*(-1)){//往左滑
    //         console.log("往左滑");

            

    //         switch(wishIndex){
    //             case 0:
    //                 $(".page4_wishTitle1").addClass("animated fadeOutLeft1");
    //                 $(".page4_wishTitle2").addClass("f-ann");
    //                 $(".page4_wishTitle3").removeClass("f-ann");
    //                 $(".page4_wishTitle3").addClass("animated fadeInRight1");
    //                 $(".page4_wishTitleC").addClass("f-ann");
    //                 wishIndex--;
    //                 break;

    //             case 1:
    //                  $(".page4_wishTitle2").addClass("animated fadeOutLeft1");
    //                  $(".page4_wishTitle3").addClass("f-ann");
    //                 $(".page4_wishTitle1").removeClass("f-ann");
    //                 $(".page4_wishTitle1").addClass("animated fadeInRight1");
    //                 $(".page4_wishTitleC").addClass("f-ann");

    //                 wishIndex--;
    //                 break;

    //             case 2:
    //                 $(".page4_wishTitle3").addClass("animated fadeOutLeft1");
    //                 $(".page4_wishTitle1").addClass("f-ann");
    //                 $(".page4_wishTitle2").removeClass("f-ann");
    //                 $(".page4_wishTitle2").addClass("animated fadeInRight1");
    //                 $(".page4_wishTitleC").addClass("f-ann");

    //                 wishIndex--;
    //                 break;

    //              default:
    //                 $(".page4_wishTitleC").addClass("animated fadeOutLeft1");
    //                 $(".page4_wishTitle1").removeClass("f-ann");
    //                 $(".page4_wishTitle1").addClass("animated fadeInRight1");
                    
    //                 wishIndex = 0;
                    
    //                 break;

    //         }

           
    //     }
    //     if(wishIndex>-100&&wishIndex<0){
    //             wishIndex = wishIndex+maxIndex;
    //         }
    //      weixinShare();//重新初始化分享接口，动态改变分享描述
    // }

    $(".page4_arrowR").click(function(e){
        wishIndex = wishIndex%maxIndex;
        $(".page4_wishTitle1").removeClass("animated fadeOutRight1");
        $(".page4_wishTitle1").removeClass("animated fadeInLeft1");
        $(".page4_wishTitle2").removeClass("animated fadeOutRight1");
        $(".page4_wishTitle2").removeClass("animated fadeInLeft1");
        $(".page4_wishTitle3").removeClass("animated fadeOutRight1");
        $(".page4_wishTitle3").removeClass("animated fadeInLeft1");
        $(".page4_wishTitleC").removeClass("animated fadeOutRight1");
        $(".page4_wishTitleC").removeClass("animated fadeInLeft1");

        $(".page4_wishTitle1").removeClass("animated fadeOutLeft1");
        $(".page4_wishTitle1").removeClass("animated fadeInRight1");
        $(".page4_wishTitle2").removeClass("animated fadeOutLeft1");
        $(".page4_wishTitle2").removeClass("animated fadeInRight1");
        $(".page4_wishTitle3").removeClass("animated fadeOutLeft1");
        $(".page4_wishTitle3").removeClass("animated fadeInRight1");
        $(".page4_wishTitleC").removeClass("animated fadeOutLeft1");
        $(".page4_wishTitleC").removeClass("animated fadeInRight1");
         switch(wishIndex){
                case 0:    

                    $(".page4_wishTitle1").addClass("animated fadeOutRight1");
                    

                    $(".page4_wishTitle2").removeClass("f-ann");
                    $(".page4_wishTitle2").addClass("animated fadeInLeft1");
                    $(".page4_wishTitle3").addClass("f-ann");
                    $(".page4_wishTitleC").addClass("f-ann");
                    
                    wishIndex++;

                               
                    break;

                case 1:

                    $(".page4_wishTitle2").addClass("animated fadeOutRight1");
                    
                    $(".page4_wishTitle3").removeClass("f-ann");
                    $(".page4_wishTitle3").addClass("animated fadeInLeft1");
                    $(".page4_wishTitle1").addClass("f-ann");
                    $(".page4_wishTitleC").addClass("f-ann");
                    
                    wishIndex++;
                    
                    break;

                case 2:

                    $(".page4_wishTitle3").addClass("animated fadeOutRight1");
                   
                    $(".page4_wishTitle1").removeClass("f-ann");
                    $(".page4_wishTitle1").addClass("animated fadeInLeft1");
                    $(".page4_wishTitle2").addClass("f-ann");
                    $(".page4_wishTitleC").addClass("f-ann");
                   
                    wishIndex++;
                    break;

                default:
                    $(".page4_wishTitleC").addClass("animated fadeOutRight1");
                    $(".page4_wishTitle1").removeClass("f-ann");
                    $(".page4_wishTitle1").addClass("animated fadeInLeft1");
                    
                    
                    wishIndex =0;
                    break;


            }
            if(wishIndex>-100&&wishIndex<0){
                wishIndex = wishIndex+maxIndex;
            }
            weixinShare();//重新初始化分享接口，动态改变分享描述
    })

    $(".page4_arrowL").click(function(e){
        wishIndex = wishIndex%maxIndex;
        $(".page4_wishTitle1").removeClass("animated fadeOutRight1");
        $(".page4_wishTitle1").removeClass("animated fadeInLeft1");
        $(".page4_wishTitle2").removeClass("animated fadeOutRight1");
        $(".page4_wishTitle2").removeClass("animated fadeInLeft1");
        $(".page4_wishTitle3").removeClass("animated fadeOutRight1");
        $(".page4_wishTitle3").removeClass("animated fadeInLeft1");
        $(".page4_wishTitleC").removeClass("animated fadeOutRight1");
        $(".page4_wishTitleC").removeClass("animated fadeInLeft1");

        $(".page4_wishTitle1").removeClass("animated fadeOutLeft1");
        $(".page4_wishTitle1").removeClass("animated fadeInRight1");
        $(".page4_wishTitle2").removeClass("animated fadeOutLeft1");
        $(".page4_wishTitle2").removeClass("animated fadeInRight1");
        $(".page4_wishTitle3").removeClass("animated fadeOutLeft1");
        $(".page4_wishTitle3").removeClass("animated fadeInRight1");
        $(".page4_wishTitleC").removeClass("animated fadeOutLeft1");
        $(".page4_wishTitleC").removeClass("animated fadeInRight1");
        switch(wishIndex){
                case 0:
                    $(".page4_wishTitle1").addClass("animated fadeOutLeft1");
                    $(".page4_wishTitle2").addClass("f-ann");
                    $(".page4_wishTitle3").removeClass("f-ann");
                    $(".page4_wishTitle3").addClass("animated fadeInRight1");
                    $(".page4_wishTitleC").addClass("f-ann");
                    wishIndex--;
                    break;

                case 1:
                     $(".page4_wishTitle2").addClass("animated fadeOutLeft1");
                     $(".page4_wishTitle3").addClass("f-ann");
                    $(".page4_wishTitle1").removeClass("f-ann");
                    $(".page4_wishTitle1").addClass("animated fadeInRight1");
                    $(".page4_wishTitleC").addClass("f-ann");

                    wishIndex--;
                    break;

                case 2:
                    $(".page4_wishTitle3").addClass("animated fadeOutLeft1");
                    $(".page4_wishTitle1").addClass("f-ann");
                    $(".page4_wishTitle2").removeClass("f-ann");
                    $(".page4_wishTitle2").addClass("animated fadeInRight1");
                    $(".page4_wishTitleC").addClass("f-ann");

                    wishIndex--;
                    break;

                 default:
                    $(".page4_wishTitleC").addClass("animated fadeOutLeft1");
                    $(".page4_wishTitle1").removeClass("f-ann");
                    $(".page4_wishTitle1").addClass("animated fadeInRight1");
                    
                    wishIndex = 0;
                    
                    break;

            }
            if(wishIndex>-100&&wishIndex<0){
                wishIndex = wishIndex+maxIndex;
            }
            weixinShare();//重新初始化分享接口，动态改变分享描述
    })




   //普通福袋祝福语

  

    // var swipeEvent = function(e){
        
    //     var type = e.type;
    //     var touch = e.touches[0];
    //     switch(type){
    //         case "touchstart":
                
    //             tsPoint.x = touch.pageX
    //             tsPoint.y = touch.pageY
    //             tePoint.x = touch.pageX
    //             tePoint.y = touch.pageY
    //             break;

    //         case "touchend":
              
    //             swipeDirection(tsPoint,tePoint);
    //             swpieDistance(tsPoint,tePoint);
    //             break;
    //         case "touchmove":
                
    //             tePoint.x=touch.pageX
    //             tePoint.y=touch.pageY
    //             break;

    //     }
        

    // }
    
    // var wishSwiper = document.getElementById("wishSwiper");
    // wishSwiper.addEventListener("touchstart",swipeEvent);
    // wishSwiper.addEventListener("touchmove",swipeEvent);
    // wishSwiper.addEventListener("touchend",swipeEvent);

  
    // var swipeDirection = function(tsPoint,tePoint){
    //     var distanceX = tePoint.x - tsPoint.x
    //     wishIndex = wishIndex%maxIndex;
    //     // console.log(wishIndex);
    //     // console.log("startX:"+tsPoint.x);
    //     // console.log("endX:"+tePoint.x);

    //     if (distanceX > minDistance || distanceX < minDistance*(-1) ) {
    //         $(".page3_wishTitle1").removeClass("animated fadeOutRight1");
    //         $(".page3_wishTitle1").removeClass("animated fadeInLeft1");
    //         $(".page3_wishTitle2").removeClass("animated fadeOutRight1");
    //         $(".page3_wishTitle2").removeClass("animated fadeInLeft1");
    //         $(".page3_wishTitle3").removeClass("animated fadeOutRight1");
    //         $(".page3_wishTitle3").removeClass("animated fadeInLeft1");
    //         $(".page3_wishTitleC").removeClass("animated fadeOutRight1");
    //         $(".page3_wishTitleC").removeClass("animated fadeInLeft1");

    //         $(".page3_wishTitle1").removeClass("animated fadeOutLeft1");
    //         $(".page3_wishTitle1").removeClass("animated fadeInRight1");
    //         $(".page3_wishTitle2").removeClass("animated fadeOutLeft1");
    //         $(".page3_wishTitle2").removeClass("animated fadeInRight1");
    //         $(".page3_wishTitle3").removeClass("animated fadeOutLeft1");
    //         $(".page3_wishTitle3").removeClass("animated fadeInRight1");
    //         $(".page3_wishTitleC").removeClass("animated fadeOutLeft1");
    //         $(".page3_wishTitleC").removeClass("animated fadeInRight1");
    //     }
            

        

    //     if(distanceX > minDistance){
    //         console.log("往右滑");
            
            
    //         switch(wishIndex){
    //             case 0:    

    //                 $(".page3_wishTitle1").addClass("animated fadeOutRight1");
                    

    //                 $(".page3_wishTitle2").removeClass("f-ann");
    //                 $(".page3_wishTitle2").addClass("animated fadeInLeft1");
    //                 $(".page3_wishTitle3").addClass("f-ann");
    //                 $(".page3_wishTitleC").addClass("f-ann");
                    
    //                 wishIndex++;

                               
    //                 break;

    //             case 1:

    //                 $(".page3_wishTitle2").addClass("animated fadeOutRight1");
                
    //                 $(".page3_wishTitle3").removeClass("f-ann");
    //                 $(".page3_wishTitle3").addClass("animated fadeInLeft1");
    //                 $(".page3_wishTitle1").addClass("f-ann");
    //                 $(".page3_wishTitleC").addClass("f-ann");
                    
    //                 wishIndex++;
                    
    //                 break;

    //             case 2:

    //                 $(".page3_wishTitle3").addClass("animated fadeOutRight1");
                   
    //                 $(".page3_wishTitle1").removeClass("f-ann");
    //                 $(".page3_wishTitle1").addClass("animated fadeInLeft1");
    //                 $(".page3_wishTitle2").addClass("f-ann");
    //                 $(".page3_wishTitleC").addClass("f-ann");
                   
    //                 wishIndex++;
    //                 break;

    //             default:
    //                 $(".page3_wishTitleC").addClass("animated fadeOutRight1");
    //                 $(".page3_wishTitle1").removeClass("f-ann");
    //                 $(".page3_wishTitle1").addClass("animated fadeInLeft1");
                    
                    
    //                 wishIndex =0;
    //                 break;


    //         }

            


            
           

            
    //     }else if (distanceX < minDistance*(-1)){//往左滑
    //         console.log("往左滑");

    //         // if(-100<wishIndex<

    //         switch(wishIndex){
    //             case 0:
    //                 $(".page3_wishTitle1").addClass("animated fadeOutLeft1");
    //                 $(".page3_wishTitle2").addClass("f-ann");
    //                 $(".page3_wishTitle3").removeClass("f-ann");
    //                 $(".page3_wishTitle3").addClass("animated fadeInRight1");
    //                 $(".page3_wishTitleC").addClass("f-ann");
    //                 wishIndex--;
    //                 break;

    //             case 1:
    //                  $(".page3_wishTitle2").addClass("animated fadeOutLeft1");
    //                  $(".page3_wishTitle3").addClass("f-ann");
    //                 $(".page3_wishTitle1").removeClass("f-ann");
    //                 $(".page3_wishTitle1").addClass("animated fadeInRight1");
    //                 $(".page3_wishTitleC").addClass("f-ann");

    //                 wishIndex--;
    //                 break;

    //             case 2:
    //                 $(".page3_wishTitle3").addClass("animated fadeOutLeft1");
    //                 $(".page3_wishTitle1").addClass("f-ann");
    //                 $(".page3_wishTitle2").removeClass("f-ann");
    //                 $(".page3_wishTitle2").addClass("animated fadeInRight1");
    //                 $(".page3_wishTitleC").addClass("f-ann");

    //                 wishIndex--;
    //                 break;

    //              default:
    //                 $(".page3_wishTitleC").addClass("animated fadeOutLeft1");
    //                 $(".page3_wishTitle1").removeClass("f-ann");
    //                 $(".page3_wishTitle1").addClass("animated fadeInRight1");
                    
    //                 wishIndex = 0;
                    
    //                 break;

    //         }

           
    //     }
    //     if (wishIndex>-100&&wishIndex<0) 
    //     {
    //         wishIndex += maxIndex;
    //     };
    //     weixinShare();//重新初始化分享接口，动态改变分享描述
    // }
  

    $(".page3_arrowR").click(function(e){
        wishIndex = wishIndex%maxIndex;
                console.log("右箭头");
                console.log(index = wishIndex);
                $(".page3_wishTitle1").removeClass("animated fadeOutRight1");
                $(".page3_wishTitle1").removeClass("animated fadeInLeft1");
                $(".page3_wishTitle2").removeClass("animated fadeOutRight1");
                $(".page3_wishTitle2").removeClass("animated fadeInLeft1");
                $(".page3_wishTitle3").removeClass("animated fadeOutRight1");
                $(".page3_wishTitle3").removeClass("animated fadeInLeft1");
                $(".page3_wishTitleC").removeClass("animated fadeOutRight1");
                $(".page3_wishTitleC").removeClass("animated fadeInLeft1");

                $(".page3_wishTitle1").removeClass("animated fadeOutLeft1");
                $(".page3_wishTitle1").removeClass("animated fadeInRight1");
                $(".page3_wishTitle2").removeClass("animated fadeOutLeft1");
                $(".page3_wishTitle2").removeClass("animated fadeInRight1");
                $(".page3_wishTitle3").removeClass("animated fadeOutLeft1");
                $(".page3_wishTitle3").removeClass("animated fadeInRight1");
                $(".page3_wishTitleC").removeClass("animated fadeOutLeft1");
                $(".page3_wishTitleC").removeClass("animated fadeInRight1");
         switch(wishIndex){
                case 0:    

                    $(".page3_wishTitle1").addClass("animated fadeOutRight1");
                    

                    $(".page3_wishTitle2").removeClass("f-ann");
                    $(".page3_wishTitle2").addClass("animated fadeInLeft1");
                    $(".page3_wishTitle3").addClass("f-ann");
                    $(".page3_wishTitleC").addClass("f-ann");
                    
                    wishIndex++;

                               
                    break;

                case 1:

                    $(".page3_wishTitle2").addClass("animated fadeOutRight1");
                    
                    $(".page3_wishTitle3").removeClass("f-ann");
                    $(".page3_wishTitle3").addClass("animated fadeInLeft1");
                    $(".page3_wishTitle1").addClass("f-ann");
                    $(".page3_wishTitleC").addClass("f-ann");
                    
                    wishIndex++;
                    
                    break;

                case 2:

                    $(".page3_wishTitle3").addClass("animated fadeOutRight1");
                   
                    $(".page3_wishTitle1").removeClass("f-ann");
                    $(".page3_wishTitle1").addClass("animated fadeInLeft1");
                    $(".page3_wishTitle2").addClass("f-ann");
                    $(".page3_wishTitleC").addClass("f-ann");
                   
                    wishIndex++;
                    break;

                default:
                    $(".page3_wishTitleC").addClass("animated fadeOutRight1");
                    $(".page3_wishTitle1").removeClass("f-ann");
                    $(".page3_wishTitle1").addClass("animated fadeInLeft1");
                    
                    
                    wishIndex =0;
                    break;


            }
            if(wishIndex>-100&&wishIndex<0){
                wishIndex = wishIndex+maxIndex;
            }
            weixinShare();//重新初始化分享接口，动态改变分享描述
    })

    $(".page3_arrowL").click(function(e){
        wishIndex = wishIndex%maxIndex;
        console.log("左箭头");
        console.log(index = wishIndex);
        $(".page3_wishTitle1").removeClass("animated fadeOutRight1");
        $(".page3_wishTitle1").removeClass("animated fadeInLeft1");
        $(".page3_wishTitle2").removeClass("animated fadeOutRight1");
        $(".page3_wishTitle2").removeClass("animated fadeInLeft1");
        $(".page3_wishTitle3").removeClass("animated fadeOutRight1");
        $(".page3_wishTitle3").removeClass("animated fadeInLeft1");
        $(".page3_wishTitleC").removeClass("animated fadeOutRight1");
        $(".page3_wishTitleC").removeClass("animated fadeInLeft1");

        $(".page3_wishTitle1").removeClass("animated fadeOutLeft1");
        $(".page3_wishTitle1").removeClass("animated fadeInRight1");
        $(".page3_wishTitle2").removeClass("animated fadeOutLeft1");
        $(".page3_wishTitle2").removeClass("animated fadeInRight1");
        $(".page3_wishTitle3").removeClass("animated fadeOutLeft1");
        $(".page3_wishTitle3").removeClass("animated fadeInRight1");
        $(".page3_wishTitleC").removeClass("animated fadeOutLeft1");
        $(".page3_wishTitleC").removeClass("animated fadeInRight1");
        switch(wishIndex){
                case 0:
                    $(".page3_wishTitle1").addClass("animated fadeOutLeft1");
                    $(".page3_wishTitle2").addClass("f-ann");
                    $(".page3_wishTitle3").removeClass("f-ann");
                    $(".page3_wishTitle3").addClass("animated fadeInRight1");
                    $(".page3_wishTitleC").addClass("f-ann");
                    wishIndex--;
                    break;

                case 1:
                     $(".page3_wishTitle2").addClass("animated fadeOutLeft1");
                     $(".page3_wishTitle3").addClass("f-ann");
                     $(".page3_wishTitle1").removeClass("f-ann");
                     $(".page3_wishTitle1").addClass("animated fadeInRight1");
                     $(".page3_wishTitleC").addClass("f-ann");

                    wishIndex--;
                    break;

                case 2:
                    $(".page3_wishTitle3").addClass("animated fadeOutLeft1");
                    $(".page3_wishTitle1").addClass("f-ann");
                    $(".page3_wishTitle2").removeClass("f-ann");
                    $(".page3_wishTitle2").addClass("animated fadeInRight1");
                    $(".page3_wishTitleC").addClass("f-ann");

                    wishIndex--;
                    break;

                 default:
                    $(".page3_wishTitleC").addClass("animated fadeOutLeft1");
                    $(".page3_wishTitle1").removeClass("f-ann");
                    $(".page3_wishTitle1").addClass("animated fadeInRight1");
                    
                    wishIndex = 0;
                    
                    break;

            }
            if(wishIndex>-100&&wishIndex<0){
                wishIndex = wishIndex+maxIndex;
            }
            weixinShare();//重新初始化分享接口，动态改变分享描述
    })
    
    // 大福袋
     $(".page4_guide").click(function(e){

        $(".draw-screen2").addClass("animated fadeOutUp1");
        $(".guide-screen2").removeClass("animated fadeOutDown");
        $(".guide-screen2").removeClass("f-dn");
        $(".guide-screen2").addClass("animated f-ad1 fadeInUp1");
        $(".guide-screen2").find(".animated").removeClass("f-ann")
        // $(".page6_bag").addClass("animated wobble f-ad4 ");
    })

    $(".page4_coupon").click(function(e){
        $(".draw-screen2").addClass("animated fadeOutUp1");
        $(".guide-screen2").removeClass("animated fadeOutDown");
        $(".guide-screen2").removeClass("f-dn");
        $(".guide-screen2").addClass("animated f-ad1 fadeInUp1");
        $(".guide-screen2").find(".animated").removeClass("f-ann")
        // $(".page6_bag").addClass("animated wobble f-ad4 ");

    })

    $(".page6_back").click(function(e){
        $(".guide-screen2").addClass("animated fadeOutDown");
        $(".draw-screen2").removeClass("animated fadeOutUp1");
        $(".draw-screen2").removeClass("animated fadeInUp1");

        $(".draw-screen2").removeClass("f-dn");
        $(".draw-screen2").addClass("animated fadeInDown");

        setTimeout(function(){
            $(".guide-screen2").find(".animated").addClass("f-ann");
        },1000);
        
    })

    


   
    
    $(".page4_send").click(function(e){
        $(".share-screen").removeClass("f-dn");

    })

    //自定义祝福语
    $(".page3_cus").click(function(e){
        $(".wish-screen").removeClass("f-dn");
    })

    $(".page4_cus").click(function(e){
        $(".wish-screen").removeClass("f-dn");
    })

    // $("#wishC_2").html($("#input_wishcus").val()); 

    

    $(".confirmWish_Btn").click(function(e){

        $(".wish-screen").addClass("f-dn");
        $("#wishC_2").html($("#input_wishcus").val()); 
        $("#wishC").html($("#input_wishcus").val());

        //console.log($("#wishC_2").html());
        $(".page3_wishTitle1").addClass("f-ann");
        $(".page3_wishTitle2").addClass("f-ann");
        $(".page3_wishTitle3").addClass("f-ann");
        $(".page3_wishTitleC").removeClass("f-ann");
        $(".page4_wishTitle1").addClass("f-ann");
        $(".page4_wishTitle2").addClass("f-ann");
        $(".page4_wishTitle3").addClass("f-ann");
        $(".page4_wishTitleC").removeClass("f-ann");
        wishContent[3]=$("#input_wishcus").val();
        
        // console.log(wishContent[3]);

        wishIndex=-100;
        weixinShare();

    })

    $(".confirmWish_quit").click(function(e){
        $(".wish-screen").addClass("f-dn");
    })
    //分享
    $(".sharePage").click(function(e){
        $(".share-screen").addClass("f-dn");
    })

    //显示waiting
    function showWaiting(){
        var shield = $("#waiting_shield");
        shield.css("top",$(document).scrollTop());
        shield.show();
        document.documentElement.style.overflow='hidden';
    }

    function hideWaiting(){
        $("#waiting_shield").hide();
        document.documentElement.style.overflow='auto';
    }
    showWaiting();
    
    $(".track_data").click(function(){
        var track = $(this).attr("track");
        var data = $(this).attr("track-data");
        ga('send','event','CNY-social',track,data);
    })
});
    

    
