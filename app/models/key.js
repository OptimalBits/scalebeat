define(['gnd'], function(Gnd){

  var KeySchema = new Gnd.Schema({
    name: String,
    semitone: Number, // As integer note between 0 and 11
    slug: String,
  });

  Key = Gnd.Model.extend('keys', KeySchema);
  Key.prototype.url = function(){
    var base = Gnd.router.req.components.slice(0,2).join('/')
    return '#' + base + '/' + this.slug || this.name;
  }
  return Key;
});

