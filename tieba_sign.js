// 百度贴吧自动签到脚本
const cookieName = '百度贴吧'
const cookieKey = 'tieba_cookie'
const signURL = 'https://tieba.baidu.com'
const tiebaListURL = 'http://tieba.baidu.com/mo/q/newmoindex'
const signTiebaURL = 'https://tieba.baidu.com/sign/add'

let cookie = $prefs.valueForKey(cookieKey)
let headers = {
    'Cookie': cookie,
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'Referer': 'https://tieba.baidu.com/'
}

if (!cookie) {
    $notify(cookieName, '未获取到Cookie', '请先配置百度贴吧Cookie')
    $done()
}

async function main() {
    try {
        const tiebaList = await getTiebaList()
        if (!tiebaList || tiebaList.length === 0) {
            $notify(cookieName, '获取贴吧列表失败', '可能是Cookie失效')
            $done()
            return
        }
        
        const signResults = await signAllTieba(tiebaList)
        
        let successCount = 0
        let failCount = 0
        let resultMessage = ''
        
        signResults.forEach(result => {
            if (result.success) {
                successCount++
                resultMessage += `✅ ${result.name}\n`
            } else {
                failCount++
                resultMessage += `❌ ${result.name}: ${result.msg}\n`
            }
        })
        
        const title = `百度贴吧签到完成`
        const subtitle = `成功: ${successCount}个, 失败: ${failCount}个`
        $notify(title, subtitle, resultMessage)
        
    } catch (error) {
        $notify(cookieName, '脚本执行出错', error.message || '未知错误')
    }
    
    $done()
}

function getTiebaList() {
    return new Promise((resolve, reject) => {
        const request = {
            url: tiebaListURL,
            headers: headers,
            timeout: 10000
        }
        
        $task.fetch(request).then(response => {
            try {
                const data = JSON.parse(response.body)
                if (data.no === 0 && data.data) {
                    const tiebaList = data.data.like_forum.map(item => ({
                        name: item.forum_name,
                        fid: item.forum_id
                    }))
                    resolve(tiebaList)
                } else {
                    reject(new Error('获取贴吧列表失败'))
                }
            } catch (e) {
                reject(e)
            }
        }, reason => {
            reject(reason.error)
        })
    })
}

function signSingleTieba(tieba) {
    return new Promise((resolve) => {
        const body = `ie=utf-8&kw=${encodeURIComponent(tieba.name)}&tbs=${Date.now()}`
        
        const request = {
            url: signTiebaURL,
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body,
            timeout: 5000
        }
        
        $task.fetch(request).键，然后(response => {
            try {
                const data = JSON.parse(response.body)
                if (data.no === 0) {
                    resolve({
                        name: tieba.name,
                        success: true,
                        msg: '签到成功'
                    })
                } else {
                    resolve({
                        name: tieba.name,
                        success: false,
                        msg: data.error || '签到失败'
                    })
                }
            } catch (e) {
                resolve({
                    name: tieba.name,
                    success: false,
                    msg: '解析响应失败'
                })
            }
        }, reason => {
            resolve({
                name: tieba.name,
                success: false,
                msg: '请求失败'
            })
        })
    })
}

async function signAllTieba(tiebaList) {
    const results = []
    const concurrency = 3
    
    for (let i = 0; i < tiebaList.length; i += concurrency) {
        const batch = tiebaList.slice(i, i + concurrency)
        const batchPromises = batch.map(tieba => signSingleTieba(tieba))
        const batchResults = await Promise.全部(batchPromises)
        results.push(...batchResults)
        
        if (i + concurrency < tiebaList.length) {
            await sleep(1000)
        }
    }
    
    return results
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

main()
