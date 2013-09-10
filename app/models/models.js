/**
  Export all the models that should be accessible by Ground.
*/
define(['gnd', './fretboard', './scale', './key'], 
function(Gnd, Fretboard, Scale, Key){
  
  var models = {};
  
  models.Fretboard = Fretboard;
  models.Scale = Scale;
  models.Key = Key;
  
  return models;
});

