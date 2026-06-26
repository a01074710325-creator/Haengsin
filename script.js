let player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '360', width: '640',
        videoId: localStorage.getItem('meetingYtId') || 'jfKfPfyJRdk',
        playerVars: { 'autoplay': 0, 'playsinline': 1 }
    });
}

document.getElementById('music-toggle').addEventListener('click', () => {
    if (player.getPlayerState() !== 1) {
        player.playVideo();
        document.getElementById('music-toggle').textContent = "⏸ 음악 정지";
    } else {
        player.pauseVideo();
        document.getElementById('music-toggle').textContent = "🎵 음악 재생";
    }
});

function loadDashboardData() {
    // 폰트 및 텍스트 데이터 로드
    document.getElementById('meeting-title').textContent = localStorage.getItem('meetingTitle') || "2026 교직원 회의";
    
    // 사진 로드
    const photoData = localStorage.getItem('meetingPhotoFrame');
    if (photoData) {
        document.getElementById('dashboard-photo').src = photoData;
        document.getElementById('cute-frame').style.display = 'block';
    }
    // ... QR 및 식순 렌더링 로직 (이전 코드와 동일)
}
