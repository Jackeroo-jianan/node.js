const { getList, getDetail, newBlog, updateBlog, deleteBlog } = require('../controller/blog')
const { SuccessModel, ErrorModel } = require('../model/resModel')

const loginCheck = (req) =>{
    if (!req.session.username){
        return Promise.resolve(
            new SuccessModel('尚未登陆') 
        )
    }
}

const handleBlogRouter = (req, res) => {
    const method = req.method
    const id = req.query.id

    //获取博客列表的接口
    if (method === 'GET' && req.path === '/api/blog/list') {

        let author = req.query.author || ''
        const keyword = req.query.keyword || ''
        // const listData = getList(author, keyword)
        // return new SuccessModel(listData);

        if (req.query.isadmin){
            const loginCheckResult = loginCheck(req)
            if (loginCheckResult){
                //未登录
                return loginCheckResult
            }
            //强制查询自己的博客
            author = req.session.username
        }

        const result = getList(author,keyword)
        return result.then(listData=>{
            return new SuccessModel(listData)
        })

    }

    //获取博客详情的接口
    if (method === 'GET' && req.path === '/api/blog/detail') {

        // const data = getDetail(id)
        // return new SuccessModel(data)
        const result = getDetail(id)
        return result.then(data =>{
            return new SuccessModel(data)
        })

    }

    //新建一篇博客的接口
    if (method === 'POST' && req.path === '/api/blog/new') {
        
        const loginCheckResult = loginCheck(req)
        if (loginCheckResult){
            //未登录
            return loginCheckResult
        }

        const author = req.session.username //假数据
        req.body.author = author
        const result = newBlog(req.body)
        return result.then(data=>{
            return new SuccessModel(data)
        })
        
    }

    //更新一篇博客的接口
    if (method === 'POST' && req.path === '/api/blog/update') {
        const loginCheckResult = loginCheck(req)
        if (loginCheckResult){
            //未登录
            return loginCheckResult
        }

        const result = updateBlog(id, req.body)
        return result.then(val =>{
            if (val) {
                return new SuccessModel()
            } else {
                return new ErrorModel('更新博客失败')
            }
        })
        }
        

    //删除一篇博客的接口
    if (method === 'POST' && req.path === '/api/blog/delete') {

        const loginCheckResult = loginCheck(req)
        if (loginCheckResult){
            //未登录
            return loginCheckResult
        }

        const author = req.session.username
        const result = deleteBlog(id,author)
        return result.then(val => {
            if (val) {
                return new SuccessModel()
            } else {
                return new ErrorModel('删除博客失败')
            }
        })    
    }

}
module.exports = handleBlogRouter