const POSITIONX = 0;
const POSITIONY = 1;
const SPEEDX = 2;
const SPEEDY = 3;
const ACCELERATIONX = 4;
const ACCELERATIONY = 5;

interface BoidsOptions {
  speedLimit?: number;
  accelerationLimit?: number;
  separationDistance?: number;
  separationForce?: number;
  cohesionForce?: number;
  alignmentForce?: number;
  cohesionDistance?: number;
  alignmentDistance?: number;
  attractors?: Attractor[]
  boids?: number;
}

type Boid = [number, number, number, number, number, number]
type Attractor = [number, number, number, number]

export default class Boids extends EventTarget {
  speedLimitRoot: number;
  accelerationLimitRoot: number;
  speedLimit: number;
  accelerationLimit: number;
  separationDistance: number;
  alignmentDistance: number;
  cohesionDistance: number;
  separationForce: number;
  cohesionForce: number;
  alignmentForce: number;
  attractors: Attractor[]
  boids: Boid[]

  constructor(opts: BoidsOptions = {}, callback: (boids: Boid[]) => void = () => void 0) {
    super();
    this.speedLimitRoot = opts.speedLimit || 0;
    this.accelerationLimitRoot = opts.accelerationLimit || 1;
    this.speedLimit = Math.pow(this.speedLimitRoot, 2);
    this.accelerationLimit = Math.pow(this.accelerationLimitRoot, 2);
    this.separationDistance = Math.pow(opts.separationDistance || 60, 2);
    this.alignmentDistance = Math.pow(opts.alignmentDistance || 180, 2);
    this.cohesionDistance = Math.pow(opts.cohesionDistance || 180, 2);
    this.separationForce = opts.separationForce || 0.15;
    this.cohesionForce = opts.cohesionForce || 0.1;
    this.alignmentForce = opts.alignmentForce || 0.25;
    this.attractors = opts.attractors || [];
    this.boids = []

    const boids = this.boids;
    for (let i = 0, l = opts.boids === undefined ? 50 : opts.boids; i < l; i += 1) {
      boids[i] = [
        Math.random() * 25,
        Math.random() * 25,
        0,
        0,
        0,
        0, // acceleration
      ];
    }

    this.addEventListener("tick", function () {
      callback(boids);
    });
  }
  tick() {
    const boids = this.boids;
    const sepDist = this.separationDistance
    const sepForce = this.separationForce
    const cohDist = this.cohesionDistance
    const cohForce = this.cohesionForce
    const aliDist = this.alignmentDistance
    const aliForce = this.alignmentForce
    const speedLimit = this.speedLimit
    const accelerationLimit = this.accelerationLimit
    const accelerationLimitRoot = this.accelerationLimitRoot
    const speedLimitRoot = this.speedLimitRoot
    const size = boids.length
    let current = size
    const attractors = this.attractors
    const attractorCount = attractors.length

    while (current--) {
      let sforceX = 0;
      let sforceY = 0;
      let cforceX = 0;
      let cforceY = 0;
      let aforceX = 0;
      let aforceY = 0;
      let currPos = boids[current];

      // Attractors
      let target = attractorCount;
      while (target--) {
        let attractor = attractors[target];
        let spareX = currPos[0] - attractor[0];
        let spareY = currPos[1] - attractor[1];
        let distSquared = spareX * spareX + spareY * spareY;

        if (distSquared < attractor[2] * attractor[2]) {
          length = hypot(spareX, spareY);
          boids[current][SPEEDX] -= (attractor[3] * spareX) / length || 0;
          boids[current][SPEEDY] -= (attractor[3] * spareY) / length || 0;
        }
      }

      target = size;
      while (target--) {
        if (target === current)
          continue;
        let spareX = currPos[0] - boids[target][0];
        let spareY = currPos[1] - boids[target][1];
        let distSquared = spareX * spareX + spareY * spareY;

        if (distSquared < sepDist) {
          sforceX += spareX;
          sforceY += spareY;
        } else {
          if (distSquared < cohDist) {
            cforceX += spareX;
            cforceY += spareY;
          }
          if (distSquared < aliDist) {
            aforceX += boids[target][SPEEDX];
            aforceY += boids[target][SPEEDY];
          }
        }
      }

      // Separation
      length = hypot(sforceX, sforceY);
      boids[current][ACCELERATIONX] += (sepForce * sforceX) / length || 0;
      boids[current][ACCELERATIONY] += (sepForce * sforceY) / length || 0;
      // Cohesion
      length = hypot(cforceX, cforceY);
      boids[current][ACCELERATIONX] -= (cohForce * cforceX) / length || 0;
      boids[current][ACCELERATIONY] -= (cohForce * cforceY) / length || 0;
      // Alignment
      length = hypot(aforceX, aforceY);
      boids[current][ACCELERATIONX] -= (aliForce * aforceX) / length || 0;
      boids[current][ACCELERATIONY] -= (aliForce * aforceY) / length || 0;
    }
    current = size;

    // Apply speed/acceleration for
    // this tick
    while (current--) {
      if (accelerationLimit) {
        let distSquared =
          boids[current][ACCELERATIONX] * boids[current][ACCELERATIONX] +
          boids[current][ACCELERATIONY] * boids[current][ACCELERATIONY];
        if (distSquared > accelerationLimit) {
          let ratio =
            accelerationLimitRoot /
            hypot(boids[current][ACCELERATIONX], boids[current][ACCELERATIONY]);
          boids[current][ACCELERATIONX] *= ratio;
          boids[current][ACCELERATIONY] *= ratio;
        }
      }

      boids[current][SPEEDX] += boids[current][ACCELERATIONX];
      boids[current][SPEEDY] += boids[current][ACCELERATIONY];

      if (speedLimit) {
        let distSquared =
          boids[current][SPEEDX] * boids[current][SPEEDX] +
          boids[current][SPEEDY] * boids[current][SPEEDY];
        if (distSquared > speedLimit) {
          let ratio =
            speedLimitRoot /
            hypot(boids[current][SPEEDX], boids[current][SPEEDY]);
          boids[current][SPEEDX] *= ratio;
          boids[current][SPEEDY] *= ratio;
        }
      }

      boids[current][POSITIONX] += boids[current][SPEEDX];
      boids[current][POSITIONY] += boids[current][SPEEDY];
    }

    this.dispatchEvent(new CustomEvent("tick", { detail: boids }));
  }
}


// double-dog-leg hypothenuse approximation
// http://forums.parallax.com/discussion/147522/dog-leg-hypotenuse-approximation
function hypot(a: number, b: number) {
  a = Math.abs(a);
  b = Math.abs(b);
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return (
    hi +
    (3 * lo) / 32 +
    Math.max(0, 2 * lo - hi) / 8 +
    Math.max(0, 4 * lo - hi) / 16
  );
}
