var events = require('events');
const path = require('path');
const notifier = require('node-notifier');
var spotify = require('spotify-node-applescript');
var isSpotifyRunning
var initialState
var isNotified = false
var trackAlbum, trackAlbumArtist, trackName, artworkUrl, trackPopularity
var oldTrackName=''


var eventEmitter = new events.EventEmitter();

eventEmitter.on(true, getState)
eventEmitter.on(false, getRunningStatus)
eventEmitter.on('state', detectStateChange)
eventEmitter.on('setTrack', setTrackDetails)

getRunningStatus(getState)

function getRunningStatus(){
    spotify.isRunning(function(err, isRunning){
        if(isRunning){
            eventEmitter.emit(true, detectStateChange);
        }
        else{
            eventEmitter.emit(false);
        }
    }); 
}

function getState(detectStateChange){        
    spotify.getState(function(err, state){
        if(state==null || state == undefined){
            eventEmitter.emit(false, getState);
        }
        else if(state.state == 'playing'){
            eventEmitter.emit('state', state.state)
        }
        else{
            isNotified = false
            eventEmitter.emit(true, detectStateChange);
        } 
    });
}

function detectStateChange(newState){
    getTrackDetails()
    notify()
    isNotified = true
    eventEmitter.emit(true, detectStateChange);  // calls getState
}

function getTrackDetails(){
    spotify.getTrack(function(err, track){
        if(track==null || track==undefined){ 
            eventEmitter.emit(false, detectStateChange);
        }
        else{
            eventEmitter.emit('setTrack', track.album, track.album_artist, 
                track.name, track.artwork_url, track.popularity)
        }      
    });    
}

function setTrackDetails(album, album_artist, name, artwork, popularity){
    trackAlbum = album
    trackAlbumArtist = album_artist
    trackName = name
    trackPopularity = popularity
    // artworkUrl = artwork
}


function notify(){
    if((!isNotified || oldTrackName!=trackName)&&trackName!=undefined){ 

        notifier.notify({
            title: trackName,
            subtitle: trackAlbum,
            contentImage: path.join(__dirname, '/img/spotify-logo.png'),
            icon: path.join(__dirname, '/img/play-music-icon.png'),
            message: trackAlbumArtist + ' ~ Popularity: ' + trackPopularity,
            sender: 'com.spotify.client',
            group: 'com.spotify.client',
            actions: 'Skip'
        }
        // ,function() {
        //     console.log(arguments);
        // }
        );

        oldTrackName = trackName
    } 
}
