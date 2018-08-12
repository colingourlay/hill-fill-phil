const { unit } = require('../../../constants');
const { font } = require('../../../utils');

class DialogState {
  create() {
    const { UP, DOWN, ENTER, SPACEBAR, ESC } = Phaser.Keyboard;

    this.game.stage.backgroundColor = '#000';

    this.activeActionIndex = 0;

    [...this.actions].reverse().forEach((action, index) => {
      action.text = this.add.text(this.world.width / 2, this.world.height - unit - unit * index, action.label, {
        font: font(2),
        fill: '#fff',
        stroke: '#ff0',
        strokeThickness: 0
      });

      action.text.autoRound = false;
      action.text.smoothed = false;
      action.text.anchor.set(0.5);
    });

    this.input.keyboard.addKeyCapture([UP, DOWN, ENTER, SPACEBAR, ESC]);
    this.onKeyDown(UP, () => this.updateActiveAction(true));
    this.onKeyDown(DOWN, () => this.updateActiveAction());
    this.onKeyDown(ENTER, () => this.performActiveAction());
    this.onKeyDown(SPACEBAR, () => this.performActiveAction());
    this.onKeyDown(ESC, window.close);

    this.highlightActiveAction();
  }

  onKeyDown(key, handler) {
    this.input.keyboard.addKey(key).onDown.add(handler);
  }

  updateActiveAction(isBackwards) {
    this.activeActionIndex = Math.min(
      Math.max(0, this.activeActionIndex + 1 * (isBackwards ? -1 : 1)),
      this.actions.length - 1
    );
    this.highlightActiveAction();
  }

  highlightActiveAction() {
    this.actions.forEach((action, index) => {
      if (index === this.activeActionIndex) {
        action.text.fill = '#000';
        action.text.strokeThickness = 3;
      } else {
        action.text.fill = '#fff';
        action.text.strokeThickness = 0;
      }
    });
  }

  performActiveAction() {
    const action = this.actions[this.activeActionIndex];

    if (action.state) {
      this.game.state.start(state);
    } else if (action.method) {
      this[action.method]();
    }
  }
}

module.exports = DialogState;
