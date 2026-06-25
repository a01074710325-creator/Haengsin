document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    setupAdminEvents();
});

// 1. 시계 구동
function updateClock() {
    const now = new Date();
    const sec = now.getSeconds();
    const min = now.getMinutes();
    const hour = now.getHours();

    const secDeg = (sec / 60) * 360;
    const minDeg = ((min + sec/60) / 60) * 360;
    const hourDeg = ((hour % 12 + min/60) / 12) * 360;

    document.getElementById('sec-hand').style.transform = `translateX(-50%) rotate(${secDeg}deg)`;
    document.getElementById('min-hand').style.transform = `translateX(-50%) rotate(${minDeg}deg)`;
    document.getElementById('hour-hand').style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
}
setInterval(updateClock, 1000);

// 2. 유튜브 URL ID 추출 로직 (다양한 포맷 대응)
function extractVideoID(url) {
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regExp);
    return (match && match[1]) ? match[1] : url; 
}

// 3. 유튜브 API 플레이어 제어 (재생 오류 해결)
let player;
function onYouTubeIframeAPIReady() {
    const savedYtId = localStorage.getItem('meetingYtId') || 'jfKfPfyJRdk';
    player = new YT.Player('youtube-player', {
        height: '1', width: '1', // 브라우저 차단 방지를 위해 1 픽셀 크기 할당
        videoId: savedYtId,
        playerVars: { 'autoplay': 0, 'controls': 0, 'loop': 1, 'playlist': savedYtId, 'playsinline': 1 },
        events: { 'onReady': onPlayerReady }
    });
}

function onPlayerReady(event) {
    const toggleBtn = document.getElementById('music-toggle');
    const statusText = document.getElementById('music-status');
    const iconText = document.getElementById('music-icon');
    let isPlaying = false;

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (!isPlaying) {
                player.playVideo();
                statusText.textContent = "음악 정지";
                iconText.textContent = "⏸️";
                toggleBtn.classList.add('active');
            } else {
                player.pauseVideo();
                statusText.textContent = "음악 켜기";
                iconText.textContent = "🎵";
                toggleBtn.classList.remove('active');
            }
            isPlaying = !isPlaying;
        });
    }
}

// 4. 로컬 스토리지 데이터 렌더링 (3단 QR 처리)
function loadDashboardData() {
    const title = localStorage.getItem('meetingTitle') || "교직원 회의";
    const agenda = localStorage.getItem('meetingAgenda') || "1. 개회 선언\n2. 주요 안건 토의\n3. 공지사항 전달\n4. 폐회";

    document.getElementById('meeting-title').textContent = title;
    
    // 식순 렌더링
    const list = document.getElementById('agenda-list');
    list.innerHTML = "";
    agenda.split('\n').forEach(item => {
        if (item.trim()) {
            const li = document.createElement('li');
            li.textContent = item;
            list.appendChild(li);
        }
    });

    // 1~3번 QR 코드 렌더링
    let hasAnyQr = false;
    for (let i = 1; i <= 3; i++) {
        const qrTitle = localStorage.getItem(`meetingQrTitle${i}`);
        const qrImage = localStorage.getItem(`meetingQrImage${i}`);
        const box = document.getElementById(`qr-box-${i}`);
        
        if (qrTitle || qrImage) {
            box.style.display = 'block';
            document.getElementById(`qr-label-${i}`).textContent = qrTitle || `QR ${i}`;
            document.getElementById(`qr-image-${i}`).src = qrImage || "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Empty";
            hasAnyQr = true;
        } else {
            box.style.display = 'none';
        }
    }

    // 설정된 QR이 단 하나도 없을 경우 기본값 노출
    if (!hasAnyQr) {
        document.getElementById('qr-box-1').style.display = 'block';
        document.getElementById('qr-label-1').textContent = "연수 등록부";
        document.getElementById('qr-image-1').src = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Welcome";
    }
}

// 5. 모달 제어 및 병렬 데이터 저장
function setupAdminEvents() {
    const adminModal = document.getElementById('admin-modal');
    const openAdminBtn = document.getElementById('open-admin');
    const closeAdminBtn = document.getElementById('close-admin');
    const saveAdminBtn = document.getElementById('save-admin');

    if (openAdminBtn) {
        openAdminBtn.addEventListener('click', () => {
            document.getElementById('admin-title-input').value = localStorage.getItem('meetingTitle') || "교직원 회의";
            document.getElementById('admin-agenda-input').value = localStorage.getItem('meetingAgenda') || "";
            document.getElementById('admin-yt-input').value = localStorage.getItem('meetingYtUrl') || "";
            
            for(let i=1; i<=3; i++) {
                document.getElementById(`admin-qr-title-${i}`).value = localStorage.getItem(`meetingQrTitle${i}`) || "";
            }
            adminModal.style.display = "flex";
        });
    }

    if (closeAdminBtn) {
        closeAdminBtn.addEventListener('click', () => adminModal.style.display = "none");
    }

    function saveFileToStorage(file, storageKey) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    localStorage.setItem(storageKey, e.target.result);
                } catch (error) {
                    alert(`저장 용량이 초과되었습니다. 이미지 크기를 줄여주세요.`);
                }
                resolve();
            };
            reader.readAsDataURL(file);
        });
    }

    if (saveAdminBtn) {
        saveAdminBtn.addEventListener('click', async () => {
            localStorage.setItem('meetingTitle', document.getElementById('admin-title-input').value);
            localStorage.setItem('meetingAgenda', document.getElementById('admin-agenda-input').value);
            
            const ytInputUrl = document.getElementById('admin-yt-input').value;
            if(ytInputUrl) {
                localStorage.setItem('meetingYtUrl', ytInputUrl);
                localStorage.setItem('meetingYtId', extractVideoID(ytInputUrl));
            }

            // 3개의 QR 데이터 병렬 저장
            const uploadPromises = [];
            for (let i = 1; i <= 3; i++) {
                localStorage.setItem(`meetingQrTitle${i}`, document.getElementById(`admin-qr-title-${i}`).value);
                
                const fileInput = document.getElementById(`admin-qr-upload-${i}`);
                if (fileInput.files[0]) {
                    uploadPromises.push(saveFileToStorage(fileInput.files[0], `meetingQrImage${i}`));
                }
            }
            
            await Promise.all(uploadPromises);

            alert("설정이 성공적으로 저장되었습니다.");
            location.reload();
        });
    }
}
