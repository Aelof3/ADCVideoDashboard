/* Handles recording data from Google Sheets and saving data to Google Sheets */

// Records category IDs/names from Google Sheet
// Eventually initiates recordVideoListData()
function recordCategoryListData() {
  let categoryList = JSON.parse(localStorage.getItem("categoryListSheet"));
  let categoryTotals = {};
  let columns = {};
  let columnHeaders = categoryList[0];
  for (let i = 0; i < columnHeaders.length; i++) {
    columns[columnHeaders[i]] = i;
  }
  for (let i = 1; i < categoryList.length; i++) {
    let row = categoryList[i];
    let categoryId = row[columns["Category ID"]];
    let level1 = row[columns["L1 Category"]];
    let level2 = row[columns["L2 Category"]];
    let level3 = row[columns["L3 Category"]];
    let name = "";
    let shortName = row[columns["Short Name"]];
    let root = false;
    let leaf = true;

    // Set up name
    if (level2 == undefined || level2 == "") {
      name = level1;
    } else if (level3 == undefined || level3 == "") {
      name = level1 + "->" + level2;
    } else {
      name = level1 + "->" + level2 + "->" + level3;
    }
    // Set up root and leaf
    if (categoryId.slice(-4) == "0000") {
      root = true;
    } else {
      let parentCategoryLvl1 = categoryId.slice(0, -4) + "0000";
      categoryTotals[parentCategoryLvl1].leaf = false;
      if (categoryId.slice(-2) != "00") {
        let parentCategoryLvl2 = categoryId.slice(0, -2) + "00";
        categoryTotals[parentCategoryLvl2].leaf = false;
      }
    }

    categoryTotals[categoryId] = {
      "shortName": shortName,
      "name": name,
      "root": root,
      "leaf": leaf,
      "views": 0,
      "likes": 0,
      "duration": 0,
      "videos": []
    };
  }
  localStorage.removeItem("categoryListSheet");
  localStorage.setItem("categoryTotals", JSON.stringify(categoryTotals));

  requestSpreadsheetData("1LNVjw5Hf2Ykp89jtxaX9itH5NOoudwaz0T74E7flZZg",
      "Video List");
}

// Records video IDs from Google Sheet
// Initiates displayUploadThumbnails() and getAllVideoStats()
function recordVideoListData() {
  let videoList = JSON.parse(localStorage.getItem("videoListSheet"));
  let statsByVideoId = {};
  let uploads = [];
  let columns = {};
  let columnHeaders = videoList[0];
  for (let i = 0; i < columnHeaders.length; i++) {
    columns[columnHeaders[i]] = i;
  }
  for (let i = 1; i < videoList.length; i++) {
    let row = videoList[i];
    let organic = ("TRUE" === row[columns["Organic"]]);
    if (organic) {
      let videoId = row[columns["Video ID"]];
      let title = row[columns["Title"]];
      let publishDate = row[columns["Publish Date"]];
      let duration = row[columns["Duration"]];
      let categoryString = row[columns["Categories"]];
      categoryString.replace(/\s/g, ''); // Removes whitespace
      statsByVideoId[videoId] = {
        "categories": categoryString.split(","),
        "title": title,
        "publishDate": publishDate,
        "duration": duration
      };

      uploads.push(videoId);
    }
  }
  localStorage.removeItem("videoListSheet");
  localStorage.setItem("statsByVideoId", JSON.stringify(statsByVideoId));
  localStorage.setItem("uploads", JSON.stringify(uploads));

  displayUploadThumbnails();
  getAllVideoStats(uploads);
}

