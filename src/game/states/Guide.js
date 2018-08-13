const { unit } = require('../../constants');
const { font } = require('../../utils');
const DialogState = require('./generic/Dialog');

const TITLE = 'How to play';
const PAGES = [
  [
    'In Hill Fill Phil you',
    'control the water',
    'level so you can cross',
    'chasms and progress',
    'upwards.',
    '',
    'The more you fill your',
    'hard drive, the higher',
    'the water will rise.'
  ],
  [
    'When you start the',
    "game, you'll be asked",
    'to choose a folder on',
    'your hard drive.',
    '',
    '⚠ Make sure that you',
    'start the game in an',
    'empty folder! Drowning',
    'is never fun.'
  ],
  [
    'Once the game starts,',
    'Phil will move as far',
    'as they can until they',
    'stop at the edge of a',
    'chasm. To cross a gap',
    'you need to increase',
    'the size of the folder',
    '(📁), so it matches',
    'the target size (🎯).'
  ],
  [
    'The water level will',
    'then rise, raising the',
    'planks up to a level',
    'where you can cross',
    'the gap and continue.',
    'If you over-fill your',
    "folder you'll drown!",
    '',
    'Good luck! 🤞'
  ]
];

class GuideState extends DialogState {
  constructor() {
    super();

    this.actions = [
      {
        label: '...',
        method: 'step'
      }
    ];
  }

  create() {
    super.create();

    this.createText(TITLE, unit, unit, '#0ff');
    this.progress = this.createText('', this.world.width - unit, unit, '#fff');
    this.progress.anchor.set(1, 0);

    this.lines = [...new Array(9)].map((_, index) => this.createText('', unit, unit * 3 + unit * index));

    this.pageIndex = -1;
    this.step();
  }

  step() {
    const nextPage = PAGES[++this.pageIndex];

    if (!nextPage) {
      return this.game.state.start('menu');
    }

    this.progress.text = `${this.pageIndex + 1}/${PAGES.length}`;
    this.lines.forEach((line, index) => (line.text = nextPage[index] || ''));
  }

  createText(chars, x, y, fill) {
    const text = this.add.text(x, y, chars, {
      font: font(2),
      fill: fill || '#fff',
      stroke: '#000',
      strokeThickness: 0
    });

    text.autoRound = false;
    text.smoothed = false;
    text.anchor.set(0);

    return text;
  }
}

module.exports = GuideState;
