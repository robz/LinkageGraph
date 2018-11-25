/* @flow */

const {MotorSegment, PassiveSegment} = require('../LinkageGraph');

it('computes motor segments', () => {
  /*
   *     p2
   *     .
   *    /   45 degrees
   *  . -- .
   *  p0   p1
   *
   */
  const input = {
    p0: {x: 0, y: 0},
    p1: {x: 1, y: 0},
    theta: Math.PI / 4,
    len: 1,
  };
  const {p2} = MotorSegment.forward(input);
  expect(p2.x).toBeCloseTo(1 / Math.sqrt(2), 5);
  expect(p2.y).toBeCloseTo(1 / Math.sqrt(2), 5);
});

it('computes passive segments', () => {
  /*
   *       p2
   *       .
   *
   *    /  |
   *  .    .
   *  p0   p1
   *
   */
  const input = {
    p0: {x: 0, y: 0},
    p1: {x: 1, y: 0},
    len0: Math.sqrt(2),
    len1: 1,
  };
  const {p2} = PassiveSegment.forward(input);
  expect(p2.x).toBeCloseTo(1, 5);
  expect(p2.y).toBeCloseTo(1, 5);
});

it('computes passive segments the other way by reversing points', () => {
  /*
   *  p1   p0
   *  .    .
   *   \   |
   *     \ |
   *       .
   *       p2
   */
  const input = {
    p0: {x: 1, y: 0},
    p1: {x: 0, y: 0},
    len0: 1,
    len1: Math.sqrt(2),
  };
  const {p2} = PassiveSegment.forward(input);
  expect(p2.x).toBeCloseTo(1, 5);
  expect(p2.y).toBeCloseTo(-1, 5);
});
