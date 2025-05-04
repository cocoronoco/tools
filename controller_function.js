(function() {
    'use strict';

    console.log('[AIレビュー] controller_function.js をロードしました。');

    // グローバル変数 (Tampermonkeyスクリプトと共有)
    let reviewButton = null;
    let settingsButton = null;
    let buttonsVisible = false;
    let shiftKeyPressed = false;
    let lastSelection = null;
    let isInitialized = false;

    // ConfluenceのページヘッダーにAIレビュー用のボタンと設定アイコンを追加する関数
    window.addConfluenceHeaderButton = function() {
        console.log('[AIレビュー] AIレビュー用ボタンを追加します。');
        const bannerList = document.querySelector('.banner');

        if (!bannerList) {
            console.error('[AIレビュー] バナーが見つかりません。');
            return;
        }

        const listItem = document.createElement('li');
        listItem.className = 'page-metadata-item';

        const reviewButton = document.createElement('button');
        reviewButton.textContent = 'AIレビューを実行';
        reviewButton.className = 'aui-button aui-button-primary';
        reviewButton.addEventListener('click', () => {
            console.log('[AIレビュー] AIレビュー実行ボタンがクリックされました。');
            window.triggerAIReviewButton(saveAIRequest(), 'html');
        });

        const settingsIcon = document.createElement('span');
        settingsIcon.className = 'settings-icon';
        settingsIcon.innerHTML = '⚙️';
        settingsIcon.style.cursor = 'pointer';
        settingsIcon.title = '設定';
        settingsIcon.style.fontSize = '20px';
        settingsIcon.style.marginLeft = '10px';
        settingsIcon.addEventListener('click', () => {
            console.log('[AIレビュー] 設定アイコンがクリックされました。');
            window.toggleModal();
        });

        listItem.appendChild(reviewButton);
        listItem.appendChild(settingsIcon);
        bannerList.appendChild(listItem);
        console.log('[AIレビュー] AIレビュー用ボタンと設定アイコンを追加しました。');
    };

    // イベントハンドラを初期化する関数
    window.initializeEventHandlers = function() {
        console.log('[AIレビュー] controller_function.js: イベントハンドラを初期化します。');

        // イベントハンドラを定義
        const handleReviewButtonClick = () => {
            console.log('[AIレビュー] 選択文字列用 AIレビュー実行ボタンがクリックされました。');
            window.triggerAIReviewButton(window.currentSelectedText, 'text');
            removeExistingButtons();
        };

        const handleSettingsButtonClick = () => {
            console.log('[AIレビュー] 選択文字列用 設定ボタンがクリックされました。');
            document.dispatchEvent(new CustomEvent('openAiSettings', { detail: { type: 'selection' } }));
            removeExistingButtons();
        };

        // ボタン要素を作成する関数
        const createButtonElement = (text, id, clickHandler, styleOptions = {}) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.setAttribute('id', id);
            button.addEventListener('click', clickHandler);

            // スタイルを適用
            Object.assign(button.style, styleOptions);
            return button;
        };

        // スタイルを適用する関数
        const applyButtonStyle = (button, position, additionalStyles = {}) => {
            Object.assign(button.style, {
                position: 'absolute',
                left: `${position.x}px`,
                top: `${position.y}px`,
                zIndex: '2147483645',
                padding: '6px 12px',
                border: 'none',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                lineHeight: '1.4',
                whiteSpace: 'nowrap',
            }, additionalStyles);
        };

        // ボタンの表示位置を計算する関数
        const calculateButtonPosition = (selection) => {
            try {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                if (!rect || (rect.width === 0 && rect.height === 0 && selection.toString().length === 0)) {
                    return null;
                }

                let x = rect.right + window.scrollX + 5;
                let y = rect.bottom + window.scrollY + 5;

                const viewportWidth = window.innerWidth;
                const estimatedButtonWidth = 200;
                if (x + estimatedButtonWidth > viewportWidth + window.scrollX) {
                    x = viewportWidth + window.scrollX - estimatedButtonWidth - 5;
                    if (x < window.scrollX + 5) x = window.scrollX + 5;
                }

                const viewportHeight = window.innerHeight;
                const estimatedButtonHeight = 30;
                if (y + estimatedButtonHeight > viewportHeight + window.scrollY) {
                    y = rect.top + window.scrollY - estimatedButtonHeight - 5;
                    if (y < window.scrollY + 5) y = window.scrollY + 5;
                }
                return { x: x, y: y };
            } catch (error) {
                console.error('[AIレビュー] 位置計算エラー:', error);
                return null;
            }
        };

        // ボタンの位置を更新する関数
        window.updateButtonPosition = (selection) => {
            if (!reviewButton || !settingsButton) return;

            const position = calculateButtonPosition(selection);
            if (position) {
                applyButtonStyle(reviewButton, position, { backgroundColor: '#4285F4', color: 'white', borderRadius: '15px' });
                const reviewButtonWidth = reviewButton.offsetWidth;
                applyButtonStyle(settingsButton, position, { left: `${position.x + reviewButtonWidth + 5}px`, backgroundColor: '#f0f0f0', color: '#333', borderRadius: '50%', lineHeight: '1', minWidth: '28px', textAlign: 'center' });
            }
        };

        // 選択範囲の近くにボタンを表示する関数
        const showButtonsNearSelection = (selection) => {
            const currentSelectionText = selection.toString().trim();
            if (!selection || selection.rangeCount === 0 || currentSelectionText.length === 0) {
                window.currentSelectedText = '';
                return;
            }
            window.currentSelectedText = currentSelectionText;

            reviewButton = createButtonElement('AIレビューを実行', 'tampermonkey-ai-review-button', handleReviewButtonClick, { backgroundColor: '#4285F4', color: 'white', borderRadius: '15px' });
            settingsButton = createButtonElement('⚙️', 'tampermonkey-ai-settings-button', handleSettingsButtonClick, { backgroundColor: '#f0f0f0', color: '#333', borderRadius: '50%', lineHeight: '1', minWidth: '28px', textAlign: 'center' });

            const position = calculateButtonPosition(selection);
            if (!position) {
                reviewButton = null;
                settingsButton = null;
                window.currentSelectedText = '';
                return;
            }

            document.body.appendChild(reviewButton);
            applyButtonStyle(reviewButton, position, { backgroundColor: '#4285F4', color: 'white', borderRadius: '15px' });
            const reviewButtonWidth = reviewButton.offsetWidth;

            document.body.appendChild(settingsButton);
            applyButtonStyle(settingsButton, position, { left: `${position.x + reviewButtonWidth + 5}px`, backgroundColor: '#f0f0f0', color: '#333', borderRadius: '50%', lineHeight: '1', minWidth: '28px', textAlign: 'center' });

            buttonsVisible = true;
        };

        // 選択文字列用に表示されたボタンを削除する関数
        const removeExistingButtons = () => {
            if (reviewButton) {
                reviewButton.removeEventListener('click', handleReviewButtonClick);
                reviewButton.remove();
                reviewButton = null;
            }
            if (settingsButton) {
                settingsButton.removeEventListener('click', handleSettingsButtonClick);
                settingsButton.remove();
                settingsButton = null;
            }
            buttonsVisible = false;
        };

        // 選択範囲が変更された時の処理
        const handleSelectionChange = (event) => {
            const selection = window.getSelection();

            if (!selection || selection.toString().length === 0) {
                removeExistingButtons();
                lastSelection = null;
                return;
            }

            lastSelection = selection;

            if (shiftKeyPressed) {
                if (!buttonsVisible) {
                    showButtonsNearSelection(selection);
                } else {
                    window.updateButtonPosition(selection);
                }
            }
        };

        // Shiftキーが押された時のイベントハンドラ
        const handleKeyDown = (event) => {
            if (event.key === 'Shift' && !shiftKeyPressed) {
                shiftKeyPressed = true;
                console.log('[AIレビュー] Shiftキーが押されました。');

                if (lastSelection && lastSelection.toString().length > 0) {
                    removeExistingButtons();
                    showButtonsNearSelection(lastSelection);
                }
            }
        };

        // Shiftキーが離された時のイベントハンドラ
        const handleKeyUp = (event) => {
            if (event.key === 'Shift') {
                shiftKeyPressed = false;
                console.log('[AIレビュー] Shiftキーが離されました。');
            }
        };

        // イベントリスナーを登録
        document.addEventListener('selectionchange', handleSelectionChange);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
    };

    // モーダルの表示/非表示を切り替える関数
    window.toggleModal = function() {
        if (typeof window.closeModal === 'function') {
            if (isModalOpen) {
                window.closeModal();
            } else {
                window.openModal();
            }
        } else {
            console.error('[AIレビュー] 設定画面を閉じられませんでした。');
            window.openModal();
        }
    };

    // 初期化完了イベントをリッスン
    document.addEventListener('aiReviewInitialized', () => {
        console.log('[AIレビュー] controller_function.js: 初期化完了イベントを受信しました。');
        isInitialized = true;
        window.initializeEventHandlers();
    });

    console.log('[AIレビュー] controller_function.js: イベントハンドラを設定しました。');
})();
