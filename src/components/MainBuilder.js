import React, {Component} from 'react';
import { Router, Switch, Route } from "react-router-dom";
import Main from '../components/Main';

class MainBuilder extends Component {
  render() {
    return (
      <React.Fragment>
          <Switch>
            <Route path="/uploaded/:index">
              <Main previous_uploads={this.props.previous_uploads} />
            </Route>
          </Switch>
      </React.Fragment>
    );
  }
}

export default MainBuilder;
