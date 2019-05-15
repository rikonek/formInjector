// ==UserScript==
// @name         formInjector
// @namespace    https://github.com/rikonek/formInjector
// @version      0.1
// @description  Data form injector
// @author       Rikon
// @match        https://*/*
// @grant        GM_addStyle
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// ==/UserScript==

GM_addStyle(`
	div.formInjector { position: fixed; z-index: 100; left: 0; width: 100%; padding: 10px; background-color: yellow; font-family: Arial; font-size: 12px; }
	div.formInjector select { width: auto; }
	.top { top: 0; }
	.bottom { bottom: 0; }
`);

function refreshBar()
{
	$('#formInjector').remove();
	language=readLanguage();
	addBar();
}

function addBar()
{
	$('body').append('\
		<div id="formInjector" class="formInjector top" align="center"> \
			'+ui('language')+': <select id="formInjector_language"><option value="en">English</option><option value="pl">Polski</option></select> &nbsp; &nbsp; \
			'+ui('position')+': <select id="formInjector_position"><option value="top">'+ui('top')+'</option><option value="bottom">'+ui('bottom')+'</option></select> &nbsp; &nbsp; \
			'+ui('counter_desc')+': <span id="formInjector_counter">0</span> &nbsp; &nbsp; \
			<button id="formInjector_inject">'+ui('inject_desc')+'</button> &nbsp; &nbsp; \
			<button id="formInjector_autostart">'+ui('autostart')+'</button> &nbsp; &nbsp; \
			'+ui('exclude_desc')+': <input type="text" id="formInjector_exclude" placeholder="1,2,3,..." style="width: 100px;" /> &nbsp; &nbsp; \
			<button id="formInjector_add">'+ui('add_desc')+'</button> &nbsp; &nbsp; \
			<button id="formInjector_clear">'+ui('clear_desc')+'</button> \
			<span id="formInjector_form" style="display: none;"> \
				<br /><br /> \
				<textarea id="formInjector_input" style="width: 90%; height: 200px;"></textarea> \
				<br /> \
				<button id="formInjector_save">'+ui('save')+'</button> <button id="formInjector_cancel">'+ui('cancel')+'</button> \
			</span> \
		</div> \
	');
	$('#formInjector_position').change(function(){
		changeBarPosition($(this).val());
	});
	$('#formInjector_add').click(function() {
		showForm();
	});
	$('#formInjector_clear').click(function() {
		if(confirm(ui('clear_db'))) {
			clearStorage();
		}
	});
	$('#formInjector_cancel').click(function() {
		hideForm();
	});
	$('#formInjector_save').click(function() {
		saveForm($('#formInjector_input').val());
		hideForm();
	});
	$('#formInjector_inject').click(function() {
		getRow();
		if(getAutostartStatus()=='on') {
			submitForm();
		}
	});
	$('#formInjector_autostart').click(function() {
		if(getAutostartStatus()=="off") {
			autostartOn();
		} else {
			autostartOff();
		}
	});
	$('#formInjector_exclude').change(function() {
		saveExclude($(this).val());
	});
	$('#formInjector_language').change(function() {
		saveLanguage($(this).val());
		refreshBar();
	});
	readExclude();
	switch(language) {
		case 'en':
		case 'pl':
			break;

		default:
			language='en';
	}
	$('#formInjector_language').val(language);
}

function saveExclude(data)
{
	data=data.trim().replace(/ /g,',').replace(/;/g,',');
	localStorage.setItem('exclude',data);
	readExclude();
}

function readExclude()
{
	$('#formInjector_exclude').val(localStorage.getItem('exclude'));
}

function saveLanguage(data)
{
	localStorage.setItem('language',data);
}

function readLanguage()
{
	var language=localStorage.getItem('language');
	if(!language) {
		language=detectBrowserLanguage();
		saveLanguage(language);
	}
	return language;
}

function saveStorage(data)
{
	localStorage.setItem('data',JSON.stringify(data));
	datastorage=data;
}

function readStorage()
{
	return JSON.parse(localStorage.getItem('data'));
}

function clearStorage()
{
	localStorage.removeItem('data');
	datastorage='';
	countData();
}

