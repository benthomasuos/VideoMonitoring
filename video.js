getDevices()
var dataDiv = $('#data')
//dataDiv.html(JSON.stringify(navigator.mediaDevices))
var selects = $('.cameraSelect')
//console.log(selects)

var recorders = []
var recordingStartTime = null;
var currenTime = ''
var chunks = [[],[]];
var cam1_audio = ''

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var analyser = audioCtx.createAnalyser();

var canvas1_wf = document.getElementById('audioCanvas1_waveform')
var canvas1_freq = document.getElementById('audioCanvas1_freq')
var canvasCtx_wf = canvas1_wf.getContext('2d')
var canvasCtx_freq = canvas1_freq.getContext('2d')

var dataArray_wf = undefined
var bufferLength_wf = undefined
var dataArray_freq = undefined
var bufferLength_freq = undefined
var cameraStream = undefined



setInterval(function(){
  currentTime = new Date()
  $('#realtime').html(currentTime.toTimeString().split(' ')[0])
  if(recordingStartTime != null){
    var recordedTime = (currentTime - recordingStartTime)
    $('#recordedtime').html(new Date(recordedTime).toTimeString().split(' ')[0])
  }
},1000)

function getDevices(){

    navigator.mediaDevices.enumerateDevices()
    .then(function(devices){

        recordingInfo('start')
        allowRecord()
          console.log(devices)
          selects.each(function(){
                $(this).html('')
              })
      devices.forEach(function(device, i){
        //console.log(device)
        if(device.kind == 'videoinput'){
          console.log(device)


            selects.each(function(){
                var option = $('<option>');

                    option.val(device.deviceId);
                    if(device.label){
                        option.html(device.label);
                    }
                    else{
                        option.html('Camera ' + (i+1))
                    }
                //console.log(option)
                //console.log($(this))
                $(this).append(option)

            })
        }

      })
      return navigator.mediaDevices.enumerateDevices()
    })
    .catch(function(err){
        console.log(err)
    })

}



navigator.mediaDevices.getUserMedia({
        video:{
          mandatory: {
                minWidth: 1280,
                minHeight: 720,
                maxWidth: 1920,
                maxHeight: 1080
            }
          },
        frameRate: {ideal: 60, min:10},
        audio:true
}).then(function(stream){
    var options = {
        audioBitsPerSecond : 128000,
        videoBitsPerSecond : 2500000,
        mimeType : 'video/webm'
      }
  console.log(stream)
  var video1 = document.getElementById('video1')
  var video2 = document.getElementById('video2')
  cameraStream = stream.getVideoTracks()[0]
  console.log(cameraStream)
   console.log(cameraStream.getConstraints())
    console.log(cameraStream.getCapabilities())
     console.log(cameraStream.getSettings())
     cameraStream
  video1.srcObject = stream
  video2.srcObject = stream
  recorders[0] = new MediaRecorder(stream, options)
  recorders[1] = new MediaRecorder(stream, options)

  video1.play()
  video2.play()

  console.log(recorders)

  source = audioCtx.createMediaStreamSource(stream);
  source.connect(analyser);
  analyser.fftSize = 4096;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  //dataArray = new Float32Array(bufferLength);





})

$('#camera1_focus_type').on('change', function(){
    var focusMode = $(this).val()
    console.log('Changed focus type to ' + focusMode )
    cameraStream.applyConstraints({
        focusMode: 'manual'
    })
})

$('#camera1_focus_val').on('input', function(){
    var focusVal = $(this).val()
    console.log('Changing focal length to ' + focusVal )
    cameraStream.applyConstraints({
        focusDistance : {exact:focusVal}
    })
})


$('#camera1_wf_check, #camera2_wf_check').on('change', function(){
    if($(this).prop('checked')){
        drawWaveform()
    }
    else if(!$(this).prop('checked')){
        window.cancelAnimationFrame(drawVisual_wf)
        canvasCtx_wf.clearRect(0, 0, 600,  200);
    }

})

$('#camera1_freq_check, #camera2_freq_check').on('change', function(){
    if($(this).prop('checked')){
        drawFreq()
    }
    else if(!$(this).prop('checked')){
        window.cancelAnimationFrame(drawVisual_freq)
        canvasCtx_freq.clearRect(0, 0, 600,  200);
    }

})



function drawWaveform() {
      drawVisual_wf = requestAnimationFrame(drawWaveform);
      analyser.getByteTimeDomainData(dataArray);
      canvasCtx_wf.fillStyle = 'rgb(255, 255, 255)';
      canvasCtx_wf.fillRect(0, 0, 600,  200);
      canvasCtx_wf.lineWidth = 2;
      canvasCtx_wf.strokeStyle = 'rgb(0, 0, 0)';
      canvasCtx_wf.beginPath();
      var sliceWidth = 600 * 1.0 / bufferLength;
      var x = 0;
      for(var i = 0; i < bufferLength; i++) {
        var v = dataArray[i] / 128.0;
        var y = v * 200/2;
        if(i === 0) {
          canvasCtx_wf.moveTo(x, y);
        } else {
          canvasCtx_wf.lineTo(x, y);
        }
        x += sliceWidth;
      }
      canvasCtx_wf.lineTo(canvas1_wf.width, canvas1_wf.height/2);
      canvasCtx_wf.stroke();
    };


