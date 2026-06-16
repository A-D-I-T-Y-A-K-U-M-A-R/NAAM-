/* ===========================
   GLOBAL VARIABLES
=========================== */

const page1 = document.getElementById("page1");
const page2 = document.getElementById("page2");

const openBookBtn = document.getElementById("openBookBtn");
const backBtn = document.getElementById("backBtn");

const ramCountEl = document.getElementById("ramCount");
const radhaCountEl = document.getElementById("radhaCount");

const bookContainer = document.getElementById("bookContainer");

const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");

const jumpBtn = document.getElementById("jumpBtn");
const jumpPageInput = document.getElementById("jumpPage");

const printBtn = document.getElementById("printBtn");

/* ===========================
   STORAGE
=========================== */

const STORAGE_KEY = "naam_pustak_storage_v1";

let notebookData = [];
let currentBookPage = 0;

let ramCount = 0;
let radhaCount = 0;

/* ===========================
   LOAD DATA
=========================== */

function loadData() {

    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return;

    try {

        const data = JSON.parse(raw);

        notebookData = data.notebookData || [];
        currentBookPage = data.currentBookPage || 0;

        ramCount = data.ramCount || 0;
        radhaCount = data.radhaCount || 0;

    } catch (e) {

        console.log(e);

    }

}

function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
            notebookData,
            currentBookPage,
            ramCount,
            radhaCount
        })
    );

}

/* ===========================
   COUNTERS
=========================== */

function updateCounts() {

    ramCountEl.textContent = ramCount;
    radhaCountEl.textContent = radhaCount;

}

/* ===========================
   PAGE SWITCHING
=========================== */

openBookBtn.addEventListener("click", () => {

    page1.classList.add("hidden");
    page2.classList.remove("hidden");

    renderNotebook();

});

backBtn.addEventListener("click", () => {

    page2.classList.add("hidden");
    page1.classList.remove("hidden");

});

/* ===========================
   CANVAS
=========================== */

const canvas = document.getElementById("drawingCanvas");

const ctx = canvas.getContext("2d");

let drawing = false;

let inactivityTimer = null;

/* ===========================
   RESIZE
=========================== */

function resizeCanvas() {

    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;

    clearCanvas();

}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

/* ===========================
   CANVAS STYLE
=========================== */

ctx.lineWidth = 4;

ctx.lineCap = "round";

ctx.lineJoin = "round";

ctx.strokeStyle = "#0b3d91";

/* ===========================
   CLEAR
=========================== */

function clearCanvas() {

    ctx.fillStyle = "white";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

}

/* ===========================
   POINTER POSITION
=========================== */

function getPos(e) {

    const rect = canvas.getBoundingClientRect();

    let x;
    let y;

    if (e.touches) {

        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;

    } else {

        x = e.clientX - rect.left;
        y = e.clientY - rect.top;

    }

    return { x, y };

}

/* ===========================
   START DRAW
=========================== */

function startDraw(e) {

    drawing = true;

    const pos = getPos(e);

    ctx.beginPath();

    ctx.moveTo(
        pos.x,
        pos.y
    );

    if (inactivityTimer) {

        clearTimeout(inactivityTimer);

    }

}

/* ===========================
   DRAW
=========================== */

function draw(e) {

    if (!drawing) return;

    const pos = getPos(e);

    ctx.lineTo(
        pos.x,
        pos.y
    );

    ctx.stroke();

}

/* ===========================
   STOP DRAW
=========================== */

function stopDraw() {

    drawing = false;

    startInactivityCheck();

}

/* ===========================
   EVENTS
=========================== */

canvas.addEventListener(
    "mousedown",
    startDraw
);

canvas.addEventListener(
    "mousemove",
    draw
);

window.addEventListener(
    "mouseup",
    stopDraw
);

canvas.addEventListener(
    "touchstart",
    startDraw,
    { passive:false }
);

canvas.addEventListener(
    "touchmove",
    (e)=>{

        e.preventDefault();

        draw(e);

    },
    { passive:false }
);

window.addEventListener(
    "touchend",
    stopDraw
);

/* ===========================
   1 SECOND INACTIVITY
=========================== */

function startInactivityCheck() {

    if (inactivityTimer) {

        clearTimeout(
            inactivityTimer
        );

    }

    inactivityTimer = setTimeout(() => {

        processCanvas();

    }, 1000);

}

/* ===========================
   PROCESS CANVAS
=========================== */

async function processCanvas(){

    try{

        const result =
            await detectName();

        if(result === null){

           /* alert(
                "नाम गलत है।\nकृपया केवल राम या राधा लिखें।"
            );*/

            clearCanvas();

            return;

        }

        addName(result);

        clearCanvas();

    }
    catch(err){

        console.log(err);

       /* alert(
            "नाम पहचानने में त्रुटि हुई।"
        );*/

        clearCanvas();

    }

}

/* ===========================
   SIMPLE DETECTION
=========================== */

/*
   TEMP VERSION

   Abhi OCR nahi hai.

   Testing ke liye:

   Keyboard popup se naam poochega.

   Baad me OCR replace karenge.
*/



/* ===========================
   SAVE NAME
=========================== */

function addName(name){

    notebookData.push(name);

    if(name === "राम"){

        ramCount++;

    }

    if(name === "राधा"){

        radhaCount++;

    }

    updateCounts();

    saveData();

    renderNotebook();

}

/* ===========================
   PAGE CALCULATION
=========================== */

const NAMES_PER_PAGE = 272;

function totalPages(){

    return Math.max(
        1,
        Math.ceil(
            notebookData.length /
            NAMES_PER_PAGE
        )
    );

}
/* ===========================
   RENDER NOTEBOOK
=========================== */

