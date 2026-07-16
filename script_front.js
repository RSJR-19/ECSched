import { checkLocalStorage, millisecondsToTime, getSubjectNow, checkSchedToday } from "./script_logic.js";

const openingScreen = document.getElementById('openingScreen');
const logo = document.getElementById('logo');
const openingBox = document.getElementById('openingBox');
const uploadMenu = document.getElementById('uploadMenu');
const returnMenu = document.getElementById('returnMenu');

const extractBtn = document.getElementById('extractBtn');

const fileInput = document.getElementById('fileInput');

const welcomeBackP = document.getElementById('welcomeBackP');

const welcomeScreen = document.getElementById('welcomeScreen');
const dayScreen = document.getElementById('dayScreen');
const dayScreenDay = document.getElementById('dayScreenDay');
const dayScreenTime = document.getElementById('dayScreenTime');

let savedItems = checkLocalStorage();

let weekdays = "";
let studentDetails = "";

let schedToday = "";

let currentState;


window.addEventListener('load', ()=>{
    setTimeout(()=>{
        openingScreen.classList.add('color-change');

        if(savedItems){
            openingBox.style.border = "5px rgba(0, 0, 0, 0.811) solid";
        }
        else{
            openingBox.style.border = "5px rgba(0, 0, 0, 0.811) dashed";
            fileInput.style.display = 'flex';
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
                [studentDetails, weekdays] = savedItems;
                displayReturnMenu();
                let firstName = getFirstName();
                welcomeBackP.innerHTML = `Welcome back, ${firstName}`;

                schedToday = checkSchedToday(weekdays);
            }
        }, 1000);
    }, 50);
}, {once: true});

fileInput.addEventListener('change', ()=>{
    setTimeout(()=>{
        [studentDetails, weekdays] = checkLocalStorage();
        if (studentDetails){
            welcomeScreen.classList.add('reveal');
            console.log(studentDetails);

            schedToday = checkSchedToday(weekdays);

        }
    }, 1000)

});

welcomeScreen.addEventListener('transitionend', ()=>{
    displayWelcomeScreenText();
}, {once: true});

function getFirstName(){
    let name = studentDetails[0];
    let nameWithoutSurname = (name.split(","))[1].trim();
    let firstName = capitalizeFormat((nameWithoutSurname.split(" "))[0]);

    return firstName;
}


function capitalizeFormat(word){
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}


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

function displayWelcomeScreenText(){
    let studentWelcomeDetails = ["WELCOME,", ...studentDetails];

    let i = 0;

    let textInterval = setInterval(()=>{
        let text = document.createElement('p');
        text.textContent = studentWelcomeDetails[i];
        text.className = "welcome-screen-p";

        welcomeScreen.appendChild(text);
        setTimeout(()=>{
           
            let appendText = document.getElementsByClassName("welcome-screen-p")[i];

            appendText.classList.add('reveal');
        }, 100);


        if(i === 5){
            clearInterval(textInterval);
            setTimeout(()=>{
                [...document.getElementsByClassName('welcome-screen-p')].forEach(text =>{text.classList.remove('reveal')});

                displayDayScreen();
            }, 500);
        }
        else{
            i++;
        }

    }, 900)
}

function displayDayScreen(){
    const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

    setTimeout(()=>{
        if(schedToday[1].length === 0){
            dayScreenTime.textContent = "No Classes Today.";
        }
        else{
        console.log(schedToday[1][1])
        let timeStart = millisecondsToTime(schedToday[1][1]);

        let timeEnd = millisecondsToTime(schedToday[2][schedToday[2].length - 1]);

        dayScreenTime.innerHTML = `${timeStart} - ${timeEnd}`;
        }

        dayScreenDay.innerHTML = DAYS[new Date().getDay()];

        dayScreen.classList.add('reveal');

    }, 1300);
    
}