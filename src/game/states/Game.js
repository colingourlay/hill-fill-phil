const { ipcRenderer } = require('electron');
const { fontSizes } = require('../../constants');
const { fileSize, font } = require('../../utils');

class GameState {
  init() {
    window.picker.value = null;
  }

  create() {
    const { ESC } = Phaser.Keyboard;

    this.requestMeasurement = this.requestMeasurement.bind(this);
    this.handleMeasurement = this.handleMeasurement.bind(this);

    this.size = 0;
    this.targetSize = 1024 * 100;

    this.sizeText = this.add.text(this.world.width / 2, this.world.height / 2 - fontSizes[4], '...', {
      font: font(4),
      fill: '#000',
      stroke: '#fff',
      strokeThickness: 2
    });
    this.sizeText.autoRound = false;
    this.sizeText.smoothed = false;
    this.sizeText.anchor.set(0.5);

    this.targetSizeText = this.add.text(
      this.world.width / 2,
      this.world.height / 2 + fontSizes[3],
      `/ ${fileSize(this.targetSize)}`,
      {
        font: font(3),
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 0
      }
    );
    this.targetSizeText.autoRound = false;
    this.targetSizeText.smoothed = false;
    this.targetSizeText.anchor.set(0.5);

    this.input.keyboard.addKeyCapture([ESC]);
    this.input.keyboard.addKey(ESC).onDown.add(window.close);

    ipcRenderer.on('measurement', this.handleMeasurement);
    this.requestMeasurement();
  }

  update() {
    if (this.size >= this.targetSize) {
      setTimeout(() => {
        this.state.start('menu');
      }, 2000);
    }
  }

  shutdown() {
    ipcRenderer.removeAllListeners('measurement');
    clearTimeout(this.nextMeasurement);
  }

  requestMeasurement() {
    ipcRenderer.send('measure', this.game.directoryToMeasure);
  }

  handleMeasurement(_, size) {
    this.size = size;
    this.sizeText.text = fileSize(this.size);

    if (this.size >= this.targetSize) {
      this.targetSizeText.text = '👏';
    }

    this.nextMeasurement = setTimeout(this.requestMeasurement, 100);
  }
}

module.exports = GameState;
