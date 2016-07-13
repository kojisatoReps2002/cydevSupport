/**
 * Created by koji_sato on 2016/07/13.
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
      record['見積金額']['value'] = amount;
    });

    return event;

  });
})();
