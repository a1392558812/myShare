/*
    相当于Vue的构造函数
  */
function MVVM(options) {
    // 将配置对象保存到vm
    this.$options = options || {}; // 如果有配置传入配置，没有的话传入空配置
    var data = this._data = this.$options.data; // 将data对象保存到vm和变量data中
    var me = this; // 保存vm到变量me

    // 数据代理
    // 实现 vm.xxx -> vm._data.xxx
    Object.keys(data).forEach(function(key) { // 遍历data中所有的属性，key是data某个属性名
        me._proxyData(key); // 对指定的属性实现代理
    });

    this._initComputed();

    observe(data, this); // 对data中所有层次的属性通过数据劫持实现数据绑定

    this.$compile = new Compile(options.el || document.body, this) // 创建一个编译对象（解析模板）
}

MVVM.prototype = {
    constructor: MVVM,
    $watch: function(key, cb, options) {
        new Watcher(this, key, cb);
    },

    _proxyData: function(key, setter, getter) { // 实现数据代理的方法
        var me = this; // 保存vm
        setter = setter || 
        Object.defineProperty(me, key, { // 给vm添加与data对象的对应指定的属性，使用属性描述符的技术
            configurable: false, // 不能重新定义
            enumerable: true, // 可枚举遍历
            get: function proxyGetter() { // 当通过vm.value的方法读取属性值时，从data中获取对应的属性值返回（代理读操作）
                return me._data[key];
            },
            set: function proxySetter(newVal) { // 当vm.value = xxx的方法修改属性值时，value被保存到data对应的属性上（代理写操作）
                me._data[key] = newVal;
            }
        });
    },

    _initComputed: function() {
        var me = this;
        var computed = this.$options.computed;
        if (typeof computed === 'object') {
            Object.keys(computed).forEach(function(key) {
                Object.defineProperty(me, key, {
                    get: typeof computed[key] === 'function' 
                            ? computed[key] 
                            : computed[key].get,
                    set: function() {}
                });
            });
        }
    }
};