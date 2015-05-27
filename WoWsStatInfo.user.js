// ==UserScript==
// @name WoWsStatInfo
// @author Vov_chiK
// @description Расширенная статистика и функционал.
// @copyright 2015+, Vov_chiK
// @license GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @namespace http://forum.walkure.pro/
// @version 0.3.1.7
// @creator Vov_chiK
// @include http://worldofwarships.ru/cbt/accounts/*
// @include http://worldofwarships.eu/cbt/accounts/*
// @include http://forum.worldofwarships.ru/index.php?/topic/*
// @include http://forum.worldofwarships.eu/index.php?/topic/*
// @match http://worldofwarships.ru/cbt/accounts/*
// @match http://worldofwarships.eu/cbt/accounts/*
// @match http://forum.worldofwarships.ru/index.php?/topic/*
// @match http://forum.worldofwarships.eu/index.php?/topic/*
// @grant GM_xmlhttpRequest
// ==/UserScript==
(function(window){
	/* ===== Main function ===== */
	function WoWsStatInfo(){
		var VersionWoWsStatInfo = '0.3.1.7';
		var WoWsStatInfoLink = 'http://forum.worldofwarships.ru/index.php?/topic/19158-';
		var WoWsStatInfoLinkName = '[0.3.1] [WoWsStatInfo] Расширенная статистика на оф. сайте.';
		
		var lang = 'ru';
		if(window.location.host.indexOf(".wargaming.net") > -1){
			lang = getCookie('wgccfe_language');
		}else if(window.location.host.indexOf("worldofwarships") > -1){
			lang = getCookie('hllang');
		}

		var localization = getLocalization(lang);
		
		var realm = localization['realm'];
		var application_id = getApplicationId(realm);
		
		var WGAPI = 'http://api.worldoftanks.'+realm+'/';
		var WoWsStatInfoHref = 'http://vovchik.myjino.ru/US_WoWsStatInfo/';
	
		var Process = 0;
		var MaxProcess = 3;
		
		/* ===== Style UserScript ===== */
		{
			var StyleWoWsStatInfo = '' +
				'div.div-link-block{font-size:13px; color: #fff; text-align: right; padding-top: 10px; padding-bottom: 10px;}' +
				'span.link-block:hover{border-bottom: 1px dotted #fff; cursor: pointer;}' +
				'span.link-block div.icon-link-block{background: url("http://'+realm+'.wargaming.net/clans/static/0.1.0.1/images/table-sorter/table-sorter_arrow_sprite.png") no-repeat 0 0; width: 10px; height: 10px; margin: -15px 100%;}' +
				'span.hide-block div.icon-link-block{background-position: 100% -26px;}' +
				'span.show-block div.icon-link-block{background-position: 100% -16px;}' +
				'div#userscript-block{border-radius: 2px; background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); padding: 10px; margin: 10px 0; line-height: 20px;}' +
				'div.hide-block{display: none;}' +
				'div.wowsstatinfo-stat{text-align: center; margin-top: 10px; color: white; font-size: 16px;}' +
				'span.name-stat{color: #ffcc33;}' +
				'' +
			'';
			var StyleWoWsStatInfoAdd = document.createElement("style");
			StyleWoWsStatInfoAdd.textContent = StyleWoWsStatInfo.toString();
			document.head.appendChild(StyleWoWsStatInfoAdd);
		}		
		
		/* ===== Message UserScript ===== */
		{
			var message = document.createElement("div");
			message.setAttribute("id", "message-wowsstatinfo");
			message.setAttribute("class", "ui-dialog ui-widget ui-widget-content ui-corner-all ui-front");
			message.setAttribute("style", "display: none; z-index:9999; left: 50%; margin-left: 0px; top: 0px;");
			message.innerHTML = '' +
				'<style>' +
					'.ui-dialog{box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12), 0 0 25px 25px rgba(0, 0, 0, 0.3);background-color: rgba(41, 41, 41, 0.8);position: absolute;top: 0;left: 0;outline: 0;padding: 23px 31px 28px;}' +
					'.ui-widget-content{color: #b1b2b3;}' +
					'.ui-widget{font-family: Arial, "Helvetica CY", Helvetica, sans-serif;font-size: 15px;}' +
					'.ui-corner-all{border-bottom-right-radius: 2px;border-bottom-left-radius: 2px;border-top-right-radius: 2px;border-top-left-radius: 2px;}' +
					'.ui-front{z-index: 250;}' +
					'.ui-dialog:before{background: url("http://ru.wargaming.net/clans/static/1.4.4/images/plugins/jquery-ui/dialog_gradient.png") repeat-x;height: 162px;width: 100%;position: absolute;top: 0;left: 0;z-index: 5;}' +
					'.ui-dialog .ui-dialog-titlebar{border-bottom: 1px solid rgba(0, 0, 0, 0.7);box-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.05);padding: 0 0 14px;position: relative;z-index: 10;}' +
					'.ui-widget-header{color: #fff;font-family: "WarHeliosCondC", Arial Narrow, Tahoma, arial, sans-serif;font-size: 25px;font-weight: normal;line-height: 30px;}' +
					'.ui-helper-clearfix{min-height: 0;support: IE7;}' +
					'.ui-widget-content{color: #b1b2b3;}' +
					'.ui-widget{font-family: Arial, "Helvetica CY", Helvetica, sans-serif;font-size: 15px;}' +
					'.ui-helper-clearfix:before, .ui-helper-clearfix:after{content: "";display: table;border-collapse: collapse;}' +
					'.ui-helper-clearfix:after{clear: both;}' +
					'.ui-helper-clearfix:before, .ui-helper-clearfix:after{content: "";display: table;border-collapse: collapse;}' +
					'.ui-dialog .ui-dialog-title{float: left;margin: 0;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;}' +
					'.ui-dialog .ui-dialog-titlebar-close{margin: -16px -3px 0;height: 20px;width: 20px;position: absolute;top: 50%;right: 0;}' +
					'.ui-widget .ui-widget{font-size: 1em;}' +
					'button.ui-button-icon-only {width: 16px;}' +
					'.ui-state-default{border: 1px solid transparent;color: #b1b2b3;display: inline-block;font-size: 13px;line-height: 30px;padding: 0 5px;height: 30px;width: 20px;}' +
					'.ui-button{background: none;border: 0;display: inline-block;position: relative;padding: 0;line-height: normal;cursor: pointer;vertical-align: middle;text-align: center;overflow: visible;}' +
					'.ui-button-icon-only .ui-icon{left: 50%;margin-left: -8px;}' +
					'.ui-button-icon-only .ui-icon, .ui-button-text-icon-primary .ui-icon, .ui-button-text-icon-secondary .ui-icon, .ui-button-text-icons .ui-icon, .ui-button-icons-only .ui-icon{position: absolute;top: 50%;margin-top: -8px;}' +
					'.ui-icon-closethick{background: url("http://ru.wargaming.net/clans/static/1.4.4/images/plugins/jquery-ui/dialog_close.png");}' +
					'.ui-icon{width: 16px;height: 16px;}' +
					'.ui-icon{display: block;text-indent: -99999px;overflow: hidden;background-repeat: no-repeat;}' +
					'.ui-state-default{border: 1px solid transparent;color: #b1b2b3;display: inline-block;font-size: 13px;line-height: 30px;padding: 0 5px;height: 30px;width: 20px;}' +
					'.ui-button-icon-only .ui-button-text, .ui-button-icons-only .ui-button-text{padding: .4em;text-indent: -9999999px;}' +
					'.ui-button .ui-button-text{display: block;line-height: normal;}' +
					'.ui-dialog .ui-dialog-content{position: relative;border: 0;padding: 0;background: none;z-index: 10;}' +
					'.ui-widget-content{color: #b1b2b3;}' +
					'.popup{margin: 10px auto 0;font-size: 15px;transition: height .3s;}' +
					'.popup_footer{margin-top: 20px;position: relative;}' +
					'.button__align-middle{vertical-align: middle;}' +
					'.button{-webkit-appearance: none;-moz-appearance: none;background: #735917;border-radius: 2px;border: none;box-shadow: 0 0 10px rgba(0, 0, 0, 0.3), 1px 0 2px rgba(0, 0, 0, 0.3);display: inline-block;padding: 0 0 2px;overflow: hidden;color: #000;font-family: Arial, "Helvetica CY", Helvetica, sans-serif;font-size: 17px;font-weight: normal;text-decoration: none;cursor: pointer;vertical-align: top;}' +
					'.button_wrapper{background: #dbae30;background: linear-gradient(to bottom, #fff544 0%, #dbae30 100%);border-radius: 2px;display: block;padding: 1px 1px 0;position: relative;}' +
					'.button_body{background: #e5ad2c;background: linear-gradient(to bottom, #e7b530 0%, #e5ad2c 100%);display: block;border-radius: 2px;padding: 10px 23px 11px;position: relative;text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);transition: all .2s;}' +
					'.button_inner{display: block;position: relative;z-index: 10;white-space: nowrap;line-height: 20px;}' +
					'.link__cancel{display: inline-block;font-size: 15px;margin-left: 18px;padding-top: 10px;}' +
					'.link{border-bottom: 1px solid transparent;padding-bottom: 1px;color: #e5b12e;line-height: 18px;text-decoration: none;transition: all .2s;}' +
				'</style>' +
				'<div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix">' +
					'<span class="ui-dialog-title">{%TITLE%}</span>' +
					'<button id="userscript-message-close" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only ui-dialog-titlebar-close" title="Close">' +
						'<span class="ui-button-icon-primary ui-icon ui-icon-closethick"></span>' +
						'<span class="ui-button-text">Close</span>' +
					'</button>' +
				'</div>' +
				'<div class="ui-dialog-content ui-widget-content" style="width: auto; min-height: 44px; max-height: none; height: auto;">' +
					'<div class="popup">{%TEXT%}</div>' +
					'<div class="popup_footer">' +
						'<button id="userscript-message-ok" class="button button__align-middle">' +
							'<span class="button_wrapper">' +
								'<span class="button_body">' +
									'<span class="button_inner">'+localization['Ok']+'</span>' +
								'</span>' +
							'</span>' +
						'</button>' +
						'<a id="userscript-message-cancel" class="link link__cancel" style="display: block; cursor: pointer;" >'+localization['Cancel']+'</a>' +
					'</div>' +
				'</div>' +
			'';
			document.body.appendChild(message);
			
			var messagebg = document.createElement("div");
			messagebg.setAttribute("id", "userscript-message-bg");
			messagebg.setAttribute("style", "display: none; z-index:9998; background: url('http://"+realm+".wargaming.net/clans/static/0.1.0.1/images/plugins/jquery-ui/widget_overlay-pattern.png'); position: fixed; top: 0; left: 0; width: 100%; height: 100%;");
			document.body.appendChild(messagebg);
		}		
		
		var navigatorInfo = getBrowser();
		window.onerror = function(message, source, lineno, column, errorObj){
			if(source == ''){source = window.location.href;}
			else if(source.indexOf(".js") != -1){return false;}
			if(message == 'Script error.' && errorObj == null){console.log('message == \'Script error.\' && errorObj == null'); return false;}
			
			lineno += 21;
			
			var agent = '';
			var agentArr = navigator.userAgent.split(')');
			for(var i = 0; i < agentArr.length; i++){
				if(agent != ''){agent += ')\n';}
				agent += agentArr[i];
			}
			
			var error = localization['ErrorScript']+"\n\n" +
					"Browser name: "+navigatorInfo['browserName']+"\n"+
					"Full version: "+navigatorInfo['fullVersion']+"\n"+
					"Major version: "+navigatorInfo['majorVersion']+"\n"+
					"AppName: "+navigatorInfo['appName']+"\n"+
					"UserAgent: "+agent+"\n\n"+
					"Error: "+message+"\n"+
					"URL: " +source+"\n"+
					"Line: "+lineno+"\n"+
					"Column: "+column+"\n"+
					"StackTrace: "+errorObj+"\n\n"+
					localization['ErrorSendDeveloper'];
			
			console.log(error);
			//alert(error);
			error = error.split('\n').join('<br />');
			
			onShowMessage(
				localization['Box'],
				error,
				onCloseMessage,
				localization['Ok'],
				false
			);
			
			return true;
		}
			
		function getBrowser(){
			var nVer = navigator.appVersion;
			var nAgt = navigator.userAgent;
			var browserName = navigator.appName;
			var fullVersion = ''+parseFloat(navigator.appVersion); 
			var majorVersion = parseInt(navigator.appVersion, 10);
			var nameOffset, verOffset, ix;

			// In Opera 15+, the true version is after "OPR/" 
			if((verOffset = nAgt.indexOf("OPR/")) != -1){
				browserName = "Opera";
				fullVersion = nAgt.substring(verOffset + 4);
			}
			
			// In older Opera, the true version is after "Opera" or after "Version"
			else if((verOffset = nAgt.indexOf("Opera")) != -1){
				browserName = "Opera";
				fullVersion = nAgt.substring(verOffset + 6);
				if((verOffset = nAgt.indexOf("Version")) != -1) 
					fullVersion = nAgt.substring(verOffset + 8);
			}
			
			// In MSIE, the true version is after "MSIE" in userAgent
			else if((verOffset = nAgt.indexOf("MSIE")) != -1){
				browserName = "Microsoft Internet Explorer";
				fullVersion = nAgt.substring(verOffset + 5);
			}
			// In Chrome, the true version is after "Chrome" 
			else if((verOffset = nAgt.indexOf("Chrome")) != -1) {
				browserName = "Chrome";
				fullVersion = nAgt.substring(verOffset + 7);
			}
			
			// In Safari, the true version is after "Safari" or after "Version" 
			else if((verOffset = nAgt.indexOf("Safari")) != -1){
				browserName = "Safari";
				fullVersion = nAgt.substring(verOffset + 7);
				if((verOffset = nAgt.indexOf("Version")) != -1) 
					fullVersion = nAgt.substring(verOffset + 8);
			}
			
			// In Firefox, the true version is after "Firefox" 
			else if((verOffset = nAgt.indexOf("Firefox")) != -1){
				browserName = "Firefox";
				fullVersion = nAgt.substring(verOffset + 8);
			}
			
			// In most other browsers, "name/version" is at the end of userAgent 
			else if((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))){
				browserName = nAgt.substring(nameOffset, verOffset);
				fullVersion = nAgt.substring(verOffset + 1);
				if(browserName.toLowerCase() == browserName.toUpperCase()){
					browserName = navigator.appName;
				}
			}
			
			// trim the fullVersion string at semicolon/space if present
			if((ix = fullVersion.indexOf(";")) != -1)
				fullVersion = fullVersion.substring(0, ix);
			if((ix = fullVersion.indexOf(" ")) != -1)
				fullVersion = fullVersion.substring(0, ix);

			majorVersion = parseInt(''+fullVersion, 10);
			if(isNaN(majorVersion)){
				fullVersion  = ''+parseFloat(navigator.appVersion); 
				majorVersion = parseInt(navigator.appVersion, 10);
			}
			
			console.log(''
				+'Browser name  = '+browserName+'\n'
				+'Full version  = '+fullVersion+'\n'
				+'Major version = '+majorVersion+'\n'
				+'navigator.appName = '+navigator.appName+'\n'
				+'navigator.userAgent = '+navigator.userAgent+'\n'
			);			
			
			var navigatorInfo = [];
			navigatorInfo['browserName'] = browserName;
			navigatorInfo['fullVersion'] = fullVersion;
			navigatorInfo['majorVersion'] = majorVersion;
			navigatorInfo['appName'] = navigator.appName;
			navigatorInfo['userAgent'] = navigator.userAgent;
			
			return navigatorInfo;
		}
		
		var MembersArray = [];
		
		var typeStat = ["pvp", "pve"];
		
		var color = new Array();
		color['very_bad'] = '#FE0E00'; // очень плохо, хуже чем у 85%
		color['bad'] = '#FE7903'; // плохо, хуже чем у 50%
		color['normal'] = '#F8F400'; // средне, лучше чем у 50%
		color['good'] = '#60FF00';  // хорошо, лучше чем у 75%
		color['very_good'] = '#02C9B3'; // очень хорошо, лучше чем у 95%
		color['unique'] = '#D042F3'; // уникально, лучше чем у 99%
		
		/* ===== Check load page ===== */
		if(window.location.href.indexOf("accounts") > -1 && window.location.href.split('/').length == 7 && window.location.href.split('/')[5].match(/[0-9]+/) != null){
			var account_id = window.location.href.split('/')[5].match(/[0-9]+/);
			MemberProfilePage();
		}else if(window.location.host == 'forum.worldofwarships.'+realm && window.location.href.indexOf("/topic/") > -1){
			ForumTopicPage();
		}
		
		jQ('.link-block').click(function(){onViewBlock(this);});
		
		/* ===== Pages function ===== */
		function MemberProfilePage(){
			var account = document.getElementsByClassName('account')[0];
			if(account === undefined){return;}			
		
			getMemberStatistic();
			getJson(WGAPI+'wgn/clans/membersinfo/?application_id='+application_id+'&language='+lang+'&account_id='+MembersArray[0]['account_id'], doneClanInfo, errorClanInfo);
		
			var content = document.getElementsByClassName('content')[0];
			var row = content.getElementsByClassName('row')[0];
			row.outerHTML += '' +
				'<div id="userscript-block-list">' +
					'<div id="userscript-forum-link" style="float:left;">' +
						'<a target="_blank" href="http://forum.worldofwarships.ru/index.php?/user/dn-'+MembersArray[0]['account_name']+'-/">'+localization['forum-profile']+'</a>' +
					'</div>' +
					getUserScriptDeveloperBlock() +
					'' +
				'</div>' +
			'';
		}
		function ForumTopicPage(){
			var ForumTopicMembers = [];
			var basic_info = document.getElementsByClassName('basic_info');
			for(var i = 0; i < basic_info.length; i++){
				var ipsUserPhotoLink = basic_info[i].getElementsByClassName('ipsUserPhotoLink')[0];
				if(undefined === ipsUserPhotoLink){continue;}
				if(ipsUserPhotoLink.id.indexOf('anonymous_element') > -1){
					var linkParse = ipsUserPhotoLink.href.split('/');
					var accountParse = linkParse[5].split('-');
					var account_id = accountParse[accountParse.length - 1];
					if(ForumTopicMembers['member_'+account_id] === undefined){
						ForumTopicMembers['member_'+account_id] = account_id;
						getJson(WGAPI+'wgn/clans/membersinfo/?application_id='+application_id+'&language='+lang+'&account_id='+account_id, doneForumClanInfo, errorForumClanInfo);
					}
					basic_info[i].innerHTML += '<li class="member_'+account_id+' desc lighter"></li>';
				}
			}
		}
		
		/* ===== ForumTopicPage function ===== */
		function doneForumClanInfo(url, response){
			if(response.status && response.status == "error"){
				errorForumClanInfo();
				return;
			}

			var vars = getUrlVars(url);
			var account_id = vars['account_id'];
			
			var clansInfo = response['data'][account_id];
			if(clansInfo != null){
				var icon = clansInfo['clan']['emblems']['x32']['portal'];
				if(icon === undefined){
					for(var key in clansInfo['clan']['emblems']['x32']){
						if(key != 'wot'){
							icon = clansInfo['clan']['emblems']['x32'][key];
						}
					}					
				}
			
				var html = '' +
					'<br />' +
					'<span>' +
						'<a align="center" href="http://ru.wargaming.net/clans/'+clansInfo['clan']['clan_id']+'/" title="'+clansInfo['clan']['tag']+'" rel="home" target="_blank">' +
							'<img src="'+icon+'" alt="'+clansInfo['clan']['tag']+'">' +
						'</a>' +
						'<a align="center" href="http://ru.wargaming.net/clans/'+clansInfo['clan']['clan_id']+'/" title="'+clansInfo['clan']['tag']+'" rel="home" target="_blank">['+clansInfo['clan']['tag']+']</a>' +
					'</span>' +
				'';
				jQ('.member_'+account_id).html(html);
			}
		}
		function errorForumClanInfo(url){}
		
		/* ===== MemberProfilePage function ===== */
		function viewMemberProfilePage(){
			for(var t = 0; t < typeStat.length; t++){
				var type = typeStat[t];
			
				var account_statistics__general = document.getElementsByClassName('account_statistics__general')[t];
				if(account_statistics__general !== undefined){
					var stat_main_middle = account_statistics__general.getElementsByClassName('stat-main-middle')[0];
					stat_main_middle.getElementsByClassName('value')[0].style.color = colorBattlesAvgXP(MembersArray[0][type]['avg_xp']);
				
					var stat = account_statistics__general.getElementsByClassName('stat');
					
					stat[0].getElementsByClassName('value')[0].style.color = colorBattles(MembersArray[0][type]['battles']);
					stat[1].getElementsByClassName('value')[0].style.color = colorWinsPercents(MembersArray[0][type]['wins_percents']);					
					stat[2].getElementsByClassName('value')[0].style.color = colorAvgDamage(MembersArray[0][type]['avg_damage'], MembersArray[0][type]['avg_level_battles']);
					stat[3].getElementsByClassName('value')[0].style.color = colorKillDead(MembersArray[0][type]['kill_dead']);

					var userbar = '';					
					var my_profile_nickname = document.getElementsByClassName('js-my_profile_nickname')[0].textContent;
					if(type == 'pvp' && lang == 'ru'){
						if(my_profile_nickname == MembersArray[0]['account_name']){
							userbar += '<button class="btn btn-default" id="generator-userbar" style="margin: 5px;">'+localization['generator-userbar']+'</button>';
						}
						
						userbar += '' +
							'<br />'+
							'<img id="userbar-img" src="'+WoWsStatInfoHref+'bg/userbar.png" />'+
							'<div id="userbar-link" style="margin: 5px;">[img]'+WoWsStatInfoHref+'bg/userbar.png[/img]</div>'
						'';
					}
					
					account_statistics__general.outerHTML += '' +
						'<hr />' +
						'<table style="width: 100%;">' +
							'<tr>' +
								'<td style="vertical-align: top;">' +
									'<div id="wowsstatinfo-'+type+'" class="wowsstatinfo-stat">' +
										'<span class="name-stat">'+localization['wr']+':</span> ' +
										'<font color="'+colorWalkureRating(MembersArray[0][type]['wr'])+'">'+(MembersArray[0][type]['wr']).toFixed(2)+'</font>' + 
									'</div>' +
								'</td>'+
								'<td style="width: 460px; text-align: center; vertical-align: top;">'+
									userbar +
								'</td>' +
							'</tr>' +
						'</table>'
					'';
				}
			}
			
			var img = new Image();
			img.onload = function(){
				var userbar_img = document.getElementById('userbar-img');
				if(userbar_img != null){
					userbar_img.src = WoWsStatInfoHref+'userbar/'+MembersArray[0]['account_name']+'.png'+'?'+Math.floor(Math.random()*100000001);
					
					var userbar_link = document.getElementById('userbar-link');
					userbar_link.textContent = '[img]'+WoWsStatInfoHref+'userbar/'+MembersArray[0]['account_name']+'.png[/img]';
				}
			}
			img.src = WoWsStatInfoHref+'userbar/'+MembersArray[0]['account_name']+'.png'+'?'+Math.floor(Math.random()*100000001);
			
			jQ('#generator-userbar').click(function(){
				getJson(WoWsStatInfoHref+'bg/bg.php?'+Math.floor(Math.random()*100000001), doneUserBarBG, errorUserBarBG);
			});

			if(MembersArray[0]['clans'] != null){
				var day = dateDiffInDays(MembersArray[0]['clans']['joined_at'] * 1000, new Date().getTime());
				
				var icon = MembersArray[0]['clans']['clan']['emblems']['x32']['portal'];
				if(icon === undefined){
					for(var key in MembersArray[0]['clans']['clan']['emblems']['x32']){
						if(key != 'wot'){
							icon = MembersArray[0]['clans']['clan']['emblems']['x32'][key];
						}
					}					
				}
			
				var content = document.getElementsByClassName('content')[0];
				var row = content.getElementsByClassName('row')[0];
				var col_md_8 = row.getElementsByClassName('col-md-8')[0];
				col_md_8.outerHTML += '' +
					'<style>' +
						'.b-profile-clan{float: right;max-width: 400px;margin-top: -90px;padding-right: 100px;margin-bottom: 14px;padding-top: 5px;position: relative;}' +
						'.b-profile-clan_photo{float: left;width: 61px;position: relative;min-height: 70px;top: 5px;}' +
						'.b-profile-clan_color{width: 15px;height: 15px;position: absolute;left: 38px;top: 2px;}' +
						'.b-profile-clan_link{background-image: url("data:image/png;charset=utf-8;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAA2CAYAAACMRWrdAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkI4NTIxMEI3ODRFODExRTI5ODYxODk4QjE3Q0IyNzkyIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkI4NTIxMEI4ODRFODExRTI5ODYxODk4QjE3Q0IyNzkyIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Qjg1MjEwQjU4NEU4MTFFMjk4NjE4OThCMTdDQjI3OTIiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Qjg1MjEwQjY4NEU4MTFFMjk4NjE4OThCMTdDQjI3OTIiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7V+fopAAAMmElEQVR42sxazY7jxhEm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");display: block;height: 54px;position: absolute;left: 2px;padding: 11px 0 0 11px;width: 54px;}' +
						'.b-profile-clan_text{margin-left: 61px;}' +
						'.b-profile-clan_text-wrpr{font-size: 13px;margin: 5px 0 0;overflow: hidden;padding-right: 0;padding: 0 0 7px;text-overflow: ellipsis;white-space: nowrap;}' +
						'.b-link-clan{color: #f9d088;font-weight: bold;text-decoration: none;}' +
						'.b-link-clan_tag{color: #babcbf;}' +
						'.b-statistic{overflow: hidden;margin: 0 0 16px;line-height: 14px;}' +
						'.b-statistic_item{color: #606061;font-size: 11px;margin: 0;padding: 0;line-height: 125%;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;word-wrap: normal;}' +
						'.b-statistic_value{color: #babcbf;}' +
					'</style>' +
					'<div class="b-profile-clan b-profile-clan__points js-tooltip" id="js-profile-clan">' +
						'<div class="b-profile-clan_photo">' +
							'<div style="background: '+MembersArray[0]['clans']['clan']['color']+';" class="b-profile-clan_color"><!-- --></div>' +
							'<a class="b-profile-clan_link" href="http://'+realm+'.wargaming.net/clans/'+MembersArray[0]['clans']['clan']['clan_id']+'/" target="_blank">' +
								'<img alt="'+MembersArray[0]['clans']['clan']['name']+'" src="'+icon+'" width="32" height="32">' +
							'</a>' +
						'</div>' +
						'<div class="b-profile-clan_text">' +
							'<div class="b-profile-clan_text-wrpr">' +
								'<a class="b-link-clan" href="http://'+realm+'.wargaming.net/clans/'+MembersArray[0]['clans']['clan']['clan_id']+'/" target="_blank">' +
									'<span class="b-link-clan_tag">['+MembersArray[0]['clans']['clan']['tag']+']</span>&nbsp;'+MembersArray[0]['clans']['clan']['name']+'' +
								'</a>' +
							'</div>' +
							'<div class="b-statistic">' +
								'<p class="b-statistic_item">'+localization['role']+': <span class="b-statistic_value">'+MembersArray[0]['clans']['role_i18n']+'</span></p>' +
								'<p class="b-statistic_item">'+localization['clan-day']+': <span class="b-statistic_value">'+day+'</span></p>' +
							'</div>' +
						'</div>' +
					'</div>' +
				'';
			}			
		}
		function getMemberStatistic(){
			MembersArray[0] = [];
			
			var account_href = window.location.href.split('/')[5].split('-');
			var account_id = account_href[0];
			var account_name = account_href[1];
			
			var account = document.getElementsByClassName('account')[0];
			account_name = account.getElementsByTagName('h1')[0].textContent;
			
			MembersArray[0]['account_id'] = account_id;
			MembersArray[0]['account_name'] = account_name;
			
			for(var t = 0; t < typeStat.length; t++){
				var type = typeStat[t];				
				MembersArray[0][type] = [];
				
				var account_statistic = document.getElementById(type);
				if(account_statistic == null){continue;}
				var account_statistics = account_statistic.getElementsByClassName('account_statistics__rates-small-border');
				if(account_statistics.length == 3){
					MembersArray[0][type]['battles'] = htmlParseMemberStatistic(account_statistics[0].rows[1].cells[1]);
					MembersArray[0][type]['wins'] = htmlParseMemberStatistic(account_statistics[0].rows[2].cells[1]);
					MembersArray[0][type]['losses'] = htmlParseMemberStatistic(account_statistics[0].rows[3].cells[1]);
					MembersArray[0][type]['draws'] = htmlParseMemberStatistic(account_statistics[0].rows[4].cells[1]);
					MembersArray[0][type]['survived_battles'] = htmlParseMemberStatistic(account_statistics[0].rows[5].cells[1]);
					MembersArray[0][type]['damage'] = htmlParseMemberStatistic(account_statistics[0].rows[6].cells[1]);
					MembersArray[0][type]['frags_ships'] = htmlParseMemberStatistic(account_statistics[0].rows[7].cells[1]);
					MembersArray[0][type]['frags_planes'] = htmlParseMemberStatistic(account_statistics[0].rows[8].cells[1]);
					MembersArray[0][type]['capture_base'] = htmlParseMemberStatistic(account_statistics[0].rows[9].cells[1]);
					MembersArray[0][type]['defend_base'] = htmlParseMemberStatistic(account_statistics[0].rows[10].cells[1]);
					
					if(account_statistics[1].rows.length == 7){
							MembersArray[0][type]['avg_xp'] = htmlParseMemberStatistic(account_statistics[1].rows[1].cells[1]);
							MembersArray[0][type]['avg_damage'] = htmlParseMemberStatistic(account_statistics[1].rows[2].cells[1]);
							MembersArray[0][type]['avg_frags_ships'] = htmlParseMemberStatistic(account_statistics[1].rows[3].cells[1]);
							MembersArray[0][type]['avg_frags_planes'] = htmlParseMemberStatistic(account_statistics[1].rows[4].cells[1]);
							MembersArray[0][type]['hits_percents_battery'] = 0;
							MembersArray[0][type]['hits_percents_torpedo'] = 0;
							MembersArray[0][type]['avg_capture_base'] = htmlParseMemberStatistic(account_statistics[1].rows[5].cells[1]);
							MembersArray[0][type]['avg_defend_base'] = htmlParseMemberStatistic(account_statistics[1].rows[6].cells[1]);
					}else if(account_statistics[1].rows.length == 8){
						MembersArray[0][type]['avg_xp'] = htmlParseMemberStatistic(account_statistics[1].rows[1].cells[1]);
						MembersArray[0][type]['avg_damage'] = htmlParseMemberStatistic(account_statistics[1].rows[2].cells[1]);
						MembersArray[0][type]['avg_frags_ships'] = htmlParseMemberStatistic(account_statistics[1].rows[3].cells[1]);
						MembersArray[0][type]['avg_frags_planes'] = htmlParseMemberStatistic(account_statistics[1].rows[4].cells[1]);
						MembersArray[0][type]['hits_percents_battery'] = htmlParseMemberStatistic(account_statistics[1].rows[5].cells[1]);
						MembersArray[0][type]['hits_percents_torpedo'] = 0;
						MembersArray[0][type]['avg_capture_base'] = htmlParseMemberStatistic(account_statistics[1].rows[6].cells[1]);
						MembersArray[0][type]['avg_defend_base'] = htmlParseMemberStatistic(account_statistics[1].rows[7].cells[1]);
					}else{
						MembersArray[0][type]['avg_xp'] = htmlParseMemberStatistic(account_statistics[1].rows[1].cells[1]);
						MembersArray[0][type]['avg_damage'] = htmlParseMemberStatistic(account_statistics[1].rows[2].cells[1]);
						MembersArray[0][type]['avg_frags_ships'] = htmlParseMemberStatistic(account_statistics[1].rows[3].cells[1]);
						MembersArray[0][type]['avg_frags_planes'] = htmlParseMemberStatistic(account_statistics[1].rows[4].cells[1]);
						MembersArray[0][type]['hits_percents_battery'] = htmlParseMemberStatistic(account_statistics[1].rows[5].cells[1]);
						MembersArray[0][type]['hits_percents_torpedo'] = htmlParseMemberStatistic(account_statistics[1].rows[6].cells[1]);
						MembersArray[0][type]['avg_capture_base'] = htmlParseMemberStatistic(account_statistics[1].rows[7].cells[1]);
						MembersArray[0][type]['avg_defend_base'] = htmlParseMemberStatistic(account_statistics[1].rows[8].cells[1]);					
					}
					
					MembersArray[0][type]['max_xp'] = htmlParseMemberStatistic(account_statistics[2].rows[1].cells[1]);
					MembersArray[0][type]['max_damage'] = htmlParseMemberStatistic(account_statistics[2].rows[2].cells[1]);
					MembersArray[0][type]['max_frags_ships'] = htmlParseMemberStatistic(account_statistics[2].rows[3].cells[1]);
					MembersArray[0][type]['max_frags_planes'] = htmlParseMemberStatistic(account_statistics[2].rows[4].cells[1]);
					
					var ships__avg_params = account_statistic.getElementsByClassName('ships__avg-params')[0]
					MembersArray[0][type]['avg_level_battles'] = htmlParseMemberStatistic(ships__avg_params.getElementsByClassName('_value')[0]);
				}else{
					MembersArray[0][type]['battles'] = 0;
					MembersArray[0][type]['wins'] = 0;
					MembersArray[0][type]['losses'] = 0;
					MembersArray[0][type]['draws'] = 0;
					MembersArray[0][type]['survived_battles'] = 0;
					MembersArray[0][type]['hits_percents_battery'] = 0;
					MembersArray[0][type]['hits_percents_torpedo'] = 0;
					MembersArray[0][type]['damage'] = 0;
					MembersArray[0][type]['frags_ships'] = 0;
					MembersArray[0][type]['frags_planes'] = 0;
					MembersArray[0][type]['capture_base'] = 0;
					MembersArray[0][type]['defend_base'] = 0;
					
					MembersArray[0][type]['avg_xp'] = 0;
					MembersArray[0][type]['avg_damage'] = 0;
					MembersArray[0][type]['avg_frags_ships'] = 0;
					MembersArray[0][type]['avg_frags_planes'] = 0;
					MembersArray[0][type]['avg_capture_base'] = 0;
					MembersArray[0][type]['avg_defend_base'] = 0;
					
					MembersArray[0][type]['max_xp'] = 0;
					MembersArray[0][type]['max_damage'] = 0;
					MembersArray[0][type]['max_frags_ships'] = 0;
					MembersArray[0][type]['max_frags_planes'] = 0;
					
					MembersArray[0][type]['avg_level_battles'] = 0;
				}
				
				MembersArray[0][type]['ships'] = [];
				var wows_account_stats = account_statistic.getElementsByClassName('wows-account-stats')[0];
				if(wows_account_stats !== undefined){
					for(var i = 0; i < wows_account_stats.rows.length; i++){
						if(i == 0){continue;}
						
						var row = wows_account_stats.rows[i];
						
						if(row.getAttribute('class').indexOf('ship-class-section') > -1){
							continue;
						}else if(row.getAttribute('class') == 'ship-entry-statistic'){
							var index = MembersArray[0][type]['ships'].length - 1;
							
							var account_statistics__rates = row.cells[0].getElementsByClassName('account_statistics__rates');
							
							MembersArray[0][type]['ships'][index]['battles'] = htmlParseMemberStatistic(account_statistics__rates[0].rows[1].cells[1]);
							MembersArray[0][type]['ships'][index]['wins'] = htmlParseMemberStatistic(account_statistics__rates[0].rows[2].cells[1]);
							MembersArray[0][type]['ships'][index]['losses'] = htmlParseMemberStatistic(account_statistics__rates[0].rows[3].cells[1]);
							MembersArray[0][type]['ships'][index]['draws'] = htmlParseMemberStatistic(account_statistics__rates[0].rows[4].cells[1]);
							MembersArray[0][type]['ships'][index]['survived_battles'] = htmlParseMemberStatistic(account_statistics__rates[0].rows[5].cells[1]);
							MembersArray[0][type]['ships'][index]['damage'] = htmlParseMemberStatistic(account_statistics__rates[0].rows[6].cells[1]);
							MembersArray[0][type]['ships'][index]['frags_ships'] = htmlParseMemberStatistic(account_statistics__rates[0].rows[7].cells[1]);
							MembersArray[0][type]['ships'][index]['frags_planes'] = htmlParseMemberStatistic(account_statistics__rates[0].rows[8].cells[1]);
							MembersArray[0][type]['ships'][index]['capture_base'] = htmlParseMemberStatistic(account_statistics__rates[0].rows[9].cells[1]);
							MembersArray[0][type]['ships'][index]['defend_base'] = htmlParseMemberStatistic(account_statistics__rates[0].rows[10].cells[1]);
							
							if(account_statistics__rates[1].rows.length == 7){
								MembersArray[0][type]['ships'][index]['avg_xp'] = htmlParseMemberStatistic(account_statistics__rates[1].rows[1].cells[1]);
								MembersArray[0][type]['ships'][index]['avg_damage'] = htmlParseMemberStatistic(account_statistics__rates[1].rows[2].cells[1]);
								MembersArray[0][type]['ships'][index]['avg_frags_ships'] = htmlParseMemberStatistic(account_statistics__rates[1].rows[3].cells[1]);
								MembersArray[0][type]['ships'][index]['avg_frags_planes'] = htmlParseMemberStatistic(account_statistics__rates[1].rows[4].cells[1]);
								MembersArray[0][type]['ships'][index]['hits_percents_battery'] = 0;
								MembersArray[0][type]['ships'][index]['hits_percents_torpedo'] = 0;
								MembersArray[0][type]['ships'][index]['avg_capture_base'] = htmlParseMemberStatistic(account_statistics__rates[1].rows[5].cells[1]);
								MembersArray[0][type]['ships'][index]['avg_defend_base'] = htmlParseMemberStatistic(account_statistics__rates[1].rows[6].cells[1]);
							}else if(account_statistics__rates[1].rows.length == 8){
								MembersArray[0][type]['ships'][index]['avg_xp'] = htmlParseMemberStatistic(account_statistics__rates[1].rows[1].cells[1]);
								MembersArray[0][type]['ships'][index]['avg_damage'] = htmlParseMemberStatistic(account_statistics__rates[1].rows[2].cells[1]);
								MembersArray[0][type]['ships'][index]['avg_frags_ships'] = htmlParseMemberStatistic(account_statistics__rates[1].rows[3].cells[1]);
								MembersArray[0][type]['ships'][index]['avg_frags_planes'] = htmlParseMemberStatistic(account_statistics__rates[1].rows[4].cells[1]);
								MembersArray[0][type]['ships'][index]['hits_percents_battery'] = htmlParseMemberStatistic(account_statistics__rates[1].rows[5].cells[1]);
								MembersArray[0][type]['ships'][index]['hits_percents_torpedo'] = 0;
								MembersArray[0][type]['ships'][index]['avg_capture_base'] = htmlParseMemberStatistic(account_statistics__rates[1].rows[6].cells[1]);
								MembersArray[0][type]['ships'][index]['avg_defend_base'] = htmlParseMemberStatistic(account_statistics__rates[1].rows[7].cells[1]);
							}else{
								MembersArray[0][type]['ships'][index]['avg_xp'] = htmlParseMemberStatistic(account_statistics__rates[1].rows[1].cells[1]);
								MembersArray[0][type]['ships'][index]['avg_damage'] = htmlParseMemberStatistic(account_statistics__rates[1].rows[2].cells[1]);
								MembersArray[0][type]['ships'][index]['avg_frags_ships'] = htmlParseMemberStatistic(account_statistics__rates[1].rows[3].cells[1]);
								MembersArray[0][type]['ships'][index]['avg_frags_planes'] = htmlParseMemberStatistic(account_statistics__rates[1].rows[4].cells[1]);
								MembersArray[0][type]['ships'][index]['hits_percents_battery'] = htmlParseMemberStatistic(account_statistics__rates[1].rows[5].cells[1]);
								MembersArray[0][type]['ships'][index]['hits_percents_torpedo'] = htmlParseMemberStatistic(account_statistics__rates[1].rows[6].cells[1]);
								MembersArray[0][type]['ships'][index]['avg_capture_base'] = htmlParseMemberStatistic(account_statistics__rates[1].rows[7].cells[1]);
								MembersArray[0][type]['ships'][index]['avg_defend_base'] = htmlParseMemberStatistic(account_statistics__rates[1].rows[8].cells[1]);
							}
							
							MembersArray[0][type]['ships'][index]['max_xp'] = htmlParseMemberStatistic(account_statistics__rates[2].rows[1].cells[1]);
							MembersArray[0][type]['ships'][index]['max_damage'] = htmlParseMemberStatistic(account_statistics__rates[2].rows[2].cells[1]);
							MembersArray[0][type]['ships'][index]['max_frags_ships'] = htmlParseMemberStatistic(account_statistics__rates[2].rows[3].cells[1]);
							MembersArray[0][type]['ships'][index]['max_frags_planes'] = htmlParseMemberStatistic(account_statistics__rates[2].rows[4].cells[1]);
							
							continue;
						}else if(row.getAttribute('class').indexOf('ship-entry') > -1){
							var index = MembersArray[0][type]['ships'].length;
							MembersArray[0][type]['ships'][index] = [];
							
							var class_nation = row.cells[0].getAttribute('class').split(' ');
							for(var cn = 0; cn < class_nation.length; cn++){
								if(class_nation[cn].indexOf('ship_') > -1){
									MembersArray[0][type]['ships'][index]['ship_class'] = class_nation[cn].split('_')[1];
								}else if(class_nation[cn].indexOf('nation_') > -1){
									MembersArray[0][type]['ships'][index]['ship_nation'] = class_nation[cn].split('_')[1];
								}
							}
							
							MembersArray[0][type]['ships'][index]['ship_level'] = row.cells[0].textContent.trim().split("\n")[0].trim();
							MembersArray[0][type]['ships'][index]['ship_name'] = row.cells[0].textContent.trim().split("\n")[1].trim();
							
							continue;
						}
					}
				}
				
				/* ===== Calc Statistic ===== */
				{
					MembersArray[0][type]['wins_percents'] = (MembersArray[0][type]['wins']/MembersArray[0][type]['battles'])*100;
					MembersArray[0][type]['kill_dead'] = MembersArray[0][type]['frags_ships']/(MembersArray[0][type]['battles']-MembersArray[0][type]['survived_battles']);
				
					var avg_damage = MembersArray[0][type]['avg_damage'];
					var avg_frags_ships = MembersArray[0][type]['avg_frags_ships'];
					var avg_frags_planes = MembersArray[0][type]['avg_frags_planes'];
					var avg_capture_base = MembersArray[0][type]['avg_capture_base'];
					var avg_defend_base = MembersArray[0][type]['avg_defend_base'];
					var avg_level_battles = MembersArray[0][type]['avg_level_battles'];
					
					var wr = avg_damage/(avg_level_battles*10) + avg_frags_ships*200 + (avg_frags_planes/6)*120 + avg_capture_base*35 + avg_defend_base*35;
					if(isNaN(wr)){wr = 0;}
					MembersArray[0][type]['wr'] = wr;
					
					for(var i = 0; i < MembersArray[0][type]['ships'].length; i++){
						MembersArray[0][type]['ships'][i]['wins_percents'] = (MembersArray[0][type]['ships'][i]['wins']/MembersArray[0][type]['ships'][i]['battles'])*100;
						MembersArray[0][type]['ships'][i]['kill_dead'] = MembersArray[0][type]['ships'][i]['frags_ships']/(MembersArray[0][type]['ships'][i]['battles']-MembersArray[0][type]['ships'][i]['survived_battles']);
						
						var avg_damage = MembersArray[0][type]['ships'][i]['avg_damage'];
						var avg_frags_ships = MembersArray[0][type]['ships'][i]['avg_frags_ships'];
						var avg_frags_planes = MembersArray[0][type]['ships'][i]['avg_frags_planes'];
						var avg_capture_base = MembersArray[0][type]['ships'][i]['avg_capture_base'];
						var avg_defend_base = MembersArray[0][type]['ships'][i]['avg_defend_base'];
						var level_battles = getLevelNumer(MembersArray[0][type]['ships'][i]['ship_level']);
						
						var wr = avg_damage/(avg_level_battles*10) + avg_frags_ships*200 + (avg_frags_planes/6)*120 + avg_capture_base*35 + avg_defend_base*35;
						if(isNaN(wr)){wr = 0;}
						MembersArray[0][type]['ships'][i]['wr'] = wr;
					}
				}
			}
			//console.log(MembersArray[0]);
		}
		function doneClanInfo(url, response){
			if(response.status && response.status == "error"){
				errorClanInfo();
				return;
			}
			
			var vars = getUrlVars(url);
			var account_id = vars['account_id'];
			
			MembersArray[0]['clans'] = response['data'][account_id];
			
			viewMemberProfilePage();
		}
		function errorClanInfo(url){
			MembersArray[0]['clans'] = null;
			
			viewMemberProfilePage();
		}
		function GeneratorUserBar(){
			var userbarbg = 'userbar';
			
			var radios = document.getElementsByName('userbar-bg');
			for(var i = 0; i < radios.length; i++){
				if(radios[i].checked){
					userbarbg = radios[i].value;
					break;
				}
			}
		
			var jsonString = 'json='+JSON.stringify(MembersArray[0])+'&type=userbar&userbarbg='+userbarbg;
			
			var xmlhttp;
			try{
				xmlhttp = new ActiveXObject('Msxml2.XMLHTTP');
			}catch(e){
				try{
					xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
				}catch(E){
					xmlhttp = false;
				}
			}
			if(!xmlhttp && typeof XMLHttpRequest != 'undefined'){
				xmlhttp = new XMLHttpRequest();
			}
			xmlhttp.open('POST', ''+WoWsStatInfoHref+'userbar.php?random='+Math.floor(Math.random()*100000001), true);
			xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			xmlhttp.onreadystatechange = function(){
				if(xmlhttp.readyState == 4){
					if(xmlhttp.status == 200){
						var userbar_img = document.getElementById('userbar-img');
						userbar_img.src = xmlhttp.responseText+'?'+Math.floor(Math.random()*100000001);
						
						var userbar_link = document.getElementById('userbar-link');
						userbar_link.textContent = '[img]'+xmlhttp.responseText+'[/img]';
					}
				}
			};
			xmlhttp.send(jsonString);
		}
		function doneUserBarBG(url, response){
			var html = '';
			
			var data = response;
			
			html += '<div style="width: 488px; height: 429px; overflow-y: scroll;">';
			for(var i = 0; i < data.length; i++){
				var checked = ''; if(i == 0){checked = 'checked="checked"';}
				
				var imgbgview = false;
				var img = data[i].split('_');
				if(img.length > 1){
					for(var i_id = 1; i_id < img.length; i_id++){
						if(MembersArray[0]['clans'] == null){break;}
						if(img[i_id] == MembersArray[0]['clans']['clan']['clan_id']){
							imgbgview = true;
						}
					}
				}else{
					imgbgview = true;
				}
				
				if(imgbgview){
					html += '<input type="radio" name="userbar-bg" value="'+data[i]+'" '+checked+'> '+data[i]+'<br />';
					html += '<img src="'+WoWsStatInfoHref+'bg/'+data[i]+'.png" title="'+data[i]+'"/><br /><br />';
				}
			}
			html += '</div>';
			
			onShowMessage(
				localization['userbar-bg'],
				html,
				function(){GeneratorUserBar(); onCloseMessage();},
				localization['Ok'],
				true
			);			
		}
		function errorUserBarBG(url){
			var html = '' +
				'<div style="width: 488px;">' +
					'<input type="radio" name="userbar-bg" value="userbar" checked="checked"> userbar<br />' +
					'<img src="'+WoWsStatInfoHref+'bg/userbar.png" title="userbar"/><br /><br />' +
				'</div>' +
			'';
			
			onShowMessage(
				localization['userbar-bg'],
				html,
				function(){GeneratorUserBar(); onCloseMessage();},
				localization['Ok'],
				true
			);
		}
		
		function htmlParseMemberStatistic(element){
			var value = element.textContent.trim().replace(new RegExp(' ', 'g'), '');
			value = value.replace(/[^0-9,()% ]/g, "");
			
			value = value.replace('%', '');
			value = value.replace(',', '.');
			
			if(value.indexOf('(') > -1 && value.indexOf(')') > -1){
				value = (value.split(' '))[0];
			}
			
			return value;
		}
		
		/* ===== Color function ===== */
		function findColor(value, colorsBorders) {
			if (isNaN(value) || value <= colorsBorders[0]) {
				return color['very_bad'];
			} else if (value <= colorsBorders[1]) {
				return color['bad'];
			} else if (value <= colorsBorders[2]) {
				return color['normal'];
			} else if (value <= colorsBorders[3]) {
				return color['good'];
			} else if (value <= colorsBorders[4]) {
				return color['very_good'];
			} else if (value <= colorsBorders[5]) {
				return color['unique'];
			} else {
				return color['very_bad'];
			}
		}
		function colorBattles(b){
			return findColor(b / 1000, [0.5, 1.5, 4, 7.5, 10, 999]);
		}		
		function colorWinsPercents(wp){
			return findColor(wp, [46, 48, 51, 56, 64, 100]);
		}
		function colorBattlesAvgXP(baxp) {
			return findColor(baxp, [1000, 1150, 1375, 1600, 1825, 9999]);
		}		
		function colorWalkureRating(wr) {
			return findColor(wr, [609, 849, 1144, 1474, 1774, 9999]);
		}		
		function colorAvgDamage(ad, alb) {
			return findColor(ad/(alb*10), [300, 500, 700, 850, 1000, 9999]);
		}
		function colorKillDead(kd) {
			return findColor(kd, [1.3, 1.7, 2.1, 2.5, 2.7, 99]);
		}		
		
		/* ===== UserScript function ===== */
		function getJson(url, onDone, onError){
			if(MaxProcess > Process){
				Process++;
				jQ.getJSON(url).done(function(result){
					Process--;
					onDone(url, result);
				}).fail(function(jqxhr, textStatus, error){
					Process--;
					onError(url);
				});
			}else{
				setTimeout(function(){getJson(url, onDone, onError);}, 1000);
			}
		}
		function getApplicationId(realm){
			var applicationId = [];
			
			applicationId['ru'] = '465b433458404851342a8ad750e67820'; // .ru
			applicationId['eu'] = '953df86f6bca01a7af80c3bdedd9c1d9'; // .eu
			
			return applicationId[realm].split("").reverse().join("");
		}
		function getUrlVars(url){
			var vars = {};
			var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value){
				vars[key] = value;
			});
			return vars;
		}
		function dateDiffInDays(a, b){
			var date1 = new Date(a);
			var date2 = new Date(b);
			if(b == null){
				date2 = new Date();
			}
			var timeDiff = date2.getTime() - date1.getTime(); 
			var diffDays = timeDiff / (1000 * 3600 * 24); 
			if(diffDays < 0){diffDays = 0;}
			return (diffDays).toFixed(0);
		}		
		function getUserScriptDeveloperBlock(){
			var html = '' +
				'<div class="div-link-block">' +
					'<span id="userscriptwowsstatinfo" class="link-block hide-block">' +
						'UserScript WoWsStatInfo ' + VersionWoWsStatInfo +
						'<div class="icon-link-block"></div>'+
					'</span>' +
				'</div>' +
				'<div id="userscript-block" class="userscriptwowsstatinfo hide-block" style="text-align: center;">' +
					'<span class="userscript-developer" align="center">' +
						localization['userscript-developer'] +
						' <a target="_blank" style="color: #658C4C; font-weight: bold; border-bottom: 1px dotted #658C4C;" href="http://worldofwarships.ru/cbt/accounts/635939-Vov_chiK/">Vov_chiK</a> ' +
						localization['userscript-alliance'] +
						' <a target="_blank" style="color: #2CA8C7; font-weight: bold; border-bottom: 1px dotted #2CA8C7;" href="http://'+realm+'.wargaming.net/clans/search/#wgsearch&offset=0&limit=10&search=Walkure">Walkure</a>.' +
						'<br /><br />' +
						localization['userscript-topic']+' '+
						'<a target="_blank" href="'+WoWsStatInfoLink+'">' +
							WoWsStatInfoLinkName +
						'</a>' +
						'<br /><br />' +
						'<font style="font-size: 16px; color: #658C4C;">'+localization['userscript-developer-support']+'</font><br />'+
						'<font style="color: #2CA8C7;">Web-Money WMR</font> R295712009837 <br />'+
						'<font style="color: #2CA8C7;">Web-Money WMZ</font> Z226959724402 <br />'+						
						'<font style="color: #2CA8C7;">Yandex Money</font> 41001290117791 <br />'+						
						'<font style="color: #2CA8C7;">RBK Money</font> RU353257918 <br />'+						
					'</span>' +
				'</div>' +
			'';
			return html;
		}
		function onViewBlock(element){
			if(null != element.getAttribute('id')){
				var viewId = element.getAttribute('id');
				var viewClassLink = element.getAttribute('class');
				var viewBlock = document.getElementsByClassName(viewId)[0];
				if(viewClassLink == 'link-block hide-block'){
					element.setAttribute('class', 'link-block show-block');
					viewBlock.setAttribute('class', viewBlock.getAttribute('class').replace('hide-block', 'show-block'));
					setLocalStorage(viewId, 'show', false);
				}else{
					element.setAttribute('class', 'link-block hide-block');
					viewBlock.setAttribute('class', viewBlock.getAttribute('class').replace('show-block', 'hide-block'));
					setLocalStorage(viewId, 'hide', false);
				}
			}
		}
		function checkLocalStorage(){
			try{
				return 'localStorage' in window && window['localStorage'] !== null;
			}catch (e){
				return false;
			}
		}
		function setLocalStorage(key, value, allPageHost){
			if(checkLocalStorage()){
				if(allPageHost){key = key+ClanId;}
				window.localStorage.setItem(key, value);
			}else{
				setCookie(key, value, allPageHost);
			}
		}
		function getLocalStorage(key, allPageHost){
			var value = null;
			if(checkLocalStorage()){
				if(allPageHost){key = key+ClanId;}
				value = window.localStorage.getItem(key);
			}else{
				value = getCookie(key);
			}
			return value;			
		}
		function setCookie(c_name, value, allPageHost){
			var exdate = new Date();
			exdate.setDate(exdate.getDate() + 365);
			if(allPageHost){
				var c_value = escape(value) + ((365 == null) ? "" : "; expires="+exdate.toUTCString()+"; domain=" +window.location.hostname+"; path=/");
				document.cookie = c_name + "=" + c_value;
			}else{
				var c_value = escape(value) + ((365 == null) ? "" : "; expires="+exdate.toUTCString());
				document.cookie = c_name + "=" + c_value;
			}
		}
		function getCookie(c_name){
			var c_value = document.cookie;
			var c_start = c_value.indexOf(" " + c_name + "=");
			if(c_start == -1){
				c_start = c_value.indexOf(c_name + "=");
			}
			if(c_start == -1){
				c_value = null;
			}else{
				c_start = c_value.indexOf("=", c_start) + 1;
				var c_end = c_value.indexOf(";", c_start);
				if(c_end == -1){
					c_end = c_value.length;
				}
				c_value = unescape(c_value.substring(c_start,c_end));
			}
			return c_value;
		}		
		function onShowMessage(title, content, funcOk, OkText, viewCancel){
			var ui_dialog_title = message.getElementsByClassName("ui-dialog-title")[0];
			ui_dialog_title.innerHTML = title;
			
			var popup = message.getElementsByClassName("popup")[0];
			popup.innerHTML = content;
			
			var button_inner = message.getElementsByClassName("button_inner")[0];
			button_inner.innerHTML = OkText;
			
			var link__cancel = message.getElementsByClassName("link__cancel")[0];
			if(viewCancel){
				link__cancel.style.display = 'inline';
			}else{
				link__cancel.style.display = 'none';
			}
			
			message.style.display = 'block';
			messagebg.style.display = 'block';
			
			message.style.marginLeft = '-'+(message.offsetWidth / 2)+'px';
			//message.style.top = (window.scrollY + ((document.body.offsetHeight / 2) - (message.offsetHeight / 2)))+'px';
			message.style.top = (window.scrollY + 50)+'px';
			
			jQ('#userscript-message-ok').unbind('click');
			jQ('#userscript-message-ok').click(funcOk);
			jQ('#userscript-message-close').unbind('click');
			jQ('#userscript-message-close').click(function(){onCloseMessage();});
			jQ('#userscript-message-cancel').unbind('click');
			jQ('#userscript-message-cancel').click(function(){onCloseMessage();});
		}
		function onCloseMessage(){
			message.style.display = 'none';
			messagebg.style.display = 'none';
		}
		function getLevelNumer(text){
			if('I' == text){
				return 1;
			}else if('II' == text){
				return 2;
			}else if('III' == text){
				return 3;
			}else if('IV' == text){
				return 4;
			}else if('V' == text){
				return 5;
			}else if('VI' == text){
				return 6;
			}else if('VII' == text){
				return 7;
			}else if('VIII' == text){
				return 8;
			}else if('IX' == text){
				return 9;
			}else if('X' == text){
				return 10;
			}
			return 0;
		}
		// Modify JSON.stringify to allow recursive and single-level arrays
		(function(){
			// Convert array to object
			var convArrToObj = function(array){
				var thisEleObj = new Object();
				if(typeof array == "object"){
					for(var i in array){
						var thisEle = convArrToObj(array[i]);
						thisEleObj[i] = thisEle;
					}
				}else {
					thisEleObj = array;
				}
				return thisEleObj;
			};
			var oldJSONStringify = JSON.stringify;
			JSON.stringify = function(input){
				return oldJSONStringify(convArrToObj(input));
			};
		})();
		function getLocalization(lang){
			var localization = [];
			
			{/* Русский */
				localization['ru'] = [];
				
				localization['ru']['realm'] = 'ru';
				
				localization['ru']['Box'] = 'Оповещение';
				localization['ru']['Ok'] = 'Ok';
				localization['ru']['Cancel'] = 'Отмена';
				
				localization['ru']['ErrorScript'] = 'Во время работы UserScript WoWsStatInfo '+VersionWoWsStatInfo+', возникла ошибка:';
				localization['ru']['ErrorSendDeveloper'] = 'Сообщите об ошибке разработчику скрипта.';
				
				localization['ru']['userscript-developer'] = 'Разработчик UserScript WoWsStatInfo:';
				localization['ru']['userscript-alliance'] = 'член альянса';
				localization['ru']['userscript-topic'] = 'Тема на форуме:';
				localization['ru']['userscript-developer-support'] = 'Поддержать автора скрипта:';
				
				localization['ru']['forum-profile'] = 'Профиль на форуме';
				localization['ru']['role'] = 'Должность';
				localization['ru']['clan-day'] = 'Количество дней в клане';
				
				localization['ru']['generator-userbar'] = 'Создать UserBar';
				localization['ru']['userbar-bg'] = 'Выберите фон:';
				
				localization['ru']['wr'] = 'WR';
			}
			
			{/* English */
				localization['en'] = [];
				
				localization['en']['realm'] = 'eu';

				localization['en']['Box'] = 'Notification';
				localization['en']['Ok'] = 'Ok';
				localization['en']['Cancel'] = 'Cancel';
				
				localization['en']['ErrorScript'] = 'An error occurred while running UserScript WoWsStatInfo '+VersionWoWsStatInfo+', script:';
				
				localization['en']['ErrorSendDeveloper'] = 'Please, inform script developer about this error.';
				
				localization['en']['userscript-developer'] = 'Developer - UserScript WoWsStatInfo:';
				localization['en']['userscript-alliance'] = 'аlliance member';
				localization['en']['userscript-topic'] = 'Forum topic:';
				localization['en']['userscript-developer-support'] = 'Ways to support the developer:';
				
				localization['en']['forum-profile'] = 'Forum profile';
				localization['en']['role'] = 'Alliance rank';
				localization['en']['clan-day'] = 'Days in clan';
				
				localization['en']['generator-userbar'] = 'Create UserBar';
				localization['en']['userbar-bg'] = 'Choose a background:';
				
				localization['en']['wr'] = 'WR';
			}
			
			{/* Français */
				localization['fr'] = localization['en'];
			}
			
			{/* Deutsch */
				localization['de'] = localization['en'];
			}
			
			{/* Türkçe */
				localization['tr'] = localization['en'];
			}
			
			{/* Español */
				localization['es'] = localization['en'];
			}
			
			{/* Čeština */
				localization['cs'] = localization['en'];
			}
			
			{/* Polski */
				localization['pl'] = localization['en'];
			}
			
			return localization[lang];
		}
	}
	
	/* ===== Load UserScript ===== */
	function addJQuery(callback){
		var script = document.createElement("script");
		script.async = true;
		script.setAttribute("src", "http://ajax.googleapis.com/ajax/libs/jquery/2.0.1/jquery.min.js");
		script.addEventListener(
			'load', 
			function(){
				var script = document.createElement("script");
				script.async = true;
				script.textContent = "window.jQ = jQuery.noConflict(true);"+
				"("+callback.toString()+")();";
				document.head.appendChild(script);
			}, 
			false
		);
		document.head.appendChild(script);
	}
	
	if(window.location.host.indexOf("worldofwarships") > -1){
		addJQuery(WoWsStatInfo);
	}
})(window);