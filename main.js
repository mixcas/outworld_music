function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var canvas, mask;

window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;
var source;
var buffer;
var audioBuffer;
var dropArea;
var audioContext;
var processor;
var analyser;
var sampleAudioURL = 'owm.mp3';
var isPlayingAudio = false;

// analysis variables
var waveData = []; //waveform - from 0 - 1 . no sound is 0.5. Array [binCount]
var levelsCount = 4; //should be factor of 512
var levelHistory = []; //last 256 ave norm levels
var volSens = 1;
var past_zoom = 0;

var mask_size;

var audio = {
  init: function() {
    audioContext = new AudioContext();

    analyser = audioContext.createAnalyser();
    analyser.smoothingTimeConstant = 0.8; //0<->1. 0 is no time smoothing
    analyser.fftSize = 64;
    analyser.connect(audioContext.destination);
    binCount = analyser.frequencyBinCount; // = 512
    levelBins = Math.floor(binCount / levelsCount); //number of bins in each level
    freqByteData = new Uint8Array(binCount);
    timeByteData = new Uint8Array(binCount);

    // init sound
    source = audioContext.createBufferSource();
    source.connect(analyser);

    // Load asynchronously
    var request = new XMLHttpRequest();
    request.open('GET', sampleAudioURL, true);
    request.responseType = 'arraybuffer';


    request.onload = function() {
      audioContext.decodeAudioData(request.response, function(buffer) {

        source.buffer = buffer;
        source.start(0);
        isPlayingAudio = true;

      }, function(e) {
        console.log(e);
      });
    };

    request.send();
  },
  analyse: function() {
    //analyser.getByteTimeDomainData(timeByteData);
    analyser.getByteFrequencyData(timeByteData);

    for (var i = 0; i < binCount; i++) {
      waveData[i] = ((timeByteData[i] - 128) / 128) * volSens;
    }
  },
  render: function() {

    window.requestAnimationFrame(audio.render);

    if (isPlayingAudio) {

      audio.analyse();

      var shiftx = waveData[getRandomInt(50, 60)];
      var shifty = waveData[getRandomInt(410, 470)];

      var zoom = waveData[0] * 0.6;
      var hue = waveData[3] * 360;
       
      //var mask = $('#mask');
      if (mask) {
        if (zoom - past_zoom > 0.02 || zoom - past_zoom < -0.02) {
          mask.scale( ( paper.view.size.height * zoom ) / mask.bounds.height );
          
          past_zoom = zoom;
          var opacity = (zoom * 9) - 1;
          //mask.css('transform','scale(' + zoom + ',' + zoom + ')').css('opacity', opacity);
        }

        if($('#bg').css('-webkit-filter'))
          var current_hue = $('#bg').css('-webkit-filter').replace('hue-rotate(','').replace('deg)','');

        if($('#bg').css('-moz-filter'))
          var current_hue_moz = $('#bg').css('-moz-filter').replace('hue-rotate(','').replace('deg)','');

        if( Math.abs( current_hue - hue) > 30 ) {
        $('#bg').css({
            '-moz-filter':'hue-rotate(' + hue  + 'deg)',
            '-webkit-filter':'hue-rotate(' + hue  + 'deg)',
            '-o-filter':'hue-rotate(' + hue  + 'deg)',
            'filter':'hue-rotate(' + hue  + 'deg)'
          });
        }
          
        $('#test-bar').css('width', zoom * 100  + 'px');

/*
        if (shiftx > 0.005) {
          mesh.rotation.x += shiftx;
        } else {
          mesh.rotation.x += 0.005;
        }

        if (shifty > 0.005) {
          mesh.rotation.y += shifty;
        } else {
          mesh.rotation.y += 0.005;
        }

        if (camera.position.z < 3.6) {
          camera.position.z = (camera.position.z * (zoom + 1.75));
        }

        camera.position.z = (camera.position.z * (zoom + 1));
        */
        paper.view.draw();
      }

    } else {
/*
      if (mesh) {

        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.005;

      }
*/

    }
  }
};

window.onload = function() {
  // Get a reference to the canvas object
  canvas = document.getElementById('myCanvas');
  // Create an empty project and a view for the canvas:
  paper.setup(canvas);

  // Create a raster from bg
  bg = new paper.Raster('bg');

  // Scale bg to cover entire canvas
  if( paper.view.bounds.width > paper.view.bounds.height ) {
    bg.scale(paper.view.bounds.height / bg.bounds.height)
  }

  // Move the raster to the center of the view
  bg.position = paper.view.center;

  // Create raster from bg
  mask = new paper.Raster('mask');

  // Move the raster to the center of the view
  mask.position = paper.view.center;

  // Scale mask to fit canvas
  mask.scale((paper.view.size.height * 0.88) / mask.height);
  

  // Redraw Canvas
  paper.view.draw();
  
  audio.init();
  audio.render();

}

window.onresize = function(event) {
  if( paper.view.bounds.width > paper.view.bounds.height ) {
    bg.scale(paper.view.bounds.height / bg.bounds.height)
  }

  // Move the raster to the center of the view
  bg.position = paper.view.center;

  
  // Move the raster to the center of the view
  mask.position = paper.view.center;

  // Scale mask to fit canvas
  mask.scale((paper.view.size.height * 0.88) / mask.height);
  

  // Redraw Canvas
  paper.view.draw();

};


