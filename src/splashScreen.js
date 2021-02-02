window.addEventListener('load', () => {
    const splashScreen = document.getElementById('splashScreen');
    const splashScreenText = document.getElementById('splashScreenText');
    const main = document.getElementById('main');
    
    splashScreenText.classList.add('showText');

    setTimeout(() => {
        splashScreen.classList.add('hideSplashScreen');
        main.classList.remove('hide');

        setTimeout(() => {
            splashScreen.classList.add('hide');
        }, 1010);
    }, 2500);
});