function drawFreq() {
      drawVisual_freq = requestAnimationFrame(drawFreq);
      analyser.getByteFrequencyData(dataArray);
      canvasCtx_freq.fillStyle = 'rgb(255, 255, 255)';
      canvasCtx_freq.fillRect(0, 0, 600,  200);
      canvasCtx_freq.lineWidth = 2;
      canvasCtx_freq.strokeStyle = 'rgb(0, 0, 0)';
      canvasCtx_freq.beginPath();
      var barWidth = (590 / bufferLength) * 2.5;
       var barHeight;
       var x = 10;
       for(var i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i];

          canvasCtx_freq.fillStyle = 'rgb(' + (barHeight+200) + ',' + (barHeight) + ',' + (200 - barHeight) + ')';
          canvasCtx_freq.fillRect(x,190-barHeight,barWidth,barHeight);

          x += barWidth;
        }

      canvasCtx_freq.lineTo(canvas1_freq.width, canvas1_freq.height/2);
      canvasCtx_freq.stroke();
    };





















navigator.mediaDevices.ondevicechange = function(e){
    console.log("Something happend " , e)
    getDevices()

}


function getNewMedia(deviceId, videoElement, id){
    //videoElement.stop()
    navigator.mediaDevices.getUserMedia({
      video: {
                deviceId: deviceId,
                minWidth: 1280,
                minHeight: 720,
                maxWidth: 1920,
                maxHeight: 1080,
                minAspectRatio: 1.77
      },
    frameRate: {ideal: 60, min:10},
    audio:true
    }).then(function(stream){
        var options = {
            audioBitsPerSecond : 128000,
            videoBitsPerSecond : 2500000,
            mimeType : 'video/webm'
          }
        console.log('Changing camera', recorders[id])
        videoElement.srcObject = stream
        recorders[id] = new MediaRecorder(stream, options)
        videoElement.play()
        recorders.forEach(function(i,d){
          console.log(i,d)
        })
        //var track = videoElement.addTextTrack('captions', 'Time', 'en')
        //track.mode = 'showing'
        //var cue = new VTTCue(0,1, 'Hey')
        source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 4096;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);




    }).catch(function(err){
        console.log(err)
    })

}

function drawAudio(){




}


$('.headerIcon').on('click', function(){
    $('.headerIcon').each(function(){
        $(this).removeClass('activePage')
    })
    var icon = $(this)
    icon.addClass('activePage')
    var page = icon.attr('page-open')
    console.log(page)
    $('.page').each(function(){
        if($(this).attr('id') == page){

            $(this).show()

        }
        else{
            $(this).hide()
        }
    })


})


$('.cameraSelect').on('change', function(evt){
  var deviceId = $(this).find('option:selected').val()
  console.log(deviceId)
  var video = $(this).parent().find('video')
  console.log(video[0])
  var id = $(this).parent().attr('name')
  console.log(recorders[id-1])
  getNewMedia(deviceId,video[0], (id-1))

})



function allowRecord(){

$('#recordBtn').on('click', function(evt){

        if(!$(this).hasClass('recording')){
            $(this).off('click')
            console.log('Recording now...')
            $(this).addClass('recording')
            recorders.forEach(function(recorder, i){
                $('.cameraSelect').each(function(){
                    $(this).prop( "disabled", true );
                })
                $('#recordBtn').prop( "disabled", true )
                recorder.start()
                recorder.ondataavailable = function(e){
                    chunks[i].push(e.data)
                }
                recorder.onstart = function(e){
                  console.log(e.target.stream.id)
                      recordingStartTime = new Date()
                }

                recorder.onstop = function(e){
                    recordingStartTime = null
                    console.log(chunks)
                    console.log('Preparing chunks: ' + i)
                    allowRecord()
                    $('select').each(function(){
                        $(this).prop( "disabled", false );
                    })
                    $('#recordBtn').prop( "disabled", false )
                   console.log('Stopped recording from cam ' + i )
                   var videoTitle = 'test'
                   var videoURL = URL.createObjectURL(new Blob(chunks[i], {'type': 'video/webm'}));
                   console.log(videoURL)
                   var a = $('#video' + (i+1) + 'Download');
                   a.attr('href', videoURL)
                   console.log(a, i)
                   a[0].download = videoTitle + '_' + (i+1) + '_' + new Date().getTime() +'.webm';
                   a.attr('disabled', false)
                   chunks[i] = [];
                }

                recorder.onerror = function(err){
                    console.log(err)
                }


            })


          }
          else{
            $(this).removeClass('recording')
            console.log(recorders[0].state, recorders[1].state)
          }




})

}

$('#stopBtn').on('click', function(evt){
    $('#recordBtn').removeClass('recording')

    recorders.forEach(function(recorder,i){
        if(recorder.state == 'recording'){
            recorder.stop()
        }
    })


})





function recordingInfo(){
    var div = $('#data').find('div')
        div.html('')
        interval = setInterval(function(){
            div.html(recorders[0].state)

        },200)

}


$("input[type='file']").on("change", function(evt){
    var file = this.files[0]
    var videoElement = $(this).parent().find('video')
    var source = URL.createObjectURL(this.files[0])
    videoElement[0].src = source
    $('video.playback').each(function(){
        this.load()
    })
    $('#playBackSeek').attr("min", 0 )
    $('#playBackSeek').attr("max",videoElement[0].duration )
})


$('#playBackStopBtn').on('click', function(evt){
    $('video.playback').each(function(){
        this.stop()
    })

})

$('#playBackPlayBtn').on('click', function(evt){
    $('video.playback').each(function(){
        this.play()
    })

})
$('#playBackPauseBtn').on('click', function(evt){
    $('video.playback').each(function(){
        this.pause()
    })

})

$('#playBackSeek').on('change', function(){
    var time = $(this).val()
    console.log("Changing playback position")
    $('video.playback').each(function(){
        this.currentTime = time
    })

})

$('#playBackRate').on('input', function(){
    var rate = $(this).val()
    console.log("Changing playback rate")
    $('video.playback').each(function(){
        this.playbackRate = rate
    })

})
