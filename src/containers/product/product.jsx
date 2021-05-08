import React, { Component } from 'react'
import { Card, Button, Icon, Select, Input, Table, message } from 'antd';
import {reqProductList, reqUpdateProdStatus, reqSearchProduct} from '../../api'
import {connect} from 'react-redux'
import {createSaveProductAction} from '../../redux/actions_creators/product_action'
import {PAGE_SIZE} from '../../config'
const { Option } = Select;

/**
 * 真分页(后端分页)：返回的是一部分数据，需要请求时指明：每页显示多少条，你要哪一页，交由服务器去进行分类处理+数据切割
 */
@connect(
    state => ({}),
    {saveProduct: createSaveProductAction}
)
class Product extends Component {

    state = {
        productList: [], // 商品列表数据（分页）
        isLoading: true, //是否处于加载中
        total: '', // 一共由几页
        current: 1, // 当前在哪一页
        keyWord: '', // 搜索关键词
        searchType: 'productName', // 搜索类型

    }

    componentDidMount() {
        this.getProductList()
    }

    // 获取商品分页列表
    getProductList = async(number=1) => {
        let result
        if(this.isSearch) {
            const {searchType, keyWord} = this.state
            result = await reqSearchProduct(number, PAGE_SIZE, searchType, keyWord)
        }else {
            result = await reqProductList(number, PAGE_SIZE)
        }
        this.setState({isLoading: false})
        const {status, data} = result
        // console.log(data);
        if(status === 0) {
            this.setState({
                productList: data.list, 
                total: data.total,
                current: data.pageNum
            })
            // 把获取的商品列表存入到redux中
            this.props.saveProduct(data.list)
        } else {
            message.error('获取商品列表失败！', 1)
        }
        
    }

    updateProdStatus = async({_id, status}) => {
        let productList = [...this.state.productList]
        if(status === 1) {
            status = 2 
        }else {
            status = 1
        }
        let result = await reqUpdateProdStatus(_id, status)
        if(result.status === 0) {
            message.success('更新商品状态成功！', 1)
            productList.map((item) => {
                if(item._id === _id) {
                    item.status = status
                }
                return item
            })
            this.setState({productList})
        }else {
            message.error('更新商品状态失败！', 1)
        }
    }

    search = () => {
        this.isSearch = true
        this.getProductList()
    }

    render() {
        const dataSource = this.state.productList
          
        const columns = [
        {
            title: '商品名称',
            dataIndex: 'name',
            width: '18%',
            key: 'name',
        },
        {
            title: '商品描述',
            dataIndex: 'desc',
            key: 'desc',
        },
        {
            title: '价格',
            dataIndex: 'price',
            align: 'center',
            width: '9%',
            key: 'price',
            render: price => '￥' + price
        },
        {
            title: '状态',
            // dataIndex: 'status',
            align: 'center',
            width: '10%',
            key: 'status',
            render: item => {
                return (
                    <div>
                        <Button 
                            type={item.status === 1? "danger" : "primary"}
                            onClick={() => {this.updateProdStatus(item)}}
                            >
                                {item.status === 1 ? '下架' : '上架'}
                        </Button><br/>
                        <span>{item.status === 1 ? '在售' : '已停售'}</span>
                    </div>
                )
            }
        },
        {
            title: '操作',
            // dataIndex: 'opera',
            align: 'center',
            width: '10%',
            key: 'opera',
            render: (item) => {
                return (
                    <div>
                        <Button type="link" onClick={() => {this.props.history.push(`/admin/prod_about/product/detail/${item._id}`)}}>详情</Button><br />
                        <Button type="link" onClick={() => {this.props.history.push(`/admin/prod_about/product/add_update/${item._id}`)}}>修改</Button>
                    </div>
                )
            }
        },
        ];
        return (
            <div>
                <Card 
                    title={
                        <div>
                            <Select defaultValue="productName" onChange={(value) => {this.setState({searchType: value})}}>
                                <Option value="productName">按名称搜索</Option>
                                <Option value="productDesc">按描述搜索</Option>
                            </Select>
                            <Input 
                                style={{margin: '0 10px', width: '20%'}} 
                                placeholder="请输入搜索关键字" 
                                allowClear
                                onChange={(event) => {this.setState({keyWord: event.target.value})}}
                            />
                            <Button type="primary" onClick={this.search}><Icon type="search"/>搜索</Button>
                        </div>
                    }
                    extra={<Button type="primary" onClick={() => {this.props.history.push('/admin/prod_about/product/add_update')}}><Icon type="plus-circle"/>添加商品</Button>}
                >
                    <Table 
                        dataSource={dataSource} 
                        columns={columns} 
                        bordered
                        rowKey='_id'
                        pagination={{
                            total: this.state.total,
                            pageSize: PAGE_SIZE,
                            current: this.state.current,
                            onChange: this.getProductList
                        }}
                        loading={this.state.isLoading}
                    />
                </Card>
            </div>
        )
    }
}

export default Product
