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

const ADVANCE_INTERVAL = 500;

const getChallengeTiles = (challenge, isCurrentChallenge, level, waterLevel, isRising) => {
  const midIndex = Math.floor(unitsHigh / 2);
  const risingOffset = isRising ? 1 : 0;
  const levelOffset = midIndex - challenge.altitude + level - risingOffset;
  const waterLevelOffset = levelOffset + (challenge.altitude - waterLevel);

  const tiles = [...new Array(unitsHigh)].map((x, index) => {
    let tile = ' ';

    switch (challenge.type) {
      case CHALLENGE_TYPES.PLAIN:
        tile =
          index === levelOffset + 1
            ? '='
            : +index > levelOffset
              ? '#'
              : index > waterLevelOffset
                ? '-'
                : index === waterLevelOffset
                  ? '0'
                  : ' ';
        break;
      case CHALLENGE_TYPES.CHASM:
        tile = index === waterLevelOffset ? '8' : index > waterLevelOffset ? '-' : ' ';
        break;
      case CHALLENGE_TYPES.RISER:
        tile =
          index === levelOffset + 2
            ? '='
            : index > levelOffset + 1
              ? '#'
              : index > levelOffset
                ? '^'
                : index > waterLevelOffset
                  ? '-'
                  : index === waterLevelOffset
                    ? '0'
                    : ' ';
        break;
      default:
        break;
    }

    return tile;
  });

  return tiles;
};

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
    const { ESC } = Phaser.Keyboard;

    this.requestMeasurement = this.requestMeasurement.bind(this);
    this.handleMeasurement = this.handleMeasurement.bind(this);
    this.attemptToAdvance = this.attemptToAdvance.bind(this);

    // debug
    if (!this.game.directoryToMeasure) {
      this.game.directoryToMeasure = 'C:\\Users\\colin\\code\\hill-fill-phil\\measured';
    }

    this.game.stage.backgroundColor = '#699';

    this.challenges = [];
    INITIAL_CHALLENGE_TYPES.forEach(type => {
      this.challenges.push(createChallenge(this.challenges[this.challenges.length - 1], type));
    });

    this.cells = [];

    for (let y = 0; y < unitsWide; y++) {
      for (let x = 0; x < unitsHigh; x++) {
        const cell = this.add.sprite(x * unit, y * unit, 'hill');

        cell.animations.add('=', [0]);
        cell.animations.add('#', [1]);
        cell.animations.add('-', [2]);
        cell.animations.add('0', [3]);
        cell.animations.add('8', [4]);
        cell.animations.add('^', [5]);
        cell.animations.add(' ', [6]);

        this.cells.push(cell);
      }
    }

    this.isPlaying = true;
    this.distance = 0;
    this.level = 0;
    this.targetSize = getTargetSizeForLevel(this.level);
    this.size = 0;
    this.waterLevel = getWaterLevelForSize(this.size);

    this.sizeIcon = this.add.text(unit / 2, (unit / 2) * 3, '📁', {
      font: font(2),
      fill: '#000',
      strokeThickness: 0
    });
    this.sizeIcon.autoRound = false;
    this.sizeIcon.smoothed = false;
    this.sizeIcon.anchor.set(0, 0.5);

    this.sizeText = this.add.text((unit * 5) / 2, (unit / 2) * 3, '', {
      font: font(2),
      fill: '#000',
      strokeThickness: 0
    });
    this.sizeText.autoRound = false;
    this.sizeText.smoothed = false;
    this.sizeText.anchor.set(0, 0.5);

    this.targetSizeIcon = this.add.text(this.world.width - unit / 2, (unit / 2) * 3, '🎯', {
      font: font(2),
      fill: '#000',
      strokeThickness: 0
    });
    this.targetSizeIcon.autoRound = false;
    this.targetSizeIcon.smoothed = false;
    this.targetSizeIcon.anchor.set(1, 0.5);

    this.targetSizeText = this.add.text(this.world.width - (unit * 5) / 2, (unit / 2) * 3, '', {
      font: font(2),
      fill: '#000',
      strokeThickness: 0
    });
    this.targetSizeText.autoRound = false;
    this.targetSizeText.smoothed = false;
    this.targetSizeText.anchor.set(1, 0.5);

    this.phil = this.add.text(this.world.width / 2, this.world.height / 2, '👤', {
      font: font(2),
      fill: '#000',
      strokeThickness: 0
    });
    this.phil.autoRound = false;
    this.phil.smoothed = false;
    this.phil.anchor.set(0.5);

    this.input.keyboard.addKeyCapture([ESC]);
    this.input.keyboard.addKey(ESC).onDown.add(window.close);

    ipcRenderer.on('measurement', this.handleMeasurement);
    this.requestMeasurement();

    this.nextAdvancmentAttempt = setInterval(this.attemptToAdvance, ADVANCE_INTERVAL);
    this.attemptToAdvance();
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

    const tiles = challengesToDraw.reduce(
      (memo, challenge) =>
        memo.concat(
          getChallengeTiles(challenge, challenge === currentChallenge, this.level, this.waterLevel, this.isRising)
        ),
      []
    );

    let map = '';
    const cellAnimationNames = [];

    for (let y = 0; y < unitsWide; y++) {
      for (let x = 0; x < unitsHigh; x++) {
        map += String(tiles[x * unitsHigh + y]);
        this.cells[x + y * unitsHigh].animations.play(tiles[x * unitsHigh + y]);
      }
      map += '\n';
    }

    // console.log(map);
  }

  shutdown() {
    ipcRenderer.removeAllListeners('measurement');
    clearTimeout(this.nextMeasurement);
    clearInterval(this.nextAdvancmentAttempt);
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

  attemptToAdvance() {
    const nextChallenge = this.challenges[this.distance + 1];

    if (nextChallenge.type === CHALLENGE_TYPES.CHASM && this.level !== this.waterLevel + 1) {
      return;
    }

    this.distance++;

    if (nextChallenge.type === CHALLENGE_TYPES.RISER) {
      this.isRising = true;
      this.level++;
      this.targetSize = getTargetSizeForLevel(this.level);

      setTimeout(() => {
        this.isRising = false;
        this._update();
      }, ADVANCE_INTERVAL / 2);
    }

    if (this.challenges.length < this.distance + Math.ceil(unitsWide / 2)) {
      this.challenges.push(createChallenge(this.challenges[this.challenges.length - 1]));
    }

    this._update();
  }
}

module.exports = HillState;
