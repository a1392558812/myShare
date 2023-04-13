'''
Python random 模块主要用于生成随机数。

random 模块实现了各种分布的伪随机数生成器。

要使用 random 函数必须先导入：

import random
查看 random 模块中的内容:

实例
>>> import random
>>> dir(random)
['BPF', 'LOG4', 'NV_MAGICCONST', 'RECIP_BPF', 'Random', 'SG_MAGICCONST', 'SystemRandom', 'TWOPI', '_Sequence', '_Set', '__all__', '__builtins__', '__cached__', '__doc__', '__file__', '__loader__', '__name__', '__package__', '__spec__', '_accumulate', '_acos', '_bisect', '_ceil', '_cos', '_e', '_exp', '_floor', '_inst', '_log', '_os', '_pi', '_random', '_repeat', '_sha512', '_sin', '_sqrt', '_test', '_test_generator', '_urandom', '_warn', 'betavariate', 'choice', 'choices', 'expovariate', 'gammavariate', 'gauss', 'getrandbits', 'getstate', 'lognormvariate', 'normalvariate', 'paretovariate', 'randbytes', 'randint', 'random', 'randrange', 'sample', 'seed', 'setstate', 'shuffle', 'triangular', 'uniform', 'vonmisesvariate', 'weibullvariate']
接下来我们使用 random() 方法返回一个随机数，它在半开放区间 [0,1) 范围内，包含 0 但不包含 1。

实例
# 导入 random 包
import random

# 生成随机数
print(random.random())
以上实例输出结果为：

0.4784904215869241
seed() 方法改变随机数生成器的种子，可以在调用其他随机模块函数之前调用此函数。

实例
#!/usr/bin/python3
import random

random.seed()
print ("使用默认种子生成随机数：", random.random())
print ("使用默认种子生成随机数：", random.random())

random.seed(10)
print ("使用整数 10 种子生成随机数：", random.random())
random.seed(10)
print ("使用整数 10 种子生成随机数：", random.random())

random.seed("hello",2)
print ("使用字符串种子生成随机数：", random.random())
以上实例运行后输出结果为：

使用默认种子生成随机数： 0.7908102856355441
使用默认种子生成随机数： 0.81038961519195
使用整数 10 种子生成随机数： 0.5714025946899135
使用整数 10 种子生成随机数： 0.5714025946899135
使用字符串种子生成随机数： 0.3537754404730722
random 模块方法
random 模块方法如下：

方法	描述
seed()	初始化随机数生成器
getstate()	返回捕获生成器当前内部状态的对象。
setstate()	state 应该是从之前调用 getstate() 获得的，并且 setstate() 将生成器的内部状态恢复到 getstate() 被调用时的状态。
getrandbits(k)	返回具有 k 个随机比特位的非负 Python 整数。 此方法随 MersenneTwister 生成器一起提供，其他一些生成器也可能将其作为 API 的可选部分提供。 在可能的情况下，getrandbits() 会启用 randrange() 来处理任意大的区间。
randrange()	从 range(start, stop, step) 返回一个随机选择的元素。
randint(a, b)	返回随机整数 N 满足 a <= N <= b。
choice(seq)	从非空序列 seq 返回一个随机元素。 如果 seq 为空，则引发 IndexError。
choices(population, weights=None, *, cum_weights=None, k=1)	从 population 中选择替换，返回大小为 k 的元素列表。 如果 population 为空，则引发 IndexError。
shuffle(x[, random])	将序列 x 随机打乱位置。
sample(population, k, *, counts=None)	返回从总体序列或集合中选择的唯一元素的 k 长度列表。 用于无重复的随机抽样。
random()	返回 [0.0, 1.0) 范围内的下一个随机浮点数。
uniform()	返回一个随机浮点数 N ，当 a <= b 时 a <= N <= b ，当 b < a 时 b <= N <= a 。
triangular(low, high, mode)	返回一个随机浮点数 N ，使得 low <= N <= high 并在这些边界之间使用指定的 mode 。 low 和 high 边界默认为零和一。 mode 参数默认为边界之间的中点，给出对称分布。
betavariate(alpha, beta)	Beta 分布。 参数的条件是 alpha > 0 和 beta > 0。 返回值的范围介于 0 和 1 之间。
expovariate(lambd)	指数分布。 lambd 是 1.0 除以所需的平均值，它应该是非零的。
gammavariate()	Gamma 分布（ 不是伽马函数） 参数的条件是 alpha > 0 和 beta > 0。
gauss(mu, sigma)	正态分布，也称高斯分布。 mu 为平均值，而 sigma 为标准差。 此函数要稍快于下面所定义的 normalvariate() 函数。
lognormvariate(mu, sigma)	对数正态分布。 如果你采用这个分布的自然对数，你将得到一个正态分布，平均值为 mu 和标准差为 sigma 。 mu 可以是任何值，sigma 必须大于零。
normalvariate(mu, sigma)	正态分布。 mu 是平均值，sigma 是标准差。
vonmisesvariate(mu, kappa)	冯·米塞斯分布。 mu 是平均角度，以弧度表示，介于0和 2*pi 之间，kappa 是浓度参数，必须大于或等于零。 如果 kappa 等于零，则该分布在 0 到 2*pi 的范围内减小到均匀的随机角度。
paretovariate(alpha)	帕累托分布。 alpha 是形状参数。
weibullvariate(alpha, beta)	威布尔分布。 alpha 是比例参数，beta 是形状参数。
'''