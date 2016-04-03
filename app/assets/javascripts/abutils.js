/*global document,s,tableauKeys,ABUtils,navigator,setTimeout*/
/* ===================================================================

 - ABUtils

======================================================================*/

ABUtils = {};

ABUtils.getCookie = function(testName){
    var cookie, cookies, key, parts, _i, _len, _ref;
    cookies = ((_ref = document.cookie) != null ? _ref.split(';') : void 0) || [];
    for (_i = 0, _len = cookies.length; _i < _len; _i++) {
      cookie = cookies[_i];
      parts = cookie.split('=');
      key = decodeURIComponent(parts.shift()).replace(' ', '');
      if (key === testName) {
        return decodeURIComponent(parts.shift());
      }
    }
    return null;
};

ABUtils.setCookie = function(testName, val){
    var dt;
    dt = new Date();
    dt.setDate( dt.getDate() + 14 );
    document.cookie = [
        encodeURIComponent(testName), '=', encodeURIComponent(val),
        '; path=/',
        '; expires=', dt.toUTCString()
    ].join('');
};

ABUtils.isRunningAB = false; // AB実行中かどうか

ABUtils.isBot = function(){
	var ua = (function(){
		if(!navigator || !navigator.userAgent){
			return null;
		}
		return navigator.userAgent;
	})();
	return !ua ||
		!/^Mozilla|^DoCoMo|^KDDI|^SoftBank|^Opera|^Dalvik|^BlackBerry/.test(ua) ||
		/[b|B]ot|[c|C]rawler|[s|S]pider/.test(ua);
};

ABUtils.ABTest = (function() {
  function _Class(testName) {
    this.testName = testName;
    this._begin = function() {};
    this._proc = null;
    this._end = function() {};
    this._checkTableau = function() {
      return true;
    };
    this._sendTableauKeys = function() {
      if (tableauKeys.length <= 0) {
        return;
      }
      setTimeout(function(){
        s.linkTrackVars = 'prop53';
        s.linkTrackEvents = 'None';
        s.prop53 = tableauKeys.join(',');
        s.tl(this, 'o', "sendTableauKeys");
      }, 300);
    };
    this._sendTableauKeysEvent = function() {};
    this._addCss = function() {};
    this.pattern = null;
    this.cookieVal = ((function(_this) {
      return function() {
        var cookie, val;
        cookie = ABUtils.getCookie(_this.testName);
        if(cookie != null){
            ABUtils.setCookie(_this.testName, cookie);
            return cookie;
        }
        val = 0 | Math.random() * 100;
        ABUtils.setCookie(_this.testName, val);
        return val;
      };
    })(this)).call();
  }

  // AB前処理
  _Class.prototype.begin = function(fn) {
    this._begin = fn;
    return this;
  };

  // ABテスト処理
  _Class.prototype.proc = function(min, max, fn) {
    // cookieが範囲内のときのみ処理をセットする
    if (this.cookieVal >= min && this.cookieVal <= max) {
      this._proc = fn;
    }
    return this;
  };

  // 後処理
  _Class.prototype.end = function(fn) {
    this._end = fn;
    return this;
  };

  // タブロー送信チェック（値を入れてもいい場合はtrue）
  _Class.prototype.checkTableau = function(fn) {
    this._checkTableau = fn;
    return this;
  };

  // タブロー送信（任意のタイミングで実行可能）
  _Class.prototype.sendTableauKeysEvent = function() {
    tableauKeys = [];
    tableauKeys.push(this.testName + '-' + this.pattern);
    this._sendTableauKeys();
    return this;
  };

  // CSS追加処理
  _Class.prototype.addCss = function(array) {
    var _i, _len, head;
    head = document.getElementsByTagName('head')[0];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = array[_i];
      link.media = 'all';
      head.appendChild(link);
    }
    return this;
  };

  _Class.prototype.run = function() {
    if (typeof this._begin === "function") {
      this._begin();
    }
    if (typeof this._proc === "function") {
      this._proc();
      ABUtils.isRunningAB = true;
    }
    if (typeof this._end === "function") {
      this._end();
    }
    if (typeof this._checkTableau === "function" ? this._checkTableau() : void 0) {
      if(typeof s !== 'undefined'){
        this.sendTableauKeysEvent();
      }else{
        if(typeof tableauKeys === 'undefined'){
          tableauKeys = [];
        }
        tableauKeys.push(this.testName + '-' + this.pattern);
      }
    }
  };

  return _Class;

})();
