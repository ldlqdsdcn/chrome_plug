

if(typeof isChromeExtension == 'undefined'){
	init();
}else{
	function onReadyGM(){
		init();
	};
};






function init(){


	//广播过滤
	function myGFW(){
		if(GM_getValue('myGFW', true) && $('#db-isay')){
			
			if(!$('#myGFWbar')){
			 
				var toggle = document.createElement('div');
				toggle.id = 'myGFWbar';
				toggle.innerHTML = '<span title="已屏蔽广播">屏蔽(<em id="blockNum">0</em>)</span> | <a id="showBlock" class="bn-status-more" href="#" title="还原显示被屏蔽广播 by " >显示</a> | <a id="setMyGFW" class="bn-status-more" href="#" title="设置屏蔽规则 ">设置</a> |&nbsp;';
				$$('#mod-status-cate .status-cate')[0].insertBefore(toggle, $$('#mod-status-cate .bn-status-more')[0]);
				
				GM_addStyle('#myGFWbar{display:inline;} #myGFWbar a:hover{background-color:#3377AA;} #myGFWbar span{color:#AAA;} .beBlock{display:none;background-color:#edf4ed;}');

				//操作栏事件捆绑
				$('#showBlock').addEventListener('click', function(){
					if($('#showBlock').innerHTML == '显示'){
						GM_addStyle('.beBlock{display:block;}');
						$('#showBlock').innerHTML = '隐藏';
					}else{
						GM_addStyle('.beBlock{display:none;}');
						$('#showBlock').innerHTML = '显示';
					};
				}, false);

				$('#setMyGFW').addEventListener('click', function(){
					sw_set(false);
					setStyles($$('#db_div DIV'), 'display:none;');//隐藏选项页面
					$('#友邻广播').style.display = 'block';//显示当前选项页面
					setStyles($$('#db_div_a A'), '');//清空左侧标签样式
					$$('#db_div_a A')[1].style.cssText = 'border-right:1px solid #fff;background:#fff;border-left:12px solid #83bf73;';
				}, false);
			};
			
			//读取屏蔽关键词
			var blockWords = GM_getValue('blockWords', '')
				.replace(/^\s+|\s+$|\r/mg, '') //去头尾空白和\r
				.replace(/\n+|\n\s+\n/g, '\n') //去除连续换行
				.replace(/([\.\+\?\*\(\)\[\]\{\}\|\^\$\/\\])/g, '\\$1') //转义特殊符号
				.replace(/\n/g, '|');
			// GM_log(blockWords);

			if(blockWords != ''){
				var rule = new RegExp(blockWords, 'i');
				// GM_log(rule);
				
				//遍历友邻广播
				var items = $$('.status-item:not([myGFW])'), blockNum = Number($('#blockNum').innerHTML);
				for(var i=0,j=items.length; i<j; i++){
					items[i].setAttribute('myGFW', '1');//已处理标记
					if(rule.test(items[i].textContent)){
						items[i].className += ' beBlock';//屏蔽标记
						blockNum++;
					};
				};
				$('#blockNum').innerHTML = blockNum;
			};

		};
	};


	function endlessPage(func, noNextPageFunc, dom){
		var nextPage = $$('.paginator>.next>a', dom||document)[0];
		if(nextPage){
			GM_xmlhttpRequest({
				method: 'GET',
				url: nextPage.href,
				onload: function(resp){
					if(resp.status < 200 || resp.status > 300) {return;};
					var nextPageDOM = document.createElement('div');
					nextPageDOM.innerHTML = resp.responseText;
					
					func(nextPageDOM);
					
					var andNextPage = $$('.paginator>.next>a', nextPageDOM)[0];
					if(andNextPage){
					endlessPage(func, noNextPageFunc, nextPageDOM);
					}else{
						noNextPageFunc();
					}
				},
				onerror: function(){return;}
			})
		}else{
			noNextPageFunc();
		}
	};

	
	function addTopPager(){
		if(GM_getValue('addTopPager', true)){
			$('.paginator')[0] && $$('.aside>*')[0] && ($$('.aside>*')[0].innerHTML += ('<div class="paginator" id="secPaginator">' + $('.paginator')[0].innerHTML + '</div>'));
		};
	};

	function openDouban(){
		var k=[];
		document.addEventListener('keydown', function(e){
			k.push(e.keyCode);
			if(k.toString().indexOf('38,38,40,40,37,39,37,39')>=0){
			   GM_openInTab('http://www.douban.com/');
			   k=[];
			}
		}, false); 
	};

	//每次升级后执行
	function afterUpdateFirstLoad(){
		if( (GM_getValue('helperVersion', '0') != doubanHelper.version) && (setCookie('helperVersion') != doubanHelper.version) ){
			GM_setValue('helperVersion', doubanHelper.version);//保存版本号
			setCookie('helperVersion', doubanHelper.version, 9999, '/', '.douban.com');

		};
	};
	







	/* ************************ 判断执行 ************************ */

	var Douban = /douban\.(com|fm)/i.test(location.href), doubanHelper = {name: '精灵',id: '49911',version: '2012.11.18'};
	if(!GM_getValue('supportHelper', true)){
		unsafeWindow.__done__ = window.__done__ = true;
		var hpd = document.createElement('script');
		hpd.id = 'hp_done_';
		document.documentElement.firstChild.appendChild(hpd);
	};
	typeof(Updater)!='undefined' && new Updater(doubanHelper).check();//自动更新
	var runHelper = function(){
		autoElevator();
		exBoard();
		exGroup();
		albBig(); 
		friendsTool();
		myGFW();
		addPageLoader();//页面加载控件*
	};


		
		
		
};

		
		
		
