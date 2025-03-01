// 지갑 공통 기능
const WalletCommon = {
    // 뒤로가기 이벤트 설정
    setupBackButton: function() {
        const backButton = document.getElementById('back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                Router.navigate('vending');
            });
        }
    },
    
    // 알림 표시
    showAlert: function(title, message, callback) {
        const modal = document.getElementById('alert-modal');
        const titleElement = document.getElementById('alert-title');
        const messageElement = document.getElementById('alert-message');
        const confirmButton = document.getElementById('alert-confirm');
        
        if (titleElement) titleElement.textContent = title;
        messageElement.textContent = message;
        
        modal.classList.add('show');
        
        confirmButton.onclick = () => {
            modal.classList.remove('show');
            if (callback) callback();
        };
    }
};

// 지갑1 (조희연 지갑) 모듈
const Wallet1View = {
    fullText: "다시 다시 다시.....\n돌아가서 다른 지갑을 선택하도록 해~",
    typingSpeed: 100, // 타이핑 속도 (ms)
    
    init: function() {
        // 뒤로가기 버튼 설정
        WalletCommon.setupBackButton();
        
        // 비디오 재생
        this.playVideo();
        
        // 타이핑 효과 시작
        this.startTypingEffect();
    },
    
    // 비디오 재생
    playVideo: function() {
        const video = document.getElementById('wallet1-video');
        if (video) {
            video.play();
        }
    },
    
    // 타이핑 효과
    startTypingEffect: function() {
        const textElement = document.getElementById('wallet1-text');
        let displayedText = "";
        let index = 0;
        
        // 텍스트 초기화
        textElement.textContent = "";
        
        // 타이머로 글자 하나씩 추가
        const typingInterval = setInterval(() => {
            if (index < this.fullText.length) {
                displayedText += this.fullText[index];
                textElement.textContent = displayedText;
                index++;
            } else {
                // 타이핑 완료
                clearInterval(typingInterval);
            }
        }, this.typingSpeed);
    }
};

// 지갑2 (김희태 지갑) 모듈
// Wallet2View 수정 부분 - 안전한 DOM 업데이트를 위한 코드
const Wallet2View = {
    init: function() {
        // 뒤로가기 버튼 설정
        WalletCommon.setupBackButton();
        
        // 잔액 표시 업데이트
        this.updateBalance();
        
        // 입금 버튼 이벤트
        const depositBtn = document.getElementById('deposit-btn');
        if (depositBtn) {
            depositBtn.addEventListener('click', () => {
                Router.navigate('clicker');
            });
        }
        
        // 출금 버튼 이벤트
        const withdrawBtn = document.getElementById('withdraw-btn');
        if (withdrawBtn) {
            withdrawBtn.addEventListener('click', () => {
                const balance = AppStorage.get('balance');
                if (balance > 0) {
                    Router.navigate('withdrawal');
                } else {
                    WalletCommon.showAlert("출금 불가", "잔액이 부족합니다. 입금 후 다시 시도하세요.");
                }
            });
        }
        
        // 정기예금 카드 클릭 이벤트
        const depositInfoCard = document.getElementById('deposit-info-card');
        if (depositInfoCard) {
            depositInfoCard.addEventListener('click', () => {
                WalletCommon.showAlert("정기예금", "희태가 최근에 든 예금");
            });
        }
        
        // 흑자전환예금 카드 클릭 이벤트
        const savingInfoCard = document.getElementById('saving-info-card');
        if (savingInfoCard) {
            savingInfoCard.addEventListener('click', () => {
                WalletCommon.showAlert("흑자전환예금", "푸하하! 명호가 줄 때까지 못 꺼내지롱~~");
            });
        }
        
        // 잔액 변경 리스너 등록 - 안전한 콜백 함수 사용
        if (typeof AppStorage.subscribe === 'function') {
            AppStorage.subscribe('balance', (newBalance) => {
                this.safeUpdateBalance(newBalance);
            });
        }
    },
    
    // 잔액 표시 업데이트 - 기존 메서드
    updateBalance: function() {
        const balance = AppStorage.get('balance') || 0;
        this.safeUpdateBalance(balance);
    },
    
    // 안전한 잔액 업데이트 메서드 - 에러 방지
    safeUpdateBalance: function(balance) {
        const balanceElement = document.getElementById('wallet-balance');
        if (balanceElement) {
            balanceElement.textContent = balance.toLocaleString();
        }
    }
};

