const BackCommon = {
    // 뒤로가기 이벤트 설정
    setupBackButton: function() {
        const backButton = document.getElementById('back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                Router.navigate('vending');
            });
        }
    }
};


const DrinkDetailView = {
    
    init: function(params) {
        // 전달받은 파라미터에서 drinkId를 추출합니다.
        const drinkId = params.drinkId;
        console.log("전달받은 drinkId:", drinkId);
        BackCommon.setupBackButton();
        // 배경 이미지를 drinkId에 맞게 변경합니다.
        const bgImage = document.querySelector('.background-image img');
        if (bgImage) {
            bgImage.src = `assets/images/${drinkId}_image.png`;
            bgImage.alt = `${drinkId} 이미지`;
        }
        
        // 나머지 drink-detail 초기화 코드들을 작성하시면 됩니다.
    }
};
