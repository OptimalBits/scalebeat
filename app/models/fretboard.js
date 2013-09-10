define(['gnd'], function(Gnd){

  var FretBoardSchema = new Gnd.Schema({
    numFrets: {type: Number},
    numStrings: {type: Number},
  });

  return Gnd.Model.extend('fretboards', FretBoardSchema);
});


