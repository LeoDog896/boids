import fps from "fps";
import ticker from "ticker";
import debounce from "debounce";
import Boids from "./src/index";

const attractors: [number, number, number, number][] = [
  [
    Infinity, // x
    Infinity, // y
    150, // dist
    0.25, // spd
  ],
];

const canvas = document.querySelector("canvas")
if (!canvas) throw Error("Canvas not found")
const ctx = canvas.getContext("2d")
if (!ctx) throw Error("Context of " + canvas + "not found.")
const boids = new Boids({
  boids: 150,
  speedLimit: 2,
  accelerationLimit: 0.5,
  attractors,
});

document.body.addEventListener("mousemove", function (e) {
  const halfHeight = canvas.height / 2,
    halfWidth = canvas.width / 2;

  attractors[0][0] = e.x - halfWidth;
  attractors[0][1] = e.y - halfHeight;
});

const resize = debounce(function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}, 100, false);
window.addEventListener("resize", resize)
resize();

ticker(window, 60)
  .on("tick", function () {
    frames.tick();
    boids.tick();
  })
  .on("draw", function () {
    const boidData = boids.boids
    const halfHeight = canvas.height / 2
    const halfWidth = canvas.width / 2;

    ctx.fillStyle = "rgba(255,241,235,0.25)"; // '#FFF1EB'
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#543D5E";
    for (let i = 0, l = boidData.length, x: number, y: number; i < l; i += 1) {
      x = boidData[i][0];
      y = boidData[i][1];
      // wrap around the screen
      boidData[i][0] =
        x > halfWidth ? -halfWidth : -x > halfWidth ? halfWidth : x;
      boidData[i][1] =
        y > halfHeight ? -halfHeight : -y > halfHeight ? halfHeight : y;
      ctx.fillRect(x + halfWidth, y + halfHeight, 2, 2);
    }
  });

const frameText = document.querySelector("[data-fps]");
if (!frameText) throw Error("No [data-fps] element found.")
const countText = document.querySelector("[data-count]");
if (!frameText) throw Error("No [data-count] element found.")
const frames = fps({ every: 10, decay: 0.04 }).on("data", function (rate: number) {
  for (let i = 0; i < 3; i += 1) {
    if (rate <= 56 && boids.boids.length > 10) boids.boids.pop();
    if (rate >= 60 && boids.boids.length < 500)
      boids.boids.push([
        0,
        0,
        Math.random() * 6 - 3,
        Math.random() * 6 - 3,
        0,
        0,
      ]);
  }
  frameText.innerHTML = String(Math.round(rate));
  countText.innerHTML = String(boids.boids.length);
});
