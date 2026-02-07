const paragraphs = [
    "The sun began to set over the horizon, casting a warm orange glow across the tranquil meadow. Flowers swayed gently in the soft evening breeze, and the air was filled with the sweet scent of blooming jasmine.",
    "Technology is constantly evolving, shaping the way we live, work, and communicate. From the smallest microchips to the vast network of the internet, innovation drives progress and opens up new possibilities for the future.",
    "Programming is like solving a complex puzzle. Each line of code is a piece that must fit perfectly into the larger picture. Debugging requires patience and logical thinking to identify and fix errors that might occur.",
    "The deep blue ocean holds many mysteries waiting to be discovered. From colorful coral reefs teeming with life to the dark and silent depths where light cannot reach, the sea is a vast and fascinating world of its own.",
    "Reading books is a wonderful way to expand your knowledge and explore different perspectives. Whether it is a historical novel or a scientific journal, every page offers something new to learn and think about."
];

let timer;
let timeLeft = 60;
let isStarted = false;
let charIndex = 0;
let errors = 0;
let totalCharsTyped = 0;
let mistakeWords = new Set();

const wordDisplay = document.getElementById('word-display');
const mistakesSection = document.getElementById('mistakes-section');
const mistakesList = document.getElementById('mistakes-list');
const typingInput = document.getElementById('typing-input');
const wpmTag = document.getElementById('wpm');
const accuracyTag = document.getElementById('accuracy');
const timerTag = document.getElementById('timer');
const resetBtn = document.getElementById('reset-btn');
const diffBtns = document.querySelectorAll('.diff-btn');

function initTest() {
    const randomIndex = Math.floor(Math.random() * paragraphs.length);
    wordDisplay.innerHTML = "";
    paragraphs[randomIndex].split("").forEach(char => {
        let span = `<span>${char}</span>`;
        wordDisplay.innerHTML += span;
    });
    wordDisplay.querySelectorAll('span')[0].classList.add('current');

    document.addEventListener('keydown', () => typingInput.focus());
    wordDisplay.addEventListener('click', () => typingInput.focus());
}

function startTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        timerTag.innerText = timeLeft + "s";

        // Update WPM real-time
        let wpm = Math.round(((charIndex - errors) / 5) / ((60 - timeLeft) / 60));
        wpmTag.innerText = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;
    } else {
        clearInterval(timer);
        typingInput.disabled = true;
    }
}

function processTyping() {
    const characters = wordDisplay.querySelectorAll('span');
    let typedChar = typingInput.value.split("")[charIndex];

    if (charIndex < characters.length && timeLeft > 0) {
        if (!isStarted) {
            timer = setInterval(startTimer, 1000);
            isStarted = true;
        }

        if (typedChar == null) { // Backspace handling
            if (charIndex > 0) {
                charIndex--;
                if (characters[charIndex].classList.contains('incorrect')) {
                    errors--;
                }
                characters[charIndex].classList.remove('correct', 'incorrect');
            }
        } else {
            if (characters[charIndex].innerText === typedChar) {
                characters[charIndex].classList.add('correct');
            } else {
                errors++;
                characters[charIndex].classList.add('incorrect');

                // Track mistake word
                const fullText = Array.from(characters).map(s => s.innerText).join("");
                const words = fullText.split(" ");
                let currentPos = 0;
                for (let word of words) {
                    if (charIndex >= currentPos && charIndex < currentPos + word.length) {
                        mistakeWords.add(word);
                        updateMistakesUI();
                        break;
                    }
                    currentPos += word.length + 1; // +1 for space
                }
            }
            charIndex++;
            totalCharsTyped++;
        }

        characters.forEach(span => span.classList.remove('current'));
        if (charIndex < characters.length) {
            characters[charIndex].classList.add('current');
        }

        // Accuracy
        let accuracy = Math.round(((charIndex - errors) / charIndex) * 100);
        accuracyTag.innerText = (accuracy < 0 || !accuracy || charIndex === 0) ? '100%' : accuracy + '%';

        // WPM
        let wpm = Math.round(((charIndex - errors) / 5) / ((60 - timeLeft) / 60));
        wpmTag.innerText = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;
    } else {
        clearInterval(timer);
        typingInput.value = "";
    }
}

function updateMistakesUI() {
    if (mistakeWords.size > 0) {
        mistakesSection.classList.remove('hidden');
        mistakesList.innerHTML = "";
        mistakeWords.forEach(word => {
            const chip = document.createElement('span');
            chip.className = 'mistake-chip';
            chip.innerText = word;
            mistakesList.appendChild(chip);
        });
    } else {
        mistakesSection.classList.add('hidden');
    }
}

function resetTest() {
    mistakeWords.clear();
    updateMistakesUI();
    initTest();
    clearInterval(timer);
    timeLeft = parseInt(document.querySelector('.diff-btn.active').dataset.time);
    charIndex = errors = 0;
    isStarted = false;
    typingInput.value = "";
    typingInput.disabled = false;
    timerTag.innerText = timeLeft + "s";
    wpmTag.innerText = 0;
    accuracyTag.innerText = "100%";
}

typingInput.addEventListener('input', processTyping);
resetBtn.addEventListener('click', resetTest);

diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        diffBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        timeLeft = parseInt(btn.dataset.time);
        timerTag.innerText = timeLeft + "s";
        resetTest();
    });
});

initTest();
