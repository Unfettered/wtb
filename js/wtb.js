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
		'Minions': {},
		'Bankrupt':{}
	};
	//defined z index for the roulette;
	$.wtb.translateZ='250px';
	/**
	 * Player Object Declaration
	*/
	$.wtb.player = function () {
        this.name = "";//player name
        this.faction = "";//faction name they play
        this.caster = null;//the caster currently given to them
        this.previousCasters = [];
	}

	/**
	 * Caster Object Declaration
	*/
	$.wtb.caster = function () {
        this.name = "";//casters name
        this.faction = "";//faction name
        this.claimed = 0;//has someone claimed them

        /**
         * Gets this casters image path
         * @return string path the the casters image
        */
        this.getImagePath = function(){
            return $.wtb.imagePath+'/'+this.faction.toLowerCase()+'/'+this.name+'.png';
        }

        /**
         * Creates a jquery object for a dom element image
         * @return $(DOM) image of caster
        */
        this.getImage = function(){
            var image = $('<img src="'+this.getImagePath()+'">');
            return image;
        }
    }

	/**
	* Add a caster to a faction
	* @param string casterName name of the caster
	* @param string faction name of the caster's faction
	*/
    $.wtb.addCaster = function (casterName,faction){
        var caster = new $.wtb.caster;
        caster.faction = faction;
        caster.name = casterName;
        $.wtb.factions[faction][casterName] =caster;
    }

	/**
	* Add a player to the tournement
	* @param string name name of the player
	* @param string faction name of the players faction
	* @return Player() player object added
	*/
	$.wtb.addPlayer = function (name, faction) {
        var player = new $.wtb.player;
        player.faction = faction;
        player.name = name;
        $.wtb.players.push(player);
        return player;
    }

	/**
    	* get all players in the tournament
    	* @return Array[Player()]
    	*/
	$.wtb.getPlayers = function(){
		return $.wtb.players;
	}

	/**
	* get a faction's logo image
	* @param string faction name the faction
	* @return $(<img>) faction logo
	*/
	$.wtb.getFactionLogo = function(faction){
		var src = $.wtb.imagePath+'/'+faction.toLowerCase()+'.png';
        var image = $('<img src="'+src+'">');
        return image;
	}

	/**
	* get a list of all factions
	* @param string exclude faction name to not be included in the list
	* @return Array<String> faction names
	*/
	$.wtb.getFactions = function(exclude){
		exclude = exclude || null;
		var factions = [];
		for (var faction in $.wtb.factions) {
            if ($.wtb.factions.hasOwnProperty(faction) && faction != exclude) {
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
	$.wtb.getFactionsCasters = function (faction){
		return $.wtb.factions[faction];
	}

	/**
	* get a list of faction's casters that have not been claimed
    * @param string faction name the faction
    * @return {Caster()} list of casters
	*/
	$.wtb.getFactionsAvailableCasters = function (faction){
        var casters = $.wtb.getFactionsCasters(faction);
        var available = [];
		for (var casterName in casters) {
			caster = casters[casterName];
			if(caster.claimed == 0){
				available.push(caster);
			}
		}
		return available;
    }

	$.wtb.claimCaster = function (caster, player){
		if(player.caster){
			player.caster.claimed = 0;
		}
		$.wtb.factions[caster.faction][caster.name].claimed = 1;
		player.caster = caster;
	}

	/**
	* clears all references to claimed casters
	*/
	$.wtb.clearClaimed = function (caster, player){
		for (var i in $.wtb.players) {
			player = $.wtb.players[i];
			player.caster = null;
		}
		for (var faction in $.wtb.factions) {
            var casters = $.wtb.factions[faction];
            for (var casterName in casters) {
                $.wtb.factions[faction][casterName].claimed = 0;
            }
        }
	}

	/**
	* Creates a header bar with all of the factions logos
	*/
	$.wtb.buildFactionHeader = function (){
		var factions = $.wtb.getFactions();
		var header = $("<div class='wtb-header'>");
		for (var i in factions) {
			var faction = factions[i];
			var panel = $('<div class="wtb-panel">');
			panel.addClass(faction);
			panel.append($.wtb.getFactionLogo(faction));
			header.append(panel);
		}
		$.wtb.target.append(header);
	}
		/**
    	* Creates a roulette container for each faction
    	*/
    	$.wtb.buildRouletteContainer = function (){
    		var factions = $.wtb.getFactions();
    		var outerContainer = $("<div class='wtb-roulette-container'>");
    		$.wtb.target.append(outerContainer);
    		var container = $("<div class='wtb-rotate'>");
    		outerContainer.append(container);
    		for (var i in factions) {
    			var faction = factions[i];
    			var roulette = $('<div class="wtb-roulette">');
    			roulette.addClass(faction);
    			/*
    			var casters = $.wtb.getFactionsAvailableCasters(faction);
    			var casterCounter = 0;
    			var angle = 360/casters.length;
    			for(casterName in casters){
    			    var caster = casters[casterName];
    			    var imageContainer = $('<div class="wtb-caster-container">');
					imageContainer.attr('style',"-webkit-transform: rotateX("+casterCounter*angle+"deg) translateZ(200px);");
					imageContainer.append(caster.getImage())
    			    roulette.append(imageContainer);
    			    casterCounter++;
				}
				*/
				container.append(roulette);
				$.wtb.populateFactionRoulette(faction);
    		}
    	}

		/**
    	* Populates a roulette bar with available casters
    	* @param string faction name the faction
    	*/
    	$.wtb.populateFactionRoulette = function (faction){
    	    var roulette = $('.wtb-roulette.'+faction);
    	    roulette.html('');
   			var casters = $.wtb.getFactionsAvailableCasters(faction);
            var casterCounter = 0;
            var angle = 360/casters.length;
            for(casterName in casters){
                var caster = casters[casterName];
                var imageContainer = $('<div class="wtb-caster-container">');
				imageContainer.attr('style',"-webkit-transform: rotateX("+casterCounter*angle+"deg) translateZ("+$.wtb.translateZ+");");
				imageContainer.append(caster.getImage())
                roulette.append(imageContainer);
                casterCounter++;
			}
    	}

		/**
    	* randomly picks a caster from a faction that is available
    	* @param string faction name the faction
    	* @return object
    	*/
    	$.wtb.pullCasterForFaction = function (faction){
   			var casters = $.wtb.getFactionsAvailableCasters(faction);
            var selection = Math.floor((Math.random() * casters.length));
            var caster = casters[selection];
            var angle = 360/casters.length * selection;
            return {'caster':caster,'angle':angle,'position':selection};
    	}

		/**
        * animate faction roulette
        * @param string faction name the faction
        * @param integer degrees how far to rotate
        */
        $.wtb.spinFactionsRoulette = function (faction, degrees){
            var roulette = $('.wtb-roulette.'+faction);
			roulette.css({
				'-webkit-animation-name': 'x-spin',
				'-webkit-animation-timing-function': 'ease-out',
				'-webkit-animation-iteration-count': 1,
				'-webkit-animation-duration': '4s',
				'-webkit-animation-direction': 'normal'
			});
        }
	/*
	 * initializes the form reduction of a worltrac form with and advanced options subsection containing many sections
	 */
	$.fn.wtb = function () {
		$.wtb.target = $(this);
		var id = $(this).attr('id');
		if (!id){
			id = 'wtb-container';
			$(this).attr('id', id);
		}
		//Cygnar
		$.wtb.addCaster("Artificer General Nemo & Storm Chaser Adept Caitlin Finch","Cygnar");
        $.wtb.addCaster("Captain Allister Caine","Cygnar");
        $.wtb.addCaster("Captain E. Dominic Darius & Halfjacks","Cygnar");
        $.wtb.addCaster("Captain Jeremiah Kraye","Cygnar");
        $.wtb.addCaster("Captain Kara Sloan","Cygnar");
        $.wtb.addCaster("Captain Victoria Haley","Cygnar");
        $.wtb.addCaster("Commander Adept Nemo","Cygnar");
        $.wtb.addCaster("Commander Coleman Stryker","Cygnar");
        $.wtb.addCaster("Constance Blaize, Knight of the Prophet","Cygnar");
        $.wtb.addCaster("General Adept Nemo","Cygnar");
        $.wtb.addCaster("Lieutenant Allister Caine","Cygnar");
        $.wtb.addCaster("Lord Commander Stryker","Cygnar");
        $.wtb.addCaster("Lord General Coleman Stryker","Cygnar");
        $.wtb.addCaster("Major Markus 'Siege' Brisbane","Cygnar");
        $.wtb.addCaster("Major Prime Victoria Haley","Cygnar");
        $.wtb.addCaster("Major Victoria Haley","Cygnar");
		//Menoth
		$.wtb.addCaster("Anson Durst, Rock of the Faith","Menoth");
        $.wtb.addCaster("Feora, Priestess of the Flame","Menoth");
        $.wtb.addCaster("Feora, Protector of the Flame","Menoth");
        $.wtb.addCaster("Grand Exemplar Kreoss","Menoth");
        $.wtb.addCaster("Grand Scrutator Severius","Menoth");
        $.wtb.addCaster("Hierarch Severius","Menoth");
        $.wtb.addCaster("High Allegiant Amon Ad-Raza","Menoth");
        $.wtb.addCaster("High Executioner Servath Reznik","Menoth");
        $.wtb.addCaster("High Exemplar Kreoss","Menoth");
        $.wtb.addCaster("Intercessor Kreoss","Menoth");
        $.wtb.addCaster("Servath Reznik, Wrath of Ages","Menoth");
        $.wtb.addCaster("Testament of Menoth","Menoth");
        $.wtb.addCaster("The Harbinger of Menoth","Menoth");
        $.wtb.addCaster("The High Reclaimer","Menoth");
        $.wtb.addCaster("Thyra, Flame of Sorrow","Menoth");
        $.wtb.addCaster("Vice Scrutator Vindictus","Menoth");
		//Khador
		$.wtb.addCaster("Forward Kommander Sorscha Kratikoff","Khador");
        $.wtb.addCaster("Karchev the Terrible","Khador");
        $.wtb.addCaster("Koldun Kommander Aleksandra Zerkova","Khador");
        $.wtb.addCaster("Koldun Kommander Zerkova","Khador");
        $.wtb.addCaster("Kommandant Irusk","Khador");
        $.wtb.addCaster("Kommander Harkevich","Khador");
        $.wtb.addCaster("Kommander Orsus Zoktavir","Khador");
        $.wtb.addCaster("Kommander Sorscha","Khador");
        $.wtb.addCaster("Kommander Strakhov","Khador");
        $.wtb.addCaster("Kommander Zoktavir, The Butcher Unleashed","Khador");
        $.wtb.addCaster("Obavnik Kommander Zerkova & Reaver Guard","Khador");
        $.wtb.addCaster("Old Witch of Khador & Scrapjack","Khador");
        $.wtb.addCaster("Supreme Kommandant Irusk","Khador");
        $.wtb.addCaster("The Butcher of Khardov","Khador");
        $.wtb.addCaster("Vladimir Tzepesci, Great Prince of Umbrey","Khador");
        $.wtb.addCaster("Vladimir, the Dark Champion","Khador");
        $.wtb.addCaster("Vladimir, the Dark Prince","Khador");
		//Cryx
		$.wtb.addCaster("Iron Lich Asphyxious","Cryx");
        $.wtb.addCaster("Asphyxious the Hellbringer & Vociferon","Cryx");
        $.wtb.addCaster("Goreshade the Bastard & Deathwalker","Cryx");
        $.wtb.addCaster("Goreshade the Cursed","Cryx");
        $.wtb.addCaster("Goreshade, Lord of Ruin","Cryx");
        $.wtb.addCaster("Lich Lord Asphyxious","Cryx");
        $.wtb.addCaster("Lich Lord Venethrax","Cryx");
        $.wtb.addCaster("Lord Exhumator Scaverous","Cryx");
        $.wtb.addCaster("Pirate Queen Skarre","Cryx");
        $.wtb.addCaster("Skarre, Queen of the Broken Coast","Cryx");
        $.wtb.addCaster("Warwitch Deneghra","Cryx");
        $.wtb.addCaster("Witch Coven of Garlghast & the Egregore","Cryx");
        $.wtb.addCaster("Wraith Witch Deneghra","Cryx");
		//Retribution
		$.wtb.addCaster("Adeptis Rahn","Retribution");
        $.wtb.addCaster("Dawnlord Vyros","Retribution");
        $.wtb.addCaster("Garryth, Blade of Retribution","Retribution");
        $.wtb.addCaster("Issyria, Sibyl of Dawn","Retribution");
        $.wtb.addCaster("Kaelyssa, Night's Whisper","Retribution");
        $.wtb.addCaster("Lord Arcanist Ossyan","Retribution");
        $.wtb.addCaster("Ravyn, Eternal Light","Retribution");
        $.wtb.addCaster("Vyros, Incissar of the Dawnguard","Retribution");
		//Mercenaries
		$.wtb.addCaster("Ashlynn D'Elyse","Mercenaries");
        $.wtb.addCaster("Captain Bartolo Montador","Mercenaries");
        $.wtb.addCaster("Captain Damiano","Mercenaries");
        $.wtb.addCaster("Captain Phinneus Shae","Mercenaries");
        $.wtb.addCaster("Drake MacBain","Mercenaries");
        $.wtb.addCaster("Durgen Madhammer","Mercenaries");
        $.wtb.addCaster("Exulon Thexus","Mercenaries");
        $.wtb.addCaster("Fiona the Black","Mercenaries");
        $.wtb.addCaster("General Ossrum","Mercenaries");
        $.wtb.addCaster("Gorten Grundback","Mercenaries");
		//Convergence
		$.wtb.addCaster("Aurora, Numen of Aerogenesis","Convergence");
        $.wtb.addCaster("Axis, The Harmonic Enforcer","Convergence");
        $.wtb.addCaster("Father Lucant, Divinity Architect","Convergence");
        $.wtb.addCaster("Iron Mother Directrix & Exponent Servitors","Convergence");
		//Trollbloods
		$.wtb.addCaster("Borka Kegslayer","Trollbloods");
        $.wtb.addCaster("Borka, Vengeance of the Rimeshaws","Trollbloods");
        $.wtb.addCaster("Calandra Truthsayer, Oracle of the Glimmerwood","Trollbloods");
        $.wtb.addCaster("Captain Gunnbjorn","Trollbloods");
        $.wtb.addCaster("Grim Angus","Trollbloods");
        $.wtb.addCaster("Grissel Bloodsong","Trollbloods");
        $.wtb.addCaster("Grissel Bloodsong, Marshal of the Kriels","Trollbloods");
        $.wtb.addCaster("Hoarluk Doomshaper","Trollbloods");
        $.wtb.addCaster("Hoarluk Doomshaper, Rage of Dhunia","Trollbloods");
        $.wtb.addCaster("Hunters Grim","Trollbloods");
        $.wtb.addCaster("Jarl Skuld, Devil of the Thornwood","Trollbloods");
        $.wtb.addCaster("Madrak Ironhide","Trollbloods");
        $.wtb.addCaster("Madrak Ironhide, World Ender","Trollbloods");
		//Circle
		$.wtb.addCaster("Baldur the Stonecleaver","Circle");
        $.wtb.addCaster("Baldur the Stonesoul","Circle");
        $.wtb.addCaster("Bradigus Thorle the Runecarver","Circle");
        $.wtb.addCaster("Cassius the Oathkeeper & Wurmwood, Tree of Fate","Circle");
        $.wtb.addCaster("Grayle the Farstrider","Circle");
        $.wtb.addCaster("Kaya the Moonhunter & Laris","Circle");
        $.wtb.addCaster("Kaya the Wildborne","Circle");
        $.wtb.addCaster("Kromac the Ravenous","Circle");
        $.wtb.addCaster("Krueger the Stormlord","Circle");
        $.wtb.addCaster("Krueger the Stormwrath","Circle");
        $.wtb.addCaster("Mohsar the Desertwalker","Circle");
        $.wtb.addCaster("Morvahna The Autumnblade","Circle");
        $.wtb.addCaster("Morvahna the Dawnshadow","Circle");
		//Skorne
		$.wtb.addCaster("Master Ascetic Naaresh","Skorne");
        $.wtb.addCaster("Archdomina Makeda","Skorne");
        $.wtb.addCaster("Dominar Rasheth","Skorne");
        $.wtb.addCaster("Lord Arbiter Hexeris","Skorne");
        $.wtb.addCaster("Lord Assassin Morghoul","Skorne");
        $.wtb.addCaster("Lord Tyrant Hexeris","Skorne");
        $.wtb.addCaster("Makeda & The Exalted Court","Skorne");
        $.wtb.addCaster("Master Tormentor Morghoul","Skorne");
        $.wtb.addCaster("Supreme Aptimus Zaal & Kovaas","Skorne");
        $.wtb.addCaster("Supreme Archdomina Makeda","Skorne");
        $.wtb.addCaster("Tyrant Xerxis","Skorne");
        $.wtb.addCaster("Void Seer Mordikaar","Skorne");
        $.wtb.addCaster("Xerxis, Fury of Halaak","Skorne");
        $.wtb.addCaster("Zaal, the Ancestral Advocate","Skorne");
		//Legion
		$.wtb.addCaster("Absylonia, Daughter of Everblight","Legion");
        $.wtb.addCaster("Absylonia, Terror of Everblight","Legion");
        $.wtb.addCaster("Bethayne and Belphagor","Legion");
        $.wtb.addCaster("Kallus, Wrath of Everblight","Legion");
        $.wtb.addCaster("Lylyth, Herald of Everblight","Legion");
        $.wtb.addCaster("Lylyth, Reckoning of Everblight","Legion");
        $.wtb.addCaster("Lylyth, Shadow of Everblight","Legion");
        $.wtb.addCaster("Rhyas, Sigil of Everblight","Legion");
        $.wtb.addCaster("Saeryn, Omen of Everblight","Legion");
        $.wtb.addCaster("Thagrosh the Messiah","Legion");
        $.wtb.addCaster("Thagrosh, Prophet of Everblight","Legion");
        $.wtb.addCaster("Vayl, Consul of Everblight","Legion");
        $.wtb.addCaster("Vayl, Disciple of Everblight","Legion");
		//Minions
		$.wtb.addCaster("Bloody Barnabas","Minions");
        $.wtb.addCaster("Calaban the Grave Walker","Minions");
        $.wtb.addCaster("Dr. Arkadius","Minions");
        $.wtb.addCaster("Helga the Conquerer","Minions");
        $.wtb.addCaster("Jaga-Jaga, the Death Charmer","Minions");
        $.wtb.addCaster("Lord Carver, BMMD, Esq. III","Minions");
        $.wtb.addCaster("Maelok the Dreadbound","Minions");
        $.wtb.addCaster("Midas","Minions");
        $.wtb.addCaster("Rask","Minions");
        $.wtb.addCaster("Sturm & Drang","Minions");
		//Bankrupt
		$.wtb.addCaster("Brun Cragback & Lug","Bankrupt");
        $.wtb.addCaster("Dahlia Hallyr & Skarath","Bankrupt");
        $.wtb.addCaster("Rorsh & Brine","Bankrupt");
        $.wtb.addCaster("Wrong Eye & Snapjaw","Bankrupt");
        $.wtb.addCaster("Beast Mistress","Bankrupt");
        $.wtb.addCaster("Tyrant Zaadesh","Bankrupt");
        $.wtb.addCaster("Una the Falconer","Bankrupt");
        $.wtb.addCaster("Horgle Ironstrike","Bankrupt");
        $.wtb.addCaster("Journeyman Warcaster","Bankrupt");
        $.wtb.addCaster("Lieutenant Allison Jakes","Bankrupt");
        $.wtb.addCaster("Initiate Tristan Durant","Bankrupt");
        $.wtb.addCaster("Kovnik Andrei Malakov","Bankrupt");
        $.wtb.addCaster("Aiakos, Scourge of the Meredius","Bankrupt");
        $.wtb.addCaster("Elara, Tyro of the Third Chamber","Bankrupt");
        $.wtb.addCaster("Gastone Crosse","Bankrupt");
		$.wtb.buildFactionHeader();
		$.wtb.buildRouletteContainer();
	};

})(jQuery);
