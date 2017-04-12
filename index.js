const notifier = require('node-notifier');
const path = require('path');
const EventEmitter = require('events'); 
const cmd = require('node-cmd');
var memwatch = require('memwatch-next');
var spotify = require('spotify-node-applescript');
var isSpotifyRunning
var initialState
var isNotified = false
var trackAlbum, trackAlbumArtist, trackName, artworkUrl, trackPopularity
var oldTrackName=''

/*TODO:

*/

EventEmitter.defaultMaxListeners = 0
getRunningStatus(getState)

function getRunningStatus(getState){
    //console.log("get")
    spotify.isRunning(function(err, isRunning){
        setRunningStatus(isRunning)
    }); 
}

function setRunningStatus(isRunning){
    //console.log("Set")
    isSpotifyRunning = isRunning
    if(isSpotifyRunning){
        getState(detectStateChange) //pass a callback
    }
    else{
        setTimeout.bind(null, getRunningStatus(getState), 1000)
    } 
}

function getState(detectStateChange){        //takes a callback
    spotify.getState(function(err, state){
        if(state==null || state == undefined){
            setTimeout.bind(null, getRunningStatus(getState), 1000)
        }
        else{
            currentState = state.state
            detectStateChange(currentState)     //detectStateChange is called here
        }     
    });
}

function detectStateChange(newState){
    if(newState == 'playing'){        //TODO: maybe can use a variable oldState and set it to false every time you notify? and check here if oldState != newState
        getTrackDetails(notify)
        isNotified = true
    }
    else{
        isNotified = false
    }
    setTimeout.bind(null, getState(detectStateChange), 1000)             // This is the main recursive call. setTimeour.bind() clears the call stack and minimizes memory use.   
}

function getTrackDetails(notify){
    spotify.getTrack(function(err, track){
        if(track==null || track==undefined){ 
            setTimeout.bind(null, getState(detectStateChange), 1000)
        }
        else{
            //console.log(track.popularity)
            setTrackDetails(track.album, track.album_artist, track.name, track.artwork_url, track.popularity)
            
        }      
    });
    notify()
    
}

function setTrackDetails(album, album_artist, name, artwork, popularity){
    //console.log(popularity)
    trackAlbum = album
    trackAlbumArtist = album_artist
    trackName = name
    trackPopularity = popularity
    // artworkUrl = artwork
}

memwatch.on('leak', function(info) {
 console.log(info)
});

function notify(){
    if((!isNotified || oldTrackName!=trackName)&&trackName!=undefined){  //Notify only once
        //console.log("Notify")

        // cmd.run('terminal-notifier -title ' + trackName + ' -subtitle ' + trackAlbum + ' -message ' + trackAlbumArtist + ' -group "com.spotify.client" -activate "com.spotify.client"');
        // console.log('terminal-notifier -title ' + trackName + ' -subtitle ' + trackAlbum + ' -message ' + trackAlbumArtist + ' -group "com.spotify.client" -activate "com.spotify.client"')

        notifier.notify({
            title: trackName,
            subtitle: trackAlbum,
            // icon: path.join(__dirname, 'spotify-logo.png'),
            contentImage: path.join(__dirname, 'spotify-logo.png'),
            icon: path.join(__dirname, 'play-music-icon.png'),
            message: trackAlbumArtist + ' --- Popularity: ' + trackPopularity,
            sender: 'com.spotify.client',
            group: 'com.spotify.client',
            actions: 'Skip'
        }
        // ,function() {
        //     console.log(arguments);
        // }
        );

        // not working


        notifier.on('click', function (notifierObject, options) {
            // if(arguments['2'].activationType=='contentsClicked'){
            //     cmd.run('open -a Spotify')            // will work on only Mac OS and Linux
            // }

            //Don't need this right now, but useful method
            // if(arguments['2'].activationValue=='skip'){
            //     console.log('open -a Spotify')  //Skip to next song here
            // }
        });
        oldTrackName = trackName
    } 
}
