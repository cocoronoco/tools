// modal_settings.js (GitHubに配置するファイル)

function createModal(AI_MODELS, createAIModelOption, createTabMenu, createTextareaContainer, createButtonContainer, closeModal, updateModalHeight) {
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
    const tabMenu = createTabMenu();
    modal.appendChild(tabMenu);

    // テキストエリアをコンテナに追加
    const textareaContainer = createTextareaContainer();
    modal.appendChild(textareaContainer);

    // ボタンを作成
    const buttonContainer = createButtonContainer();
    modal.appendChild(buttonContainer);
    document.body.appendChild(modal);
    console.log('[AIレビュー] モーダルが作成されました。');

    // モーダルのリサイズイベントにリスナーを追加
    window.addEventListener('resize', updateModalHeight);

    return modal; // モーダルを返す
}
