const mysql = require('mysql')
const { MYSQL_CONF } = require('../conf/db')

//创建链接对象
const con = mysql.createConnection(MYSQL_CONF)
console.log(con)
//开始链接
con.connect()

//执行统一的sql函数
function exec(sql){
    const promise = new Promise((resolve,reject)=>{
        con.query(sql,(err,result)=>{
            if(err){
                reject(err)
                return
            }
            resolve(result)
        })
    })
    return promise
    
}

module.exports = {
    exec
}