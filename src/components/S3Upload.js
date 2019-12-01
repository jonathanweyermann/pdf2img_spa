import React, {Component} from 'react'
import axios from 'axios'
import LoadingBar from '../components/loadingBar'
import { pagesToDisplay } from '../constants'

class S3Upload extends Component {
  s3Upload = () => {
    axios.post(process.env.REACT_APP_API_URL,{
      fileName : this.props.data.s3SafeFileName,
      fileType : this.props.data.uploadFileType
    })
    .then(response => {
      var returnData = response.data.body;
      var signedRequest = returnData.signedRequest;
      console.log("Recieved a signed request " + signedRequest);
      var options = {
        headers: {
          'Content-Type': `application/${this.props.data.uploadFileType}`
        }
      };
      axios.put(signedRequest,this.props.data.uploadFile,options)
      .then(result => {
        var imgs = []
        console.log("Response from s3: Number of Pages now:", this.props.data.numPages);
        for(var index=1;index <= Math.min(pagesToDisplay,this.props.data.numPages) ;index++){
          imgs.push(`${process.env.REACT_APP_IMAGE_BUCKET}${this.props.data.s3SafeFileName.split('.')[0]}/image${index}.jpg`);
        }
        this.props.setToSuccess(imgs)
      })
      .catch(error => {
        console.log("ERROR " + JSON.stringify(error));
      })
    })
    .catch(error => {
      console.log(JSON.stringify(error));
    })
    return ( <LoadingBar /> )
  }

  render() {
    return (
      <React.Fragment>
        {this.s3Upload()}
      </React.Fragment>
    )
  }
}

export default S3Upload;
