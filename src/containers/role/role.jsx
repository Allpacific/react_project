import React, { Component } from 'react'
import {Card, Button, Icon, Table, message, Modal, Form, Input, Tree} from 'antd'
import {connect} from 'react-redux'
import dayjs from 'dayjs'
import {reqRoleList, reqAddRole, reqAuthRole} from '../../api'
import menuList from '../../config/menu_config'

const {Item} = Form
const { TreeNode } = Tree;

@connect(
    state => ({username: state.userInfo.user.username}),
    {}
)
@Form.create()
class Role extends Component {

    state = {
        isShowAdd: false,
        isShowAuth: false,
        roleList: [],
        checkedKeys: [], // 要选中的菜单
        menuList,
        _id: '', //当前操作的角色id
    }

    componentDidMount() {
        this.getRoleList()
    }

    getRoleList = async() => {
        let result = await reqRoleList()
        const {data, status} = result
        // console.log(data);
        if(status === 0) this.setState({roleList:data})
    }

    // 新增角色----确认按钮
    handleOk = () => {
        this.props.form.validateFields(async(err, values) => {
            if(err) return
            let result = await reqAddRole(values)
            const {msg, status} = result
            if(status === 0) {
                message.success('新增角色成功！', 1)
                this.getRoleList()
                this.setState({isShowAdd: false})
            }else {
                message.error(msg, 1)
            }
        })
    }

    // 新增角色----取消按钮
    handleCancel = () => {
        this.setState({isShowAdd: false})
    }

    // 授权弹窗----确认按钮
    handleAuthOk = async() => {
        const {_id, checkedKeys} = this.state
        const {username} = this.props
        // console.log(_id);
        let result = await reqAuthRole({_id, menus: checkedKeys, auth_name: username})
        const {msg, status} = result
        if(status === 0) {
            message.success('授权成功！', 1)
            this.setState({isShowAuth: false})
            this.getRoleList()
        }else {
            message.error(msg, 1)
        }
    }

    // 授权弹窗----取消按钮
    handleAuthCancel = () => {
        this.setState({isShowAuth: false})
    }

    onCheck = checkedKeys => {
        this.setState({ checkedKeys });
    };

    // 用于展示授权弹窗
    showAuth =(id) => {
        const {roleList} = this.state
        let result =  roleList.find((item) => {
            return item._id === id
        })
        if(result) this.setState({checkedKeys: result.menus})
        this.setState({isShowAuth: true, _id: id})
    }

    // 用于展示新增弹窗
    showAdd = () => {
        this.props.form.resetFields()
        this.setState({isShowAdd: true})
    }

    renderTreeNodes = data =>
    data.map(item => {
        if (item.children) {
            return (
                <TreeNode title={item.title} key={item.key} dataRef={item}>
                    {this.renderTreeNodes(item.children)}
                </TreeNode>
            );
        }
        return <TreeNode key={item.key} {...item} />;
    });

    render() {

        const dataSource = this.state.roleList

        const columns = [
            {
                title: '角色名称',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '创建时间',
                dataIndex: 'craete_time',
                key: 'craete_time',
                render: (time) => dayjs(time).format('YYYY年 MM月DD日 HH:mm:ss')
            },
            {
                title: '授权时间',
                dataIndex: 'auth_time',
                key: 'auth_time',
                render: (time) => time ? dayjs(time).format('YYYY年 MM月DD日 HH:mm:ss') : ''
            },
            {
                title: '授权人',
                dataIndex: 'auth_name',
                key: 'auth_name',
            },
            {
                title: '操作',
                //dataIndex: 'option',
                key: 'option',
                render: (item) => <Button type="link" onClick={() => {this.showAuth(item._id)}}>设置权限</Button>
            },
        ]

        // treeData是属性菜单的源数据
        const treeData = this.state.menuList

        const {getFieldDecorator} = this.props.form

        return (
            <div>
                <Card
                    title={<Button type="primary" onClick={this.showAdd}>
                                <Icon type="plus"/>
                                新增角色
                            </Button>}
                    style={{width: '100%'}}
                >
                    <Table 
                        dataSource={dataSource}
                        columns={columns}
                        bordered
                        pagination={{defaultPageSize: 5}}
                        rowKey="_id"
                    />
                </Card>
                {/* 新增角色提示框 */}
                <Modal
                    title="新增角色"
                    visible={this.state.isShowAdd}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    okText="确定"
                    cancelText="取消"
                >
                    <Form onSubmit={this.handleOk}>
                        <Item>
                            {getFieldDecorator('roleName', {
                                initialValue: '',
                                rules: [
                                    {required: true, message: '角色名称必须输入'},
                                ],
                            })(
                                <Input placeholder="请输入角色名" />
                            )}
                        </Item>
                    </Form>
                </Modal>
                 {/* 设置权限提示框 */}
                 <Modal
                    title="设置权限"
                    visible={this.state.isShowAuth}
                    onOk={this.handleAuthOk}
                    onCancel={this.handleAuthCancel}
                    okText="确定"
                    cancelText="取消"
                >
                    <Tree
                        checkable // 允许选中
                        onCheck={this.onCheck}
                        checkedKeys={this.state.checkedKeys}
                        defaultExpandAll
                    >
                        <TreeNode title='平台功能' key='top'>
                            {this.renderTreeNodes(treeData)}
                        </TreeNode>
                    </Tree>
                </Modal>
            </div>
        )
    }
}

export default Role