import React, { Component} from 'react';
import { Container, Button } from 'react-bootstrap';
import Zip from './Zip'
import S3Upload from './S3Upload'
import PdfImages from './PdfImages'
import { pagesToDisplay, imageBucket } from '../constants'
import { Document, pdfjs } from "react-pdf";
import { useParams } from "react-router-dom";
import FileStatus from '../util/FileStatus'

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
      success: false,
      analyzing: false,
      fileName: "",
      numPages: "",
      uploadFileType: "",
      uploadFile: "",
      uploadFileName: "",
      s3SafeFileName: "",
      uploading: false,
      baseState: true,
      firstPage: 1,
      lastPage: pagesToDisplay,
      errorMessage: ""
    };
  }

  onDocumentLoad = ({numPages}) => {
    console.log(`numpages: ${numPages}`)
    this.setState({ numPages, uploading: true });
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
      console.log(previous_uploads)
      let { uploadFileName, numPages, s3SafeFileName} = previous_uploads[params.index];
      var imgs = [];
      for(var index=1;index <= Math.min(pagesToDisplay,numPages) ;index++){
        imgs.push(`${imageBucket}${s3SafeFileName.split('.')[0]}/image${index}.jpg`);
      }
      if (FileStatus(`${imageBucket}pdfs/${s3SafeFileName}`)===200) {
        this.setState({success: true, images: imgs, analyzing: false, uploading: false, firstPage: 1, lastPage: Math.min(pagesToDisplay,numPages),baseState: false, uploadFileName, numPages, s3SafeFileName})
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
      <Container className="center">
        <div className="tight-container">
         <div className="mt2">This free tool converts PDFs to JPGs. It shows thumbnails of each page so you can easily enlarge and download only the files you wish to download</div>
         <div className="mt2"><span className="big">1</span> Click the 'Choose File' button and select a PDF file you wish to convert. Click 'Convert to JPG images' and wait for the conversion process to finish.</div>
         <div><span className="big">2</span> Download the results either file by file or click the DOWNLOAD ALL button to get them all at once in a ZIP archive.</div>
        </div>
      </Container>
    )
  }

  handlePageClick = data => {
    let offset = data.selected * pagesToDisplay;
    var imgs = []
    for(var index=1+offset;index <= Math.min(pagesToDisplay+offset,this.state.numPages); index++){
      imgs.push(`${imageBucket}${this.state.s3SafeFileName.split('.')[0]}/image${index}.jpg`);
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
    //this.setState({success: true})
  }

  saveLocal = (id,prev_uploads) => {
    localStorage.setItem(id,prev_uploads)
  }

  errorMessage = () => {
    return (
      <div class="error-message">{this.state.errorMessage}</div>
    )
  }

  setToSuccess = (imgs) => {
    this.setState({success: true, images: imgs, analyzing: false, uploading: false, firstPage: 1, lastPage: Math.min(pagesToDisplay,this.state.numPages)});
  }

  pdfUpload = async () => {
    let file = this.uploadInput.files[0];
    var reader = new FileReader();
    reader.readAsBinaryString(file);
    let fileParts = this.uploadInput.files[0].name.split('.');
    let fileName = fileParts[0];
    let fileType = fileParts[1];
    this.setState({ errorMessage: "", success: false, uploadFile:file, s3SafeFileName: `${this.localIdentifier('pcid')}${file.name.replace(/[^0-9a-zA-Z_.]/g, '')}`, uploadFileType:fileType,uploadFileName:fileName, analyzing: true, baseState: false})
  }

  handleChange = (ev) => {
    this.setState({fileName : ev.target.value});
  }

  render() {
    return (
      <React.Fragment>
        <div>
          {this.state.errorMessage ? this.errorMessage() : null }
          {this.state.baseState ? this.description() : null }
          {this.state.uploading ? <S3Upload data={this.state} setToSuccess={this.setToSuccess} /> : null}
          {this.state.numPages && this.state.uploading ? this.numPagesDisplay() : null}
          {this.state.analyzing ? this.documentAnalize() : null}
          {this.state.success ? <PdfImages data={this.state} handlePageClick={this.handlePageClick} /> : null}
        </div>
        <Container>
          {this.state.success ? (<Zip addToPreviousUploads={() => this.addToPreviousUploads()} fileName={`${imageBucket}${this.state.s3SafeFileName.split('.')[0]}.zip`} />) : null}
          <input className='btn btn-success input-padding' value={this.state.fileName} onChange={this.handleChange} ref={(ref) => { this.uploadInput = ref; }} type="file" accept=".pdf"/>
          <Button onClick={this.pdfUpload} disabled={!this.state.fileName} className='convert-button-padding'>Convert to JPG Images</Button>
        </Container>
      </React.Fragment>
    )
  }
}

export default withMyHook(Main);
