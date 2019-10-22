import React, { Component } from 'react';
import './Image.css';
import Col from 'react-bootstrap/Col';
import Img from 'react-image'
import ClipLoader from 'react-spinners/ClipLoader';

class Image extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'default',
      errored: false,
      loading: true,
      loaded: false
    };

    this.renderImage = this.renderImage.bind(this);
    this.sleep = this.sleep.bind(this);
    this.tryRequire = this.tryRequire.bind(this);
    this.conditionalRender = this.conditionalRender.bind(this);
  }

  componentDidMount = async() => {
    this.setState({name: this.props.meta.name})

    while (this.tryRequire(this.props.meta)===403) {
      await this.sleep(1000);
    }
    this.setState({loaded: true})
  }

  tryAgain = (ev) => {
    this.setState({errored: true});
  }


  //const myComponent = () => <Img src={ this.props.meta } loader={/*any valid react element */}/>

  //<img className='imageStyle' src={ this.props.meta } onError={this.tryAgain} alt="not working"></img>

  renderImage = () => {
    return (
        <Img className='imageStyle' src={ this.props.meta } loader={<ClipLoader
          sizeUnit={"px"}
          size={150}
          color={'#123abc'}
          loading={this.state.loading}
        />}></Img>
    )
  }

  sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  tryRequire = (path) => {
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
      <Col md={3} >
        <Img className='imageStyle' src={ this.props.meta } loader={<ClipLoader
          sizeUnit={"px"}
          size={150}
          color={'#123abc'}
          loading={this.state.loading}
        />}></Img>
      </Col>
    )
  }


  render () {
    if (this.state.loaded===true){
      return (
        <React.Fragment>
          { this.conditionalRender() }
        </React.Fragment>
      );
    } else {
      return (
        <ClipLoader
          sizeUnit={"px"}
          size={150}
          color={'#123abc'}
          loading={this.state.loading}
        />
      )
    }

  }
}



export default Image;
