// ==UserScript==
// @name WoWsStatInfo
// @author Vov_chiK
// @description Расширенная статистика и функционал на сайте World of Warships.
// @copyright 2015+, Vov_chiK
// @license GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @namespace http://forum.walkure.pro/
// @version 0.4.1.14
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
		var VersionWoWsStatInfo = '0.4.1.14';
		
		var WoWsStatInfoLinkLoc = [];
		WoWsStatInfoLinkLoc['ru'] = 'http://forum.worldofwarships.ru/index.php?/topic/19158-';
		WoWsStatInfoLinkLoc['asia'] = '#';
		WoWsStatInfoLinkLoc['na'] = '#';
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
							'info.statistics.pvp.wr' +
						'"' +
					'}' +
				'}' +
			'';
		}
		
		var MembersArray = [];
		var Encyclopedia = null;
		
		var typeStat = ["pvp", "pve"];
		var typeShip = ["Cruiser", "AirCarrier", "Battleship", "Destroyer"];
		
		var color = new Array();
		color['very_bad'] = '#FE0E00'; // очень плохо, хуже чем у 85%
		color['bad'] = '#FE7903'; // плохо, хуже чем у 50%
		color['normal'] = '#F8F400'; // средне, лучше чем у 50%
		color['good'] = '#60FF00';  // хорошо, лучше чем у 75%
		color['very_good'] = '#02C9B3'; // очень хорошо, лучше чем у 95%
		color['unique'] = '#D042F3'; // уникально, лучше чем у 99%
		
		var colorStat = jQ.parseJSON('{"battles":[130,240,409,867,1327,99999],"avg_xp":[814.21,1054.35,1309.24,1748.69,2095.73,99999],"avg_damage_dealt":[16869.71,23764.09,29094.78,39358.63,50285.54,999999],"avg_frags":[0.47,0.65,0.79,1.01,1.19,99],"avg_planes_killed":[0.64,1.49,2.26,4.33,7.27,99],"hits_percents_battery":[25,29,32,37,41,999],"hits_percents_torpedo":[5,9,12,17,22,999],"avg_capture_points":[0.37,0.99,1.53,2.66,3.75,99],"avg_dropped_capture_points":[3.62,5.41,6.89,9.42,11.51,999],"max_xp":[3270,6376,9268,13360,17040,999999],"max_damage_dealt":[82182,113691,138603,189286,241514,9999999],"max_frags_battle":[3,4,5,6,7,99],"max_planes_killed":[12,24,34,58,78,999],"avg_level_battles":[3.9,4.7,5.3,6.3,7,99],"wins_percents":[43.66,48,50.91,55.76,59.55,100],"losses_percents":[100,58.1,54.81,50.26,47.37,42.69],"draws_percents":[100,8.57,7.14,5.64,4.58,2.88],"survived_battles_percents":[20.91,31.17,38.68,50.87,60.39,100],"kill_dead":[0.64,0.96,1.26,1.88,2.61,99],"wr":[568.41,860.96,1064.95,1404.64,1697.06,99999]}');
		var ExpShips = jQ.parseJSON('{"PJSB006":{"expDamage":43923.16,"expDroppedCapturePoints":5.89,"expFrags":0.98,"expCapturePoints":1.22,"expPlanesKilled":1.04},"PASD027":{"expDamage":12228.02,"expDroppedCapturePoints":4.25,"expFrags":0.55,"expCapturePoints":0.55,"expPlanesKilled":0.02},"PRSC003":{"expDamage":29437.04,"expDroppedCapturePoints":9.48,"expFrags":0.86,"expCapturePoints":0.84,"expPlanesKilled":1.14},"PJSC026":{"expDamage":26072.59,"expDroppedCapturePoints":7.87,"expFrags":0.95,"expCapturePoints":1.07,"expPlanesKilled":0.72},"PJSB008":{"expDamage":25986.89,"expDroppedCapturePoints":6.18,"expFrags":0.76,"expCapturePoints":1.16,"expPlanesKilled":0.16},"PRSC002":{"expDamage":22766.96,"expDroppedCapturePoints":17.48,"expFrags":1.2,"expCapturePoints":1.64,"expPlanesKilled":0.01},"PJSB007":{"expDamage":32093.11,"expDroppedCapturePoints":5.93,"expFrags":0.78,"expCapturePoints":0.9,"expPlanesKilled":0.81},"PJSB001":{"expDamage":21638.59,"expDroppedCapturePoints":8.12,"expFrags":0.86,"expCapturePoints":1.32,"expPlanesKilled":0.04},"PASD029":{"expDamage":14976.04,"expDroppedCapturePoints":4.71,"expFrags":0.48,"expCapturePoints":1.06,"expPlanesKilled":0.24},"PJSB003":{"expDamage":22023.82,"expDroppedCapturePoints":5.3,"expFrags":0.57,"expCapturePoints":0.91,"expPlanesKilled":0.35},"PJSA009":{"expDamage":66811.77,"expDroppedCapturePoints":7.87,"expFrags":1.47,"expCapturePoints":0.32,"expPlanesKilled":4.95},"PJSD012":{"expDamage":44157.01,"expDroppedCapturePoints":0.56,"expFrags":0.76,"expCapturePoints":0.01,"expPlanesKilled":2.13},"PJSD010":{"expDamage":32693.33,"expDroppedCapturePoints":3.55,"expFrags":0.61,"expCapturePoints":1.53,"expPlanesKilled":0.39},"PASB001":{"expDamage":21074.21,"expDroppedCapturePoints":8.94,"expFrags":0.76,"expCapturePoints":1.09,"expPlanesKilled":0.02},"PJSA002":{"expDamage":41708.31,"expDroppedCapturePoints":2.85,"expFrags":0.97,"expCapturePoints":0.35,"expPlanesKilled":5.71},"PASB006":{"expDamage":32662.81,"expDroppedCapturePoints":6.84,"expFrags":0.83,"expCapturePoints":1.14,"expPlanesKilled":0.59},"PASB004":{"expDamage":30519.52,"expDroppedCapturePoints":8.01,"expFrags":0.86,"expCapturePoints":1.19,"expPlanesKilled":0.38},"PJSA006":{"expDamage":56990.97,"expDroppedCapturePoints":5.37,"expFrags":1.35,"expCapturePoints":0.44,"expPlanesKilled":6.65},"PASB008":{"expDamage":40591.65,"expDroppedCapturePoints":5.36,"expFrags":0.73,"expCapturePoints":1.04,"expPlanesKilled":2.79},"PASD021":{"expDamage":32974.24,"expDroppedCapturePoints":21.69,"expFrags":0.95,"expCapturePoints":2.4,"expPlanesKilled":1.04},"PRSC010":{"expDamage":21892.39,"expDroppedCapturePoints":20.46,"expFrags":1.12,"expCapturePoints":1.65,"expPlanesKilled":0.01},"PJSD014":{"expDamage":16998.68,"expDroppedCapturePoints":10.09,"expFrags":0.97,"expCapturePoints":0.14,"expPlanesKilled":0.01},"PASC024":{"expDamage":19622.04,"expDroppedCapturePoints":7.5,"expFrags":0.61,"expCapturePoints":0.71,"expPlanesKilled":0.11},"PJSC015":{"expDamage":20441.6,"expDroppedCapturePoints":8.15,"expFrags":0.82,"expCapturePoints":0.74,"expPlanesKilled":0.03},"PJSB018":{"expDamage":99505.75,"expDroppedCapturePoints":15.59,"expFrags":1.38,"expCapturePoints":0.8,"expPlanesKilled":17.85},"PASD014":{"expDamage":25694.38,"expDroppedCapturePoints":5.64,"expFrags":0.98,"expCapturePoints":1.0,"expPlanesKilled":0.3},"PJSC013":{"expDamage":26874.99,"expDroppedCapturePoints":8.15,"expFrags":0.87,"expCapturePoints":0.79,"expPlanesKilled":0.25},"PJSB013":{"expDamage":55693.21,"expDroppedCapturePoints":5.55,"expFrags":0.96,"expCapturePoints":1.54,"expPlanesKilled":4.41},"PASD019":{"expDamage":21104.82,"expDroppedCapturePoints":4.55,"expFrags":0.87,"expCapturePoints":0.95,"expPlanesKilled":0.02},"PBSB002":{"expDamage":33656.3,"expDroppedCapturePoints":5.6,"expFrags":0.77,"expCapturePoints":0.79,"expPlanesKilled":2.0},"PJSB011":{"expDamage":13218.69,"expDroppedCapturePoints":6.65,"expFrags":0.8,"expCapturePoints":1.51,"expPlanesKilled":0.01},"PJSB010":{"expDamage":45813.95,"expDroppedCapturePoints":4.92,"expFrags":0.86,"expCapturePoints":0.99,"expPlanesKilled":1.94},"PJSC012":{"expDamage":44723.17,"expDroppedCapturePoints":9.76,"expFrags":1.0,"expCapturePoints":1.21,"expPlanesKilled":4.78},"PJSD002":{"expDamage":13531.36,"expDroppedCapturePoints":4.17,"expFrags":0.77,"expCapturePoints":0.8,"expPlanesKilled":0.01},"PJSD001":{"expDamage":19422.91,"expDroppedCapturePoints":4.97,"expFrags":1.15,"expCapturePoints":0.83,"expPlanesKilled":0.01},"PRSD001":{"expDamage":22223.64,"expDroppedCapturePoints":5.63,"expFrags":0.78,"expCapturePoints":1.12,"expPlanesKilled":0.3},"PJSB021":{"expDamage":58700.3,"expDroppedCapturePoints":10.12,"expFrags":1.0,"expCapturePoints":1.0,"expPlanesKilled":8.56},"PASB034":{"expDamage":42953.45,"expDroppedCapturePoints":6.51,"expFrags":1.0,"expCapturePoints":1.34,"expPlanesKilled":1.13},"PJSD007":{"expDamage":31782.9,"expDroppedCapturePoints":4.74,"expFrags":0.78,"expCapturePoints":2.47,"expPlanesKilled":0.47},"PJSD004":{"expDamage":34816.77,"expDroppedCapturePoints":3.25,"expFrags":1.21,"expCapturePoints":1.51,"expPlanesKilled":0.12},"PJSD003":{"expDamage":24368.48,"expDroppedCapturePoints":3.06,"expFrags":0.93,"expCapturePoints":1.14,"expPlanesKilled":0.08},"PJSD006":{"expDamage":28067.87,"expDroppedCapturePoints":5.0,"expFrags":0.75,"expCapturePoints":2.55,"expPlanesKilled":0.66},"PRSC001":{"expDamage":21117.35,"expDroppedCapturePoints":11.28,"expFrags":0.77,"expCapturePoints":0.99,"expPlanesKilled":0.01},"PJSD005":{"expDamage":25293.51,"expDroppedCapturePoints":2.81,"expFrags":0.78,"expCapturePoints":2.13,"expPlanesKilled":0.45},"PJSC007":{"expDamage":36365.12,"expDroppedCapturePoints":9.42,"expFrags":1.02,"expCapturePoints":1.39,"expPlanesKilled":2.24},"PASC045":{"expDamage":42287.76,"expDroppedCapturePoints":11.36,"expFrags":1.4,"expCapturePoints":0.86,"expPlanesKilled":0.27},"PJSC008":{"expDamage":48965.79,"expDroppedCapturePoints":10.16,"expFrags":1.19,"expCapturePoints":1.46,"expPlanesKilled":2.96},"PJSC009":{"expDamage":55984.74,"expDroppedCapturePoints":10.94,"expFrags":1.2,"expCapturePoints":1.68,"expPlanesKilled":3.43},"PJSC004":{"expDamage":17860.88,"expDroppedCapturePoints":6.75,"expFrags":0.59,"expCapturePoints":0.62,"expPlanesKilled":1.19},"PJSC005":{"expDamage":22070.59,"expDroppedCapturePoints":6.63,"expFrags":0.66,"expCapturePoints":0.89,"expPlanesKilled":0.36},"PASA012":{"expDamage":64411.49,"expDroppedCapturePoints":7.58,"expFrags":1.19,"expCapturePoints":0.65,"expPlanesKilled":31.19},"PASA013":{"expDamage":99741.88,"expDroppedCapturePoints":18.24,"expFrags":1.74,"expCapturePoints":0.94,"expPlanesKilled":20.64},"PASA010":{"expDamage":60955.12,"expDroppedCapturePoints":6.99,"expFrags":1.11,"expCapturePoints":0.26,"expPlanesKilled":17.0},"PASA015":{"expDamage":102950.27,"expDroppedCapturePoints":10.45,"expFrags":2.09,"expCapturePoints":0.56,"expPlanesKilled":12.28},"PASC004":{"expDamage":23047.14,"expDroppedCapturePoints":12.41,"expFrags":0.88,"expCapturePoints":1.1,"expPlanesKilled":0.01},"PASD006":{"expDamage":25588.17,"expDroppedCapturePoints":6.98,"expFrags":0.87,"expCapturePoints":2.56,"expPlanesKilled":0.54},"PASC001":{"expDamage":11167.23,"expDroppedCapturePoints":10.37,"expFrags":0.76,"expCapturePoints":0.86,"expPlanesKilled":0.01},"PASC002":{"expDamage":11346.76,"expDroppedCapturePoints":9.95,"expFrags":0.49,"expCapturePoints":0.77,"expPlanesKilled":0.01},"PASD008":{"expDamage":32676.22,"expDroppedCapturePoints":8.71,"expFrags":0.86,"expCapturePoints":6.98,"expPlanesKilled":0.41},"PASC007":{"expDamage":38945.31,"expDroppedCapturePoints":11.48,"expFrags":1.14,"expCapturePoints":1.51,"expPlanesKilled":3.45},"PASD002":{"expDamage":10838.8,"expDroppedCapturePoints":5.06,"expFrags":0.62,"expCapturePoints":0.56,"expPlanesKilled":0.01},"PASC005":{"expDamage":34437.51,"expDroppedCapturePoints":10.55,"expFrags":1.1,"expCapturePoints":1.14,"expPlanesKilled":1.15},"PASD005":{"expDamage":25335.87,"expDroppedCapturePoints":6.47,"expFrags":0.96,"expCapturePoints":2.1,"expPlanesKilled":0.55},"PASC006":{"expDamage":26167.19,"expDroppedCapturePoints":8.25,"expFrags":0.74,"expCapturePoints":1.19,"expPlanesKilled":2.85},"PASC044":{"expDamage":36400.16,"expDroppedCapturePoints":14.27,"expFrags":0.96,"expCapturePoints":0.26,"expPlanesKilled":0.23},"PJSC034":{"expDamage":67523.06,"expDroppedCapturePoints":18.71,"expFrags":1.51,"expCapturePoints":3.32,"expPlanesKilled":5.56},"PASA002":{"expDamage":32836.55,"expDroppedCapturePoints":3.61,"expFrags":0.64,"expCapturePoints":0.17,"expPlanesKilled":12.54},"PJSC038":{"expDamage":29758.86,"expDroppedCapturePoints":7.19,"expFrags":0.59,"expCapturePoints":0.9,"expPlanesKilled":1.83},"PJSC037":{"expDamage":13645.73,"expDroppedCapturePoints":12.39,"expFrags":1.06,"expCapturePoints":1.24,"expPlanesKilled":0.01},"PASA004":{"expDamage":23937.22,"expDroppedCapturePoints":1.57,"expFrags":0.49,"expCapturePoints":0.13,"expPlanesKilled":9.16},"PJSC035":{"expDamage":14790.27,"expDroppedCapturePoints":9.49,"expFrags":0.65,"expCapturePoints":0.83,"expPlanesKilled":0.01},"PASA006":{"expDamage":55677.61,"expDroppedCapturePoints":6.35,"expFrags":1.08,"expCapturePoints":0.67,"expPlanesKilled":10.71},"PASB018":{"expDamage":74911.87,"expDroppedCapturePoints":9.21,"expFrags":1.18,"expCapturePoints":0.58,"expPlanesKilled":5.98},"PASB012":{"expDamage":57587.71,"expDroppedCapturePoints":5.29,"expFrags":0.97,"expCapturePoints":1.57,"expPlanesKilled":9.31},"PJSD024":{"expDamage":16828.59,"expDroppedCapturePoints":3.31,"expFrags":0.76,"expCapturePoints":0.78,"expPlanesKilled":0.02},"PASB013":{"expDamage":28356.59,"expDroppedCapturePoints":7.47,"expFrags":0.79,"expCapturePoints":1.13,"expPlanesKilled":0.01},"PASC012":{"expDamage":32227.31,"expDroppedCapturePoints":9.14,"expFrags":0.78,"expCapturePoints":1.54,"expPlanesKilled":3.96},"PASC014":{"expDamage":36663.49,"expDroppedCapturePoints":9.93,"expFrags":0.76,"expCapturePoints":1.59,"expPlanesKilled":6.3},"PJSA015":{"expDamage":96289.91,"expDroppedCapturePoints":10.43,"expFrags":1.98,"expCapturePoints":0.19,"expPlanesKilled":14.43},"PASC017":{"expDamage":39382.69,"expDroppedCapturePoints":10.24,"expFrags":0.69,"expCapturePoints":1.81,"expPlanesKilled":7.67},"PJSA011":{"expDamage":71017.64,"expDroppedCapturePoints":8.47,"expFrags":1.49,"expCapturePoints":0.63,"expPlanesKilled":10.97},"PJSA012":{"expDamage":69258.62,"expDroppedCapturePoints":8.71,"expFrags":1.27,"expCapturePoints":0.57,"expPlanesKilled":14.41}}');
		
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
		if(window.location.host != 'forum.worldofwarships.'+realm_host){
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
									'<span class="button_inner">'+localizationText['Ok']+'</span>' +
								'</span>' +
							'</span>' +
						'</button>' +
						'<a id="userscript-message-cancel" class="link link__cancel" style="display: block; cursor: pointer;" >'+localizationText['Cancel']+'</a>' +
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
				alert(error);
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
		if(window.location.href.indexOf("accounts") > -1 && window.location.href.split('/').length == 9 && window.location.href.split('/')[6].match(/[0-9]+/) != null){
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
			SettingsWCI = getSettingsClanPage();
			getJson(WoWsStatInfoHref+'version.php?random='+Math.floor(Math.random()*100000001), doneLastVersion, errorLastVersion);
			var ClanId = window.location.href.split('/')[4].match(/[0-9]+/);
			ClanPage();
		}
		
		jQ('.link-block').click(function(){onViewBlock(this);});
		
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
			var account_profile = document.getElementsByClassName('account-profile')[0];
			if(account_profile === undefined){return;}
			
			MembersArray[0] = [];
			
			var _nick = document.getElementsByClassName('_nick')[0];
			nickname = _nick.textContent;
			
			var row = document.getElementsByClassName('row')[1];
			var div = document.createElement('div');
			div.setAttribute('id', 'userscript-block-list');
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
			
			var language = lang; if(language == 'zh-tw'){language = 'zh-cn';}
			getJson(WOWSAPI+'encyclopedia/ships/?application_id='+application_id+'&fields=name,images,tier,nation,is_premium,images,type', doneEncyclopedia, errorEncyclopedia);
			getJson(WGAPI+'clans/membersinfo/?application_id='+application_id+'&language='+language+'&account_id='+account_id, doneClanInfo, errorClanInfo);
			getJson(WOWSAPI+'account/info/?application_id='+application_id+'&extra=statistics.pve&language='+language+'&account_id='+account_id+'&index=0&type=profile', doneAccountInfo, errorAccountInfo);
			
			jQ('.account-pvp-pve').click(function(){
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
				ipsList_data.innerHTML += '' +
					'<li class="clear clearfix">' +
						'<span class="row_title">'+localizationText['profile-wows']+':</span>' +
						'<span class="row_data"><a href="http://worldofwarships.'+realm_host+'/community/accounts/'+user_id+'-/" target="_black">'+nickname.innerHTML+'</a></span>' +
					'</li>' +
					'<li class="clear clearfix">' +
						'<span class="row_title">'+localizationText['profile-clan']+':</span>' +
						'<span class="row_data member_'+user_id+'"></span>' +
					'</li>' +
				'';
				
				var language = lang; if(language == 'zh-tw'){language = 'zh-cn';}
				getJson(WGAPI+'clans/membersinfo/?application_id='+application_id+'&language='+language+'&account_id='+user_id, doneForumClanInfo, errorForumClanInfo);
			}
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
						
						var language = lang; if(language == 'zh-tw'){language = 'zh-cn';}
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
			if(Encyclopedia == null){setTimeout(function(){viewMainPageProfile();}, 1000);}
		
			var tabContainer = null;
			var tab_container = document.getElementsByClassName('tab-container');
			for(var tc = 0; tc < tab_container.length; tc++){
				if(tab_container[tc].getAttribute('js-tab-cont-id') != 'pvp'){continue;}
				tabContainer = tab_container[tc];
			}
			
			if(tabContainer != null){
				var cm_parent_link_cutted_text = document.getElementsByClassName('cm-parent-link_cutted-text')[0];
				var login_name = null; if(cm_parent_link_cutted_text != null){login_name = cm_parent_link_cutted_text.textContent;}

				
				var userbar = '';
				if(login_name == MembersArray[0]['info']['nickname']){
					userbar += '<button class="btn btn-lg btn-turqoise" id="generator-userbar" style="margin: 5px;">'+localizationText['generator-userbar']+'</button>';
				}
				userbar += '' +
					'<br />'+
					'<img id="userbar-img" src="'+WoWsStatInfoHref+'bg/userbar.png" />'+
					'<div id="userbar-link" style="margin: 5px; font-size: 14px;">[img]'+WoWsStatInfoHref+'bg/userbar.png[/img]</div>'
				'';
				
				var main_page_script_block = document.getElementById('main-page-script-block');
				var account_main_stats_mobile = tabContainer.getElementsByClassName('account-main-stats-mobile')[0];
				if(main_page_script_block == null && account_main_stats_mobile != null){
					account_main_stats_mobile.outerHTML += '' +
						'<hr />' +
						'<table id="main-page-script-block" style="width: 100%;">' +
							'<tr>' +
								'<td style="/* width: 410px; */ vertical-align: top;">' +
									'<table class="account-table">' +
										'<thead>' +
											'<tr>' +
												'<th colspan="2">' +
													'<h3 class="_title">'+localizationText['additional-results']+'</h3>' +
												'</th>' +
											'</tr>' +
										'</thead>' +
										'<tbody>' +
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
													'<span>'+localizationText['wr']+'</span>' +
												'</td>' +
												'<td class="_value">' +
													'<span style="color: '+findColorASC(MembersArray[0]['info']['statistics']['pvp']['wr'], 'wr')+';">'+
														valueFormat((MembersArray[0]['info']['statistics']['pvp']['wr']).toFixed(2)) + 
													'</span>'+
												'</td>' +
											'</tr>' +
										'</tbody>' +
									'</table>' +
								'</td>'+
								'<td>'+
								'</td>'+
								'<td style="/* width: 470px; */ text-align: right; vertical-align: top;">'+
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
							userbar_link.textContent = '[img]'+WoWsStatInfoHref+'userbar/'+MembersArray[0]['info']['nickname']+'.png[/img]';
						}
					}
					img.src = WoWsStatInfoHref+'userbar/'+MembersArray[0]['info']['nickname']+'.png'+'?'+Math.floor(Math.random()*100000001);
					
					jQ('#generator-userbar').click(function(){
						getJson(WoWsStatInfoHref+'bg/bg.php?'+Math.floor(Math.random()*100000001), doneUserBarBG, errorUserBarBG);
					});
					
					var _values = tabContainer.getElementsByClassName('_values')[0];
					var main_stat = _values.getElementsByTagName('div');
					main_stat[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['battles'], 'battles');
					main_stat[1].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['wins_percents'], 'wins_percents');
					main_stat[2].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['avg_xp'], 'avg_xp');
					main_stat[3].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['avg_damage_dealt'], 'avg_damage_dealt');
					main_stat[4].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['kill_dead'], 'kill_dead');
					
					var account_battle_stats = tabContainer.getElementsByClassName('account-battle-stats')[0];
					if(account_battle_stats != null){
						var account_table = account_battle_stats.getElementsByClassName('account-table');
						
						//Общие результаты
						account_table[0].rows[1].cells[1].getElementsByTagName('span')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['battles'], 'battles');
						
						//Средние показатели за бой
						account_table[1].rows[1].cells[1].getElementsByTagName('span')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['avg_xp'], 'avg_xp');
						account_table[1].rows[2].cells[1].getElementsByTagName('span')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['avg_damage_dealt'], 'avg_damage_dealt');
						account_table[1].rows[3].cells[1].getElementsByTagName('span')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['avg_frags'], 'avg_frags');
						account_table[1].rows[4].cells[1].getElementsByTagName('span')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['avg_planes_killed'], 'avg_planes_killed');
						account_table[1].rows[5].cells[1].getElementsByTagName('span')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['avg_capture_points'], 'avg_capture_points');
						account_table[1].rows[6].cells[1].getElementsByTagName('span')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['avg_dropped_capture_points'], 'avg_dropped_capture_points');
						
						// Рекордные показатели
						account_table[2].rows[2].cells[1].getElementsByTagName('span')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['max_damage_dealt'], 'max_damage_dealt');
						account_table[2].rows[3].cells[1].getElementsByTagName('span')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['max_frags_battle'], 'max_frags_battle');
						account_table[2].rows[4].cells[1].getElementsByTagName('span')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['max_planes_killed'], 'max_planes_killed');
						
						//Дополнительно
						account_table[0].rows[2].cells[1].getElementsByTagName('small')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['wins_percents'], 'wins_percents');
						if(account_table[2].rows[1].cells[1].getElementsByClassName('small-max_xp')[0] == undefined){
							account_table[2].rows[1].cells[1].innerHTML += '<small class="small-max_xp">('+valueFormat(MembersArray[0]['info']['statistics']['pvp']['max_xp'])+')</small>';
							account_table[2].rows[1].cells[1].getElementsByTagName('small')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['max_xp'], 'max_xp');
						}
						if(account_table[0].rows[3].cells[1].getElementsByClassName('small-survived_battles_percents')[0] == undefined){
							account_table[0].rows[3].cells[1].innerHTML += '<small class="small-survived_battles_percents">('+valueFormat((MembersArray[0]['info']['statistics']['pvp']['survived_battles_percents']).toFixed(2))+'%)</small>';
							account_table[0].rows[3].cells[1].getElementsByTagName('small')[0].style.color = findColorASC(MembersArray[0]['info']['statistics']['pvp']['survived_battles_percents'], 'survived_battles_percents');
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
						
						//
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
								td.innerHTML = '<span style="color:'+findColorASC(MembersArray[0]['info']['statistics']['pvp']['wr_'+ship_class], 'wr')+';">'+valueFormat((MembersArray[0]['info']['statistics']['pvp']['wr_'+ship_class]).toFixed(0))+'</span>';
								row.appendChild(td);
							}
							
							var battles = htmlParseMemberStatistic(row.cells[2]);
							if(battles > 0){
								var wins = htmlParseMemberStatistic(row.cells[3]);
								var avg_xp = htmlParseMemberStatistic(row.cells[4]);
								var wins_percents = (wins/battles)*100; if(isNaN(wins_percents)){wins_percents = 0;}
								
								row.cells[3].setAttribute('style', 'white-space: nowrap;');
								row.cells[3].innerHTML = valueFormat(wins)+' <span style="color:'+findColorASC(wins_percents, 'wins_percents')+';">('+valueFormat((wins_percents).toFixed(0))+'%)</span>';							
								
								row.cells[4].setAttribute('style', 'white-space: nowrap;');
								row.cells[4].innerHTML = ' <span style="color:'+findColorASC(avg_xp, 'avg_xp')+';">'+valueFormat(avg_xp)+'</span>';
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
							}
							
							var battles = htmlParseMemberStatistic(row.cells[1]);
							if(battles > 0){
								var wins = htmlParseMemberStatistic(row.cells[2]);
								var avg_xp = htmlParseMemberStatistic(row.cells[3]);
								var wins_percents = (wins/battles)*100; if(isNaN(wins_percents)){wins_percents = 0;}
								
								row.cells[2].setAttribute('style', 'white-space: nowrap;');
								row.cells[2].innerHTML = valueFormat(wins)+' <span style="color:'+findColorASC(wins_percents, 'wins_percents')+';">('+valueFormat((wins_percents).toFixed(0))+'%)</span>';							
								
								row.cells[3].setAttribute('style', 'white-space: nowrap;');
								row.cells[3].innerHTML = ' <span style="color:'+findColorASC(avg_xp, 'avg_xp')+';">'+valueFormat(avg_xp)+'</span>';
							}
							
							continue;
						}
						
						if(row.getAttribute('class').indexOf('_ship-entry-stat') > -1){
							row.cells[0].setAttribute('colspan', '6');
							
							continue;
						}
					}
					
					for(var shipI = 0; shipI < MembersArray[0]['ships'].length; shipI++){
						var ship_id = MembersArray[0]['ships'][shipI]['ship_id'];
						var wr_cell = document.getElementById('wr-'+ship_id);
						wr_cell.setAttribute('style', 'white-space: nowrap;');
						wr_cell.innerHTML = '<span style="color:'+findColorASC(MembersArray[0]['ships'][shipI]['pvp']['wr'], 'wr')+';">'+valueFormat((MembersArray[0]['ships'][shipI]['pvp']['wr']).toFixed(0))+'</span>';
					}
				}
			}
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
						userbar_link.textContent = '[img]'+xmlhttp.responseText+'[/img]';
					}
				}
			};
			xmlhttp.send(jsonString);
		}
		function doneUserBarBG(url, response){
			var html = '';
			
			var data = response;
			
			var check = true;
			html += '<div style="width: 488px; height: 429px; overflow-y: scroll;">';
			for(var i = 0; i < data.length; i++){				
				var imgbgview = false;
				var img = data[i].split('_');
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
					html += '<input type="radio" name="userbar-bg" value="'+data[i]+'" '+checked+'> '+data[i]+'<br />';
					html += '<img src="'+WoWsStatInfoHref+'bg/'+data[i]+'.png" title="'+data[i]+'"/><br /><br />';
				}
			}
			html += '</div>';
			
			onShowMessage(
				localizationText['userbar-bg'],
				html,
				function(){GeneratorUserBar(); onCloseMessage();},
				localizationText['Ok'],
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
				localizationText['userbar-bg'],
				html,
				function(){GeneratorUserBar(); onCloseMessage();},
				localizationText['Ok'],
				true
			);
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
			var layout_spreader = document.getElementsByClassName("layout_spreader")[0];
			countColumn = (layout_spreader.offsetWidth / 100).toFixed(0);
			
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
					
					var image = row.getElementsByClassName('svg-icon')[1];
					var srcArr = image.getAttribute('src').split("/");
					MembersArray[index]['role'] = srcArr[srcArr.length - 1].split(".")[0];
					MembersArray[index]['role_i18n'] = getRoleText(srcArr[srcArr.length - 1].split(".")[0]);
					MembersArray[index]['role_sort_num'] = getRoleSortNum(srcArr[srcArr.length - 1].split(".")[0]);
					
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
					
					var language = lang; if(language == 'zh-tw'){language = 'zh-cn';}
					
					loadTimeStart = new Date().getTime();
					countMembers = MembersArray.length;
					loadOnePercent = 100 / countMembers;
					for(var i = 0; i < MembersArray.length; i++){
						getJson(WOWSAPI+'account/info/?application_id='+application_id+'&extra=statistics.pve&language='+language+'&account_id='+MembersArray[i]['account_id']+'&index='+i+'&type=clan', doneAccountInfo, errorAccountInfo);
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
			
			var layout_spreader = document.getElementsByClassName("layout_spreader")[0];
			var tableSizeWidth = layout_spreader.offsetWidth;
			
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
			
			if(attr.indexOf(".avg_") > -1 || attr.indexOf("_percents") > -1 || attr.indexOf(".kill_dead") > -1 || attr.indexOf(".wr") > -1){
				value = (value).toFixed(2);
			}
			
			var value_html = '';
			if(attr.indexOf(".avg_") > -1 || attr.indexOf("_percents") > -1 || (attr.indexOf(".max_") > -1 && attr.indexOf(".max_xp") == -1) 
				|| attr.indexOf(".battles") > -1 || attr.indexOf(".kill_dead") > -1 || attr.indexOf(".wr") > -1){
				value_html = '<font color="'+findColorASC(value, layer[layer.length - 1])+'">'+valueFormat(value)+'</font>';
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
		function doneAccountInfo(url, response){
			if(response.status && response.status == "error"){
				errorAccountInfo();
				return;
			}
			
			var vars = getUrlVars(url);
			var account_id = vars['account_id'];
			var index = vars['index'];
			var type = vars['type'];
			
			MembersArray[index]['info'] = response['data'][account_id];
			
			var language = lang; if(language == 'zh-tw'){language = 'zh-cn';}
			getJson(WOWSAPI+'ships/stats/?application_id='+application_id+'&extra=pve&language='+language+'&account_id='+account_id+'&index='+index+'&type='+type, doneShipsStats, errorShipsStats);
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
				var language = lang; if(language == 'zh-tw'){language = 'zh-cn';}
				getJson(WOWSAPI+'ships/stats/?application_id='+application_id+'&extra=pve&language='+language+'&account_id='+account_id+'&index='+index+'&type='+type, doneShipsStats, errorShipsStats);
			}
		}
		function doneShipsStats(url, response){
			if(response.status && response.status == "error"){
				errorShipsStats();
				return;
			}
			
			var vars = getUrlVars(url);
			var account_id = vars['account_id'];
			var index = vars['index'];
			var type = vars['type'];
			
			MembersArray[index]['ships'] = response['data'][account_id];
			
			if(!calcStat(index)){
				console.log('Error calcStat '+account_id);
			}
			
			if(type == 'profile'){
				viewMainPageProfile();
			}else if(type == 'clan'){
				loadMemberCount++;
				viewMainPageClan();
			}
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
				
				return false;
			}
			
			for(var t = 0; t < typeStat.length; t++){
				var type = typeStat[t];
				var Statistics = MembersArray[index]['info']['statistics'][type];
				
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
			}
			
			var ships_x_level = 0;
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
			
			var StatShipsClass = [];
			for(var t = 0; t < typeShip.length; t++){
				var type = typeShip[t];
				StatShipsClass[type] = [];
				StatShipsClass[type]['damage_dealt'] = 0;
				StatShipsClass[type]['frags'] = 0;
				StatShipsClass[type]['planes_killed'] = 0;
				StatShipsClass[type]['capture_points'] = 0;
				StatShipsClass[type]['dropped_capture_points'] = 0;
				StatShipsClass[type]['expDamage'] = 0;
				StatShipsClass[type]['expFrags'] = 0;
				StatShipsClass[type]['expPlanesKilled'] = 0;
				StatShipsClass[type]['expCapturePoints'] = 0;
				StatShipsClass[type]['expDroppedCapturePoints'] = 0;
			}
			
			for(var shipI = 0; shipI < MembersArray[index]['ships'].length; shipI++){
				var Ship = MembersArray[index]['ships'][shipI];
				var ship_id = Ship['ship_id'];
				
				for(var t = 0; t < typeStat.length; t++){
					var type = typeStat[t];
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
					
					if(Encyclopedia != null && type == 'pvp'){
						var ship_type = Encyclopedia[ship_id]['type'];
						var image = Encyclopedia[ship_id]['images']['small'];
						var ship_code = image.split('/')[image.split('/').length - 1].split('.')[0];
						
						if(ExpShips[ship_code] !== undefined){
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
							StatShip['expDamage'] = battles * ExpShips[ship_code]['expDamage'];
							StatShip['expFrags'] = battles * ExpShips[ship_code]['expFrags'];
							StatShip['expPlanesKilled'] = battles * ExpShips[ship_code]['expPlanesKilled'];
							StatShip['expCapturePoints'] = battles * ExpShips[ship_code]['expCapturePoints'];
							StatShip['expDroppedCapturePoints'] = battles * ExpShips[ship_code]['expDroppedCapturePoints'];
							
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
					}
				}
				
				if(Encyclopedia != null){
					if(Encyclopedia[ship_id]['tier'] == 10){
						ships_x_level++;
					}
				}
			}
			
			MembersArray[index]['info']['ships_x_level'] = ships_x_level;
			
			for(var t = 0; t < typeShip.length; t++){
				var type = typeShip[t];
				
				MembersArray[index]['info']['statistics']['pvp']['wr_'+type] = calcWR(StatShipsClass[type]);
			}
			
			MembersArray[index]['info']['statistics']['pvp']['wr'] = calcWR(StatShips);
			
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
		function doneEncyclopedia(url, response){
			if(response.status && response.status == "error"){
				errorEncyclopedia();
				return;
			}
			
			Encyclopedia = response['data'];
		}
		function errorEncyclopedia(url){
			Encyclopedia = null;
			
			console.log('Get Encyclopedia Error');
		}
		function findColorASC(value, stat_type){
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
		}
		function findColorDESC(value, stat_type){
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
						' <a target="_blank" style="color: #658C4C; font-weight: bold; border-bottom: 1px dotted #658C4C;" href="http://worldofwarships.ru/cbt/accounts/635939-Vov_chiK/">Vov_chiK</a> ' +
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
				
				localizationText['ru']['generator-userbar'] = 'Создать UserBar';
				localizationText['ru']['userbar-bg'] = 'Выберите фон:';
				
				localizationText['ru']['additional-results'] = 'Дополнительные результаты';
				localizationText['ru']['number-ships-x'] = 'Количество кораблей 10 уровня';
				localizationText['ru']['wr'] = 'WR';
				
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
				
				localizationText['ru']['info.ships_x_level'] = '10 lvl';
			}
			
			{/* English */
				localizationText['en'] = [];
				
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
				
				localizationText['en']['generator-userbar'] = 'Create UserBar';
				localizationText['en']['userbar-bg'] = 'Choose a background:';
				
				localizationText['en']['additional-results'] = 'Additional Results';
				localizationText['en']['number-ships-x'] = 'Number of X Tier ships';
				localizationText['en']['wr'] = 'WR';
				
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
				
				localizationText['en']['info.ships_x_level'] = '10 lvl';
			}
			
			{/* Français */
				localizationText['fr'] = [];
				
				localizationText['fr'] = jQ.extend([], localizationText['en']);
				
				localizationText['fr']['num-separator'] = ' ';
				localizationText['fr']['num-fractional'] = ',';
			}
			
			{/* Deutsch */
				localizationText['de'] = [];
			
				localizationText['de'] = jQ.extend([], localizationText['en']);
				
				localizationText['de']['num-separator'] = '.';
				localizationText['de']['num-fractional'] = ',';
			}
			
			{/* Türkçe */
				localizationText['tr'] = [];
			
				localizationText['tr'] = jQ.extend([], localizationText['en']);
				
				localizationText['tr']['num-separator'] = '.';
				localizationText['tr']['num-fractional'] = ',';
			}
			
			{/* Español */
				localizationText['es'] = [];
			
				localizationText['es'] = jQ.extend([], localizationText['en']);
				
				localizationText['es']['num-separator'] = '.';
				localizationText['es']['num-fractional'] = ',';
			}
			
			{/* Čeština */
				localizationText['cs'] = [];
			
				localizationText['cs'] = jQ.extend([], localizationText['en']);
				
				localizationText['cs']['num-separator'] = ' ';
				localizationText['cs']['num-fractional'] = ',';
			}
			
			{/* Polski */
				localizationText['pl'] = [];
			
				localizationText['pl'] = jQ.extend([], localizationText['en']);
				
				localizationText['pl']['num-separator'] = ' ';
				localizationText['pl']['num-fractional'] = ',';
			}
			
			{/* 日本語 */
				localizationText['ja'] = [];
			
				localizationText['ja'] = jQ.extend([], localizationText['en']);
				
				localizationText['ja']['num-separator'] = '';
				localizationText['ja']['num-fractional'] = '.';
			}
			
			{/* ไทย */
				localizationText['th'] = [];
			
				localizationText['th'] = jQ.extend([], localizationText['en']);
				
				localizationText['th']['num-separator'] = '';
				localizationText['th']['num-fractional'] = '.';
			}
			
			{/* Tiếng Việt */
				localizationText['vi'] = [];
			
				localizationText['vi'] = jQ.extend([], localizationText['en']);
				
				localizationText['vi']['num-separator'] = '';
				localizationText['vi']['num-fractional'] = ',';
			}
			
			{/* 繁體中文 */
				localizationText['zh-tw'] = [];
			
				localizationText['zh-tw'] = jQ.extend([], localizationText['en']);
				
				localizationText['zh-tw']['num-separator'] = '';
				localizationText['zh-tw']['num-fractional'] = '.';
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