window.addEventListener('load', async () => {
  const { desktopCapturer, remote } = require('electron');
  const { writeFile } = require('fs');
  const { dialog } = remote;

  let mediaRecorder;
  const recordedChunks = [];

  const videoElement = document.querySelector('video');
  const stopBtn = document.getElementById('stopBtn');
  const startBtn = document.getElementById('startBtn');
  const recording = document.getElementById('recording');

  printSources(await getVideoSources());

  startBtn.addEventListener('click', () => {
    mediaRecorder.start();
    startBtn.textContent = 'Recording';

    startTimer();
    recording.style.animationName = 'recording';
  });

  stopBtn.addEventListener('click', () => {
    mediaRecorder.stop();
    startBtn.textContent = 'Start recording';

    pauseTimer();
    recording.style.animationName = '';
  });

  // Get the available video sources
  async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
      types: ['window', 'screen']
    });

    return inputSources;
  }

  function printSources(sources) {
    const windowWrapper = document.getElementById('windowWrapper');
    const screenWrapper = document.getElementById('screenWrapper');

    windowWrapper.innerHTML = '';
    screenWrapper.innerHTML = '';

    for (const source of sources) {
      const element = document.createElement('div');

      element.style.backgroundImage = `url(${source.thumbnail.toDataURL()})`;
      element.title = source.name;

      element.addEventListener('click', () => {
        selectSource(source);

        document.querySelectorAll('.screen, .window').forEach(v => v.classList.remove('activeSource'));

        element.classList.add('activeSource');
      });

      if (source.id.includes('screen')) {
        element.classList.add('screen');
        screenWrapper.appendChild(element);
      } else {
        element.classList.add('window');
        windowWrapper.appendChild(element);
      }
    }
  }

  // Change the videoSource window to record
  async function selectSource(source) {
    const constraints = {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: source.id
        }
      }
    };

    // Create a Stream
    const stream = await navigator.mediaDevices
      .getUserMedia(constraints);

    // Preview the source in a video element
    videoElement.srcObject = stream;
    videoElement.play();

    // Create the Media Recorder
    const options = { mimeType: 'video/webm; codecs=h264' };
    mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
  }

  // Captures all recorded chunks
  function handleDataAvailable(e) {
    recordedChunks.push(e.data);
  }

  // Saves the video file on stop
  async function handleStop(e) {
    const blob = new Blob(recordedChunks, {
      type: 'video/webm; codecs=h264'
    });

    const buffer = Buffer.from(await blob.arrayBuffer());

    const { filePath } = await dialog.showSaveDialog({
      buttonLabel: 'Save video',
      defaultPath: `DorCast-${Date.now()}.mp4`
    });

    if (filePath) {
      writeFile(filePath, buffer, () => console.log('video saved successfully!'));
    }

    resetTimer();
  }
});