// modal_settings.js
(function() {

    // 共通スタイル設定関数
    function applyCommonStyles(element) {
        element.style.fontSize = '14px';
        element.style.lineHeight = '1.5';
        element.style.fontFamily = 'Meiryo, "メイリオ", sans-serif';
    }

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
        if (Array.isArray(AI_MODELS)) { // AI_MODELS が配列であることを確認
            AI_MODELS.forEach(model => {
                const optionLabel = window.createAIModelOption(model);
                modelOptionsContainer.appendChild(optionLabel);
            });
        } else {
            console.warn('[AIレビュー] AI_MODELS が配列ではありません。AIモデルオプションは表示されません。');
        }
        modal.appendChild(modelOptionsContainer);

        // レビュー役割のラベル
        const roleLabel = document.createElement('label');
        roleLabel.textContent = 'レビュー役割:';
        roleLabel.style.marginBottom = '5px';
        modal.appendChild(roleLabel);

        // メインのタブメニューを作成
        const mainTabMenu = createTabMenu([
            { name: 'documentReview', text: 'ドキュメントレビュー' },
            { name: 'answerReview', text: '回答文レビュー' }
        ], currentTab, window.switchTab);
        modal.appendChild(mainTabMenu);

        // テキストエリアをコンテナに追加
        const textareaContainer = window.createTextareaContainer('reviewPointTextarea');
        modal.appendChild(textareaContainer);

        // レビュー観点テキストエリアのラベル
        const pointLabel = document.createElement('label');
        pointLabel.textContent = 'レビュー観点:';
        pointLabel.style.marginBottom = '5px';
        modal.appendChild(pointLabel);

        // 日本語レビュー用のタブメニューを作成
        const japaneseReviewTabMenu = createTabMenu([
            { name: 'japaneseReview', text: '日本語のレビュー観点' },
            { name: 'englishReview', text: '英語のレビュー観点' }
        ], currentJapaneseTab, window.switchJapaneseTab);
        modal.appendChild(japaneseReviewTabMenu);

        // テキストエリアをコンテナに追加
        const textareaJapaneseContainer = window.createTextareaContainer('reviewPointTextareaJapanese');
        modal.appendChild(textareaJapaneseContainer);

        // ボタンを作成
        const buttonContainer = window.createButtonContainer();
        modal.appendChild(buttonContainer);
        document.body.appendChild(modal);
        console.log('[AIレビュー] モーダルが作成されました。');

        // モーダルのリサイズイベントにリスナーを追加
        window.addEventListener('resize', updateModalHeight);

        // 初期コンテンツを設定
        updateTextareaContent();
    };

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

    // タブボタンを作成する関数（共通化）
    function createTabButton(tabName, tabText, currentTabName, switchTabFunction) {
        const tabButton = document.createElement('button');
        tabButton.textContent = tabText;
        tabButton.className = `ai-review-tab-button aui-button aui-button-subtle`;
        tabButton.style.marginRight = '10px';
        tabButton.style.border = 'none';
        tabButton.style.padding = '5px 10px';
        tabButton.style.cursor = 'pointer';
        tabButton.style.fontSize = '14px';
        tabButton.style.fontWeight = 'normal';
        tabButton.dataset.tabName = tabName; // タブ名を data-tab-name 属性に設定

        if (currentTabName === tabName) {
            tabButton.style.backgroundColor = '#0052cc';
            tabButton.style.color = 'white';
            tabButton.textContent = '✔ ' + tabText;
        } else {
            tabButton.style.backgroundColor = '#f0f0f0';
            tabButton.style.color = 'black';
        }

        // イベントリスナーを追加
        tabButton.addEventListener('click', function() {
            switchTabFunction(tabName);
            // window.updateTextareaContent(); // ここでupdateTextareaContentを呼び出さない
            if (typeof updateTabStyles === 'function') {
                updateTabStyles();
            } else {
                console.warn('[AIレビュー] updateTabStyles が関数として定義されていません。');
            }
        });

        return tabButton;
    }

    // タブメニューを作成する関数（共通化）
    function createTabMenu(tabs, currentTabName, switchTabFunction) {
        const tabMenu = document.createElement('div');
        tabMenu.style.marginBottom = '0px';
        tabMenu.style.display = 'flex';
        tabMenu.style.paddingBottom = '0px';

        tabs.forEach(tab => {
            const tabButton = createTabButton(tab.name, tab.text, currentTabName, switchTabFunction);
            tabMenu.appendChild(tabButton);
        });

        return tabMenu;
    }

    // テキストエリアコンテナを作成する関数
    window.createTextareaContainer = function(id) {
        const textareaContainer = document.createElement('div');
        textareaContainer.style.flex = '1 1 auto';
        textareaContainer.style.display = 'flex';
        textareaContainer.style.flexDirection = 'column';

        const contentArea = document.createElement('textarea');
        contentArea.id = id;
        contentArea.rows = 5;
        contentArea.cols = 40;
        contentArea.style.border = '2px solid #ccc';
        contentArea.style.resize = 'none';
        contentArea.style.width = '100%';
        applyCommonStyles(contentArea); // 共通スタイルを適用
        contentArea.style.flex = '1 1 auto';
        contentArea.style.marginBottom = '10px';
        textareaContainer.appendChild(contentArea);
        return textareaContainer;
    };

    window.updateTabStyles = function() {
        console.log('[AIレビュー] タブのスタイルを更新します。');
        const tabButtons = document.querySelectorAll('.ai-review-tab-button');

        tabButtons.forEach(button => {
            const tabName = button.dataset.tabName; // data-tab-name 属性からタブ名を取得
            let switchTabFunction;
            let currentTabName;

            // どのタブグループに属しているかを判定
            if (button.parentElement.contains(document.querySelector('.ai-review-tab-button[data-tab-name="japaneseReview"], .ai-review-tab-button[data-tab-name="englishReview"]'))) {
                switchTabFunction = window.switchJapaneseTab;
                currentTabName = currentJapaneseTab;
            } else {
                switchTabFunction = window.switchTab;
                currentTabName = currentTab;
            }

            if (currentTabName === tabName) {
                button.style.backgroundColor = '#0052cc';
                button.style.color = 'white';
                button.textContent = '✔ ' + button.textContent.replace('✔ ', '');
                if (!button.textContent.startsWith('✔ ')) {
                    button.textContent = '✔ ' + button.textContent;
                }
            } else {
                button.style.backgroundColor = '#f0f0f0';
                button.style.color = 'black';
                button.textContent = button.textContent.replace('✔ ', '');
            }
        });
        console.log('[AIレビュー] タブのスタイルを更新しました。');
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
