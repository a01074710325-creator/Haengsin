document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    setupAdminEvents();
});

// 1. 아날로그 시계 실시간 구동 로직
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

// 2. 유튜브 URL ID 추출 알고리즘
function extractVideoID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url; 
}

// 3. 유튜브 API 플레이어 제어 (Galaxy UI 버튼 스타일 적용)
let player;
function onYouTubeIframeAPIReady() {
    const savedYtId = localStorage.getItem('meetingYtId') || 'jfKfPfyJRdk';
    player = new YT.Player('youtube-player', {
        height: '0', width: '0',
        videoId: savedYtId,
        playerVars: { 'autoplay': 0, 'controls': 0, 'loop': 1, 'playlist': savedYtId },
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
                toggleBtn.classList.add('active'); // 활성화 시 블루 컬러 적용
            } else {
                player.pauseVideo();
                statusText.textContent = "음악 켜기";
                iconText.textContent = "🎵";
                toggleBtn.classList.remove('active'); // 비활성화 시 기본 카드 컬러
            }
            isPlaying = !isPlaying;
        });
    }
}

// 4. 로컬 스토리지 데이터 렌더링 (배경화면 로직 제거됨)
function loadDashboardData() {
    const title = localStorage.getItem('meetingTitle') || "교직원 회의";
    const agenda = localStorage.getItem('meetingAgenda') || "1. 개회 선언\n2. 주요 안건 토의\n3. 공지사항 전달\n4. 폐회";
    const qrImage = localStorage.getItem('meetingQrImage'); 

    // 제목 적용
    document.getElementById('meeting-title').textContent = title;
    
    // QR 적용
    if (qrImage) {
        document.getElementById('qr-image').src = qrImage;
    } else {
        document.getElementById('qr-image').src = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=Welcome";
    }

    // 식순 적용
    const list = document.getElementById('agenda-list');
    list.innerHTML = "";
    agenda.split('\n').forEach(item => {
        if (item.trim()) {
            const li = document.createElement('li');
            li.textContent = item;
            list.appendChild(li);
        }
    });
}

// 5. 관리자 모달 이벤트 바인딩 및 데이터 저장
function setupAdminEvents() {
    const adminModal = document.getElementById('admin-modal');
    const openAdminBtn = document.getElementById('open-admin');
    const closeAdminBtn = document.getElementById('close-admin');
    const saveAdminBtn = document.getElementById('save-admin');
    const qrUploadInput = document.getElementById('admin-qr-upload');

    // 모달 호출 시 기존 값 세팅
    if (openAdminBtn) {
        openAdminBtn.addEventListener('click', () => {
            document.getElementById('admin-title-input').value = localStorage.getItem('meetingTitle') || "교직원 회의";
            document.getElementById('admin-agenda-input').value = localStorage.getItem('meetingAgenda') || "";
            document.getElementById('admin-yt-input').value = localStorage.getItem('meetingYtUrl') || "";
            adminModal.style.display = "flex";
        });
    }

    if (closeAdminBtn) {
        closeAdminBtn.addEventListener('click', () => adminModal.style.display = "none");
    }

    // 파일 비동기 저장 Promise
    function saveFileToStorage(file, storageKey) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    localStorage.setItem(storageKey, e.target.result);
                } catch (error) {
                    alert(`용량 초과 오류 발생. 이미지 크기를 줄여주세요.`);
                }
                resolve();
            };
            reader.readAsDataURL(file);
        });
    }

    // 설정값 최종 저장 프로세스
    if (saveAdminBtn) {
        saveAdminBtn.addEventListener('click', async () => {
            // 텍스트 저장
            localStorage.setItem('meetingTitle', document.getElementById('admin-title-input').value);
            localStorage.setItem('meetingAgenda', document.getElementById('admin-agenda-input').value);
            
            // 유튜브 설정 저장
            const ytInputUrl = document.getElementById('admin-yt-input').value;
            if(ytInputUrl) {
                localStorage.setItem('meetingYtUrl', ytInputUrl);
                localStorage.setItem('meetingYtId', extractVideoID(ytInputUrl));
            }

            // QR 파일 처리
            const qrFile = qrUploadInput.files[0];
            if (qrFile) await saveFileToStorage(qrFile, 'meetingQrImage');

            alert("설정이 시스템에 저장되었습니다.");
            location.reload();
        });
    }
}
