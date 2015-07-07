<!DOCTYPE html>
<html lang="en">
        <head>
        <link rel="icon"
                type="image/png"
                href="/images/fav_icon.jpg">
    <meta charset="utf-8">
    <title>Player Name Tag Example</title>
    <link rel="stylesheet" href="/css/reset.css">
    <link rel="stylesheet" href="/js/jquery-ui.css">
    <link rel="stylesheet" href="/css/wtb.css">
  </head>
  <body>
  <div class="wtb-player-tag-container">
        <div class='wtb-player-nameplate retribution'>
		<div class="faction-icon">
			<img src='/images/retribution.png'>
		</div>
		<div class="name-plate-names">
			<span style="text-decoration:underline;">Name:</span><BR>
			<span>Matthew Morales</span><BR>
			<BR>
			<span style="text-decoration:underline;margin-top:3px;">Caster:</span><BR>
			<span>Artificer General Nemo & Storm Chaser Adept Caitlin Finch</span>
		</div>
		<div class="icons-name-plate">
			[X]
			<BR>
			<BR>
			1 x <img src="/images/jackpot/Emergency Respin.png">
			<BR>
			<BR>
			11 x <img src="/images/jackpot/Double Cross.png">
		</div>
        </div>
	

	<?php
	$factions = array(
		'retribution', 
		'convergence', 
		'cygnar', 
		'khador', 
		'cryx', 
		'menoth', 
		'mercenaries', 
		'skorne', 
		'trollbloods', 
		'legion', 
		'circle', 
		'minions'
	);
	foreach($factions as $faction){
		echo <<<txt
		<div class='wtb-player-nameplate $faction'>
			<div class="faction-icon">
				<img src='/images/$faction.png'>
			</div>
			<div class="name-plate-names">
				<span style="text-decoration:underline;">Name:</span><BR>
				<span>Matthew Morales</span><BR>
				<BR>
				<img src='/images/roll.svg'>
			</div>
			<div class="icons-name-plate">
				[X]
				<BR>
				<BR>
				1 x <img src="/images/jackpot/Emergency Respin.png">
				<BR>
				<BR>
				11 x <img src="/images/jackpot/Double Cross.png">
			</div>
	        </div>

txt;
	}
	
	?>



  </div>
  </body>
</html>



