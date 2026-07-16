let studentName = "";
let studentYearLevel = "";
let studentCollege = "";
let studentCourse = "";

const extractBtn = document.getElementById('extractBtn');
const fileInput = document.getElementById('fileInput');

extractBtn.addEventListener('click', ()=> extractText());
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.worker.min.js';


fileInput.addEventListener('change', ()=> extractText());

//# NO TO AI SLOP 😝;
//# NO TO AI SLOP 😝;
//# NO TO AI SLOP 😝;
//# NO TO AI SLOP 😝;
//# NO TO AI SLOP 😝;



async function extractText(){ //Function triggered when Extract me button is clicked, mainly for extracting schedule details from pdf.
    const file = fileInput.files[0];

    if (!file){
        alert("Please select your EAF/PDF file first!")
        return;
    }

    try{
        const arrayBuffer = await file.arrayBuffer();
        const pdfFile = await pdfjsLib.getDocument({data: arrayBuffer}).promise;


        for (let i= 1; i <= pdfFile.numPages; i++){
            console.log("received it please wait, processing........")

            const currPage = await pdfFile.getPage(i);
            const textContent = await currPage.getTextContent();

            console.log("Data successfully fetched.");

            studentName = getStudentName(textContent); //gets the name of the student;
            studentCourse = getStudentCourse(textContent); //gets the course of the student;
            studentYearLevel = getStudentYearLevel(textContent); //gets the section of the student;
            studentCollege = getStudentCollege(textContent); //gets the college of the student;

            let studentDetails = [studentName, studentCourse, studentYearLevel, studentCollege]; // for storing in Local Storage

            localStorage.setItem('studentDetails', JSON.stringify(studentDetails)); //store details to lcalStorage;

            let textContentCleaned = cleanTextContent(textContent); //array of objects per line, removed ung spaces/empty lang.

            let extractedSched = extractSchedule(textContentCleaned);// removed unnecessary parts/kept schedule details.

            getScheduleDetails(extractedSched); //throws the cleaned schedule to getScheduleDetails to extract courses and timeline.
        }
    }
    catch (err){
        console.log("something's wrong - I can feel it.");
        console.log(err);
        alert("Invalid EAF/PDF selected!");
        return;

    }
}

function getScheduleDetails(cleanedSchedule){
    try{
        let groupedSched = groupSchedule(cleanedSchedule); //returns array ng CourseNames and Courses grouped;

        let processedCourseObjects = processCourseObjects(groupedSched); //returns array of courses as objects
        //name = name of course, code = course code, schedules = array of course schedules
        
        let weekdays = groupByDay(processedCourseObjects); //returns array grouped by days of the week, [Course instance, time, room];

        localStorage.setItem('weekdays', JSON.stringify(weekdays)); //saves the weekdays array in the local Storage.

        let schedToday = checkSchedToday(weekdays);
        //[0]returns dict containing starting miliseconds as keys and courses object as values.
        //[1] array ng mga startTime values naka sorted na
        //[2] array ng mga endTime values naka sorted na

        let currentState = getSubjectNow(schedToday); //returns course object if there's an ongoing class. returns 'dayAlreadyDone' if all classes already done. returns 'breakTime' if during breakTime/ free time. returns 'dayAboutToStart' if day only about to start. returns 'noClasses' if walang pasok.

    }
    catch(err){
        console.log("something's wrong - I can feel it.");
        console.error(err);
        return;
    }
}

function getStudentName(textContent){ //function for extracting student name. returns fail if cannot be found.
    try{
    let nameLine = textContent.items[12].str;
    if (!nameLine.includes("STUDENT NAME : ")){
        throw new Error("detailsError - Name");
    }
    nameLine = nameLine.replace("STUDENT NAME : ", "");
    nameLine = nameLine.trim();
    return nameLine;
    }
    catch(err){
        console.error(err);
        alert("Some details cannot be found");
        return false;
    }
}

