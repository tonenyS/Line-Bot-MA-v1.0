const { render } = require('../functions/utils');
const {
  replyMessage,
  sendLineNotify,
  getUserProfile,
  MESSAGE_TYPE,
} = require('../functions/LineBot');

const Route = {};
Route.path = function (routeName, callback) {
  Route[routeName] = callback;
};

function loadUi() {
  return render('index', {
    title: 'FirstMile Maintenance Service Agreement',
  });
}
// // Route path
// Route.path('followtask', () => {
//   return render('index');
// });

const doGet = (e) => {
  Route.path('followtask', loadUi);
  if (Route[e.parameters.v]) {
    return Route[e.parameters.v]();
  }
  return render('404');
};

// const doPost = (e) => {
//   try {
//     // TO DO SOMETHINGS...
//   } catch (error) {
//     Logger.log(`saveNewData(): error ${error}`);
//   }
//   return ContentService.createTextOutput(JSON.stringify(e.postData.contents)).setMimeType(
//     ContentService.MimeType.JAVASCRIPT
//   );
// };

const doPost = (e) => {
  const fmCommandRegex = new RegExp(
    /^(\bFM[\s]*?building\b)[\s]*([ก-๏a-zA-Z 0-9$&+,:;=?@#|_'<>.^*()%!-/\\/]+)/i
  );
  Logger.log('[doPost()] : starting function.');
  const data = JSON.parse(e.postData.contents);
  Logger.log(`[doPost()] after starting function: ${JSON.stringify(data)}`);
  const lineTextdatas = data.events[0].message.text;
  Logger.log(`[doPost()] extract body data: ${lineTextdatas}`);
  const messages = data.events[0].message.text;
  Logger.log(`[doPost()] messages: ${messages}`);
  if (fmCommandRegex.test(messages.trim())) {
    Logger.log(`[doPost()] fmCommandRegex.text : ${fmCommandRegex.test(messages.trim())}`);
    Logger.log(`[doPost()] fmCommandRegex ${messages.trim().match(fmCommandRegex)}`);
    switch (messages.trim().match(fmCommandRegex)[2].toLowerCase()) {
      case 'distong':
        Logger.log(`[doPost()] List:`);
        replyMessage(
          data.events[0].replyToken,
          'https://script.google.com/macros/s/AKfycbylO6CfHTZMLVKkHQOIDcBEkWEEvxK0azLu2iw-pOAp71xDMYE/exec?v=followtask',
          MESSAGE_TYPE.NORMAL
        );
        break;
      default:
        Logger.log('[doPost()] : switch case [default] it working.');
        break;
    }
  }
};

const saveDataToSpreadsheet = (obj) => {
  try {
    const data = JSON.parse(obj);
    Logger.log(`saveDataToSpreadsheet(): ${JSON.stringify(data)}`);
    Logger.log(`saveDataToSpreadsheet() name: ${data.Full_Name}`);

    const Agent = Tamotsu.Table.define({
      sheetName: data.sheetname,
      rowShift: 1,
      columnShift: 0,
    });

    const lastRow = Agent.last();
    Logger.log(`saveDataToSpreadsheet() lastRow: ${JSON.stringify(lastRow)}`);
    Logger.log(`saveDataToSpreadsheet() lastRow number: ${JSON.stringify(lastRow.row_)}`);

    Agent.create({
      '#': lastRow['#'] + 1,
      'Full Name': data.Full_Name,
      Address: data.Address,
      Building: data.Building,
      NumberCircoit: data.NumberCircoit,
      Confirmationdate: data.Confirmation_date,
      Confirmationtime: data.Confirmation_time,
      'ยืนยันส่ง LINE': '',
      หมายเหตุ: '',
    });

    // Create new checkbox with initail value (false).
    SpreadsheetApp.getActive()
      .getSheetByName(data.sheetname)
      .getRange(`H${lastRow.row_}:H${lastRow.row_}`)
      .setDataValidation(
        SpreadsheetApp.newDataValidation().setAllowInvalid(false).requireCheckbox().build()
      );

    // Create new dropdown list with values in list ['Opened', 'In Progress', 'Close'] and set initail value (Opened)
    SpreadsheetApp.getActive()
      .getSheetByName(data.sheetname)
      .getRange(`I${lastRow.row_}:I${lastRow.row_}`)
      .setDataValidation(
        SpreadsheetApp.newDataValidation()
          .requireValueInList(['Opened', 'In Progress', 'Close'])
          .build()
      );
    SpreadsheetApp.getActive()
      .getSheetByName(data.sheetname)
      .getRange(`I${lastRow.row_}:I${lastRow.row_}`)
      .setValue('Opened');
  } catch (error) {
    Logger.log(`saveDataToSpreadsheet(): error ${error}`);
  }
};

module.exports = {
  doGet,
  doPost,
  saveDataToSpreadsheet,
};
