var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var urlencode = require('urlencode');
var crypto = require('crypto');
var url = require('url');


var config = require("./config")();
var conString = config.dbConStr;

var db = require('pg-bricks').configure(conString);
db.pg.defaults.poolSize = 20;

var pg = require('pg');
//set connection pool size to 20
pg.defaults.poolSize = 1;

var rollback = function(client, done) {
  client.query('ROLLBACK', function(err) {
    //if there was a problem rolling back the query
    //something is seriously messed up.  Return the error
    //to the done function to close & remove this client from
    //the pool.  If you leave a client in the pool with an unaborted
    //transaction weird, hard to diagnose problems might happen.
    return done(err);
  });
};

var routes = require('./routes/index');
var html_dir = './static';
var app = express();

global.access_token = null;
global.jsticket = null;
global.expires_at = 0; // getTime() a int represent time in seconds since 1970
global.retriev_lock = 0; //lock the process to retriev ticket

var authFilter = function(req, res, next){
    var pathname = url.parse(req.url).pathname;
    console.log("Request for " + pathname + " received.");
    
    if(pathname && pathname.indexOf('wxoauth_callback') > -1){
        return next();
    }
    
    var openid = config.debug ? 'test1' : req.query.openid || req.cookies.openid;
    console.log("openid = " + openid);
    
    if(!openid){        
        return res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid=" 
            + config.wxAppId + "&redirect_uri=" 
            + urlencode("http://campaign.canda.cn/wxoauth_callback?redirect=" + req.url)
            +"&response_type=code&scope=snsapi_userinfo&state=1234567890#wechat_redirect");
    }
    
    pg.connect(conString, function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }
        client.query('SELECT * from auth_users where openid=$1', [openid], function(err, result) {
            //call `done()` to release the client back to the pool
            done();
            
            if(err) {
                return console.error('error running query', err);
            }
            
            if(result.rows.length > 0 && result.rows[0]){
                next();
            }else{
                console.log("could not find any record associated with this openid");
                //else need redirect to weixin for auth
                return res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid=" 
                    + config.wxAppId + "&redirect_uri=" 
                    + urlencode("http://campaign.canda.cn/wxoauth_callback?redirect=" + req.url)
                    +"&response_type=code&scope=snsapi_userinfo&state=1234567890#wechat_redirect");
            }
        //output: 1
        });
    });
    /*
db.select().from('auth_users').where('openid', openid).rows(function(err, rows){
        if(err) {  
          console.error('error running query', err);
          next(err);
          return;
        }
                
        if(rows && rows[0] && rows[0].openid){
            next();
        }else{
            console.log("could not find any record associated with this openid");
            //else need redirect to weixin for auth
            return res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid=" 
                + config.wxAppId + "&redirect_uri=" 
                + urlencode("http://campaign.canda.cn/wxoauth_callback?redirect=" + req.url)
                +"&response_type=code&scope=snsapi_userinfo&state=1234567890#wechat_redirect");
        }
    }); 
*/   
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.use(logger('dev'));
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

/*
app.use(bodyParser.urlencoded({ extended: false }));
*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser("MKGM-CA-CAMPAIGN-9588"));

/*

app.option("/iamalive", function(req, res, next){
    return res.json({
        success: true,
        message: 'iamalive'
    });    
});
*/

//app.use('/', routes);
app.use(express.static(path.join(__dirname, 'static')));

