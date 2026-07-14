const clearBtn = document.getElementById('clearBtn');

function clearData(){ //FOR TESTING ONLY//
    localStorage.clear();
    console.log("Data successfully cleared!")
    window.location.reload();
}

clearBtn.addEventListener('click', ()=> clearData());