// Records category data from Google Sheet to localStorage.categoryStats
function recordCategoryData() {
  let categoriesSheet = JSON.parse(localStorage.getItem("categoriesSheet"));
  let columns = {};
  let columnHeaders = categoriesSheet[0];
  for (var i = 0; i < columnHeaders.length; i++) {
    columns[columnHeaders[i]] = i;
  }
  let categoryStats = [];
  for (var i = 1; i < categoriesSheet.length; i++) {
    let categoryId = categoriesSheet[i][columns["Category ID"]]
    let name = categoriesSheet[i][columns["Name"]];
    let shortName = categoriesSheet[i][columns["Short Name"]];
    let views = parseInt(categoriesSheet[i][columns["Views"]]);
    let likes = parseInt(categoriesSheet[i][columns["Likes"]]);
    let duration = parseInt(categoriesSheet[i][columns["Duration (sec)"]]);
    let avgViews =
        parseFloat(categoriesSheet[i][columns["Average Video Views"]]);
    let avgLikes =
        parseFloat(categoriesSheet[i][columns["Average Video Likes"]]);
    let avgDuration =
        parseFloat(categoriesSheet[i][columns["Average Video Duration"]]);
    let videosString = categoriesSheet[i][columns["Videos"]];
    let videos = videosString.split(",");
    let root = ("TRUE" === categoriesSheet[i][columns["Root"]]);
    let leaf = ("TRUE" === categoriesSheet[i][columns["Leaf"]]);
    categoryStats.push({
      "categoryId": categoryId,
      "name": name,
      "shortName": shortName,
      "views": views,
      "likes": likes,
      "duration": duration,
      "avgViews": avgViews,
      "avgLikes": avgLikes,
      "avgDuration": avgDuration,
      "videos": videos,
      "root": root,
      "leaf": leaf,
    });
  }
  localStorage.removeItem("categoriesSheet");
  localStorage.setItem("categoryStats", JSON.stringify(categoryStats));
}

// Records video data from Google Sheet to localStorage.allVideoStats, .uploads,
// and .statsByVideoId
function recordVideoData() {
  let videoSheet = JSON.parse(localStorage.getItem("videoSheet"));
  let columns = {};
  let columnHeaders = videoSheet[0];
  for (var i = 0; i < columnHeaders.length; i++) {
    columns[columnHeaders[i]] = i;
  }
  let uploads = [];
  let allVideoStats = [];
  let statsByVideoId = {};
  for (var i = 1; i < videoSheet.length; i++) {
    let videoId = videoSheet[i][columns["Video ID"]];
    let title = videoSheet[i][columns["Title"]];
    let viewCount = parseInt(videoSheet[i][columns["Views"]]);
    let likeCount = parseInt(videoSheet[i][columns["Likes"]]);
    let dislikeCount = parseInt(videoSheet[i][columns["Dislikes"]]);
    let duration = parseInt(videoSheet[i][columns["Duration (sec)"]]);
    let commentCount = parseInt(videoSheet[i][columns["Comments"]]);
    let publishDate = videoSheet[i][columns["Publish Date"]].substr(0, 10);
    let row = {
      "videoId": videoId,
      "views": viewCount,
      "likes": likeCount,
      "dislikes": dislikeCount,
      "comments": commentCount
    };
    allVideoStats.push(row);
    if (!statsByVideoId[videoId]) {
      statsByVideoId[videoId] = {};
    }
    statsByVideoId[videoId]["title"] = title;
    statsByVideoId[videoId]["publishDate"] = publishDate;
    statsByVideoId[videoId]["duration"] = duration;
    uploads.push(videoId);
  }
  localStorage.removeItem("videoSheet");
  localStorage.setItem("allVideoStats", JSON.stringify(allVideoStats));
  localStorage.setItem("statsByVideoId", JSON.stringify(statsByVideoId));
  localStorage.setItem("uploads", JSON.stringify(uploads));
}

// Displays graphs on dashboards
function recordGraphDataFromSheets() {
  let graphDataSheet = JSON.parse(localStorage.getItem("graphDataSheet"));
  let graphData = [];
  let columns = {};
  let columnHeaders = graphDataSheet[0];
  for (let i = 0; i < columnHeaders.length; i++) {
    columns[columnHeaders[i]] = i;
  }
  for (let i = 1; i < graphDataSheet.length; i++) {
    let row = graphDataSheet[i];
    let graphId = row[columns["Graph ID"]];
    let data = JSON.stringify(row[columns["Data"]]);
    let layout = JSON.stringify(row[columns["Layout"]]);
    let config = JSON.stringify(row[columns["Config"]]);
    let graphHeight = row[columns["Graph Height"]];
    let graphWidth = row[columns["Graph Width"]];
    let automargin = JSON.stringify(row[columns["Automargin"]]);
    graphData.push({
      "graphId": graphId,
      "data": data,
      "layout": layout,
      "config": config,
      "graphHeight": graphHeight,
      "graphWidth": graphWidth,
      "automargin": automargin
    });
    // Display graphs
    try {
      Plotly.newPlot(graphId, data, layout, config);
      if (automargin != "None") {
        recordGraphSize(graphId, graphHeight, graphWidth, automargin);
      } else {
        recordGraphSize(graphId, graphHeight, graphWidth);
      }
    } catch (err) {
      console.error(err);
    }
  }
  localStorage.removeItem("graphDataSheet");
}

