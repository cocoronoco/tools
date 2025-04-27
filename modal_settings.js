(function() {

    // スコープ内でグローバル変数にアクセスできるように設定
    const DEFAULT_VALUES = window.DEFAULT_VALUES;
    const AI_MODELS = window.AI_MODELS;
    let reviewPoint_01 = "";
    let reviewPoint_02 = "";
    let selectedAIModel = "";
    let currentTab = "documentReview";
    let isModalOpen = false;

    // AIモデルのオプションを作成する関数
    window.createAIModelOption = function(model) {
        const optionLabel = document.createElement('label');
        optionLabel.style.display = 'flex';
        optionLabel.style.alignItems = 'center';
        optionLabel.style.padding = '5px';
        optionLabel.style.cursor = 'pointer';
        optionLabel.style.borderBottom = '1px solid #ccc';

        const radioInput = document.createElement('input');
        radioInput.type = 'radio';
        radioInput.name = 'aiModel';
        radioInput.value = model.value;
        radioInput.style.marginRight = '10px';
        radioInput.checked = (selectedAIModel === model.value);

        radioInput.addEventListener('change', () => {
            selectedAIModel = model.value;
            console.log(`[AIレビュー] 選択されたAIモデルが変更されました: '${selectedAIModel}'`);
        });

        const contentContainer = document.createElement('div');
        contentContainer.style.display = 'flex';
        contentContainer.style.alignItems = 'center';
        contentContainer.style.width = '100%';

        const modelNameSpan = document.createElement('span');
        modelNameSpan.textContent = model.displayName;
        modelNameSpan.style.flex = '0 0 250px';
        modelNameSpan.style.whiteSpace = 'nowrap';
        modelNameSpan.style.overflow = 'hidden';
        modelNameSpan.style.textOverflow = 'ellipsis';

        const accuracySpan = document.createElement('span');
        accuracySpan.textContent = model.accuracy;
        accuracySpan.style.marginLeft = '10px';
        accuracySpan.style.flex = '0 0 80px';

        const limitInfoSpan = document.createElement('span');
        if (model.limitInfo) {
            limitInfoSpan.textContent = 'ℹ️ 上限：' + model.limitInfo;
            limitInfoSpan.style.marginLeft = '10px';
            limitInfoSpan.style.flex = '0 0 150px';
            limitInfoSpan.style.whiteSpace = 'nowrap';
        }

        const recommendedSpan = document.createElement('span');
        if (model.recommended) {
            recommendedSpan.textContent = '【💡おすすめ】';
            recommendedSpan.style.color = '#d9534f';
            recommendedSpan.style.fontWeight = 'bold';
            recommendedSpan.style.marginLeft = '10px';
            recommendedSpan.style.flex = '0 0 auto';
        }

        const featuresSpan = document.createElement('span');
        if (model.features) {
            featuresSpan.textContent = model.features;
            featuresSpan.style.marginLeft = '10px';
            featuresSpan.style.flex = '1 1 auto';
            featuresSpan.style.whiteSpace = 'nowrap';
            featuresSpan.style.overflow = 'hidden';
            featuresSpan.style.textOverflow = 'ellipsis';
        } else {
            featuresSpan.style.flex = '1 1 auto';
        }

        contentContainer.appendChild(modelNameSpan);
        contentContainer.appendChild(accuracySpan);
        contentContainer.appendChild(limitInfoSpan);
        if (model.recommended) {
            contentContainer.appendChild(recommendedSpan);
        }
        if (model.features) {
            contentContainer.appendChild(featuresSpan);
        }

        optionLabel.appendChild(radioInput);
        optionLabel.appendChild(contentContainer);

        return optionLabel;
    };

    // タブメニューを作成する関数
    window.createTabMenu = function() {
        const tabMenu = document.createElement('div');
        tabMenu.style.marginBottom = '0px';
        tabMenu.style.display = 'flex';
        tabMenu.style.paddingBottom = '0px';

        const documentReviewTab = window.createTabButton('documentReview', 'ドキュメントレビュー');
        tabMenu.appendChild(documentReviewTab);

        const answerReviewTab = window.createTabButton('answerReview', '回答文レビュー');
        tabMenu.appendChild(answerReviewTab);

        return tabMenu;
    };

    // タブボタンを作成する関数
    window.createTabButton = function(tabName, tabText) {
        const tabButton = document.createElement('button');
        tabButton.textContent = tabText;
        tabButton.className = `ai-review-tab-button aui-button aui-button-subtle`;
        tabButton.style.marginRight = '10px';
        tabButton.style.border = 'none';
        tabButton.style.padding = '5px 10px';
        tabButton.style.cursor = 'pointer';
        tabButton.style.fontSize = '14px';
        tabButton.style.fontWeight = 'normal';

        if (currentTab === tabName) {
            tabButton.style.backgroundColor = '#0052cc';
            tabButton.style.color = 'white';
            tabButton.textContent = '✔ ' + tabText;
        } else {
            tabButton.style.backgroundColor = '#f0f0f0';
            tabButton.style.color = 'black';
        }

        tabButton.addEventListener('click', () => {
            switchTab(tabName);
            updateTextareaContent();
            window.updateTabStyles();
        });

        return tabButton;
    };

    // タブのスタイルを更新する関数
    window.updateTabStyles = function() {
        const tabButtons = document.querySelectorAll('.ai-review-tab-button');
        tabButtons.forEach(tabButton => {
            const tabName = tabButton.textContent.replace('✔ ', '').trim().replace('ドキュメントレビュー', 'documentReview').replace('回答文レビュー', 'answerReview');
            if (currentTab === tabName) {
                tabButton.style.backgroundColor = '#0052cc';
                tabButton.style.color = 'white';
                tabButton.textContent = '✔ ' + tabButton.textContent.replace('✔ ', '');
            } else {
                tabButton.style.backgroundColor = '#f0f0f0';
                tabButton.style.color = 'black';
                tabButton.textContent = tabButton.textContent.replace('✔ ', '');
            }
        });
    };

    // テキストエリアコンテナを作成する関数
    window.createTextareaContainer = function() {
        const textareaContainer = document.createElement('div');
        textareaContainer.style.flex = '1 1 auto';
        textareaContainer.style.display = 'flex';
        textareaContainer.style.flexDirection = 'column';

        const contentArea = document.createElement('textarea');
        contentArea.id = 'reviewPointTextarea';
        contentArea.rows = 5;
        contentArea.cols = 40;
        contentArea.style.border = '2px solid #ccc';
        contentArea.style.resize = 'none';
        contentArea.style.width = '100%';
        contentArea.style.fontSize = '14px';
        contentArea.style.lineHeight = '1.5';
        contentArea.style.fontFamily = 'Meiryo, "メイリオ", sans-serif';
        contentArea.style.flex = '1 1 auto';
        contentArea.style.marginBottom = '10px';
        textareaContainer.appendChild(contentArea);
        return textareaContainer;
    };

    // ボタンコンテナを作成する関数
    window.createButtonContainer = function() {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.marginTop = 'auto';
        buttonContainer.style.flex = '0 0 auto';

        const saveButton = document.createElement('button');
        saveButton.textContent = '保存';
        saveButton.className = 'aui-button aui-button-primary';
        saveButton.style.flex = '1';
        saveButton.style.fontSize = '18px';
        saveButton.style.marginRight = '10px';
        saveButton.addEventListener('click', saveSettings);

        const resetButton = document.createElement('button');
        resetButton.textContent = 'デフォルトに戻す';
        resetButton.className = 'aui-button';
        resetButton.style.flex = '1';
        resetButton.style.fontSize = '18px';
        resetButton.style.marginRight = '10px';
        resetButton.addEventListener('click', resetSettings);

        const closeButton = document.createElement('button');
        closeButton.textContent = '閉じる';
        closeButton.className = 'aui-button';
        closeButton.style.flex = '1';
        closeButton.style.fontSize = '18px';
        closeButton.addEventListener('click', closeModal);

        buttonContainer.appendChild(saveButton);
        buttonContainer.appendChild(resetButton);
        buttonContainer.appendChild(closeButton);

        return buttonContainer;
    };

    // モーダルを作成する関数
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
        modal.style.zIndex = '1000';
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

        closeModalButton.addEventListener('click', closeModal);
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
        AI_MODELS.forEach(model => {
            const optionLabel = createAIModelOption(model);
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
        window.addEventListener('resize', updateModalHeight);
    }

    // 設定を保存する関数
    window.saveSettings = function() {
        const contentArea = document.getElementById('reviewPointTextarea');
        if (currentTab === 'documentReview') {
            reviewPoint_01 = contentArea.value;
            localStorage.setItem('reviewPoint_01', reviewPoint_01);
        } else if (currentTab === 'answerReview') {
            reviewPoint_02 = contentArea.value;
            localStorage.setItem('reviewPoint_02', reviewPoint_02);
        }
        console.log(`[AIレビュー] レビュー観点(${currentTab})が保存されました。`);

        localStorage.setItem('selectedAIModel', selectedAIModel);
        localStorage.setItem('currentTab', currentTab);
        console.log(`[AIレビュー] 選択されたAIモデル '${selectedAIModel}' が保存されました。`);

        closeModal();
    };

    // 設定をデフォルトに戻す関数
    window.resetSettings = function() {
        localStorage.removeItem('reviewPoint_01');
        localStorage.removeItem('reviewPoint_02');
        localStorage.removeItem('selectedAIModel');
        localStorage.removeItem('currentTab');
        reviewPoint_01 = DEFAULT_VALUES[`DEFAULT_REVIEW_POINT_01`];
        reviewPoint_02 = DEFAULT_VALUES[`DEFAULT_REVIEW_POINT_02`];
        selectedAIModel = AI_MODELS.length > 0 ? AI_MODELS[0].value : '';
        currentTab = 'documentReview';
        window.updateTextareaContent();
        window.updateTabStyles();

        // ラジオボタンの選択状態を更新
        const radioButtons = document.querySelectorAll('input[name="aiModel"]');
        radioButtons.forEach(radio => {
            radio.checked = (radio.value === selectedAIModel);
        });

        console.log('[AIレビュー] 設定がデフォルトにリセットされました。');
    };

    // タブを切り替える関数
    window.switchTab = function(tabName) {
        console.log(`[AIレビュー] タブを切り替えます: ${tabName}`);
        currentTab = tabName;
        window.updateTextareaContent();
        window.updateTabStyles();
    };

    // テキストエリアの内容を更新する関数
    window.updateTextareaContent = function() {
        console.log('[AIレビュー] テキストエリアの内容を更新します。');
        const contentArea = document.getElementById('reviewPointTextarea');
        if (currentTab === 'documentReview') {
            contentArea.value = reviewPoint_01;
        } else if (currentTab === 'answerReview') {
            contentArea.value = reviewPoint_02;
        }
        console.log('[AIレビュー] テキストエリアの内容を更新しました。');
    };

    // モーダルの高さを更新する関数
    window.updateModalHeight = function() {
        try {
            const modal = document.getElementById('reviewPointModal');
            if (modal && isModalOpen) {
                const newHeight = window.innerHeight * 0.8;
                modal.style.maxHeight = `${newHeight}px`;
                modal.style.height = `${newHeight}px`;
                console.log(`[AIレビュー] モーダルの高さを${newHeight}pxに更新しました。`);
            } else {
                console.log('[AIレビュー] モーダルが開いていません。高さを更新しません。');
            }
        } catch (error) {
            console.error('[AIレビュー] リサイズ処理中にエラーが発生しました:', error);
        }
    };

    // モーダルを開く関数
    window.openModal = function() {
        console.log('[AIレビュー] モーダルを開きます。');
       window.createModal()

        isModalOpen = true;

        window.updateModalHeight();

        currentTab = localStorage.getItem('currentTab') || 'documentReview';

        updateTextareaContent();
        window.updateTabStyles();
        populateModalWithStoredValues();

        console.log('[AIレビュー] モーダルの内容を更新しました。');
    }

    // モーダルに保存された値を設定する関数
    window.populateModalWithStoredValues = function() {
        console.log('[AIレビュー] モーダルに保存された値を設定します。');
        const radioButtons = document.querySelectorAll('input[name="aiModel"]');
        const contentArea = document.getElementById('reviewPointTextarea');

        reviewPoint_01 = localStorage.getItem('reviewPoint_01') || DEFAULT_VALUES[`DEFAULT_REVIEW_POINT_01`];
        reviewPoint_02 = localStorage.getItem('reviewPoint_02') || DEFAULT_VALUES[`DEFAULT_REVIEW_POINT_02`];

        updateTextareaContent();

        selectedAIModel = localStorage.getItem('selectedAIModel') || (AI_MODELS.length > 0 ? AI_MODELS[0].value : '');

        // ラジオボタンの選択状態を更新
        radioButtons.forEach(radio => {
            radio.checked = (radio.value === selectedAIModel);
        });
        console.log('[AIレビュー] 保存されたAIモデルの値を設定しました。');
    }

    // モーダルを閉じる関数
    window.closeModal = function() {
        console.log('[AIレビュー] モーダルを閉じます。');
        const modal = document.getElementById('reviewPointModal');
        if (modal) {
            modal.style.display = 'none';
        }
        isModalOpen = false;

        resetModalSize();
    }

    // モーダルのサイズをリセットする関数
    window.resetModalSize = function() {
        const modal = document.getElementById('reviewPointModal');
        if (modal) {
            modal.style.maxHeight = '80vh';
            modal.style.height = 'auto';
        }
    }
})();
