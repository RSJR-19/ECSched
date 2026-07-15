import { checkLocalStorage } from "./script_logic.js";

const openingScreen = document.getElementById('openingScreen');
const logo = document.getElementById('logo');
const uploadBox = document.getElementById('uploadBox');

const extractBtn = document.getElementById('extractBtn');



window.addEventListener('load', ()=>{
    setTimeout(()=>{
        openingScreen.classList.add('color-change');
    }, 700);
})

openingScreen.addEventListener('transitionend', ()=>{
    setTimeout(()=>{
        logo.classList.add('reveal');

        setTimeout(()=>{
            let savedItems = checkLocalStorage();
            uploadBox.classList.add('reveal');
            if(!savedItems){
                displayUploadMenu();
            }
            else{
                alert("Welcome back, USer!")
            }
        }, 1000);
    }, 50);
}, {once: true});


function displayUploadMenu(){
    setTimeout(()=>{

    },200);

}

