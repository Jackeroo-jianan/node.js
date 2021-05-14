
const querystring = require('querystring')
const { get,set } = require('./src/db/redis')
const { access } = require('./utils/log')
const handleBlogRouter = require('./src/router/blog')
const handleUserRouter = require('./src/router/user')

/*
//设置session
const SESSION_DATA = {}
*/

//设置cookie过期时间
const getCookieExpires = () =>{
    const d = new Date()
    d.setTime(d.getTime() + (24 * 60 * 60 * 1000))
    console.log('d.toGMTString:', d.toGMTString())
    return d.toGMTString()
}

const getPostData = (req) => {
    const promise = new Promise((resolve, reject) => {
        if (req.method !== 'POST') {
            resolve({})
            return
        }
        if (req.headers['content-type'] !== 'application/json') {
            resolve({})
            return
        }

        let postData = ''
        req.on('data', chunk => {
            postData += chunk.toString()
        })
        req.on('end', () => {
            if (!postData) {
                resolve({})
                return
            }
            resolve(JSON.parse(postData))
        })
    })
    return promise
}

const serverHandle = (req, res) => {
    
    //记录日志
    access(`访问方法:${req.method};访问地址:${req.url};浏览器特性:${req.headers['user-agent']};访问时间戳:${Date.now()}`)
    
    //设置返回的格式
    res.setHeader('Content-type', 'application/json')

    //获取path
    const url = req.url
    req.path = url.split('?')[0]

    //解析querry
    req.query = querystring.parse(url.split('?')[1])

    //解析cookie
    req.cookie={}
    const cookieStr = req.headers.cookie || ''
    cookieStr.split(';').forEach(item => {
        if (!item){
            return
        }
        const arr = item.split('=')
        const key = arr[0].trim()
        const val =arr [1].trim()
        req.cookie[key] = val
    });
    console.log('cookie:',req.cookie)

 /*
    //解析session
    let needSetCookie = false
    let userId = req.cookie.userid
    if(userId){//如果cookie中有userId,把它的值赋给session的userId(key)
        if(!SESSION_DATA[userId]){
            SESSION_DATA[userId] = {}
        }
            
    }else{//如果cookie中没有userId,把userId设置为当前时间戳+随机数，把它的值赋给session的userId(key)
        needSetCookie = true
        userId = `${Date.now()}_${Math.random()}`
        SESSION_DATA[userId] = {}
    }
    req.session = SESSION_DATA[userId]  
*/

    //解析session,使用redis
    let needSetCookie = false
    let userId = req.cookie.userid
    if (!userId){
        needSetCookie = true
        userId = `${Date.now()}_${Math.random()}`
        //初始化 session
        set(userId,{})
    }

    //获取session
    req.sessionId = userId
    get(req.sessionId).then(sessionData =>{
        if (sessionData == null){
            //初始化redis中的session
            set(req.sessionId,{})
        
            //设置session
             req.session = {}
        }else{
            req.session = sessionData
        }
        console.log('req.session:',req.session)
        //处理postData
        return getPostData(req)
    })
    .then(postData => {
        req.body = postData

        //处理blog路由
        const blogResult = handleBlogRouter(req, res)
        
        if (blogResult) {
            blogResult.then(blogData => {
                if (needSetCookie){
                    res.setHeader('Set-Cookie',`userid=${userId}; path=/;httpOnly;expires=${getCookieExpires()}`)
                }

                res.end(
                    JSON.stringify(blogData)
                )
            }) 
            return
        }

        //处理user路由
        const userResult = handleUserRouter(req, res)

        if (userResult) {
            userResult.then(userData=>{
                if (needSetCookie){
                    res.setHeader('Set-Cookie',`userid=${userId}; path=/;httpOnly;expires=${getCookieExpires()}`)
                }

                res.end(
                    JSON.stringify(userData)
                )
            })
            
            return
        }

        //若路由未命中，返回404
        res.writeHead(404, { 'Comtent-type': "text/plaun" })
        res.write("404 Not Found\n")
        res.end()
    })


}


module.exports = serverHandle
//process.env.NODE_ENV