//get jsticket api
app.get('/jsticket', function(req, res){
    if((!global.jsticket || !global.expires_at 
        || (global.expires_at - Date.now()/1000) < (60 * 5)) && !global.retriev_lock ){
        global.retriev_lock = 1;
        console.log("get jsapikey from remote");
        
        //refresh jsapi ticket 5 minutes before its expiration
        //get global access token and jsapi ticket first
        var globalTokenUrl = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="
                + config.wxAppId + "&secret=" + config.wxAppSecret;
        console.log("app secret : " + config.wxAppSecret);
        
        request.get(globalTokenUrl, function(err, response, body){
            if(err){
                console.log("ERROR when try to get global access token");
                global.retriev_lock = 0;
                return next(err);
            }
            var resData = JSON.parse(body);
            if(body.errcode){
                var error = new Error(resData.errmsg);
                return next(error);
            }
            console.log("global access token body: " + JSON.stringify(resData));
            var getJsapiUrl = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" 
                            + resData.access_token+ "&type=jsapi"; 
            request.get(getJsapiUrl, function(err, response, body){
                if(err){
                    console.log("ERROR when try to get jsapi ticket");
                    global.retriev_lock = 0;
                    return next(err);
                }
                var apiInfo = JSON.parse(body);
                if(body.errcode){
                    var error = new Error(apiInfo.errmsg);
                    return next(error);
                }
            
                console.log("global jsapi_ticket body: " + JSON.stringify(apiInfo));
                
                global.jsticket = apiInfo.ticket;
                global.expires_at = Date.now()/1000 + parseInt(apiInfo.expires_in); // 7200 seconds = 2hrs
                global.retriev_lock = 0;
                return res.json({
                    jsticket: global.jsticket,
                    expires_at: global.expires_at
                });
            });
        });
    }else{
        console.log("get jsapikey from global cache");
        return res.json({
            jsticket: global.jsticket,
            expires_at: global.expires_at
        });
    }
    
})


//app.use(authFilter);
var luckybagSeed = 8034540;

/*
    params:
        1. sharedby - the initiators open id
        2. shareid - sharing identification used to get title and content
*/
app.get('/', function(req, res, next) {
    var sharedby = req.query.sharedby,
        shareid = req.query.shareid; //the unique shareing id that can help us to get shared content and title
    
    var jsTicketUrl = "http://" + config.jsTicketHost + ":" + app.get('port') + "/jsticket";
    request.get(jsTicketUrl, function(err, response, body){
        if(err){
            console.error("Failed to get jsapi ticket information");
            return next(err);
        }
        var ticketInfo = JSON.parse(body);
        
        //signature string
        var now = Math.round(Date.now()/1000);
        var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        var nonceStr = '123456790';
        var rawSig = "jsapi_ticket=" + ticketInfo.jsticket 
                    + "&noncestr=" + nonceStr
                    + "&timestamp=" + now
                    + "&url=" + fullUrl;
        
        console.log("signature request url : " + rawSig);
        var shasum = crypto.createHash('sha1');
        shasum.update(rawSig);
        
        var signature = shasum.digest('hex');
        
        console.log("get the signature : " + signature);
        var jsticketCookie = config.wxAppId + "," + now + "," + nonceStr + "," + signature;
        
                
        res.cookie('jsticket', jsticketCookie, { maxAge: (global.expires_at - Date.now()/1000 - 60*5) * 1000 });
        
        pg.connect(conString, function(err, client, done) {
            if(err) {
                return console.error('error fetching client from pool', err);
            }
            client.query('select count(*) from lottery_record where used=$1', [true], function(err, result) {
                //call `done()` to release the client back to the pool
                done();
                var luckybagNumber = luckybagSeed;
                if(err){
                    //doesn't matter, we just give a number
                    
                }else{
                    luckybagNumber += parseInt(result.rows[0].count);
                }
                
                if(sharedby){
                    pg.connect(conString, function(err, client, done) {
                        if(err) {
                            return console.error('error fetching client from pool', err);
                        }
                        client.query("select nickname, headimgurl, a.openid from auth_users a join lottery_record b on a.openid=b.openid where b.sharedby=$1", [sharedby], function(err, result){
                            done();
                            var friends = false;
                            if(err || result.rows.length === 0){
                                //doen't matter
                            }else{
                                friends = result.rows;
                            }
                            
                            console.log("query friends result callback : " + result.rows);
                            pg.connect(conString, function(err, client, done) {
                                if(err) {
                                    return console.error('error fetching client from pool', err);
                                }
                                client.query("select title, content from share_info where shareid=$1", 
                                        [shareid], function(err, result){
                                    done();
                                    var title = '',
                                        content = '';
                                    if(err || result.rows.length === 0){
                                        //now result, should provide a default
                                    }else{
                                        title = result.rows[0].title;
                                        content = result.rows[0].content;
                                    }
                                    res.render('index', { luckybagNumber : luckybagNumber, 
                                            friends: friends, title: title, content: content});
                                });
                            });
                            
                        });
                    });
                }else{
                    res.render('index', { luckybagNumber : luckybagNumber, friends: false, title:'', content: ''});
                }
                    
            });
        });

    });
});




