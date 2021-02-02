let startTime;
let tInterval;

function startTimer() {
    startTime = Date.now();
    tInterval = setInterval(getShowTime, 1000);
}

function pauseTimer() {
    clearInterval(tInterval);
}

function resetTimer() {
    const timer = document.getElementById('timer');
    clearInterval(tInterval);

    timer.textContent = '00:00:00';
}

function getShowTime() {
    const timer = document.getElementById('timer');
    const difference = Date.now() - startTime;

    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    timer.textContent = `${('0' + hours).slice(-2)}:${('0' + minutes).slice(-2)}:${('0' + seconds).slice(-2)}`;
}