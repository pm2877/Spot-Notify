const notifier = require('node-notifier');
const path = require('path');
var spotify = require('spotify-node-applescript');
var isSpotifyRunning
var initialState
var isNotified = false
var trackAlbum, trackAlbumArtist, trackName, artworkUrl
var oldTrackName=''

//TODO: Use this later to handle the situation when spotify is not running
spotify.isRunning(function(err, isRunning){
    isSpotifyRunning=isRunning
});

getState(detectStateChange) //pass a callback

function getState(detectStateChange){        //takes a callback

    spotify.getState(function(err, state){  
        currentState = state.state
        detectStateChange(currentState)     //detectStateChange is called here
    });

}

function getTrackDetails(notify){
    spotify.getTrack(function(err, track){
        setTrackDetails(track.album, track.album_artist, track.name, track.artwork_url)
    });
    notify()
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

function setTrackDetails(album, album_artist, name, artwork){
    trackAlbum = album
    trackAlbumArtist = album_artist
    trackName = name
    // artworkUrl = artwork
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

// TODO: Make sequential call instead of Async fn calls
