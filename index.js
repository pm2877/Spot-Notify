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
eventEmitter.setMaxListeners(0);

eventEmitter.on(true, getState)
eventEmitter.on(false, getRunningStatus)
eventEmitter.on('state', detectStateChange)
eventEmitter.on('setTrack', setTrackDetails)

getRunningStatus()

function getRunningStatus(){
    spotify.isRunning(function(err, isRunning){
        if(isRunning==true){
            eventEmitter.emit(true);
        }
        else{
            setTimeout(function() {
                eventEmitter.emit(false);
            }, 5000);
        }
    }); 
}

function getState(){        
    spotify.getState(function(err, state){
        if(state==null || state == undefined){
            eventEmitter.emit(false);
        }
        else if(state.state == 'playing'){
            eventEmitter.emit('state')
        }
        else{
            isNotified = false
            setTimeout(function() {
                eventEmitter.emit(true);
            }, 500);
        } 
    });
}

function detectStateChange(){
    getTrackDetails()
    notify()
    isNotified = true
    eventEmitter.emit(true);  // calls getState
}

function getTrackDetails(){
    spotify.getTrack(function(err, track){
        if(track==null || track==undefined){ 
            eventEmitter.emit(false);
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
