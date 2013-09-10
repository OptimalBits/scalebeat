define(['gnd'], function(Gnd){

  var DegreeSchema = new Gnd.Schema({
    name: String,
    formula: [Number], // As notes in the chromatic scale.
    slug: String,
  });

  Scale = Gnd.Model.extend('scales', ScaleSchema);
  Scale.prototype.url = function(){
    return '#/'+this.slug;
  }
  
  // Chord formulas as indexes in scale formulas
  // In integer notation: [0, 2, 4]
  var chordFormulas = {
    'Maj': [1, 3, 5], 
    'add4': [1, 3, 4, 5],
    'Maj7': [1, 3, 5, 7],
    'm': [1, 'b3', 5],
    'm/Maj7': [1, 'b3', 5, 7],
    'Dominant 7': [1, 3, 5, 'b7'],
    'sus4': [1, 4, 5],
    'sus2': [1, 2, 5],
    'dim': [1, 'b3', 'b5'],
    'dim7': [1, 'b3', 'b5', 6],
    'aug': [1, 3, '#5'],
    '5': [1, 5], // Fifth
    '-5': [1, 'b5'] // flat fifth
  }
  
  return Scale;
});
