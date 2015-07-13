/**
 * Created by mmorales on 6/26/15.
 * Jquery plugin to handle who's the boss events
 */
(function ($) {
	//Model Declaration in the jQuery NameSpace
	$.wtb = {};
	//The location the widget will be drawn in the dom
	$.wtb.target = null;
	//The location the images are stored
	$.wtb.imagePath = '/images';
	//Additional Options
	$.wtb.advancedOptions = {};
	//player list for the Tourney
	$.wtb.players = new Array();
	//factions available to play
	$.wtb.factions = {};
	//defined z index for the roulette;
	$.wtb.translateZ = '250px';
	$.wtb.rolling = false;
	/**
	 * Faction Object Declaration
	 * @param string factionName The factions's name
	 */
	$.wtb.faction = function (factionName) {
		this.name = factionName;//faction name
		this.casters = {};//all casters
		this.casterCount = 0;//the caster currently given to them
		this.availableCasterCount = 0;//the caster currently given to them
		this.imageName = factionName.toLowerCase() + '.png';
		/**
		 *
		 */
		this.addCaster = function (caster) {
			this.casters[caster.name] = caster;
			caster.position = this.casterCount;
			this.casterCount++;
			this.availableCasterCount++;
		}
		/**
		 * get a specified caster
		 * @param string casterName the caster's name you are looking for
		 * @throws Exception could not find caster
		 * @return Caster()
		 */
		this.getCaster = function (casterName) {
			for (var i in this.casters) {
				var caster = this.casters[i];
				if (caster.name == casterName) {
					return caster;
				}
			}
			throw "Could not find player: " + casterName;
		}

		/**
		 * claims a caster from a faction for a player
		 * @param Caster caster caster object claimed
		 * @param Player player Player object claiming
		 */
		this.claimCaster = function (caster, player) {
			if (caster.faction != this) {
				throw  "This caster doesn't belong to this faction";
			}
			if (player.caster) {
				var oldFaction = player.caster.faction;
				player.caster.release();
				$.wtb.populateFactionRoulette(oldFaction);
			}
			this.availableCasterCount--;
			caster.player = player;
			player.caster = caster;
			$.wtb.populateFactionRoulette(caster.faction);
		}
		/**
		 * release a caster from a faction for a player
		 * @param Caster caster caster object claimed
		 */
		this.releaseCaster = function (caster) {
			if (caster.faction != this) {
				throw  "This caster doesn't belong to this faction";
			}
			if (caster.player) {
				player = caster.player;
				player.caster = null;
				this.availableCasterCount++;
			}
			caster.player = null;
			;
		}

		/**
		 * Gets this factions image path
		 * @return string path the the casters image
		 */
		this.getImagePath = function () {
			return $.wtb.imagePath + '/' + this.imageName;
		}

		/**
		 * Creates a jquery object for a dom element image
		 * @return $(DOM) image of caster
		 */
		this.getLogo = function () {
			var image = $('<img src="' + this.getImagePath() + '">');
			return image;
		}

		/**
		 * is this faction available
		 * @param string faction name the faction
		 * @return Array<String> faction names
		 */
		this.isAvailable = function (faction) {
			if (this.availableCasterCount > 0) {
				return true;
			}
			return false;
		}

		/**
		 * get a list of faction's casters that have not been claimed
		 * @return {Caster()} list of casters
		 */
		this.getAvailableCasters = function () {
			var casters = this.casters;
			var available = [];
			for (var casterName in casters) {
				caster = casters[casterName];
				if (!caster.player) {
					available.push(caster);
				}
			}
			return available;
		}

	}

	/**
	 * Player Object Declaration
	 * @param string playerName The player's name
	 * @param Faction() faction the faction this player is playing
	 */
	$.wtb.player = function (playerName, faction) {
		this.name = playerName;//player name
		this.faction = faction;//faction name they play
		this.caster = null;//the caster currently given to them
		this.previousCasters = [];
		this.doubleCrosses = 0;
		this.emergencyRespins = 0;
		/*
		 * releases the players caster if he has one
		 */
		this.releaseCaster = function () {
			if (this.caster) {
				this.caster.release();
			}
		}
		/*
		 * Builds this players name tag
		 */
		this.buildNameTag = function () {
			var tag = $("<div class='wtb-player-nameplate " + this.faction.name.toLowerCase() + "'  data-player-name='" + this.name + "'>");

			var factionLogo = $('<div class="faction-icon"><img src="' + this.faction.getImagePath() + '"></div>');
			tag.append(factionLogo);

			var namePlate = $('<div class="name-plate-names">');
			namePlate.append('<span style="font-weight:bold;text-decoration:underline;">Name:</span><BR>');
			namePlate.append('<span>' + this.name + '</span><BR>');
			if (this.caster) {
				namePlate.append('<span style="font-weight:bold;text-decoration:underline;margin-top:3px;">Caster:</span><BR>');
				var casterNameSpan = $('<span>');
				var casterFactionLogo = this.caster.faction.getLogo();
				casterFactionLogo.css('height', '20px');
				casterNameSpan.append(casterFactionLogo);
				casterNameSpan.append('<span>&nbsp;' + this.caster.name + '</span>');
				namePlate.append(casterNameSpan);
			} else {
				var rollLink = $('<a class="wtb-name-plate-roll-for-caster" href="' + this.name + '"><img src="/images/roll.svg"></a>');
				rollLink.click(function (event) {
					event.preventDefault();
					var player = $.wtb.getPlayer($(this).attr('href'));
					$.wtb.assignPlayerARandomCaster(player);
				});
				namePlate.append(rollLink);
				$.wtb.addTip("Roll for a random caster!", rollLink, {
					position: {
						my: "left center",
						at: "right center+35"
					}
				});


			}
			tag.append(namePlate);


			var iconPlate = $('<div class="icons-name-plate">');

			var deleteLink = $('<a class="wtb-name-plate-delete" href="' + this.name + '">[X]</a>');
			$.wtb.addTip("Click here to delete this player.", deleteLink, {
				position: {
					my: "left+15 bottom",
					at: "right top"
				}
			});

			deleteLink.click(function (event) {
				event.preventDefault();
				var player = $.wtb.getPlayer($(this).attr('href'));
				$.wtb.deletePlayer(player);
			});
			iconPlate.append(deleteLink);
			iconPlate.append('<BR>');
			iconPlate.append('<BR>');
			iconPlate.append('<BR>');

			var respinText = '<span class="wtb-name-plate-emergency-respin">' + this.emergencyRespins + ' x <img src="/images/jackpot/Emergency Respin.png"></span>'
			if (this.emergencyRespins < 1) {
				var span = $(respinText);
				$.wtb.addTip("Click here to use an emergency respin", span, {
					position: {
						my: "left+15 center",
						at: "right center"
					}
				});
				iconPlate.append(span);
			} else {
				var respinLink = $('<a class="wtb-name-plate-emergency-respin-link" href="' + this.name + '">' + respinText + '</a>');
				respinLink.click(function (event) {
					event.preventDefault();
					var player = $.wtb.getPlayer($(this).attr('href'));

					player.emergencyRespins--;
					$.wtb.assignPlayerARandomCaster(player);
				});
				iconPlate.append(respinLink);
				$.wtb.addTip("Click here to use an emergency respin.", respinLink, {
					position: {
						my: "left+15 center",
						at: "right center"
					}
				});
			}
			iconPlate.append('<BR>');
			iconPlate.append('<BR>');
			iconPlate.append('<BR>');

			var doubleCrossText = '<span class="wtb-name-plate-double-cross">' + this.doubleCrosses + ' x <img src="/images/jackpot/Double Cross.png"></span>'
			if (this.doubleCrosses < 1) {
				var span = $(doubleCrossText);
				$.wtb.addTip("Click here to double cross a player and switch casters", span, {
					position: {
						my: "left+15 top",
						at: "right bottom"
					}
				});
				iconPlate.append(span);
			} else {
				var doubleCrossLink = $('<a class="wtb-name-plate-double-cross-link" href="' + this.name + '">' + doubleCrossText + '</a>');
				doubleCrossLink.click(function (event) {
					event.preventDefault();
					var player = $.wtb.getPlayer($(this).attr('href'));

					$.wtb.selectDoubleCross(player);
				});
				iconPlate.append(doubleCrossLink);
				$.wtb.addTip("Click here to double cross a player and switch casters!.", doubleCrossLink, {
					position: {
						my: "left+15 top",
						at: "right bottom"
					}
				});

			}


			tag.append(iconPlate);

			return tag;
		}
	}

	/**
	 * Caster Object Declaration
	 * @param string casterName The caster's name
	 * @param Faction() faction the faction this player is playing
	 */
	$.wtb.caster = function (casterName, faction, imageName) {
		this.name = casterName;//casters name
		this.faction = faction;//faction model
		this.position = null;//casters position in the faction listing. accessibility variable
		this.player = null; //who has claimed this
		this.imageName = imageName || casterName + '.png';//actual name of the image
		faction.addCaster(this);

		/**
		 * Gets this casters image path
		 * @return string path the the casters image
		 */
		this.getImagePath = function () {
			return $.wtb.imagePath + '/' + this.faction.name.toLowerCase() + '/' + this.imageName;
		}

		/**
		 * Creates a jquery object for a dom element image
		 * @return $(DOM) image of caster
		 */
		this.getImage = function () {
			var image = $('<img src="' + this.getImagePath() + '">');
			return image;
		}
		/**
		 * Claims the caster for a player
		 * @param Player player person claiming this caster
		 * @return void
		 */
		this.claim = function (player) {
			this.faction.claimCaster(this, player);
		}
		/**
		 * release the claim on this caster
		 * @return void
		 */
		this.release = function () {
			this.faction.releaseCaster(this);
		}
	}

	/**
	 * Add a caster to a faction
	 * @param string casterName name of the caster
	 * @param string faction name of the caster's faction
	 */
	$.wtb.addCaster = function (casterName, factionName) {
		if (!$.wtb.factions[factionName]) {
			faction = new $.wtb.faction(factionName);
			$.wtb.factions[factionName] = faction;
		}
		var faction = $.wtb.factions[factionName];
		var caster = new $.wtb.caster(casterName, faction);
	}

	/**
	 * Add a player to the tournement
	 * @param string name name of the player
	 * @param string faction name of the players faction
	 * @return Player() player object added
	 */
	$.wtb.addPlayer = function (name, faction) {
		var player = new $.wtb.player(name, faction);
		$.wtb.players.push(player);
		return player;
	}

	/**
	 * get all players in the tournament
	 * @return Array[Player()]
	 */
	$.wtb.getPlayers = function () {
		return $.wtb.players;
	}

	/**
	 * get a specified player
	 * @param string playerName the players name you are looking for
	 * @return Array[Player()]
	 */
	$.wtb.getPlayer = function (playerName) {
		for (var i in $.wtb.players) {
			var player = $.wtb.players[i];
			if (player.name == playerName) {
				return player;
			}
		}
		throw "Could not find player: " + playerName;
	}


	/**
	 * delete a specified player
	 * @param player() player the player you are looking to delete
	 * @return Array[Player()]
	 */
	$.wtb.deletePlayer = function (player) {
		var newPlayers = [];
		var faction = null;
		if (player.caster) {
			faction = player.caster.faction;
			player.caster.release();
		}
		for (
			var i = 0;
			i < $.wtb.players.length;
			i++
		) {
			if (player.name != $.wtb.players[i].name) {
				newPlayers.push($.wtb.players[i]);
			}
		}
		$.wtb.players = newPlayers;
		if (faction) {
			$.wtb.populateFactionRoulette(faction);
		}
		$.wtb.buildNamePlates();
	}


	/**
	 * crosser double crosses crossee
	 * @param player() crosser the player doing the double cross
	 * @param player() crossee the player being double crossed
	 */
	$.wtb.doubleCross = function (crosser, crossee) {
		if ($.wtb.rolling) {
			return;
		}
		var temp = crosser.caster;
		if (crosser.doubleCrosses < 1) {
			throw "The double crosser has no double crosses to spend.";
		}
		crosser.doubleCrosses--;
		crosser.caster = crossee.caster;
		crossee.caster = temp;
		$.wtb.buildNamePlates();
	}


	/**
	 * get a list of all factions
	 * @param string exclude faction name to not be included in the list
	 * @return Array<String> faction names
	 */
	$.wtb.getFactions = function (exclude) {
		exclude = exclude || null;
		var factions = [];
		for (var factionName in $.wtb.factions) {
			var faction = $.wtb.factions[factionName];
			if (faction.name != exclude) {
				factions.push(faction);
			}
		}
		return factions;
	}

	/**
	 * get a list of all factions that have casters to claim
	 * @param string exclude faction name to not be included in the list
	 * @return Array<String> faction names
	 */
	$.wtb.getAvailableFactions = function (exclude) {
		exclude = exclude || null;
		var factions = [];
		for (var factionName in $.wtb.factions) {
			var faction = $.wtb.factions[factionName];
			if (faction.name != exclude && faction.isAvailable()) {
				factions.push(faction);
			}
		}
		return factions;
	}


	/**
	 * get a list of faction's casters
	 * @param string faction name the faction
	 * @return {Caster()} list of casters
	 */
	$.wtb.getFactionsCasters = function (factionName) {
		return faction.casters;
	}

	/**
	 * clears all references to claimed casters
	 */
	$.wtb.clearClaimed = function (caster, player) {
		if ($.wtb.rolling) {
			return;
		}
		for (var factionName in $.wtb.factions) {
			faction = $.wtb.factions[factionName];
			var casters = faction.casters;
			for (var casterName in casters) {
				faction.casters[casterName].release();
			}
		}
	}

	/**
	 * Creates a header bar with all of the factions logos
	 */
	$.wtb.buildFactionHeader = function () {
		var factions = $.wtb.getFactions();
		var header = $("<div class='wtb-header'>");
		for (var i in factions) {
			var faction = factions[i];
			var panel = $('<div class="wtb-panel">');
			panel.addClass(faction.name.toLowerCase());
			panel.append(faction.getLogo());
			header.append(panel);
		}
		$.wtb.target.append(header);
	}


	/**
	 * Creates a roulette container for each faction
	 */
	$.wtb.buildRouletteContainer = function () {
		var factions = $.wtb.getFactions();
		var outerContainer = $("<div class='wtb-roulette-container'>");
		$.wtb.target.append(outerContainer);
		var container = $("<div class='wtb-rotate'>");
		outerContainer.append(container);
		for (var i in factions) {
			var faction = factions[i];
			var roulette = $('<div class="wtb-roulette">');
			roulette.addClass(faction.name);
			container.append(roulette);
			$.wtb.populateFactionRoulette(faction);
		}
	}

	/**
	 * build faction select
	 * @param bool includeBankrupt include bankrupt as an option
	 * @return $('<SELECT>') Jquery Dom Option for a select control
	 */
	$.wtb.buildFactionSelect = function (includeBankrupt) {
		var factionSelect = $("<select name='wtb-player-faction'>");
		var factions = $.wtb.getFactions();
		factionSelect.append('<option value=""></option>')
		for (var i in factions) {
			var faction = factions[i];
			if (faction.name == 'Bankrupt' && !includeBankrupt) {
				continue;
			}
			if (faction.name == 'Jackpot') {
				continue;
			}
			factionSelect.append('<option value="' + faction.name + '">' + faction.name + '</option>')
		}
		return factionSelect;
	}


	/**
	 * Creates a menu
	 */
	$.wtb.buildMenu = function () {
		var menu = $("<div id='wtb-menu' class='wtb-menu'></div>");

		var addPlayerMenuItem = $("<img class='wtb-add-player' width='90px'  src='/images/add_player.png'>");
		addPlayerMenuItem.click(function () {
			$.wtb.buildPlayerForm();
		});
		menu.append(addPlayerMenuItem);

		var assignPlayerMenuItem = $("<img class='wtb-assign-player' width='90px'  src='/images/assign_player.png'>");
		assignPlayerMenuItem.click(function () {
			$.wtb.selectCaster('Assign a Player a Caster');
		});
		menu.append(assignPlayerMenuItem);

		var clear = $("<img width='90px'  class='wtb-clear' src='/images/clear.png'>");
		clear.click(function (event) {
			event.preventDefault();
			$.wtb.clearClaimed()
			$.wtb.buildNamePlates();
		});
		menu.append(clear);

		$.wtb.target.append(menu);


		var menuIcon = $("<div id='wtb-menu-toggle' class='wtb-menu-toggle'><img height='32px'  src='/images/fav_icon.png'></div>");
		menuIcon.click(function () {
			if (menu.attr('rendered') == "true") {
				menu.animate({
					width: '0px',
					left: '+=100',
					opacity: '0'

				});
				$(this).animate({
					'margin-right': '-8px',
					left: '+=100',
					opacity: '0.3'
				});
				menu.attr('rendered', "false");
			} else {
				$('#wtb-menu').animate({
					width: '100px',
					left: '-=100',
					opacity: '1'
				});
				$(this).animate({
					'margin-right': '0px',
					left: '-=100',
					opacity: '1'
				});
				menu.attr('rendered', "true");
			}
		});
		$.wtb.target.append(menuIcon);

		$.wtb.addTip("Click here to get started!", menuIcon, {disabled: false});
		$.wtb.addTip("Click here for help.", $("#wtb-help"), {
			disabled: false,
			position: {my: "left+15 top", at: "right bottom"}
		});
		$.wtb.addTip("Add a new player to the tournament.", addPlayerMenuItem);
		$.wtb.addTip("Assign a player a caster.", assignPlayerMenuItem);
		$.wtb.addTip("Clear all assigned casters.", clear);
		menuIcon.tooltip("open");
		$("#wtb-help").tooltip("open");
	}


	/**
	 * adds a tool tip to an element
	 * @param string tip the tool tip
	 * @param $(<>) target the item getting the tool tip
	 * @param {} userOptions additional options
	 */
	$.wtb.addTip = function (tip, target, userOptions) {
		userOptions = userOptions || {};
		var baseOptions = {
			position: {my: "right-15 center", at: "left center"},
			//disabled:true,
			open: function (event, ui) {
				var element = $(this);
				setTimeout(function () {
					element.tooltip("close");
				}, 3000);
			}
		};
		var options = $.extend({}, baseOptions, userOptions);
		target.attr('title', tip);
		target.tooltip(options);
	}

	/**
	 * Shows added visable tooltips
	 * @param string tip the tool tip
	 * @param $(<>) target the item getting the tool tip
	 * @param {} userOptions additional options
	 */
	$.wtb.showTips = function () {
		$("#wtb-menu-toggle").tooltip("open");
		$('#wtb-menu[rendered="true"] .wtb-add-player').tooltip("open");
		$('#wtb-menu[rendered="true"] .wtb-assign-player').tooltip("open");
		$('#wtb-menu[rendered="true"] .wtb-clear').tooltip("open");

		$($('.wtb-name-plate-roll-for-caster')[0]).tooltip("open");
		$($('.wtb-name-plate-delete')[0]).tooltip("open");
		$($('.wtb-name-plate-double-cross')[0]).tooltip("open");
		$($('.wtb-name-plate-emergency-respin')[0]).tooltip("open");

	}

	/**
	 * Creates a form to add new players
	 */
	$.wtb.buildPlayerForm = function () {
		if ($.wtb.rolling) {
			return;
		}
		var dialog = $("<div class='wtb-player-form-container'>");

		var form = $("<form class='wtb-player-form-container'>");

		form.append('<div style="width:60px;text-align:right">Name:&nbsp;</div>');
		var nameInput = $("<input name='wtb-player-name'>");
		nameInput.css('margin-left', '60px');
		form.append(nameInput);

		form.append('<div style="width:60px;text-align:right">Faction:&nbsp;</div>');
		var factionSelect = $.wtb.buildFactionSelect(false);
		factionSelect.css('margin-left', '60px');
		form.append(factionSelect);

		form.append('<BR><BR>');

		var submit = $("<input type='submit' name='wtb-submit' value='Add'>");
		submit.css('margin-left', '60px');
		form.append(submit);

		form.submit(function (event) {
			event.preventDefault();
			if ($.wtb.validatePlayerForm(form)) {
				$.wtb.handlePlayerFormSubmit(form);
			}
		});

		dialog.append(form);
		dialog.dialog({
			modal: true,
			draggable: false,
			resizable: true,
			title: "Add a New Player",
			width: 270
		});
	}

	/**
	 * Creates a area to add player tags
	 */
	$.wtb.buildTagArea = function () {
		var container = $("<div class='wtb-player-tag-container'></div>");
		$.wtb.target.append(container);
	}

	/**
	 * add a player tag
	 */
	$.wtb.buildNamePlates = function () {
		var container = $(".wtb-player-tag-container");
		container.html('');
		for (var i in $.wtb.players) {
			var player = $.wtb.players[i];
			var tag = player.buildNameTag();
			container.append(tag);
		}
	}

	/**
	 * handles form submits
	 * @param $(form) player form of this widget
	 */
	$.wtb.handlePlayerFormSubmit = function (form) {
		var name = form.find('input[name="wtb-player-name"]').val();
		var factionName = form.find('select[name="wtb-player-faction"]').val();
		var player = $.wtb.addPlayer(name, $.wtb.getFaction(factionName));

		form.find('input[name="wtb-player-name"]').removeClass('ui-state-error').val('');
		form.find('select[name="wtb-player-faction"]').removeClass('ui-state-error').val('');


		$.wtb.buildNamePlates();
		return player;
	}
	/**
	 * validates the player form
	 * @param $(form) player form of this widget
	 */
	$.wtb.validatePlayerForm = function (form) {
		var passed = true;
		var name = form.find('input[name="wtb-player-name"]').val();
		var faction = form.find('select[name="wtb-player-faction"]').val();
		if (!name) {
			form.find('input[name="wtb-player-name"]').addClass('ui-state-error');
			passed = false;
		}
		if (!faction) {
			form.find('select[name="wtb-player-faction"]').addClass('ui-state-error');
			passed = false;
		}
		return passed;
	}


	/**
	 * Grabs the faction object of a specified name
	 * @throws Exception can't find faction
	 * @param string factionName faction we are looking for
	 */
	$.wtb.getFaction = function (factionName) {
		faction = $.wtb.factions[factionName];
		if (!faction) {
			throw 'can not find the specified faction: ' + factionName;
		}
		return faction;
	}

	/**
	 * Populates a roulette bar with available casters
	 * @param string faction name the faction
	 */
	$.wtb.populateFactionRoulette = function (faction) {
		var roulette = $('.wtb-roulette.' + faction.name);
		roulette.html('');
		var casters = faction.getAvailableCasters();
		var casterCounter = 0;
		var angle = 360 / casters.length;
		for (casterName in casters) {
			var caster = casters[casterName];
			var imageContainer = $('<div class="wtb-caster-container">');
			imageContainer.attr('style', "-webkit-transform: rotateX(" + casterCounter * angle + "deg) translateZ(" + $.wtb.translateZ + ");");
			imageContainer.append(caster.getImage())
			roulette.append(imageContainer);
			casterCounter++;
		}
	}

	/**
	 * Populates a roulette bar with available casters
	 * @param Player player player to get a random caster
	 */
	$.wtb.assignPlayerARandomCaster = function (player, faction) {
		if ($.wtb.rolling) {
			return;
		} else {
			$.wtb.rolling = true;
		}
		if (!faction) {
			var factions = $.wtb.getAvailableFactions(player.faction.name);
			var selection = Math.floor((Math.random() * factions.length));
			faction = factions[selection];
		}
		caster = $.wtb.pullCasterForFaction(faction, player);
	}


	/**
	 * randomly picks a caster from a faction that is available
	 * @param faction faction faction pulling from
	 * @param Player player player to get a random caster
	 * @return object
	 */
	$.wtb.pullCasterForFaction = function (faction, player) {
		var roulette = $('.wtb-roulette.' + faction.name);
		if (roulette.hasClass('wtb-spinning')) {
			return;
		}
		var casters = faction.getAvailableCasters();
		var selection = Math.floor((Math.random() * casters.length));
		var increment = 360 / casters.length;
		var caster = casters[selection];
		var angle = increment * selection;

		$.wtb.spinFactionsRoulette(faction, angle, caster, player);
		return caster;
	}

	/**
	 * animate faction roulette
	 * @param string faction name the faction
	 * @param integer degrees how far to rotate
	 * @param int select which caster (starting at 0) should be at the front
	 * @param Caster() caster object selected
	 * @param Player() player object spinning
	 */
	$.wtb.spinFactionsRoulette = function (faction, angle, caster, player) {
		var caster = caster;
		var roulette = $('.wtb-roulette.' + faction.name);
		$.wtb.changeSpinRule(angle);
		roulette.removeClass('wtb-spinner').addClass('wtb-spinner');
		window.setTimeout(function () {
			roulette.removeClass('wtb-spinner');
			roulette.removeClass('wtb-spinning');
			$.wtb.updateRouletteAngles(faction, caster.position);
			$.wtb.confirmCasterSelection(caster, player);
		}, 4000);
	}
	/**
	 * confirm box for the selection
	 * @param Caster() caster object selected
	 * @param Player() player object spinning
	 */
	$.wtb.confirmCasterSelection = function (caster, player) {

		var dialog = $('<div class="wtb-award-box">');
		var logo = caster.faction.getLogo();
		logo.css('float', 'left');
		logo.css('width', '120px');
		dialog.append(logo);
		dialog.append(
			'<div style="margin:5px;width:200px;text-align:center; font-size:1.2em;float:left">' + player.name +
			'<BR><BR><span style="font-size:0.8em">pulled</span><BR><BR>' + caster.name + '</div>'
		);
		var portrait = caster.getImage();
		dialog.append(portrait);
		portrait.css('float', 'right');
		portrait.css('width', '120px');
		dialog.dialog({
			modal: true,
			draggable: false,
			resizable: false,
			title: "Caster Awarded!!!",
			closeOnEscape: false,
			open: function (event, ui) {
				$(".ui-dialog-titlebar-close", ui.dialog || ui).hide();
			},
			width: 500,
			buttons: [
				{
					text: "Ok",
					click: function () {
						if (caster.faction.name == 'Jackpot') {
							$.wtb.resolveJackpot(caster, player);
						} else {
							caster.claim(player);
						}
						$.wtb.populateFactionRoulette(caster.faction);
						$.wtb.buildNamePlates();
						$(this).dialog("close");
						$(this).remove();
						$.wtb.rolling = false;
					}
				},
				{
					text: "Cancel",
					click: function () {
						$(this).dialog("close");
						$(this).remove();
						$.wtb.rolling = false;
						$.wtb.populateFactionRoulette(caster.faction);
					}
				}
			]
		});

	}

	/**
	 * handles awarding jackpot
	 * @param Caster() caster object selected
	 * @param Player() player object spinning
	 */
	$.wtb.resolveJackpot = function (caster, player) {
		if (caster.name == 'Emergency Respin') {
			player.emergencyRespins++;
		} else if (caster.name == 'Double Cross') {
			player.doubleCrosses++;
		} else {
			$.wtb.selectCaster(caster.name, player);
		}
	}


	/**
	 * builds and displays the dialog to allow a player to select his caster
	 * @param Caster() caster object selected
	 * @param Player() player object spinning
	 */
	$.wtb.selectCaster = function (dialogTitle, player) {
		if ($.wtb.rolling) {
			return;
		}
		var dialog = $('<div id="wtb-caster-picker-dialog">')

		var form = $('<form name="ChooseACaster">');
		if (player) {
			form.append('<input type="HIDDEN" name="wtb-player-name" value="' + player.name + '">');
		} else {
			var playerSelect = $.wtb.buildPlayerSelect();
			form.append('<div style="width:120px;text-align:right">Player:&nbsp;</div>');
			playerSelect.css('margin-left', '120px');
			form.append(playerSelect);
		}
		var factionSelect = $.wtb.buildFactionSelect(true);
		form.append('<div style="width:120px;text-align:right">Faction:&nbsp;</div>');
		factionSelect.css('margin-left', '120px');
		form.append(factionSelect);
		form.append('<div style="width:120px;text-align:right">Caster:&nbsp;</div>');
		form.append('<select style="margin-left:120px" name="wtb-caster">');
		form.append('<div style="display: inline;width:120px;text-align:right">&nbsp;</div>');
		var submit = $("<input type='submit' name='wtb-select' value='Select'>");
		form.append('<BR><BR>');
		submit.css('margin-left', '120px');
		form.append(submit);
		factionSelect.change(function (event) {
			casterSelect = $(this).parent().find('select[name="wtb-caster"]');
			casterSelect.html('');
			var factionName = $(this).val();
			if (!factionName) {
				return;
			}
			faction = $.wtb.factions[factionName];
			casters = faction.getAvailableCasters();
			for (var i in casters) {
				var caster = casters[i];
				var option = $('<option value="' + caster.name + '">' + caster.name + '</option>');
				casterSelect.append(option);
			}

		});

		form.submit(function (event) {
			event.preventDefault();
			factionName = $(this).find('select[name="wtb-player-faction"]').val();
			casterName = $(this).find('select[name="wtb-caster"]').val();
			playerName = $(this).find('[name="wtb-player-name"]').val();
			player = $.wtb.getPlayer(playerName);

			//XXX
			if (!casterName) {
				player.releaseCaster();
			} else {
				faction = $.wtb.factions[factionName];
				caster = faction.getCaster(casterName);
				caster.claim(player);
			}
			$.wtb.buildNamePlates();
			dialog.dialog('close');
			dialog.dialog('destroy');
			dialog.remove();
		});

		dialog.append(form);
		dialog.dialog({
			modal: true,
			draggable: false,
			resizable: true,
			title: dialogTitle,
			width: 580
		});
	}

	/**
	 * alters the xspin rule
	 * @param string faction name the faction
	 * @param int frontPosition which caster (starting at 0) should be at the front
	 * @return void
	 */
	$.wtb.updateRouletteAngles = function (faction, frontPosition) {
		var roulette = $('.wtb-roulette.' + faction.name);
		var i = 0;
		var casters = faction.getAvailableCasters();
		var increment = 360 / casters.length;
		roulette.find('.wtb-caster-container').each(function () {
			var casterPanel = $(this);
			var degrees = (i - frontPosition) * increment;
			casterPanel.css({'-webkit-transform': 'rotateX(' + degrees + 'deg) translateZ(' + $.wtb.translateZ + ')'});
			i++;
		});
	}


	/**
	 * search the CSSOM for a specific -webkit-keyframe rule
	 * @param string rule name of the transform rule in question
	 * @return obj css rule object, null if not present
	 */
	$.wtb.findKeyframesRule = function (rule) {
		// gather all stylesheets into an array
		var styleSheets = document.styleSheets;

		// loop through the stylesheets
		for (var i = 0; i < styleSheets.length; ++i) {
			// loop through all the rules
			for (var j = 0; j < styleSheets[i].cssRules.length; ++j) {
				// find the -webkit-keyframe rule whose name matches our passed over parameter and return that rule
				if (styleSheets[i].cssRules[j].type == window.CSSRule.WEBKIT_KEYFRAMES_RULE && styleSheets[i].cssRules[j].name == rule) {
					return styleSheets[i].cssRules[j];
				}
			}
		}
		// rule not found
		return null;
	}

	/**
	 * alters the xspin rule
	 * @param int angle, where you want the roulette to stop
	 * @return void
	 */
	$.wtb.changeSpinRule = function (angle) {
		// find our -webkit-keyframe rule
		angle = 360 - angle
		var keyframes = $.wtb.findKeyframesRule('x-spin');

		// remove the existing 0% and 100% rules
		keyframes.deleteRule("0%");
		keyframes.deleteRule("100%");

		// create new 0% and 100% rules with random numbers
		keyframes.appendRule("0% { -webkit-transform: rotateX(720deg); }");//always at least one full spin
		keyframes.appendRule("100% { -webkit-transform: rotateX(" + angle + "deg); }");
	}


	/**
	 * builds a player select control
	 * @param player() exclude a player you don't want in the dropdown
	 * @return $(<Select>)
	 */
	$.wtb.buildPlayerSelect = function (exclude) {
		exclude = exclude || {};
		var playerSelect = $('<select style="margin-left:120px" name="wtb-player-name">');
		for (var i in $.wtb.players) {
			var crossee = $.wtb.players[i];
			if (exclude.name == crossee.name) {
				continue;
			}
			var option = $('<option value="' + crossee.name + '">' + crossee.name + '</option>');
			playerSelect.append(option);
		}
		return playerSelect
	}

	/**
	 * builds and displays the dialog to allow a player to double cross
	 * @param Player() player who is crossing
	 */
	$.wtb.selectDoubleCross = function (player) {
		var dialog = $('<div id="wtb-double-cross-picker-dialog">')

		var form = $('<form name="ChooseAPlayerToDoubleCross">');
		form.append('<input type="HIDDEN" name="wtb-crosser-name" value="' + player.name + '">');

		form.append('<div style="width:120px;text-align:right">Player:&nbsp;</div>');

		form.append($.wtb.buildPlayerSelect(player));

		var submit = $("<input type='submit' name='wtb-select' value='Select'>");
		form.append('<BR><BR>');
		submit.css('margin-left', '120px');
		form.append(submit);
		form.submit(function (event) {
			event.preventDefault();
			crosserName = $(this).find('input[name="wtb-crosser-name"]').val();
			crosseeName = $(this).find('select[name="wtb-player-name"]').val();
			var crosser = $.wtb.getPlayer(crosserName);
			var crossee = $.wtb.getPlayer(crosseeName);
			$.wtb.doubleCross(crosser, crossee);
			$.wtb.buildNamePlates();
			dialog.dialog('close');
			dialog.dialog('destroy');
			dialog.remove();
		});

		dialog.append(form);
		dialog.dialog({
			modal: true,
			draggable: false,
			resizable: true,
			title: "DOUBLE CROSS!!!",
			width: 800
		});
	}

	/*
	 * initializes the wtb plugin, pulls the target, sets up casters
	 */
	$.fn.wtb = function () {
		$.wtb.target = $(this);
		var id = $(this).attr('id');
		if (!id) {
			id = 'wtb-container';
			$(this).attr('id', id);
		}
		//Cygnar
		$.wtb.addCaster("Artificer General Nemo & Storm Chaser Adept Caitlin Finch", "Cygnar");
		$.wtb.addCaster("Captain Allister Caine", "Cygnar");
		$.wtb.addCaster("Captain E. Dominic Darius & Halfjacks", "Cygnar");
		$.wtb.addCaster("Captain Jeremiah Kraye", "Cygnar");
		$.wtb.addCaster("Captain Kara Sloan", "Cygnar");
		$.wtb.addCaster("Captain Victoria Haley", "Cygnar");
		$.wtb.addCaster("Commander Adept Nemo", "Cygnar");
		$.wtb.addCaster("Commander Coleman Stryker", "Cygnar");
		$.wtb.addCaster("Constance Blaize, Knight of the Prophet", "Cygnar");
		$.wtb.addCaster("General Adept Nemo", "Cygnar");
		$.wtb.addCaster("Lieutenant Allister Caine", "Cygnar");
		$.wtb.addCaster("Lord Commander Stryker", "Cygnar");
		$.wtb.addCaster("Lord General Coleman Stryker", "Cygnar");
		$.wtb.addCaster("Major Markus 'Siege' Brisbane", "Cygnar");
		$.wtb.addCaster("Major Prime Victoria Haley", "Cygnar");
		$.wtb.addCaster("Major Victoria Haley", "Cygnar");
		//Menoth
		$.wtb.addCaster("Anson Durst, Rock of the Faith", "Menoth");
		$.wtb.addCaster("Feora, Priestess of the Flame", "Menoth");
		$.wtb.addCaster("Feora, Protector of the Flame", "Menoth");
		$.wtb.addCaster("Grand Exemplar Kreoss", "Menoth");
		$.wtb.addCaster("Grand Scrutator Severius", "Menoth");
		$.wtb.addCaster("Hierarch Severius", "Menoth");
		$.wtb.addCaster("High Allegiant Amon Ad-Raza", "Menoth");
		$.wtb.addCaster("High Executioner Servath Reznik", "Menoth");
		$.wtb.addCaster("High Exemplar Kreoss", "Menoth");
		$.wtb.addCaster("Intercessor Kreoss", "Menoth");
		$.wtb.addCaster("Servath Reznik, Wrath of Ages", "Menoth");
		$.wtb.addCaster("Testament of Menoth", "Menoth");
		$.wtb.addCaster("The Harbinger of Menoth", "Menoth");
		$.wtb.addCaster("The High Reclaimer", "Menoth");
		$.wtb.addCaster("Thyra, Flame of Sorrow", "Menoth");
		$.wtb.addCaster("Vice Scrutator Vindictus", "Menoth");
		//Khador
		$.wtb.addCaster("Forward Kommander Sorscha Kratikoff", "Khador");
		$.wtb.addCaster("Karchev the Terrible", "Khador");
		$.wtb.addCaster("Koldun Kommander Aleksandra Zerkova", "Khador");
		$.wtb.addCaster("Koldun Kommander Zerkova", "Khador");
		$.wtb.addCaster("Kommandant Irusk", "Khador");
		$.wtb.addCaster("Kommander Harkevich", "Khador");
		$.wtb.addCaster("Kommander Orsus Zoktavir", "Khador");
		$.wtb.addCaster("Kommander Sorscha", "Khador");
		$.wtb.addCaster("Kommander Strakhov", "Khador");
		$.wtb.addCaster("Kommander Zoktavir, The Butcher Unleashed", "Khador");
		$.wtb.addCaster("Obavnik Kommander Zerkova & Reaver Guard", "Khador");
		$.wtb.addCaster("Old Witch of Khador & Scrapjack", "Khador");
		$.wtb.addCaster("Supreme Kommandant Irusk", "Khador");
		$.wtb.addCaster("The Butcher of Khardov", "Khador");
		$.wtb.addCaster("Vladimir Tzepesci, Great Prince of Umbrey", "Khador");
		$.wtb.addCaster("Vladimir, the Dark Champion", "Khador");
		$.wtb.addCaster("Vladimir, the Dark Prince", "Khador");
		//Cryx
		$.wtb.addCaster("Iron Lich Asphyxious", "Cryx");
		$.wtb.addCaster("Asphyxious the Hellbringer & Vociferon", "Cryx");
		$.wtb.addCaster("Goreshade the Bastard & Deathwalker", "Cryx");
		$.wtb.addCaster("Goreshade the Cursed", "Cryx");
		$.wtb.addCaster("Goreshade, Lord of Ruin", "Cryx");
		$.wtb.addCaster("Lich Lord Asphyxious", "Cryx");
		$.wtb.addCaster("Lich Lord Venethrax", "Cryx");
		$.wtb.addCaster("Lord Exhumator Scaverous", "Cryx");
		$.wtb.addCaster("Pirate Queen Skarre", "Cryx");
		$.wtb.addCaster("Skarre, Queen of the Broken Coast", "Cryx");
		$.wtb.addCaster("Warwitch Deneghra", "Cryx");
		$.wtb.addCaster("Witch Coven of Garlghast & the Egregore", "Cryx");
		$.wtb.addCaster("Wraith Witch Deneghra", "Cryx");
		//Retribution
		$.wtb.addCaster("Adeptis Rahn", "Retribution");
		$.wtb.addCaster("Dawnlord Vyros", "Retribution");
		$.wtb.addCaster("Garryth, Blade of Retribution", "Retribution");
		$.wtb.addCaster("Issyria, Sibyl of Dawn", "Retribution");
		$.wtb.addCaster("Kaelyssa, Night's Whisper", "Retribution");
		$.wtb.addCaster("Lord Arcanist Ossyan", "Retribution");
		$.wtb.addCaster("Ravyn, Eternal Light", "Retribution");
		$.wtb.addCaster("Thyron, Sword of Truth", "Retribution");
		$.wtb.addCaster("Vyros, Incissar of the Dawnguard", "Retribution");
		//Mercenaries
		$.wtb.addCaster("Ashlynn D'Elyse", "Mercenaries");
		$.wtb.addCaster("Captain Bartolo Montador", "Mercenaries");
		$.wtb.addCaster("Captain Damiano", "Mercenaries");
		$.wtb.addCaster("Captain Phinneus Shae", "Mercenaries");
		$.wtb.addCaster("Drake MacBain", "Mercenaries");
		$.wtb.addCaster("Durgen Madhammer", "Mercenaries");
		$.wtb.addCaster("Exulon Thexus", "Mercenaries");
		$.wtb.addCaster("Fiona the Black", "Mercenaries");
		$.wtb.addCaster("General Ossrum", "Mercenaries");
		$.wtb.addCaster("Gorten Grundback", "Mercenaries");
		$.wtb.addCaster("Magnus the Traitor", "Mercenaries");
		$.wtb.addCaster("Magnus the Warlord", "Mercenaries");
		//Convergence
		$.wtb.addCaster("Aurora, Numen of Aerogenesis", "Convergence");
		$.wtb.addCaster("Axis, The Harmonic Enforcer", "Convergence");
		$.wtb.addCaster("Father Lucant, Divinity Architect", "Convergence");
		$.wtb.addCaster("Iron Mother Directrix & Exponent Servitors", "Convergence");
		//Trollbloods
		$.wtb.addCaster("Borka Kegslayer", "Trollbloods");
		$.wtb.addCaster("Borka, Vengeance of the Rimeshaws", "Trollbloods");
		$.wtb.addCaster("Calandra Truthsayer, Oracle of the Glimmerwood", "Trollbloods");
		$.wtb.addCaster("Captain Gunnbjorn", "Trollbloods");
		$.wtb.addCaster("Grim Angus", "Trollbloods");
		$.wtb.addCaster("Grissel Bloodsong", "Trollbloods");
		$.wtb.addCaster("Grissel Bloodsong, Marshal of the Kriels", "Trollbloods");
		$.wtb.addCaster("Hoarluk Doomshaper", "Trollbloods");
		$.wtb.addCaster("Hoarluk Doomshaper, Rage of Dhunia", "Trollbloods");
		$.wtb.addCaster("Hunters Grim", "Trollbloods");
		$.wtb.addCaster("Jarl Skuld, Devil of the Thornwood", "Trollbloods");
		$.wtb.addCaster("Madrak Ironhide", "Trollbloods");
		$.wtb.addCaster("Madrak Ironhide, World Ender", "Trollbloods");
		//Circle
		$.wtb.addCaster("Baldur the Stonecleaver", "Circle");
		$.wtb.addCaster("Baldur the Stonesoul", "Circle");
		$.wtb.addCaster("Bradigus Thorle the Runecarver", "Circle");
		$.wtb.addCaster("Cassius the Oathkeeper & Wurmwood, Tree of Fate", "Circle");
		$.wtb.addCaster("Grayle the Farstrider", "Circle");
		$.wtb.addCaster("Kaya the Moonhunter & Laris", "Circle");
		$.wtb.addCaster("Kaya the Wildborne", "Circle");
		$.wtb.addCaster("Kromac, Champion of the Wurm", "Circle");
		$.wtb.addCaster("Kromac the Ravenous", "Circle");
		$.wtb.addCaster("Krueger the Stormlord", "Circle");
		$.wtb.addCaster("Krueger the Stormwrath", "Circle");
		$.wtb.addCaster("Mohsar the Desertwalker", "Circle");
		$.wtb.addCaster("Morvahna The Autumnblade", "Circle");
		$.wtb.addCaster("Morvahna the Dawnshadow", "Circle");
		//Skorne
		$.wtb.addCaster("Master Ascetic Naaresh", "Skorne");
		$.wtb.addCaster("Archdomina Makeda", "Skorne");
		$.wtb.addCaster("Dominar Rasheth", "Skorne");
		$.wtb.addCaster("Lord Arbiter Hexeris", "Skorne");
		$.wtb.addCaster("Lord Assassin Morghoul", "Skorne");
		$.wtb.addCaster("Lord Tyrant Hexeris", "Skorne");
		$.wtb.addCaster("Makeda & The Exalted Court", "Skorne");
		$.wtb.addCaster("Master Tormentor Morghoul", "Skorne");
		$.wtb.addCaster("Supreme Aptimus Zaal & Kovaas", "Skorne");
		$.wtb.addCaster("Supreme Archdomina Makeda", "Skorne");
		$.wtb.addCaster("Tyrant Xerxis", "Skorne");
		$.wtb.addCaster("Void Seer Mordikaar", "Skorne");
		$.wtb.addCaster("Xerxis, Fury of Halaak", "Skorne");
		$.wtb.addCaster("Zaal, the Ancestral Advocate", "Skorne");
		//Legion
		$.wtb.addCaster("Absylonia, Daughter of Everblight", "Legion");
		$.wtb.addCaster("Absylonia, Terror of Everblight", "Legion");
		$.wtb.addCaster("Bethayne and Belphagor", "Legion");
		$.wtb.addCaster("Kallus, Wrath of Everblight", "Legion");
		$.wtb.addCaster("Lylyth, Herald of Everblight", "Legion");
		$.wtb.addCaster("Lylyth, Reckoning of Everblight", "Legion");
		$.wtb.addCaster("Lylyth, Shadow of Everblight", "Legion");
		$.wtb.addCaster("Rhyas, Sigil of Everblight", "Legion");
		$.wtb.addCaster("Saeryn, Omen of Everblight", "Legion");
		$.wtb.addCaster("Saeryn & Rhyas, Talons of Everblight", "Legion");
		$.wtb.addCaster("Thagrosh the Messiah", "Legion");
		$.wtb.addCaster("Thagrosh, Prophet of Everblight", "Legion");
		$.wtb.addCaster("Vayl, Consul of Everblight", "Legion");
		$.wtb.addCaster("Vayl, Disciple of Everblight", "Legion");
		//Minions
		$.wtb.addCaster("Bloody Barnabas", "Minions");
		$.wtb.addCaster("Calaban the Grave Walker", "Minions");
		$.wtb.addCaster("Dr. Arkadius", "Minions");
		$.wtb.addCaster("Helga the Conquerer", "Minions");
		$.wtb.addCaster("Jaga-Jaga, the Death Charmer", "Minions");
		$.wtb.addCaster("Lord Carver, BMMD, Esq. III", "Minions");
		$.wtb.addCaster("Maelok the Dreadbound", "Minions");
		$.wtb.addCaster("Midas", "Minions");
		$.wtb.addCaster("Rask", "Minions");
		$.wtb.addCaster("Sturm & Drang", "Minions");
		//Bankrupt
		$.wtb.addCaster("Brun Cragback & Lug", "Bankrupt");
		$.wtb.addCaster("Dahlia Hallyr & Skarath", "Bankrupt");
		$.wtb.addCaster("Rorsh & Brine", "Bankrupt");
		$.wtb.addCaster("Wrong Eye & Snapjaw", "Bankrupt");
		$.wtb.addCaster("Beast Mistress", "Bankrupt");
		$.wtb.addCaster("Tyrant Zaadesh", "Bankrupt");
		$.wtb.addCaster("Una the Falconer", "Bankrupt");
		$.wtb.addCaster("Horgle Ironstrike", "Bankrupt");
		$.wtb.addCaster("Journeyman Warcaster", "Bankrupt");
		$.wtb.addCaster("Lieutenant Allison Jakes", "Bankrupt");
		$.wtb.addCaster("Initiate Tristan Durant", "Bankrupt");
		$.wtb.addCaster("Kovnik Andrei Malakov", "Bankrupt");
		$.wtb.addCaster("Aiakos, Scourge of the Meredius", "Bankrupt");
		$.wtb.addCaster("Elara, Tyro of the Third Chamber", "Bankrupt");
		$.wtb.addCaster("Gastone Crosse", "Bankrupt");
		//Jackpot
		$.wtb.addCaster("Dealer's Choice", "Jackpot");
		$.wtb.addCaster("Emergency Respin", "Jackpot");
		$.wtb.addCaster("Player's Choice", "Jackpot");
		$.wtb.addCaster("Double Cross", "Jackpot");


		var help = $("<div id='wtb-help' style='padding:3px;font-size:1.2em;z-index:20;color:white; position:absolute; top 5; left 5'>[?]</div>");
		help.click(function () {
			$.wtb.showTips();
		});
		$.wtb.target.append(help);
		$.wtb.buildFactionHeader();
		$.wtb.buildRouletteContainer();
		$.wtb.buildMenu();
		$.wtb.buildTagArea();
	};

})(jQuery);
