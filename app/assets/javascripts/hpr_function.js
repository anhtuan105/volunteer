
/**
 * Cookie plugin
 *
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

// フリーワード機能改修のため上部に記載
var freewordSearchTrimParam = {
	init: function(){
		if(!$('.jscFreewordSearchForm').length){
			return;
		}
		this.formWrap = $('.jscFreewordSearchForm');
		this.freewordInput = $('.jscFreewordSearchTxt');

		this.freewordInput.prop('disabled', false);
		this.bindEvent();
	},
	trimParam: function(){
		var trimFreeword = this.freewordInput.val().replace(/^[\s　]+|[\s　]+$/g, '');
		this.freewordInput.val(trimFreeword);

		if(trimFreeword === '' || trimFreeword === '例：新宿　居酒屋　宴会'){
			this.freewordInput.prop('disabled', true);
		}
	},
	bindEvent: function(){
		var _self = this;

		$('.jscFreewordSearchSubmitBtn').on('click', function(){
			_self.trimParam();
			_self.formWrap.submit();
			_self.freewordInput.prop('disabled', false);
		});

		this.freewordInput.keypress(function(e){
			if (e.which == 13) {
				_self.trimParam();
				_self.formWrap.submit();
				_self.freewordInput.prop('disabled', false);
				return false;
			}
		});
	}
};

var SEARCH_KIND = {
	STATION: "3",
	FREEWORD: "4"
};

$(function(){
	freewordSearchTrimParam.init();
});

jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options = $.extend({}, options); // clone object since it's unexpected behavior if the expired property were changed
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // NOTE Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};


/**
 * Hotpepper functions
 */
