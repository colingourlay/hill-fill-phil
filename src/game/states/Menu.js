const { unit, names } = require('../../constants');
const { font } = require('../../utils');
const DialogState = require('./generic/Dialog');

class MenuState extends DialogState {
  constructor() {
    super();

    this.actions = [
      {
        label: 'START GAME',
        method: 'start'
      },
      {
        label: 'HOW TO PLAY',
        state: 'guide'
      },
      {
        label: 'EXIT',
        method: 'exit'
      }
    ];
  }

  create() {
    super.create();

    this.handleDirectoryChoice = this.handleDirectoryChoice.bind(this);

    this.titleText = this.createText('HILL FILL', this.world.height / 4, 4);
    this.playerNameText = this.createText('PHIL', this.world.height / 4 + unit * 2, 4);

    this.playerName = '';

    this.nameChangeInterval = setInterval(() => {
      this.playerName = names[Math.round(Math.random() * (names.length - 1))];
      this.playerNameText.text = `PHIL${this.playerName.toUpperCase()}`;
    }, 1000);

    window.picker.addEventListener('change', this.handleDirectoryChoice, false);
  }

  shutdown() {
    clearInterval(this.nameChangeInterval);
    window.picker.removeEventListener('change', this.handleDirectoryChoice);
  }

  createText(chars, y, fontSizeIndex) {
    const text = this.add.text(this.world.width / 2, y, chars, {
      font: font(fontSizeIndex),
      fill: '#fff',
      stroke: '#000',
      strokeThickness: 0
    });

    text.autoRound = false;
    text.smoothed = false;
    text.anchor.set(0.5);

    return text;
  }

  start() {
    clearInterval(this.nameChangeInterval);
    this.game.playerName = this.playerName;
    window.picker.click();
  }

  handleDirectoryChoice({ target }) {
    this.game.directoryToMeasure = target.files[0].path;
    this.game.state.start('hill');
  }

  exit() {
    window.close();
  }
}

module.exports = MenuState;
