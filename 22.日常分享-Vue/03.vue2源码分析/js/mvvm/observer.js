function Observer(data) {
    this.data = data; // 保存数据
    this.walk(data); // 开始对data的监视
}

Observer.prototype = {
    constructor: Observer,
    walk: function(data) {
        var me = this; //保存observer对象
        Object.keys(data).forEach(function(key) { // 遍历data中所有属性
            console.log("Observer中的key：",key)
            me.convert(key, data[key]); // 对指定属性响应式的绑定
        });
    },
    convert: function(key, val) {
        this.defineReactive(this.data, key, val);
    },

    defineReactive: function(data, key, val) {
        var dep = new Dep(); // 创建属性对应的dep()
        var childObj = observe(val);// 递归调用，实现对data所有层次的属性dep()监视

        Object.defineProperty(data, key, { // 给data重写属性，添加set()和set()方法
            enumerable: true, // 可枚举
            configurable: false, // 不能再define
            get: function() { // 读取并返回当前值，
                if (Dep.target) {
                    dep.depend();  // 建立dep与watcher的关系
                }
                return val;
            },
            set: function(newVal) { // 监视data中key属性的变化,更新页面
                if (newVal === val) {
                    return;
                }
                val = newVal;
                // 新的值是object的话，进行监听
                childObj = observe(newVal);
                // 通知订阅者
                dep.notify(); // 通知相关联的watcher
            }
        });
    }
};

function observe(value, vm) { // 被监视的必须是一个对象
    if (!value || typeof value !== 'object') {
        return;
    }

    return new Observer(value); // 创建一个对应的Observer对象
};


var uid = 0;

function Dep() {
    this.id = uid++;
    this.subs = [];
}

Dep.prototype = {
    addSub: function(sub) { // 添加watcher到dep中
        this.subs.push(sub);
    },

    depend: function() { // 去建立dep与watcher关系
        Dep.target.addDep(this);
    },

    removeSub: function(sub) {
        var index = this.subs.indexOf(sub);
        if (index != -1) {
            this.subs.splice(index, 1);
        }
    },

    notify: function() {
        this.subs.forEach(function(sub) { // 遍历watcher数组，，通知更新改变
            sub.update();
        });
    }
};

Dep.target = null;