define(['gnd', 'utils'], function(Gnd, Utils){

  var FretboardView = Gnd.Util.extend(Gnd.View, function(_super){
    return {
      constructor: function(opts){
        _super.constructor.call(this);
        
        _.extend(this, _.defaults(opts || {}, {
          viewWidth: 960,
          viewHeight: 160,
          neckWidth: 160,
          numFrets: 24+1,
          numStrings: 6,
          stringNotes: [4, 11, 7, 2, 9, 4] // E B G D A E
        }));

        // create a renderer instance.
        this.renderer = new PIXI.CanvasRenderer(this.viewWidth, this.viewHeight);
        
        var assets = new PIXI.AssetLoader(["assets/images/rosewood.jpg"]);
        var promise = this.assetsPromise = new Gnd.Promise();
        
        assets.onComplete = function(){
          promise.resolve();
        }
        assets.load();
      },
      setScale: function(formula, key, mode){
        this.scaleAsIntervals = formula;
        var intervals = Utils.intervalsToIngeger(formula)
        
        this.scaleFormula = 
          Utils.scaleToKey(Utils.scaleToMode(Utils.scaleToKey(intervals, key), mode), key);
      },
      setChord: function(chordFormula){
        this.chord = chordFormula;
      },
      refresh: function(){
        var _this = this;
        
        return this.assetsPromise.then(function(){
          
          // create an new instance of a pixi stage
          var stage = new PIXI.Stage(0xFFFFFF);
          
          var sprite = new PIXI.Sprite.fromImage('assets/images/rosewood.jpg');
          stage.addChild(sprite);
            
          g = new PIXI.Graphics();
          stage.addChild(g);
        
          var offset = (_this.viewHeight-_this.neckWidth)/2;
  
          // Draw frets
          g.lineStyle(6, 0xaa7020);
          g.moveTo(30, offset);
          g.lineTo(30, offset+_this.neckWidth);
          
          g.lineStyle(3, 0x959595);
          for(var i=1; i<_this.numFrets; i++){
            g.moveTo(30 + i*(_this.viewWidth/_this.numFrets)+0, offset);
            g.lineTo(30 + i*(_this.viewWidth/_this.numFrets)+0, offset+_this.neckWidth);
          }
  
          // Draw Guitar Markers
          function drawMarker(pos, ratio){
            ratio = ratio || 1/2;
            var centery = ratio * _this.neckWidth;
            var markerx = 12 + pos*(_this.viewWidth/_this.numFrets)
            g.lineStyle(1, 0x505050);
            g.beginFill(0x909090);
            g.drawCircle(markerx, centery, 11);
            g.endFill();
          }
          
          drawMarker(3); drawMarker(5); drawMarker(7); drawMarker(9);
          drawMarker(15); drawMarker(17); drawMarker(19); drawMarker(21);
          drawMarker(12, 1/3); drawMarker(12, 2/3);
          drawMarker(24, 1/3); drawMarker(24, 2/3);
          
          // Draw strings
          offset += 13;
          g.lineStyle(2, 0x505050);
          for(var i=0; i<_this.numStrings; i++){
            g.moveTo(0, offset + i*(_this.neckWidth/_this.numStrings)+0);
            g.lineTo(_this.viewWidth, offset + i*(_this.neckWidth/_this.numStrings)+0);
          }

          var startNotes = _this.stringNotes;

          // Draw notes
          g.lineStyle(1, 0x000000);
          for(var i=0; i < _this.numStrings; i++){  
            var ypos = offset + i*(_this.neckWidth / _this.numStrings);
          
            var scale = generateScale(_this.scaleFormula, 
                                      startNotes[i], 
                                      _this.numFrets,
                                      _this.chord);

            var note = scale.firstNote;
                                    
            for(var j=0; j<_this.numFrets; j++){
              var xpos = j*(_this.viewWidth/_this.numFrets);
              if(!_.isUndefined(scale[j])){
                g.beginFill(scale[j]);
              }
              if(scale[j]){
                var cxpos = 20+xpos;
                g.drawCircle(cxpos, ypos, 11);
                g.endFill();
              
                var val = _this.scaleAsIntervals[note];
                note = (note + 1) % _this.scaleAsIntervals.length;
              
                var text = new PIXI.Text(val, {font:"11px Arial", fill:"black"});

                text.position.x = cxpos - text._width/2;
                text.position.y = ypos - text._height/2;
        
                stage.addChild(text);
              }
            }
          }
        
          _this.renderer.render(stage);
        });
      },
      
      render: function(){
        var _this = this;
        return _super.render.call(this).then(function(el){
          _this.el = el;
           Gnd.$(el).append(_this.renderer.view);
          _this.refresh();
        });
      }
    }
  });
   
  /**
    Returns an array with all the notes:
      R: Root
      N: note
      A: Arpeggio
      
      // Specified as semitones.
      var chord = [1, 5, 8]
  */
  function generateScale(formula, start, numFrets, chord){
    var firstNote;
    var note = start;
    var chordKey = chord && chord[0];
    var scale = [];
    for(var i=0; i<numFrets; i++){
      var index = formula.indexOf(note);
      if(index != -1){
        firstNote = _.isUndefined(firstNote) ? index : firstNote;
        var a = chord && chord.indexOf(formula[index]);
        if(!_.isUndefined(a) && a !== -1){
          var interval = (chord[a] - chordKey);
          interval = interval < 0 ? 12 + interval : interval;
          scale[i] = intervalColorTable[interval];
        } else if(index === 0 && _.isUndefined(chord)) {
          scale[i] = 0xFFFFFF;
        } else {
          scale[i] = 0x909090;
        }
      }
      note ++;
      if(note > 11){
        note = 0;
      }
    }
    scale.firstNote = firstNote;
    return scale;
  }
  
  /**
    Interval Color Mapping
  */
  
  var intervalColorTable = {
    0: 0xFFFFFF, // White // Root / Octave
    1: 0x0,
    2: 0x0,
    3: 0x00FF00, // Green  // Minor Third
    4: 0xFF0000, // Red    // Major Third
    5: 0x0000FF, // Blue // Perfect Fourth
    6: 0x0,
    7: 0x0FFFF00, // Yellow // Perfect Fifth
    8: 0x0,
    9: 0x0,
    10: 0x0,
    11: 0x0
  }
  
  Array.prototype.rotate = (function() {
    // save references to array functions to make lookup faster
    var 
      push = Array.prototype.push,
      splice = Array.prototype.splice;

    return function(count) {
      var 
        len = this.length >>> 0, // convert to uint
        count = count >> 0; // convert to int

      // convert count to value in range [0, len[
      count = ((count % len) + len) % len;

      // use splice.call() instead of this.splice() to make function generic
      push.apply(this, splice.call(this, 0, count));
      return this;
    };
  })();
  
  // Returns the chord notes as semitones of the given degree and chord formula
  // @param degree {Number} A degree from 1 to 7
  // @param chordFormula {Array} Array of relative indexes in the scale.
  function degreeToChord(degree, chordFormula, scale){
    var chord = [];
    var max = Math.max.apply(Math, scale);
    var semitone = scale[degree-1];
    for(var i=0; i<chordFormula.length; i++){
      chord.push(((chordFormula[i])+semitone) % (max + 1));
    }
    return chord;
  }
  
  return FretboardView;
});
