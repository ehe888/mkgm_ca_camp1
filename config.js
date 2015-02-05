/**
    Configuration module 
*/
module.exports = function(){
    switch(process.env.NODE_ENV){
        case 'development':
            return {
                jsTicketHost: 'localhost',
                dbConStr: "postgres://pguser:001@Helei@121.40.123.135/test_mkgm_ca_camp1"
            };
            
        case 'testing':
            return {
                dbConStr: "postgres://pguser:001@Helei@121.40.123.135/test_mkgm_ca_camp1"
            };
            
        case 'staging':
            return {
                
            };
            
        case 'production':
            return {
                debug: false,
                jsTicketHost: '10.171.254.62',
                wxAppId: 'wx891111d0998d92f5',
                wxAppSecret: '00033763ef83d362d3e00a14f576b963',
                smsNormal: '您抢到的Fun抢福袋【变量1】元购物券代码为【变量2】，请在2月28日前前往C&A官网www.canda.cn使用，具体使用规则请参见活动说明',
                sms888: '您抢到的Fun抢福袋价值888元扮靓大福袋的代码为【变量1】，请在2月28日前前往C&A官网www.canda.cn使用，具体使用规则请参见活动说明',
                dbConStr: "postgres://pguser:001@Helei@10.171.254.62/mkgm_ca_camp1"
            };
        default:
            return {
                debug: true,
                jsTicketHost: 'localhost',
                wxAppId: 'wx891111d0998d92f5',
                wxAppSecret: '00033763ef83d362d3e00a14f576b963',
                smsNormal: '您抢到的Fun抢福袋【变量1】元购物券代码为【变量2】，请在2月28日前前往C&A官网www.canda.cn使用，具体使用规则请参见活动说明',
                sms888: '您抢到的Fun抢福袋价值888元扮靓大福袋的代码为【变量1】，请在2月28日前前往C&A官网www.canda.cn使用，具体使用规则请参见活动说明',
                dbConStr: "postgres://pguser:001@Helei@121.40.123.135/test_mkgm_ca_camp1"
            };
    }
};