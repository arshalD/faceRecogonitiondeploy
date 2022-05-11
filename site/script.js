const imageUpload = document.getElementById('imageUpload')
// var imagetotest = require('./test_images/1.png')
var faceMatcherInterval;

async function faceMatcherFunc(faceMatcher,photo){  
  const container = document.createElement('div')
  let image
  let canvas
  console.log('Loaded')
    if (image) image.remove()
    if (canvas) canvas.remove()

    // console.log(imageUpload.files[0])
    // image = await faceapi.bufferToImage(imageUpload.files[0])
    // console.log(typeof image)
    // console.log(image)
    console.log(photo)
    // container.append(image)
    canvas = faceapi.createCanvasFromMedia(photo)
    container.append(canvas)
    const displaySize = { width: photo.width, height: photo.height }
    faceapi.matchDimensions(canvas, displaySize)
    const detections = await faceapi.detectAllFaces(photo).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    results.forEach((result, i) => {
      console.log(result)
      alert(result.toString())
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
      drawBox.draw(canvas)
    })
}

async function start(photo,username) {
  console.log(photo)
  const container = document.createElement('div')
  container.style.position = 'relative'
  document.body.append(container)
  const labeledFaceDescriptors = await loadLabeledImages(username,photo)
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.4)
  console.log(faceMatcher)
  console.log('faceMatcher')
  faceMatcherInterval = setInterval(()=>{
    console.log('interval running')
    if (labeledFaceDescriptors){
      // faceMatcherFunc(faceMatcher)
    }
  },100)
}

function loadLabeledImages(username,photo) {
  const labels = [username]
  let docRef = db.collection("users").doc(username);
  docRef.get().then((doc) => {
    if (doc.exists) {
      console.log(doc.data().images[0])
      return Promise.all(
        labels.map(async label => {
          
      const descriptions = []
      for (let i = 0; i < 2; i++) {
        let url = doc.data().images[i]
        const options = {
            method: "GET",

        }
        let response = await fetch(url, options)
        if (response.status === 200) {
            
          const imageBlob = await response.blob()
          const imageObjectURL = URL.createObjectURL(imageBlob);
  
          const image = document.createElement('img')
          image.src = imageObjectURL
  
          const detections = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
          descriptions.push(detections.descriptor)
      }
      else {
          console.log("HTTP-Error: " + response.status)
      }
      }
      console.log(label,descriptions)
      let labeledFaceDescriptors  = new faceapi.LabeledFaceDescriptors(label,descriptions)
      let faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.4)
      faceMatcherFunc(faceMatcher,photo)
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
          })
      )
    } else {
        console.log("No such document!");
    }
}).catch((error) => {
    console.log("Error getting document:", error);
});

}
