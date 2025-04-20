// utils/constants.js
export const getSpecialTile = (row, col) => {
  const tripleWord = [
    [0, 0], [0, 7], [0, 14], [7, 0], [7, 14], [14, 0], [14, 7], [14, 14]
  ];
  const doubleWord = [
    [1, 1], [2, 2], [3, 3], [4, 4], [1, 13], [2, 12], [3, 11], [4, 10],
    [10, 4], [11, 3], [12, 2], [13, 1], [10, 10], [11, 11], [12, 12], [13, 13]
  ];
  const tripleLetter = [
    [1, 5], [1, 9], [5, 1], [5, 5], [5, 9], [5, 13], [9, 1], [9, 5], [9, 9], [9, 13], [13, 5], [13, 9]
  ];
  const doubleLetter = [
    [0, 3], [0, 11], [2, 6], [2, 8], [3, 0], [3, 7], [3, 14], [6, 2], [6, 6], [6, 8], [6, 12],
    [7, 3], [7, 11], [8, 2], [8, 6], [8, 8], [8, 12], [11, 0], [11, 7], [11, 14], [12, 6], [12, 8], [14, 3], [14, 11]
  ];

  if (tripleWord.some(pos => pos[0] === row && pos[1] === col))
    return { class: 'triple-word bg-orange-600 text-white', text: 'Triple Word' };
  if (doubleWord.some(pos => pos[0] === row && pos[1] === col))
    return { class: 'double-word bg-pink-300', text: 'Double Word' };
  if (tripleLetter.some(pos => pos[0] === row && pos[1] === col))
    return { class: 'triple-letter bg-blue-600', text: 'Triple Letter' };
  if (doubleLetter.some(pos => pos[0] === row && pos[1] === col))
    return { class: 'double-letter bg-blue-300', text: 'Double Letter' };
  return null;
};