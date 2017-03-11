const notifier = require('node-notifier');
var spotify = require('spotify-node-applescript');
var isSpotifyRunning
var initialState
var newState

spotify.isRunning(function(err, isRunning){
    isSpotifyRunning=isRunning
    console.log(isSpotifyRunning)
});

spotify.getState(function(err, state){  
    initialState = state.state
    console.log(initialState)
    detectStateChange(initialState)
});


function detectStateChange(currentState){
    console.log(currentState)
    while(isSpotifyRunning){
        console.log(newState)
        spotify.getState(function(err, state){  
            newState = state.state

        });
        if(currentState!=newState){
            spotify.getTrack(function(err, track){
                notifier.notify({
                    title: track.album + ' by ' + track.album_artist,
                    message: track.name
                });
            });
        }
    }
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

