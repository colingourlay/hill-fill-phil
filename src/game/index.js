const { width, height } = require('../constants');

const game = new Phaser.Game(width, height, Phaser.AUTO, 'game');

game.state.add('loading', require('./states/Loading'));
game.state.add('menu', require('./states/Menu'));
game.state.add('guide', require('./states/Guide'));
game.state.add('hill', require('./states/Hill'));

game.state.start('loading');
