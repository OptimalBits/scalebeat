define(['gnd', 
        'gnd/dropdown', 
        'views/fretboardview', 
        'models/scale', 
        'models/key', 
        'models/mode',
        'utils'], 
function(Gnd, Dropdown, FretboardView, Scale, Key, Mode, Utils){
"use strict";

  var app = Gnd.Model.create();

  // C  C# D  D# E  F F# G  G# A  A#  B   C
  // 0  1  2  3  4  5 6  7  8  9 10  11   0 ...
  var scales = new Gnd.Collection(Scale, {nosync: true}, null, [
    Scale.create({
      name: 'Mayor',
      formula: [1, 2, 3, 4, 5, 6, 7],
      slug: "mayor"
    }),
    Scale.create({
      name: 'Mayor Pentatonic',
      formula: [1, 2, 3, 5, 6],
      slug: 'mayor-pentatonic'
    }),
    Scale.create({
      name: 'Minor Pentatonic',
      formula: [1, 'b3', 4, 5, 'b7'],
      slug: 'minor-pentatonic'
    }),
    Scale.create({
      name: 'Minor Blues',
      formula: [1, 'b3', 4, 'b5', 5, 'b7'],
      slug: 'minor-blues'
    }),
    Scale.create({
      name: 'Natural Minor',
      formula: [1, 2, 'b3', 4, 5, 'b6', 'b7'],
      slug: 'natural-minor'
    }),
    Scale.create({
      name: 'Harmonic Minor',
      formula: [1, 2, 'b3', 4, 5, 'b6', 7],
      slug: 'melodic-minor'
    }),
    Scale.create({
      name: 'Ascending Melodic Minor (Jazz Minor)',
      formula: [1, 2, 'b3', 4, 5, 6, 7],
      slug: 'jazzc-minor'
    }),
  ]);
  
  var keys = new Gnd.Collection(Key, {nosync: true}, null, [
    Key.create({
      name: 'C',
      semitone: 0,
      slug: 'C'
    }),
    Key.create({
      name: 'C# / Db',
      semitone: 1,
      slug: 'Csharp-Dflat'
    }),
    Key.create({
      name: 'D',
      semitone: 2,
      slug: 'D'
    }),
    Key.create({
      name: 'D# / Eb',
      semitone: 3,
      slug: 'Dsharp-Eflat'
    }),
    Key.create({
      name: 'E',
      semitone: 4,
      slug: 'E'
    }),
    Key.create({
      name: 'F',
      semitone: 5,
      slug: 'F'
    }),
    Key.create({
      name: 'F# / Gb',
      semitone: 6,
      slug: 'Fsharp-Gflat'
    }),
    Key.create({
      name: 'G',
      semitone: 7,
      slug: 'G'
    }),
    Key.create({
      name: 'G# / Ab',
      semitone: 8,
      slug: 'Gsharp-Aflat'
    }),
    Key.create({
      name: 'A',
      semitone: 9,
      slug: 'A'
    }),
    Key.create({
      name: 'A# / Bb',
      semitone: 10,
      slug: 'Asharp-Bflat'
    }),
    Key.create({
      name: 'B',
      semitone: 11,
      slug: 'B'
    })
  ]);
    
  var modes = new Gnd.Collection(Mode, {nosync: true}, null, [
    Mode.create({
      name: 'Ionian',
      pos: 1,
    }),
    Mode.create({
      name: 'Dorian',
      pos: 2,
    }),
    Mode.create({
      name: 'Phrigian',
      pos: 3,
    }),
    Mode.create({
      name: 'Lydian',
      pos: 4,
    }),
    Mode.create({
      name: 'Mixolydian',
      pos: 5,
    }),
    Mode.create({
      name: 'Aeolian',
      pos: 6,
    }),
    Mode.create({
      name: 'Locrian',
      pos: 7,
    }),
  ]);
  
  var viewModel = new Gnd.ViewModel('#selection', {
    app: app,
    scales: scales,
    modes: modes,
    keys: keys
  });
  
  app.set({
    scale: 'mayor',
    key: 'C',
    mode: 'Ionian'
  })
  
  app.url = function(){
    return '#/' + 
      (app.scale ? app.scale + '/' : '') +
      (app.key ? app.key + '/' : '') +
      (app.mode ? app.mode +'/': '');
  }
  
  app.on('scale key mode', function(){
    Gnd.router.redirect(app.url());
  });
  
var fretboardView = new FretboardView();

app.setChord = function(el){
  var model = el['gnd-obj'];
  fretboardView.setChord(model.formula);
  fretboardView.refresh();
}

app.unsetChord = function(){
}
/*
var key = Utils.noteToIntegerTable['G'];
var formula = Utils.scaleToKey(Utils.chordFormulas['Maj'], key);
fretboardView.setChord(formula);
fretboardView.refresh();
*/
//
// Read metadata for jamtrack
//
Gnd.Ajax.get("/assets/tracks/rock-g-mayor/meta.json").then(function(meta){
  var iframeElement   = document.querySelector('iframe');
  var widget         = SC.Widget(iframeElement);
  var lastIndex = 0;
  var lastChord = null;
  
  var chords = meta.chords.chords;

  widget.bind(SC.Widget.Events.PLAY_PROGRESS, function(progress){
    
    if(lastChord && lastChord.from > progress.currentPosition){
      lastIndex = 0;
    }
    
    for(var i=lastIndex; i<chords.length; i++){
      var chord = chords[i];
      var end = (chord.from + chord.duration) * 1000;
      
      if(progress.currentPosition < end){
        if(progress.currentPosition > chord.from * 1000){
          if ((chord.base != 'N') && 
              (!lastChord || (chord.base !== lastChord.base))){
            console.log(chord);
            var quality = chord.bottom === '' ? 'Maj' : chord.bottom;
            var key = Utils.noteToIntegerTable[chord.base];
            var formula = Utils.intervalsToIngeger(Utils.chordFormulas[quality])
            formula = Utils.scaleToKey(formula, key);
            fretboardView.setChord(formula);
            fretboardView.refresh();
          }
          lastIndex = i;
          lastChord = chord;
          break;
        }
      }else{
        continue;
      }
    }
  });
});

return function(pool){  
  var req = this; // this points to this Request object.
  
  // If this is the last component we redirect to the first scale
  if(req.isLast()){
    req.redirect(app.url());
  }
    
  req.get(':scale', '#fretboard', function(pool){
    var scale = scales.findWhere({slug: req.params.scale})
    if(scale){
      
      app.set('scale', scale.slug);
      fretboardView.setScale(scale.formula, 0, 1);
      req.render(fretboardView);
          
      req.get(':key', '#fretboard', function(pool){
        var key = keys.findWhere({slug: req.params.key});
        if(key){
          app.set('key', key.slug);
                  
          req.get(':mode', '#fretboard', function(){
            
            var mode = modes.findWhere({name: req.params.mode});
            if(mode){
              app.set('mode', mode.name);
              
              pool.autorelease(updateChordsTable(key.semitone, scale, mode.pos));
              
              fretboardView.setScale(scale.formula, key.semitone, mode.pos);
              fretboardView.refresh();
            }
          });
        }
      });
    }else{
      req.notFound();
    }
  });
}

function updateChordsTable(key, scale, mode){
  var triads = new Gnd.Collection(Gnd.Model, {nosync: true});
  
  var triadsFormulas = {
    '': Utils.chordFormulas['Maj'],
    'm': Utils.chordFormulas['m'],
    'dim': Utils.chordFormulas['dim']
  };
  
  for(var degree=1; degree<8; degree++){
    var triad = Utils.matchChords(key,
                                  scale.formula,
                                  mode,
                                  degree, 
                                  triadsFormulas)[0];

    var triadModel = Gnd.Model.create();
    if(triad){
      triadModel.name = triad.name;
      triadModel.formula =  triad.formula;
    }
    triads.add(triadModel);
    
    console.log("degree:"+degree, triad);
  }
  
  return new Gnd.ViewModel('#chordsTable', {app: app, triads: triads});
}

}); // define
