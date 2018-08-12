const unit = 16;
const unitsWide = 15;
const unitsHigh = 15;

module.exports = {
  unit,
  unitsWide,
  unitsHigh,
  width: unit * unitsWide,
  height: unit * unitsHigh,
  scaleFactor: 2,
  fontFamily: 'monospace',
  fontSizes: [Math.round(unit / 2), Math.round((unit / 3) * 2), unit, Math.round((unit / 2) * 3), unit * 2],
  fontWeight: 'bold',
  names: [
    '',
    'ander',
    'andros',
    'antha',
    'art',
    'berta',
    'émon',
    'etus',
    'ine',
    'ip',
    'ippa',
    'ippina',
    'ise',
    'o',
    'omela',
    'omena',
    'omenes',
    'omenos',
    'opoimen',
    'othea',
    'yra'
  ]
};
