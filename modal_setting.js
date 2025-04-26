function createModalElements(AI_MODELS, selectedAIModel, currentTab, reviewPoint_01, reviewPoint_02, DEFAULT_REVIEW_POINTS) {
    // AIモデルオプションを生成
    function createAIModelOption(model) {
        const optionLabel = document.createElement('label');
        optionLabel.style.display = 'flex';
        optionLabel.style.alignItems = 'center';
        optionLabel.style.padding = '5px';
        optionLabel.style.cursor = 'pointer';
        optionLabel.style.borderBottom = '1px solid #ccc';

        const radioInput = document.createElement('input');
        radioInput.type = 'radio';
        radioInput.name = 'aiModel';  // 同じ名前にすることで、ラジオボタンとして機能
        radioInput.value = model.value;
        radioInput.style.marginRight = '10px';
        radioInput.checked = (selectedAIModel === model.value);

        radioInput.addEventListener('change', () => {
            selectedAIModel = model.value; // 選択されたAIモデルを更新
            console.log(`[AIレビュー] 選択されたAIモデルが変更されました: '${selectedAIModel}'`);
        });

        const contentContainer = document.createElement('div');
        contentContainer.style.display = 'flex';
        contentContainer.style.alignItems = 'center';
        contentContainer.style.width = '100%';

        const modelNameSpan = document.createElement('span');
        modelNameSpan.textContent = model.displayName;
        modelNameSpan.style.flex = '0 0 250px'; // 幅を固定
        modelNameSpan.style.whiteSpace = 'nowrap'; // 改行を防ぐ
        modelNameSpan.style.overflow = 'hidden';
        modelNameSpan.style.textOverflow = 'ellipsis'; // テキストが長すぎる場合は省略

        const accuracySpan = document.createElement('span');
        accuracySpan.textContent = model.accuracy;
        accuracySpan.style.marginLeft = '10px'; // 前の項目との余白
        accuracySpan.style.flex = '0 0 80px'; // 幅を設定

        const limitInfoSpan = document.createElement('span');
        if (model.limitInfo) {
            limitInfoSpan.textContent = 'ℹ️ 上限：' + model.limitInfo;
            limitInfoSpan.style.marginLeft = '10px'; // 前の項目との余白
            limitInfoSpan.style.flex = '0 0 150px'; // 幅を固定
            limitInfoSpan.style.whiteSpace = 'nowrap'; // 改行を防ぐ
        }

        const recommendedSpan = document.createElement('span');
        if (model.recommended) {
            recommendedSpan.textContent = '【💡おすすめ】';
            recommendedSpan.style.color = '#d9534f'; // 赤系の色
            recommendedSpan.style.fontWeight = 'bold';
            recommendedSpan.style.marginLeft = '10px'; // 前の項目との余白
            recommendedSpan.style.flex = '0 0 auto';
        }

        const featuresSpan = document.createElement('span');
        if (model.features) {
            featuresSpan.textContent = model.features;
            featuresSpan.style.marginLeft = '10px'; // 前の項目との余白
            featuresSpan.style.flex = '1 1 auto'; // 残りのスペースを使用
            featuresSpan.style.whiteSpace = 'nowrap'; // 改行を防ぐ
            featuresSpan.style.overflow = 'hidden';
            featuresSpan.style.textOverflow = 'ellipsis'; // テキストが長すぎる場合は省略
        } else {
            featuresSpan.style.flex = '1 1 auto'; // 要素を揃えるためにフレックス設定
        }

        // コンテナに要素を追加
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
    }

    // タブメニューを作成する関数
    function createTabMenu() {
        const tabMenu = document.createElement('div');
        tabMenu.style.marginBottom = '0px'; // 下マージンを0に調整
        tabMenu.style.display = 'flex';
        //tabMenu.style.borderBottom = '1px solid #ccc'; // 下線を削除
        tabMenu.style.paddingBottom = '0px'; // 下線の余白を削除

        // ドキュメントレビューのタブ
        const documentReviewTab = createTabButton('documentReview', 'ドキュメントレビュー');
        tabMenu.appendChild(documentReviewTab);

        // 回答文レビューのタブ
        const answerReviewTab = createTabButton('answerReview', '回答文レビュー');
        tabMenu.appendChild(answerReviewTab);

        return tabMenu;
    }

    // タブボタンを作成する関数
    function createTabButton(tabName, tabText) {
        const tabButton = document.createElement('button');
        tabButton.textContent = tabText;
        tabButton.className = `ai-review-tab-button aui-button aui-button-subtle`; // クラス名変更
        tabButton.style.marginRight = '10px';
        tabButton.style.border = 'none'; // 枠線を削除
        tabButton.style.padding = '5px 10px'; // パディングを追加
        tabButton.style.cursor = 'pointer'; // カーソルを変更
        tabButton.style.fontSize = '14px'; // フォントサイズを調整
        tabButton.style.fontWeight = 'normal'; // フォントの太さを調整

        // 選択されているタブのスタイルを適用
        if (currentTab === tabName) {
            tabButton.style.backgroundColor = '#0052cc'; // 「保存」ボタンと同じ青色
            tabButton.style.color = 'white'; // テキストを白色に
            tabButton.textContent = '✔ ' + tabText; // チェックマークを追加
        } else {
            tabButton.style.backgroundColor = '#f0f0f0'; // グレー色
            tabButton.style.color = 'black'; // テキストを黒色に
        }

        tabButton.addEventListener('click', () => {
            switchTab(tabName);
            updateTextareaContent();
            updateTabStyles(); // タブのスタイルを更新
        });

        return tabButton;
    }

    // タブのスタイルを更新する関数
    function updateTabStyles() {
        const tabButtons = document.querySelectorAll('.ai-review-tab-button'); // クラス名変更
        tabButtons.forEach(tabButton => {
            const tabName = tabButton.textContent.replace('✔ ', '').trim().replace('ドキュメントレビュー', 'documentReview').replace('回答文レビュー', 'answerReview'); // タブ名を抽出
            if (currentTab === tabName) {
                tabButton.style.backgroundColor = '#0052cc'; // 選択されたタブの背景色
                tabButton.style.color = 'white'; // 選択されたタブの文字色
                tabButton.textContent = '✔ ' + tabButton.textContent.replace('✔ ', ''); // チェックマークを追加
            } else {
                tabButton.style.backgroundColor = '#f0f0f0'; // グレー色
                tabButton.style.color = 'black'; // テキストを黒色に
                tabButton.textContent = tabButton.textContent.replace('✔ ', ''); // チェックマークを削除
            }
        });
    }

    // 現在のタブに応じてテキストエリアの内容を更新
    function updateTextareaContent() {
        console.log('[AIレビュー] テキストエリアの内容を更新します。');
        const contentArea = document.getElementById('reviewPointTextarea');
        if (currentTab === 'documentReview') {
            contentArea.value = reviewPoint_01;
        } else if (currentTab === 'answerReview') {
            contentArea.value = reviewPoint_02;
        }
        console.log('[AIレビュー] テキストエリアの内容を更新しました。');
    }

    return {
        updateTabStyles: updateTabStyles,
        updateTextareaContent: updateTextareaContent
    };
}

function attachModalEventListeners(closeModal, saveSettings, resetSettings, switchTab) {
    document.getElementById('closeModalButton').addEventListener('click', closeModal);
    document.getElementById('closeButton').addEventListener('click', closeModal);
    document.getElementById('saveButton').addEventListener('click', saveSettings);
    document.getElementById('resetButton').addEventListener('click', resetSettings);

    // タブ切り替えイベントの追加
    function addTabEventListener(tabName) {
        const tabButton = document.querySelector(`.ai-review-tab-button[data-tab="${tabName}"]`);
        if (tabButton) {
            tabButton.addEventListener('click', () => switchTab(tabName));
        }
    }

    addTabEventListener('documentReview');
    addTabEventListener('answerReview');
}