function renderNotebook(){

    updateCounts();

    const total = totalPages();

    if(currentBookPage < 0){
        currentBookPage = 0;
    }

    if(currentBookPage >= total){
        currentBookPage = total - 1;
    }

    bookContainer.innerHTML = "";

    /* COVER PAGE */

    if(currentBookPage === 0){

        const cover = document.createElement("div");

        cover.className = "book-page";

        cover.id = "coverPage";

        cover.innerHTML = `
            <img
                id="coverImage"
                src="cover.webp"
                alt="Cover">
        `;

        bookContainer.appendChild(
            cover
        );

        return;

    }

    /* NOTEBOOK PAGE */

    const page = document.createElement("div");

    page.className =
        "book-page gridPage";

    const grid =
        document.createElement("div");

    grid.className = "grid";

    const startIndex =
        (currentBookPage - 1) *
        NAMES_PER_PAGE;

    const endIndex =
        Math.min(
            startIndex + NAMES_PER_PAGE,
            notebookData.length
        );

    for(let i=0;i<272;i++){

        const cell =
            document.createElement("div");

        cell.className = "cell";

        const dataIndex =
            startIndex + i;

        if(dataIndex < endIndex){

            cell.textContent =
                notebookData[dataIndex];

        }

        grid.appendChild(cell);

    }

    page.appendChild(grid);

    const pageNumber =
        document.createElement("div");

    pageNumber.className =
        "page-number";

    pageNumber.textContent =
        currentBookPage;

    page.appendChild(
        pageNumber
    );

    bookContainer.appendChild(
        page
    );

}

/* ===========================
   OPEN LAST PAGE
=========================== */

function openLastSavedPage(){

    const namesPages =
        Math.ceil(
            notebookData.length /
            NAMES_PER_PAGE
        );

    if(namesPages <= 0){

        currentBookPage = 0;

    }else{

        currentBookPage =
            namesPages;

    }

}
/* ===========================
   PREVIOUS PAGE
=========================== */

prevPageBtn.addEventListener(
    "click",
    () => {

        if(currentBookPage > 0){

            currentBookPage--;

            saveData();

            renderNotebook();

        }

    }
);

/* ===========================
   NEXT PAGE
=========================== */

nextPageBtn.addEventListener(
    "click",
    () => {

        const total =
            totalPages();

        if(
            currentBookPage <
            total
        ){

            currentBookPage++;

            saveData();

            renderNotebook();

        }

    }
);

/* ===========================
   JUMP PAGE
=========================== */

jumpBtn.addEventListener(
    "click",
    () => {

        const pageNo =
            parseInt(
                jumpPageInput.value
            );

        if(
            isNaN(pageNo)
        ){
            return;
        }

        const total =
            totalPages();

        if(
            pageNo >= 0 &&
            pageNo <= total
        ){

            currentBookPage =
                pageNo;

            saveData();

            renderNotebook();

        }

    }
);

/* ===========================
   PRINT BOOK
=========================== */

printBtn.addEventListener(
    "click",
    () => {

        window.print();

    }
);

/* ===========================
   AUTO OPEN LAST PAGE
=========================== */

function goToLatestPage(){

    if(
        notebookData.length === 0
    ){

        currentBookPage = 0;

        return;
    }

    currentBookPage =
        Math.ceil(
            notebookData.length /
            NAMES_PER_PAGE
        );

}

/* ===========================
   INITIALIZE
=========================== */

loadData();

updateCounts();

goToLatestPage();

renderNotebook();

saveData();

/* ===========================
   OPTIONAL TEST DATA
=========================== */

/*
for(let i=0;i<600;i++){

    if(i % 2 === 0){

        notebookData.push("राम");

    }else{

        notebookData.push("राधा");

    }

}

saveData();

renderNotebook();
*/

console.log(
    "Naam Pustak Ready"
);
function getProcessedImage(){

    const tempCanvas =
        document.createElement("canvas");

    tempCanvas.width =
        canvas.width;

    tempCanvas.height =
        canvas.height;

    const tctx =
        tempCanvas.getContext("2d");

    tctx.drawImage(
        canvas,
        0,
        0
    );

    const imageData =
        tctx.getImageData(
            0,
            0,
            tempCanvas.width,
            tempCanvas.height
        );

    const data =
        imageData.data;

    for(
        let i = 0;
        i < data.length;
        i += 4
    ){

        const avg =
            (
                data[i] +
                data[i+1] +
                data[i+2]
            ) / 3;

        if(avg > 180){

            data[i]   = 255;
            data[i+1] = 255;
            data[i+2] = 255;

        }else{

            data[i]   = 0;
            data[i+1] = 0;
            data[i+2] = 0;

        }

    }

    tctx.putImageData(
        imageData,
        0,
        0
    );

    return tempCanvas.toDataURL(
        "image/png"
    );

}
function detectName(){
   let value = prompt("क्या लिखा था?");
}
async function detectName(){

    const image =
    getProcessedImage();

   const result =
    await Tesseract.recognize(
        image,
        "eng+hin",
        {
            logger:m=>console.log(m)
        }
    );

    let text =
        result.data.text
        .trim()
        .toLowerCase();

    text = text.replace(/\s+/g,"");

    console.log(
        "OCR:",
        text
    );

    const ramWords = [

        "ram",
        "raam",
        "राम",

        "rarn",
        "rnm",
        "ram"

    ];

    const radhaWords = [

        "radha",
        "राधा",

        "radhaa",
        "radhaa"

    ];

    for(const word of ramWords){

        if(
            text.includes(
                word.toLowerCase()
            )
        ){

            return "राम";

        }

    }

    for(const word of radhaWords){

        if(
            text.includes(
                word.toLowerCase()
            )
        ){

            return "राधा";

        }

    }

    return null;

}