// Displays top video stats on dashboards
function recordTopVideoStatsFromSheets() {
  let topVideoStatsSheet = 
      JSON.parse(localStorage.getItem("topVideoStatsSheet"));
  let columns = {};
  let columnHeaders = topVideoStatsSheet[0];
  for (let i = 0; i < columnHeaders.length; i++) {
    columns[columnHeaders[i]] = i;
  }
  for (let i = 1; i < topVideoStatsSheet.length; i++) {
    let row = topVideoStatsSheet[i];
    let dashboardId = row[columns["Dashboard ID"]];
    let videoId = row[columns["Video ID"]];
    let views = row[columns["Views"]];
    let subscribersGained = row[columns["Subscribers Gained"]];
    let avgViewDuration = row[columns["Average View Duration"]];
    let minutesWatched = row[columns["Estimated Minutes Watched"]];
    let comments = row[columns["Comments"]];
    let likes = row[columns["Likes"]];
    let dislikes = row[columns["Dislikes"]];
    try {
      displayTopVideoTitle(videoId, dashboardId);
      let response = {
        "result": {
          "rows": [
            [
              0,
              views,
              comments,
              likes,
              dislikes,
              minutesWatched,
              avgViewDuration,
              subscribersGained,
              0
            ]
          ]
        }
      };
      handleVideoBasicStats(response, dashboardId);
    } catch (err) {
      console.error(`Dashboard "${dashboardId}" does not exist`, err)
    }
  }
  localStorage.removeItem("topVideoStatsSheet");
}

// Records real time stats from Google Sheet to localStorage.realTimeStats
function recordRealTimeStatsFromSheets() {
  let realTimeStatsSheet =
      JSON.parse(localStorage.getItem("realTimeStatsSheet"));
  let realTimeStats = {};
  let columns = {};
  let columnHeaders = realTimeStatsSheet[0];
  for (let i = 0; i < columnHeaders.length; i++) {
    columns[columnHeaders[i]] = i;
  }
  for (let i = 1; i < realTimeStatsSheet.length; i++) {
    let row = realTimeStatsSheet[i];
    let timeRange = row[columns["Time Range"]];
    let views = row[columns["Views"]];
    let estimatedMinutesWatched = row[columns["Estimated Minutes Watched"]];
    let averageViewDuration = row[columns["Average View Duration"]];
    let netSubscribersGained = row[columns["Subscribers Gained"]];
    realTimeStats[timeRange] = {
      "views": views,
      "estimatedMinutesWatched": estimatedMinutesWatched,
      "averageViewDuration": averageViewDuration,
      "netSubscribersGained": netSubscribersGained,
    };
  }
  localStorage.removeItem("topVideoStatsSheet");
  localStorage.setItem("realTimeStats", JSON.stringify(realTimeStats));
  loadRealTimeStats();
}

// Saves categoryStats to Google Sheets
function saveCategoryStatsToSheets() {
  let categoryStats = JSON.parse(localStorage.getItem("categoryStats"));
  var values = [
    ["Category ID", "Name", "Short Name", "Views", "Likes", "Duration (sec)",
    "Average Video Views", "Average Video Likes", "Average Video Duration",
    "Videos", "Root", "Leaf"]
  ];
  for (var i = 0; i < categoryStats.length; i++) {
    var row = [];
    row.push(categoryStats[i]["categoryId"]);
    row.push(categoryStats[i]["name"]);
    row.push(categoryStats[i]["shortName"]);
    row.push(categoryStats[i]["views"]);
    row.push(categoryStats[i]["likes"]);
    row.push(categoryStats[i]["duration"]);
    row.push(categoryStats[i]["avgViews"]);
    row.push(categoryStats[i]["avgLikes"]);
    row.push(categoryStats[i]["avgDuration"]);
    row.push(categoryStats[i]["videos"].join(","));
    row.push(categoryStats[i]["root"]);
    row.push(categoryStats[i]["leaf"]);
    values.push(row);
  }
  var body = {
    "values": values
  };
  requestUpdateSheetData("1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
      "Category Stats", body);
}

