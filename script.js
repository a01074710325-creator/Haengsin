document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    setupAdminEvents();
});

// 1. 아날로그 시계 구동
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
updateClock();

// 2. 유튜브 URL ID 추출
function extractVideoID(url) {
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regExp);
    return (match && match[1]) ? match[1] : url; 
}

// 3. 유튜브 플레이어 및 아이콘 토글 제어
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
    const textLabel = document.getElementById('music-text');
    let isPlaying = false;

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (!isPlaying) {
                player.playVideo();
                iconPlay.style.display = 'none';
                iconPause.style.display = 'block';
                toggleBtn.classList.add('active');
                textLabel.textContent = "음악 정지";
            } else {
                player.pauseVideo();
                iconPlay.style.display = 'block';
                iconPause.style.display = 'none';
                toggleBtn.classList.remove('active');
                textLabel.textContent = "음악 켜기";
            }
            isPlaying = !isPlaying;
        });
    }
}

// 4. 데이터 렌더링 및 개별 폰트 사이즈 적용
function loadDashboardData() {
    // 폰트 크기 로드 및 CSS 변수에 할당 (개별 제어)
    const fTitle = localStorage.getItem('meetingFontTitle') || '50';
    const fAgenda = localStorage.getItem('meetingFontAgenda') || '24';
    const fQR = localStorage.getItem('meetingFontQR') || '16';
    
    document.documentElement.style.setProperty('--font-size-title', `${fTitle}px`);
    document.documentElement.style.setProperty('--font-size-agenda', `${fAgenda}px`);
    document.documentElement.style.setProperty('--font-size-qr', `${fQR}px`);

    // 텍스트 데이터 로드
    document.getElementById('meeting-title').textContent = localStorage.getItem('meetingTitle') || "2026 교직원 회의";
    const agenda = localStorage.getItem('meetingAgenda') || "1. 개회 선언\n2. 학교장 인사말씀\n3. 안건 토의";

    const list = document.getElementById('agenda-list');
    list.innerHTML = "";
    agenda.split('\n').forEach(item => {
        if (item.trim()) {
            const li = document.createElement('li');
            li.textContent = item;
            list.appendChild(li);
        }
    });

    // 반응형 QR 로드
    let hasAnyQr = false;
    for (let i = 1; i <= 3; i++) {
        const qrTitle = localStorage.getItem(`meetingQrTitle${i}`);
        const qrImage = localStorage.getItem(`meetingQrImage${i}`);
        const box = document.getElementById(`qr-box-${i}`);
        
        if (qrTitle || qrImage) {
            box.style.display = 'flex';
            document.getElementById(`qr-label-${i}`).textContent = qrTitle || `QR ${i}`;
            document.getElementById(`qr-image-${i}`).src = qrImage || "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Empty";
            hasAnyQr = true;
        } else {
            box.style.display = 'none';
        }
    }

    // 초기 기본값
    if (!hasAnyQr) {
        document.getElementById('qr-box-1').style.display = 'flex';
        document.getElementById('qr-label-1').textContent = "연수 등록부";
        document.getElementById('qr-image-1').src = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Welcome";
    }
}

// 5. 관리자 모달 제어 (실시간 폰트 프리뷰 포함)
function setupAdminEvents() {
    const adminModal = document.getElementById('admin-modal');
    const openAdminBtn = document.getElementById('open-admin');
    const closeAdminBtn = document.getElementById('close-admin');
    const saveAdminBtn = document.getElementById('save-admin');
    
    const sliderTitle = document.getElementById('admin-font-title');
    const sliderAgenda = document.getElementById('admin-font-agenda');
    const sliderQR = document.getElementById('admin-font-qr');

    // 슬라이더 조절 시 실시간 프리뷰
    sliderTitle.addEventListener('input', (e) => document.documentElement.style.setProperty('--font-size-title', `${e.target.value}px`));
    sliderAgenda.addEventListener('input', (e) => document.documentElement.style.setProperty('--font-size-agenda', `${e.target.value}px`));
    sliderQR.addEventListener('input', (e) => document.documentElement.style.setProperty('--font-size-qr', `${e.target.value}px`));

    // 모달 열기 및 기존 데이터 바인딩
    if (openAdminBtn) {
        openAdminBtn.addEventListener('click', () => {
            sliderTitle.value = localStorage.getItem('meetingFontTitle') || '50';
            sliderAgenda.value = localStorage.getItem('meetingFontAgenda') || '24';
            sliderQR.value = localStorage.getItem('meetingFontQR') || '16';

            document.getElementById('admin-title-input').value = localStorage.getItem('meetingTitle') || "2026 교직원 회의";
            document.getElementById('admin-agenda-input').value = localStorage.getItem('meetingAgenda') || "";
            document.getElementById('admin-yt-input').value = localStorage.getItem('meetingYtUrl') || "";
            
            for(let i=1; i<=3; i++) {
                document.getElementById(`admin-qr-title-${i}`).value = localStorage.getItem(`meetingQrTitle${i}`) || "";
            }
            adminModal.style.display = "flex";
        });
    }

    // 모달 닫기 (실시간 프리뷰 원상복구)
    if (closeAdminBtn) {
        closeAdminBtn.addEventListener('click', () => {
            document.documentElement.style.setProperty('--font-size-title', `${localStorage.getItem('meetingFontTitle') || '50'}px`);
            document.documentElement.style.setProperty('--font-size-agenda', `${localStorage.getItem('meetingFontAgenda') || '24'}px`);
            document.documentElement.style.setProperty('--font-size-qr', `${localStorage.getItem('meetingFontQR') || '16'}px`);
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

    // 최종 저장 프로세스
    if (saveAdminBtn) {
        saveAdminBtn.addEventListener('click', async () => {
            localStorage.setItem('meetingFontTitle', sliderTitle.value);
            localStorage.setItem('meetingFontAgenda', sliderAgenda.value);
            localStorage.setItem('meetingFontQR', sliderQR.value);

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

            alert("성공적으로 저장되었습니다.");
            location.reload();
        });
    }
}
