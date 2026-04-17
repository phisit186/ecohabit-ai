let totalCO2 = parseFloat(localStorage.getItem('drway_co2')) || 0;
let streak = parseInt(localStorage.getItem('drway_streak')) || 0;
let lastDate = localStorage.getItem('drway_date');
const today = new Date().toDateString();

if (lastDate !== today) {
    let yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    if (lastDate !== yesterday.toDateString() && lastDate !== null) { streak = 0; localStorage.setItem('drway_streak', 0); }
}
updateDisplay();

// ฟังก์ชันเรียก Cloudflare AI
async function callCloudflareAI(activityDetail) {
    try {
        // *** เปลี่ยนลิงก์ตรงนี้เป็น URL ของอาจารย์ในสเต็ปที่ 2 ***
        const workerUrl = "https://eco-coach-ai.YOUR_ACCOUNT.workers.dev"; 
        
        const response = await fetch(workerUrl, {
            method: 'POST',
            body: JSON.stringify({ activity: activityDetail })
        });
        const data = await response.json();
        return data.response;
    } catch (error) {
        return "ขอบคุณที่รักษ์โลกครับ ความดีของคุณบันทึกเรียบร้อย! (AI กำลังพักผ่อน)";
    }
}

async function addActivity(val, activityDetail) {
    totalCO2 += val;
    if (lastDate !== today) {
        streak++; lastDate = today;
        localStorage.setItem('drway_streak', streak); localStorage.setItem('drway_date', lastDate);
    }
    localStorage.setItem('drway_co2', totalCO2.toFixed(1));
    updateDisplay(); showToast();
    if (navigator.vibrate) navigator.vibrate(60);

    triggerAI("AI กำลังวิเคราะห์...");
    const aiResponse = await callCloudflareAI(activityDetail);
    triggerAI(aiResponse);
}

function updateDisplay() {
    document.getElementById('total-co2').innerText = totalCO2.toFixed(1);
    document.getElementById('streak-count').innerText = streak;
    let trees = (totalCO2 / 10).toFixed(1);
    document.getElementById('equivalency').innerHTML = `เทียบเท่ากับการปลูกต้นไม้ <strong>${trees}</strong> ต้น 🌳`;
}

let typeInterval;
function triggerAI(text) {
    const aiMessage = document.getElementById('ai-message');
    aiMessage.innerHTML = ''; aiMessage.classList.add('typing-cursor');
    clearInterval(typeInterval); let i = 0;
    typeInterval = setInterval(() => {
        aiMessage.innerHTML += text.charAt(i); i++;
        if (i >= text.length) { clearInterval(typeInterval); aiMessage.classList.remove('typing-cursor'); }
    }, 40);
}
function showToast() {
    const t = document.getElementById('toast'); t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
}
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
