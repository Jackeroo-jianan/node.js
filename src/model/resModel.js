class BaseMoudle {
    constructor(data,message){
        if (typeof data === 'string'){
            this.message =data
            data= null
            message = null
        }
        if(data){
            this.data = data
        }
        if(message){
            this.message = message
        }
    }
}

class SuccessModel extends BaseMoudle{
    constructor(data,message){
        super(data,message)
        this.errno = 0
    }
}

class ErrorModel extends BaseMoudle{
    constructor(data,message){
        super(data,message)
        this.errno = -1
    }
}
module.exports={
    SuccessModel,
    ErrorModel
}