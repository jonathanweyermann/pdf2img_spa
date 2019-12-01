import React, { Component} from 'react';
import { Container, Button } from 'react-bootstrap';
import Zip from './Zip'
import S3Upload from './S3Upload'
import PdfImages from './PdfImages'
import { pagesToDisplay } from '../constants'
import { Document, pdfjs } from "react-pdf";
import { useParams } from "react-router-dom";
import FileStatus from '../util/FileStatus'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import './Main.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function withMyHook(Component) {
  return function WrappedComponent(props) {
    const params = useParams();
    return <Component {...props} params={params} />;
  }
}

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
      fileName: "",
      numPages: "",
      uploadFileType: "",
      uploadFile: "",
      uploadFileName: "",
      s3SafeFileName: "",
      fileState: this.fileState.base,
      firstPage: 1,
      lastPage: pagesToDisplay,
      errorMessage: ""
    };
  }

  fileState = {
    base: 'none',
    analyzing: 'analyzing',
    uploading: 'uploading',
    uploaded: 'uploaded'
  }

  onDocumentLoad = ({numPages}) => {
    this.setState({ numPages, fileState: this.fileState.uploading });
  }

  localIdentifier = (id) => {
    if (localStorage.getItem(id)) {
      return localStorage.getItem(id);
    }
    else {
      var randomNumber = Math.floor(Math.random() * 100000000);
      localStorage.setItem(id, randomNumber);
      return randomNumber;
    }
  }

  componentDidMount = () => {
    const { previous_uploads, params } = this.props;

    if ( previous_uploads.length > 0 && this.props.params.index !== undefined) {
      let { uploadFileName, numPages, s3SafeFileName} = previous_uploads[params.index];
      var imgs = [];
      for(var index=1;index <= Math.min(pagesToDisplay,numPages) ;index++){
        imgs.push(`${process.env.REACT_APP_IMAGE_BUCKET}${s3SafeFileName.split('.')[0]}/image${index}.jpg`);
      }
      if (FileStatus(`${process.env.REACT_APP_IMAGE_BUCKET}pdfs/${s3SafeFileName}`)===200) {
        this.setState({fileState: this.fileState.uploaded, images: imgs, firstPage: 1, lastPage: Math.min(pagesToDisplay,numPages), uploadFileName, numPages, s3SafeFileName})
      } else {
        this.setState({errorMessage: "Can't find pdf - server probably deleted it"})
      }
    }
  }

  documentAnalize = () => {
    return (
      <div>
        <Document
          file={this.uploadInput.files[0] }
          onLoadSuccess={this.onDocumentLoad.bind(this)}
        >
        </Document>
      </div>
    )
  }

  numPagesDisplay = () => {
    var pdfDescriptor = ""
    if (this.state.numPages===1) {
     pdfDescriptor = `There is ${this.state.numPages} page in this pdf`
    } else {
      pdfDescriptor = `There are ${this.state.numPages} pages in this pdf`
    }

    return (
      <div>
        { pdfDescriptor }
      </div>
    )
  }

  description = () => {
    return (
      <div className="main-style">
        <Container>
          <div className="tight-container">
           <div className='center heading-font'>Convert a PDF file to a set of optimized JPG images</div>
           <div className="mt2 sub-heading-font">This free tool converts PDFs to JPGs. It shows thumbnails of each page so you can easily enlarge and download only the files you wish to download</div>
           <div className="mt2 sub-heading-font">Click the 'Choose File' button and select a PDF file you wish to convert. Click 'Convert to JPG images' and wait for the conversion process to finish.</div>
          </div>
        </Container>
      </div>
    )
  }

  features = () => {
    return (
      <React.Fragment>
        <div><img className="image-style" src="/upload.gif" alt="upload video" /></div>
        <Row>
          <Col xs="12" className='center heading-font-plus'>Features</Col>
          <Col md="4" className='mt2'><h4>Download a ZIP Archive</h4>
            You can download each image individually by clicking on the download button below each image,
            or you can download a ZIP file containing all the images.
          </Col>
          <Col md="4" className='mt2'><h4>Access your previously uploaded PDFs</h4>
            Previously uploaded PDFs are will be available to be viewed and downloaded again on the same computer. Images and PDFs and
            ZIP files are stored on the server for 30 days before they are erased.
          </Col>
          <Col md="4" className='mt2'><h4>Full Size Image Viewer</h4>
            Click on the image to open the image full size. You'll be able to download, rotate or see an
            even bigger version of the image.
          </Col>
          <Col md="4"></Col>
        </Row>
      </React.Fragment>
    )
  }

  handlePageClick = data => {
    let offset = data.selected * pagesToDisplay;
    var imgs = []
    for(var index=1+offset;index <= Math.min(pagesToDisplay+offset,this.state.numPages); index++){
      imgs.push(`${process.env.REACT_APP_IMAGE_BUCKET}${this.state.s3SafeFileName.split('.')[0]}/image${index}.jpg`);
    }
    this.setState({images: imgs, firstPage: 1+offset, lastPage: Math.min(pagesToDisplay+offset,this.state.numPages)})
  }

  addToPreviousUploads = () => {
    var prev_uploads = this.props.previous_uploads;
    var found = prev_uploads.findIndex((upload) => {
      return (upload.uploadFileName === this.state.uploadFileName && upload.numPages === this.state.numPages)
    });
    if (found === -1) {
      prev_uploads.push({uploadFileName: this.state.uploadFileName, numPages: this.state.numPages, s3SafeFileName: this.state.s3SafeFileName})
      this.saveLocal('previous_uploads', JSON.stringify(prev_uploads))
    }
    this.props.previous_uploads_update(found)
  }

  saveLocal = (id,prev_uploads) => {
    localStorage.setItem(id,prev_uploads)
  }

  errorMessage = () => {
    return (
      <div className="error-message">{this.state.errorMessage}</div>
    )
  }

  setToSuccess = (imgs) => {
    this.setState({fileState: this.fileState.uploaded, images: imgs, firstPage: 1, lastPage: Math.min(pagesToDisplay,this.state.numPages)});
  }

  pdfUpload = () => {
    let file = this.uploadInput.files[0];
    let fileParts = this.uploadInput.files[0].name.split('.');
    let fileName = fileParts[0];
    let fileType = fileParts[1];
    this.setState({fileState: this.fileState.analyzing, errorMessage: "", uploadFile:file, s3SafeFileName: `${this.localIdentifier('pcid')}${file.name.replace(/[^0-9a-zA-Z_.]/g, '')}`, uploadFileType:fileType,uploadFileName:fileName})
  }

  handleChange = (ev) => {
    this.setState({fileName : ev.target.value});
  }

  fileStateSwitch = (fileState) => {
    switch(fileState) {
      case this.fileState.base:
        return this.description();
      case this.fileState.analyzing:
        return this.documentAnalize();
      case this.fileState.uploading:
        return (<React.Fragment>
                  <S3Upload data={this.state} setToSuccess={this.setToSuccess} />
                  { this.state.numPages ? this.numPagesDisplay() : null }
                </React.Fragment>)
      case this.fileState.uploaded:
        return (<PdfImages data={this.state} handlePageClick={this.handlePageClick} />)
      default:
        return this.description();
    }
  }

  controlsBar = () => {
    return (
      <React.Fragment>
        {this.state.fileState===this.fileState.uploaded ? (<Zip addToPreviousUploads={() => this.addToPreviousUploads()} fileName={`${process.env.REACT_APP_IMAGE_BUCKET}${this.state.s3SafeFileName.split('.')[0]}.zip`} />) : null}
        <input className='btn btn-success input-padding' value={this.state.fileName} onChange={this.handleChange} ref={(ref) => { this.uploadInput = ref; }} type="file" accept=".pdf"/>
        <Button onClick={this.pdfUpload} disabled={!this.state.fileName} className='convert-button-padding'>Convert to JPG Images</Button>
      </React.Fragment>
    )
  }

  render() {
    return (
      <React.Fragment>
        <div>
          {this.state.errorMessage ? this.errorMessage() : null }
          {this.fileStateSwitch(this.state.fileState)}
        </div>
        <Container>
          {this.controlsBar()}
          {this.state.fileState===this.fileState.base ? this.features() : null }
        </Container>
      </React.Fragment>
    )
  }
}

export default withMyHook(Main);
