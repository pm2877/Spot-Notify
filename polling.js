const stateInfo = require('./state_info');
const spotify = require('spotify-node-applescript');

let AsyncPolling = require('async-polling');

const isRunningPoll = AsyncPolling(function (end) {
    spotify.isRunning(function(error, result){
        // Sending it to the listeners
        end(error, result);
    }); 
}, 3000);

const getStatePoll = AsyncPolling(function (end) {
    spotify.getState(function(error, result){
        // Sending it to the listeners
        end(error, result);
    }); 
}, 500);
 
isRunningPoll.on('error', function (error) {
    console.error('Encountered an error while polling to see if spotify is running: ', error)
});

isRunningPoll.on('result', function (isRunning) {
    if (isRunning) {
        // console.debug('Spotify is running')
        isRunningPoll.stop()
        getStatePoll.run()
    } else {
        // console.debug('Spotify is not running')
    }
});

getStatePoll.on('error', function (error) {
    getStatePoll.stop()
    isRunningPoll.run()
    console.error('Encountered an error while polling to get current state: ', error)
});

getStatePoll.on('result', function (result) {
    if (!result) {
        getStatePoll.stop()
        isRunningPoll.run()
    }
    else if (result.state === 'playing') {
        // console.debug('Something is playing...')
        stateInfo.detectStateChange()
    }
    else {
        // console.debug('Not playing anything...')
        isNotified = false
    } 
});

exports.isRunningPoll = isRunningPoll;