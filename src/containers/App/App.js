// @flow

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { push } from 'react-router-redux';
import { List, Divider, Segment, Sidebar, Container, Menu } from 'semantic-ui-react';
import { asyncConnect } from 'redux-async-connect';
import { Link } from 'react-router';

import { isLoaded as isInfoLoaded, load as loadInfo } from '../../redux/modules/info';
import { isLoaded as isAuthLoaded, load as loadAuth, logout } from '../../redux/modules/auth';
import { InfoBar } from '../../components';
import config from '../../config';

@asyncConnect([{
  promise: ({ store: { dispatch, getState } }) => {
    const promises = [];

    if (!isInfoLoaded(getState())) {
      promises.push(dispatch(loadInfo()));
    }
    if (!isAuthLoaded(getState())) {
      promises.push(dispatch(loadAuth()));
    }

    return Promise.all(promises);
  },
}])
@connect(
  state => ({ user: state.auth.user && state.auth.user.name ? state.auth.user : null }),
  { logout, pushState: push })
export default class App extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    user: PropTypes.object,
    logout: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,

    routes: PropTypes.array,
  };

  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      activeItem: props.routes[1].path || 'home',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.user && nextProps.user) {
      // login
      this.props.pushState('/loginSuccess');
    } else if (this.props.user && !nextProps.user) {
      // logout
      this.props.pushState('/');
    }
  }

  handleItemClick = (event, { name }) => this.setState({ activeItem: name });

  handleLogout = (event) => {
    event.preventDefault();
    this.props.logout();
  };

  render() {
    const { user } = this.props;
    const styles = require('./App.scss');
    const { activeItem } = this.state;

    return (
      <div>
        <Helmet {...config.app.head} />

        <Sidebar
          as={Segment}
          style={{ width: 250 }}
          animation="overlay"
          icon="labeled"
          visible
          vertical
          inverted
        >
          <List divided inverted relaxed>
            <List.Item style={{ paddingLeft: 10 }}>
              <List.Icon>
                <img src={require('../Home/flux-logo.png')} alt="" style={{ width: 30, height: 30 }} />
              </List.Icon>
              <List.Content verticalAlign="middle">
                <Link to="/"><strong>HRFB &nbsp;<small><em>0.1.0</em></small></strong></Link>
              </List.Content>
            </List.Item>
          </List>
          <Menu inverted vertical style={{ width: '100%' }}>
            <Menu.Item>
              Menu

              <Menu.Menu>
                <Menu.Item as={Link} to="/" name="home" active={activeItem === 'home'} onClick={this.handleItemClick}>
                  Home (list, link, message, redux)
                </Menu.Item>
                <Menu.Item as={Link} to="/about" name="about" active={activeItem === 'about'} onClick={this.handleItemClick}>
                  About (widgets)
                </Menu.Item>
                <Menu.Item as={Link} to="/items" name="items" active={activeItem === 'items'} onClick={this.handleItemClick}>
                  Items (fetching data asynchronously)
                </Menu.Item>
                <Menu.Item as={Link} to="/form" name="form" active={activeItem === 'form'} onClick={this.handleItemClick}>
                  Form
                </Menu.Item>
                <Menu.Item as={Link} to="/todo" name="todo" active={activeItem === 'todo'} onClick={this.handleItemClick}>
                  Todo
                </Menu.Item>
                {user ?
                  <Menu.Item as={Link} to="/chat" name="chat" active={activeItem === 'chat'} onClick={this.handleItemClick}>
                    Chat
                  </Menu.Item>
                : null}
                <Menu.Item as={Link} to="/no_route_page" name="no_route_page">
                  Not found (404 page)
                </Menu.Item>
              </Menu.Menu>
            </Menu.Item>

            <Menu.Item>
              {user ?
                <span>Logged as {user.name}</span>
              :
                <span>Member</span>
              }

              <Menu.Menu>
                {user ?
                  <Menu.Item as={Link} to="/logout" name="logout" onClick={this.handleLogout}>
                    Logout
                  </Menu.Item>
                :
                  <Menu.Item as={Link} to="/login" name="login" active={activeItem === 'login'} onClick={this.handleItemClick}>
                    Login
                  </Menu.Item>
                }
              </Menu.Menu>
            </Menu.Item>
          </Menu>
        </Sidebar>

        <div className={styles.right}>
          <Container>
            {this.props.children}

            <Divider />

            <InfoBar />
          </Container>
        </div>
      </div>
    );
  }
}