function autostartOn()
{
	sessionStorage.setItem('autostart','on');
	$('#formInjector_autostart').css('background-color','#7FFF00');
}

function autostartOff()
{
	sessionStorage.setItem('autostart','off');
	$('#formInjector_autostart').css('background-color','');
}

function getAutostartStatus()
{
	var status=sessionStorage.getItem('autostart');
	if(status=="on") {
		$('#formInjector_autostart').css('background-color','#7FFF00');
	} else {
		status="off";
	}
	return status;
}

function changeBarPosition(position)
{
	if(position=="bottom") {
		$('#formInjector').removeClass('top').addClass('bottom');
		$('#formInjector_position').val('bottom');
		sessionStorage.setItem('position','bottom');
	} else {
		$('#formInjector').addClass('top').removeClass('bottom');
		$('#formInjector_position').val('top');
		sessionStorage.setItem('position','top');
	}
}

function showForm()
{
		$('#formInjector_form').show();
}

function hideForm()
{
		$('#formInjector_input').val('');
		$('#formInjector_form').hide();
}

function countData()
{
	var counter=0;
	if(datastorage)
	$.each(datastorage,function(key,row) {
		counter++;
	});
	$('#formInjector_counter').html(counter);
}

function saveForm(data)
{
	if(!data) return false;
	data=data.trim().split("\n");
	var olddata=JSON.parse(localStorage.getItem('data'));
	if(olddata!=null) data=olddata.concat(data);
	saveData(data);
}

function saveData(data)
{
	saveStorage(data);
	countData();
}

function getRow()
{
	var data;
	if(datastorage.length==0) {
		autostartOff();
		return false;
	}
	$.each(datastorage,function(key,row) {
		data=row.split("\t");
		return false;
	});
	if(injectData(data)) {
		datastorage.splice(0,1);
		saveData(datastorage);
	}
}

function injectData(data)
{
	var form=$.find('input[type=text]:not(#formInjector_exclude), input[type=email], textarea:not(#formInjector_input)');
	if(form.length==0) return false;
	var exclude=$('#formInjector_exclude').val();
	if(exclude) {
		exclude=exclude.split(',').map(Number);
		$.each(exclude,function(key,row) {
			if($.isNumeric(row)) {
				delete data[row-1];
			}
		});
		var new_data=[];
		$.each(data,function(key,row) {
			if(row!=undefined) new_data.push(row);
		});
	} else {
		new_data=data;
	}
	$.each(form,function(key,row) {
		$(this).val(new_data[key]);
	});
	return true;
}

function submitForm()
{
	$('form').find('input[type=submit]').trigger('click');
}

function detectBrowserLanguage()
{
	var language=navigator.language || navigator.userLanguage;
	language=language.split('-')[0];
	return language;
}

function ui(key)
{
	var l=eval('language_'+language);
	return l.get(key);
}

var language_en=new Map([
	['language', 'Language'],
	['position', 'Position'],
	['top', 'Top'],
	['bottom', 'Bottom'],
	['counter_desc', 'Rows in database'],
	['inject_desc', 'Inject data'],
	['autostart', 'Autostart'],
	['exclude_desc', 'Exclude columns'],
	['add_desc', 'Add to database'],
	['clear_desc', 'Clear database'],
	['save', 'Save'],
	['cancel', 'Cancel'],
	['clear_db', 'Do you want clear database?'],
]);

var language_pl=new Map([
	['language', 'Język'],
	['position', 'Pozycja'],
	['top', 'Góra'],
	['bottom', 'Dół'],
	['counter_desc', 'Ilość rekordów w bazie'],
	['inject_desc', 'Wstrzyknij dane'],
	['autostart', 'Autostart'],
	['exclude_desc', 'Pomijaj kolumny'],
	['add_desc', 'Dodaj do bazy'],
	['clear_desc', 'Wyczyść bazę'],
	['save', 'Zapisz'],
	['cancel', 'Anuluj'],
	['clear_db', 'Wyczyścić baze?'],
]);

var datastorage;
var language=readLanguage();

(function() {
	'use strict';
	addBar();
	datastorage=readStorage();
	countData();
	changeBarPosition(sessionStorage.getItem('position'));
	if(getAutostartStatus()=='on') {
		getRow();
		submitForm();
	}
})();