function getStudentCourse(textContent){ //function for getting student course;
    try{
    let courseLine = textContent.items[11].str;
    if (!courseLine.includes("COURSE : ")){
        throw new Error("detailsError - Course");
    }
    courseLine = courseLine.replace("COURSE : ", "");
    courseLine = courseLine.trim();
    return courseLine;
    }
    catch(err){
        console.error(err);
        alert("Some details cannot be found");
        return false;
    }

}

function getStudentYearLevel(textContent){ // function for extracting student Year level;
    try{
        let yearLine = textContent.items[15].str;
        if(!yearLine.includes("YEAR LEVEL : ")){
            throw new Error("detailsError - Year");
        }
        yearLine = yearLine.replace("YEAR LEVEL : ", "").trim().toUpperCase();
        return yearLine;
    }
    catch(err){
        console.error(err);
        alert("Some details cannot be found");
        return false;
    }
}

function getStudentCollege(textContent){ //function for getting student college;
    try{
        let collegeLine = textContent.items[14].str;
        if(!collegeLine.includes("COLLEGE : ")){
            throw new Error("detailsError - College");
        }
        collegeLine = collegeLine.replace("COLLEGE : ", "").trim().toUpperCase();
        return collegeLine;
    }
    catch(err){
        console.error(err);
        alert("Some details cannot be found");
        return false;
    }

}

function cleanTextContent(textContent){
    textContent = textContent.items;
    textContent = textContent.filter(values=>{
        return values.str.trim().length > 0;
    });
    return textContent;
}

function extractSchedule(textContentCleaned){
    let unitsIndex = 0;
    let totalUnitsIndex = 0;
    try{
        for (let i = 0; i < textContentCleaned.length; i++ ){
                if(textContentCleaned[i].str === "UNITS"){
                unitsIndex = i;
                }
                if (textContentCleaned[i].str === "TOTAL UNITS"){
                    totalUnitsIndex = i;
                    console.log("hi")
                    break;
                }
        }}
    catch(err){
        console.error(err);
        return;
    }

    textContentCleaned = textContentCleaned.slice(unitsIndex + 1, totalUnitsIndex);

    return textContentCleaned;
}

function groupSchedule(extractedSched){
    const UNITS = ["1.00", "2.00", "3.00", '4.00', '5.00', '6.00', '7.00', '8.00', '9.00', '10.00'];
    const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
    const schedule = {};
    const courseNames = [];
    let unitsFlag = true;
    let courseCodeAndNameFlag = false;
    let scheduleFlag = false;
    let scheduleText = "";
    let currCourse = "";
    try{
        for (let i = 0; i < extractedSched.length; i++){
            let currItem = extractedSched[i].str;
            let currItemSplitted = currItem.split(" ");
            
            if(unitsFlag){
                courseCodeAndNameFlag = true;
                unitsFlag = false;
                continue;
            }

            if (courseCodeAndNameFlag){
                schedule[currItem] = "";
                currCourse = currItem //change later to course code only
                courseNames.push(currCourse);
                courseCodeAndNameFlag = false;
                continue;
            }

            if (currItemSplitted.some(word => UNITS.includes(word))){ //checks if curr contains UNITS;
                scheduleFlag = false;
                unitsFlag = true;

                if (scheduleText.trim()){
                    schedule[currCourse] = scheduleText.trim();
                }

                scheduleText = "";
                continue;
            }
            
            if (scheduleFlag){
                scheduleText  += currItem;
                continue;
            }

            if (currItemSplitted.some(word => DAYS.includes(word))){//checks if yung curr contains DAYS
                scheduleText += currItem;
                scheduleFlag = true;
                continue;
            }

        }
        
    }
    catch(err){
        console.error(err);
    }
    return [courseNames, schedule];
}

function processCourseObjects(schedule){
    const COURSES = [];
    const courseNames = schedule[0];
    const mainSchedule = schedule[1];
    class Course{
        constructor(name, code, schedules){
            this.name = name;
            this.code = code;
            this.schedules = schedules;
        }
    }
    try{
        courseNames.forEach(course =>{
            const [code, name] = course.split("-");
            let schedules = mainSchedule[course].split(",");
            COURSES.push(new Course(name, code, schedules));
        });

    }
    catch(err){
        console.error(err);
    }
    return COURSES;
}

