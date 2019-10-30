/*
    VALUE-UP    => ACTION WHEN UP
    VALUE-DOWN  => ACTION WHEN DOWN

*/
class Strigger{
    constructor(){
        this.aValueUp = [];
        this.aValueDown = [];
        this.oldData = 0;
        this.newData = 0;
        this.aValueNormal = [];
    }
    setValueUp(value){
        var code = Math.round(Math.random()*10000) + "-" + (new Date()).getTime() 
        this.aValueUp.push({
            code: code,
            value: value,
        })
        return code;
    }
    setValueDown(value){
        var code = Math.round(Math.random()*10000) + "-" + (new Date()).getTime() 
        this.aValueDown.push({
            code: code,
            value: value,
        })
        return code;
    }
    setValueNormal(action){
        var code = Math.round(Math.random()*10000) + "-" + (new Date()).getTime() 
        this.aValueNormal.push({
            code: code,
            action: action
        })
        return code;
    }
    uploadData(data){
        this.oldData = this.newData;
        this.newData = data;
        let value = this.newData - this.oldData;
        var i = 0;
        var ret = "NORMAL"
        if(value > 0){
            for(i = 0; i < this.aValueUp.length; i++) {
                if(((this.oldData + value) >= this.aValueUp[i].value) && (this.oldData < this.aValueUp[i].value)){
                    ret = "UP";
                }
            }
        } else if (value < 0) {
            for(i = 0; i < this.aValueDown.length; i++) {
                if(((this.oldData + value) <= this.aValueDown[i].value) && (this.oldData > this.aValueDown[i].value)){
                    ret = "DOWN";
                }
            }
        } else {
            ret = "NORMAL"
        }
        return ret;
    }
}

module.exports.Strigger = Strigger;