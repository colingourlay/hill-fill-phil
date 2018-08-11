const { width, height } = require('../constants');

const game = new Phaser.Game(width, height, Phaser.AUTO, 'game');

game.state.add('loading', require('./states/Loading'));
game.state.add('menu', require('./states/Menu'));
game.state.add('game', require('./states/Game'));

game.state.start('loading');
