
var div = document.getElementById('data')
div.innerHTML = JSON.stringify(navigator.mediaDevices)
var selects = document.querySelector('select')

navigator.mediaDevices.enumerateDevices()
.then(function(devices){

  devices.forEach(function(device){
    if(device.kind == 'videoInput'){
        selects.forEach(function(elem){
          elem.append(device.label)
        })     
    }
    console.log(device)
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