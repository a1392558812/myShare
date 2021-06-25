function Watcher(vm, expOrFn, cb) {
    console.log("watcher中expOrFn:",expOrFn)
    this.cb = cb; // 更新界面的回调
    this.vm = vm;
    this.expOrFn = expOrFn; // 表达式
    this.depIds = {}; // 包含所有相关dep的容器对象
    // 当是渲染watcher时，expOrFn是updateComponent，即重新渲染执行render（_update）
    // 当是计算watcher时，expOrFn是计算属性的计算方法
    // 当是侦听器watcher时，expOrFn是watch属性的名字，this.cb就是watch的handler属性

    //对于渲染watcher和计算watcher来说，expOrFn的值是一个函数，可以直接设置getter
    //对于侦听器watcher来说，expOrFn是watch属性的名字，会使用parsePath函数解析路径，获取组件上该属性的值（运行getter）

    //依赖（订阅目标）更新，执行update，会进行取值操作，运行watcher.getter，也就是expOrFn函数
    if (typeof expOrFn === 'function') {
        this.getter = expOrFn;
    } else {
        this.getter = this.parseGetter(expOrFn.trim());
    }
    console.log("this.getter为",this.getter)
    console.log("this.parseGetter为：",this.parseGetter)
    this.value = this.get(); // 获取当前初始值
}

Watcher.prototype = {
    constructor: Watcher,
    update: function() {
        this.run();
    },
    run: function() {
        var value = this.get();
        var oldVal = this.value;
        if (value !== oldVal) { // 更新界面
            this.value = value;
            this.cb.call(this.vm, value, oldVal);
        }
    },
    addDep: function(dep) { // 判断dep与watcher的关系是否已经建立
        // 1. 每次调用run()的时候会触发相应属性的getter
        // getter里面会触发dep.depend()，继而触发这里的addDep
        // 2. 假如相应属性的dep.id已经在当前watcher的depIds里，说明不是一个新的属性，仅仅是改变了其值而已
        // 则不需要将当前watcher添加到该属性的dep里
        // 3. 假如相应属性是新的属性，则将当前watcher添加到新属性的dep里
        // 如通过 vm.child = {name: 'a'} 改变了 child.name 的值，child.name 就是个新属性
        // 则需要将当前watcher(child.name)加入到新的 child.name 的dep里
        // 因为此时 child.name 是个新值，之前的 setter、dep 都已经失效，如果不把 watcher 加入到新的 child.name 的dep中
        // 通过 child.name = xxx 赋值的时候，对应的 watcher 就收不到通知，等于失效了
        // 4. 每个子属性的watcher在添加到子属性的dep的同时，也会添加到父属性的dep
        // 监听子属性的同时监听父属性的变更，这样，父属性改变时，子属性的watcher也能收到通知进行update
        // 这一步是在 this.get() --> this.getVMVal() 里面完成，forEach时会从父级开始取值，间接调用了它的getter
        // 触发了addDep(), 在整个forEach过程，当前wacher都会加入到每个父级过程属性的dep
        // 例如：当前watcher的是'child.child.name', 那么child, child.child, child.child.name这三个属性的dep都会加入当前watcher
        if (!this.depIds.hasOwnProperty(dep.id)) {
            dep.addSub(this); // 将watcher添加到dep中
            this.depIds[dep.id] = dep; // 将dep添加到watcher
        }
    },
    get: function() { // 得到表达式的值，建立dep与watcher的关系
                                     console.log("get: function()的Dep.target原来",Dep.target)
        Dep.target = this; // 给dep指定当前的watcher
                                    console.log("get: function()的this与Dep.target相同:",this)
        var value = this.getter.call(this.vm, this.vm); // 建立关系
                                    console.log("get: function()的value",value)
                                     console.log("get: function()的Dep.target修改后",Dep.target)
        Dep.target = null; // 关系确立后，去除指定的当前watcher,
                            // Dep.target是观察者，这是全局唯一的，因为在任何时候只有一个观察者被处理。
                                    console.log("get: function()的Dep.target确立关系后",Dep.target)
        return value;
    },

    parseGetter: function(exp) { //
        console.log("最初的形参exp：",exp)
        if (/[^\w.$]/.test(exp)) return;
        console.log("parseGetter中的exp：",exp)
        var exps = exp.split('.');
        console.log("parseGetter中的exps：",exps)
        return function(obj) { // this.getter
            console.log("this.getter的形参obj",obj)
            for (var i = 0, len = exps.length; i < len; i++) {
                console.log("this.getter的for循环的形参obj",obj)
                if (!obj) return;
                obj = obj[exps[i]];
                console.log("obj = obj[exps[i]];",obj)
            }
            return obj;
        }
    }
};