/**
 * Created by wowo on 2017/12/28.
 */
class Observe {
    constructor(data) {
        this.data = data;
        this._init();
    }

    _init() {
        let dep = new Dep();
        let data = this.data;
        for (let key in data) {//把data属性通过Object.defineProperty的方式定义属性
            let val = data[key];
            observeMethod(val);
            Object.defineProperty(data, key, {
                enumerable: true,//可枚举
                get(){
                    Dep.target && dep.addSub(Dep.target);//添加watcher
                    return val;
                },
                set(newVal){
                    if (newVal === val) {
                        return
                    }
                    val = newVal;//如果以后再获取值的时候将最新设置的值再返还回去
                    observeMethod(newVal);
                    dep.notify();
                }
            })
        }
    }
}
/**
 * 观察对象，给对象增加object.defineProperty*/
function observeMethod(data) {
    if (typeof data !== 'object') {
        return;
    }
    return new Observe(data)
}
/**
 * 编译模板
 * */
class complie {
    constructor(el, mvvm) {
        this.mvvm = mvvm;
        this.mvvm.$el = document.querySelector(el);
        this._init();
    }

    _init() {
        let fragment = document.createDocumentFragment();
        while (this.mvvm.$el.firstChild) {
            fragment.appendChild(this.mvvm.$el.firstChild)
        }
        replaceComplete(fragment, this.mvvm);
        this.mvvm.$el.appendChild(fragment);
    }
}

/**
 * 替换模板
 * */
function replaceComplete(fragment, mvvm) {
    //将fragment.childNodes是一个伪数组，变成数组，再遍历
    Array.from(fragment.childNodes).forEach(nodeItem => {
        let reg = /\{\{(.*)\}\}/;//检验变量
        let text = nodeItem.textContent;//文本内容
        if (nodeItem.nodeType === 3 && reg.test(text)) {
            let varArr = RegExp.$1.split('.');
            let val = mvvm;
            varArr.forEach((k) => {
                val = val[k];
            });
            new Watcher(mvvm, RegExp.$1, function (newVal) {
                nodeItem.textContent = text.replace(/\{\{(.*)\}\}/, newVal);
            });
            nodeItem.textContent = text.replace(/\{\{(.*)\}\}/, val);
        }
        if (nodeItem.nodeType === 1) {//元素节点
            let attrs = nodeItem.attributes;
            Array.from(attrs).forEach((attr) => {
                let attrName = attr.name;
                let attrVal = attr.value;
                if (attrName.indexOf('v-model') == 0) {
                    nodeItem.value = mvvm[attrVal];
                }
                new Watcher(mvvm, attrVal, (newVal) => {
                    nodeItem.value = newVal;
                })
                nodeItem.addEventListener('input', function (event) {
                    let newVal = event.target.value;
                    mvvm[attrVal] = newVal;
                })
            })
        }
        if (nodeItem.childNodes) {
            replaceComplete(nodeItem, mvvm);
        }
    })
}
/**
 * vue的特点，vue不能新增不存在的属性，不存在的属性没有get和set
 * 深度响应的原理是——每次赋值一个新对象时会给这个新对象增加数据劫持
 * */
class Mvvm {
    constructor(options) {
        this.$options = options;
        let data = this._data = this.$options.data;
        observeMethod(data);
        //    this代理this._data的数据
        for (let key in data) {
            Object.defineProperty(this, key, {
                enumerable: true,
                get(){
                    return this._data[key];
                },
                set(newVal){
                    this._data[key] = newVal;
                }
            })
        }
        new Computed(this);
        //模板编译
        new complie(options.el, this);
    }
}

class Computed {
    constructor(mvvm) {
        let computed = mvvm.$options.computed;
        Object.keys(computed).forEach((key) => {
            Object.defineProperty(mvvm,key,{
                get:typeof computed[key] === 'function' ? computed[key] : computed[key].get,
                set(){}
            })
        })
    }
}