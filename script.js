// Game State
let selectedTasks = [];
let currentTaskIndex = 0;
let timerInterval = null;
let timeRemaining = 0;
let isPaused = false;
let totalTime = 0;

// Task definitions with emojis
const taskEmojis = {
    'homework': '📚',
    'brush-teeth': '🪥',
    'pjs': '👕',
    'clean-toys': '🧸',
    'mom-work': '🤫',
    'bath': '🛁',
    'legos': '🧱',
    'read-book': '📖',
    'clothes': '👔',
    'backpack': '🎒',
    'quiet-time': '🧘',
    'wash-face': '💧'
};

const taskNames = {
    'homework': 'Do Homework',
    'brush-teeth': 'Brush Teeth',
    'pjs': 'Put PJs On',
    'clean-toys': 'Clean Up Toys',
    'mom-work': 'Mom Work Time',
    'bath': 'Bath or Shower',
    'legos': 'Legos Alone',
    'read-book': 'Read a Book',
    'clothes': 'Set Out Clothes',
    'backpack': 'Pack Backpack',
    'quiet-time': 'Quiet Time',
    'wash-face': 'Wash Face'
};

// DOM Elements
const taskSelectionScreen = document.getElementById('task-selection');
const timerScreen = document.getElementById('timer-screen');
const celebrationScreen = document.getElementById('celebration-screen');
const victoryScreen = document.getElementById('victory-screen');

const taskButtons = document.querySelectorAll('.task-button');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const resetButton = document.getElementById('reset-button');
const doneButton = document.getElementById('done-button');
const nextTaskButton = document.getElementById('next-task-button');
const finishButton = document.getElementById('finish-button');
const playAgainButton = document.getElementById('play-again-button');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupTaskSelection();
    setupTimerControls();
});

function setupTaskSelection() {
    taskButtons.forEach(button => {
        button.addEventListener('click', () => {
            const taskId = button.dataset.task;
            const taskTime = parseInt(button.dataset.time);

            if (button.classList.contains('selected')) {
                // Deselect
                button.classList.remove('selected');
                selectedTasks = selectedTasks.filter(t => t.id !== taskId);
            } else if (selectedTasks.length < 3) {
                // Select
                button.classList.add('selected');
                selectedTasks.push({
                    id: taskId,
                    name: button.textContent.split('\n')[0].trim(),
                    time: taskTime
                });
            } else {
                // Maximum 3 tasks
                playSound('error');
                return;
            }

            updateSelectedDisplay();
            playSound('select');
        });
    });

    startButton.addEventListener('click', () => {
        if (selectedTasks.length === 3) {
            startGame();
        }
    });
}

function updateSelectedDisplay() {
    for (let i = 0; i < 3; i++) {
        const slot = document.getElementById(`selected-${i + 1}`);
        if (selectedTasks[i]) {
            slot.textContent = selectedTasks[i].name;
            slot.style.color = '#4CAF50';
        } else {
            slot.textContent = 'Choose...';
            slot.style.color = '#999';
        }
    }

    startButton.disabled = selectedTasks.length !== 3;
}

function setupTimerControls() {
    pauseButton.addEventListener('click', togglePause);
    resetButton.addEventListener('click', resetTimer);
    doneButton.addEventListener('click', completeTask);
    nextTaskButton.addEventListener('click', nextTask);
    finishButton.addEventListener('click', showVictory);
    playAgainButton.addEventListener('click', resetGame);
}

function startGame() {
    currentTaskIndex = 0;
    showScreen(timerScreen);
    startTask(0);
    playSound('start');
}

function startTask(index) {
    const task = selectedTasks[index];
    totalTime = task.time * 60; // Convert to seconds
    timeRemaining = totalTime;
    isPaused = false;

    document.getElementById('current-task-name').textContent = task.name;
    updateProgressDots();
    updateTimerDisplay();
    startTimer();

    pauseButton.textContent = '⏸️ Pause';
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        if (!isPaused && timeRemaining > 0) {
            timeRemaining--;
            updateTimerDisplay();
            updateTimerCircle();

            if (timeRemaining === 0) {
                clearInterval(timerInterval);
                playSound('complete');
                celebrateTask();
            }
        }
    }, 1000);
}

function togglePause() {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? '▶️ Play' : '⏸️ Pause';
    playSound('click');
}