app.get('/wxoauth_callback', function(req, res, next){
     
    console.log("Callback request query: " + req.query);
    
    var accessTokenUrl = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" 
        + config.wxAppId + "&secret=" + config.wxAppSecret 
        + "&code=" + req.query.code + "&grant_type=authorization_code";
    
    request.get(accessTokenUrl, function(err, response, bd){
        if(err){
            console.error("ERROR ocurred when request for access token : " + err);
            return next(err);
        }
        console.log("auth token response : " + JSON.stringify(bd));
        var resData = JSON.parse(bd);

    	if(resData.errcode){
    	    console.error("some error happened when tring to get access token");
    		var error = new Error(resData.errmsg);
    		error.status = 500;
    		return next(error);
    	}else{
    		console.log("body access_token: " + resData.access_token);
            console.log("body openid: " + resData.openid);
            var access_token = resData.access_token;
    		var refresh_token = resData.refresh_token;
    		var openid = resData.openid;
    		
    		res.cookie('openid', openid, { maxAge: 365 * 24 * 60 * 60 * 1000 }); //Save openid for 365 days
    		
            var getUserInfoUrl = "https://api.weixin.qq.com/sns/userinfo?access_token=" 
                    + access_token + "&openid=" + openid + "&lang=zh_CN";
            request.get(getUserInfoUrl, function(err, response, body){
                if(err){
                    console.error("ERROR ocurred when request for user info : " + err);
                    return next(err);
                }
                var userInfo = JSON.parse(body);
                var nickname = userInfo.nickname,
                    sex = userInfo.sex,
                    province = userInfo.province,
                    city = userInfo.city,
                    country = userInfo.country,
                    headimgurl = userInfo.headimgurl,
                    privilege = userInfo.privilege,
                    unionid = userInfo.unionid;
                
                pg.connect(conString, function(err, client, done) {
                    if(err) {
                        return next(err);
                    }
                    client.query("select * from auth_users where openid=$1", [openid], function(err, result){
                        done();
                        if(err) {  
                          console.error('error running query', err);
                          return next(err);
                        }
                        var rows = result.rows;
                        if(rows.length > 0 ){
                            pg.connect(conString, function(err, client, done) {
                                if(err) {
                                    return next(err);
                                }
                                client.query('BEGIN', function(err) {
                                    if(err) return rollback(client, done);
    
                                    process.nextTick(function() {
                                        var text = "UPDATE auth_users(nickname, sex, province, city, country, " 
                                                + " headimgurl, privilege, unionid, access_token, refresh_token) "
                                                + " VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) WHERE openid = $11";
                                        client.query(text, [nickname, sex, province, 
                                            city, country, headimgurl, privilege, 
                                            unionid, access_token, refresh_token, openid], 
                                            function(err) {
                                                if(err) return rollback(client, done);
                                                client.query('COMMIT', done);
                                                console.log("Reset openid in cookie : " + openid);
                                                return res.redirect(req.query.redirect);
                                        });
                                    });
                                });
                            });
                            
                        }else{
                            pg.connect(conString, function(err, client, done) {
                                if(err) {
                                    return next(err);
                                }
                                client.query('BEGIN', function(err) {
                                    if(err) return rollback(client, done);
    
                                    process.nextTick(function() {
                                        var text = "INSERT INTO auth_users(openid, nickname, sex, province, " 
                                            + "city, country, headimgurl, privilege, unionid, access_token, refresh_token)"
                                            + "VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)";
                                        client.query(text, [openid, nickname, sex, province, 
                                            city, country, headimgurl, privilege, 
                                            unionid, access_token, refresh_token], 
                                            function(err) {
                                                if(err) return rollback(client, done);
                                                client.query('COMMIT', done);
                                                console.log("Reset openid in cookie : " + openid);
                                                return res.redirect(req.query.redirect);
                                        });
                                    });
                                });
                            });
                        }
                    });
                });
                /*
                //upsert openid, access_token, refresh_token, expires_in into database
                db.select().from('auth_users').where('openid', openid).rows(function(err, rows){
                    if(err) {  
                      console.error('error running query', err);
                      return next(err);
                    }
                    
                    
                    if(rows && rows[0]){
                        //update existing field
                        db.update('auth_users', 
                            {   
                                nickname: nickname, 
                                sex: sex, 
                                province: province, 
                                city: city,
                                country: country,
                                headimgurl: headimgurl,
                                privilege: privilege,
                                unionid: unionid,
                                access_token: access_token,
                                refresh_token: refresh_token
                            }).where('openid', openid).run(function(err, rows){
                                if(err) {  
                                  console.error('error running query', err);
                                  return next(err);
                                }
                                //set the openid in cookie
                                console.log("Reset openid in cookie : " + openid);
                                
                                return res.redirect(req.query.redirect);
                            });
                    }else{
                        //insert new record
                        console.log("insert new openid : " + openid);
                        db.insert('auth_users', 
                        {   
                            openid: openid,
                            nickname: nickname, 
                            sex: sex, 
                            province: province, 
                            city: city,
                            country: country,
                            headimgurl: headimgurl,
                            privilege: privilege,
                            unionid: unionid,
                            access_token: access_token,
                            refresh_token: refresh_token
                        }).returning('*').row(function(err, row){
                            if(err) {  
                              console.error('error running query', err);
                              return next(err);
                            }
                            
                            return res.redirect(req.query.redirect);
                        });
                    }
                });
                */
            });
    	}
    });
})

