let studentName = "";
let studentYearLevel = "";
let studentCollege = "";
let studentCourse = "";


pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.worker.min.js';

//# NO TO AI SLOP 😝;

async function extractText(){ //Function triggered when Extract me button is clicked, mainly for extracting text in pdf.
    const fileInput = document.getElementById('fileInput');
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

            
            let textContentCleaned = cleanTextContent(textContent); //array of objects per line, removed ung spaces/empty lang.

            let extractedSched = extractSchedule(textContentCleaned);// removed unnecessary parts/kept schedule details.

            console.log(studentName)
            console.log(studentCourse)
            console.log(studentYearLevel)
            console.log(studentCollege)


            let groupedSched = groupSchedule(extractedSched); //returns array ng CourseNames and Courses grouped;
            let processedCourseObjects = processCourseObjects(groupedSched); //returns array of courses as objects
            //name = name of course, code = course code, schedules = array of course schedules
            
            groupByDay(processedCourseObjects);

        }
    }
    catch (err){
        console.log("something's wrong - I can feel it.");
        console.log(err);
        alert("Invalid EAF/PDF selected!");
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

                console.log(day)
                console.log(time)
                console.log(room)

                WEEK[day].push([course, time, room]);
            })
                

        })

    }
    catch(err){
        console.error(err);
    }

    console.log(WEEK)
}