function resetTimer() {
    timeRemaining = totalTime;
    updateTimerDisplay();
    updateTimerCircle();
    playSound('click');
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('timer-display').textContent =
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateTimerCircle() {
    const progress = (totalTime - timeRemaining) / totalTime;
    const circumference = 2 * Math.PI * 140;
    const offset = circumference - (progress * circumference);
    document.getElementById('timer-progress').style.strokeDashoffset = offset;
}

function updateProgressDots() {
    for (let i = 1; i <= 3; i++) {
        const dot = document.getElementById(`dot-${i}`);
        dot.classList.remove('completed', 'current');

        if (i - 1 < currentTaskIndex) {
            dot.classList.add('completed');
        } else if (i - 1 === currentTaskIndex) {
            dot.classList.add('current');
        }
    }
}

function completeTask() {
    if (timerInterval) clearInterval(timerInterval);
    celebrateTask();
    playSound('complete');
}

function celebrateTask() {
    const messages = [
        '🎉 Awesome Job! 🎉',
        '⭐ You\'re a Star! ⭐',
        '🌟 Amazing! 🌟',
        '💪 Super Strong! 💪',
        '🏆 Champion! 🏆'
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    document.getElementById('celebration-message').textContent = randomMessage;

    if (currentTaskIndex === 2) {
        // Last task completed
        nextTaskButton.style.display = 'none';
        finishButton.style.display = 'block';
    } else {
        nextTaskButton.style.display = 'block';
        finishButton.style.display = 'none';
    }

    showScreen(celebrationScreen);
    createConfetti();
}

function nextTask() {
    currentTaskIndex++;
    showScreen(timerScreen);
    startTask(currentTaskIndex);
    playSound('start');
}

function showVictory() {
    const completedList = document.getElementById('completed-list');
    completedList.innerHTML = '';

    selectedTasks.forEach(task => {
        const div = document.createElement('div');
        div.textContent = `✅ ${task.name}`;
        completedList.appendChild(div);
    });

    showScreen(victoryScreen);
    createFireworks();
    playSound('victory');
}

function resetGame() {
    // Reset all state
    selectedTasks = [];
    currentTaskIndex = 0;
    timeRemaining = 0;
    totalTime = 0;
    isPaused = false;

    if (timerInterval) clearInterval(timerInterval);

    // Reset UI
    taskButtons.forEach(button => button.classList.remove('selected'));
    updateSelectedDisplay();

    showScreen(taskSelectionScreen);
    playSound('click');
}

function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

// Visual Effects
function createConfetti() {
    const colors = ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#FFA500'];
    const celebrationContent = document.querySelector('#celebration-screen .celebration-content');

    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-10px';
            confetti.style.borderRadius = '50%';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '9999';

            document.body.appendChild(confetti);

            const fallDuration = 2000 + Math.random() * 1000;
            const swayAmount = (Math.random() - 0.5) * 200;

            confetti.animate([
                {
                    transform: 'translateY(0) translateX(0) rotate(0deg)',
                    opacity: 1
                },
                {
                    transform: `translateY(${window.innerHeight}px) translateX(${swayAmount}px) rotate(${Math.random() * 360}deg)`,
                    opacity: 0
                }
            ], {
                duration: fallDuration,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });

            setTimeout(() => confetti.remove(), fallDuration);
        }, i * 30);
    }
}

function createFireworks() {
    const colors = ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#FFA500', '#FF6347'];

    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * (window.innerHeight * 0.7);

            for (let j = 0; j < 20; j++) {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.width = '8px';
                particle.style.height = '8px';
                particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                particle.style.borderRadius = '50%';
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '9999';

                document.body.appendChild(particle);

                const angle = (Math.PI * 2 * j) / 20;
                const velocity = 100 + Math.random() * 100;
                const dx = Math.cos(angle) * velocity;
                const dy = Math.sin(angle) * velocity;

                particle.animate([
                    {
                        transform: 'translate(0, 0) scale(1)',
                        opacity: 1
                    },
                    {
                        transform: `translate(${dx}px, ${dy}px) scale(0)`,
                        opacity: 0
                    }
                ], {
                    duration: 1000,
                    easing: 'cubic-bezier(0, 0.5, 0.5, 1)'
                });

                setTimeout(() => particle.remove(), 1000);
            }
        }, i * 600);
    }
}

// Sound Effects (using Web Audio API)
function playSound(type) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch(type) {
        case 'select':
            oscillator.frequency.value = 400;
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'start':
            oscillator.frequency.value = 523.25;
            gainNode.gain.value = 0.15;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
        case 'complete':
            // Play ascending notes
            [523.25, 659.25, 783.99].forEach((freq, i) => {
                setTimeout(() => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.frequency.value = freq;
                    gain.gain.value = 0.15;
                    osc.start();
                    osc.stop(audioContext.currentTime + 0.3);
                }, i * 100);
            });
            break;
        case 'victory':
            // Play triumphant melody
            [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                setTimeout(() => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.frequency.value = freq;
                    gain.gain.value = 0.15;
                    osc.start();
                    osc.stop(audioContext.currentTime + 0.4);
                }, i * 150);
            });
            break;
        case 'click':
            oscillator.frequency.value = 300;
            gainNode.gain.value = 0.05;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.05);
            break;
        case 'error':
            oscillator.frequency.value = 200;
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.15);
            break;
    }
}

// Prevent iOS zoom on double-tap
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Wake lock to prevent screen from sleeping during timer
let wakeLock = null;

async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
        }
    } catch (err) {
        console.log('Wake Lock not supported or denied');
    }
}

// Request wake lock when timer starts
const originalStartTimer = startTimer;
startTimer = function() {
    requestWakeLock();
    originalStartTimer();
};
