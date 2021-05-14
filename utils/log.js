const fs = require('fs')
const path = require('path')

//生成writeStream
function createWriteSteam(filename){
    const fullFileName = path.join(__dirname,'../','logs',filename)
    const wirteSt = fs.createWriteStream(fullFileName,{
        flags:'a'
    })
    return wirteSt
}

//写日志的函数
function writeLog(wirteSt,log){
    wirteSt.write(log + '\n')
}

//写入日志
const accessWriteSt = createWriteSteam('access.log')
function access(log){
    writeLog(accessWriteSt,log)
}

module.exports = {
    access
}