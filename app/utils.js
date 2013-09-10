define(function(){
"use strict";
  
  var Utils = {};

// Chord formulas as indexes in scale formulas
// In integer notation: [0, 2, 4]
Utils.chordFormulas = {
    'Maj': [1, 3, 5],
    'm': [1, 'b3', 5],
    'dim': [1, 'b3', 'b5'],
    'aug': [1, 3, '#5'],
    'sus2': [1, 2, 5],
    'sus4': [1, 4, 5],
    'add4': [1, 3, 4, 5],
    'Maj7': [1, 3, 5, 7],
    'm/Maj7': [1, 'b3', 5, 7],
    'Dominant 7': [1, 3, 5, 'b7'],
    'dim7': [1, 'b3', 'b5', 6],
    '5': [1, 5], // Fifth
    '-5': [1, 'b5'] // flat fifth
}

// C  C# D  D# E  F F# G  G# A  A#  B   C
// 1  2  3  4  5  6 7  8  9  10 11  12  1
// 0  1  2  3  4  5 6  7  8  9  10  11

// 1 b2 2 b3 3 4 b5 5 b6 6 b7 7
// 0 1  2  3 4 5 6  7 8  9 10 11

var intervalToIntegerTable = {
  '1': 0, 'b2': 1, '2': 2, 'b3': 3, '3': 4, '4': 5, 'b5': 6, '5': 7, '#5': 8,
  '6': 9, 'b7': 10, '7': 11, '7#': 12, 'b9': 13, '9': 14, '#9': 15
}

//  0, 2, 4, 5, 7, 9, 11x
var intervalsTable = 
  {'1': 0, 'b2': 1, '2': 2, 'b3': 3, '3': 4, '4': 5, 'b5': 6, '5': 7,
   '#5': 8, 'b6': 8, '6': 9, 'b7': 10, '7': 11, '7#': 12, 'b9': 13, 
   '9': 14, '#9': 15}

Utils.intervalsToIngeger = function(intervals){
  return _.map(intervals, function(interval){
    return intervalsTable[interval.toString()];
  });
}

Utils.integerToNoteTable = {
  0: 'C',
  1: 'C#',
  2: 'D',
  3: 'D#',
  4: 'E',
  5: 'F',
  6: 'F#',
  7: 'G',
  8: 'G#',
  9: 'A',
  10: 'A#',
  11: 'B'
}

/**
  Matches all the chords for the given scale and degree, returning an 
  array of chord names.
*/
Utils.matchChords = function(scale, degree, chords){
  scale = Utils.intervalsToIngeger(scale);
    
  // Duplicate the scale
  scale = scale.concat(_.map(scale, function(interval){
    return interval+12;
  })).slice(degree-1);
  
  var root = scale[0];
  var rootNote = Utils.integerToNoteTable[root];
  
  // Offset the scale
  scale = _.map(scale, function(interval){
    return interval - scale[0];
  });
  
  var matchedChords = [];
  _.each(chords, function(formula, name){
    formula = Utils.intervalsToIngeger(formula);
    for(var i=0; i<formula.length; i++){
      if(scale.indexOf(formula[i]) === -1){
        return;
      }
    }
    matchedChords.push({name: rootNote + name, 
                        formula: Utils.scaleToKey(formula, root)});
  });
  return matchedChords
}

// Returns the scale relative to a given key
Utils.scaleToKey = function(scale, key){
  return _.map(scale, function(semitone){
    return (semitone + key) % 12;
  });
}

return Utils;

});
