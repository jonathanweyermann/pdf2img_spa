import React, { Component } from 'react';
import './App.css';
import Image from './components/Image'
import Zip from './components/Zip'
import About from './components/About'
import axios from 'axios'
import Amplify from 'aws-amplify';
import awsmobile from './aws-exports';
import { Document, pdfjs } from "react-pdf";
import BarLoader from 'react-spinners/BarLoader';
import { Navbar, NavDropdown, Nav, Row, Container, Button } from 'react-bootstrap';
import ReactPaginate from 'react-paginate';
import { BrowserRouter as Router, Switch, Route, useParams} from "react-router-dom";

import { library } from '@fortawesome/fontawesome-svg-core'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
library.add(faDownload)

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
const imageBucket = 'https://quiztrainer-quiz-images-dev.s3-us-west-2.amazonaws.com/';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
      success: false,
      successZip: false,
      analyzing: false,
      file_name: "",
      numPages: "",
      uploadFileType: "",
      uploadFile: "",
      uploadFileName: "",
      s3SafeFileName: "x.x",
      uploading: false,
      offset: 0,
      base_state: true,
      first_page: 1,
      last_page: 8,
      error_message: ""
    };

    this._isMounted = false;
    this.allImages = this.allImages.bind(this);
    this.grabPreviousUploads = this.grabPreviousUploads.bind(this);
  }

  onDocumentLoad = ({numPages}) => {
    console.log(`numpages: ${numPages}`)
    this.setState({ numPages, uploading: true });
  }

  handleChange = (ev) => {
    this.setState({file_name : ev.target.value});
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

  grabPreviousUploads = () => {
    if (localStorage.getItem('previous_uploads')) {
      var prev_uploads = JSON.parse(localStorage.getItem('previous_uploads'))
      var valid_uploads = prev_uploads.filter(this.checkFileExistance);
      localStorage.setItem('previous_uploads', JSON.stringify(valid_uploads))
      return localStorage.getItem('previous_uploads');
    }
    else {
      return []
    }
  }

  checkFileExistance = (upload) => {
    var x = (this.tryRequire(`${imageBucket}pdfs/${upload.s3SafeFileName}`)===200)
    console.log(`x: ${x}`)
    return x
  }

  checkFilter = (x) => {
    return false;
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

  saveLocal = (id,prev_uploads) => {
    localStorage.setItem(id,prev_uploads)
  }

  addToPreviousUploads = () => {
    var prev_uploads = JSON.parse(this.grabPreviousUploads());
    var found = prev_uploads.find((upload) => {
      return (upload.uploadFileName === this.state.uploadFileName && upload.numPages === this.state.numPages)
    });
    if (found === undefined) {
      prev_uploads.push({uploadFileName: this.state.uploadFileName, numPages: this.state.numPages, s3SafeFileName: this.state.s3SafeFileName})
      this.saveLocal('previous_uploads', JSON.stringify(prev_uploads))
    }
    this.setState({success: true})
  }

  setStateToSelectedPDF = (previous_uploads_data) => {
    let { uploadFileName, numPages, s3SafeFileName} = previous_uploads_data;
    var imgs = [];
    for(var index=1;index <= Math.min(pagesToDisplay,numPages) ;index++){
      imgs.push(`${imageBucket}${s3SafeFileName.split('.')[0]}/image${index}.jpg`);
    }
    if (this.checkFileExistance({s3SafeFileName})) {
      this.setState({success: true, images: imgs, analyzing: false, uploading: false, first_page: 1, last_page: Math.min(pagesToDisplay,numPages),base_state: false, uploadFileName, numPages, s3SafeFileName})
    } else {
      this.setState({error_message: "Can't find pdf - server probably deleted it"})
    }
  }


  pdfUpload = async () => {
    let file = this.uploadInput.files[0];

    var reader = new FileReader();
    reader.readAsBinaryString(file);


    // Split the filename to get the name and type
    let fileParts = this.uploadInput.files[0].name.split('.');
    let fileName = fileParts[0];
    let fileType = fileParts[1];

    this.setState({ error_message: "", success: false, successZip: false, uploadFile:file, s3SafeFileName: `${this.localIdentifier('pcid')}${file.name.replace(/[^0-9a-zA-Z_.]/g, '')}`, uploadFileType:fileType,uploadFileName:fileName, analyzing: true, base_state: false})
  }

  s3Upload = () => {

    console.log("Preparing the upload");
    console.log(this.state.s3SafeFileName)
    console.log(this.state.uploadFileType)
    axios.post("https://iluo6vac3f.execute-api.us-west-2.amazonaws.com/dev2/pdfs",{
      fileName : this.state.s3SafeFileName,
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

        var imgs = []
        console.log('Number of Pages now:', this.state.numPages);
        for(var index=1;index <= Math.min(pagesToDisplay,this.state.numPages) ;index++){
          imgs.push(`${imageBucket}${this.state.s3SafeFileName.split('.')[0]}/image${index}.jpg`);
        }
        console.log('how long to get here');
        this.setState({success: true, images: imgs, analyzing: false, uploading: false, first_page: 1, last_page: Math.min(pagesToDisplay,this.state.numPages)});
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
       <div>
          <h6 className='mt2 center'>{this.state.uploadFileName}.pdf: Page {this.state.first_page} to {this.state.last_page} of {this.state.numPages}</h6>
       </div>
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
   var imgs = []
   this.setState({ offset: offset }, () => {
     for(var index=1+offset;index <= Math.min(pagesToDisplay+offset,this.state.numPages) ;index++){
       imgs.push(`${imageBucket}${this.state.s3SafeFileName.split('.')[0]}/image${index}.jpg`);
     }
     this.setState({images: imgs, first_page: 1+offset, last_page: Math.min(pagesToDisplay+offset,this.state.numPages)})
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

 header = () => {
   return (
     <Navbar className="navbar-dark" expand="sm" >
      <Navbar.Brand href="#home">PDF 2 Image<div className='descriptor'>Convert a PDF file to a set of optimized JPG images</div></Navbar.Brand>

      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">

          <Nav.Link href="/">Home</Nav.Link>
          <NavDropdown title="Previous PDFs" id="basic-nav-dropdown">
             {

               (JSON.parse(this.grabPreviousUploads()) || []).map((item, i) => {
                // Return the element. Also pass key

                return (<NavDropdown.Item key={i} onClick={() => this.setStateToSelectedPDF(item)}>{item["uploadFileName"]}</NavDropdown.Item>)

             })}
          </NavDropdown>
          <Nav.Link href="/about">About</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
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

 errorMessage = () => {
   return (
     <div class="error-message">{this.state.error_message}</div>
   )
 }

  render() {
    return (
      <Router>
        <div className="App">
          <header className="App-header">
            { this.header() }
          </header>
          <div>
            <Switch>
              <Route path="/about">
                <About />
              </Route>
              <Route path="/">
                {this.state.error_message ? this.errorMessage() : null }
                {this.state.base_state ? this.description() : null }
                {this.state.uploading ? this.s3Upload() : null}
                {this.state.numPages && this.state.uploading ? this.numPagesDisplay() : null}
                {this.state.analyzing ? this.documentAnalize() : null}
                {this.state.success ? this.imageShow() : null}
                <Container>
                  {this.state.success ? (<Zip addToPreviousUploads={() => this.addToPreviousUploads()} fileName={`${imageBucket}${this.state.s3SafeFileName.split('.')[0]}.zip`} />) : null}
                  <input className='btn btn-success input-padding' value={this.state.file_name} onChange={this.handleChange} ref={(ref) => { this.uploadInput = ref; }} type="file" accept=".pdf"/>
                  <Button onClick={this.pdfUpload} disabled={!this.state.file_name} className='convert-button-padding'>Convert to JPG Images</Button>
                </Container>
              </Route>
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
