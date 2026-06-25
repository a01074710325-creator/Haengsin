document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    setupAdminEvents();
});

// 1. 디지털 시계 구동 (사진 1 오렌지색 시계)
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('digital-clock').textContent = `${hours}:${minutes}:${seconds}`;
}
setInterval(updateClock, 1000);
updateClock();

// 2. 유튜브 URL ID 추출
function extractVideoID(url) {
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regExp);
    return (match && match[1]) ? match[1] : url; 
}

// 3. 유튜브 API 및 심플 SVG 아이콘 스위칭 제어
let player;
function onYouTubeIframeAPIReady() {
    const savedYtId = localStorage.getItem('meetingYtId') || 'jfKfPfyJRdk';
    player = new YT.Player('youtube-player', {
        height: '1', width: '1', 
        videoId: savedYtId,
        playerVars: { 'autoplay': 0, 'controls': 0, 'loop': 1, 'playlist': savedYtId, 'playsinline': 1 },
        events: { 'onReady': onPlayerReady }
    });
}

function onPlayerReady(event) {
    const toggleBtn = document.getElementById('music-toggle');
    const iconPlay = document.getElementById('icon-play');
    const iconPause = document.getElementById('icon-pause');
    let isPlaying = false;

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (!isPlaying) {
                player.playVideo();
                iconPlay.style.display = 'none';
                iconPause.style.display = 'block';
                toggleBtn.classList.add('active');
            } else {
                player.pauseVideo();
                iconPlay.style.display = 'block';
                iconPause.style.display = 'none';
                toggleBtn.classList.remove('active');
            }
            isPlaying = !isPlaying;
        });
    }
}

// 4. 로컬 스토리지 데이터 렌더링 (가로형 QR 및 캡슐형 식순)
function loadDashboardData() {
    // 폰트 크기
    const savedFontSize = localStorage.getItem('meetingFontSize') || '18';
    document.documentElement.style.setProperty('--base-font-size', `${savedFontSize}px`);

    // 제목
    document.getElementById('meeting-title').textContent = localStorage.getItem('meetingTitle') || "교직원 회의";
    
    // 식순 (캡슐 형태로 분할 렌더링)
    const agenda = localStorage.getItem('meetingAgenda') || "1. 교장선생님 말씀\n2. 교무부/성적계\n3. 학생안전부";
    const listWrapper = document.getElementById('agenda-list');
    listWrapper.innerHTML = "";
    
    // 줄바꿈으로 입력된 내용을 한 줄의 텍스트( ' / ' 구분)로 합쳐서 하나의 캡슐에 넣기 (사진1 형태)
    const agendaItems = agenda.split('\n').map(item => item.trim()).filter(item => item);
    if(agendaItems.length > 0) {
        const combinedText = agendaItems.join(' / ');
        const pill = document.createElement('span');
        pill.textContent = combinedText;
        listWrapper.appendChild(pill);
    }

    // QR 코드 가로 나열 렌더링
    const qrWrapper = document.getElementById('qr-wrapper');
    qrWrapper.innerHTML = "";
    let hasAnyQr = false;

    for (let i = 1; i <= 3; i++) {
        const qrTitle = localStorage.getItem(`meetingQrTitle${i}`);
        const qrImage = localStorage.getItem(`meetingQrImage${i}`);
        
        if (qrTitle || qrImage) {
            hasAnyQr = true;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'qr-item';
            
            const p = document.createElement('p');
            p.textContent = qrTitle || `QR ${i}`;
            
            const img = document.createElement('img');
            img.src = qrImage || "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Empty";
            
            itemDiv.appendChild(p);
            itemDiv.appendChild(img);
            qrWrapper.appendChild(itemDiv);
        }
    }

    if (!hasAnyQr) {
        qrWrapper.innerHTML = `
            <div class="qr-item">
                <p>출석 확인</p>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Welcome" alt="Welcome QR">
            </div>
        `;
    }
}

// 5. 모달 및 저장 로직
function setupAdminEvents() {
    const adminModal = document.getElementById('admin-modal');
    const openAdminBtn = document.getElementById('open-admin');
    const closeAdminBtn = document.getElementById('close-admin');
    const saveAdminBtn = document.getElementById('save-admin');
    const fontSizeSlider = document.getElementById('admin-font-size');

    fontSizeSlider.addEventListener('input', (e) => {
        document.documentElement.style.setProperty('--base-font-size', `${e.target.value}px`);
    });

    if (openAdminBtn) {
        openAdminBtn.addEventListener('click', () => {
            fontSizeSlider.value = localStorage.getItem('meetingFontSize') || '18';
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
        closeAdminBtn.addEventListener('click', () => {
            document.documentElement.style.setProperty('--base-font-size', `${localStorage.getItem('meetingFontSize') || '18'}px`);
            adminModal.style.display = "none";
        });
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
            localStorage.setItem('meetingFontSize', fontSizeSlider.value);
            localStorage.setItem('meetingTitle', document.getElementById('admin-title-input').value);
            localStorage.setItem('meetingAgenda', document.getElementById('admin-agenda-input').value);
            
            const ytInputUrl = document.getElementById('admin-yt-input').value;
            if(ytInputUrl) {
                localStorage.setItem('meetingYtUrl', ytInputUrl);
                localStorage.setItem('meetingYtId', extractVideoID(ytInputUrl));
            }

            const uploadPromises = [];
            for (let i = 1; i <= 3; i++) {
                localStorage.setItem(`meetingQrTitle${i}`, document.getElementById(`admin-qr-title-${i}`).value);
                
                const fileInput = document.getElementById(`admin-qr-upload-${i}`);
                if (fileInput.files[0]) {
                    uploadPromises.push(saveFileToStorage(fileInput.files[0], `meetingQrImage${i}`));
                }
            }
            
            await Promise.all(uploadPromises);

            alert("설정이 성공적으로 반영되었습니다.");
            location.reload();
        });
    }
}
