// 스토리지 모듈 - 앱 데이터 관리
const AppStorage = {
    // 기본값 설정
    defaultValues: {
        balance: 0,          // 지갑 잔액
        clickPower: 1,       // 클릭당 획득 금액
        vendingMoney: 0,     // 자판기에 투입된 금액
        items: [             // 클리커 게임 아이템 목록
            { id: crypto.randomUUID(), name: "가방", imageName: "bag", cost: 30, multiplier: 2, count: 0, hasBeenPurchased: false, level: 1 },
            { id: crypto.randomUUID(), name: "목도리", imageName: "scarf", cost: 50, multiplier: 5, count: 0, hasBeenPurchased: false, level: 2 },
            { id: crypto.randomUUID(), name: "에어팟", imageName: "airpods", cost: 100, multiplier: 10, count: 0, hasBeenPurchased: false, level: 3 },
            { id: crypto.randomUUID(), name: "마우스", imageName: "mouse", cost: 150, multiplier: 15, count: 0, hasBeenPurchased: false, level: 4 },
            { id: crypto.randomUUID(), name: "레어로우", imageName: "rareraw", cost: 300, multiplier: 20, count: 0, hasBeenPurchased: false, level: 5 },
            { id: crypto.randomUUID(), name: "기타", imageName: "guitar", cost: 500, multiplier: 30, count: 0, hasBeenPurchased: false, level: 6 },
            { id: crypto.randomUUID(), name: "ssd", imageName: "ssd", cost: 1000, multiplier: 50, count: 0, hasBeenPurchased: false, level: 7 },
            { id: crypto.randomUUID(), name: "조명", imageName: "light", cost: 1500, multiplier: 75, count: 0, hasBeenPurchased: false, level: 8 },
            { id: crypto.randomUUID(), name: "침대", imageName: "bed", cost: 2500, multiplier: 100, count: 0, hasBeenPurchased: false, level: 9 },
        ]
    },

    // 데이터 가져오기
    get: function(key) {
        const value = localStorage.getItem(key);
        if (value === null) {
            // 기본값이 있으면 사용
            if (key in this.defaultValues) {
                const defaultValue = this.defaultValues[key];
                // 객체인 경우 JSON 문자열로 변환하여 저장
                if (typeof defaultValue === 'object') {
                    localStorage.setItem(key, JSON.stringify(defaultValue));
                } else {
                    localStorage.setItem(key, defaultValue);
                }
                return defaultValue;
            }
            return null;
        }
        
        // JSON 형식으로 저장된 데이터인지 확인
        try {
            return JSON.parse(value);
        } catch (e) {
            // 숫자인 경우 숫자로 변환
            if (!isNaN(value)) {
                return Number(value);
            }
            return value;
        }
    },

    // 데이터 저장하기
    set: function(key, value) {
        // 객체는 JSON 문자열로 변환하여 저장
        if (typeof value === 'object') {
            localStorage.setItem(key, JSON.stringify(value));
        } else {
            localStorage.setItem(key, value);
        }
        
        // 데이터 변경 이벤트 발생
        this._notifyChange(key, value);
    },

    // 데이터 변경 알림 (옵저버 패턴)
    _listeners: {},
    
    // 데이터 변경 리스너 등록
    subscribe: function(key, callback) {
        if (!this._listeners[key]) {
            this._listeners[key] = [];
        }
        this._listeners[key].push(callback);
    },
    
    // 데이터 변경 알림
    _notifyChange: function(key, value) {
        if (this._listeners[key]) {
            this._listeners[key].forEach(callback => callback(value));
        }
    },

    // 앱 리셋 (모든 데이터 초기화)
    resetApp: function() {
        Object.keys(this.defaultValues).forEach(key => {
            this.set(key, this.defaultValues[key]);
        });
    }
};