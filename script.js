let studentName = "";
let studentYearLevel = "";
let studentCollege = "";

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.worker.min.js';

//# NO TO AI SLOP 😝
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
        let extractedTextRaw = "";

        for (let i= 1; i <= pdfFile.numPages; i++){
            console.log("received it please wait........")
            const currPage = await pdfFile.getPage(i);
            const textContent = await currPage.getTextContent();
            console.log(textContent);
            studentName = getStudentName(textContent); //gets the name of the student;
            studentYearLevel = getStudentYearLevel(textContent); //gets the section of the student;
            studentCollege = getStudentCollege(textContent); //gets the college of the student;

            console.log(studentName)
            console.log(studentYearLevel)
            console.log(studentCollege)



        }
    }
    catch (err){
        console.log("something's wrong");
        console.log(err);

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

function getStudentYearLevel(textContent){
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

function getStudentCollege(textContent){
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

async function extractTor() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
            
    if (!file) {
                alert('Please select a PDF file first!');
                return;
            }

            try {
                // Read file as ArrayBuffer
                const arrayBuffer = await file.arrayBuffer();
                
                // Load PDF
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                
                let fullText = '';
                
                // Loop through all pages
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += `Page ${i}:\n${pageText}\n\n`;
                }
                
                // Show result
                document.getElementById('output').textContent = fullText || 'No text found in this PDF';
                
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to extract text. Make sure the PDF is not corrupted.');
            }
        }




