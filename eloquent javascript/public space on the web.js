let baseurl = "http://localhost:8000/";

const form = document.querySelector("form");
form.addEventListener("submit", (event) => {
    let title = document.querySelector("input").value;
    let content = document.querySelector("textarea").value;
    if (!title || !content) console.log("empty title/content not allowed");
    else {
        let url = baseurl + title;
        fetch(url, { method: "PUT", body: content}).then(res => console.log(res.json()));
        updateList();
    }
    event.preventDefault();
})


const select = document.querySelector("select");

async function updateList(){
    let response = await fetch(baseurl, { method: "GET" });

    let content = await response.text();
    let filelist = content.split("\n");

    while(select.firstChild){
        select.removeChild(select.firstChild);
    }
    for (let f of filelist) {
        let opt = document.createElement("option");
        opt.innerText = f;
        select.appendChild(opt);
    }
    updateTextarea();
}

updateList();

const input = document.querySelector("input");
const textarea = document.querySelector("textarea");
select.addEventListener("change",()=>updateTextarea());

async function updateTextarea(){
    input.value = select.value;
    let url = baseurl + input.value;
    let response = await fetch(url, { method: "GET"});
    textarea.value = await response.text();
}


// given solution
// // Get a reference to the DOM nodes we need
// let filelist = document.querySelector("#filelist");
// let textarea = document.querySelector("#file");

// // This loads the initial file list from the server
// fetch("/").then(resp => resp.text()).then(files => {
//   for (let file of files.split("\n")) {
//     let option = document.createElement("option");
//     option.textContent = file;
//     filelist.appendChild(option);
//   }
//   // Now that we have a list of files, make sure the textarea contains
//   // the currently selected one.
//   loadCurrentFile();
// });

// // Fetch a file from the server and put it in the textarea.
// function loadCurrentFile() {
//   fetch(filelist.value).then(resp => resp.text()).then(file => {
//     textarea.value = file;
//   });
// }

// filelist.addEventListener("change", loadCurrentFile);

// // Called by the button on the page. Makes a request to save the
// // currently selected file.
// function saveFile() {
//   fetch(filelist.value, {method: "PUT",
//                          body: textarea.value});
// }
