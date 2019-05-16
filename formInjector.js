// ==UserScript==
// @name         formInjector
// @namespace    https://github.com/rikonek/formInjector
// @version      0.2
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

function init()
{
	addBar();
	changeBarPosition(getSession('position'));
	setButtonAction();
	setFormCounter();
	setFormExclude();
	setFormLanguage();
	if(getAutostartStatus()=='on') {
		getRow();
		submitForm();
	}
}

function set(key,value)
{
	localStorage.setItem(key,value);
}

function get(key)
{
	return localStorage.getItem(key);
}

function setSession(key,value)
{
	sessionStorage.setItem(key,value);
}

function getSession(key)
{
	return sessionStorage.getItem(key);
}

function getLanguage()
{
	if(!language) {
		language=get('language');
		if(!language) {
			language=detectBrowserLanguage();
			set('language',language);
		}
		switch(language) {
			case 'en':
			case 'pl':
				break;

			default:
				language='en';
		}
	}
	return language;
}

function setFormLanguage()
{
	$('#formInjector_language').val(language);
}

function detectBrowserLanguage()
{
	var l=navigator.language || navigator.userLanguage;
	return l.split('-')[0];
}

function setData(d)
{
	data=d;
	set('data',JSON.stringify(data));
}

function getData()
{
	return JSON.parse(get('data'));
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
}

function removeBar()
{
	$('#formInjector').remove();
}

function setButtonAction()
{
	$('#formInjector_language').change(function() {
		language=$(this).val();
		set('language',language);
		removeBar();
		init();
	});
	$('#formInjector_position').change(function(){
		changeBarPosition($(this).val());
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
		setExclude($(this).val());
		setFormExclude();
	});
	$('#formInjector_add').click(function() {
		$('#formInjector_form').show();
	});
	$('#formInjector_clear').click(function() {
		if(confirm(ui('clear_db'))) {
			clearStorage();
		}
	});
	$('#formInjector_save').click(function() {
		saveForm($('#formInjector_input').val());
		hideForm();
	});
	$('#formInjector_cancel').click(function() {
		hideForm();
	});
}

function changeBarPosition(position)
{
	switch(position) {
		case 'bottom':
			$('#formInjector').removeClass('top').addClass('bottom');
			break;

		case 'top':
		default:
			position='top';
			$('#formInjector').addClass('top').removeClass('bottom');
	}
	$('#formInjector_position').val(position);
	setSession('position',position);
}

function getRow()
{
	if(data.length==0) {
		autostartOff();
		return false;
	}
	$.each(data,function(key,row) {
		d=row.split("\t");
		return false;
	});
	if(injectData(d)) {
		data.splice(0,1);
		setData(data);
		setFormCounter();
	}
}

function getAutostartStatus()
{
	var status=getSession('autostart');
	if(status=="on") {
		$('#formInjector_autostart').css('background-color','#7FFF00');
	} else {
		status="off";
		$('#formInjector_autostart').css('background-color','');
	}
	return status;
}

function autostartOn()
{
	setSession('autostart','on');
	$('#formInjector_autostart').css('background-color','#7FFF00');
}

function autostartOff()
{
	setSession('autostart','off');
	$('#formInjector_autostart').css('background-color','');
}

function submitForm()
{
	$('form').find('input[type=submit]').trigger('click');
}

function setExclude(data)
{
	data=data.trim().replace(/ /g,',').replace(/;/g,',').replace(/,,/g,',');
	set('exclude',data);
}

function setFormExclude()
{
	$('#formInjector_exclude').val(get('exclude'));
}

function hideForm()
{
	$('#formInjector_input').val('');
	$('#formInjector_form').hide();
}

function clearStorage()
{
	localStorage.removeItem('data');
	data='';
	setFormCounter();
}

function setFormCounter()
{
	var counter=0;
	if(data) {
		$.each(data,function(key,row) {
			counter++;
		});
	}
	$('#formInjector_counter').html(counter);
}

function saveForm(d)
{
	if(!d) return false;
	data=d.trim().split("\n");
	var olddata=getData();
	if(olddata!=null) data=olddata.concat(data);
	setData(data);
	setFormCounter();
}

function injectData(d)
{
	var form=$.find('input[type=text]:not(#formInjector_exclude), input[type=email], textarea:not(#formInjector_input)');
	if(form.length==0) return false;
	var exclude=$('#formInjector_exclude').val();
	if(exclude) {
		exclude=exclude.split(',').map(Number);
		$.each(exclude,function(key,row) {
			if($.isNumeric(row)) {
				delete d[row-1];
			}
		});
		var new_data=[];
		$.each(d,function(key,row) {
			if(row!=undefined) new_data.push(row);
		});
	} else {
		new_data=d;
	}
	$.each(form,function(key,row) {
		$(this).val(new_data[key]);
	});
	return true;
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

var language=getLanguage();
var data=getData();

(function() {
	'use strict';
	init();
})();