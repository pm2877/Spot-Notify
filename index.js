const notifier = require('node-notifier');
const path = require('path');
// const cmd = require('node-cmd');
var spotify = require('spotify-node-applescript');
var isSpotifyRunning
var initialState
var isNotified = false
var trackAlbum, trackAlbumArtist, trackName, artworkUrl, trackPopularity
var oldTrackName=''
var events = require('events');

var eventEmitter = new events.EventEmitter();

eventEmitter.on(true, getState)
eventEmitter.on(false, getRunningStatus)
eventEmitter.on('state', detectStateChange)
eventEmitter.on('setTrack', setTrackDetails)

getRunningStatus(getState)

function getRunningStatus(){
    //console.log("get")
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
    eventEmitter.emit(true, detectStateChange);  //calls getState
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
            message: trackAlbumArtist + ' ~ Popularity: ' + trackPopularity,
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