function groupByDay(courses){

    const WEEK = {
        'MON': [],
        'TUE' : [],
        'WED' : [],
        'THU' : [],
        'FRI' : [],
        'SAT' : [],
        'SUN': []
    }
    try{
        courses.forEach(course=>{
            let courseSched = course.schedules;

            courseSched.forEach(schedule =>{
                let [day, time, room] = schedule.split("|");

                day = day.trim();
                time = time.trim();
                room = room.trim();

                WEEK[day].push([course, time, room]);
            })
        })

    }
    catch(err){
        console.error(err);
    }

    return WEEK;
}

function checkSchedToday(sched){
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    const dayToday = days[2];//ORIGINAL!!: days[new Date().getDay()];// FOR TESTING ONLY CHANGE BACK LATER!!!!!!

    const schedToday = sched[dayToday];

    const startTimeMilliseconds = [];
    const endTimeMilliseconds = [];

    const trackerCourse = {};

    try{
    schedToday.forEach(sched =>{
        let course = sched[0];
        let [startTime, endTime] = sched[1].split("-");

        startTime = parseToMilliseconds(startTime);
        endTime = parseToMilliseconds(endTime);

        startTimeMilliseconds.push(startTime);

        endTimeMilliseconds.push(endTime);

        trackerCourse[startTime] = course;
    });

    startTimeMilliseconds.sort();
    endTimeMilliseconds.sort();

}
    catch(err){
        console.error(err);
        return;
    }
    
    return [trackerCourse, startTimeMilliseconds,endTimeMilliseconds];
}


function getMillisecondsNow(){
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hour = date.getHours();
    const minutes = date.getMinutes();

    return Date.parse(`${month} ${day}, ${year} ${hour}:${minutes}`);
}

function parseToMilliseconds(dateTime){ //dateTime : time nung sched (example: 10:00 AM)
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const joined = `${month} ${day}, ${year} ${dateTime}`;

    return Date.parse(joined);
}

function getSubjectNow(schedArr){

    let [schedToday, startTimeMilliseconds, endTimeMilliseconds] = schedArr;

    let timeNow = Date.parse("July 13, 2026 7:01 AM"); //ORIGINAL: CHANGE LATER!!! getMillisecondsNow();

    if(startTimeMilliseconds.length === 0){
        console.log("No classes today!")

        return 'noClasses';
    }

    for(let i = 0; i < startTimeMilliseconds.length; i++){
        if (timeNow >= startTimeMilliseconds[i]){
            if (timeNow <= endTimeMilliseconds[i]){
                console.log(`${schedToday[startTimeMilliseconds[i]].name} happening now.`)
                
                return schedToday[startTimeMilliseconds[i]]; //returns the course happening atm
            }
            else{
                if (i === (startTimeMilliseconds.length)-1){
                    console.log("No more classes today!")
                    
                    return "dayAlreadyDone"; //returns string dayAlreadyDone
                }
            }

        }
        else{
            if (i > 0){
                console.log("Break time!");

                return "breakTime"; //returns breakTime string
            }
            else{
                console.log("Day about to start soon...");

                return "dayAboutToStart"; //returns day about to start
            }
        }
    }

}


export function checkLocalStorage(){
    try{
    let studentDetails = JSON.parse(localStorage.getItem('studentDetails'));

    let weekdays = JSON.parse(localStorage.getItem('weekdays'));

    if (studentDetails && weekdays){
        let schedToday = checkSchedToday(weekdays);
        let currentState = getSubjectNow(schedToday);
        
        return [studentDetails, weekdays];
    }
    }
    catch(err){
        console.error(err);
        alert('Something went wrong.');
        return;
    }

}



function getFirstName(){
    let name = studentDetails[0];
    let nameWithoutSurname = (name.split(","))[1].trim();
    let firstName = capitalizeFormat((nameWithoutSurname.split(" "))[0]);

    return firstName;
}

function capitalizeFormat(word){
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}




