/*global location, s, capID, capMF, capAG, subSiteSection*/
// BaconSET
(function(){
  var bacon = (function(){
    function Bacon(site, category, middleware, infl, logtype, env){
      this.data = {
        tag: ['cet', site, category, middleware, infl, logtype, env].join('.')
      };
      this.host = {
        stg: 'stg-beacon.cetlog.jp',
        prd: 'prd-beacon.cetlog.jp'
      }[env];
    }

    Bacon.prototype.contents = function(name, contents){
      this.data[name] = contents;
      return this;
    };

    Bacon.prototype.beacon = function(cb){
      var xhr = (function(){
        if(typeof window.XDomainRequest !== 'undefined'){
          return null;
        }
        return new XMLHttpRequest();
      })();

      if(!xhr || !this.host){
        if (typeof console !== 'undefined' && console !== null) {
          if (typeof console.log === 'function') {
            console.log('[SEND]', this.data);
          }
        }
        if(typeof cb === 'function'){
          cb();
        }
        return;
      }

      var url = 'https://' + this.host + '/';
      xhr.open('POST', url);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.onload = function(){
        if(typeof cb === 'function'){
          cb();
        }
      };

      xhr.send(JSON.stringify(this.data));
    };

    // Cookie
    var cookieMap = {},
        cookieNames = [];
    if(typeof document.cookie !== 'undefined'){
      var cookies = document.cookie.split(';');
      for(var i = 0, l = cookies.length; i < l; i++){
        try{
          var pair = cookies[i].split('=');
          var cookieName = decodeURIComponent(pair.shift()).replace(' ', '');
          var cookieVal = decodeURIComponent(pair.shift());
          cookieMap[cookieName] = cookieVal;
          cookieNames.push(cookieName);
        }catch(e){
          if(typeof console !== 'undefined' && typeof console.warn === 'function'){
            console.warn('Cookie Parse ERROR', e);
          }
        }
      }
    }
    Bacon.cookie = {
      get: function(name){
        if(typeof cookieMap[name] !== 'undefined'){
          return cookieMap[name];
        }
        return null;
      },
      names: function(){
        return cookieNames;
      }
    };
    Bacon.storage = {
      enabled: function(){
        try{
          var storage = window.localStorage;
          if(!storage){
            return false;
          }
          var key = '___baconset___check___',
              val = 'check';
          storage.setItem(key, val);
          if(storage.getItem(key) !== val){
            return false;
          }
          storage.removeItem(key);
          return true;
        }catch(e){
          return false;
        }
      },
      get: function(key){
        return window.localStorage.getItem(key);
      },
      set: function(key, val){
        window.localStorage.setItem(key, val);
      },
      remove: function(key){
        window.localStorage.removeItem(key);
      }
    };

    return Bacon;
  })();
  window.BaconSET = bacon;
})();

