function Compile(el, vm) {
    // 保存vm到compile对象
    this.$vm = vm;
    // 将el对应的元素对象保存到compile对象中
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);
    // 如果有el元素
    if (this.$el) {
        this.$fragment = this.node2Fragment(this.$el); // 取出el元素中所有的子节点保存到一个fragment对象中
        this.init(); // 编译fragment中所有层次的子节点
        this.$el.appendChild(this.$fragment); // 将编译好的fragment添加到页面的el元素中
    }
}

Compile.prototype = {
    constructor: Compile,
    node2Fragment: function(el) {
        var fragment = document.createDocumentFragment(), //创建空的fragment容器
            child;

        // 将原生节点拷贝到fragment
        while (child = el.firstChild) { // 遍历将el元素中所有的子节点转移到fragment中
            fragment.appendChild(child);
        }

        return fragment;
    },

    init: function() {
        this.compileElement(this.$fragment); // 编译节点（所有层次的子节点）
    },

    compileElement: function(el) {
        var childNodes = el.childNodes, // 编译最外层的所有子节点
            me = this; // 保存compile对象

        [].slice.call(childNodes).forEach(function(node) { // 遍历所有的子节点
            var text = node.textContent;
            var reg = /\{\{(.*)\}\}/;  // 创建正则对象(匹配大括号表达式)

            if (me.isElementNode(node)) { // 判断是否是一个元素节点
                me.compile(node); // 编译解析指令

            } else if (me.isTextNode(node) && reg.test(text)) { // 判断节点是否是一个大括号文本节点
                me.compileText(node, RegExp.$1.trim()); // 编译大括号表达式文本节点
            }

            if (node.childNodes && node.childNodes.length) { // 如果当前节点还有子节点，递归调用
                me.compileElement(node);
            }
        });
    },

    compile: function(node) {
        var nodeAttrs = node.attributes, // 标签所有的属性
            me = this;
            console.log("compile的this为: ",this);
            console.log("nodeAttrs为： ",nodeAttrs);
        [].slice.call(nodeAttrs).forEach(function(attr) { // 遍历所有的属性
            console.log("attr为：",attr)
            var attrName = attr.name;
            if (me.isDirective(attrName)) { // 判断是否是指令属性
                var exp = attr.value; // exp为标签属性的属性值
                console.log("exp为： ",exp)
                var dir = attrName.substring(2); // dir为去掉“v-”的指令，例如v-on:click,则 dir=on:click
                console.log("attrName为: ",attrName) //
                console.log("dir为: ",dir); //
                // 事件指令
                if (me.isEventDirective(dir)) { // 判断是否是事件指令，判断有没有“on”
                    console.log("node为： ",node)
                    console.log("me为： ",me) // compile对象
                    console.log("me.$vm为：",me.$vm); // vm对象
                    console.log("exp为：",exp)
                    console.log("dir为：", dir)
                    compileUtil.eventHandler(node, me.$vm, exp, dir);
                    // 普通指令
                } else {
                    compileUtil[dir] && compileUtil[dir](node, me.$vm, exp); // 编译指令属性
                }

                node.removeAttribute(attrName); // 移除指令属性，在html展现页面里看不到指令属性
            }
        });
    },

    compileText: function(node, exp) {
        compileUtil.text(node, this.$vm, exp);
    },

    isDirective: function(attr) {
        return attr.indexOf('v-') == 0;
    },

    isEventDirective: function(dir) {
        return dir.indexOf('on') === 0;
    },

    isElementNode: function(node) {
        return node.nodeType == 1;
    },

    isTextNode: function(node) {
        return node.nodeType == 3;
    }
};

// 指令处理集合
var compileUtil = {
    text: function(node, vm, exp) { // 解析v-text/{{}}的
        this.bind(node, vm, exp, 'text');
    },

    html: function(node, vm, exp) { // 解析v-html的
        this.bind(node, vm, exp, 'html');
    },

    model: function(node, vm, exp) { // 解析v-model，实现数据初始化显示，和创建对应的watcher
        this.bind(node, vm, exp, 'model');

        var me = this,
            val = this._getVMVal(vm, exp);  // 得到表达式的值
        node.addEventListener('input', function(e) { // 给节点绑定input事件监听
            var newValue = e.target.value; // 得到最新的输入值
            if (val === newValue) {
                return;
            }

            me._setVMVal(vm, exp, newValue); // 将最新的值保存到表达式对应的属性
            val = newValue;
        });
    },

    class: function(node, vm, exp) { // 解析v-class
        this.bind(node, vm, exp, 'class');
    },


// 所有函数调用bind函数处理
    bind: function(node, vm, exp, dir) {
        var updaterFn = updater[dir + 'Updater']; // 获取更新节点的函数

        updaterFn && updaterFn(node, this._getVMVal(vm, exp)); // 调用函数更新节点

        new Watcher(vm, exp, function(value, oldValue) { // 为表达式创建对应的watcher，实现表达式更新显示
            updaterFn && updaterFn(node, value, oldValue);
        });
    },

    // 事件处理
    eventHandler: function(node, vm, exp, dir) { // 得到事件对象，vue对象，事件名，带on的事件类型
        var eventType = dir.split(':')[1], // 得到事件类型
            fn = vm.$options.methods && vm.$options.methods[exp]; // 得到事件名

        console.log("vm.$options.methods为: ",vm.$options.methods)
        if (eventType && fn) { // 绑定事件监听，并给回调函数的this指定为vm
            node.addEventListener(eventType, fn.bind(vm), false);
        }
    },

    _getVMVal: function(vm, exp) { // 根据表达式从vm获取值
        var val = vm;
        exp = exp.split('.');
        exp.forEach(function(k) {
            val = val[k];
        });
        return val;
    },

    _setVMVal: function(vm, exp, value) {
        var val = vm;
        exp = exp.split('.');
        exp.forEach(function(k, i) {
            // 非最后一个key，更新val的值
            if (i < exp.length - 1) {
                val = val[k];
            } else {
                val[k] = value;
            }
        });
    }
};

// 包含多个更新节点的方法的工具对象
var updater = {
    textUpdater: function(node, value) { // 更新节点的textContent属性
        node.textContent = typeof value == 'undefined' ? '' : value;
    },

    htmlUpdater: function(node, value) { // 更新节点的innerHtml属性值
        node.innerHTML = typeof value == 'undefined' ? '' : value;
    },

    classUpdater: function(node, value, oldValue) { // 更新节点的className
        var className = node.className; // 静态class属性名
        className = className.replace(oldValue, '').replace(/\s$/, '');

        var space = className && String(value) ? ' ' : '';

        node.className = className + space + value; // 静态class的值需要和动态class的值合并，设置为新的className
    },

    modelUpdater: function(node, value, oldValue) { // 更新节点value属性值
        node.value = typeof value == 'undefined' ? '' : value;
    }
};