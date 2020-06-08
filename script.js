'use strict';

const initialSeed = Math.random() * 999999 << 0;

function randomSeedParkMiller(seed = 123456) {
  seed = seed % 2147483647;
  return () => {
    seed = seed * 16807 % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

console.log(initialSeed);

const random = randomSeedParkMiller(initialSeed);
const chunk = (arr, size) => Array.from({length: Math.ceil(arr.length / size)}, (v, i) => arr.slice(i * size, i * size + size));

const themes = {
  rocky: ['#7e949c', '#cad7db', '#333'],
  desert: ['#ab9457', '#ccb372', '#333'],
  jungle: ['#405438', '#587d48', '#222'],
  icy: ['#4c7b8c', '#91c7db', '#333']
};

const backgrounds = [
  ['#4a4969', '0%', '#7072ab', '50%', '#cd82a0', '100%'],
  ['#757abf', '0%', '#8583be', '60%', '#eab0d1', '100%'],
  ['#82addb', '0%', '#ebb2b1', '100%'],
  ['#94c5f8', '1%', '#a6e6ff', '70%', '#b1b5ea', '100%'],
  ['#1e528e', '0%', '#265889', '50%', '#9da671', '100%'],
  ['#1e528e', '0%', '#728a7c', '50%', '#e9ce5d', '100%'],
  ['#154277', '0%', '#576e71', '30%', '#e1c45e', '70%', '#b26339', '100%'],
  ['#163c52', '0%', '#4f4f47', '30%', '#c5752d', '60%', '#b7490f', '80%', '#2f1107', '100%']
];

function getRandomInt(max) {
  return Math.floor(random() * max);
}

class LogoBuilder {

  /**
   * LogoBuilder Constructor
   */
  constructor() {
    this.mountains = [];
    this.highlights = [];
    this.text = [];
    this.theme = themes["rocky"];
  }

  /**
   * Make Highlights
   * @param highlightMove
   * @param leftPosition
   */
  drawHighlight(highlightMove, leftPosition) {
    let noise = random() <= 0.33 ? 'l -10 0 l -8 -10 l -0.5 -5' : '';

    leftPosition = random() <= 0.5 ?
      leftPosition - getRandomInt(40 - 30) + 30 :
      leftPosition + getRandomInt(20 - 10) + 10;

    this.highlights.push({
      d: `M 0 100 v -10 ${highlightMove} L ${leftPosition} 100 ${noise} z`,
      fill: '#ccb372',
      'fill-rule': 'evenodd'
    });
  }

  /**
   * Build Mountain Shapes
   * @param peaks
   * @param distance
   */
  buildShapes(peaks, distance) {
    let d = [];
    for (const [i, peak] of peaks.entries()) {
      const up = peak[0];
      const down = peak[1];
      const highlightMove = [];
      let leftPosition = 0;

      if (i > 0) {
        for (var index = 0; index < i; index++) {
          let prevUp = peaks[index][0];
          let prevDown = peaks[index][1];
          highlightMove.push('m', ...prevUp, 'm', ...prevDown);
          leftPosition += prevUp[0] + prevDown[0];
        }
        highlightMove.push('m', ...up, 'l', ...down);
        leftPosition += up[0] + down[0];
      } else {
        highlightMove.push('m', ...up, 'l', ...down);
        leftPosition += up[0] + down[0];
      }

      d.push('l', ...up, 'l', ...down);
      this.drawHighlight(highlightMove.join(' '), leftPosition);
    }

    this.mountains.push({
      d: `M 0 100 v ${distance * -1} ${d.join(' ')} V 100 z`
    });
  }

  generateRandomSeperation(number, parts, min) {
    var randombit = number - min * parts;
    var out = [];

    for (var i = 0; i < parts; i++) {
      out.push(random());
    }

    var mult = randombit / out.reduce(function (a, b) {
      return a + b;
    });

    return out.map(function (el) {
      return el * mult + min;
    });
  }

  /**
   * Setup World
   */
  buildWorld() {
    var keys = Object.keys(themes);
    let theTheme = themes[keys[keys.length * random() << 0]];
    let timeOfDay = backgrounds[backgrounds.length * random() << 0];
    timeOfDay = random() <= 0.5 ? backgrounds[3] : timeOfDay;

    this.theme = theTheme;
    this.background = chunk(timeOfDay, 2).map(([color, offset]) => `<stop stop-color="${color}" offset="${offset}" />`);
  }

  /**
   * Build Mountain
   * @returns {((*|number)[]|(*)[])[][]}
   */
  buildMountain() {
    const peaksCount = getRandomInt(6) + 2;
    const seperations = this.generateRandomSeperation(100, peaksCount * 2, 10);
    const chunkedSeps = chunk(seperations, 2);

    return new Array(peaksCount).fill([]).map((val, i) => {
      let peakHeight = getRandomInt(40 - 35) + 35;
      let peakDrop = getRandomInt(peakHeight);
      let midPoint = Math.floor(peaksCount / 2);
      let amp = peaksCount < 6 ? 0.15 : 0.05;
      let f = random() <= 5 ? 1.75 : 2.5;
      f = random() <= 5 ? f : 2;

      if (i < peaksCount / 3) {
        peakHeight = peakHeight / f;
        peakDrop = peakDrop * 0.04;
      } else if (i > peaksCount / 3) {
        peakHeight = peakHeight * amp;
      }

      if (i === midPoint) {
        peakHeight = getRandomInt(15 - 8) + 8;
      }

      return [
        [chunkedSeps[i][0], peakHeight * -1],
        [chunkedSeps[i][1], peakDrop]
      ];
    });
  }

  /**
   * Build Text
   */
  buildText() {
    this.text.push(
      `<text x="5" y="70" font-size="20" style="font-family: 'Roboto';">WESTERN</text>`,
      `<text x="15" y="90" font-size="20" font-weight="bold" style="font-family: 'Roboto';">SIBERIA</text>`
    );
  }

  /**
   * Build Logo
   */
  build() {
    const peaks = this.buildMountain();
    this.buildShapes(peaks, 10);
    this.buildText();
    this.buildWorld();
  }

  /**
   * Convert To SVG
   * @param width
   * @param height
   * @returns {string}
   */
  toSVG(width = 512, height) {
    const toAttribs = (item) => Object.entries(item).map(([name, value]) => `${name}="${value}"`).join(' ');
    const [mountainFill, highlightFill, textFill] = this.theme;

    return `<svg xmlns='http://www.w3.org/2000/svg' width="${width}" height="${height}" viewbox="0 0 100 100">
<defs>
    <style type="text/css">@import url('https://fonts.googleapis.com/css?family=Roboto:400,100,300,500,700,900');</style>
    <linearGradient id="background" x1="0" x2="0" y1="0" y2="1">
      ${this.background.join('\n')}
    </linearGradient>
</defs>
<rect x="0" y="0" width="100" height="100" fill="url(#background)"/>
<g fill="${mountainFill}">${this.mountains.map(it => `<path ${toAttribs(it)}></path>`)}</g>
<g fill="${highlightFill}">${this.highlights.map(it => `<path ${toAttribs(it)}></path>`)}</g>
<g fill="${textFill}">${this.text}</g>
</svg>`;
  }
}

window.onload = () => {
  const builder = new LogoBuilder();
  builder.build();
  document.getElementById('img_512x512').innerHTML = builder.toSVG(512, 512);
  document.getElementById('img_256x256').innerHTML = builder.toSVG(256, 256);
  document.getElementById('img_128x128').innerHTML = builder.toSVG(128, 128);
};

