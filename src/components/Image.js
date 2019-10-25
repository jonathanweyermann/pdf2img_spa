import React, { Component } from 'react';
import './Image.css';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Img from 'react-image'
import GridLoader from 'react-spinners/GridLoader';
import ModalImage from "react-modal-image";

class Image extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'default',
      errored: false,
      loading: true,
      loaded: 0
    };

  //  this.renderImage = this.renderImage.bind(this);
    this.sleep = this.sleep.bind(this);
    this.tryRequire = this.tryRequire.bind(this);
    this.conditionalRender = this.conditionalRender.bind(this);
  }

  componentDidMount = async () => {
    this.setState({name: this.props.meta})

    while (await this.tryRequire(this.props.meta)===403) {
      await this.sleep(1000);
      this.setState({loaded: 1})
    }
    this.setState({loaded: 2})
  }

  tryAgain = (ev) => {
    this.setState({errored: true});
  }


  //const myComponent = () => <Img src={ this.props.meta } loader={/*any valid react element */}/>

  //<img className='imageStyle' src={ this.props.meta } onError={this.tryAgain} alt="not working"></img>

  // renderImage = () => {
  //   return (
  //       <Img className='imageStyle' src={ this.props.meta } loader={<GridLoader
  //         sizeUnit={"px"}
  //         size={150}
  //         color={'#123abc'}
  //         loading={this.state.loading}
  //       />}></Img>
  //   )
  // }

  sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  tryRequire = async (path) => {
    try {
      var http = new XMLHttpRequest();

      http.open('HEAD', path, false);
      http.send();
     return http.status;
    } catch (err) {
      console.log(`err: ${err}`);
     return null;
    }
  };

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
        <Button variant="primary" href={this.props.meta} className="button-padding">Download</Button>
        </div>
      </Col>
    )
  }
}



export default Image;
