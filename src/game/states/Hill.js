const { ipcRenderer } = require('electron');
const { unit, unitsWide, unitsHigh } = require('../../constants');
const { fileSize, font } = require('../../utils');

const CHALLENGE_TYPES = {
  NONE: 0,
  CHASM: 1,
  RISER: 2
};

const STARTING_MAP = [CHALLENGE_TYPES.NONE, CHALLENGE_TYPES.NONE, CHALLENGE_TYPES.CHASM, CHALLENGE_TYPES.RISER];

const getTargetSizeForLevel = level => Math.exp(level);

class HillState {
  init() {
    window.picker.value = null;
  }

  create() {
    const { ESC } = Phaser.Keyboard;

    this.requestMeasurement = this.requestMeasurement.bind(this);
    this.handleMeasurement = this.handleMeasurement.bind(this);

    // debug
    if (!this.game.directoryToMeasure) {
      this.game.directoryToMeasure = 'C:\\Users\\colin\\code\\hill-fill-phil\\measured';
    }

    this.game.stage.backgroundColor = '#0ff';

    this.level = 0;
    this.size = 0;
    this.targetSize = getTargetSizeForLevel(this.level);

    this.sizeIcon = this.add.text(unit / 2, (unit / 2) * 3, '📁', {
      font: font(3),
      fill: '#000',
      strokeThickness: 0
    });
    this.sizeIcon.autoRound = false;
    this.sizeIcon.smoothed = false;
    this.sizeIcon.anchor.set(0, 0.5);

    this.sizeText = this.add.text(unit * 3, (unit / 2) * 3, '?', {
      font: font(2),
      fill: '#000',
      strokeThickness: 0
    });
    this.sizeText.autoRound = false;
    this.sizeText.smoothed = false;
    this.sizeText.anchor.set(0, 0.5);

    this.targetSizeIcon = this.add.text(this.world.width - unit / 2, (unit / 2) * 3, '🎯', {
      font: font(3),
      fill: '#000',
      strokeThickness: 0
    });
    this.targetSizeIcon.autoRound = false;
    this.targetSizeIcon.smoothed = false;
    this.targetSizeIcon.anchor.set(1, 0.5);

    this.targetSizeText = this.add.text(this.world.width - unit * 3, (unit / 2) * 3, fileSize(this.targetSize), {
      font: font(2),
      fill: '#000',
      strokeThickness: 0
    });
    this.targetSizeText.autoRound = false;
    this.targetSizeText.smoothed = false;
    this.targetSizeText.anchor.set(1, 0.5);

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
    this.nextMeasurement = setTimeout(this.requestMeasurement, 100);
  }
}

module.exports = HillState;
