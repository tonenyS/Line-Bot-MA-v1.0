const { render } = require('../functions/utils');

const Route = {};
Route.path = function(routeName, callback) {
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
        const Agent = Tamotsu.Table.define({
            sheetName: 'AIS',
            rowShift: 1,
            columnShift: 0,
        });

        const data = JSON.parse(e.postData.contents);
        Logger.log(`saveNewData(): ${JSON.stringify(data)}`);
        Logger.log(`saveNewData() name: ${data.Full_Name}`);

        const lastRow = Agent.last();
        Logger.log(`saveNewData() lastRow: ${JSON.stringify(lastRow)}`);
        Logger.log(`saveNewData() lastRow number: ${JSON.stringify(lastRow.row_)}`);

        Agent.create({
            '#': lastRow['#'] + 1,
            'Full Name': data.Full_Name,
            Address: data.Address,
            'Confirmation date': data.Confirmation_date,
            'Confirmation time': data.Confirmation_time,
            'ยืนยัน ส่งLINE': '',
            หมายเหตุ: '',
        });

        // Create new checkbox with initail value (false).
        SpreadsheetApp.getActive()
            .getSheetByName('AIS')
            .getRange(`F${lastRow.row_}:F${lastRow.row_}`)
            .setDataValidation(
                SpreadsheetApp.newDataValidation().setAllowInvalid(false).requireCheckbox().build()
            );

        // Create new dropdown list with values in list ['Opened', 'In Progress', 'Close'] and set initail value (Opened)
        SpreadsheetApp.getActive()
            .getSheetByName('AIS')
            .getRange(`G${lastRow.row_}:G${lastRow.row_}`)
            .setDataValidation(
                SpreadsheetApp.newDataValidation()
                .requireValueInList(['Opened', 'In Progress', 'Close'])
                .build()
            );
        SpreadsheetApp.getActive()
            .getSheetByName('AIS')
            .getRange(`G${lastRow.row_}:G${lastRow.row_}`)
            .setValue('Opened');
    } catch (error) {
        Logger.log(`saveNewData(): error ${error}`);
    }
    return ContentService.createTextOutput(JSON.stringify(e.postData.contents)).setMimeType(
        ContentService.MimeType.JAVASCRIPT
    );
};

module.exports = {
    doGet,
    doPost,
};