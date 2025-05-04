(function() {
    'use strict';

    console.log('[AIレビュー] controller_function.js をロードしました。');

    // グローバル変数 (Tampermonkeyスクリプトと共有)
    let reviewButton = null;
    let settingsButton = null;

    // 初期化完了フラグ
    let isInitialized = false;

    // Shiftキーが押されたかどうかを追跡するフラグ
    let shiftKeyPressed = false;

    // 最後に選択されたテキストを保持する変数
    let lastSelection = null;

    // ConfluenceのページヘッダーにAIレビュー用のボタンと設定アイコンを追加する関数
    window.addConfluenceHeaderButton = function() {
        console.log('[AIレビュー] AIレビュー用ボタンを追加します。');
        const bannerList = document.querySelector('.banner');

        if (bannerList) {
            console.log('[AIレビュー] バナーが見つかりました。');
            const listItem = document.createElement('li');
            listItem.className = 'page-metadata-item';

            const button = document.createElement('button');
            button.textContent = 'AIレビューを実行';
            button.className = 'aui-button aui-button-primary';

            button.addEventListener('click', () => {
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
                if (typeof window.closeModal === 'function') {
                    if (isModalOpen) {
                        window.closeModal();
                    } else {
                        window.openModal();
                    }
                } else {
                    console.error('[AIレビュー] 設定画面を閉じられませんでした。');
                    window.openModal(); // エラーが発生した場合でも、一応モーダルを開く
                }
            });

            listItem.appendChild(button);
            listItem.appendChild(settingsIcon);
            bannerList.appendChild(listItem);
            console.log('[AIレビュー] AIレビュー用ボタンと設定アイコンを追加しました。');
        } else {
            console.error('[AIレビュー] バナーが見つかりません。');
        }
    };

    // イベントハンドラを初期化する関数
    window.initializeEventHandlers = function() {
        console.log('[AIレビュー] controller_function.js: イベントハンドラを初期化します。');

        /**
         * 選択文字列用に表示された「AIレビューを実行」ボタンがクリックされた時のハンドラ
         */
        window.handleReviewButtonClick_Selection = function() {
            console.log('[AIレビュー] 選択文字列用 AIレビュー実行ボタンがクリックされました。');
            window.triggerAIReviewButton(window.currentSelectedText,'text');
            document.dispatchEvent(event);
            window.removeExistingButtons(); // ボタンを削除
        };

        /**
         * 選択文字列用に表示された「⚙️」ボタンがクリックされた時のハンドラ
         */
        window.handleSettingsButtonClick_Selection = function() {
            console.log('[AIレビュー] 選択文字列用 設定ボタンがクリックされました。');
            // カスタムイベントを発行
            const event = new CustomEvent('openAiSettings', {
                detail: {
                    type: 'selection'
                }
            });
            document.dispatchEvent(event);
            window.removeExistingButtons(); // ボタンを削除
        };

        /**
         * 選択文字列用に表示されたボタンを削除する関数
         */
        window.removeExistingButtons = function() {
            if (reviewButton) {
                reviewButton.removeEventListener('click', window.handleReviewButtonClick_Selection); // リスナー解除
                reviewButton.remove();
                reviewButton = null;
                // console.log('[AIレビュー] 選択文字列用レビューボタン削除完了'); // デバッグ用
            }
            if (settingsButton) {
                settingsButton.removeEventListener('click', window.handleSettingsButtonClick_Selection); // リスナー解除
                settingsButton.remove();
                settingsButton = null;
                // console.log('[AIレビュー] 選択文字列用設定ボタン削除完了'); // デバッグ用
            }
            shiftKeyPressed = false; // Shiftキーの状態をリセット
        };

        /**
         * 選択範囲の近くにボタンを表示する関数
         */
        window.showButtonsNearSelection = function(selection) {
            // console.log('[AIレビュー] ボタン表示'); // 必要ならコメントアウト解除
            const currentSelectionText = selection.toString().trim();
            if (!selection || selection.rangeCount === 0 || currentSelectionText.length === 0) {
                window.currentSelectedText = '';
                return;
            }
            window.currentSelectedText = currentSelectionText;

            // Shiftキーが押されている場合のみボタンを表示
            if (shiftKeyPressed) {
                reviewButton = window.createReviewButtonElement();
                settingsButton = window.createSettingsButtonElement();

                const position = window.calculateButtonPosition(selection);
                if (!position) {
                    reviewButton = null;
                    settingsButton = null;
                    window.currentSelectedText = '';
                    return;
                }

                document.body.appendChild(reviewButton);
                window.applyReviewButtonStyle(reviewButton, position);
                const reviewButtonWidth = reviewButton.offsetWidth;

                document.body.appendChild(settingsButton);
                window.applySettingsButtonStyle(settingsButton, position, reviewButtonWidth);
            }
        };

        /**
         * 選択文字列用「AIレビューを実行」ボタン要素を作成
         */
        window.createReviewButtonElement = function() {
            const button = document.createElement('button');
            button.textContent = 'AIレビューを実行';
            button.setAttribute('id', 'tampermonkey-ai-review-button');
            button.addEventListener('click', window.handleReviewButtonClick_Selection);
            return button;
        };

        /**
         * 選択文字列用「⚙️」ボタン要素を作成
         */
        window.createSettingsButtonElement = function() {
            const button = document.createElement('button');
            button.textContent = '⚙️';
            button.setAttribute('id', 'tampermonkey-ai-settings-button');
            button.setAttribute('title', 'AIレビュー設定');
            button.addEventListener('click', window.handleSettingsButtonClick_Selection);
            return button;
        };

        /**
         * ボタンの表示位置を計算する関数
         */
        window.calculateButtonPosition = function(selection) {
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
                // console.log(`[AIレビュー] ボタン位置: x=${x}, y=${y}`); // 必要ならコメントアウト解除
                return { x: x, y: y };
            } catch (error) {
                console.error('[AIレビュー] 位置計算エラー:', error);
                return null;
            }
        }

        /**
         * 選択文字列用レビューボタンのスタイルを適用
         */
        window.applyReviewButtonStyle = function(button, position) {
            button.style.position = 'absolute';
            button.style.left = `${position.x}px`;
            button.style.top = `${position.y}px`;
            button.style.zIndex = '2147483645';
            button.style.padding = '6px 12px';
            button.style.border = 'none';
            button.style.backgroundColor = '#4285F4';
            button.style.color = 'white';
            button.style.fontSize = '13px';
            button.style.cursor = 'pointer';
            button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            button.style.borderRadius = '15px'; /* 丸みを帯びた角 */
            button.style.lineHeight = '1.4';
            button.style.whiteSpace = 'nowrap'; /* ボタンテキストが折り返さないように */
        };

        /**
         * 選択文字列用設定ボタンのスタイルを適用
         */
        window.applySettingsButtonStyle = function(button, position, reviewButtonWidth) {
            button.style.position = 'absolute';
            button.style.left = `${position.x + reviewButtonWidth + 5}px`;
            button.style.top = `${position.y}px`;
            button.style.zIndex = '2147483646';
            button.style.padding = '6px 8px';
            button.style.border = 'none';
            button.style.backgroundColor = '#f0f0f0'; /* 薄いグレー */
            button.style.color = '#333';
            button.style.fontSize = '13px';
            button.style.cursor = 'pointer';
            button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            button.style.borderRadius = '50%'; /* 円形にする */
            button.style.lineHeight = '1'; /* アイコンが中央に来るように */
            button.style.minWidth = '28px'; /* 最小幅を確保して円形を維持 */
            button.style.textAlign = 'center'; /* アイコンを中央揃え */
        };
    };

    /**
     * マウスが離された時のイベントハンドラ
     */
    window.handleMouseUp = function(event) {
        // 0.1秒後に選択範囲を確認し、ボタンを表示または削除する
        setTimeout(() => {
            const selection = window.getSelection();

            // 選択範囲が存在しない場合は、ボタンを削除
            if (!selection || selection.toString().length === 0) {
                window.removeExistingButtons();
                lastSelection = null; // 選択をクリア
                return;
            }

            // 選択範囲を保存
            lastSelection = selection;

            // Shiftキーが押されている場合のみボタンを表示
            if (shiftKeyPressed) {
                window.showButtonsNearSelection(selection);
            }
        }, 100);
    };

    /**
     * ドキュメントがクリックされた時のイベントハンドラ
     */
    window.handleDocumentClick = function(event) {
        // タイマーを使って、クリックイベントが先に処理されるようにする
        setTimeout(() => {
            const selection = window.getSelection();
            if (!selection || selection.toString().length === 0) {
                // ボタンが存在するか確認してから削除
                if (reviewButton || settingsButton) {
                    window.removeExistingButtons();
                }
                lastSelection = null; // 選択をクリア
            }
        }, 50); // 50ms遅延
    };

    /**
     * Shiftキーが押された時のイベントハンドラ
     */
    window.handleKeyDown = function(event) {
        if (event.key === 'Shift') {
            shiftKeyPressed = true;
            console.log('[AIレビュー] Shiftキーが押されました。');

            // 最後に選択されたテキストがあるか確認し、ボタンを表示
            if (lastSelection && lastSelection.toString().length > 0) {
                window.removeExistingButtons();
                window.showButtonsNearSelection(lastSelection);
            }
        }
    };

    /**
     * Shiftキーが離された時のイベントハンドラ
     */
    window.handleKeyUp = function(event) {
        if (event.key === 'Shift') {
            shiftKeyPressed = false;
            console.log('[AIレビュー] Shiftキーが離されました。');
        }
    };

    // ページがアクティブになったときの処理
    function handleVisibilityChange() {
        if (!document.hidden) {
            // タブがアクティブになったときにShiftキーの状態をチェック
            shiftKeyPressed = event.shiftKey;

            // 最後に選択されたテキストがあるか確認し、ボタンを表示
            if (lastSelection && lastSelection.toString().length > 0 && shiftKeyPressed) {
                window.removeExistingButtons();
                window.showButtonsNearSelection(lastSelection);
            }
        }
    }

    // 初期化完了イベントをリッスン
    document.addEventListener('aiReviewInitialized', () => {
        console.log('[AIレビュー] controller_function.js: 初期化完了イベントを受信しました。');
        isInitialized = true;

        // イベントリスナーを登録
        window.initializeEventHandlers();
        document.addEventListener('mouseup', window.handleMouseUp);
        document.addEventListener('click', window.handleDocumentClick); // ドキュメント全体のクリックを監視
        document.addEventListener('keydown', window.handleKeyDown); // Shiftキー押下を監視
        document.addEventListener('keyup', window.handleKeyUp); // Shiftキー解放を監視
        document.addEventListener('visibilitychange', handleVisibilityChange); // タブの切り替えを監視
    });

    console.log('[AIレビュー] controller_function.js: イベントハンドラを設定しました。');

})();
