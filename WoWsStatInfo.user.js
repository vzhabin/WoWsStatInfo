// ==UserScript==
// @name WoWsStatInfo
// @author Vov_chiK
// @description Расширенная статистика и функционал на сайте World of Warships.
// @copyright 2015+, Vov_chiK
// @license GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @namespace http://forum.walkure.pro/
// @version 0.5.1.23
// @creator Vov_chiK
// @include http://worldofwarships.ru/ru/community/accounts/*
// @include http://forum.worldofwarships.ru/index.php?/topic/*
// @include http://forum.worldofwarships.ru/index.php?/user/*
// @include http://ru.wargaming.net/clans/*/players*
// @include http://worldofwarships.eu/*/community/accounts/*
// @include http://forum.worldofwarships.eu/index.php?/topic/*
// @include http://forum.worldofwarships.eu/index.php?/user/*
// @include http://eu.wargaming.net/clans/*/players*
// @include http://worldofwarships.com/*/community/accounts/*
// @include http://forum.worldofwarships.com/index.php?/topic/*
// @include http://forum.worldofwarships.com/index.php?/user/*
// @include http://na.wargaming.net/clans/*/players*
// @include http://worldofwarships.asia/*/community/accounts/*
// @include http://forum.worldofwarships.asia/index.php?/topic/*
// @include http://forum.worldofwarships.asia/index.php?/user/*
// @include http://asia.wargaming.net/clans/*/players*
// @match http://worldofwarships.ru/ru/community/accounts/*
// @match http://forum.worldofwarships.ru/index.php?/topic/*
// @match http://forum.worldofwarships.ru/index.php?/user/*
// @match http://ru.wargaming.net/clans/*/players*
// @match http://worldofwarships.eu/*/community/accounts/*
// @match http://forum.worldofwarships.eu/index.php?/topic/*
// @match http://forum.worldofwarships.eu/index.php?/user/*
// @match http://eu.wargaming.net/clans/*/players*
// @match http://worldofwarships.com/*/community/accounts/*
// @match http://forum.worldofwarships.com/index.php?/topic/*
// @match http://forum.worldofwarships.com/index.php?/user/*
// @match http://na.wargaming.net/clans/*/players*
// @match http://worldofwarships.asia/*/community/accounts/*
// @match http://forum.worldofwarships.asia/index.php?/topic/*
// @match http://forum.worldofwarships.asia/index.php?/user/*
// @match http://asia.wargaming.net/clans/*/players*
// @grant GM_xmlhttpRequest
// ==/UserScript==
(function(window){
	/* ===== Main function ===== */
	function WoWsStatInfo(){
		var VersionWoWsStatInfo = '0.5.1.23';
		
		var WoWsStatInfoLinkLoc = [];
		WoWsStatInfoLinkLoc['ru'] = 'http://forum.worldofwarships.ru/index.php?/topic/19158-';
		WoWsStatInfoLinkLoc['asia'] = 'http://forum.worldofwarships.asia/index.php?/topic/8950-';
		WoWsStatInfoLinkLoc['na'] = 'http://forum.worldofwarships.com/index.php?/topic/47436-';
		WoWsStatInfoLinkLoc['eu'] = 'http://forum.worldofwarships.eu/index.php?/topic/14650-';
		
		
		var WoWsStatInfoLinkNameLoc = [];
		WoWsStatInfoLinkNameLoc['ru'] = '['+VersionWoWsStatInfo.substring(0, 5)+'] [WoWsStatInfo] Расширенная статистика на оф. сайте.';
		WoWsStatInfoLinkNameLoc['asia'] = '['+VersionWoWsStatInfo.substring(0, 5)+'] [WoWsStatInfo] Extended stat-info for official WoWS profile.';
		WoWsStatInfoLinkNameLoc['na'] = '['+VersionWoWsStatInfo.substring(0, 5)+'] [WoWsStatInfo] Extended stat-info for official WoWS profile.';
		WoWsStatInfoLinkNameLoc['eu'] = '['+VersionWoWsStatInfo.substring(0, 5)+'] [WoWsStatInfo] Extended stat-info for official WoWS profile.';
		
		var lang = 'ru';
		var realm = 'ru';
		var realm_host = 'ru';
		if(window.location.host.indexOf(".wargaming.net") > -1){
			lang = getCookie('wgccfe_language');
			realm = window.location.host.split('.')[0];
			realm_host = realm; if(realm == 'na'){realm_host = 'com';}
		}else if(window.location.host.indexOf("worldofwarships") > -1){
			lang = getCookie('hllang');
			var host_split = window.location.host.split('.'); realm = host_split[host_split.length - 1]; if(realm == 'com'){realm = 'na';}
			realm_host = realm; if(realm == 'na'){realm_host = 'com';}
		}
		if(lang == null){
			if(realm == 'ru'){
				lang = 'ru';
			}else{
				lang = 'en';
			}
		}
		if(window.location.host.indexOf("cm-ru.wargaming.net") > -1){return;}
		
		var localizationText = getlocalizationText(lang);
		var application_id = getApplicationId(realm);
		
		var WoWsStatInfoLink = WoWsStatInfoLinkLoc[realm];
		var WoWsStatInfoLinkName = WoWsStatInfoLinkNameLoc[realm];
		
		var WGAPI = 'http://api.worldoftanks.'+realm_host+'/wgn/';
		var WOWSAPI = 'http://api.worldofwarships.'+realm_host+'/wows/';
		var WoWsStatInfoHref = 'http://vzhabin.ru/US_WoWsStatInfo/';
	
		var Process = 0;
		var MaxProcess = 3;
		
		var SettingsWCI = null;
		{ /* ===== Default Settings UserScript ===== */
			var defaultSettingsWoWsStatInfo = ''+
				'{' +
					'"role_i18n": {"table": "1", "check": 1},' + // col 1
					'"clan_days": {"table": "1", "check": 1},' +
					'"info.last_battle_time": {"table": "1", "check": 1},' +
					'"info.logout_at": {"table": "1", "check": 0},' +
					'"null_1": {"table": "spacerow", "check": 0},' + // spacerow
					'"info.statistics.pvp.battles": {"table": "1", "check": 1},' +
					'"info.statistics.pvp.wins": {"table": "1", "check": 0},' +
					'"info.statistics.pvp.losses": {"table": "1", "check": 0},' +
					'"info.statistics.pvp.draws": {"table": "1", "check": 0},' +
					'"info.statistics.pvp.survived_battles": {"table": "1", "check": 0},' +
					'"info.statistics.pvp.survived_wins": {"table": "1", "check": 0},' +
					'"null_2": {"table": "spacerow", "check": 0},' + // spacerow
					'"info.statistics.pvp.kill_dead": {"table": "1", "check": 1},' +
					'"info.statistics.pvp.xp": {"table": "1", "check": 0},' +
					'"info.statistics.pvp.damage_dealt": {"table": "1", "check": 0},' +
					'"null_3": {"table": "spacerow", "check": 0},' + // spacerow
					'"info.statistics.pvp.frags": {"table": "1", "check": 0},' +
					'"info.statistics.pvp.planes_killed": {"table": "1", "check": 0},' +
					'"info.statistics.pvp.capture_points": {"table": "1", "check": 0},' +
					'"info.statistics.pvp.dropped_capture_points": {"table": "1", "check": 0},' +
					'"null_4": {"table": "spacerow", "check": 0},' + // spacerow
					'"info.statistics.pvp.avg_xp": {"table": "2", "check": 1},' + // col 2
					'"info.statistics.pvp.avg_damage_dealt": {"table": "2", "check": 1},' + 
					'"info.statistics.pvp.avg_frags": {"table": "2", "check": 0},' + 
					'"info.statistics.pvp.avg_planes_killed": {"table": "2", "check": 0},' + 
					'"info.statistics.pvp.avg_capture_points": {"table": "2", "check": 0},' + 
					'"info.statistics.pvp.avg_dropped_capture_points": {"table": "2", "check": 0},' + 
					'"null_5": {"table": "spacerow", "check": 0},' + // spacerow
					'"info.statistics.pvp.max_xp": {"table": "2", "check": 0},' +
					'"info.statistics.pvp.max_damage_dealt": {"table": "2", "check": 0},' +  
					'"info.statistics.pvp.max_frags_battle": {"table": "2", "check": 0},' +  
					'"info.statistics.pvp.max_planes_killed": {"table": "2", "check": 0},' +  
					'"null_6": {"table": "spacerow", "check": 0},' + // spacerow
					'"info.statistics.pvp.wins_percents": {"table": "2", "check": 1},' +
					'"info.statistics.pvp.survived_battles_percents": {"table": "2", "check": 0},' +
					'"null_7": {"table": "spacerow", "check": 0},' + // spacerow
					'"info.statistics.pvp.wr": {"table": "3", "check": 1},' + // col 3
					'"info.statistics.pvp.wtr": {"table": "3", "check": 1},' +
					'"null_8": {"table": "spacerow", "check": 0},' + // spacerow
					'"info.ships_x_level": {"table": "3", "check": 1},' +
					'"view_table": {' +
						'"table": "position", ' +
						'"check": 0, ' +
						'"sort": "' +
							'role_i18n,' +
							'clan_days,' +
							'info.last_battle_time,' +
							'info.ships_x_level,' +
							'info.statistics.pvp.battles,' +
							'info.statistics.pvp.wins_percents,' +
							'info.statistics.pvp.avg_xp,' +
							'info.statistics.pvp.avg_damage_dealt,' +
							'info.statistics.pvp.kill_dead,' +
							'info.statistics.pvp.wr,' +
							'info.statistics.pvp.wtr' +
						'"' +
					'}' +
				'}' +
			'';
		}
		
		var MembersArray = [];
		var StatPvPMemberArray = [];
		var Encyclopedia = null;
		
		var typeStat = ["pvp", "pve", "pvp_solo", "pvp_div", "pvp_div2", "pvp_div3"];
		var typeShip = ["Battleship", "AirCarrier", "Cruiser", "Destroyer"];
		
		var color = new Array();
		color['very_bad'] = '#FE0E00'; // очень плохо, хуже чем у 85%
		color['bad'] = '#FE7903'; // плохо, хуже чем у 50%
		color['normal'] = '#F8F400'; // средне, лучше чем у 50%
		color['good'] = '#60FF00';  // хорошо, лучше чем у 75%
		color['very_good'] = '#02C9B3'; // очень хорошо, лучше чем у 95%
		color['unique'] = '#D042F3'; // уникально, лучше чем у 99%
		
		var colorStat = null;
		var ExpShips = null;
		var ExpWTR = null;
		
		/* ===== Style and Script UserScript ===== */
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
				'table.account-table td{white-space: nowrap;}' +
				'li.account-tab div._title{padding: 0 10px;}' +
				'div.chart_div{text-align: center; width: 500px; float: left; margin-right: 40px;}' +
				'div.ct-chart{background-color: #FFFFFF; width: 500px; height: 300px;}' +
				// 'div.ct-chart text{display: none;}' +
				'.highcharts-legend{display: none;}' +
			'';
			var StyleWoWsStatInfoAdd = document.createElement("style");
			StyleWoWsStatInfoAdd.textContent = StyleWoWsStatInfo.toString();
			document.head.appendChild(StyleWoWsStatInfoAdd);
			
			var ScriptChart = document.createElement("script");
			// ScriptChart.setAttribute("src", WoWsStatInfoHref+"highcharts/highcharts.js");
			ScriptChart.setAttribute("src", "https://code.highcharts.com/highcharts.js");
			document.head.appendChild(ScriptChart);
			
			ScriptChart = document.createElement("script");
			// ScriptChart.setAttribute("src", WoWsStatInfoHref+"highcharts/exporting.js");
			ScriptChart.setAttribute("src", "https://code.highcharts.com/modules/exporting.js");
			document.head.appendChild(ScriptChart);
		}
		
		/* ===== Message UserScript ===== */
		if(window.location.host != 'forum.worldofwarships.'+realm_host){
			var message = document.createElement("div");
			message.setAttribute("id", "message-wowsstatinfo");
			message.setAttribute("class", "wsi-ui-dialog wsi-ui-widget wsi-ui-widget-content wsi-ui-corner-all wsi-ui-front");
			message.setAttribute("style", "display: none; z-index:9999; left: 50%; margin-left: 0px; top: 0px;");
			message.innerHTML = '' +
				'<style>' +
					'.wsi-ui-dialog{box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12), 0 0 25px 25px rgba(0, 0, 0, 0.3);background-color: rgba(41, 41, 41, 0.8);position: absolute;top: 0;left: 0;outline: 0;padding: 23px 31px 28px;}' +
					'.wsi-ui-widget-content{color: #b1b2b3;}' +
					'.wsi-ui-widget{font-family: Arial, "Helvetica CY", Helvetica, sans-serif;font-size: 15px;}' +
					'.wsi-ui-corner-all{border-bottom-right-radius: 2px;border-bottom-left-radius: 2px;border-top-right-radius: 2px;border-top-left-radius: 2px;}' +
					'.wsi-ui-front{z-index: 250;}' +
					'.wsi-ui-dialog:before{background: url("http://ru.wargaming.net/clans/static/1.4.4/images/plugins/jquery-ui/dialog_gradient.png") repeat-x;height: 162px;width: 100%;position: absolute;top: 0;left: 0;z-index: 5;}' +
					'.wsi-ui-dialog .wsi-ui-dialog-titlebar{border-bottom: 1px solid rgba(0, 0, 0, 0.7);box-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.05);padding: 0 0 14px;position: relative;z-index: 10;}' +
					'.wsi-ui-widget-header{color: #fff;font-family: "WarHeliosCondC", Arial Narrow, Tahoma, arial, sans-serif;font-size: 25px;font-weight: normal;line-height: 30px;}' +
					'.wsi-ui-helper-clearfix{min-height: 0;support: IE7;}' +
					'.wsi-ui-widget-content{color: #b1b2b3;}' +
					'.wsi-ui-widget{font-family: Arial, "Helvetica CY", Helvetica, sans-serif;font-size: 15px;}' +
					'.wsi-ui-helper-clearfix:before, .wsi-ui-helper-clearfix:after{content: "";display: table;border-collapse: collapse;}' +
					'.wsi-ui-helper-clearfix:after{clear: both;}' +
					'.wsi-ui-helper-clearfix:before, .wsi-ui-helper-clearfix:after{content: "";display: table;border-collapse: collapse;}' +
					'.wsi-ui-dialog .wsi-ui-dialog-title{float: left;margin: 0;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;}' +
					'.wsi-ui-dialog .wsi-ui-dialog-titlebar-close{margin: -16px -3px 0;height: 20px;width: 20px;position: absolute;top: 50%;right: 0;}' +
					'.wsi-ui-widget .wsi-ui-widget{font-size: 1em;}' +
					'wsi-button.wsi-ui-wsi-button-icon-only {width: 16px;}' +
					'.wsi-ui-state-default{border: 1px solid transparent;color: #b1b2b3;display: inline-block;font-size: 13px;line-height: 30px;padding: 0 5px;height: 30px;width: 20px;}' +
					'.wsi-ui-wsi-button{background: none;border: 0;display: inline-block;position: relative;padding: 0;line-height: normal;cursor: pointer;vertical-align: middle;text-align: center;overflow: visible;}' +
					'.wsi-ui-wsi-button-icon-only .wsi-ui-icon{left: 50%;margin-left: -8px;}' +
					'.wsi-ui-wsi-button-icon-only .wsi-ui-icon, .wsi-ui-wsi-button-text-icon-primary .wsi-ui-icon, .wsi-ui-wsi-button-text-icon-secondary .wsi-ui-icon, .wsi-ui-wsi-button-text-icons .wsi-ui-icon, .wsi-ui-wsi-button-icons-only .wsi-ui-icon{position: absolute;top: 50%;margin-top: -8px;}' +
					'.wsi-ui-icon-closethick{background: url("http://ru.wargaming.net/clans/static/1.4.4/images/plugins/jquery-ui/dialog_close.png");}' +
					'.wsi-ui-icon{width: 16px;height: 16px;}' +
					'.wsi-ui-icon{display: block;text-indent: -99999px;overflow: hidden;background-repeat: no-repeat;}' +
					'.wsi-ui-state-default{border: 1px solid transparent;color: #b1b2b3;display: inline-block;font-size: 13px;line-height: 30px;padding: 0 5px;height: 30px;width: 20px;}' +
					'.wsi-ui-wsi-button-icon-only .wsi-ui-wsi-button-text, .wsi-ui-wsi-button-icons-only .wsi-ui-wsi-button-text{padding: .4em;text-indent: -9999999px;}' +
					'.wsi-ui-wsi-button .wsi-ui-wsi-button-text{display: block;line-height: normal;}' +
					'.wsi-ui-dialog .wsi-ui-dialog-content{position: relative;border: 0;padding: 0;background: none;z-index: 10;}' +
					'.wsi-ui-widget-content{color: #b1b2b3;}' +
					'.wsi-popup{margin: 10px auto 0;font-size: 15px;transition: height .3s;}' +
					'.wsi-popup_footer{margin-top: 20px;position: relative;}' +
					'.wsi-button__align-middle{vertical-align: middle;}' +
					'.wsi-button{-webkit-appearance: none;-moz-appearance: none;background: #735917;border-radius: 2px;border: none;box-shadow: 0 0 10px rgba(0, 0, 0, 0.3), 1px 0 2px rgba(0, 0, 0, 0.3);display: inline-block;padding: 0 0 2px;overflow: hidden;color: #000;font-family: Arial, "Helvetica CY", Helvetica, sans-serif;font-size: 17px;font-weight: normal;text-decoration: none;cursor: pointer;vertical-align: top;}' +
					'.wsi-button_wrapper{background: #dbae30;background: linear-gradient(to bottom, #fff544 0%, #dbae30 100%);border-radius: 2px;display: block;padding: 1px 1px 0;position: relative;}' +
					'.wsi-button_body{background: #e5ad2c;background: linear-gradient(to bottom, #e7b530 0%, #e5ad2c 100%);display: block;border-radius: 2px;padding: 10px 23px 11px;position: relative;text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);transition: all .2s;}' +
					'.wsi-button_inner{display: block;position: relative;z-index: 10;white-space: nowrap;line-height: 20px;}' +
					'.wsi-link__cancel{display: inline-block;font-size: 15px;margin-left: 18px;padding-top: 10px;}' +
					'.wsi-link{border-bottom: 1px solid transparent;padding-bottom: 1px;color: #e5b12e;line-height: 18px;text-decoration: none;transition: all .2s;}' +
				'</style>' +
				'<div class="wsi-ui-dialog-titlebar wsi-ui-widget-header wsi-ui-corner-all wsi-ui-helper-clearfix">' +
					'<span class="wsi-ui-dialog-title">{%TITLE%}</span>' +
					'<wsi-button id="userscript-message-close" class="wsi-ui-wsi-button wsi-ui-widget wsi-ui-state-default wsi-ui-corner-all wsi-ui-wsi-button-icon-only wsi-ui-dialog-titlebar-close" title="Close">' +
						'<span class="wsi-ui-wsi-button-icon-primary wsi-ui-icon wsi-ui-icon-closethick"></span>' +
						'<span class="wsi-ui-wsi-button-text">Close</span>' +
					'</wsi-button>' +
				'</div>' +
				'<div class="wsi-ui-dialog-content wsi-ui-widget-content" style="width: auto; min-height: 44px; max-height: none; height: auto;">' +
					'<div class="wsi-popup">{%TEXT%}</div>' +
					'<div class="wsi-popup_footer">' +
						'<wsi-button id="userscript-message-ok" class="wsi-button wsi-button__align-middle">' +
							'<span class="wsi-button_wrapper">' +
								'<span class="wsi-button_body">' +
									'<span class="wsi-button_inner">'+localizationText['Ok']+'</span>' +
								'</span>' +
							'</span>' +
						'</wsi-button>' +
						'<a id="userscript-message-cancel" class="wsi-link wsi-link__cancel" style="display: block; cursor: pointer;" >'+localizationText['Cancel']+'</a>' +
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
			
			lineno += 45;
			
			var agent = '';
			var agentArr = navigator.userAgent.split(')');
			for(var i = 0; i < agentArr.length; i++){
				if(agent != ''){agent += ')\n';}
				agent += agentArr[i];
			}
			
			var error = localizationText['ErrorScript']+"\n\n" +
					"Lang: "+lang+"\n"+
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
					localizationText['ErrorSendDeveloper'];
			
			console.log(error);
			
			if(window.location.host == 'forum.worldofwarships.'+realm_host){
				if(lineno < 5000){alert(error);}
			}else{
				error = error.split('\n').join('<br />');
				onShowMessage(
					localizationText['Box'],
					error,
					onCloseMessage,
					localizationText['Ok'],
					false
				);
			}
			
			return false;
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
			
			var url = window.location.href;
			
			console.log(''
				+'----------------------- WoWsStatInfo '+VersionWoWsStatInfo+' -----------------------\n'
				+'| Lang                = '+lang+'\n'
				+'| URL                 = '+url+'\n'
				+'| Browser name        = '+browserName+'\n'
				+'| Full version        = '+fullVersion+'\n'
				+'| Major version       = '+majorVersion+'\n'
				+'| navigator.appName   = '+navigator.appName+'\n'
				+'| navigator.userAgent = '+navigator.userAgent+'\n'
				+'---------------------------------------------------------------------\n'
			);			
			
			var navigatorInfo = [];
			navigatorInfo['browserName'] = browserName;
			navigatorInfo['fullVersion'] = fullVersion;
			navigatorInfo['majorVersion'] = majorVersion;
			navigatorInfo['appName'] = navigator.appName;
			navigatorInfo['userAgent'] = navigator.userAgent;
			
			return navigatorInfo;
		}
		
		/* ===== Check load page ===== */
		if(window.location.href.indexOf("accounts") > -1 && window.location.href.split('/').length >= 8 && window.location.href.split('/')[6].match(/[0-9]+/) != null){
			checkJson();
			getIndexedDB('StatPvPMemberArray', updateStatPvPMemberArray, updateStatPvPMemberArray);
			lang = window.location.href.split('/')[3].match(/[a-z\s-]+/); if(lang == 'zh-tw'){lang = 'zh-tw';}
			localizationText = getlocalizationText(lang);
			getJson(WoWsStatInfoHref+'version.php?random='+Math.floor(Math.random()*100000001), doneLastVersion, errorLastVersion);
			var account_id = window.location.href.split('/')[6].match(/[0-9]+/);
			MemberProfilePage();
		}else if(window.location.host == 'forum.worldofwarships.'+realm_host && window.location.href.indexOf("/user/") > -1){
			ForumUserPage();
		}else if(window.location.host == 'forum.worldofwarships.'+realm_host && window.location.href.indexOf("/topic/") > -1){
			ForumTopicPage();
		}else if(window.location.href.indexOf("clans") > -1 && window.location.href.split('/')[4].match(/[0-9]+/) != null 
			&& window.location.href.indexOf("players") > -1 && window.location.href.split('/').length >= 6
		){
			checkJson();
			SettingsWCI = getSettingsClanPage();
			getJson(WoWsStatInfoHref+'version.php?random='+Math.floor(Math.random()*100000001), doneLastVersion, errorLastVersion);
			var ClanId = window.location.href.split('/')[4].match(/[0-9]+/);
			ClanPage();
		}
		
		function doneLastVersion(url, response){
			var data = response;
			if(VersionWoWsStatInfo != data['version']){
				onShowMessage(
					localizationText['Box'],
					localizationText['NewVersion']+' WoWsStatInfo '+data['version']+'<br />'+localizationText['NewUpdate']+'.', 
					onCloseMessage,
					localizationText['Ok'],
					false
				);
			}
		}
		function errorLastVersion(url){}
		
		/* ===== Pages function ===== */
		function MemberProfilePage(){
			if(colorStat == null || ExpShips == null || ExpWTR == null){
				console.log('colorStat == null || ExpShips == null || ExpWTR == null');
				setTimeout(function(){MemberProfilePage();}, 1000);
				return;
			}
			
			var account_profile = document.getElementsByClassName('account-profile')[0];
			if(account_profile === undefined){return;}
			
			MembersArray[0] = [];
			
			var _nick = document.getElementsByClassName('_nick')[0];
			nickname = _nick.textContent;
			
			var row = document.getElementsByClassName('row')[2];
			var div = document.createElement('div');
			div.setAttribute('id', 'userscript-block-list');
			div.setAttribute('style', 'padding: 0px 15px 20px 15px;');
			div.innerHTML = '' +
				'<div id="userscript-forum-link">' +
					'<a target="_blank" href="http://forum.worldofwarships.'+realm_host+'/index.php?/user/dn-'+nickname+'-/">'+localizationText['forum-profile']+'</a>' +
				'</div>' +
				'<style>' +
					'.b-profile-clan{max-width: 400px; padding-right: 100px;margin-bottom: 14px;padding-top: 5px;position: relative;}' +
					'.b-profile-clan_photo{float: left;width: 61px;position: relative;min-height: 70px;top: 5px;}' +
					'.b-profile-clan_color{width: 15px;height: 15px;position: absolute;left: 38px;top: 2px;}' +
					'.b-profile-clan_link{background-image: url("data:image/png;charset=utf-8;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAA2CAYAAACMRWrdAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkI4NTIxMEI3ODRFODExRTI5ODYxODk4QjE3Q0IyNzkyIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkI4NTIxMEI4ODRFODExRTI5ODYxODk4QjE3Q0IyNzkyIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Qjg1MjEwQjU4NEU4MTFFMjk4NjE4OThCMTdDQjI3OTIiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Qjg1MjEwQjY4NEU4MTFFMjk4NjE4OThCMTdDQjI3OTIiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7V+fopAAAMmElEQVR42sxazY7jxhEmKc2IzaZmRrObwEGQi53kklcI4JzzPL7kkFtOQeAn2FfJYYG9OCcfYsd2YsObALGzQLwzErub0khkurqruqop7QgOYMNacHtIUeyuv6++qmZZxE95YqS/v/PPixcv2vl8XvlPOB+GodjtdoNzbnj16tX+yy+/HJ49e7Z/+fLl9Kfjm8a5EKASRynG7/zz/PnzxUcff/L1V//+CgQqDod9sd8fwng4HPzf+2KxUMXbb/88/A3X6AAlwDGOY3re3d031XwiFJxf+GOGx/ci3Icffqjv7jfFRx//9Vv9rvQWnvljXrKz7bbbMM6FdeZ/+eCDdz/79LNdZzfz3vXVdretvDuM4zCMh+EwPjwchr7fetUMIxgdtOS1OhwOg79lX2y3u6C2h/3DMKtmXvvbEdzLa3mA633fj4P/jf8vTA4W8c8YL+ZVDQvSTVN88cXn/7ci3/rJT5PZpMUu/vH53x9+9957f3bOFLXSRZ9GWzSNLpztigVdr/25H+G6tTC2fuwKFe4zflz6+/z9eN6o1o+b8D3dD89r9LKw5oOixvOf/fitEZ4L93X+vhavX+K8CuYxm6LWbbH139f+Pu+Mf/j6P69+DyGGcVpWAihm6/V6Bj9u6CEKhambYt2tw8ONjcJaIRQswsBkSSh/3ay9EprC+es6CL32QrQoFAjTBeHhdzA6FNaAcui+MF9UDiitxnkWIKwxSYnL61WQBsJsKhiMM2dttVCkYS8caBQe4oVY6mXUMCwShTIWhTNxMQ4tBtfpvNFXuHi/6G6Dllrj4uN1GEko3UahwSI9Wg6E0hqvN2ApeC4rdbO+S+5IyFoJeK88IlUgxCUu7tK7jzEdTircoI4PBQ12KBRMusD7wdJhDPevWWhYnAXLLsNzolAmsxxZPjxPuC1cb1DYGuej+66uV0mw2WyWCRaE2213ZXA/EzUfNKZj7IBlehEbKsVUXBxM5lwXJo+x1yYN224TRxsXb8MiURjvrmHR7RUKLdwMldMZMZ9iD4nKbYvN/euR0thsxq6YPvOLC78oi7EQf9yjUPCQ4KZ+0dEtYuxQTDlh2RALyUJxDN+DMHaDgBHHoAS47mMYYs+hG5I7djAPhoHC+YLyMFxAmUthsbI8tpiH636AgA+L8pN0m3VyRxAKNAojTJY0plGDaCFVRyE1ui2gISyaFqtUdKvovvF5PVke3S25KT3HiudTTCuNnuSFX9+Nj7kiZPBx5yI09xjIwWKgIdQcQDhNUit2l4haACw4EtDgc6J75RqH8x4tTBYxXSeAp8X5NAMXzSNie3nzeIz5RPow1Ohui4YfTosz+HCYTMZajzGVUFTGoJaL2CRAqDGVALoZikUQtoX7TPpdDfkPf28QRXsbLR7duy3Wd6+HFE7zE4LtHh5GS5qaAETQsJ+kQ8iOEMwQ704I3WhelOuim23x/mjRJbsx5qm42OhuWufKaTDfxbyHMQ2oeM5iDw9gsZhvyJfJxyFJbwk4hDtpigkd81DQMCkDheoNWWKqtE1yW3LLpIyG7yfhHQkvlI4x9rhgwOEcWqKnRaOl+gnNCpOkfOVjD1GxF2ga0JDQVCw25DGL6Cc9JFjKJCEUpoomCcVCp3MLeexWJOjT4DE07TJphpIwLTYt0kZ0c8jdgrDorkR3auGm5J4pLwrUy/KdIeEEUGi2THJvFIosv77/RlisOhbMs+2xtyZpog7JM3erhGqO6RYBDiyKaJDDwO9FMg0pIxNauJkhQtwlUhCUhha0E2Byht34ZvX0jZQqxpgv4i59LFFGh2StCZqR20mfD5pXnFfAUg1aLionElaiR0RwSYgspjClqAkaN0IJWWxR0leBeRQ/8lWBdMV5brHDuO2ZNRO7j+4ThQv0h9wtcbhl0nCH6NdLqG8kzaLfs8YbaSEBPE3ikrmFp0I/fevtceVr5svLy2SxTLC9R0WlpFCcT5oglEnuR8JrokUiBdBijMnzWW+6RMcUMhpNBFqiKNExYcFcKFZSYEgeFV/+81+/8CKs/WGOY2wYMDZ0ZPG+orUZ9HKx6VLpwPeTMIyajGI9jmDhQNMcax5o2VYwGqgSiDgz+m5EqaORfl2FWL+6uT2ququ85zMynQE6hYR4Gug95a1MaImmcfEJ+lOJEoXdOiLQiG6GYjqPKQIyqsd6Q0mdqoSIzjKPnRRsvz8MoCli47WoqwgNKXBtFx9K7tEFS+j0/ZZix+DzKEXYmMcAWCRqslLw3EkmssxSQoPMgywomcdJwYbh4N1iiZxOQLrhSSRq9b2ZAAQwlWUGHLHuQveynMQX2BOpdU7bUl5TOQNRDfVMItGWKWJ9f8Zi0EXaui5BtVKcJF1iFAKllEzeUagpQ6BkK5kCJVeiX5KGSdSrkxDRvaPlYykUz6Oyr29uHxcMGpALhZytWQqopbYAFpHoFjBeIl3Swf0Ma3iaf5AAE0OpKQbFyEAT3X6bqgaDecugG1NMR0Jsu/Xj4HExv+CKWDCIYBmkO84Yhlw/7pzJ67OM9aNF8HwhKu6UAiTdapgMBEAhjqkpb0Z6VqOSAzlweT122mIQYyI5U53lkk9H2kQ9ELIkcUZiFgYtYCXLV2gBLXoWhjlmTfkvVeRE03jeXlpads02ZywGnV1gHuRmi1qnUsQ47gopkaStYQsTnWrUCW4n6jCmVcRsNNZrOlnGJo9hMlBjQ4mKzRpRt72+OQf3+6Ku29QOiBpmN+nRTbY+v1HPQaX6CTWs2JKZcBPa1LQMHEy0DXfHFAvDHhSTOXkIxdx5i/nDUkeXNEeTiZIFGj52QkxTJU35x3FzdUqLCCgCULlu0h7vshjvLT9PFqORc+pgufbqvMXGRliAaVQUauuExhvu1LreMLqlVEAVtU6MQ0I/Jetp74RKIyWBA4tdaggZJNrcvdo8brFZVZXOiocT92u0aNgYbpIq9Pk6Ln6h8gpXU5dJHwvhHKNrLZkHoWsCDtHO1loUqYyiV2dj7HAoZfs4NWgQWo3h3RTq2Sc3IRqkJ31AxXmJkrPFIja5neHGT5OStxZ1HaNpapY2goj764/DvXdFJype6utR/pDdJCva39x+brP+H3/Pi+/xfOtMxjUT0yALCuXWatKUJXTF86vr1Vm4LykpUr9voXI6pESS7bE9HdBP0CPZLFXZ1hAl69gbMeKciG3TYmy13BbgfNllYZKev7k/R6mGqu8tN1YEtyN2TRCc2sxmkwOA2HqaWpCIbYP1WdOIVCH6kIR6jIYcFhxzHLPXqyePW6wsixH6h7L5qVvZbjYCktESGMhHvQnRkw+QriYxdpQCyL2iBxChVopZvVRqUh6UTGctNgxlIp4uarjrjjcEiNak3ZbEGI4bL7w4TvKN6G1spZuqNrUNrDOCSC85P6bic5O6aMtzeQwaplTsMctn5mEkajXUe8AkjoygFl2q1DEOewF6ksSPm6C9BByV138Z+6eK2trYCT7HPODDLTRGpQWhomb3S0kcLRaEVoL7WWlhZuVH9Zeo55SA/FOWlx5BqQeEvLk9E2P7w77iDYM2QXxv8sDPW2VaFJ9MhNU0GYvnccxMFo8AlZUw010dLSrtVLSeYR6l/8eMQFS4otEi8xZpsEltcJ3ciLeUjGiqcsxI5SyyGJQbD/kGRHpOI4iwDTua5bl6rExN0imHE1yvnxBb2niXFpVlfYJq1x2x/loo5ThfntjKEi05uXFxNkFbkWQzTUlLyZdJ5PdaNFqstJBgJtNNQ9HAUcJd7ckY06kSl72X1e2T6jHBRkBFSVjticCVTUxejGwPiDb4NF8JxlBnuym80UGeIffBZP4LKcKJVh2yfWiy4QHV11iJUmyoqmqQjENCez/trafvOWnX8jUilwvNaGmy38sdzNhO4CqiFm2H7FUMle+c4nseBxKKLDaipIfZrHpIW0PE5SaWm7bGgua6XOjeiZ4H1WOpfY37ZWLfS27XqsxSvDGS72Rushjr1mvYYtkL4dLrRvAq3+Vv3v31b//2yae/aper+Wb9uvSaGDfru/H6ZlWs719Dj3zc3IUxvIKwvL4p4fur69vB05rq2n9///q/I+QVf/94s4LxLvT97uD66hYCvbr2IyRV0DS0p1dPnpbw6oWfpwS38veXQJN87JR4fwnKWz15Uq3v/Hw3N6Xx98M6wCPeeeeXw/vv/+mP0BqFtzpAyFK8q3iBRw1C4k7M7Pt80/Rbfga0EFhqhwLtyHJz4Zd78fdOCFX9AIUaxXHA4wHHQe6PDRJExJul5Q/UYuNEwGGCikcvOZ960fmH6opvetE5/P0/AQYARWny6bv+xcUAAAAASUVORK5CYII=");display: block;height: 54px;position: absolute;left: 2px;padding: 11px 0 0 11px;width: 54px;}' +
					'.b-profile-clan_text{margin-left: 61px;}' +
					'.b-profile-clan_text-wrpr{font-size: 13px;margin: 5px 0 0;overflow: hidden;padding-right: 0;padding: 0 0 7px;text-overflow: ellipsis;white-space: nowrap;}' +
					'.b-link-clan{color: #f9d088;font-weight: bold;text-decoration: none;}' +
					'.b-link-clan_tag{color: #babcbf;}' +
					'.b-statistic{overflow: hidden;margin: 0 0 16px;line-height: 14px;}' +
					'.b-statistic_item{color: #606061;font-size: 11px;margin: 0;padding: 0;line-height: 125%;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;word-wrap: normal;}' +
					'.b-statistic_value{color: #babcbf;}' +
				'</style>' +
				'<div id="wowsstatinfo-profile-clan">' +
					'<div class="b-profile-clan b-profile-clan__points js-tooltip" id="js-profile-clan">' +
						'<img src="http://'+realm+'.wargaming.net/clans/static/0.1.0.1/images/processing/loader.gif" />' + 
					'</div>' +
				'</div>' +
				getUserScriptDeveloperBlock() +
				'' +
			'';
			row.insertBefore(div, row.firstChild);
			
			var account_href = window.location.href.split('/')[6].split('-');
			var account_id = account_href[0];
			
			var language = lang; if(language == 'zh-tw'){language = 'zh-cn';}else if(language == 'ja' || language == 'es-mx' || language == 'pt-br'){language = 'en';}
			getJson(WOWSAPI+'encyclopedia/ships/?application_id='+application_id+'&fields=name,images,tier,nation,is_premium,images,type', doneEncyclopedia, errorEncyclopedia);
			getJson(WGAPI+'clans/membersinfo/?application_id='+application_id+'&language='+language+'&account_id='+account_id, doneClanInfo, errorClanInfo);
			getJson(WOWSAPI+'account/info/?application_id='+application_id+'&extra=statistics.pve,statistics.pvp_solo,statistics.pvp_div2,statistics.pvp_div3&account_id='+account_id+'&index=0&type=profile', doneAccountInfo, errorAccountInfo);
			
			jQ('#userscriptwowsstatinfo').click(function(){onViewBlock(this);});
			jQ('._item').click(function(){
				setTimeout(function(){viewMainPageProfile();}, 1000);
			});
			jQ('.account-tabs').click(function(){
				setTimeout(function(){viewMainPageProfile();}, 1000);
			});
		}
		function ForumUserPage(){
			var nickname = document.getElementsByClassName('nickname')[0];
			var reputation__wrp = document.getElementsByClassName('reputation__wrp')[0];
			if(undefined !== reputation__wrp){
				var user_id = reputation__wrp.getAttribute('id').split('_')[1];
				var ipsList_data = document.getElementsByClassName('ipsList_data')[0];
				
				// var profile = '' +
					// '<li class="clear clearfix">' +
						// '<span class="row_title">'+localizationText['profile-wows']+':</span>' +
						// '<span class="row_data"><a href="http://worldofwarships.'+realm_host+'/community/accounts/'+user_id+'-/" target="_black">'+nickname.innerHTML+'</a></span>' +
					// '</li>' +
				// '';
				
				ipsList_data.innerHTML += '' +
					// profile +
					'<li class="clear clearfix">' +
						'<span class="row_title">'+localizationText['profile-clan']+':</span>' +
						'<span class="row_data member_'+user_id+'"></span>' +
					'</li>' +
				'';
				
				var language = lang; if(language == 'zh-tw'){language = 'zh-cn';}else if(language == 'ja' || language == 'es-mx' || language == 'pt-br'){language = 'en';}
				getJson(WGAPI+'clans/membersinfo/?application_id='+application_id+'&language='+language+'&account_id='+user_id, doneForumClanInfo, errorForumClanInfo);
			}
		}
		function ForumTopicPage(){
			var ForumTopicMembers = [];
			var basic_info = document.getElementsByClassName('basic_info');
			for(var i = 0; i < basic_info.length; i++){
				var ipsUserPhotoLink = basic_info[i].getElementsByClassName('ipsUserPhotoLink')[0];
				if(undefined === ipsUserPhotoLink){continue;}
				if(ipsUserPhotoLink.id == null){continue;}
				if(ipsUserPhotoLink.id.indexOf('anonymous_element') > -1){
					var linkParse = ipsUserPhotoLink.href.split('/');
					var accountParse = linkParse[5].split('-');
					var account_id = accountParse[accountParse.length - 1];
					if(ForumTopicMembers['member_'+account_id] === undefined){
						ForumTopicMembers['member_'+account_id] = account_id;
						
						var language = lang; if(language == 'zh-tw'){language = 'zh-cn';}else if(language == 'ja' || language == 'es-mx' || language == 'pt-br'){language = 'en';}
						getJson(WGAPI+'clans/membersinfo/?application_id='+application_id+'&language='+language+'&account_id='+account_id, doneForumClanInfo, errorForumClanInfo);
					}
					basic_info[i].innerHTML += '' +
						'<li class="member_'+account_id+' desc lighter" style="min-height: 50px;">' +
							'<img style="width: 32px; height: 32px;" src="http://'+realm+'.wargaming.net/clans/static/0.1.0.1/images/processing/loader.gif" />' +
							localizationText['search-clan-forum'] +
						'</li>' +
					'';
				}
			}
		}
		function ClanPage(){
			if(colorStat == null || ExpShips == null || ExpWTR == null){
				console.log('colorStat == null || ExpShips == null || ExpWTR == null');
				setTimeout(function(){ClanPage();}, 1000);
				return;
			}
		
			var view_block_history = getLocalStorage('clan-member-history', false);
			if(view_block_history == null){view_block_history = 'hide';}
			
			var page_header = document.getElementsByClassName("page-header")[0];
			page_header.outerHTML += '' +
				'<div style="padding-bottom: 20px;">' +
					'<div align="right">' +
						'<button id="get-settings-button" class="button" style="display: block;">' +
							'<span class="button_wrapper">' +
								'<span style="padding: 5px;" class="button_body">' +
									'<span class="button_inner">'+localizationText['get-settings-button']+'</span>' +
								'</span>' +
							'</span>' +
						'</button>' +
					'</div>' +
					getUserScriptDeveloperBlock() + 
					'<div class="div-link-block">' +
						'<span id="clan-member-history" class="link-block '+view_block_history+'-block">' +
							localizationText['block-link-clan-member-history'] +
							'<div class="icon-link-block"></div>'+
						'</span>' +
					'</div>' +
					'<div id="userscript-block" class="clan-member-history '+view_block_history+'-block" style="text-align: center;">' +
						'<img src="/clans/static/0.1.0.1/images/processing/loader.gif" />' +
					'</div>' +
					'<div align="right" style="margin-top: 20px; padding-bottom: 20px;">' +
						'<table style="border: 0px;">' +
							'<tr>' +						
								'<td valign="center">' +
									'<button id="get-clan-statistic-block" class="button" style="display: block;">' +
										'<span class="button_wrapper">' +
											'<span style="padding: 5px;" class="button_body">' +
												'<span id="statistic-clan-button-text" class="button_inner">'+localizationText['statistic-clan-button-0']+'</span>' +
											'</span>' +
										'</span>' +
									'</button>' +
									'<span id="statistic-clan-load-text" style="display: none; font-size: 12px; width: 220px;">' +
										localizationText['statistic-clan-load-text']+' 0%'+localizationText['statistic-load-text-lost']+' 0 '+localizationText['statistic-load-text-min']+' 0 '+localizationText['statistic-load-text-sec'] +
									'</span>'+
								'</td>' +
								'<td valign="center">' +
									'<img id="statistic-clan-load-icon" src="/clans/static/0.1.0.1/images/processing/loader.gif" style="display: none;" />' +
								'</td>' +							
							'</tr>' +
						'</table>' +
					'</div>' +
				'</div>' +
			'';
			jQ('#clan-member-history').click(function(){onViewBlock(this);});
			jQ('#userscriptwowsstatinfo').click(function(){onViewBlock(this);});
			jQ('#get-clan-statistic-block').click(function(){runGetStatisticClan();});
			jQ('#get-settings-button').click(function(){runSettingsClanPage();});
			
			getClanMembersList();
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
				
				var br_line = '';
				if(window.location.href.indexOf("/topic/") > -1){
					br_line = '<br />';
				}
			
				var html = '' +
					br_line +
					'<span>' +
						'<a align="center" href="http://'+realm+'.wargaming.net/clans/'+clansInfo['clan']['clan_id']+'/" title="'+clansInfo['clan']['tag']+'" rel="home" target="_blank">' +
							'<img src="'+icon+'" alt="'+clansInfo['clan']['tag']+'">' +
						'</a>' +
						'<a align="center" href="http://'+realm+'.wargaming.net/clans/'+clansInfo['clan']['clan_id']+'/" title="'+clansInfo['clan']['tag']+'" rel="home" target="_blank">['+clansInfo['clan']['tag']+']</a>' +
					'</span>' +
				'';
				jQ('.member_'+account_id).html(html);
			}else{
				jQ('.member_'+account_id).html('');
			}
		}
		function errorForumClanInfo(url){
			jQ('.member_'+account_id).html('');
		}
		
		/* ===== MemberProfilePage function ===== */
		function doneClanInfo(url, response){
			if(response.status && response.status == "error"){
				errorClanInfo();
				return;
			}
			
			var vars = getUrlVars(url);
			var account_id = vars['account_id'];
			
			if(response['data'][account_id] == null){errorClanInfo(); return;}
			
			MembersArray[0]['clan'] = response['data'][account_id]['clan'];
			MembersArray[0]['clan']['account_id'] = response['data'][account_id]['account_id'];
			MembersArray[0]['clan']['role_i18n'] = response['data'][account_id]['role_i18n'];
			MembersArray[0]['clan']['joined_at'] = response['data'][account_id]['joined_at'];
			MembersArray[0]['clan']['role'] = response['data'][account_id]['role'];
			MembersArray[0]['clan']['account_name'] = response['data'][account_id]['account_name'];		
			
			viewMemberClan();
		}
		function errorClanInfo(url){
			MembersArray[0]['clan'] = null;
			
			viewMemberClan();
		}
		function viewMemberClan(){
			var wowsstatinfo_profile_clan = document.getElementById('wowsstatinfo-profile-clan');
		
			if(MembersArray[0]['clan'] != null){
				var day = dateDiffInDays(MembersArray[0]['clan']['joined_at'] * 1000, new Date().getTime());
				
				var icon = MembersArray[0]['clan']['emblems']['x32']['portal'];
				if(icon === undefined){
					for(var key in MembersArray[0]['clan']['emblems']['x32']){
						if(key != 'wot'){
							icon = MembersArray[0]['clan']['emblems']['x32'][key];
						}
					}					
				}
				
				wowsstatinfo_profile_clan.innerHTML = '' +
					'<div class="b-profile-clan b-profile-clan__points js-tooltip" id="js-profile-clan">' +
						'<div class="b-profile-clan_photo">' +
							'<div style="background: '+MembersArray[0]['clan']['color']+';" class="b-profile-clan_color"><!-- --></div>' +
							'<a class="b-profile-clan_link" href="http://'+realm+'.wargaming.net/clans/'+MembersArray[0]['clan']['clan_id']+'/" target="_blank">' +
								'<img alt="'+MembersArray[0]['clan']['name']+'" src="'+icon+'" width="32" height="32">' +
							'</a>' +
						'</div>' +
						'<div class="b-profile-clan_text">' +
							'<div class="b-profile-clan_text-wrpr">' +
								'<a class="b-link-clan" href="http://'+realm+'.wargaming.net/clans/'+MembersArray[0]['clan']['clan_id']+'/" target="_blank">' +
									'<span class="b-link-clan_tag" style="color: '+MembersArray[0]['clan']['color']+';">['+MembersArray[0]['clan']['tag']+']</span>&nbsp;'+MembersArray[0]['clan']['name']+'' +
								'</a>' +
							'</div>' +
							'<div class="b-statistic">' +
								'<p class="b-statistic_item">'+localizationText['role']+': <span class="b-statistic_value">'+MembersArray[0]['clan']['role_i18n']+'</span></p>' +
								'<p class="b-statistic_item">'+localizationText['clan-day']+': <span class="b-statistic_value">'+day+'</span></p>' +
							'</div>' +
						'</div>' +
					'</div>' +
				'';
			}else{
				wowsstatinfo_profile_clan.innerHTML = '';
			}			
		}
		function viewMainPageProfile(){
			if(Encyclopedia == null){console.log('Encyclopedia == null'); setTimeout(function(){viewMainPageProfile();}, 1000);return;}
			
			if(!calcStat(0)){
				console.log('Error calcStat '+MembersArray[0]['account_id']);
			}
			
			var tabContainer = null;
			var tab_container = document.getElementsByClassName('tab-container');
			for(var tc = 0; tc < tab_container.length; tc++){
				if(tab_container[tc].getAttribute('js-tab-cont-id') != 'pvp'){continue;}
				tabContainer = tab_container[tc];
			}
			
			if(tabContainer != null){
				var cm_user_menu_link_cutted_text = document.getElementsByClassName('cm-user-menu-link_cutted-text')[0];
				var login_name = null; if(cm_user_menu_link_cutted_text != null){login_name = cm_user_menu_link_cutted_text.textContent;}
				
				var userbar = '';
				if(login_name == MembersArray[0]['info']['nickname']){
					userbar += '<button class="btn btn-lg btn-turqoise" id="generator-userbar" style="margin: 5px; padding: 10px;">'+localizationText['generator-userbar']+'</button>';
					onSaveStatMember();
				}
				userbar += '' +
					'<br />'+
					'<img id="userbar-img" src="'+WoWsStatInfoHref+'bg/userbar.png" />'+
					'<br />'+
					'<textarea id="userbar-link" style="margin-top: 5px; font-size: 14px; height: 100px; width: 468px; color: black;">'+
						'[url='+WoWsStatInfoHref+'][img]'+WoWsStatInfoHref+'bg/userbar.png[/img][/url]'+
					'</textarea>'
				'';
				
				var main_page_script_block = document.getElementById('main-page-script-block');
				var account_main_stats_mobile = tabContainer.getElementsByClassName('account-main-stats-mobile')[0];
				if(main_page_script_block == null && account_main_stats_mobile != null){
					account_main_stats_mobile.outerHTML += '' +
						'<hr />' +
						'<table id="main-page-script-block" style="width: 100%;">' +
							'<tr>' +
								'<td style="vertical-align: top;">' +
									'<table class="account-table">' +
										'<thead>' +
											'<tr>' +
												'<th colspan="2">' +
													'<h3 class="_title">'+localizationText['stat-table-4']+'</h3>' +
												'</th>' +
											'</tr>' +
										'</thead>' +
										'<tbody>' +
											'<tr>' +
												'<td class="_name">' +
													'<span>'+localizationText['battles_days']+'</span>' +
												'</td>' +
												'<td class="_value">' +
													'<span>'+valueFormat((MembersArray[0]['info']['statistics']['pvp']['battles_days']).toFixed(0))+'</span>'+
												'</td>' +
											'</tr>' +
											'<tr>' +
												'<td class="_name">' +
													'<span>'+localizationText['number-ships-x']+'</span>' +
												'</td>' +
												'<td class="_value">' +
													'<span>'+MembersArray[0]['info']['ships_x_level']+'</span>'+
												'</td>' +
											'</tr>' +	
											'<tr>' +
												'<td class="_name">' +
													'<span>'+localizationText['max_ship_level']+'</span>' +
												'</td>' +
												'<td class="_value">' +
													'<span>'+
														MembersArray[0]['info']['statistics']['pvp']['max_ship_level']+
													'</span>' +
												'</td>' +
											'</tr>' +
											'<tr>' +
												'<td class="_name">' +
													'<span>'+localizationText['avg_battles_level']+'</span>' +
												'</td>' +
												'<td class="_value">' +
													'<span>'+valueFormat((MembersArray[0]['info']['statistics']['pvp']['avg_battles_level']).toFixed(1))+'</span>'+
												'</td>' +
											'</tr>' +
											'<tr>' +
												'<td class="_name">' +
													'<span>'+
														'<a target="_blank" href="http://vzhabin.ru/US_WoWsStatInfo/?realm_search='+realm+'&nickname='+MembersArray[0]['info']['nickname']+'">'+
															localizationText['wr']+
														'</a>' +
													'</span>' +
												'</td>' +
												'<td class="_value">' +
													'<span style="color: '+findColorASC(MembersArray[0]['info']['statistics']['pvp']['wr'], 'wr', 'main')+';">'+
														valueFormat((MembersArray[0]['info']['statistics']['pvp']['wr']).toFixed(2)) + 
													'</span>'+
												'</td>' +
											'</tr>' +
											'<tr>' +
												'<td class="_name">' +
													'<span>' +
														'<a target="_blank" href="http://warships.today/player/'+MembersArray[0]['info']['account_id']+'/'+realm+'/'+MembersArray[0]['info']['nickname']+'">'+
															localizationText['wtr'] +
														'</a>' +
													'</span>' +
												'</td>' +
												'<td class="_value">' +
													'<span style="color: '+findColorASC(MembersArray[0]['info']['statistics']['pvp']['wtr'], 'wtr', 'main')+';">'+
														valueFormat((MembersArray[0]['info']['statistics']['pvp']['wtr']).toFixed(2)) + 
													'</span>'+
												'</td>' +
											'</tr>' +
										'</tbody>' +
									'</table>' +
								'</td>'+
								'<td>'+
								'</td>'+
								'<td style="text-align: right; vertical-align: top;">'+
									userbar +
								'</td>' +
							'</tr>' +
						'</table>'
					'';
					
					var img = new Image();
					img.onload = function(){
						var userbar_img = document.getElementById('userbar-img');
						if(userbar_img != null){
							userbar_img.src = WoWsStatInfoHref+'userbar/'+MembersArray[0]['info']['nickname']+'.png'+'?'+Math.floor(Math.random()*100000001);
							
							var userbar_link = document.getElementById('userbar-link');
							userbar_link.textContent = '[url='+WoWsStatInfoHref+'?realm_search='+realm+'&nickname='+MembersArray[0]['info']['nickname']+'][img]'+WoWsStatInfoHref+'userbar/'+MembersArray[0]['info']['nickname']+'.png[/img][/url]';
						}
					}
					img.src = WoWsStatInfoHref+'userbar/'+MembersArray[0]['info']['nickname']+'.png'+'?'+Math.floor(Math.random()*100000001);
					
					jQ('#generator-userbar').click(function(){
						getJson(WoWsStatInfoHref+'bg/bg.php?'+Math.floor(Math.random()*100000001), doneUserBarBG, errorUserBarBG);
					});
					
					var _values = tabContainer.getElementsByClassName('_values')[0];
					var main_stat = _values.getElementsByTagName('div');
					main_stat[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['battles'], 'battles', 'main');
					main_stat[1].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['wins_percents'], 'wins_percents', 'main');
					main_stat[2].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['avg_xp'], 'avg_xp', 'main');
					main_stat[3].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['avg_damage_dealt'], 'avg_damage_dealt', 'main');
					main_stat[4].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['kill_dead'], 'kill_dead', 'main');
					
					var account_battle_stats = tabContainer.getElementsByClassName('account-battle-stats')[0];
					if(account_battle_stats != null){
						var account_table = account_battle_stats.getElementsByClassName('account-table');
						
						//Общие результаты
						account_table[0].rows[1].cells[1].getElementsByTagName('span')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['battles'], 'battles', 'main');
						
						//Средние показатели за бой
						account_table[1].rows[1].cells[1].getElementsByTagName('span')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['avg_xp'], 'avg_xp', 'main');
						account_table[1].rows[2].cells[1].getElementsByTagName('span')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['avg_damage_dealt'], 'avg_damage_dealt', 'main');
						account_table[1].rows[3].cells[1].getElementsByTagName('span')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['avg_frags'], 'avg_frags', 'main');
						account_table[1].rows[4].cells[1].getElementsByTagName('span')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['avg_planes_killed'], 'avg_planes_killed', 'main');
						account_table[1].rows[5].cells[1].getElementsByTagName('span')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['avg_capture_points'], 'avg_capture_points', 'main');
						account_table[1].rows[6].cells[1].getElementsByTagName('span')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['avg_dropped_capture_points'], 'avg_dropped_capture_points', 'main');
						
						// Рекордные показатели
						account_table[2].rows[1].cells[1].getElementsByTagName('span')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['max_xp'], 'max_xp', 'main');
						account_table[2].rows[2].cells[1].getElementsByTagName('span')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['max_damage_dealt'], 'max_damage_dealt', 'main');
						account_table[2].rows[3].cells[1].getElementsByTagName('span')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['max_frags_battle'], 'max_frags_battle', 'main');
						account_table[2].rows[4].cells[1].getElementsByTagName('span')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['max_planes_killed'], 'max_planes_killed', 'main');
						
						//Дополнительно
						account_table[0].rows[2].cells[1].getElementsByTagName('small')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['wins_percents'], 'wins_percents', 'main');
						if(account_table[0].rows[3].cells[1].getElementsByClassName('small-survived_battles_percents')[0] == undefined){
							account_table[0].rows[3].cells[1].innerHTML += '<small class="small-survived_battles_percents">('+valueFormat((MembersArray[0]['info']['statistics']['pvp']['survived_battles_percents']).toFixed(2))+'%)</small>';
							account_table[0].rows[3].cells[1].getElementsByTagName('small')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['survived_battles_percents'], 'survived_battles_percents', 'main');
						}					
						if(account_table[2].rows[1].cells[0].getElementsByClassName('small-max_xp_ship')[0] == undefined 
							&& Encyclopedia[MembersArray[0]['info']['statistics']['pvp']['max_xp_ship_id']] != null && Encyclopedia[MembersArray[0]['info']['statistics']['pvp']['max_xp_ship_id']] !== undefined){
							account_table[2].rows[1].cells[0].innerHTML += '<small class="small-max_xp_ship">('+Encyclopedia[MembersArray[0]['info']['statistics']['pvp']['max_xp_ship_id']]['name']+')</small>';
						}
						if(account_table[2].rows[2].cells[0].getElementsByClassName('small-max_damage_dealt_ship')[0] == undefined 
							&& Encyclopedia[MembersArray[0]['info']['statistics']['pvp']['max_damage_dealt_ship_id']] != null && Encyclopedia[MembersArray[0]['info']['statistics']['pvp']['max_damage_dealt_ship_id']] !== undefined){
							account_table[2].rows[2].cells[0].innerHTML += '<small class="small-max_damage_dealt_ship">('+Encyclopedia[MembersArray[0]['info']['statistics']['pvp']['max_damage_dealt_ship_id']]['name']+')</small>';
						}
						if(account_table[2].rows[3].cells[0].getElementsByClassName('small-max_frags_ship')[0] == undefined 
							&& Encyclopedia[MembersArray[0]['info']['statistics']['pvp']['max_frags_ship_id']] != null && Encyclopedia[MembersArray[0]['info']['statistics']['pvp']['max_frags_ship_id']] !== undefined){
							account_table[2].rows[3].cells[0].innerHTML += '<small class="small-max_frags_ship">('+Encyclopedia[MembersArray[0]['info']['statistics']['pvp']['max_frags_ship_id']]['name']+')</small>';
						}
						if(account_table[2].rows[4].cells[0].getElementsByClassName('small-max_planes_killed_ship')[0] == undefined 
							&& Encyclopedia[MembersArray[0]['info']['statistics']['pvp']['max_planes_killed_ship_id']] != null && Encyclopedia[MembersArray[0]['info']['statistics']['pvp']['max_planes_killed_ship_id']] !== undefined){
							account_table[2].rows[4].cells[0].innerHTML += '<small class="small-max_planes_killed_ship">('+Encyclopedia[MembersArray[0]['info']['statistics']['pvp']['max_planes_killed_ship_id']]['name']+')</small>';
						}
						
					}
				}
				
				var ships_detail_stats = tabContainer.getElementsByClassName('ships-detail-stats')[0];
				if(ships_detail_stats != null){
					for(var i = 0; i < ships_detail_stats.rows.length; i++){
						var row = ships_detail_stats.rows[i];
						
						if(i == 0 && row.cells.length < 6){
							var th = document.createElement('th');
							th.setAttribute('class', '_value');
							th.innerHTML = '<span>'+localizationText['wr']+'</span>';
							row.appendChild(th);
							
							th = document.createElement('th');
							th.setAttribute('class', '_value');
							th.innerHTML = '<span>'+localizationText['wtr']+'</span>';
							row.appendChild(th);
							
							continue;
						}
						
						if(row.getAttribute('class') == null){
							var _icon = row.getElementsByClassName('_icon')[0];
							var div_icon = _icon.getElementsByTagName('div')[0];
							var ship_class = div_icon.getAttribute('class').split('-')[1];
							
							if(row.cells.length < 6){
								for(var t = 0; t < typeShip.length; t++){
									var type = typeShip[t].toLowerCase();
									if(ship_class == type){
										ship_class = typeShip[t];
									}
								}
							
								var td = document.createElement('td');
								td.innerHTML = '<span style="color:'+findColorASC(MembersArray[0]['info']['statistics']['pvp']['wr_'+ship_class], 'wr', 'main')+';">'+valueFormat((MembersArray[0]['info']['statistics']['pvp']['wr_'+ship_class]).toFixed(0))+'</span>';
								row.appendChild(td);
								
								td = document.createElement('td');
								td.innerHTML = '<span style="color:'+findColorASC(MembersArray[0]['info']['statistics']['pvp']['wtr_'+ship_class], 'wtr', 'main')+';">'+valueFormat((MembersArray[0]['info']['statistics']['pvp']['wtr_'+ship_class]).toFixed(0))+'</span>';
								row.appendChild(td);
							}
							
							var battles = htmlParseMemberStatistic(row.cells[2]);
							if(battles > 0){
								var wins = htmlParseMemberStatistic(row.cells[3]);
								var avg_xp = htmlParseMemberStatistic(row.cells[4]);
								var wins_percents = (wins/battles)*100; if(isNaN(wins_percents)){wins_percents = 0;}
								
								row.cells[3].setAttribute('style', 'white-space: nowrap;');
								row.cells[3].innerHTML = valueFormat(wins)+' <span style="color:'+findColorASC(wins_percents, 'wins_percents', 'main')+';">('+valueFormat((wins_percents).toFixed(0))+'%)</span>';							
								
								row.cells[4].setAttribute('style', 'white-space: nowrap;');
								row.cells[4].innerHTML = ' <span style="color:'+findColorASC(avg_xp, 'avg_xp', 'main')+';">'+valueFormat(avg_xp)+'</span>';
							}
							
							continue;
						}
						
						if(row.getAttribute('class').indexOf('_expandable') > -1){
							var ship_id = row.getAttribute('js-has-extension').split('-')[0];
							
							if(row.cells.length < 5){
								var td = document.createElement('td');
								td.setAttribute('id', 'wr-'+ship_id);
								td.innerHTML = '<span>0</span>';
								row.appendChild(td);
								
								td = document.createElement('td');
								td.setAttribute('id', 'wtr-'+ship_id);
								td.innerHTML = '<span>0</span>';
								row.appendChild(td);
							}
							
							var battles = htmlParseMemberStatistic(row.cells[1]);
							if(battles > 0){
								var wins = htmlParseMemberStatistic(row.cells[2]);
								var avg_xp = htmlParseMemberStatistic(row.cells[3]);
								var wins_percents = (wins/battles)*100; if(isNaN(wins_percents)){wins_percents = 0;}
								
								row.cells[2].setAttribute('style', 'white-space: nowrap;');
								row.cells[2].innerHTML = valueFormat(wins)+' <span style="color:'+findColorASC(wins_percents, 'wins_percents', 'main')+';">('+valueFormat((wins_percents).toFixed(0))+'%)</span>';							
								
								row.cells[3].setAttribute('style', 'white-space: nowrap;');
								row.cells[3].innerHTML = ' <span style="color:'+findColorASC(avg_xp, 'avg_xp', 'main')+';">'+valueFormat(avg_xp)+'</span>';
							}
							
							continue;
						}
						
						if(row.getAttribute('class').indexOf('_ship-entry-stat') > -1){
							row.cells[0].setAttribute('colspan', '7');
							
							continue;
						}
					}
					
					for(var shipI = 0; shipI < MembersArray[0]['ships'].length; shipI++){
						var ship_id = MembersArray[0]['ships'][shipI]['ship_id'];
						var wr_cell = document.getElementById('wr-'+ship_id);
						if(wr_cell != null){
							wr_cell.setAttribute('style', 'white-space: nowrap;');
							wr_cell.innerHTML = '<span style="color:'+findColorASC(MembersArray[0]['ships'][shipI]['pvp']['wr'], 'wr', 'main')+';">'+valueFormat((MembersArray[0]['ships'][shipI]['pvp']['wr']).toFixed(0))+'</span>';
						}
						
						var wtr_cell = document.getElementById('wtr-'+ship_id);
						if(wtr_cell != null){
							wtr_cell.setAttribute('style', 'white-space: nowrap;');
							wtr_cell.innerHTML = '<span style="color:'+findColorASC(MembersArray[0]['ships'][shipI]['pvp']['wtr'], 'wtr', 'main')+';">'+valueFormat((MembersArray[0]['ships'][shipI]['pvp']['wtr']).toFixed(0))+'</span>';
						}
					}
				}
			
				var achieves_block = tabContainer.getElementsByClassName('achieves-block')[0];
				if(achieves_block != null){
					var achieve_item = tabContainer.getElementsByClassName('achieve-item');
					for(var i = 0; i < achieve_item.length; i++){
						var item = achieve_item[i];
						var js_tooltip_show = item.getAttribute('js-tooltip-show');
						var _counter = item.getElementsByClassName('_counter')[0];
						if(_counter != null && item.getElementsByClassName('_counter').length == 1){
							_counter.setAttribute('style', 'left: 70%; background-color: #F7882E; min-width: 3em;');
							item.innerHTML += '<div class="_counter" style="left: 20%; background-color: #AAAAAA; min-width: 3em;">'+MembersArray[0]['achievements']['battle'][js_tooltip_show+'_battle']+'</div>';
						}
					}
				}
				
				var typeStatAdd = ["pvp_div", "pvp_solo"];
				for(var i = 0; i < typeStatAdd.length; i++){
					var type = typeStatAdd[i];
					
					var account_tab = tabContainer.getElementsByClassName('account-tab-'+type)[0];
					if(account_tab == null){
						var account_tab_detail_stats = tabContainer.getElementsByClassName('account-tab-detail-stats')[0];
						if(account_tab_detail_stats != null){
							account_tab_detail_stats.outerHTML += '' +
								'<div class="account-tab-'+type+' tab-container" js-tab-cont-id="account-tab-'+type+'-pvp">' +
									'<div class="account-main-stats">' +
										'<div class="_bg-for-average-exp"></div>' +
										'<div class="account-main-stats-table">' +
											'<div class="_icons">' +
												'<div class="_battles">' +
													'<div></div>' +
												'</div>' +
												'<div class="_victories">' +
													'<div></div>' +
												'</div>' +
												'<div class="_average-exp">' +
													'<div></div>' +
												'</div>' +
												'<div class="_kd">' +
													'<div></div>' +
												'</div>' +
												'<div class="_other">' +
													'<div></div>' +
												'</div>' +
											'</div>' +
											'<div class="_names">' +
												'<div>'+localizationText['title_battles']+'</div>' +
												'<div>'+localizationText['title_wins_percents']+'</div>' +
												'<div class="_average-exp">'+localizationText['title_avg_xp']+'</div>' +
												'<div>'+localizationText['title_avg_damage_dealt']+'</div>' +
												'<div>'+localizationText['title_kill_dead']+'</div>' +
											'</div>' +
											'<div class="_values">' +
												'<div style="color: '+findColorASC(MembersArray[0]['info']['statistics'][type]['battles'], 'battles', 'main')+';">'+
													valueFormat((MembersArray[0]['info']['statistics'][type]['battles']).toFixed(0))+
												'</div>' +
												'<div style="color: '+findColorASC(MembersArray[0]['info']['statistics'][type]['wins_percents'], 'wins_percents', 'main')+';">'+
													valueFormat((MembersArray[0]['info']['statistics'][type]['wins_percents']).toFixed(2))+
												'%</div>' +
												'<div style="color: '+findColorASC(MembersArray[0]['info']['statistics'][type]['avg_xp'], 'avg_xp', 'main')+';">'+
													valueFormat((MembersArray[0]['info']['statistics'][type]['avg_xp']).toFixed(0))+
												'</div>' +
												'<div style="color: '+findColorASC(MembersArray[0]['info']['statistics'][type]['avg_damage_dealt'], 'avg_damage_dealt', 'main')+';">'+
													valueFormat((MembersArray[0]['info']['statistics'][type]['avg_damage_dealt']).toFixed(0))+
												'</div>' +
												'<div style="color: '+findColorASC(MembersArray[0]['info']['statistics'][type]['kill_dead'], 'kill_dead', 'main')+';">'+
													valueFormat((MembersArray[0]['info']['statistics'][type]['kill_dead']).toFixed(2))+
												'</div>' +
											'</div>' +
										'</div>' +
									'</div>' +
									'<hr />' +
									'<div class="account-battle-stats">' +
										getHTMLStat(MembersArray[0]['info']['statistics'][type], 'main')+
										'<div class="row">' +
											'<div class="col-xs-12 col-sm-4">' +
												'<table class="account-table _left">' +
													'<thead>' +
													'<tr>' +
														'<th colspan="2">' +
															'<h3 class="account-title">'+localizationText['stat-table-4']+'</h3>' +
														'</th>' +
													'</tr>' +
													'</thead>' +
													'<tbody>' +
														'<tr>' +
															'<td class="_name">' +
																'<span>'+localizationText['battles_days']+'</span>' +
															'</td>' +
															'<td class="_value">' +
																'<span>'+
																	(MembersArray[0]['info']['statistics'][type]['battles_days']).toFixed(0)+
																'</span>' +
															'</td>' +
														'</tr>' +
														'<tr>' +
															'<td class="_name">' +
																'<span>'+localizationText['max_ship_level']+'</span>' +
															'</td>' +
															'<td class="_value">' +
																'<span>'+
																	MembersArray[0]['info']['statistics'][type]['max_ship_level']+
																'</span>' +
															'</td>' +
														'</tr>' +
														'<tr>' +
															'<td class="_name">' +
																'<span>'+localizationText['avg_battles_level']+'</span>' +
															'</td>' +
															'<td class="_value">' +
																'<span>'+
																	valueFormat((MembersArray[0]['info']['statistics'][type]['avg_battles_level']).toFixed(1))+
																'</span>' +
															'</td>' +
														'</tr>' +
														'<tr>' +
															'<td class="_name">' +
																'<span>' +
																	'<a target="_blank" href="http://vzhabin.ru/US_WoWsStatInfo/?realm_search='+realm+'&nickname='+MembersArray[0]['info']['nickname']+'">'+
																		localizationText['wr'] +
																	'</a>' +
																'</span>' +
															'</td>' +
															'<td class="_value">' +
																'<span style="color: '+findColorASC(MembersArray[0]['info']['statistics'][type]['wr'], 'wr', 'main')+';">'+
																	valueFormat((MembersArray[0]['info']['statistics'][type]['wr']).toFixed(2)) + 
																'</span>'+
															'</td>' +
														'</tr>' +
														'<tr>' +
															'<td class="_name">' +
																'<span>' +
																	'<a target="_blank" href="http://warships.today/player/'+MembersArray[0]['info']['account_id']+'/'+realm+'/'+MembersArray[0]['info']['nickname']+'">' +
																		localizationText['wtr'] +
																	'</a>' +
																'</span>' +
															'</td>' +
															'<td class="_value">' +
																'<span style="color: '+findColorASC(MembersArray[0]['info']['statistics'][type]['wtr'], 'wtr', 'main')+';">'+
																	valueFormat((MembersArray[0]['info']['statistics'][type]['wtr']).toFixed(2)) + 
																'</span>'+
															'</td>' +
														'</tr>' +
													'</tbody>' +
												'</table>' +
											'</div>' +
										'</div>' +
									'</div>' +
									'<hr />' +
									'<div class="account-tab-ships tab-container _active" js-tab-cont-id="account-tab-ships-'+type+'">' +
										'<h3 class="account-title">'+localizationText['ships_stat']+'</h3>' +
										'<table class="table-wows">'+
											'<thead>'+
												'<tr>'+
													'<th class="_icon">'+
														'<div class="_icon-type-of-ship"></div>'+
													'</th>'+
													'<th class="_name">'+
														localizationText['title_ships']+
													'</th>'+
													'<th class="_value">'+
														'<div class="_icon-battles"></div>'+
														'<span>'+localizationText['battles']+'</span>'+
													'</th>'+
													'<th class="_value">'+
														'<div class="_icon-winrate"></div>'+
														'<span>'+localizationText['wins']+'</span>'+
													'</th>'+
													'<th class="_value">'+
														'<div class="_icon-exp"></div>'+
														'<span>'+localizationText['title_avg_xp']+'</span>'+
													'</th>'+
													'<th class="_value">'+
														'<span>'+localizationText['wr']+'</span>'+
													'</th>'+
													'<th class="_value">'+
														'<span>'+localizationText['wtr']+'</span>'+
													'</th>'+
												'</tr>'+
											'</thead>'+
											getHTMLShipStat(MembersArray[0], type)+
										'</table>'+
									'</div>' +
								'</div>' +
							'';
							
							jQ(tabContainer).find('nav.account-tabs ul').append(''+
								'<li class="account-tab" js-tab="" js-tab-show="account-tab-'+type+'-pvp">'+
									'<div class="_title">'+localizationText[type]+'</div>'+
									'<div class="_active-feature">'+
										'<div class="_line"></div>'+
										'<div class="_shadow"></div>'+
									'</div>'+
								'</li>'+
							'');
							jQ(tabContainer).find('div.account-tabs-mobile ul').append(''+
								'<li class="_item" js-dropdown-item="" js-tab="" js-tab-show="account-tab-'+type+'-pvp">'+localizationText[type]+'</li>' +
							'');
							
							jQ('.ships-class-'+type).click(function(){
								if(jQ(this).attr('open-active') == 'true'){
									jQ(this).removeClass('_active-btn');
									jQ('.'+jQ(this).attr('open-block')).removeClass('_active');
									jQ(this).attr('open-active', 'false');
								}else{
									jQ(this).addClass('_active-btn');
									jQ('.'+jQ(this).attr('open-block')).addClass('_active');
									jQ(this).attr('open-active', 'true');
								}								
							});
							
							jQ('.ship-stat-'+type).click(function(){
								if(jQ(this).attr('open-active') == 'true'){
									jQ(this).removeClass('_active-btn');
									jQ('.'+jQ(this).attr('open-block')).removeClass('_active');
									jQ(this).attr('open-active', 'false');
								}else{
									jQ(this).addClass('_active-btn');
									jQ('.'+jQ(this).attr('open-block')).addClass('_active');
									jQ(this).attr('open-active', 'true');
								}								
							});
						}
					}
				}				
			}
		}
		function getHTMLStat(StatArray, type_stat){
			var html = '';
			
			var battles_percents = '';
			var max_xp_ship = '';
			var max_damage_dealt_ship = '';
			var max_frags_ship = '';
			var max_planes_killed_ship = '';
			if(type_stat == 'main'){
				battles_percents = '<small>('+valueFormat((StatArray['battles_percents']).toFixed(2))+'%)</small>';
				max_xp_ship = '<small> ('+Encyclopedia[''+StatArray['max_xp_ship_id']+'']['name']+')</small>';
				max_damage_dealt_ship = '<small> ('+Encyclopedia[''+StatArray['max_damage_dealt_ship_id']+'']['name']+')</small>';
				max_frags_ship = '<small> ('+Encyclopedia[''+StatArray['max_frags_ship_id']+'']['name']+')</small>';
				max_planes_killed_ship = '<small> ('+Encyclopedia[''+StatArray['max_planes_killed_ship_id']+'']['name']+')</small>';
			}
			
			html = ''+
				'<div class="row">' +
					'<div class="col-xs-12 col-sm-4">' +
						'<table class="account-table _left">' +
							'<thead>' +
								'<tr>' +
									'<th colspan="2">' +
										'<h3 class="account-title">'+localizationText['stat-table-1']+'</h3>' +
									'</th>' +
								'</tr>' +
							'</thead>' +
							'<tbody>' +
								'<tr>' +
									'<td class="_name">' +
										'<span>'+localizationText['battles']+'</span>' +
									'</td>' +
									'<td class="_value">' +
										'<span style="color: '+findColorASC(StatArray['battles'], 'battles', type_stat)+';">'+
											valueFormat((StatArray['battles']).toFixed(0))+
										'</span>' +
										battles_percents+
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<td class="_name">' +
										'<span>'+localizationText['wins']+'</span>' +
									'</td>' +
									'<td class="_value">' +
										'<span>'+
											valueFormat((StatArray['wins']).toFixed(0))+
										'</span>' +
										'<small style="color: '+findColorASC(StatArray['wins_percents'], 'wins_percents', type_stat)+';">('+
											valueFormat((StatArray['wins_percents']).toFixed(2))+
										'%)</small>'+
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<td class="_name">' +
										'<span>'+localizationText['survived_battles']+'</span>' +
									'</td>' +
									'<td class="_value">' +
										'<span>'+
											valueFormat((StatArray['survived_battles']).toFixed(0))+
										'</span>' +
										'<small style="color: '+findColorASC(StatArray['survived_battles_percents'], 'survived_battles_percents', type_stat)+';">('+
											valueFormat((StatArray['survived_battles_percents']).toFixed(2))+
										'%)</small>'+
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<td class="_name">' +
										'<span>'+localizationText['damage_dealt']+'</span>' +
									'</td>' +
									'<td class="_value">' +
										'<span>'+valueFormat((StatArray['damage_dealt']).toFixed(0))+'</span>' +
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<td class="_name">' +
										'<span>'+localizationText['frags']+'</span>' +
									'</td>' +
									'<td class="_value">' +
										'<span>'+valueFormat((StatArray['frags']).toFixed(0))+'</span>' +
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<td class="_name">' +
										'<span>'+localizationText['planes_killed']+'</span>' +
									'</td>' +
									'<td class="_value">' +
										'<span>'+valueFormat((StatArray['planes_killed']).toFixed(0))+'</span>' +
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<td class="_name">' +
										'<span>'+localizationText['capture_points']+'</span>' +
									'</td>' +
									'<td class="_value">' +
										'<span>'+valueFormat((StatArray['capture_points']).toFixed(0))+'</span>' +
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<td class="_name">' +
										'<span>'+localizationText['dropped_capture_points']+'</span>' +
									'</td>' +
									'<td class="_value">' +
										'<span>'+valueFormat((StatArray['dropped_capture_points']).toFixed(0))+'</span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</div>' +
					'<div class="col-xs-12 col-sm-4">' +
						'<table class="account-table _center">' +
							'<thead>' +
							'<tr>' +
								'<th colspan="2">' +
									'<h3 class="account-title">'+localizationText['stat-table-2']+'</h3>' +
								'</th>' +
							'</tr>' +
							'</thead>' +
							'<tbody>' +
								'<tr>' +
									'<td class="_name">' +
										'<span>'+localizationText['avg_xp']+'</span>' +
									'</td>' +
									'<td class="_value">' +
										'<span style="color: '+findColorASC(StatArray['avg_xp'], 'avg_xp', type_stat)+';">'+
											valueFormat((StatArray['avg_xp']).toFixed(2))+
										'</span>' +
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<td class="_name">' +
										'<span>'+localizationText['avg_damage_dealt']+'</span>' +
									'</td>' +
									'<td class="_value">' +
										'<span style="color: '+findColorASC(StatArray['avg_damage_dealt'], 'avg_damage_dealt', type_stat)+';">'+
											valueFormat((StatArray['avg_damage_dealt']).toFixed(2))+
										'</span>' +
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<td class="_name">' +
										'<span>'+localizationText['avg_frags']+'</span>' +
									'</td>' +
									'<td class="_value">' +
										'<span style="color: '+findColorASC(StatArray['avg_frags'], 'avg_frags', type_stat)+';">'+
											valueFormat((StatArray['avg_frags']).toFixed(2))+
										'</span>' +
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<td class="_name">' +
										'<span>'+localizationText['avg_planes_killed']+'</span>' +
									'</td>' +
									'<td class="_value">' +
										'<span style="color: '+findColorASC(StatArray['avg_planes_killed'], 'avg_planes_killed', type_stat)+';">'+
											valueFormat((StatArray['avg_planes_killed']).toFixed(2))+
										'</span>' +
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<td class="_name">' +
										'<span>'+localizationText['avg_capture_points']+'</span>' +
									'</td>' +
									'<td class="_value">' +
										'<span style="color: '+findColorASC(StatArray['avg_capture_points'], 'avg_capture_points', type_stat)+';">'
											+valueFormat((StatArray['avg_capture_points']).toFixed(2))+
										'</span>' +
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<td class="_name">' +
										'<span>'+localizationText['avg_dropped_capture_points']+'</span>' +
									'</td>' +
									'<td class="_value">' +
										'<span style="color: '+findColorASC(StatArray['avg_dropped_capture_points'], 'avg_dropped_capture_points', type_stat)+';">'+
											valueFormat((StatArray['avg_dropped_capture_points']).toFixed(0))+
										'</span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</div>' +
					'<div class="col-xs-12 col-sm-4">' +
						'<table class="account-table _right">' +
							'<thead>' +
							'<tr>' +
								'<th colspan="2">' +
									'<h3 class="account-title">'+localizationText['stat-table-3']+'</h3>' +
								'</th>' +
							'</tr>' +
							'</thead>' +
							'<tbody>' +
								'<tr>' +
									'<td class="_name">' +
										'<span>'+localizationText['max_xp']+'</span>' +
										max_xp_ship +
									'</td>' +
									'<td class="_value">' +
										'<span style="color: '+findColorASC(StatArray['max_xp'], 'max_xp', type_stat)+';">'+
											valueFormat((StatArray['max_xp']).toFixed(0))+
										'</span>' +
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<td class="_name">' +
										'<span>'+localizationText['max_damage_dealt']+'</span>' +
										max_damage_dealt_ship +
									'</td>' +
									'<td class="_value">' +
										'<span style="color: '+findColorASC(StatArray['max_damage_dealt'], 'max_damage_dealt', type_stat)+';">'+
											valueFormat((StatArray['max_damage_dealt']).toFixed(0))+
										'</span>' +
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<td class="_name">' +
										'<span>'+localizationText['max_frags_battle']+'</span>' +
										max_frags_ship+
									'</td>' +
									'<td class="_value">' +
										'<span style="color: '+findColorASC(StatArray['max_frags_battle'], 'max_frags_battle', type_stat)+';">'+
											valueFormat((StatArray['max_frags_battle']).toFixed(0))+
										'</span>' +
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<td class="_name">' +
										'<span>'+localizationText['max_planes_killed']+'</span>' +
										max_planes_killed_ship+
									'</td>' +
									'<td class="_value">' +
										'<span style="color: '+findColorASC(StatArray['max_planes_killed'], 'max_planes_killed', type_stat)+';">'+
											valueFormat((StatArray['max_planes_killed']).toFixed(0))+
										'</span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</div>' +	
				'</div>' +
			'';
			
			return html;
		}
		function getHTMLShipStat(StatArray, type){
			var htmlArray = [];
			var StatClassArray = [];
			for(var tS = 0; tS < typeShip.length; tS++){
				htmlArray[typeShip[tS]] = '';
				
				StatClassArray[typeShip[tS]] = [];
				StatClassArray[typeShip[tS]]['battles'] = 0;
				StatClassArray[typeShip[tS]]['wins'] = 0;
				StatClassArray[typeShip[tS]]['xp'] = 0;
				StatClassArray[typeShip[tS]]['count'] = 0;
			}
			
			StatArray['ships'].sort(DESC(type+'.battles'));
			
			for(var sI = 0; sI < StatArray['ships'].length; sI++){
				var Ship = StatArray['ships'][sI];
				var ship_id = Ship['ship_id'];
				var ship_nation = Encyclopedia[ship_id]['nation']
				var ship_name = Encyclopedia[ship_id]['name'];
				var ship_type = Encyclopedia[ship_id]['type'];
				var ship_tier = Encyclopedia[ship_id]['tier'];
				var ship_lvl = getLevelText(ship_tier);
				var ship_img = Encyclopedia[ship_id]['images']['small'];
				
				if(Ship[type]['battles'] > 0){
					StatClassArray[ship_type]['battles'] += Ship[type]['battles'];
					StatClassArray[ship_type]['wins'] += Ship[type]['wins'];
					StatClassArray[ship_type]['xp'] += Ship[type]['xp'];
					StatClassArray[ship_type]['count']++;
					
					htmlArray[ship_type] += '' +
						'<tr class="_expandable ship-stat-'+type+'" open-block="ship-'+ship_id+'-'+ship_tier+'-'+type+'" open-active="false">' +
							'<td colspan="2" class="_name">' +
								'<div class="_bg-nation-'+ship_nation+'"></div>' +
								'<span class="_lvl">'+ship_lvl+'</span>' +
								'<img class="_icon-ships img-responsive" style="width: 68px; height: 40px;" src="'+ship_img+'">' +
								'<span class="_text">'+ship_name+'</span>' +
							'</td>' +
							'<td class="_value">'+valueFormat((Ship[type]['battles']).toFixed(0))+'</td>' +
							'<td class="_value" style="white-space: nowrap;">' +
								Ship[type]['wins']+' ' +
								'<span style="color:'+findColorASC(Ship[type]['wins_percents'], 'wins_percents', 'main')+'">' +
									'('+valueFormat((Ship[type]['wins_percents']).toFixed(0))+'%)' +
								'</span>' +
							'</td>' +
							'<td class="_value" style="white-space: nowrap;">' +
								'<span style="color:'+findColorASC(Ship[type]['avg_xp'], 'avg_xp', 'main')+';">' +
									valueFormat((Ship[type]['avg_xp']).toFixed(0)) +
								'</span>' +
							'</td>' +
							'<td style="white-space: nowrap;">' +
								'<span style="color:'+findColorASC(Ship[type]['wr'], 'wr', 'main')+';">' +
									valueFormat((Ship[type]['wr']).toFixed(0)) +
								'</span>' +
							'</td>' +
							'<td style="white-space: nowrap;">' +
								'<span style="color:'+findColorASC(Ship[type]['wtr'], 'wtr', 'main')+';">' +
									valueFormat((Ship[type]['wtr']).toFixed(0)) +
								'</span>' +
							'</td>' +
						'</tr>' +
						'<tr class="_hide _ship-entry-stat ship-'+ship_id+'-'+ship_tier+'-'+type+'">' +
							'<td colspan="7">' +
								getHTMLStat(Ship[type], 'ship') +
							'</td>' +
						'</tr>'+
					'';
				}
				
			}
			
			var html = '';
			
			for(var tS = 0; tS < typeShip.length; tS++){
				var wins_percents = (StatClassArray[typeShip[tS]]['wins']/StatClassArray[typeShip[tS]]['battles'])*100; if(isNaN(wins_percents)){wins_percents = 0;}
				var avg_xp = StatClassArray[typeShip[tS]]['xp']/StatClassArray[typeShip[tS]]['battles']; if(isNaN(avg_xp)){avg_xp = 0;}
			
				html += '' +
					'<tbody class="_expandable ships-class-'+type+'" open-block="ships-class-'+typeShip[tS].toLowerCase()+'-'+type+'" open-active="false">' +
						'<tr>' +
							'<td class="_icon"><div class="_icon-'+typeShip[tS].toLowerCase()+'"></div></td>' +
							'<td class="_name">' +
								localizationText[typeShip[tS].toLowerCase()]+' ('+StatClassArray[typeShip[tS]]['count']+')' +
							'</td>' +
							'<td class="_value">'+valueFormat((StatClassArray[typeShip[tS]]['battles']).toFixed(0))+'</td>' +
							'<td class="_value" style="white-space: nowrap;">' +
								valueFormat((StatClassArray[typeShip[tS]]['wins']).toFixed(0))+' ' +
								'<span style="color:'+findColorASC(wins_percents, 'wins_percents', 'main')+';">' +
									'('+valueFormat((wins_percents).toFixed(0))+'%)' +
								'</span>' +
							'</td>' +
							'<td class="_value" style="white-space: nowrap;"> ' +
								'<span style="color:'+findColorASC(avg_xp, 'avg_xp', 'main')+';">' +
									valueFormat((avg_xp).toFixed(0)) +
								'</span>' +
							'</td>' +
							'<td>' +
								'<span style="color:'+findColorASC(StatArray['info']['statistics'][type]['wr_'+typeShip[tS]], 'wr', 'main')+';">' +
									valueFormat((StatArray['info']['statistics'][type]['wr_'+typeShip[tS]]).toFixed(0)) +
								'</span>' +
							'</td>' +
							'<td>' +
								'<span style="color:'+findColorASC(StatArray['info']['statistics'][type]['wtr_'+typeShip[tS]], 'wtr', 'main')+';">' +
									valueFormat((StatArray['info']['statistics'][type]['wtr_'+typeShip[tS]]).toFixed(0)) +
								'</span>' +
							'</td>' +
						'</tr>' +
					'</tbody>' +
					'<tbody class="_hide ships-class-'+typeShip[tS].toLowerCase()+'-'+type+'">' +
						htmlArray[typeShip[tS]] +
					'</tbody>' +
				'';
			}
			
			return html;
		}
		function GeneratorUserBar(userbarbg){
			var jsonString = 'json='+JSON.stringify(MembersArray[0])+'&type=userbar&userbarbg='+userbarbg+'&lang='+lang;
			
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
						userbar_link.textContent = '[url='+WoWsStatInfoHref+'?realm_search='+realm+'&nickname='+MembersArray[0]['info']['nickname']+'][img]'+xmlhttp.responseText+'[/img][/url]';
					}
				}
			};
			xmlhttp.send(jsonString);
		}
		var UserBarBGData = null;
		var CountUserBar = [];
		function doneUserBarBG(url, response){
			UserBarBGData = response;
			
			CountUserBar['all'] = 0;
			CountUserBar['clan'] = 0;
			CountUserBar['noclassification'] = 0;
			
			CountUserBar['battleship'] = [];
			CountUserBar['battleship']['count'] = 0;
			CountUserBar['battleship']['japan'] = 0;
			CountUserBar['battleship']['ussr'] = 0;
			CountUserBar['battleship']['germany'] = 0;
			CountUserBar['battleship']['uk'] = 0;
			CountUserBar['battleship']['usa'] = 0;
			
			CountUserBar['aircarrier'] = [];
			CountUserBar['aircarrier']['count'] = 0;
			CountUserBar['aircarrier']['japan'] = 0;
			CountUserBar['aircarrier']['ussr'] = 0;
			CountUserBar['aircarrier']['germany'] = 0;
			CountUserBar['aircarrier']['uk'] = 0;
			CountUserBar['aircarrier']['usa'] = 0;
			
			CountUserBar['cruiser'] = [];
			CountUserBar['cruiser']['count'] = 0;
			CountUserBar['cruiser']['japan'] = 0;
			CountUserBar['cruiser']['ussr'] = 0;
			CountUserBar['cruiser']['germany'] = 0;
			CountUserBar['cruiser']['uk'] = 0;
			CountUserBar['cruiser']['usa'] = 0;
			
			CountUserBar['destroyer'] = [];
			CountUserBar['destroyer']['count'] = 0;
			CountUserBar['destroyer']['japan'] = 0;
			CountUserBar['destroyer']['ussr'] = 0;
			CountUserBar['destroyer']['germany'] = 0;
			CountUserBar['destroyer']['uk'] = 0;
			CountUserBar['destroyer']['usa'] = 0;
			
			for(var i = 0; i < UserBarBGData.length; i++){
				var img = UserBarBGData[i].split('_');
				if(img.length > 1){
					for(var i_id = 1; i_id < img.length; i_id++){
						if(MembersArray[0]['clan'] == null){break;}
						if(img[i_id] == MembersArray[0]['clan']['clan_id']){
							CountUserBar['clan']++;
							CountUserBar['all']++;
						}
					}
				}else{
					CountUserBar['all']++;
					var shipsBG = UserBarBGData[i].split('-');
					if(shipsBG.length == 2){
						CountUserBar['noclassification']++;
					}else if(shipsBG.length == 3){
						var type = shipsBG[1];
						var nation = shipsBG[2];
						CountUserBar[type]['count']++;
						CountUserBar[type][nation]++;
					}
				}
			}
			
			var html = '' +
				'<div style="width: 488px; border-bottom: 1px solid rgba(0, 0, 0, 0.7); box-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.05); padding: 0 0 14px; margin: 0 0 14px;">' +
					localizationText['userbar-filters']+' ' +
					'<select id="userbar-bg-filtr-types" name="types" style="color: black;">' +
						'<option value="all">'+localizationText['filters-all']+' ('+CountUserBar['all']+')</option>' +
						'<option value="clan">'+localizationText['filters-clan']+' ('+CountUserBar['clan']+')</option>' +
						'<option value="noclassification">'+localizationText['filters-noclassification']+' ('+CountUserBar['noclassification']+')</option>' +
						'<option value="battleship">'+localizationText['filters-battleship']+' ('+CountUserBar['battleship']['count']+')</option>' +
						'<option value="aircarrier">'+localizationText['filters-aircarrier']+' ('+CountUserBar['aircarrier']['count']+')</option>' +
						'<option value="cruiser">'+localizationText['filters-cruiser']+' ('+CountUserBar['cruiser']['count']+')</option>' +
						'<option value="destroyer">'+localizationText['filters-destroyer']+' ('+CountUserBar['destroyer']['count']+')</option>' +
					'</select>' +
					'<select id="userbar-bg-filtr-nations" name="nations" style="color: black; margin-left: 10px; display: none;">' +
						'<option value="japan">'+localizationText['filters-japan']+'</option>' +
						'<option value="ussr">'+localizationText['filters-ussr']+'</option>' +
						'<option value="germany">'+localizationText['filters-germany']+'</option>' +
						'<option value="uk">'+localizationText['filters-uk']+'</option>' +
						'<option value="usa">'+localizationText['filters-usa']+'</option>' +
					'</select>' +
				'</div>' +
			'';
			
			var check = true;
			html += '<div id="userbar-bg-content" style="width: 488px; height: 429px; overflow-y: scroll;">';
			for(var i = 0; i < UserBarBGData.length; i++){				
				var imgbgview = false;
				var img = UserBarBGData[i].split('_');
				if(img.length > 1){
					for(var i_id = 1; i_id < img.length; i_id++){
						if(MembersArray[0]['clan'] == null){break;}
						if(img[i_id] == MembersArray[0]['clan']['clan_id']){
							imgbgview = true;
						}
					}
				}else{
					imgbgview = true;
				}
				
				if(imgbgview){
					var checked = ''; if(check){checked = 'checked="checked"'; check = false;}
					html += '<input type="radio" name="userbar-bg" value="'+UserBarBGData[i]+'" '+checked+'> '+UserBarBGData[i]+'<br />';
					html += '<img src="'+WoWsStatInfoHref+'bg/'+UserBarBGData[i]+'.png" title="'+UserBarBGData[i]+'"/><br /><br />';
				}
			}
			html += '</div>';
			
			html += '' +
				'<button class="btn btn-lg btn-turqoise" id="userbar-your-background" style="margin-top: 5px; padding: 5px;">' +
					localizationText['userbar-your-background'] +
				'</button>' +
			'';
			
			onShowMessage(
				localizationText['userbar-bg'],
				html,
				function(){
					var userbarbg = 'userbar';
					
					var radios = document.getElementsByName('userbar-bg');
					for(var i = 0; i < radios.length; i++){
						if(radios[i].checked){
							userbarbg = radios[i].value;
							break;
						}
					}
				
					GeneratorUserBar(userbarbg); 
					
					onCloseMessage();
				},
				localizationText['Ok'],
				true
			);

			jQ('#userbar-your-background').click(function(){
				onCloseMessage();
				
				var html = '' +
					'<div id="userbar-bg-content" style="width: 488px; height: 220px;">' + 
						'<p>'+localizationText['img-max-size']+', '+localizationText['img-max-px']+', '+localizationText['img-format']+'</p>' +
						'<form id="upload-myfile" name="upload-myfile">' +
							'<input type="file" name="myfile" accept="image/x-png" />' +
							'<button type="submit" name="submit" class="btn btn-lg btn-turqoise" id="userbar-your-background" style="margin: 5px 0px; padding: 5px;">' +
								localizationText['upload-submit'] +
							'</button>' +
						'</form>' +
						'<img id="userbar-img-upload" src="'+WoWsStatInfoHref+'bg/userbar.png" userbarbg="userbar" />' +
					'</div>'+
				'';
				
				var check_upload = false;
				
				onShowMessage(
					localizationText['upload-verification'],
					html,
					function(){
						onCloseMessage();
						
						if(check_upload){
							onShowMessage(
								localizationText['Box'],
								localizationText['upload-verification'], 
								onCloseMessage,
								localizationText['Ok'],
								false
							);
						}else{
							var userbar_img_upload = document.getElementById('userbar-img-upload');
							if(userbar_img_upload.getAttribute('userbarbg') != 'userbar'){
								GeneratorUserBar(userbar_img_upload.getAttribute('userbarbg'));
							}
						}
					},
					localizationText['Ok'],
					true
				);
				
				var img = new Image();
				img.onload = function(){
					var userbar_img_upload = document.getElementById('userbar-img-upload');
					if(userbar_img_upload != null){
						userbar_img_upload.src = WoWsStatInfoHref+'bg/user/'+MembersArray[0]['info']['account_id']+'.png'+'?'+Math.floor(Math.random()*100000001);
						userbar_img_upload.setAttribute('userbarbg', 'user/'+MembersArray[0]['info']['account_id']);
					}
				}
				img.src = WoWsStatInfoHref+'bg/user/'+MembersArray[0]['info']['account_id']+'.png'+'?'+Math.floor(Math.random()*100000001);
				
				document.forms["upload-myfile"].onsubmit = function(e){
					e.preventDefault();
					
					check_upload = true;
					
					function validateExtension(v){
						var allowedExtensions = new Array(".png", ".PNG");
						for(var ct = 0;ct < allowedExtensions.length; ct++){
							sample = v.lastIndexOf(allowedExtensions[ct]);
							if(sample != -1){return true;}
						}
						return false;
					}
					
					var file_local_link = this.elements.myfile.value;
					var file = this.elements.myfile.files[0];
					if(file){
						if(file.size <= 153600){
							var _URL = window.URL || window.webkitURL;
							var img = new Image();
							img.onload = function (){
								if(this.width == 468 && this.height == 100){
									if(validateExtension(file_local_link)){
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
										
										xmlhttp.onload = xmlhttp.onerror = function(){
											if(this.status == 200){
												console.log("upload-myfile success");
												console.log(xmlhttp.responseText);
												
												var userbar_img_upload = document.getElementById('userbar-img-upload');
												if(userbar_img_upload != null){
													userbar_img_upload.src = WoWsStatInfoHref+'bg/user/temp/'+MembersArray[0]['info']['account_id']+'.png'+'?'+Math.floor(Math.random()*100000001);
													userbar_img_upload.setAttribute('userbarbg', 'userbar');
												}
											}else{
												console.log("upload-myfile error " + this.status);
											}
										};
										
										xmlhttp.upload.onprogress = function(event){
											console.log(event.loaded + ' / ' + event.total);
										}
										
										xmlhttp.open("POST", WoWsStatInfoHref+"upload-bg.php?random="+Math.floor(Math.random()*100000001), true);
										
										var formData = new FormData();
										formData.append("myfile", file);
										formData.append("account_id", MembersArray[0]['info']['account_id']);
										
										xmlhttp.send(formData);
									}else{
										alert(localizationText['img-format']);
									}
								}else{
									alert(localizationText['img-max-px']);
								}
							};
							img.src = _URL.createObjectURL(file);
						}else{
							alert(localizationText['img-max-size']);
						}
					}
					
					return false;
				}
			});
			
			jQ('#userbar-bg-filtr-types').change(function(){
				updateUserBarBG();
			});			
			jQ('#userbar-bg-filtr-nations').change(function(){
				updateUserBarBG();
			});
		}
		function errorUserBarBG(url){
			var html = '' +
				'<div style="width: 488px;">' +
					'<input type="radio" name="userbar-bg" value="userbar" checked="checked"> userbar<br />' +
					'<img src="'+WoWsStatInfoHref+'bg/userbar.png" title="userbar"/><br /><br />' +
				'</div>' +
			'';
			
			onShowMessage(
				localizationText['userbar-bg'],
				html,
				function(){
					var userbarbg = 'userbar';
					
					var radios = document.getElementsByName('userbar-bg');
					for(var i = 0; i < radios.length; i++){
						if(radios[i].checked){
							userbarbg = radios[i].value;
							break;
						}
					}
					
					GeneratorUserBar(userbarbg); 
					
					onCloseMessage();
				},
				localizationText['Ok'],
				true
			);
		}
		function updateUserBarBG(){
			var html = '';
			
			var userbar_bg_filtr_types = document.getElementById("userbar-bg-filtr-types");
			var types = userbar_bg_filtr_types.options[userbar_bg_filtr_types.selectedIndex].value;
			
			var userbar_bg_filtr_nations = document.getElementById("userbar-bg-filtr-nations");
			var nations = userbar_bg_filtr_nations.options[userbar_bg_filtr_nations.selectedIndex].value;
			
			if(types != 'all' && types != 'clan' && types != 'noclassification'){
				userbar_bg_filtr_nations.style.display = 'inline';
				
				for(i = 0; i < userbar_bg_filtr_nations.options.length; i++){
					var nation = userbar_bg_filtr_nations.options[i].value
					userbar_bg_filtr_nations.options[i].text = localizationText['filters-'+nation]+' ('+CountUserBar[types][nation]+')';
				}
			}else{
				userbar_bg_filtr_nations.style.display = 'none';
			}
			
			var check = true;
			for(var i = 0; i < UserBarBGData.length; i++){				
				var imgbgview = false;
				var img = UserBarBGData[i].split('_');
				if(img.length > 1 && types == 'clan'){
					for(var i_id = 1; i_id < img.length; i_id++){
						if(MembersArray[0]['clan'] == null){break;}
						if(img[i_id] == MembersArray[0]['clan']['clan_id']){
							imgbgview = true;
						}
					}
				}else{
					if(types == 'all'){
						if(img.length > 1 && MembersArray[0]['clan'] != null){
							for(var i_id = 1; i_id < img.length; i_id++){
								if(MembersArray[0]['clan'] == null){break;}
								if(img[i_id] == MembersArray[0]['clan']['clan_id']){
									imgbgview = true;
								}
							}
						}else{
							imgbgview = true;
						}
					}else if(types == 'noclassification'){	
						var shipsBG = UserBarBGData[i].split('-');
						if(shipsBG.length == 2){
							var noclassification = shipsBG[1];
							if(types == noclassification){
								imgbgview = true;
							}
						}
					}else if(types != 'clan'){
						var shipsBG = UserBarBGData[i].split('-');
						if(shipsBG.length == 3){
							var type = shipsBG[1];
							var nation = shipsBG[2];
							if(types == type && nations == nation){
								imgbgview = true;
							}
						}
					}
				}
				
				if(imgbgview){
					var checked = ''; if(check){checked = 'checked="checked"'; check = false;}
					html += '<input type="radio" name="userbar-bg" value="'+UserBarBGData[i]+'" '+checked+'> '+UserBarBGData[i]+'<br />';
					html += '<img src="'+WoWsStatInfoHref+'bg/'+UserBarBGData[i]+'.png" title="'+UserBarBGData[i]+'"/><br /><br />';
				}
			}
			
			var userbar_bg_content = document.getElementById("userbar-bg-content");
			userbar_bg_content.innerHTML = html;
		}
		function onSaveStatMember(){
			var today = new Date();
			
			var day = today.getDate();
			var d = ''; if(day < 10){d = '0'+day+'';}else{d = ''+day+'';}
			
			var month = today.getMonth() + 1;
			var m = ''; if(month < 10){m = '0'+month+'';}else{m = ''+month+'';}
			
			var year = today.getFullYear();
			var y = ''+year+'';
			
			StatPvPMemberArray[y+''+m+''+d] = MembersArray[0]['info']['statistics']['pvp'];
			
			var delKeys = Object.keys(StatPvPMemberArray);
			var delCount = Object.keys(StatPvPMemberArray).length;
			for(var i = 0; i < (delCount - 5); i++){
				delete StatPvPMemberArray[delKeys[i]];
			}
			
			setIndexedDB('StatPvPMemberArray', JSON.stringify(StatPvPMemberArray), viewStatPvPMemberArray, viewStatPvPMemberArray);
		}
		function viewStatPvPMemberArray(response){
			if(response != null){
				StatPvPMemberArray = jQ.parseJSON(response);
				
				if(Object.keys(StatPvPMemberArray).length < 2){
					return;
				}
				
				var tabContainer = null;
				var tab_container = document.getElementsByClassName('tab-container');
				for(var tc = 0; tc < tab_container.length; tc++){
					if(tab_container[tc].getAttribute('js-tab-cont-id') != 'pvp'){continue;}
					tabContainer = tab_container[tc];
				}
				
				if(tabContainer != null){
					var account_tab_background = tabContainer.getElementsByClassName('account-tab-background');
					for(var atb = 0; atb < account_tab_background.length; atb++){
						account_tab_background[atb].style.zIndex = '-1';
					}
					
					var account_tab = tabContainer.getElementsByClassName('account-tab-charts')[0];
					if(account_tab == null){
						var Keys = Object.keys(StatPvPMemberArray);
						var IndexLast = Keys.length - 1;
						var IndexOld = Keys.length - 2;
						
						var battles = StatPvPMemberArray[Keys[IndexLast]]['battles'] - StatPvPMemberArray[Keys[IndexOld]]['battles'];
						var wins_percents = StatPvPMemberArray[Keys[IndexLast]]['wins_percents'] - StatPvPMemberArray[Keys[IndexOld]]['wins_percents'];
						var avg_xp = StatPvPMemberArray[Keys[IndexLast]]['avg_xp'] - StatPvPMemberArray[Keys[IndexOld]]['avg_xp'];
						var avg_damage_dealt = StatPvPMemberArray[Keys[IndexLast]]['avg_damage_dealt'] - StatPvPMemberArray[Keys[IndexOld]]['avg_damage_dealt'];
						var kill_dead = StatPvPMemberArray[Keys[IndexLast]]['kill_dead'] - StatPvPMemberArray[Keys[IndexOld]]['kill_dead'];
						var avg_frags = StatPvPMemberArray[Keys[IndexLast]]['avg_frags'] - StatPvPMemberArray[Keys[IndexOld]]['avg_frags'];
						var avg_planes_killed = StatPvPMemberArray[Keys[IndexLast]]['avg_planes_killed'] - StatPvPMemberArray[Keys[IndexOld]]['avg_planes_killed'];
						var avg_capture_points = StatPvPMemberArray[Keys[IndexLast]]['avg_capture_points'] - StatPvPMemberArray[Keys[IndexOld]]['avg_capture_points'];
						var avg_dropped_capture_points = StatPvPMemberArray[Keys[IndexLast]]['avg_dropped_capture_points'] - StatPvPMemberArray[Keys[IndexOld]]['avg_dropped_capture_points'];
						var avg_battles_level = StatPvPMemberArray[Keys[IndexLast]]['avg_battles_level'] - StatPvPMemberArray[Keys[IndexOld]]['avg_battles_level'];
						var wr = StatPvPMemberArray[Keys[IndexLast]]['wr'] - StatPvPMemberArray[Keys[IndexOld]]['wr'];
						var wtr = StatPvPMemberArray[Keys[IndexLast]]['wtr'] - StatPvPMemberArray[Keys[IndexOld]]['wtr'];
						
						var _values = tabContainer.getElementsByClassName('_values')[0];
						var main_stat = _values.getElementsByTagName('div');
						main_stat[0].innerHTML += getHTMLDif(battles, 0);
						main_stat[1].innerHTML += getHTMLDif(wins_percents, 2);
						main_stat[2].innerHTML += getHTMLDif(avg_xp, 2);
						main_stat[3].innerHTML += getHTMLDif(avg_damage_dealt, 0);
						main_stat[4].innerHTML += getHTMLDif(kill_dead, 2);
						
						var account_battle_stats = tabContainer.getElementsByClassName('account-battle-stats')[0];
						if(account_battle_stats != null){
							var account_table = account_battle_stats.getElementsByClassName('account-table');
							
							account_table[1].rows[1].cells[1].innerHTML  += getHTMLDif(avg_xp, 2);
							account_table[1].rows[2].cells[1].innerHTML  += getHTMLDif(avg_damage_dealt, 2);
							account_table[1].rows[3].cells[1].innerHTML  += getHTMLDif(avg_frags, 2);
							account_table[1].rows[4].cells[1].innerHTML  += getHTMLDif(avg_planes_killed, 2);
							account_table[1].rows[5].cells[1].innerHTML  += getHTMLDif(avg_capture_points, 2);
							account_table[1].rows[6].cells[1].innerHTML  += getHTMLDif(avg_dropped_capture_points, 2);
						}
						
						var main_page_script_block = document.getElementById('main-page-script-block');
						if(main_page_script_block != null){
							var account_table = main_page_script_block.getElementsByClassName('account-table');
							
							account_table[0].rows[4].cells[1].innerHTML  += getHTMLDif(avg_battles_level, 2);
							account_table[0].rows[5].cells[1].innerHTML  += getHTMLDif(wr, 2);
							account_table[0].rows[6].cells[1].innerHTML  += getHTMLDif(wtr, 2);
						}
					
						var account_tab_detail_stats = tabContainer.getElementsByClassName('account-tab-detail-stats')[0];
						if(account_tab_detail_stats != null){
							var date = [];
							var value = [];
							var html_chart = '';
							var chart_value = ['wins_percents', 'avg_xp', 'avg_damage_dealt', 'wr', 'kill_dead', 'avg_battles_level'];
							
							for(var key in chart_value){
								var title = chart_value[key];
								html_chart += '' +
									'<div class="chart_div">' +
										'<h3 class="_title">'+localizationText['title_'+title]+'</h3>' +
										'<div id="chart_'+title+'" class="ct-chart"></div>' +
									'</div>' +
								'';
								
								value[title] = [];
							}
							
							account_tab_detail_stats.outerHTML += '' +
								'<div class="account-tab-charts tab-container" js-tab-cont-id="account-tab-charts-pvp">' +
									'<div class="account-main-stats">' +
										html_chart + 
									'</div>' +
								'</div>' +
							'';
							
							for(var key_stat in StatPvPMemberArray){
								var d = key_stat.substring(6, 8);
								var m = key_stat.substring(4, 6);
								var y = key_stat.substring(2, 4);
								date.push(d+'.'+m+'.'+y);
								
								for(var key in chart_value){
									var title = chart_value[key];
									value[title].push(parseFloat(StatPvPMemberArray[key_stat][title].toFixed(2)));
								}
							}
							
							for(var key in chart_value){
								var title = chart_value[key];
								viewChart(title, date, value[title]);
							}
							
							jQ(tabContainer).find('nav.account-tabs ul').append(''+
								'<li class="account-tab" js-tab="" js-tab-show="account-tab-charts-pvp">'+
									'<div class="_title">'+localizationText['charts']+'</div>'+
									'<div class="_active-feature">'+
										'<div class="_line"></div>'+
										'<div class="_shadow"></div>'+
									'</div>'+
								'</li>'+
							'');
							jQ(tabContainer).find('div.account-tabs-mobile ul').append(''+
								'<li class="_item" js-dropdown-item="" js-tab="" js-tab-show="account-tab-charts-pvp">'+localizationText['charts']+'</li>' +
							'');
						}
					}
				}

			}
		}
		function updateStatPvPMemberArray(response){
			if(response == null){
				StatPvPMemberArray = [];
			}else{
				StatPvPMemberArray = jQ.parseJSON(response);
			}
		}
		function viewChart(title, date, value){
			$('#chart_'+title).highcharts({
				title: {
					text: ' '
				},
				xAxis: {
					categories: date
				},
				yAxis: {
					title: {
						text: ' '
					}
				},
				series: [{
					name: ' ',
					data: value
				}]
			});
		}
		function getHTMLDif(value, fixed){
			var text = valueFormat(value.toFixed(fixed));
			var color = '#fff';
			if(value > 0){
				text = '+'+text;
				color = 'green';
			}else if(value < 0){
				color = 'red';
			}
		
			return ' <span style="color: '+color+';"><sup>'+text+'</sup></span>';
		}
		
		/* ===== ClanPage function ===== */
		function getSettingsClanPage(){
			var SettingsWoWsStatInfo = getLocalStorage('SettingsWoWsStatInfo', false);
			if(SettingsWoWsStatInfo == null){
				setLocalStorage('SettingsWoWsStatInfo', defaultSettingsWoWsStatInfo, false);
				return jQ.parseJSON(defaultSettingsWoWsStatInfo);
			}else{
				return jQ.parseJSON(SettingsWoWsStatInfo);
			}
		}
		function runSettingsClanPage(){
			var page_header = document.getElementsByClassName("page-header")[0];
			countColumn = (page_header.offsetWidth / 100).toFixed(0);
			
			var html = '';
			html += '<table style="font-size: 14px;">';
			html += '<caption><b>'+localizationText['table-setting-caption']+'</b> (<span id="table-setting-count-check">0</span>/'+countColumn+')</caption>';
			html += '<tr>';
			html += '<td>';
			
			var countCheck = 0;
			var tableNum = null;
			for(attr in SettingsWCI){
				if(tableNum != SettingsWCI[attr]['table'] && 'spacerow' != SettingsWCI[attr]['table'] && 'position' != SettingsWCI[attr]['table']){
					if(tableNum != null){
						html += '</table>';
						html += '</td>';
						html += '<td>';						
					}
					
					html += '<table id="table-settings-num'+SettingsWCI[attr]['table']+'" style="margin-right: 10px;">';
					
					tableNum = SettingsWCI[attr]['table']
				}
				
				html += '<tr>';
				html += '<td>';
				
				if('spacerow' != SettingsWCI[attr]['table'] && 'position' != SettingsWCI[attr]['table']){
					var checkbox = ''; if(SettingsWCI[attr]['check'] == 1){countCheck++; checkbox = 'checked';}
					
					html += '<input class="table-settings-row-input" type="checkbox" name="'+attr+'" tablenum="'+SettingsWCI[attr]['table']+'" '+checkbox+'>'+localizationText[attr];
				}else if('position' == SettingsWCI[attr]['table']){
					html += '' +
						'<input class="table-settings-row-input" type="hidden" name="'+attr+'" tablenum="'+SettingsWCI[attr]['table']+'">' +
						'<br />'+localizationText['table-setting-structure']+
						'<table>'+
							'<tr>'+
								'<td>'+
								'<select size="10" class="table-setting-structure" style="width: 180px; margin-top: 5px; height: 230px;">' + 
					'';
					
					var sort = SettingsWCI[attr]['sort'].split(',');
					for(var i = 0; i < sort.length; i++){
						html += '<option value="'+sort[i]+'">'+localizationText[sort[i]]+'</option>';
					}
					
					html += '' +
								'</select>'+
								'</td>'+
								'<td valign="center" style="padding-left: 2px;">'+
									'<br />'+
									'<br />'+
									'<br />'+
									'<br />'+
									'<button style="cursor:pointer;" class="table-setting-structure-up">&#9650;</button>'+
									'<br />'+
									'<button style="cursor:pointer;" class="table-setting-structure-down">&#9660;</button>'+
								'</td>'+
							'</tr>'+
						'</table>'+
					'';
				}else{
					html += '<input class="table-settings-row-input" type="hidden" name="'+attr+'" tablenum="'+SettingsWCI[attr]['table']+'">';
					html += '<div style="border-bottom: #000 solid 1px; box-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.07); margin-bottom: 5px;"> </div>';
				}
				
				html += '</td>';
				html += '</tr>';
			}
			
			html += '</td>';
			html += '</tr>';
			html += '</table>';
			html += '</td>';
			html += '</tr>';
			html += '</table>';
			
			html += '' +
				'<div align="right">' +
					'<button id="set-settings-default" class="button" style="display: block;">' +
						'<span class="button_wrapper">' +
							'<span style="padding: 5px;" class="button_body">' +
								'<span class="button_inner">'+localizationText['set-settings-default']+'</span>' +
							'</span>' +
						'</span>' +
					'</button>' +
				'</div>' +
			'';
			
			onShowMessage(
				localizationText['get-settings-button'], 
				html, 
				function(){onOkSettingsClanPage(); onCloseMessage();}, 
				localizationText['Ok'], 
				true
			);
			
			checkSettingsClanPage();
			
			jQ('.table-settings-row-input').click(function(){checkSettingsClanPage();});
			jQ(".table-setting-structure-up").click(function(){
				var table_setting_structure = document.getElementsByClassName("table-setting-structure")[0];
				if(table_setting_structure.selectedIndex == 0 || table_setting_structure.selectedIndex == -1){return;}
				var structure_table_selected_value = table_setting_structure.options[table_setting_structure.selectedIndex].value;
				var structure_table_selected_text = table_setting_structure.options[table_setting_structure.selectedIndex].text;
				for(i = 0; i < table_setting_structure.options.length; i++){
					if(table_setting_structure.options[i+1].value == structure_table_selected_value){
						table_setting_structure.options[i+1].value = table_setting_structure.options[i].value;
						table_setting_structure.options[i+1].text = table_setting_structure.options[i].text;
						table_setting_structure.options[i].value = structure_table_selected_value;
						table_setting_structure.options[i].text = structure_table_selected_text;
						table_setting_structure.selectedIndex = i;
						break;
					}
				}
			});
			jQ(".table-setting-structure-down").click(function(){
				var table_setting_structure = document.getElementsByClassName("table-setting-structure")[0];
				if(table_setting_structure.selectedIndex == (table_setting_structure.options.length - 1) || table_setting_structure.selectedIndex == -1){return;}
				var structure_table_selected_value = table_setting_structure.options[table_setting_structure.selectedIndex].value;
				var structure_table_selected_text = table_setting_structure.options[table_setting_structure.selectedIndex].text;
				for(i = 0; i < table_setting_structure.options.length; i++){
					if(table_setting_structure.options[i].value == structure_table_selected_value){
						table_setting_structure.options[i].value = table_setting_structure.options[i+1].value;
						table_setting_structure.options[i].text = table_setting_structure.options[i+1].text;
						table_setting_structure.options[i+1].value = structure_table_selected_value;
						table_setting_structure.options[i+1].text = structure_table_selected_text;
						table_setting_structure.selectedIndex = i + 1;
						break;
					}
				}
			});
			jQ('#set-settings-default').click(function(){
				window.localStorage.removeItem('SettingsWoWsStatInfo');
				setTimeout(function(){window.location.reload();}, 2000);
			});
		}
		function checkSettingsClanPage(){
			var countCheck = 0;
			var table_settings_row_input = document.getElementsByClassName("table-settings-row-input");
			var table_setting_structure = document.getElementsByClassName("table-setting-structure")[0];
			for(var i = 0; i < table_settings_row_input.length; i++){
				if(table_settings_row_input[i].checked){
					countCheck++;
					
					for(j = 0; j < table_setting_structure.options.length; j++){
						if(table_settings_row_input[i].name == table_setting_structure.options[j].value){
							break;
						}
						if(j == table_setting_structure.options.length - 1){
							var option = document.createElement("option");
							option.text = localizationText[table_settings_row_input[i].name];
							option.value = table_settings_row_input[i].name;
							table_setting_structure.add(option);							
						}
					}
					if(table_setting_structure.options.length == 0){
						var option = document.createElement("option");
						option.text = localizationText[table_settings_row_input[i].name];
						option.value = table_settings_row_input[i].name;
						table_setting_structure.add(option);
					}
				}else{
					for(j = 0; j < table_setting_structure.options.length; j++){
						if(table_settings_row_input[i].name == table_setting_structure.options[j].value){
							table_setting_structure.remove(j);
							break;
						}
					}
				}
			}
			
			jQ('#table-setting-count-check').html(countCheck);
		
			if(countCheck < countColumn){
				jQ('.table-settings-row-input').attr('disabled', false);
			}else{
				jQ('.table-settings-row-input').attr('disabled', true);
			}
			
			for(var i = 0; i < table_settings_row_input.length; i++){
				if(table_settings_row_input[i].checked){
					table_settings_row_input[i].disabled = false;
				}
			}
		}
		function onOkSettingsClanPage(){
			var getSettings = '';
			var table_settings_row_input = document.getElementsByClassName("table-settings-row-input");
			for(var i = 0; i < table_settings_row_input.length; i++){
				var input = table_settings_row_input[i];
				var attr = input.getAttribute('name');
				var table = input.getAttribute('tablenum');
				var check = 0; if(input.checked){check = 1;}
				
				if(table == 'position'){
					var sort = '';
					var table_setting_structure = document.getElementsByClassName("table-setting-structure")[0];
					for(j = 0; j < table_setting_structure.options.length; j++){
						sort += table_setting_structure.options[j].value+',';
					}
					sort = sort.substring(sort.length - 1, 0);
					getSettings += '"'+attr+'": {"table": "'+table+'", "check": '+check+', "sort": "'+sort+'"}';
				}else{
					getSettings += '"'+attr+'": {"table": "'+table+'", "check": '+check+'},';
				}
			}
			var saveSettingsClanPage = '{'+getSettings+'}';
			setLocalStorage('SettingsWoWsStatInfo', saveSettingsClanPage, false);
			
			SettingsWCI = getSettingsClanPage();
			
			if(loadMemberClan){
				var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
			
				var table_clan_statistic = document.getElementById('table-clan-statistic');
				table_clan_statistic.parentNode.removeChild(table_clan_statistic);
				
				var statistic_clan_button_text = document.getElementById('statistic-clan-button-text');
				statistic_clan_button_text.innerHTML = localizationText['statistic-clan-button-1'];
				
				if(clickRunCount % 2 == 1){
					clickRunCount++;
				}
				
				viewMainPageClan();
				
				window.pageYOffset = scrollTop;
				document.documentElement.scrollTop = scrollTop;
				document.body.scrollTop = scrollTop;
			}
		}
		function getClanMembersList(){
			var table = document.getElementsByClassName("rating-table__players")[0];
			
			if(table.rows.length <= 1){
				setTimeout(function(){getClanMembersList();}, 1000);
				return;
			}
			
			for(var i = 1; i < table.rows.length; i++){
				var row = table.rows[i];
				
				var account_id = row.getAttribute('data-account_id');
				if(account_id != null){
					var index = MembersArray.length;
					MembersArray[index] = [];
					MembersArray[index]['account_id'] = account_id;
					
					var player_name = row.getElementsByClassName("player_name")[0];
					var account_name = player_name.innerHTML.trim();
					MembersArray[index]['account_name'] = account_name;
					
					var epaulettes = row.getElementsByClassName('epaulettes')[0];
					var epaulettesSplit = epaulettes.getAttribute('class').split(' ');
					for(eS = 0; eS < epaulettesSplit.length; eS++){
						if(epaulettesSplit[eS].indexOf('js-tooltip-id_js-role_') > -1){
							var role = epaulettesSplit[eS].replace('js-tooltip-id_js-role_', '');
							role = role.replace('-tooltip', '');
							
							MembersArray[index]['role'] = role;
							MembersArray[index]['role_i18n'] = getRoleText(role);
							MembersArray[index]['role_sort_num'] = getRoleSortNum(role);
							
							break;
						}
					}
					
					var colNum = (row.cells.length - 2) - 1;
					var clan_days = row.cells[colNum].innerHTML.trim();
					MembersArray[index]['clan_days'] = clan_days;
				}
			}
			
			if(MembersArray.length > 0){
				viewClanMemberHistory();
			}		
		}
		function viewClanMemberHistory(){
			var oldClanMemberSave = getLocalStorage('ClanMemberSave', true);
			
			var oldClanChangeSave = getLocalStorage('ClanChangeSave', true);
			if(oldClanChangeSave == null){oldClanChangeSave = '';}
			
			var stringJSON = '';
			for(var i = 0; i < MembersArray.length; i++){
				stringJSON += '"'+MembersArray[i]['account_id']+'":{"account_id":'+MembersArray[i]['account_id']+',"account_name":"'+MembersArray[i]['account_name']+'","role":"'+MembersArray[i]['role']+'"},';
			}
			stringJSON = stringJSON.substring(stringJSON.length - 1, 0);
			var newClanMemberSave = '{"members": {'+stringJSON+'}}';
			
			var newClanChangeSave = '';
			
			if(oldClanMemberSave != null){
				var oldClanMemberArr = jQ.parseJSON(oldClanMemberSave);
				var newClanMemberArr = jQ.parseJSON(newClanMemberSave);
				
				for(id in oldClanMemberArr['members']){
					if(newClanMemberArr['members'][id] === undefined){
						oldClanChangeSave += '1:'+oldClanMemberArr['members'][id]['account_id']+':'+oldClanMemberArr['members'][id]['account_name']+':null:null;';
					}else{
						if(newClanMemberArr['members'][id]['role'] != oldClanMemberArr['members'][id]['role']){
							oldClanChangeSave += '3:'+oldClanMemberArr['members'][id]['account_id']+':'+oldClanMemberArr['members'][id]['account_name']+':'+oldClanMemberArr['members'][id]['role']+':'+newClanMemberArr['members'][id]['role']+';';
						}
						if(newClanMemberArr['members'][id]['account_name'] != oldClanMemberArr['members'][id]['account_name']){
							oldClanChangeSave += '4:'+oldClanMemberArr['members'][id]['account_id']+':'+oldClanMemberArr['members'][id]['account_name']+':'+oldClanMemberArr['members'][id]['account_name']+':'+newClanMemberArr['members'][id]['account_name']+';';
						}
					}
				}
				
				for(id in newClanMemberArr['members']){
					if(oldClanMemberArr['members'][id] === undefined){
						oldClanChangeSave += '2:'+newClanMemberArr['members'][id]['account_id']+':'+newClanMemberArr['members'][id]['account_name']+':null:null;';
						if(newClanMemberArr['members'][id]['role'] != 'recruit'){
							oldClanChangeSave += '3:'+newClanMemberArr['members'][id]['account_id']+':'+newClanMemberArr['members'][id]['account_name']+':recruit:'+newClanMemberArr['members'][id]['role']+';';
						}
					}
				}
			}
			
			var html = '<div style="overflow: auto; height: 150px;"><table style="border-collapse: separate; font-size: 13px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);" cellspacing="0" cellpadding="0"><tbody>';
			var clan_member_history = document.getElementsByClassName("clan-member-history")[0];
			
			if(oldClanChangeSave != ''){
				var arrOldChangeClan = oldClanChangeSave.split(';');
				if(arrOldChangeClan.length > 50){
					var deleteCountLine = arrOldChangeClan.length - 50;
					for(var i = 0; i < deleteCountLine; i++){
						arrOldChangeClan.splice(0, 1);
					}
					for(var i = 0; i < arrOldChangeClan.length; i++){
						if(arrOldChangeClan[i] == ''){continue;}
						newClanChangeSave += arrOldChangeClan[i]+';';
					}
				}else{
					newClanChangeSave = oldClanChangeSave;
				}
				
				var arrNewChangeClan = newClanChangeSave.split(';');
				for(var i = (arrNewChangeClan.length - 1); i >= 0; i--){
					var arrChange = arrNewChangeClan[i].split(':');
					var type = arrChange[0];
					var mId = arrChange[1];
					var mName = arrChange[2];
					var mOld = arrChange[3];
					var mNew = arrChange[4];
					
					if(type == '1'){
						var text = localizationText['member-history-leave'];
						text = text.replace('%NAME%','<a target="_blank" href="http://worldofwarships.'+realm_host+'/community/accounts/'+mId+'/">'+mName+'</a>');
						html +=  '<tr>'+				
							'<td class="table-default_cell" align="left" style="padding: 0px;">'+
								' <font color="red">'+text+'</font>'+
							'</td>'+
						'</tr>';						
					}else if(type == '2'){
						var text = localizationText['member-history-join'];
						text = text.replace('%NAME%','<a target="_blank" href="http://worldofwarships.'+realm_host+'/community/accounts/'+mId+'/">'+mName+'</a>');					
						html +=  '<tr>'+				
							'<td class="table-default_cell" align="left" style="padding: 0px;">'+
								' <font color="green">'+text+'</font>'+
							'</td>'+
						'</tr>';						
					}else if(type == '3'){
						var text = localizationText['member-history-rerole'];
						text = text.replace('%NAME%','<a target="_blank" href="http://worldofwarships.'+realm_host+'/community/accounts/'+mId+'/">'+mName+'</a>');					
						text = text.replace('%OLDROLE%',getRoleText(mOld));					
						text = text.replace('%NEWROLE%',getRoleText(mNew));					
						html +=  '<tr>'+				
							'<td class="table-default_cell" align="left" style="padding: 0px;">'+
								text+
							'</td>'+
						'</tr>';					
					}else if(type == '4'){
						var text = localizationText['member-history-rename'];
						text = text.replace('%OLDNAME%',mOld);						
						text = text.replace('%NEWNAME%','<a target="_blank" href="http://worldofwarships.'+realm_host+'/community/accounts/'+mId+'/">'+mNew+'</a>');						
						html +=  '<tr>'+				
							'<td class="table-default_cell" align="left" style="padding: 0px;">'+
								text+
							'</td>'+
						'</tr>';					
					}
				}
			}else{
				html += '' +
					'<tr>' +
						'<td class="table-default_cell" style="padding: 0px;">' +
							localizationText['member-history-notchange'] +
						'</td>' +
					'</tr>' +
				'';
			}
			
			html += '</tbody></table></div>';
			html += '' +
				'<div align="right" style="border-top: 1px solid rgba(255, 255, 255, 0.1);">' +
					'<br />' +
					'<button id="run-history-clear" class="button" style="display: block;">' +
						'<span class="button_wrapper">' +
							'<span style="padding: 5px;" class="button_body">' +
								'<span class="button_inner">'+localizationText['member-history-clear']+'</span>' +
							'</span>' +
						'</span>' +
					'</button>' +
				'</div>' +
			'';
			clan_member_history.innerHTML = html;
			
			jQ('#run-history-clear').click(function(){
				setLocalStorage('ClanChangeSave', '', true);
				viewClanMemberHistory();
			});
			
			setLocalStorage('ClanMemberSave', newClanMemberSave, true);
			setLocalStorage('ClanChangeSave', newClanChangeSave, true);
		}		
		var clickRunCount = 0;
		var loadMemberClan = false;
		var loadTimeStart = 0;
		var countMembers = 0;
		var loadOnePercent = 0;
		var loadMemberCount = 0;
		function runGetStatisticClan(){
			if(clickRunCount % 2 == 0){
				var statistic_clan_button_text = document.getElementById('statistic-clan-button-text');
				statistic_clan_button_text.innerHTML = localizationText['statistic-clan-button-1'];
				
				if(!loadMemberClan){
					var get_clan_statistic_block = document.getElementById('get-clan-statistic-block');
					get_clan_statistic_block.style.display = 'none';
					
					var statistic_clan_load_icon = document.getElementById('statistic-clan-load-icon');
					statistic_clan_load_icon.style.display = 'block';
					
					var statistic_clan_load_text = document.getElementById('statistic-clan-load-text');
					statistic_clan_load_text.style.display = 'block';
					statistic_clan_load_text.innerHTML = localizationText['statistic-clan-load-text']+' 0%'+localizationText['statistic-load-text-lost']+' 0 '+localizationText['statistic-load-text-min']+' 0 '+localizationText['statistic-load-text-sec'];
					
					if(Encyclopedia == null){
						getJson(WOWSAPI+'encyclopedia/ships/?application_id='+application_id+'&fields=name,images,tier,nation,is_premium,images,type', doneEncyclopedia, errorEncyclopedia);
					}
					
					loadTimeStart = new Date().getTime();
					countMembers = MembersArray.length;
					loadOnePercent = 100 / countMembers;
					for(var i = 0; i < MembersArray.length; i++){
						getJson(WOWSAPI+'account/info/?application_id='+application_id+'&extra=statistics.pve,statistics.pvp_solo,statistics.pvp_div2,statistics.pvp_div3&account_id='+MembersArray[i]['account_id']+'&index='+i+'&type=clan', doneAccountInfo, errorAccountInfo);
					}
				}else{
					jQ('.timeframe').hide();
					jQ('#js-clan-statistics').hide();
					jQ('#js-playerslist-table').hide();
					jQ('#js-players-management').hide();
			
					jQ('#table-clan-statistic').show();
				}
			}else if(clickRunCount % 2 == 1){
				var statistic_clan_button_text = document.getElementById('statistic-clan-button-text');
				statistic_clan_button_text.innerHTML = localizationText['statistic-clan-button-0'];
				
				jQ('.timeframe').show();
				jQ('#js-clan-statistics').show();
				jQ('#js-playerslist-table').show();
				jQ('#js-players-management').show();
				
				jQ('#table-clan-statistic').hide();
			}
			
			clickRunCount++;
		}
		function viewMainPageClan(){
			if(loadMemberCount != countMembers){
				var loadPercent = (loadMemberCount * loadOnePercent).toFixed(0);
				
				var loadTime = (((new Date().getTime() - loadTimeStart) / loadMemberCount) * countMembers) + loadTimeStart;
				var lostTime = loadTime - new Date().getTime();
				var ss = (lostTime / 1000 % 60).toFixed(0);
				var mm = parseInt((lostTime / (60 * 1000) % 60), 10);
				
				var statistic_clan_load_text = document.getElementById('statistic-clan-load-text');
				statistic_clan_load_text.innerHTML = localizationText['statistic-clan-load-text']+' '+loadPercent+'%'+
				localizationText['statistic-load-text-lost']+
				' '+mm+' '+localizationText['statistic-load-text-min']+' '+ss+' '+localizationText['statistic-load-text-sec'];
				
				return;
			}
			
			loadMemberClan = true;
			
			var statistic_clan_load_icon = document.getElementById('statistic-clan-load-icon');
			statistic_clan_load_icon.style.display = 'none';
			
			var statistic_clan_load_text = document.getElementById('statistic-clan-load-text');
			statistic_clan_load_text.style.display = 'none';
			
			var get_clan_statistic_block = document.getElementById('get-clan-statistic-block');
			get_clan_statistic_block.style.display = 'block';
			
			jQ('.timeframe').hide();
			jQ('#js-clan-statistics').hide();
			jQ('#js-playerslist-table').hide();
			jQ('#js-players-management').hide();
			
			var page_header = document.getElementsByClassName("page-header")[0];
			var tableSizeWidth = page_header.offsetWidth;
			
			var table = document.createElement('table');
			table.setAttribute('id', 'table-clan-statistic');
			table.setAttribute('style', 'border-collapse: separate; font-size: 13px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); margin-top: 20px; margin-left: -40px; width: '+tableSizeWidth+'px;');
			
			var thead = document.createElement('thead');
			var tr_head = document.createElement('tr');
			var th = document.createElement('th');
			th.setAttribute('class', 'table-default_heading');
			th.innerHTML = '<span id="account_name" sort="none" class="table-clan-statistic-sorter table-sorter" style="cursor: pointer;">' +
				localizationText['account_name'] +
				'<span class="table-sorter_arrow"></span>' +
			'</span>'; 
			tr_head.appendChild(th);
			
			var column = SettingsWCI['view_table']['sort'].split(',');
			for(var i = 0; i < column.length; i++){          
				var th = document.createElement('th');
				th.setAttribute('class', 'table-default_heading');
				th.innerHTML = '<span id="'+column[i]+'" sort="none" class="table-clan-statistic-sorter table-sorter" style="cursor: pointer;">' +
					localizationText[column[i]] +
					'<span class="table-sorter_arrow"></span>' +
				'</span>';
				tr_head.appendChild(th);
			}
			thead.appendChild(tr_head);
			table.appendChild(thead);
			
			var tbody = document.createElement('tbody');
			for(var index = 0; index < MembersArray.length; index++){			
				if(!calcStat(index)){
					console.log('Error calcStat '+MembersArray[index]['account_id']);
				}
			
				var tr = document.createElement('tr');
				var td = document.createElement('td');
				td.setAttribute('class', 'table-default_cell');
				td.innerHTML = (index + 1)+'.&nbsp;<a class="user-link" target="_blank" href="http://worldofwarships.'+realm+'/community/accounts/'+MembersArray[index]['account_id']+'-/">' +
					MembersArray[index]['account_name'] + 
				'</a>';
				tr.appendChild(td);
				
				for(var i = 0; i < column.length; i++){
					var td = document.createElement('td');
					td.setAttribute('class', 'table-default_cell');
					td.innerHTML = getStatisticClanMember(index, column[i], td);
					tr.appendChild(td);
				}
				tbody.appendChild(tr);
			}
			table.appendChild(tbody);
			
			var ClanPageElement = document.getElementsByClassName('rating')[0];
			ClanPageElement.appendChild(table);
			
			jQ('.table-clan-statistic-sorter').click(function(){sortStatisticClan(this);});
		}
		function getStatisticClanMember(index, attr, td){
			var layer = attr.split('\.');
			var value = null;
			for(var i = 0; i < layer.length; i++){
				if(value == null){
					value = MembersArray[index][layer[i]];
				}else{
					value = value[layer[i]];
				}
			}
			
			if(attr.indexOf("last_battle_time") > -1 || attr.indexOf("logout_at") > -1){
				return TimeToDate(value);
			}else if(attr.indexOf("role_i18n") > -1){
				return value;
			}
			
			if(attr.indexOf(".avg_") > -1 || attr.indexOf("_percents") > -1 || attr.indexOf(".kill_dead") > -1 || attr.indexOf(".wr") > -1 || attr.indexOf(".wtr") > -1){
				console.log(attr+' '+value);
				value = (value).toFixed(2);
			}
			
			var value_html = '';
			if(attr.indexOf(".avg_") > -1 || attr.indexOf("_percents") > -1 || (attr.indexOf(".max_") > -1 && attr.indexOf(".max_xp") == -1) 
				|| attr.indexOf(".battles") > -1 || attr.indexOf(".kill_dead") > -1 || attr.indexOf(".wr") > -1 || attr.indexOf(".wtr") > -1){
				value_html = '<font color="'+findColorASC(value, layer[layer.length - 1], 'main')+'">'+valueFormat(value)+'</font>';
				td.setAttribute('style', 'white-space: nowrap;');
			}else{
				value_html = valueFormat(value);
				td.setAttribute('style', 'white-space: nowrap;');
			}
			
			return value_html;
		}
		function sortStatisticClan(elementSort){
			var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
			
			var attr = elementSort.getAttribute('id');
			var sort = elementSort.getAttribute('sort');
			var table_clan_statistic = document.getElementById('table-clan-statistic');
			table_clan_statistic.parentNode.removeChild(table_clan_statistic);
			
			if(sort === 'desc' || sort === 'none'){
				MembersArray.sort(ASC(attr));
			}else{
				MembersArray.sort(DESC(attr));
			}
			
			viewMainPageClan();
			
			window.pageYOffset = scrollTop;
			document.documentElement.scrollTop = scrollTop;
			document.body.scrollTop = scrollTop;
			
			var table_clan_statistic_sorter = document.getElementById(attr);
			if(sort === 'desc' || sort === 'none'){
				table_clan_statistic_sorter.setAttribute('sort', 'asc');
				table_clan_statistic_sorter.setAttribute('class', 'table-clan-statistic-sorter table-sorter table-sorter__up');
			}else{
				table_clan_statistic_sorter.setAttribute('sort', 'desc');
				table_clan_statistic_sorter.setAttribute('class', 'table-clan-statistic-sorter table-sorter table-sorter__down');
			}
		}
		
		/* ===== UserScript function ===== */
		function checkJson(){
			var date = new Date();
			var d = date.getDate();
			if(d < 10){d = '0'+d;}
			var m = date.getMonth(); m++;
			if(m < 10){m = '0'+m;}
			var y = date.getFullYear();
			var numJson = y+''+m+''+d;
			
			if(getLocalStorage('numJson', false) < numJson){
				setLocalStorage('numJson', numJson, false);
				getJson(WoWsStatInfoHref+'get/color.php?'+Math.floor(Math.random()*100000001), doneColorStat, errorColorStat);
				getJson(WoWsStatInfoHref+'get/expships.php?'+Math.floor(Math.random()*100000001), doneExpShips, errorExpShips);
				getJson(WoWsStatInfoHref+'get/expwtr.php?'+Math.floor(Math.random()*100000001), doneExpWTR, errorExpWTR);
			}else{
				getIndexedDB('ColorStat', updateColorStat, updateColorStat);
				getIndexedDB('ExpShips', updateExpShips, updateExpShips);
				getIndexedDB('ExpWTR', updateExpWTR, updateExpWTR);
			}
		}
		function doneColorStat(url, response){
			setIndexedDB('ColorStat', response, updateColorStat, updateColorStat);
		}
		function errorColorStat(url){}
		function doneExpShips(url, response){
			setIndexedDB('ExpShips', response, updateExpShips, updateExpShips);
		}
		function doneExpWTR(url, response){
			setIndexedDB('ExpWTR', response, updateExpWTR, updateExpWTR);
		}
		function updateColorStat(response){
			if(response == null){
				colorStat = jQ.parseJSON('{"wtr":["795.99","991.68","1138.34","1384.65","1577.72","99999.00"],"max_frags_battle":[4,5,6,7,8,99],"avg_planes_killed":["0.22","0.94","1.81","3.74","6.09","99.00"],"max_damage_dealt":[80482,108870,129594,163436,193332,9999999],"wr":["609.71","958.30","1246.05","1792.43","2281.91","99999.00"],"kill_dead":["0.61","0.96","1.28","1.98","2.76","99.00"],"avg_capture_points":["0.18","0.53","0.89","1.63","2.39","99.00"],"survived_battles_percents":["16.58","25.96","33.26","45.04","53.86","100.00"],"max_xp":[1626,2187,2759,3774,4514,99999],"avg_damage_dealt":["15628.23","22222.94","27489.60","37362.57","47101.21","999999.00"],"avg_dropped_capture_points":["1.17","3.72","5.47","8.42","11.00","999.00"],"max_planes_killed":[7,21,31,48,60,999],"avg_xp":["463.42","626.87","782.57","1122.40","1419.22","99999.00"],"avg_frags":["0.50","0.71","0.87","1.15","1.39","99.00"],"wins_percents":["44.32","48.30","51.15","55.81","59.94","100.00"],"battles":[238,377,580,1087,1673,99999]}');
			}else{
				colorStat = response;
			}
		}
		function updateExpShips(response){
			if(response == null){
				ExpShips = jQ.parseJSON('{"4292818736":{"expDamage":41253.93,"expFrags":0.67,"expCapturePoints":0.23,"expPlanesKilled":2.27,"expDroppedCapturePoints":0.74},"4293834544":{"expDamage":8107.63,"expFrags":0.67,"expCapturePoints":0.12,"expPlanesKilled":0.01,"expDroppedCapturePoints":0.34},"4287542992":{"expDamage":29141.63,"expFrags":0.79,"expCapturePoints":0.58,"expPlanesKilled":2.05,"expDroppedCapturePoints":2.8},"4188976592":{"expDamage":9082.31,"expFrags":0.74,"expCapturePoints":0.15,"expPlanesKilled":0.01,"expDroppedCapturePoints":0.43},"4288558800":{"expDamage":23320.71,"expFrags":0.69,"expCapturePoints":0.76,"expPlanesKilled":0.55,"expDroppedCapturePoints":1.14},"4289607376":{"expDamage":20313.14,"expFrags":0.64,"expCapturePoints":0.88,"expPlanesKilled":0.57,"expDroppedCapturePoints":0.95},"4277057520":{"expDamage":33522.04,"expFrags":0.62,"expCapturePoints":0.6,"expPlanesKilled":5.26,"expDroppedCapturePoints":3.11},"4276041424":{"expDamage":76656.39,"expFrags":0.9,"expCapturePoints":0.29,"expPlanesKilled":6.39,"expDroppedCapturePoints":1.61},"4180555216":{"expDamage":34411.72,"expFrags":1.13,"expCapturePoints":0.09,"expPlanesKilled":0.33,"expDroppedCapturePoints":0.06},"4264441840":{"expDamage":15019.3,"expFrags":0.49,"expCapturePoints":0.89,"expPlanesKilled":0.28,"expDroppedCapturePoints":3.43},"4266538992":{"expDamage":11968.18,"expFrags":0.54,"expCapturePoints":0.46,"expPlanesKilled":0.02,"expDroppedCapturePoints":2.66},"4293867504":{"expDamage":17373.89,"expFrags":0.61,"expCapturePoints":1.01,"expPlanesKilled":0.03,"expDroppedCapturePoints":5.59},"4183734064":{"expDamage":31528.13,"expFrags":0.96,"expCapturePoints":0.07,"expPlanesKilled":1.05,"expDroppedCapturePoints":0.19},"4290655952":{"expDamage":26938.28,"expFrags":0.96,"expCapturePoints":0.87,"expPlanesKilled":0.13,"expDroppedCapturePoints":1.47},"4291737040":{"expDamage":30367.78,"expFrags":0.92,"expCapturePoints":0.65,"expPlanesKilled":1.32,"expDroppedCapturePoints":5.13},"4277122768":{"expDamage":87112.85,"expFrags":1.28,"expCapturePoints":0.19,"expPlanesKilled":20.26,"expDroppedCapturePoints":4.11},"4286527184":{"expDamage":24637.32,"expFrags":0.73,"expCapturePoints":0.76,"expPlanesKilled":0.17,"expDroppedCapturePoints":3.98},"4259231440":{"expDamage":67761.05,"expFrags":1.05,"expCapturePoints":0.45,"expPlanesKilled":3.7,"expDroppedCapturePoints":2.62},"4293866960":{"expDamage":35775.6,"expFrags":1.09,"expCapturePoints":0.57,"expPlanesKilled":0.04,"expDroppedCapturePoints":1.11},"4293834736":{"expDamage":9280.59,"expFrags":0.59,"expCapturePoints":0.66,"expPlanesKilled":0.01,"expDroppedCapturePoints":7.07},"4289640144":{"expDamage":20041.76,"expFrags":0.58,"expCapturePoints":0.52,"expPlanesKilled":0.38,"expDroppedCapturePoints":2.9},"4267620048":{"expDamage":28367.1,"expFrags":1.06,"expCapturePoints":1.05,"expPlanesKilled":1.0,"expDroppedCapturePoints":6.2},"4280170480":{"expDamage":19859.16,"expFrags":0.76,"expCapturePoints":0.51,"expPlanesKilled":0.4,"expDroppedCapturePoints":1.97},"4286461936":{"expDamage":24706.51,"expFrags":0.76,"expCapturePoints":0.6,"expPlanesKilled":0.4,"expDroppedCapturePoints":1.11},"4288657392":{"expDamage":35355.04,"expFrags":0.69,"expCapturePoints":0.29,"expPlanesKilled":11.78,"expDroppedCapturePoints":2.32},"4256085712":{"expDamage":11457.81,"expFrags":0.83,"expCapturePoints":0.95,"expPlanesKilled":0.01,"expDroppedCapturePoints":8.69},"4259264496":{"expDamage":37843.29,"expFrags":0.89,"expCapturePoints":0.54,"expPlanesKilled":0.99,"expDroppedCapturePoints":2.28},"4248745968":{"expDamage":33736.1,"expFrags":1.04,"expCapturePoints":0.82,"expPlanesKilled":0.26,"expDroppedCapturePoints":5.73},"4258182864":{"expDamage":13165.03,"expFrags":0.59,"expCapturePoints":0.72,"expPlanesKilled":0.01,"expDroppedCapturePoints":7.11},"4185831216":{"expDamage":15167.17,"expFrags":0.55,"expCapturePoints":0.37,"expPlanesKilled":0.04,"expDroppedCapturePoints":0.91},"4291737584":{"expDamage":12809.77,"expFrags":0.72,"expCapturePoints":1.13,"expPlanesKilled":0.01,"expDroppedCapturePoints":10.0},"4286527472":{"expDamage":40810.63,"expFrags":0.77,"expCapturePoints":0.38,"expPlanesKilled":1.92,"expDroppedCapturePoints":1.52},"4282267344":{"expDamage":50579.96,"expFrags":0.81,"expCapturePoints":0.82,"expPlanesKilled":0.49,"expDroppedCapturePoints":0.98},"4292818896":{"expDamage":32770.02,"expFrags":0.76,"expCapturePoints":0.95,"expPlanesKilled":2.12,"expDroppedCapturePoints":4.11},"4280203248":{"expDamage":32543.6,"expFrags":0.66,"expCapturePoints":0.56,"expPlanesKilled":4.08,"expDroppedCapturePoints":2.51},"4293801680":{"expDamage":11784.77,"expFrags":0.9,"expCapturePoints":0.35,"expPlanesKilled":0.01,"expDroppedCapturePoints":0.82},"4247697392":{"expDamage":38935.05,"expFrags":1.29,"expCapturePoints":1.15,"expPlanesKilled":0.25,"expDroppedCapturePoints":9.14},"4285445840":{"expDamage":42794.18,"expFrags":0.91,"expCapturePoints":0.42,"expPlanesKilled":2.39,"expDroppedCapturePoints":2.32},"4279154384":{"expDamage":17103.56,"expFrags":0.67,"expCapturePoints":0.62,"expPlanesKilled":0.04,"expDroppedCapturePoints":5.38},"4293867216":{"expDamage":18228.07,"expFrags":0.7,"expCapturePoints":1.16,"expPlanesKilled":0.06,"expDroppedCapturePoints":5.02},"4283381456":{"expDamage":13912.61,"expFrags":0.75,"expCapturePoints":1.28,"expPlanesKilled":0.01,"expDroppedCapturePoints":4.15},"4290754544":{"expDamage":21535.84,"expFrags":0.47,"expCapturePoints":0.11,"expPlanesKilled":10.03,"expDroppedCapturePoints":1.07},"4282365648":{"expDamage":58552.47,"expFrags":1.03,"expCapturePoints":0.21,"expPlanesKilled":14.47,"expDroppedCapturePoints":3.52},"4286494416":{"expDamage":37589.01,"expFrags":0.89,"expCapturePoints":0.51,"expPlanesKilled":2.39,"expDroppedCapturePoints":2.51},"4288624624":{"expDamage":27886.25,"expFrags":0.7,"expCapturePoints":0.61,"expPlanesKilled":0.62,"expDroppedCapturePoints":2.99},"4291704528":{"expDamage":20966.84,"expFrags":0.81,"expCapturePoints":0.8,"expPlanesKilled":0.09,"expDroppedCapturePoints":1.8},"4282300400":{"expDamage":26363.65,"expFrags":0.62,"expCapturePoints":0.51,"expPlanesKilled":2.63,"expDroppedCapturePoints":2.5},"4183700944":{"expDamage":25303.15,"expFrags":0.93,"expCapturePoints":0.21,"expPlanesKilled":0.24,"expDroppedCapturePoints":0.13},"4272830448":{"expDamage":35877.85,"expFrags":0.89,"expCapturePoints":0.94,"expPlanesKilled":0.9,"expDroppedCapturePoints":1.49},"4269684432":{"expDamage":14878.84,"expFrags":0.68,"expCapturePoints":0.6,"expPlanesKilled":0.02,"expDroppedCapturePoints":2.28},"4290689008":{"expDamage":19863.31,"expFrags":0.75,"expCapturePoints":0.95,"expPlanesKilled":0.01,"expDroppedCapturePoints":8.12},"4293834192":{"expDamage":20309.44,"expFrags":0.79,"expCapturePoints":0.9,"expPlanesKilled":0.02,"expDroppedCapturePoints":7.27},"4284430032":{"expDamage":44630.54,"expFrags":0.83,"expCapturePoints":0.37,"expPlanesKilled":1.38,"expDroppedCapturePoints":1.37},"4292786160":{"expDamage":10188.56,"expFrags":0.45,"expCapturePoints":0.68,"expPlanesKilled":0.01,"expDroppedCapturePoints":7.32},"4279220208":{"expDamage":114841.99,"expFrags":1.7,"expCapturePoints":0.19,"expPlanesKilled":23.7,"expDroppedCapturePoints":2.63},"4288559088":{"expDamage":20807.33,"expFrags":0.78,"expCapturePoints":0.62,"expPlanesKilled":0.45,"expDroppedCapturePoints":1.2},"4288624336":{"expDamage":41307.92,"expFrags":0.94,"expCapturePoints":0.51,"expPlanesKilled":0.98,"expDroppedCapturePoints":2.12},"4282365936":{"expDamage":50758.69,"expFrags":0.8,"expCapturePoints":0.19,"expPlanesKilled":27.87,"expDroppedCapturePoints":1.68},"4289607664":{"expDamage":19327.96,"expFrags":0.73,"expCapturePoints":0.6,"expPlanesKilled":0.52,"expDroppedCapturePoints":1.58},"4281284304":{"expDamage":54088.26,"expFrags":0.9,"expCapturePoints":0.31,"expPlanesKilled":3.38,"expDroppedCapturePoints":1.1},"4285511376":{"expDamage":46031.4,"expFrags":0.98,"expCapturePoints":0.2,"expPlanesKilled":8.6,"expDroppedCapturePoints":3.52},"4293801424":{"expDamage":22831.14,"expFrags":0.82,"expCapturePoints":0.98,"expPlanesKilled":0.35,"expDroppedCapturePoints":4.16},"4274927600":{"expDamage":18131.37,"expFrags":0.74,"expCapturePoints":0.62,"expPlanesKilled":0.03,"expDroppedCapturePoints":2.33},"4288657104":{"expDamage":43891.5,"expFrags":1.01,"expCapturePoints":0.26,"expPlanesKilled":7.02,"expDroppedCapturePoints":2.86},"4292753392":{"expDamage":9707.9,"expFrags":0.56,"expCapturePoints":0.5,"expPlanesKilled":0.01,"expDroppedCapturePoints":3.63},"4273911792":{"expDamage":50014.05,"expFrags":0.83,"expCapturePoints":0.36,"expPlanesKilled":4.27,"expDroppedCapturePoints":3.36},"4276041712":{"expDamage":61782.48,"expFrags":0.92,"expCapturePoints":0.44,"expPlanesKilled":6.45,"expDroppedCapturePoints":1.8},"4282333168":{"expDamage":52105.09,"expFrags":0.86,"expCapturePoints":0.4,"expPlanesKilled":5.73,"expDroppedCapturePoints":1.4},"4186846672":{"expDamage":11800.18,"expFrags":0.68,"expCapturePoints":0.26,"expPlanesKilled":0.01,"expDroppedCapturePoints":0.42},"4292753104":{"expDamage":12006.74,"expFrags":0.69,"expCapturePoints":0.66,"expPlanesKilled":0.01,"expDroppedCapturePoints":3.09},"4269717488":{"expDamage":17973.84,"expFrags":0.55,"expCapturePoints":0.5,"expPlanesKilled":0.13,"expDroppedCapturePoints":4.66},"4292851408":{"expDamage":36548.43,"expFrags":0.9,"expCapturePoints":0.3,"expPlanesKilled":6.16,"expDroppedCapturePoints":1.89},"4186879792":{"expDamage":16426.53,"expFrags":0.8,"expCapturePoints":0.41,"expPlanesKilled":0.01,"expDroppedCapturePoints":1.05},"4184782640":{"expDamage":31413.84,"expFrags":1.01,"expCapturePoints":0.18,"expPlanesKilled":0.27,"expDroppedCapturePoints":0.7},"4292785616":{"expDamage":14271.23,"expFrags":0.7,"expCapturePoints":0.79,"expPlanesKilled":0.01,"expDroppedCapturePoints":3.34},"4283414224":{"expDamage":54782.77,"expFrags":1.09,"expCapturePoints":0.24,"expPlanesKilled":14.08,"expDroppedCapturePoints":3.81},"4281284592":{"expDamage":26740.84,"expFrags":0.77,"expCapturePoints":1.08,"expPlanesKilled":0.01,"expDroppedCapturePoints":5.88},"4284463088":{"expDamage":48138.29,"expFrags":0.88,"expCapturePoints":0.16,"expPlanesKilled":16.71,"expDroppedCapturePoints":2.35},"4277090288":{"expDamage":72719.28,"expFrags":0.93,"expCapturePoints":0.34,"expPlanesKilled":7.99,"expDroppedCapturePoints":1.97},"4288591856":{"expDamage":23929.73,"expFrags":0.7,"expCapturePoints":0.68,"expPlanesKilled":3.01,"expDroppedCapturePoints":3.82},"4287543280":{"expDamage":31965.55,"expFrags":0.92,"expCapturePoints":0.69,"expPlanesKilled":3.16,"expDroppedCapturePoints":4.18},"3769513264":{"expDamage":31330.08,"expFrags":1.12,"expCapturePoints":0.39,"expPlanesKilled":0.37,"expDroppedCapturePoints":0.06},"4290721776":{"expDamage":26296.36,"expFrags":0.74,"expCapturePoints":0.91,"expPlanesKilled":0.45,"expDroppedCapturePoints":4.68},"4255037136":{"expDamage":26631.87,"expFrags":0.51,"expCapturePoints":0.44,"expPlanesKilled":1.83,"expDroppedCapturePoints":3.13},"4185798096":{"expDamage":15542.62,"expFrags":0.69,"expCapturePoints":0.33,"expPlanesKilled":0.07,"expDroppedCapturePoints":0.5},"4287510224":{"expDamage":27979.16,"expFrags":0.7,"expCapturePoints":0.63,"expPlanesKilled":0.45,"expDroppedCapturePoints":0.97},"4291770064":{"expDamage":20036.32,"expFrags":0.52,"expCapturePoints":0.7,"expPlanesKilled":0.46,"expDroppedCapturePoints":3.3},"4281317360":{"expDamage":86203.1,"expFrags":1.43,"expCapturePoints":0.24,"expPlanesKilled":21.9,"expDroppedCapturePoints":2.58},"4187895248":{"expDamage":8670.57,"expFrags":0.68,"expCapturePoints":0.13,"expPlanesKilled":0.01,"expDroppedCapturePoints":0.32},"4292851696":{"expDamage":24359.63,"expFrags":0.5,"expCapturePoints":0.11,"expPlanesKilled":12.56,"expDroppedCapturePoints":1.93},"4184749520":{"expDamage":22479.07,"expFrags":0.9,"expCapturePoints":0.28,"expPlanesKilled":0.19,"expDroppedCapturePoints":0.39},"4282300112":{"expDamage":43831.01,"expFrags":0.78,"expCapturePoints":0.45,"expPlanesKilled":3.38,"expDroppedCapturePoints":2.5},"4182685488":{"expDamage":30549.26,"expFrags":0.76,"expCapturePoints":0.02,"expPlanesKilled":1.69,"expDroppedCapturePoints":0.1},"4289640432":{"expDamage":28178.73,"expFrags":0.86,"expCapturePoints":0.63,"expPlanesKilled":1.14,"expDroppedCapturePoints":4.98},"4279219920":{"expDamage":79148.77,"expFrags":1.35,"expCapturePoints":0.28,"expPlanesKilled":19.79,"expDroppedCapturePoints":4.55},"4272895696":{"expDamage":54035.35,"expFrags":0.77,"expCapturePoints":0.28,"expPlanesKilled":4.19,"expDroppedCapturePoints":1.51},"4290688720":{"expDamage":19057.74,"expFrags":0.66,"expCapturePoints":0.71,"expPlanesKilled":1.65,"expDroppedCapturePoints":5.69},"4284364496":{"expDamage":36335.98,"expFrags":0.7,"expCapturePoints":0.93,"expPlanesKilled":0.39,"expDroppedCapturePoints":1.4},"4292785968":{"expDamage":13936.27,"expFrags":0.95,"expCapturePoints":0.27,"expPlanesKilled":0.01,"expDroppedCapturePoints":0.85},"4287575760":{"expDamage":29504.94,"expFrags":0.71,"expCapturePoints":0.55,"expPlanesKilled":1.02,"expDroppedCapturePoints":2.7},"4281251536":{"expDamage":23560.09,"expFrags":0.76,"expCapturePoints":0.58,"expPlanesKilled":0.29,"expDroppedCapturePoints":4.96}}');
			}else{
				ExpShips = response;
			}
		}
		function updateExpWTR(response){
			if(response == null){
				ExpWTR = jQ.parseJSON('{"coefficients":{"wins_weight":0.25,"damage_weight":0.5,"frags_weight":0.2,"capture_weight":0.01,"dropped_capture_weight":0.04,"ship_frags_importance_weight":10,"nominal_rating":1000},"expected":{"4184782640":{"ship_id":4184782640,"wins":0.52307170629501,"damage_dealt":31549.998046875,"frags":0.96911638975143,"capture_points":0.16375075280666,"dropped_capture_points":0.73759323358536,"planes_killed":0.29292640089989},"4185831216":{"ship_id":4185831216,"wins":0.47069424390793,"damage_dealt":14863.4453125,"frags":0.49947437644005,"capture_points":0.33423441648483,"dropped_capture_points":0.90931802988052,"planes_killed":0.037067376077175},"4293801680":{"ship_id":4293801680,"wins":0.51985561847687,"damage_dealt":14149.171875,"frags":0.92238265275955,"capture_points":0.31678700447083,"dropped_capture_points":0.88176894187927,"planes_killed":0},"4286527472":{"ship_id":4286527472,"wins":0.46230551600456,"damage_dealt":39825.76953125,"frags":0.67824131250381,"capture_points":0.44624137878418,"dropped_capture_points":2.0446090698242,"planes_killed":2.2540340423584},"4287542992":{"ship_id":4287542992,"wins":0.47484016418457,"damage_dealt":29062.673828125,"frags":0.74122202396393,"capture_points":0.74035155773163,"dropped_capture_points":3.621710062027,"planes_killed":2.1319072246552},"4282300112":{"ship_id":4282300112,"wins":0.48214688897133,"damage_dealt":46119.80078125,"frags":0.76757061481476,"capture_points":0.58598870038986,"dropped_capture_points":4.1354236602783,"planes_killed":3.0790960788727},"4293801424":{"ship_id":4293801424,"wins":0.51475805044174,"damage_dealt":26999.5078125,"frags":0.94874930381775,"capture_points":1.3125429153442,"dropped_capture_points":4.4613609313965,"planes_killed":0.35960465669632},"4272895696":{"ship_id":4272895696,"wins":0.46813753247261,"damage_dealt":57496.7109375,"frags":0.74710601568222,"capture_points":0.41426932811737,"dropped_capture_points":2.3272778987885,"planes_killed":4.3009743690491},"4283414224":{"ship_id":4283414224,"wins":0.504225730896,"damage_dealt":55968.1796875,"frags":1.065203666687,"capture_points":0.28051322698593,"dropped_capture_points":4.2243590354919,"planes_killed":15.920624732971},"4277090288":{"ship_id":4277090288,"wins":0.49527287483215,"damage_dealt":81162.046875,"frags":0.94935882091522,"capture_points":0.73191052675247,"dropped_capture_points":3.0036506652832,"planes_killed":8.0678644180298},"4282300400":{"ship_id":4282300400,"wins":0.46363803744316,"damage_dealt":27881.435546875,"frags":0.62033146619797,"capture_points":0.7195617556572,"dropped_capture_points":3.5273478031158,"planes_killed":2.7987341880798},"4287575760":{"ship_id":4287575760,"wins":0.4792712032795,"damage_dealt":32168.640625,"frags":0.71739363670349,"capture_points":0.62062776088715,"dropped_capture_points":2.9172120094299,"planes_killed":1.3158965110779},"4292753392":{"ship_id":4292753392,"wins":0.46864187717438,"damage_dealt":9202.208984375,"frags":0.52126157283783,"capture_points":0.48264169692993,"dropped_capture_points":3.2486169338226,"planes_killed":0.00029054764308967},"4291770064":{"ship_id":4291770064,"wins":0.45834019780159,"damage_dealt":20579.404296875,"frags":0.49653860926628,"capture_points":0.71937441825867,"dropped_capture_points":3.2457211017609,"planes_killed":0.59806317090988},"4281284304":{"ship_id":4281284304,"wins":0.49867203831673,"damage_dealt":56966.1171875,"frags":0.87051922082901,"capture_points":0.5000433921814,"dropped_capture_points":2.0129671096802,"planes_killed":3.7966392040253},"4292851408":{"ship_id":4292851408,"wins":0.50104123353958,"damage_dealt":38742.44140625,"frags":0.91629010438919,"capture_points":0.30553182959557,"dropped_capture_points":1.8838306665421,"planes_killed":6.6557302474976},"4264441840":{"ship_id":4264441840,"wins":0.44400957226753,"damage_dealt":16259.016601562,"frags":0.50020444393158,"capture_points":1.1155440807343,"dropped_capture_points":3.3971319198608,"planes_killed":0.22472107410431},"4287510224":{"ship_id":4287510224,"wins":0.47618088126183,"damage_dealt":29413.8515625,"frags":0.62493205070496,"capture_points":1.1193672418594,"dropped_capture_points":1.4097852706909,"planes_killed":0.52661663293839},"4290754544":{"ship_id":4290754544,"wins":0.45492953062057,"damage_dealt":24206.560546875,"frags":0.50349539518356,"capture_points":0.10558690875769,"dropped_capture_points":1.0544861555099,"planes_killed":11.030278205872},"4293834192":{"ship_id":4293834192,"wins":0.51030820608139,"damage_dealt":22075.25,"frags":0.83448630571365,"capture_points":1.0023629665375,"dropped_capture_points":6.9132533073425,"planes_killed":0.011472602374852},"4286527184":{"ship_id":4286527184,"wins":0.49175280332565,"damage_dealt":24161.2265625,"frags":0.67996370792389,"capture_points":0.76969438791275,"dropped_capture_points":3.653520822525,"planes_killed":0.15765254199505},"4279154384":{"ship_id":4279154384,"wins":0.47456070780754,"damage_dealt":16540.52734375,"frags":0.62046641111374,"capture_points":0.6592835187912,"dropped_capture_points":5.0997862815857,"planes_killed":0.03503218665719},"4292785968":{"ship_id":4292785968,"wins":0.52186948060989,"damage_dealt":14263.651367188,"frags":0.86329567432404,"capture_points":0.27762460708618,"dropped_capture_points":0.92443382740021,"planes_killed":4.01520410378e-5},"4280170192":{"ship_id":4280170192,"wins":0.60000002384186,"damage_dealt":18458.65625,"frags":1.0285714864731,"capture_points":3.4000000953674,"dropped_capture_points":7.2857141494751,"planes_killed":0},"4279219920":{"ship_id":4279219920,"wins":0.50221180915833,"damage_dealt":83984.390625,"frags":1.3755947351456,"capture_points":0.22894583642483,"dropped_capture_points":5.5044655799866,"planes_killed":21.501794815063},"4182685488":{"ship_id":4182685488,"wins":0.51584696769714,"damage_dealt":30845.998046875,"frags":0.73551911115646,"capture_points":0.033151183277369,"dropped_capture_points":0.097996354103088,"planes_killed":1.5559198856354},"4255037136":{"ship_id":4255037136,"wins":0.44476401805878,"damage_dealt":29680.36328125,"frags":0.53977680206299,"capture_points":0.52934366464615,"dropped_capture_points":3.306652545929,"planes_killed":1.8353275060654},"4181636912":{"ship_id":4181636912,"wins":0.51770913600922,"damage_dealt":36580.7265625,"frags":0.70535039901733,"capture_points":0,"dropped_capture_points":0,"planes_killed":2.3560662269592},"4183700944":{"ship_id":4183700944,"wins":0.56584256887436,"damage_dealt":26975.65234375,"frags":0.91347122192383,"capture_points":0.23511604964733,"dropped_capture_points":0.14051462709904,"planes_killed":0.25731584429741},"4180588336":{"ship_id":4180588336,"wins":0.57219249010086,"damage_dealt":45715.6015625,"frags":0.76827096939087,"capture_points":0,"dropped_capture_points":0,"planes_killed":1.6844919919968},"4273911792":{"ship_id":4273911792,"wins":0.50662612915039,"damage_dealt":51160.8828125,"frags":0.81468605995178,"capture_points":0.67868781089783,"dropped_capture_points":3.4475343227386,"planes_killed":5.9721918106079},"4293834544":{"ship_id":4293834544,"wins":0.49192255735397,"damage_dealt":8494.80859375,"frags":0.68059545755386,"capture_points":0.13448122143745,"dropped_capture_points":0.36624631285667,"planes_killed":0.0024437562096864},"4293867504":{"ship_id":4293867504,"wins":0.47431468963623,"damage_dealt":17779.296875,"frags":0.59576493501663,"capture_points":0.99551022052765,"dropped_capture_points":5.3420038223267,"planes_killed":0.020425349473953},"3769513264":{"ship_id":3769513264,"wins":0.62311559915543,"damage_dealt":34130.2265625,"frags":1.0552763938904,"capture_points":0.70351761579514,"dropped_capture_points":0,"planes_killed":0.30150753259659},"4277024464":{"ship_id":4277024464,"wins":0.53508508205414,"damage_dealt":27156.669921875,"frags":0.97103613615036,"capture_points":0.18423409759998,"dropped_capture_points":0.24305762350559,"planes_killed":0.0032845626119524},"4290688720":{"ship_id":4290688720,"wins":0.4863213300705,"damage_dealt":21173.927734375,"frags":0.71394401788712,"capture_points":0.87483167648315,"dropped_capture_points":5.6369376182556,"planes_killed":2.1063940525055},"4292753104":{"ship_id":4292753104,"wins":0.51227760314941,"damage_dealt":13332.8828125,"frags":0.74659079313278,"capture_points":0.77160459756851,"dropped_capture_points":2.8456211090088,"planes_killed":0.0025417173746973},"4288657392":{"ship_id":4288657392,"wins":0.46774128079414,"damage_dealt":37624.8046875,"frags":0.70168262720108,"capture_points":0.34704884886742,"dropped_capture_points":2.78324842453,"planes_killed":12.037510871887},"4292786160":{"ship_id":4292786160,"wins":0.46934905648232,"damage_dealt":9793.88671875,"frags":0.41372472047806,"capture_points":0.66529649496078,"dropped_capture_points":6.6816334724426,"planes_killed":0.00022887784871273},"4284430032":{"ship_id":4284430032,"wins":0.48798272013664,"damage_dealt":47396.28125,"frags":0.79304450750351,"capture_points":0.43113848567009,"dropped_capture_points":1.8474287986755,"planes_killed":1.5702971220016},"4286494416":{"ship_id":4286494416,"wins":0.49941110610962,"damage_dealt":37191.24609375,"frags":0.82281470298767,"capture_points":0.70549213886261,"dropped_capture_points":3.3574571609497,"planes_killed":2.43181848526},"4179539760":{"ship_id":4179539760,"wins":0.53594774007797,"damage_dealt":73024.734375,"frags":0.88453161716461,"capture_points":0,"dropped_capture_points":0,"planes_killed":3.3420479297638},"4291704528":{"ship_id":4291704528,"wins":0.48646885156631,"damage_dealt":21184.333984375,"frags":0.78504115343094,"capture_points":1.0079098939896,"dropped_capture_points":1.6200065612793,"planes_killed":0.085695177316666},"4276041712":{"ship_id":4276041712,"wins":0.50626236200333,"damage_dealt":65039.47265625,"frags":0.91945064067841,"capture_points":0.69896870851517,"dropped_capture_points":2.9050483703613,"planes_killed":6.7793636322021},"4279220208":{"ship_id":4279220208,"wins":0.65363669395447,"damage_dealt":141064.671875,"frags":2.0709185600281,"capture_points":0.46714267134666,"dropped_capture_points":3.2514824867249,"planes_killed":20.427568435669},"4289607664":{"ship_id":4289607664,"wins":0.47323587536812,"damage_dealt":18744.298828125,"frags":0.66890627145767,"capture_points":0.843117415905,"dropped_capture_points":2.2294192314148,"planes_killed":0.50890421867371},"4274927600":{"ship_id":4274927600,"wins":0.47974580526352,"damage_dealt":17943.23046875,"frags":0.71596366167068,"capture_points":0.70163112878799,"dropped_capture_points":2.2701816558838,"planes_killed":0.01679727807641},"4288624336":{"ship_id":4288624336,"wins":0.49221220612526,"damage_dealt":43929.64453125,"frags":0.89640218019485,"capture_points":0.53954708576202,"dropped_capture_points":2.5573992729187,"planes_killed":1.0835069417953},"4182652368":{"ship_id":4182652368,"wins":0.59693878889084,"damage_dealt":45891.5859375,"frags":0.91326528787613,"capture_points":0,"dropped_capture_points":0,"planes_killed":0.68367344141006},"4180555216":{"ship_id":4180555216,"wins":0.61377775669098,"damage_dealt":41100.47265625,"frags":1.2186666727066,"capture_points":0.20311111211777,"dropped_capture_points":0.11644444614649,"planes_killed":0.36800000071526},"4276041424":{"ship_id":4276041424,"wins":0.55164098739624,"damage_dealt":92982.109375,"frags":0.97790682315826,"capture_points":0.50627368688583,"dropped_capture_points":2.3442897796631,"planes_killed":6.8570585250854},"4292818896":{"ship_id":4292818896,"wins":0.48111906647682,"damage_dealt":38040.56640625,"frags":0.80072861909866,"capture_points":0.77342891693115,"dropped_capture_points":3.3550126552582,"planes_killed":1.9180775880814},"4291737584":{"ship_id":4291737584,"wins":0.51429915428162,"damage_dealt":13208.020507812,"frags":0.75173383951187,"capture_points":1.1961410045624,"dropped_capture_points":9.1066856384277,"planes_killed":0.00043661522795446},"4256085712":{"ship_id":4256085712,"wins":0.51804429292679,"damage_dealt":12287.513671875,"frags":0.9043875336647,"capture_points":1.0777902603149,"dropped_capture_points":8.7173719406128,"planes_killed":0.0086512379348278},"4288559088":{"ship_id":4288559088,"wins":0.48386666178703,"damage_dealt":20511.021484375,"frags":0.68193870782852,"capture_points":0.94023299217224,"dropped_capture_points":1.8807604312897,"planes_killed":0.45125183463097},"4284397008":{"ship_id":4284397008,"wins":0.61111110448837,"damage_dealt":26985.583984375,"frags":1.5277777910233,"capture_points":2.027777671814,"dropped_capture_points":18.333333969116,"planes_killed":0},"4292851696":{"ship_id":4292851696,"wins":0.45151990652084,"damage_dealt":23436.166015625,"frags":0.4650314450264,"capture_points":0.10273081064224,"dropped_capture_points":2.1214098930359,"planes_killed":13.763041496277},"4184749520":{"ship_id":4184749520,"wins":0.53773826360703,"damage_dealt":24981.478515625,"frags":0.94650572538376,"capture_points":0.31836086511612,"dropped_capture_points":0.47128334641457,"planes_killed":0.20406606793404},"4282365936":{"ship_id":4282365936,"wins":0.47321000695229,"damage_dealt":51294.33984375,"frags":0.79047822952271,"capture_points":0.1883030384779,"dropped_capture_points":2.2184250354767,"planes_killed":28.312097549438},"4285445840":{"ship_id":4285445840,"wins":0.50758343935013,"damage_dealt":45304.68359375,"frags":0.89774864912033,"capture_points":0.72695857286453,"dropped_capture_points":4.0970549583435,"planes_killed":2.4853258132935},"4282365648":{"ship_id":4282365648,"wins":0.48738363385201,"damage_dealt":65319.1796875,"frags":1.1276381015778,"capture_points":0.22806352376938,"dropped_capture_points":4.5099205970764,"planes_killed":14.829984664917},"4287543280":{"ship_id":4287543280,"wins":0.48718526959419,"damage_dealt":32248.1875,"frags":0.87321400642395,"capture_points":0.84108340740204,"dropped_capture_points":4.852087020874,"planes_killed":3.2249011993408},"4289607376":{"ship_id":4289607376,"wins":0.46605768799782,"damage_dealt":20999.470703125,"frags":0.58789050579071,"capture_points":1.2231464385986,"dropped_capture_points":1.0933433771133,"planes_killed":0.63833248615265},"4283381456":{"ship_id":4283381456,"wins":0.49563270807266,"damage_dealt":12593.647460938,"frags":0.69092947244644,"capture_points":1.3632699251175,"dropped_capture_points":4.3527436256409,"planes_killed":0},"4290655952":{"ship_id":4290655952,"wins":0.49439787864685,"damage_dealt":27785.453125,"frags":0.92710655927658,"capture_points":1.2589852809906,"dropped_capture_points":1.5656222105026,"planes_killed":0.12344752252102},"4186846672":{"ship_id":4186846672,"wins":0.48862665891647,"damage_dealt":12069.879882812,"frags":0.65541076660156,"capture_points":0.26460841298103,"dropped_capture_points":0.41726770997047,"planes_killed":0.0011845675762743},"4280203248":{"ship_id":4280203248,"wins":0.47229844331741,"damage_dealt":31963.146484375,"frags":0.61837333440781,"capture_points":0.77936100959778,"dropped_capture_points":3.5952961444855,"planes_killed":4.1077752113342},"4247697392":{"ship_id":4247697392,"wins":0.5,"damage_dealt":43256.33203125,"frags":1.3809523582458,"capture_points":0,"dropped_capture_points":8.7142858505249,"planes_killed":0.33333334326744},"4188976592":{"ship_id":4188976592,"wins":0.51855105161667,"damage_dealt":10083.930664062,"frags":0.80517673492432,"capture_points":0.17596180737019,"dropped_capture_points":0.46528506278992,"planes_killed":0.00066368363332003},"4269717488":{"ship_id":4269717488,"wins":0.46930411458015,"damage_dealt":19650.046875,"frags":0.57975834608078,"capture_points":0.59906935691833,"dropped_capture_points":4.9434704780579,"planes_killed":0.15371198952198},"4285511376":{"ship_id":4285511376,"wins":0.50187659263611,"damage_dealt":49144.6015625,"frags":1.0187406539917,"capture_points":0.23888529837132,"dropped_capture_points":4.1119570732117,"planes_killed":8.404444694519},"4290721776":{"ship_id":4290721776,"wins":0.48317968845367,"damage_dealt":27030.876953125,"frags":0.71153479814529,"capture_points":0.89143973588943,"dropped_capture_points":4.5401544570923,"planes_killed":0.51681363582611},"4277122768":{"ship_id":4277122768,"wins":0.57658958435059,"damage_dealt":107659.046875,"frags":1.7178869247437,"capture_points":0.5685613155365,"dropped_capture_points":6.9076747894287,"planes_killed":20.969974517822},"4292785616":{"ship_id":4292785616,"wins":0.56091260910034,"damage_dealt":19615.220703125,"frags":0.9728798866272,"capture_points":0.8803271651268,"dropped_capture_points":5.6780023574829,"planes_killed":0},"4284463088":{"ship_id":4284463088,"wins":0.46320402622223,"damage_dealt":46863.6015625,"frags":0.80302441120148,"capture_points":0.18988110125065,"dropped_capture_points":3.0038402080536,"planes_killed":17.735464096069},"4282267344":{"ship_id":4282267344,"wins":0.50464928150177,"damage_dealt":58145.75390625,"frags":0.82231652736664,"capture_points":1.0339599847794,"dropped_capture_points":1.5946028232574,"planes_killed":0.49140894412994},"4277057520":{"ship_id":4277057520,"wins":0.47004172205925,"damage_dealt":34434.16796875,"frags":0.61121171712875,"capture_points":0.7541925907135,"dropped_capture_points":3.806471824646,"planes_killed":5.5947561264038},"4293867216":{"ship_id":4293867216,"wins":0.48358234763145,"damage_dealt":17360.265625,"frags":0.63916784524918,"capture_points":1.1008402109146,"dropped_capture_points":4.660617351532,"planes_killed":0.05784572660923},"4282333168":{"ship_id":4282333168,"wins":0.48179319500923,"damage_dealt":52431.65625,"frags":0.80207198858261,"capture_points":0.593286216259,"dropped_capture_points":2.3163552284241,"planes_killed":5.4477858543396},"4286461936":{"ship_id":4286461936,"wins":0.48963168263435,"damage_dealt":25922.6953125,"frags":0.71454465389252,"capture_points":1.136745929718,"dropped_capture_points":2.3615863323212,"planes_killed":0.38362818956375},"4186879792":{"ship_id":4186879792,"wins":0.49471247196198,"damage_dealt":16395.529296875,"frags":0.73488652706146,"capture_points":0.35835263133049,"dropped_capture_points":1.0815209150314,"planes_killed":0},"4267620048":{"ship_id":4267620048,"wins":0.55745995044708,"damage_dealt":32566.306640625,"frags":1.1895663738251,"capture_points":1.2708625793457,"dropped_capture_points":6.3059849739075,"planes_killed":1.090287566185},"4281284592":{"ship_id":4281284592,"wins":0.51039016246796,"damage_dealt":30690.654296875,"frags":0.85874164104462,"capture_points":1.1581320762634,"dropped_capture_points":5.8496150970459,"planes_killed":0},"4289640144":{"ship_id":4289640144,"wins":0.45437535643578,"damage_dealt":20339.74609375,"frags":0.56217157840729,"capture_points":0.60743528604507,"dropped_capture_points":3.1456146240234,"planes_killed":0.39947611093521},"4280170480":{"ship_id":4280170480,"wins":0.46930009126663,"damage_dealt":19774.546875,"frags":0.74023073911667,"capture_points":0.65462601184845,"dropped_capture_points":2.1569681167603,"planes_killed":0.4273390173912},"4284364496":{"ship_id":4284364496,"wins":0.4748260974884,"damage_dealt":39800.6171875,"frags":0.66953647136688,"capture_points":1.1593773365021,"dropped_capture_points":1.6664370298386,"planes_killed":0.44211032986641},"4185798096":{"ship_id":4185798096,"wins":0.49751704931259,"damage_dealt":16368.52734375,"frags":0.69644421339035,"capture_points":0.35847252607346,"dropped_capture_points":0.50043815374374,"planes_killed":0.06721194088459},"4281219056":{"ship_id":4281219056,"wins":0.52319264411926,"damage_dealt":52503.6953125,"frags":0.8441287279129,"capture_points":0.80860841274261,"dropped_capture_points":0.97492688894272,"planes_killed":1.2427915334702},"4187895248":{"ship_id":4187895248,"wins":0.49698492884636,"damage_dealt":8762.6611328125,"frags":0.6263113617897,"capture_points":0.13254803419113,"dropped_capture_points":0.3129408955574,"planes_killed":0.00029737810837105},"4181603792":{"ship_id":4181603792,"wins":0.57414448261261,"damage_dealt":37080.5,"frags":0.86692017316818,"capture_points":0,"dropped_capture_points":0,"planes_killed":0.47908744215965},"4258182864":{"ship_id":4258182864,"wins":0.50005984306335,"damage_dealt":13185.696289062,"frags":0.56514889001846,"capture_points":0.7360035777092,"dropped_capture_points":6.6902713775635,"planes_killed":7.089590508258e-5},"4272830448":{"ship_id":4272830448,"wins":0.5088301897049,"damage_dealt":39348.9375,"frags":0.86218869686127,"capture_points":1.4801509380341,"dropped_capture_points":2.3790187835693,"planes_killed":0.9124528169632},"4288657104":{"ship_id":4288657104,"wins":0.51017796993256,"damage_dealt":46282.48828125,"frags":1.0396121740341,"capture_points":0.28106188774109,"dropped_capture_points":3.1729159355164,"planes_killed":7.1817312240601},"4288591856":{"ship_id":4288591856,"wins":0.44653338193893,"damage_dealt":23769.5390625,"frags":0.65391403436661,"capture_points":0.78052008152008,"dropped_capture_points":4.0682544708252,"planes_killed":2.9933500289917},"4288558800":{"ship_id":4288558800,"wins":0.47574561834335,"damage_dealt":22573.126953125,"frags":0.5946124792099,"capture_points":1.1117255687714,"dropped_capture_points":1.49181163311,"planes_killed":0.57847291231155},"4266538992":{"ship_id":4266538992,"wins":0.4677486717701,"damage_dealt":11540.06640625,"frags":0.51174402236938,"capture_points":0.49259603023529,"dropped_capture_points":2.3306884765625,"planes_killed":0.010361477732658},"4183734064":{"ship_id":4183734064,"wins":0.51808947324753,"damage_dealt":30448.84375,"frags":0.88614726066589,"capture_points":0.064185969531536,"dropped_capture_points":0.15828308463097,"planes_killed":0.98381465673447},"4281317360":{"ship_id":4281317360,"wins":0.53793233633041,"damage_dealt":100838.6640625,"frags":1.6083309650421,"capture_points":0.30477806925774,"dropped_capture_points":2.8248987197876,"planes_killed":19.845066070557},"4292818736":{"ship_id":4292818736,"wins":0.48800936341286,"damage_dealt":48585.484375,"frags":0.70707815885544,"capture_points":0.27488055825233,"dropped_capture_points":1.0157630443573,"planes_killed":1.9369477033615},"4289640432":{"ship_id":4289640432,"wins":0.4871082007885,"damage_dealt":28686.78125,"frags":0.8499214053154,"capture_points":0.73557335138321,"dropped_capture_points":5.337776184082,"planes_killed":1.2431932687759},"4259264496":{"ship_id":4259264496,"wins":0.48029896616936,"damage_dealt":40136.1015625,"frags":0.83992683887482,"capture_points":0.58024650812149,"dropped_capture_points":2.8071081638336,"planes_killed":1.2476997375488},"4288624624":{"ship_id":4288624624,"wins":0.46445098519325,"damage_dealt":29807.8515625,"frags":0.68803143501282,"capture_points":0.6556139588356,"dropped_capture_points":3.2681744098663,"planes_killed":0.78723132610321},"4281251536":{"ship_id":4281251536,"wins":0.48701816797256,"damage_dealt":22736.203125,"frags":0.70866429805756,"capture_points":0.66428923606873,"dropped_capture_points":4.8716082572937,"planes_killed":0.31122049689293},"4269684432":{"ship_id":4269684432,"wins":0.48539015650749,"damage_dealt":14570.354492188,"frags":0.64548546075821,"capture_points":0.74422258138657,"dropped_capture_points":2.0334942340851,"planes_killed":0.018602525815368},"4290689008":{"ship_id":4290689008,"wins":0.50213944911957,"damage_dealt":20356.55078125,"frags":0.7466766834259,"capture_points":0.98137247562408,"dropped_capture_points":7.7865605354309,"planes_killed":0.004433345515281},"4179506640":{"ship_id":4179506640,"wins":0.53956836462021,"damage_dealt":48500.38671875,"frags":0.80215829610825,"capture_points":0,"dropped_capture_points":0,"planes_killed":1.2661870718002},"4259231440":{"ship_id":4259231440,"wins":0.52685004472733,"damage_dealt":75032.390625,"frags":1.0795040130615,"capture_points":0.51476174592972,"dropped_capture_points":4.2413792610168,"planes_killed":3.729484796524},"4248745968":{"ship_id":4248745968,"wins":0.57469618320465,"damage_dealt":39580.44140625,"frags":1.2028830051422,"capture_points":0.47450560331345,"dropped_capture_points":1.319394826889,"planes_killed":0.20752918720245},"4293866960":{"ship_id":4293866960,"wins":0.57899177074432,"damage_dealt":37827.11328125,"frags":1.1535540819168,"capture_points":0.5249947309494,"dropped_capture_points":0.96013498306274,"planes_killed":0.029529634863138},"4291737040":{"ship_id":4291737040,"wins":0.52799493074417,"damage_dealt":35359.515625,"frags":1.0382398366928,"capture_points":0.76013273000717,"dropped_capture_points":5.1829280853271,"planes_killed":1.3996429443359},"4293834736":{"ship_id":4293834736,"wins":0.47734153270721,"damage_dealt":9767.1650390625,"frags":0.63012313842773,"capture_points":0.73212796449661,"dropped_capture_points":6.8361001014709,"planes_killed":0.0052568167448044}}}');
			}else{
				ExpWTR = response;
			}
		}
		function errorExpShips(url){}
		function errorExpWTR(url){}
		function doneAccountInfo(url, response){
			if(response.status && response.status == 'error'){
				errorAccountInfo(url);
				return;
			}
			
			var vars = getUrlVars(url);
			var account_id = vars['account_id'];
			var index = vars['index'];
			var type = vars['type'];
			
			MembersArray[index]['info'] = response['data'][account_id];
			
			getJson(WOWSAPI+'ships/stats/?application_id='+application_id+'&extra=pve,pvp_solo,pvp_div2,pvp_div3&account_id='+account_id+'&index='+index+'&type='+type, doneShipsStats, errorShipsStats);
		}
		function errorAccountInfo(url){
			var vars = getUrlVars(url);
			var account_id = vars['account_id'];
			var index = vars['index'];
			var type = vars['type'];
			
			console.log('Error AccountInfo '+account_id);
			
			if(type == 'profile'){
				onShowMessage(
					localizationText['Box'],
					localizationText['ErrorAPI'],
					onCloseMessage,
					localizationText['Ok'],
					false
				);
			}else if(type == 'clan'){
				getJson(WOWSAPI+'ships/stats/?application_id='+application_id+'&extra=pve,pvp_solo,pvp_div2,pvp_div3&account_id='+account_id+'&index='+index+'&type='+type, doneShipsStats, errorShipsStats);
			}
		}
		function doneShipsStats(url, response){
			if(response.status && response.status == 'error'){
				errorShipsStats(url);
				return;
			}
			
			var vars = getUrlVars(url);
			var account_id = vars['account_id'];
			var index = vars['index'];
			var type = vars['type'];
			
			MembersArray[index]['ships'] = response['data'][account_id];
			
			getJson(WOWSAPI+'account/achievements/?application_id='+application_id+'&account_id='+account_id+'&index='+index+'&type='+type, doneAchievements, errorAchievements);
		}
		function errorShipsStats(url){
			var vars = getUrlVars(url);
			var account_id = vars['account_id'];
			var index = vars['index'];
			var type = vars['type'];
			
			console.log('Error ShipsStats '+account_id);
			
			if(type == 'profile'){
				onShowMessage(
					localizationText['Box'],
					localizationText['ErrorAPI'],
					onCloseMessage,
					localizationText['Ok'],
					false
				);
			}else if(type == 'clan'){
				getJson(WOWSAPI+'account/achievements/?application_id='+application_id+'&account_id='+account_id+'&index='+index+'&type='+type, doneAchievements, errorAchievements);
			}
		}
		function doneAchievements(url, response){
			if(response.status && response.status == 'error'){
				errorAchievements(url);
				return;
			}
			
			var vars = getUrlVars(url);
			var account_id = vars['account_id'];
			var index = vars['index'];
			var type = vars['type'];
			
			MembersArray[index]['achievements'] = response['data'][account_id];
			
			if(type == 'profile'){
				viewMainPageProfile();
			}else if(type == 'clan'){
				loadMemberCount++;
				viewMainPageClan();
			}
		}
		function errorAchievements(url){
			var vars = getUrlVars(url);
			var account_id = vars['account_id'];
			var index = vars['index'];
			var type = vars['type'];
			
			console.log('Error Achievements '+account_id);
			
			if(type == 'profile'){
				onShowMessage(
					localizationText['Box'],
					localizationText['ErrorAPI'],
					onCloseMessage,
					localizationText['Ok'],
					false
				);
			}else if(type == 'clan'){
				loadMemberCount++;
				viewMainPageClan();
			}
		}
		function calcStat(index){
			if(MembersArray[index]['info'] == null || MembersArray[index]['ships'] == null){
				MembersArray[index]['info'] = [];
				MembersArray[index]['info']['last_battle_time'] = 0;
				MembersArray[index]['info']['logout_at'] = 0;
				MembersArray[index]['info']['ships_x_level'] = 0;
				
				MembersArray[index]['info']['statistics'] = [];
				MembersArray[index]['info']['statistics']['pvp'] = [];
				MembersArray[index]['info']['statistics']['pvp']['battles'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['wins'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['losses'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['draws'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['survived_battles'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['survived_wins'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['kill_dead'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['xp'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['damage_dealt'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['frags'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['planes_killed'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['capture_points'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['dropped_capture_points'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['avg_xp'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['avg_damage_dealt'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['avg_frags'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['avg_planes_killed'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['avg_capture_points'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['avg_dropped_capture_points'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['max_xp'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['max_damage_dealt'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['max_frags_battle'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['max_planes_killed'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['wins_percents'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['survived_battles_percents'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['wr'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['wtr'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['avg_battles_level'] = 0;
				MembersArray[index]['info']['statistics']['pvp']['max_ship_level'] = 0;
				
				return false;
			}
			
			for(var t = 0; t < typeStat.length; t++){
				var type = typeStat[t];
				
				if(type == 'pvp_div' && MembersArray[index]['info']['statistics']['pvp_div'] == undefined){
					MembersArray[index]['info']['statistics']['pvp_div'] = [];
					
					if(MembersArray[index]['info']['statistics']['pvp_div2']['max_xp'] > MembersArray[index]['info']['statistics']['pvp_div3']['max_xp']){
						MembersArray[index]['info']['statistics']['pvp_div']['max_xp'] = MembersArray[index]['info']['statistics']['pvp_div2']['max_xp'];
						MembersArray[index]['info']['statistics']['pvp_div']['max_xp_ship_id'] = MembersArray[index]['info']['statistics']['pvp_div2']['max_xp_ship_id'];
					}else{
						MembersArray[index]['info']['statistics']['pvp_div']['max_xp'] = MembersArray[index]['info']['statistics']['pvp_div3']['max_xp'];
						MembersArray[index]['info']['statistics']['pvp_div']['max_xp_ship_id'] = MembersArray[index]['info']['statistics']['pvp_div3']['max_xp_ship_id'];
					}
					
					if(MembersArray[index]['info']['statistics']['pvp_div2']['max_frags_battle'] > MembersArray[index]['info']['statistics']['pvp_div3']['max_frags_battle']){
						MembersArray[index]['info']['statistics']['pvp_div']['max_frags_battle'] = MembersArray[index]['info']['statistics']['pvp_div2']['max_frags_battle'];
						MembersArray[index]['info']['statistics']['pvp_div']['max_frags_ship_id'] = MembersArray[index]['info']['statistics']['pvp_div2']['max_frags_ship_id'];
					}else{
						MembersArray[index]['info']['statistics']['pvp_div']['max_frags_battle'] = MembersArray[index]['info']['statistics']['pvp_div3']['max_frags_battle'];
						MembersArray[index]['info']['statistics']['pvp_div']['max_frags_ship_id'] = MembersArray[index]['info']['statistics']['pvp_div3']['max_frags_ship_id'];
					}
					
					if(MembersArray[index]['info']['statistics']['pvp_div2']['max_planes_killed'] > MembersArray[index]['info']['statistics']['pvp_div3']['max_planes_killed']){
						MembersArray[index]['info']['statistics']['pvp_div']['max_planes_killed'] = MembersArray[index]['info']['statistics']['pvp_div2']['max_planes_killed'];
						MembersArray[index]['info']['statistics']['pvp_div']['max_planes_killed_ship_id'] = MembersArray[index]['info']['statistics']['pvp_div2']['max_planes_killed_ship_id'];
					}else{
						MembersArray[index]['info']['statistics']['pvp_div']['max_planes_killed'] = MembersArray[index]['info']['statistics']['pvp_div3']['max_planes_killed'];
						MembersArray[index]['info']['statistics']['pvp_div']['max_planes_killed_ship_id'] = MembersArray[index]['info']['statistics']['pvp_div3']['max_planes_killed_ship_id'];
					}
					
					if(MembersArray[index]['info']['statistics']['pvp_div2']['max_damage_dealt'] > MembersArray[index]['info']['statistics']['pvp_div3']['max_damage_dealt']){
						MembersArray[index]['info']['statistics']['pvp_div']['max_damage_dealt'] = MembersArray[index]['info']['statistics']['pvp_div2']['max_damage_dealt'];
						MembersArray[index]['info']['statistics']['pvp_div']['max_damage_dealt_ship_id'] = MembersArray[index]['info']['statistics']['pvp_div2']['max_damage_dealt_ship_id'];
					}else{
						MembersArray[index]['info']['statistics']['pvp_div']['max_damage_dealt'] = MembersArray[index]['info']['statistics']['pvp_div3']['max_damage_dealt'];
						MembersArray[index]['info']['statistics']['pvp_div']['max_damage_dealt_ship_id'] = MembersArray[index]['info']['statistics']['pvp_div3']['max_damage_dealt_ship_id'];
					}
					
					MembersArray[index]['info']['statistics']['pvp_div']['xp'] = MembersArray[index]['info']['statistics']['pvp_div2']['xp'] + MembersArray[index]['info']['statistics']['pvp_div3']['xp'];
					MembersArray[index]['info']['statistics']['pvp_div']['survived_battles'] = MembersArray[index]['info']['statistics']['pvp_div2']['survived_battles'] + MembersArray[index]['info']['statistics']['pvp_div3']['survived_battles'];
					MembersArray[index]['info']['statistics']['pvp_div']['dropped_capture_points'] = MembersArray[index]['info']['statistics']['pvp_div2']['dropped_capture_points'] + MembersArray[index]['info']['statistics']['pvp_div3']['dropped_capture_points'];
					MembersArray[index]['info']['statistics']['pvp_div']['draws'] = MembersArray[index]['info']['statistics']['pvp_div2']['draws'] + MembersArray[index]['info']['statistics']['pvp_div3']['draws'];
					MembersArray[index]['info']['statistics']['pvp_div']['wins'] = MembersArray[index]['info']['statistics']['pvp_div2']['wins'] + MembersArray[index]['info']['statistics']['pvp_div3']['wins'];
					MembersArray[index]['info']['statistics']['pvp_div']['damage_dealt'] = MembersArray[index]['info']['statistics']['pvp_div2']['damage_dealt'] + MembersArray[index]['info']['statistics']['pvp_div3']['damage_dealt'];
					MembersArray[index]['info']['statistics']['pvp_div']['losses'] = MembersArray[index]['info']['statistics']['pvp_div2']['losses'] + MembersArray[index]['info']['statistics']['pvp_div3']['losses'];
					MembersArray[index]['info']['statistics']['pvp_div']['frags'] = MembersArray[index]['info']['statistics']['pvp_div2']['frags'] + MembersArray[index]['info']['statistics']['pvp_div3']['frags'];
					MembersArray[index]['info']['statistics']['pvp_div']['capture_points'] = MembersArray[index]['info']['statistics']['pvp_div2']['capture_points'] + MembersArray[index]['info']['statistics']['pvp_div3']['capture_points'];
					MembersArray[index]['info']['statistics']['pvp_div']['survived_wins'] = MembersArray[index]['info']['statistics']['pvp_div2']['survived_wins'] + MembersArray[index]['info']['statistics']['pvp_div3']['survived_wins'];
					MembersArray[index]['info']['statistics']['pvp_div']['battles'] = MembersArray[index]['info']['statistics']['pvp_div2']['battles'] + MembersArray[index]['info']['statistics']['pvp_div3']['battles'];
					MembersArray[index]['info']['statistics']['pvp_div']['planes_killed'] = MembersArray[index]['info']['statistics']['pvp_div2']['planes_killed'] + MembersArray[index]['info']['statistics']['pvp_div3']['planes_killed'];
				}
				
				var Statistics = MembersArray[index]['info']['statistics'][type];
				
				var timestamp = Math.round(+new Date()/1000);
				var created_at = MembersArray[index]['info']['created_at'];
				var days = (timestamp - created_at)/60/60/24;
				var battles_days = Statistics['battles'] / days;
				MembersArray[index]['info']['statistics'][type]['battles_days'] = battles_days;
				
				MembersArray[index]['info']['statistics'][type]['avg_xp'] = Statistics['xp'] / Statistics['battles'];
				if(isNaN(MembersArray[index]['info']['statistics'][type]['avg_xp'])){MembersArray[index]['info']['statistics'][type]['avg_xp'] = 0;}
				
				MembersArray[index]['info']['statistics'][type]['avg_damage_dealt'] = Statistics['damage_dealt'] / Statistics['battles'];
				if(isNaN(MembersArray[index]['info']['statistics'][type]['avg_damage_dealt'])){MembersArray[index]['info']['statistics'][type]['avg_damage_dealt'] = 0;}
				
				MembersArray[index]['info']['statistics'][type]['avg_frags'] = Statistics['frags'] / Statistics['battles'];
				if(isNaN(MembersArray[index]['info']['statistics'][type]['avg_frags'])){MembersArray[index]['info']['statistics'][type]['avg_frags'] = 0;}
				
				MembersArray[index]['info']['statistics'][type]['avg_planes_killed'] = Statistics['planes_killed'] / Statistics['battles'];
				if(isNaN(MembersArray[index]['info']['statistics'][type]['avg_planes_killed'])){MembersArray[index]['info']['statistics'][type]['avg_planes_killed'] = 0;}
				
				MembersArray[index]['info']['statistics'][type]['avg_capture_points'] = Statistics['capture_points'] / Statistics['battles'];
				if(isNaN(MembersArray[index]['info']['statistics'][type]['avg_capture_points'])){MembersArray[index]['info']['statistics'][type]['avg_capture_points'] = 0;}
				
				MembersArray[index]['info']['statistics'][type]['avg_dropped_capture_points'] = Statistics['dropped_capture_points'] / Statistics['battles'];
				if(isNaN(MembersArray[index]['info']['statistics'][type]['avg_dropped_capture_points'])){MembersArray[index]['info']['statistics'][type]['avg_dropped_capture_points'] = 0;}
				
				MembersArray[index]['info']['statistics'][type]['wins_percents'] = (Statistics['wins']/Statistics['battles'])*100;
				if(isNaN(MembersArray[index]['info']['statistics'][type]['wins_percents'])){MembersArray[index]['info']['statistics'][type]['wins_percents'] = 0;}
				
				MembersArray[index]['info']['statistics'][type]['survived_battles_percents'] = (Statistics['survived_battles']/Statistics['battles'])*100;
				if(isNaN(MembersArray[index]['info']['statistics'][type]['survived_battles_percents'])){MembersArray[index]['info']['statistics'][type]['survived_battles_percents'] = 0;}
				
				if(Statistics['battles'] == Statistics['survived_battles']){
					MembersArray[index]['info']['statistics'][type]['kill_dead'] = Statistics['frags']/Statistics['battles'];
				}else{
					MembersArray[index]['info']['statistics'][type]['kill_dead'] = Statistics['frags']/(Statistics['battles']-Statistics['survived_battles']);
				}
				if(isNaN(MembersArray[index]['info']['statistics'][type]['kill_dead'])){MembersArray[index]['info']['statistics'][type]['kill_dead'] = 0;}
				
				if(type != 'pvp' && type != 'pve'){
					var type_start = type.split('_')[0];
					MembersArray[index]['info']['statistics'][type]['battles_percents'] = (Statistics['battles']/MembersArray[index]['info']['statistics'][type_start]['battles'])*100;
					if(isNaN(MembersArray[index]['info']['statistics'][type]['battles_percents'])){MembersArray[index]['info']['statistics'][type]['battles_percents'] = 0;}
				}
			}
			
			MembersArray[index]['info']['ships_x_level'] = 0;
			MembersArray[index]['info']['statistics']['pvp_div']['avg_battles_level'] = 0;
			MembersArray[index]['info']['statistics']['pvp_div']['max_ship_level'] = 0;
			
			for(var t = 0; t < typeStat.length; t++){
				var type = typeStat[t];
				
				MembersArray[index]['info']['statistics'][type]['avg_battles_level'] = 0;
				MembersArray[index]['info']['statistics'][type]['max_ship_level'] = 0;
				MembersArray[index]['info']['statistics'][type]['wr'] = 0;
				MembersArray[index]['info']['statistics'][type]['wtr'] = 0;
				
				var StatShips = [];
				StatShips['damage_dealt'] = 0;
				StatShips['frags'] = 0;
				StatShips['planes_killed'] = 0;
				StatShips['capture_points'] = 0;
				StatShips['dropped_capture_points'] = 0;
				StatShips['expDamage'] = 0;
				StatShips['expFrags'] = 0;
				StatShips['expPlanesKilled'] = 0;
				StatShips['expCapturePoints'] = 0;
				StatShips['expDroppedCapturePoints'] = 0;
				
				StatShips['actual.wins'] = 0;
				StatShips['actual.damage_dealt'] = 0;
				StatShips['actual.frags'] = 0;
				StatShips['actual.planes_killed'] = 0;
				StatShips['actual.capture_points'] = 0;
				StatShips['actual.dropped_capture_points'] = 0;
				StatShips['expected.wins'] = 0;
				StatShips['expected.damage_dealt'] = 0;
				StatShips['expected.frags'] = 0;
				StatShips['expected.planes_killed'] = 0;
				StatShips['expected.capture_points'] = 0;
				StatShips['expected.dropped_capture_points'] = 0;
				
				var StatShipsClass = [];
				for(var tS = 0; tS < typeShip.length; tS++){
					var typeS = typeShip[tS];
					StatShipsClass[typeS] = [];
					StatShipsClass[typeS]['damage_dealt'] = 0;
					StatShipsClass[typeS]['frags'] = 0;
					StatShipsClass[typeS]['planes_killed'] = 0;
					StatShipsClass[typeS]['capture_points'] = 0;
					StatShipsClass[typeS]['dropped_capture_points'] = 0;
					StatShipsClass[typeS]['expDamage'] = 0;
					StatShipsClass[typeS]['expFrags'] = 0;
					StatShipsClass[typeS]['expPlanesKilled'] = 0;
					StatShipsClass[typeS]['expCapturePoints'] = 0;
					StatShipsClass[typeS]['expDroppedCapturePoints'] = 0;
					
					StatShipsClass[typeS]['actual.wins'] = 0;
					StatShipsClass[typeS]['actual.damage_dealt'] = 0;
					StatShipsClass[typeS]['actual.frags'] = 0;
					StatShipsClass[typeS]['actual.planes_killed'] = 0;
					StatShipsClass[typeS]['actual.capture_points'] = 0;
					StatShipsClass[typeS]['actual.dropped_capture_points'] = 0;
					StatShipsClass[typeS]['expected.wins'] = 0;
					StatShipsClass[typeS]['expected.damage_dealt'] = 0;
					StatShipsClass[typeS]['expected.frags'] = 0;
					StatShipsClass[typeS]['expected.planes_killed'] = 0;
					StatShipsClass[typeS]['expected.capture_points'] = 0;
					StatShipsClass[typeS]['expected.dropped_capture_points'] = 0;
				}
				
				for(var shipI = 0; shipI < MembersArray[index]['ships'].length; shipI++){
					if(type == 'pvp_div' && MembersArray[index]['ships'][shipI]['pvp_div'] == undefined){
						MembersArray[index]['ships'][shipI]['pvp_div'] = [];
						
						if(MembersArray[index]['ships'][shipI]['pvp_div2']['max_xp'] > MembersArray[index]['ships'][shipI]['pvp_div3']['max_xp']){
							MembersArray[index]['ships'][shipI]['pvp_div']['max_xp'] = MembersArray[index]['ships'][shipI]['pvp_div2']['max_xp'];
						}else{
							MembersArray[index]['ships'][shipI]['pvp_div']['max_xp'] = MembersArray[index]['ships'][shipI]['pvp_div3']['max_xp'];
						}
						
						if(MembersArray[index]['ships'][shipI]['pvp_div2']['max_frags_battle'] > MembersArray[index]['ships'][shipI]['pvp_div3']['max_frags_battle']){
							MembersArray[index]['ships'][shipI]['pvp_div']['max_frags_battle'] = MembersArray[index]['ships'][shipI]['pvp_div2']['max_frags_battle'];
						}else{
							MembersArray[index]['ships'][shipI]['pvp_div']['max_frags_battle'] = MembersArray[index]['ships'][shipI]['pvp_div3']['max_frags_battle'];
						}
						
						if(MembersArray[index]['ships'][shipI]['pvp_div2']['max_planes_killed'] > MembersArray[index]['ships'][shipI]['pvp_div3']['max_planes_killed']){
							MembersArray[index]['ships'][shipI]['pvp_div']['max_planes_killed'] = MembersArray[index]['ships'][shipI]['pvp_div2']['max_planes_killed'];
						}else{
							MembersArray[index]['ships'][shipI]['pvp_div']['max_planes_killed'] = MembersArray[index]['ships'][shipI]['pvp_div3']['max_planes_killed'];
						}
						
						if(MembersArray[index]['ships'][shipI]['pvp_div2']['max_damage_dealt'] > MembersArray[index]['ships'][shipI]['pvp_div3']['max_damage_dealt']){
							MembersArray[index]['ships'][shipI]['pvp_div']['max_damage_dealt'] = MembersArray[index]['ships'][shipI]['pvp_div2']['max_damage_dealt'];
						}else{
							MembersArray[index]['ships'][shipI]['pvp_div']['max_damage_dealt'] = MembersArray[index]['ships'][shipI]['pvp_div3']['max_damage_dealt'];
						}
						
						MembersArray[index]['ships'][shipI]['pvp_div']['xp'] = MembersArray[index]['ships'][shipI]['pvp_div2']['xp'] + MembersArray[index]['ships'][shipI]['pvp_div3']['xp'];
						MembersArray[index]['ships'][shipI]['pvp_div']['survived_battles'] = MembersArray[index]['ships'][shipI]['pvp_div2']['survived_battles'] + MembersArray[index]['ships'][shipI]['pvp_div3']['survived_battles'];
						MembersArray[index]['ships'][shipI]['pvp_div']['dropped_capture_points'] = MembersArray[index]['ships'][shipI]['pvp_div2']['dropped_capture_points'] + MembersArray[index]['ships'][shipI]['pvp_div3']['dropped_capture_points'];
						MembersArray[index]['ships'][shipI]['pvp_div']['draws'] = MembersArray[index]['ships'][shipI]['pvp_div2']['draws'] + MembersArray[index]['ships'][shipI]['pvp_div3']['draws'];
						MembersArray[index]['ships'][shipI]['pvp_div']['wins'] = MembersArray[index]['ships'][shipI]['pvp_div2']['wins'] + MembersArray[index]['ships'][shipI]['pvp_div3']['wins'];
						MembersArray[index]['ships'][shipI]['pvp_div']['damage_dealt'] = MembersArray[index]['ships'][shipI]['pvp_div2']['damage_dealt'] + MembersArray[index]['ships'][shipI]['pvp_div3']['damage_dealt'];
						MembersArray[index]['ships'][shipI]['pvp_div']['losses'] = MembersArray[index]['ships'][shipI]['pvp_div2']['losses'] + MembersArray[index]['ships'][shipI]['pvp_div3']['losses'];
						MembersArray[index]['ships'][shipI]['pvp_div']['frags'] = MembersArray[index]['ships'][shipI]['pvp_div2']['frags'] + MembersArray[index]['ships'][shipI]['pvp_div3']['frags'];
						MembersArray[index]['ships'][shipI]['pvp_div']['capture_points'] = MembersArray[index]['ships'][shipI]['pvp_div2']['capture_points'] + MembersArray[index]['ships'][shipI]['pvp_div3']['capture_points'];
						MembersArray[index]['ships'][shipI]['pvp_div']['survived_wins'] = MembersArray[index]['ships'][shipI]['pvp_div2']['survived_wins'] + MembersArray[index]['ships'][shipI]['pvp_div3']['survived_wins'];
						MembersArray[index]['ships'][shipI]['pvp_div']['battles'] = MembersArray[index]['ships'][shipI]['pvp_div2']['battles'] + MembersArray[index]['ships'][shipI]['pvp_div3']['battles'];
						MembersArray[index]['ships'][shipI]['pvp_div']['planes_killed'] = MembersArray[index]['ships'][shipI]['pvp_div2']['planes_killed'] + MembersArray[index]['ships'][shipI]['pvp_div3']['planes_killed'];
					}
				
					var Ship = MembersArray[index]['ships'][shipI];
					var ship_id = Ship['ship_id'];
					var Statistics = Ship[type];
					
					MembersArray[index]['ships'][shipI][type]['avg_xp'] = Statistics['xp'] / Statistics['battles'];
					if(isNaN(MembersArray[index]['ships'][shipI][type]['avg_xp'])){MembersArray[index]['ships'][shipI][type]['avg_xp'] = 0;}
					
					MembersArray[index]['ships'][shipI][type]['avg_damage_dealt'] = Statistics['damage_dealt'] / Statistics['battles'];
					if(isNaN(MembersArray[index]['ships'][shipI][type]['avg_damage_dealt'])){MembersArray[index]['ships'][shipI][type]['avg_damage_dealt'] = 0;}
					
					MembersArray[index]['ships'][shipI][type]['avg_frags'] = Statistics['frags'] / Statistics['battles'];
					if(isNaN(MembersArray[index]['ships'][shipI][type]['avg_frags'])){MembersArray[index]['ships'][shipI][type]['avg_frags'] = 0;}
					
					MembersArray[index]['ships'][shipI][type]['avg_planes_killed'] = Statistics['planes_killed'] / Statistics['battles'];
					if(isNaN(MembersArray[index]['ships'][shipI][type]['avg_planes_killed'])){MembersArray[index]['ships'][shipI][type]['avg_planes_killed'] = 0;}
					
					MembersArray[index]['ships'][shipI][type]['avg_capture_points'] = Statistics['capture_points'] / Statistics['battles'];
					if(isNaN(MembersArray[index]['ships'][shipI][type]['avg_capture_points'])){MembersArray[index]['ships'][shipI][type]['avg_capture_points'] = 0;}
					
					MembersArray[index]['ships'][shipI][type]['avg_dropped_capture_points'] = Statistics['dropped_capture_points'] / Statistics['battles'];
					if(isNaN(MembersArray[index]['ships'][shipI][type]['avg_dropped_capture_points'])){MembersArray[index]['ships'][shipI][type]['avg_dropped_capture_points'] = 0;}
					
					MembersArray[index]['ships'][shipI][type]['wins_percents'] = (Statistics['wins']/Statistics['battles'])*100;
					if(isNaN(MembersArray[index]['ships'][shipI][type]['wins_percents'])){MembersArray[index]['ships'][shipI][type]['wins_percents'] = 0;}
					
					MembersArray[index]['ships'][shipI][type]['survived_battles_percents'] = (Statistics['survived_battles']/Statistics['battles'])*100;
					if(isNaN(MembersArray[index]['ships'][shipI][type]['survived_battles_percents'])){MembersArray[index]['ships'][shipI][type]['survived_battles_percents'] = 0;}
					
					if(Statistics['battles'] == Statistics['survived_battles']){
						MembersArray[index]['ships'][shipI][type]['kill_dead'] = Statistics['frags']/Statistics['battles'];
					}else{
						MembersArray[index]['ships'][shipI][type]['kill_dead'] = Statistics['frags']/(Statistics['battles']-Statistics['survived_battles']);
					}
					if(isNaN(MembersArray[index]['ships'][shipI][type]['kill_dead'])){MembersArray[index]['ships'][shipI][type]['kill_dead'] = 0;}
					
					if(Encyclopedia != null){
						var ship_type = Encyclopedia[ship_id]['type'];
						var ship_tier = Encyclopedia[ship_id]['tier'];
						
						if(ExpShips[ship_id] !== undefined){
							var battles = Statistics['battles'];
							var damage_dealt = Statistics['damage_dealt'];
							var frags = Statistics['frags'];
							var planes_killed = Statistics['planes_killed'];
							var capture_points = Statistics['capture_points'];
							var dropped_capture_points = Statistics['dropped_capture_points'];
							
							var StatShip = [];
							StatShip['damage_dealt'] = damage_dealt;
							StatShip['frags'] = frags;
							StatShip['planes_killed'] = planes_killed;
							StatShip['capture_points'] = capture_points;
							StatShip['dropped_capture_points'] = dropped_capture_points;
							StatShip['expDamage'] = battles * ExpShips[ship_id]['expDamage'];
							StatShip['expFrags'] = battles * ExpShips[ship_id]['expFrags'];
							StatShip['expPlanesKilled'] = battles * ExpShips[ship_id]['expPlanesKilled'];
							StatShip['expCapturePoints'] = battles * ExpShips[ship_id]['expCapturePoints'];
							StatShip['expDroppedCapturePoints'] = battles * ExpShips[ship_id]['expDroppedCapturePoints'];
							
							MembersArray[index]['ships'][shipI][type]['wr'] = calcWR(StatShip);
							
							StatShipsClass[ship_type]['damage_dealt'] += damage_dealt;
							StatShipsClass[ship_type]['frags'] += frags;
							StatShipsClass[ship_type]['planes_killed'] += planes_killed;
							StatShipsClass[ship_type]['capture_points'] += capture_points;
							StatShipsClass[ship_type]['dropped_capture_points'] += dropped_capture_points;
							StatShipsClass[ship_type]['expDamage'] += StatShip['expDamage'];
							StatShipsClass[ship_type]['expFrags'] += StatShip['expFrags'];
							StatShipsClass[ship_type]['expPlanesKilled'] += StatShip['expPlanesKilled'];
							StatShipsClass[ship_type]['expCapturePoints'] += StatShip['expCapturePoints'];
							StatShipsClass[ship_type]['expDroppedCapturePoints'] += StatShip['expDroppedCapturePoints'];
							
							StatShips['damage_dealt'] += damage_dealt;
							StatShips['frags'] += frags;
							StatShips['planes_killed'] += planes_killed;
							StatShips['capture_points'] += capture_points;
							StatShips['dropped_capture_points'] += dropped_capture_points;
							StatShips['expDamage'] += StatShip['expDamage'];
							StatShips['expFrags'] += StatShip['expFrags'];
							StatShips['expPlanesKilled'] += StatShip['expPlanesKilled'];
							StatShips['expCapturePoints'] += StatShip['expCapturePoints'];
							StatShips['expDroppedCapturePoints'] += StatShip['expDroppedCapturePoints'];
						}else{
							MembersArray[index]['ships'][shipI][type]['wr'] = 0;
						}
						
						if(ExpWTR['expected'][ship_id] !== undefined){
							var battles = Statistics['battles'];
							var wins = Statistics['wins'];
							var damage_dealt = Statistics['damage_dealt'];
							var frags = Statistics['frags'];
							var planes_killed = Statistics['planes_killed'];
							var capture_points = Statistics['capture_points'];
							var dropped_capture_points = Statistics['dropped_capture_points'];
							
							var StatShip = [];
							StatShip['actual.wins'] = wins;
							StatShip['actual.damage_dealt'] = damage_dealt;
							StatShip['actual.frags'] = frags;
							StatShip['actual.planes_killed'] = planes_killed;
							StatShip['actual.capture_points'] = capture_points;
							StatShip['actual.dropped_capture_points'] = dropped_capture_points;
							StatShip['expected.wins'] = battles * ExpWTR['expected'][ship_id]['wins'];
							StatShip['expected.damage_dealt'] = battles * ExpWTR['expected'][ship_id]['damage_dealt'];
							StatShip['expected.frags'] = battles * ExpWTR['expected'][ship_id]['frags'];
							StatShip['expected.planes_killed'] = battles * ExpWTR['expected'][ship_id]['planes_killed'];
							StatShip['expected.capture_points'] = battles * ExpWTR['expected'][ship_id]['capture_points'];
							StatShip['expected.dropped_capture_points'] = battles * ExpWTR['expected'][ship_id]['dropped_capture_points'];
							
							MembersArray[index]['ships'][shipI][type]['wtr'] = calcWTR(StatShip);
							
							StatShipsClass[ship_type]['actual.wins'] += wins;
							StatShipsClass[ship_type]['actual.damage_dealt'] += damage_dealt;
							StatShipsClass[ship_type]['actual.frags'] += frags;
							StatShipsClass[ship_type]['actual.planes_killed'] += planes_killed;
							StatShipsClass[ship_type]['actual.capture_points'] += capture_points;
							StatShipsClass[ship_type]['actual.dropped_capture_points'] += dropped_capture_points;
							StatShipsClass[ship_type]['expected.wins'] += StatShip['expected.wins'];
							StatShipsClass[ship_type]['expected.damage_dealt'] += StatShip['expected.damage_dealt'];
							StatShipsClass[ship_type]['expected.frags'] += StatShip['expected.frags'];
							StatShipsClass[ship_type]['expected.planes_killed'] += StatShip['expected.planes_killed'];
							StatShipsClass[ship_type]['expected.capture_points'] += StatShip['expected.capture_points'];
							StatShipsClass[ship_type]['expected.dropped_capture_points'] += StatShip['expected.dropped_capture_points'];
							
							StatShips['actual.wins'] += wins;
							StatShips['actual.damage_dealt'] += damage_dealt;
							StatShips['actual.frags'] += frags;
							StatShips['actual.planes_killed'] += planes_killed;
							StatShips['actual.capture_points'] += capture_points;
							StatShips['actual.dropped_capture_points'] += dropped_capture_points;
							StatShips['expected.wins'] += StatShip['expected.wins'];
							StatShips['expected.damage_dealt'] += StatShip['expected.damage_dealt'];
							StatShips['expected.frags'] += StatShip['expected.frags'];
							StatShips['expected.planes_killed'] += StatShip['expected.planes_killed'];
							StatShips['expected.capture_points'] += StatShip['expected.capture_points'];
							StatShips['expected.dropped_capture_points'] += StatShip['expected.dropped_capture_points'];
						}else{
							MembersArray[index]['ships'][shipI][type]['wtr'] = 0;
						}
						
						if(Statistics['battles'] > 0){
							MembersArray[index]['info']['statistics'][type]['avg_battles_level'] += ship_tier * Statistics['battles'] / MembersArray[index]['info']['statistics'][type]['battles'];
						}
						
						if(Encyclopedia[ship_id]['tier'] == 10 && type == 'pvp'){
							MembersArray[index]['info']['ships_x_level']++;
						}
						
						if(MembersArray[index]['info']['statistics'][type]['max_ship_level'] < Encyclopedia[ship_id]['tier']){
							MembersArray[index]['info']['statistics'][type]['max_ship_level'] = Encyclopedia[ship_id]['tier'];
						}
					}
				}
				
				for(var tS = 0; tS < typeShip.length; tS++){
					var typeS = typeShip[tS];
					
					MembersArray[index]['info']['statistics'][type]['wr_'+typeS] = calcWR(StatShipsClass[typeS]);
					MembersArray[index]['info']['statistics'][type]['wtr_'+typeS] = calcWTR(StatShipsClass[typeS]);
				}
				
				MembersArray[index]['info']['statistics'][type]['wr'] = calcWR(StatShips);
				MembersArray[index]['info']['statistics'][type]['wtr'] = calcWTR(StatShips);
			}
			
			if(MembersArray[index]['info']['statistics']['pvp_div2']['avg_battles_level'] > MembersArray[index]['info']['statistics']['pvp_div3']['avg_battles_level']){
				MembersArray[index]['info']['statistics']['pvp_div']['avg_battles_level'] = MembersArray[index]['info']['statistics']['pvp_div2']['avg_battles_level'];
			}else{
				MembersArray[index]['info']['statistics']['pvp_div']['avg_battles_level'] = MembersArray[index]['info']['statistics']['pvp_div3']['avg_battles_level'];
			}
			
			if(MembersArray[index]['info']['statistics']['pvp_div2']['max_ship_level'] > MembersArray[index]['info']['statistics']['pvp_div3']['max_ship_level']){
				MembersArray[index]['info']['statistics']['pvp_div']['max_ship_level'] = MembersArray[index]['info']['statistics']['pvp_div2']['max_ship_level'];
			}else{
				MembersArray[index]['info']['statistics']['pvp_div']['max_ship_level'] = MembersArray[index]['info']['statistics']['pvp_div3']['max_ship_level'];
			}
			
			for(var key in MembersArray[index]['achievements']['battle']){
				var battle = MembersArray[index]['info']['statistics']['pvp']['battles'];
				var achievements = MembersArray[index]['achievements']['battle'];
				MembersArray[index]['achievements']['battle'][key+'_battle'] = (battle / achievements[key]).toFixed(0);
			}
			
			return true;
		}
		function calcWR(Stat){
			var rDamage = Stat['damage_dealt'] / Stat['expDamage']; if(isNaN(rDamage)){rDamage = 0;}
			var rFrags = Stat['frags'] / Stat['expFrags']; if(isNaN(rFrags)){rFrags = 0;}
			var rPlanesKilled = Stat['planes_killed'] / Stat['expPlanesKilled']; if(isNaN(rPlanesKilled)){rPlanesKilled = 0;}
			var rCapturePoints = Stat['capture_points'] / Stat['expCapturePoints']; if(isNaN(rCapturePoints)){rCapturePoints = 0;}
			var rDroppedCapturePoints = Stat['dropped_capture_points'] / Stat['expDroppedCapturePoints']; if(isNaN(rDroppedCapturePoints)){rDroppedCapturePoints = 0;}
			
			var rDamagec = Math.max(0, (rDamage - 0.25) / (1 - 0.25));
			var rFragsc = Math.max(0, Math.min(rDamagec + 0.2, (rFrags - 0.12) / (1 - 0.12)));
			var rPlanesKilledc = Math.max(0, Math.min(rDamagec + 0.1, (rPlanesKilled - 0.15) / (1 - 0.15)));
			var rCapturePointsc = Math.max(0, Math.min(rDamagec + 0.1, (rCapturePoints - 0.10) / (1 - 0.10)));
			var rDroppedCapturePointsc = Math.max(0, Math.min(rDamagec + 0.1, (rDroppedCapturePoints - 0.10) / (1 - 0.10)));
			
			var wr = 650 * rDamagec + 150 * rFragsc * rDamagec + 50 * rFragsc * rCapturePointsc + 50 * rFragsc * rDroppedCapturePointsc + 80 * rPlanesKilledc;
			if(isNaN(wr)){wr = 0;}
			
			return wr;
		}
		function calcWTR(Stat){
			var wins = Stat['actual.wins'] / Stat['expected.wins'];
			var damage_dealt = Stat['actual.damage_dealt'] / Stat['expected.damage_dealt'];
			var ship_frags = Stat['actual.frags'] / Stat['expected.frags'];
			var capture_points = Stat['actual.capture_points'] / Stat['expected.capture_points'];
			var dropped_capture_points = Stat['actual.dropped_capture_points'] / Stat['expected.dropped_capture_points'];
			var planes_killed = Stat['actual.planes_killed'] / Stat['expected.planes_killed'];
			var ship_frags_importance_weight = ExpWTR['coefficients']['ship_frags_importance_weight'];

			var frags = 1.0; // fallback to avoid division by zero
			if (Stat['expected.planes_killed'] + Stat['expected.frags'] > 0) { // this should be happening virtually always
				var aircraft_frags_coef = Stat['expected.planes_killed'] / (Stat['expected.planes_killed'] + ship_frags_importance_weight * Stat['expected.frags']);
				var ship_frags_coef = 1 - aircraft_frags_coef;

				if (aircraft_frags_coef == 1) {
					frags = planes_killed;
				} else if (ship_frags_coef == 1) {
					frags = ship_frags;
				} else {
					frags = ship_frags * ship_frags_coef + planes_killed * aircraft_frags_coef;
				}
			}

			var wins_weight = ExpWTR['coefficients']['wins_weight'];
			var damage_weight = ExpWTR['coefficients']['damage_weight'];
			var frags_weight = ExpWTR['coefficients']['frags_weight'];
			var capture_weight = ExpWTR['coefficients']['capture_weight'];
			var dropped_capture_weight = ExpWTR['coefficients']['dropped_capture_weight'];

			var wtr =
				wins                    * wins_weight             +
				damage_dealt            * damage_weight           +
				frags                   * frags_weight            +
				capture_points          * capture_weight          +
				dropped_capture_points  * dropped_capture_weight;

			var nominal_rating = ExpWTR['coefficients']['nominal_rating'];

			wtr = wtr * nominal_rating;
			if(isNaN(wtr)){wtr = 0;}
			
			return wtr;
		}
		function doneEncyclopedia(url, response){
			if(response.status && response.status == "error"){
				errorEncyclopedia();
				return;
			}
			
			Encyclopedia = response['data'];
			
			Encyclopedia['null'] = [];
			Encyclopedia['null']['name'] = '';
		}
		function errorEncyclopedia(url){
			Encyclopedia = null;
			
			console.log('Get Encyclopedia Error');
		}
		function findColorASC(value, stat_type, type){
			if(colorStat[stat_type] === undefined){
				return '';
			}
			
			if(type == 'main'){
				if(isNaN(value) || parseFloat(value) <= parseFloat(colorStat[stat_type][0])){
					return color['very_bad'];
				}else if(parseFloat(value) <= parseFloat(colorStat[stat_type][1])){
					return color['bad'];
				}else if(parseFloat(value) <= parseFloat(colorStat[stat_type][2])){
					return color['normal'];
				}else if(parseFloat(value) <= parseFloat(colorStat[stat_type][3])){
					return color['good'];
				}else if(parseFloat(value) <= parseFloat(colorStat[stat_type][4])){
					return color['very_good'];
				}else if(parseFloat(value) <= parseFloat(colorStat[stat_type][5])){
					return color['unique'];
				}else{
					return color['very_bad'];
				}
			}else{
				return '';
			}
		}
		function findColorDESC(value, stat_type, type){
			if(type == 'main'){
				var return_color = color['very_bad'];
				
				if(isNaN(value)){
					return_color = color['very_bad'];
				}
				if(parseFloat(value) <= parseFloat(colorStat[stat_type][0])){
					return_color = color['very_bad'];
				}
				if(parseFloat(value) <= parseFloat(colorStat[stat_type][1])){
					return_color = color['bad'];
				}
				if(parseFloat(value) <= parseFloat(colorStat[stat_type][2])){
					return_color = color['normal'];
				}
				if(parseFloat(value) <= parseFloat(colorStat[stat_type][3])){
					return_color = color['good'];
				}
				if(parseFloat(value) <= parseFloat(colorStat[stat_type][4])){
					return_color = color['very_good'];
				}
				if(parseFloat(value) <= parseFloat(colorStat[stat_type][5])){
					return_color = color['unique'];
				}
				
				return return_color;
			}else{
				return '';
			}
		}
		function ASC(a){
			return function (b, c){
				if(a == 'account_name'){
					return b[a].toLowerCase() < c[a].toLowerCase() ? -1 : b[a].toLowerCase() > c[a].toLowerCase() ? 1 : 0;
				}else if(a == 'role_i18n'){
					a = 'role_sort_num';
					return parseFloat(b[a]) < parseFloat(c[a]) ? -1 : parseFloat(b[a]) > parseFloat(c[a]) ? 1 : 0;
				}else{
					var attr = a.split('.');
					for(var i = 0; i < attr.length; i++){
						b = b[attr[i]];
						c = c[attr[i]];
					}				
					return parseFloat(b) < parseFloat(c) ? -1 : parseFloat(b) > parseFloat(c) ? 1 : 0;
				}
			}
		};
		function DESC(a){
			return function (b, c){
				if(a == 'account_name'){
					return b[a].toLowerCase() > c[a].toLowerCase() ? -1 : b[a].toLowerCase() < c[a].toLowerCase() ? 1 : 0;
				}else if(a == 'role_i18n'){
					a = 'role_sort_num';
					return parseFloat(b[a]) > parseFloat(c[a]) ? -1 : parseFloat(b[a]) < parseFloat(c[a]) ? 1 : 0;
				}else{
					var attr = a.split('.');
					for(var i = 0; i < attr.length; i++){
						b = b[attr[i]];
						c = c[attr[i]];
					}					
					return parseFloat(b) > parseFloat(c) ? -1 : parseFloat(b) < parseFloat(c) ? 1 : 0;
				}
			}
		};
		function valueFormat(value){
			if(isInt(value)){value = value.toString();}
			var newValue = '';
			var valueSplit = value.split('.');
			
			var numChar = 0;
			for(var i = valueSplit[0].length; i > 0; i--){
				if(numChar < 3){
					newValue = valueSplit[0].substr(i - 1, 1)+''+newValue;
					numChar++;
				}else{
					newValue = valueSplit[0].substr(i - 1, 1)+''+localizationText['num-separator']+''+newValue;
					numChar = 1;
				}
			}
			
			if(valueSplit.length > 1){newValue += localizationText['num-fractional']+''+valueSplit[1];}
			
			return newValue;
		}
		function isInt(value){
			return !isNaN(value) && (function(x){return (x | 0) === x;})(parseFloat(value));
		}
		function htmlParseMemberStatistic(element){
			var value = element.textContent.trim().replace(new RegExp(' ', 'g'), '');
			value = value.replace(/[^0-9,.()% ]/g, "");
			
			value = value.replace('%', '');
			
			value = value.split(localizationText['num-separator']).join('');
			value = value.replace(localizationText['num-fractional'], '.');
			
			if(value.indexOf('(') > -1 && value.indexOf(')') > -1){
				value = (value.split('('))[0];
			}
			
			return value;
		}		
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
			
			applicationId['ru'] = '7149a13b5f5fb7109c5b2400d31b7d42';
			applicationId['na'] = '7225f37baa8385ced2469cbaca8aeaba';
			applicationId['asia'] = '4ce71a5573f43c721806b4b4dadc822d';
			applicationId['eu'] = '953df86f6bca01a7af80c3bdedd9c1d9';
			
			return applicationId[realm].split("").reverse().join("");
		}
		function getUrlVars(url){
			var vars = {};
			var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value){
				vars[key] = value;
			});
			return vars;
		}
		function TimeToDate(time){
			var date = new Date(time * 1000);
			var seconds = date.getSeconds();
			var minutes = date.getMinutes();
			var hour = date.getHours();
			var day = date.getDate();
			var month = (date.getMonth() + 1);
			var year = date.getFullYear();
			
			if(seconds < 10){
				seconds = '0'+seconds;
			}
			if(minutes < 10){
				minutes = '0'+minutes;
			}
			if(hour < 10){
				hour = '0'+hour;
			}
			if(day < 10){
				day = '0'+day;
			}
			if(month < 10){
				month = '0'+month;
			}
			
			return 	day+'.'+month+'.'+year+' '+hour+':'+minutes;
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
						localizationText['userscript-developer'] +
						' <a target="_blank" style="color: #658C4C; font-weight: bold; border-bottom: 1px dotted #658C4C;" href="http://worldofwarships.ru/community/accounts/635939-/">Vov_chiK</a> ' +
						localizationText['userscript-alliance'] +
						' <a target="_blank" style="color: #2CA8C7; font-weight: bold; border-bottom: 1px dotted #2CA8C7;" href="http://ru.wargaming.net/clans/search/#wgsearch&offset=0&limit=10&search=Walkure">Walkure</a>.' +
						'<br /><br />' +
						localizationText['userscript-topic']+' '+
						'<a target="_blank" href="'+WoWsStatInfoLink+'">' +
							WoWsStatInfoLinkName +
						'</a>' +
						'<br /><br />' +
						'<font style="font-size: 16px; color: #658C4C;">'+localizationText['userscript-developer-support']+'</font><br />'+
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
		var WoWsStatInfoBase;
		function openIndexedDB(){
			//indexedDB.deleteDatabase('WoWsStatInfoBase');
			var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB ||  window.msIndexedDB || window.OIndexedDB;
			var openRequest = indexedDB.open("WoWsStatInfoBase", 1);
			
			openRequest.onupgradeneeded = function(e){
				console.log('IndexedDB onupgradeneeded');
				var thisDB = e.target.result;
				if(!thisDB.objectStoreNames.contains("WoWsStatInfoStore")){
					thisDB.createObjectStore("WoWsStatInfoStore");
				}
			};
			openRequest.onsuccess = function(e){
				console.log('IndexedDB onsuccess');
				WoWsStatInfoBase = e.target.result;
			};
			openRequest.onerror = function(e){
				console.log('IndexedDB onerror');
				console.log(e);
				WoWsStatInfoBase = null;
			};			
		}
		function setIndexedDB(Key, Value, Done, Error){
			if(WoWsStatInfoBase === undefined){
				openIndexedDB();
				setTimeout(function(){setIndexedDB(Key, Value, Done, Error);}, 2000);
			}else if(WoWsStatInfoBase == null){
				/* IndexedDB onerror */
			}else{
				var transaction = WoWsStatInfoBase.transaction(["WoWsStatInfoStore"], "readwrite");
				var store = transaction.objectStore("WoWsStatInfoStore");
				
				var request = store.put(Value, Key);
				request.onerror = function(e){
					console.log('onerror setIndexedDB...Key '+Key);
					Error(Value);
				};
				request.onsuccess = function(e){
					console.log('onsuccess setIndexedDB...Key '+Key);
					Done(Value);
				};				
			}
		}
		function getIndexedDB(Key, Done, Error){
			if(WoWsStatInfoBase === undefined){
				openIndexedDB();
				setTimeout(function(){getIndexedDB(Key, Done, Error);}, 2000);
			}else if(WoWsStatInfoBase == null){
				/* IndexedDB onerror */
			}else{
				var transaction = WoWsStatInfoBase.transaction(["WoWsStatInfoStore"], "readonly");
				var store = transaction.objectStore("WoWsStatInfoStore");
				
				var request = store.get(Key);
				request.onerror = function(e){
					console.log('onerror getIndexedDB...Key '+Key);
					Error(null);
				};
				request.onsuccess = function(e){
					console.log('onsuccess getIndexedDB...Key '+Key);
					Done(request.result ? request.result : null);
				};				
			}			
		}
		function onShowMessage(title, content, funcOk, OkText, viewCancel){
			var ui_dialog_title = message.getElementsByClassName("wsi-ui-dialog-title")[0];
			ui_dialog_title.innerHTML = title;
			
			var popup = message.getElementsByClassName("wsi-popup")[0];
			popup.innerHTML = content;
			
			var button_inner = message.getElementsByClassName("wsi-button_inner")[0];
			button_inner.innerHTML = OkText;
			
			var link__cancel = message.getElementsByClassName("wsi-link__cancel")[0];
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
		function getLevelText(level){
			if(1 == level){
				return 'I';
			}else if(2 == level){
				return 'II';
			}else if(3 == level){
				return 'III';
			}else if(4 == level){
				return 'IV';
			}else if(5 == level){
				return 'V';
			}else if(6 == level){
				return 'VI';
			}else if(7 == level){
				return 'VII';
			}else if(8 == level){
				return 'VIII';
			}else if(9 == level){
				return 'IX';
			}else if(10 == level){
				return 'X';
			}
			return '-';
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
		function getRoleText(role){
			var roleText = role;
			if(localizationText[role] !== undefined){roleText = localizationText[role];}
			return roleText;
		}		
		function getRoleSortNum(role){
			if (role == 'commander') return 0;
			else if (role == 'executive_officer') return 1;
			else if (role == 'personnel_officer') return 2;
			else if (role == 'combat_officer') return 3;
			else if (role == 'intelligence_officer') return 4;
			else if (role == 'quartermaster') return 5;	
			else if (role == 'recruitment_officer') return 6;
			else if (role == 'junior_officer') return 7;
			else if (role == 'private') return 8;
			else if (role == 'recruit') return 9;
			else if (role == 'reservist') return 10;
			else return 11;
		}		
		function getlocalizationText(lang){
			var localizationText = [];
			
			{/* Русский */
				localizationText['ru'] = [];
				
				localizationText['ru']['num-separator'] = ' ';
				localizationText['ru']['num-fractional'] = ',';
				
				localizationText['ru']['Box'] = 'Оповещение';
				localizationText['ru']['Ok'] = 'Ok';
				localizationText['ru']['Cancel'] = 'Отмена';
				
				localizationText['ru']['NewVersion'] = 'Вышла новая версия скрипта';
				localizationText['ru']['NewUpdate'] = 'Пожалуйста, обновите скрипт';
				
				localizationText['ru']['ErrorScript'] = 'Во время работы UserScript WoWsStatInfo '+VersionWoWsStatInfo+', возникла ошибка:';
				localizationText['ru']['ErrorSendDeveloper'] = 'Сообщите об ошибке разработчику скрипта.';
				localizationText['ru']['ErrorAPI'] = 'Не удалось получить данные.<br />Cуществует проблема в работе WG API.<br />Попробуйте обновить страницу или зайти позднее.';
				
				localizationText['ru']['userscript-developer'] = 'Разработчик UserScript WoWsStatInfo:';
				localizationText['ru']['userscript-alliance'] = 'член альянса';
				localizationText['ru']['userscript-topic'] = 'Тема на форуме:';
				localizationText['ru']['userscript-developer-support'] = 'Поддержать автора скрипта:';
				
				localizationText['ru']['search-clan-forum'] = 'Поиск клана...';
				
				localizationText['ru']['profile-wows'] = 'Профиль в World of Warships';
				localizationText['ru']['profile-clan'] = 'Клан';
				localizationText['ru']['forum-profile'] = 'Профиль на форуме';
				localizationText['ru']['role'] = 'Должность';
				localizationText['ru']['clan-day'] = 'Количество дней в клане';
				
				localizationText['ru']['charts'] = 'Диаграммы';
				
				localizationText['ru']['generator-userbar'] = 'Создать подпись';
				localizationText['ru']['userbar-bg'] = 'Выберите фон:';
				localizationText['ru']['userbar-filters'] = 'Фильтр:';
				localizationText['ru']['filters-all'] = 'Все';
				localizationText['ru']['filters-clan'] = 'Клан';
				localizationText['ru']['filters-noclassification'] = 'Нет классификации';
				localizationText['ru']['filters-battleship'] = 'Линкоры';
				localizationText['ru']['filters-aircarrier'] = 'Авианосцы';
				localizationText['ru']['filters-cruiser'] = 'Крейсеры';
				localizationText['ru']['filters-destroyer'] = 'Эсминцы';
				localizationText['ru']['filters-japan'] = 'Япония';
				localizationText['ru']['filters-ussr'] = 'CCCP';
				localizationText['ru']['filters-germany'] = 'Германия';
				localizationText['ru']['filters-uk'] = 'Великобритания';
				localizationText['ru']['filters-usa'] = 'США';
				localizationText['ru']['userbar-your-background'] = 'Загрузить свой фон';
				localizationText['ru']['upload-submit'] = 'Загрузить';
				localizationText['ru']['img-max-size'] = 'Максимальный размер: 150КБ';
				localizationText['ru']['img-max-px'] = 'Разрешение изображения: 468х100';
				localizationText['ru']['img-format'] = 'Формат: PNG';
				localizationText['ru']['upload-verification'] = 'Фон будет обновлен после проверки.';
				
				localizationText['ru']['pvp_solo'] = 'Соло';
				localizationText['ru']['pvp_div'] = 'Отряд';
				
				localizationText['ru']['title_battles'] = 'Количество боёв';
				localizationText['ru']['title_wins_percents'] = 'Процент побед';
				localizationText['ru']['title_avg_xp'] = 'Средний опыт за бой';
				localizationText['ru']['title_avg_damage_dealt'] = 'Средний нанесённый урон за бой';
				localizationText['ru']['title_kill_dead'] = 'Отношение уничтожил / убит';
				localizationText['ru']['title_wr'] = 'WR';
				localizationText['ru']['title_avg_battles_level'] = 'Средний уровень кораблей игрока в боях';

				localizationText['ru']['stat-table-1'] = 'Общие результаты';
				localizationText['ru']['battles'] = 'Бои';
				localizationText['ru']['wins'] = 'Победы';
				localizationText['ru']['survived_battles'] = 'Выжил в боях';
				localizationText['ru']['damage_dealt'] = 'Нанесённый урон';
				localizationText['ru']['frags'] = 'Уничтожено кораблей';
				localizationText['ru']['planes_killed'] = 'Уничтожено самолётов';
				localizationText['ru']['capture_points'] = 'Захват базы';
				localizationText['ru']['dropped_capture_points'] = 'Защита базы';

				localizationText['ru']['stat-table-2'] = 'Средние показатели за бой';
				localizationText['ru']['avg_xp'] = 'Опыт';
				localizationText['ru']['avg_damage_dealt'] = 'Нанесённый урон';
				localizationText['ru']['avg_frags'] = 'Уничтожено кораблей';
				localizationText['ru']['avg_planes_killed'] = 'Уничтожено самолётов';
				localizationText['ru']['avg_capture_points'] = 'Захват базы';
				localizationText['ru']['avg_dropped_capture_points'] = 'Защита базы';

				localizationText['ru']['stat-table-3'] = 'Рекордные показатели';
				localizationText['ru']['max_xp'] = 'Опыт';
				localizationText['ru']['max_damage_dealt'] = 'Нанесённый урон';
				localizationText['ru']['max_frags_battle'] = 'Уничтожено кораблей';
				localizationText['ru']['max_planes_killed'] = 'Уничтожено самолётов';
				
				localizationText['ru']['stat-table-4'] = 'Дополнительные результаты';
				localizationText['ru']['battles_days'] = 'Количество боев в день';
				localizationText['ru']['max_ship_level'] = 'Максимальный уровень корабля';
				localizationText['ru']['avg_battles_level'] = 'Средний уровень кораблей игрока в боях';
				localizationText['ru']['number-ships-x'] = 'Количество кораблей 10 уровня';
				localizationText['ru']['wr'] = 'WR';
				localizationText['ru']['wtr'] = 'WTR';
				
				localizationText['ru']['ships_stat'] = 'Расширенная статистика по технике';
				localizationText['ru']['title_ships'] = 'Корабли';
				localizationText['ru']['battleship'] = 'Линкоры';
				localizationText['ru']['aircarrier'] = 'Авианосцы';
				localizationText['ru']['cruiser'] = 'Крейсеры';
				localizationText['ru']['destroyer'] = 'Эсминцы';
				
				localizationText['ru']['block-link-clan-member-history'] = 'Блок "Изменений в составе клана"';
				localizationText['ru']['link-clan-member-history'] = 'Изменения в составе клана';
				localizationText['ru']['member-history-clear'] = 'Очистить историю';
				localizationText['ru']['member-history-join'] = 'Вступил в клан %NAME%';
				localizationText['ru']['member-history-leave'] = 'Покинул клан %NAME%';
				localizationText['ru']['member-history-rename'] = '%OLDNAME% сменил ник на %NEWNAME%';
				localizationText['ru']['member-history-rerole'] = '%NAME% сменил должность %OLDROLE% &rArr; %NEWROLE%';
				localizationText['ru']['member-history-notchange'] = 'С момента установки скрипта WoWsStatInfo и последнего захода на страницу, изменений в составе клана не производились.';
				
				localizationText['ru']['banned'] = 'Забанен';
				localizationText['ru']['commander'] = 'Командующий';
				localizationText['ru']['executive_officer'] = 'Заместитель командующего';
				localizationText['ru']['personnel_officer'] = 'Офицер штаба';
				localizationText['ru']['intelligence_officer'] = 'Офицер разведки';
				localizationText['ru']['quartermaster'] = 'Офицер снабжения';
				localizationText['ru']['recruitment_officer'] = 'Офицер по кадрам';
				localizationText['ru']['junior_officer'] = 'Младший офицер';
				localizationText['ru']['combat_officer'] = 'Командир подразделения';
				localizationText['ru']['private'] = 'Боец';
				localizationText['ru']['recruit'] = 'Новобранец';
				localizationText['ru']['reservist'] = 'Резервист';
				
				localizationText['ru']['get-settings-button'] = 'Настройка';
				localizationText['ru']['set-settings-default'] = 'Настройки по умолчанию';
				localizationText['ru']['table-setting-caption'] = 'Отображать в таблице "Статистика клана"';
				localizationText['ru']['table-setting-structure'] = 'Порядок столбцов в таблице';
				
				localizationText['ru']['statistic-clan-button-0'] = 'Статистика клана';				
				localizationText['ru']['statistic-clan-button-1'] = 'Состав клана';	
				localizationText['ru']['statistic-clan-load-text'] = 'Пожалуйста, подождите ...<br />Получение статистики состава';
				
				localizationText['ru']['statistic-load-text-lost'] = '<br />Осталось &#8776;';
				localizationText['ru']['statistic-load-text-min'] = 'мин.';
				localizationText['ru']['statistic-load-text-sec'] = 'сек.';
				
				localizationText['ru']['account_name'] = 'Имя игрока';
				
				localizationText['ru']['role_i18n'] = 'Должность';
				localizationText['ru']['clan_days'] = 'Дней в клане';
				localizationText['ru']['info.last_battle_time'] = 'Время последнего боя';
				localizationText['ru']['info.logout_at'] = 'Время окончания сессии';
				
				localizationText['ru']['info.statistics.pvp.battles'] = 'Проведено боёв';
				localizationText['ru']['info.statistics.pvp.wins'] = 'Победы';
				localizationText['ru']['info.statistics.pvp.losses'] = 'Поражения';
				localizationText['ru']['info.statistics.pvp.draws'] = 'Ничьи';
				localizationText['ru']['info.statistics.pvp.survived_battles'] = 'Выжил в боях';
				localizationText['ru']['info.statistics.pvp.survived_wins'] = 'Выжил в боях и победил';
				
				localizationText['ru']['info.statistics.pvp.kill_dead'] = 'Уничтожил / Убит';
				localizationText['ru']['info.statistics.pvp.xp'] = 'Суммарный опыт';
				localizationText['ru']['info.statistics.pvp.damage_dealt'] = 'Нанесено дамага';
				
				localizationText['ru']['info.statistics.pvp.frags'] = 'Потоплено кораблей';
				localizationText['ru']['info.statistics.pvp.planes_killed'] = 'Уничтожено самолётов';
				localizationText['ru']['info.statistics.pvp.capture_points'] = 'Очки захвата базы';
				localizationText['ru']['info.statistics.pvp.dropped_capture_points'] = 'Очки защиты базы';
				
				localizationText['ru']['info.statistics.pvp.avg_xp'] = 'Ср. опыт';
				localizationText['ru']['info.statistics.pvp.avg_damage_dealt'] = 'Ср. урон';
				localizationText['ru']['info.statistics.pvp.avg_frags'] = 'Ср. потоплено кораблей';
				localizationText['ru']['info.statistics.pvp.avg_planes_killed'] = 'Ср. уничтожено самолётов';
				localizationText['ru']['info.statistics.pvp.avg_capture_points'] = 'Ср. захвата базы';
				localizationText['ru']['info.statistics.pvp.avg_dropped_capture_points'] = 'Ср. защиты базы';
				
				localizationText['ru']['info.statistics.pvp.max_xp'] = 'Максимальный опыт';
				localizationText['ru']['info.statistics.pvp.max_damage_dealt'] = 'Максимальный урон';
				localizationText['ru']['info.statistics.pvp.max_frags_battle'] = 'Максимально потоплено кораблей';
				localizationText['ru']['info.statistics.pvp.max_planes_killed'] = 'Максимально уничтожено самолётов';
				
				localizationText['ru']['info.statistics.pvp.wins_percents'] = 'Процент побед';
				localizationText['ru']['info.statistics.pvp.survived_battles_percents'] = 'Процент выживания';
				
				localizationText['ru']['info.statistics.pvp.wr'] = 'WR';
				localizationText['ru']['info.statistics.pvp.wtr'] = 'WTR';
				
				localizationText['ru']['info.ships_x_level'] = '10 lvl';
			}
			
			{/* English */
				localizationText['en'] = [];
				
				localizationText['en'] = jQ.extend([], localizationText['ru']);
				
				localizationText['en']['num-separator'] = ',';
				localizationText['en']['num-fractional'] = '.';

				localizationText['en']['Box'] = 'Notification';
				localizationText['en']['Ok'] = 'Ok';
				localizationText['en']['Cancel'] = 'Cancel';
				
				localizationText['en']['NewVersion'] = 'New version was released';
				localizationText['en']['NewUpdate'] = 'Please, update the extension';
				
				localizationText['en']['ErrorScript'] = 'An error occurred while running UserScript WoWsStatInfo '+VersionWoWsStatInfo+', script:';
				localizationText['en']['ErrorSendDeveloper'] = 'Please, inform script developer about this error.';
				localizationText['en']['ErrorAPI'] = 'Failed to get the data.<br />There exists a problem in the work of WG API.<br />Try refreshing the page, or go later.';
				
				localizationText['en']['userscript-developer'] = 'Developer - UserScript WoWsStatInfo:';
				localizationText['en']['userscript-alliance'] = 'аlliance member';
				localizationText['en']['userscript-topic'] = 'Forum topic:';
				localizationText['en']['userscript-developer-support'] = 'Ways to support the developer:';
				
				localizationText['en']['search-clan-forum'] = 'Clan Search...';
				
				localizationText['en']['profile-wows'] = 'World of Warships profile';
				localizationText['en']['profile-clan'] = 'Clan';
				localizationText['en']['forum-profile'] = 'Forum profile';
				localizationText['en']['role'] = 'Alliance rank';
				localizationText['en']['clan-day'] = 'Days in clan';
				
				localizationText['en']['charts'] = 'Charts';
				
				localizationText['en']['generator-userbar'] = 'Create signature';
				localizationText['en']['userbar-bg'] = 'Choose a background:';
				localizationText['en']['userbar-filters'] = 'Filters:';
				localizationText['en']['filters-all'] = 'All';
				localizationText['en']['filters-clan'] = 'Clan';
				localizationText['en']['filters-noclassification'] = 'No Classification';
				localizationText['en']['filters-battleship'] = 'Battleships';
				localizationText['en']['filters-aircarrier'] = 'Aircraft carriers';
				localizationText['en']['filters-cruiser'] = 'Cruisers';
				localizationText['en']['filters-destroyer'] = 'Destroyers';
				localizationText['en']['filters-japan'] = 'Japan';
				localizationText['en']['filters-ussr'] = 'U.S.S.R.';
				localizationText['en']['filters-germany'] = 'Germany';
				localizationText['en']['filters-uk'] = 'U.K.';
				localizationText['en']['filters-usa'] = 'U.S.A.';
				localizationText['en']['userbar-your-background'] = 'Upload your background';
				localizationText['en']['upload-submit'] = 'Upload';
				localizationText['en']['img-max-size'] = 'Maximum size: 150 KB';
				localizationText['en']['img-max-px'] = 'Image Resolution: 468x100';
				localizationText['en']['img-format'] = 'Format: PNG';
				localizationText['en']['upload-verification'] = 'Background will be updated after verification.';
				
				localizationText['en']['pvp_solo'] = 'Solo';
				localizationText['en']['pvp_div'] = 'Division';
				
				localizationText['en']['title_battles'] = 'Battles Fought';
				localizationText['en']['title_wins_percents'] = 'Victories / Battles';
				localizationText['en']['title_avg_xp'] = 'AVERAGE EXPERIENCE PER BATTLE';
				localizationText['en']['title_avg_damage_dealt'] = 'Average Damage Caused per Battle';
				localizationText['en']['title_kill_dead'] = 'Kill / Death Ratio';
				localizationText['en']['title_wr'] = 'WR';
				localizationText['en']['title_avg_battles_level'] = 'Average tier of warships used by player';

				localizationText['en']['stat-table-1'] = 'Overall Results';
				localizationText['en']['battles'] = 'Battles';
				localizationText['en']['wins'] = 'Victories';
				localizationText['en']['survived_battles'] = 'Battles survived';
				localizationText['en']['damage_dealt'] = 'Damage caused';
				localizationText['en']['frags'] = 'Warships destroyed';
				localizationText['en']['planes_killed'] = 'Aircraft destroyed';
				localizationText['en']['capture_points'] = 'Base capture';
				localizationText['en']['dropped_capture_points'] = 'Base defense';

				localizationText['en']['stat-table-2'] = 'Average Score per Battle';
				localizationText['en']['avg_xp'] = 'Experience';
				localizationText['en']['avg_damage_dealt'] = 'Damage caused';
				localizationText['en']['avg_frags'] = 'Warships destroyed';
				localizationText['en']['avg_planes_killed'] = 'Aircraft destroyed';
				localizationText['en']['avg_capture_points'] = 'Base capture';
				localizationText['en']['avg_dropped_capture_points'] = 'Base defense';

				localizationText['en']['stat-table-3'] = 'Highest Score';
				localizationText['en']['max_xp'] = 'Experience';
				localizationText['en']['max_damage_dealt'] = 'Damage caused';
				localizationText['en']['max_frags_battle'] = 'Warships destroyed';
				localizationText['en']['max_planes_killed'] = 'Aircraft destroyed';
				
				localizationText['en']['stat-table-4'] = 'Additional Results';
				localizationText['en']['battles_days'] = 'Battles per day';
				localizationText['en']['max_ship_level'] = 'The maximum tier of ship';
				localizationText['en']['avg_battles_level'] = 'Average tier of warships used by player';
				localizationText['en']['number-ships-x'] = 'Number of X Tier ships';
				localizationText['en']['wr'] = 'WR';
				localizationText['en']['wtr'] = 'WTR';
				
				localizationText['en']['ships_stat'] = 'Detailed Warship Statistics';
				localizationText['en']['title_ships'] = 'Warships';
				localizationText['en']['battleship'] = 'Battleships';
				localizationText['en']['aircarrier'] = 'Aircraft carriers';
				localizationText['en']['cruiser'] = 'Cruisers';
				localizationText['en']['destroyer'] = 'Destroyers';
				
				localizationText['en']['block-link-clan-member-history'] = '"Changes in clan members" section';
				localizationText['en']['link-clan-member-history'] = 'Changes in clan members';
				localizationText['en']['member-history-clear'] = 'Clear history';
				localizationText['en']['member-history-join'] = 'Entered %NAME% clan';
				localizationText['en']['member-history-leave'] = 'Left %NAME% clan';
				localizationText['en']['member-history-rename'] = '%OLDNAME% has changed his nickname to %NEWNAME%';
				localizationText['en']['member-history-rerole'] = '%NAME% has changed his position in clan rank: %OLDROLE% &rArr; %NEWROLE%';
				localizationText['en']['member-history-notchange'] = 'Since installing WoWsStatInfo script and last entering on this page no changes in clan members were made.';
				
				localizationText['en']['banned'] = 'Banned';
				localizationText['en']['commander'] = 'Commander';
				localizationText['en']['executive_officer'] = 'Executive Officer';
				localizationText['en']['personnel_officer'] = 'Personnel Officer';
				localizationText['en']['intelligence_officer'] = 'Intelligence Officer';
				localizationText['en']['quartermaster'] = 'Quartermaster';
				localizationText['en']['recruitment_officer'] = 'Recruitment Officer';
				localizationText['en']['junior_officer'] = 'Junior Officer';
				localizationText['en']['combat_officer'] = 'Combat Officer';
				localizationText['en']['private'] = 'Private';
				localizationText['en']['recruit'] = 'Recruit';
				localizationText['en']['reservist'] = 'Reservist';

				localizationText['en']['get-settings-button'] = 'Settings';
				localizationText['en']['set-settings-default'] = 'The default settings';
				localizationText['en']['table-setting-caption'] = 'View column table "Clan Statistics"';
				localizationText['en']['table-setting-structure'] = 'Sort column table';
				
				localizationText['en']['statistic-clan-button-0'] = 'Clan Statistics';				
				localizationText['en']['statistic-clan-button-1'] = 'Clan Composition';	
				localizationText['en']['statistic-clan-load-text'] = 'Please wait ...<br />Getting statistics';
				
				localizationText['en']['statistic-load-text-lost'] = '<br />time remaining &#8776;';
				localizationText['en']['statistic-load-text-min'] = 'min.';
				localizationText['en']['statistic-load-text-sec'] = 'sec.';
				
				localizationText['en']['account_name'] = 'Player name';
				
				localizationText['en']['role_i18n'] = 'Role';
				localizationText['en']['clan_days'] = 'Days in clan';
				localizationText['en']['info.last_battle_time'] = 'Last battle time';
				localizationText['en']['info.logout_at'] = 'End time of last game session';
				
				localizationText['en']['info.statistics.pvp.battles'] = 'Battles';
				localizationText['en']['info.statistics.pvp.wins'] = 'Victories';
				localizationText['en']['info.statistics.pvp.losses'] = 'Defeats';
				localizationText['en']['info.statistics.pvp.draws'] = 'Draws';
				localizationText['en']['info.statistics.pvp.survived_battles'] = 'Battles survived';
				localizationText['en']['info.statistics.pvp.survived_wins'] = 'Victories in battles survived';
				
				localizationText['en']['info.statistics.pvp.kill_dead'] = 'Kill / Death';
				localizationText['en']['info.statistics.pvp.xp'] = 'Total Experience';
				localizationText['en']['info.statistics.pvp.damage_dealt'] = 'Damage caused';
				
				localizationText['en']['info.statistics.pvp.frags'] = 'Warships destroyed';
				localizationText['en']['info.statistics.pvp.planes_killed'] = 'Aircraft destroyed';
				localizationText['en']['info.statistics.pvp.capture_points'] = 'Base capture points';
				localizationText['en']['info.statistics.pvp.dropped_capture_points'] = 'Base defense points';
				
				localizationText['en']['info.statistics.pvp.avg_xp'] = 'Avg experience';
				localizationText['en']['info.statistics.pvp.avg_damage_dealt'] = 'Avg Damage caused';
				localizationText['en']['info.statistics.pvp.avg_frags'] = 'Avg warships destroyed';
				localizationText['en']['info.statistics.pvp.avg_planes_killed'] = 'Avg aircraft destroyed';
				localizationText['en']['info.statistics.pvp.avg_capture_points'] = 'Avg Base capture';
				localizationText['en']['info.statistics.pvp.avg_dropped_capture_points'] = 'Avg Base defense';
				
				localizationText['en']['info.statistics.pvp.max_xp'] = 'Maximum experience';
				localizationText['en']['info.statistics.pvp.max_damage_dealt'] = 'Maximum Damage caused';
				localizationText['en']['info.statistics.pvp.max_frags_battle'] = 'Maximum warships destroyed';
				localizationText['en']['info.statistics.pvp.max_planes_killed'] = 'Maximum aircraft destroyed';
				
				localizationText['en']['info.statistics.pvp.wins_percents'] = 'Percent of victories';
				localizationText['en']['info.statistics.pvp.survived_battles_percents'] = 'Percent of survived';
				
				localizationText['en']['info.statistics.pvp.wr'] = 'WR';
				localizationText['en']['info.statistics.pvp.wtr'] = 'WTR';
				
				localizationText['en']['info.ships_x_level'] = '10 lvl';
			}
			
			{/* Français */
				localizationText['fr'] = [];
				
				localizationText['fr'] = jQ.extend([], localizationText['en']);
				
				localizationText['fr']['num-separator'] = ' ';
				localizationText['fr']['num-fractional'] = ',';
				
				localizationText['fr']['pvp_solo'] = 'Solo';
				localizationText['fr']['pvp_div'] = 'Division';
				
				localizationText['fr']['title_battles'] = 'Batailles menées';
				localizationText['fr']['title_wins_percents'] = 'Taux de victoires/batailles';
				localizationText['fr']['title_avg_xp'] = 'EXPÉRIENCE MOYENNE PAR BATAILLE';
				localizationText['fr']['title_avg_damage_dealt'] = 'Dégâts moyens causés par bataille';
				localizationText['fr']['title_kill_dead'] = 'Taux des tués/morts';
				localizationText['fr']['title_wr'] = 'WR';
				localizationText['fr']['title_avg_battles_level'] = 'Niveau moyen de navires de guerre utilisée par le joueur';

				localizationText['fr']['stat-table-1'] = 'Résultats généraux';
				localizationText['fr']['battles'] = 'Batailles';
				localizationText['fr']['wins'] = 'Victoires';
				localizationText['fr']['survived_battles'] = 'Batailles survécues';
				localizationText['fr']['damage_dealt'] = 'Dégâts occasionnés';
				localizationText['fr']['frags'] = 'Navires de guerre détruits';
				localizationText['fr']['planes_killed'] = 'Avions détruits';
				localizationText['fr']['capture_points'] = 'Points de capture';
				localizationText['fr']['dropped_capture_points'] = 'Points de défense';

				localizationText['fr']['stat-table-2'] = 'Score moyen par bataille';
				localizationText['fr']['avg_xp'] = 'Expérience';
				localizationText['fr']['avg_damage_dealt'] = 'Dégâts occasionnés';
				localizationText['fr']['avg_frags'] = 'Navires de guerre détruits';
				localizationText['fr']['avg_planes_killed'] = 'Avions détruits';
				localizationText['fr']['avg_capture_points'] = 'Points de capture';
				localizationText['fr']['avg_dropped_capture_points'] = 'Points de défense';

				localizationText['fr']['stat-table-3'] = 'Score record';
				localizationText['fr']['max_xp'] = 'Expérience';
				localizationText['fr']['max_damage_dealt'] = 'Dégâts occasionnés';
				localizationText['fr']['max_frags_battle'] = 'Navires de guerre détruits';
				localizationText['fr']['max_planes_killed'] = 'Avions détruits';
				
				localizationText['fr']['stat-table-4'] = 'Résultats supplémentaires';
				localizationText['fr']['battles_days'] = 'Batailles par jour';
				localizationText['fr']['max_ship_level'] = 'Le niveau maximum de navire';
				localizationText['fr']['avg_battles_level'] = 'Niveau moyen de navires de guerre utilisée par le joueur';
				localizationText['fr']['number-ships-x'] = 'Nombre de navires X Tier';
				localizationText['fr']['wr'] = 'WR';
				localizationText['fr']['wtr'] = 'WTR';
				
				localizationText['fr']['ships_stat'] = 'Statistiques détaillées du navire';
				localizationText['fr']['title_ships'] = 'Navires de guerre';
				localizationText['fr']['battleship'] = 'Cuirassés';
				localizationText['fr']['aircarrier'] = 'Porte-avions';
				localizationText['fr']['cruiser'] = 'Croiseurs';
				localizationText['fr']['destroyer'] = 'Destroyers';
			}
			
			{/* Deutsch */
				localizationText['de'] = [];
			
				localizationText['de'] = jQ.extend([], localizationText['en']);
				
				localizationText['de']['num-separator'] = '.';
				localizationText['de']['num-fractional'] = ',';
				
				localizationText['de']['pvp_solo'] = 'Solo';
				localizationText['de']['pvp_div'] = 'Division';
				
				localizationText['de']['title_battles'] = 'Gekämpfte Gefechte';
				localizationText['de']['title_wins_percents'] = 'Verhältnis Siege/Gefechte';
				localizationText['de']['title_avg_xp'] = 'MITTLERE ERFAHRUNG JE GEFECHT';
				localizationText['de']['title_avg_damage_dealt'] = 'Mittlerer verursachter Schaden je Gefecht';
				localizationText['de']['title_kill_dead'] = 'Verhältnis Abschüsse/Verluste';
				localizationText['de']['title_wr'] = 'WR';
				localizationText['de']['title_avg_battles_level'] = 'Durchschnittliche Tier von Kriegsschiffen durch Spieler verwendet';

				localizationText['de']['stat-table-1'] = 'Gesamtergebnisse';
				localizationText['de']['battles'] = 'Gefechte';
				localizationText['de']['wins'] = 'Siege';
				localizationText['de']['survived_battles'] = 'Überlebte Gefechte';
				localizationText['de']['damage_dealt'] = 'Schaden verursacht';
				localizationText['de']['frags'] = 'Zerstörte Kriegsschiffe';
				localizationText['de']['planes_killed'] = 'Flugzeuge abgeschossen';
				localizationText['de']['capture_points'] = 'Basiseroberung';
				localizationText['de']['dropped_capture_points'] = 'Basisverteidigung';

				localizationText['de']['stat-table-2'] = 'Mittlere Punktzahl je Gefecht';
				localizationText['de']['avg_xp'] = 'Erfahrung';
				localizationText['de']['avg_damage_dealt'] = 'Schaden verursacht';
				localizationText['de']['avg_frags'] = 'Zerstörte Kriegsschiffe';
				localizationText['de']['avg_planes_killed'] = 'Flugzeuge abgeschossen';
				localizationText['de']['avg_capture_points'] = 'Basiseroberung';
				localizationText['de']['avg_dropped_capture_points'] = 'Basisverteidigung';

				localizationText['de']['stat-table-3'] = 'Rekordpunktzahl';
				localizationText['de']['max_xp'] = 'Erfahrung';
				localizationText['de']['max_damage_dealt'] = 'Schaden verursacht';
				localizationText['de']['max_frags_battle'] = 'Zerstörte Kriegsschiffe';
				localizationText['de']['max_planes_killed'] = 'Flugzeuge abgeschossen';
				
				localizationText['de']['stat-table-4'] = 'Weitere Ergebnisse';
				localizationText['de']['battles_days'] = 'Battles pro Tag';
				localizationText['de']['max_ship_level'] = 'Die maximale Stufe der Schiffs';
				localizationText['de']['avg_battles_level'] = 'Durchschnittliche Tier von Kriegsschiffen durch Spieler verwendet';
				localizationText['de']['number-ships-x'] = 'Anzahl der X Tier Schiffe';
				localizationText['de']['wr'] = 'WR';
				localizationText['de']['wtr'] = 'WTR';
				
				localizationText['de']['ships_stat'] = 'Detaillierte Schiffstatistik';
				localizationText['de']['title_ships'] = 'Kriegsschiffe';
				localizationText['de']['battleship'] = 'Schlachtschiffe';
				localizationText['de']['aircarrier'] = 'Flugzeugträger';
				localizationText['de']['cruiser'] = 'Kreuzer';
				localizationText['de']['destroyer'] = 'Zerstörer';
			}
			
			{/* Türkçe */
				localizationText['tr'] = [];
			
				localizationText['tr'] = jQ.extend([], localizationText['en']);
				
				localizationText['tr']['num-separator'] = '.';
				localizationText['tr']['num-fractional'] = ',';
				
				localizationText['tr']['pvp_solo'] = 'Solo';
				localizationText['tr']['pvp_div'] = 'Bölünme';
				
				localizationText['tr']['title_battles'] = 'Katılınan Savaşlar';
				localizationText['tr']['title_wins_percents'] = 'Zaferler/Savaşlar';
				localizationText['tr']['title_avg_xp'] = 'SAVAŞ BAŞINA ORTALAMA DENEYİM';
				localizationText['tr']['title_avg_damage_dealt'] = 'Savaş Başına Ortalama Verilen Hasar';
				localizationText['tr']['title_kill_dead'] = 'Yok Etme/Ölüm Oranı';
				localizationText['tr']['title_wr'] = 'WR';
				localizationText['tr']['title_avg_battles_level'] = 'Oyuncu tarafından kullanılan savaş gemilerinin ortalama katmanlı';

				localizationText['tr']['stat-table-1'] = 'Genel Sonuçlar';
				localizationText['tr']['battles'] = 'Savaşlar';
				localizationText['tr']['wins'] = 'Zaferler';
				localizationText['tr']['survived_battles'] = 'Canlı kalınan savaşlar';
				localizationText['tr']['damage_dealt'] = 'Verilen hasar';
				localizationText['tr']['frags'] = 'Yok edilen savaş gemileri';
				localizationText['tr']['planes_killed'] = 'Yok edilen uçak';
				localizationText['tr']['capture_points'] = 'Üs işgali';
				localizationText['tr']['dropped_capture_points'] = 'Üs savunması';

				localizationText['tr']['stat-table-2'] = 'Savaş Başına Ortalama Skor';
				localizationText['tr']['avg_xp'] = 'Deneyim';
				localizationText['tr']['avg_damage_dealt'] = 'Verilen hasar';
				localizationText['tr']['avg_frags'] = 'Yok edilen savaş gemileri';
				localizationText['tr']['avg_planes_killed'] = 'Yok edilen uçak';
				localizationText['tr']['avg_capture_points'] = 'Üs işgali';
				localizationText['tr']['avg_dropped_capture_points'] = 'Üs savunması';

				localizationText['tr']['stat-table-3'] = 'En Yüksek Skor';
				localizationText['tr']['max_xp'] = 'Deneyim';
				localizationText['tr']['max_damage_dealt'] = 'Verilen hasar';
				localizationText['tr']['max_frags_battle'] = 'Yok edilen savaş gemileri';
				localizationText['tr']['max_planes_killed'] = 'Yok edilen uçak';
				
				localizationText['tr']['stat-table-4'] = 'Ek Sonuçlar';
				localizationText['tr']['battles_days'] = 'Günde Savaşları';
				localizationText['tr']['max_ship_level'] = 'Geminin maksimum katmanlı';
				localizationText['tr']['avg_battles_level'] = 'Oyuncu tarafından kullanılan savaş gemilerinin ortalama katmanlı';
				localizationText['tr']['number-ships-x'] = 'X Tier gemilerin sayısı';
				localizationText['tr']['wr'] = 'WR';
				localizationText['tr']['wtr'] = 'WTR';
				
				localizationText['tr']['ships_stat'] = 'Detaylı Gemi İstatistikleri';
				localizationText['tr']['title_ships'] = 'Savaş Gemileri';
				localizationText['tr']['battleship'] = 'Zırhlılar';
				localizationText['tr']['aircarrier'] = 'Uçak gemileri';
				localizationText['tr']['cruiser'] = 'Kruvazörler';
				localizationText['tr']['destroyer'] = 'Muhripler';
			}
			
			{/* Español EU */
				localizationText['es'] = [];
			
				localizationText['es'] = jQ.extend([], localizationText['en']);
				
				localizationText['es']['num-separator'] = '.';
				localizationText['es']['num-fractional'] = ',';
				
				localizationText['es']['pvp_solo'] = 'Solo';
				localizationText['es']['pvp_div'] = 'División';
				
				localizationText['es']['title_battles'] = 'Batallas jugadas';
				localizationText['es']['title_wins_percents'] = 'Victorias/batallas';
				localizationText['es']['title_avg_xp'] = 'EXPERIENCIA MEDIA POR BATALLA';
				localizationText['es']['title_avg_damage_dealt'] = 'Daño medio causado por batalla';
				localizationText['es']['title_kill_dead'] = 'Tasa muertos/muertes';
				localizationText['es']['title_wr'] = 'WR';
				localizationText['es']['title_avg_battles_level'] = 'Niveles promedio de los buques de guerra utilizado por jugador';

				localizationText['es']['stat-table-1'] = 'Resultados generales';
				localizationText['es']['battles'] = 'Batallas';
				localizationText['es']['wins'] = 'Victorias';
				localizationText['es']['survived_battles'] = 'Batallas como superviviente';
				localizationText['es']['damage_dealt'] = 'Daño causado';
				localizationText['es']['frags'] = 'Barcos de guerra destruidos';
				localizationText['es']['planes_killed'] = 'Aviones destruidos';
				localizationText['es']['capture_points'] = 'Captura de base';
				localizationText['es']['dropped_capture_points'] = 'Defensa de base';

				localizationText['es']['stat-table-2'] = 'Puntuación media por batalla';
				localizationText['es']['avg_xp'] = 'Experiencia';
				localizationText['es']['avg_damage_dealt'] = 'Daño causado';
				localizationText['es']['avg_frags'] = 'Barcos de guerra destruidos';
				localizationText['es']['avg_planes_killed'] = 'Aviones destruidos';
				localizationText['es']['avg_capture_points'] = 'Captura de base';
				localizationText['es']['avg_dropped_capture_points'] = 'Defensa de base';

				localizationText['es']['stat-table-3'] = 'En Yüksek Skor';
				localizationText['es']['max_xp'] = 'Experiencia';
				localizationText['es']['max_damage_dealt'] = 'Daño causado';
				localizationText['es']['max_frags_battle'] = 'Barcos de guerra destruidos';
				localizationText['es']['max_planes_killed'] = 'Aviones destruidos';
				
				localizationText['es']['stat-table-4'] = 'Resultados adicionales';
				localizationText['es']['battles_days'] = 'Batallas por día';
				localizationText['es']['max_ship_level'] = 'El nivel máximo de la nave';
				localizationText['es']['avg_battles_level'] = 'Niveles promedio de los buques de guerra utilizado por jugador';
				localizationText['es']['number-ships-x'] = 'Número de buques de Nivel X';
				localizationText['es']['wr'] = 'WR';
				localizationText['es']['wtr'] = 'WTR';
				
				localizationText['es']['ships_stat'] = 'Estadísticas detalladas del barco';
				localizationText['es']['title_ships'] = 'Barcos';
				localizationText['es']['battleship'] = 'Acorazados';
				localizationText['es']['aircarrier'] = 'Portaaviones';
				localizationText['es']['cruiser'] = 'Cruceros';
				localizationText['es']['destroyer'] = 'Destructores';
			}
			
			{/* Español NA */
				localizationText['es-mx'] = [];
			
				localizationText['es-mx'] = jQ.extend([], localizationText['en']);
				
				localizationText['es-mx']['num-separator'] = ' ';
				localizationText['es-mx']['num-fractional'] = '.';
				
				localizationText['es-mx']['pvp_solo'] = 'Solo';
				localizationText['es-mx']['pvp_div'] = 'División';
				
				localizationText['es-mx']['title_battles'] = 'Batallas Luchadas';
				localizationText['es-mx']['title_wins_percents'] = 'Victorias';
				localizationText['es-mx']['title_avg_xp'] = 'EXPERIENCIA PROMEDIO POR BATALLA';
				localizationText['es-mx']['title_avg_damage_dealt'] = 'Daño en Promedio Causado por Batalla';
				localizationText['es-mx']['title_kill_dead'] = 'Radio de Destrucción / Muerte';
				localizationText['es-mx']['title_wr'] = 'WR';
				localizationText['es-mx']['title_avg_battles_level'] = 'Niveles promedio de los buques de guerra utilizado por jugador';

				localizationText['es-mx']['stat-table-1'] = 'Resultados en General';
				localizationText['es-mx']['battles'] = 'Batallas';
				localizationText['es-mx']['wins'] = 'Victorias';
				localizationText['es-mx']['survived_battles'] = 'Batallas sobrevividas';
				localizationText['es-mx']['damage_dealt'] = 'Daño causado';
				localizationText['es-mx']['frags'] = 'Barcos de guerra destruidos';
				localizationText['es-mx']['planes_killed'] = 'Aviones destruidos';
				localizationText['es-mx']['capture_points'] = 'Captura de base';
				localizationText['es-mx']['dropped_capture_points'] = 'Defensa de base';

				localizationText['es-mx']['stat-table-2'] = 'Resultados promedio por batalla';
				localizationText['es-mx']['avg_xp'] = 'XP';
				localizationText['es-mx']['avg_damage_dealt'] = 'Daño causado';
				localizationText['es-mx']['avg_frags'] = 'Barcos de guerra destruidos';
				localizationText['es-mx']['avg_planes_killed'] = 'Aviones destruidos';
				localizationText['es-mx']['avg_capture_points'] = 'Captura de base';
				localizationText['es-mx']['avg_dropped_capture_points'] = 'Defensa de base';

				localizationText['es-mx']['stat-table-3'] = 'Puntaje más Alto';
				localizationText['es-mx']['max_xp'] = 'XP';
				localizationText['es-mx']['max_damage_dealt'] = 'Daño causado';
				localizationText['es-mx']['max_frags_battle'] = 'Barcos de guerra destruidos';
				localizationText['es-mx']['max_planes_killed'] = 'Aviones destruidos';
				
				localizationText['es-mx']['stat-table-4'] = 'Resultados adicionales';
				localizationText['es-mx']['battles_days'] = 'Batallas por día';
				localizationText['es-mx']['max_ship_level'] = 'El nivel máximo de la nave';
				localizationText['es-mx']['avg_battles_level'] = 'Niveles promedio de los buques de guerra utilizado por jugador';
				localizationText['es-mx']['number-ships-x'] = 'Número de buques de Nivel X';
				localizationText['es-mx']['wr'] = 'WR';
				localizationText['es-mx']['wtr'] = 'WTR';
				
				localizationText['es-mx']['ships_stat'] = 'Estadísticas detalladas de los Barcos de Guerra';
				localizationText['es-mx']['title_ships'] = 'Barcos de Guerra';
				localizationText['es-mx']['battleship'] = 'Acorazados';
				localizationText['es-mx']['aircarrier'] = 'Portaaviones';
				localizationText['es-mx']['cruiser'] = 'Cruceros';
				localizationText['es-mx']['destroyer'] = 'Destructores';
			}
			
			{/* Português */
				localizationText['pt-br'] = [];
			
				localizationText['pt-br'] = jQ.extend([], localizationText['en']);
				
				localizationText['pt-br']['num-separator'] = '.';
				localizationText['pt-br']['num-fractional'] = ',';
				
				localizationText['pt-br']['pvp_solo'] = 'Solo';
				localizationText['pt-br']['pvp_div'] = 'Divisão';
				
				localizationText['pt-br']['title_battles'] = 'Batalhas Disputadas';
				localizationText['pt-br']['title_wins_percents'] = 'Taxa de Vitórias/Batalhas';
				localizationText['pt-br']['title_avg_xp'] = 'EXPERIÊNCIA MÉDIA POR BATALHA';
				localizationText['pt-br']['title_avg_damage_dealt'] = 'Dano Médio Causado por Batalha';
				localizationText['pt-br']['title_kill_dead'] = 'Taxa de Morte/Destruição';
				localizationText['pt-br']['title_wr'] = 'WR';
				localizationText['pt-br']['title_avg_battles_level'] = 'Nível médio de navios de guerra usados por jogador';

				localizationText['pt-br']['stat-table-1'] = 'Resultados Gerais';
				localizationText['pt-br']['battles'] = 'Batalhas';
				localizationText['pt-br']['wins'] = 'Vitórias';
				localizationText['pt-br']['survived_battles'] = 'Batalhas Sobrevividas';
				localizationText['pt-br']['damage_dealt'] = 'Dano Causado';
				localizationText['pt-br']['frags'] = 'Navios Destruídos';
				localizationText['pt-br']['planes_killed'] = 'Aeronaves Destruídas';
				localizationText['pt-br']['capture_points'] = 'Captura de Base';
				localizationText['pt-br']['dropped_capture_points'] = 'Defesa de Base';

				localizationText['pt-br']['stat-table-2'] = 'Pontuação Média por Batalha';
				localizationText['pt-br']['avg_xp'] = 'Experiência';
				localizationText['pt-br']['avg_damage_dealt'] = 'Dano Causado';
				localizationText['pt-br']['avg_frags'] = 'Navios Destruídos';
				localizationText['pt-br']['avg_planes_killed'] = 'Aeronaves Destruídas';
				localizationText['pt-br']['avg_capture_points'] = 'Captura de Base';
				localizationText['pt-br']['avg_dropped_capture_points'] = 'Defesa de Base';

				localizationText['pt-br']['stat-table-3'] = 'Pontuação Recorde';
				localizationText['pt-br']['max_xp'] = 'Experiência';
				localizationText['pt-br']['max_damage_dealt'] = 'Dano Causado';
				localizationText['pt-br']['max_frags_battle'] = 'Navios Destruídos';
				localizationText['pt-br']['max_planes_killed'] = 'Aeronaves Destruídas';
				
				localizationText['pt-br']['stat-table-4'] = 'Resultados adicionais';
				localizationText['pt-br']['battles_days'] = 'Batalhas por dia';
				localizationText['pt-br']['max_ship_level'] = 'O nível máximo de navio';
				localizationText['pt-br']['avg_battles_level'] = 'Nível médio de navios de guerra usados por jogador';
				localizationText['pt-br']['number-ships-x'] = 'Número de X navios de Nível';
				localizationText['pt-br']['wr'] = 'WR';
				localizationText['pt-br']['wtr'] = 'WTR';
				
				localizationText['pt-br']['ships_stat'] = 'Estatísticas Detalhadas de Navios';
				localizationText['pt-br']['title_ships'] = 'Navios';
				localizationText['pt-br']['battleship'] = 'Encouraçados';
				localizationText['pt-br']['aircarrier'] = 'Porta-aviões';
				localizationText['pt-br']['cruiser'] = 'Cruzadores';
				localizationText['pt-br']['destroyer'] = 'Contratorpedeiros';
			}
			
			{/* Čeština */
				localizationText['cs'] = [];
			
				localizationText['cs'] = jQ.extend([], localizationText['en']);
				
				localizationText['cs']['num-separator'] = ' ';
				localizationText['cs']['num-fractional'] = ',';
				
				localizationText['cs']['pvp_solo'] = 'Solo';
				localizationText['cs']['pvp_div'] = 'Divize';
				
				localizationText['cs']['title_battles'] = 'Odehráno bitev';
				localizationText['cs']['title_wins_percents'] = 'Poměr Vítězství/Bitev';
				localizationText['cs']['title_avg_xp'] = 'PRŮMĚRNÉ ZKUŠENOSTI ZA BITVU';
				localizationText['cs']['title_avg_damage_dealt'] = 'Průměrné poškození způsobené za bitvu';
				localizationText['cs']['title_kill_dead'] = 'Poměr Zabití/Smrtí';
				localizationText['cs']['title_wr'] = 'WR';
				localizationText['cs']['title_avg_battles_level'] = 'Průměrná vrstva válečných lodí používaný přehrávačem';

				localizationText['cs']['stat-table-1'] = 'Celkové výsledky';
				localizationText['cs']['battles'] = 'Bitvy';
				localizationText['cs']['wins'] = 'Vítězství';
				localizationText['cs']['survived_battles'] = 'Přežito bitev';
				localizationText['cs']['damage_dealt'] = 'Způsobené poškození';
				localizationText['cs']['frags'] = 'Lodí zničeno';
				localizationText['cs']['planes_killed'] = 'Letadel zničeno';
				localizationText['cs']['capture_points'] = 'Body za obsazování základny';
				localizationText['cs']['dropped_capture_points'] = 'Body za obranu základny';

				localizationText['cs']['stat-table-2'] = 'Průměrné skóre za bitvu';
				localizationText['cs']['avg_xp'] = 'Zkušenosti';
				localizationText['cs']['avg_damage_dealt'] = 'Způsobené poškození';
				localizationText['cs']['avg_frags'] = 'Lodí zničeno';
				localizationText['cs']['avg_planes_killed'] = 'Letadel zničeno';
				localizationText['cs']['avg_capture_points'] = 'Body za obsazování základny';
				localizationText['cs']['avg_dropped_capture_points'] = 'Body za obranu základny';

				localizationText['cs']['stat-table-3'] = 'Rekordní skóre';
				localizationText['cs']['max_xp'] = 'Zkušenosti';
				localizationText['cs']['max_damage_dealt'] = 'Způsobené poškození';
				localizationText['cs']['max_frags_battle'] = 'Lodí zničeno';
				localizationText['cs']['max_planes_killed'] = 'Letadel zničeno';
				
				localizationText['cs']['stat-table-4'] = 'Další výsledky';
				localizationText['cs']['battles_days'] = 'Bitvy za den';
				localizationText['cs']['max_ship_level'] = 'Maximální vrstva lodi';
				localizationText['cs']['avg_battles_level'] = 'Průměrná vrstva válečných lodí používaný přehrávačem';
				localizationText['cs']['number-ships-x'] = 'Počet X Tier lodí';
				localizationText['cs']['wr'] = 'WR';
				localizationText['cs']['wtr'] = 'WTR';
				
				localizationText['cs']['ships_stat'] = 'Podrobné statistiky lodě';
				localizationText['cs']['title_ships'] = 'Lodě';
				localizationText['cs']['battleship'] = 'Bitevní lodě';
				localizationText['cs']['aircarrier'] = 'Letadlové lodě';
				localizationText['cs']['cruiser'] = 'Křižníky';
				localizationText['cs']['destroyer'] = 'Torpédoborce';
			}
			
			{/* Polski */
				localizationText['pl'] = [];
			
				localizationText['pl'] = jQ.extend([], localizationText['en']);
				
				localizationText['pl']['num-separator'] = ' ';
				localizationText['pl']['num-fractional'] = ',';
				
				localizationText['pl']['pvp_solo'] = 'Solo';
				localizationText['pl']['pvp_div'] = 'Podział';
				
				localizationText['pl']['title_battles'] = 'Stoczone bitwy';
				localizationText['pl']['title_wins_percents'] = 'Stosunek zwycięstw do wszystkich bitew';
				localizationText['pl']['title_avg_xp'] = 'ŚREDNIE DOŚWIADCZENIE NA BITWĘ';
				localizationText['pl']['title_avg_damage_dealt'] = 'Średnie uszkodzenia zadane na bitwę';
				localizationText['pl']['title_kill_dead'] = 'Stosunek zniszczonych przeciwników/własnych zniszczeń';
				localizationText['pl']['title_wr'] = 'WR';
				localizationText['pl']['title_avg_battles_level'] = 'Průměrná vrstva válečných lodí používaný přehrávačem';

				localizationText['pl']['stat-table-1'] = 'Ogólne wyniki';
				localizationText['pl']['battles'] = 'Bitwy';
				localizationText['pl']['wins'] = 'Zwycięstwa';
				localizationText['pl']['survived_battles'] = 'Przetrwane bitwy';
				localizationText['pl']['damage_dealt'] = 'Zadane uszkodzenia';
				localizationText['pl']['frags'] = 'Zniszczone okręty';
				localizationText['pl']['planes_killed'] = 'Zniszczone samoloty';
				localizationText['pl']['capture_points'] = 'Zajęcie bazy';
				localizationText['pl']['dropped_capture_points'] = 'Obrona bazy';

				localizationText['pl']['stat-table-2'] = 'Średnie doświadczenie w bitwie';
				localizationText['pl']['avg_xp'] = 'Doświadczenie';
				localizationText['pl']['avg_damage_dealt'] = 'Zadane uszkodzenia';
				localizationText['pl']['avg_frags'] = 'Zniszczone okręty';
				localizationText['pl']['avg_planes_killed'] = 'Zniszczone samoloty';
				localizationText['pl']['avg_capture_points'] = 'Zajęcie bazy';
				localizationText['pl']['avg_dropped_capture_points'] = 'Obrona bazy';

				localizationText['pl']['stat-table-3'] = 'Rekordowy wynik';
				localizationText['pl']['max_xp'] = 'Doświadczenie';
				localizationText['pl']['max_damage_dealt'] = 'Zadane uszkodzenia';
				localizationText['pl']['max_frags_battle'] = 'Zniszczone okręty';
				localizationText['pl']['max_planes_killed'] = 'Zniszczone samoloty';
				
				localizationText['pl']['stat-table-4'] = 'Další výsledky';
				localizationText['pl']['battles_days'] = 'Bitvy za den';
				localizationText['pl']['max_ship_level'] = 'Maximální vrstva lodi';
				localizationText['pl']['avg_battles_level'] = 'Průměrná vrstva válečných lodí používaný přehrávačem';
				localizationText['pl']['number-ships-x'] = 'Ilość X statków Tier';
				localizationText['pl']['wr'] = 'WR';
				localizationText['pl']['wtr'] = 'WTR';
				
				localizationText['pl']['ships_stat'] = 'Szczegółowe statystyki okrętu';
				localizationText['pl']['title_ships'] = 'Okręty';
				localizationText['pl']['battleship'] = 'Pancerniki';
				localizationText['pl']['aircarrier'] = 'Lotniskowce';
				localizationText['pl']['cruiser'] = 'Krążowniki';
				localizationText['pl']['destroyer'] = 'Niszczyciele';
			}
			
			{/* 日本語 */
				localizationText['ja'] = [];
			
				localizationText['ja'] = jQ.extend([], localizationText['en']);
				
				localizationText['ja']['num-separator'] = '';
				localizationText['ja']['num-fractional'] = '.';
				
				localizationText['ja']['pvp_solo'] = 'ソロ';
				localizationText['ja']['pvp_div'] = '課';
				
				localizationText['ja']['title_battles'] = '参加戦闘数';
				localizationText['ja']['title_wins_percents'] = '勝利数/戦闘数';
				localizationText['ja']['title_avg_xp'] = '1 戦あたりの平均経験値';
				localizationText['ja']['title_avg_damage_dealt'] = '1 戦あたりの平均与ダメージ';
				localizationText['ja']['title_kill_dead'] = 'キル/デス比';
				localizationText['ja']['title_wr'] = 'WR';
				localizationText['ja']['title_avg_battles_level'] = 'プレイヤーが使用する軍艦の平均ティア';

				localizationText['ja']['stat-table-1'] = '総合結果';
				localizationText['ja']['battles'] = '戦闘数';
				localizationText['ja']['wins'] = '勝利';
				localizationText['ja']['survived_battles'] = '生還した戦闘数';
				localizationText['ja']['damage_dealt'] = '与ダメージ';
				localizationText['ja']['frags'] = '艦船撃沈';
				localizationText['ja']['planes_killed'] = '航空機撃墜';
				localizationText['ja']['capture_points'] = '陣地占領';
				localizationText['ja']['dropped_capture_points'] = '陣地防衛';

				localizationText['ja']['stat-table-2'] = '1 戦あたりの平均スコア';
				localizationText['ja']['avg_xp'] = '経験値';
				localizationText['ja']['avg_damage_dealt'] = '与ダメージ';
				localizationText['ja']['avg_frags'] = '艦船撃沈';
				localizationText['ja']['avg_planes_killed'] = '航空機撃墜';
				localizationText['ja']['avg_capture_points'] = '陣地占領';
				localizationText['ja']['avg_dropped_capture_points'] = '陣地防衛';

				localizationText['ja']['stat-table-3'] = '最高スコア';
				localizationText['ja']['max_xp'] = '経験値';
				localizationText['ja']['max_damage_dealt'] = '与ダメージ';
				localizationText['ja']['max_frags_battle'] = '艦船撃沈';
				localizationText['ja']['max_planes_killed'] = '航空機撃墜';
				
				localizationText['ja']['stat-table-4'] = '追加の結果';
				localizationText['ja']['battles_days'] = '一日あたりの戦い';
				localizationText['ja']['max_ship_level'] = '船の最大ティア';
				localizationText['ja']['avg_battles_level'] = 'プレイヤーが使用する軍艦の平均ティア';
				localizationText['ja']['number-ships-x'] = 'Xティア船の数';
				localizationText['ja']['wr'] = 'WR';
				localizationText['ja']['wtr'] = 'WTR';
				
				localizationText['ja']['ships_stat'] = '艦の詳細戦績';
				localizationText['ja']['title_ships'] = '艦';
				localizationText['ja']['battleship'] = '戦艦';
				localizationText['ja']['aircarrier'] = '航空母艦';
				localizationText['ja']['cruiser'] = '巡洋艦';
				localizationText['ja']['destroyer'] = '駆逐艦';
			}
			
			{/* ไทย */
				localizationText['th'] = [];
			
				localizationText['th'] = jQ.extend([], localizationText['en']);
				
				localizationText['th']['num-separator'] = '';
				localizationText['th']['num-fractional'] = '.';
				
				localizationText['th']['pvp_solo'] = 'โซโล';
				localizationText['th']['pvp_div'] = 'แผนก';
				
				localizationText['th']['title_battles'] = 'การรบที่เข้าร่วม';
				localizationText['th']['title_wins_percents'] = 'อัตราชัยชนะ/การรบ';
				localizationText['th']['title_avg_xp'] = 'ค่าประสบการณ์โดยเฉลี่ยต่อการรบ';
				localizationText['th']['title_avg_damage_dealt'] = 'ความเสียหายที่ทำโดยเฉลี่ยต่อการรบ';
				localizationText['th']['title_kill_dead'] = 'อัตราสังหาร/เสียชีวิต';
				localizationText['th']['title_wr'] = 'WR';
				localizationText['th']['title_avg_battles_level'] = 'ชั้นเฉลี่ยของเรือรบที่ใช้โดยผู้เล่น';

				localizationText['th']['stat-table-1'] = 'ผลรวม';
				localizationText['th']['battles'] = 'การรบ';
				localizationText['th']['wins'] = 'ชัยชนะ';
				localizationText['th']['survived_battles'] = 'จำนวนการรอดจากการรบ';
				localizationText['th']['damage_dealt'] = 'ความเสียหายที่ทำ';
				localizationText['th']['frags'] = 'เรือรบที่ถูกทำลาย';
				localizationText['th']['planes_killed'] = 'เครื่องบินที่ถูกทำลาย';
				localizationText['th']['capture_points'] = 'การยึดฐาน';
				localizationText['th']['dropped_capture_points'] = 'การป้องกันฐาน';

				localizationText['th']['stat-table-2'] = 'คะแนนเฉลี่ยต่อการรบ';
				localizationText['th']['avg_xp'] = 'ค่าประสบการณ์';
				localizationText['th']['avg_damage_dealt'] = 'ความเสียหายที่ทำ';
				localizationText['th']['avg_frags'] = 'เรือรบที่ถูกทำลาย';
				localizationText['th']['avg_planes_killed'] = 'เครื่องบินที่ถูกทำลาย';
				localizationText['th']['avg_capture_points'] = 'การยึดฐาน';
				localizationText['th']['avg_dropped_capture_points'] = 'การป้องกันฐาน';

				localizationText['th']['stat-table-3'] = 'สถิติคะแนน';
				localizationText['th']['max_xp'] = 'ค่าประสบการณ์';
				localizationText['th']['max_damage_dealt'] = 'ความเสียหายที่ทำ';
				localizationText['th']['max_frags_battle'] = 'เรือรบที่ถูกทำลาย';
				localizationText['th']['max_planes_killed'] = 'เครื่องบินที่ถูกทำลาย';
				
				localizationText['th']['stat-table-4'] = 'ผลเพิ่มเติม';
				localizationText['th']['battles_days'] = 'สงครามต่อวัน';
				localizationText['th']['max_ship_level'] = 'ชั้นสูงสุดของเรือ';
				localizationText['th']['avg_battles_level'] = 'ชั้นเฉลี่ยของเรือรบที่ใช้โดยผู้เล่น';
				localizationText['th']['number-ships-x'] = 'จำนวน X เรือชั้นที่';
				localizationText['th']['wr'] = 'WR';
				localizationText['th']['wtr'] = 'WTR';
				
				localizationText['th']['ships_stat'] = 'สถิติเรือรบโดยละเอียด';
				localizationText['th']['title_ships'] = 'เรือรบ';
				localizationText['th']['battleship'] = 'เรือประจัญบาน';
				localizationText['th']['aircarrier'] = 'เรือบรรทุกเครื่องบิน';
				localizationText['th']['cruiser'] = 'เรือลาดตระเวณ';
				localizationText['th']['destroyer'] = 'เรือพิฆาต';
			}
			
			{/* Tiếng Việt */
				localizationText['vi'] = [];
			
				localizationText['vi'] = jQ.extend([], localizationText['en']);
				
				localizationText['vi']['num-separator'] = '';
				localizationText['vi']['num-fractional'] = ',';
				
				localizationText['vi']['num-separator'] = '';
				localizationText['vi']['num-fractional'] = '.';
				
				localizationText['vi']['pvp_solo'] = 'Solo';
				localizationText['vi']['pvp_div'] = 'Phòng';
				
				localizationText['vi']['title_battles'] = 'Số trận Tham chiến';
				localizationText['vi']['title_wins_percents'] = 'Chiến thắng / Số trận';
				localizationText['vi']['title_avg_xp'] = 'KINH NGHIỆM TRUNG BÌNH MỖI TRẬN';
				localizationText['vi']['title_avg_damage_dealt'] = 'Thiệt hại Gây ra Trung bình mỗi Trận';
				localizationText['vi']['title_kill_dead'] = 'Tỷ lệ Tiêu diệt/Bị Tiêu diệt';
				localizationText['vi']['title_wr'] = 'WR';
				localizationText['vi']['title_avg_battles_level'] = 'Tier trung bình của các tàu chiến được sử dụng bởi người chơi';

				localizationText['vi']['stat-table-1'] = 'Kết quả Tổng quan';
				localizationText['vi']['battles'] = 'Số trận';
				localizationText['vi']['wins'] = 'Chiến thắng';
				localizationText['vi']['survived_battles'] = 'Số trận sống sót';
				localizationText['vi']['damage_dealt'] = 'Thiệt hại đã gây ra';
				localizationText['vi']['frags'] = 'Tàu chiến đã tiêu diệt';
				localizationText['vi']['planes_killed'] = 'Phi cơ đã tiêu diệt';
				localizationText['vi']['capture_points'] = 'Chiếm căn cứ';
				localizationText['vi']['dropped_capture_points'] = 'Phòng thủ căn cứ';

				localizationText['vi']['stat-table-2'] = 'Điểm Trung bình mỗi Trận';
				localizationText['vi']['avg_xp'] = 'Kinh nghiệm';
				localizationText['vi']['avg_damage_dealt'] = 'Thiệt hại đã gây ra';
				localizationText['vi']['avg_frags'] = 'Tàu chiến đã tiêu diệt';
				localizationText['vi']['avg_planes_killed'] = 'Phi cơ đã tiêu diệt';
				localizationText['vi']['avg_capture_points'] = 'Chiếm căn cứ';
				localizationText['vi']['avg_dropped_capture_points'] = 'Phòng thủ căn cứ';

				localizationText['vi']['stat-table-3'] = 'Điểm Kỷ lục';
				localizationText['vi']['max_xp'] = 'Kinh nghiệm';
				localizationText['vi']['max_damage_dealt'] = 'Thiệt hại đã gây ra';
				localizationText['vi']['max_frags_battle'] = 'Tàu chiến đã tiêu diệt';
				localizationText['vi']['max_planes_killed'] = 'Phi cơ đã tiêu diệt';
				
				localizationText['vi']['stat-table-4'] = 'Kết quả bổ sung';
				localizationText['vi']['battles_days'] = 'Trận chiến mỗi ngày';
				localizationText['vi']['max_ship_level'] = 'Cấp tối đa của tàu';
				localizationText['vi']['avg_battles_level'] = 'Tier trung bình của các tàu chiến được sử dụng bởi người chơi';
				localizationText['vi']['number-ships-x'] = 'Số tàu Tier X';
				localizationText['vi']['wr'] = 'WR';
				localizationText['vi']['wtr'] = 'WTR';
				
				localizationText['vi']['ships_stat'] = 'Thống kê Tàu chiến Chi tiết';
				localizationText['vi']['title_ships'] = 'Tàu chiến';
				localizationText['vi']['battleship'] = 'Thiết giáp hạm';
				localizationText['vi']['aircarrier'] = 'Tàu sân bay';
				localizationText['vi']['cruiser'] = 'Tuần dương hạm';
				localizationText['vi']['destroyer'] = 'Khu trục hạm';
			}
			
			{/* 繁體中文 */
				localizationText['zh-tw'] = [];
			
				localizationText['zh-tw'] = jQ.extend([], localizationText['en']);
				
				localizationText['zh-tw']['num-separator'] = '';
				localizationText['zh-tw']['num-fractional'] = '.';
				
				localizationText['zh-tw']['pvp_solo'] = '單獨';
				localizationText['zh-tw']['pvp_div'] = '分艦隊';
				
				localizationText['zh-tw']['title_battles'] = '參與過戰鬥數';
				localizationText['zh-tw']['title_wins_percents'] = '勝利數/戰鬥數比';
				localizationText['zh-tw']['title_avg_xp'] = '平均每場經驗';
				localizationText['zh-tw']['title_avg_damage_dealt'] = '平均每場造成的傷害';
				localizationText['zh-tw']['title_kill_dead'] = '擊毀/死亡比';
				localizationText['zh-tw']['title_wr'] = 'WR';
				localizationText['zh-tw']['title_avg_battles_level'] = '玩家所用艦艇的平均階級';

				localizationText['zh-tw']['stat-table-1'] = '整體成績';
				localizationText['zh-tw']['battles'] = '戰鬥數';
				localizationText['zh-tw']['wins'] = '勝利數';
				localizationText['zh-tw']['survived_battles'] = '存活數';
				localizationText['zh-tw']['damage_dealt'] = '造成的傷害';
				localizationText['zh-tw']['frags'] = '擊毀的戰艦數';
				localizationText['zh-tw']['planes_killed'] = '擊毀飛機數';
				localizationText['zh-tw']['capture_points'] = '佔領點數';
				localizationText['zh-tw']['dropped_capture_points'] = '防禦點數';

				localizationText['zh-tw']['stat-table-2'] = '平均每場戰鬥分數';
				localizationText['zh-tw']['avg_xp'] = '經驗';
				localizationText['zh-tw']['avg_damage_dealt'] = '造成的傷害';
				localizationText['zh-tw']['avg_frags'] = '擊毀的戰艦數';
				localizationText['zh-tw']['avg_planes_killed'] = '擊毀飛機數';
				localizationText['zh-tw']['avg_capture_points'] = '佔領點數';
				localizationText['zh-tw']['avg_dropped_capture_points'] = '防禦點數';

				localizationText['zh-tw']['stat-table-3'] = '紀錄分數';
				localizationText['zh-tw']['max_xp'] = '經驗';
				localizationText['zh-tw']['max_damage_dealt'] = '造成的傷害';
				localizationText['zh-tw']['max_frags_battle'] = '擊毀的戰艦數';
				localizationText['zh-tw']['max_planes_killed'] = '擊毀飛機數';
				
				localizationText['zh-tw']['stat-table-4'] = '其他結果';
				localizationText['zh-tw']['battles_days'] = '每日戰鬥數';
				localizationText['zh-tw']['max_ship_level'] = '最大艦艇階級';
				localizationText['zh-tw']['avg_battles_level'] = '玩家所用艦艇的平均階級';
				localizationText['zh-tw']['number-ships-x'] = '第X階艦艇數量';
				localizationText['zh-tw']['wr'] = 'WR';
				localizationText['zh-tw']['wtr'] = 'WTR';
				
				localizationText['zh-tw']['ships_stat'] = '詳細艦艇統計';
				localizationText['zh-tw']['title_ships'] = '戰艦';
				localizationText['zh-tw']['battleship'] = '主力艦';
				localizationText['zh-tw']['aircarrier'] = '航空母艦';
				localizationText['zh-tw']['cruiser'] = '巡洋艦';
				localizationText['zh-tw']['destroyer'] = '驅逐艦';
			}
			
			return localizationText[lang];
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
	
	if(window.location.host.indexOf("worldofwarships") > -1 || window.location.host.indexOf(".wargaming.net") > -1){
		addJQuery(WoWsStatInfo);
	}
})(window);