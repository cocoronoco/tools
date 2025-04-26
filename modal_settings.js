// modal_settings.js

// モーダルを作成する関数
function createModal(AI_MODELS, selectedAIModel, reviewPoint_01, reviewPoint_02, DEFAULT_REVIEW_POINTS, currentTab, saveSettings, resetSettings, closeModal, switchTab, updateModalHeight) {
    console.log('[AIレビュー] モーダルを作成します。');
    const modal = document.createElement('div');
    modal.id = 'reviewPointModal';
    modal.style.display = 'none'; // 初期状態では非表示
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = '#fff';
    modal.style.border = '1px solid #ccc';
    modal.style.padding = '20px';
    modal.style.zIndex = '1000';
    modal.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.1)';
    modal.style.width = '1100px'; // モーダルの幅を設定
    modal.style.maxWidth = '90%'; // 最大幅を設定
    modal.style.height = '80vh'; // ビューポートの80%の高さ
    modal.style.flexDirection = 'column'; // 縦方向に並べる
    modal.style.boxSizing = 'border-box'; // パディングを含めたサイズ指定

    // モーダルのタイトル
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = 'AIレビュー設定';
    modalTitle.style.marginTop = '0';
    modalTitle.style.flex = '0 0 auto'; // タイトルの高さは固定
    modal.appendChild(modalTitle);

    // 閉じるボタンを作成
    const closeModalButton = document.createElement('span');
    closeModalButton.textContent = '✖️'; // バツ印の表示
    closeModalButton.style.cursor = 'pointer';
    closeModalButton.style.fontSize = '20px'; // サイズを定義
    closeModalButton.style.float = 'right'; // 右に寄せる
    closeModalButton.style.marginLeft = '10px'; // タイトルとの間に余白

    // 閉じるボタンがクリックされた時の処理
    closeModalButton.addEventListener('click', closeModal);

    // タイトルに閉じるボタンを追加
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
        const optionLabel = createAIModelOption(model, selectedAIModel);
        modelOptionsContainer.appendChild(optionLabel);
    });
    modal.appendChild(modelOptionsContainer);

    // レビュー観点テキストエリアのラベル
    const criteriaLabel = document.createElement('label');
    criteriaLabel.textContent = 'レビュー観点:';
    criteriaLabel.style.marginBottom = '5px';
    modal.appendChild(criteriaLabel);

    // タブメニューを作成
    const tabMenu = createTabMenu(currentTab, switchTab);
    modal.appendChild(tabMenu);

    // テキストエリアをコンテナに追加
    const textareaContainer = createTextareaContainer();
    modal.appendChild(textareaContainer);

    // ボタンを作成
    const buttonContainer = createButtonContainer(saveSettings, resetSettings, closeModal);
    modal.appendChild(buttonContainer); // ボタンコンテナを追加
    document.body.appendChild(modal);
    console.log('[AIレビュー] モーダルが作成されました。');

    // モーダルのリサイズイベントにリスナーを追加
    window.addEventListener('resize', updateModalHeight);
}

// タブメニューを作成する関数
function createTabMenu(currentTab, switchTab) {
    const tabMenu = document.createElement('div');
    tabMenu.style.marginBottom = '0px'; // 下マージンを0に調整
    tabMenu.style.display = 'flex';
    //tabMenu.style.borderBottom = '1px solid #ccc'; // 下線を削除
    tabMenu.style.paddingBottom = '0px'; // 下線の余白を削除

    // ドキュメントレビューのタブ
    const documentReviewTab = createTabButton('documentReview', 'ドキュメントレビュー', currentTab, switchTab);
    tabMenu.appendChild(documentReviewTab);

    // 回答文レビューのタブ
    const answerReviewTab = createTabButton('answerReview', '回答文レビュー', currentTab, switchTab);
    tabMenu.appendChild(answerReviewTab);

    return tabMenu;
}

// タブボタンを作成する関数
function createTabButton(tabName, tabText, currentTab, switchTab) {
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
        updateTabStyles(currentTab); // タブのスタイルを更新
    });

    return tabButton;
}

// タブのスタイルを更新する関数
function updateTabStyles(currentTab) {
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

// テキストエリアコンテナを作成する関数
function createTextareaContainer() {
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
}

// AIモデルのオプションを作成する関数
function createAIModelOption(model, selectedAIModel) {
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

// ボタンコンテナを作成する関数
function createButtonContainer(saveSettings, resetSettings, closeModal) {
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex'; // フレックスボックスを利用して横並びにする
    buttonContainer.style.marginTop = 'auto'; // コンテナを下部に固定
    buttonContainer.style.flex = '0 0 auto'; // 高さを固定

    const saveButton = document.createElement('button');
    saveButton.textContent = '保存';
    saveButton.className = 'aui-button aui-button-primary';
    saveButton.style.flex = '1'; // フレックスボックスで同じ幅を持たせる
    saveButton.style.fontSize = '18px'; // ボタンのテキストサイズ
    saveButton.style.marginRight = '10px'; // ボタン間の余白を設定
    saveButton.addEventListener('click', saveSettings);

    const resetButton = document.createElement('button');
    resetButton.textContent = 'デフォルトに戻す';
    resetButton.className = 'aui-button';
    resetButton.style.flex = '1'; // フレックスボックスで同じ幅を持たせる
    resetButton.style.fontSize = '18px'; // ボタンのテキストサイズ
    resetButton.style.marginRight = '10px'; // ボタン間の余白を設定
    resetButton.addEventListener('click', resetSettings);

    const closeButton = document.createElement('button');
    closeButton.textContent = '閉じる';
    closeButton.className = 'aui-button';
    closeButton.style.flex = '1'; // フレックスボックスで同じ幅を持たせる
    closeButton.style.fontSize = '18px'; // ボタンのテキストサイズ
    closeButton.addEventListener('click', closeModal);

    buttonContainer.appendChild(saveButton);
    buttonContainer.appendChild(resetButton);
    buttonContainer.appendChild(closeButton);

    return buttonContainer;
}

// テキストエリアの内容を更新する関数
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
