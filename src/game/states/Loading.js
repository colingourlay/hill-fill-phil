class LoadingState {
  preload() {
    this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    this.game.renderer.renderSession.roundPixels = true;
    Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
  }

  create() {
    this.game.state.start('menu');
  }
}

module.exports = LoadingState;
