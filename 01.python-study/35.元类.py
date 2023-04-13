'''
注意：我们平时是通过类名加小括号来创建对象的，其实是通过 类对象名 加小括号来创建对象，python会自动的将我们的类对象名 与 类名保持一致。 

但当我们通过type去动态的创建一个类的时候，我们可以将类名与类对象名设置为不同。

如下

>>> Student1111 = type('Student',(object,),{'hello':hello,'name':'zzh'}) #类名为Studnet，类对象名为#Student111
>>> a = Student() # 通过类名加小括号创建对象报错
Traceback (most recent call last):
  File "<pyshell#74>", line 1, in <module>
    a = Student()
NameError: name 'Student' is not defined
type函数接收3个参数

1: 要被创建的类名   --str

2: 被创建的类的父类  --tuple

3: 该类中的方法和属性  -- dict

当我们定义一个类并运行代码的时候，python就会通过type方法去为我们创建这个类对象。
'''


'''
其实我们创建对象实际上是通过类中的__new__方法，元类的作用就是通过重写 __new__ 方法从而 控制对象的创建，我们可以更改 对象的属性名，或者给一个对象动态添加一些函数

如下:

先解释一下：

由于类对象最终是通过type函数来创建,type又是通过其内部的__new__函数进行创建

当我们自定义一个元类的时候，实际上是在type创建类对象向之前，先进行拦截，更改里面的一些属性或方法，然后再将更改后的信息传递给type的__new__函数。
'''



'''
__new__ 函数一共需要4个参数：

参数1：类似于self，传的是要被创建类对象的那个类本身。

参数2：类名

参数3：继承的类

参数4：类中的属性以及函数，会以dict的形式传递进来

上面的4个参数均无需手动传入，__new__函数也无需手动调用，当我们通过类名加小括号创建一个对象的时候，就会自动调用__new__函数，且将对应的参数传递进去。
'''



'''
>>> class TestMetaclass(type): #自定义一个元类，由于最终对象的创建还是通过type，所以需要继承type
	def __new__(cls,name,bases,attrs): #重写__new__函数，实现对象创建的控制
		attrs['add'] = lambda self,value : self.append(value) #创建对象时，为其添加一个add函数
		attrs = dict((name.upper(),value) for name,value in attrs.items() if not name.startswith('__')) #将函数名和属性名变大写
		return type.__new__(cls,name,bases,attrs) #最终还是通过type的__new__进行对象的创建
 
			 
>>> class T(list,metaclass = TestMetaclass):  #测试，如果想使用自定义的元类，则需要加上第二个参数
	name = 'zzh'
 
			 
>>> t = T()
			 
>>> t.ADD(1)  #add函数添加成功，并且名字已变大写
			 
>>> t
			 
[1]
>>> t.NAME  #属性名已经变为大写
			 
'zzh'
>>> 
'''


'''
class User(Model):
    # 定义类的属性到列的映射：
    id = IntegerField('id')
    name = StringField('username')
    email = StringField('email')
    password = StringField('password')
 
# 创建一个实例：
u = User(id=12345, name='zzh', email='666.qq.com', password='123456')
# 保存到数据库：
u.save()
'''


'''
实体类会继承Model，也就意味着它会拥有父类的属性和函数，且由于User中并没有__init__函数，所以当初始化对象时，会调用Model的__init__方法。

我们看一下Model，Model继承了dict，且Model的__init__方法实际上调用的是dict的init方法。

Model又通过元类来创建对象，也就是说User是通过元类来创建对象的

                # 补充
                Python 3 和 Python 2 的另一个区别是: Python 3 可以使用直接使用 super().xxx 代替 super(Class, self).xxx :

                # 默认，Python 3
                class B(A):
                    def add(self, x):
                        super().add(x)

                # Python 2
                class B(A):
                    def add(self, x):
                        super(B, self).add(x)
                所以，你如果用的是 Python 2 的话，记得将本文的 super() 替换为 suepr(Class, self) 。

# 继续
                
class Model(dict, metaclass=ModelMetaclass):
 
    def __init__(self, **kw):
        super(Model, self).__init__(**kw) #实体类最终通过dict的__init__方法来初始化对象
 
    def __getattr__(self, key):
        try:
            return self[key]
        except KeyError:
            raise AttributeError(r"'Model' object has no attribute '%s'" % key)
 
    def __setattr__(self, key, value):
        self[key] = value
 
    def save(self):
        fields = []  #用来存 字段名
        params = []  #每有一个列，我们就往里存入一个问号，用来当占位符
        args = []  #用来存入 sql语句的参数，最终会代替 问号
        for k, v in self.__mappings__.items(): #for循环遍历 实体类属性与数据库字段映射关系，下面会给出__mappings__
            fields.append(v.name)  #取出 字段名
            params.append('?')  #拼接占位符
            args.append(getattr(self, k, None))  #获得字段值
        sql = 'insert into %s (%s) values (%s)' % (self.__table__, ','.join(fields), ','.join(params)) #拼接sql语句
        print('SQL: %s' % sql)
        print('ARGS: %s' % str(args))
'''