app.post('/lottery', function(req, res, next){
    var input = JSON.parse(JSON.stringify(req.body));
    console.log(req.body);

    pg.connect(conString, function(err, client, done) {
        if(err) {
            console.error('error get connection from pool', err);
            return next(err);
        }
        
        client.query("select * from lottery_record where mobile=$1", [input.mobile], function(err, result){
            done();
            if(err) {  
              console.error('error running query', err);
              return next(err);
            }
            
            var rows = result.rows;
            if (rows.length > 0){
            	return res.json({
    		        success: false,
    		        message: "已经参与过抽奖",
    		        errorCode: "PHONE_USED"
    		    });
            }
            
            pg.connect(conString, function(err, client, done) {
                if(err) {
                    console.error('error get connection from pool', err);
                    return next(err);
                }
                
                client.query('update lottery_record set mobile = $1::text,used = true,openid = $2::text,sharedby = $3::text where id = (select id from lottery_record where used = false limit 1) returning *',
                    [input.mobile, input.openid, input.sharedby],function(err, result){
                    done();
        	        if(err) {  
        	          console.error('error running query', err);
        	          return next(err);
        	        }
        	        
        	        
                    var rows = result.rows;
                    
        	        if(rows.length === 0){
        	            console.log("lottery ......" + rows);
        	        	return res.json({
        			        success: false,
        			        message: "本轮抽奖已经全部结束",
        			        errorCode: "OVER"
        			    });
        	        }
                        
                    
                    //call message api to send sms
                    if (rows[0].value !== 888) {
                        var sms = config.smsNormal;
                        sms = sms.replace("【变量1】", rows[0].value);
                        sms = sms.replace("【变量2】", rows[0].code);
                        request.post({
                                url:'http://121.199.16.178/webservice/sms.php?method=Submit',
                                form: {
                                    account: 'cf_obizsoft',
                                    password: 'a123456',
                                    mobile: config.debug ? '13764211365' : input.mobile,
                                    content: sms
                                }
                            }, function(err, res, bd){
                                if(err){
                                    console.error(err);
                                }
                                console.log(bd);
                            }
                        );
                    }else{
                        var sms = config.sms888;
                        sms = sms.replace("【变量1】", rows[0].code);
                        request.post({
                                url:'http://121.199.16.178/webservice/sms.php?method=Submit',
                                form: {
                                    account: 'cf_obizsoft',
                                    password: 'a123456',
                                    mobile: config.debug ? '13764211365' : input.mobile,
                                    content: sms
                                }
                            }, function(err, res, bd){
                                if(err){
                                    console.error(err);
                                }
                                console.log("the result" + bd);
                            }
                        );
                    }
        
                    return res.json({
                        success: true,
                        data: rows[0]
                    });
        	    });
            });
        });
    });
    
	/*
db.select().from('lottery_record').where('mobile', input.mobile).rows(function(err, rows){
        if(err) {  
          console.error('error running query', err);
          next(err);
          return;
        }

        if (rows.length > 0){
        	res.json({
		        success: false,
		        message: "已经参与过抽奖",
		        errorCode: "PHONE_USED"
		    });
		    return;
        }
        
        db.run(function(client, callback){
            

        });
    });
*/
});