// 출금 화면 컨트롤러
const WithdrawalView = {
    currentInput: "", // 현재 입력 값
    
    // 초기화
    init: function() {
        console.log("출금 페이지 초기화 중...");
        
        // 현재 잔액 표시
        this.updateBalanceDisplay();
        
        // 뒤로가기 버튼 이벤트
        document.getElementById('back-button').addEventListener('click', () => {
            // 이전 화면으로 이동
            Router.navigate('wallet2');
        });
        
        // 숫자 키패드 이벤트
        const numKeys = document.querySelectorAll('.num-key');
        numKeys.forEach(key => {
            key.addEventListener('click', () => {
                const num = key.getAttribute('data-num');
                this.handleNumKey(num);
            });
        });
        
        // 완료 버튼 이벤트
        document.getElementById('complete-button').addEventListener('click', () => {
            this.handleWithdrawal();
        });
        
        // 알림 확인 버튼 이벤트
        document.getElementById('alert-confirm').addEventListener('click', () => {
            const alertModal = document.getElementById('alert-modal');
            alertModal.classList.remove('show');
            
            // 출금 성공 시 자판기 화면으로 이동
            const alertMessage = document.getElementById('alert-message').textContent;
            if (alertMessage === "출금이 완료되었습니다.") {
                Router.navigate('vending');
            }
        });
    },
    
    // 숫자 키패드 입력 처리
    handleNumKey: function(key) {
        const inputField = document.getElementById('withdrawal-amount');
        
        if (key === 'del') {
            // 삭제 버튼: 마지막 숫자 제거
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            // 숫자 버튼: 값 추가
            // 너무 큰 숫자가 되는 것을 방지 (최대 10자리)
            if (this.currentInput.length < 10) {
                this.currentInput += key;
            }
        }
        
        // 입력 필드 업데이트 - 천 단위 쉼표 포맷팅
        if (this.currentInput) {
            const formatted = parseInt(this.currentInput).toLocaleString();
            inputField.value = formatted;
        } else {
            inputField.value = "";
        }
    },
    
    // 출금 처리
    handleWithdrawal: function() {
        if (!this.currentInput) {
            this.showAlert("올바른 금액을 입력해주세요.");
            return;
        }
        
        const amount = parseInt(this.currentInput);
        const balance = AppStorage.get('balance') || 0;
        
        if (amount <= 0) {
            this.showAlert("0원보다 큰 금액을 입력해주세요.");
            return;
        }
        
        if (amount > balance) {
            this.showAlert("잔액이 부족합니다.");
            return;
        }
        
        // 출금 처리
        const newBalance = balance - amount;
        const vendingMoney = AppStorage.get('vendingMoney') || 0;
        const newVendingMoney = vendingMoney + amount;
        
        // 상태 업데이트
        AppStorage.set('balance', newBalance);
        AppStorage.set('vendingMoney', newVendingMoney);
        
        // UI 업데이트
        this.updateBalanceDisplay();
        
        // 입력 필드 초기화
        this.currentInput = "";
        document.getElementById('withdrawal-amount').value = "";
        
        // 성공 알림 표시
        this.showAlert("출금이 완료되었습니다.");
    },
    
    // 잔액 표시 업데이트
    updateBalanceDisplay: function() {
        const balance = AppStorage.get('balance') || 0;
        const balanceElement = document.getElementById('current-balance');
        balanceElement.textContent = balance.toLocaleString();
    },
    
    // 알림 표시
    showAlert: function(message) {
        const modal = document.getElementById('alert-modal');
        const messageElement = document.getElementById('alert-message');
        
        messageElement.textContent = message;
        modal.classList.add('show');
    }
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // AppStorage가 있는지 확인
    if (typeof AppStorage === 'undefined') {
        console.error('AppStorage가 정의되지 않았습니다. 출금 기능이 제대로 작동하지 않을 수 있습니다.');
    }
    
    // 출금 화면 초기화
    WithdrawalView.init();
});