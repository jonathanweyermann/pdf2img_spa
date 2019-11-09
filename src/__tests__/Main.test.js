var sinon = require('sinon');
const AWSMock = require('aws-sdk-mock');
import React from 'react';
import { shallow, mount } from 'enzyme';
import Main from '../components/Main';
import MainBuilder from '../components/MainBuilder'
const fs = require('fs');
const path = require("path");
import { imageBucket } from '../constants'
import * as constants from '../constants';
import { Switch, Route, useParams } from "react-router-dom";
import * as dependency from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { MemoryRouter } from 'react-router'
import { expect as chai_expect } from 'chai';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
library.add(faDownload)

let previous_uploads = [{"uploadFileName":"template","numPages":2,"s3SafeFileName":"78559523template.pdf"},{"uploadFileName":"reactnative","numPages":23,"s3SafeFileName":"78559523reactnative.pdf"},{"uploadFileName":"TrainTickets","numPages":2,"s3SafeFileName":"78559523TrainTickets.pdf"}];

describe('main component tests', () => {
  beforeEach(() => {
    const xhrMockClass = () => ({
      open            : jest.fn(),
      send            : jest.fn(),
      setRequestHeader: jest.fn(),
      status: 200
    })
    window.XMLHttpRequest = jest.fn().mockImplementation(xhrMockClass)
    constants.imageBucket = './';
  });

  it('uploads a file', () => {
    const data = fs.readFileSync(path.resolve(__dirname, './statement.pdf'));

    const wrapper = mount(<MemoryRouter initialEntries={[ '/' ]}>
                            <MainBuilder previous_uploads={previous_uploads} history={history} />
                          </MemoryRouter>);
    const file = new Blob([data], {type : 'application/pdf'});
    wrapper.find('input').update('change', {
      target: {
         files: [file]
      }
    });

    wrapper.find('.btn-primary').update('click');
    expect(wrapper.find(Main)).toMatchSnapshot();
  });

  describe('retrieves a previously uploaded file', () => {
    let data;
    let wrapper;
    let file;
    beforeEach(() => {
      data = fs.readFileSync(path.resolve(__dirname, './statement.pdf'));
      wrapper = mount(<MemoryRouter initialEntries={[ '/uploaded/1' ]}>
                              <MainBuilder previous_uploads={previous_uploads} />
                            </MemoryRouter>);
      file = new Blob([data], {type : 'application/pdf'});
    });

    it('and shows snapshot', () => {
      expect(wrapper.find(Main)).toMatchSnapshot()
    });

    it('and builds the first 8 image objects buttons and a zip button and an upload button', () => {
      chai_expect(wrapper.find('Button')).to.have.lengthOf(10);
    });

    it('loads 8 image components', () => {
      chai_expect(wrapper.find('Image')).to.have.lengthOf(8);
    });
  });
});
