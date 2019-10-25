import React, { Component } from 'react';
import './App.css';
import Image from './components/Image'
import axios from 'axios'
import Amplify from 'aws-amplify';
import awsmobile from './aws-exports';
import { Document, pdfjs } from "react-pdf";
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import ClipLoader from 'react-spinners/ClipLoader';
import PacmanLoader from 'react-spinners/PacmanLoader';
import MoonLoader from 'react-spinners/MoonLoader';
import BarLoader from 'react-spinners/BarLoader';
import ReactPaginate from 'react-paginate';

Amplify.configure(awsmobile);
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
axios.defaults.withCredentials = true


export class Images extends Component {
  render() {
    let imageData = this.props.data.map((image, i) => {
      // Return the element. Also pass key
      return (<Image meta={image} key={i} />)
    })
    return (
      <React.Fragment>
        {imageData}
      </React.Fragment>
    );
  }
}

const pagesToDisplay = 8;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
      success: false,
      analyzing: false,
      file_name: "",
      numPages: "",
      uploadFileType: "",
      uploadFile: "",
      uploadFileName: "",
      uploading: false,
      offset: 0
    };

    this._isMounted = false;
    this.allImages = this.allImages.bind(this);
  }

  onDocumentLoad = ({numPages}) => {
    console.log(`numpages: ${numPages}`)
    this.setState({ numPages });
  }

  handleChange = (ev) => {
    this.setState({success: false, file_name : ev.target.value});
  }

  pdfUpload = async () => {
    let file = this.uploadInput.files[0];
    this.setState({analyzing: true});

    var reader = new FileReader();
    reader.readAsBinaryString(file);


    // Split the filename to get the name and type
    let fileParts = this.uploadInput.files[0].name.split('.');
    let fileName = fileParts[0];
    let fileType = fileParts[1];

    this.setState({ uploadFile:file,uploadFileType:fileType,uploadFileName:fileName, uploading: true})

  }
  s3Upload = () => {

    console.log("Preparing the upload");
    console.log(this.state.uploadFile.name)
    console.log(this.state.uploadFileType)
    axios.post("https://iluo6vac3f.execute-api.us-west-2.amazonaws.com/dev2/pdfs",{
      fileName : this.state.uploadFile.name,
      fileType : this.state.uploadFileType
    })
    .then(response => {
      var returnData = response.data.body;

      var signedRequest = returnData.signedRequest;
      console.log("Recieved a signed request " + signedRequest);
     // Put the fileType in the headers for the upload
      var options = {
        headers: {
          'Content-Type': `application/${this.state.uploadFileType}`
        },
        withCredentials: true
      };
      axios.put(signedRequest,this.state.uploadFile,options)
      .then(result => {
        console.log("Response from s3")

        var imageBucket = 'https://quiztrainer-quiz-images-dev.s3-us-west-2.amazonaws.com/'
        var imgs = []
        console.log('Number of Pages now:', this.state.numPages);
        for(var index=1;index <= Math.min(pagesToDisplay,this.state.numPages) ;index++){
          imgs.push(`${imageBucket}${this.state.uploadFileName}/image${index}.jpg`);
        }
        console.log('how long to get here');
        this.setState({success: true, images: imgs, analyzing: false, uploading: false });
      })
      .catch(error => {
        console.log("ERROR " + JSON.stringify(error));
      })
    })
    .catch(error => {
      console.log(JSON.stringify(error));
    })
    return this.spinner()
 }


 spinner = () => {
   return (
     <div>
       <BarLoader
         sizeUnit={"%"}
         heightUnit={"px"}
         widthUnit={"percent"}
         width={50}
         height={23}
         color={'#123abc'}
         loading={true}
       />
       <div className="move-up">Loading.. Please wait</div>
     </div>
   )
 }

 allImages = () => {
   return (
     <div>
       <Row>
         <Images data={this.state.images} />
       </Row>
       <Row>
         <ReactPaginate
            previousLabel={'previous'}
            nextLabel={'next'}
            breakLabel={'...'}
            breakClassName={'break-me'}
            pageCount={this.state.numPages/pagesToDisplay}
            marginPagesDisplayed={2}
            pageRangeDisplayed={pagesToDisplay}
            onPageChange={this.handlePageClick}
            containerClassName={'pagination'}
            subContainerClassName={'pages'}
            activeClassName={'active'}
         />
        </Row>
      </div>
   )
 }

 handlePageClick = data => {
   let offset = data.selected * pagesToDisplay;
   var imageBucket = 'https://quiztrainer-quiz-images-dev.s3-us-west-2.amazonaws.com/'
   var imgs = []
   this.setState({ offset: offset }, () => {
     for(var index=1+offset;index <= Math.min(pagesToDisplay+offset,this.state.numPages) ;index++){
       imgs.push(`${imageBucket}${this.state.uploadFileName}/image${index}.jpg`);
     }
     this.setState({images: imgs})
   });
 }

 imageShow = () => {
   return (
     <Container>
       { this.state.images.length===0 ? this.spinner() : this.allImages() }
     </Container>
   )
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

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>PDF 2 Image</h1>
          <p>
          Free online service to convert a PDF file to a set of optimized JPG images
          </p>
          <li>Click the UPLOAD FILES button and select a PDF file you wish to convert. Wait for the conversion process to finish.</li>
          <li>Download the results either file by file or click the DOWNLOAD ALL button to get them all at once in a ZIP archive.</li>
        </header>
        <div>
          {this.state.uploading ? this.s3Upload() : null}
          {this.state.numPages ? this.numPagesDisplay() : null}
          {this.state.analyzing ? this.documentAnalize() : null}
          {this.state.success ? this.imageShow() : null}
          <input value={this.state.file_name} onChange={this.handleChange} ref={(ref) => { this.uploadInput = ref; }} type="file" accept=".pdf"/>
          <button onClick={this.pdfUpload} disabled={!this.state.file_name}>Upload</button>
        </div>
      </div>
    );
  }
}

export default App;
