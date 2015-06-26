/**
 * Created by mmorales on 6/26/15.
 * Jquery plugin
 */
(function ($) {

	$.wtb = {};
	$.wtb.target = null;
	$.wtb.advancedOptions = {};
	$.wtb.players = {};
	$.wtb.factions = {
		'Cygnar': {},
		'Menoth': {},
		'Khador': {},
		'Cryx': {},
		'Retribution': {},
		'Mercenaries': {},
		'Convergence': {},
		'Trollbloods': {
			{name:'Borka Kegslayer',claimed:0},
			{name:'Borka, Vengeance of the Rimeshaws',claimed:0},
			{name:'Calandra Truthsayer, Oracle of the Glimmerwood',claimed:0},
			{name:'Captain Gunnbjorn',claimed:0},
			{name:'Grim Angus',claimed:0},
			{name:'Grissel Bloodsong',claimed:0},
			{name:'Grissel Bloodsong, Marshal of the Kriels',claimed:0},
			{name:'Hoarluk Doomshaper',claimed:0},
			{name:'Hoarluk Doomshaper, Rage of Dhunia',claimed:0},
			{name:'Hunters Grim',claimed:0},
			{name:'Jarl Skuld, Devil of the Thornwood',claimed:0},
			{name:'Madrak Ironhide',claimed:0},
			{name:'Madrak Ironhide, World Ender',claimed:0}
		},
		'Circle': {
			{name:'Baldur the Stonecleaver',claimed:0},
            {name:'Baldur the Stonesoul',claimed:0},
            {name:'Bradigus Thorle the Runecarver',claimed:0},
            {name:'Cassius the Oathkeeper & Wurmwood, Tree of Fate',claimed:0},
            {name:'Grayle the Farstrider',claimed:0},
            {name:'Kaya the Moonhunter & Laris',claimed:0},
            {name:'Kaya the Wildborne',claimed:0},
            {name:'Kromac the Ravenous',claimed:0},
            {name:'Krueger the Stormlord',claimed:0},
            {name:'Krueger the Stormwrath',claimed:0},
            {name:'Mohsar the Desertwalker',claimed:0},
            {name:'Morvahna The Autumnblade',claimed:0},
            {name:'Morvahna the Dawnshadow',claimed:0}
		},
		'Skorne': {
			{name:'Master Ascetic Naaresh',claimed:0},
            {name:'Archdomina Makeda',claimed:0},
            {name:'Dominar Rasheth',claimed:0},
            {name:'Lord Arbiter Hexeris',claimed:0},
            {name:'Lord Assassin Morghoul',claimed:0},
            {name:'Lord Tyrant Hexeris',claimed:0},
            {name:'Makeda & The Exalted Court',claimed:0},
            {name:'Master Tormentor Morghoul',claimed:0},
            {name:'Supreme Aptimus Zaal & Kovaas',claimed:0},
            {name:'Supreme Archdomina Makeda',claimed:0},
            {name:'Tyrant Xerxis',claimed:0},
            {name:'Void Seer Mordikaar',claimed:0},
            {name:'Xerxis, Fury of Halaak',claimed:0}
            {name:'Zaal, the Ancestral Advocate',claimed:0}
		},
		'Legion': {
			{name:'Absylonia, Daughter of Everblight',claimed:0},
            {name:'Absylonia, Terror of Everblight',claimed:0},
            {name:'Bethayne and Belphagor',claimed:0},
            {name:'Kallus, Wrath of Everblight',claimed:0},
            {name:'Lylyth, Herald of Everblight',claimed:0},
            {name:'Lylyth, Reckoning of Everblight',claimed:0},
            {name:'Lylyth, Shadow of Everblight',claimed:0},
            {name:'Rhyas, Sigil of Everblight',claimed:0},
            {name:'Saeryn, Omen of Everblight',claimed:0},
            {name:'Thagrosh the Messiah',claimed:0},
            {name:'Thagrosh, Prophet of Everblight',claimed:0},
            {name:'Vayl, Consul of Everblight',claimed:0},
            {name:'Vayl, Disciple of Everblight',claimed:0}
		},
		'Minions': {
		    {name:'Bloody Barnabas',claimed:0},
		    {name:'Calaban the Grave Walker',claimed:0},
		    {name:'Dr. Arkadius',claimed:0},
		    {name:'Helga the Conquerer',claimed:0},
		    {name:'Jaga-Jaga, the Death Charmer',claimed:0},
		    {name:'Lord Carver, BMMD, Esq. III',claimed:0},
		    {name:'Maelok the Dreadbound',claimed:0},
		    {name:'Midas',claimed:0},
		    {name:'Rask',claimed:0},
   		    {name:'Sturm & Drang',claimed:0},
		}
		'Bankrupt':{
		    {name:'Brun Cragback & Lug',claimed:0},
	        {name:'Dahlia Hallyr & Skarath',claimed:0},
	        {name:'Rorsh & Brine',claimed:0},
	        {name:'Wrong Eye & Snapjaw',claimed:0},
	        {name:'Beast Mistress',claimed:0},
	        {name:'Tyrant Zaadesh',claimed:0},
	        {name:'Una the Falconer',claimed:0},
	        {name:'Horgle Ironstrike',claimed:0},
	        {name:'Journeyman Warcaster',claimed:0},
	        {name:'Lieutenant Allison Jakes',claimed:0},
	        {name:'Initiate Tristan Durant',claimed:0},
	        {name:'Kovnik Andrei Malakov',claimed:0},
	        {name:'Aiakos, Scourge of the Meredius',claimed:0},
	        {name:'Elara, Tyro of the Third Chamber',claimed:0},
	        {name:'Gastone Crosse',claimed:0}
		}
	};


	/*
	 * initializes the form reduction of a worltrac form with and advanced options subsection containing many sections
	 */
	$.fn.wtb = function () {
		$.wtb.target = $(this);
		var formID = form.attr('id');

		if ($.wtb.form[formID]) {
			$.each($.wtb.formHeaders['frmSearch'], function (sectionID, header) {
				header = $(header);
				if (header.attr('child-hidden') == 'true') {
					$.wtb.enableSubForm(formID,sectionID);
				}
				header.removeAttr('child-hidden');
				header.removeAttr('child-id');
				header.off();
				header.find('.CTRL_TYPE_DIVLINK').attr('onmousedown', "DivToggle('" + sectionID + "');");
			});
			delete($.wtb.form[formID]);
			return;
		}

		$.wtb.form[formID] = form;
		$.wtb.advancedOptions[formID] = form.find('#advanced_options');
		$.wtb.formSections[formID] = {};
		$.wtb.formHeaders[formID] = {};
		$.wtb.advancedOptions[formID].find('.CTRL_TYPE_DIV').each(function (index, element) {
			var header = $(element);
			$.wtb.addFormSection(formID, header);
			$.wtb.bindHeaderClick(formID, header.attr('child-id'));
		});
	};

	/*
	 * adds a header in for internal record keeping and clones it's section
	 * prepares the section's initial state (removes it if hidden)
	 *
	 * @param formID the element ID of the form
	 * @param header the jquery object of the section's header
	 */
	$.wtb.addFormSection = function (formID, header) {
		var subForm = header.next();
		var sectionID = subForm.attr('id');
	        header.attr('child-hidden', true);
		header.attr('child-id', subForm.attr('id'));

		$.wtb.formSections[formID][sectionID] = subForm;
		$.wtb.formHeaders[formID][sectionID] = header;
		if ($.wtb.isSubFormEmpty(formID, sectionID)) {
			$.wtb.disableSubForm(formID,sectionID);
		} else {
			$.wtb.enableSubForm(formID,sectionID);
		}
	}

		/*
    	 * disables all elements of a sub form and hides it
    	 *
    	 * @param formID the element ID of the form
    	 * @param sectionID the element id of the section in question
    	 */
	$.wtb.disableSubForm = function (formID,sectionID) {
		var header = $.wtb.formHeaders[formID][sectionID];
		var subForm= $.wtb.formSections[formID][sectionID];
		subForm.find('input').attr('disabled',true);
		header.find('img').attr('src','/images/plus.png');
		header.attr('child-hidden', true);
		subForm.hide();
	}
	/*
    	 * re enables a subform
    	 *
    	 * @param formID the element ID of the form
    	 * @param sectionID the element id of the section in question
    	 */
	$.wtb.enableSubForm = function (formID,sectionID) {
		var header = $.wtb.formHeaders[formID][sectionID];
    	var subForm= $.wtb.formSections[formID][sectionID];
		header.attr('child-hidden', false);
		subForm.find('input').removeAttr('disabled');
		header.find('img').attr('src','/images/minus.png')
		subForm.show();
	}

	/*
	 * checks to see if anything in the section is filled out
	 *
	 * @param formID the element ID of the form
	 * @param sectionID the element id of the section in question
	 */
	$.wtb.isSubFormEmpty = function (formID, sectionID) {
		var subForm= $.wtb.formSections[formID][sectionID];
		var result = true;
		subForm.find('input').each(function () {
			if (
				( $(this).is(':checkbox') && $(this).is(':checked')) ||
					( !$(this).is(':checkbox') && $(this).val())
				) {
				$.wtb.flashElement($(this));
				result = false;
			}
		});
		return result;
	}

	/*
	 * animates an element to show it is filled out
	 *
	 * @param element the jquery element to be flashed
	 */
	$.wtb.flashElement = function (element) {
		if (element.is(':checkbox')) {
			var defaults = {
				'outline-color': 'rgb(102, 36, 5)',
				'outline-style': 'none' ,
				'outline-width': '0px',
				'opacity':1
			}
			var alert = {
				'outline-color': 'red',
				'outline-style': 'solid',
				'outline-width': 'thin',
				'opacity':1
			}

			element
				.stop(true, true)
				.css(defaults)
				.css(alert);
			element.fadeOut('250', 'swing').fadeIn('250', 'swing').fadeOut('250', 'swing').fadeIn('250', 'swing').css(defaults);
			element.css(defaults);
		} else {
			var defaults = {
				'border-color': "rgb(153, 153, 153)",
            	'background-color':'rgb(255, 255, 255)',
				'opacity':1
			};
			var alert = {
				'border-color': "red",
				'background-color':'#E9967A'
			};
			var borderColor = element.css('border-color');
			var backgroundColor = element.css('background-color');
			element.stop(true, true)
				.animate(alert, '250')
				.animate(defaults, '250')
				.animate(alert, '250')
				.animate(defaults, '250');
		}

	}

	/*
	 * rebinds the header click action to the section
	 *
	 * @param formID the element ID of the form
	 * @param sectionID the element id of the section in question
	 */
	$.wtb.bindHeaderClick = function (formID, sectionID) {
		var header = $.wtb.formHeaders[formID][sectionID];
    	var subForm= $.wtb.formSections[formID][sectionID];
		var header = $.wtb.form[formID].find('.CTRL_TYPE_DIV[child-id="' + sectionID + '"]');
		header.find('.CTRL_TYPE_DIVLINK').removeAttr('onmousedown');
		header.click(function () {
			if (header.attr('child-hidden') == 'true') {
            	$.wtb.enableSubForm(formID,sectionID);
			} else {
				if (!$.wtb.isSubFormEmpty(formID, sectionID)) {
					return;
				}
				$.wtb.disableSubForm(formID,sectionID);
			}
		})

	}

})(jQuery);
