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

let firstFrame = true;

const fitCanvasToWindow = () => {
  const { videoHeight, videoWidth } = videoElement;
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;

  const heightRatio = windowHeight / videoHeight;

  canvasElement.height = windowHeight;
  canvasElement.width = Math.min(videoWidth * heightRatio, windowWidth);
};

const processFrame = async () => {
  // We don't know the size of the video until we process a frame.
  // however, we only want to do this once.
  if (firstFrame) {
    firstFrame = false;

    // Resize the canvas
    fitCanvasToWindow();
    window.addEventListener("resize", fitCanvasToWindow);
  }

  await faceMesh.send({ image: videoElement });

  videoElement.requestVideoFrameCallback(processFrame);
};

navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  videoElement.srcObject = stream;

  videoElement.requestVideoFrameCallback(processFrame);
});
