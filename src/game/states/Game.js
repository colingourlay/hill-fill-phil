const { ipcRenderer } = require('electron');
const humanFormat = require('human-format');

const scale = new humanFormat.Scale({
  b: 1,
  k: 1024,
  M: 1024 * 1024,
  G: 1024 * 1024 * 1024,
  T: 1024 * 1024 * 1024 * 1024
});

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

    this.sizeText = this.add.text(this.world.width / 2, this.world.height / 2 - 20, '...', {
      font: '48px Arial',
      fill: '#000',
      stroke: '#fff',
      strokeThickness: 4
    });
    this.sizeText.autoRound = false;
    this.sizeText.smoothed = false;
    this.sizeText.anchor.set(0.5);

    this.targetSizeText = this.add.text(
      this.world.width / 2,
      this.world.height / 2 + 40,
      `/ ${humanFormat(this.targetSize, { scale })}`,
      {
        font: '24px Arial',
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
      ipcRenderer.removeAllListeners('measurement');
      clearTimeout(this.nextMeasurement);
      this.targetSizeText.text = '👏';

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

  handleMeasurement(event, size) {
    this.size = size;
    this.sizeText.text = humanFormat(this.size, { scale });
    this.nextMeasurement = setTimeout(this.requestMeasurement, 100);
  }
}

module.exports = GameState;
