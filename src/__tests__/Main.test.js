var sinon = require('sinon');
const AWSMock = require('aws-sdk-mock');
import React from 'react';
import { shallow, mount } from 'enzyme';
import Main from '../components/Main';
const fs = require('fs');
const path = require("path");

let previous_uploads = [{"uploadFileName":"template","numPages":2,"s3SafeFileName":"78559523template.pdf"},{"uploadFileName":"reactnative","numPages":242,"s3SafeFileName":"78559523reactnative.pdf"},{"uploadFileName":"TrainTickets","numPages":2,"s3SafeFileName":"78559523TrainTickets.pdf"}];

describe('main component tests', () => {
    beforeEach(() => {
      jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
      useParams: () => ({
        index: '1'
      }),
      useRouteMatch: () => ({ url: '/uploaded/1' }),
    }));
   });


  it('uploads a file', () => {
    const data = fs.readFileSync(path.resolve(__dirname, './statement.pdf'));


    //const onClick = sinon.spy();
    const wrapper = mount(<Main previous_uploads={previous_uploads} />);
    const file = new Blob([data], {type : 'application/pdf'});
    console.log(data)
    wrapper.find('input').update('change', {
      target: {
         files: [file]
      }
    });


    wrapper.find('.btn-primary').update('click');
    //expect(onButtonClick).to.have.property('callCount', 1);

    expect(wrapper).toMatchSnapshot();
  });
});
