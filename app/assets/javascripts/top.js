var HPG = HPG || {};
HPG.TOP = HPG.TOP || {};

HPG.TOP.$doc = $(document);
HPG.TOP.$win = $(window);
HPG.TOP.$htmlBody = $('html, body');

// クイック検索プルダウン
HPG.TOP.PullDown = function(target) {
	this.init(target);
};

HPG.TOP.PullDown.prototype = {
	init: function(target) {
		this.$clickTarget = $(target).children('a').eq(0);
		this.$closestPullDown = this.$clickTarget.closest('.jscSelectBoxPullDown');
		this.$targetPullDownArea = this.$clickTarget.next('.jscSelectBoxPullDownArea');
		this.$selectList = this.$targetPullDownArea.find('.jscSelectList');
		this.defaultText = this.$clickTarget.find('span').text();
		this.$checkedInput = this.$targetPullDownArea.find('input:checked');
		this.$pullDownArea = $('.jscSelectBoxPullDownArea');
		this.$selectBoxPullDown = $('.jscSelectBoxPullDown');

		this.bindEvent();
		this.loadSetChecked();
	},
	bindEvent: function() {
		var _self = this;

		// セレクトボックスをクリック
		this.$clickTarget.on('click', function(e) {
			if($(this).hasClass('disabled')){
				return;
			}
			e.preventDefault();
			_self.pullDownEvent();
		});

		// セレクトボックスのリストをクリック
		this.$selectList.on('click', function() {
			_self.selectListEvent($(this));
		});
	},
	pullDownClose: function() {
		this.$pullDownArea.css('z-index', 0).addClass('dn');
		this.$selectBoxPullDown.css('z-index', 0);
		HPG.TOP.$doc.off('click.closeEvent');
		this.$selectBoxPullDown.children('a').removeClass('jscPullDownSelected');
	},
	decisionClickArea: function($pullDownArea) {
		var $closestPullDown = $pullDownArea.closest('.jscSelectBoxPullDown'),
			targetTop = $closestPullDown.offset().top,
			targetLeft = $closestPullDown.offset().left,
			pullDownListH = $closestPullDown.outerHeight(),
			targetW = targetLeft + $pullDownArea.outerWidth(),
			targetH = targetTop + $pullDownArea.outerHeight(),
			_self = this;

		HPG.TOP.$doc.on('click.closeEvent', function(e){
			var clickY = e.pageY,
				clickX = e.pageX;

			if (clickY > targetH + pullDownListH || clickX < targetLeft || clickX > targetW || clickY < targetTop) {
				_self.pullDownClose();
			}
		});
	},
	pullDownEvent: function() {
		if (!this.$targetPullDownArea.hasClass('dn')) {
			this.pullDownClose();
		} else {
			this.$pullDownArea.css('z-index', 0).addClass('dn');
			this.$selectBoxPullDown.css('z-index', 0);
			this.$closestPullDown.css('z-index', 10);
			this.$targetPullDownArea.css('z-index', 20).removeClass('dn');

			HPG.TOP.$doc.off('click.closeEvent');
			this.decisionClickArea(this.$targetPullDownArea);
		}
	},
	insertText: function(target) {
		this.$clickTarget.find('span').text(target.text());
		this.$targetPullDownArea.find('.selected').removeClass('selected');
		target.addClass('selected');
	},
	selectListEvent: function(target) {
		this.pullDownClose();
		this.insertText(target);
	},
	loadSetChecked: function() {
		var _self = this;

		var checkedText = _self.$checkedInput.prev('span').text();

		_self.$checkedInput.closest('.jscSelectList').addClass('selected');
		_self.$checkedInput.prev('span').addClass('checked');

		if (checkedText === '') {
			_self.$clickTarget.find('span').text(_self.defaultText);
		} else {
			_self.$clickTarget.find('span').text(checkedText);
		}
	}
};