// HPG.BaconSET
(function(){
  var bacon = (function(BaconSET){
    function Bacon(logtype, contentstype){
      var env = (function(host){
        if(host.match('www.*\\.hotpepper\\.jp$')){
          if(host.match('wwwtst\\.')){
            return 'stg';
          }
          return 'prd';
        }
        return 'unknown';
      })(location.host);

      this.baconset = new BaconSET('hpg', 'csweb', 'browser', 'front', logtype, env);

      var contents = {type: contentstype};

      // User情報
      contents.user = (function(){
        var KEY_NAME = 'HPGBACONSETKEY';
        var makeUserId = function(){
          var S4 = function(){return (((1+Math.random())*0x10000)|0).toString(16).substring(1);};
          var s = [S4(), S4(), '-', S4()].join('');
          s += ['-', S4(), '-', S4(), '-', S4(), S4(), S4()].join('');
          s += '_' + (new Date()).getTime();
          if(BaconSET.storage.enabled()){
            BaconSET.storage.set(KEY_NAME, s);
          }else{
            document.cookie = '' + KEY_NAME + '=' + encodeURIComponent(s) + ';path=/;';
          }
          return s;
        };
        var getUserId = function(){
          if(BaconSET.storage.enabled()){
            return BaconSET.storage.get(KEY_NAME);
          }
          return BaconSET.cookie.get(KEY_NAME);
        };
        
        var data = {}, uid;
        data.sys_uid = (uid = getUserId()) !== null ? uid : makeUserId();
        data.sc_uid = (typeof s === 'undefined' || typeof s.fid === 'undefined') ? '' : s.fid;
        data.session_id = BaconSET.cookie.get('JSESSIONID');
        data.cap_id = (typeof capID === 'undefined') ? '' : capID;
        data.cap_gender = (typeof capMF === 'undefined') ? '' : capMF;
        data.cap_age = (typeof capAG === 'undefined' || isNaN(capAG) || capAG === '') ? null : +capAG;
        data.ua = (typeof navigator === 'undefined' || typeof navigator.userAgent === 'undefined') ? '' : navigator.userAgent;
        var names = BaconSET.cookie.names(), ab_coookies = [];
        for(var i = 0, l = names.length; i < l; i++){
          var name = names[i];
          if(/(CSHP|HPGDEV).*/.test(name)){
            var val = BaconSET.cookie.get(name);
            ab_coookies.push('' + name + '=' + val);
          }
        }
        data.ab_test_cookies = ab_coookies;

        return data;
      })();

      // ページ情報
      contents.action = (function(){
        var data = {};
        data.page_id = (typeof subSiteSection === 'undefined') ? '' : subSiteSection;
        // location情報を取得
        (function(_data, l){
          if(typeof l === 'undefined'){
            _data.protocol = '';
            _data.path = '';
            _data.params = '';
            return;
          }
          _data.protocol = (typeof l.protocol === 'undefined') ? '' : l.protocol.replace(':', '');
          _data.path = (typeof l.pathname === 'undefined') ? '' : l.pathname;
          _data.params = (typeof l.search === 'undefined') ? '' : l.search;
        })(data, location);
        data.referrer = (typeof document.referrer === 'undefined') ? '' : document.referrer;
        data.page_title = (typeof document.title === 'undefined') ? '' : document.title;
        return data;
      })();

      // 個別情報
      contents.custom = {};

      this.contents = contents;
    };

    Bacon.prototype.custom = function(custom){
      this.contents.custom = custom;
      return this;
    };

    Bacon.prototype.beacon = function(cb){
      this.contents.action.access_time = new Date();
      this.baconset
        .contents('contents', this.contents)
        .beacon(cb);
    };

    // cookie継承
    Bacon.cookie = BaconSET.cookie;
    
    // お店情報
    Bacon.newStoreCustom = function(){
      var custom = {},
          w = window;

      custom.store_id = typeof w.storeID === 'undefined' ? '' : w.storeID;
      custom.service_area = typeof w.serviceAreaCode === 'undefined' ? '' : w.serviceAreaCode;
      custom.middle_area = typeof w.middleAreaCode === 'undefined' ? '' :  w.middleAreaCode;
      custom.small_area = typeof w.smallAreaCode === 'undefined' ? '' : w.smallAreaCode;
      custom.plan = typeof w.storeDivision === 'undefined' ? '' : w.storeDivision;
      custom.reserve_campaign = typeof w.storeReserveCampaign === 'undefined' ? '' : w.storeReserveCampaign;
      custom.imr_accespt = typeof w.storeImrAcceptFlg === 'undefined' ? '' : w.storeImrAcceptFlg;
      custom.ticket_sales = typeof w.storeTicketSales === 'undefined' ? '' : w.storeTicketSales;
      custom.req_accept = typeof w.storeReqReserveAcceptFlg === 'undefined' ? '' : w.storeReqReserveAcceptFlg;

      return custom;
    };
    
    return Bacon;
  })(window.BaconSET);
  window.HPG = window.HPG || {};
  window.HPG.BaconSET = bacon;
})();
