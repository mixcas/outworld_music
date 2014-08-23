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
  canvas: '',
  context: '',
  ratio: 0,

  // Init
  init: function () {
    
    // Create an empty project and a view for the canvas:
    canvas = document.getElementById('myCanvas');
    context = canvas.getContext('2d');

    // Set full screen canvas
    canvas.width = document.body.clientWidth; //document.width is obsolete
    canvas.height = document.body.clientHeight; //document.height is obsolete

    // Create raster for mask
    mask = document.getElementById('mask');
    ratio = mask.width/mask.height;

    // Draw mask centered and scale 80% of canvas size.
    Outworld.scaleMask(1);
    
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

  clear: function () {
    context.clearRect ( 0, 0, canvas.width, canvas.height );  
  },

  scaleMask: function ( scale ) {
    if ( scale != undefined ) {
      Outworld.clear();
      debugger;
      context.drawImage(
        mask, // Image
        ( canvas.width - canvas.height * 0.8 * ratio * scale ) / 2, // X
        ( canvas.height - canvas.height * 0.8 * scale ) / 2 , // Y
        canvas.height * 0.8 * ratio * scale, // Width
        canvas.height * 0.8 * scale // Height
      );
    }
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
      var zoom = Math.abs(waveData[0]);

      // Set hue level
      var hue = waveData[3] * 360;
       
      // if Mask exist
      if (mask) {
        
        // Apply zoom
        Outworld.scaleMask(zoom);
        
        // Save new zoom state for future reference
        past_zoom = zoom;

        // Get current hue
        if($('#bg').css('-webkit-filter') )
          var current_hue = $('#bg').css('-webkit-filter').replace('hue-rotate(','').replace('deg)','');

        if($('#bg').css('-moz-filter'))
          var current_hue_moz = $('#bg').css('-moz-filter').replace('hue-rotate(','').replace('deg)','');

        if( Math.abs( current_hue - hue) > 20 ) {
          $('#bg').css({
            '-moz-filter':'hue-rotate(' + hue  + 'deg)',
            '-webkit-filter':'hue-rotate(' + hue  + 'deg)',
            '-o-filter':'hue-rotate(' + hue  + 'deg)',
            'filter':'hue-rotate(' + hue  + 'deg)'
          });
        }
          
      }

    } else {

    }
  },
  resize: function () {
 
        // Set full screen canvas
    canvas.width = document.body.clientWidth; //document.width is obsolete
    canvas.height = document.body.clientHeight; //document.height is obsolete


  }
};

window.onload = function() { 
  Outworld.init();  
}

window.onresize = function(event) {
  Outworld.resize();
};



