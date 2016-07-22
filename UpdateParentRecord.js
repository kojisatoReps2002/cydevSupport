/**
 * Created by koji_sato on 2016/07/14.
 */

(function() {
  "use strict";
  //登録ボタン押下時に発火
  kintone.events.on(['app.record.create.submit'], function(event) {
    var related = kintone.app.getLookupTargetAppId('見積番号_lookup');
    var estimateId = parseInt(event.record['見積書レコード番号'].value, 10);
    var requestParam = { "app": related, "id" : estimateId };
    var subTotal = parseInt(event.record['小計'].value, 10) || 0;

    kintone.api(kintone.api.url('/k/v1/record', true), 'GET', requestParam,
      function(resp) {
        var amount = parseInt(resp.record['見積金額'].value, 10) + subTotal;
        var revision = parseInt(resp.record['$revision'].value, 10);

        kintone.api('/k/v1/record', 'PUT', {

          "app": related, 
          "id": estimateId, 
          "revision": revision, 
          "record":{"見積金額" : { "value": amount }}

        }, function(resp) {
        }, function(resp) {
          var errmsg = 'An error occurred while updating records.';
          if (resp.message !== undefined) {
            errmsg += '\n' + resp.message;
            alert(errmsg);
          }
        }); 
      }, function(error) {
        console.log(error);
      }
    );
  });
})();