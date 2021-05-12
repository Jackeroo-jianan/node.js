const { exec } = require('../db/mysql')

const getList = (author,keyword)=>{
    let sql = `select * from blogs where 1=1 `
    if (author){
        sql += `and author= '${author}' `
    }
    if (keyword){
        sql += `and title like '%${keyword}%' `
    }
    sql += `order by createtime desc`
   
    //返回promise
    return exec(sql)
}

const getDetail = (id)=>{
    const sql = `select * from blogs where id ='${id}' `
    return exec(sql).then(rows=>{
        return rows[0]//数组里只有一个对象，需要对象类型
    })

}

const newBlog = (blogData = {})=>{
    //blogData是一个博客对象，包含title content，author属性
    const title = blogData.title
    const content = blogData.content
    const author = blogData.author
    const createTime = Date.now()
    
    const sql =` insert into blogs (title,content,createtime,author)
    values ('${title}','${content}','${createTime}','${author}') `
    return exec(sql).then(insertData => {
        //console.log('insertData:',insertData)
        return{
            id:insertData.insertId
        }
    })
}

const updateBlog = (id,blogData = {})=>{
    //id是要更新的博客id
     //blogData是一个博客对象，包含title content属性
    const title = blogData.title
    const content = blogData.content

    const sql = `update blogs set title='${title}',content='${content}' where id = '${id}'`
    return exec(sql).then(updateData =>{
        //console.log('updateData:',updateData)
        if(updateData.affectedRows>0){
            return true
        }
         return false
    })

}

const deleteBlog = (id,author)=>{
    //id是删除的博客的id,author是删除的博客的作者
    const sql = `delete from blogs where id = '${id}' and author ='${author}' `
    return exec(sql).then(delData=>{
        if (delData.affectedRows>0){
            return true
        }
        else return false
    })
}

module.exports = {
    getList,
    getDetail,
    newBlog,
    updateBlog,
    deleteBlog
}