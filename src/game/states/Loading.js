const { scaleFactor } = require('../../constants');

class LoadingState {
  preload() {
    this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    this.game.scale.setUserScale(scaleFactor, scaleFactor);
    this.game.renderer.renderSession.roundPixels = true;

    Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

    this.load.spritesheet('hill', 'game/assets/hill.png', 16, 16, 7);
  }

  create() {
    this.game.state.start('menu');
  }
}

module.exports = LoadingState;
