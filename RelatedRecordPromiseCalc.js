/**
 * Created by koji_sato on 14/09/04.
 */

(function() {
    "use strict";

    //レコードの追加、編集、詳細画面で適用する
    kintone.events.on(['app.record.detail.show', 'app.record.edit.show'], function(event) {
        var record = event.record;
        var client_rid = event.recordId;
        var related = kintone.app.getRelatedRecordsTargetAppId('受注レコード一覧');
        var offset = 0;
        var loop_end_flg = false;
        var records = new Array();

        function fetchRecords(appId, opt_offset, opt_limit, opt_records) {
            var offset = opt_offset || 0;
            var limit = opt_limit || 100;
            var allRecords = opt_records || [];
            var params = {app: appId, query: 'order by レコード番号 asc limit ' + limit + ' offset ' + offset};
            return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
                allRecords = allRecords.concat(resp.records);
                if (resp.records.length === limit) {
                   return fetchRecords(appId, offset + limit, limit, allRecords);
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
       });


        while(!loop_end_flg){
            var query = '顧客情報レコード番号="' + client_rid +
                '" and ドロップダウン = "受注" limit 100 offset ' + offset;
            query = encodeURIComponent(query);
            var appUrl = kintone.api.url('/k/v1/records') + '?app='+ related + '&query=' + query;

            // 同期リクエストを行う
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open("GET", appUrl, false);
            xmlHttp.setRequestHeader('X-Requested-With','XMLHttpRequest');
            xmlHttp.send(null);

            //取得したレコードをArrayに格納
            var resp_data = JSON.parse(xmlHttp.responseText);

            if(resp_data.records.length > 0){
                for(var i = 0; resp_data.records.length > i; i++){
                    records.push(resp_data.records[i]);
                }
                offset += resp_data.records.length;
            }else{
                loop_end_flg = true;
            }
        }

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
        kintone.app.record.getSpaceElement("TotalAmount").appendChild(divTotalAmount);

        return event;

    });
})();
