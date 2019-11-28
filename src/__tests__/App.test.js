
import { expect as chai_expect } from 'chai';
import renderer from 'react-test-renderer';
let valid_uploads = '[{"uploadFileName":"template","numPages":2,"s3SafeFileName":"78559523template.pdf"},{"uploadFileName":"reactnative","numPages":242,"s3SafeFileName":"78559523reactnative.pdf"},{"uploadFileName":"TrainTickets","numPages":2,"s3SafeFileName":"78559523TrainTickets.pdf"}]';
var sinon = require('sinon');
import { imageBucket } from '../constants'

import React from 'react';
import { shallow, mount } from 'enzyme';
import App from '../App';

import mock from 'xhr-mock';

describe('First React component test with Enzyme', () => {
  it('renders welcome message', () => {
    const wrapper = mount(<App />);
    const welcome = <div className="center heading-font">Convert a PDF file to a set of optimized JPG images</div>
    expect(wrapper.contains(welcome)).toBe(true);
  });

  it('renders without crashing', () => {
    shallow(<App />);
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(<App />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders an `.btn-success', () => {
    const wrapper = mount(<App />);
    chai_expect(wrapper.find('.btn-success')).to.have.lengthOf(1);
  });

  it('there are no pdf dropdown items', () => {
    const wrapper = mount(<App />);
    chai_expect(wrapper.find('a.dropdown-item')).to.have.lengthOf(0);
  });
});
var xhr = null;
var requests = [];
describe('Previous uploads exist locally stored', () => {
  beforeEach(() => {
    localStorage.setItem('previous_uploads', valid_uploads)
    const xhrMockClass = () => ({
      open            : jest.fn(),
      send            : jest.fn(),
      setRequestHeader: jest.fn(),
      status: 200
    })
    window.XMLHttpRequest = jest.fn().mockImplementation(xhrMockClass)
  })

  it('creates a screenshot for the pdf dropdown view for previously uploaded pdfs', () => {
    const tree = renderer.create(<App />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('creates a pdf dropdown view for three previously uploaded pdfs', () => {
    const wrapper = mount(<App />);
    chai_expect(wrapper.find('a.dropdown-item')).to.have.lengthOf(3);
  });
});
