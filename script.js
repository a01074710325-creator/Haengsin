document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    setupAdminEvents();
});

function updateClock() {
    const now = new Date();
    const sec = now.getSeconds();
    const min = now.getMinutes();
    const hour = now.getHours();
    document.getElementById('sec-hand').style.transform = `translateX(-50%) rotate(${(sec/60)*360}deg)`;
    document.getElementById('min-hand').style.transform = `translateX(-50%) rotate(${(min+sec/60)/60*360}deg)`;
    document.getElementById('hour-hand').style.transform = `translateX(-50%) rotate(${(hour%12+min/60)/12*360}deg)`;
}
setInterval(updateClock, 1000);

let player;
function onYouTubeIframeAPIReady() {
    const savedYtId = localStorage.getItem('meetingYtId') || 'jfKfPfyJRdk';
    player = new YT.Player('youtube-player', {
        height: '360', width: '640',
        videoId: savedYtId,
        events: { 'onReady': (e) => e.target.playVideo() }
    });
}

function loadDashboardData() {
    // 폰트 크기 및 데이터 적용
    document.documentElement.style.setProperty('--font-size-title', (localStorage.getItem('meetingFontTitle') || '50') + 'px');
    document.documentElement.style.setProperty('--font-size-agenda', (localStorage.getItem('meetingFontAgenda') || '24') + 'px');
    document.getElementById('meeting-title').textContent = localStorage.getItem('meetingTitle') || "교직원 회의";
    
    // 사진 적용
    const photoData = localStorage.getItem('meetingPhotoFrame');
    if (photoData) {
        document.getElementById('dashboard-photo').src = photoData;
        document.getElementById('cute-frame').style.display = 'block';
    }
}

function setupAdminEvents() {
    document.getElementById('open-admin').addEventListener('click', () => {
        document.getElementById('admin-modal').style.display = "flex";
    });
    document.getElementById('close-admin').addEventListener('click', () => {
        document.getElementById('admin-modal').style.display = "none";
    });
    document.getElementById('save-admin').addEventListener('click', async () => {
        // 데이터 저장 로직...
        alert("저장되었습니다.");
        location.reload();
    });
}
