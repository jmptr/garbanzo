import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import Prepare from '../prepare';

jest.useFakeTimers();

const defaultProps = {
  loader: () => <div>loader</div>,
  component: () => <div>view</div>,
  failure: () => <div>failre</div>,
  prepareFn: () => new Promise((r) => setTimeout(() => r(true), 500)),
};

describe('Prepare component', () => {
  describe('when prepareFn is pending', () => {
    let wrapper: ShallowWrapper;

    beforeAll(() => {
      wrapper = shallow(<Prepare {...defaultProps} />);
    });

    it('should render the loader component', () => {
      const actual = wrapper.find(defaultProps.loader);
      expect(actual).toBeDefined();
    });
  });

  describe('when prepareFn is complete', () => {
    let wrapper: ShallowWrapper;

    beforeAll(() => {
      wrapper = shallow(<Prepare {...defaultProps} />);
      jest.runAllTimers();
    });

    it('should render the component property', () => {
      const actual = wrapper.find(defaultProps.component);
      expect(actual).toBeDefined();
    });
  });

  describe('when unmounted before prepareFn is complete', () => {
    let cancelMethodSpy: jest.SpyInstance;
    let instance: any;

    beforeAll(() => {
      const wrapper = shallow(<Prepare {...defaultProps} />);
      instance = wrapper.instance();
      cancelMethodSpy = jest.spyOn(instance.cancelablePromise, 'cancel');
      wrapper.unmount();
    });

    afterAll(jest.runAllTimers);

    it('should invoke cancel on the prepareFn cancelable wrapper', () => {
      expect(cancelMethodSpy).toHaveBeenCalledWith();
    });

    it('should set the cancelablePromise property to undefined', () => {
      expect(instance.cancelablePromise).toBeUndefined();
    });
  });

  describe('when unmounted after the prepareFn is complete', () => {
    let cancelablePromiseSpy: jest.SpyInstance;
    let instance: any;

    beforeAll((done) => {
      const wrapper = shallow(<Prepare {...defaultProps} />);
      instance = wrapper.instance();
      cancelablePromiseSpy = jest.spyOn(instance.cancelablePromise, 'cancel');
      jest.runAllTimers();
      /**
       * Since setting state happens asynchronously, we have to use process.nextTick
       * to make sure our setState invocations have been process.
       *
       * See: https://jestjs.io/docs/en/tutorial-async
       */
      process.nextTick(() => {
        wrapper.unmount();
        done();
      });
    });

    it('should NOT invoke cancel on the prepareFn cancelable wrapper', () => {
      expect(cancelablePromiseSpy).not.toHaveBeenCalled();
    });

    it('should set the cancelablePromise property to undefined', () => {
      expect(instance.cancelablePromise).toBeUndefined();
    });
  });

  describe('when prepareFn throws an exception', () => {
    let wrapper: ShallowWrapper;

    beforeAll((done) => {
      const props = {
        ...defaultProps,
        prepareFn: () => new Promise((resolve, reject) => {
          reject(Error('some-exception'));
        }),
      };
      wrapper = shallow(<Prepare {...props} />);
      process.nextTick(() => {
        done();
      });
    });

    it('should render the failure component', () => {
      expect(wrapper.find(defaultProps.failure).length).toBe(1);
    });
  });

  describe('when loader component throws an exception', () => {
    let wrapper: ShallowWrapper;

    beforeAll(() => {
      wrapper = shallow(<Prepare {...defaultProps} />);
      wrapper.find(defaultProps.loader).simulateError(new Error('some-error'));
      wrapper.update();
    });

    it('should render the failure component', () => {
      expect(wrapper.find(defaultProps.failure).length).toBe(1);
    });
  });
});
