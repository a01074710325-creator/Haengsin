let player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '200', width: '200',
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
    document.getElementById('meeting-title').textContent = localStorage.getItem('meetingTitle') || "2026 교직원 회의";
    const photoData = localStorage.getItem('meetingPhotoFrame');
    if (photoData) {
        document.getElementById('dashboard-photo').src = photoData;
        document.getElementById('cute-frame').style.display = 'block';
    }
    // QR 및 식순 렌더링 로직 생략(이전과 동일)
}
// 설정 모달 로직 등은 이전 답변의 setupAdminEvents 함수를 그대로 사용하세요.
