from setuptools import find_packages, setup

setup(
    name='flaskr',
    version='1.0.0',
    # packages 告诉 Python 包所包括的文件夹（及其所包含的 Python 文件）。 find_packages() 自动找到这些文件夹，这样就不用手动写出来。
    packages=find_packages(), 
    # 为了包含其他文件夹，如静态文件和模板文件所在的文件夹，需要设置 include_package_data 。 Python 还需要一个名为 MANIFEST.in 文件来说明这些文件有哪些。
    include_package_data=True, 
    zip_safe=False,
    install_requires=[
        'flask',
    ],
)