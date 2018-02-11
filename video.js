
var div = document.getElementById('data')
div.innerHTML = JSON.stringify(navigator.mediaDevices)

navigator.mediaDevices.enumerateDevices()
.then(function(devices){

  devices.forEach(function(device){
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


})