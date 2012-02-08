




/**
* DOM ready function
*/
document.addEventListener('DOMContentLoaded',function(){
	
	var spotifyHost = 'localhost'
		spotifyPort = 8080,
		quota = 3,
		current_song = null;
	
	
	/**
	* Update current count of allowed skips
	*/
	function update_nexts( nexts )
	{
		quota = nexts;
		document.getElementById('skips').innerHTML = quota;

	}

	/**
	* Get some data from the spotify server
	*/
	function talkToSpotifyServer( action, callback, data )
	{
		var req = new XMLHttpRequest()
		responded = false;

		req.open( 'GET', 'http://' + spotifyHost + ':' + spotifyPort + '/' + action, true );
		req.onload = function () {
		if( responded ){
			return;
		}
		if ( req.readyState == 4 && req.status == 200 ) {
			var the_object = JSON.parse( req.responseText );
		}
		if( 'function' == typeof( callback ) ){
			callback( the_object );
		}
		responded = true;
		};
		if( data ){
			req.send( data );
			console.log(data);
		}else{
			req.send( null );
		}

	}
	
	
	
	// Get current tracks
	(function(){
		var req = new XMLHttpRequest();

		req.open( "GET", "http://ws.audioscrobbler.com/1.0/user/rrSysDio/recenttracks.rss", true );
		req.onload = getTracks;
		req.send(null);

		function getTracks() {
		var items = req.responseXML.getElementsByTagName("item"),
			now = document.getElementById('now');

		current_song = items[0].getElementsByTagName("title")[0].firstChild.nodeValue;

		now.innerHTML = current_song;


		for (var i = 1, item; item = items[i]; i++) {
			var li = document.createElement("li");
			li.innerHTML = item.getElementsByTagName("title")[0].firstChild.nodeValue;
			document.getElementById('list').appendChild(li);
		}
		}
	})();


	// Check server status
	talkToSpotifyServer( 'check', function( res ){
		try{
		var status = res.status;
		}catch( e ){
		var status = false;
		}


		if( status == 'ok' ){
		var span = document.createElement( 'span' );
		span.id = 'status';
		document.getElementById('title').appendChild( span );

		var skips = document.createElement( 'span' );
		skips.id = 'skips';
		document.getElementById('header').appendChild( skips );
		}



		if( res.quota != undefined ){
		update_nexts( res.quota );
		}

	}, false );
	

	document.getElementById('next').addEventListener('click', function(e){

	if( quota < 1 ){
		alert('Ohh sheeeit, you got no skips left!');
		return false;
	}

	loading = true;
	talkToSpotifyServer( 'next', function( res ){
		loading = false;

		// Check if it worked
		if( res.status != 'ok' ){
		if( 'error' in res ){
			alert( res.error );
		}else{
			alert('That didnt work');
		}
		}

		if( res.quota != undefined ){
		update_nexts( res.quota );
		}
		
		return;

	}, current_song );

	e.preventDefault();
	}, true );


}, false ); // End Dom ready

