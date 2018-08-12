const { scaleFactor } = require('../../constants');

class LoadingState {
  preload() {
    this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    this.game.scale.setUserScale(scaleFactor, scaleFactor);
    this.game.renderer.renderSession.roundPixels = true;

    Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

    this.load.spritesheet('hill', 'game/assets/hill.png', 16, 16, 6);
  }

  create() {
    this.game.state.start('menu');
    // debug
    // this.game.state.start('hill');
  }
}

module.exports = LoadingState;
