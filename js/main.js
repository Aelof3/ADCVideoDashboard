const defaultSettings = 
{
  "cycleSpeed": 10,
  "dashboards": [
    {
      "name": "platform",
      "index": 0,
      "theme": "light"
    },
    {
      "name": "top-ten",
      "index": 1,
      "theme": "light"
      
    },
    {
      "name": "views",
      "index": 2,
      "theme": "light"
      
    },
    {
      "name": "seo",
      "index": 3,
      "theme": "light"
      
    }
  ],
  "footer": "show",
  "numEnabled": 4
};

if (!localStorage.getItem("settings")) {
  localStorage.setItem("settings", JSON.stringify(defaultSettings));
}
currentSettings = JSON.parse(localStorage.getItem("settings"));


// Calls the Analytics API with a request and returns response to callback
function callAnalyticsAPI(request, source, callback) {
  gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log(source, response);
      callback(response);
    })
    .catch(err => {
      console.error("Analytics API call error", err);
    });
}

// Calls the Data API for channels with a request and returns response to 
// callback
function callDataAPIChannels(request, source, callback) {
  gapi.client.youtube.channels.list(request)
    .then(response => {
      console.log(source, response);
      callback(response);
    })
    .catch(err => {
      console.error("Data API call error", err);
    });
}

// Calls the Data API for playlists with a request and returns response to 
// callback
function callDataAPIPlaylists(request, source, callback) {
  gapi.client.youtube.playlistItems.list(request)
    .then(response => {
      console.log(source, response);
      callback(response);
    });
}

// Tests calls to the API
function testAPICalls() {
  var todayDate = getTodaysDate();
  var thirtyDaysAgo = getDateFromDaysAgo(30);
  // requestBasicVideoStats(joinDate, todayDate);
  requestImpressions("2019-04-01", "2019-04-30");
  // requestMostWatchedVideos(thirtyDaysAgo, todayDate, 25);
  // requestSubscribersGained(joinDate, todayDate);
  // requestVideoViewsByTrafficSource(thirtyDaysAgo, todayDate, "mXcDYoz1iMo");
  // requestViewsByDeviceType(joinDate, todayDate);
  // requestViewsByTrafficSource(joinDate, todayDate);
}

// Display channel data
function showChannelData(data) {
  const channelData = document.getElementById("channel-data");
  channelData.innerHTML = data;

}