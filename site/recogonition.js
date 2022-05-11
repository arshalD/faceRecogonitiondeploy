
function stopStreamedVideo(videoElem) {
  const stream = videoElem.srcObject;
  const tracks = stream.getTracks();

  tracks.forEach(function(track) {
    track.stop();
  });

  videoElem.srcObject = null;
}

function detectFace (userName) {    
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var video = document.getElementById('videoElement');
    var data =[]
    /////////////////////////////////////////////////////////////////
    if (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia) {
              navigator.mediaDevices.getUserMedia({ video: true,
                    audio:false })
                .then(function (stream) {
                  video.srcObject = stream;
                })
                .catch(function (err) {
                  console.log("Something went wrong!");
                });
            }
    ///////////////////////////////////////////////////////////////
    video.addEventListener('play',function()
                          {
        draw(this, context,640,480);
    },false);
    function takepicture(sx,sy,swidth,sheight) {
        let context = canvas.getContext('2d');
            let width = canvas.width ;
            let height = canvas.height  ;
            context.drawImage(video,0, 0, width, height);
    
            data.push(canvas.toDataURL('image/png'));
            console.log(data)
            console.log(typeof data)
            let photo = document.getElementById('img')
            photo.setAttribute('src', data[0]);
            console.log(photo)
            stopStreamedVideo(video)
            Promise.all([
              faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
              faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
              faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
            ]).then(start(photo,userName))

    }
    ///////////////////////////////////////////////////////////////
    async function draw(video,context, width, height){
        context.drawImage(video,0,0,width,height);
        const model = await blazeface.load();
        const predictions = await model.estimateFaces(video, false);
        ///////////////////////////////////////////////////////////
          if (predictions.length > 0){
           console.log(predictions);
           takepicture()
           for (let i = 0; i < predictions.length; i++) {
            const start = predictions[i].topLeft;
            const end = predictions[i].bottomRight;
            var probability = predictions[i].probability;
            const size = [end[0] - start[0], end[1] - start[1]];
            /////////////////////////////////////////////////////
            context.beginPath();
            context.lineWidth = "5";
            context.strokeStyle="blue";
            context.rect(start[0], start[1],size[0], size[1]);
            takepicture(start[0], start[1],size[0], size[1]);
            
            /////////////////////////////////////////////////////
            const landmarks = predictions[i].landmarks;
            const right_eye = landmarks[0];
            context.fillRect(right_eye[0],right_eye[1],8,8);
            const left_eye = landmarks[1];
            context.fillRect(left_eye[0],left_eye[1],8,8);
            const nose = landmarks[2];
            context.fillRect(nose[0],nose[1],8,8);
            const mouth = landmarks[3];
            context.fillRect(mouth[0],mouth[1],8,8);
            const right_ear = landmarks[4];
            context.fillRect(right_ear[0],right_ear[1],8,8);
            const left_ear = landmarks[5];
            context.fillRect(left_ear[0],left_ear[1],8,8);
            /////////////////////////////////////////////////////
            context.stroke();
            var prob = (probability[0]*100).toPrecision(5).toString();
            var text = "Confidence:"+prob+"%";
            context.font = "16pt Comic Sans MS";
            context.fillStyle = "#FF0000";
            context.fillText(text,start[0]+5,start[1]+20);
           }
            //////////////////////////////////////////////////////
           }
        setTimeout(draw,500,video,context,width,height);
        /////////////////////////////////////////////////////////
    }
}
function startFetching() {
  let userName = document.getElementById('username').value
  let docRef = db.collection("users").doc("labels");
  let authObject = {}
  docRef.get().then((doc) => {
      if (doc.exists) {
          console.log("Document data:", doc.data());
          console.log(doc.data().names);
          if(doc.data().names.indexOf(userName) === -1) {
              console.log("error in username")
              authObject.status = false;
              authObject.message = "Wrong username"
          }
          else{//runs if user exists
              console.log("Initializing recogonition")
              detectFace(userName)
          }
      } else {
          console.log("No such document!");
      }
  }).catch((error) => {
      console.log("Error getting document:", error);
  });
}

var verifyBtn = document.getElementById('verify-btn');

verifyBtn.addEventListener('click',startFetching)