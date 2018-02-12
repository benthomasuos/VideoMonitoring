getDevices()
var dataDiv = $('#data')
//dataDiv.html(JSON.stringify(navigator.mediaDevices))
var selects = $('select[type="cameraSelect"]')
//console.log(selects)

var recorders = []

var chunks = [[],[]];
var cam1_audio = ''

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var analyser = audioCtx.createAnalyser();
var audioCanvas = document.getElementById('audioCanvas1')


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
        video:true,
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
  video1.srcObject = stream
  video2.srcObject = stream
  recorders[0] = new MediaRecorder(stream, options)
  recorders[1] = new MediaRecorder(stream, options)

  video1.play()
  video2.play()

  console.log(recorders)






})


navigator.mediaDevices.ondevicechange = function(e){
    console.log("Something happend " , e)
    getDevices()

}


function getNewMedia(deviceId, videoElement, recorder){
    //videoElement.stop()
    navigator.mediaDevices.getUserMedia({
      video: {
            deviceId: deviceId
      }
    }).then(function(stream){
        var options = {
            audioBitsPerSecond : 128000,
            videoBitsPerSecond : 2500000,
            mimeType : 'video/webm'
          }
        console.log('Changing camera', recorder)
        videoElement.srcObject = stream
        recorder.stream = stream
        videoElement.play()
         console.log(recorders)

        //var track = videoElement.addTextTrack('captions', 'Time', 'en')
        //track.mode = 'showing'
        //var cue = new VTTCue(0,1, 'Hey')

        /*
        source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.connect(distortion);
        distortion.connect(audioCtx.destination);
        analyser.fftSize = 2048;
        var bufferLength = analyser.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);
        */




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


$('select').on('change', function(evt){
  var deviceId = $(this).find('option:selected').val()
  console.log(deviceId)
  var video = $(this).parent().find('video')
  console.log(video[0])
  var id = $(this).parent().attr('name')
  getNewMedia(deviceId,video[0], recorders[id-1])

})



function allowRecord(){

$('#recordBtn').on('click', function(evt){

        if(!$(this).hasClass('recording')){
            $(this).off('click')
            console.log('Recording now...')
            $(this).addClass('recording')
            recorders.forEach(function(recorder, i){
                $('select').each(function(){
                    $(this).prop( "disabled", true );
                })
                $('#recordBtn').prop( "disabled", true )
                recorder.start()
                recorder.ondataavailable = function(e){
                    chunks[i].push(e.data)
                }

                recorder.onstop = function(e){
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
    var div = $('#data').find('p')
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
