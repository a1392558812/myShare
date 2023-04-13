换行 = '\n -----下一话题--------------------------------------------------------------------------------------------------------------------------------------- \n'
'''
while 循环
Python 中 while 语句的一般形式：

while 判断条件(condition)：
    执行语句(statements)……
'''

n = 100
 
sum = 0
counter = 1
while counter <= n:
    sum = sum + counter
    counter += 1
 
print("1 到 %d 之和为: %d" % (n,sum))

print(换行)

'''
无限循环
我们可以通过设置条件表达式永远不为 false 来实现无限循环，实例如下：

实例
#!/usr/bin/python3
 
var = 1
while var == 1 :  # 表达式永远为 true
   num = int(input("输入一个数字  :"))
   print ("你输入的数字是: ", num)
 
print ("Good bye!")
执行以上脚本，输出结果如下：

输入一个数字  :5
你输入的数字是:  5
输入一个数字  :
你可以使用 CTRL+C 来退出当前的无限循环。

无限循环在服务器上客户端的实时请求非常有用。

'''

'''
while 循环使用 else 语句
如果 while 后面的条件语句为 false 时，则执行 else 的语句块。

语法格式如下：

while <expr>:
    <statement(s)>
else:
    <additional_statement(s)>
expr 条件语句为 true 则执行 statement(s) 语句块，如果为 false，则执行 additional_statement(s)。

循环输出数字，并判断大小：

实例
#!/usr/bin/python3
 
count = 0
while count < 5:
   print (count, " 小于 5")
   count = count + 1
else:
   print (count, " 大于或等于 5")
执行以上脚本，输出结果如下：

0  小于 5
1  小于 5
2  小于 5
3  小于 5
4  小于 5
5  大于或等于 5
'''


sites = ["Baidu", "Google","Runoob","Taobao"]
for site in sites:
    print(site)

print(换行)

word = 'runoob'
 
for letter in word:
    print(letter)

print(换行)

for number in range(1, 6):
    print(number)

print(换行)

'''
在 Python 中，for...else 语句用于在循环结束后执行一段代码。

语法格式如下：

for item in iterable:
    # 循环主体
else:
    # 循环结束后执行的代码
当循环执行完毕（即遍历完 iterable 中的所有元素）后，会执行 else 子句中的代码，如果在循环过程中遇到了 break 语句，则会中断循环，此时不会执行 else 子句。

实例
for x in range(6):
  print(x)
else:
  print("Finally finished!")
执行脚本后，输出结果为：

0
1
2
3
4
5
Finally finished!
以下 for 实例中使用了 break 语句，break 语句用于跳出当前循环体，不会执行 else 子句：

实例
#!/usr/bin/python3
 
sites = ["Baidu", "Google","Runoob","Taobao"]
for site in sites:
    if site == "Runoob":
        print("菜鸟教程!")
        break
    print("循环数据 " + site)
else:
    print("没有循环数据!")
print("完成循环!")
执行脚本后，在循环到 "Runoob"时会跳出循环体：

循环数据 Baidu
循环数据 Google
菜鸟教程!
完成循环!
'''

'''
range() 函数
如果你需要遍历数字序列，可以使用内置 range() 函数。它会生成数列，例如:

实例
>>>for i in range(5):
...     print(i)
...
0
1
2
3
4
你也可以使用 range() 指定区间的值：

实例
>>>for i in range(5,9) :
    print(i)
 
    
5
6
7
8
>>>
也可以使 range() 以指定数字开始并指定不同的增量(甚至可以是负数，有时这也叫做'步长'):

实例
>>>for i in range(0, 10, 3) :
    print(i)
 
    
0
3
6
9
>>>
负数：

实例
>>>for i in range(-10, -100, -30) :
    print(i)
 
    
-10
-40
-70
>>>
您可以结合 range() 和 len() 函数以遍历一个序列的索引,如下所示:

实例
>>>a = ['Google', 'Baidu', 'Runoob', 'Taobao', 'QQ']
>>> for i in range(len(a)):
...     print(i, a[i])
... 
0 Google
1 Baidu
2 Runoob
3 Taobao
4 QQ
>>>
还可以使用 range() 函数来创建一个列表：

实例
>>>list(range(5))
[0, 1, 2, 3, 4]
>>>
更多关于 range() 函数用法参考：https://www.runoob.com/python3/python3-func-range.html


'''

'''
end 关键字
关键字end可以用于将结果输出到同一行，或者在输出的末尾添加不同的字符，实例如下：

实例(Python 3.0+)
#!/usr/bin/python3
 
# Fibonacci series: 斐波纳契数列
# 两个元素的总和确定了下一个数
a, b = 0, 1
while b < 1000:
    print(b, end=',')
    a, b = b, a+b
执行以上程序，输出结果为：

1,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,
'''

a, b = 0, 1
while b < 1000:
    print(b, end=',')
    a, b = b, a+b



'''
Python 编程中 while 语句用于循环执行程序，即在某条件下，循环执行某段程序，以处理需要重复处理的相同任务。其基本形式为：

while 判断条件(condition)：
    执行语句(statements)……
执行语句可以是单个语句或语句块。判断条件可以是任何表达式，任何非零、或非空（null）的值均为true。

当判断条件假 false 时，循环结束。
'''

print(换行)


'''
break 语句可以跳出 for 和 while 的循环体。如果你从 for 或 while 循环中终止，任何对应的循环 else 块将不执行。

continue 语句被用来告诉 Python 跳过当前循环块中的剩余语句，然后继续进行下一轮循环。
'''

n = 5
while n > 0:
    n -= 1
    if n == 2:
        break
    print(n)
print('循环结束。')

n = 5
while n > 0:
    n -= 1
    if n == 2:
        continue
    print(n)
print('循环结束。')

print(换行)

for letter in 'Runoob':     # 第一个实例
   if letter == 'b':
      break
   print ('当前字母为 :', letter)
  
var = 10                    # 第二个实例
while var > 0:              
   print ('当前变量值为 :', var)
   var = var -1
   if var == 5:
      break
 
print ("Good bye!")

print(换行)

'''
循环语句可以有 else 子句，它在穷尽列表(以for循环)或条件变为 false (以while循环)导致循环终止时被执行，但循环被 break 终止时不执行。

如下实例用于查询质数的循环例子:
'''

for n in range(2, 100):
    for x in range(2, n):
        if n % x == 0:
            print(n, '等于', x, '*', n//x)
            break
    else:
        # 循环中没有找到元素
        print(n, ' 是质数')

print(换行)

'''
Python pass是空语句，是为了保持程序结构的完整性。

pass 不做任何事情，一般用做占位语句，如下实例
'''

for letter in 'Runoob': 
   if letter == 'o':
      pass
      print ('执行 pass 块')
   print ('当前字母 :', letter)
 
print ("Good bye!")