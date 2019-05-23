// Options
const CLIENT_ID = "440646774290-ism1om8j8hnp1js8tsc9603ogo6uvhco.apps.googleusercontent.com";
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest',
  'https://youtubeanalytics.googleapis.com/$discovery/rest?version=v2'
];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly';

const authorizeButton = document.getElementById("authorize-button");
const signoutButton = document.getElementById("signout-button");
const content = document.getElementById("content");
const channelForm = document.getElementById("channel-form");
const channelInput = document.getElementById("channel-input");
const videoContainer = document.getElementById("video-container");

const defaultChannel = "automationdirect";

// Form submit and change channel
channelForm.addEventListener("submit", e => {
  e.preventDefault();
  const channel = channelInput.value;
  getChannelInfo(channel);
});

// Load auth2 library
function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

// Init API client library and set up sign in listeners
function initClient() {
  gapi.client.init({
    discoveryDocs: DISCOVERY_DOCS,
    clientId: CLIENT_ID,
    scope: SCOPES
  }).then(() => {
    // Listen for sign in state changes
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    // Handle initial sign in state
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  });
}

// Update UI sign in state changes
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = "none";
    signoutButton.style.display = "block";
    content.style.display = "block";
    videoContainer.style.display = "flex";
    getChannelInfo(defaultChannel);
    requestBasicVideoStats();
  } else {
    authorizeButton.style.display = "block";
    signoutButton.style.display = "none";
    content.style.display = "none";
    videoContainer.style.display = "none";
  }
}

// Handle login
function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn();
}

// Handle logout
function handleSignoutClick() {
  gapi.auth2.getAuthInstance().signOut();
}

// Display channel data
function showChannelData(data) {
  const channelData = document.getElementById("channel-data");
  channelData.innerHTML = data;

}

// Request channel info from Data API channels list
function getChannelInfo(channel) {
  var request = {
    part: "snippet,contentDetails,statistics",
    forUsername: channel
  };
  callDataAPIChannels(request, handleChannelInfo);
}

// Handles channel info response from Data API
function handleChannelInfo(response) {
  const channel = response.result.items[0];

  const output = `
    <ul class="list-group">
      <li class="list-group-item">Title: ${channel.snippet.title}</li>
      <li class="list-group-item">ID: ${channel.id}</li>
      <li class="list-group-item">Subscribers: ${numberWithCommas(channel.statistics.subscriberCount)}</li>
      <li class="list-group-item">Views: ${numberWithCommas(channel.statistics.viewCount)}</li>
      <li class="list-group-item">Videos: ${numberWithCommas(channel.statistics.videoCount)}</li>
    </ul>
    <p>${channel.snippet.description}</p>
    <hr>
    <a class="btn btn-dark" target="_blank" href="https://youtube.com/${channel.snippet.customUrl}">Visit Channel</a>
  `;
  showChannelData(output);

  const playlistId = channel.contentDetails.relatedPlaylists.uploads;
  requestVideoPlaylist(playlistId);
}

function requestVideoPlaylist(playlistId) {
  const request = {
    playlistId: playlistId,
    part: "snippet",
    maxResults: 12
  };
  callDataAPIPlaylists(request, handleVideoPlaylist);
}

function handleVideoPlaylist(response) {
  const playListItems = response.result.items;
  if (playListItems) {
    let output = `<h4 class="text-center col-12">Latest Videos</h4>`;

    // Loop though videos and append output
    playListItems.forEach(item => {
      const videoId = item.snippet.resourceId.videoId;

      output += `
        <div class="col-3">
        <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media;" allowfullscreen></iframe>
        </div>
      `;
    });

    // Output videos
    videoContainer.innerHTML = output;

  } else {
    videoContainer.innerHTML = "No Uploaded Videos";
  }
}

// Request basic video stats from Analytics API
function requestBasicVideoStats() {
  const request = {
    "endDate": "2018-05-01",
    "ids": "channel==MINE",
    "metrics": "views,comments,likes,dislikes,estimatedMinutesWatched,averageViewDuration",
    "startDate": "2017-01-01"
  };
  callAnalyticsAPI(request, handleBasicVideoStats);
}

// Handles basic video stats response from Analytics API
function handleBasicVideoStats(response) {
  if (response) {
    console.log("Response received");
  }
}

// Calls the Analytics API with a request and returns response to callback
function callAnalyticsAPI(request, callback) {
  gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log("Response", response);
      callback(response);
    })
    .catch(err => {
      console.error("Analytics API call error", err);
    });
}

// Calls the Data API for channels with a request and returns response to callback
function callDataAPIChannels(request, callback) {
  gapi.client.youtube.channels.list(request)
    .then(response => {
      console.log("Response", response);
      callback(response);
    })
    .catch(err => {
      console.error("Data API call error", err);
    });
}

// Calls the Data API for playlists with a request and returns response to callback
function callDataAPIPlaylists(request, callback) {
  gapi.client.youtube.playlistItems.list(request)
    .then(response => {
      console.log("Response", response);
      callback(response);
    });
}