// クイック検索Disable切り替え
HPG.TOP.QsSearch = function(){
	var $conditionImg, $pullDown, $pullDownArea, $pullDownTarget, $subTarget,
	requiredText, disabledClass;
	return {
		init: function(){
			$conditionImg = $('.jscQsConditionImg');
			$pullDownArea = $('.jscSelectBoxPullDownArea');
			$pullDownTarget = $('.jscSelectBoxPullDownTarget');
			$pullDown = $('.jscSelectBoxPullDown');
			$subTarget = $('.jscQsSubTarget');
			requiredText = $($pullDown[0]).find('li').eq(0).text().replace(/\s/g,'');
			disabledClass = 'disabled';

			this.changeEnableContents();
			this.bindEvent();
		},
		bindEvent: function(){
			var _self = this;

			$pullDownArea.on('click','.jscSelectList', function(){
				_self.changeEnableContents();
			});

			$conditionImg.hover(function(){
				var $this = $(this);
				if(!$this.hasClass(disabledClass)){
					$this.attr('src', $this.attr('src').replace(/btn_search/g,'btn_search_on'));
				}
			},function(){
				var $this = $(this);
				if(!$this.hasClass(disabledClass)){
					$this.attr('src', $this.attr('src').replace(/btn_search_on/g,'btn_search'));
				}
			});
		},
		changeEnableContents: function(){
			var targetText = $pullDownTarget.text().replace(/\s/g,'');

			if(targetText === requiredText){
				$subTarget.addClass(disabledClass);
				$conditionImg.addClass(disabledClass);
			}else{
				$subTarget.removeClass(disabledClass);
				$conditionImg.removeClass(disabledClass);
			}

			this.changeConditionImg();
		},
		changeConditionImg: function(){
			var imgSrc = $conditionImg.attr('src');

			if($conditionImg.hasClass(disabledClass)){
				$conditionImg.attr('src', imgSrc.replace(/btn_search.+/g,'btn_search_dim.png'));
				$conditionImg.attr('disabled',disabledClass);
			}else {
				$conditionImg.attr('src', imgSrc.replace(/btn_search_.+/g,'btn_search.png'));
				$conditionImg.removeAttr(disabledClass);
			}
		}
	};
};

//クイック検索ページジャンプ
HPG.TOP.pageJump = function(){
	var $searchBtn, $selectList, $selectedItem,
	areaName, genreName, budgetName, disabledClass;

	return {
		init : function(){
			areaName = 'area';
			genreName = 'genre';
			budgetName = 'budget';
			disabledClass = 'disabled';
			$searchBtn = $('.jscQuickSearchBtn');
			$selectList = $('.jscSelectList');

			this.bindEvent();
		},
		bindEvent : function(){
			var _self = this;

			$searchBtn.on('click', function(e) {
				e.preventDefault();

				if($(this).hasClass(disabledClass)){
					return;
				}

				_self.searchAct(this);
			});
		},
		nameFilter : function(name){
			var $item  = $selectedItem.filter(function() {
				return $(this).attr('name') === name;
			});

			return $item;
		},
		searchAct : function(){
			$selectedItem = $selectList.filter('.selected').find('input');

			var areaVal = this.nameFilter(areaName).val(),
				genreVal = this.nameFilter(genreName).val(),
				budgetVal = this.nameFilter(budgetName).val(),
				url = 'http://www.hotpepper.jp/';

			if(genreVal !== '' && budgetVal !== ''){
				url += areaVal + '/' + genreVal + '/' + budgetVal + '/';
			} else if(genreVal !== '' && budgetVal === ''){
				url += areaVal + '/' + genreVal + '/';
			} else if(genreVal === '' && budgetVal !== ''){
				url += areaVal + '/' + budgetVal + '/';
			} else {
				url += areaVal + '/lst/';
			}
			location.href = url;
		}
	};
};

