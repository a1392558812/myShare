export const menuArr = [
    {
        title: '首页',
        path:'/home',
        key: '1',
        icon: 'PieChartOutlined'
    },
    {
        title: '顾客管理',
        path:'/managecustomer',
        key: '11',
        icon: 'DatabaseOutlined'
    },
    {
        title: '用户管理',
        path:'/user',
        key: '5',
        icon: 'UserSwitchOutlined'
    },
    {
        title: '角色管理',
        key: '6',
        path: '/role',
        icon: 'TeamOutlined',
    },
    {
        title: '图书管理',
        key: '2',
        icon: 'AppstoreAddOutlined',
        child: [
            {
                title: '种类管理',
                path: '/category',
                key: '3',
                icon: 'SettingFilled'
            },
            {
                title: '商品管理',
                path: '/product',
                key: '4',
                icon: 'SettingFilled'
            },
        ]
    },
    {
        title: '图形管理',
        key: '7',
        icon: 'ApartmentOutlined',
        child: [
            {
                title: '柱状图',
                path: '/chartform01',
                key: '8',
                icon: 'TableOutlined'
            },
            {
                title: '折线图',
                path: '/chartform02',
                key: '9',
                icon: 'TableOutlined'
            },
            {
                title: '饼图',
                path: '/chartform03',
                key: '10',
                icon: 'TableOutlined'
            },

        ]
    },
]