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
            const event = new CustomEvent('aiReviewRequest', {
                detail: {
                    type: 'selection'
                }
            });
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
            // console.log('[AIレビュー] 選択文字列用ボタン表示処理開始'); // デバッグ用
            if (!selection || selection.rangeCount === 0) {
                // console.log('[AIレビュー] 有効な選択範囲なし、ボタン表示中断'); // デバッグ用
                return;
            }

            // 既存ボタンがあれば削除（念のため）
            window.removeExistingButtons();

            reviewButton = window.createReviewButtonElement();
            settingsButton = window.createSettingsButtonElement();

            const position = window.calculateButtonPosition(selection);
            if (!position) {
                console.warn('[AIレビュー] ボタン位置の計算に失敗しました。');
                reviewButton = null; // ボタン参照をクリア
                settingsButton = null;
                return;
            }
            // console.log(`[AIレビュー] 計算されたボタン位置: x=${position.x}, y=${position.y}`); // デバッグ用

            document.body.appendChild(reviewButton);
            window.applyReviewButtonStyle(reviewButton, position);
            const reviewButtonWidth = reviewButton.offsetWidth || 120; // 幅が取れなかった場合のデフォルト値

            document.body.appendChild(settingsButton);
            window.applySettingsButtonStyle(settingsButton, position, reviewButtonWidth);

            // console.log('[AIレビュー] 選択文字列用ボタン表示完了'); // デバッグ用
        };

        /**
         * 選択文字列用「AIレビューを実行」ボタン要素を作成
         */
        window.createReviewButtonElement = function() {
            const button = document.createElement('button');
            button.textContent = 'AIレビューを実行';
            button.setAttribute('id', 'tampermonkey-ai-review-button');
            button.addEventListener('click', window.handleReviewButtonClick_Selection); // 専用のハンドラを登録
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
            button.addEventListener('click', window.handleSettingsButtonClick_Selection); // 専用のハンドラを登録
            return button;
        };

        /**
         * ボタンの表示位置を計算する関数
         */
        window.calculateButtonPosition = function(selection) {
            try {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                // rect が完全に空（幅も高さも0）で、かつ選択文字列もない場合は無効とみなす
                if (!rect || (rect.width === 0 && rect.height === 0 && selection.toString().length === 0)) {
                    console.warn('[AIレビュー] 選択範囲の矩形情報が無効です。');
                    return null;
                }

                // 基本は選択範囲の右下に配置
                let x = rect.right + window.scrollX + 5;
                let y = rect.bottom + window.scrollY + 5;

                // 画面右端からはみ出ないように調整
                const viewportWidth = window.innerWidth;
                // ボタン幅を大きめに見積もる（レビューボタン + 設定ボタン + マージン）
                const estimatedTotalButtonWidth = 180;
                if (x + estimatedTotalButtonWidth > viewportWidth + window.scrollX) {
                    // 右端を超えそうなら、選択範囲の左側に回り込むか、画面右端に寄せる
                    // ここでは単純に画面右端に寄せる（必要なら左側配置ロジックを追加）
                    x = viewportWidth + window.scrollX - estimatedTotalButtonWidth - 10; // 少し余裕を持たせる
                    if (x < window.scrollX + 5) x = window.scrollX + 5; // 左端を切らないように
                }

                // 画面下端からはみ出ないように調整
                const viewportHeight = window.innerHeight;
                const estimatedButtonHeight = 30;
                if (y + estimatedButtonHeight > viewportHeight + window.scrollY) {
                    // 下端を超えそうなら、選択範囲の上側に配置
                    y = rect.top + window.scrollY - estimatedButtonHeight - 5;
                if (y < window.scrollY + 5) y = window.scrollY + 5; // 上端を切らないように
            }
            return { x: x, y: y };
        } catch (error) {
            console.error('[AIレビュー] ボタン位置の計算中にエラーが発生しました:', error);
            return null;
        }
    };

        /**
         * 選択文字列用レビューボタンのスタイルを適用
         */
        window.applyReviewButtonStyle = function(button, position) {
            // スタイルは GM_addStyle で定義されたものを主に使う
            button.style.position = 'absolute';
            button.style.left = `${position.x}px`;
            button.style.top = `${position.y}px`;
            // 必要に応じて追加スタイルをここに記述
        };

        /**
         * 選択文字列用設定ボタンのスタイルを適用
         */
        window.applySettingsButtonStyle = function(button, position, reviewButtonWidth) {
            // スタイルは GM_addStyle で定義されたものを主に使う
            button.style.position = 'absolute';
            // レビューボタンの右隣に配置
            button.style.left = `${position.x + reviewButtonWidth + 5}px`;
            button.style.top = `${position.y}px`;
            // 必要に応じて追加スタイルをここに記述
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

    // イベントリスナーを登録 (初期化後)
    document.addEventListener('mouseup', window.handleMouseUp);
    document.addEventListener('mousedown', window.handleMouseDown);

    console.log('[AIレビュー] selection_event_handlers.js: イベントハンドラを設定しました。');

})();
