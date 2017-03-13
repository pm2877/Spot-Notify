const notifier = require('node-notifier');
const path = require('path');
var spotify = require('spotify-node-applescript');
var isSpotifyRunning
var initialState
var isNotified = false
var trackAlbum, trackAlbumArtist, trackName, artworkUrl
var oldTrackName=''

//Use this later
spotify.isRunning(function(err, isRunning){
    isSpotifyRunning=isRunning
});

getState(detectStateChange) //pass a callback

function getState(detectStateChange){        //takes a callback

    spotify.getState(function(err, state){  
        //TODO: check if state is undefined, if yes, then recall
        currentState = state.state
        detectStateChange(currentState)     //detectStateChange is called here
    });

}

function getTrackDetails(){
    spotify.getTrack(function(err, track){
        //TODO: check if track is not undefined, if yes then recall
        setTrackDetails(track.album, track.album_artist, track.name, track.artwork_url)
    });
}

function setTrackDetails(album, album_artist, name, artwork){
    trackAlbum = album
    trackAlbumArtist = album_artist
    trackName = name
    // artworkUrl = artwork
}

function detectStateChange(newState){
        if(newState == 'playing'){
            getTrackDetails()
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
            
            isNotified = true
            //console.log("State is: " + newState)
        }
        else{
            isNotified = false
            //console.log("State is: " + newState)
        }
        getState(detectStateChange)
}

// TODO: Make sequential call instead of Async fn calls


// spotify.getState(function(err, state){
//     //console.log(state.state)    
//     detectStateChange(state.state)
//     /*
//     state = {
//         volume: 99,
//         position: 232,
//         state: 'playing'
//     }
//     */
// });
// spotify.getTrack(function(err, track){

//  notifier.notify({
//  title: track.album + ' by ' + track.album_artist,
//     message: track.name
//  });
//  // console.log(track.name)
    
//     track = {
//         artist: 'Bob Dylan',
//         album: 'Highway 61 Revisited',
//         disc_number: 1,
//         duration: 370,
//         played count: 0,
//         track_number: 1,
//         starred: false,
//         popularity: 71,
//         id: 'spotify:track:3AhXZa8sUQht0UEdBJgpGc',
//         name: 'Like A Rolling Stone',
//         album_artist: 'Bob Dylan',
//         artwork_url: 'http://images.spotify.com/image/e3d720410b4a0770c1fc84bc8eb0f0b76758a358',
//         spotify_url: 'spotify:track:3AhXZa8sUQht0UEdBJgpGc' }
//     }
    

// });

