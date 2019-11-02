import React, { Component } from 'react';
import './Image.css';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import GridLoader from 'react-spinners/GridLoader';
import ModalImage from "react-modal-image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import FileStatus from '../util/FileStatus'

class Image extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'default',
      errored: false,
      loading: true,
      loaded: 0
    };

    this.sleep = this.sleep.bind(this);
    this.conditionalRender = this.conditionalRender.bind(this);
  }

  componentDidMount = async () => {
    this.setState({name: this.props.meta})
    var buffer=1000
    while (FileStatus(this.props.meta)===403) {
      await this.sleep(buffer);
      buffer = buffer * 1.1
      console.log(buffer)
      this.setState({loaded: 1})
      if (buffer >= 15000) {
        return null;
      }
    }
    this.setState({loaded: 2})
  }

  tryAgain = (ev) => {
    this.setState({errored: true});
  }

  sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  conditionalRender = () => {

    return (
      <ModalImage
        small={this.props.meta}
        large={this.props.meta}
      />
    )
  }

  imagePlaceHolder = () => {
    if (this.state.loaded===2){
      return (
        <React.Fragment>
          { this.conditionalRender() }
        </React.Fragment>
      );
    } else {
      return (
        <div className='center'>
          <div className='block'>
            <GridLoader
              sizeUnit={"px"}
              size={35}
              color={'#123abc'}
              loading={this.state.loading}
            />
          </div>
        </div>
      )
    }
  }

  render () {

    return (
      <Col md={3}>
        <div className="image-background">
        { this.state.modelActive ? this.showModal() : null}
        { this.imagePlaceHolder() }
        <Button variant="secondary" href={this.props.meta} className="button-padding-less"><FontAwesomeIcon icon="download" /></Button>
        </div>
      </Col>
    )
  }
}



export default Image;