// ページの先頭へ戻るボタン
HPG.TOP.scrollTop = function() {
	var
		showFlag,
		$scrollElement,
		SCROLL_TIME = 100,
		SCROLL_BTN_SHOW_TIME = 300;

	return {
		init: function() {
			if (!$('.jscScrollTop').length) {
				return;
			}

			showFlag = false;

			this.createScrollBtn();
			this.setScrollHoverBtn();
			this.bindEvent();
		},
		bindEvent: function() {
			var _self = this;

			HPG.TOP.$win.on('scroll', function() {
				if ($(this).scrollTop() > 200) {
					_self.showScrollBtn();
				} else {
					_self.hideScrollBtn();
				}
			});

			$scrollElement.on('click', $.proxy(this.scroll, this));
		},
		createScrollBtn: function() {
			$('body').append(
				'<div id="jsiScrollTop" class="scrollWrap" style="bottom: -100px;">' +
					'<a href="javascript:void(0);" class="scrollTrigger"><img src="/SYS/cmn/images/front_002/bt_course_pagetop_bg.png" alt="" width="85" height="85" class="jscScrollTopImg" /></a>' +
				'</div>'
			);

			$scrollElement = $('#jsiScrollTop');
		},
		setScrollHoverBtn: function() {
			var
				$scrollTopImg = $('.jscScrollTopImg'),
				imgSrc = $scrollTopImg[0].src,
				dot = imgSrc.lastIndexOf('.'),
				totalLength = imgSrc.length,
				imgSrcOn = imgSrc.substr(0, dot) + '_on' + imgSrc.substr(dot, totalLength),
				imgCache = new Image();

			imgCache.src = imgSrcOn;

			$scrollTopImg.hover(function() {
				this.src = imgSrcOn;
			}, function() {
				this.src = imgSrc;
			});
		},
		scroll: function() {
			HPG.TOP.$htmlBody.animate({
				scrollTop: 0
			}, SCROLL_TIME);
		},
		showScrollBtn: function() {
			if (!showFlag) {
				showFlag = true;
				$scrollElement.stop().animate({'bottom': '20px'}, SCROLL_BTN_SHOW_TIME);
			}
		},
		hideScrollBtn: function() {
			if (showFlag) {
				showFlag = false;
				$scrollElement.stop().animate({'bottom': '-100px'}, SCROLL_BTN_SHOW_TIME);
			}
		}
	};
};

// display: inline-block;で改行スペースが入るものを消す
HPG.TOP.deleteNewline = {
	init: function() {
		var $deleteItem = $('.jscDeleteNewline');
		$deleteItem.each(function(){
			var $this = $(this);
			$this.html($this.html().replace(/(<\/.+?>)[\n\r\t\s]+?(<[^\/])/g,"$1$2"));
		});
	}
};

// 背景画像ランダム表示
HPG.TOP.randomStrokeDisplay = function() {
	var $targetContent, basePath, imgData, imgLength;

	return {
		init : function(){
			$targetContent = $(".headerKv");
			basePath = '/s/MP/cmn/images/';
			imgData = [
				basePath + 'bg_kv_01.jpg',
				basePath + 'bg_kv_02.jpg',
				basePath + 'bg_kv_03.jpg',
				basePath + 'bg_kv_04.jpg',
				basePath + 'bg_kv_05.jpg',
			];
			imgLength = imgData.length;
			var randomNum = Math.floor(Math.random() * imgLength),
				bgUrl = 'url("' + imgData[randomNum] + '")';

			$targetContent.css('background-image', bgUrl);
		}
	};
};

$(function() {
	$('.jscSelectBoxPullDown').each(function() {
		new HPG.TOP.PullDown(this);
	});
	HPG.TOP.QsSearch().init();
	HPG.TOP.pageJump().init();
	HPG.TOP.scrollTop().init();
	HPG.TOP.deleteNewline.init();
	HPG.TOP.randomStrokeDisplay().init();
});