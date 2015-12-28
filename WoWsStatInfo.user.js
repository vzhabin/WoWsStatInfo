// ==UserScript==
// @name WoWsStatInfo
// @author Vov_chiK
// @description Расширенная статистика и функционал на сайте World of Warships.
// @copyright 2015+, Vov_chiK
// @license GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @namespace http://forum.walkure.pro/
// @version 0.5.1.26
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

(function(window){ /* delIndexedDB('StatPvPMemberArray'); убрать в следующей версии */ // сохранение рангов дельта, цвет статы при навидении, сколько осталось для следующего, китайский
	/* ===== Main function ===== */
	function WoWsStatInfo(){
		var VersionWoWsStatInfo = '0.5.1.26';
		
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
				'div.chart_div{text-align: center; float: left; margin-right: 40px;}' +
				'.userscript-placeholder {box-sizing: border-box;width: 550px;height: 330px;padding: 5px 15px 15px 40px;margin: 15px auto 30px auto;border: 1px solid #ddd;background: #fff;background: linear-gradient(#f6f6f6 0, #fff 50px);background: -o-linear-gradient(#f6f6f6 0, #fff 50px);background: -ms-linear-gradient(#f6f6f6 0, #fff 50px);background: -moz-linear-gradient(#f6f6f6 0, #fff 50px);background: -webkit-linear-gradient(#f6f6f6 0, #fff 50px);box-shadow: 0 3px 10px rgba(0,0,0,0.15);-o-box-shadow: 0 3px 10px rgba(0,0,0,0.1);-ms-box-shadow: 0 3px 10px rgba(0,0,0,0.1);-moz-box-shadow: 0 3px 10px rgba(0,0,0,0.1);-webkit-box-shadow: 0 3px 10px rgba(0,0,0,0.1);}' +
				'.chart-placeholder {width: 500px;height: 300px;font-size: 14px;line-height: 1.2em;}' +
				'.legend table {border-spacing: 5px;}' +
				'.flot-y-axis {margin-left: -40px; margin-top: -12px;}' +
				'.flot-x-axis {margin-left: -15px;}' +
			'';
			var StyleWoWsStatInfoAdd = document.createElement("style");
			StyleWoWsStatInfoAdd.textContent = StyleWoWsStatInfo.toString();
			document.head.appendChild(StyleWoWsStatInfoAdd);
			
			var ScriptChart = document.createElement("script");
			ScriptChart.setAttribute("src", "http://www.flotcharts.org/javascript/jquery.flot.min.js");
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
			else if(source.indexOf("prettyPrint") != -1){return false;}
			if(message == 'Script error.' && errorObj == null){console.log('message == \'Script error.\' && errorObj == null'); return false;}
			
			lineno += 47;
			
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
				//if(lineno < 8285){alert(error);}
			}else{
				// error = error.split('\n').join('<br />');
				// onShowMessage(
					// localizationText['Box'],
					// error,
					// onCloseMessage,
					// localizationText['Ok'],
					// false
				// );
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
			
			delIndexedDB('StatPvPMemberArray');
			getStatSaveMember();
			
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
			
			if(MembersArray[0]['info']['hidden_profile']){
				console.log(MembersArray[0]['info']['account_id']+' hidden profile!!!');
				return;
			}
			
			if(!calcStat(0)){
				console.log('Error calcStat '+MembersArray[0]['info']['account_id']);
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
							
							var battlesAchievement = 0;
							if(MembersArray[0]['achievements']['battle'][js_tooltip_show+'_battle'] === undefined){
								battlesAchievement = 'Error';
							}else{
								battlesAchievement = MembersArray[0]['achievements']['battle'][js_tooltip_show+'_battle'];
							}
							
							item.innerHTML += '<div class="_counter" style="left: 20%; background-color: #AAAAAA; min-width: 3em;">'+battlesAchievement+'</div>';
						}
					}
					
					achieves_block.outerHTML += '' +
						'<div>' +
							'<div style="width: initial; height: initial; float: initial;" class="achieve-item _big tooltip-target tooltip-enabled tooltip-element-attached-top tooltip-element-attached-left tooltip-target-attached-bottom tooltip-target-attached-left">' +
								'<div class="_counter" style="position: relative; background-color: #F7882E; min-width: 3em; left: 0; float: left;">12</div>' +
								'<div> - '+localizationText['achieve_counter_1']+'</div>' +
								'<div class="_counter" style="position: relative; background-color: #AAAAAA; min-width: 3em; left: 0; float: left;">31</div>' +
								'<div> - '+localizationText['achieve_counter_2']+'</div>' +
							'</div>' +
						'</div>' +
					'';

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
		function getStatSaveMember(){
			var js_cm_menu__user = document.getElementsByClassName('js-cm-menu__user')[0];
			if(js_cm_menu__user === undefined){console.log('js_cm_menu__user == undefined'); setTimeout(function(){getStatSaveMember();}, 1000); return;}
			
			var cm_user_menu_link_cutted_text = document.getElementsByClassName('cm-user-menu-link_cutted-text')[0];
			var login_name = null; if(cm_user_menu_link_cutted_text != null){login_name = cm_user_menu_link_cutted_text.textContent;}
			getIndexedDB('StatPvPMemberArray-'+login_name, updateStatPvPMemberArray, updateStatPvPMemberArray);
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
			
			var cm_user_menu_link_cutted_text = document.getElementsByClassName('cm-user-menu-link_cutted-text')[0];
			var login_name = null; if(cm_user_menu_link_cutted_text != null){login_name = cm_user_menu_link_cutted_text.textContent;}
			setIndexedDB('StatPvPMemberArray-'+login_name, JSON.stringify(StatPvPMemberArray), viewStatPvPMemberArray, viewStatPvPMemberArray);
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
										'<div class="userscript-placeholder"><div id="chart_'+title+'" class="chart-placeholder"></div></div>' +
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
							
							var index = 0;
							for(var key_stat in StatPvPMemberArray){
								var d = key_stat.substring(6, 8);
								var m = key_stat.substring(4, 6);
								var y = key_stat.substring(2, 4);
								//date.push([index, d+'.'+m+'.'+y]);
								date.push([index, d+'.'+m]);
								
								for(var key in chart_value){
									var title = chart_value[key];
									value[title].push([index, parseFloat(StatPvPMemberArray[key_stat][title].toFixed(2))]);
								}
								
								index++;
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
			$.plot(
				'#chart_'+title, 
				[value], 
				{
					series: {lines: {show: true}, points: {show: true}},
					xaxis: {ticks: date},
					grid: {hoverable: true, clickable: true},
					colors: ['#00c0c0']
				}
			);
			
			jQ('<div id="tooltip-chart-'+title+'"></div>').css({
				position: "absolute",
				display: "none",
				border: "1px solid #fdd",
				padding: "2px",
				"background-color": "#00c0c0",
				opacity: 0.80,
				zIndex: 999,
				color: "black"
			}).appendTo("body");

			jQ('#chart_'+title).bind("plothover", function (event, pos, item) {
				if(item){
					var y = item.datapoint[1].toFixed(2);
					jQ('#tooltip-chart-'+title).html(y).css({top: item.pageY - 35, left: item.pageX - 15}).fadeIn(200);
				}else{
					jQ('#tooltip-chart-'+title).hide();
				}
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
						text = text.replace('%NAME%','<a target="_blank" href="http://worldofwarships.'+realm_host+'/community/accounts/'+mId+'-/">'+mName+'</a>');
						html +=  '<tr>'+				
							'<td class="table-default_cell" align="left" style="padding: 0px;">'+
								' <font color="red">'+text+'</font>'+
							'</td>'+
						'</tr>';						
					}else if(type == '2'){
						var text = localizationText['member-history-join'];
						text = text.replace('%NAME%','<a target="_blank" href="http://worldofwarships.'+realm_host+'/community/accounts/'+mId+'-/">'+mName+'</a>');					
						html +=  '<tr>'+				
							'<td class="table-default_cell" align="left" style="padding: 0px;">'+
								' <font color="green">'+text+'</font>'+
							'</td>'+
						'</tr>';						
					}else if(type == '3'){
						var text = localizationText['member-history-rerole'];
						text = text.replace('%NAME%','<a target="_blank" href="http://worldofwarships.'+realm_host+'/community/accounts/'+mId+'-/">'+mName+'</a>');					
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
						text = text.replace('%NEWNAME%','<a target="_blank" href="http://worldofwarships.'+realm_host+'/community/accounts/'+mId+'-/">'+mNew+'</a>');						
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
				//console.log(attr+' '+value);
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
				ExpWTR = jQ.parseJSON('{"coefficients":{"wins_weight":0.25,"damage_weight":0.5,"frags_weight":0.25,"capture_weight":0,"dropped_capture_weight":0,"ship_frags_importance_weight":10,"nominal_rating":1000},"expected":{"4184782640":{"ship_id":4184782640,"wins":0.51144236326218,"damage_dealt":29327.34765625,"frags":0.87535357475281,"capture_points":0.07742128521204,"dropped_capture_points":0.35328429937363,"planes_killed":0.27712514996529},"4185831216":{"ship_id":4185831216,"wins":0.47205796837807,"damage_dealt":14347.674804688,"frags":0.46883052587509,"capture_points":0.17762111127377,"dropped_capture_points":0.54029613733292,"planes_killed":0.034302607178688},"4293801680":{"ship_id":4293801680,"wins":0.53981232643127,"damage_dealt":14058.28515625,"frags":0.93045520782471,"capture_points":0.24825662374496,"dropped_capture_points":0.4013566672802,"planes_killed":0},"4286527472":{"ship_id":4286527472,"wins":0.46909514069557,"damage_dealt":41040.66796875,"frags":0.70126676559448,"capture_points":0.29407414793968,"dropped_capture_points":1.3278222084045,"planes_killed":1.9318579435349},"4287542992":{"ship_id":4287542992,"wins":0.48064929246902,"damage_dealt":27909.423828125,"frags":0.70683819055557,"capture_points":0.55140209197998,"dropped_capture_points":2.5795605182648,"planes_killed":1.9272725582123},"4282300112":{"ship_id":4282300112,"wins":0.47857391834259,"damage_dealt":43702.1015625,"frags":0.70744508504868,"capture_points":0.45598375797272,"dropped_capture_points":2.5085189342499,"planes_killed":2.7388224601746},"4293801424":{"ship_id":4293801424,"wins":0.52133285999298,"damage_dealt":27596.884765625,"frags":0.97438377141953,"capture_points":1.1443283557892,"dropped_capture_points":3.7691659927368,"planes_killed":0.35605230927467},"4272895696":{"ship_id":4272895696,"wins":0.46596679091454,"damage_dealt":53508.98828125,"frags":0.67378884553909,"capture_points":0.2365470379591,"dropped_capture_points":1.4500216245651,"planes_killed":3.587721824646},"4283414224":{"ship_id":4283414224,"wins":0.49976310133934,"damage_dealt":51859.02734375,"frags":0.96926707029343,"capture_points":0.20859603583813,"dropped_capture_points":3.4542102813721,"planes_killed":16.364891052246},"4277090288":{"ship_id":4277090288,"wins":0.47736895084381,"damage_dealt":74486.328125,"frags":0.85579180717468,"capture_points":0.37277370691299,"dropped_capture_points":2.0491509437561,"planes_killed":6.6390309333801},"4282300400":{"ship_id":4282300400,"wins":0.46682730317116,"damage_dealt":27003.578125,"frags":0.59626632928848,"capture_points":0.49385052919388,"dropped_capture_points":2.402939081192,"planes_killed":2.4023733139038},"4268635856":{"ship_id":4268635856,"wins":0.72727274894714,"damage_dealt":33277.6953125,"frags":1,"capture_points":0,"dropped_capture_points":0,"planes_killed":0},"3762206160":{"ship_id":3762206160,"wins":0.51406466960907,"damage_dealt":32726.25390625,"frags":0.72151899337769,"capture_points":0.022503515705466,"dropped_capture_points":0.042194094508886,"planes_killed":1.9486638307571},"4287575760":{"ship_id":4287575760,"wins":0.48265165090561,"damage_dealt":31814.04296875,"frags":0.70619660615921,"capture_points":0.50732213258743,"dropped_capture_points":2.289083480835,"planes_killed":1.267110824585},"4292753392":{"ship_id":4292753392,"wins":0.46884316205978,"damage_dealt":9142.3876953125,"frags":0.52234119176865,"capture_points":0.43803408741951,"dropped_capture_points":2.8511443138123,"planes_killed":0.00033849669853225},"4291770064":{"ship_id":4291770064,"wins":0.46141958236694,"damage_dealt":20754.75,"frags":0.5038595199585,"capture_points":0.64177030324936,"dropped_capture_points":2.796489238739,"planes_killed":0.62163323163986},"4281284304":{"ship_id":4281284304,"wins":0.50143712759018,"damage_dealt":56466.83203125,"frags":0.84902656078339,"capture_points":0.27920430898666,"dropped_capture_points":1.1814756393433,"planes_killed":3.3837628364563},"4292851408":{"ship_id":4292851408,"wins":0.50081539154053,"damage_dealt":37207.19140625,"frags":0.86703306436539,"capture_points":0.2615262567997,"dropped_capture_points":1.6023281812668,"planes_killed":6.671886920929},"4264441840":{"ship_id":4264441840,"wins":0.44569125771523,"damage_dealt":16115.174804688,"frags":0.49565368890762,"capture_points":0.88410931825638,"dropped_capture_points":2.7871909141541,"planes_killed":0.21849791705608},"4287510224":{"ship_id":4287510224,"wins":0.47590667009354,"damage_dealt":27835.193359375,"frags":0.61677467823029,"capture_points":0.6986123919487,"dropped_capture_points":0.87761247158051,"planes_killed":0.47129198908806},"4290754544":{"ship_id":4290754544,"wins":0.46101638674736,"damage_dealt":23401.916015625,"frags":0.48008349537849,"capture_points":0.092204891145229,"dropped_capture_points":0.86285030841827,"planes_killed":11.110766410828},"4293834192":{"ship_id":4293834192,"wins":0.51346826553345,"damage_dealt":22706.90234375,"frags":0.8711941242218,"capture_points":0.86314624547958,"dropped_capture_points":5.7426495552063,"planes_killed":0.01520515140146},"4286527184":{"ship_id":4286527184,"wins":0.49285337328911,"damage_dealt":24788.845703125,"frags":0.70002764463425,"capture_points":0.61998111009598,"dropped_capture_points":3.0085229873657,"planes_killed":0.15929062664509},"4279154384":{"ship_id":4279154384,"wins":0.47522038221359,"damage_dealt":16343.153320312,"frags":0.61388367414474,"capture_points":0.61372125148773,"dropped_capture_points":4.5212726593018,"planes_killed":0.03521366789937},"4292785968":{"ship_id":4292785968,"wins":0.5201216340065,"damage_dealt":14511.73046875,"frags":0.84488886594772,"capture_points":0.20043376088142,"dropped_capture_points":0.68648815155029,"planes_killed":6.3309278630186e-5},"4280170192":{"ship_id":4280170192,"wins":0.59036141633987,"damage_dealt":15485.84375,"frags":0.89759033918381,"capture_points":1.0481927394867,"dropped_capture_points":5.1144576072693,"planes_killed":0},"4279219920":{"ship_id":4279219920,"wins":0.49095487594604,"damage_dealt":79527.5703125,"frags":1.2524645328522,"capture_points":0.18717786669731,"dropped_capture_points":4.39031457901,"planes_killed":22.605403900146},"4182685488":{"ship_id":4182685488,"wins":0.48864328861237,"damage_dealt":26444.470703125,"frags":0.62262511253357,"capture_points":0.0098546668887138,"dropped_capture_points":0.025494255125523,"planes_killed":1.0719004869461},"4255037136":{"ship_id":4255037136,"wins":0.45577567815781,"damage_dealt":30378.376953125,"frags":0.55397969484329,"capture_points":0.40117424726486,"dropped_capture_points":2.4196634292603,"planes_killed":1.6874372959137},"4181636912":{"ship_id":4181636912,"wins":0.50244331359863,"damage_dealt":35992.875,"frags":0.68271744251251,"capture_points":0.020216653123498,"dropped_capture_points":0.086358621716499,"planes_killed":1.5575255155563},"4183700944":{"ship_id":4183700944,"wins":0.52490627765656,"damage_dealt":22087.02734375,"frags":0.77518689632416,"capture_points":0.028218938037753,"dropped_capture_points":0.021830813959241,"planes_killed":0.20426772534847},"4180588336":{"ship_id":4180588336,"wins":0.49620488286018,"damage_dealt":44817.76953125,"frags":0.70956927537918,"capture_points":0.055785797536373,"dropped_capture_points":0.26235157251358,"planes_killed":1.5549708604813},"4273911792":{"ship_id":4273911792,"wins":0.47715365886688,"damage_dealt":52567.1171875,"frags":0.79459488391876,"capture_points":0.46731999516487,"dropped_capture_points":2.7926111221313,"planes_killed":5.2445363998413},"4293834544":{"ship_id":4293834544,"wins":0.48983442783356,"damage_dealt":8690.453125,"frags":0.68860483169556,"capture_points":0.08774196356535,"dropped_capture_points":0.23115234076977,"planes_killed":0.0036653624847531},"4293867504":{"ship_id":4293867504,"wins":0.47476980090141,"damage_dealt":17623.275390625,"frags":0.59116113185883,"capture_points":0.90126675367355,"dropped_capture_points":4.6952438354492,"planes_killed":0.019691698253155},"3769513264":{"ship_id":3769513264,"wins":0.51616472005844,"damage_dealt":23294.26953125,"frags":0.72660940885544,"capture_points":0.017924821004272,"dropped_capture_points":0.034919008612633,"planes_killed":0.16143128275871},"4277024464":{"ship_id":4277024464,"wins":0.54149156808853,"damage_dealt":28624.5703125,"frags":1.0049687623978,"capture_points":0.18166197836399,"dropped_capture_points":0.11372448503971,"planes_killed":0.0023218556307256},"4290688720":{"ship_id":4290688720,"wins":0.48792213201523,"damage_dealt":21207.95703125,"frags":0.72139596939087,"capture_points":0.78781008720398,"dropped_capture_points":5.0412755012512,"planes_killed":2.1373159885406},"4292753104":{"ship_id":4292753104,"wins":0.51334017515182,"damage_dealt":13375.862304688,"frags":0.75151073932648,"capture_points":0.71292144060135,"dropped_capture_points":2.4542906284332,"planes_killed":0.0025320558343083},"4288657392":{"ship_id":4288657392,"wins":0.46958178281784,"damage_dealt":32925.06640625,"frags":0.61053228378296,"capture_points":0.23886477947235,"dropped_capture_points":2.033046245575,"planes_killed":12.373122215271},"4292786160":{"ship_id":4292786160,"wins":0.46840387582779,"damage_dealt":9682.4677734375,"frags":0.41476845741272,"capture_points":0.6209329366684,"dropped_capture_points":6.0186038017273,"planes_killed":0.00023354696168099},"4284430032":{"ship_id":4284430032,"wins":0.48798614740372,"damage_dealt":46599.30078125,"frags":0.76956462860107,"capture_points":0.29414123296738,"dropped_capture_points":1.225365281105,"planes_killed":1.3579453229904},"4286494416":{"ship_id":4286494416,"wins":0.50189566612244,"damage_dealt":35526.34765625,"frags":0.78310096263885,"capture_points":0.46726503968239,"dropped_capture_points":2.2390806674957,"planes_killed":2.1743800640106},"4179539760":{"ship_id":4179539760,"wins":0.48635476827621,"damage_dealt":60039.8984375,"frags":0.80303031206131,"capture_points":0.028708133846521,"dropped_capture_points":0.24401913583279,"planes_killed":2.4687223434448},"4291704528":{"ship_id":4291704528,"wins":0.4903489947319,"damage_dealt":21143.6328125,"frags":0.78706359863281,"capture_points":0.86750078201294,"dropped_capture_points":1.3478718996048,"planes_killed":0.081807471811771},"4276041712":{"ship_id":4276041712,"wins":0.48816350102425,"damage_dealt":61051.21875,"frags":0.82696229219437,"capture_points":0.4640905559063,"dropped_capture_points":2.046421289444,"planes_killed":5.6800532341003},"4279220208":{"ship_id":4279220208,"wins":0.57496285438538,"damage_dealt":125114.5859375,"frags":1.7496103048325,"capture_points":0.2257222533226,"dropped_capture_points":2.4983325004578,"planes_killed":21.959182739258},"4289607664":{"ship_id":4289607664,"wins":0.47378101944923,"damage_dealt":17635.37890625,"frags":0.63037109375,"capture_points":0.52872961759567,"dropped_capture_points":1.3554534912109,"planes_killed":0.44579941034317},"4274927600":{"ship_id":4274927600,"wins":0.48215329647064,"damage_dealt":17748.029296875,"frags":0.71034383773804,"capture_points":0.58598625659943,"dropped_capture_points":1.8459652662277,"planes_killed":0.015847567468882},"4288624336":{"ship_id":4288624336,"wins":0.49519303441048,"damage_dealt":43122.5703125,"frags":0.87558656930923,"capture_points":0.3764982521534,"dropped_capture_points":1.7660456895828,"planes_killed":0.97625946998596},"4182652368":{"ship_id":4182652368,"wins":0.53325682878494,"damage_dealt":37980.265625,"frags":0.85911917686462,"capture_points":0.15483598411083,"dropped_capture_points":0.34428805112839,"planes_killed":0.78680598735809},"4180555216":{"ship_id":4180555216,"wins":0.57742524147034,"damage_dealt":34757.765625,"frags":1.0727962255478,"capture_points":0.028936488553882,"dropped_capture_points":0.041177026927471,"planes_killed":0.44909682869911},"4276041424":{"ship_id":4276041424,"wins":0.52029538154602,"damage_dealt":86303.0078125,"frags":0.85731720924377,"capture_points":0.26217433810234,"dropped_capture_points":1.3853801488876,"planes_killed":5.5114479064941},"4292818896":{"ship_id":4292818896,"wins":0.48409178853035,"damage_dealt":37620.328125,"frags":0.78764349222183,"capture_points":0.58300858736038,"dropped_capture_points":2.5061447620392,"planes_killed":1.7604503631592},"4291737584":{"ship_id":4291737584,"wins":0.5124300122261,"damage_dealt":13101.841796875,"frags":0.74404162168503,"capture_points":1.1191152334213,"dropped_capture_points":8.2380666732788,"planes_killed":0.00055324425920844},"4256085712":{"ship_id":4256085712,"wins":0.51597660779953,"damage_dealt":11982.62109375,"frags":0.88534218072891,"capture_points":0.98543953895569,"dropped_capture_points":7.8380074501038,"planes_killed":0.0094841429963708},"4288559088":{"ship_id":4288559088,"wins":0.48405650258064,"damage_dealt":19866.423828125,"frags":0.66655617952347,"capture_points":0.50879180431366,"dropped_capture_points":1.023851275444,"planes_killed":0.35601687431335},"4284397008":{"ship_id":4284397008,"wins":0.58796298503876,"damage_dealt":23804.189453125,"frags":1.129629611969,"capture_points":1.3009259700775,"dropped_capture_points":14.680555343628,"planes_killed":0},"4292851696":{"ship_id":4292851696,"wins":0.45927909016609,"damage_dealt":21429.2890625,"frags":0.41698998212814,"capture_points":0.083820283412933,"dropped_capture_points":1.651645898819,"planes_killed":13.947665214539},"4184749520":{"ship_id":4184749520,"wins":0.51361870765686,"damage_dealt":21119.681640625,"frags":0.79473829269409,"capture_points":0.092410244047642,"dropped_capture_points":0.17881728708744,"planes_killed":0.1809868812561},"4282365936":{"ship_id":4282365936,"wins":0.46910259127617,"damage_dealt":47589.0546875,"frags":0.71761804819107,"capture_points":0.12464741617441,"dropped_capture_points":1.4792764186859,"planes_killed":27.842367172241},"4285445840":{"ship_id":4285445840,"wins":0.50853610038757,"damage_dealt":42696.13671875,"frags":0.85157352685928,"capture_points":0.4660656452179,"dropped_capture_points":2.5877184867859,"planes_killed":2.2109701633453},"4282365648":{"ship_id":4282365648,"wins":0.4840704202652,"damage_dealt":60911.66015625,"frags":1.0253527164459,"capture_points":0.20305614173412,"dropped_capture_points":3.9538433551788,"planes_killed":15.684978485107},"4293867312":{"ship_id":4293867312,"wins":0.33333334326744,"damage_dealt":47393.109375,"frags":1.111111164093,"capture_points":0,"dropped_capture_points":13.777777671814,"planes_killed":0.55555558204651},"4287543280":{"ship_id":4287543280,"wins":0.49188962578773,"damage_dealt":31108.79296875,"frags":0.84891390800476,"capture_points":0.63077801465988,"dropped_capture_points":3.6441118717194,"planes_killed":2.9725940227509},"4289607376":{"ship_id":4289607376,"wins":0.47140210866928,"damage_dealt":20341.80078125,"frags":0.57508307695389,"capture_points":0.92420160770416,"dropped_capture_points":0.79397934675217,"planes_killed":0.58541172742844},"4283381456":{"ship_id":4283381456,"wins":0.5108608007431,"damage_dealt":12774.908203125,"frags":0.69592261314392,"capture_points":1.0902901887894,"dropped_capture_points":3.678070306778,"planes_killed":0},"4290655952":{"ship_id":4290655952,"wins":0.49738252162933,"damage_dealt":26901.880859375,"frags":0.90426748991013,"capture_points":1.0334584712982,"dropped_capture_points":1.2482552528381,"planes_killed":0.1155132651329},"4186846672":{"ship_id":4186846672,"wins":0.48983815312386,"damage_dealt":12132.255859375,"frags":0.62430566549301,"capture_points":0.1561608761549,"dropped_capture_points":0.29215821623802,"planes_killed":0.0012102660257369},"4280203248":{"ship_id":4280203248,"wins":0.47312697768211,"damage_dealt":31305.328125,"frags":0.59218579530716,"capture_points":0.55304419994354,"dropped_capture_points":2.538426399231,"planes_killed":3.5944085121155},"4247697392":{"ship_id":4247697392,"wins":0.62285715341568,"damage_dealt":42781.4375,"frags":1.3628571033478,"capture_points":0.91142857074738,"dropped_capture_points":7.0999999046326,"planes_killed":0.25714287161827},"4188976592":{"ship_id":4188976592,"wins":0.51522177457809,"damage_dealt":10208.93359375,"frags":0.8022027015686,"capture_points":0.10607925802469,"dropped_capture_points":0.27303048968315,"planes_killed":0.00087216187966987},"4269717488":{"ship_id":4269717488,"wins":0.47313794493675,"damage_dealt":19595.396484375,"frags":0.58269023895264,"capture_points":0.53379386663437,"dropped_capture_points":4.257984161377,"planes_killed":0.15035820007324},"4285511376":{"ship_id":4285511376,"wins":0.5000387430191,"damage_dealt":44368.25390625,"frags":0.90319794416428,"capture_points":0.17720854282379,"dropped_capture_points":3.3632996082306,"planes_killed":9.3871831893921},"4290721776":{"ship_id":4290721776,"wins":0.48567771911621,"damage_dealt":27086.42578125,"frags":0.71517157554626,"capture_points":0.78359854221344,"dropped_capture_points":3.8070821762085,"planes_killed":0.5122092962265},"4277122768":{"ship_id":4277122768,"wins":0.52414709329605,"damage_dealt":99352.875,"frags":1.464435338974,"capture_points":0.28929537534714,"dropped_capture_points":5.0580668449402,"planes_killed":24.937957763672},"4280202960":{"ship_id":4280202960,"wins":0.40000000596046,"damage_dealt":25757.029296875,"frags":0.54285717010498,"capture_points":0,"dropped_capture_points":2.2571427822113,"planes_killed":0.65714287757874},"4292785616":{"ship_id":4292785616,"wins":0.52972388267517,"damage_dealt":16421.02734375,"frags":0.80425155162811,"capture_points":0.51654332876205,"dropped_capture_points":3.0945284366608,"planes_killed":0},"4284463088":{"ship_id":4284463088,"wins":0.46392181515694,"damage_dealt":43396.60546875,"frags":0.73413914442062,"capture_points":0.10792381316423,"dropped_capture_points":2.0727033615112,"planes_killed":17.886707305908},"4282267344":{"ship_id":4282267344,"wins":0.49188193678856,"damage_dealt":54646.8515625,"frags":0.79407215118408,"capture_points":0.8702580332756,"dropped_capture_points":0.95413875579834,"planes_killed":0.45606598258018},"4277057520":{"ship_id":4277057520,"wins":0.45663878321648,"damage_dealt":33464.9375,"frags":0.58509737253189,"capture_points":0.61205947399139,"dropped_capture_points":3.0625936985016,"planes_killed":5.2400588989258},"4293867216":{"ship_id":4293867216,"wins":0.48608022928238,"damage_dealt":17311.271484375,"frags":0.64228767156601,"capture_points":1.0178252458572,"dropped_capture_points":4.148561000824,"planes_killed":0.055775254964828},"4282333168":{"ship_id":4282333168,"wins":0.47675603628159,"damage_dealt":50924.875,"frags":0.76717466115952,"capture_points":0.37975490093231,"dropped_capture_points":1.5491837263107,"planes_killed":4.7350564002991},"4286461936":{"ship_id":4286461936,"wins":0.4974881708622,"damage_dealt":25339.345703125,"frags":0.72234457731247,"capture_points":0.61607003211975,"dropped_capture_points":1.1703732013702,"planes_killed":0.34347185492516},"4186879792":{"ship_id":4186879792,"wins":0.49006217718124,"damage_dealt":15589.35546875,"frags":0.66056400537491,"capture_points":0.25263947248459,"dropped_capture_points":0.77547913789749,"planes_killed":0},"4267620048":{"ship_id":4267620048,"wins":0.56450825929642,"damage_dealt":32620.166015625,"frags":1.1815983057022,"capture_points":1.0418957471848,"dropped_capture_points":5.3721241950989,"planes_killed":1.1841045618057},"4281284592":{"ship_id":4281284592,"wins":0.51497209072113,"damage_dealt":31436.630859375,"frags":0.88347572088242,"capture_points":1.0037748813629,"dropped_capture_points":5.1118850708008,"planes_killed":0},"4289640144":{"ship_id":4289640144,"wins":0.45901328325272,"damage_dealt":20084.697265625,"frags":0.55462431907654,"capture_points":0.51127773523331,"dropped_capture_points":2.5438437461853,"planes_killed":0.37759727239609},"4280170480":{"ship_id":4280170480,"wins":0.47030180692673,"damage_dealt":18899.232421875,"frags":0.70586889982224,"capture_points":0.50742024183273,"dropped_capture_points":1.6150177717209,"planes_killed":0.40866810083389},"4284364496":{"ship_id":4284364496,"wins":0.47844645380974,"damage_dealt":38441.58984375,"frags":0.66411149501801,"capture_points":0.94555389881134,"dropped_capture_points":1.0748049020767,"planes_killed":0.38309076428413},"4185798096":{"ship_id":4185798096,"wins":0.49063760042191,"damage_dealt":15565.431640625,"frags":0.63602751493454,"capture_points":0.13324366509914,"dropped_capture_points":0.2631784081459,"planes_killed":0.067188076674938},"4281219056":{"ship_id":4281219056,"wins":0.50652283430099,"damage_dealt":46898.74609375,"frags":0.82790869474411,"capture_points":0.83534818887711,"dropped_capture_points":1.3955150842667,"planes_killed":1.1119643449783},"4187895248":{"ship_id":4187895248,"wins":0.49022820591927,"damage_dealt":8912.8994140625,"frags":0.60022366046906,"capture_points":0.087208233773708,"dropped_capture_points":0.22652049362659,"planes_killed":0.0003730928292498},"4181603792":{"ship_id":4181603792,"wins":0.52831220626831,"damage_dealt":30967.244140625,"frags":0.82772427797318,"capture_points":0.026952985674143,"dropped_capture_points":0.077339686453342,"planes_killed":0.52068364620209},"4258182864":{"ship_id":4258182864,"wins":0.49664264917374,"damage_dealt":12956.270507812,"frags":0.56054162979126,"capture_points":0.68650555610657,"dropped_capture_points":6.055230140686,"planes_killed":7.2475944762118e-5},"4272830448":{"ship_id":4272830448,"wins":0.5101535320282,"damage_dealt":36547.3671875,"frags":0.85116559267044,"capture_points":0.84121268987656,"dropped_capture_points":1.4833908081055,"planes_killed":0.74901103973389},"4288657104":{"ship_id":4288657104,"wins":0.51031094789505,"damage_dealt":43446.703125,"frags":0.9649983048439,"capture_points":0.23565636575222,"dropped_capture_points":2.6746900081635,"planes_killed":7.3760781288147},"4288591856":{"ship_id":4288591856,"wins":0.44987446069717,"damage_dealt":23004.294921875,"frags":0.63212096691132,"capture_points":0.57232338190079,"dropped_capture_points":3.0369212627411,"planes_killed":2.6722247600555},"4288558800":{"ship_id":4288558800,"wins":0.47906813025475,"damage_dealt":21789.341796875,"frags":0.589903652668,"capture_points":0.75433510541916,"dropped_capture_points":1.0006568431854,"planes_killed":0.51567566394806},"4266538992":{"ship_id":4266538992,"wins":0.46837893128395,"damage_dealt":11793.8515625,"frags":0.52770453691483,"capture_points":0.43128275871277,"dropped_capture_points":2.0121333599091,"planes_killed":0.01000021956861},"4183734064":{"ship_id":4183734064,"wins":0.49568358063698,"damage_dealt":27878.62890625,"frags":0.76890754699707,"capture_points":0.013440903276205,"dropped_capture_points":0.030399339273572,"planes_killed":0.67256617546082},"4281317360":{"ship_id":4281317360,"wins":0.50627207756042,"damage_dealt":92844.921875,"frags":1.3886578083038,"capture_points":0.14698438346386,"dropped_capture_points":1.9911911487579,"planes_killed":20.411249160767},"4292818736":{"ship_id":4292818736,"wins":0.48790341615677,"damage_dealt":48155.08984375,"frags":0.69799906015396,"capture_points":0.15987873077393,"dropped_capture_points":0.63310700654984,"planes_killed":1.8752642869949},"4289640432":{"ship_id":4289640432,"wins":0.48912614583969,"damage_dealt":27990.744140625,"frags":0.82722020149231,"capture_points":0.61296993494034,"dropped_capture_points":4.4052481651306,"planes_killed":1.1732102632523},"4259264496":{"ship_id":4259264496,"wins":0.48540249466896,"damage_dealt":39263.0625,"frags":0.82619816064835,"capture_points":0.41513219475746,"dropped_capture_points":1.9385352134705,"planes_killed":1.1075314283371},"4288624624":{"ship_id":4288624624,"wins":0.46833336353302,"damage_dealt":29181.521484375,"frags":0.6702800989151,"capture_points":0.52952826023102,"dropped_capture_points":2.5600097179413,"planes_killed":0.73220098018646},"4281251536":{"ship_id":4281251536,"wins":0.4910629093647,"damage_dealt":22796.927734375,"frags":0.71743988990784,"capture_points":0.5905727148056,"dropped_capture_points":4.1228909492493,"planes_killed":0.29551953077316},"4269684432":{"ship_id":4269684432,"wins":0.48649471998215,"damage_dealt":14617.428710938,"frags":0.64617669582367,"capture_points":0.68318051099777,"dropped_capture_points":1.8051521778107,"planes_killed":0.018100267276168},"4290689008":{"ship_id":4290689008,"wins":0.5034686923027,"damage_dealt":20231.44140625,"frags":0.74609178304672,"capture_points":0.895636677742,"dropped_capture_points":6.8073377609253,"planes_killed":0.0043640551157296},"4179506640":{"ship_id":4179506640,"wins":0.53822153806686,"damage_dealt":49835.28125,"frags":0.84109652042389,"capture_points":0.14285714924335,"dropped_capture_points":0.28883442282677,"planes_killed":1.1555604934692},"4259231440":{"ship_id":4259231440,"wins":0.51082247495651,"damage_dealt":69890.5703125,"frags":0.92121464014053,"capture_points":0.34786388278008,"dropped_capture_points":2.3073899745941,"planes_killed":2.9731538295746},"4248745968":{"ship_id":4248745968,"wins":0.55815362930298,"damage_dealt":36800.25390625,"frags":1.1150671243668,"capture_points":0.38837066292763,"dropped_capture_points":0.93760937452316,"planes_killed":0.18886668980122},"4293866960":{"ship_id":4293866960,"wins":0.5942325592041,"damage_dealt":40135.43359375,"frags":1.1760889291763,"capture_points":0.23498959839344,"dropped_capture_points":0.49953690171242,"planes_killed":0.031620394438505},"4291737040":{"ship_id":4291737040,"wins":0.53009635210037,"damage_dealt":34660.88671875,"frags":1.0182241201401,"capture_points":0.59570103883743,"dropped_capture_points":4.0543575286865,"planes_killed":1.3488420248032},"4293834736":{"ship_id":4293834736,"wins":0.47806164622307,"damage_dealt":9586.4638671875,"frags":0.63092964887619,"capture_points":0.66196441650391,"dropped_capture_points":5.8935484886169,"planes_killed":0.0056901560164988},"4267587280":{"ship_id":4267587280,"wins":1,"damage_dealt":34520,"frags":1.25,"capture_points":0,"dropped_capture_points":0,"planes_killed":0}}}');
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
						' <a target="_blank" style="color: #2CA8C7; font-weight: bold; border-bottom: 1px dotted #2CA8C7;" href="http://ru.wargaming.net/clans/search/#wgsearch&offset=0&limit=10&search=Walkure">Walkure</a>,' +
						' '+localizationText['userscript-support'] +
						' <a target="_blank" href="'+WoWsStatInfoHref+'">vzhabin.ru</a>' +
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
		function delIndexedDB(Key){
			if(WoWsStatInfoBase === undefined){
				openIndexedDB();
				setTimeout(function(){delIndexedDB(Key);}, 2000);
			}else if(WoWsStatInfoBase == null){
				/* IndexedDB onerror */
			}else{
				var transaction = WoWsStatInfoBase.transaction(["WoWsStatInfoStore"], "readwrite");
				var store = transaction.objectStore("WoWsStatInfoStore");
				store.delete(Key);
				console.log('delIndexedDB...Key '+Key);
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
				localizationText['ru']['userscript-support'] = 'при поддержки проекта';
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
				
				localizationText['ru']['achieve_counter_1'] = 'количество полученных наград';
				localizationText['ru']['achieve_counter_2'] = 'частота получения наград, количество боев необходимых для получения награды';
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
				localizationText['en']['userscript-support'] = 'with the support of';
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
				
				localizationText['en']['achieve_counter_1'] = 'the number of awards received';
				localizationText['en']['achieve_counter_2'] = 'the frequency of receiving awards, the number of battles needed for award';
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
			
			{/* 繁體中文 By chunhung 24/12/2015 */
				localizationText['zh-tw'] = [];
				
				localizationText['zh-tw'] = jQ.extend([], localizationText['en']);
				
				localizationText['zh-tw']['num-separator'] = '';
				localizationText['zh-tw']['num-fractional'] = '.';
				
				localizationText['zh-tw']['Box'] = '通知';
				localizationText['zh-tw']['Ok'] = '確定';
				localizationText['zh-tw']['Cancel'] = '取消';
				
				localizationText['zh-tw']['NewVersion'] = '新版本已經發佈';
				localizationText['zh-tw']['NewUpdate'] = '請更新擴充功能';
				
				localizationText['zh-tw']['ErrorScript'] = '運行時發生錯誤 UserScript WoWsStatInfo '+VersionWoWsStatInfo+', script:';
				localizationText['zh-tw']['ErrorSendDeveloper'] = '請將此錯誤通知腳本開發者。';
				localizationText['zh-tw']['ErrorAPI'] = '無法取得數據。<br />WG API 存在問題。<br />請嘗試重新載入頁面，或稍後再試。';
				
				localizationText['zh-tw']['userscript-developer'] = 'Developer - UserScript WoWsStatInfo:';
				localizationText['zh-tw']['userscript-alliance'] = 'аlliance member';
				localizationText['zh-tw']['userscript-topic'] = 'Forum topic:';
				localizationText['zh-tw']['userscript-developer-support'] = 'Ways to support the developer:';
				
				localizationText['zh-tw']['search-clan-forum'] = 'Clan Search...';
				
				localizationText['zh-tw']['profile-wows'] = 'World of Warships profile';
				localizationText['zh-tw']['profile-clan'] = 'Clan';
				localizationText['zh-tw']['forum-profile'] = 'Forum profile';
				localizationText['zh-tw']['role'] = '位階';
				localizationText['zh-tw']['clan-day'] = '待在公會的天數';
				
				localizationText['zh-tw']['generator-userbar'] = '創建簽名檔';
				localizationText['zh-tw']['userbar-bg'] = '選擇背景圖片:';
				localizationText['zh-tw']['userbar-filters'] = '過濾器：';
				localizationText['zh-tw']['filters-all'] = '全部';
				localizationText['zh-tw']['filters-clan'] = '公會';
				localizationText['zh-tw']['filters-noclassification'] = '未分類';
				localizationText['zh-tw']['filters-battleship'] = '主力艦';
				localizationText['zh-tw']['filters-aircarrier'] = '航空母艦';
				localizationText['zh-tw']['filters-cruiser'] = '巡洋艦';
				localizationText['zh-tw']['filters-destroyer'] = '驅逐艦';
				localizationText['zh-tw']['filters-japan'] = '日本';
				localizationText['zh-tw']['filters-ussr'] = '蘇聯';
				localizationText['zh-tw']['filters-germany'] = '德國';
				localizationText['zh-tw']['filters-uk'] = '英國';
				localizationText['zh-tw']['filters-usa'] = '美國';
				localizationText['zh-tw']['userbar-your-background'] = '上傳背景圖片';
				localizationText['zh-tw']['upload-submit'] = '上傳';
				localizationText['zh-tw']['img-max-size'] = '最大容量： 150 KB';
				localizationText['zh-tw']['img-max-px'] = '圖片解析度： 468x100';
				localizationText['zh-tw']['img-format'] = '圖片格式： PNG';
				localizationText['zh-tw']['upload-verification'] = '背景圖片會在驗證後更新。';
				
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
				localizationText['zh-tw']['frags'] = '擊毀的艦艇數';
				localizationText['zh-tw']['planes_killed'] = '擊毀飛機數';
				localizationText['zh-tw']['capture_points'] = '佔領點數';
				localizationText['zh-tw']['dropped_capture_points'] = '防禦點數';

				localizationText['zh-tw']['stat-table-2'] = '平均每場戰鬥分數';
				localizationText['zh-tw']['avg_xp'] = '經驗';
				localizationText['zh-tw']['avg_damage_dealt'] = '造成的傷害';
				localizationText['zh-tw']['avg_frags'] = '擊毀的艦艇數';
				localizationText['zh-tw']['avg_planes_killed'] = '擊毀飛機數';
				localizationText['zh-tw']['avg_capture_points'] = '佔領點數';
				localizationText['zh-tw']['avg_dropped_capture_points'] = '防禦點數';

				localizationText['zh-tw']['stat-table-3'] = '紀錄分數';
				localizationText['zh-tw']['max_xp'] = '經驗';
				localizationText['zh-tw']['max_damage_dealt'] = '造成的傷害';
				localizationText['zh-tw']['max_frags_battle'] = '擊毀的艦艇數';
				localizationText['zh-tw']['max_planes_killed'] = '擊毀飛機數';
				
				localizationText['zh-tw']['stat-table-4'] = '其他結果';
				localizationText['zh-tw']['battles_days'] = '每日戰鬥數';
				localizationText['zh-tw']['max_ship_level'] = '最大艦艇階級';
				localizationText['zh-tw']['avg_battles_level'] = '玩家所用艦艇的平均階級';
				localizationText['zh-tw']['number-ships-x'] = '第Ｘ階艦艇數量';
				localizationText['zh-tw']['wr'] = 'WR';
				localizationText['zh-tw']['wtr'] = 'WTR';
				
				localizationText['zh-tw']['ships_stat'] = '詳細艦艇統計';
				localizationText['zh-tw']['title_ships'] = '艦艇';
				localizationText['zh-tw']['battleship'] = '主力艦';
				localizationText['zh-tw']['aircarrier'] = '航空母艦';
				localizationText['zh-tw']['cruiser'] = '巡洋艦';
				localizationText['zh-tw']['destroyer'] = '驅逐艦';
				
				localizationText['zh-tw']['block-link-clan-member-history'] = '「公會成員變化」分段';
				localizationText['zh-tw']['link-clan-member-history'] = '公會成員變化';
				localizationText['zh-tw']['member-history-clear'] = '清除歷史記錄';
				localizationText['zh-tw']['member-history-join'] = '%NAME% 已加入公會';
				localizationText['zh-tw']['member-history-leave'] = '%NAME% 已離開公會';
				localizationText['zh-tw']['member-history-rename'] = '%OLDNAME% 已更改暱稱為 %NEWNAME%';
				localizationText['zh-tw']['member-history-rerole'] = '%NAME% 位階已更變： %OLDROLE% &rArr; %NEWROLE%';
				localizationText['zh-tw']['member-history-notchange'] = '自從安裝WoWsStatInfo腳本和上次進入本頁後，公會成員並無任何改變。';
				
				localizationText['zh-tw']['banned'] = '被封禁';
				localizationText['zh-tw']['commander'] = '指揮官';
				localizationText['zh-tw']['executive_officer'] = '執行官';
				localizationText['zh-tw']['personnel_officer'] = '人事官';
				localizationText['zh-tw']['intelligence_officer'] = '情報官';
				localizationText['zh-tw']['quartermaster'] = '軍需官';
				localizationText['zh-tw']['recruitment_officer'] = '徵募官';
				localizationText['zh-tw']['junior_officer'] = '下級軍官';
				localizationText['zh-tw']['combat_officer'] = '作戰官';
				localizationText['zh-tw']['private'] = '士兵';
				localizationText['zh-tw']['recruit'] = '新兵';
				localizationText['zh-tw']['reservist'] = '後備軍人';
				
				localizationText['zh-tw']['get-settings-button'] = '設定';
				localizationText['zh-tw']['set-settings-default'] = '預設';
				localizationText['zh-tw']['table-setting-caption'] = '查看列表排序「公會統計」';
				localizationText['zh-tw']['table-setting-structure'] = '列表排序';
				
				localizationText['zh-tw']['statistic-clan-button-0'] = '公會統計';				
				localizationText['zh-tw']['statistic-clan-button-1'] = '公會架構';	
				localizationText['zh-tw']['statistic-clan-load-text'] = '請稍候 •••<br />正在獲取統計數據';
				
				localizationText['zh-tw']['statistic-load-text-lost'] = '<br />剩餘時間 &#8776;';
				localizationText['zh-tw']['statistic-load-text-min'] = '分';
				localizationText['zh-tw']['statistic-load-text-sec'] = '秒';
				
				localizationText['zh-tw']['account_name'] = '玩家名稱';
				
				localizationText['zh-tw']['role_i18n'] = '位階';
				localizationText['zh-tw']['clan_days'] = '待在公會的天數';
				localizationText['zh-tw']['info.last_battle_time'] = '上次戰鬥時間';
				localizationText['zh-tw']['info.logout_at'] = '上次遊戲完結時間';
				
				localizationText['zh-tw']['info.statistics.pvp.battles'] = '戰鬥數';
				localizationText['zh-tw']['info.statistics.pvp.wins'] = '勝利數';
				localizationText['zh-tw']['info.statistics.pvp.losses'] = '失敗數';
				localizationText['zh-tw']['info.statistics.pvp.draws'] = '平手數';
				localizationText['zh-tw']['info.statistics.pvp.survived_battles'] = '存活數';
				localizationText['zh-tw']['info.statistics.pvp.survived_wins'] = '勝利並存活數';
				
				localizationText['zh-tw']['info.statistics.pvp.kill_dead'] = '擊毀/死亡比';
				localizationText['zh-tw']['info.statistics.pvp.xp'] = '總經驗';
				localizationText['zh-tw']['info.statistics.pvp.damage_dealt'] = '造成的傷害';
				
				localizationText['zh-tw']['info.statistics.pvp.frags'] = '擊毀的艦艇數';
				localizationText['zh-tw']['info.statistics.pvp.planes_killed'] = '擊毀飛機數';
				localizationText['zh-tw']['info.statistics.pvp.capture_points'] = '佔領點數';
				localizationText['zh-tw']['info.statistics.pvp.dropped_capture_points'] = '防禦點數';
				
				localizationText['zh-tw']['info.statistics.pvp.avg_xp'] = '平均經驗';
				localizationText['zh-tw']['info.statistics.pvp.avg_damage_dealt'] = '平均造成傷害';
				localizationText['zh-tw']['info.statistics.pvp.avg_frags'] = '平均擊毀艦艇數';
				localizationText['zh-tw']['info.statistics.pvp.avg_planes_killed'] = '平均擊毀飛機數';
				localizationText['zh-tw']['info.statistics.pvp.avg_capture_points'] = '平均佔領點數';
				localizationText['zh-tw']['info.statistics.pvp.avg_dropped_capture_points'] = '平均防禦點數';
				
				localizationText['zh-tw']['info.statistics.pvp.max_xp'] = '最大經驗';
				localizationText['zh-tw']['info.statistics.pvp.max_damage_dealt'] = '最大造成傷害';
				localizationText['zh-tw']['info.statistics.pvp.max_frags_battle'] = '最大擊毀的艦艇數';
				localizationText['zh-tw']['info.statistics.pvp.max_planes_killed'] = '最大擊毀飛機數';
				
				localizationText['zh-tw']['info.statistics.pvp.wins_percents'] = '勝利率';
				localizationText['zh-tw']['info.statistics.pvp.survived_battles_percents'] = '存活率';
				
				localizationText['zh-tw']['info.statistics.pvp.wr'] = 'WR';
				localizationText['zh-tw']['info.statistics.pvp.wtr'] = 'WTR';
				
				localizationText['zh-tw']['info.ships_x_level'] = '10 lvl';
			}
			
			return localizationText[lang];
		}
	
		if(window.location.href.indexOf("accounts") > -1 && window.location.href.split('/').length >= 8 && window.location.href.split('/')[6].match(/[0-9]+/) != null){
		// the actual Flot code
			(function($){

				// Cache the prototype hasOwnProperty for faster access

				var hasOwnProperty = Object.prototype.hasOwnProperty;

				// A shim to provide 'detach' to jQuery versions prior to 1.4.  Using a DOM
				// operation produces the same effect as detach, i.e. removing the element
				// without touching its jQuery data.

				// Do not merge this into Flot 0.9, since it requires jQuery 1.4.4+.

				if (!$.fn.detach) {
					$.fn.detach = function() {
						return this.each(function() {
							if (this.parentNode) {
								this.parentNode.removeChild( this );
							}
						});
					};
				}

				///////////////////////////////////////////////////////////////////////////
				// The Canvas object is a wrapper around an HTML5 <canvas> tag.
				//
				// @constructor
				// @param {string} cls List of classes to apply to the canvas.
				// @param {element} container Element onto which to append the canvas.
				//
				// Requiring a container is a little iffy, but unfortunately canvas
				// operations don't work unless the canvas is attached to the DOM.

				function Canvas(cls, container) {

					var element = container.children("." + cls)[0];

					if (element == null) {

						element = document.createElement("canvas");
						element.className = cls;

						$(element).css({ direction: "ltr", position: "absolute", left: 0, top: 0 })
							.appendTo(container);

						// If HTML5 Canvas isn't available, fall back to [Ex|Flash]canvas

						if (!element.getContext) {
							if (window.G_vmlCanvasManager) {
								element = window.G_vmlCanvasManager.initElement(element);
							} else {
								throw new Error("Canvas is not available. If you're using IE with a fall-back such as Excanvas, then there's either a mistake in your conditional include, or the page has no DOCTYPE and is rendering in Quirks Mode.");
							}
						}
					}

					this.element = element;

					var context = this.context = element.getContext("2d");

					// Determine the screen's ratio of physical to device-independent
					// pixels.  This is the ratio between the canvas width that the browser
					// advertises and the number of pixels actually present in that space.

					// The iPhone 4, for example, has a device-independent width of 320px,
					// but its screen is actually 640px wide.  It therefore has a pixel
					// ratio of 2, while most normal devices have a ratio of 1.

					var devicePixelRatio = window.devicePixelRatio || 1,
						backingStoreRatio =
							context.webkitBackingStorePixelRatio ||
							context.mozBackingStorePixelRatio ||
							context.msBackingStorePixelRatio ||
							context.oBackingStorePixelRatio ||
							context.backingStorePixelRatio || 1;

					this.pixelRatio = devicePixelRatio / backingStoreRatio;

					// Size the canvas to match the internal dimensions of its container

					this.resize(container.width(), container.height());

					// Collection of HTML div layers for text overlaid onto the canvas

					this.textContainer = null;
					this.text = {};

					// Cache of text fragments and metrics, so we can avoid expensively
					// re-calculating them when the plot is re-rendered in a loop.

					this._textCache = {};
				}

				// Resizes the canvas to the given dimensions.
				//
				// @param {number} width New width of the canvas, in pixels.
				// @param {number} width New height of the canvas, in pixels.

				Canvas.prototype.resize = function(width, height) {

					if (width <= 0 || height <= 0) {
						throw new Error("Invalid dimensions for plot, width = " + width + ", height = " + height);
					}

					var element = this.element,
						context = this.context,
						pixelRatio = this.pixelRatio;

					// Resize the canvas, increasing its density based on the display's
					// pixel ratio; basically giving it more pixels without increasing the
					// size of its element, to take advantage of the fact that retina
					// displays have that many more pixels in the same advertised space.

					// Resizing should reset the state (excanvas seems to be buggy though)

					if (this.width != width) {
						element.width = width * pixelRatio;
						element.style.width = width + "px";
						this.width = width;
					}

					if (this.height != height) {
						element.height = height * pixelRatio;
						element.style.height = height + "px";
						this.height = height;
					}

					// Save the context, so we can reset in case we get replotted.  The
					// restore ensure that we're really back at the initial state, and
					// should be safe even if we haven't saved the initial state yet.

					context.restore();
					context.save();

					// Scale the coordinate space to match the display density; so even though we
					// may have twice as many pixels, we still want lines and other drawing to
					// appear at the same size; the extra pixels will just make them crisper.

					context.scale(pixelRatio, pixelRatio);
				};

				// Clears the entire canvas area, not including any overlaid HTML text

				Canvas.prototype.clear = function() {
					this.context.clearRect(0, 0, this.width, this.height);
				};

				// Finishes rendering the canvas, including managing the text overlay.

				Canvas.prototype.render = function() {

					var cache = this._textCache;

					// For each text layer, add elements marked as active that haven't
					// already been rendered, and remove those that are no longer active.

					for (var layerKey in cache) {
						if (hasOwnProperty.call(cache, layerKey)) {

							var layer = this.getTextLayer(layerKey),
								layerCache = cache[layerKey];

							layer.hide();

							for (var styleKey in layerCache) {
								if (hasOwnProperty.call(layerCache, styleKey)) {
									var styleCache = layerCache[styleKey];
									for (var key in styleCache) {
										if (hasOwnProperty.call(styleCache, key)) {

											var positions = styleCache[key].positions;

											for (var i = 0, position; position = positions[i]; i++) {
												if (position.active) {
													if (!position.rendered) {
														layer.append(position.element);
														position.rendered = true;
													}
												} else {
													positions.splice(i--, 1);
													if (position.rendered) {
														position.element.detach();
													}
												}
											}

											if (positions.length == 0) {
												delete styleCache[key];
											}
										}
									}
								}
							}

							layer.show();
						}
					}
				};

				// Creates (if necessary) and returns the text overlay container.
				//
				// @param {string} classes String of space-separated CSS classes used to
				//     uniquely identify the text layer.
				// @return {object} The jQuery-wrapped text-layer div.

				Canvas.prototype.getTextLayer = function(classes) {

					var layer = this.text[classes];

					// Create the text layer if it doesn't exist

					if (layer == null) {

						// Create the text layer container, if it doesn't exist

						if (this.textContainer == null) {
							this.textContainer = $("<div class='flot-text'></div>")
								.css({
									position: "absolute",
									top: 0,
									left: 0,
									bottom: 0,
									right: 0,
									'font-size': "smaller",
									color: "#545454"
								})
								.insertAfter(this.element);
						}

						layer = this.text[classes] = $("<div></div>")
							.addClass(classes)
							.css({
								position: "absolute",
								top: 0,
								left: 0,
								bottom: 0,
								right: 0
							})
							.appendTo(this.textContainer);
					}

					return layer;
				};

				// Creates (if necessary) and returns a text info object.
				//
				// The object looks like this:
				//
				// {
				//     width: Width of the text's wrapper div.
				//     height: Height of the text's wrapper div.
				//     element: The jQuery-wrapped HTML div containing the text.
				//     positions: Array of positions at which this text is drawn.
				// }
				//
				// The positions array contains objects that look like this:
				//
				// {
				//     active: Flag indicating whether the text should be visible.
				//     rendered: Flag indicating whether the text is currently visible.
				//     element: The jQuery-wrapped HTML div containing the text.
				//     x: X coordinate at which to draw the text.
				//     y: Y coordinate at which to draw the text.
				// }
				//
				// Each position after the first receives a clone of the original element.
				//
				// The idea is that that the width, height, and general 'identity' of the
				// text is constant no matter where it is placed; the placements are a
				// secondary property.
				//
				// Canvas maintains a cache of recently-used text info objects; getTextInfo
				// either returns the cached element or creates a new entry.
				//
				// @param {string} layer A string of space-separated CSS classes uniquely
				//     identifying the layer containing this text.
				// @param {string} text Text string to retrieve info for.
				// @param {(string|object)=} font Either a string of space-separated CSS
				//     classes or a font-spec object, defining the text's font and style.
				// @param {number=} angle Angle at which to rotate the text, in degrees.
				//     Angle is currently unused, it will be implemented in the future.
				// @param {number=} width Maximum width of the text before it wraps.
				// @return {object} a text info object.

				Canvas.prototype.getTextInfo = function(layer, text, font, angle, width) {

					var textStyle, layerCache, styleCache, info;

					// Cast the value to a string, in case we were given a number or such

					text = "" + text;

					// If the font is a font-spec object, generate a CSS font definition

					if (typeof font === "object") {
						textStyle = font.style + " " + font.variant + " " + font.weight + " " + font.size + "px/" + font.lineHeight + "px " + font.family;
					} else {
						textStyle = font;
					}

					// Retrieve (or create) the cache for the text's layer and styles

					layerCache = this._textCache[layer];

					if (layerCache == null) {
						layerCache = this._textCache[layer] = {};
					}

					styleCache = layerCache[textStyle];

					if (styleCache == null) {
						styleCache = layerCache[textStyle] = {};
					}

					info = styleCache[text];

					// If we can't find a matching element in our cache, create a new one

					if (info == null) {

						var element = $("<div></div>").html(text)
							.css({
								position: "absolute",
								'max-width': width,
								top: -9999
							})
							.appendTo(this.getTextLayer(layer));

						if (typeof font === "object") {
							element.css({
								font: textStyle,
								color: font.color
							});
						} else if (typeof font === "string") {
							element.addClass(font);
						}

						info = styleCache[text] = {
							width: element.outerWidth(true),
							height: element.outerHeight(true),
							element: element,
							positions: []
						};

						element.detach();
					}

					return info;
				};

				// Adds a text string to the canvas text overlay.
				//
				// The text isn't drawn immediately; it is marked as rendering, which will
				// result in its addition to the canvas on the next render pass.
				//
				// @param {string} layer A string of space-separated CSS classes uniquely
				//     identifying the layer containing this text.
				// @param {number} x X coordinate at which to draw the text.
				// @param {number} y Y coordinate at which to draw the text.
				// @param {string} text Text string to draw.
				// @param {(string|object)=} font Either a string of space-separated CSS
				//     classes or a font-spec object, defining the text's font and style.
				// @param {number=} angle Angle at which to rotate the text, in degrees.
				//     Angle is currently unused, it will be implemented in the future.
				// @param {number=} width Maximum width of the text before it wraps.
				// @param {string=} halign Horizontal alignment of the text; either "left",
				//     "center" or "right".
				// @param {string=} valign Vertical alignment of the text; either "top",
				//     "middle" or "bottom".

				Canvas.prototype.addText = function(layer, x, y, text, font, angle, width, halign, valign) {

					var info = this.getTextInfo(layer, text, font, angle, width),
						positions = info.positions;

					// Tweak the div's position to match the text's alignment

					if (halign == "center") {
						x -= info.width / 2;
					} else if (halign == "right") {
						x -= info.width;
					}

					if (valign == "middle") {
						y -= info.height / 2;
					} else if (valign == "bottom") {
						y -= info.height;
					}

					// Determine whether this text already exists at this position.
					// If so, mark it for inclusion in the next render pass.

					for (var i = 0, position; position = positions[i]; i++) {
						if (position.x == x && position.y == y) {
							position.active = true;
							return;
						}
					}

					// If the text doesn't exist at this position, create a new entry

					// For the very first position we'll re-use the original element,
					// while for subsequent ones we'll clone it.

					position = {
						active: true,
						rendered: false,
						element: positions.length ? info.element.clone() : info.element,
						x: x,
						y: y
					};

					positions.push(position);

					// Move the element to its final position within the container

					position.element.css({
						top: Math.round(y),
						left: Math.round(x),
						'text-align': halign	// In case the text wraps
					});
				};

				// Removes one or more text strings from the canvas text overlay.
				//
				// If no parameters are given, all text within the layer is removed.
				//
				// Note that the text is not immediately removed; it is simply marked as
				// inactive, which will result in its removal on the next render pass.
				// This avoids the performance penalty for 'clear and redraw' behavior,
				// where we potentially get rid of all text on a layer, but will likely
				// add back most or all of it later, as when redrawing axes, for example.
				//
				// @param {string} layer A string of space-separated CSS classes uniquely
				//     identifying the layer containing this text.
				// @param {number=} x X coordinate of the text.
				// @param {number=} y Y coordinate of the text.
				// @param {string=} text Text string to remove.
				// @param {(string|object)=} font Either a string of space-separated CSS
				//     classes or a font-spec object, defining the text's font and style.
				// @param {number=} angle Angle at which the text is rotated, in degrees.
				//     Angle is currently unused, it will be implemented in the future.

				Canvas.prototype.removeText = function(layer, x, y, text, font, angle) {
					if (text == null) {
						var layerCache = this._textCache[layer];
						if (layerCache != null) {
							for (var styleKey in layerCache) {
								if (hasOwnProperty.call(layerCache, styleKey)) {
									var styleCache = layerCache[styleKey];
									for (var key in styleCache) {
										if (hasOwnProperty.call(styleCache, key)) {
											var positions = styleCache[key].positions;
											for (var i = 0, position; position = positions[i]; i++) {
												position.active = false;
											}
										}
									}
								}
							}
						}
					} else {
						var positions = this.getTextInfo(layer, text, font, angle).positions;
						for (var i = 0, position; position = positions[i]; i++) {
							if (position.x == x && position.y == y) {
								position.active = false;
							}
						}
					}
				};

				///////////////////////////////////////////////////////////////////////////
				// The top-level container for the entire plot.

				function Plot(placeholder, data_, options_, plugins) {
					// data is on the form:
					//   [ series1, series2 ... ]
					// where series is either just the data as [ [x1, y1], [x2, y2], ... ]
					// or { data: [ [x1, y1], [x2, y2], ... ], label: "some label", ... }

					var series = [],
						options = {
							// the color theme used for graphs
							colors: ["#edc240", "#afd8f8", "#cb4b4b", "#4da74d", "#9440ed"],
							legend: {
								show: true,
								noColumns: 1, // number of colums in legend table
								labelFormatter: null, // fn: string -> string
								labelBoxBorderColor: "#ccc", // border color for the little label boxes
								container: null, // container (as jQuery object) to put legend in, null means default on top of graph
								position: "ne", // position of default legend container within plot
								margin: 5, // distance from grid edge to default legend container within plot
								backgroundColor: null, // null means auto-detect
								backgroundOpacity: 0.85, // set to 0 to avoid background
								sorted: null    // default to no legend sorting
							},
							xaxis: {
								show: null, // null = auto-detect, true = always, false = never
								position: "bottom", // or "top"
								mode: null, // null or "time"
								font: null, // null (derived from CSS in placeholder) or object like { size: 11, lineHeight: 13, style: "italic", weight: "bold", family: "sans-serif", variant: "small-caps" }
								color: null, // base color, labels, ticks
								tickColor: null, // possibly different color of ticks, e.g. "rgba(0,0,0,0.15)"
								transform: null, // null or f: number -> number to transform axis
								inverseTransform: null, // if transform is set, this should be the inverse function
								min: null, // min. value to show, null means set automatically
								max: null, // max. value to show, null means set automatically
								autoscaleMargin: null, // margin in % to add if auto-setting min/max
								ticks: null, // either [1, 3] or [[1, "a"], 3] or (fn: axis info -> ticks) or app. number of ticks for auto-ticks
								tickFormatter: null, // fn: number -> string
								labelWidth: null, // size of tick labels in pixels
								labelHeight: null,
								reserveSpace: null, // whether to reserve space even if axis isn't shown
								tickLength: null, // size in pixels of ticks, or "full" for whole line
								alignTicksWithAxis: null, // axis number or null for no sync
								tickDecimals: null, // no. of decimals, null means auto
								tickSize: null, // number or [number, "unit"]
								minTickSize: null // number or [number, "unit"]
							},
							yaxis: {
								autoscaleMargin: 0.02,
								position: "left" // or "right"
							},
							xaxes: [],
							yaxes: [],
							series: {
								points: {
									show: false,
									radius: 3,
									lineWidth: 2, // in pixels
									fill: true,
									fillColor: "#ffffff",
									symbol: "circle" // or callback
								},
								lines: {
									// we don't put in show: false so we can see
									// whether lines were actively disabled
									lineWidth: 2, // in pixels
									fill: false,
									fillColor: null,
									steps: false
									// Omit 'zero', so we can later default its value to
									// match that of the 'fill' option.
								},
								bars: {
									show: false,
									lineWidth: 2, // in pixels
									barWidth: 1, // in units of the x axis
									fill: true,
									fillColor: null,
									align: "left", // "left", "right", or "center"
									horizontal: false,
									zero: true
								},
								shadowSize: 3,
								highlightColor: null
							},
							grid: {
								show: true,
								aboveData: false,
								color: "#545454", // primary color used for outline and labels
								backgroundColor: null, // null for transparent, else color
								borderColor: null, // set if different from the grid color
								tickColor: null, // color for the ticks, e.g. "rgba(0,0,0,0.15)"
								margin: 0, // distance from the canvas edge to the grid
								labelMargin: 5, // in pixels
								axisMargin: 8, // in pixels
								borderWidth: 2, // in pixels
								minBorderMargin: null, // in pixels, null means taken from points radius
								markings: null, // array of ranges or fn: axes -> array of ranges
								markingsColor: "#f4f4f4",
								markingsLineWidth: 2,
								// interactive stuff
								clickable: false,
								hoverable: false,
								autoHighlight: true, // highlight in case mouse is near
								mouseActiveRadius: 10 // how far the mouse can be away to activate an item
							},
							interaction: {
								redrawOverlayInterval: 1000/60 // time between updates, -1 means in same flow
							},
							hooks: {}
						},
					surface = null,     // the canvas for the plot itself
					overlay = null,     // canvas for interactive stuff on top of plot
					eventHolder = null, // jQuery object that events should be bound to
					ctx = null, octx = null,
					xaxes = [], yaxes = [],
					plotOffset = { left: 0, right: 0, top: 0, bottom: 0},
					plotWidth = 0, plotHeight = 0,
					hooks = {
						processOptions: [],
						processRawData: [],
						processDatapoints: [],
						processOffset: [],
						drawBackground: [],
						drawSeries: [],
						draw: [],
						bindEvents: [],
						drawOverlay: [],
						shutdown: []
					},
					plot = this;

					// public functions
					plot.setData = setData;
					plot.setupGrid = setupGrid;
					plot.draw = draw;
					plot.getPlaceholder = function() { return placeholder; };
					plot.getCanvas = function() { return surface.element; };
					plot.getPlotOffset = function() { return plotOffset; };
					plot.width = function () { return plotWidth; };
					plot.height = function () { return plotHeight; };
					plot.offset = function () {
						var o = eventHolder.offset();
						o.left += plotOffset.left;
						o.top += plotOffset.top;
						return o;
					};
					plot.getData = function () { return series; };
					plot.getAxes = function () {
						var res = {}, i;
						$.each(xaxes.concat(yaxes), function (_, axis) {
							if (axis)
								res[axis.direction + (axis.n != 1 ? axis.n : "") + "axis"] = axis;
						});
						return res;
					};
					plot.getXAxes = function () { return xaxes; };
					plot.getYAxes = function () { return yaxes; };
					plot.c2p = canvasToAxisCoords;
					plot.p2c = axisToCanvasCoords;
					plot.getOptions = function () { return options; };
					plot.highlight = highlight;
					plot.unhighlight = unhighlight;
					plot.triggerRedrawOverlay = triggerRedrawOverlay;
					plot.pointOffset = function(point) {
						return {
							left: parseInt(xaxes[axisNumber(point, "x") - 1].p2c(+point.x) + plotOffset.left, 10),
							top: parseInt(yaxes[axisNumber(point, "y") - 1].p2c(+point.y) + plotOffset.top, 10)
						};
					};
					plot.shutdown = shutdown;
					plot.destroy = function () {
						shutdown();
						placeholder.removeData("plot").empty();

						series = [];
						options = null;
						surface = null;
						overlay = null;
						eventHolder = null;
						ctx = null;
						octx = null;
						xaxes = [];
						yaxes = [];
						hooks = null;
						highlights = [];
						plot = null;
					};
					plot.resize = function () {
						var width = placeholder.width(),
							height = placeholder.height();
						surface.resize(width, height);
						overlay.resize(width, height);
					};

					// public attributes
					plot.hooks = hooks;

					// initialize
					initPlugins(plot);
					parseOptions(options_);
					setupCanvases();
					setData(data_);
					setupGrid();
					draw();
					bindEvents();


					function executeHooks(hook, args) {
						args = [plot].concat(args);
						for (var i = 0; i < hook.length; ++i)
							hook[i].apply(this, args);
					}

					function initPlugins() {

						// References to key classes, allowing plugins to modify them

						var classes = {
							Canvas: Canvas
						};

						for (var i = 0; i < plugins.length; ++i) {
							var p = plugins[i];
							p.init(plot, classes);
							if (p.options)
								$.extend(true, options, p.options);
						}
					}

					function parseOptions(opts) {

						$.extend(true, options, opts);

						// $.extend merges arrays, rather than replacing them.  When less
						// colors are provided than the size of the default palette, we
						// end up with those colors plus the remaining defaults, which is
						// not expected behavior; avoid it by replacing them here.

						if (opts && opts.colors) {
							options.colors = opts.colors;
						}

						if (options.xaxis.color == null)
							options.xaxis.color = $.color.parse(options.grid.color).scale('a', 0.22).toString();
						if (options.yaxis.color == null)
							options.yaxis.color = $.color.parse(options.grid.color).scale('a', 0.22).toString();

						if (options.xaxis.tickColor == null) // grid.tickColor for back-compatibility
							options.xaxis.tickColor = options.grid.tickColor || options.xaxis.color;
						if (options.yaxis.tickColor == null) // grid.tickColor for back-compatibility
							options.yaxis.tickColor = options.grid.tickColor || options.yaxis.color;

						if (options.grid.borderColor == null)
							options.grid.borderColor = options.grid.color;
						if (options.grid.tickColor == null)
							options.grid.tickColor = $.color.parse(options.grid.color).scale('a', 0.22).toString();

						// Fill in defaults for axis options, including any unspecified
						// font-spec fields, if a font-spec was provided.

						// If no x/y axis options were provided, create one of each anyway,
						// since the rest of the code assumes that they exist.

						var i, axisOptions, axisCount,
							fontSize = placeholder.css("font-size"),
							fontSizeDefault = fontSize ? +fontSize.replace("px", "") : 13,
							fontDefaults = {
								style: placeholder.css("font-style"),
								size: Math.round(0.8 * fontSizeDefault),
								variant: placeholder.css("font-variant"),
								weight: placeholder.css("font-weight"),
								family: placeholder.css("font-family")
							};

						axisCount = options.xaxes.length || 1;
						for (i = 0; i < axisCount; ++i) {

							axisOptions = options.xaxes[i];
							if (axisOptions && !axisOptions.tickColor) {
								axisOptions.tickColor = axisOptions.color;
							}

							axisOptions = $.extend(true, {}, options.xaxis, axisOptions);
							options.xaxes[i] = axisOptions;

							if (axisOptions.font) {
								axisOptions.font = $.extend({}, fontDefaults, axisOptions.font);
								if (!axisOptions.font.color) {
									axisOptions.font.color = axisOptions.color;
								}
								if (!axisOptions.font.lineHeight) {
									axisOptions.font.lineHeight = Math.round(axisOptions.font.size * 1.15);
								}
							}
						}

						axisCount = options.yaxes.length || 1;
						for (i = 0; i < axisCount; ++i) {

							axisOptions = options.yaxes[i];
							if (axisOptions && !axisOptions.tickColor) {
								axisOptions.tickColor = axisOptions.color;
							}

							axisOptions = $.extend(true, {}, options.yaxis, axisOptions);
							options.yaxes[i] = axisOptions;

							if (axisOptions.font) {
								axisOptions.font = $.extend({}, fontDefaults, axisOptions.font);
								if (!axisOptions.font.color) {
									axisOptions.font.color = axisOptions.color;
								}
								if (!axisOptions.font.lineHeight) {
									axisOptions.font.lineHeight = Math.round(axisOptions.font.size * 1.15);
								}
							}
						}

						// backwards compatibility, to be removed in future
						if (options.xaxis.noTicks && options.xaxis.ticks == null)
							options.xaxis.ticks = options.xaxis.noTicks;
						if (options.yaxis.noTicks && options.yaxis.ticks == null)
							options.yaxis.ticks = options.yaxis.noTicks;
						if (options.x2axis) {
							options.xaxes[1] = $.extend(true, {}, options.xaxis, options.x2axis);
							options.xaxes[1].position = "top";
							// Override the inherit to allow the axis to auto-scale
							if (options.x2axis.min == null) {
								options.xaxes[1].min = null;
							}
							if (options.x2axis.max == null) {
								options.xaxes[1].max = null;
							}
						}
						if (options.y2axis) {
							options.yaxes[1] = $.extend(true, {}, options.yaxis, options.y2axis);
							options.yaxes[1].position = "right";
							// Override the inherit to allow the axis to auto-scale
							if (options.y2axis.min == null) {
								options.yaxes[1].min = null;
							}
							if (options.y2axis.max == null) {
								options.yaxes[1].max = null;
							}
						}
						if (options.grid.coloredAreas)
							options.grid.markings = options.grid.coloredAreas;
						if (options.grid.coloredAreasColor)
							options.grid.markingsColor = options.grid.coloredAreasColor;
						if (options.lines)
							$.extend(true, options.series.lines, options.lines);
						if (options.points)
							$.extend(true, options.series.points, options.points);
						if (options.bars)
							$.extend(true, options.series.bars, options.bars);
						if (options.shadowSize != null)
							options.series.shadowSize = options.shadowSize;
						if (options.highlightColor != null)
							options.series.highlightColor = options.highlightColor;

						// save options on axes for future reference
						for (i = 0; i < options.xaxes.length; ++i)
							getOrCreateAxis(xaxes, i + 1).options = options.xaxes[i];
						for (i = 0; i < options.yaxes.length; ++i)
							getOrCreateAxis(yaxes, i + 1).options = options.yaxes[i];

						// add hooks from options
						for (var n in hooks)
							if (options.hooks[n] && options.hooks[n].length)
								hooks[n] = hooks[n].concat(options.hooks[n]);

						executeHooks(hooks.processOptions, [options]);
					}

					function setData(d) {
						series = parseData(d);
						fillInSeriesOptions();
						processData();
					}

					function parseData(d) {
						var res = [];
						for (var i = 0; i < d.length; ++i) {
							var s = $.extend(true, {}, options.series);

							if (d[i].data != null) {
								s.data = d[i].data; // move the data instead of deep-copy
								delete d[i].data;

								$.extend(true, s, d[i]);

								d[i].data = s.data;
							}
							else
								s.data = d[i];
							res.push(s);
						}

						return res;
					}

					function axisNumber(obj, coord) {
						var a = obj[coord + "axis"];
						if (typeof a == "object") // if we got a real axis, extract number
							a = a.n;
						if (typeof a != "number")
							a = 1; // default to first axis
						return a;
					}

					function allAxes() {
						// return flat array without annoying null entries
						return $.grep(xaxes.concat(yaxes), function (a) { return a; });
					}

					function canvasToAxisCoords(pos) {
						// return an object with x/y corresponding to all used axes
						var res = {}, i, axis;
						for (i = 0; i < xaxes.length; ++i) {
							axis = xaxes[i];
							if (axis && axis.used)
								res["x" + axis.n] = axis.c2p(pos.left);
						}

						for (i = 0; i < yaxes.length; ++i) {
							axis = yaxes[i];
							if (axis && axis.used)
								res["y" + axis.n] = axis.c2p(pos.top);
						}

						if (res.x1 !== undefined)
							res.x = res.x1;
						if (res.y1 !== undefined)
							res.y = res.y1;

						return res;
					}

					function axisToCanvasCoords(pos) {
						// get canvas coords from the first pair of x/y found in pos
						var res = {}, i, axis, key;

						for (i = 0; i < xaxes.length; ++i) {
							axis = xaxes[i];
							if (axis && axis.used) {
								key = "x" + axis.n;
								if (pos[key] == null && axis.n == 1)
									key = "x";

								if (pos[key] != null) {
									res.left = axis.p2c(pos[key]);
									break;
								}
							}
						}

						for (i = 0; i < yaxes.length; ++i) {
							axis = yaxes[i];
							if (axis && axis.used) {
								key = "y" + axis.n;
								if (pos[key] == null && axis.n == 1)
									key = "y";

								if (pos[key] != null) {
									res.top = axis.p2c(pos[key]);
									break;
								}
							}
						}

						return res;
					}

					function getOrCreateAxis(axes, number) {
						if (!axes[number - 1])
							axes[number - 1] = {
								n: number, // save the number for future reference
								direction: axes == xaxes ? "x" : "y",
								options: $.extend(true, {}, axes == xaxes ? options.xaxis : options.yaxis)
							};

						return axes[number - 1];
					}

					function fillInSeriesOptions() {

						var neededColors = series.length, maxIndex = -1, i;

						// Subtract the number of series that already have fixed colors or
						// color indexes from the number that we still need to generate.

						for (i = 0; i < series.length; ++i) {
							var sc = series[i].color;
							if (sc != null) {
								neededColors--;
								if (typeof sc == "number" && sc > maxIndex) {
									maxIndex = sc;
								}
							}
						}

						// If any of the series have fixed color indexes, then we need to
						// generate at least as many colors as the highest index.

						if (neededColors <= maxIndex) {
							neededColors = maxIndex + 1;
						}

						// Generate all the colors, using first the option colors and then
						// variations on those colors once they're exhausted.

						var c, colors = [], colorPool = options.colors,
							colorPoolSize = colorPool.length, variation = 0;

						for (i = 0; i < neededColors; i++) {

							c = $.color.parse(colorPool[i % colorPoolSize] || "#666");

							// Each time we exhaust the colors in the pool we adjust
							// a scaling factor used to produce more variations on
							// those colors. The factor alternates negative/positive
							// to produce lighter/darker colors.

							// Reset the variation after every few cycles, or else
							// it will end up producing only white or black colors.

							if (i % colorPoolSize == 0 && i) {
								if (variation >= 0) {
									if (variation < 0.5) {
										variation = -variation - 0.2;
									} else variation = 0;
								} else variation = -variation;
							}

							colors[i] = c.scale('rgb', 1 + variation);
						}

						// Finalize the series options, filling in their colors

						var colori = 0, s;
						for (i = 0; i < series.length; ++i) {
							s = series[i];

							// assign colors
							if (s.color == null) {
								s.color = colors[colori].toString();
								++colori;
							}
							else if (typeof s.color == "number")
								s.color = colors[s.color].toString();

							// turn on lines automatically in case nothing is set
							if (s.lines.show == null) {
								var v, show = true;
								for (v in s)
									if (s[v] && s[v].show) {
										show = false;
										break;
									}
								if (show)
									s.lines.show = true;
							}

							// If nothing was provided for lines.zero, default it to match
							// lines.fill, since areas by default should extend to zero.

							if (s.lines.zero == null) {
								s.lines.zero = !!s.lines.fill;
							}

							// setup axes
							s.xaxis = getOrCreateAxis(xaxes, axisNumber(s, "x"));
							s.yaxis = getOrCreateAxis(yaxes, axisNumber(s, "y"));
						}
					}

					function processData() {
						var topSentry = Number.POSITIVE_INFINITY,
							bottomSentry = Number.NEGATIVE_INFINITY,
							fakeInfinity = Number.MAX_VALUE,
							i, j, k, m, length,
							s, points, ps, x, y, axis, val, f, p,
							data, format;

						function updateAxis(axis, min, max) {
							if (min < axis.datamin && min != -fakeInfinity)
								axis.datamin = min;
							if (max > axis.datamax && max != fakeInfinity)
								axis.datamax = max;
						}

						$.each(allAxes(), function (_, axis) {
							// init axis
							axis.datamin = topSentry;
							axis.datamax = bottomSentry;
							axis.used = false;
						});

						for (i = 0; i < series.length; ++i) {
							s = series[i];
							s.datapoints = { points: [] };

							executeHooks(hooks.processRawData, [ s, s.data, s.datapoints ]);
						}

						// first pass: clean and copy data
						for (i = 0; i < series.length; ++i) {
							s = series[i];

							data = s.data;
							format = s.datapoints.format;

							if (!format) {
								format = [];
								// find out how to copy
								format.push({ x: true, number: true, required: true });
								format.push({ y: true, number: true, required: true });

								if (s.bars.show || (s.lines.show && s.lines.fill)) {
									var autoscale = !!((s.bars.show && s.bars.zero) || (s.lines.show && s.lines.zero));
									format.push({ y: true, number: true, required: false, defaultValue: 0, autoscale: autoscale });
									if (s.bars.horizontal) {
										delete format[format.length - 1].y;
										format[format.length - 1].x = true;
									}
								}

								s.datapoints.format = format;
							}

							if (s.datapoints.pointsize != null)
								continue; // already filled in

							s.datapoints.pointsize = format.length;

							ps = s.datapoints.pointsize;
							points = s.datapoints.points;

							var insertSteps = s.lines.show && s.lines.steps;
							s.xaxis.used = s.yaxis.used = true;

							for (j = k = 0; j < data.length; ++j, k += ps) {
								p = data[j];

								var nullify = p == null;
								if (!nullify) {
									for (m = 0; m < ps; ++m) {
										val = p[m];
										f = format[m];

										if (f) {
											if (f.number && val != null) {
												val = +val; // convert to number
												if (isNaN(val))
													val = null;
												else if (val == Infinity)
													val = fakeInfinity;
												else if (val == -Infinity)
													val = -fakeInfinity;
											}

											if (val == null) {
												if (f.required)
													nullify = true;

												if (f.defaultValue != null)
													val = f.defaultValue;
											}
										}

										points[k + m] = val;
									}
								}

								if (nullify) {
									for (m = 0; m < ps; ++m) {
										val = points[k + m];
										if (val != null) {
											f = format[m];
											// extract min/max info
											if (f.autoscale !== false) {
												if (f.x) {
													updateAxis(s.xaxis, val, val);
												}
												if (f.y) {
													updateAxis(s.yaxis, val, val);
												}
											}
										}
										points[k + m] = null;
									}
								}
								else {
									// a little bit of line specific stuff that
									// perhaps shouldn't be here, but lacking
									// better means...
									if (insertSteps && k > 0
										&& points[k - ps] != null
										&& points[k - ps] != points[k]
										&& points[k - ps + 1] != points[k + 1]) {
										// copy the point to make room for a middle point
										for (m = 0; m < ps; ++m)
											points[k + ps + m] = points[k + m];

										// middle point has same y
										points[k + 1] = points[k - ps + 1];

										// we've added a point, better reflect that
										k += ps;
									}
								}
							}
						}

						// give the hooks a chance to run
						for (i = 0; i < series.length; ++i) {
							s = series[i];

							executeHooks(hooks.processDatapoints, [ s, s.datapoints]);
						}

						// second pass: find datamax/datamin for auto-scaling
						for (i = 0; i < series.length; ++i) {
							s = series[i];
							points = s.datapoints.points;
							ps = s.datapoints.pointsize;
							format = s.datapoints.format;

							var xmin = topSentry, ymin = topSentry,
								xmax = bottomSentry, ymax = bottomSentry;

							for (j = 0; j < points.length; j += ps) {
								if (points[j] == null)
									continue;

								for (m = 0; m < ps; ++m) {
									val = points[j + m];
									f = format[m];
									if (!f || f.autoscale === false || val == fakeInfinity || val == -fakeInfinity)
										continue;

									if (f.x) {
										if (val < xmin)
											xmin = val;
										if (val > xmax)
											xmax = val;
									}
									if (f.y) {
										if (val < ymin)
											ymin = val;
										if (val > ymax)
											ymax = val;
									}
								}
							}

							if (s.bars.show) {
								// make sure we got room for the bar on the dancing floor
								var delta;

								switch (s.bars.align) {
									case "left":
										delta = 0;
										break;
									case "right":
										delta = -s.bars.barWidth;
										break;
									default:
										delta = -s.bars.barWidth / 2;
								}

								if (s.bars.horizontal) {
									ymin += delta;
									ymax += delta + s.bars.barWidth;
								}
								else {
									xmin += delta;
									xmax += delta + s.bars.barWidth;
								}
							}

							updateAxis(s.xaxis, xmin, xmax);
							updateAxis(s.yaxis, ymin, ymax);
						}

						$.each(allAxes(), function (_, axis) {
							if (axis.datamin == topSentry)
								axis.datamin = null;
							if (axis.datamax == bottomSentry)
								axis.datamax = null;
						});
					}

					function setupCanvases() {

						// Make sure the placeholder is clear of everything except canvases
						// from a previous plot in this container that we'll try to re-use.

						placeholder.css("padding", 0) // padding messes up the positioning
							.children().filter(function(){
								return !$(this).hasClass("flot-overlay") && !$(this).hasClass('flot-base');
							}).remove();

						if (placeholder.css("position") == 'static')
							placeholder.css("position", "relative"); // for positioning labels and overlay

						surface = new Canvas("flot-base", placeholder);
						overlay = new Canvas("flot-overlay", placeholder); // overlay canvas for interactive features

						ctx = surface.context;
						octx = overlay.context;

						// define which element we're listening for events on
						eventHolder = $(overlay.element).unbind();

						// If we're re-using a plot object, shut down the old one

						var existing = placeholder.data("plot");

						if (existing) {
							existing.shutdown();
							overlay.clear();
						}

						// save in case we get replotted
						placeholder.data("plot", plot);
					}

					function bindEvents() {
						// bind events
						if (options.grid.hoverable) {
							eventHolder.mousemove(onMouseMove);

							// Use bind, rather than .mouseleave, because we officially
							// still support jQuery 1.2.6, which doesn't define a shortcut
							// for mouseenter or mouseleave.  This was a bug/oversight that
							// was fixed somewhere around 1.3.x.  We can return to using
							// .mouseleave when we drop support for 1.2.6.

							eventHolder.bind("mouseleave", onMouseLeave);
						}

						if (options.grid.clickable)
							eventHolder.click(onClick);

						executeHooks(hooks.bindEvents, [eventHolder]);
					}

					function shutdown() {
						if (redrawTimeout)
							clearTimeout(redrawTimeout);

						eventHolder.unbind("mousemove", onMouseMove);
						eventHolder.unbind("mouseleave", onMouseLeave);
						eventHolder.unbind("click", onClick);

						executeHooks(hooks.shutdown, [eventHolder]);
					}

					function setTransformationHelpers(axis) {
						// set helper functions on the axis, assumes plot area
						// has been computed already

						function identity(x) { return x; }

						var s, m, t = axis.options.transform || identity,
							it = axis.options.inverseTransform;

						// precompute how much the axis is scaling a point
						// in canvas space
						if (axis.direction == "x") {
							s = axis.scale = plotWidth / Math.abs(t(axis.max) - t(axis.min));
							m = Math.min(t(axis.max), t(axis.min));
						}
						else {
							s = axis.scale = plotHeight / Math.abs(t(axis.max) - t(axis.min));
							s = -s;
							m = Math.max(t(axis.max), t(axis.min));
						}

						// data point to canvas coordinate
						if (t == identity) // slight optimization
							axis.p2c = function (p) { return (p - m) * s; };
						else
							axis.p2c = function (p) { return (t(p) - m) * s; };
						// canvas coordinate to data point
						if (!it)
							axis.c2p = function (c) { return m + c / s; };
						else
							axis.c2p = function (c) { return it(m + c / s); };
					}

					function measureTickLabels(axis) {

						var opts = axis.options,
							ticks = axis.ticks || [],
							labelWidth = opts.labelWidth || 0,
							labelHeight = opts.labelHeight || 0,
							maxWidth = labelWidth || (axis.direction == "x" ? Math.floor(surface.width / (ticks.length || 1)) : null),
							legacyStyles = axis.direction + "Axis " + axis.direction + axis.n + "Axis",
							layer = "flot-" + axis.direction + "-axis flot-" + axis.direction + axis.n + "-axis " + legacyStyles,
							font = opts.font || "flot-tick-label tickLabel";

						for (var i = 0; i < ticks.length; ++i) {

							var t = ticks[i];

							if (!t.label)
								continue;

							var info = surface.getTextInfo(layer, t.label, font, null, maxWidth);

							labelWidth = Math.max(labelWidth, info.width);
							labelHeight = Math.max(labelHeight, info.height);
						}

						axis.labelWidth = opts.labelWidth || labelWidth;
						axis.labelHeight = opts.labelHeight || labelHeight;
					}

					function allocateAxisBoxFirstPhase(axis) {
						// find the bounding box of the axis by looking at label
						// widths/heights and ticks, make room by diminishing the
						// plotOffset; this first phase only looks at one
						// dimension per axis, the other dimension depends on the
						// other axes so will have to wait

						var lw = axis.labelWidth,
							lh = axis.labelHeight,
							pos = axis.options.position,
							isXAxis = axis.direction === "x",
							tickLength = axis.options.tickLength,
							axisMargin = options.grid.axisMargin,
							padding = options.grid.labelMargin,
							innermost = true,
							outermost = true,
							first = true,
							found = false;

						// Determine the axis's position in its direction and on its side

						$.each(isXAxis ? xaxes : yaxes, function(i, a) {
							if (a && (a.show || a.reserveSpace)) {
								if (a === axis) {
									found = true;
								} else if (a.options.position === pos) {
									if (found) {
										outermost = false;
									} else {
										innermost = false;
									}
								}
								if (!found) {
									first = false;
								}
							}
						});

						// The outermost axis on each side has no margin

						if (outermost) {
							axisMargin = 0;
						}

						// The ticks for the first axis in each direction stretch across

						if (tickLength == null) {
							tickLength = first ? "full" : 5;
						}

						if (!isNaN(+tickLength))
							padding += +tickLength;

						if (isXAxis) {
							lh += padding;

							if (pos == "bottom") {
								plotOffset.bottom += lh + axisMargin;
								axis.box = { top: surface.height - plotOffset.bottom, height: lh };
							}
							else {
								axis.box = { top: plotOffset.top + axisMargin, height: lh };
								plotOffset.top += lh + axisMargin;
							}
						}
						else {
							lw += padding;

							if (pos == "left") {
								axis.box = { left: plotOffset.left + axisMargin, width: lw };
								plotOffset.left += lw + axisMargin;
							}
							else {
								plotOffset.right += lw + axisMargin;
								axis.box = { left: surface.width - plotOffset.right, width: lw };
							}
						}

						 // save for future reference
						axis.position = pos;
						axis.tickLength = tickLength;
						axis.box.padding = padding;
						axis.innermost = innermost;
					}

					function allocateAxisBoxSecondPhase(axis) {
						// now that all axis boxes have been placed in one
						// dimension, we can set the remaining dimension coordinates
						if (axis.direction == "x") {
							axis.box.left = plotOffset.left - axis.labelWidth / 2;
							axis.box.width = surface.width - plotOffset.left - plotOffset.right + axis.labelWidth;
						}
						else {
							axis.box.top = plotOffset.top - axis.labelHeight / 2;
							axis.box.height = surface.height - plotOffset.bottom - plotOffset.top + axis.labelHeight;
						}
					}

					function adjustLayoutForThingsStickingOut() {
						// possibly adjust plot offset to ensure everything stays
						// inside the canvas and isn't clipped off

						var minMargin = options.grid.minBorderMargin,
							axis, i;

						// check stuff from the plot (FIXME: this should just read
						// a value from the series, otherwise it's impossible to
						// customize)
						if (minMargin == null) {
							minMargin = 0;
							for (i = 0; i < series.length; ++i)
								minMargin = Math.max(minMargin, 2 * (series[i].points.radius + series[i].points.lineWidth/2));
						}

						var margins = {
							left: minMargin,
							right: minMargin,
							top: minMargin,
							bottom: minMargin
						};

						// check axis labels, note we don't check the actual
						// labels but instead use the overall width/height to not
						// jump as much around with replots
						$.each(allAxes(), function (_, axis) {
							if (axis.reserveSpace && axis.ticks && axis.ticks.length) {
								if (axis.direction === "x") {
									margins.left = Math.max(margins.left, axis.labelWidth / 2);
									margins.right = Math.max(margins.right, axis.labelWidth / 2);
								} else {
									margins.bottom = Math.max(margins.bottom, axis.labelHeight / 2);
									margins.top = Math.max(margins.top, axis.labelHeight / 2);
								}
							}
						});

						plotOffset.left = Math.ceil(Math.max(margins.left, plotOffset.left));
						plotOffset.right = Math.ceil(Math.max(margins.right, plotOffset.right));
						plotOffset.top = Math.ceil(Math.max(margins.top, plotOffset.top));
						plotOffset.bottom = Math.ceil(Math.max(margins.bottom, plotOffset.bottom));
					}

					function setupGrid() {
						var i, axes = allAxes(), showGrid = options.grid.show;

						// Initialize the plot's offset from the edge of the canvas

						for (var a in plotOffset) {
							var margin = options.grid.margin || 0;
							plotOffset[a] = typeof margin == "number" ? margin : margin[a] || 0;
						}

						executeHooks(hooks.processOffset, [plotOffset]);

						// If the grid is visible, add its border width to the offset

						for (var a in plotOffset) {
							if(typeof(options.grid.borderWidth) == "object") {
								plotOffset[a] += showGrid ? options.grid.borderWidth[a] : 0;
							}
							else {
								plotOffset[a] += showGrid ? options.grid.borderWidth : 0;
							}
						}

						$.each(axes, function (_, axis) {
							var axisOpts = axis.options;
							axis.show = axisOpts.show == null ? axis.used : axisOpts.show;
							axis.reserveSpace = axisOpts.reserveSpace == null ? axis.show : axisOpts.reserveSpace;
							setRange(axis);
						});

						if (showGrid) {

							var allocatedAxes = $.grep(axes, function (axis) {
								return axis.show || axis.reserveSpace;
							});

							$.each(allocatedAxes, function (_, axis) {
								// make the ticks
								setupTickGeneration(axis);
								setTicks(axis);
								snapRangeToTicks(axis, axis.ticks);
								// find labelWidth/Height for axis
								measureTickLabels(axis);
							});

							// with all dimensions calculated, we can compute the
							// axis bounding boxes, start from the outside
							// (reverse order)
							for (i = allocatedAxes.length - 1; i >= 0; --i)
								allocateAxisBoxFirstPhase(allocatedAxes[i]);

							// make sure we've got enough space for things that
							// might stick out
							adjustLayoutForThingsStickingOut();

							$.each(allocatedAxes, function (_, axis) {
								allocateAxisBoxSecondPhase(axis);
							});
						}

						plotWidth = surface.width - plotOffset.left - plotOffset.right;
						plotHeight = surface.height - plotOffset.bottom - plotOffset.top;

						// now we got the proper plot dimensions, we can compute the scaling
						$.each(axes, function (_, axis) {
							setTransformationHelpers(axis);
						});

						if (showGrid) {
							drawAxisLabels();
						}

						insertLegend();
					}

					function setRange(axis) {
						var opts = axis.options,
							min = +(opts.min != null ? opts.min : axis.datamin),
							max = +(opts.max != null ? opts.max : axis.datamax),
							delta = max - min;

						if (delta == 0.0) {
							// degenerate case
							var widen = max == 0 ? 1 : 0.01;

							if (opts.min == null)
								min -= widen;
							// always widen max if we couldn't widen min to ensure we
							// don't fall into min == max which doesn't work
							if (opts.max == null || opts.min != null)
								max += widen;
						}
						else {
							// consider autoscaling
							var margin = opts.autoscaleMargin;
							if (margin != null) {
								if (opts.min == null) {
									min -= delta * margin;
									// make sure we don't go below zero if all values
									// are positive
									if (min < 0 && axis.datamin != null && axis.datamin >= 0)
										min = 0;
								}
								if (opts.max == null) {
									max += delta * margin;
									if (max > 0 && axis.datamax != null && axis.datamax <= 0)
										max = 0;
								}
							}
						}
						axis.min = min;
						axis.max = max;
					}

					function setupTickGeneration(axis) {
						var opts = axis.options;

						// estimate number of ticks
						var noTicks;
						if (typeof opts.ticks == "number" && opts.ticks > 0)
							noTicks = opts.ticks;
						else
							// heuristic based on the model a*sqrt(x) fitted to
							// some data points that seemed reasonable
							noTicks = 0.3 * Math.sqrt(axis.direction == "x" ? surface.width : surface.height);

						var delta = (axis.max - axis.min) / noTicks,
							dec = -Math.floor(Math.log(delta) / Math.LN10),
							maxDec = opts.tickDecimals;

						if (maxDec != null && dec > maxDec) {
							dec = maxDec;
						}

						var magn = Math.pow(10, -dec),
							norm = delta / magn, // norm is between 1.0 and 10.0
							size;

						if (norm < 1.5) {
							size = 1;
						} else if (norm < 3) {
							size = 2;
							// special case for 2.5, requires an extra decimal
							if (norm > 2.25 && (maxDec == null || dec + 1 <= maxDec)) {
								size = 2.5;
								++dec;
							}
						} else if (norm < 7.5) {
							size = 5;
						} else {
							size = 10;
						}

						size *= magn;

						if (opts.minTickSize != null && size < opts.minTickSize) {
							size = opts.minTickSize;
						}

						axis.delta = delta;
						axis.tickDecimals = Math.max(0, maxDec != null ? maxDec : dec);
						axis.tickSize = opts.tickSize || size;

						// Time mode was moved to a plug-in in 0.8, and since so many people use it
						// we'll add an especially friendly reminder to make sure they included it.

						if (opts.mode == "time" && !axis.tickGenerator) {
							throw new Error("Time mode requires the flot.time plugin.");
						}

						// Flot supports base-10 axes; any other mode else is handled by a plug-in,
						// like flot.time.js.

						if (!axis.tickGenerator) {

							axis.tickGenerator = function (axis) {

								var ticks = [],
									start = floorInBase(axis.min, axis.tickSize),
									i = 0,
									v = Number.NaN,
									prev;

								do {
									prev = v;
									v = start + i * axis.tickSize;
									ticks.push(v);
									++i;
								} while (v < axis.max && v != prev);
								return ticks;
							};

							axis.tickFormatter = function (value, axis) {

								var factor = axis.tickDecimals ? Math.pow(10, axis.tickDecimals) : 1;
								var formatted = "" + Math.round(value * factor) / factor;

								// If tickDecimals was specified, ensure that we have exactly that
								// much precision; otherwise default to the value's own precision.

								if (axis.tickDecimals != null) {
									var decimal = formatted.indexOf(".");
									var precision = decimal == -1 ? 0 : formatted.length - decimal - 1;
									if (precision < axis.tickDecimals) {
										return (precision ? formatted : formatted + ".") + ("" + factor).substr(1, axis.tickDecimals - precision);
									}
								}

								return formatted;
							};
						}

						if ($.isFunction(opts.tickFormatter))
							axis.tickFormatter = function (v, axis) { return "" + opts.tickFormatter(v, axis); };

						if (opts.alignTicksWithAxis != null) {
							var otherAxis = (axis.direction == "x" ? xaxes : yaxes)[opts.alignTicksWithAxis - 1];
							if (otherAxis && otherAxis.used && otherAxis != axis) {
								// consider snapping min/max to outermost nice ticks
								var niceTicks = axis.tickGenerator(axis);
								if (niceTicks.length > 0) {
									if (opts.min == null)
										axis.min = Math.min(axis.min, niceTicks[0]);
									if (opts.max == null && niceTicks.length > 1)
										axis.max = Math.max(axis.max, niceTicks[niceTicks.length - 1]);
								}

								axis.tickGenerator = function (axis) {
									// copy ticks, scaled to this axis
									var ticks = [], v, i;
									for (i = 0; i < otherAxis.ticks.length; ++i) {
										v = (otherAxis.ticks[i].v - otherAxis.min) / (otherAxis.max - otherAxis.min);
										v = axis.min + v * (axis.max - axis.min);
										ticks.push(v);
									}
									return ticks;
								};

								// we might need an extra decimal since forced
								// ticks don't necessarily fit naturally
								if (!axis.mode && opts.tickDecimals == null) {
									var extraDec = Math.max(0, -Math.floor(Math.log(axis.delta) / Math.LN10) + 1),
										ts = axis.tickGenerator(axis);

									// only proceed if the tick interval rounded
									// with an extra decimal doesn't give us a
									// zero at end
									if (!(ts.length > 1 && /\..*0$/.test((ts[1] - ts[0]).toFixed(extraDec))))
										axis.tickDecimals = extraDec;
								}
							}
						}
					}

					function setTicks(axis) {
						var oticks = axis.options.ticks, ticks = [];
						if (oticks == null || (typeof oticks == "number" && oticks > 0))
							ticks = axis.tickGenerator(axis);
						else if (oticks) {
							if ($.isFunction(oticks))
								// generate the ticks
								ticks = oticks(axis);
							else
								ticks = oticks;
						}

						// clean up/labelify the supplied ticks, copy them over
						var i, v;
						axis.ticks = [];
						for (i = 0; i < ticks.length; ++i) {
							var label = null;
							var t = ticks[i];
							if (typeof t == "object") {
								v = +t[0];
								if (t.length > 1)
									label = t[1];
							}
							else
								v = +t;
							if (label == null)
								label = axis.tickFormatter(v, axis);
							if (!isNaN(v))
								axis.ticks.push({ v: v, label: label });
						}
					}

					function snapRangeToTicks(axis, ticks) {
						if (axis.options.autoscaleMargin && ticks.length > 0) {
							// snap to ticks
							if (axis.options.min == null)
								axis.min = Math.min(axis.min, ticks[0].v);
							if (axis.options.max == null && ticks.length > 1)
								axis.max = Math.max(axis.max, ticks[ticks.length - 1].v);
						}
					}

					function draw() {

						surface.clear();

						executeHooks(hooks.drawBackground, [ctx]);

						var grid = options.grid;

						// draw background, if any
						if (grid.show && grid.backgroundColor)
							drawBackground();

						if (grid.show && !grid.aboveData) {
							drawGrid();
						}

						for (var i = 0; i < series.length; ++i) {
							executeHooks(hooks.drawSeries, [ctx, series[i]]);
							drawSeries(series[i]);
						}

						executeHooks(hooks.draw, [ctx]);

						if (grid.show && grid.aboveData) {
							drawGrid();
						}

						surface.render();

						// A draw implies that either the axes or data have changed, so we
						// should probably update the overlay highlights as well.

						triggerRedrawOverlay();
					}

					function extractRange(ranges, coord) {
						var axis, from, to, key, axes = allAxes();

						for (var i = 0; i < axes.length; ++i) {
							axis = axes[i];
							if (axis.direction == coord) {
								key = coord + axis.n + "axis";
								if (!ranges[key] && axis.n == 1)
									key = coord + "axis"; // support x1axis as xaxis
								if (ranges[key]) {
									from = ranges[key].from;
									to = ranges[key].to;
									break;
								}
							}
						}

						// backwards-compat stuff - to be removed in future
						if (!ranges[key]) {
							axis = coord == "x" ? xaxes[0] : yaxes[0];
							from = ranges[coord + "1"];
							to = ranges[coord + "2"];
						}

						// auto-reverse as an added bonus
						if (from != null && to != null && from > to) {
							var tmp = from;
							from = to;
							to = tmp;
						}

						return { from: from, to: to, axis: axis };
					}

					function drawBackground() {
						ctx.save();
						ctx.translate(plotOffset.left, plotOffset.top);

						ctx.fillStyle = getColorOrGradient(options.grid.backgroundColor, plotHeight, 0, "rgba(255, 255, 255, 0)");
						ctx.fillRect(0, 0, plotWidth, plotHeight);
						ctx.restore();
					}

					function drawGrid() {
						var i, axes, bw, bc;

						ctx.save();
						ctx.translate(plotOffset.left, plotOffset.top);

						// draw markings
						var markings = options.grid.markings;
						if (markings) {
							if ($.isFunction(markings)) {
								axes = plot.getAxes();
								// xmin etc. is backwards compatibility, to be
								// removed in the future
								axes.xmin = axes.xaxis.min;
								axes.xmax = axes.xaxis.max;
								axes.ymin = axes.yaxis.min;
								axes.ymax = axes.yaxis.max;

								markings = markings(axes);
							}

							for (i = 0; i < markings.length; ++i) {
								var m = markings[i],
									xrange = extractRange(m, "x"),
									yrange = extractRange(m, "y");

								// fill in missing
								if (xrange.from == null)
									xrange.from = xrange.axis.min;
								if (xrange.to == null)
									xrange.to = xrange.axis.max;
								if (yrange.from == null)
									yrange.from = yrange.axis.min;
								if (yrange.to == null)
									yrange.to = yrange.axis.max;

								// clip
								if (xrange.to < xrange.axis.min || xrange.from > xrange.axis.max ||
									yrange.to < yrange.axis.min || yrange.from > yrange.axis.max)
									continue;

								xrange.from = Math.max(xrange.from, xrange.axis.min);
								xrange.to = Math.min(xrange.to, xrange.axis.max);
								yrange.from = Math.max(yrange.from, yrange.axis.min);
								yrange.to = Math.min(yrange.to, yrange.axis.max);

								var xequal = xrange.from === xrange.to,
									yequal = yrange.from === yrange.to;

								if (xequal && yequal) {
									continue;
								}

								// then draw
								xrange.from = Math.floor(xrange.axis.p2c(xrange.from));
								xrange.to = Math.floor(xrange.axis.p2c(xrange.to));
								yrange.from = Math.floor(yrange.axis.p2c(yrange.from));
								yrange.to = Math.floor(yrange.axis.p2c(yrange.to));

								if (xequal || yequal) {
									var lineWidth = m.lineWidth || options.grid.markingsLineWidth,
										subPixel = lineWidth % 2 ? 0.5 : 0;
									ctx.beginPath();
									ctx.strokeStyle = m.color || options.grid.markingsColor;
									ctx.lineWidth = lineWidth;
									if (xequal) {
										ctx.moveTo(xrange.to + subPixel, yrange.from);
										ctx.lineTo(xrange.to + subPixel, yrange.to);
									} else {
										ctx.moveTo(xrange.from, yrange.to + subPixel);
										ctx.lineTo(xrange.to, yrange.to + subPixel);                            
									}
									ctx.stroke();
								} else {
									ctx.fillStyle = m.color || options.grid.markingsColor;
									ctx.fillRect(xrange.from, yrange.to,
												 xrange.to - xrange.from,
												 yrange.from - yrange.to);
								}
							}
						}

						// draw the ticks
						axes = allAxes();
						bw = options.grid.borderWidth;

						for (var j = 0; j < axes.length; ++j) {
							var axis = axes[j], box = axis.box,
								t = axis.tickLength, x, y, xoff, yoff;
							if (!axis.show || axis.ticks.length == 0)
								continue;

							ctx.lineWidth = 1;

							// find the edges
							if (axis.direction == "x") {
								x = 0;
								if (t == "full")
									y = (axis.position == "top" ? 0 : plotHeight);
								else
									y = box.top - plotOffset.top + (axis.position == "top" ? box.height : 0);
							}
							else {
								y = 0;
								if (t == "full")
									x = (axis.position == "left" ? 0 : plotWidth);
								else
									x = box.left - plotOffset.left + (axis.position == "left" ? box.width : 0);
							}

							// draw tick bar
							if (!axis.innermost) {
								ctx.strokeStyle = axis.options.color;
								ctx.beginPath();
								xoff = yoff = 0;
								if (axis.direction == "x")
									xoff = plotWidth + 1;
								else
									yoff = plotHeight + 1;

								if (ctx.lineWidth == 1) {
									if (axis.direction == "x") {
										y = Math.floor(y) + 0.5;
									} else {
										x = Math.floor(x) + 0.5;
									}
								}

								ctx.moveTo(x, y);
								ctx.lineTo(x + xoff, y + yoff);
								ctx.stroke();
							}

							// draw ticks

							ctx.strokeStyle = axis.options.tickColor;

							ctx.beginPath();
							for (i = 0; i < axis.ticks.length; ++i) {
								var v = axis.ticks[i].v;

								xoff = yoff = 0;

								if (isNaN(v) || v < axis.min || v > axis.max
									// skip those lying on the axes if we got a border
									|| (t == "full"
										&& ((typeof bw == "object" && bw[axis.position] > 0) || bw > 0)
										&& (v == axis.min || v == axis.max)))
									continue;

								if (axis.direction == "x") {
									x = axis.p2c(v);
									yoff = t == "full" ? -plotHeight : t;

									if (axis.position == "top")
										yoff = -yoff;
								}
								else {
									y = axis.p2c(v);
									xoff = t == "full" ? -plotWidth : t;

									if (axis.position == "left")
										xoff = -xoff;
								}

								if (ctx.lineWidth == 1) {
									if (axis.direction == "x")
										x = Math.floor(x) + 0.5;
									else
										y = Math.floor(y) + 0.5;
								}

								ctx.moveTo(x, y);
								ctx.lineTo(x + xoff, y + yoff);
							}

							ctx.stroke();
						}


						// draw border
						if (bw) {
							// If either borderWidth or borderColor is an object, then draw the border
							// line by line instead of as one rectangle
							bc = options.grid.borderColor;
							if(typeof bw == "object" || typeof bc == "object") {
								if (typeof bw !== "object") {
									bw = {top: bw, right: bw, bottom: bw, left: bw};
								}
								if (typeof bc !== "object") {
									bc = {top: bc, right: bc, bottom: bc, left: bc};
								}

								if (bw.top > 0) {
									ctx.strokeStyle = bc.top;
									ctx.lineWidth = bw.top;
									ctx.beginPath();
									ctx.moveTo(0 - bw.left, 0 - bw.top/2);
									ctx.lineTo(plotWidth, 0 - bw.top/2);
									ctx.stroke();
								}

								if (bw.right > 0) {
									ctx.strokeStyle = bc.right;
									ctx.lineWidth = bw.right;
									ctx.beginPath();
									ctx.moveTo(plotWidth + bw.right / 2, 0 - bw.top);
									ctx.lineTo(plotWidth + bw.right / 2, plotHeight);
									ctx.stroke();
								}

								if (bw.bottom > 0) {
									ctx.strokeStyle = bc.bottom;
									ctx.lineWidth = bw.bottom;
									ctx.beginPath();
									ctx.moveTo(plotWidth + bw.right, plotHeight + bw.bottom / 2);
									ctx.lineTo(0, plotHeight + bw.bottom / 2);
									ctx.stroke();
								}

								if (bw.left > 0) {
									ctx.strokeStyle = bc.left;
									ctx.lineWidth = bw.left;
									ctx.beginPath();
									ctx.moveTo(0 - bw.left/2, plotHeight + bw.bottom);
									ctx.lineTo(0- bw.left/2, 0);
									ctx.stroke();
								}
							}
							else {
								ctx.lineWidth = bw;
								ctx.strokeStyle = options.grid.borderColor;
								ctx.strokeRect(-bw/2, -bw/2, plotWidth + bw, plotHeight + bw);
							}
						}

						ctx.restore();
					}

					function drawAxisLabels() {

						$.each(allAxes(), function (_, axis) {
							var box = axis.box,
								legacyStyles = axis.direction + "Axis " + axis.direction + axis.n + "Axis",
								layer = "flot-" + axis.direction + "-axis flot-" + axis.direction + axis.n + "-axis " + legacyStyles,
								font = axis.options.font || "flot-tick-label tickLabel",
								tick, x, y, halign, valign;

							// Remove text before checking for axis.show and ticks.length;
							// otherwise plugins, like flot-tickrotor, that draw their own
							// tick labels will end up with both theirs and the defaults.

							surface.removeText(layer);

							if (!axis.show || axis.ticks.length == 0)
								return;

							for (var i = 0; i < axis.ticks.length; ++i) {

								tick = axis.ticks[i];
								if (!tick.label || tick.v < axis.min || tick.v > axis.max)
									continue;

								if (axis.direction == "x") {
									halign = "center";
									x = plotOffset.left + axis.p2c(tick.v);
									if (axis.position == "bottom") {
										y = box.top + box.padding;
									} else {
										y = box.top + box.height - box.padding;
										valign = "bottom";
									}
								} else {
									valign = "middle";
									y = plotOffset.top + axis.p2c(tick.v);
									if (axis.position == "left") {
										x = box.left + box.width - box.padding;
										halign = "right";
									} else {
										x = box.left + box.padding;
									}
								}

								surface.addText(layer, x, y, tick.label, font, null, null, halign, valign);
							}
						});
					}

					function drawSeries(series) {
						if (series.lines.show)
							drawSeriesLines(series);
						if (series.bars.show)
							drawSeriesBars(series);
						if (series.points.show)
							drawSeriesPoints(series);
					}

					function drawSeriesLines(series) {
						function plotLine(datapoints, xoffset, yoffset, axisx, axisy) {
							var points = datapoints.points,
								ps = datapoints.pointsize,
								prevx = null, prevy = null;

							ctx.beginPath();
							for (var i = ps; i < points.length; i += ps) {
								var x1 = points[i - ps], y1 = points[i - ps + 1],
									x2 = points[i], y2 = points[i + 1];

								if (x1 == null || x2 == null)
									continue;

								// clip with ymin
								if (y1 <= y2 && y1 < axisy.min) {
									if (y2 < axisy.min)
										continue;   // line segment is outside
									// compute new intersection point
									x1 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
									y1 = axisy.min;
								}
								else if (y2 <= y1 && y2 < axisy.min) {
									if (y1 < axisy.min)
										continue;
									x2 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
									y2 = axisy.min;
								}

								// clip with ymax
								if (y1 >= y2 && y1 > axisy.max) {
									if (y2 > axisy.max)
										continue;
									x1 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
									y1 = axisy.max;
								}
								else if (y2 >= y1 && y2 > axisy.max) {
									if (y1 > axisy.max)
										continue;
									x2 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
									y2 = axisy.max;
								}

								// clip with xmin
								if (x1 <= x2 && x1 < axisx.min) {
									if (x2 < axisx.min)
										continue;
									y1 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
									x1 = axisx.min;
								}
								else if (x2 <= x1 && x2 < axisx.min) {
									if (x1 < axisx.min)
										continue;
									y2 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
									x2 = axisx.min;
								}

								// clip with xmax
								if (x1 >= x2 && x1 > axisx.max) {
									if (x2 > axisx.max)
										continue;
									y1 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
									x1 = axisx.max;
								}
								else if (x2 >= x1 && x2 > axisx.max) {
									if (x1 > axisx.max)
										continue;
									y2 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
									x2 = axisx.max;
								}

								if (x1 != prevx || y1 != prevy)
									ctx.moveTo(axisx.p2c(x1) + xoffset, axisy.p2c(y1) + yoffset);

								prevx = x2;
								prevy = y2;
								ctx.lineTo(axisx.p2c(x2) + xoffset, axisy.p2c(y2) + yoffset);
							}
							ctx.stroke();
						}

						function plotLineArea(datapoints, axisx, axisy) {
							var points = datapoints.points,
								ps = datapoints.pointsize,
								bottom = Math.min(Math.max(0, axisy.min), axisy.max),
								i = 0, top, areaOpen = false,
								ypos = 1, segmentStart = 0, segmentEnd = 0;

							// we process each segment in two turns, first forward
							// direction to sketch out top, then once we hit the
							// end we go backwards to sketch the bottom
							while (true) {
								if (ps > 0 && i > points.length + ps)
									break;

								i += ps; // ps is negative if going backwards

								var x1 = points[i - ps],
									y1 = points[i - ps + ypos],
									x2 = points[i], y2 = points[i + ypos];

								if (areaOpen) {
									if (ps > 0 && x1 != null && x2 == null) {
										// at turning point
										segmentEnd = i;
										ps = -ps;
										ypos = 2;
										continue;
									}

									if (ps < 0 && i == segmentStart + ps) {
										// done with the reverse sweep
										ctx.fill();
										areaOpen = false;
										ps = -ps;
										ypos = 1;
										i = segmentStart = segmentEnd + ps;
										continue;
									}
								}

								if (x1 == null || x2 == null)
									continue;

								// clip x values

								// clip with xmin
								if (x1 <= x2 && x1 < axisx.min) {
									if (x2 < axisx.min)
										continue;
									y1 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
									x1 = axisx.min;
								}
								else if (x2 <= x1 && x2 < axisx.min) {
									if (x1 < axisx.min)
										continue;
									y2 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
									x2 = axisx.min;
								}

								// clip with xmax
								if (x1 >= x2 && x1 > axisx.max) {
									if (x2 > axisx.max)
										continue;
									y1 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
									x1 = axisx.max;
								}
								else if (x2 >= x1 && x2 > axisx.max) {
									if (x1 > axisx.max)
										continue;
									y2 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
									x2 = axisx.max;
								}

								if (!areaOpen) {
									// open area
									ctx.beginPath();
									ctx.moveTo(axisx.p2c(x1), axisy.p2c(bottom));
									areaOpen = true;
								}

								// now first check the case where both is outside
								if (y1 >= axisy.max && y2 >= axisy.max) {
									ctx.lineTo(axisx.p2c(x1), axisy.p2c(axisy.max));
									ctx.lineTo(axisx.p2c(x2), axisy.p2c(axisy.max));
									continue;
								}
								else if (y1 <= axisy.min && y2 <= axisy.min) {
									ctx.lineTo(axisx.p2c(x1), axisy.p2c(axisy.min));
									ctx.lineTo(axisx.p2c(x2), axisy.p2c(axisy.min));
									continue;
								}

								// else it's a bit more complicated, there might
								// be a flat maxed out rectangle first, then a
								// triangular cutout or reverse; to find these
								// keep track of the current x values
								var x1old = x1, x2old = x2;

								// clip the y values, without shortcutting, we
								// go through all cases in turn

								// clip with ymin
								if (y1 <= y2 && y1 < axisy.min && y2 >= axisy.min) {
									x1 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
									y1 = axisy.min;
								}
								else if (y2 <= y1 && y2 < axisy.min && y1 >= axisy.min) {
									x2 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
									y2 = axisy.min;
								}

								// clip with ymax
								if (y1 >= y2 && y1 > axisy.max && y2 <= axisy.max) {
									x1 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
									y1 = axisy.max;
								}
								else if (y2 >= y1 && y2 > axisy.max && y1 <= axisy.max) {
									x2 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
									y2 = axisy.max;
								}

								// if the x value was changed we got a rectangle
								// to fill
								if (x1 != x1old) {
									ctx.lineTo(axisx.p2c(x1old), axisy.p2c(y1));
									// it goes to (x1, y1), but we fill that below
								}

								// fill triangular section, this sometimes result
								// in redundant points if (x1, y1) hasn't changed
								// from previous line to, but we just ignore that
								ctx.lineTo(axisx.p2c(x1), axisy.p2c(y1));
								ctx.lineTo(axisx.p2c(x2), axisy.p2c(y2));

								// fill the other rectangle if it's there
								if (x2 != x2old) {
									ctx.lineTo(axisx.p2c(x2), axisy.p2c(y2));
									ctx.lineTo(axisx.p2c(x2old), axisy.p2c(y2));
								}
							}
						}

						ctx.save();
						ctx.translate(plotOffset.left, plotOffset.top);
						ctx.lineJoin = "round";

						var lw = series.lines.lineWidth,
							sw = series.shadowSize;
						// FIXME: consider another form of shadow when filling is turned on
						if (lw > 0 && sw > 0) {
							// draw shadow as a thick and thin line with transparency
							ctx.lineWidth = sw;
							ctx.strokeStyle = "rgba(0,0,0,0.1)";
							// position shadow at angle from the mid of line
							var angle = Math.PI/18;
							plotLine(series.datapoints, Math.sin(angle) * (lw/2 + sw/2), Math.cos(angle) * (lw/2 + sw/2), series.xaxis, series.yaxis);
							ctx.lineWidth = sw/2;
							plotLine(series.datapoints, Math.sin(angle) * (lw/2 + sw/4), Math.cos(angle) * (lw/2 + sw/4), series.xaxis, series.yaxis);
						}

						ctx.lineWidth = lw;
						ctx.strokeStyle = series.color;
						var fillStyle = getFillStyle(series.lines, series.color, 0, plotHeight);
						if (fillStyle) {
							ctx.fillStyle = fillStyle;
							plotLineArea(series.datapoints, series.xaxis, series.yaxis);
						}

						if (lw > 0)
							plotLine(series.datapoints, 0, 0, series.xaxis, series.yaxis);
						ctx.restore();
					}

					function drawSeriesPoints(series) {
						function plotPoints(datapoints, radius, fillStyle, offset, shadow, axisx, axisy, symbol) {
							var points = datapoints.points, ps = datapoints.pointsize;

							for (var i = 0; i < points.length; i += ps) {
								var x = points[i], y = points[i + 1];
								if (x == null || x < axisx.min || x > axisx.max || y < axisy.min || y > axisy.max)
									continue;

								ctx.beginPath();
								x = axisx.p2c(x);
								y = axisy.p2c(y) + offset;
								if (symbol == "circle")
									ctx.arc(x, y, radius, 0, shadow ? Math.PI : Math.PI * 2, false);
								else
									symbol(ctx, x, y, radius, shadow);
								ctx.closePath();

								if (fillStyle) {
									ctx.fillStyle = fillStyle;
									ctx.fill();
								}
								ctx.stroke();
							}
						}

						ctx.save();
						ctx.translate(plotOffset.left, plotOffset.top);

						var lw = series.points.lineWidth,
							sw = series.shadowSize,
							radius = series.points.radius,
							symbol = series.points.symbol;

						// If the user sets the line width to 0, we change it to a very 
						// small value. A line width of 0 seems to force the default of 1.
						// Doing the conditional here allows the shadow setting to still be 
						// optional even with a lineWidth of 0.

						if( lw == 0 )
							lw = 0.0001;

						if (lw > 0 && sw > 0) {
							// draw shadow in two steps
							var w = sw / 2;
							ctx.lineWidth = w;
							ctx.strokeStyle = "rgba(0,0,0,0.1)";
							plotPoints(series.datapoints, radius, null, w + w/2, true,
									   series.xaxis, series.yaxis, symbol);

							ctx.strokeStyle = "rgba(0,0,0,0.2)";
							plotPoints(series.datapoints, radius, null, w/2, true,
									   series.xaxis, series.yaxis, symbol);
						}

						ctx.lineWidth = lw;
						ctx.strokeStyle = series.color;
						plotPoints(series.datapoints, radius,
								   getFillStyle(series.points, series.color), 0, false,
								   series.xaxis, series.yaxis, symbol);
						ctx.restore();
					}

					function drawBar(x, y, b, barLeft, barRight, fillStyleCallback, axisx, axisy, c, horizontal, lineWidth) {
						var left, right, bottom, top,
							drawLeft, drawRight, drawTop, drawBottom,
							tmp;

						// in horizontal mode, we start the bar from the left
						// instead of from the bottom so it appears to be
						// horizontal rather than vertical
						if (horizontal) {
							drawBottom = drawRight = drawTop = true;
							drawLeft = false;
							left = b;
							right = x;
							top = y + barLeft;
							bottom = y + barRight;

							// account for negative bars
							if (right < left) {
								tmp = right;
								right = left;
								left = tmp;
								drawLeft = true;
								drawRight = false;
							}
						}
						else {
							drawLeft = drawRight = drawTop = true;
							drawBottom = false;
							left = x + barLeft;
							right = x + barRight;
							bottom = b;
							top = y;

							// account for negative bars
							if (top < bottom) {
								tmp = top;
								top = bottom;
								bottom = tmp;
								drawBottom = true;
								drawTop = false;
							}
						}

						// clip
						if (right < axisx.min || left > axisx.max ||
							top < axisy.min || bottom > axisy.max)
							return;

						if (left < axisx.min) {
							left = axisx.min;
							drawLeft = false;
						}

						if (right > axisx.max) {
							right = axisx.max;
							drawRight = false;
						}

						if (bottom < axisy.min) {
							bottom = axisy.min;
							drawBottom = false;
						}

						if (top > axisy.max) {
							top = axisy.max;
							drawTop = false;
						}

						left = axisx.p2c(left);
						bottom = axisy.p2c(bottom);
						right = axisx.p2c(right);
						top = axisy.p2c(top);

						// fill the bar
						if (fillStyleCallback) {
							c.fillStyle = fillStyleCallback(bottom, top);
							c.fillRect(left, top, right - left, bottom - top)
						}

						// draw outline
						if (lineWidth > 0 && (drawLeft || drawRight || drawTop || drawBottom)) {
							c.beginPath();

							// FIXME: inline moveTo is buggy with excanvas
							c.moveTo(left, bottom);
							if (drawLeft)
								c.lineTo(left, top);
							else
								c.moveTo(left, top);
							if (drawTop)
								c.lineTo(right, top);
							else
								c.moveTo(right, top);
							if (drawRight)
								c.lineTo(right, bottom);
							else
								c.moveTo(right, bottom);
							if (drawBottom)
								c.lineTo(left, bottom);
							else
								c.moveTo(left, bottom);
							c.stroke();
						}
					}

					function drawSeriesBars(series) {
						function plotBars(datapoints, barLeft, barRight, fillStyleCallback, axisx, axisy) {
							var points = datapoints.points, ps = datapoints.pointsize;

							for (var i = 0; i < points.length; i += ps) {
								if (points[i] == null)
									continue;
								drawBar(points[i], points[i + 1], points[i + 2], barLeft, barRight, fillStyleCallback, axisx, axisy, ctx, series.bars.horizontal, series.bars.lineWidth);
							}
						}

						ctx.save();
						ctx.translate(plotOffset.left, plotOffset.top);

						// FIXME: figure out a way to add shadows (for instance along the right edge)
						ctx.lineWidth = series.bars.lineWidth;
						ctx.strokeStyle = series.color;

						var barLeft;

						switch (series.bars.align) {
							case "left":
								barLeft = 0;
								break;
							case "right":
								barLeft = -series.bars.barWidth;
								break;
							default:
								barLeft = -series.bars.barWidth / 2;
						}

						var fillStyleCallback = series.bars.fill ? function (bottom, top) { return getFillStyle(series.bars, series.color, bottom, top); } : null;
						plotBars(series.datapoints, barLeft, barLeft + series.bars.barWidth, fillStyleCallback, series.xaxis, series.yaxis);
						ctx.restore();
					}

					function getFillStyle(filloptions, seriesColor, bottom, top) {
						var fill = filloptions.fill;
						if (!fill)
							return null;

						if (filloptions.fillColor)
							return getColorOrGradient(filloptions.fillColor, bottom, top, seriesColor);

						var c = $.color.parse(seriesColor);
						c.a = typeof fill == "number" ? fill : 0.4;
						c.normalize();
						return c.toString();
					}

					function insertLegend() {

						if (options.legend.container != null) {
							$(options.legend.container).html("");
						} else {
							placeholder.find(".legend").remove();
						}

						if (!options.legend.show) {
							return;
						}

						var fragments = [], entries = [], rowStarted = false,
							lf = options.legend.labelFormatter, s, label;

						// Build a list of legend entries, with each having a label and a color

						for (var i = 0; i < series.length; ++i) {
							s = series[i];
							if (s.label) {
								label = lf ? lf(s.label, s) : s.label;
								if (label) {
									entries.push({
										label: label,
										color: s.color
									});
								}
							}
						}

						// Sort the legend using either the default or a custom comparator

						if (options.legend.sorted) {
							if ($.isFunction(options.legend.sorted)) {
								entries.sort(options.legend.sorted);
							} else if (options.legend.sorted == "reverse") {
								entries.reverse();
							} else {
								var ascending = options.legend.sorted != "descending";
								entries.sort(function(a, b) {
									return a.label == b.label ? 0 : (
										(a.label < b.label) != ascending ? 1 : -1   // Logical XOR
									);
								});
							}
						}

						// Generate markup for the list of entries, in their final order

						for (var i = 0; i < entries.length; ++i) {

							var entry = entries[i];

							if (i % options.legend.noColumns == 0) {
								if (rowStarted)
									fragments.push('</tr>');
								fragments.push('<tr>');
								rowStarted = true;
							}

							fragments.push(
								'<td class="legendColorBox"><div style="border:1px solid ' + options.legend.labelBoxBorderColor + ';padding:1px"><div style="width:4px;height:0;border:5px solid ' + entry.color + ';overflow:hidden"></div></div></td>' +
								'<td class="legendLabel">' + entry.label + '</td>'
							);
						}

						if (rowStarted)
							fragments.push('</tr>');

						if (fragments.length == 0)
							return;

						var table = '<table style="font-size:smaller;color:' + options.grid.color + '">' + fragments.join("") + '</table>';
						if (options.legend.container != null)
							$(options.legend.container).html(table);
						else {
							var pos = "",
								p = options.legend.position,
								m = options.legend.margin;
							if (m[0] == null)
								m = [m, m];
							if (p.charAt(0) == "n")
								pos += 'top:' + (m[1] + plotOffset.top) + 'px;';
							else if (p.charAt(0) == "s")
								pos += 'bottom:' + (m[1] + plotOffset.bottom) + 'px;';
							if (p.charAt(1) == "e")
								pos += 'right:' + (m[0] + plotOffset.right) + 'px;';
							else if (p.charAt(1) == "w")
								pos += 'left:' + (m[0] + plotOffset.left) + 'px;';
							var legend = $('<div class="legend">' + table.replace('style="', 'style="position:absolute;' + pos +';') + '</div>').appendTo(placeholder);
							if (options.legend.backgroundOpacity != 0.0) {
								// put in the transparent background
								// separately to avoid blended labels and
								// label boxes
								var c = options.legend.backgroundColor;
								if (c == null) {
									c = options.grid.backgroundColor;
									if (c && typeof c == "string")
										c = $.color.parse(c);
									else
										c = $.color.extract(legend, 'background-color');
									c.a = 1;
									c = c.toString();
								}
								var div = legend.children();
								$('<div style="position:absolute;width:' + div.width() + 'px;height:' + div.height() + 'px;' + pos +'background-color:' + c + ';"> </div>').prependTo(legend).css('opacity', options.legend.backgroundOpacity);
							}
						}
					}


					// interactive features

					var highlights = [],
						redrawTimeout = null;

					// returns the data item the mouse is over, or null if none is found
					function findNearbyItem(mouseX, mouseY, seriesFilter) {
						var maxDistance = options.grid.mouseActiveRadius,
							smallestDistance = maxDistance * maxDistance + 1,
							item = null, foundPoint = false, i, j, ps;

						for (i = series.length - 1; i >= 0; --i) {
							if (!seriesFilter(series[i]))
								continue;

							var s = series[i],
								axisx = s.xaxis,
								axisy = s.yaxis,
								points = s.datapoints.points,
								mx = axisx.c2p(mouseX), // precompute some stuff to make the loop faster
								my = axisy.c2p(mouseY),
								maxx = maxDistance / axisx.scale,
								maxy = maxDistance / axisy.scale;

							ps = s.datapoints.pointsize;
							// with inverse transforms, we can't use the maxx/maxy
							// optimization, sadly
							if (axisx.options.inverseTransform)
								maxx = Number.MAX_VALUE;
							if (axisy.options.inverseTransform)
								maxy = Number.MAX_VALUE;

							if (s.lines.show || s.points.show) {
								for (j = 0; j < points.length; j += ps) {
									var x = points[j], y = points[j + 1];
									if (x == null)
										continue;

									// For points and lines, the cursor must be within a
									// certain distance to the data point
									if (x - mx > maxx || x - mx < -maxx ||
										y - my > maxy || y - my < -maxy)
										continue;

									// We have to calculate distances in pixels, not in
									// data units, because the scales of the axes may be different
									var dx = Math.abs(axisx.p2c(x) - mouseX),
										dy = Math.abs(axisy.p2c(y) - mouseY),
										dist = dx * dx + dy * dy; // we save the sqrt

									// use <= to ensure last point takes precedence
									// (last generally means on top of)
									if (dist < smallestDistance) {
										smallestDistance = dist;
										item = [i, j / ps];
									}
								}
							}

							if (s.bars.show && !item) { // no other point can be nearby

								var barLeft, barRight;

								switch (s.bars.align) {
									case "left":
										barLeft = 0;
										break;
									case "right":
										barLeft = -s.bars.barWidth;
										break;
									default:
										barLeft = -s.bars.barWidth / 2;
								}

								barRight = barLeft + s.bars.barWidth;

								for (j = 0; j < points.length; j += ps) {
									var x = points[j], y = points[j + 1], b = points[j + 2];
									if (x == null)
										continue;

									// for a bar graph, the cursor must be inside the bar
									if (series[i].bars.horizontal ?
										(mx <= Math.max(b, x) && mx >= Math.min(b, x) &&
										 my >= y + barLeft && my <= y + barRight) :
										(mx >= x + barLeft && mx <= x + barRight &&
										 my >= Math.min(b, y) && my <= Math.max(b, y)))
											item = [i, j / ps];
								}
							}
						}

						if (item) {
							i = item[0];
							j = item[1];
							ps = series[i].datapoints.pointsize;

							return { datapoint: series[i].datapoints.points.slice(j * ps, (j + 1) * ps),
									 dataIndex: j,
									 series: series[i],
									 seriesIndex: i };
						}

						return null;
					}

					function onMouseMove(e) {
						if (options.grid.hoverable)
							triggerClickHoverEvent("plothover", e,
												   function (s) { return s["hoverable"] != false; });
					}

					function onMouseLeave(e) {
						if (options.grid.hoverable)
							triggerClickHoverEvent("plothover", e,
												   function (s) { return false; });
					}

					function onClick(e) {
						triggerClickHoverEvent("plotclick", e,
											   function (s) { return s["clickable"] != false; });
					}

					// trigger click or hover event (they send the same parameters
					// so we share their code)
					function triggerClickHoverEvent(eventname, event, seriesFilter) {
						var offset = eventHolder.offset(),
							canvasX = event.pageX - offset.left - plotOffset.left,
							canvasY = event.pageY - offset.top - plotOffset.top,
						pos = canvasToAxisCoords({ left: canvasX, top: canvasY });

						pos.pageX = event.pageX;
						pos.pageY = event.pageY;

						var item = findNearbyItem(canvasX, canvasY, seriesFilter);

						if (item) {
							// fill in mouse pos for any listeners out there
							item.pageX = parseInt(item.series.xaxis.p2c(item.datapoint[0]) + offset.left + plotOffset.left, 10);
							item.pageY = parseInt(item.series.yaxis.p2c(item.datapoint[1]) + offset.top + plotOffset.top, 10);
						}

						if (options.grid.autoHighlight) {
							// clear auto-highlights
							for (var i = 0; i < highlights.length; ++i) {
								var h = highlights[i];
								if (h.auto == eventname &&
									!(item && h.series == item.series &&
									  h.point[0] == item.datapoint[0] &&
									  h.point[1] == item.datapoint[1]))
									unhighlight(h.series, h.point);
							}

							if (item)
								highlight(item.series, item.datapoint, eventname);
						}

						placeholder.trigger(eventname, [ pos, item ]);
					}

					function triggerRedrawOverlay() {
						var t = options.interaction.redrawOverlayInterval;
						if (t == -1) {      // skip event queue
							drawOverlay();
							return;
						}

						if (!redrawTimeout)
							redrawTimeout = setTimeout(drawOverlay, t);
					}

					function drawOverlay() {
						redrawTimeout = null;

						// draw highlights
						octx.save();
						overlay.clear();
						octx.translate(plotOffset.left, plotOffset.top);

						var i, hi;
						for (i = 0; i < highlights.length; ++i) {
							hi = highlights[i];

							if (hi.series.bars.show)
								drawBarHighlight(hi.series, hi.point);
							else
								drawPointHighlight(hi.series, hi.point);
						}
						octx.restore();

						executeHooks(hooks.drawOverlay, [octx]);
					}

					function highlight(s, point, auto) {
						if (typeof s == "number")
							s = series[s];

						if (typeof point == "number") {
							var ps = s.datapoints.pointsize;
							point = s.datapoints.points.slice(ps * point, ps * (point + 1));
						}

						var i = indexOfHighlight(s, point);
						if (i == -1) {
							highlights.push({ series: s, point: point, auto: auto });

							triggerRedrawOverlay();
						}
						else if (!auto)
							highlights[i].auto = false;
					}

					function unhighlight(s, point) {
						if (s == null && point == null) {
							highlights = [];
							triggerRedrawOverlay();
							return;
						}

						if (typeof s == "number")
							s = series[s];

						if (typeof point == "number") {
							var ps = s.datapoints.pointsize;
							point = s.datapoints.points.slice(ps * point, ps * (point + 1));
						}

						var i = indexOfHighlight(s, point);
						if (i != -1) {
							highlights.splice(i, 1);

							triggerRedrawOverlay();
						}
					}

					function indexOfHighlight(s, p) {
						for (var i = 0; i < highlights.length; ++i) {
							var h = highlights[i];
							if (h.series == s && h.point[0] == p[0]
								&& h.point[1] == p[1])
								return i;
						}
						return -1;
					}

					function drawPointHighlight(series, point) {
						var x = point[0], y = point[1],
							axisx = series.xaxis, axisy = series.yaxis,
							highlightColor = (typeof series.highlightColor === "string") ? series.highlightColor : $.color.parse(series.color).scale('a', 0.5).toString();

						if (x < axisx.min || x > axisx.max || y < axisy.min || y > axisy.max)
							return;

						var pointRadius = series.points.radius + series.points.lineWidth / 2;
						octx.lineWidth = pointRadius;
						octx.strokeStyle = highlightColor;
						var radius = 1.5 * pointRadius;
						x = axisx.p2c(x);
						y = axisy.p2c(y);

						octx.beginPath();
						if (series.points.symbol == "circle")
							octx.arc(x, y, radius, 0, 2 * Math.PI, false);
						else
							series.points.symbol(octx, x, y, radius, false);
						octx.closePath();
						octx.stroke();
					}

					function drawBarHighlight(series, point) {
						var highlightColor = (typeof series.highlightColor === "string") ? series.highlightColor : $.color.parse(series.color).scale('a', 0.5).toString(),
							fillStyle = highlightColor,
							barLeft;

						switch (series.bars.align) {
							case "left":
								barLeft = 0;
								break;
							case "right":
								barLeft = -series.bars.barWidth;
								break;
							default:
								barLeft = -series.bars.barWidth / 2;
						}

						octx.lineWidth = series.bars.lineWidth;
						octx.strokeStyle = highlightColor;

						drawBar(point[0], point[1], point[2] || 0, barLeft, barLeft + series.bars.barWidth,
								function () { return fillStyle; }, series.xaxis, series.yaxis, octx, series.bars.horizontal, series.bars.lineWidth);
					}

					function getColorOrGradient(spec, bottom, top, defaultColor) {
						if (typeof spec == "string")
							return spec;
						else {
							// assume this is a gradient spec; IE currently only
							// supports a simple vertical gradient properly, so that's
							// what we support too
							var gradient = ctx.createLinearGradient(0, top, 0, bottom);

							for (var i = 0, l = spec.colors.length; i < l; ++i) {
								var c = spec.colors[i];
								if (typeof c != "string") {
									var co = $.color.parse(defaultColor);
									if (c.brightness != null)
										co = co.scale('rgb', c.brightness);
									if (c.opacity != null)
										co.a *= c.opacity;
									c = co.toString();
								}
								gradient.addColorStop(i / (l - 1), c);
							}

							return gradient;
						}
					}
				}

				// Add the plot function to the top level of the jQuery object

				$.plot = function(placeholder, data, options) {
					//var t0 = new Date();
					var plot = new Plot($(placeholder), data, options, $.plot.plugins);
					//(window.console ? console.log : alert)("time used (msecs): " + ((new Date()).getTime() - t0.getTime()));
					return plot;
				};

				$.plot.version = "0.8.3";

				$.plot.plugins = [];

				// Also add the plot function as a chainable property

				$.fn.plot = function(data, options) {
					return this.each(function() {
						$.plot(this, data, options);
					});
				};

				// round to nearby lower multiple of base
				function floorInBase(n, base) {
					return base * Math.floor(n / base);
				}

			})(jQuery);
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

