const openingScreen = document.getElementById('openingScreen');
const logo = document.getElementById('logo');

window.addEventListener('load', ()=>{
    setTimeout(()=>{
        openingScreen.classList.add('color-change');
    }, 700);
})

openingScreen.addEventListener('transitionend', ()=>{
    setTimeout(()=>{
        logo.classList.add('reveal');
    }, 50);
});