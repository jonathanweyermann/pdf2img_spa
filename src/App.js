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

Amplify.configure(awsmobile);
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
axios.defaults.withCredentials = true


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
      url: "",
      success: false,
      uploaded: false,
      file_name: "",
      numPages: 1,
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
    this.setState({uploaded: true});

    var reader = new FileReader();
    reader.readAsBinaryString(file);


    // Split the filename to get the name and type
    let fileParts = this.uploadInput.files[0].name.split('.');
    let fileName = fileParts[0];
    let fileType = fileParts[1];
    console.log("Preparing the upload");
    axios.post("https://iluo6vac3f.execute-api.us-west-2.amazonaws.com/dev2/pdfs",{
      fileName : file.name,
      fileType : fileType
    })
    .then(response => {
      var returnData = response.data.body;

      var signedRequest = returnData.signedRequest;
      var url = returnData.url;
      this.setState({url: url})
      console.log("Recieved a signed request " + signedRequest);

     // Put the fileType in the headers for the upload
      var options = {
        headers: {
          'Content-Type': `application/${fileType}`
        },
        withCredentials: true
      };
      axios.put(signedRequest,file,options)
      .then(result => {
        console.log("Response from s3")

        var imageBucket = 'https://quiztrainer-quiz-images-dev.s3-us-west-2.amazonaws.com/'
        var imgs = []
        console.log('Number of Pages now:', this.state.numPages);
        for(var index=1;index <= this.state.numPages ;index++){
          imgs.push(`${imageBucket}${fileName}/image${index}.jpg`);
        }
        this.setState({success: true, images: imgs, uploaded: false });
      })
      .catch(error => {
        console.log("ERROR " + JSON.stringify(error));
      })
    })
    .catch(error => {
      console.log(JSON.stringify(error));
    })
 }


 spinner = () => {
   return (
     <div>
       <ClipLoader
         sizeUnit={"px"}
         size={250}
         color={'#123abc'}
         loading={this.state.loading}
       />
       Loading.. Please wait
     </div>
   )
 }

 allImages = () => {
   return (
     <React.Fragment>
     {
       this.state.images.map((image, i) => {
         // Return the element. Also pass key
         return (<Image meta={image} key={i} />)
       })
     }
     </React.Fragment>
   )
 }

 imageShow = () => {
   return (
     <Container>
       <Row>
         { this.state.images.length===0 ? this.spinner() : this.allImages() }
       </Row>
     </Container>
   )
 }

 documentAnalize = () => {

   return (
     <div>
       Are we here
       { this.uploadInput.files[0].name }
       <Document
         file={this.uploadInput.files[0] }
         onLoadSuccess={this.onDocumentLoad.bind(this)}
       >
       </Document>
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
          {this.state.uploaded ? this.documentAnalize() : null}
          {this.state.success ? this.imageShow() : null}
          <input value={this.state.file_name} onChange={this.handleChange} ref={(ref) => { this.uploadInput = ref; }} type="file" accept=".pdf"/>
          <button onClick={this.pdfUpload} disabled={!this.state.file_name}>Upload</button>
        </div>
      </div>
    );
  }
}

export default App;
