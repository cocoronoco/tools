// selection_event_handlers.js

(function() {
    'use strict';

    console.log('[AIレビュー] selection_event_handlers.js をロードしました。');

    // グローバル変数 (Tampermonkeyスクリプトと共有)
    let reviewButton = null;
    let settingsButton = null;
    let isButtonMouseDown = false;

    // 初期化完了フラグ
    let isInitialized = false;

    // 初期化完了イベントをリッスン
    document.addEventListener('aiReviewInitialized', () => {
        console.log('[AIレビュー] selection_event_handlers.js: 初期化完了イベントを受信しました。');
        isInitialized = true;
        window.initializeEventHandlers();
    });

    window.initializeEventHandlers = function() {
        console.log('[AIレビュー] selection_event_handlers.js: イベントハンドラを初期化します。');

        /**
         * 選択文字列用に表示された「AIレビュー実行」ボタンがクリックされた時のハンドラ
         */
        window.handleReviewButtonClick_Selection = function() {
            console.log('[AIレビュー] 選択文字列用 AIレビュー実行ボタンがクリックされました。');
            // カスタムイベントを発行
            const event = new Event('aiReviewRequestSelection');
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
            button.style.borderRadius = '15px';
            button.style.lineHeight = '1.4';
            button.style.whiteSpace = 'nowrap';
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
            button.style.backgroundColor = '#f0f0f0';
            button.style.color = '#333';
            button.style.fontSize = '13px';
            button.style.cursor = 'pointer';
            button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            button.style.borderRadius = '50%';
            button.style.lineHeight = '1';
            button.style.minWidth = '28px';
            button.style.textAlign = 'center';
        };
    };

    /**
     * マウスが押された時のイベントハンドラ
     */
    window.handleMouseDown = function(event) {
        isButtonMouseDown = (event.target === reviewButton || event.target === settingsButton);
    };

    /**
     * マウスが離された時のイベントハンドラ
     */
    window.handleMouseUp = function(event) {
        if (isButtonMouseDown) {
            isButtonMouseDown = false;
            return;
        }

        const selection = window.getSelection();
        if (!selection) {
            return;
        }

        // console.log('[AIレビュー] マウスアップイベント発生、選択範囲:', selection.toString()); // デバッグ用
        if (selection.toString().length > 0) {
            window.showButtonsNearSelection(selection);
        } else {
            window.removeExistingButtons();
        }
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
            }
        }, 50); // 50ms遅延
    };

    /**
     * 選択範囲が変更された時のイベントハンドラ
     */
    window.handleSelectionChange = function() {
        const selection = window.getSelection();
        if (!selection) {
            return;
        }

        if (selection.toString().length > 0) {
            window.showButtonsNearSelection(selection);
        } else {
            window.removeExistingButtons();
        }
    };

    // イベントリスナーを登録 (初期化後)
    document.addEventListener('mouseup', window.handleMouseUp);
    document.addEventListener('mousedown', window.handleMouseDown);
    document.addEventListener('click', window.handleDocumentClick); // ドキュメント全体のクリックを監視
    document.addEventListener('selectionchange', window.handleSelectionChange); // 選択範囲の変更を監視

    console.log('[AIレビュー] selection_event_handlers.js: イベントハンドラを設定しました。');

})();
