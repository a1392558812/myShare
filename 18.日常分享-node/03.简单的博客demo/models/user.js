const mongoose = require('mongoose')
const Schema = mongoose.Schema
const UserSchema = new Schema({
    email:{type: String,required: true,},
    nickname: {type: String,required: true},
    password: {type: String,required: true},
    create_time: {type: Number,default: Date.now},
    last_modify_time: {type: Number,default: Date.now},
    avatar: {type: String,default:'public/img/avatar-default.png'},
    bio: {type: String,},
    gender: {type: Number,default: -1}, // -1保密，0男，1女
    birthday: {type: String},
    status: {type: Number}, //  0没有限制，1不可以评论，2不可以登录
})
const UserModel = mongoose.model('users',UserSchema)
module.exports = UserModel
