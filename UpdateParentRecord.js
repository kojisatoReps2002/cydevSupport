/**
 * Created by koji_sato on 2016/07/14.
 */

(function() {
  "use strict";
  var events = [
    'app.record.create.submit',
    'app.record.detail.delete.submit',
    'app.record.index.delete.submit'
  ];

  kintone.events.on(events, function(event) {
    // 見積明細のルックアップ指定先見積アプリのアプリIDを取得する
    var related = kintone.app.getLookupTargetAppId('見積番号_lookup');
    // 見積明細のルックアップに設定された情報から見積レコードIDを取得する
    var estimateId = event.record['見積書レコード番号'].value;
    // 取得されたID's からquery文字列を組み立てる
    var requestParam = { "app": related, "id" : estimateId };
    // この見積明細の小計金額を保持する
    var subTotal = parseInt(event.record['小計'].value, 10) || 0;

    // 見積明細レコードの取得要求kintone api
    kintone.api(kintone.api.url('/k/v1/record', true), 'GET', requestParam,
      function(resp) {
        // 成功した時は、見積アプリ見積金額更新情報を組み立てる
        var amount = parseInt(resp.record['見積金額'].value, 10) || 0;
        // 追加時は加算、削除時は減算
        amount = (event.type == 'app.record.create.submit') ? 
          amount + subTotal : amount - subTotal;
        var revision = resp.record['$revision'].value;

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
