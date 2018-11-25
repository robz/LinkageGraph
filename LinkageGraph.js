/* @flow */

type Point = {x: number, y: number};

type Config = {
  points: Map<string, Point>,
  lengths: Map<string, number>,
  angles: Map<string, number>,
};

type Refs<In, Out> = {[$Keys<In & Out>]: string};
type Segment<In, Out> = {
  // returns null if the system doesn't yet contain the data required to
  // compute this segment
  getInput(Config, Refs<In, Out>): ?In,

  // compute this segment's geometry
  forward(In): Out,

  // record the segment's computation into the system's cache
  setOutput(Config, Refs<In, Out>, Out): void,

  // returns whether the segment's output is already in the cache
  hasSetOutput(Config, Refs<In, Out>): boolean,

  // compute the derivative of each output wrt each input
  // used for gradient descent
  // TODO: implement this (as a function of thetas?)
  // backward(In, Out): Jacobian;
};

type MotorSegmentIn = {p0: Point, p1: Point, theta: number, len: number};
type MotorSegmentOut = {p2: Point};

type PassiveSegmentIn = {p0: Point, p1: Point, len0: number, len1: number};
type PassiveSegmentOut = {p2: Point};

type SegmentRefs =
  | {t: 'm', refs: Refs<MotorSegmentIn, MotorSegmentOut>}
  | {t: 'p', refs: Refs<PassiveSegmentIn, PassiveSegmentOut>};

type Linkage = {
  staticPoints: {[string]: Point},
  lengths: {[string]: number},
  segments: Array<SegmentRefs>,
};

function getX<K, V>(m: Map<K, V>, key: K): V {
  const v = m.get(key);
  if (v == null) {
    throw new Error('no value for key ' + String(key));
  }
  return v;
}

const MotorSegment: Segment<MotorSegmentIn, MotorSegmentOut> = {
  getInput(config, refs) {
    return {
      p0: getX(config.points, refs.p0),
      p1: getX(config.points, refs.p1),
      theta: getX(config.angles, refs.theta),
      len: getX(config.lengths, refs.len),
    };
  },

  forward(input) {
    // TODO: implement this
    return {p2: {x: 0, y: 0}};
  },

  setOutput(config, refs, output) {
    config.points.set(refs.p2, output.p2);
  },

  hasSetOutput(config, refs) {
    return !!config.points.get(refs.p2);
  },
};

const PassiveSegment: Segment<PassiveSegmentIn, PassiveSegmentOut> = {
  getInput(config, refs) {
    const p0 = config.points.get(refs.p0);
    const p1 = config.points.get(refs.p1);
    if (p0 == null || p1 == null) {
      // these points might not have been computed yet
      return null;
    }
    return {
      p0,
      p1,
      len0: getX(config.lengths, refs.len0),
      len1: getX(config.lengths, refs.len1),
    };
  },

  forward(input) {
    // TODO: implement this
    return {p2: {x: 0, y: 0}};
  },

  setOutput(config, refs, output) {
    config.points.set(refs.p2, output.p2);
  },

  hasSetOutput(config, refs) {
    return !!config.points.get(refs.p2);
  },
};

// try to compute the segment and return whether it was computed
// if it was computed,
// then the computation is recorded in config as a side effect
function forwardSegment<In, Out>(
  config: Config,
  SegmentKind: Segment<In, Out>,
  refs: Refs<In, Out>,
): boolean {
  if (SegmentKind.hasSetOutput(config, refs)) {
    // segment was already computed
    return false;
  }
  const input = SegmentKind.getInput(config, refs);
  if (input == null) {
    // config doesn't yet contain all the required input refs
    return false;
  }
  SegmentKind.setOutput(config, refs, SegmentKind.forward(input));
  return true;
}

// loop over all segments in the system to compute all their outputs
// this will be O(n) if the segments are topologically sorted,
// and at most O(n^2) otherwise
// throws errors if either
//   - the input config wasn't seeded with required data
//   - the segments cannot all be computed due to an incomplete dependency graph
// if successful, the outputs are recorded in config as a side effect
function forwardConfig(config: Config, segments: Array<SegmentRefs>): void {
  let progress = true;
  let computedSegments = 0;
  while (progress) {
    progress = false;
    for (const segment of segments) {
      switch (segment.t) {
        case 'm':
          progress =
            forwardSegment(config, MotorSegment, segment.refs) || progress;
          break;
        case 'p':
          progress =
            forwardSegment(config, PassiveSegment, segment.refs) || progress;
          break;
      }
    }
    if (progress) {
      computedSegments += 1;
    }
  }
  if (computedSegments !== segments.length) {
    throw new Error('failed to compute all segments');
  }
}

function forwardLinkage(linkage: Linkage, angles: Map<string, number>): Config {
  const points = Object.keys(linkage.staticPoints).reduce(
    (m, pRef) => m.set(pRef, linkage.staticPoints[pRef]),
    new Map(),
  );
  const lengths = Object.keys(linkage.lengths).reduce(
    (m, lenRef) => m.set(lenRef, linkage.lengths[lenRef]),
    new Map(),
  );
  const config = {points, lengths, angles};
  forwardConfig(config, linkage.segments);
  return config;
}

module.exports = {
  MotorSegment,
  PassiveSegment,
  forwardSegment,
  forwardConfig,
  forwardLinkage,
};
