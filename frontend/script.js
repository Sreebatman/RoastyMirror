// DOM Elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const roastDisplay = document.getElementById('roast-display');
const emotionDisplay = document.getElementById('emotion-display');
const roastLog = document.getElementById('roast-log');
const startBtn = document.getElementById('start-btn');
const roastBtn = document.getElementById('roast-btn');
const karmaBtn = document.getElementById('karma-btn');
const shareBtn = document.getElementById('share-btn');
const roastCount = document.getElementById('roast-count');
const karmaLevel = document.getElementById('karma-level');
const karmaFill = document.getElementById('karma-fill');
const cringeScore = document.getElementById('cringe-score');

// Configuration
const API_ENDPOINT = 'http://localhost:5000/analyze';
 // Update after deployment
const ROAST_INTERVAL = 5000; // 5 seconds

// State variables
let isRunning = false;
let roastCounter = 0;
let karmaMode = false;
let currentExpression = 'neutral';
let lastRoastTime = 0;
let detectionInterval;

// Initialize buttons
startBtn.addEventListener('click', toggleMirror);
roastBtn.addEventListener('click', forceRoast);
karmaBtn.addEventListener('click', toggleKarmaMode);
shareBtn.addEventListener('click', shareRoast);

// Toggle mirror function
async function toggleMirror() {
    if (!isRunning) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: "user", 
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            };
            
            isRunning = true;
            startBtn.textContent = 'Stop Mirror';
            roastDisplay.textContent = 'Analyzing your questionable life choices...';
            
            // Start detection loop
            detectionInterval = setInterval(analyzeFrame, ROAST_INTERVAL);
        } catch (err) {
            roastDisplay.textContent = 'Camera access denied. Coward.';
            console.error('Error accessing camera:', err);
        }
    } else {
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
        isRunning = false;
        startBtn.textContent = 'Start Mirror';
        roastDisplay.textContent = 'Mirror stopped. Your ego is safe for now.';
        clearInterval(detectionInterval);
    }
}

// Analyze frame and get roast
async function analyzeFrame() {
    if (!isRunning) return;
    
    // Capture frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageBlob = await new Promise(resolve => 
        canvas.toBlob(resolve, 'image/jpeg', 0.7)
    );
    
    try {
        const formData = new FormData();
        formData.append('frame', imageBlob);
        
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        if (data.roast) {
            // Update UI
            currentExpression = data.emotion || 'neutral';
            emotionDisplay.textContent = `${getEmoji(currentExpression)} ${currentExpression}`;
            roastDisplay.textContent = data.roast;
            
            // Speak the roast
            speakRoast(data.roast);
            
            // Update logs and counters
            updateRoastLog(data.roast);
            updateCounters();
        } else if (data.error) {
            roastDisplay.textContent = data.roast || "Mirror malfunction... try again";
        }
    } catch (err) {
        console.error("API Error:", err);
        roastDisplay.textContent = "Network error... mirror is judging you silently";
    }
}

// Get emoji for expression
function getEmoji(expression) {
    const emojis = {
        happy: '😊',
        sad: '😢',
        angry: '😠',
        surprise: '😲',
        fear: '😨',
        disgust: '🤢',
        neutral: '😐'
    };
    return emojis[expression] || '🤔';
}

// Update roast log
function updateRoastLog(roast) {
    const logEntry = document.createElement('div');
    logEntry.className = 'roast-entry';
    logEntry.textContent = roast;
    roastLog.prepend(logEntry);
    
    // Keep log manageable
    if (roastLog.children.length > 10) {
        roastLog.removeChild(roastLog.lastChild);
    }
}

// Update counters and metrics
function updateCounters() {
    roastCounter++;
    roastCount.textContent = roastCounter;
    
    // Update karma meter
    const karma = Math.min(100, Math.floor(roastCounter * 10));
    karmaLevel.textContent = `${karma}%`;
    karmaFill.style.width = `${karma}%`;
    
    // Update cringe score
    const newScore = Math.min(100, Math.floor(roastCounter * 3.5));
    cringeScore.textContent = newScore;
}

// Force a roast
function forceRoast() {
    if (isRunning) {
        analyzeFrame();
    } else {
        roastDisplay.textContent = "Start the mirror first!";
    }
}

// Speak the roast
function speakRoast(text) {
    if ('speechSynthesis' in window) {
        const speech = new SpeechSynthesisUtterance(text);
        speech.rate = 0.9;
        speech.pitch = 1.2;
        speech.volume = 1;
        window.speechSynthesis.speak(speech);
    }
}

// Toggle karma mode
function toggleKarmaMode() {
    karmaMode = !karmaMode;
    karmaBtn.textContent = karmaMode ? 'Disable Karma' : 'Karma Mode';
    roastDisplay.textContent = karmaMode ? 
        "Karma mode enabled. Prepare for fake compliments!" : 
        "Karma mode disabled. Brutal honesty restored!";
}

// Share roast
function shareRoast() {
    if (roastDisplay.textContent && !roastDisplay.textContent.includes('Loading')) {
        if (navigator.share) {
            navigator.share({
                title: "Moody Mirror Roasted Me",
                text: `My roast: "${roastDisplay.textContent}" - Try it yourself!`,
                url: window.location.href
            }).catch(console.error);
        } else {
            alert(`Share this roast:\n\n"${roastDisplay.textContent}"\n\n${window.location.href}`);
        }
    } else {
        roastDisplay.textContent = "Get roasted first!";
    }
}
