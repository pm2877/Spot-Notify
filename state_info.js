const spotify = require('spotify-node-applescript');
const path = require('path');
const notifier = require('node-notifier');

let trackAlbum, trackAlbumArtist, trackName, trackPopularity, oldTrackName
let isNotified = false

const detectStateChange = async () => {
    await getTrackDetails()
    await notify()
    isNotified = true
}

const getTrackDetails = async () => {
    await spotify.getTrack(function (error, track) {
        if (error) {
            console.error('Encountered an error while getting track details')
            return;
        }
        if (!track) { 
            // console.debug('Cannot find the track. Is there something playing?')
            getStatePoll.stop()
            isRunningPoll.run()
        }
        else {
            setTrackDetails(track)
        }      
    });    
}

const setTrackDetails = (trackInfo) => {
    const {album, album_artist, name, popularity} = trackInfo;
    // console.debug('Setting track details...')
    trackAlbum = album
    trackAlbumArtist = album_artist
    trackName = name
    trackPopularity = popularity
}

const notify = async () => {
    if(trackName && (!isNotified || oldTrackName !== trackName)){ 

        await notifier.notify({
            title: trackName,
            subtitle: `${trackAlbum} by ${trackAlbumArtist}`,
            contentImage: path.join(__dirname, '/img/spotify-logo.png'),
            icon: path.join(__dirname, '/img/play-music-icon.png'),
            message: `Popularity: ${trackPopularity}`,
            sender: 'com.spotify.client',
            group: 'com.spotify.client',
            actions: 'Skip'
        }, function (error, response, metadata) {
            // console.debug('error: ', error);
            // console.debug('response: ', response);
            // console.debug('metadata: ', metadata);
        });

        oldTrackName = trackName
    } 
}

exports.detectStateChange = detectStateChange;

