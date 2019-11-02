import React, { Component } from 'react';
import './Zip.css';
import Button from 'react-bootstrap/Button';
import BeatLoader from 'react-spinners/BeatLoader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import FileStatus from '../util/FileStatus'

//import { download } from '@fortawesome/fontawesome-svg-core'

class Zip extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errored: false,
      loading: true,
      loaded: 0
    };

    this.sleep = this.sleep.bind(this);
  }

  componentDidMount = async () => {
    var buffer=1000
    while (FileStatus(this.props.fileName)===403) {
      await this.sleep(buffer);
      buffer = buffer * 1.1
      console.log(buffer)
      this.setState({loaded: 1})
      if (buffer >= 15000) {
        return null;
      }
    }
    this.props.addToPreviousUploads()
    this.setState({loaded: 2})
  }

  tryAgain = (ev) => {
    this.setState({errored: true});
  }

  sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  zipDownload = () => {
    if (this.state.loaded===2){
      return (
        <React.Fragment>
          <Button variant="secondary" href={this.props.fileName} className="button-padding"><span className='large-image'><FontAwesomeIcon icon="download" /></span>All Images(Zip File)</Button>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <Button variant="secondary" className="button-padding">Creating your zip file..
            <BeatLoader
              sizeUnit={"px"}
              size={25}
              color={'#123abc'}
              loading={this.state.loading}
            />
          </Button>
        </React.Fragment>
      )
    }
  }

  render () {

    return (
      <React.Fragment>
        { this.zipDownload() }
      </React.Fragment>
    )
  }
}

export default Zip;
