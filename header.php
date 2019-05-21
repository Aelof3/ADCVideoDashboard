<?php

?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#FF0000">
        <link href="https://fonts.googleapis.com/css?family=Noto+Sans|Roboto&display=swap" rel="stylesheet">
        <title>ADC YouTube Dashboard</title>
        <base href="<?php echo $filePath ?>">
        <link href="css/bootstrap.css" rel="stylesheet"/>
        <link href="css/style.css" rel="stylesheet"/>
        <script src="js/bootstrap.js"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.0/jquery.min.js"></script>
        <script src="js/fullscreen.js"></script>
        <script>
            function toggleFullscreenButton() {
                var fullscreenStatus = toggleFullscreen();
                var fullscreenButton = document.getElementById('fullscreen-button');
                if (fullscreenStatus == "opened") {
                    fullscreenButton.src="/open-iconic/svg/fullscreen-exit.svg";
                } else {
                    fullscreenButton.src="/open-iconic/svg/fullscreen-enter.svg";
                }
            }
        </script>
    </head>
    <body>
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <a class="navbar-brand" href="#">
                <img src="imgs/yt_icon_rgb.png" width="30" height="30" class="d-inline-block align-top" alt="">
                Automation Direct YouTube Dashboard
            </a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" 
                    aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav mr-auto float-right">
                    <li class="navbar-item"><a href="options.php"><img src="/open-iconic/svg/cog.svg" alt="Settings"></a></li>
                    <li class="navbar-item"><img src="/open-iconic/svg/fullscreen-enter.svg" alt="Toggle Fullscreen" 
                            onclick="toggleFullscreenButton()" id="fullscreen-button"></li>
                </ul>
            </div>
        </nav>