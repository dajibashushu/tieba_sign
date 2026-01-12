// 功能：访问贴吧时，自动从网络请求中提取Cookie并保存到本地
const cookieName = '百度贴吧Cookie获取'
const cookieKey = 'tieba_cookie' // 与签到脚本中的 cookieKey 保持一致

// 匹配贴吧相关请求URL
if ($request && $request.url.match(/\.baidu\.com/) && $request.headers['Cookie']) {
    let cookie = $request.headers['Cookie'];
    // 清理和格式化Cookie（保留关键字段，如BDUSS）
    // 以下正则需要根据百度实际的Cookie字段调整，BDUSS是关键
    let bdussMatch = cookie.match(/BDUSS=([^;]+)/);
    if (bdussMatch) {
        // 提取关键Cookie信息，避免存储过长无效内容
        let finalCookie = `BDUSS=${bdussMatch[1]}`;
        
        // 保存到Quantumult X的持久化存储中
        $prefs.setValueForKey(finalCookie, cookieKey);
        $notify(cookieName, "获取Cookie成功", "已更新本地Cookie");
        console.log(`[${cookieName}] Cookie已更新: ${finalCookie}`);
    } else {
        $notify(cookieName, "获取Cookie失败", "未找到BDUSS字段");
    }
}
$done();