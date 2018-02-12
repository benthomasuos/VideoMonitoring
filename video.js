
var dataDiv = $('#data')
dataDiv.html(JSON.stringify(navigator.mediaDevices))
var selects = $('select')
//console.log(selects)

var recorder1 = ''
var recorder2 = ''

navigator.mediaDevices.enumerateDevices()
.then(function(devices){
  console.log(devices)
  selects.each(function(){
    $(this).html('')
  })
  devices.forEach(function(device){
    //console.log(device)
    if(device.kind == 'videoinput'){
      //console.log(device)
     
       
        selects.each(function(){
            var option = $('<option>');
            option.val(device.deviceId) ;
            option.html(device.label)
            console.log(option)
            console.log($(this))
            $(this).append(option)
          
        })     
    }

  })

})
.catch(function(err){
    console.log(err)
})




navigator.mediaDevices.getUserMedia({
        video:true,
        audio:true
}).then(function(stream){
  console.log(stream)
  var video1 = document.getElementById('video1')
   var video2 = document.getElementById('video2')
  video1.srcObject = stream
  video1.play()
  video2.srcObject = stream
  video2.play()


})


function getNewMedia(deviceId, videoElement){
    navigator.mediaDevices.getUserMedia({
      video: {deviceId: deviceId}
      
    }).then(function(stream){
        videoElement.srcObject = stream
        videoElement.play()
        recorder1 = new MediaRecorder(stream)
        recorder2 = new MediaRecorder(stream)
        console.log(recorder1)
  
        
        
        
      
    })
  
}






$('select').on('change', function(evt){
  var deviceId = $(this).find('option:selected').val()
  console.log(deviceId)
  var video = $(this).parent().find('video')
  console.log(video[0])
  getNewMedia(deviceId,video[0])
  
})


      
        $('#recordBtn').on('click', function(evt){

        recorder1.start()
        recorder2.start()
        var chunks = []
        recorder1.ondataavailable = function(e){
          console.log('Data')
          chunks.push(e.data)
          
          
          
          
        }
        
         recorder1.onstop = function(e){
           console.log('Stopped')
          var blob = new Blob(chunks, { 'type' : 'video/mp4;' });
          chunks = [];
          var videoURL = window.URL.createObjectURL(blob);
          var a = document.createElement('a');
          document.body.appendChild(a);
          //a.style = 'display: none';
          a.href = videoURL;
          a.download = 'test.mp4'; 
        }
        

})

        $('#stopBtn').on('click', function(evt){

        recorder1.stop()
        recorder2.stop()
       

})

