/**
 * Created by ranchengwei on 2017/12/30.
 */
//发布订阅模式
class DepParent{
    constructor(){
    }
    addSub(sub){//新增订阅
        this.subs.push(sub);
    }
    notify(){//发布订阅
        this.subs.forEach((sub)=>{
            sub.update()
        })
    }
}
class Dep extends DepParent{
    constructor(){
        super();
        this.subs=[];
    }
}

class WatcherParent{
    constructor(){

    }
    update(){
        this.fn(this.getNewVal());
    }
}
class Watcher extends WatcherParent{
    constructor(mvvm,exp,fn){
        super();
        this.fn=fn;
        this.mvvm=mvvm;
        this.exp=exp;
        Dep.target=this;
        this.getNewVal();
        Dep.target=null;
    }
    getNewVal(){
        let varArr=this.exp.split('.');
        let val=this.mvvm;
        varArr.forEach((k)=>{
            val=val[k];
        });
        return val;
    }
}