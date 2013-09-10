define(['gnd'], function(Gnd){

  var ScaleSchema = new Gnd.Schema({
    name: String,
    formula: [Number], // As notes in the chromatic scale.
    slug: String,
  });

  Scale = Gnd.Model.extend('scales', ScaleSchema);
  Scale.prototype.url = function(){
    return '#/'+this.slug;
  }
  return Scale;
});
