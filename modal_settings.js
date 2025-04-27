// modal_settings.js

(function() {
    'use strict';

    console.log('[AIレビュー] modal_settings.js をロードしました。');

    // グローバルスコープに関数を追加
    window.createModal = function() {
        console.log('[AIレビュー] モーダルを作成します。');
        const modal = document.createElement('div');
        modal.id = 'reviewPointModal';
        modal.style.display = 'none';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.backgroundColor = '#fff';
        modal.style.border = '1px solid #ccc';
        modal.style.padding = '20px';
        modal.style.zIndex = '2147483647';
        modal.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.1)';
        modal.style.width = '1100px';
        modal.style.maxWidth = '90%';
        modal.style.height = '80vh';
        modal.style.flexDirection = 'column';
        modal.style.boxSizing = 'border-box';

        // モーダルのタイトル
        const modalTitle = document.createElement('h2');
        modalTitle.textContent = 'AIレビュー設定';
        modalTitle.style.marginTop = '0';
        modalTitle.style.flex = '0 0 auto';
        modal.appendChild(modalTitle);

        // 閉じるボタンを作成
        const closeModalButton = document.createElement('span');
        closeModalButton.textContent = '✖️';
        closeModalButton.style.cursor = 'pointer';
        closeModalButton.style.fontSize = '20px';
        closeModalButton.style.float = 'right';
        closeModalButton.style.marginLeft = '10px';

        closeModalButton.addEventListener('click', window.closeModal);
        modalTitle.appendChild(closeModalButton);

        // AIモデルセレクトボックスのラベル
        const modelSelectLabel = document.createElement('label');
        modelSelectLabel.textContent = 'AIモデル:';
        modelSelectLabel.style.marginBottom = '10px';
        modal.appendChild(modelSelectLabel);

        // AIモデルオプションを格納するコンテナ
        const modelOptionsContainer = document.createElement('div');
        modelOptionsContainer.style.display = 'flex';
        modelOptionsContainer.style.flexDirection = 'column';
        modelOptionsContainer.style.marginBottom = '20px';
        window.AI_MODELS.forEach(model => {
            const optionLabel = window.createAIModelOption(model);
            modelOptionsContainer.appendChild(optionLabel);
        });
        modal.appendChild(modelOptionsContainer);

        // レビュー観点テキストエリアのラベル
        const criteriaLabel = document.createElement('label');
        criteriaLabel.textContent = 'レビュー観点:';
        criteriaLabel.style.marginBottom = '5px';
        modal.appendChild(criteriaLabel);

        // タブメニューを作成
        const tabMenu = window.createTabMenu();
        modal.appendChild(tabMenu);

        // テキストエリアをコンテナに追加
        const textareaContainer = window.createTextareaContainer();
        modal.appendChild(textareaContainer);

        // ボタンを作成
        const buttonContainer = window.createButtonContainer();
        modal.appendChild(buttonContainer);
        document.body.appendChild(modal);
        console.log('[AIレビュー] モーダルが作成されました。');

        // モーダルのリサイズイベントにリスナーを追加
        window.addEventListener('resize', window.updateModalHeight);
    };

    window.createTabMenu = function() {
        const tabMenu = document.createElement('div');
        tabMenu.className = 'tab-menu';
        tabMenu.style.marginBottom = '10px';

        const documentTab = document.createElement('button');
        documentTab.textContent = 'ドキュメントレビュー';
        documentTab.className = 'tab-button';
        documentTab.dataset.tab = 'documentReview';
        documentTab.addEventListener('click', () => window.switchTab('documentReview'));
        tabMenu.appendChild(documentTab);

        const answerTab = document.createElement('button');
        answerTab.textContent = '回答レビュー';
        answerTab.className = 'tab-button';
        answerTab.dataset.tab = 'answerReview';
        answerTab.addEventListener('click', () => window.switchTab('answerReview'));
        tabMenu.appendChild(answerTab);

        return tabMenu;
    };

    window.createTextareaContainer = function() {
        const textareaContainer = document.createElement('div');
        textareaContainer.className = 'textarea-container';

        const textarea = document.createElement('textarea');
        textarea.id = 'reviewPointTextarea';
        textarea.style.width = '100%';
        textarea.style.height = '200px';
        textarea.style.marginBottom = '10px';
        textareaContainer.appendChild(textarea);

        return textareaContainer;
    };

    window.createButtonContainer = function() {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        buttonContainer.style.textAlign = 'right';

        const saveButton = document.createElement('button');
        saveButton.textContent = '保存';
        saveButton.className = 'aui-button aui-button-primary';
        saveButton.addEventListener('click', window.saveSettings);
        buttonContainer.appendChild(saveButton);

        const resetButton = document.createElement('button');
        resetButton.textContent = 'リセット';
        resetButton.className = 'aui-button aui-button-link';
        resetButton.addEventListener('click', window.resetSettings);
        buttonContainer.appendChild(resetButton);

        return buttonContainer;
    };

    window.updateTabStyles = function() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            if (button.dataset.tab === window.currentTab) {
                button.classList.add('active');
                button.style.backgroundColor = '#4285F4';
                button.style.color = 'white';
            } else {
                button.classList.remove('active');
                button.style.backgroundColor = '';
                button.style.color = '';
            }
        });
    };
    
    // モーダルを開く関数をグローバルスコープに追加
    window.openModal = function() {
        console.log('[AIレビュー] モーダルを開きます。');
        const modal = document.getElementById('reviewPointModal');

        window.isModalOpen = true;
        modal.style.display = 'flex';

        window.updateModalHeight();

        window.currentTab = localStorage.getItem('currentTab') || 'documentReview';

        window.updateTextareaContent();
        window.updateTabStyles();
        populateModalWithStoredValues();

        console.log('[AIレビュー] モーダルの内容を更新しました。');
    };
    
    // モーダルに保存された値を設定する関数
    function populateModalWithStoredValues() {
        console.log('[AIレビュー] モーダルに保存された値を設定します。');
        const radioButtons = document.querySelectorAll('input[name="aiModel"]');
        const contentArea = document.getElementById('reviewPointTextarea');

        window.reviewPoint_01 = localStorage.getItem('reviewPoint_01') || window.DEFAULT_VALUES[`DEFAULT_REVIEW_POINT_01`];
        window.reviewPoint_02 = localStorage.getItem('reviewPoint_02') || window.DEFAULT_VALUES[`DEFAULT_REVIEW_POINT_02`];

        window.updateTextareaContent();

        window.selectedAIModel = localStorage.getItem('selectedAIModel') || (window.AI_MODELS.length > 0 ? window.AI_MODELS[0].value : '');

        // ラジオボタンの選択状態を更新
        radioButtons.forEach(radio => {
            radio.checked = (radio.value === window.selectedAIModel);
        });
        console.log('[AIレビュー] 保存されたAIモデルの値を設定しました。');
    }

    console.log('[AIレビュー] modal_settings.js: 関数を定義しました。');

})();
