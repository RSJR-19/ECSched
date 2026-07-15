import { checkLocalStorage } from "./script_logic.js";

const openingScreen = document.getElementById('openingScreen');
const logo = document.getElementById('logo');
const openingBox = document.getElementById('openingBox');
const uploadMenu = document.getElementById('uploadMenu');
const returnMenu = document.getElementById('returnMenu');

const extractBtn = document.getElementById('extractBtn');

let savedItems = checkLocalStorage();

window.addEventListener('load', ()=>{
    setTimeout(()=>{
        openingScreen.classList.add('color-change');

        if(savedItems){
            openingBox.style.border = "5px rgba(0, 0, 0, 0.811) solid";
        }
        else{
            openingBox.style.border = "5px rgba(0, 0, 0, 0.811) dashed";
        }
    }, 700);
})

openingScreen.addEventListener('transitionend', ()=>{
    setTimeout(()=>{
        logo.classList.add('reveal');

        setTimeout(()=>{
            openingBox.classList.add('reveal');

            if(!savedItems){
                displayUploadMenu();
            }
            else{
                displayReturnMenu();
            }
        }, 1000);
    }, 50);
}, {once: true});


function displayUploadMenu(){
    uploadMenu.style.display = "flex";
    setTimeout(()=>{
        uploadMenu.classList.add("reveal");
    },100);
}

function displayReturnMenu(){
    returnMenu.style.display = "flex";
    setTimeout(()=>{
        returnMenu.classList.add("reveal");
    },100);
}
