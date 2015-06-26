/**
 * Created by mmorales on 5/19/15.
 * Jquery plugin to remove items out of the over sized forms in new jersey
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
		'Trollbloods': {},
		'Circle': {},
		'Skorne': {},
		'Legion': {},
		'Minions': {}
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
