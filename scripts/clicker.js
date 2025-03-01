// 클리커 게임 모듈
const ClickerGameView = {
    // 상점 모달 상태
    isShopOpen: false,
    
    // 초기화
    init: function() {
        console.log("클리커 게임 초기화 중...");
        
        // 스토리지 확인 및 필요한 초기 데이터 설정
        this.ensureStorageInitialized();
        
        // 잔액 및 클릭 파워 표시 업데이트
        this.updateStats();
        
        // 아이템 상태에 따라 캐릭터 업데이트
        this.updateCharacter();
        
        // 클릭 이벤트 설정
        this.setupClickEvent();
        
        // 상점 버튼 이벤트
        document.getElementById('shop-button').addEventListener('click', () => {
            this.openShop();
        });
        
        // 상점 닫기 버튼 이벤트
        document.getElementById('close-shop').addEventListener('click', () => {
            this.closeShop();
        });
        
        // 뒤로가기 버튼 이벤트
        document.getElementById('back-button').addEventListener('click', () => {
            Router.navigate('wallet2');
        });
        
        // 초기화 버튼 이벤트
        document.getElementById('reset-button').addEventListener('click', () => {
            this.showConfirmReset();
        });
        
        // 확인 버튼 이벤트
        document.getElementById('confirm-yes').addEventListener('click', () => {
            this.resetGame();
            this.closeConfirmModal();
        });
        
        // 취소 버튼 이벤트
        document.getElementById('confirm-no').addEventListener('click', () => {
            this.closeConfirmModal();
        });
        
        // 잔액 및 클릭 파워 변경 리스너
        // 주의: 각 페이지별로 DOM 요소가 있는지 확인하는 안전 함수를 콜백으로 등록
        if (typeof AppStorage.subscribe === 'function') {
            AppStorage.subscribe('balance', (newBalance) => {
                // 클리커 게임 내부의 balance 표시 업데이트
                this.safeUpdateBalance(newBalance);
            });
            AppStorage.subscribe('clickPower', (newPower) => {
                // 클리커 게임 내부의 clickPower 표시 업데이트
                this.safeUpdateClickPower(newPower);
            });
        }
    },
    
    // 스토리지 초기화 확인
    ensureStorageInitialized: function() {
        // 전역 AppStorage가 있으면 해당 스토리지 사용
        if (typeof window.AppStorage !== 'undefined') {
            // 전역 스토리지 우선 사용
            window.AppStorage = window.AppStorage;
        }
        
        // 아이템이 없는 경우 기본 아이템 설정
        if (!AppStorage.get('items')) {
            const defaultItems = [
                {id: '1', name: "가방", imageName: "bag", cost: 30, multiplier: 2, count: 0, hasBeenPurchased: false, level: 1},
                {id: '2', name: "목도리", imageName: "scarf", cost: 50, multiplier: 5, count: 0, hasBeenPurchased: false, level: 2},
                {id: '3', name: "에어팟", imageName: "airpods", cost: 100, multiplier: 10, count: 0, hasBeenPurchased: false, level: 3},
                {id: '4', name: "마우스", imageName: "mouse", cost: 150, multiplier: 15, count: 0, hasBeenPurchased: false, level: 4},
                {id: '5', name: "레어로우", imageName: "rareraw", cost: 300, multiplier: 20, count: 0, hasBeenPurchased: false, level: 5},
                {id: '6', name: "기타", imageName: "guitar", cost: 500, multiplier: 30, count: 0, hasBeenPurchased: false, level: 6},
                {id: '7', name: "ssd", imageName: "ssd", cost: 1000, multiplier: 50, count: 0, hasBeenPurchased: false, level: 7},
                {id: '8', name: "조명", imageName: "light", cost: 1500, multiplier: 75, count: 0, hasBeenPurchased: false, level: 8},
                {id: '9', name: "침대", imageName: "bed", cost: 2500, multiplier: 100, count: 0, hasBeenPurchased: false, level: 9}
            ];
            AppStorage.set('items', defaultItems);
        }

        // clickPower가 없는 경우 기본값 설정
        if (!AppStorage.get('clickPower')) {
            AppStorage.set('clickPower', 1);
        }
    },
    
    // 클릭 이벤트 설정
    setupClickEvent: function() {
        const characterArea = document.getElementById('character-area');
        characterArea.addEventListener('click', (e) => {
            // 클릭 위치 계산
            const rect = characterArea.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 클릭 수익 계산
            const clickPower = AppStorage.get('clickPower');
            const balance = AppStorage.get('balance') || 0;
            
            // 잔액 업데이트
            const newBalance = balance + clickPower;
            AppStorage.set('balance', newBalance);
            
            // 즉시 UI 업데이트 (subscribe와 별개로)
            this.safeUpdateBalance(newBalance);
            
            // 플로팅 숫자 효과 생성
            this.createFloatingNumber(x, y, clickPower);
        });
    },
    
    // 플로팅 숫자 효과 생성
    createFloatingNumber: function(x, y, value) {
        const floatingNumbers = document.getElementById('floating-numbers');
        const numberElement = document.createElement('div');
        numberElement.className = 'floating-number';
        numberElement.style.left = `${x}px`;
        numberElement.style.top = `${y}px`;
        numberElement.textContent = `+${value}`;
        
        floatingNumbers.appendChild(numberElement);
        
        // 애니메이션 종료 후 요소 제거
        setTimeout(() => {
            numberElement.remove();
        }, 1000);
    },
    
    // 상점 열기
    openShop: function() {
        // 상점 모달 표시
        const shopModal = document.getElementById('shop-modal');
        shopModal.classList.add('show');
        this.isShopOpen = true;
        
        // 아이템 목록 생성
        this.renderShopItems();
    },
    
    // 상점 닫기
    closeShop: function() {
        const shopModal = document.getElementById('shop-modal');
        shopModal.classList.remove('show');
        this.isShopOpen = false;
    },
    
    // 초기화 확인 모달 표시
    showConfirmReset: function() {
        const modal = document.getElementById('confirm-modal');
        modal.classList.add('show');
    },
    
    // 초기화 확인 모달 닫기
    closeConfirmModal: function() {
        const modal = document.getElementById('confirm-modal');
        modal.classList.remove('show');
    },
    
    // 상점 아이템 렌더링
    renderShopItems: function() {
        const shopItemsContainer = document.getElementById('shop-items');
        const items = AppStorage.get('items');
        const balance = AppStorage.get('balance') || 0;
        
        // 컨테이너 초기화
        shopItemsContainer.innerHTML = '';
        
        // 아이템 목록 생성
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'shop-item';
            
            // 이전 레벨 아이템 구매 여부 확인
            const canPurchase = this.canPurchaseItem(item);
            
            // 아이템 내용 설정
            itemElement.innerHTML = `
                <div class="item-info">
                    <p class="item-name">${item.name}</p>
                    <p class="item-count">현재 보유: ${item.count}개</p>
                    <p class="item-power">클릭 +${item.multiplier}</p>
                </div>
                <button class="item-buy-button ${(!canPurchase || balance < item.cost) ? 'disabled' : ''}" data-id="${item.id}">
                    ${item.cost}원
                </button>
            `;
            
            shopItemsContainer.appendChild(itemElement);
            
            // 구매 버튼 이벤트
            const buyButton = itemElement.querySelector('.item-buy-button');
            buyButton.addEventListener('click', () => {
                if (canPurchase && balance >= item.cost) {
                    this.purchaseItem(item);
                } else if (!canPurchase) {
                    this.showAlert("이전 단계의 아이템을 먼저 구매해주세요!");
                } else {
                    this.showAlert("잔액이 부족합니다!");
                }
            });
        });
    },
    
    // 아이템 구매 가능 여부 확인
    canPurchaseItem: function(item) {
        if (item.level === 1) return true;
        
        const items = AppStorage.get('items');
        const previousItem = items.find(i => i.level === item.level - 1);
        return previousItem && previousItem.hasBeenPurchased;
    },
    
    // 아이템 구매 처리
    purchaseItem: function(item) {
        const balance = AppStorage.get('balance') || 0;
        const clickPower = AppStorage.get('clickPower') || 1;
        const items = AppStorage.get('items');
        
        // 아이템 정보 업데이트
        const updatedItems = items.map(i => {
            if (i.id === item.id) {
                const updatedItem = { ...i, count: i.count + 1 };
                
                // 처음 구매하는 경우
                if (!i.hasBeenPurchased) {
                    updatedItem.hasBeenPurchased = true;
                    
                    // 상점 자동 닫기
                    this.closeShop();
                }
                
                return updatedItem;
            }
            return i;
        });
        
        // 상태 업데이트
        const newBalance = balance - item.cost;
        const newClickPower = clickPower + item.multiplier;
        
        AppStorage.set('balance', newBalance);
        AppStorage.set('clickPower', newClickPower);
        AppStorage.set('items', updatedItems);
        
        // 즉시 UI 업데이트 (subscribe와 별개로)
        this.safeUpdateBalance(newBalance);
        this.safeUpdateClickPower(newClickPower);
        
        // 캐릭터 업데이트
        this.updateCharacter();
        
        // 상점 아이템 목록 갱신
        if (this.isShopOpen) {
            this.renderShopItems();
        }
    },
    
    // 알림 표시
    showAlert: function(message) {
        const modal = document.getElementById('alert-modal');
        const messageElement = document.getElementById('alert-message');
        const confirmButton = document.getElementById('alert-confirm');
        
        messageElement.textContent = message;
        modal.classList.add('show');
        
        confirmButton.onclick = () => {
            modal.classList.remove('show');
        };
    },
    
    // 캐릭터 업데이트 (구매한 아이템 표시)
    updateCharacter: function() {
        const items = AppStorage.get('items') || [];
        const purchasedContainer = document.getElementById('purchased-items');
        
        // 컨테이너 초기화
        if (purchasedContainer) {
            purchasedContainer.innerHTML = '';
            
            // 구매한 아이템을 레벨 순으로 정렬하여 표시
            const purchasedItems = items
                .filter(item => item.hasBeenPurchased)
                .sort((a, b) => a.level - b.level);
            
            purchasedItems.forEach(item => {
                const itemImage = document.createElement('img');
                itemImage.src = `assets/images/${item.imageName}.png`;
                itemImage.alt = item.name;
                itemImage.className = 'character-image';
                purchasedContainer.appendChild(itemImage);
            });
        }
    },
    
    // 잔액 표시 안전 업데이트 (현재 페이지에 요소가 있는 경우에만)
    safeUpdateBalance: function(balance) {
        const balanceElement = document.getElementById('balance');
        if (balanceElement) {
            balanceElement.textContent = balance.toLocaleString();
        }
    },
    
    // 클릭 파워 안전 업데이트 (현재 페이지에 요소가 있는 경우에만)
    safeUpdateClickPower: function(power) {
        const powerElement = document.getElementById('click-power');
        if (powerElement) {
            powerElement.textContent = power;
        }
    },
    
    // 스탯 업데이트
    updateStats: function() {
        this.safeUpdateBalance(AppStorage.get('balance') || 0);
        this.safeUpdateClickPower(AppStorage.get('clickPower') || 1);
    },
    
    // 게임 리셋
    resetGame: function() {
        // 기본 아이템 배열
        const defaultItems = [
            {id: '1', name: "가방", imageName: "bag", cost: 30, multiplier: 2, count: 0, hasBeenPurchased: false, level: 1},
            {id: '2', name: "목도리", imageName: "scarf", cost: 50, multiplier: 5, count: 0, hasBeenPurchased: false, level: 2},
            {id: '3', name: "에어팟", imageName: "airpods", cost: 100, multiplier: 10, count: 0, hasBeenPurchased: false, level: 3},
            {id: '4', name: "마우스", imageName: "mouse", cost: 150, multiplier: 15, count: 0, hasBeenPurchased: false, level: 4},
            {id: '5', name: "레어로우", imageName: "rareraw", cost: 300, multiplier: 20, count: 0, hasBeenPurchased: false, level: 5},
            {id: '6', name: "기타", imageName: "guitar", cost: 500, multiplier: 30, count: 0, hasBeenPurchased: false, level: 6},
            {id: '7', name: "ssd", imageName: "ssd", cost: 1000, multiplier: 50, count: 0, hasBeenPurchased: false, level: 7},
            {id: '8', name: "조명", imageName: "light", cost: 1500, multiplier: 75, count: 0, hasBeenPurchased: false, level: 8},
            {id: '9', name: "침대", imageName: "bed", cost: 2500, multiplier: 100, count: 0, hasBeenPurchased: false, level: 9}
        ];
        
        // 상태 초기화
        AppStorage.set('clickPower', 1);
        AppStorage.set('balance', 0);
        AppStorage.set('items', defaultItems);
        
        // UI 업데이트
        this.updateStats();
        this.updateCharacter();
        
        // 초기화 완료 메시지 표시
        this.showAlert("게임이 초기화되었습니다.");
    }
};

