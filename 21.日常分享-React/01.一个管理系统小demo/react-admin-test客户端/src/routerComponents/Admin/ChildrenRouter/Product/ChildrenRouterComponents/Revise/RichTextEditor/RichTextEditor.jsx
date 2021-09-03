import React, { Component } from 'react';
import {message} from 'antd'
import PropTypes from 'prop-types'
/*  以受控方式更新编辑器状态的属性  base64编码处理 生成 编辑器的实体内容*/
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
// 将已有的draft 内容 ，生成一个 html 标签内容
import draftToHtml from 'draftjs-to-html';
// 将已有的 html 标签内容，生成一个 draft 内容
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import './RichTextEditor.less'

export default class EditorConvertToHTML extends Component {
    static propTypes = {
        initDetail : PropTypes.string
    }
    constructor(props) {
        super(props);
        const html = this.props.initDetail?this.props.initDetail:''
        console.log("emmmmmmmm传过来的值",this.props.initDetail)
        const contentBlock = htmlToDraft(html);
        if (contentBlock) {
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            const editorState = EditorState.createWithContent(contentState);
            this.state = {
                editorState,
            };
        }
    }
    state = {
        editorState: EditorState.createEmpty(),
    }
    sendData = () =>{
        const { editorState } = this.state;
        const result = draftToHtml(convertToRaw(editorState.getCurrentContent()))
        return result
    }
    onEditorStateChange = async (editorState) => {
        console.log("调用了")
        await this.setState({
            editorState,
        });
    };
    uploadImageCallBack = (file) => {
        return new Promise(
            (resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/manage/img/upload');
                const data = new FormData();
                data.append('image', file);
                xhr.send(data);
                xhr.addEventListener('load', () => {
                    const response = JSON.parse(xhr.responseText);
                    message.success("上传成功")
                    resolve({
                        data: {link: response.data.url}
                    })
                });
                xhr.addEventListener('error', () => {
                    const error = JSON.parse(xhr.responseText);
                    message.error("上传失败了5555555")
                    reject(error);
                });
            }
        );
    }
    render() {
        const { editorState } = this.state;
        return (
            <div>
                <Editor
                    editorState={editorState}
                    wrapperClassName="demo-wrapper"
                    editorClassName="demo-editor"
                    onEditorStateChange={this.onEditorStateChange}
                    toolbar={{
                        image: { uploadCallback: this.uploadImageCallBack, alt: { present: true, mandatory: true } },
                    }}
                />
                <textarea
                    className='demo-textarea'
                    disabled
                    value={draftToHtml(convertToRaw(editorState.getCurrentContent()))}/>
            </div>
        );
    }
}