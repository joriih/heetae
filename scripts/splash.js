// 스플래시 화면 모듈
const SplashScreen = {
    init: function() {
        // 로고 요소 가져오기
        const logoElement = document.querySelector('.splash-logo');
        
        // 애니메이션 시작
        setTimeout(() => {
            logoElement.classList.add('logo-animate');
            
            // 애니메이션 완료 후 다음 화면으로 이동
            setTimeout(() => {
                Router.navigate('content');
            }, 3500); // 애니메이션 지속 시간과 일치
        }, 100);
    }
};