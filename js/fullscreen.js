var doc = document.documentElement;
var fullscreenStatus = "opened";

function openFullscreen() {
    if (doc.requestFullscreen) {
        doc.requestFullscreen();
    } else if (doc.mozRequestFullScreen) {
        doc.mozRequestFullScreen();
    } else if (doc.webkitRequestFullscreen) {
        doc.webkitRequestFullscreen();
    } else if (doc.msRequestFullscreen) {
        doc.msRequestFullscreen();
    }
    fullscreenStatus = "opened";
}

function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
    fullscreenStatus = "closed";
}

function toggleFullscreen() {
    if (fullscreenStatus == "opened") {
        closeFullscreen();
    } else {
        openFullscreen();
    }
    return fullscreenStatus;
}