const notifier = require('node-notifier');
const path = require('path');
var spotify = require('spotify-node-applescript');
var isSpotifyRunning
var initialState
var isNotified = false
var trackAlbum, trackAlbumArtist, trackName, artworkUrl
var oldTrackName=''


getRunningStatus(getState)

function getRunningStatus(getState){
    console.log("get")
    spotify.isRunning(function(err, isRunning){
        setRunningStatus(isRunning)
    }); 
}

function setRunningStatus(isRunning){
    console.log("Set")
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
            if(state==null){
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
    getState(detectStateChange)
}

function getTrackDetails(notify){
    spotify.getTrack(function(err, track){
        setTrackDetails(track.album, track.album_artist, track.name, track.artwork_url)
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
        notifier.notify({
            title: trackName,
            subtitle: trackAlbum,
            icon: path.join(__dirname, 'spotify-logo.png'),
            message: trackAlbumArtist
        });
        oldTrackName = trackName
    } 
}
