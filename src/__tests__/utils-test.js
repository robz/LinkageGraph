/* @flow */

const {getX} = require('../utils');

it('returns a value when the key exists', () => {
  expect(getX(new Map().set('a', 3), 'a')).toBe(3);
});

it('throws an error when the key does not exist', () => {
  // toThrowError is not covered by flow :(
  expect(() => getX(new Map(), 'a')).toThrowError('no value for key a');
});
