window.addEventListener('load', async () => {
  const { desktopCapturer, remote } = require('electron');
  const { writeFile } = require('fs');
  const { dialog } = remote;

  let mediaRecorder;
  const recordedChunks = [];
  const settings = {
    recording: false
  };

  const videoElement = document.querySelector('video');
  const stopBtn = document.getElementById('stopBtn');
  const startBtn = document.getElementById('startBtn');
  const recording = document.getElementById('recording');

  setInterval(async () => {
    if (!settings.recording) {
      printSources(await getVideoSources());
    }
  }, 5000);

  startBtn.addEventListener('click', () => {
    if (mediaRecorder !== undefined) {
      mediaRecorder.start();
      settings.recording = true;
      startBtn.textContent = 'Recording';

      startBtn.classList.add('disable');
      stopBtn.classList.remove('disable');

      startTimer();
      recording.style.animationName = 'recording';
    }
  });

  stopBtn.addEventListener('click', () => {
    if (mediaRecorder !== undefined) {
      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        settings.recording = false;
        startBtn.textContent = 'Start recording';

        stopBtn.classList.add('disable');
        startBtn.classList.remove('disable');

        pauseTimer();
        recording.style.animationName = '';
      }
    }
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

    if (!equalsInAnyOrder(sources, settings.previousSources)) {
      windowWrapper.innerHTML = '';
      screenWrapper.innerHTML = '';

      for (const source of sources) {
        const element = document.createElement('div');
  
        element.style.backgroundImage = `url(${source.thumbnail.toDataURL()})`;
        element.title = source.name;
  
        element.addEventListener('click', () => {
          selectSource(source);
          
          document.querySelectorAll('.screen, .window').forEach(v => v.classList.remove('activeSource'));
          
          settings.sourceId = source.id;
          element.classList.add('activeSource');
          startBtn.classList.remove('disable');
        });
  
        if (source.id.includes('screen')) {
          element.className = settings.sourceId === source.id ? 'screen activeSource' : 'screen';
          screenWrapper.appendChild(element);
        } else {
          element.className = settings.sourceId === source.id ? 'window activeSource' : 'window';
          windowWrapper.appendChild(element);
        }
      }
    }

    settings.previousSources = sources;
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
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

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

  // compare arrays if they match in any order
  function equalsInAnyOrder(a, b) {
    if (a === undefined || b === undefined) 
      return false;

    if (a.length !== b.length)
      return false;

    a = a.sort((s1, s2) => s1.id > s2.id);
    b = b.sort((s1, s2) => s1.id > s2.id);

    return JSON.stringify(a) === JSON.stringify(b);
  }
});