import React, { Component } from 'react'
import './css/login.less'
import logo from './imgs/logo.png'
import { Form, Input, Icon, Button } from 'antd';
const {Item} = Form

class Login extends Component {

    // 点击登录按钮的回调
    handleSubmit = (event) => {
        // 阻止默认事件--禁止form表单提交--通过ajax提交
        event.preventDefault();
        this.props.form.validateFields((err, values) => {
          if (!err) {
            console.log('Received values of form: ', values);
          }
        });
    }

    // 密码的自定义验证器
    pwdValidator = (rule, value, callback) => {
        // console.log(value);
        if (!value) {
            // 不能为空
            callback('不能为空！')
        }else if (value.length < 4) {
            // 必须大于等于4位
            callback('密码必须大于等于4位！')
        }else if (value.length > 12) {
            // 必须小于等于12位
            callback('密码必须小于等于12位！')
        }else if (!(/^\w+$/).test(value)){
            // 必须是英文、数字或下划线组成
            callback('密码必须是英文、数字或下划线组成！')
        }else {
            callback()
        }
        
    }

    render() {

        const {getFieldDecorator} = this.props.form
        // console.log(getFieldDecorator);

        return (
            <div className="login">
                <header>
                    <img src={logo} alt="logo"/>
                    <h1>商品管理系统</h1>
                </header>
                <section>
                    <h1>用户登录</h1>
                    {/* 以后会加上antd的Form组件 */}
                    <Form onSubmit={this.handleSubmit} className="login-form">
                        <Item>
                            {getFieldDecorator('username', {
                                /**
                                 * 用户名/密码校验
                                 * 1) 必须输入
                                 * 2) 必须大于等于4位
                                 * 3) 必须小于等于12位
                                 * 4) 必须是英文、数字或下划线组成
                                 */
                                rules: [{ required: true, message: '用户名不能为空！' },
                                        {max: 12, message: '用户名必须小于等于12位！'},
                                        {min: 4, message: '用户名必须大于等于4位！'},
                                        {pattern: /^\w+$/, message: '用户名必须是英文、数字或下划线组成！'}
                                    ]
                            })(
                                <Input
                                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder="用户名"
                                />,
                            )}
                        </Item>
                        <Item>
                            {getFieldDecorator('password', {
                                    /**
                                     * 用户名/密码校验
                                     * 1) 必须输入
                                     * 2) 必须大于等于4位
                                     * 3) 必须小于等于12位
                                     * 4) 必须是英文、数字或下划线组成
                                     */
                                    rules: [{ validator: this.pwdValidator },
                                        ]
                                })(
                                    <Input
                                    prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    type="password"
                                    placeholder="密码"
                                    />,
                                )}
                        </Item>
                        <Item>
                        <Button type="primary" htmlType="submit" className="login-form-button">
                            登录
                        </Button>
                        </Item>
                    </Form>
                </section>
            </div>
        )
    }
}

/*
    严重注意：
    1.暴露的根本不是我们定义的Login组件，而是我们加工（包装）的Login组件
    2.Form.create()调用返回一个函数，该函数加工了login组件，生成了一个新组件，新组件实例对象的props多了一个强大的form属性，能完成验证
    3.我们暴露出去的不再是login，而是通过login生成的一个新组件
*/

export default Form.create()(Login)

// 高阶函数: 如果一个demo函数接收一个函数作为参数，或者一个demo函数调用的返回值是一个函数------则demo为高阶函数

// 高阶组件：demo组件接收一个组件，加工生成一个新组件，那么demo组件就称之为高阶组件

// 高阶组件 是一个特殊的 高阶函数