'''
我们再来看一下创建实体对象的元类 --ModelMetaclass

ModelMetaclass 实现对创建实体类对象的控制

class ModelMetaclass(type):
 
    def __new__(cls, name, bases, attrs): #name为实体类名，bases为实体类继承的类即Model，attrs为 实体类中的属性 
        if name=='Model':
            return type.__new__(cls, name, bases, attrs)
        print('Found model: %s' % name)
        mappings = dict() #创建一个空dict()，用来存放User实体类中的属性
        for k, v in attrs.items(): #由于attrs是一个dict，key为属性名或方法名，value为属性值，或函数对象
            if isinstance(v, Field): #判断这个属性值，是否是一个Field对象(下面会有Field类的代码)
                print('Found mapping: %s ==> %s' % (k, v))
                mappings[k] = v #如果是Filed，我们就把这组键值对放入mappings
        for k in mappings.keys():
            attrs.pop(k) #再把User对象中对应的 键值对删掉,防止直接访问
        attrs['__mappings__'] = mappings # 给User对象添加一个属性 mappings，存放的是实体类属性与数据库字段的映射关系
        attrs['__table__'] = name # 给User对象添加一个属性，存放表名（假设表名和类名一致）
        return type.__new__(cls, name, bases, attrs) #最终创建一个对象还是调用type的__new__函数
 通过上面的代码，我们可以看出，实体类对象创建出来以后 应该包含两个属性，一个是 __mappings__，一个是__table__。

__mappings__存放的 实体类属性名与数据库字段名的映射关系，而__table__存放的是表名，这里我们假设的是表名与实体类类名一样。
'''



'''
下面的就简单了

class Field(object):
 
    def __init__(self, name, column_type):
        self.name = name
        self.column_type = column_type
 
    def __str__(self):
        return '<%s:%s>' % (self.__class__.__name__, self.name)


class StringField(Field):
 
    def __init__(self, name):
        super(StringField, self).__init__(name, 'varchar(100)')
 
class IntegerField(Field):
 
    def __init__(self, name):
        super(IntegerField, self).__init__(name, 'bigint')
'''


'''

class User(Model):
    # 定义类的属性到列的映射：
    id = IntegerField('id')
    name = StringField('username')
    email = StringField('email')
    password = StringField('password')


第一部分创建StringField和IntegerField类
第二部分创建User类。User类继承Model类，Model类继承dict，并构造dict，继承ModelMetaclass元类
                  在Model类初始化__init__中，构造dict和ModelMetaclass
                  在函数体中将User类中定义的属性，存放在 mappings，然后将 User中原有的属性全部删除，并在User类中动态的 创建 一个属性 名为 __mappings__，
                  属性值为mappings，再创建一个属性 名为 __table__ 存放 User类类名，这里假设数据库中的表名就是User 和类名一样。 到此为止 User类对象创建完毕。

'''


'''
当我们创建一个User对象时（注意，这里是通过User类创建一个User类的实例，与上面的User类对象不同），就会调用User类的__init__函数来初始化User类对象，但发现其中并没有写，就会去它的父类Model中去找，Model中存在__init__函数，且发现Model中的__init__函数调用的实际上是dict中的init函数，就这样User类对象通过dict类的__init__函数被初始化完毕。

u = User(id=12345, name='zzh', email='666.qq.com', password='123456')
 由于User是通过dict初始化的，且User也间接的继承了dict，而dict中的__str__函数会返回其中保存的数据。使用print（对象名） 会调用 __str__函数，我们来试试

>>> print(User(id=12345, name='zzh', email='666@qq.com', password='123456'))
{'id': 12345, 'name': 'zzh', 'email': '666@qq.com', 'password': '123456'}
'''