const resetBtn = document.querySelector('.reset');
const saveBtn = document.querySelector('.save');
const undoBtn = document.querySelector('.undo');
const redoBtn = document.querySelector('.redo');
const color = document.querySelector('.color');
const container = document.querySelector('.container');
let historyStack = [];
let historyRedoStack = [];
let sizeEl = document.querySelector('.size');
let size = sizeEl.value;
let draw = false;

function populate(size) {
    container.style.setProperty('--size', size);
    
    for (let i = 0; i < size * size; i++) {
        const box = document.createElement('div');
        box.classList.add('pixel');
        container.appendChild(box);

        // Add mouse events
        box.addEventListener('mouseover', () => {
            if (!draw) return;
            addToHistory(box);
            box.style.background = color.value;
        });
        box.addEventListener('mousedown', (e) => {
            e.preventDefault();
            addToHistory(box);
            box.style.background = color.value;
        });

        // Add touch events for mobile
        box.addEventListener('touchstart', (e) => {
            e.preventDefault();
            draw = true;
            addToHistory(box);
            box.style.background = color.value;
        });
        
        box.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!draw) return;
            const touch = e.touches[0];
            const touchedElement = document.elementFromPoint(touch.clientX, touch.clientY);
            if (touchedElement && touchedElement.classList.contains('pixel')) {
                addToHistory(box);
                touchedElement.style.background = color.value;
            }
        });
    }
}

populate(size);

container.addEventListener('mousedown', (e) => {
    e.preventDefault();
    draw = true;
});

container.addEventListener('mouseup', (e) => {
    e.preventDefault();
    draw = false;
});

// For undo 
let isControledPressed = false;


window.addEventListener('keydown', (e) => {
    if (e.key == 'Control') {
        isControledPressed = true;
    }
    if (e.key == 'z' && isControledPressed) {
        undo();
    }
});
window.addEventListener('keyup', (e) => {
    if (e.key == 'Control') {
        isControledPressed = false;
    }
})


window.addEventListener('keydown', (e) => {
    if (e.key == 'y' && isControledPressed) {
        redo();
    }
});

// For history
function addToHistory(pixel) {
    const previousColor = window.getComputedStyle(pixel).backgroundColor;
    historyStack.push({
        pixel: pixel,
        PrevColor: previousColor
    });

    historyRedoStack = [];
}

function undo() {
    if (historyStack.length == 0) return;
    let lastChange = historyStack.pop();
    
    if (lastChange.pixel) {
        const redoColor =  window.getComputedStyle(lastChange.pixel).backgroundColor;
        historyRedoStack.push({
            pixel: lastChange.pixel,
            nextColor: redoColor
        })
        
        lastChange.pixel.style.background = lastChange.PrevColor;    
    }
}

function redo() {
    if (historyRedoStack.length == 0) return;
    let lastRedo = historyRedoStack.pop();

    if (lastRedo.pixel) {
        const currentColor = window.getComputedStyle(lastRedo.pixel).backgroundColor;
        historyStack.push({
            pixel: lastRedo.pixel,
            PrevColor: currentColor
        });
         
        lastRedo.pixel.style.background = lastRedo.nextColor;    
    }
}

// For touch devices: stop drawing on touchend
container.addEventListener('touchend', (e) => {
    e.preventDefault();
    draw = false;
});

function resetEditor() {
    container.innerHTML = '';
    populate(size);
}

sizeEl.addEventListener('change', () => {
    size = sizeEl.value;
    resetEditor();
});


function savePixelArt() {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');

    const pixels = document.querySelectorAll('.pixel');
    pixels.forEach((pixel, index) => {
        const x = index % size;
        const y = Math.floor(index / size);
        
        const color = window.getComputedStyle(pixel).backgroundColor;
        context.fillStyle = color;
        context.fillRect(x, y, 1, 1);
    });

    const imgURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imgURL;
    link.download = 'pixel-art.png';
    link.click();
}

saveBtn.addEventListener('click', savePixelArt);
resetBtn.addEventListener('click', resetEditor);
undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);