(function() {
	hpr = window.hpr = {

		window: {
			// window.openExternal
			openExternal: function(anchor) {
				window.open(anchor.href, "_blank");
				return false;
			},

			// window.open
			open: function(url) {
				window.open(url, "_blank");
				return false;
			},

			// window.popup
			popup: function(url, name, width, height) {
				var top = (screen.width - width) / 2;
				var left = (screen.height - height) / 2;
				var option = 'resizable=yes,height=' + height + ',width=' + width + ',top=' + top + ',left=' + left
							+ ', scrollbars=yes, toolbar=yes, status=yes, location=yes';

				window.open(url, name, option);
			},

			// window.popupWithPost
			popupWithPost: function(sendForm, url, name, width, height) {
				var win = popupWindow("about:blank", name, width, height);
				sendForm.target = name;
				sendForm.method = "post";
				sendForm.action = url;
				sendForm.submit();
			},

			// window.closeWelcomeArea
			closeWelcomeArea: function() {
				$('div#welcome').slideUp('fast');
				hpr.common.setWelcomeAreaHidden(); // Cookie書き込み処理
  				return false;
			}
		}, // hpr.window end

		freeword: {
			// freeword.setAction
			setAction: function(kind) {
				if (!(kind == Number(SEARCH_KIND.STATION) || kind == Number(SEARCH_KIND.FREEWORD))) {
					return;
				}

				var ids = ['#station', '#freeword']

				$('#ARGV1').each(function() {
					$(this).attr('name', 'SK');
					$(this).val(kind);
				});
				$(ids.join(',')).attr('class', '');

				switch(kind) {
				case Number(SEARCH_KIND.STATION):
					$('#station').addClass('current');
					break;
				case Number(SEARCH_KIND.FREEWORD):
					$('#freeword').addClass('current');
					break;
				}
			},

			// freeword.validate
			validate: function(event, form, validateType) {
			    if (!event) {
			    	event = window.event;
				}

			    if (event.keyCode == 13) {
					var result = this.submit(form, validateType);
					if (result == null || result == false) {
						return false;
					}
				}
				return true;
			},

			// freeword.submit
			submit: function(form, validateType, nextPage) {
				var kind = form.ARGV1.value;
				var message = "";
				switch(validateType) {
				case 601:
					if (jQuery.trim(form.FREEWORD.value) == "") {
						switch (kind) {
						case SEARCH_KIND.STATION:
							message = "駅名かエリアを入力してください。";
							break;
						case SEARCH_KIND.FREEWORD:
							message = "キーワードを入力してください。";
							break;
						}
					}
					break;
				default :
					if (form.FREEWORD.value == "") {
						message = "キーワードを入力してください。";
					}
				}

				if (message != "") {
					alert(message);
					return false;
				}

				if (nextPage != undefined){
			    	location.href = nextPage + ".html";
				} else {
			    	form.submit();
				}
			}

		}, // freeword end

		common: {
			setServiceArea: function (sacd) {
				document.cookie = "HPJ_SERVICE_AREA_CK=" + escape(sacd) + ";"
					+ "path=/;"
					+ "expires=Fri, 31-Dec-2030 23:59:59; ";
			},

			//ようこそエリアを表示しない
			setWelcomeAreaHidden: function() {
  				document.cookie = "HPR_WELCOME_CHECK=1;"
  					+ "path=/;"
  					+ "expires=Fri, 31-Dec-2030 23:59:59; ";
 			}

		}, // common end

		tooltip: {
			enabled: false,

			// tooltip.show
			show: function(sender, imgfile, imgWidth, imgHeight) {
				this.enabled = true;
				this._createOverlay();
				var targetImg = $(sender).children('img');
				var ew = targetImg.width();
				var eh = targetImg.height();
				var targetPosX = targetImg.offset().left + ew;
				var targetPosY = targetImg.offset().top + eh*0.5;
				var imgPos = parseInt((imgHeight*0.5),10);

				$("body").append('<p id="tooltip"><img src="'+ imgfile +'" width="'+ imgWidth +'" height="'+ imgHeight +'" /></p>');
				$("#tooltip").css({
					opacity: "0",
					position: "absolute",
					"z-index": 999,
					top: targetPosY - imgPos,
					left: targetPosX}).fadeTo(400,1.0);
			},

			// tooltip.remove
			remove: function(time){
				var timerId;
				var tooltip = this;
				timerId = setTimeout(function(){
					$("#tooltip").fadeTo(400,0,
						function(){
							$("#tooltip").remove();
							tooltip._removeOverlay();
							tooltip.enabled = false;
						}
					);
					clearTimeout(timerId);
				}, time);
			},

			_createOverlay: function() {
				var h = $("body")[0].offsetHeight;

				$("body").append("<div id='unclickableLayer'></div>");

				$("#unclickableLayer").css({
					width: "100%",
					height: h,
					position: "absolute",
					top: "0",
					left: "0",
					background: "#fff",
					opacity: "0"
				});

				var op = $("#unclickableLayer").css("opacity");
				if (typeof op == "undefined" || op == "1") {
					$("#unclickableLayer").css("backgroundColor", "rgba(255,255,255,0)");
				}
			},

			_removeOverlay: function() {
				$('#unclickableLayer').remove();
			}

		}, // tooltip end


		keeplist: {
			ON_LOAD_ENABLED: true,
			IDS_COOKIE_NAME: "HPR_K_STORE_IDS",
			GET_STORES_URL: "/CSP/common/ajaxJson",
			MAX_STORE: 10,
			STORES_ELM_ID: "#keepShop div.userDataInnerContents",

			// keeplist.addStore
			addStore: function(sender, id) {
				sender.blur();
				if (hpr.tooltip.enabled) {
					return;
				}
				if (this._getCount() < this.MAX_STORE) {
					this._addStore(id);
					var filename = "/SYS/cmn/images/common/dialog/balloon_keep.gif";
					var width = "99";
					var height = "79";
				} else {
					var filename = "/SYS/cmn/images/common/dialog/balloon_keep_full.gif";
					var width = "141";
					var height = "89";
				}
				hpr.tooltip.show(sender, filename, width, height);
				hpr.tooltip.remove(2000);
			},

			// keeplist.addStoreNoImg
			addStoreNoImg: function(sender, id) {
				sender.blur();
				if (hpr.tooltip.enabled) {
					return;
				}
				if (this._getCount() < this.MAX_STORE) {
					this._addStore(id);
				} else {
					var filename = "/SYS/cmn/images/common/dialog/balloon_keep_full.gif";
					var width = "141";
					var height = "89";
					hpr.tooltip.show(sender, filename, width, height);
				}
				hpr.tooltip.remove(2000);
			},

			// keeplist.removeStore
			removeStore : function(id) {
				var ids = this._getStoreIds();
				var i = ids.length;
				while (i-- > 0) {
					if (ids[i] == id) {
						ids.splice(i, 1);
					}
				}
				this._setStoreIds(ids);

				this._setKeepButtonEnabled(id, true);
				$('#keepStore' + id).remove();

				var keepStores = $("li[class='article'][id^='keepStore']");
				if (keepStores.size() == 0) {
					this._showNoStore();
				}
			},

			// keeplist.show
			show: function() {
				var ids = this._getStoreIds();
				if (ids.length == 0) {
					this._showNoStore();
				} else {
					this._showStoreCount(ids.length);
					var keeplist = this;
					jQuery.each(ids, function() {
						keeplist._setKeepButtonEnabled(this, false);
					});
				}
			},

			// keeplist.expandList
			expandList: function() {
				this.showStores();
			},

			// keeplist.shrinkList
			shrinkList: function() {
				this.show();
			},

			// keeplist.showStores
			showStores: function(){
				var ids = this._getStoreIds();
				this._showStores(ids);
			},

			_getStoreIds: function() {
				var storeIds = "";
				try {
					storeIds = $.cookie(this.IDS_COOKIE_NAME);
				} catch(e) {
					this._removeAllStore();
				}
				var ids = storeIds ? storeIds.split(",") : [];
				return ids;
			},

			_setStoreIds: function(ids) {
				$.cookie(this.IDS_COOKIE_NAME,
					ids.join(","), {expires:10*365, path:'/'});
			},

			_getCount: function() {
				return this._getStoreIds().length;
			},

			_addStore: function(id){
				var ids = this._getStoreIds();
				var i = ids.length;
				while (i-- > 0) {
					if (ids[i] == id) {
						ids.splice(i, 1);
					}
				}
				ids.unshift(id);
				this._setStoreIds(ids);
				this._showStores(ids);
			},

			_setKeepButtonEnabled: function (id, enabled) {
				function getStyle(enabled) {
					return enabled ? "visible" : "hidden"
				}

				var link = $("#linkID" + id);
				if (link.size()) {
					$('*[id=linkID' + id + ']').css("visibility", getStyle(enabled));
				} else {
					$('*[id=linkID' + id + '_01' + ']').css("visibility", getStyle(enabled));
					$('*[id=linkID' + id + '_02' + ']').css("visibility", getStyle(enabled));
				}
			},

			_removeAllStore: function() {
				$.cookie(this.IDS_COOKIE_NAME, "", {expires:10*365, path:'/'});
			},

			_showNoStore: function() {
				$(this.STORES_ELM_ID).html(
					'<p class="userDataStatusZero"><span class="udsExaminationBtn">'
					+ '<img src="/SYS/cmn/images/front_002/btn_save_examination_list.png" width="96" height="18" alt="検討リストへ保存" /></span>'
					+ '<span>ボタンをおして気に入ったお店を検討リストへ保存しておくことが出来ます。</span>'
					+ '</p>'
				);
			},

			_showStoreCount: function(count) {
				$(this.STORES_ELM_ID).html(
					'<p class="userDataStatusClose"><span>検討リストに</span><span class="fs12 fcLiteRed bold">' + count + '</span><span>件保存中</span></p>'
					+ '<p class="userDataSwitch">'
					+ '<a href="javascript:void(0)" onclick="hpr.keeplist.expandList(); return false;" class="udCloseInner iconPlusCircleGray">保存したお店を見る</a>'
					+ '</p>'
				);
			},

			_isUnique : function(ids) {
				var len = ids.length;
				for (var i = 0; i < len; i++) {
					for (var j = i + 1; j < len; j++) {
						if (ids[i] == ids[j]) {
							return false;
						}
					}
				}
				return true;
			},

			_showStores : function(ids) {
				if (!this._isUnique(ids)) {
					this._removeAllStore();
					this._showNoStore();
					return;
				}
				if (ids == null || ids.length == 0) {
					this._showNoStore();
					return;
				}

				var keeplist = this;
				jQuery.each(ids, function() {
					keeplist._setKeepButtonEnabled(this, false);
				});
				$.ajax({
					url: this.GET_STORES_URL,
					dataType: "json",
					cache: false,
					success : function(result) {
						var stores = keeplist._intersection(ids, result.items);
						var validIds = [];
						if (stores.length == 0) {
							keeplist._showNoStore();
						} else {
							var html = [];
							var len = stores.length > keeplist.MAX_STORE ? keeplist.MAX_STORE: stores.length;
							if (len > 0) {
								html.push('<ul class="userDataStatusOpen">');
							}
							for (var i = 0; i < len; i++ ) {
								var store = stores[i];
								keeplist._pushStoreContent(html, store);
								validIds.push(store.storeId);
							}
							if (len > 0) {
								html.push('</ul>');
								html.push('<p class="userDataDiff">'
										+ '<a href="javascript:void(0)" onclick="javascript:window.open(\'/CSP/dcs010\', \'keep\', \'width=800, menubar=yes, toolbar=yes, location=yes, status=yes, resizable=yes, scrollbars=yes\'); return false;" class="uddLink icnWindowBlue"><span class="uddInner iconArrowBlue">お店を比較する</span></a>'
										+ '</p>');
								html.push('<p class="userDataSwitch">'
										+ '<a href="javascript:void(0)" onclick="hpr.keeplist.shrinkList(); return false;" class="udCloseInner iconMinusCircleGray">検討リストを閉じる</a>'
										+ '</p>');
							}
							$(keeplist.STORES_ELM_ID).html(html.join(""));
							keeplist._bindDelButtonHover();
						}
						keeplist._setStoreIds(validIds);

						// 画面にはあるが、cookieにはないお店をキープ可能にする(削除されたお店をキープできるようにする)
						keeplist._enableKeepButtons(validIds);
					},

					error: function() {
						var storesElm = $(keeplist.STORES_ELM_ID);
						storesElm.children().remove();
						$(storesElm).html('<p>キープリストの追加に失敗しました。</p>');
					}

				});

			},

			_pushStoreContent: function(html, store) {
				// 有料店・無料店で分ける
				var tkc_f = store.storeStateKbn == "1" ? "1" : "0";
				var onclickVal = "SCClick_toriKeepClick(\'" + store.storeId + "\',\'" + tkc_f + "\');";
				html.push('<li class="article" id="keepStore' + store.storeId + '">');
				html.push('<dl class="examinationListContents">');
				if (store.storeStateKbn == "2") {
					html.push('<dt><span class="elTitleArea">（' + store.middleAreaName + '）</span></dt><p>掲載情報がありません</p>');
				} else {
					html.push('<dt><a href="'+ store.storeUrl +'" onclick="' + onclickVal + '" class="elTitleMain">' + store.storeName + '</a><span class="elTitleArea">（' + store.middleAreaName + '）</span></dt>');
				}
				html.push('<dd class="itemTxtLiquidRight">');
				html.push('<a href="' + store.storeUrl + '" onclick="' + onclickVal + '" class="examinationListImg">');
				// 有料店以外(掲載落ち,Mapple,Dokoiku)
				if (store.storeStateKbn != "1") {
				} else {
					if(store.topPhotoImgId != ""){
						html.push('<img src="'+ store.topPhotoImgId +'" alt="" width="58" height="58" />');
					}else{
					}
				}
				html.push('</a>');
				html.push('<div class="examinationListInfo">');
				html.push('<p>' + store.genreCatch + '</p>');
				html.push('<div class="elDeleteBtn">');
				html.push('<a href="javascript:void(0);" onclick="hpr.keeplist.removeStore(\''+ store.storeId +'\'); return false;">');
				html.push('<img class="hover" src="/SYS/cmn/images/front_002/btn_x_mark_gray.png" width="18" height="18" alt="" /></a>');
				html.push('</div>');
				html.push('</div>');
				html.push('</dd>');
				html.push('</dl>');
				html.push('</li>');
			},

			_intersection: function(ids, stores){
				var result = [];
				var idsLen = ids.length;
				var storesLen = stores.length;
				for (var i = 0; i < idsLen; i++) {
					for (var j = 0; j < storesLen; j++) {
						if (ids[i] == stores[j].storeId) {
							result.push(stores[j]);
							break;
						}
					}
				}
				return result;
			},

			_enableKeepButtons : function(validIds) {
				var keepStores = $('li.keeplistBtn01 > a');
				var keeplist = this;
				jQuery.each(keepStores, function() {
					var id = $(this).attr('id').substring(6, 16);
					if (jQuery.inArray(id, validIds) == -1) {
						keeplist._setKeepButtonEnabled(id, true);
					}
				});
			},

			_bindDelButtonHover : function() {
				$('ul.userDataStatusOpen').find('img.hover').each(function() {
					var dot = $(this).attr('src').lastIndexOf('.');
					var totalLength = $(this).attr('src').length;
					$(this).hover(
						function() {
							var imgsrc_on = $(this).attr('src').substr(0, dot) + '_on' + $(this).attr('src').substr(dot, totalLength);
							$(this).attr('src', imgsrc_on);
						},
						function() {
							var imgsrc = $(this).attr('src').replace('_on', '');
							$(this).attr('src', imgsrc);
						}
					);
				});
			}

		}, // keep end

		keepStoreList: {
			ON_LOAD_ENABLED: true,
			IDS_COOKIE_NAME: 'HPR_K_STORE_IDS',
			GET_STORES_URL: '/CSP/common/ajaxJson',
			MAX_STORE: 10,
			STORES_ELM_ID: 'li.navList',

			// keepStoreList.addStore
			addStore: function(sender, id) {
				sender.blur();
				if (hpr.tooltip.enabled) {
					return;
				}
				if (this._getCount() < this.MAX_STORE) {
					this._addStore(id);
					var filename = '/SYS/cmn/images/common/dialog/balloon_keep.gif';
					var width = '99';
					var height = '79';
				} else {
					var filename = '/SYS/cmn/images/common/dialog/balloon_keep_full.gif';
					var width = '141';
					var height = '89';
				}
				hpr.tooltip.show(sender, filename, width, height);
				hpr.tooltip.remove(2000);
			},

			// keepStoreList.removeStore
			removeStore : function(id) {
				var ids = this._getStoreIds();
				var i = ids.length;
				while (i-- > 0) {
					if (ids[i] == id) {
						ids.splice(i, 1);
					}
				}
				this._setStoreIds(ids);

				this._setKeepButtonEnabled(id, true);
				$('#keepStore' + id).remove();

				var keepStores = $(this.STORES_ELM_ID).find('ul.boxInner>li.itemBox');
				if (keepStores.size() == 0) {
					this._showNoStore();
				}
			},

			// keepStoreList.show
			show: function() {
				var ids = this._getStoreIds();
				if (ids.length == 0) {
					this._showNoStore();
				} else {
					var keepStoreList = this;
					jQuery.each(ids, function() {
						keepStoreList._setKeepButtonEnabled(this, false);
					});
				}
			},

			// keepStoreList.expandList
			expandList: function() {
				this.showStores();
			},

			expandList: function(callback) {
				var ids = this._getStoreIds();
				this._showStores(ids, callback);
			},

			// keepStoreList.showStores
			showStores: function(){
				var ids = this._getStoreIds();
				this._showStores(ids, null);
			},

			_getStoreIds: function() {
				var storeIds = '';
				try {
					storeIds = $.cookie(this.IDS_COOKIE_NAME);
				} catch(e) {
					this._removeAllStore();
				}
				var ids = storeIds ? storeIds.split(',') : [];
				return ids;
			},

			_setStoreIds: function(ids) {
				$.cookie(this.IDS_COOKIE_NAME,
					ids.join(','), {expires:10*365, path:'/'});
			},

			_getCount: function() {
				return this._getStoreIds().length;
			},

			_addStore: function(id){
				var ids = this._getStoreIds();
				var i = ids.length;
				while (i-- > 0) {
					if (ids[i] == id) {
						ids.splice(i, 1);
					}
				}
				ids.unshift(id);
				this._setStoreIds(ids);
				this._showStores(ids, null);
			},

			_setKeepButtonEnabled: function (id, enabled) {
				function getStyle(enabled) {
					return enabled ? 'visible' : 'hidden'
				}

				var link = $('#linkID' + id);
				if (link.size()) {
					$('*[id=linkID' + id + ']').css('visibility', getStyle(enabled));
				} else {
					$('*[id=linkID' + id + '_01' + ']').css('visibility', getStyle(enabled));
					$('*[id=linkID' + id + '_02' + ']').css('visibility', getStyle(enabled));
				}
			},

			_removeAllStore: function() {
				$.cookie(this.IDS_COOKIE_NAME, '', {expires:10*365, path:'/'});
			},

			_showNoStore: function() {
				var html = [];
				html.push('<li class="noItem">ボタンをおして気に入ったお店を検討リストへ保存しておくことが出来ます。</li>');
				$(this.STORES_ELM_ID).find('ul.boxInner').html(html.join(''));
			},

			_isUnique : function(ids) {
				var len = ids.length;
				for (var i = 0; i < len; i++) {
					for (var j = i + 1; j < len; j++) {
						if (ids[i] == ids[j]) {
							return false;
						}
					}
				}
				return true;
			},

			_showStores : function(ids, callback) {
				var keepStoreList = this;
				if ($(keepStoreList.STORES_ELM_ID).find('div.dn').length == 0) {
					return;
				}

				if (!keepStoreList._isUnique(ids)) {
					keepStoreList._removeAllStore();
					keepStoreList._showNoStore();
					return;
				}
				if (ids == null || ids.length == 0) {
					keepStoreList._showNoStore();
					if (callback) {
						callback();
					}
					return;
				}

				jQuery.each(ids, function() {
					keepStoreList._setKeepButtonEnabled(this, false);
				});
				$.ajax({
					url: this.GET_STORES_URL,
					dataType: 'json',
					cache: false,
					success: function(result, textStatus, jqXHR) {
						if (jqXHR.status == '200') {
							var stores = keepStoreList._intersection(ids, result.items);
							var validIds = [];
							if (stores.length == 0) {
								keepStoreList._showNoStore();
							} else {
								var html = [];
								var len = stores.length > keepStoreList.MAX_STORE ? keepStoreList.MAX_STORE: stores.length;
								for (var i = 0; i < len; i++ ) {
									var store = stores[i];
									keepStoreList._pushStoreContent(html, store);
									validIds.push(store.storeId);
								}
								if (len > 0) {
									html.push('<li class="listLast-child">');
									html.push('<a href="javascript:void(0);" onclick="javascript:window.open(\'/CSP/dcs010/\', \'keep\', \'width=830, menubar=yes, toolbar=yes, location=yes, status=yes, resizable=yes, scrollbars=yes\'); return false;">お店を比較する</a>');
									html.push('</li>');
								}
								$(keepStoreList.STORES_ELM_ID).find('ul.boxInner').html(html.join(''));
							}
							keepStoreList._setStoreIds(validIds);

							// 画面にはあるが、cookieにはないお店をキープ可能にする(削除されたお店をキープできるようにする)
							keepStoreList._enableKeepButtons(validIds);

							updateView();
						} else {
							var storesElm = $(keepStoreList.STORES_ELM_ID).find('ul.boxInner');
							storesElm.children().remove();
							var html = [];
							html.push('<li class="noItem">キープリストの追加に失敗しました</li>');
							$(storesElm).html(html.join(''));
						}

						if (callback) {
							callback();
						}
					},
					error: function(jqXHR, textStatus, errorThrown) {
						var storesElm = $(keepStoreList.STORES_ELM_ID).find('ul.boxInner');
						storesElm.children().remove();
						var html = [];
						html.push('<li class="noItem">キープリストの追加に失敗しました</li>');
						$(storesElm).html(html.join(''));

						if (callback) {
							callback();
						}
					}
				});
			},

			_pushStoreContent: function(html, store) {
				html.push('<li class="itemBox cFix" id="keepStore' + store.storeId + '">');
				if (store.storeStateKbn != '2') {
					var scclickParam = store.storeStateKbn == "1" ? "1" : "0";
					html.push('<a href="'+ store.storeUrl +'" onclick="SCClick_toriKeepClick(\''+store.storeId+'\',\''+ scclickParam +'\');">');
				} else {
					html.push('<span>');
				}

				// 有料店以外(掲載落ち,Mapple,Dokoiku)
				html.push('<p class="headerNavFigure">');
				if (store.storeStateKbn == '1') {
					if (store.topPhotoImgId != '') {

						html.push('<img width="40" height="40" src="'+ store.topPhotoImgId +'" alt="' + store.storeSeoName.replace(/"/g, '&quot;') + 'の写真" />');
					} else {
						html.push('<img width="40" height="40" src="/SYS/yoyaku/images/noimage.png" alt="" />');
					}
				} else {
					html.push('<img width="40" height="40" src="/SYS/yoyaku/images/noimage.png" alt="" />');
				}
				html.push('</p>');
				html.push('<ul class="headerNavCaption">');
				html.push('<li>' + store.middleAreaName + '</li>');
				html.push('<li>' + store.genreCatch + '</li>');
				if (store.storeStateKbn != "2") {
					html.push('<li class="shopName">' + store.storeName + '</li>');
				} else {
					html.push('<li>' + store.storeName + '</li>');
					html.push('<li class="noData">掲載情報がありません</li>');
				}
				html.push('</ul>');
				if (store.storeStateKbn != '2') {
					html.push('</a>');
				} else {
					html.push('</span>');
				}
				// \n入れないと削除ボタンが左に寄ってしまう
				html.push('\n<p class="headerNavListRight">');
				html.push('<a href="javascript:void(0);" class="closeItem" data-store-id="' + store.storeId + '">');
				html.push('<img width="18" height="18" src="/SYS/yoyaku/images/btn_gray_close.png" alt="" class="hover" />');
				html.push('</a>');
				html.push('</p>');
				html.push('</li>');
			},

			_intersection: function(ids, stores) {
				var result = [];
				var idsLen = ids.length;
				var storesLen = stores.length;
				for (var i = 0; i < idsLen; i++) {
					for (var j = 0; j < storesLen; j++) {
						if (ids[i] == stores[j].storeId) {
							result.push(stores[j]);
							break;
						}
					}
				}
				return result;
			},

			_enableKeepButtons : function(validIds) {
				var keepStores = $('p.iconSaveList > a');
				var keepStoreList = this;
				jQuery.each(keepStores, function() {
					var id = $(this).attr('id').substring(6, 16);
					if (jQuery.inArray(id, validIds) == -1) {
						keepStoreList._setKeepButtonEnabled(id, true);
					}
				});
			}
		}, // keepStoreList end

		history: {
			GET_STORES_URL: "/CSP/common/ajaxFindStoreForHistory",

			// history.deleteAll
			deleteAll: function() {
	    		$.cookie('HPR_H_STORE_IDS', null , {path:'/'} );
				$("#newlyShop").remove();
			},

			// history.expandList
			expandList: function() {
				$("#newlyShop p.userDataSwitch").remove();
				this._showStores();
			},

			// history.shrinkList
			shrinkList: function() {
				$('div#newlyShop p.userDataSwitch').remove();
				$('div#newlyShop ul.shopHistoryList').remove();
				html = []
				html.push('<p class="userDataSwitch">');
				html.push('<a href="javascript:void(0)" onclick="hpr.history.expandList(); return false;" class="udCloseInner iconPlusCircleGray">最近見たお店を見る</a>');
				html.push('</p>');
				this._setStoreInfoHtml(html);
			},

			_showStores: function() {
				$.ajax({
					url: this.GET_STORES_URL,
					dataType: "json",
					cache: false,
					success : function(stores) {
						if (stores.length == 0) {
							hpr.history._showNoStore();
						} else {
							var html = [];
							html.push('<ul class="userDataStatusOpen shopHistoryList">');
							$.each(stores, function() {
								html.push('<li>');
								html.push('<p class="fs10">' + this.middleAreaName + '</p>');
								html.push('<p class="fs12">');
								var published = this.storeStateKbn != '2';
								var scclickParam = this.storeStateKbn == '1' ? '1' : '0';
								if (published) {
									html.push('<a href="' + this.storeUrl + '" onclick="SCClick_saikinStoreClick(\''+ this.storeId + '\', \'' + scclickParam + '\');">');
								}
								html.push(this.storeName);
								if (published) {
									html.push('</a>');
								}
								html.push('</p>');
								if (!published) {
									html.push('<p>掲載情報がありません</p>');
								}
								html.push('</li>');
							});
							html.push('</ul>');
							html.push('<p class="userDataSwitch">');
							html.push('<a href="javascript:void(0);" onclick="hpr.history.shrinkList();" class="udCloseInner iconMinusCircleGray">最近見たお店を閉じる</a>');
							html.push('</p>');
							hpr.history._setStoreInfoHtml(html);
						}
					},

					error: function() {
						hpr.history._setStoreInfoHtml('<p>最近見たお店の表示に失敗しました。</p>');
					}
				});
			},

			_setStoreInfoHtml: function(html) {
				$("#newlyShop div.userDataInnerContents").append(html.join(""));
			},

			_showNoStore: function() {
				$('#newlyShop').remove();
			}

		}, // history end

		storeHistory: {
			ON_LOAD_ENABLED: true,
			IDS_COOKIE_NAME: 'HPR_H_STORE_IDS',
			GET_STORES_URL: '/CSP/common/ajaxFindStoreForHistory',
			STORES_ELM_ID: 'li.navHistory',

			// storeHistory.deleteAll
			deleteAll: function() {
	    		$.cookie(this.IDS_COOKIE_NAME, null, {path:'/'});
				hpr.storeHistory._showNoStore();
			},

			// storeHistory.expandList
			expandList: function() {
				this._showStores();
			},

			_showStores: function() {
				if ($(this.STORES_ELM_ID).find('div.dn').length == 0) {
					return;
				}

				$.ajax({
					url: this.GET_STORES_URL,
					dataType: 'json',
					cache: false,
					success: function(stores, textStatus, jqXHR) {
						if (jqXHR.status == '200') {
							if (stores.length == 0) {
								hpr.storeHistory._showNoStore();
							} else {
								var html = [];
								$.each(stores, function() {
									html.push('<li class="itemBox cFix">');
									if (this.storeStateKbn != '2') {
										// 有料店・無料店で分ける
										var scclickParam = this.storeStateKbn == '1' ? '1' : '0';
										html.push('<a href="' + this.storeUrl + '" onclick="SCClick_saikinStoreClick(\''+ this.storeId + '\', \'' + scclickParam + '\');">');
									} else {
										html.push('<span>');
									}

									// 有料店以外(掲載落ち,Mapple,Dokoiku)
									html.push('<p class="headerNavFigure">');
									if (this.storeStateKbn == '1') {
										if(this.topPhotoImgId != '') {
											html.push('<img width="40" height="40" src="'+ this.topPhotoImgId +'" alt="' + this.storeSeoName.replace(/"/g, '&quot;') + 'の写真" />');
										} else {
											html.push('<img width="40" height="40" src="/SYS/yoyaku/images/noimage.png" alt="" />');
										}
									} else {
										html.push('<img width="40" height="40" src="/SYS/yoyaku/images/noimage.png" alt="" />');
									}
									html.push('</p>');
									html.push('<ul class="headerNavCaption">');
									html.push('<li>' + this.middleAreaName + '</li>');
									html.push('<li>' + this.genreCatch + '</li>');
									if (this.storeStateKbn != '2') {
										html.push('<li class="shopName">' + this.storeName + '</li>');
									} else {
										html.push('<li>' + this.storeName + '</li>');
										html.push('<li class="noData">掲載情報がありません</li>');
									}
									html.push('</ul>');
									if (this.storeStateKbn != '2') {
										// 有料店・無料店で分ける
										html.push('</a>');
									} else {
										html.push('</span>');
									}
									html.push('</li>');
								});
								html.push('<li class="historyLast-child"><a href="javascript:void(0)" class="deleteAllItem"><img width="51" height="18" src="/SYS/yoyaku/images/btn_history_close.png" alt="全削除" class="hover" /></a></li>');
								hpr.storeHistory._setStoreInfoHtml(html);

								updateView();
							}
						} else {
							var html = [];
							html.push('<li class="noItem">最近見たお店の表示に失敗しました</li>');
							hpr.storeHistory._setStoreInfoHtml(html);
						}
					},
					error: function(jqXHR, textStatus, errorThrown) {
						var html = [];
						html.push('<li class="noItem">最近見たお店の表示に失敗しました</li>');
						hpr.storeHistory._setStoreInfoHtml(html);
					}
				});
			},

			_setStoreInfoHtml: function(html) {
				$(this.STORES_ELM_ID).find('ul.boxInner').html(html.join(''));
			},

			_showNoStore: function() {
				var html = [];
				html.push('<li class="noItem">最近見たお店はありません</li>');
				hpr.storeHistory._setStoreInfoHtml(html);
			}
		}, // storeHistory end

		favorite: {

			store: {
				// favoriteStoreFront.add
				add: function(id, isStorePage, fwNo, SP, CN, RN, OM, tokenKey, tokenValue, params) {
					if (hpr.tooltip.enabled) return;
					hpr.tooltip.enabled = true;

					if ((typeof fwNo == 'undefined' || fwNo === null) || fwNo === '') {
						fwNo = '01';
					}

					var paramStr = 'SP=' + SP;
					if (fwNo == '07') {
						paramStr='SP=' + SP + '&CN=' + CN;
					} else if (fwNo == '12' || fwNo == '14') {
						paramStr='SP=' + SP + '&RN=' + RN + '&OM=' + OM;
					}

					if (typeof params !== "undefined") {
						var paramStr2 = $.param(hpr.util.removeEmptyProp(params));
						if (paramStr2 != "") {
							paramStr = paramStr + '&' + paramStr2;
						}
					}
					var sender = $('#' + id);
					sender.blur();

					hpr.tooltip.show(sender, '/SYS/cmn/images/common/dialog/balloon_processing.gif', 141, 49);

					var store = this;

					setTimeout(function() {
						$.ajax({
							type: 'GET',
							url: '/CSP/dfs020/ajaxAddFavoriteStore',
							data: 'SP=' + SP + '&' + tokenKey + '=' + tokenValue ,
							success: function(result) {
								if (result == 'success') {
									hpr.tooltip.remove(0);
									setTimeout(function(){
										store._showSuccess(sender, id, isStorePage);
										hpr.tooltip.enabled = false;
									}, 500);
								} else if (result == 'not_login') {
									hpr.tooltip.remove(0);
									tb_open('ブックマークに追加', '/CSP/dlg020/?height=230&width=300&modal=true&FW='+fwNo+'&' + paramStr, false, 'selectBox');
									hpr.tooltip.enabled = false;
								} else {
									hpr.tooltip.remove(0);
									setTimeout(function(){
										store._showFailure(sender);
										hpr.tooltip.enabled = false;
									}, 500);
								}
							},
							error: function() {
								hpr.tooltip.remove(0);
								setTimeout(function(){
									store._showFailure(sender);
									hpr.tooltip.enabled = false;
								}, 500);
							}
						})
					}, 500);
				},
				addBookmark: function(id, isStorePage, fwNo, SP, CN, RN, OM, tokenKey, tokenValue, params) {
					if (hpr.addTooltip.enabled) return;
					hpr.addTooltip.enabled = true;

					if ((typeof fwNo == 'undefined' || fwNo === null) || fwNo === '') {
						fwNo = '01';
					}

					var paramStr = 'SP=' + SP;
					if (fwNo == '07') {
						paramStr='SP=' + SP + '&CN=' + CN;
					} else if (fwNo == '12' || fwNo == '14') {
						paramStr='SP=' + SP + '&RN=' + RN + '&OM=' + OM;
					}

					if (typeof params !== "undefined") {
						var paramStr2 = $.param(hpr.util.removeEmptyProp(params));
						if (paramStr2 != "") {
							paramStr = paramStr + '&' + paramStr2;
						}
					}
					var sender = $('#' + id);
					sender.blur();

					hpr.addTooltip.show(sender, '/SYS/cmn/images/front_002/img_bookmark_processing.gif', 220, 68);

					var store = this;

					setTimeout(function() {
						$.ajax({
							type: 'GET',
							url: '/CSP/dfs020/ajaxAddFavoriteStore',
							data: 'SP=' + SP + '&' + tokenKey + '=' + tokenValue ,
							success: function(result) {
								if (result == 'success') {
									hpr.addTooltip.remove(0);
									setTimeout(function(){
										store._showSuccess(sender, id, isStorePage);
										hpr.addTooltip.enabled = false;
									}, 500);
								} else if (result == 'not_login') {
									hpr.addTooltip.remove(0);
									tb_open('ブックマークに追加', '/CSP/dlg020/auth?height=250&width=416&modal=true&FW='+fwNo+'&' + paramStr, false, 'jscAddListThickBox', true);
									hpr.addTooltip.enabled = false;
								} else {
									hpr.addTooltip.remove(0);
									setTimeout(function(){
										store._showFailure(sender);
										hpr.addTooltip.enabled = false;
									}, 500);
								}
							},
							error: function() {
								hpr.addTooltip.remove(0);
								setTimeout(function(){
									store._showFailure(sender);
									hpr.addTooltip.enabled = false;
								}, 500);
							}
						});
					}, 1000);
				}, // addBookmark

				_showSuccess: function(sender, id, isStorePage) {
					hpr.tooltip.show(sender, '/SYS/cmn/images/common/dialog/balloon_diary.gif', 99, 79);
					if (isStorePage) {
						$("a#add0").css("visibility","hidden");
						$("a#add1").css("visibility","hidden");
						$("a#add2").css("visibility","hidden");
					} else {
						$("a#" + id).css("visibility","hidden");
					}
					hpr.tooltip.remove(2000);
				},

				_showFailure: function(sender) {
					hpr.tooltip.show(sender, '/SYS/cmn/images/common/dialog/balloon_error.gif', 141, 89);
					hpr.tooltip.remove(2000);
				},

				deleteStores: function(tokenKey, tokenValue, params) {
					var spList = new Array();
					$("input.chkBtn:checked").each(function (i) {
						spList[i] = $(this).attr("value");
					});
					var params = $.extend({'SPS': spList}, params);

					location.href = $('li.deleteAllBtn a').attr("href") + '?' + tokenKey + '=' + tokenValue + '&' + $.param(params);

					return false;
				},

				confirmDelete: function(params) {
					var length = $("input.chkBtn:checked").length;
					if (length == 0) {
						tb_open('', '/CSP/dfs020/showDfs02040?height=250&width=416&modal=true', false, 'selectBox');
					} else {
						tb_open('', '/CSP/dfs020/showDfs02030?height=250&width=416&modal=true&' + $.param(params), false, 'selectBox');
					}
					return false;
				}

			}, // favorite.store

			member: {
				CAPTION : 'お気に入りのレポーター追加',
				processing: false,
				add: function (id, OM, tokenKey, tokenValue, loginParams) {
					if (hpr.favorite.member.processing) return;
					hpr.favorite.member.processing = true;
					ids = id.split(",");
					var selector = $('#' + ids[0]);
					selector.blur();
					showTooltip(ids[0], '/SYS/cmn/images/common/dialog/balloon_processing.gif', 141, 49);

					setTimeout(function() {
						$.ajax({
							type: 'GET',
							url: '/CSP/dfp020/ajaxAddFavoriteMember',
							data: 'OM=' + OM + '&' + tokenKey + '=' + tokenValue,
							success: function(result) {
								if (result == 'success') {
									removeTooltip(0);
									selector.parent().wrapInner("<span></span>");
									selector.parent().css("visibility","hidden");
									setTimeout(function(){
										hpr.favorite.member.showSuccess(ids[0])
										hpr.favorite.member.processing = false;
									}, 500);
									for (var i = 1; i < ids.length; i++) {
										selector = $('#' + ids[i]);
										selector.parent().wrapInner("<span></span>");
										selector.parent().css("visibility","hidden");
									}
								} else if (result == 'failure') {
									removeTooltip(0);
									setTimeout(function(){
										hpr.favorite.member.showFailure(ids[0])
										hpr.favorite.member.processing = false;
									}, 500);
								} else if (result == 'not_login') {
									removeTooltip(0);
									tb_open(hpr.favorite.member.CAPTION, '/CSP/dlg020/?height=233&width=300&modal=true&'
											+ $.param(hpr.util.removeEmptyProp(loginParams)), false, 'selectBox');
									hpr.favorite.member.processing = false;
								} else if (result == 'not_unified') {
									removeTooltip(0);
									location.href = '/CSP/dlg020/migrate?'
										+ $.param(hpr.util.removeEmptyProp(loginParams));
								} else {
									removeTooltip(0);
									setTimeout(function(){
										hpr.favorite.member.showFailure(ids[0])
										hpr.favorite.member.processing = false;
									}, 500);
								}
							},
							error: function() {
								removeTooltip(0);
								setTimeout(function(){
									hpr.favorite.member.showFailure(ids[0])
									hpr.favorite.member.processing = false;
								}, 500);
							}
						})
					}, 500);
				},
				showSuccess : function(id) {
					showTooltip(id, '/SYS/cmn/images/common/dialog/balloon_diary.gif', 99, 79);
					removeTooltip(2000);
				},
				showFailure : function(id) {
					showTooltip(id, '/SYS/cmn/images/common/dialog/balloon_error.gif', 141, 89);
					removeTooltip(2000);
				}
			}, // favorite.member
			// お気に入りのレポーター追加 新トンマナ
			reportMember: {
				CAPTION : 'お気に入りのレポーター追加',
				processing: false,
				add: function (id, OM, tokenKey, tokenValue, loginParams) {
					if (hpr.favorite.member.processing) return;
					hpr.favorite.member.processing = true;
					if (hpr.addTooltip.enabled) return;
					hpr.addTooltip.enabled = true;
					ids = id.split(",");
					var selector = $('#' + ids[0]);
					selector.blur();
					hpr.addTooltip.show(selector, '/SYS/cmn/images/front_002/img_bookmark_processing.gif', 220, 68);

					setTimeout(function() {
						$.ajax({
							type: 'GET',
							url: '/CSP/dfp020/ajaxAddFavoriteMember',
							data: 'OM=' + OM + '&' + tokenKey + '=' + tokenValue,
							success: function(result) {
								if (result == 'success') {
									hpr.addTooltip.remove(0);
									selector.parent().wrapInner("<span></span>");
									selector.parent().css("visibility","hidden");
									setTimeout(function(){
										hpr.favorite.member.showSuccess(ids[0]);
										hpr.favorite.member.processing = false;
										hpr.addTooltip.enabled = false;
									}, 500);
									for (var i = 1; i < ids.length; i++) {
										selector = $('#' + ids[i]);
										selector.parent().wrapInner("<span></span>");
										selector.parent().css("visibility","hidden");
									}
								} else if (result == 'failure') {
									hpr.addTooltip.remove(0);
									setTimeout(function(){
										hpr.favorite.member.showFailure(ids[0]);
										hpr.favorite.member.processing = false;
										hpr.addTooltip.enabled = false;
									}, 500);
								} else if (result == 'not_login') {
									hpr.addTooltip.remove(0);
									tb_open(hpr.favorite.member.CAPTION, '/CSP/dlg020/?height=300&width=416&modal=true&'
										+ $.param(hpr.util.removeEmptyProp(loginParams)), false, 'jscAddListThickBox', 'true');
									hpr.favorite.member.processing = false;
									hpr.addTooltip.enabled = false;
								} else if (result == 'not_unified') {
									hpr.addTooltip.remove(0);
									location.href = '/CSP/dlg020/migrate?'
										+ $.param(hpr.util.removeEmptyProp(loginParams));
								} else {
									hpr.addTooltip.remove(0);
									setTimeout(function(){
										hpr.favorite.member.showFailure(ids[0]);
										hpr.addTooltip.enabled = false;
									}, 500);
								}
							},
							error: function() {
								hpr.addTooltip.remove(0);
								setTimeout(function(){
									hpr.favorite.member.showFailure(ids[0]);
									hpr.favorite.member.processing = false;
									hpr.addTooltip.enabled = false;
								}, 500);
							}
						})
					}, 500);
				},
				showSuccess : function(id) {
					showTooltip(id, '/SYS/cmn/images/common/dialog/balloon_diary.gif', 99, 79);
					hpr.addTooltip.remove(0);
				},
				showFailure : function(id) {
					showTooltip(id, '/SYS/cmn/images/common/dialog/balloon_error.gif', 141, 89);
					hpr.addTooltip.remove(0);
				}
			} // favorite.reportMember
		}, // favorite

		report: {
			processing: false,
			post: function(id, FW, SP) {
				if (hpr.report.processing) return;
				hpr.report.processing = true;
				var sender = $('#' + id);
				sender.blur();
				$.ajax({
					type: 'GET',
					url: '/CSP/dar010/ajaxPostReport',
					data: '',
					success: function(result) {
						if (result == 'ok') {
							location.href = '/CSP/drr011/?SP=' + SP;
						} else if (result == 'not_login') {
							tb_open("おすすめレポートを投稿", '/CSP/dlg020/?height=233&width=300&modal=true&FW=' + FW + '&SP=' + SP, false, 'selectBox');
						} else if (result == 'not_unified') {
							location.href = '/CSP/dlg020/migrate?FW=' + FW + '&SP=' + SP;
						}
						hpr.report.processing = false;
					},
					error: function() {
						hpr.report.processing = false;
						alert('処理に失敗しました。\nしばらく経ってから、再度お願いします。')
					}
				});
			}, // report.post
			postReport: function(id, FW, SP) {
				if (hpr.report.processing) return;
				hpr.report.processing = true;
				var sender = $('#' + id);
				sender.blur();
				$.ajax({
					type: 'GET',
					url: '/CSP/dar010/ajaxPostReport',
					data: '',
					success: function(result) {
						if (result == 'ok') {
							location.href = '/CSP/drr011/?SP=' + SP;
						} else if (result == 'not_login') {
							tb_open("おすすめレポートを投稿", '/CSP/dlg020/?height=250&width=416&modal=true&FW=' + FW + '&SP=' + SP, false,  'jscPostReportThickBox', true);
						} else if (result == 'not_unified') {
							location.href = '/CSP/dlg020/migrate?FW=' + FW + '&SP=' + SP;
						}
						hpr.report.processing = false;
					},
					error: function() {
						hpr.report.processing = false;
						alert('処理に失敗しました。\nしばらく経ってから、再度お願いします。')
					}
				});
			} // report.postReport
		}, // report

		search: {
			RW_PARAM_MAP: {
				"svc": "SA",
				"mac": "MA",
				"sma": "SM",
				"fac": "FA",
				"stc": "ST",
				"cb":  "CB",
				"fd":  "FD",
				"cn":  "CN",
				"ck":  "CK",
				"css": "CSS",
				"bgc": "BCS",
				"dnc": "DN",
				"dst": "DK",
				"fdc": "FC",
				"fdr": "FDR",
				"fds": "FDS",
				"ots": "OTS",
				"grc": "GR",
				"sgc": "SG",
				"swd": "FWT",
				"pof": "PF",
				"fcs": "FCS",
				"sk":  "SK",
				"bgn": "pn"
			},

			RULE_MAP: {
				"grc": [[["svc"], false, false],
						[["stc"], false, false],
						[["fdc"], false, false],
						[["grc"], false, false],
						[["sgc"], false, false],
						[["dst"], true,  false],
						[["bgc"], false, false],
						[["pof"], false, false],
						[["fcs"], false, false],
						[["ff", "imr"] , false, false],
						[["pre"], false, false],
						[["pts", "ptu"] , false, false]],
				"dnc": [[["svc"], false, false],
						[["stc"], false, false],
						[["dnc"], false, false],
						[["grc"], false, false],
						[["sgc"], false, false],
						[["bgc"], false, false],
						[["pof"], false, false],
						[["fcs"], false, false],
						[["ff", "imr"] , false, false],
						[["pts", "ptu"] , false, false]],
				"ck_css":
					   [[["svc"], false, false],
						[["stc"], false, false],
						[["ck", "css"], true, false],
						[["grc"], false, false],
						[["sgc"], false, false],
						[["dst"], false, false],
						[["bgc"], false, false],
						[["pof"], false, false],
						[["fcs"], false, false],
						[["ff", "imr"] , false, false],
						[["pts", "ptu"] , false, false]],
				"cb":  [[["svc"], false, false],
						[["stc"], false, false],
						[["cb"],  true,  false],
						[["fd", "cn", "fdr"], false, true],
						[["fds", "ots"], false, true],
						[["grc"], false, false],
						[["sgc"], false, false],
						[["dst"], false, true],
						[["ff", "imr"] , false, false],
						[["pts", "ptu"] , false, false],
						[["pof"], false, false]],
				"sk":  [[["svc"], false, false],
						[["stc"], false, false],
						[["sk", "swd"], false, false],
						[["grc"], false, false],
						[["sgc"], false, false],
						[["dst"], false, false],
						[["bgc"], false, false],
						[["pof"], false, false],
						[["fcs"], false, false],
						[["ff", "imr"] , false, false],
						[["pts", "ptu"] , false, false]],
				"brand_ck_css":
					   [[["ck", "css"], true, false],
						[["svc"], false, false],
						[["mac"], false, false]],
				"brand_cb":
					   [[["cb"], true, false],
					    [["fd", "cn"], false, true],
						[["svc"], false, false],
						[["mac"], false, false]],
				"brand_report":
					   [[["report"], true, false],
						[["svc"], false, false],
						[["mac"], false, false]],
				"brand_food":
					   [[["recommendedfood"], true, false],
						[["svc"], false, false],
						[["mac"], false, false]],
				"brand_atmosphere":
					   [[["atmosphere"], true, false],
						[["svc"], false, false],
						[["mac"], false, false]],
				"brand_catchword":
					   [[["catchword"], true, false],
						[["svc"], false, false],
						[["mac"], false, false]],
				"brand_policy":
					   [[["policy"], true, false],
						[["svc"], false, false],
						[["mac"], false, false]]
			},

			BASE_PARAM_FORM_ID: '#baseParamForm',
			FEATURE_FORM_ID: '#featureForm',
			COURSE_FEATURE_FORM_ID: '#courseFeatureForm',
			SEARCH_FORM_ID: '#searchForm',

			execute: function(paramMap, postParams, baseUrl) {
				var searchType = $('#searchType').val();
				var baseParamMap = this._getParamMapByForm(this.BASE_PARAM_FORM_ID);
				this.executeBySearchType(searchType, baseParamMap, paramMap, postParams, baseUrl);
			},

			executeBySearchType: function(searchType, baseParamMap, paramMap, postParams, baseUrl) {
				var rule = this.RULE_MAP[searchType];
				var url = "/";
				var paramNames, required, allOrNothing;
				$.each(rule, function(i, value) {
					paramNames = value[0];
					required = value[1];
					allOrNothing = value[2];
					url = hpr.search._appendUrlParam(url, hpr.search._getUrlParam(paramNames, baseParamMap, paramMap, required, allOrNothing));
				});

				var searchForm = $(this.SEARCH_FORM_ID);
				if (baseUrl != undefined) {
					url = baseUrl + url;
				}
				searchForm.attr('action', url);
				if (postParams.length > 0) {
					searchForm.append(this._getHiddenTags(postParams));
					searchForm.attr("method", "post");
				}
				searchForm.submit();
			},

			executeByFeature: function() {
				var paramMap = this._getFeatureParamMap();
				var postParams = [];
				var freeword = $('#featureFWT').val();
				var featureFlg = $('#FEFLG').val();
				postParams.push(['FWT', freeword]);
				postParams.push(['FEFLG', featureFlg]);
				this.execute(paramMap, postParams);
			},

			_getFeatureParamMap: function() {
				var paramMap = {};
				paramMap['ff'] = this._getCheckedValues(this.FEATURE_FORM_ID, 'FF');
				paramMap['imr'] = this._getCheckedValues(this.FEATURE_FORM_ID, 'IMR');
				paramMap['mcf'] = this._getCheckedValues(this.FEATURE_FORM_ID, 'scrCouponFlg');
				paramMap['pts'] = this._getCheckedValues(this.FEATURE_FORM_ID, 'PTS');
				paramMap['ptu'] = this._getCheckedValues(this.FEATURE_FORM_ID, 'PTU');
				paramMap['fcs'] = this._getCheckedValues(this.FEATURE_FORM_ID, 'FCS');
				return paramMap;
			},

			executeByCourseFeature: function() {
				var paramMap = this._getCourseFeatureParamMap();
				var postParams = [];
				this.execute(paramMap, postParams);
			},

			_getCourseFeatureParamMap: function() {
				var paramMap = {};
				var fd;
				var fdrValues;

				if($('#FD1').attr('checked')) {
					fd = "0";
				} else if($('#FD2').attr('checked')) {
					fd = "1";
				} else {
					fd = "";
				}
				if (fd == '1') {
					fdrValues = this._getCheckedValues(this.COURSE_FEATURE_FORM_ID, 'FDR');
				} else {
					fdrValues = [];
				}
				paramMap['fdr'] = fdrValues;
				paramMap['fds'] = this._getCheckedValues(this.COURSE_FEATURE_FORM_ID, 'FDS');
				paramMap['ots'] = this._getCheckedValues(this.COURSE_FEATURE_FORM_ID, 'OTS');
				paramMap['ff']  = this._getCheckedValues(this.COURSE_FEATURE_FORM_ID, 'FF');
				paramMap['imr'] = this._getCheckedValues(this.COURSE_FEATURE_FORM_ID, 'IMR');
				paramMap['pts'] = this._getCheckedValues(this.COURSE_FEATURE_FORM_ID, 'PTS');
				paramMap['ptu'] = this._getCheckedValues(this.COURSE_FEATURE_FORM_ID, 'PTU');
				paramMap['mcf'] = this._getCheckedValues(this.COURSE_FEATURE_FORM_ID, 'scrCouponFlg');
				paramMap['fd']  = [fd];
				return paramMap;
			},

			_getCheckedValues: function(formId, name) {
				var values = [];
				$(formId + " input[name='" + name + "']:checkbox:checked").each(function () {
					values.push($(this).val());
				});
				return values;
			},

			_getHiddenTags: function(params) {
				var s = "";
				$.each(params, function() {
					s += '<input type="hidden" name="' + this[0] + '" value="' + encodeURI(this[1]) + '"/>';
				});
				return s;
			},

			_getParamMapByForm: function (formId) {
				var paramMap = {};
				var name, value, values;
				$(formId + ' input:hidden').each(function() {
					name = $(this).attr('name');
					value =  $(this).val();
					values = paramMap[name]
					if (!(name in paramMap)) {
						values = [];
					}
					values.push(value);
					paramMap[name] = values;
				});
				return paramMap;
			},

			_getUrlParam: function (paramNames, baseParamMap, paramMap, required, allOrNothing) {
				var s = '';
				if (allOrNothing) {
					if (this._paramExists(paramNames, baseParamMap, paramMap)) {
						required = true;
					} else {
						return s;
					}
				}

				$.each(paramNames, function(i, name) {
					if (name in paramMap) {
						values = paramMap[this];
					} else if (name in baseParamMap) {
						values = baseParamMap[this];
					} else {
						values = [];
					}
					values.sort();
					if (values.length == 0 && required) {
						s += name + '_';
					} else {
						$.each(values, function() {
							s += name + encodeURIComponent(this) + '_';
						});
					}
				});
				if (s.length > 0) {
					s = s.substring(0, s.length - 1);
				}
				return s;
			},

			_paramExists: function (paramNames, baseParamMap, paramMap) {
				var name, values;
				for (var i = 0; i < paramNames.length; i++) {
					name = paramNames[i];
					if (name in paramMap) {
						values = paramMap[name];
					} else if (name in baseParamMap) {
						values = baseParamMap[name];
					} else {
						values = [];
					}
					for (var j = 0; j < values.length; j++) {
						if (values[j].length > 0) {
							return true;
						}
					}
				}
				return false;
			},

			_appendUrlParam: function (url, urlParam) {
				if (urlParam.length == 0) {
					return url;
				}
				return url + urlParam + '/';
			},

			_paramMapToString: function (map) {
				var s = '';
				$.each(map, function(name, value) {
					s += name + "=[" + hpr.search._arrayToString(value) + "], "
				});
				return s;
			},

			_arrayToString: function (array) {
				var s = '';
				$.each(array, function() {
					s += this + ', ';
				});
				return s;
			}

		}, // search end

		searchStruct: new function() {
			var svc = {name: 'svc'};
			var mac = {name: 'mac'};
			var stc = {name: 'stc'};
			var grc = {name: 'grc'};
			var sgc = {name: 'sgc'};
			var fdc = {name: 'fdc'};
			var ff = {name: 'ff', prefix: 'ff'};
			var imr = {name: 'imr', prefix: 'imr'};
			var pts = {name: 'pts', prefix: 'pts'};
			var ptu = {name: 'ptu', prefix: 'ptu'};
			var pre = {name: 'pre', prefix: 'pre'};
			var fcs = {name: 'fcs'};
			var bgc = {name: 'bgc'};
			var dst = {name: 'dst', prefix: 'dst'};
			var ck = {name: 'ck'};
			var css = {name: 'css'};
			var fd = {name: 'fd', prefix: 'fd'};
			var fdr = {name: 'fdr'};
			var fds = {name: 'fds'};
			var ots = {name: 'ots'};
			var cb = {name: 'cb'};
			var cn = {name: 'cn'};
			var dnc = {name: 'dnc', prefix: 'dnc'};
			var sac = {name: 'sac'};
			var pg = {name: 'pg'};
			var mcf = {name: 'mcf', prefix: 'mcf'};
			var pc = {name: 'pc'};

			var Rule = function(params, lstTarget) {
				this.params = params;
				this.lstTarget = !!lstTarget;
			};

			var RULE_MAP = {
				"grc":
					[new Rule([svc]),
					new Rule([mac]),
					new Rule([stc]),
					new Rule([fdc], true),
					new Rule([grc], true),
					new Rule([sgc], true),
					new Rule([fcs], true),
					new Rule([ff, imr, pre], true),
					new Rule([pts, ptu], true),
					new Rule([bgc], true),
					new Rule([dst], true)],
				"ck_css":
					[new Rule([svc]),
					new Rule([mac]),
					new Rule([stc]),
					new Rule([grc]),
					new Rule([sgc]),
					'coupon',
					new Rule([ck, css]),
					new Rule([fcs]),
					new Rule([ff, imr, pre]),
					new Rule([pts, ptu]),
					new Rule([bgc])],
				"dnc":
					[new Rule([svc]),
					new Rule([mac]),
					new Rule([stc]),
					new Rule([grc]),
					new Rule([sgc]),
					new Rule([dnc]),
					new Rule([fcs]),
					new Rule([ff, imr, pre]),
					new Rule([pts, ptu]),
					new Rule([bgc])],
				"cb":
					[new Rule([svc]),
					new Rule([mac]),
					new Rule([stc]),
					new Rule([grc]),
					new Rule([sgc]),
					'course',
					new Rule([fd, fdr, fds, ots]),
					new Rule([ff, imr, pre]),
					new Rule([pts, ptu]),
					new Rule([cb, cn]),
					new Rule([mcf], true)],
				"premium_basic_list":
					[new Rule([svc]),
					new Rule([mac]),
					new Rule([sac], true),
					new Rule([pg], true),
					new Rule([fcs], true),
					new Rule([ff, imr], true),
					new Rule([pts, ptu], true),
					new Rule([bgc], true),
					new Rule([mcf], true)],
				"premium_special_list":
					[new Rule([svc]),
					new Rule([mac]),
					new Rule([sac], true),
					new Rule([pg], true),
					new Rule([dnc], true),
					new Rule([fcs], true),
					new Rule([ff, imr], true),
					new Rule([pts, ptu], true),
					new Rule([bgc], true),
					new Rule([mcf], true)],
				"premium_course_list":
					[new Rule([svc]),
					new Rule([mac]),
					new Rule([sac], true),
					new Rule([pg], true),
					new Rule([pc], true),
					new Rule([fcs], true),
					new Rule([ff, imr], true),
					new Rule([mcf], true),
					new Rule([pts, ptu], true)],
				"premium_station_basic_list":
					[new Rule([svc]),
					new Rule([mac]),
					new Rule([stc]),
					new Rule([pg], true),
					new Rule([fcs], true),
					new Rule([ff, imr], true),
					new Rule([pts, ptu], true),
					new Rule([bgc], true),
					new Rule([mcf], true),
					new Rule([dst], true)],
				"premium_station_special_list":
					[new Rule([svc]),
					new Rule([mac]),
					new Rule([stc]),
					new Rule([pg], true),
					new Rule([dnc], true),
					new Rule([fcs], true),
					new Rule([ff, imr], true),
					new Rule([pts, ptu], true),
					new Rule([bgc], true),
					new Rule([mcf], true),
					new Rule([dst], true)],
				"premium_station_course_list":
					[new Rule([svc]),
					new Rule([mac]),
					new Rule([stc]),
					new Rule([pg], true),
					new Rule([pc], true),
					new Rule([fcs], true),
					new Rule([ff, imr], true),
					new Rule([pts, ptu], true),
					new Rule([mcf], true),
					new Rule([dst], true)]
			};

			var BASE_PARAM_FORM_ID = '#baseParamForm';
			var FEATURE_FORM_ID = '#featureForm';
			var COURSE_FEATURE_FORM_ID = '#courseFeatureForm';
			var SEARCH_FORM_ID = '#searchForm';

			this.execute = function(paramMap, postParams, baseUrl) {
				var searchType = $('#searchType').val();
				var baseParamMap = _getParamMapByForm(BASE_PARAM_FORM_ID);
				this.executeBySearchType(searchType, baseParamMap, paramMap, postParams, baseUrl);
			};

			this.executeBySearchType = function(searchType, baseParamMap, paramMap, postParams, baseUrl) {
				var rules = RULE_MAP[searchType];
				var url = "/";
				var hasLst;
				var macCount = 0;
				$.each(rules, function(i, rule) {
					if (rule instanceof Rule) {
						var val = _getUrlParam(rule.params, baseParamMap, paramMap)
						if(rule.params[0].name == 'mac'){
							macCount = _getMacCount(baseParamMap, paramMap)
						}
						if (rule.lstTarget) {
							if (typeof hasLst === 'undefined') {
								hasLst = !val;
							} else {
								hasLst = hasLst && !val;
							}
						}
						url = _appendUrlParam(url, val);
					}
					else {
						url = _appendUrlParam(url, rule);
					}
				});

				if (hasLst && macCount < 2) {
					url = _appendUrlParam(url, 'lst');
				}

				var searchForm = $(SEARCH_FORM_ID);
				if (baseUrl != undefined) {
					url = baseUrl + url;
				}
				searchForm.attr('action', url);
				if (postParams.length > 0) {
					searchForm.append(_getHiddenTags(postParams));
					searchForm.attr("method", "post");
				}
				searchForm.submit();
			};

			this.executeByPremiumFeature = function() {
				var paramMap = _getFeatureParamMap();
				var postParams = [];
				this.execute(paramMap, postParams, "/premium");
			};

			this.executeByFeature = function() {
				var paramMap = _getFeatureParamMap();
				var postParams = [];
				var freeword = $('#featureFWT').val();
				postParams.push(['FWT', freeword]);
				this.execute(paramMap, postParams);
			};

			var _getFeatureParamMap = function() {
				var paramMap = {};
				paramMap['ff'] = _getCheckedValues(FEATURE_FORM_ID, 'FF');
				paramMap['imr'] = _getCheckedValues(FEATURE_FORM_ID, 'IMR');
				paramMap['pts'] = _getCheckedValues(FEATURE_FORM_ID, 'PTS');
				paramMap['ptu'] = _getCheckedValues(FEATURE_FORM_ID, 'PTU');
				paramMap['fcs'] = _getCheckedValues(FEATURE_FORM_ID, 'FCS');
				paramMap['mcf'] = _getCheckedValues(FEATURE_FORM_ID, 'scrCouponFlg');
				return paramMap;
			};

			this.executeByCourseFeature = function() {
				var paramMap = _getCourseFeatureParamMap();
				var postParams = [];
				this.execute(paramMap, postParams);
			};

			var _getCourseFeatureParamMap = function() {
				var paramMap = {};
				var fd;
				var fdrValues;

				if($('#FD1').attr('checked')) {
					fd = "0";
				} else if($('#FD2').attr('checked')) {
					fd = "1";
				}
				if (fd == '1') {
					fdrValues = _getCheckedValues(COURSE_FEATURE_FORM_ID, 'FDR');
				}
				paramMap['fdr'] = (fdrValues) ? fdrValues : null;
				paramMap['fds'] = _getCheckedValues(COURSE_FEATURE_FORM_ID, 'FDS');
				paramMap['ots'] = _getCheckedValues(COURSE_FEATURE_FORM_ID, 'OTS');
				paramMap['ff']  = _getCheckedValues(COURSE_FEATURE_FORM_ID, 'FF');
				paramMap['imr'] = _getCheckedValues(COURSE_FEATURE_FORM_ID, 'IMR');
				paramMap['pts'] = _getCheckedValues(COURSE_FEATURE_FORM_ID, 'PTS');
				paramMap['ptu'] = _getCheckedValues(COURSE_FEATURE_FORM_ID, 'PTU');
				paramMap['mcf'] = _getCheckedValues(COURSE_FEATURE_FORM_ID, 'scrCouponFlg');
				paramMap['fd']  = (fd) ? [fd] : null;
				return paramMap;
			};

			var _getCheckedValues = function(formId, name) {
				var values = [];
				$(formId + " input[name='" + name + "']:checkbox:checked").each(function () {
					values.push($(this).val());
				});
				return values;
			};

			var _getHiddenTags = function(params) {
				var s = "";
				$.each(params, function() {
					s += '<input type="hidden" name="' + this[0] + '" value="' + encodeURI(this[1]) + '"/>';
				});
				return s;
			};

			var _getParamMapByForm = function (formId) {
				var paramMap = {};
				var name, value, values;
				$(formId + ' input:hidden').each(function() {
					name = $(this).attr('name');
					value =  $(this).val();
					values = paramMap[name]
					if (!(name in paramMap)) {
						values = [];
					}

					if (!!value) {
						values.push(value);
					}

					if (values.length != 0) {
						paramMap[name] = values;
					}
				});
				return paramMap;
			};

			var _getUrlParam = function (params, baseParamMap, paramMap) {
				var s = '';

				$.each(params, function(i, param) {
					var name = param.name;
					var prefix = ('prefix' in param) ? param.prefix : '';
					if (name in paramMap) {
						values = paramMap[name];
					} else if (name in baseParamMap) {
						values = baseParamMap[name];
					} else {
						values = [];
					}

					if (!values) {
						return true; // continue
					}
					values.sort();
					$.each(values, function() {
						s += prefix + encodeURIComponent(this) + '_';
					});
				});
				if (s.length > 0) {
					s = s.substring(0, s.length - 1);
				}
				return s;
			};

			var _getMacCount = function (baseParamMap, paramMap) {
				if ('mac' in paramMap) {
					return paramMap['mac'].length;
				} else if ('mac' in baseParamMap) {
					return baseParamMap['mac'].length;
				} else {
					return 0;
				}
			};

			var _appendUrlParam = function (url, urlParam) {
				if (urlParam.length == 0) {
					return url;
				}
				return url + urlParam + '/';
			};

		}, // searchStruct end

		searchOld: {
			PARAM_ARRAY: [
				["CK","ckc"],
				["CSS","csc"],
				["SA","svc"],
				["MA","mac"],
				["FA","fwc"],
				["SM","sac"],
				["GR","grc"],
				["SG","sgc"],
				["CN","cn"],
				["CB","cb"],
				["BCS","bgc"],
				["PF","pof"],
				["FD","fd"],
				["FF","ff"],
				["IMR","imr"],
				["FDR","fdr"],
				["FDS","fds"],
				["OTS","ots"],
				["PTS","pts"],
				["PTU","ptu"],
				["FCS","fcs"],
				["scrCouponFlg","mcf"]
			],

			execute: function(paramMap) {
				var url = document.getElementById("step").action;
				var baseParamMap = this._getParamMapByForm("#step");
				var paramArray = this.PARAM_ARRAY;

				for(var i = 0; i < paramArray.length; i++) {
					var append = false;
					for (var name in paramMap) {
						if(name == paramArray[i][0]) {
							var urlParam = "";
							var values = paramMap[name];
							values.sort();
							for(var j = 0; j < values.length; j++) {
								urlParam = this._appendUrlParam(urlParam, paramArray[i][1], values[j]);
							}
							if(urlParam != "") {
								url += urlParam;
							}
							append = true;
							break;
						}
					}
					if(!append) {
						for (var name in baseParamMap) {
							if(name == paramArray[i][0]) {
								var urlParam = "";
								var values = baseParamMap[name];
								values.sort();
								for(var j = 0; j < values.length; j++) {
									urlParam = this._appendUrlParam(urlParam, paramArray[i][1], values[j]);
								}
								if(urlParam != "") {
									url += urlParam;
								}
								break;
							}
						}
					}
				}
				url += ".html";
				location.href = url;
			},

			_getParamMapByForm: function (formId) {
				var paramMap = {};
				var name, value, values;
				$(formId + ' input:hidden').each(function() {
					name = $(this).attr('name');
					value =  $(this).val();
					values = paramMap[name]
					if (!(name in paramMap)) {
						values = [];
					}
					values.push(value);
					paramMap[name] = values;
				});
				return paramMap;
			},

			_appendUrlParam: function (urlParam, paramName, paramValue) {
				if(paramValue != "") {
					return urlParam + "_" + paramName + paramValue;
				} else {
					return urlParam;
				}
			}

		}, // searchOld end

		searchStructOld: {
			PARAM_ARRAY: [
				["SA",""],
				["MA",""],
				["SM",""],
				["GR",""],
				["SG",""],
				["FC",""]
			],

			PARAMS_COUPON: [
				[["CK",""],     ["CSS",""]],
				[["FCS",""]],
				[["FF","ff"], ["IMR","imr"]],
				[["PTS","pts"], ["PTU","ptu"]],
				[["BCS",""]],
				[["scrCouponFlg","mcf"]]
			],

			PARAMS_COURSE: [
				[["FD","fd"], ["FDR",""], ["FDS",""], ["OTS",""]],
				[["FF","ff"], ["IMR","imr"]],
				[["PTS","pts"],["PTU","ptu"]],
				[["CB",""], ["CN",""]],
				[["scrCouponFlg","mcf"]]
			],

			execute: function(paramMap) {
				var strCrsCupn = document.getElementById("step").action.match(/coupon|course/);
				var baseUrl = "";
				var extUrl = "";
				var baseParamMap = this._getParamMapByForm("#step");
				var paramArray = this.PARAM_ARRAY;
				var extParamsArray;
				var delimiter = "/";

				if("course" == strCrsCupn) {
					extParamsArray = this.PARAMS_COURSE;
				}else if("coupon" == strCrsCupn){
					extParamsArray = this.PARAMS_COUPON;
				}

				// baseUrl
				for(var i = 0; i < paramArray.length; i++) {
					var append = false;
					for (var name in paramMap) {
						if(name == paramArray[i][0]) {
							var urlParam = "";
							var values = paramMap[name];
							values.sort();
							for(var j = 0; j < values.length; j++) {
								var urlDelimiter = ((j == 0) ? delimiter : "_");
								urlParam = this._appendUrlParam(urlParam, paramArray[i][1], values[j], urlDelimiter);
							}
							if(urlParam != "") {
								baseUrl += urlParam;
							}
							append = true;
							break;
						}
					}
					if(!append) {
						for (var name in baseParamMap) {
							if(name == paramArray[i][0]) {
								var urlParam = "";
								var values = baseParamMap[name];
								values.sort();
								for(var j = 0; j < values.length; j++) {
									var urlDelimiter = ((j == 0) ? delimiter : "_");
									urlParam = this._appendUrlParam(urlParam, paramArray[i][1], values[j], urlDelimiter);
								}
								if(urlParam != "") {
									baseUrl += urlParam;
								}
								break;
							}
						}
					}
				} // baseUrl end
				// extUrl
				for(var i = 0; i < extParamsArray.length; i++) {
					var len = extUrl.length;
					for(var k = 0; k < extParamsArray[i].length; k++) {
						var append = false;
						for (var name in paramMap) {
							if(name == extParamsArray[i][k][0]) {
								var urlParam = "";
								var values = paramMap[name];
								values.sort();
								for(var j = 0; j < values.length; j++) {
									if("FD" != extParamsArray[i][k][0] || "0" != values[j]) {
										var urlDelimiter = "/";
										if (len < extUrl.length) {
											urlDelimiter = "_";
										} else {
											urlDelimiter = ((j == 0) ? delimiter : "_");
										}
										urlParam = this._appendUrlParam(urlParam, extParamsArray[i][k][1], values[j], urlDelimiter);
									}
								}
								if(urlParam != "") {
									extUrl += urlParam;
								}
								append = true;
								break;
							}
						}
						if(!append) {
							for (var name in baseParamMap) {
								if(name == extParamsArray[i][k][0]) {
									var urlParam = "";
									var values = baseParamMap[name];
									values.sort();
									for(var j = 0; j < values.length; j++) {
										if("FD" != extParamsArray[i][k][0] || "0" != values[j]) {
											var urlDelimiter = "/";
											if (len < extUrl.length) {
												urlDelimiter = "_";
											} else {
												urlDelimiter = ((j == 0) ? delimiter : "_");
											}
											urlParam = this._appendUrlParam(urlParam, extParamsArray[i][k][1], values[j], urlDelimiter);
										}
									}
									if(urlParam != "") {
										extUrl += urlParam;
									}
									break;
								}
							}
						}
					}
				} // extUrl end

				location.href = baseUrl + "/" + strCrsCupn + extUrl + "/";
			},

			_getParamMapByForm: function (formId) {
				var paramMap = {};
				var name, value, values;
				$(formId + ' input:hidden').each(function() {
					name = $(this).attr('name');
					value =  $(this).val();
					values = paramMap[name]
					if (!(name in paramMap)) {
						values = [];
					}
					values.push(value);
					paramMap[name] = values;
				});
				return paramMap;
			},

			_appendUrlParam: function (urlParam, paramName, paramValue, urlDelimiter) {
				if(paramValue != "") {
					return urlParam + urlDelimiter + paramName + paramValue;
				} else {
					return urlParam;
				}
			}

		}, // searchStructOld end

		quicksearch: {
			search: function(sa) {
				var url = this._getSearchUrl(sa);
				location.href = url;
			},
			_getSearchUrl: function(sa) {
				var ma = $('input[name="qs-ma"]:checked').val();
				var pg = $('input[name="qs-pg"]:checked').val();
				var prefix;
				var url = '/premium/' + sa + '/';

				if (ma) {
					url += ma + '/';
				}

				if (pg) {
					url += pg + '/';
				} else {
					url += 'lst/';
				}
				return url;
			},
			searchForStation: function(sa, ma, stc) {
				var url = this._getSearchUrlForStation(sa, ma, stc);
				location.href = url;
			},
			_getSearchUrlForStation: function(sa, ma, stc) {
				var cs = $("input:radio[name='qs-cs-sp']:checked").val();
				var dst = $("input:radio[name='qs-dst']:checked").val();
				var pg = $("input:radio[name='qs-pg']:checked").val();
				var prefix;
				var url = '/premium/' + sa + '/' + ma + '/' + stc + '/';

				if (pg) {
					url += pg + '/';
				}

				var cs0 = (cs) ? cs.charAt(0) : '';
				if (cs0 == 'C') {
					code = this._getCode(cs);
					url += code + '/';
				} else if (cs0 == 'S') {
					code = this._getCode(cs);
					url += "dnc" + code + '/';
				}

				if (dst) {
					url += 'dst' + dst + '/';
				}

				if (!cs && !pg && !dst) {
					url += 'lst/'
				}
				return url;
			},
			_getCode: function(value) {
				return value.split(':')[1];
			}
		}, // quicksearch end

		brandstore: {
			CONDITION_FORM_ID: '#conditionForm',

			putAreaParams: function (sa) {
				var saObj = $(this.CONDITION_FORM_ID).children("select[name='SA']");
				var sa;
				if (saObj.size() == 0) {
					sa2 = sa;
				} else {
					sa2 = saObj.val();
				}
				if (sa2 != '') {
					paramMap['svc'] = [sa2];
				}

				var maObj = $(this.CONDITION_FORM_ID).children("select[name='MA']");
				var ma;
				if (maObj.size() != 0) {
					ma = maObj.val();
					if (ma != '') {
						paramMap['mac'] = [ma];
					}
				}
			},
			putAreaParamsSp: function () {
				var saObj = $(this.CONDITION_FORM_ID).find("select[name='SA']");
				sa = saObj.val();
				if (sa != '') {
					paramMap['svc'] = [sa];
				}
				var maObj = $(this.CONDITION_FORM_ID).find("select[name='MA']");
				var ma;
				if (maObj.size() != 0) {
					ma = maObj.val();
					if (ma != '') {
						paramMap['mac'] = [ma];
					}
				}
			}
		}, // brandstore end
		dmenu : {
			setDmenuLink: function (id) {
				var ajaxUrl = "/CSP/dmenu/ajaxGetDmenuLinkText";
				$.ajax({
					type: "GET"
					,url: ajaxUrl
					,cache: false
					,dataType: "html"
					,timeout: 30000
					,success : function(data, status, xhr) {
						if(data != ""){
							$(id).removeClass("lastChild");
							$(id).after(data);
						}
					}
					,error : function(request, status, error) {
					}
				});
			}
		} // dmenu end
	}; // hpr end

	hpr.lunch = {
		zoom					: 17,
		lastProcessId			: null,
		eventTimeLag			: 1000,
		openInfoWindowTimeLag	: 1000,
		isOpenInfoWindow		: false,
		requestBaseurl			: "/CSP/psh030/ajaxJson",
		mapId					: "lunchMap",
		markerAry				: [],
		foodCd					: null,
		infoWindow				: null,

		loadLunchMap : function(x,y,fc){
			this.foodCd = fc;
			var options = {
				center: new google.maps.LatLng(y, x),
				zoom: this.zoom,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				panControl: true,
				zoomControl: true,
				streetViewControl: false,
				mapTypeControl: true,
				mapTypeControlOptions: {
					mapTypeIds: [
						google.maps.MapTypeId.ROADMAP,
						google.maps.MapTypeId.SATELLITE,
						google.maps.MapTypeId.HYBRID
					]
				},
				scaleControl: true,
				scrollwheel: true,
				keyboardShortcuts: false
			};

			this.map = new google.maps.Map($('#' + this.mapId).get(0), options);
			google.maps.event.addListener(this.map, "idle", this.eventHandler);


			google.maps.event.addListener(this.map, "click", this.closeInfoWindow);
			//this.getStoreList(1);
		},

		createStoreHtml : function(s,isMap,idx,pn){
			var html = [];
			var outerTag = "li";
			var link = "javascript:hpr.lunch.storeClick('"+s.storeId+"')";
			var onclick = "SCClick_sList('lunch_list','','','" + s.storeId + "','" + idx + "','" + pn + "');";
			if(isMap){
				outerTag = 'div';
				link = "/str"+s.storeId+"/";
			}
			html.push('<'+outerTag+' class="cFix">');
			html.push('<div class="leftImg"><div class="imgSpace">');
			if(s.atmospherePhotoImgId){
				html.push('<img src="'+s.atmospherePhotoImgId+'" alt="'+s.storeName+'の雰囲気1" width="58" height="58" />');
			}
			html.push('</div>');
			if(s.lunchCouponFlg){
				html.push('<p><img src="/SYS/cmn/images/common/icon_lunch_cp.gif" alt="ランチクーポン" width="58" height="15" /></p>');
			}
			html.push('</div>');
			html.push('<dl class="lunchSPInfo">');
			html.push('<dt><a href="'+link+'">'+s.storeName+'</a><span>('+s.parentGenreName+')</span></dt>');
			html.push('<dd>');
			if(s.favoriteCnt || s.reportCnt){
				html.push('<div class="reportNum">');
				if(s.favoriteCnt){
					html.push('ブックマーク<span>'+s.favoriteCnt+'</span>件　');
				}
				if(s.reportCnt){
					html.push('レポート<span>'+s.reportCnt+'</span>件');
				}
				html.push('</div>');
			}
			html.push('<dl class="lunchAccess cFix">');
			html.push('<dt><img src="/SYS/cmn/images/common/front/icon_access.gif"width="11" height="17" alt="アクセス"></dt>');
			html.push('<dd>'+s.accessPc+'</dd>');
			html.push('</dl>');
			html.push('<div class="cFix">');
			if(s.lunchPrice1){
				html.push('<dl class="lunchBudget cFix">');
				html.push('<dt><img src="/SYS/cmn/images/common/front/icon_budget.gif"width="16" height="15" alt="予算"></dt>');
				html.push('<dd>'+s.lunchPrice1+'</dd>');
				html.push('</dl>');
			}
			html.push('<p class="spLink"><a href="/str'+s.storeId+'/" onclick="'+onclick+'">お店詳細</a></p>');
			html.push('</div>');
			html.push('</dd>');
			html.push('</dl>');
			html.push('</'+outerTag+'>');
			return html.join('');
		},


		createStoreInfoWindowHtml : function(s,idx,pn){
			var html = [];
			var link = "/str"+s.storeId+"/";
			var onclick = "SCClick_sList('lunch_list','','','" + s.storeId + "','" + idx + "','" + pn + "');";
			html.push('<table class="mapLunchList cFix" style="margin-right: 10px;"><tr>');

			if(s.atmospherePhotoImgId || s.lunchCouponFlg){
				html.push('<td class="lunchCouponF">');
				if(s.atmospherePhotoImgId){
					html.push('<div class="imgSpace" style="background-image:url('+s.atmospherePhotoImgId+'); margin-bottom: 3px;"></div>');
				}
				if(s.lunchCouponFlg){
					html.push('<p><img src="/SYS/cmn/images/common/icon_lunch_cp.gif" alt="ランチクーポン" width="58" height="15" /></p>');
				}
				html.push('</td>');
			}
			html.push('<td class="lunchSPInfoBox">');
			html.push('<div style="margin-left: 5px;">');
			html.push('<dl>');
			html.push('<dt class="lunchSPInfoT"><a href="'+link+'" onclick="'+onclick+'">'+s.storeName+'</a><span>('+s.parentGenreName+')</span></dt>');
			html.push('<dd class="lunchSPInfoD">');
			if(s.favoriteCnt || s.reportCnt){
				html.push('<div class="reportNum">');
				if(s.favoriteCnt){
					html.push('お気に入り<span>'+s.favoriteCnt+'</span>件　');
				}
				if(s.reportCnt){
					html.push('レポート<span>'+s.reportCnt+'</span>件');
				}
				html.push('</div>');
			}
			html.push('<dl class="lunchAccess cFix">');
			html.push('<dt><div class="iconAccess"></div></dt>');
			html.push('<dd class="mapAccess">'+s.accessPc+'</dd>');
			html.push('</dl>');
			html.push('<div class="cFix">');
			if(s.lunchPrice1){
				html.push('<dl class="lunchBudget lunchBudgetMap cFix">');
				html.push('<dt><div class="iconBudget"></div></dt>');
				html.push('<dd>'+s.lunchPrice1+'</dd>');
				html.push('</dl>');
			}
			html.push('<p class="spLink"><a href="'+link+'" onclick="'+onclick+'">お店詳細</a></p>');
			html.push('</div>');
			html.push('</dd>');
			html.push('</dl>');
			html.push('</div>');

			html.push('</td></tr>');

			html.push('</table>');
			return html.join('');
		},

		plotMap : function(s,idx,pn){
			var point = new google.maps.LatLng(s.latitudeDeg,s.longitudeDeg);
			var html = [];


			html.push(this.createStoreInfoWindowHtml(s,idx,pn));

			var m = this.createMarker(point, html.join(''));
			m.html = html.join('');
			this.markerAry[s.storeId] = m;
			m.setMap(this.map);
		},

		plot : function(result){
			var sq = "'";
			var stores = result.items;
			var html = [];
			this.markerAry = [];
			if(stores.length > 0){
				html.push('<div class="lunchMapNum">検索結果 <span class="strong">'+result.totalHits+'</span>件中 <span class="number">'+result.minNum+'～'+result.maxNum+'</span>件を表示</div>');
				if(result.pPn || result.nPn){
					html.push('<div class="linearNav top"><ul class="cFix">')
					if(result.pPn){
						html.push('<li class="prev"><a href="javascript:hpr.lunch.getStoreList('+result.pPn+');">前へ</a></li>');
					}
					if(result.nPn){
						html.push('<li class="next"><a href="javascript:hpr.lunch.getStoreList('+result.nPn+');">次へ</a></li>');
					}
					html.push('</ul></div>')
				}
				html.push('<ol class="lunchShop">');
				for(i=0;i<stores.length;i++){
					var s = stores[i];
					var searchNumber = i + 1;
					this.plotMap(s,searchNumber,result.pn);
					html.push(this.createStoreHtml(s,false,searchNumber,result.pn));
				}
				html.push('</ol>')
				if(result.pPn || result.nPn){
					html.push('<div class="linearNav"><ul class="cFix">')
					if(result.pPn){
						html.push('<li class="prev"><a href="javascript:hpr.lunch.getStoreList('+result.pPn+');">前へ</a></li>');
					}
					if(result.nPn){
						html.push('<li class="next"><a href="javascript:hpr.lunch.getStoreList('+result.nPn+');">次へ</a></li>');
					}
					html.push('</ul></div>')
				}


			}else{
				html.push('<ol class="lunchShop">');
					html.push('<li class="none">ご希望のお店がありませんでした。<br />条件を変えて再検索してください。</li>');
				html.push('</ol>')
			}
			$("#lunchList").html(html.join(""));
		},

		getStoreList : function(page){
			var latLngBounds = this.map.getBounds();
			var sw = latLngBounds.getSouthWest();
			var ne = latLngBounds.getNorthEast();
			var url = this.requestBaseurl
						+ "?SLATD=" + sw.lat()
						+ "&WLOND=" + sw.lng()
						+ "&NLATD=" + ne.lat()
						+ "&ELOND=" + ne.lng()
						+ "&FC=" + this.foodCd
						+ "&pn=" + page;

			$.ajax({
				url : url,
				dataType : "json",
				cache : false,
				success : function(result) {
					hpr.lunch.clear();
					hpr.lunch.plot(result);
				},
				error : function() {
					var html = [];
					html.push('<li class="none">お店データの読み込みに失敗しました。</li>');
					$("#lunchList").html(html.join(""));
				}
			});
		},

		createMarker : function(point, html) {
			var m = new google.maps.Marker({
				position: point,
				icon: "/SYS/cmn/images/common/pin_03.gif"
			});
			google.maps.event.addListener(m, "click", function() {
				hpr.lunch.openInfoWindow(m,html);
			});
			return m;
		},

		clear : function(){
			for (var key in this.markerAry) {
				this.markerAry[key].setMap(null);
			}
		},

		storeClick : function(storeId){
			var m = this.markerAry[storeId];
			this.openInfoWindow(m,m.html);
		},

		eventHandler : function(){
			if( ! hpr.lunch.isOpenInfoWindow ){
				if(this.lastProcessId){
					clearTimeout(this.lastProcessId);
				}
				this.lastProcessId = setTimeout("hpr.lunch.getStoreList(1);", hpr.lunch.eventTimeLag);
			}
		},

		openInfoWindow : function(m,html){
			this.closeInfoWindow();
			hpr.lunch.isOpenInfoWindow = true;
			this.infoWindow = new google.maps.InfoWindow({
				content: html,
				maxWidth: 250
			});
			this.infoWindow.open(this.map, m);
			setTimeout("hpr.lunch.isOpenInfoWindow = false;", hpr.lunch.openInfoWindowTimeLag);
		},

		closeInfoWindow : function() {
			if (hpr.lunch.infoWindow != null) {
				hpr.lunch.infoWindow.close();
			};
		}
	} // hpr.lunch end

	hpr.spot = {

		defaultZoom				: 17,
		totalRecordNum			: 0,
		pageLinkMaxNum			: 10,
		spotListUrl				: "/CSP/psh030/ajaxJsonLandmarkList",
		spotStoreListUrl		: "/CSP/psh030/ajaxJsonLandmarkStoreList",
		markerIcon				: "/SYS/cmn/images/common/pin_03.gif",
		mapDivId				: "landmarkMap",
		map						: null,
		infoWindow				: null,
		bounds					: null,
		markerAry				: [],
		options					: {
			scaleControl : true,
			scrollwheel : true,
			streetViewControl : false,
			navigationControl : true,
			mapTypeControl : true
		},

		init : function(saCd, maCd, recNum) {
			var mapdiv = document.getElementById(this.mapDivId);

			this.options.mapTypeId = google.maps.MapTypeId.ROADMAP;
			this.map = new google.maps.Map(mapdiv, this.options);
			this.bounds = new google.maps.LatLngBounds();
			this.totalRecordNum = recNum;

			this.initSpotList(saCd, maCd);
			this.getSpotStoreList(saCd, maCd, 1);
		},

		initSpotList : function(saCd, maCd) {
			var params = new Array();

			if (saCd) { params.push("SA=" + saCd); }
			if (maCd) { params.push("MA=" + maCd); }
			var url = this.spotListUrl + "?" + params.join("&");

			$.ajax({
				url : url,
				dataType : "json",
				cache : false,
				success : function(result) {
					hpr.spot.plot(result);
					hpr.spot.initMap();
				},
				error : function() {
					var html = [];
					html.push('<ol class="landmarkShop">');
					html.push('<li class="none">ご希望のスポットがありませんでした。<br/>条件を変えて再検索してください。</li>');
					html.push('</ol>')
					$("#landmarkList").html(html.join(""));
				}
			});
		},

		initMap : function() {
			this.map.fitBounds(this.bounds);
			this.addModifiedZoom();
		},

		plot : function(result){
			var html = [];
			this.markerAry = [];

			html.push('<div class="landmarkNum">検索結果 <span class="strong">' + this.totalRecordNum + '</span>件</div>');
			if (result.length > 0) {
				html.push('<ol class="landmarkShop">');
				for (var i=0; i<result.length; i++) {
					var spot = result[i];
					if (spot.pinDeleteFlg != 1 && spot.latitudeWorldDeg && spot.longitudeWorldDeg) {
						this.plotMap(spot);
						html.push(this.createSpotInfoHtml(spot, false));
					} else {
						html.push('<li class="cFix">');
						html.push(this.createSpotInfoHtml(spot, true));
						html.push('</li>');
					}
				}
				html.push('</ol>')

			} else {
				html.push('<ol class="landmarkShop">');
				html.push('<li class="none">ご希望のスポットがありませんでした。<br/>条件を変えて再検索してください。</li>');
				html.push('</ol>')

			}
			$("#landmarkList").html(html.join(''));
		},

		plotMap : function(spot){
			var point = new google.maps.LatLng(spot.latitudeWorldDeg, spot.longitudeWorldDeg);
			var html = [];

			html.push(this.createSpotInfoWindowHtml(spot));

			var marker = this.createMarker(point, html.join(''));
			marker.html = html.join('');

			this.bounds.extend(point);
			this.markerAry[spot.landmarkAreaCd] = marker;
		},

		createMarker : function(latlng, html) {
			var marker = new google.maps.Marker({
				position : latlng,
				map : this.map,
				icon : this.markerIcon
			});
			google.maps.event.addListener(marker, "click", function() {
				return hpr.spot.openInfoWindow(marker, html);
			});
			return marker;
		},

		createSpotInfoWindowHtml : function(spot) {
			var html = [];
			html.push('<div style="padding: 2px 0 2px 0">');
			html.push(this.createSpotInfoHtml(spot, true));
			html.push('</div>');
			return html.join('');
		},

		createSpotInfoHtml : function(spot, isMap) {
			var html = [];
			var link = '<a href="javascript:hpr.spot.spotClick(\'' + spot.landmarkAreaCd + '\');">{0}</a>';
			var linkDetail;

			if (spot.landmarkUrl) {
				linkDetail = '<a href="' + spot.landmarkUrl + '">{0}</a>';
			} else {
				linkDetail = '<a href="/A_16100/randmark_lac' + spot.landmarkAreaCd + '.html">{0}</a>';
			}

			if (isMap) {
				if (!spot.landmarkSearchWord) {
					linkDetail = '{0}';
				}
				link = linkDetail;
			} else {
				html.push('<li class="cFix">');
			}

			if (spot.landmarkPhoto) {
				html.push('<div class="landmarkImg">');
				var img = '<img src="' + spot.landmarkPhoto + '" width="170" height="85" />';
				html.push(link.replace('{0}', img));
				html.push('</div>');
			}

			html.push('<dl class="landmarkSPInfo">');
			html.push('<dt>');
			html.push(link.replace('{0}', spot.landmarkAreaName));
			html.push('</dt>');

			if (spot.middleAreaName) {
				html.push('<dd>(' + spot.middleAreaName + ')</dd>');
			}
			if (spot.landmarkAccess) {
				html.push('<dd>');
				html.push('<dl class="landmarkAccess cFix">');
				html.push('<dt><img src="/SYS/cmn/images/common/front/icon_access.gif" alt="アクセス" width="11" height="17" /></dt>');
				html.push('<dd>' + spot.landmarkAccess + '</dd>');
				html.push('</dl>');
				html.push('</dd>');
			}
			html.push('</dl>');
			if (spot.landmarkSearchWord) {
				html.push('<div class="detailsBtn">');
				var spotDetail = '<img class="hover" src="/SYS/cmn/images/common/btn_spot_details.gif" alt="スポット詳細" width="71" height="22" />';
				html.push(linkDetail.replace('{0}', spotDetail));
				html.push('</div>');
			}
			if (spot.latitudeDeg && spot.latitudeDeg) {
				html.push('<p class="aroundLink">');
				html.push('<a href="/A_16200/randmark_lac' + spot.landmarkAreaCd + '_dst1.html">周辺のお店</a>');
				html.push('</p>');
			}
			if (!isMap) {
				html.push('</li>');
			}
			return html.join('');

		},

		createSpotStorePagingHtml : function(result, saCd, maCd, pn) {
			var html = [];

			var totalPn = parseInt(this.totalRecordNum / 2);
			if (this.totalRecordNum % 2 > 0) {
				totalPn++;
			}

			var totalPageLinkNum = parseInt(totalPn / this.pageLinkMaxNum);
			if (totalPn % this.pageLinkMaxNum > 0) {
				totalPageLinkNum++;
			}

			var currentPageLinkNum = parseInt(pn / this.pageLinkMaxNum);
			if (pn % this.pageLinkMaxNum > 0) {
				currentPageLinkNum++;
			}

			var page = (currentPageLinkNum - 1) * this.pageLinkMaxNum;

			html.push('<ol>');
			if (currentPageLinkNum > 1) {
				html.push('<li>');
				html.push('<a href="javascript:hpr.spot.getSpotStoreList(\'' + saCd + '\', \'' + maCd + '\', ' + page + ');">');
				html.push('...');
				html.push('</a>');
				html.push('</li>');
			}

			var pagerEnd = (page + this.pageLinkMaxNum) > totalPn ? totalPn : (page + this.pageLinkMaxNum);
			page++;
			for (; page <= pagerEnd; page++) {
				html.push('<li>');
				if (pn == page) {
					html.push(page);
				} else {
					html.push('<a href="javascript:hpr.spot.getSpotStoreList(\'' + saCd + '\', \'' + maCd + '\', ' + page + ');">');
					html.push(page);
					html.push('</a>');
				}
				html.push('</li>');
			}

			if (currentPageLinkNum < totalPageLinkNum) {
				html.push('<li>');
				html.push('<a href="javascript:hpr.spot.getSpotStoreList(\'' + saCd + '\', \'' + maCd + '\', ' + page + ');">');
				html.push('...');
				html.push('</a>');
				html.push('</li>');
			}
			html.push('</ol>');

			html.push('<ul>');
			var prevPage = (pn - 1);
			var nextPage = (pn + 1);
			if (prevPage > 0) {
				html.push('<li class="prev">');
				html.push('<a href="javascript:hpr.spot.getSpotStoreList(\'' + saCd + '\',\'' + maCd + '\', ' + prevPage + ');">前へ</a>');
				html.push('</li>');
			}
			html.push('<li>' + pn + '/' + totalPn + 'ページ</li>');
			if (nextPage <= totalPn) {
				html.push('<li class="next">');
				html.push('<a href="javascript:hpr.spot.getSpotStoreList(\'' + saCd + '\', \'' + maCd + '\', ' + nextPage + ');">次へ</a>');
				html.push('</li>');
			}
			html.push('</ul>');

			$("#paging").html(html.join(''));
		},

		createSpotStoreListHtml : function(result) {
			var html = [];

			if (result.length > 0) {

				for (var i=0; i<result.length; i++) {
					var spot = result[i];
					var storeList = result[i].storeList;
					var divClass = (i % 2 == 0) ? "landmarkColumnLeft" : "landmarkColumnRight";

					html.push('<div class="' + divClass + '">');
					html.push('<p class="landmarkTitle"><span>' + spot.landmarkAreaName + '</span></p>');
					if (storeList.length > 0) {
						html.push('<ul class="lunchCpSp cFix">');
							for (var j=0; j<storeList.length; j++) {
								var store = storeList[j];
								html.push('<li>');
								html.push('<div class="spImage">');
								if (store.atmospherePhotoImgId) {
									html.push('<a href="/str' + store.storeId + '/"><img src="' + store.atmospherePhotoImgPath + '" alt="" /></a>');
								}
								html.push('</div>');
								html.push('<dl class="spInfoBox">');
								html.push('<dt><a href="/str' + store.storeId + '/">' + store.storeSeoName.replace(/"/g, '&quot;') + '</a></dt>');
								html.push('<dd>');
								html.push('<p class="genre">' + store.parentGenreName + '</p>');
								html.push('<p class="area">' + store.accessPc + '</p>');
								html.push('</dd>');
								html.push('</dl>');
								html.push('</li>');
							}
						html.push('</ul>');
					} else {
						html.push('<p class="noLandmarkSpot">このスポット内のお店がありませんでした。</p>');
					}
					html.push('<ul class="linkMore">');
					if (storeList.length > 0) {
						html.push('<li><a href="/A_16100/randmark_lac' + spot.landmarkAreaCd + '.html">' + spot.landmarkAreaName + 'のお店をもっと見る</a></li>');
					}
					if (spot.latitudeDeg && spot.longitudeDeg) {
						html.push('<li><a href="/A_16200/randmark_lac' + spot.landmarkAreaCd + '_dst1.html">' + spot.landmarkAreaName + '周辺のお店</a></li>');
					}
					html.push('</ul>');
					html.push('</div>');
				}
			}
			$("#landmarkStoreList").html(html.join(''));
		},

		getSpotStoreList : function(saCd, maCd, pn) {
			var params = new Array();
			if (saCd) { params.push("SA=" + saCd); }
			if (maCd) { params.push("MA=" + maCd); }
			if (pn) { params.push("pn=" + pn); }

			var url = this.spotStoreListUrl + "?" + params.join("&");

			$.ajax({
				url : url,
				dataType : "json",
				cache : false,
				success : function(result) {
					hpr.spot.createSpotStoreListHtml(result);
					hpr.spot.createSpotStorePagingHtml(result, saCd, maCd, pn);
				},
				error : function() {
					var html = [];
					html.push('<ol>');
					html.push('<li>お店データの読み込みに失敗しました。</li>');
					html.push('</ol>');
					$("#landmarkStoreList").html('');
					$("#paging").html(html.join(''));
				}
			});
		},

		spotClick : function(landmarkAreaCd){
			var m = this.markerAry[landmarkAreaCd];
			this.openInfoWindow(m, m.html);
		},

		openInfoWindow : function(marker, html) {
			if (this.infoWindow != null) {
				this.infoWindow.close();
			}
			this.infoWindow = new google.maps.InfoWindow({
				content : html,
				maxWidth : 250
			});
			this.infoWindow.open(this.map, marker);
		},

		addModifiedZoom : function() {
			google.maps.event.addListenerOnce(hpr.spot.map, 'bounds_changed', function() {
				if (hpr.spot.map.getZoom() > hpr.spot.defaultZoom) {
					hpr.spot.map.setZoom(hpr.spot.defaultZoom);
				}
			});
		}

	} // hpr.spot end

	hpr.external_site = {

		openR25 : function(path) {
			if(path == undefined) {
				path = "index.html";
			}
			return hpr.window.open("http://r25.hotpepper.jp/" + path);
		},

		openPoico : function() {
			return hpr.window.open("http://poico.jp/CSP/PTOP01/PTOP010101.jsp?vos=dpoireca00004");
		},

		openDemaekan : function(path) {
			if(path == undefined) {
				path = "";
			}
			return hpr.window.open("http://demae.hotpepper.jp/" + path);
		},

		openPomparade : function(path) {
			if(path == undefined) {
				path = "";
			}
			return hpr.window.open("http://ponpare.jp/" + path);
		},

		openLesson : function(path) {
			if(path == undefined) {
				path = "";
			}
			return hpr.window.open("http://www.hotpepper.jp/" + path);
		},

		openAboutAlike : function() {
			return hpr.window.open("http://alike.jp/guide/help/faq");
		},

		openAboutDokoiku : function() {
			return hpr.window.open("http://www.doko.jp/search/help.do");
		},

		openBlogURL : function(domain, path) {

			if(domain) {

				domain = domain.replace(new RegExp("@@ALTJ@@", "g"), "jp");
				domain = domain.replace(new RegExp("@@ALTC@@", "g"), "com");
				domain = domain.replace(new RegExp("@@ALTN@@", "g"), "net");
				domain = domain.replace(new RegExp("@@ALTW@@", "g"), "www");
				domain = domain.replace(/_/g, ".");
			}
			if(path) {
				path = path.replace(new RegExp("@@ALTA@@", "g"), "@");
				path = path.replace(new RegExp("@@ALTS@@", "g"), "/");
			}

			return hpr.window.open("http://" + domain + path);
		},

		showFaq : function(faqid) {
			var url = "http://help.hotpepper.jp/";
			if (faqid) {
				url += "app/answers/detail/a_id/" + faqid;
			}
			return hpr.window.open(url);
		},




		openPomparade2 : function(path) {
			if(path == undefined) {
				path = "";
			}
			return hpr.window.open("https://ponpare.jp/uw/uwp2200/uwt2206init.do?vos=cppprdiscap0110624001" + path);
		},

		opentokyootona1 : function(path) {
			if(path == undefined) {
				path = "";
			}
			return hpr.window.open("http://toyota.jp/fjcruiser/" + path);
		},

		opentokyootona2 : function(path) {
			if(path == undefined) {
				path = "";
			}
			return hpr.window.open("http://www.syokuryo.jp/index.html" + path);
		},

		opentokyootona3 : function(path) {
			if(path == undefined) {
				path = "";
			}
			return hpr.window.open("http://www.amazon.co.jp/gp/product/4862073891/" + path);
		},

		opentokyootona4 : function(path) {
			if(path == undefined) {
				path = "";
			}
			return hpr.window.open("http://magapla.net/index.php/module/ShohinShosai/action/ShohinShosai/sno/1023/?vos=ZGST1004" + path);
		},

		openStoreUrl : function(domain, path) {

			if(domain) {

				domain = domain.replace(new RegExp("@@ALTJ@@", "g"), "jp");
				domain = domain.replace(new RegExp("@@ALTC@@", "g"), "com");
				domain = domain.replace(new RegExp("@@ALTN@@", "g"), "net");
				domain = domain.replace(new RegExp("@@ALTW@@", "g"), "www");
				domain = domain.replace(/_/g, ".");
			}
			if(path) {
				path = path.replace(new RegExp("@@ALTA@@", "g"), "@");
				path = path.replace(new RegExp("@@ALTS@@", "g"), "/");
			}

			hpr.window.open("http://" + domain + path);

			return false;
		},

		openEnquete : function() {
			return hpr.window.open("https://www.net-research.jp/airs/exec/rsAction.do?rid=490699&k=da3c5ebe17");
		},

		openHpMemberAction : function(actionPath, actionName, urlParam, newWindow) {

			if (actionPath && actionName) {
				var execute = "do" + actionName.charAt(0).toUpperCase() + actionName.substr(1);
				var url = "/CSP/" + actionPath + "/" + execute;

				var params = [];
				if (urlParam) {
					url += urlParam;
				}

				if (newWindow) {
					window.open(url);
				} else {
					var msie = navigator.appVersion.toLowerCase();
					msie = (msie.indexOf('msie')>-1)?parseInt(msie.replace(/.*msie[ ]/,'').match(/^[0-9]+/)):0;
					if( ( msie < 9 ) && ( msie!=0 ) ) {
						var redirectLink = document.createElement('a');
						redirectLink.href = url;
						document.body.appendChild(redirectLink);
						redirectLink.click();
					} else {
						location.href = url;
					}
				}
			}

			return false;
		},

		openCapPointIntroduction : function() {
			return hpr.window.open("https://point.recruit.co.jp/pontaweb/about/point/");
		},

		openCapPointIntroductionTab : function(tab) {
			var url = "https://point.recruit.co.jp/pontaweb/";
			if (tab) {
				url += "?tab=" + tab;
			}
			return hpr.window.open(url);
		}

	} // hpr.external_site end

	hpr.imr = {
		openDatePicker: function(storeId, dateId, dateChanged, reserve) {

			var date = $('#' + dateId).val().replace(/\//g, '');
			if (date.length >= 6) {
				date = date.substring(0, 6);
			}

			var calendarLinkExist = $('#calendarLink').size() > 0;
			if (calendarLinkExist) {
				var url = "/CSP/cmn010/doShowCalendar?TB_iframe&width=560&height=335&modal=true"
					+ "&SP=" + storeId + "&dateId=" + dateId + "&date=" + date + "&dateChanged=" + dateChanged;
				if (typeof reserve !== "undefined") {
					if (reserve) {
						url += "&reserve=1";
					}
				}
				$('#calendarLink').attr("href", url);
			} else {
				window.open("/CSP/cmn010/doShowCalendar?SP=" + storeId + "&dateId=" + dateId + "&date=" + date + "&dateChanged=" + dateChanged,
					"dataPicker",
					"resizable=yes,width=235,height=310").focus();
			}
		}
	} // hpr.imr end

	hpr.util = {
		submit: {
			isSubmitted : false,

			checkSubmit : function(sender) {

				if (!hpr.util.submit.isSubmitted) {
				    var senderElm = $(sender)
					$(senderElm).replaceWith($(senderElm).html());
					isSubmitted = true;
					return true;
				} else {
					return false;
				}
			}
		},
		removeEmptyProp: function(obj) {
			var newObj = {}
			$.each(obj, function(name, value) {
				if (value != '') {
					newObj[name] = value
				}
			});
			return newObj;
		}
	} // hpr.util end


	hpr.ui = {
		hover: function(sel) {
			$(sel).find(".hover").not("img[src*='_on.'],img[src*='_cr.']").each(function() {
				var imgsrc = this.src;
				var dot = this.src.lastIndexOf('.');
				var imgsrc_on = this.src.substr(0, dot) + '_on' + this.src.substr(dot, 4);
				if (!(this.src in image_cache)) {
					var img = new Image();
					img.src = imgsrc_on;
					image_cache[this.src] = imgsrc_on;
				}
				$(this).hover(
					function() { this.src = imgsrc_on; },
					function() { this.src = imgsrc; }
				);
			});
		}
	} // hpr.ui end

	hpr.captcha = {
		reloadImg: function(element, src) {
			var timestamp = new Date().getTime();
			$(element).attr('src', src+'?'+timestamp);
		}
	} // hpr.captcha

	/**
	 * from char codes to string
	 *
	 * @param array codes
	 * @return string
	 */
	hpr.__c = function(codes) {
		return String.fromCharCode.apply(null, codes);
	}; // hpr.__c

})(); // function end

(function($) {
    $.fn.displayed = function(handler) {
        var target = this;
        $(window).scroll(function () {
        	target.each(function() {
        		if ($(window).scrollTop() + $(window).height() > $(this).offset().top) {
        			handler(this);
        		}
	    	});
        });
    };
}(jQuery));

function openKanji(){
	var param = '';
	param = addParam(param, 'SA', $('#SA').val());
	param = addParam(param, 'ma1', $('#ma1').val());
	param = addParam(param, 'preferYear', $('#kanji_form [name=preferYear]').val());
	param = addParam(param, 'preferMonth', $('#kanji_form [name=preferMonth]').val());
	param = addParam(param, 'preferDay', $('#kanji_form [name=preferDay]').val());
	param = addParam(param, 'preferTimeHour', $('#kanji_form [name=preferTimeHour]').val());
	param = addParam(param, 'preferTimeMinute', $('#kanji_form [name=preferTimeMinute]').val());
	param = addParam(param, 'personCnt', $('#kanji_form [name=personCnt]').val());

	hpr.window.popup('/smart_kanji/request/' + param, 'newWindow', '970', '600');
}

function addParam(param, label, val){
	//var param = '';
	if(label && val){
		if(param == ''){
			param += '?';
		}else{
			param += '&';
		}
		param += label + '=' + val;
	}
	return param;
}

function updateView() {
	// nop
}

/* ---------------------------------------------------------------------- */
/* SC用仮定義 */
/* ---------------------------------------------------------------------- */
function SCClick_toriKeepClick(){}
function SCClick_sList(){}

/* 一覧画面用仮定義 */
function adStoreClicked() {}
function storeClicked() {}

//bookmark登録時のtooltip新デザイン用
hpr.addTooltip = {
	enabled: false,
	isIe8: function() {
		var
			ret = false,
			ua = window.navigator.userAgent.toLowerCase(),
			ver = window.navigator.appVersion.toLowerCase();

		if((ua.indexOf('msie') !== -1) && (ver.indexOf('msie 8.') !== -1)) {
			ret = true;
		}

		return ret;
	},
	// addTooltip.show
	show: function(sender, imgfile, imgWidth, imgHeight) {
		this.enabled = true;
		this._createOverlay();
		var targetImg = $(sender).children('img');
		var ew = targetImg.width();
		var targetPosX = targetImg.offset().left - ((parseInt(imgWidth, 10) - ew) / 2);
		var targetPosY = targetImg.offset().top - (parseInt(imgHeight, 10) + 7);

		// IE8はシャドウの透過pngをfadeIn/fadeOutさせると画像が黒く塗りつぶされてしまう為、シャドウのpngを付加しない。
		if (this.isIe8()) {
			$("body").append('<p id="tooltip"><img src="'+ imgfile +'" width="'+ imgWidth +'" height="'+ imgHeight +'" class="tooltipImg" /></p>');
		} else {
			$("body").append('<p id="tooltip"><img src="'+ imgfile +'" width="'+ imgWidth +'" height="'+ imgHeight +'" class="tooltipImg" /><img src="/SYS/cmn/images/front_002/img_addlist_shadow.png" width="234" height="82" class="tooltipImgShadow" /></p>');
			$('.tooltipImgShadow').css({
				'z-index': 990,
				'position': 'absolute',
				'top': -1,
				'left': -7
			});
		}

		$('.tooltipImg').css({
			'z-index': 999,
			'position': 'relative'
		});

		$("#tooltip")
			.css({
				opacity: "0",
				position: "absolute",
				"z-index": 999,
				top: targetPosY,
				left: targetPosX
			})
			.fadeTo(400, 1.0);
	},

	// addTooltip.remove
	remove: function(time){
		var timerId;
		var tooltip = this;
		timerId = setTimeout(function(){
			$("#tooltip").fadeTo(400,0,
				function(){
					$("#tooltip").remove();
					tooltip._removeOverlay();
					tooltip.enabled = false;
				}
			);
			clearTimeout(timerId);
		}, time);
	},

	_createOverlay: function() {
		var h = $("body")[0].offsetHeight;

		$("body").append("<div id='unclickableLayer'></div>");

		$("#unclickableLayer").css({
			width: "100%",
			height: h,
			position: "absolute",
			top: "0",
			left: "0",
			background: "#fff",
			opacity: "0"
		});

		var op = $("#unclickableLayer").css("opacity");
		if (typeof op == "undefined" || op == "1") {
			$("#unclickableLayer").css("backgroundColor", "rgba(255,255,255,0)");
		}
	},

	_removeOverlay: function() {
		$('#unclickableLayer').remove();
	}
}; // addTooltip end
