const videoElement = document.getElementById("input");
const canvasElement = document.getElementById("output");
const canvasCtx = canvasElement.getContext("2d");

const onResults = (results) => {
  canvasCtx.save();

  // Clear the canvas
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // Draw the webcam frame to the canvase
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );

  // If the results includes landmarks then it has found a face we can look at.
  if (results.multiFaceLandmarks) {
    // Loop over the groups of landmarks. There is a group for each face
    for (const landmarks of results.multiFaceLandmarks) {
      // Use drawing utils to draw lines around the eyes
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {
        color: "#FF3030",
      });

      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {
        color: "#30FF30",
      });
    }
  }

  canvasCtx.restore();
};

// Create a FaceMesh instance
const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
  },
});

faceMesh.setOptions({
  // Only detect one face at a time
  maxNumFaces: 1,

  // Refine the landmarks so we get extra eye landmarks
  refineLandmarks: true,
});

// Call our onResults callback every time FaceMesh processes a frame
faceMesh.onResults(onResults);

// Start the camera using the camera utils
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement });
  },
  width: 1280,
  height: 720,
});
camera.start();
