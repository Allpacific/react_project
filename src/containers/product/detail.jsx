import React, { Component } from 'react'
import {Button, Card, Icon, List, message} from 'antd'
import {connect} from 'react-redux'
import {reqCategoryList, reqProdById} from '../../api'
import './css/detail.less'
import {BASE_URL} from '../../config'
const {Item} = List

@connect(
    state => ({
        productList: state.productList,
        categoryList: state.categoryList
    })
)
class Detail extends Component {

    state = {
        categoryId: '',
        desc: '',
        detail: '',
        imgs: [],
        name: '',
        price: '',
        categoryName: '',
        isLoading: true
    }
    
    componentDidMount() {
        const {id} = this.props.match.params
        const reduxProdList = this.props.productList
        const reduxCateList = this.props.categoryList

        if(reduxProdList.length) {
            let result = reduxProdList.find((item) => item._id === id)
            if(result) {
                this.categoryId = result.categoryId
                this.setState({...result})
            }
        }else {
            this.getProdById(id)
        }

        if(reduxCateList.length) {
            // console.log('我是从redux中读取出来的分类列表', reduxCateList);
            // console.log('我是从自身状态上拿到的分类ID', this.state.categoryId);
            let result = reduxCateList.find((item) => item._id === this.categoryId)
            // console.log(result);
            this.setState({categoryName: result.name, isLoading: false})
        }else {
            this.getCategoryList()
        }
        
    }

    getProdById = async(id) => {
        let result = await reqProdById(id)
        // console.log(result);
        const {data, status, msg} = result
        if(status === 0) {
            // const {categoryId,desc,detail,imgs,name,price} = data
            // this.setState({categoryId,desc,detail,imgs,name,price})
            this.categoryId = data.categoryId
            this.setState({...data})
        }else {
            message.error(msg, 1)
        }
    }

    
    getCategoryList = async() => {
        let result = await reqCategoryList()
        const {data, status, msg} = result
        if(status === 0) {
            let result = data.find((item) => item._id === this.categoryId)
            if(result) {
                this.setState({categoryName: result.name, isLoading: false})
            }else {
                message.error(msg, 1)
            }
        }
    }

    render() {
        return (
                <Card 
                    title={
                        <div className="left-top">
                            <Button type="link" size="small" onClick={() => {this.props.history.goBack()}}>
                                <Icon type="arrow-left" style={{fontSize: '20px'}}/>
                            </Button>
                            <span>商品详情</span>
                        </div>
                    }
                    loading={this.state.isLoading}
                >
                    <List className="prod-list">
                        <Item>
                            <div>
                                <span className="prod-title">商品名称：</span>
                                <span>{this.state.name}</span>
                            </div>
                        </Item>
                        <Item>
                            <div>
                                <span className="prod-title">商品描述：</span>
                                <span>{this.state.desc}</span>
                            </div>
                        </Item>
                        <Item>
                            <div>
                                <span className="prod-title">商品价格：</span>
                                <span>{this.state.price}</span>
                            </div>
                        </Item>
                        <Item>
                            <div>
                                <span className="prod-title">所属分类：</span>
                                <span>{this.state.categoryName}</span>
                            </div>
                        </Item>
                        <Item>
                            <div>
                                <span className="prod-title">商品图片：</span>
                                {
                                    this.state.imgs.map((item, index) => {
                                        return <img key={index} src={`${BASE_URL}/upload/`+item} alt="商品图片" style={{width: '200px'}}/>
                                    })
                                }
                            </div>
                        </Item>
                        <Item>
                            <div>
                                <span className="prod-title">商品详情：</span>
                                <span dangerouslySetInnerHTML={{__html: this.state.detail}}></span>
                            </div>
                        </Item>
                    </List>
                </Card>
        )
    }
}
export default Detail
