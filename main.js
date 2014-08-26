/*global window */
window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;

// analysis variables
var waveData = [];
var lastZoom = 0;

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
  maskRatio: 0,
  canvasRatio: 0,

  // Init
  init: function () {
    
    // Create an empty project and a view for the canvas:
    canvas = document.getElementById('myCanvas');
    context = canvas.getContext('2d');

    // Set full screen canvas
    canvas.width = document.body.clientWidth; //document.width is obsolete
    canvas.height = document.body.clientHeight; //document.height is obsolete
    canvasRatio = canvas.width/canvas.height;    

    // Create raster for mask
    mask = document.getElementById('mask');
    maskRatio = mask.width/mask.height;
      
    // Draw mask centered and scale 80% of canvas size.
    Outworld.animateWorld(1,0);
    
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

  // Clear canvas. Requiered on everyframe
  clear: function () {
    context.clearRect ( 0, 0, canvas.width, canvas.height );  
  },
  
  // Animate world: scale and center mask, change hue.
  // @param {Numeber} scale
  animateWorld: function ( scale, hue ) {

    // Defaults
    scale = typeof scale !== 'undefined' ? scale : 1;
    hue = typeof hue !== 'undefined' ? hue : 0;

    // Change hue
    if($('#bg').css('-webkit-filter') ) {

      // Get current hue
      var current_hue = $('#bg').css('-webkit-filter').replace('hue-rotate(','').replace('deg)','');

      if( Math.abs( current_hue - hue) > 10 ) {
        $('#bg').css({
          '-webkit-filter':'hue-rotate(' + hue  + 'deg)',
          'filter':'hue-rotate(' + hue  + 'deg)'
        });
      }

    }
    // Clear canvas
    Outworld.clear();

    // Draw new scale
    context.drawImage(
      mask, // Image
      ( canvas.width - canvas.height * 0.8 * maskRatio * scale ) / 2, // X
      ( canvas.height - canvas.height * 0.8 * scale ) / 2 , // Y
      canvas.height * 0.8 * maskRatio * scale, // Width
      canvas.height * 0.8 * scale // Height
    );
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
        Outworld.animateWorld(zoom, hue);
        
        // Save new zoom state for future reference
        lastZoom = zoom;
          
      }

    } else {

    }
  },
  resize: function () {
 
    // Set full screen canvas
    canvas.width = document.body.clientWidth; //document.width is obsolete
    canvas.height = document.body.clientHeight; //document.height is obsolete
    canvasRatio = canvas.width/canvas.height;    


  }
};

window.onload = function() { 
  Outworld.init();  
}

window.onresize = function(event) {
  Outworld.resize();
};



