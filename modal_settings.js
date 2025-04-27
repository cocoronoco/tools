(function() {

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

    // レビュー方法ボタンを作成する関数
    window.createReviewMethodButtons = function() {
        const container = document.createElement('div');
        container.style.marginBottom = '10px';

        // レビュー方法ボタンのスタイル
        const buttonStyle = `
            padding: 6px 12px;
            border: none;
            border-radius: 15px;
            cursor: pointer;
            font-size: 13px;
            line-height: 1.4;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            margin-right: 5px;
        `;

        const createButton = (methodName) => {
            const button = document.createElement('button');
            button.textContent = methodName;
            button.id = `reviewMethod_${methodName.replace(/[^a-zA-Z0-9]/g, '')}`; // IDを設定（空白と記号を削除）
            button.style.cssText = buttonStyle; // スタイルを適用
            button.addEventListener('click', () => {
                // ボタンクリック時に reviewMethod を更新してボタンの状態を更新
                window.reviewMethod = methodName;
                window.updateReviewMethodButtons();
            });
            return button;
        };

        const fixDiffButton = createButton('修正＆差分比較');
        const listSuggestButton = createButton('指摘&一覧表示');

        container.appendChild(fixDiffButton);
        container.appendChild(listSuggestButton);

        // 初期状態で「修正＆差分比較」を有効にする
        window.reviewMethod = '修正＆差分比較';
        window.updateReviewMethodButtons();

        return container;
    };

    // レビュー方法ボタンの状態を更新する関数
    window.updateReviewMethodButtons = function() {
        const fixDiffButton = document.getElementById('reviewMethod_修正差分比較');
        const listSuggestButton = document.getElementById('reviewMethod_指摘一覧表示');

        if (fixDiffButton && listSuggestButton) {
            // デフォルトで「修正＆差分比較」を有効化
            const isFixDiffSelected = window.reviewMethod === '修正＆差分比較';
            const isListSuggestSelected = window.reviewMethod === '指摘&一覧表示';

            // 「修正＆差分比較」ボタンの状態を更新
            fixDiffButton.style.backgroundColor = isFixDiffSelected ? '#4285F4' : '#f0f0f0';
            fixDiffButton.style.color = isFixDiffSelected ? 'white' : '#333';
            fixDiffButton.textContent = isFixDiffSelected ? '✔修正＆差分比較' : '修正＆差分比較';

            // 「指摘&一覧表示」ボタンの状態を更新
            listSuggestButton.style.backgroundColor = isListSuggestSelected ? '#4285F4' : '#f0f0f0';
            listSuggestButton.style.color = isListSuggestSelected ? 'white' : '#333';
            listSuggestButton.textContent = isListSuggestSelected ? '✔指摘&一覧表示' : '指摘&一覧表示';
        }
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
})();
