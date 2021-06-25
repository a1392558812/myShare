import Vue from 'vue'

import {
  Form,
  FormItem,
  Button,
  Select,
  Message,
  Container,
  Aside,
  Menu,
  Header,
  Submenu,
  Footer,
  Main,
  MenuItem,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  Row,
  Col,
  Table,
  TableColumn,
  Tag,
  Popover,
  Pagination,
  Switch,
  Tooltip,
  Dialog,
  MessageBox,
  Loading,
  Tree,
  Option,
  Cascader,
  Radio,
  RadioGroup,
  Alert,
  Tabs,
  TabPane,
  Input,
  Steps,
  Step,
  Checkbox,
  CheckboxGroup,
  Upload,
  Image,
  Timeline,
  TimelineItem
} from 'element-ui'

Vue.use(TimelineItem)
Vue.use(Timeline)
Vue.use(Image)
Vue.use(Upload)
Vue.use(CheckboxGroup)
Vue.use(Checkbox)
Vue.use(Step)
Vue.use(Steps)
Vue.use(Input)
Vue.use(TabPane)
Vue.use(Tabs)
Vue.use(Alert)
Vue.use(RadioGroup)
Vue.use(Radio)
Vue.use(Cascader)
Vue.use(Option)
Vue.use(Tree)
Vue.use(FormItem)
Vue.use(Form)
Vue.use(Dialog)
Vue.use(Tooltip)
Vue.use(Switch)
Vue.use(Pagination)
Vue.use(Popover)
Vue.use(Tag)
Vue.use(TableColumn)
Vue.use(Table)
Vue.use(Row)
Vue.use(Col)
Vue.use(Card)
Vue.use(BreadcrumbItem)
Vue.use(Breadcrumb)
Vue.use(MenuItem)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Aside)
Vue.use(Header)
Vue.use(Footer)
Vue.use(Menu)
Vue.use(Main)
Vue.use(Submenu)
Vue.use(Button)
Vue.use(Select)
Vue.use(Container)
Vue.use(Loading.directive);

Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$prompt = MessageBox.prompt;
