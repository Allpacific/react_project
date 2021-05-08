import React, { Component } from 'react'
import {Button, Card, Icon, Form, Input, Select, message} from 'antd'
import {connect} from 'react-redux'
import {reqCategoryList, reqAddProduct, reqProdById, reqUpdateProduct} from '../../api'
import PictureWall from './picture_wall'
import RichTextEditor from './rich_text_editor'

const {Item} = Form
const {Option} = Select

@connect(
    state => ({
            categoryList: state.categoryList,
            productList: state.productList
        }),
    {}
)
@Form.create()
class AddUpdate extends Component {

    state = {
        categoryList: [], // 商品分类的列表
        operaType: 'add',
        categoryId: '',
        name: '',
        desc: '',
        price: '',
        detail: '',
        imgs: [],
        _id: ''
    }

    pictureWall = React.createRef()
    richTextEditor = React.createRef()

    componentDidMount() {
        const {categoryList, productList} = this.props
        const {id} = this.props.match.params
        
        if(categoryList.length) {
            this.setState({categoryList})
        }else {
            this.getCategoryList()
        }

        if(id) {
            this.setState({operaType: 'update'})
            if(productList.length) {
                let result = productList.find((item) => {
                    return item._id === id
                })
                if(result) this.setState({...result})
                this.pictureWall.current.setFileList(result.imgs)
                this.richTextEditor.current.setRichText(result.detail)
            }else {
                this.getProductList(id)
            }
        }

    }

    getProductList = async(id) => {
        let result = await reqProdById(id)
        const {status, data} = result
        if(status === 0) {
            this.setState({...data})
            this.pictureWall.current.setFileList(data.imgs)
            this.richTextEditor.current.setRichText(data.detail)
        }
    }

    getCategoryList = async() => {
        // console.log("redux中没有数据");
        let result = await reqCategoryList()
        const {status,data,msg} = result
        if(status === 0) this.setState({categoryList: data})
        else message.error(msg, 1)
    }

    handleSubmit = (event) => {
        event.preventDefault()

        // 从上传组件中获取已经上传的图片数组
        // 获取照片墙组件中的函数
        // console.log(this.pictureWall.current.getImgArr());
        let imgs = this.pictureWall.current.getImgArr()

        // 从富文本组件中获取用户输入的文字转换为富文本的字符串
        let detail = this.richTextEditor.current.getRichText()

        const {operaType, _id} = this.state
        this.props.form.validateFields(async(err, values) => {
            if(err) return
            // console.log({...values, imgs, detail});
            let result
            if(operaType === 'add') result = await reqAddProduct({...values, imgs, detail})
            else result = await reqUpdateProduct({...values, imgs, detail, _id})

            const {msg, status} = result
            if(status === 0) {
                message.success('操作成功！', 1)
                this.props.history.replace('/admin/prod_about/product')
            }
            else message.error(msg, 1)
        })
    }

    render() {
        // getFieldDecorator包装Form组件
        const {getFieldDecorator} = this.props.form
        const {operaType} = this.state
        // 左上角返回区域
        const title = (
            <div>
                <Button type="link" onClick={this.props.history.goBack}>
                    <Icon type="arrow-left"/>
                    <span>返回</span>
                </Button>
                <span>{operaType === 'update' ? '商品修改' : '商品添加'}</span>
            </div>
        )

        // 控制表单左右比例
        const formItemLayout = {
            labelCol: {
                md: { span: 2 },
            },
            wrapperCol: {
                md: { span: 9 },
            }
        };

        return (
            <Card title={title}>
                <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                    <Item label="商品名称">
                        {
                            getFieldDecorator('name', {
                                initialValue: this.state.name || '',
                                rules: [{required: true, message: '请输入商品名称'},]
                            })(
                                <Input 
                                    placeholder="商品名称"
                                />
                            )
                        }
                    </Item>
                    <Item label="商品描述">
                        {
                            getFieldDecorator('desc', {
                                initialValue: this.state.desc || '',
                                rules: [{required: true, message: '请输入商品描述'},]
                            })(
                                <Input 
                                    placeholder="商品描述"
                                />
                            )
                        }
                    </Item>
                    <Item label="商品价格">
                        {
                            getFieldDecorator('price', {
                                initialValue: this.state.price || '',
                                rules: [
                                    {required: true, message: '请输入商品价格'},
                                ]
                            })(
                                <Input 
                                    placeholder="商品价格"
                                    addonAfter="元"
                                    prefix="￥"
                                    type="number"
                                />
                            )
                        }
                    </Item>
                    <Item label="商品分类">
                        {
                            getFieldDecorator('categoryId', {
                                initialValue: this.state.categoryId || '',
                                rules: [
                                    {required: true, message: '请选择一个分类'},
                                ]
                            })(
                                <Select>
                                    <Option value="">请选择分类</Option>
                                    {
                                        this.state.categoryList.map((item) => {
                                            return <Option key={item._id} value={item._id}>{item.name}</Option>
                                        })
                                    }
                                </Select>
                            )
                        }
                    </Item>
                    <Item label="商品图片" wrapperCol={{md: 12}}>
                        <PictureWall ref={this.pictureWall}/>
                    </Item>
                    <Item label="商品详情" wrapperCol={{md: 16}}>
                        <RichTextEditor ref={this.richTextEditor}/>
                    </Item>
                    <Button type="primary" htmlType="submit">提交</Button>
                </Form>
            </Card>
        )
    }
}

export default AddUpdate