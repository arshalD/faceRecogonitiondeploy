const imageUpload = document.getElementById('imageUpload')
// var imagetotest = require('./test_images/1.png')

async function start(photo,username) {
  console.log(photo)
  const container = document.createElement('div')
  container.style.position = 'relative'
  document.body.append(container)
  const labeledFaceDescriptors = await loadLabeledImages(username)
  console.log(labeledFaceDescriptors)
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.4)
  console.log(faceMatcher)
  let image
  let canvas
  console.log('Loaded')
    if (image) image.remove()
    if (canvas) canvas.remove()

    console.log(imageUpload.files[0])
    image = await faceapi.bufferToImage(imageUpload.files[0])
    console.log(typeof image)
    console.log(image)
    container.append(image)
    canvas = faceapi.createCanvasFromMedia(image)
    container.append(canvas)
    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)
    const detections = await faceapi.detectAllFaces(photo).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    results.forEach((result, i) => {
      console.log(result)
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
      drawBox.draw(canvas)
    })
}

function loadLabeledImages(username) {
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
