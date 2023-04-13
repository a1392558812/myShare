换行 = '\n -----下一话题--------------------------------------------------------------------------------------------------------------------------------------- \n'

'''
Python 推导式是一种独特的数据处理方式，可以从一个数据序列构建另一个新的数据序列的结构体。

Python 支持各种数据结构的推导式：

列表(list)推导式
字典(dict)推导式
集合(set)推导式
元组(tuple)推导式
'''

'''
[表达式 for 变量 in 列表] 
[out_exp_res for out_exp in input_list]

或者 

[表达式 for 变量 in 列表 if 条件]
[out_exp_res for out_exp in input_list if condition]

out_exp_res：列表生成元素表达式，可以是有返回值的函数。
for out_exp in input_list：迭代 input_list 将 out_exp 传入到 out_exp_res 表达式中。
if condition：条件语句，可以过滤列表中不符合条件的值。
'''

names = ['Bob','Tom','alice','Jerry','Wendy','Smith']
new_names = [name.upper() for name in names if len(name)>3]
print(new_names)

print(换行)

# 计算 30 以内可以被 3 整除的整数：
multiples = [i for i in range(30) if i % 3 == 0]
print(multiples)

'''
字典推导基本格式：

{ key_expr: value_expr for value in collection }

或

{ key_expr: value_expr for value in collection if condition }
'''
listdemo = ['Google','Runoob', 'Taobao']
newdict = {key:len(key) for key in listdemo}
print(newdict)

print(换行)

dic = {x: x**2 for x in (2, 4, 6)}
print(dic)

print(换行)

'''
集合推导式基本格式：

{ expression for item in Sequence }
或
{ expression for item in Sequence if conditional }
'''

setnew = {i**2 for i in (1,2,3)}
print(setnew)

print(换行)

a = {x for x in 'abracadabra' if x not in 'abc'}
print(a)

print(换行)

'''
元组推导式可以利用 range 区间、元组、列表、字典和集合等数据类型，快速生成一个满足指定需求的元组。

元组推导式基本格式：

(expression for item in Sequence )
或
(expression for item in Sequence if conditional )
元组推导式和列表推导式的用法也完全相同，只是元组推导式是用 () 圆括号将各部分括起来，而列表推导式用的是中括号 []，另外元组推导式返回的结果是一个生成器对象。
'''

a = (x for x in range(1,10))
print(a) # 返回 <generator object <genexpr> at 0x000001D5A224C860>， 返回的是生成器对象
print(tuple(a)) # 使用 tuple() 函数，可以直接将生成器对象转换成元组
print((1,2,3,4,5,6))