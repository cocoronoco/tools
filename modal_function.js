(function() {

    // 共通スタイル設定関数
    function applyCommonStyles(element) {
        element.style.fontSize = '14px';
        element.style.lineHeight = '1.5';
        element.style.fontFamily = 'Meiryo, "メイリオ", sans-serif';
    }

    // 要素作成関数
    function createElement(type, options) {
        const element = document.createElement(type);
        Object.assign(element, options);
        return element;
    }

    // スタイル設定関数
    function applyStyles(element, styles) {
        Object.assign(element.style, styles);
    }

    // モーダルを作成する関数
    window.createModal = function() {
        console.log('[AIレビュー] モーダルを作成します。');

        const modal = createElement('div', { id: 'reviewPointModal' });
        applyStyles(modal, {
            display: 'none',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            padding: '20px',
            zIndex: '2147483647',
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
            width: '1300px',
            maxWidth: '90%',
            height: '80vh',
            flexDirection: 'column',
            boxSizing: 'border-box'
        });

        // モーダルのタイトル
        const modalTitle = createElement('h2', { textContent: 'AIレビュー設定' });
        applyStyles(modalTitle, { marginTop: '0', flex: '0 0 auto' });
        modal.appendChild(modalTitle);

        // 閉じるボタンを作成
        const closeModalButton = createElement('span', { textContent: '✖️', style: { cursor: 'pointer', fontSize: '20px', float: 'right', marginLeft: '10px' } });
        closeModalButton.addEventListener('click', closeModal);
        modalTitle.appendChild(closeModalButton);

        // AIモデルセレクトボックスのラベル
        const modelSelectLabel = createElement('label', { textContent: 'AIモデル:' });
        applyStyles(modelSelectLabel, { marginBottom: '10px' });
        modal.appendChild(modelSelectLabel);

        // AIモデルオプションを格納するコンテナ
        const modelOptionsContainer = createElement('div');
        applyStyles(modelOptionsContainer, { display: 'flex', flexDirection: 'column', marginBottom: '20px' });

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
        const roleLabel = createElement('label', { textContent: 'レビュー役割:' });
        applyStyles(roleLabel, { marginBottom: '5px' });
        modal.appendChild(roleLabel);

        // メインのタブメニューを作成
        const mainTabMenu = createTabMenu([
            { name: 'documentReview', text: 'ドキュメントレビュー' },
            { name: 'answerReview', text: '回答文レビュー' }
        ], currentTab, (tabName) => window.switchTab(tabName, 'currentTab'));
        modal.appendChild(mainTabMenu);

        // テキストエリアをコンテナに追加
        const textareaContainer = window.createTextareaContainer('reviewPointRoleTextarea');
        modal.appendChild(textareaContainer);

        // レビュー観点テキストエリアのラベル
        const pointLabelContainer = createElement('div');
        applyStyles(pointLabelContainer, { display: 'flex', alignItems: 'center', marginBottom: '5px' });

        const pointLabel = createElement('label', { textContent: 'レビュー観点:' });
        pointLabelContainer.appendChild(pointLabel);

        const referenceLink = createElement('a', { href: 'https://helpdesk.aslead.cloud/wiki/pages/viewpage.action?pageId=203030616', textContent: '（💡文章のレビュー観点はこちらを参照）', target: '_blank' });
        applyStyles(referenceLink, { marginLeft: '5px' });
        pointLabelContainer.appendChild(referenceLink);

        modal.appendChild(pointLabelContainer);

        // 日本語レビュー用のタブメニューを作成
        const languageReviewTabMenu = createTabMenu([
            { name: 'japaneseReview', text: '日本語のレビュー観点' },
            { name: 'englishReview', text: '英語のレビュー観点' }
        ], currentLanguageTab, (tabName) => window.switchTab(tabName, 'currentLanguageTab'));
        modal.appendChild(languageReviewTabMenu);

        // テキストエリアをコンテナに追加
        const textareaLanguageContainer = window.createTextareaContainer('reviewPointLanguageTextarea');
        modal.appendChild(textareaLanguageContainer);

        // レビュー方法のラベル
        const methodLabel = createElement('label', { textContent: 'レビュー方法:' });
        applyStyles(methodLabel, { marginBottom: '5px' });
        modal.appendChild(methodLabel);

        // レビュー方法のタブメニューを作成
        const methodTabMenu = createTabMenu([
            { name: 'diffReview', text: '差分比較レビュー' },
            { name: 'confluenceReview', text: 'Confluenceページレビュー' }
        ], currentMethodTab, (tabName) => window.switchTab(tabName, 'currentMethodTab'));
        modal.appendChild(methodTabMenu);

        // レビュー方法のテキストエリアをコンテナに追加
        const methodTextareaContainer = window.createTextareaContainer('reviewPointMethodTextarea');
        modal.appendChild(methodTextareaContainer);

        // ボタンを作成
        const buttonContainer = window.createButtonContainer();
        modal.appendChild(buttonContainer);
        document.body.appendChild(modal);
        console.log('[AIレビュー] モーダルが作成されました。');

        // モーダルのリサイズイベントにリスナーを追加
        window.addEventListener('resize', updateModalHeight);

        // 初期コンテンツを設定
        window.updateTextareaContent();
    };

    // AIモデルのオプションを作成する関数
    window.createAIModelOption = function(model) {
        const optionLabel = createElement('label');
        applyStyles(optionLabel, {
            display: 'flex',
            alignItems: 'center',
            padding: '5px',
            cursor: 'pointer',
            borderBottom: '1px solid #ccc'
        });

        const radioInput = createElement('input', {
            type: 'radio',
            name: 'aiModel',
            value: model.value,
            style: { marginRight: '10px' },
            checked: (selectedAIModel === model.value)
        });

        radioInput.addEventListener('change', () => {
            selectedAIModel = model.value;
            console.log(`[AIレビュー] 選択されたAIモデルが変更されました: '${selectedAIModel}'`);
        });

        const contentContainer = createElement('div');
        applyStyles(contentContainer, { display: 'flex', alignItems: 'center', width: '100%' });

        const modelNameSpan = createElement('span', { textContent: model.displayName });
        applyStyles(modelNameSpan, { flex: '0 0 250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' });

        const accuracySpan = createElement('span', { textContent: model.accuracy });
        applyStyles(accuracySpan, { marginLeft: '10px', flex: '0 0 80px' });

        let limitInfoSpan;
        if (model.limitInfo) {
            limitInfoSpan = createElement('span', { textContent: 'ℹ️ 上限：' + model.limitInfo });
            applyStyles(limitInfoSpan, { marginLeft: '10px', flex: '0 0 150px', whiteSpace: 'nowrap' });
        }

        let recommendedSpan;
        if (model.recommended) {
            recommendedSpan = createElement('span', { textContent: '【💡おすすめ】' });
            applyStyles(recommendedSpan, { color: '#d9534f', fontWeight: 'bold', marginLeft: '10px', flex: '0 0 auto' });
        }

        const featuresSpan = createElement('span', { textContent: model.features });
        if (model.features) {
            applyStyles(featuresSpan, { marginLeft: '10px', flex: '1 1 auto', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' });
        }

        contentContainer.appendChild(modelNameSpan);
        contentContainer.appendChild(accuracySpan);
        if (limitInfoSpan) contentContainer.appendChild(limitInfoSpan);
        if (recommendedSpan) contentContainer.appendChild(recommendedSpan);
        if (model.features) contentContainer.appendChild(featuresSpan);

        optionLabel.appendChild(radioInput);
        optionLabel.appendChild(contentContainer);

        return optionLabel;
    };

    // タブボタンのスタイルを更新する関数（共通化）
    function updateTabButtonStyle(tabButton, currentTabName, tabName) {
        if (currentTabName === tabName) {
            applyStyles(tabButton, { backgroundColor: '#0052cc', color: 'white' });
            if (!tabButton.textContent.startsWith('✔ ')) {
                tabButton.textContent = '✔ ' + tabButton.textContent;
            }
        } else {
            applyStyles(tabButton, { backgroundColor: '#f0f0f0', color: 'black' });
            tabButton.textContent = tabButton.textContent.replace('✔ ', '');
        }
    }

    // タブボタンを作成する関数（共通化）
    function createTabButton(tabName, tabText, currentTabName, switchTabFunction) {
        const tabButton = createElement('button', { textContent: tabText, className: `ai-review-tab-button aui-button aui-button-subtle`, dataset: { tabName: tabName } });
        applyStyles(tabButton, { marginRight: '10px', border: 'none', padding: '5px 10px', cursor: 'pointer', fontSize: '14px', fontWeight: 'normal' });

        updateTabButtonStyle(tabButton, currentTabName, tabName);

        // イベントリスナーを追加
        tabButton.addEventListener('click', function() {
            switchTabFunction(tabName);
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
        const tabMenu = createElement('div');
        applyStyles(tabMenu, { marginBottom: '0px', display: 'flex', paddingBottom: '0px' });

        tabs.forEach(tab => {
            const tabButton = createTabButton(tab.name, tab.text, currentTabName, switchTabFunction);
            tabMenu.appendChild(tabButton);
        });

        return tabMenu;
    }

    // テキストエリアコンテナを作成する関数
    window.createTextareaContainer = function(id) {
        const textareaContainer = createElement('div');
        applyStyles(textareaContainer, { flex: '1 1 auto', display: 'flex', flexDirection: 'column' });

        const contentAreaTemp = createElement('textarea', { id: id, rows: 5, cols: 40 });
        applyStyles(contentAreaTemp, { border: '2px solid #ccc', resize: 'none', width: '100%', flex: '1 1 auto', marginBottom: '10px' });
        applyCommonStyles(contentAreaTemp); // 共通スタイルを適用

        textareaContainer.appendChild(contentAreaTemp);

        // テキストエリアの内容が変更されたときに updateTempTextareaContent を呼び出す
        contentAreaTemp.addEventListener('input', function() {
            window.updateTempTextareaContent(id, this.value);
        });

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
                switchTabFunction = window.switchTab;
                currentTabName = currentLanguageTab;
            } else if (button.parentElement.contains(document.querySelector('.ai-review-tab-button[data-tab-name="diffReview"], .ai-review-tab-button[data-tab-name="confluenceReview"]'))) {
                switchTabFunction = window.switchTab;
                currentTabName = currentMethodTab;
            } else {
                switchTabFunction = window.switchTab;
                currentTabName = currentTab;
            }

            updateTabButtonStyle(button, currentTabName, tabName);
        });
        console.log('[AIレビュー] タブのスタイルを更新しました。');
    };

    // ボタンコンテナを作成する関数
    window.createButtonContainer = function() {
        const buttonContainer = createElement('div');
        applyStyles(buttonContainer, { display: 'flex', marginTop: 'auto', flex: '0 0 auto' });

        const saveButton = createElement('button', { textContent: '保存', className: 'aui-button aui-button-primary' });
        applyStyles(saveButton, { flex: '1', fontSize: '18px', marginRight: '10px' });
        saveButton.addEventListener('click', saveSettings);

        const resetButton = createElement('button', { textContent: 'デフォルトに戻す', className: 'aui-button' });
        applyStyles(resetButton, { flex: '1', fontSize: '18px', marginRight: '10px' });
        resetButton.addEventListener('click', resetSettings);

        const closeButton = createElement('button', { textContent: '閉じる', className: 'aui-button' });
        applyStyles(closeButton, { flex: '1', fontSize: '18px' });
        closeButton.addEventListener('click', closeModal);

        buttonContainer.appendChild(saveButton);
        buttonContainer.appendChild(resetButton);
        buttonContainer.appendChild(closeButton);

        return buttonContainer;
    };

    // タブを切り替える関数
    window.switchTab = function(tabName, storageKey) {
        console.log(`[AIレビュー] タブを切り替えます: ${tabName} (storageKey: ${storageKey})`);
        // storageKeyに基づいてcurrentTab変数を更新
        if (storageKey === 'currentTab') {
            currentTab = tabName;
        } else if (storageKey === 'currentLanguageTab') {
            currentLanguageTab = tabName;
        } else if (storageKey === 'currentMethodTab') {
            currentMethodTab = tabName;
        }
        localStorage.setItem(storageKey, tabName); // タブの状態を保存
        window.updateTextareaContent();
        if (typeof updateTabStyles === 'function') {
            updateTabStyles();
        } else {
            console.warn('[AIレビュー] updateTabStyles が関数として定義されていません。');
        }
    };

    // テキストエリアの内容を更新する関数
    window.updateTextareaContent = function() {
        console.log('[AIレビュー] テキストエリアの内容を更新します。');
        const contentAreaRole = document.getElementById('reviewPointRoleTextarea');
        const contentAreaLanguage = document.getElementById('reviewPointLanguageTextarea');
        const contentAreaMethod = document.getElementById('reviewPointMethodTextarea');

        if (contentAreaRole) {
            if (currentTab === 'documentReview') {
                contentAreaRole.value = tempReviewPoint_document;
            } else if (currentTab === 'answerReview') {
                contentAreaRole.value = tempReviewPoint_answer;
            }
        }

        if (contentAreaLanguage) {
            if (currentLanguageTab === 'japaneseReview') {
                contentAreaLanguage.value = tempReviewPoint_japanese;
            } else if (currentLanguageTab === 'englishReview') {
                contentAreaLanguage.value = tempReviewPoint_english;
            }
        }

        if (contentAreaMethod) {
            if (currentMethodTab === 'diffReview') {
                contentAreaMethod.value = tempReviewPoint_diffReview;
            } else if (currentMethodTab === 'confluenceReview') {
                contentAreaMethod.value = tempReviewPoint_confluenceReview;
            }
        }
        console.log('[AIレビュー] テキストエリアの内容を更新しました。');
    };

    // モーダルを開く関数
    window.openModal = function() {
        console.log('[AIレビュー] モーダルを開きます。');
        const modal = document.getElementById('reviewPointModal');

        if (!modal) {
            console.error('[AIレビュー] モーダルが見つかりません。');
            return;
        }

        isModalOpen = true;
        modal.style.display = 'flex';

        updateModalHeight();

        currentTab = localStorage.getItem('currentTab') || 'documentReview';
        currentLanguageTab = localStorage.getItem('currentLanguageTab') || 'japaneseReview';
        currentMethodTab = localStorage.getItem('currentMethodTab') || 'diffReview';

        window.updateTextareaContent();
        if (typeof updateTabStyles === 'function') {
            updateTabStyles();
        } else {
            console.warn('[AIレビュー] updateTabStyles が関数として定義されていません。');
        }
        populateModalWithStoredValues();

        console.log('[AIレビュー] モーダルの内容を更新しました。');
    };

    // モーダルの高さを更新する関数
    function updateModalHeight() {
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
    function resetModalSize() {
        const modal = document.getElementById('reviewPointModal');
        if (modal) {
            modal.style.maxHeight = '80vh';
            modal.style.height = 'auto';
        }
    }

    // テキストエリアの内容が変更されたときに一時保存変数に保存する関数
    window.updateTempTextareaContent = function(textareaId, value) {
        switch (textareaId) {
            case 'reviewPointRoleTextarea':
                if (currentTab === 'documentReview') {
                    tempReviewPoint_document = value;
                } else if (currentTab === 'answerReview') {
                    tempReviewPoint_answer = value;
                }
                break;
            case 'reviewPointLanguageTextarea':
                if (currentLanguageTab === 'japaneseReview') {
                    tempReviewPoint_japanese = value;
                } else if (currentLanguageTab === 'englishReview') {
                    tempReviewPoint_english = value;
                }
                break;
            case 'reviewPointMethodTextarea':
                if (currentMethodTab === 'diffReview') {
                    tempReviewPoint_diffReview = value;
                } else if (currentMethodTab === 'confluenceReview') {
                    tempReviewPoint_confluenceReview = value;
                }
                break;
        }
        console.log(`[AIレビュー] テキストエリア '${textareaId}' の内容を一時保存しました。`);
    };

})();
