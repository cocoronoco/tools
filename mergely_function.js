(function() {
    // --- Mergely関連の関数 ---
    window.addMergelyModal = function() {
        $('#mergelyModal').remove();

        const modalHtml = `
            <div id="mergelyModal" title="AIレビューの結果確認">
                <div class="mergely-editor">
                    <header>
                        <div class="mergely-labels">
                            <span>選択した文字列</span>
                            <span>AIレビュー結果</span>
                        </div>
                    </header>
                    <div class="compare-container">
                        <div id="mergely"></div>
                        <div id="loadingAnimation" class="loading-container" style="display:none;">
                            <svg class="loading-svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>
                        </div>
                    </div>
                </div>
            </div>
        `;
        $('body').append(modalHtml);

        $("#mergelyModal").dialog({
            autoOpen: false,
            modal: true,
            width: '90%',
            height: $(window).height() * 0.9,
            resizable: false,
            closeText: "",
            open: function(event, ui) {
                console.log("[AIレビュー] Mergelyモーダルを開きました");
                $(this).parent().find('.custom-close-button').remove();
                const titlebar = $(this).parent().find('.ui-dialog-titlebar');
                const closeButton = $('<span class="custom-close-button">✖️</span>');
                closeButton.on('click', function() {
                    $('#mergelyModal').dialog('close');
                });
                titlebar.prepend(closeButton);

                if (!isMergelyInitialized) {
                    console.log("[AIレビュー] Mergely初回初期化");
                    window.initMergely();
                    isMergelyInitialized = true;
                } else {
                    if (mergelyInstance) {
                        mergelyInstance.resize();
                    }
                }
                window.setMergelyModalHeight();
                originalOverflow = document.body.style.overflow;
                document.body.style.overflow = 'hidden';
                $(this).closest(".ui-dialog").find(".ui-dialog-title").css("font-size", "20px");
            },
            close: function(event, ui) {
                console.log("[AIレビュー] Mergelyモーダルを閉じました");
                document.body.style.overflow = originalOverflow;
                window.stopLoading();
            }
        });
    }

    window.initMergely = function() {
        console.log("[AIレビュー] Mergely初期化中...");
        if (!document.getElementById('mergely')) {
            console.error("[AIレビュー] Mergely要素が見つかりません");
            return;
        }
        try {
            $('#mergely').empty();
            mergelyInstance = new Mergely('#mergely', {
                wrap_lines: true,
                autoupdate: true,
                lhs: function(setValue) { setValue(''); },
                rhs: function(setValue) { setValue(''); }
            });
            console.log("[AIレビュー] Mergely初期化成功");
            setTimeout(() => {
                if (mergelyInstance) {
                    mergelyInstance.resize();
                    // console.log("[AIレビュー] Mergelyリサイズ完了"); // 必要ならコメントアウト解除
                }
            }, 100);
        } catch (error) {
            console.error("[AIレビュー] Mergely初期化エラー:", error);
            isMergelyInitialized = false;
        }
    }

    window.setMergelyModalHeight = function() {
        const windowHeight = $(window).height();
        $('#mergelyModal').dialog("option", "height", windowHeight * 0.9);
        if (mergelyInstance && isMergelyInitialized) {
            try {
                mergelyInstance.resize();
            } catch (e) {
                console.warn("[AIレビュー] Mergelyリサイズ失敗:", e);
            }
        }
    }

    window.startLoading = function() {
        isLoading = true;
        $('#loadingAnimation').show();
        console.log("[AIレビュー] ローディング開始");
    }

    window.stopLoading = function() {
        isLoading = false;
        $('#loadingAnimation').hide();
        console.log("[AIレビュー] ローディング停止");
    }

    window.openMergelyModalAndCompare = function(originalContent, aiResponse) {
        console.log("[AIレビュー] Mergely表示 & 差分比較開始");
        $('#mergelyModal').dialog("open");

        window.startLoading();

        if (mergelyInstance) {
            mergelyInstance.lhs(originalContent);
            mergelyInstance.rhs(aiResponse || "AIレビュー結果がありません。");
        } else {
            console.warn("[AIレビュー] Mergely未初期化");
        }
        window.stopLoading();
    }

})();