// 페이지 로드 시 게임 초기화
document.addEventListener('DOMContentLoaded', function() {
    // AppStorage가 아직 초기화되지 않았을 경우를 대비한 로직
    if (typeof AppStorage === 'undefined') {
        // AppStorage 모듈 정의 (임시)
        // 메인 스토리지 모듈이 나중에 로드될 경우 자동으로 대체됨
        window.AppStorage = {
            // 기본값 설정
            defaultValues: {
                balance: 0,
                clickPower: 1,
                items: [
                    {id: '1', name: "가방", imageName: "bag", cost: 30, multiplier: 2, count: 0, hasBeenPurchased: false, level: 1},
                    {id: '2', name: "목도리", imageName: "scarf", cost: 50, multiplier: 5, count: 0, hasBeenPurchased: false, level: 2},
                    {id: '3', name: "에어팟", imageName: "airpods", cost: 100, multiplier: 10, count: 0, hasBeenPurchased: false, level: 3},
                    {id: '4', name: "마우스", imageName: "mouse", cost: 150, multiplier: 15, count: 0, hasBeenPurchased: false, level: 4},
                    {id: '5', name: "레어로우", imageName: "rareraw", cost: 300, multiplier: 20, count: 0, hasBeenPurchased: false, level: 5},
                    {id: '6', name: "기타", imageName: "guitar", cost: 500, multiplier: 30, count: 0, hasBeenPurchased: false, level: 6},
                    {id: '7', name: "ssd", imageName: "ssd", cost: 1000, multiplier: 50, count: 0, hasBeenPurchased: false, level: 7},
                    {id: '8', name: "조명", imageName: "light", cost: 1500, multiplier: 75, count: 0, hasBeenPurchased: false, level: 8},
                    {id: '9', name: "침대", imageName: "bed", cost: 2500, multiplier: 100, count: 0, hasBeenPurchased: false, level: 9}
                ]
            },
            
            // 저장소
            _storage: {},
            
            // 구독자 (상태 변경 감지)
            _subscribers: {},
            
            // 초기화
            init: function() {
                // 로컬 스토리지에서 데이터 로드
                this._loadFromLocalStorage();
                
                // 기본값으로 초기화 (저장된 값이 없는 경우)
                for (const key in this.defaultValues) {
                    if (!(key in this._storage)) {
                        this._storage[key] = JSON.parse(JSON.stringify(this.defaultValues[key]));
                        this._saveToLocalStorage(key);
                    }
                }
            },
            
            // 값 가져오기
            get: function(key) {
                return this._storage[key];
            },
            
            // 값 설정하기
            set: function(key, value) {
                this._storage[key] = value;
                this._saveToLocalStorage(key);
                
                // 구독자에게 알림
                if (this._subscribers[key]) {
                    this._subscribers[key].forEach(callback => {
                        try {
                            callback(value);
                        } catch (e) {
                            console.warn('구독자 콜백 실행 중 오류 발생:', e);
                        }
                    });
                }
            },
            
            // 상태 변경 구독
            subscribe: function(key, callback) {
                if (!this._subscribers[key]) {
                    this._subscribers[key] = [];
                }
                this._subscribers[key].push(callback);
            },
            
            // 로컬 스토리지에 저장
            _saveToLocalStorage: function(key) {
                try {
                    localStorage.setItem(key, JSON.stringify(this._storage[key]));
                } catch (e) {
                    console.error('로컬 스토리지 저장 실패:', e);
                }
            },
            
            // 로컬 스토리지에서 로드
            _loadFromLocalStorage: function() {
                try {
                    for (const key in this.defaultValues) {
                        const value = localStorage.getItem(key);
                        if (value) {
                            this._storage[key] = JSON.parse(value);
                        }
                    }
                } catch (e) {
                    console.error('로컬 스토리지 로드 실패:', e);
                }
            }
        };
        
        // 초기화
        window.AppStorage.init();
    }
    
    // 클리커 게임 초기화
    ClickerGameView.init();
});

// 전역 AppStorage 수정: 콜백 호출 시 오류 방지를 위한 try-catch 추가
if (typeof window.AppStorage !== 'undefined' && 
    typeof window.AppStorage.set === 'function' && 
    !window.AppStorage._safeCallbacksAdded) {
    
    // 원본 set 함수 저장
    const originalSet = window.AppStorage.set;
    
    // 안전한 콜백 호출을 위한 set 함수 오버라이드
    window.AppStorage.set = function(key, value) {
        this._storage[key] = value;
        this._saveToLocalStorage(key);
        
        // 구독자에게 알림 (오류 처리 추가)
        if (this._subscribers && this._subscribers[key]) {
            this._subscribers[key].forEach(callback => {
                try {
                    callback(value);
                } catch (e) {
                    console.warn(`'${key}' 값 변경 구독자 콜백 실행 중 오류 발생:`, e);
                }
            });
        }
    };
    
    // 중복 패치 방지 플래그
    window.AppStorage._safeCallbacksAdded = true;
}