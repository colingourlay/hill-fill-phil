const { unit, names } = require('../../constants');
const { font } = require('../../utils');

class MenuState {
  create() {
    const { UP, DOWN, ENTER, SPACEBAR, ESC } = Phaser.Keyboard;

    this.handleDirectoryChoice = this.handleDirectoryChoice.bind(this);
    this.performAction = this.performAction.bind(this);

    this.game.stage.backgroundColor = '#000';

    this.titleText = this.createText('Hill Fill', this.world.height / 4, 4);
    this.playerNameText = this.createText('Phil', this.world.height / 4 + unit * 2, 4);
    this.startText = this.createText('Start', (this.world.height / 4) * 3);
    this.exitText = this.createText('Exit', (this.world.height / 4) * 3 + unit);

    this.playerName = '';
    this.items = [
      {
        key: 'start',
        text: this.startText
      },
      {
        key: 'exit',
        text: this.exitText
      }
    ];
    this.activeIndex = 0;

    this.input.keyboard.addKeyCapture([UP, DOWN, ENTER, SPACEBAR, ESC]);
    this.onKeyDown(UP, () => this.cycleActiveItem(true));
    this.onKeyDown(DOWN, () => this.cycleActiveItem());
    this.onKeyDown(ENTER, this.performAction);
    this.onKeyDown(SPACEBAR, this.performAction);
    this.onKeyDown(ESC, window.close);

    this.nameChangeInterval = setInterval(() => {
      this.playerName = names[Math.round(Math.random() * (names.length - 1))];
      this.playerNameText.text = `Phil${this.playerName}`.toUpperCase();
    }, 1000);

    this.highlightActiveItem();

    window.picker.addEventListener('change', this.handleDirectoryChoice, false);
  }

  shutdown() {
    clearInterval(this.nameChangeInterval);
    window.picker.removeEventListener('change', this.handleDirectoryChoice);
  }

  createText(chars, y, fontSizeIndex) {
    const text = this.add.text(this.world.width / 2, y, chars.toUpperCase(), {
      font: font(fontSizeIndex),
      fill: '#fff',
      stroke: '#ff0',
      strokeThickness: 0
    });

    text.autoRound = false;
    text.smoothed = false;
    text.anchor.set(0.5);

    return text;
  }

  highlightActiveItem() {
    this.items.forEach((item, index) => {
      if (index === this.activeIndex) {
        item.text.fill = '#000';
        item.text.strokeThickness = 3;
      } else {
        item.text.fill = '#fff';
        item.text.strokeThickness = 0;
      }
    });
  }

  onKeyDown(key, handler) {
    this.input.keyboard.addKey(key).onDown.add(handler);
  }

  cycleActiveItem(isBackwards) {
    this.activeIndex = Math.min(Math.max(0, this.activeIndex + 1 * (isBackwards ? -1 : 1)), this.items.length - 1);
    this.highlightActiveItem();
  }

  performAction() {
    const action = this.items[this.activeIndex].key;

    if (action === 'exit') {
      window.close();
    } else if (action === 'start') {
      clearInterval(this.nameChangeInterval);
      this.game.playerName = this.playerName;
      window.picker.click();
    }
  }

  handleDirectoryChoice({ target }) {
    this.game.directoryToMeasure = target.files[0].path;
    this.state.start('hill');
  }
}

module.exports = MenuState;
