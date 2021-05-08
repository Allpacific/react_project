import React, { Component } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import Login from './containers/login/login' //引入的不是我们定义的那个Login，而是根据Login生成的一个新组件
import Admin from './containers/admin/admin'

export default class App extends Component {
  render() {
    return (
      <div className="app">
        <Switch>
          <Route path="/login" component={Login}/>
          <Route path="/admin" component={Admin}/>
          <Redirect to="/admin"/>
        </Switch>
      </div>
    )
  }
}

