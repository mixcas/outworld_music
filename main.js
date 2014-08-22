/*global window */
window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;


// analysis variables
var waveData = []; //waveform - from 0 - 1 . no sound is 0.5. Array [binCount]
//var levelsCount = 4; //should be factor of 512
var past_zoom = 0;

var Outworld = {

  // Settings
  sampleAudioURL: 'owm.mp3',
  isPlayingAudio: false,
  levelsCount: 4,
  volSens: 0.9,
  mask: '',
  analyser: '',

  // Init
  init: function () {
    
    // Create an empty project and a view for the canvas:
    paper.setup(document.getElementById('myCanvas'));

    // Create raster for mask
    mask = new paper.Raster('mask');

    // Move the raster to the center of the view
    mask.position = paper.view.center;

    // Scale mask to fit canvas
    mask.scale((paper.view.size.height * 0.88) / mask.height);
    
    // Redraw Canvas
    paper.view.draw();

    // Create audio context
    var audioContext = new AudioContext();

    // Create analyser node
    analyser = audioContext.createAnalyser();

    // Set analyser parameteres
    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 64;

    // Connect analyser -> audio context
    analyser.connect(audioContext.destination);


    binCount = analyser.frequencyBinCount; // = 512
    levelBins = Math.floor(binCount / this.levelsCount); //number of bins in each level

    // Create buffer for song
    var source = audioContext.createBufferSource();

    // Connect source -> analyser
    source.connect(analyser);

    // Load file asynchronously
    var request = new XMLHttpRequest();
    request.open('GET', this.sampleAudioURL, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
      var buffer;
      audioContext.decodeAudioData(request.response, function(buffer) {

        source.buffer = buffer;
        source.start(0);
        this.isPlayingAudio = true;
        Outworld.render();

      }, function(e) {
        console.log(e);
      });
    };

    request.send();
  },

  analyse: function () {
    
    var freqByteData = new Uint8Array(binCount);
    
    // Get freq analisys data
    analyser.getByteFrequencyData(freqByteData);

    // Copy freq data to waveData, modified by volSens
    for (var i = 0; i < binCount; i++)
      waveData[i] = ((freqByteData[i] - 128) / 128) * this.volSens;

  },

  render: function () {

    // Request animation frame
    window.requestAnimationFrame(Outworld.render);

    // if audio is playing
    if (this.isPlayingAudio) {

      // Get analyser data
      Outworld.analyse();

      // Set zoom level
      var zoom = waveData[0];

      // Set hue level
      var hue = waveData[3] * 360;
       
      // if Mask exist
      if (mask) {

        // if difference with past zoom state is ± 0.02
        if (zoom - past_zoom > 0.02 || zoom - past_zoom < -0.02) {

          // Apply zoom
          mask.scale( ( paper.view.size.height * zoom ) / mask.bounds.height );
          
          // Save new zoom state for future reference
          past_zoom = zoom;

        }

        if($('#bg').css('-webkit-filter') )
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

        paper.view.draw();
      }

    } else {

    }
  },
  resize: function () {
 
    // Move the raster to the center of the view
    mask.position = paper.view.center;

    // Scale mask to fit canvas
    mask.scale((paper.view.size.height * 0.88) / mask.height);
    

    // Redraw Canvas
    paper.view.draw();

  }
};

window.onload = function() { 
  Outworld.init();
}

window.onresize = function(event) {
  Outworld.resize();
};
