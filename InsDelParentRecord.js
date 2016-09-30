/**
 * Created by koji_sato on 2016/07/14.
 */

(function() {
    "use strict";

    var c_sbmt = 'app.record.create.submit';
    var d_del_sbmt = 'app.record.detail.delete.submit';
    var i_del_sbmt = 'app.record.index.delete.submit';
    var edt_sbmt = 'app.record.edit.submit';
    var i_edt_sbmt = 'app.record.index.edit.submit';

    var events = [c_sbmt, d_del_sbmt, i_del_sbmt, edt_sbmt, i_edt_sbmt];

    kintone.events.on(events, function(event) {

        // 見積明細のルックアップ指定先見積アプリのアプリIDを取得する
        var related = kintone.app.getLookupTargetAppId('見積番号_lookup');
        // 見積明細のルックアップに設定された情報から見積レコードIDを取得する
        var estimateId = event.record['見積書レコード番号'].value;
        // 取得したID's からquery文字列を組み立てる
        var requestParam = { "app": related, "id": estimateId };
        // この見積明細の小計金額を保持する(一覧編集時計算フィールド対応)
        var unitPrice = parseInt(event.record['単価'].value, 10) || 0;
        var numberOfPieces = parseInt(event.record['個数'].value, 10) || 0;
        var subTotal = unitPrice * numberOfPieces;
        // この見積明細の修正前小計金額を保持する
        var subTotalPrev = parseInt(event.record['修正前小計'].value, 10) || 0;

        // 見積明細レコードの取得要求kintone api
        kintone.api(kintone.api.url('/k/v1/record', true), 'GET', requestParam, function(resp) {
            // 成功した時は、見積アプリ見積金額更新情報を計算する
            var amount = parseInt(resp.record['見積金額'].value, 10) || 0;
            // 失われた更新を避けるためにrevsionを取得
            var revision = resp.record['$revision'].value;

            // 追加時は加算、削除時は減算、更新時は差分計算
            switch (event.type) {
                case c_sbmt:
                    amount = amount + subTotal;
                    break;
                case edt_sbmt:
                case i_edt_sbmt:
                    // 変更操作で小計金額の変更がない場合は見積修正不要なので終了
                    if (subTotal === subTotalPrev) {
                        return;
                    }
                    amount = amount + subTotal - subTotalPrev;
                    break;
                case d_del_sbmt:
                case i_del_sbmt:
                    amount = amount - subTotal;
                    break;
            }

            kintone.api('/k/v1/record', 'PUT', {

                "app": related,
                "id": estimateId,
                "revision": revision,
                "record": { "見積金額": { "value": amount } }

            }, function(res) {}, function(res) {
                var errmsg = 'An error occurred while updating records.';
                if (res.message !== undefined) {
                    errmsg += '\n' + res.message;
                    alert(errmsg);
                }
            });
        }, function(error) {
            alert(error);
        });
        event.record['修正前小計'].value = subTotal;
        return event;
    });
})();
