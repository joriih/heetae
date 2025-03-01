// ContentView 모듈
const ContentView = {
    // 타이핑 할 텍스트
    fullText: "목 마르다...\n뭐 좀 마실까?",
    typingSpeed: 100, // 타이핑 속도 (ms)
    isTypingComplete: false, // 타이핑 완료 여부
    
    init: function() {
        // 타이핑 효과 시작
        this.startTypingEffect();
        
        // 텍스트 박스 클릭 이벤트 처리
        const textBox = document.querySelector('.text-box');
        textBox.addEventListener('click', () => {
            // 타이핑이 완료된 경우에만 다음 화면으로 이동
            if (this.isTypingComplete) {
                Router.navigate('vending');
            }
        });
    },
    
    // 타이핑 효과 시작
    startTypingEffect: function() {
        const textElement = document.getElementById('typing-text');
        const arrowElement = document.getElementById('continue-arrow');
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
                this.isTypingComplete = true;
                
                // 계속 버튼 표시 및 깜빡임 효과
                arrowElement.classList.remove('hidden');
                arrowElement.classList.add('blinking');
            }
        }, this.typingSpeed);
    }
};