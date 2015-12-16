/**
 * Created by koji_sato on 2015/12/16.
 */

(function() {
    "use strict";
    //レコードの追加、編集、詳細画面で適用する
    kintone.events.on(['app.record.detail.show', 'app.record.edit.show'], function(event) {
        var client_rid = event.recordId;
        var related = kintone.app.getRelatedRecordsTargetAppId('受注レコード一覧');
 
        function fetchRecords(appId, opt_offset, opt_limit, opt_records) {
            var offset = opt_offset || 0;
            var limit = opt_limit || 100;
            var allRecords = opt_records || [];

            var s_query = '顧客情報レコード番号="' + client_rid + '" and ドロップダウン in ("受注") limit ';

            var params = {app: related, query: s_query + limit + ' offset ' + offset};
            return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
                allRecords = allRecords.concat(resp.records);
                if (resp.records.length === limit) {
                   return fetchRecords(related, offset + limit, limit, allRecords);
                }
                   return allRecords;
            });
        }
 
        fetchRecords(kintone.app.getId()).then(function(records) {
            var amount = 0;
            var data_count = 0;
            for (var i = 0; i < records.length; i++) {
               amount = amount + parseFloat(records[i].数値.value);
               data_count++;
            }
            var divTotalAmount = document.createElement('div');
            divTotalAmount.style.fontWeight = 'bold';
            divTotalAmount.style.textAlign = 'right';
            divTotalAmount.style.fontSize = 12;
            var wString = String(amount.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,'));
            divTotalAmount.innerHTML = "\\" + wString + "- (" + data_count + "件)";
            kintone.app.record.getSpaceElement("OrdersAmount").appendChild(divTotalAmount);
        });

        return event;

    });
})();
