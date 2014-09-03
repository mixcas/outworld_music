/*global window, document, $ */
window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;

(function () {
  "use strict";
  // analysis variables
  var waveData = [],
    lastZoom = 0,
    Outworld = {

      // Settings
      sampleAudioURL: 'owm.mp3',
      isPlayingAudio: false,
      isMute: false,
      levelsCount: 4,
      volSens: 0.9,

      // Init
      init: function () {

        // Create an empty project and a view for the canvas:
        this.canvas = document.getElementById('myCanvas');
        this.context = this.canvas.getContext('2d');

        // Set full screen canvas
        this.canvas.width = document.body.clientWidth; //document.width is obsolete
        this.canvas.height = document.body.clientHeight; //document.height is obsolete
        this.canvasRatio = this.canvas.width / this.canvas.height;

        // Create raster for mask
        this.mask = document.getElementById('mask');
        this.maskRatio = this.mask.width / this.mask.height;

        // Draw mask centered and scale 80% of canvas size.
        Outworld.animateWorld(1, 0);

        // Create audio context
        var audioContext = new window.AudioContext();

        // Create analyser node
        this.analyser = audioContext.createAnalyser();

        // Set analyser parameteres
        this.analyser.smoothingTimeConstant = 0.8;
        this.analyser.fftSize = 64;

        // Create volume node
        this.volume = audioContext.createGain();

        // Connect analyser -> volume
        this.analyser.connect(this.volume);

        // Connect volume -> audio context
        this.volume.connect(audioContext.destination);

        this.binCount = this.analyser.frequencyBinCount; // = 512
        this.levelBins = Math.floor(this.binCount / this.levelsCount); //number of bins in each level

        // Create buffer for song
        var source = audioContext.createBufferSource();

        // Connect source -> analyser
        source.connect(this.analyser);

        // Load file asynchronously
        var request = new window.XMLHttpRequest();
        request.open('GET', this.sampleAudioURL, true);
        request.responseType = 'arraybuffer';

        request.onload = function () {
          audioContext.decodeAudioData(request.response, function (buffer) {

            source.buffer = buffer;
            source.start(0);
            source.loop = true;
            this.isPlayingAudio = true;
            setTimeout(function() {
              $('.content').fadeIn(5000);
            }, 300);
              $('#loading').fadeOut(500);
            Outworld.render();

          }, function (e) {
            console.log(e);
          });
        };

        request.send();
      },

      // Clear canvas. Requiered on everyframe
      clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      },

      // Animate world: scale and center mask, change hue.
      // @param {Numeber} scale
      animateWorld: function (scale, hue) {

        // Defaults
        scale = typeof scale !== 'undefined' ? scale : 1;
        hue = typeof hue !== 'undefined' ? hue : 0;

        // Change hue
        if ($('#bg').css('-webkit-filter')) {

          // Get current hue
          var current_hue = $('#bg').css('-webkit-filter').replace('hue-rotate(', '').replace('deg)', '');

          if (Math.abs(current_hue - hue) > 25) {
            $('#bg').css({
              '-webkit-filter': 'hue-rotate(' + hue  + 'deg)',
              'filter': 'hue-rotate(' + hue  + 'deg)'
            });
          }

        }
        // Clear canvas
        Outworld.clear();

        // Draw new scale
        this.context.drawImage(
          this.mask, // Image
          (this.canvas.width - this.canvas.height * 0.8 * this.maskRatio * scale) / 2, // X
          (this.canvas.height - this.canvas.height * 0.8 * scale) / 2, // Y
          this.canvas.height * 0.8 * this.maskRatio * scale, // Width
          this.canvas.height * 0.8 * scale // Height
        );
      },

      analyse: function () {

        var freqByteData = new window.Uint8Array(this.binCount);

        // Get freq analisys data
        this.analyser.getByteFrequencyData(freqByteData);

        // Copy freq data to waveData, modified by volSens
        for (var i = 0; i < this.binCount; i++)
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
          if (this.mask) {
            
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
        this.canvas.width = document.body.clientWidth; //document.width is obsolete
        this.canvas.height = document.body.clientHeight; //document.height is obsolete
        this.canvasRatio = this.canvas.width/this.canvas.height;    


      },

      mute: function() {
        if ( Outworld.isMute ) {
          Outworld.isMute = false;
          Outworld.volume.gain.value = 1;
          document.getElementById('mute').innerHTML = "MUTE &#9785;";
        } else { 
          Outworld.isMute = true;
          Outworld.volume.gain.value = 0;
          document.getElementById('mute').innerHTML = "UNMUTE &#9786;";
        }
      }
    };

  window.onload = function() { 
    Outworld.init();  
    
    var mute = document.getElementById('mute');
    mute.addEventListener("click", Outworld.mute, false);
  }

  window.onresize = function(event) {
    Outworld.resize();
  };
  
})();

