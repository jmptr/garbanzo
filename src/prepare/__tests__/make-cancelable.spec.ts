import makeCancelable from '../make-cancelable';

describe('makeCancelable', () => {
  describe('when canceled', () => {
    let result: Error;

    beforeAll((done) => {
      const somePromise = new Promise((resolve) => {
        resolve(true);
      });
      const cancelablePromise = makeCancelable(somePromise);

      cancelablePromise.cancel();
      cancelablePromise
        .promise
        .catch((res) => {
          result = res;
        })
        .finally(() => {
          done();
        });
    });

    it('should reject with isCanceled reason', () => {
      expect(result.message).toEqual('canceled');
    });
  });

  describe('when not canceled', () => {
    let result: string;

    beforeAll((done) => {
      const somePromise = new Promise((resolve) => {
        resolve('test-value');
      });
      const cancelablePromise = makeCancelable(somePromise);

      cancelablePromise
        .promise
        .then((res: string) => {
          result = res;
        })
        .finally(() => {
          done();
        });
    });

    it('should reject with isCanceled reason', () => {
      expect(result).toEqual('test-value');
    });
  });

  describe('when the inner promise throws before it is canceled', () => {
    let result: Error;

    beforeAll((done) => {
      const somePromise = new Promise((resolve, reject) => {
        reject(Error('example-rejection'));
      });
      const cancelablePromise = makeCancelable(somePromise);

      cancelablePromise
        .promise
        .catch((reason: Error) => {
          result = reason;
        })
        .finally(() => {
          done();
        });
    });

    it('should reject with the inner promise\'s reason', () => {
      expect(result.message).toBe('example-rejection');
    });
  });
});
