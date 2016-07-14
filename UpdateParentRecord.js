/**
 * Created by koji_sato on 2016/07/14.
 */

(function() {
  "use strict";
  // Register the events.
  var events = ['app.record.create.submit']

  kintone.events.on(events, function(event) {
    var app_code = "EstimateAppCode001";        // 見積書アプリコード
    kintone.api('/k/v1/apps', 'GET', {"codes": [ app_code ] }, function (resp) {
      var app_id = resp.apps[0].appId;
      var record = event.record;
      var rec_id = record['見積書レコード番号']['value'];
      var amount = parseInt(record['小計']['value']) + resp.apps[0].見積金額;
 
      // 見積書-見積金額更新リクエスト
      kintone.api('/k/v1/record', 'PUT', {
        "app": app_id, "id": rec_id, "revision": -1, "record":{
        "見積金額" : { "value": amount } }
      }, function(resp) {
      }, function(resp) {
        var errmsg = 'An error occurred while updating records.';
        if (resp.message !== undefined) {
          errmsg += '\n' + resp.message;
          alert(errmsg);
        }
      });
    }, function (resp) {
      var errmsg = 'An error occurred while getting records.';
      if (resp.message !== undefined) {
        errmsg += '\n' + resp.message;
        alert(errmsg);
      }
    });
  });
})();
