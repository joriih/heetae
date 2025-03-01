// 자판기 컨트롤러
const VendingMachineView = {
    // 음료 목록
    drinks: [
        { id: "drink1", price: 1500 },
        { id: "drink2", price: 1800 },
        { id: "drink3", price: 2000 },
        { id: "drink4", price: 2500 },
        { id: "drink5", price: 2800 },
        { id: "drink6", price: 3000 }
    ],

    // 상태 변수들
    selectedDrink: "돈을 넣으세요",
    vendingMoney: 0,
    balance: 0,
    dispensedDrink: null,
    isDispensing: false,
    isSelectingWallet: false,

    // DOM 요소 참조
    elements: {},

    // 초기화 함수
    init: function() {
        // DOM 요소가 완전히 로드된 후 초기화
        this.selectedDrink = "돈을 넣으세요";
        this.waitForElements().then(() => {
            // 앱 스토리지에서 상태 로드
            this.vendingMoney = AppStorage.get('vendingMoney') || 0;
            this.balance = AppStorage.get('balance') || 0;
    
            // 지갑 선택 상태 초기화
            this.isSelectingWallet = false;
            this.dispensedDrink = null;
            this.isDispensing = false;
    
            // 초기 UI 업데이트 (순서 변경)
            this.updateDisplayMessage(); // 먼저 메시지 업데이트
            this.updateMoneyDisplay();
            this.updateDrinkButtons();
            this.setupEventListeners();
    
            // 지갑 선택 요소 숨기기
            if (this.elements.walletSelection) {
                this.elements.walletSelection.classList.add('hidden');
            }
        });
    },

    // DOM 요소 로드 대기 함수
    waitForElements: function() {
        return new Promise((resolve) => {
            const checkElements = () => {
                try {
                    // 필수 요소들 찾기
                    this.elements = {
                        moneyAmount: document.getElementById('money-amount'),
                        displayMessage: document.getElementById('display-message'),
                        walletSelection: document.getElementById('wallet-selection'),
                        wallet1Button: document.getElementById('wallet1-btn'),
                        wallet2Button: document.getElementById('wallet2-btn'),
                        drinkButtons: document.querySelectorAll('.drink-button'),
                        depositButton: document.getElementById('deposit-button'),
                        dispensedDrink: document.getElementById('dispensed-drink'),
                        downArrow: document.getElementById('down-arrow'),
                        billSlot: document.querySelector('.money-controls'),
                        coinArea: document.querySelector('.coin-area'),
                        displayWindow: document.getElementById('display-window')
                    };

                    // 필수 요소 중 일부라도 존재하면 resolve
                    if (this.elements.moneyAmount && this.elements.displayMessage) {
                        resolve();
                    } else {
                        // 요소가 없으면 잠시 후 다시 체크
                        setTimeout(checkElements, 100);
                    }
                } catch (error) {
                    // 에러 발생 시 잠시 후 다시 체크
                    console.error('Error finding elements:', error);
                    setTimeout(checkElements, 100);
                }
            };

            // 초기 체크 시작
            checkElements();
        });
    },

    // 상태 저장 함수
    saveState: function() {
        AppStorage.set('vendingMoney', this.vendingMoney);
        AppStorage.set('balance', this.balance);
    },

    // 디스플레이 메시지 업데이트
    updateDisplayMessage: function() {
        // 요소 존재 여부 먼저 확인
        if (!this.elements.displayMessage) {
            console.warn('Display message element not found');
            return;
        }
        
        if (this.dispensedDrink) {
            this.elements.displayMessage.textContent = "음료를 꺼내세요";
        } else if (this.isSelectingWallet) {
            this.elements.displayMessage.textContent = "";
        } else if (this.vendingMoney < 1500) {
            this.elements.displayMessage.textContent = "돈을 넣으세요";
        } else {
            this.elements.displayMessage.textContent = "음료수를 선택하세요";
        }
    },

    // 디스플레이 금액 업데이트
    updateMoneyDisplay: function() {
        if (this.elements.moneyAmount) {
            this.elements.moneyAmount.textContent = this.vendingMoney.toLocaleString();
        }
    },

    // 음료 버튼 활성화/비활성화 업데이트
    updateDrinkButtons: function() {
        if (this.elements.drinkButtons) {
            this.elements.drinkButtons.forEach(button => {
                const price = parseInt(button.getAttribute('data-price'));
                button.disabled = this.vendingMoney < price;
                button.classList.toggle('enabled', this.vendingMoney >= price);
            });
        }
    },

    // 이벤트 리스너 설정
    setupEventListeners: function() {
        // 지갑 선택 버튼 이벤트
        if (this.elements.wallet1Button) {
            this.elements.wallet1Button.addEventListener('click', () => {
                this.selectWallet('wallet1');
            });
        }

        if (this.elements.wallet2Button) {
            this.elements.wallet2Button.addEventListener('click', () => {
                this.selectWallet('wallet2');
            });
        }

        // 입금 버튼 이벤트
        if (this.elements.depositButton) {
            this.elements.depositButton.addEventListener('click', () => {
                this.returnMoney();
            });
        }

        // bill-slot 클릭 시 지갑 선택 표시
        if (this.elements.billSlot) {
            this.elements.billSlot.addEventListener('click', () => {
                this.showWalletSelection();
            });
        }

        // coin-area 클릭 시 지갑 선택 표시
        if (this.elements.coinArea) {
            this.elements.coinArea.addEventListener('click', () => {
                this.showWalletSelection();
            });
        }

        // 음료 버튼 이벤트 - 음료 구매 처리
        if (this.elements.drinkButtons) {
            this.elements.drinkButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const drinkId = button.getAttribute('data-drink');
                    const price = parseInt(button.getAttribute('data-price'));
                    if (this.vendingMoney >= price) {
                        this.purchaseDrink(drinkId, price);
                    }
                });
            });
        }

        // 음료 배출구 클릭 이벤트 - 음료 꺼내기
        if (this.elements.dispensedDrink) {
            this.elements.dispensedDrink.addEventListener('click', () => {
                if (this.dispensedDrink) {
                    this.collectDrink();
                }
            });
        }
    },

    // 지갑 선택 UI 표시
    showWalletSelection: function() {
        // 음료 배출 중이면 지갑 선택 UI를 표시하지 않음
        if (this.dispensedDrink) {
            // 음료를 먼저 꺼내야 함을 강조하기 위해 메시지 업데이트
            if (this.elements.displayMessage) {
                this.elements.displayMessage.textContent = "음료를 꺼내세요";
            }
            return;
        }
        
        if (this.elements.walletSelection) {
            this.elements.walletSelection.classList.remove('hidden');
            this.isSelectingWallet = true;
            this.updateDisplayMessage();
        }
    },

    // 지갑 선택 처리
    selectWallet: function(walletType) {
        // 지갑 선택 로직
        if (walletType === 'wallet1') {
            Router.navigate('wallet1');
        } else if (walletType === 'wallet2') {
            Router.navigate('wallet2');
        }
    },

    // 음료 구매 처리
    purchaseDrink: function(drinkId, price) {
        if (this.vendingMoney >= price) {
            // 금액 차감
            this.vendingMoney -= price;
            AppStorage.set('vendingMoney', this.vendingMoney);
            
            // UI 업데이트
            this.updateMoneyDisplay();
            this.updateDrinkButtons();
            
            // 음료 배출 애니메이션 시작
            this.startDispensing(drinkId);
        }
    },

    // 음료 배출 애니메이션 시작
    startDispensing: function(drinkId) {
        // 화살표 숨기기
        if (this.elements.downArrow) {
            this.elements.downArrow.classList.add('hidden');
        }
        
        // 메시지 업데이트
        this.dispensedDrink = drinkId;
        this.isDispensing = true;
        this.updateDisplayMessage();
        
        // 음료 이미지 생성 및 애니메이션
        const dispensedDrinkElement = this.elements.dispensedDrink;
        if (dispensedDrinkElement) {
            // 음료 이미지 설정
            dispensedDrinkElement.innerHTML = `<img src="assets/images/${drinkId}.png" alt="${drinkId}" class="dispensed-drink-img">`;
            
            // 애니메이션 클래스 추가
            const drinkImg = dispensedDrinkElement.querySelector('.dispensed-drink-img');
            if (drinkImg) {
                // 처음에는 위에 위치 (옆으로 회전하지 않은 상태)
                drinkImg.style.transform = 'translateY(-80px) rotate(0deg)';
                
                // 잠시 후 애니메이션 시작 (옆으로 회전하면서 떨어짐)
                setTimeout(() => {
                    drinkImg.style.transition = 'transform 1.5s ease-in-out';
                    drinkImg.style.transform = 'translateY(0) rotate(90deg)';
                }, 100);
            }
            
            // 배출구 영역 보이게 설정
            dispensedDrinkElement.classList.add('active');
        }
    },

    // 음료 수거 처리
    collectDrink: function() {
        if (this.dispensedDrink) {
            // 현재 음료 ID 저장
            const drinkId = this.dispensedDrink;
            
            // 상태 초기화
            this.dispensedDrink = null;
            this.isDispensing = false;
            
            // 화살표 다시 표시
            if (this.elements.downArrow) {
                this.elements.downArrow.classList.remove('hidden');
            }
            
            // 배출구 초기화
            if (this.elements.dispensedDrink) {
                this.elements.dispensedDrink.innerHTML = '';
                this.elements.dispensedDrink.classList.remove('active');
            }
            
            // **수정된 부분**: 음료 수거 후 지갑 선택 UI 숨기기
            if (this.elements.walletSelection) {
                this.elements.walletSelection.classList.add('hidden');
                this.isSelectingWallet = false;
            }
            
            // 메시지 업데이트
            this.updateDisplayMessage();
            
            // **수정된 부분**: 음료 상세 페이지로 이동 시 약간의 딜레이를 주어 UI 업데이트가 완료되도록 함
            console.log("음료 상세 페이지로 이동:", drinkId);
            setTimeout(() => {
                Router.navigate('drink-detail', { drinkId: drinkId });
            }, 0);
        }
    },

    // 돈 반환 (지갑으로 돌려줌)
    returnMoney: function() {
        if (this.vendingMoney > 0) {
            // 잔액에 자판기 금액 추가
            this.balance += this.vendingMoney;
            AppStorage.set('balance', this.balance);
            
            // 자판기 금액 0으로 설정
            this.vendingMoney = 0;
            AppStorage.set('vendingMoney', 0);
            
            // UI 업데이트
            this.updateMoneyDisplay();
            this.updateDrinkButtons();
            this.updateDisplayMessage();
        }
    }
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    VendingMachineView.init();
});