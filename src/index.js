import { doGet } from './server/webapp';
import { pushMsg } from './functions/LineBot';
// eslint-disable-next-line no-global-assign
Logger = BetterLog.useSpreadsheet(
  PropertiesService.getScriptProperties().getProperty('GOOGLE_SHEET_ID').toString()
);
Tamotsu.initialize();

global.doGet = doGet;

function onEdit(e) {
  // eslint-disable-next-line
  var a = e;
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSheet();
  const val = SpreadsheetApp.getActiveSheet().getDataRange().getValues();
  const editRange = sheet.getActiveRange();
  const editRow = editRange.getRow();
  const editCol = editRange.getColumn();
  const range = sheet.getRange('F3:F');
  const rangeRowStart = range.getRow();
  const rangeRowEnd = rangeRowStart + range.getHeight() - 1;
  const rangeColStart = range.getColumn();
  const rangeColEnd = rangeColStart + range.getWidth() - 1;
  // const rangeTime = sheet.getRange('F:G');

  if (
    editRow >= rangeRowStart &&
    editRow <= rangeRowEnd &&
    editCol >= rangeColStart &&
    editCol <= rangeColEnd
  ) {
    const no = val[editRow - 1][editCol - 6];
    const name = val[editRow - 1][editCol - 5];
    const address = val[editRow - 1][editCol - 4];
    const dateSend = val[editRow - 1][editCol - 3];
    const timeSend = val[editRow - 1][editCol - 2];

    // const linenotify = val[editRow - 1][editCol - 1];

    const msg =
      `ลำดับ : ${no}\n` +
      `ชื่อ-นามสกุล : ${name}\n` +
      `ที่อยู่: ${address}\n` +
      `วันที่ยืนยัน : ${dateSend}\n` +
      `เวลาที่ยืนยัน : ${timeSend}`;

    const response = ui.alert(
      `${'ยืนยันการ Confirm เพื่อส่ง Line ?'}\n${msg}`,
      ui.ButtonSet.YES_NO
    );
    if (response === ui.Button.YES) {
      ui.alert('ส่งข้อมูลการยืนยันเรียบร้อยแล้วค่ะ');
      try {
        pushMsg(msg);
      } catch (error) {
        Logger.log(error);
      }
    } else {
      ui.alert('ยกเลิกการส่งข้อมูลไปทาง Line ');
    }

    // Logger.log(msg);
    // Logger.log(groupid);
  }
}

global.onEdit = onEdit;
