/* @flow */

const {getX} = require('../utils');
const {
  MotorSegment,
  PassiveSegment,
  forwardLinkage,
} = require('../LinkageGraph');

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

it('computes a square linkage', () => {
  /*
   *      p2  len1  p3
   *      . _______ .
   *      |         |
   * len0 |         | len2
   *      . _______ .
   *      p0        p1
   */
  const angles = new Map().set('theta0', Math.PI / 2);
  const linkage = {
    staticPoints: {
      p0: {
        x: 0,
        y: 0,
      },
      p1: {
        x: 1,
        y: 0,
      },
    },
    lengths: {
      len0: 1,
      len1: 1,
      len2: 1,
    },
    segments: [
      {
        t: 'm',
        refs: {
          p0: 'p0',
          p1: 'p1',
          p2: 'p2',
          len: 'len0',
          theta: 'theta0',
        },
      },
      {
        t: 'p',
        refs: {
          p0: 'p2',
          p1: 'p1',
          p2: 'p3',
          len0: 'len1',
          len1: 'len2',
        },
      },
    ],
  };

  const {points} = forwardLinkage(linkage, angles);
  const p2 = getX(points, 'p2');
  expect(p2.x).toBeCloseTo(0, 5);
  expect(p2.y).toBeCloseTo(1, 5);
  const p3 = getX(points, 'p3');
  expect(p3.x).toBeCloseTo(1, 5);
  expect(p3.y).toBeCloseTo(1, 5);
});
