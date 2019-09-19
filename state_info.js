const spotify = require('spotify-node-applescript');
const polling = require('./polling');
const path = require('path');
const notifier = require('node-notifier');

class StateInfo {
    constructor() {
        this._isNotified = false;
        this.trackAlbum = '';
        this.trackAlbumArtist = '';
        this.trackName = '';
        this.trackPopularity = '';
        this.oldTrackName = '';
    }

    get isNotified() {
        return this._isNotified;
    }

    set isNotified(isNotified) {
        this._isNotified = isNotified;
    }

    async notify() {
        if(this.trackName && (!this.isNotified || this.oldTrackName !== this.trackName)){ 
    
            await notifier.notify({
                title: this.trackName,
                subtitle: `${this.trackAlbum} by ${this.trackAlbumArtist}`,
                contentImage: path.join(__dirname, '/img/spotify-logo.png'),
                icon: path.join(__dirname, '/img/play-music-icon.png'),
                message: `Popularity: ${this.trackPopularity}`,
                sender: 'com.spotify.client',
                group: 'com.spotify.client',
                actions: 'Skip'
            }, function (error, response, metadata) {
                // console.debug('error: ', error);
                // console.debug('response: ', response);
                // console.debug('metadata: ', metadata);
            });
    
            this.oldTrackName = this.trackName
        } 
    }

    async detectStateChange() {
        try {
            await this.getTrackDetails()
        } catch (e) {
            console.error('error1: ', e)
        }
        try {
            await this.notify()
        } catch (e) {
            console.error('error2: ', e);
        }
        this._isNotified = true
    };

    async getTrackDetails() {
        await spotify.getTrack((error, track) => {
            if (error) {
                console.error('Encountered an error while getting track details')
                return;
            }
            if (!track) {
                // console.debug('Cannot find the track. Is there something playing?')
                polling.getStatePoll.stop()
                polling.isRunningPoll.run()
            }
            else {
                this.setTrackDetails(track)
            }
        })
    };

    setTrackDetails(trackInfo) {
        const {album, album_artist, name, popularity} = trackInfo;
        // console.debug('Setting track details...')
        this.trackAlbum = album
        this.trackAlbumArtist = album_artist
        this.trackName = name
        this.trackPopularity = popularity
    }
}

module.exports = StateInfo;