app.post('/shareInfos', function(req, res, next) {
    var input = JSON.parse(JSON.stringify(req.body));

    var data = {
        openid : input.openid,
        shareid : input.shareid,
        sharedby : input.sharedby,
        title : input.title,
        content : input.content
    }

    pg.connect(conString, function(err, client, done) {
        if(err) {
            return next(err);
        }
        client.query('BEGIN', function(err) {
            if(err) return rollback(client, done);

            process.nextTick(function() {
                var text = "INSERT INTO share_info(openid, shareid, title, content)" 
                    + "VALUES($1, $2, $3, $4)";
                client.query(text, [data.openid, data.shareid, data.title, data.content], 
                    function(err) {
                        console.error(err);
                        if(err) return rollback(client, done);
                        client.query('COMMIT', done);
                        return res.json({
                            success: true,
                            data: data
                        });
                });
            });
        });
    });

});


app.get('/originUser', function(req, res, next){
    var shareid = req.query.shareid;
    
    console.log("shareid = " + shareid);
    pg.connect(conString, function(err, client, done) {
        if(err) {
            console.error('error get connection from pool', err);
            return next(err);
        }
        
        client.query("select a.title, a.content, b.nickname, b.headimgurl from share_info a join auth_users b on a.openid=b.openid where a.shareid=$1", [shareid], 
                    function(err, result){
            done(); 
            if(err) {  
              console.error('error running query', err);
              next(err);
              return;
            }
                    
            if(result.rows.length === 0 ){
                return res.json({});
            }
            return res.json(result.rows[0]);
        });
    });
});

app.get('/users', function(req, res, next){
    
    
    pg.connect(conString, function(err, client, done) {
        if(err) {
            console.error('error get connection from pool', err);
            return next(err);
        }
        
        client.query("select b.openid, b.nickname, b.headimgurl from lottery_record a join auth_users b on a.openid=b.openid   where a.sharedby=$1", [req.query.sharedby], 
                    function(err, result){
            done();
            if(err) {  
              console.error('error running query', err);
              next(err);
              return;
            }
                    
            return res.json(result.rows);
        });
    });    
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



module.exports = app;
