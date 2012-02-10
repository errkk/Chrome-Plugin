




/**
* DOM ready function
*/
document.addEventListener('DOMContentLoaded',function(){
	
	var spotifyHost = 'localhost'
		spotifyPort = 8080,
		quota = 3,
		current_song = null,
		favs = false;
	
	
	/**
	* Update current count of allowed skips
	*/
	function update_nexts( nexts )
	{
		quota = nexts;
		if( quota > 0 ){
		    chrome.browserAction.setBadgeText( {'text' : quota.toString()} );
		    chrome.browserAction.setBadgeBackgroundColor( {'color': [0,150,0,255]} );
		}else{
		    chrome.browserAction.setBadgeText( {'text' : 'x'} );
		    chrome.browserAction.setBadgeBackgroundColor( {'color': [150,0,0,255]} );
		}

	}

	/**
	* Get some data from the spotify server
	*/
	function talkToSpotifyServer( action, callback, data )
	{
		var req = new XMLHttpRequest(),
			responded = false;


		req.open( 'GET', 'http://' + spotifyHost + ':' + spotifyPort + '/' + action + '/' + data, true );
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

		req.send( null );
		

	}
	
	function update_favs_list()
	{
	    // Populate favs
	    if( get_favs( true ) ){
		var el_favs = document.getElementById('favs');
		
		while ( el_favs.childNodes.length >= 1 ){
		    el_favs.removeChild( el_favs.firstChild );       
		}
		
		for ( fav in favs.reverse() ){
		    var li = document.createElement("li"),
			del = document.createElement("span"),
			title = favs[fav];
		    
		    li.innerHTML = title;
		    del.innerHTML = '&times;';
		    
		    // delete button
		    del.addEventListener('click',function(){
			remove_fav( title );
		    }, false );
		    
		    li.appendChild( del );
		    
		    el_favs.appendChild( li );
		}
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

		// populate current tracks
		for ( var i = 1, item; item = items[i++]; ) {
			var li = document.createElement("li");
			li.innerHTML = item.getElementsByTagName("title")[0].firstChild.nodeValue;
			document.getElementById('list').appendChild(li);
		}
		}
		update_favs_list();
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
		}



		if( res.quota != undefined ){
		update_nexts( res.quota );
		}

	}, '' );
	
	// Next button handler
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
	
	
	// LIKE button handler
	document.getElementById('like').addEventListener('click', function(e){
	    save_fav( current_song );
	    e.preventDefault();
	}, true );
	
	
	
	
	/**
	 * Save a song to current storage
	 */
	function save_fav( song )
	{
	    var new_favs = get_favs( true );
	    
	    // Check its not already in there
	    if( favs.indexOf(song) < 0 ){
		new_favs.push( song );
		localStorage.setItem( 'favs', JSON.stringify( new_favs ) );
		// Update list elements thats displayed
		update_favs_list();
	    }
	}
	
	/**
	 * retrieve saved favorites, set true to update from localstorage
	 */
	function get_favs( update )
	{
	    if( !favs || update ){
		if( localStorage.getItem( 'favs' ) ){
		    favs = JSON.parse( localStorage.getItem( 'favs' ) );
		}else{
		    favs = [];
		}
	    }
	    return favs;
	}
	
	
	function remove_fav( song )
	{
	    var new_favs = get_favs( true );
	    
	    // Check its not already in there
	    var index = new_favs.indexOf(song);
	    if( index >= 0 ){
		new_favs.splice( index, 1 );
		
		localStorage.setItem( 'favs', JSON.stringify( new_favs ) );
		// Update list elements thats displayed
		update_favs_list();
	    }
	}


}, false ); // End Dom ready

