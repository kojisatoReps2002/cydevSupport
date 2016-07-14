/**
 * Created by koji_sato on 2016/07/13.
 * Live 45 の画面上の編集が効かないのと、そもそも計算を個々でやるのは不適切なので
 * Child Application 側(見積明細)で更新処理を走らせるようにする。
 * 従って、このjsは使用しない。
 */

(function() {
  "use strict";
  //レコードの追加、編集、詳細画面で適用する
  kintone.events.on(['app.record.detail.show', 'app.record.edit.show'], function(event) {
    var record = event.record;
    var estimate_no = record['見積番号']['value'];
    var related = kintone.app.getRelatedRecordsTargetAppId('見積明細関連');

    function fetchRecords(appId, opt_offset, opt_limit, opt_records) {
      var offset = opt_offset || 0;
      var limit = opt_limit || 100;
      var allRecords = opt_records || [];

      var s_query = '見積番号_lookup="' + estimate_no + '"  limit ';

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
      for (var i = 0; i < records.length; i++) {
        amount = amount + parseFloat(records[i].小計.value);
      }
      var divTotalAmount = document.createElement('div');
      divTotalAmount.style.fontWeight = 'bold';
      divTotalAmount.style.textAlign = 'right';
      divTotalAmount.style.fontSize = 12;
      var wString = String(amount.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,'));
      divTotalAmount.innerHTML = "\\" + wString;
      kintone.app.record.getSpaceElement("EstimateAmount").appendChild(divTotalAmount);
      record['見積金額']['value'] = wString;

    });

    return event;

  });
})();
