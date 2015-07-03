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
	};
	//defined z index for the roulette;
	$.wtb.translateZ='250px';

	/**
	 * Faction Object Declaration
	*/
	$.wtb.faction = function () {
            this.name = "";//faction name
            this.casters = {};//all casters
            this.casterCount = 0;//the caster currently given to them
            this.availableCasterCount = 0;//the caster currently given to them
            /**
            *
            */
            this.addCaster = function(caster){
                this.casters[caster.name] = caster;
                caster.position = this.casterCount;
                this.casterCount ++;
                this.availableCasterCount++;
            }
            /**
            	* claims a caster from a faction for a player
            	* @param Caster caster caster object claimed
            	* @param Player player Player object claiming
            	*/
            this.claimCaster = function(caster, player){
                if(caster.faction != this){
                    throw  "This caster doesn't belong to this faction";
                }
                if(player.caster){
                    caster.release();
                }
                this.availableCasterCount--;
                caster.player = player;
                player.caster = caster;
			}
			 /**
            * release a caster from a faction for a player
            * @param Caster caster caster object claimed
            */
            this.releaseCaster = function(caster){
                if(caster.faction != this){
                    throw  "This caster doesn't belong to this faction";
                }
                if(caster.player){
                    player = caster.player;
                    player.caster = null;
                    this.availableCasterCount++;
                }
                caster.player = null;;
            }

            /**
             * Gets this factions image path
             * @return string path the the casters image
            */
            this.getImagePath = function(){
                return $.wtb.imagePath+'/'+this.name.toLowerCase()+'.png';
            }

            /**
             * Creates a jquery object for a dom element image
             * @return $(DOM) image of caster
            */
            this.getLogo = function(){
                var image = $('<img src="'+this.getImagePath()+'">');
                return image;
            }

            /**
            * is this faction available
            * @param string faction name the faction
            * @return Array<String> faction names
            */
            this.isAvailable = function(faction){
                if( this.availableCasterCount > 0 ){
                    return true;
                }
                return false;
            }

            /**
            * get a list of faction's casters that have not been claimed
            * @return {Caster()} list of casters
            */
            this.getAvailableCasters = function (){
                var casters = this.casters;
                var available = [];
                for (var casterName in casters) {
                    caster = casters[casterName];
                    if(!caster.player){
                        available.push(caster);
                    }
                }
                return available;
            }

    	}

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
        this.faction = null;//faction model
		this.position = null;//casters position in the faction listing. accessibility variable
		this.player = null; //who has claimed this
        /**
         * Gets this casters image path
         * @return string path the the casters image
        */
        this.getImagePath = function(){
            return $.wtb.imagePath+'/'+this.faction.name.toLowerCase()+'/'+this.name+'.png';
        }

        /**
         * Creates a jquery object for a dom element image
         * @return $(DOM) image of caster
        */
        this.getImage = function(){
            var image = $('<img src="'+this.getImagePath()+'">');
            return image;
        }
        /**
         * Claims the caster for a player
         * @param Player player person claiming this caster
         * @return void
         */
         this.claim = function(player){
             this.faction.claimCaster(this, player);
         }
         /**
          * release the claim on this caster
          * @return void
          */
          this.release = function(){
              this.faction.releaseCaster(this);
          }
    }

	/**
	* Add a caster to a faction
	* @param string casterName name of the caster
	* @param string faction name of the caster's faction
	*/
    $.wtb.addCaster = function (casterName,factionName){
        if(!$.wtb.factions[factionName]){
    		faction = new $.wtb.faction;
    		faction.name = factionName;
    		$.wtb.factions[factionName] = faction;
        }
        var faction = $.wtb.factions[factionName];
        var caster = new $.wtb.caster;
        caster.faction = faction;
        caster.name = casterName;
        $.wtb.factions[factionName].addCaster(caster);
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
	* get a list of all factions
	* @param string exclude faction name to not be included in the list
	* @return Array<String> faction names
	*/
	$.wtb.getFactions = function(exclude){
		exclude = exclude || null;
		var factions = [];
		for (var factionName in $.wtb.factions) {
			var faction = $.wtb.factions[factionName];
            if ( faction.name != exclude) {
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
	$.wtb.getAvailableFactions = function(exclude){
		exclude = exclude || null;
		var factions = [];
		for (var factionName in $.wtb.factions) {
			var faction = $.wtb.factions[factionName];
            if ( faction.name != exclude && faction.isAvailable()) {
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
	$.wtb.getFactionsCasters = function (factionName){
		return faction.casters;
	}

	/**
	* clears all references to claimed casters
	*/
	$.wtb.clearClaimed = function (caster, player){
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
	$.wtb.buildFactionHeader = function (){
		var factions = $.wtb.getFactions();
		var header = $("<div class='wtb-header'>");
		for (var i in factions) {
			var faction = factions[i];
			var panel = $('<div class="wtb-panel">');
			panel.addClass(faction.name);
			panel.append(faction.getLogo());
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
            roulette.addClass(faction.name);
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
    	    var roulette = $('.wtb-roulette.'+faction.name);
    	    roulette.html('');
   			var casters = faction.getAvailableCasters();
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
    	* Populates a roulette bar with available casters
    	* @param Player player player to get a random caster
    	*/
		$.wtb.assignPlayerARandomCaster = function(player){
			var factions = $.wtb.getAvailableFactions(player.faction);
            var selection = Math.floor((Math.random() * factions.length));
			faction = factions[selection];
			caster = $.wtb.pullCasterForFaction(faction, player);
		}


		/**
    	* randomly picks a caster from a faction that is available
    	* @param faction faction faction pulling from
    	* @param Player player player to get a random caster
    	* @return object
    	*/
    	$.wtb.pullCasterForFaction = function (faction,player){
    	    var roulette = $('.wtb-roulette.'+faction.name);
    	    if(roulette.hasClass('wtb-spinning')){
    	        return;
    	    }
   			var casters = faction.getAvailableCasters();
            var selection = Math.floor((Math.random() * casters.length));
            var increment = 360/casters.length;
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
        $.wtb.spinFactionsRoulette = function (faction, angle, caster, player){
			var caster = caster;
            var roulette = $('.wtb-roulette.'+faction.name);
            $.wtb.changeSpinRule(angle);
            roulette.removeClass('wtb-spinner').addClass('wtb-spinner');
            window.setTimeout(function(){
                roulette.removeClass('wtb-spinner');
                roulette.removeClass('wtb-spinning');
				$.wtb.updateRouletteAngles(faction, caster.position);
				$.wtb.confirmCasterSelection(caster, player);
            },4000);
        }
		/**
	    * confirm box for the selection
        * @param Caster() caster object selected
        * @param Player() player object spinning
	    */
		$.wtb.confirmCasterSelection = function(caster, player){
			var r = confirm(player.name +' pulled ' + caster.name);
			if(r){
				caster.claim(player);
				$.wtb.populateFactionRoulette(caster.faction);
			}else{
				$.wtb.populateFactionRoulette(caster.faction);
			}
		}

		/**
        * alters the xspin rule
        * @param string faction name the faction
        * @param int frontPosition which caster (starting at 0) should be at the front
        * @return void
        */
		$.wtb.updateRouletteAngles = function(faction, frontPosition){
			var roulette = $('.wtb-roulette.'+faction.name);
			var i = 0;
			var casters = faction.getAvailableCasters();
			var increment = 360/casters.length;
			roulette.find('.wtb-caster-container').each(function(){
				var casterPanel = $(this);
				var degrees = (i - frontPosition) * increment;
				casterPanel.css({'-webkit-transform': 'rotateX('+degrees+'deg) translateZ('+$.wtb.translateZ+')'});
				i++;
			});
		}


		/**
        * search the CSSOM for a specific -webkit-keyframe rule
        * @param string rule name of the transform rule in question
        * @return obj css rule object, null if not present
        */
       $.wtb.findKeyframesRule = function(rule) {
                // gather all stylesheets into an array
                var styleSheets = document.styleSheets;

                // loop through the stylesheets
                for (var i = 0; i < styleSheets.length; ++i) {
                    // loop through all the rules
                    for (var j = 0; j < styleSheets[i].cssRules.length; ++j) {
                        // find the -webkit-keyframe rule whose name matches our passed over parameter and return that rule
                        if (styleSheets[i].cssRules[j].type == window.CSSRule.WEBKIT_KEYFRAMES_RULE && styleSheets[i].cssRules[j].name == rule){
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
		$.wtb.changeSpinRule = function(angle){
	        // find our -webkit-keyframe rule
	        angle = 360-angle
	        var keyframes = $.wtb.findKeyframesRule('x-spin');

	        // remove the existing 0% and 100% rules
	        keyframes.deleteRule("0%");
	        keyframes.deleteRule("100%");

	        // create new 0% and 100% rules with random numbers
	        keyframes.appendRule("0% { -webkit-transform: rotateX(720deg); }");//always at least one full spin
	        keyframes.appendRule("100% { -webkit-transform: rotateX("+angle+"deg); }");
	    }


	/*
	 * initializes the wtb plugin, pulls the target, sets up casters
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
