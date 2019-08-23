const path = require('path');
const notifier = require('node-notifier');
var spotify = require('spotify-node-applescript');
var AsyncPolling = require('async-polling');
var isNotified = false
var trackAlbum, trackAlbumArtist, trackName, artworkUrl, trackPopularity
var oldTrackName = ''

const isRunningPoll = AsyncPolling(function (end) {
    spotify.isRunning(function(error, result){
        if (error) {
            console.log('Encountered an error while checking is Spotify is running')

            end(error)
            return;
        }
        
        // Sending it to the listeners
        end(null, result);
    }); 
}, 3000);

const getStatePoll = AsyncPolling(function (end) {
    spotify.getState(function(error, result){
        if (error) {
            console.log('Encountered an error while checking the current state')

            this.stop()
            isRunningPoll.run()
            
            end(error)
            return;
        }

        // Sending it to the listeners
        end(null, result);
    }); 
}, 500);
 
isRunningPoll.on('error', function (error) {
    // The polling encountered an error, handle it here.
    console.log('Encountered an error while polling to see if spotify is running: ', error)
});

isRunningPoll.on('result', function (isRunning) {
    if (isRunning == true) {
        console.log('Spotify is running')
        isRunningPoll.stop()
        getStatePoll.run()
    } else {
        console.log('Spotify is not running')
    }
});

getStatePoll.on('error', function (error) {
    // The polling encountered an error, handle it here.
    getStatePoll.stop()
    isRunningPoll.run()
    console.log('Encountered an error while polling to get current state: ', error)
});

getStatePoll.on('result', function (result) {
    if (result === null || result === undefined) {
        getStatePoll.stop()
        isRunningPoll.run()
    }
    else if (result.state === 'playing') {
        console.log('Something is playing...')
        detectStateChange()
    }
    else {
        console.log('Not playing anything...')
        isNotified = false
    } 
});
 
isRunningPoll.run(); // Starting point of the script.

detectStateChange = async () => {
    await getTrackDetails()
    await notify()
    isNotified = true
}

getTrackDetails = async () => {
    await spotify.getTrack(function (err, track) {
        if (err) {
            console.log('Encountered an error while getting track details')
            return;
        }
        if (track === null || track === undefined) { 
            console.log('Cannot find the track. Is there something playing?')
            getStatePoll.stop()
            isRunningPoll.run()
        }
        else {
            setTrackDetails(track)
        }      
    });    
}

setTrackDetails = ({album, album_artist, name, artwork_url, popularity}) => {
    console.log('Setting track details...')
    trackAlbum = album
    trackAlbumArtist = album_artist
    trackName = name
    trackPopularity = popularity
    // artworkUrl = artwork_url
}

notify = async () => {
    if((!isNotified || oldTrackName !== trackName) && trackName !== undefined){ 

        await notifier.notify({
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


