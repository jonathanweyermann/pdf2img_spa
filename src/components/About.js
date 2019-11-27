import React, { Component } from 'react';
import jonathan from '../images/jonathan.jpg'
import './About.css'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

class About extends Component {
  render() {

    return (
      <Container>
        <Row className='padding-top'>
          <Col md={3}>
            <img className='imageStyle' src={jonathan} alt="Jonathan Weyermann" />
          </Col>
          <Col md={9}>
            <h1>About the Author</h1>
            <div>My name is Jonathan Weyermann and I built this site using React JS</div>
            You can also visit my <a href="http://www.jonathanweyermann.com">home page</a>
          </Col>
        </Row>
      </Container>
    )
  }
}


export default About;
