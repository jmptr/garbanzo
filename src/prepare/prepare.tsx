import React, { Component } from 'react';
import makeCancelable, { CancelablePromise } from './make-cancelable';

interface Props<T> {
  component: React.ComponentType<T> | React.ComponentType<any>;
  failure: React.ComponentType<T> | React.ComponentType<any>;
  loader: React.ComponentType<T> | React.ComponentType<any>;
  prepareFn?: () => Promise<unknown>;
}

interface State {
  awaiting?: boolean;
  error?: Error;
}

/**
 * Prepare is a higher-order-component that helps control user experiences while
 * asynchronous operations are pending.
 *
 * This component helps protect visual components from being displayed before the
 * environment is prepared for it.
 *
 * @example
 * const apiRequest = api.get('/some-resource');
 * const Loader = (props) => <span>loading...</span>;
 * const Failure = (props) => <Redirect to="/error" />
 * const View = (props) => <View {...props} />;
 *
 * const SomeContainer = <Prepare
 *  loader={Loader}
 *  failure={Failure}
 *  component={View}
 *  prepareFn={apiRequest}
 * />
 */
class Prepare<P extends object> extends Component<Props<P>, State> {
  /**
   * Since this component will immediately invoke the prepareFn when it is mounted,
   * set awaiting to true by default
   */
  public state = {
    awaiting: true,
    error: undefined,
  };

  public static defaultProps = {
    prepareFn: () => Promise.resolve(true),
    failure: () => <div>failure</div>,
  };

  /**
   * This is the instance of the cancelablePromise. A reference is held to help
   * aid in lifecycle management and enable test spies to validate runtime behavior.
   */
  private cancelablePromise: CancelablePromise | undefined = undefined;

  public componentDidMount = () => {
    const { prepareFn = () => Promise.resolve(true) } = this.props;
    /**
     * makeCancelable will take the asynchronous function and wrap it in a separate
     * promise that will reject the promise if it is canceled before it resolves
     */
    this.cancelablePromise = makeCancelable(prepareFn());
    this.cancelablePromise
      .promise
      .then(() => {
        this.setState({
          awaiting: false,
        }, () => {
          this.cancelablePromise = undefined;
        });
      })
      .catch((reason: Error) => {
        // makeCancelable will return { isCanceled: true } if the promise is canceled
        if (reason.message === 'canceled') {
          return;
        }

        this.setState({
          awaiting: false,
          error: reason,
        }, () => {
          this.cancelablePromise = undefined;
        });
      });
  };

  public componentDidCatch = (error: Error) => {
    this.setState({
      error,
    });
  };

  public componentWillUnmount = () => {
    const { awaiting } = this.state;
    if (awaiting && this.cancelablePromise) {
      this.cancelablePromise.cancel();
      this.cancelablePromise = undefined;
    }
  }

  public render = () => {
    const { awaiting, error } = this.state;
    const {
      component: View,
      failure: ErrorView,
      loader: Loader,
      prepareFn,
      ...remaining
    } = this.props;

    if (error) {
      return <ErrorView {...remaining as P} />;
    }

    if (awaiting) {
      return <Loader {...remaining as P} />;
    }

    return <View {...remaining as P} />;
  };
}

export default Prepare;
