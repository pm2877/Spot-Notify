const notifier = require('node-notifier');
const path = require('path');
const cmd = require('node-cmd');
var spotify = require('spotify-node-applescript');
var isSpotifyRunning
var initialState
var isNotified = false
var trackAlbum, trackAlbumArtist, trackName, artworkUrl
var oldTrackName=''

/*TODO:
1. Fix bug that is causing no notification being displayed for the first time when song is played where spotify is started after it was quit while a track was playing

2. destroy notifactions.

*/


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
        getRunningStatus(getState)
    } 
}

function getState(detectStateChange){        //takes a callback
    spotify.getState(function(err, state){
        if(state==null || state == undefined){
            getRunningStatus(getState)
        }
        else{
            currentState = state.state
            detectStateChange(currentState)     //detectStateChange is called here
        }     
    });
}

function detectStateChange(newState){
    if(newState == 'playing'){
        getTrackDetails(notify)
        isNotified = true
    }
    else{
        isNotified = false
    }
    getState(detectStateChange)             // This is the main recursive call
}

function getTrackDetails(notify){
    spotify.getTrack(function(err, track){
        if(track==null || track==undefined){
            getState(detectStateChange)
        }
        else{
            setTrackDetails(track.album, track.album_artist, track.name, track.artwork_url)
        }      
    });
    notify()
}

function setTrackDetails(album, album_artist, name, artwork){
    trackAlbum = album
    trackAlbumArtist = album_artist
    trackName = name
    // artworkUrl = artwork
}

function notify(){
    if(!isNotified || oldTrackName!=trackName){  //Notify only once
        console.log("Notify")
        // cmd.run('terminal-notifier -title ' + trackName + ' -subtitle ' + trackAlbum + ' -message ' + trackAlbumArtist + ' -group "com.spotify.client" -activate "com.spotify.client"');
        // console.log('terminal-notifier -title ' + trackName + ' -subtitle ' + trackAlbum + ' -message ' + trackAlbumArtist + ' -group "com.spotify.client" -activate "com.spotify.client"')
        notifier.notify({
            title: trackName,
            subtitle: trackAlbum,
            contentImage: path.join(__dirname, 'spotify-logo.png'),
            icon: path.join(__dirname, 'play-music-icon.png'),
            message: trackAlbumArtist,
            group: 'com.spotify.client',
            wait: true,
            actions: 'Skip'
        });
        notifier.on('click', function (notifierObject, options) {
            cmd.run('open -a Spotify')            // will work on only Mac OS
            // console.log('open -a Spotify')
        });
        oldTrackName = trackName
    } 
}
