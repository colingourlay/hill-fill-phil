const { ipcRenderer } = require('electron');
const { unit, unitsWide, unitsHigh } = require('../../constants');
const { fileSize, font } = require('../../utils');

const CHALLENGE_TYPES = {
  PLAIN: 0,
  CHASM: 1,
  RISER: 2
};

const NUM_CHALLENGE_TYPES = Object.keys(CHALLENGE_TYPES).length;

const INITIAL_CHALLENGE_TYPES = [
  CHALLENGE_TYPES.PLAIN,
  CHALLENGE_TYPES.PLAIN,
  CHALLENGE_TYPES.PLAIN,
  CHALLENGE_TYPES.CHASM,
  CHALLENGE_TYPES.PLAIN,
  CHALLENGE_TYPES.PLAIN,
  CHALLENGE_TYPES.RISER,
  CHALLENGE_TYPES.PLAIN,
  CHALLENGE_TYPES.PLAIN,
  CHALLENGE_TYPES.CHASM,
  CHALLENGE_TYPES.PLAIN,
  CHALLENGE_TYPES.PLAIN,
  CHALLENGE_TYPES.RISER
];

const createChallenge = (previousChallenge, predefinedType) => {
  const type =
    predefinedType ||
    (previousChallenge && previousChallenge.type === CHALLENGE_TYPES.PLAIN
      ? Math.floor(Math.random() * NUM_CHALLENGE_TYPES)
      : CHALLENGE_TYPES.PLAIN);
  const index = previousChallenge ? previousChallenge.index + 1 : 0;
  const altitude = (previousChallenge || { altitude: 0 }).altitude + (type === CHALLENGE_TYPES.RISER ? 1 : 0);

  return {
    type,
    index,
    altitude
  };
};

const getTargetSizeForLevel = level => Math.exp(level);

const getWaterLevelForSize = size => (size ? Math.round(Math.log(size)) : 0) - 1;

class HillState {
  init() {
    window.picker.value = null;
  }

  create() {
    const { UP, DOWN, LEFT, RIGHT, ESC } = Phaser.Keyboard;

    this.requestMeasurement = this.requestMeasurement.bind(this);
    this.handleMeasurement = this.handleMeasurement.bind(this);
    this.attemptToMoveUp = this.attemptToMoveUp.bind(this);
    this.attemptToMoveDown = this.attemptToMoveDown.bind(this);
    this.attemptToMoveLeft = this.attemptToMoveLeft.bind(this);
    this.attemptToMoveRight = this.attemptToMoveRight.bind(this);

    // debug
    if (!this.game.directoryToMeasure) {
      this.game.directoryToMeasure = 'C:\\Users\\colin\\code\\hill-fill-phil\\measured';
    }

    this.game.stage.backgroundColor = '#0ff';

    this.challenges = [];
    INITIAL_CHALLENGE_TYPES.forEach(type => {
      this.challenges.push(createChallenge(this.challenges[this.challenges.length - 1], type));
    });
    console.log(this.challenges);

    this.isPlaying = true;
    this.distance = 0;
    this.level = 0;
    this.targetSize = getTargetSizeForLevel(this.level);
    this.size = 0;
    this.waterLevel = getWaterLevelForSize(this.size);

    this.sizeIcon = this.add.text(unit / 2, (unit / 2) * 3, '📁', {
      font: font(3),
      fill: '#000',
      strokeThickness: 0
    });
    this.sizeIcon.autoRound = false;
    this.sizeIcon.smoothed = false;
    this.sizeIcon.anchor.set(0, 0.5);

    this.sizeText = this.add.text(unit * 3, (unit / 2) * 3, '', {
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

    this.targetSizeText = this.add.text(this.world.width - unit * 3, (unit / 2) * 3, '', {
      font: font(2),
      fill: '#000',
      strokeThickness: 0
    });
    this.targetSizeText.autoRound = false;
    this.targetSizeText.smoothed = false;
    this.targetSizeText.anchor.set(1, 0.5);

    this.input.keyboard.addKeyCapture([UP, DOWN, LEFT, RIGHT, ESC]);
    this.input.keyboard.addKey(ESC).onDown.add(window.close);
    this.input.keyboard.addKey(UP).onDown.add(this.attemptToMoveUp);
    this.input.keyboard.addKey(DOWN).onDown.add(this.attemptToMoveDown);
    this.input.keyboard.addKey(LEFT).onDown.add(this.attemptToMoveLeft);
    this.input.keyboard.addKey(RIGHT).onDown.add(this.attemptToMoveRight);

    ipcRenderer.on('measurement', this.handleMeasurement);
    this.requestMeasurement();
  }

  update() {
    // This waits for rAF, so is not useful when the window is unfocused.
    // We're only repainting on folder size change and movement keys,
    // so it's probably safe to manually call this._update() instead.
  }

  _update() {
    this.sizeText.text = fileSize(this.size);
    this.targetSizeText.text = fileSize(this.targetSize);

    // this.console.log(this.distance, this.level, this.waterLevel, this.hasDrowned);

    if (this.hasDrowned) {
      this.game.paused = true;
      return console.log('drowned');
    }

    const currentChallenge = this.challenges[this.distance];

    const challengesToDraw = [...new Array(unitsWide)].map((x, index) => {
      const challengeIndex = index - Math.floor(unitsWide / 2) + this.distance;

      return this.challenges[challengeIndex] || { type: CHALLENGE_TYPES.PLAIN, index: null, altitude: 0 };
    });

    console.log(currentChallenge);
    console.table(challengesToDraw);
  }

  shutdown() {
    ipcRenderer.removeAllListeners('measurement');
    clearTimeout(this.nextMeasurement);
  }

  requestMeasurement() {
    ipcRenderer.send('measure', this.game.directoryToMeasure);
  }

  handleMeasurement(_, size) {
    if (size !== this.size) {
      this.size = size;
      this.waterLevel = getWaterLevelForSize(this.size);
      this.hasDrowned = this.waterLevel >= this.level;
      this._update();
    }

    if (!this.hasDrowned) {
      this.nextMeasurement = setTimeout(this.requestMeasurement, 100);
    }
  }

  attemptToMoveUp() {
    this.level++;
    this.targetSize = getTargetSizeForLevel(this.level);
    this._update();
  }

  attemptToMoveDown() {
    if (this.level - 1 === this.waterLevel) {
      return;
    }

    this.level--;
    this.targetSize = getTargetSizeForLevel(this.level);
    this._update();
  }

  attemptToMoveLeft() {
    if (this.distance - 1 < 0) {
      return;
    }

    this.distance--;
    this._update();
  }

  attemptToMoveRight() {
    this.distance++;

    if (this.challenges.length < this.distance + Math.ceil(unitsWide / 2)) {
      this.challenges.push(createChallenge(this.challenges[this.challenges.length - 1]));
    }

    this._update();
  }
}

module.exports = HillState;
