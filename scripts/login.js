// 로그인 모듈
const LoginView = {
    // 올바른 PIN 코드
    correctPin: "1023",
    
    // 사용자가 입력한 PIN
    currentPin: "",
    
    init: function() {
        // 이미 로그인 되어있는지 확인
        if (this.isLoggedIn()) {
            Router.navigate('splash');
            return;
        }
        
        // 키패드 버튼 이벤트 리스너 설정
        const keyButtons = document.querySelectorAll('.pin-key');
        keyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const key = e.target.getAttribute('data-key');
                this.handleKeyPress(key);
            });
        });
    },
    
    // 키 입력 처리
    handleKeyPress: function(key) {
        if (key === 'clear') {
            // C 버튼: PIN 초기화
            this.currentPin = "";
            this.updatePinDisplay();
        } else if (key === 'delete') {
            // 삭제 버튼: 마지막 숫자 삭제
            this.currentPin = this.currentPin.slice(0, -1);
            this.updatePinDisplay();
        } else {
            // 숫자 버튼: PIN에 숫자 추가 (최대 4자리)
            if (this.currentPin.length < 4) {
                this.currentPin += key;
                this.updatePinDisplay();
                
                // 4자리가 모두 입력되면 PIN 확인
                if (this.currentPin.length === 4) {
                    this.verifyPin();
                }
            }
        }
    },
    
    // PIN 표시 업데이트
    updatePinDisplay: function() {
        // 오류 메시지 초기화
        document.getElementById('pin-error').textContent = "";
        
        // PIN 점 업데이트
        for (let i = 1; i <= 4; i++) {
            const dot = document.getElementById(`dot-${i}`);
            if (i <= this.currentPin.length) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        }
    },
    
    // PIN 확인
    verifyPin: function() {
        if (this.currentPin === this.correctPin) {
            // 성공 애니메이션
            const pinDots = document.querySelector('.pin-dots');
            pinDots.classList.add('success-animation');
            
            // 로그인 상태 저장
            localStorage.setItem('isLoggedIn', 'true');
            
            // 잠시 후 다음 화면으로 이동
            setTimeout(() => {
                Router.navigate('splash');
            }, 1000);
        } else {
            // 실패 애니메이션
            const pinDots = document.querySelector('.pin-dots');
            pinDots.classList.add('shake-animation');
            
            // 에러 메시지 표시
            document.getElementById('pin-error').textContent = "잘못된 PIN 입니다. 다시 시도해주세요.";
            
            // PIN 초기화
            this.currentPin = "";
            
            // 애니메이션 종료 후 클래스 제거
            setTimeout(() => {
                pinDots.classList.remove('shake-animation');
                this.updatePinDisplay();
            }, 500);
        }
    },
    
    // 로그인 상태 확인
    isLoggedIn: function() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }
};