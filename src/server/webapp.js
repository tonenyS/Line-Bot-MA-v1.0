const { render } = require('../functions/utils');

const Route = {};
Route.path = function (routeName, callback) {
  Route[routeName] = callback;
};

// Route path
Route.path('followtask', () => {
  return render('index');
});

const doGet = (e) => {
  if (Route[e.parameters.v]) {
    return Route[e.parameters.v]();
  }
  return render('404');
};

const doPost = (e) => {
  try {
    // TO DO SOMETHINGS...
  } catch (error) {
    Logger.log(`saveNewData(): error ${error}`);
  }
  return ContentService.createTextOutput(JSON.stringify(e.postData.contents)).setMimeType(
    ContentService.MimeType.JAVASCRIPT
  );
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
