import React, { Component } from 'react';
import './App.css';
import Main from './components/Main'
import About from './components/About'
import Amplify from 'aws-amplify';
import awsmobile from './aws-exports';
import FileStatus from './util/FileStatus'
import { Navbar, NavDropdown, Nav } from 'react-bootstrap';
import { Router, Switch, Route } from "react-router-dom";
import { library } from '@fortawesome/fontawesome-svg-core'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { createBrowserHistory } from 'history';
import MetaTags from 'react-meta-tags';
require('dotenv').config()
library.add(faDownload)

Amplify.configure(awsmobile);

const history = createBrowserHistory();

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      previous_uploads: this.grabPreviousUploads()
    }

    this._isMounted = false;
    this.grabPreviousUploads = this.grabPreviousUploads.bind(this);
  }

  grabPreviousUploads = () => {
    if (localStorage.getItem('previous_uploads')) {
      var prev_uploads = JSON.parse(localStorage.getItem('previous_uploads'))
      var valid_uploads = prev_uploads.filter(this.checkPdfFileExistance);
      localStorage.setItem('previous_uploads', JSON.stringify(valid_uploads))
      return JSON.parse(localStorage.getItem('previous_uploads'));
    }
    else {
      return []
    }
  }

  checkPdfFileExistance = (upload) => {
    return (FileStatus(`${process.env.REACT_APP_IMAGE_BUCKET}pdfs/${upload.s3SafeFileName}`)===200)
  }

 header = () => {
   return (
     <Navbar className="navbar-dark" expand="sm" >
       <Navbar.Brand href="#home">PDF 2 JPGs</Navbar.Brand>
       <Navbar.Toggle aria-controls="basic-navbar-nav" />
       <Navbar.Collapse id="basic-navbar-nav">
         <Nav className="mr-auto">
           <Nav.Link href="/">Home</Nav.Link>
           <NavDropdown title="Previous PDFs" id="basic-nav-dropdown">
              {
                this.state.previous_uploads.map((item, i) => {
                  return (<NavDropdown.Item key={i} href={`/uploaded/${i}`} state={ {item: item}}>{item["uploadFileName"]}</NavDropdown.Item>)
                })
              }
              { this.dropDownNav() }
           </NavDropdown>
           <Nav.Link href="/about">About</Nav.Link>
         </Nav>
       </Navbar.Collapse>
     </Navbar>
    )
  }

  dropUploads = () => {
    localStorage.removeItem('previous_uploads')
    this.setState({previous_uploads: this.grabPreviousUploads()})
  }

  dropDownNav = () => {
    if (this.state.previous_uploads.length>0){
      return (<React.Fragment>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={this.dropUploads}>Drop Previous Uploads</NavDropdown.Item>
              </React.Fragment>)
    }
  }

  previous_uploads_update = (index) => {
    this.setState({previous_uploads: this.grabPreviousUploads()})
    if (index === -1) { index = this.state.previous_uploads.length-1 };
    history.push(`/uploaded/${index}`);
  }

  render() {
    return (
      <Router history={history}>
        <div className="App">
          <MetaTags>
             <title>PDF 2 JPGs - Free PDF to JPG Converter with thumbnail previews</title>
             <meta name="keywords" content="PDF, JPG, Convert, Conversion, PDF to JPG, PDF to Image, Image" />
             <meta name="description" content="Free tool to convert PDFs to JPGs. It shows thumbnails of each page, and also generates a zip file to download" />
             <meta name="author" content="Jonathan Weyermann" />
           </MetaTags>
          <header className="App-header">
            { this.header() }
          </header>
          <div>
            <Switch>
              <Route path="/about" component={About} />
              <Route path="/uploaded/:index">
                <Main previous_uploads={this.state.previous_uploads} previous_uploads_update={this.previous_uploads_update} />
              </Route>
              <Route path="/">
                <Main previous_uploads={this.state.previous_uploads} previous_uploads_update={this.previous_uploads_update} />
              </Route>
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
