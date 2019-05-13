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

function addBar()
{
	$('body').append('\
		<div id="formInjector" class="formInjector top" align="center"> \
			Pozycja: <select id="formInjector_position"><option value="top">Góra</option><option value="bottom">Dół</option></select> &nbsp; &nbsp; \
			Ilość rekordów w bazie: <span id="formInjector_counter">0</span> &nbsp; &nbsp; \
			<button id="formInjector_inject">Wstrzyknij dane</button> &nbsp; &nbsp; \
			<button id="formInjector_autostart">Autostart</button> &nbsp; &nbsp; \
			Pomijaj kolumny: <input type="text" id="formInjector_exclude" style="width: 100px;" /> &nbsp; &nbsp; \
			<button id="formInjector_add">Dodaj do bazy</button> &nbsp; &nbsp; \
			<button id="formInjector_clear">Wyczyść bazę</button> \
			<span id="formInjector_form" style="display: none;"> \
				<br /><br /> \
				<textarea id="formInjector_input" style="width: 90%; height: 200px;"></textarea> \
				<br /> \
				<button id="formInjector_save">Zapisz</button> <button id="formInjector_cancel">Anuluj</button> \
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
		if(confirm('Wyczyścić bazę?')) {
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
	readExclude();
}

function saveExclude(data)
{
	data=data.trim().replace(/ /g,',').replace(/;/g,',');
	localStorage.setItem('exclude',data);
	readExclude();
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

function readExclude()
{
	$('#formInjector_exclude').val(localStorage.getItem('exclude'));
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

var datastorage;

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