// Saves allVideoStats and statsByVideoId to Google Sheets
function saveVideoStatsToSheets() {
  var values = [
    ["Video ID", "Title", "Views", "Likes", "Dislikes", "Duration (sec)",
        "Comments", "Publish Date"]
  ];
  var allVideoStats = JSON.parse(localStorage.getItem("allVideoStats"));
  var statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
  for (var i = 0; i < allVideoStats.length; i++) {
    var row = [];
    var videoId = allVideoStats[i]["videoId"];
    row.push(videoId);
    row.push(statsByVideoId[videoId]["title"]);
    row.push(allVideoStats[i]["views"]);
    row.push(allVideoStats[i]["likes"]);
    row.push(allVideoStats[i]["dislikes"]);
    row.push(statsByVideoId[videoId]["duration"]);
    row.push(allVideoStats[i]["comments"]);
    row.push(statsByVideoId[videoId]["publishDate"]);
    values.push(row);
  }
  var body= {
    "values": values
  };
  requestUpdateSheetData("1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
      "Video Stats", body);
}

// Saves graphData to Google Sheets
function saveGraphDataToSheets() {
  var values = [
    ["Graph ID", "Data", "Layout", "Config", "Graph Height", "Graph Width",
        "Automargin"]
  ];
  var graphData = JSON.parse(localStorage.getItem("graphData"));
  for (var i = 0; i < graphData.length; i++) {
    var row = [];
    row.push(graphData[i]["graphId"]);
    row.push(JSON.stringify(graphData[i]["data"]));
    row.push(JSON.stringify(graphData[i]["layout"]));
    row.push(JSON.stringify(graphData[i]["config"]));
    row.push(graphData[i]["graphHeight"]);
    row.push(graphData[i]["graphWidth"]);
    row.push(JSON.stringify(graphData[i]["automargin"]));
    values.push(row);
  }
  var body = {
    "values": values
  };
  requestUpdateSheetData("1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
      "Graph Data", body);
}

// Saves topVideoStats to Google Sheets
function saveTopVideoStatsToSheets() {
  var values = [
    ["Dashboard ID", "Video ID", "Views", "Subscribers Gained",
        "Average View Duration", "Estimated Minutes Watched", "Comments",
        "Likes", "Dislikes"]
  ];
  let topVideoStats = JSON.parse(localStorage.getItem("topVideoStats"));
  for (var dashboardId in topVideoStats) {
    if (topVideoStats.hasOwnProperty(dashboardId)) {
      var row = [];
      row.push(dashboardId);
      row.push(topVideoStats[dashboardId]["videoId"]);
      row.push(topVideoStats[dashboardId]["views"]);
      row.push(topVideoStats[dashboardId]["subscribersGained"]);
      row.push(topVideoStats[dashboardId]["avgViewDuration"]);
      row.push(topVideoStats[dashboardId]["minutesWatched"]);
      row.push(topVideoStats[dashboardId]["comments"]);
      row.push(topVideoStats[dashboardId]["likes"]);
      row.push(topVideoStats[dashboardId]["dislikes"]);
      values.push(row);
    }
  }
  var body = {
    "values": values
  };
  requestUpdateSheetData("1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
      "Top Video Stats", body);
}

// Saves realTimeStats to Google Sheets
function saveRealTimeStatsToSheets() {
  var values = [
    ["Time Range", "Views", "Estimated Minutes Watched",
        "Average View Duration", "Subscribers Gained"]
  ];
  let realTimeStats = JSON.parse(localStorage.getItem("realTimeStats"));
  for (var timeRange in realTimeStats) {
    if (realTimeStats.hasOwnProperty(timeRange)) {
      var row = [];
      row.push(timeRange);
      row.push(realTimeStats[timeRange]["views"]);
      row.push(realTimeStats[timeRange]["estimatedMinutesWatched"]);
      row.push(realTimeStats[timeRange]["averageViewDuration"]);
      row.push(realTimeStats[timeRange]["netSubscribersGained"]);
      values.push(row);
    }
  }
  var body = {
    "values": values
  };
  requestUpdateSheetData("1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
      "Real Time Stats", body);
}

// Saves top ten videos by views this month to Google Sheets
function updateTopTenVideoSheet() {
  let now = new Date();
  let firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  if (now - firstDayOfMonth > 432000000) {
    // Update for current month
    let lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    let startDate = getYouTubeDateFormat(firstDayOfMonth);
    let endDate = getYouTubeDateFormat(lastDayOfMonth);
    let month = startDate.substr(0, 7);
    requestMostWatchedVideos(startDate, endDate, 20, month);
  } else {
    // Update for previous month
    firstDayOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 0);
    let lastDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    let startDate = getYouTubeDateFormat(firstDayOfMonth);
    let endDate = getYouTubeDateFormat(lastDayOfMonth);
    let month = startDate.substr(0, 7);
    requestMostWatchedVideos(startDate, endDate, 20, month);
  }
}