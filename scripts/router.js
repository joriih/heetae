// 라우터 모듈 - 페이지 전환 처리
const Router = {
    // 현재 활성화된 페이지
    currentPage: null,

    // 페이지 정의 및 관련 스크립트/스타일
    routes: {
        'login': {
            template: 'pages/login.html',
            styles: ['styles/login.css'],
            scripts: ['scripts/login.js'],
            init: () => {
                if (typeof LoginView !== 'undefined') {
                    LoginView.init();
                }
            }
        },
        'splash': {
            template: 'pages/splash.html',
            styles: ['styles/splash.css'],
            scripts: ['scripts/splash.js'],
            init: () => {
                if (typeof SplashScreen !== 'undefined') {
                    SplashScreen.init();
                }
            }
        },
        'content': {
            template: 'pages/content.html',
            styles: ['styles/content.css'],
            scripts: ['scripts/content.js'],
            init: () => {
                if (typeof ContentView !== 'undefined') {
                    ContentView.init();
                }
            }
        },
        'vending': {
            template: 'pages/vending.html',
            styles: ['styles/vending.css'],
            scripts: ['scripts/vending.js'],
            init: () => {
                if (typeof VendingMachineView !== 'undefined') {
                    // 명시적으로 초기화 메서드 호출
                    VendingMachineView.init();
                }
            }
        },
        'wallet1': {
            template: 'pages/wallet1.html',
            styles: ['styles/wallet.css'],
            scripts: ['scripts/wallet.js'],
            init: () => {
                if (typeof Wallet1View !== 'undefined') {
                    Wallet1View.init();
                }
            }
        },
        'wallet2': {
            template: 'pages/wallet2.html',
            styles: ['styles/wallet.css'],
            scripts: ['scripts/wallet.js'],
            init: () => {
                if (typeof Wallet2View !== 'undefined') {
                    Wallet2View.init();
                }
            }
        },
        'clicker': {
            template: 'pages/clicker.html',
            styles: ['styles/clicker.css'],
            scripts: ['scripts/clicker.js'],
            init: () => {
                if (typeof ClickerGameView !== 'undefined') {
                    ClickerGameView.init();
                }
            }
        },
        'withdrawal': {
            template: 'pages/withdrawal.html',
            styles: ['styles/wallet.css'],
            scripts: ['scripts/wallet.js'],
            init: () => {
                if (typeof WithdrawalView !== 'undefined') {
                    WithdrawalView.init();
                }
            }
        },
        'drink-detail': {
            template: 'pages/drink-detail.html',
            styles: ['styles/drink-detail.css'],
            scripts: ['scripts/drink-detail.js'],
            init: (params) => {
                if (typeof DrinkDetailView !== 'undefined') {
                    DrinkDetailView.init(params);
                }
            }
        }
    },

    // 페이지 이동 함수
    navigate: function(routeName, params = {}) {
        const route = this.routes[routeName];
        
        if (!route) {
            console.error(`Route ${routeName} not found`);
            return;
        }

        // 현재 로드된 스타일 제거
        this._clearCurrentStyles();

        // 새 페이지의 스타일 로드
        this._loadStyles(route.styles);

        // 페이지 템플릿 로드
        this._loadTemplate(route.template).then(content => {
            document.getElementById('page-container').innerHTML = content;
            
            // 스크립트 로드 및 초기화
            this._loadScripts(route.scripts).then(() => {
                // 페이지 초기화 함수 호출
                if (route.init) {
                    route.init(params);
                }
                
                // 현재 페이지 업데이트
                this.currentPage = routeName;
            });
        });
    },

    // 이하 기존 메서드들 그대로 유지
    // ...


    // 현재 스타일시트 제거
    _clearCurrentStyles: function() {
        const currentStyles = document.querySelectorAll('link[data-router-style]');
        currentStyles.forEach(style => style.remove());
    },

    // 스타일시트 로드
    _loadStyles: function(styles) {
        if (!styles || !styles.length) return;

        styles.forEach(style => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = style;
            link.setAttribute('data-router-style', 'true');
            document.head.appendChild(link);
        });
    },

    // 페이지 템플릿 로드
    _loadTemplate: function(templatePath) {
        return fetch(templatePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load template: ${templatePath}`);
                }
                return response.text();
            })
            .catch(error => {
                console.error('Template loading error:', error);
                return '<div class="error">페이지를 로드할 수 없습니다.</div>';
            });
    },

    // 스크립트 로드
    _loadScripts: function(scripts) {
        if (!scripts || !scripts.length) return Promise.resolve();

        const promises = scripts.map(script => {
            return new Promise((resolve, reject) => {
                // 이미 로드된 스크립트인지 확인
                const existingScript = document.querySelector(`script[src="${script}"]`);
                if (existingScript) {
                    resolve();
                    return;
                }

                const scriptElement = document.createElement('script');
                scriptElement.src = script;
                scriptElement.onload = resolve;
                scriptElement.onerror = reject;
                document.body.appendChild(scriptElement);
            });
        });

        return Promise.all(promises);
    }
};