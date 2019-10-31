import React, { Component } from 'react';
import './PdfImages.css';
import {Row, Container} from 'react-bootstrap';
import Spinner from './spinner'
import Image from './Image'
import ReactPaginate from 'react-paginate';


class PdfImages extends Component {

  images = () => {
    let imageData = this.props.data.images.map((image, i) => {
      // Return the element. Also pass key
      return (<Image meta={image} key={i} />)
    })
    return (
      <React.Fragment>
        {imageData}
      </React.Fragment>
    );
  }

  handlePageClick = (data) => {
    this.props.handlePageClick(data);
  }


   allImages = () => {
     return (
       <div>
         <div>
            <h6 className='mt2 center'>{this.props.data.uploadFileName}.pdf: Page {this.props.data.first_page} to {this.props.data.last_page} of {this.props.data.numPages}</h6>
         </div>
         <Row>
           { this.images() }
         </Row>
         <Row>
           <ReactPaginate
              previousLabel={'previous'}
              nextLabel={'next'}
              breakLabel={'...'}
              breakClassName={'break-me'}
              pageCount={this.props.data.numPages/this.props.pagesToDisplay}
              marginPagesDisplayed={2}
              pageRangeDisplayed={this.props.pagesToDisplay}
              onPageChange={this.handlePageClick}
              containerClassName={'pagination'}
              subContainerClassName={'pages'}
              activeClassName={'active'}
           />
          </Row>
        </div>
     )
   }

  render() {
    return (
      <Container>
        { this.props.data.images.length===0 ? <Spinner /> : this.allImages() }
      </Container>
    )
  }

}

export default PdfImages;
