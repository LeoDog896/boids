import Boids from "./src";

function benchmark() {
  function test(count: number, ticks: number) {
    const b = new Boids({ boids: count })
    let i = ticks;
    const start = +new Date();

    while (i--) b.tick();

    return ticks / ((+new Date() - start) / 1000);
  }

  for (let i = 50; i <= 1000; i += 50) {
    console.log(i + " boids: " + ~~test(i, 5000) + " ticks/sec");
  }
}

benchmark();
