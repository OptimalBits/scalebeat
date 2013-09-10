define(['gnd'], function(Gnd){

  var ModeSchema = new Gnd.Schema({
    name: String,
    pos: Number, // As integer note between 0 and 7
  });

  Mode = Gnd.Model.extend('modes', ModeSchema);
  Mode.prototype.url = function(){
    var base = Gnd.router.req.components.slice(0,3).join('/')
    return '#' + base + '/' + this.name;
  }
  return Mode;
});
