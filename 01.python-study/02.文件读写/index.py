f = open("./text.txt", "w", encoding="utf-8")
print('f', f)
f.write("Python 是一个非常好的语言。\n是的，的确非常好!!\n\n\n\n\n俺也一样！" )
# 关闭打开的文件
f.close()


f = open("./text.txt", "r", encoding="utf-8")
str = f.read()
print(str)
# 关闭打开的文件
f.close()


f = open("./text.txt", "r", encoding="utf-8")
i = 0
while i < 20:
    print(f.readline())
    i = i + 1
# 关闭打开的文件
f.close()



f = open("./text.txt", "r", encoding="utf-8")
str = f.readlines()
print(str)
# 关闭打开的文件
f.close()



f = open("./text.txt", "r", encoding="utf-8")
for line in f:
    print(line, end='')
# 关闭打开的文件
f.close()



f = open("./text.txt", "w", encoding="utf-8")
num = f.write( "关注嘉然，关注永雏塔菲。\n是的，的确非常好!!\n" )
print(num)


import pickle
data1 = {'a': [1, 2.0, 3, 4+6j],
         'b': ('string', u'Unicode string'),
         'c': None}

selfref_list = [1, 2, 3]
selfref_list.append(selfref_list)

output = open('./data.pkl', 'wb')

# Pickle dictionary using protocol 0.
pickle.dump(data1, output)

# Pickle the list using the highest protocol available.
pickle.dump(selfref_list, output, -1)

output.close()


import pprint, pickle

#使用pickle模块从文件中重构python对象
pkl_file = open('data.pkl', 'rb')

data1 = pickle.load(pkl_file)
pprint.pprint(data1)

data2 = pickle.load(pkl_file)
pprint.pprint(data2)

pkl_file.close()