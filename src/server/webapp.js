const { render } = require('../functions/utils');
const {
  replyMessage,
  MESSAGE_TYPE,
  getUserProfile,
  sendLineNotify,
} = require('../functions/LineBot');

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

const doPost = async (e) => {
  try {
    // TO DO SOMETHINGS...
    const fmCommandRegex = new RegExp(
      /^#(TRUE|AIS|TOT|FINET|3BB)\s*([\d]{6})\s*(\bOPEN|IN PROGRESS|CLOSE\b)/i
    );
    const data = JSON.parse(e.postData.contents);
    Logger.log(`[doPost()] data: ${JSON.stringify(data)}`);
    const messages = data.events[0].message.text;
    Logger.log(`[doPost()] messages: ${messages}`);

    if (fmCommandRegex.test(messages)) {
      Logger.log(`[doPost()] fmCommandRegex.text : ${fmCommandRegex.test(messages.trim())}`);
      Logger.log(`[doPost()] fmCommandRegex ${messages.trim().match(fmCommandRegex)}`);

      let userProfile = {};
      try {
        userProfile = await getUserProfile(
          data.events[0].source.userId,
          data.events[0].source.groupId
        );
        userProfile.displayName = userProfile.displayName ? userProfile.displayName : 'ไม่ทราบชื่อ';
        Logger.log(`[sendLineNotify()] user information.${JSON.stringify(userProfile)}`);
      } catch (error) {
        Logger.log('[sendLineNotify()] fails.');
      }

      await sendLineNotify(`ได้รับคำสั่งจากคุณ @${userProfile.displayName} แล้วค่ะ`);

      const [_allcommand, _sheetName, _NumberCircoit, _command] = await messages
        .trim()
        .match(fmCommandRegex);
      Logger.log(`[doPost()] on sheet .${_sheetName}`);
      Logger.log(`[doPost()] on task .${_NumberCircoit}`);

      const MaAgent = await Tamotsu.Table.define({
        sheetName: _sheetName,
        rowShift: 1,
        columnShift: 0,
      });

      Logger.log(`[doPost()] ma information.${JSON.stringify(MaAgent)}`);

      const record = await MaAgent.where(function (doc) {
        return doc.NumberCircoit === _NumberCircoit;
      }).first();

      Logger.log(`[doPost()] ma information.${JSON.stringify(record)}`);

      if (record) {
        record['หมายเหตุ'] = _command;
        record.save();
        await replyMessage(
          data.events[0].replyToken,
          'งานที่ Confirm  \n' +
            `ลำดับ : ${record['#']}\n` +
            `ชื่อ-นามสกุล : ${record['Full Name']}\n` +
            `ที่อยู่ : ${record.Address}\n` +
            `อาคาร : ${record.Building}\n` +
            `เลข Circoit : ${record.NumberCircoit}\n` +
            `วันที่ยืนยัน : ${new Date(record.Confirmationdate).toLocaleDateString('th-TH')}\n` +
            `เวลาที่ยืนยัน : ${new Date(record.Confirmationtime).toLocaleTimeString('th-TH')}`,
          MESSAGE_TYPE.NORMAL
        );
      } else {
        await replyMessage(
          data.events[0].replyToken,
          `ขออภัยค่ะ 🙏 คุณ ${
            userProfile.displayName !== '' ? `@${userProfile.displayName}` : 'ไม่ทราบชื่อ'
          } ไม่พบหมายเลขคำสั่งที่ ${_NumberCircoit} ในระบบค่ะ`,
          MESSAGE_TYPE.NORMAL
        );
      }
    }
  } catch (error) {
    Logger.log(`doPost(): error ${error}`);
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
