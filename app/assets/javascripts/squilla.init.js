/*global Squilla,setTimeout,s,tableauKeys*/
(function(sq){
  sq.setSendResultFunction(function(key, pattern){
    var tableauKey = key + '-' + pattern;
    if(typeof s !== 'undefined'){
      setTimeout(function(){
        s.linkTrackVars = 'prop53';
        s.linkTrackEvents = 'None';
        s.prop53 = tableauKey;
        s.tl(this, 'o', "sendTableauKeys");
      }, 500);
    }else{
      if(typeof tableauKeys === 'undefined'){
        tableauKeys = [];
      }
      tableauKeys.push(tableauKey);
    }
  });
  var configUrl = '/doc/include/head/common/abtest.config.js?_=' + (new Date()).getTime();
  document.write(['<scr', 'ipt type="text/javascript" src="', configUrl, '"></scr', 'ipt>'].join(''));
})(Squilla);
// old version support.
(function(sq){
  sq.configData = {tests:{}};
})(Squilla);
