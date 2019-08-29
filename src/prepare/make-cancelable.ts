export interface CancelablePromise<T = unknown> {
  promise: Promise<T>;
  cancel: () => (void);
}

type CancelablePromiseFactory<T extends object> = (promise: Promise<T>) => CancelablePromise<T>;

/**
 * Adapted from the code example seen in https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
 *
 * Promises do not have a built-in way to cancel them before they complete,
 * so this factory function provides a way to short-circuit the promise
 * lifecycle.
 *
 * Canceling a promise allows the consumer to manage their subscriptions to a pending
 * response. This can be particularly helpful when mounting and unmounting a react
 * component.
 *
 * @param {Promise} promise asynchronous function to wrap
 * @returns {Object} cancelablePromise
 * @example
 * const somePromise = new Promise((resolve) => resolve(true));
 * const cancelable = makeCancelable(somePromise);
 * // cancelable.promise is now pending
 * cancelable.cancel();
 * cancelable.promise
 *  .catch(reason => ()); // reason === { isCanceled: true };
 */
const makeCancelable: CancelablePromiseFactory<any> = (promise: Promise<any>) => {
  let hasCanceled = false;

  const cancel = () => {
    hasCanceled = true;
  };

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      (result: any) => {
        if (hasCanceled) {
          reject(new Error('canceled'));
        }
        resolve(result);
      },
      (error: Error) => {
        if (hasCanceled) {
          reject(new Error('canceled'));
        }
        reject(error);
      }
    );
  });

  return {
    promise: wrappedPromise,
    cancel,
  };
};

export default makeCancelable;
