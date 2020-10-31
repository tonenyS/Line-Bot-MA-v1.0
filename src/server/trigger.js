import { pushMessage } from '../functions/LineBot';

export default function (e) {
  if (
    PropertiesService.getScriptProperties().getProperty('TRIGGER_EDITING').toString() === 'TRUE'
  ) {
    // eslint-disable-next-line
        var a = e;

    const ui = SpreadsheetApp.getUi();
    const sheet = SpreadsheetApp.getActiveSheet();
    const val = SpreadsheetApp.getActiveSheet().getDataRange().getValues();
    const editRange = sheet.getActiveRange();
    const editRow = editRange.getRow();
    const editCol = editRange.getColumn();

    const range = sheet.getRange('H3:H');
    const rangeRowStart = range.getRow();
    const rangeRowEnd = rangeRowStart + range.getHeight() - 1;
    const rangeColStart = range.getColumn();
    const rangeColEnd = rangeColStart + range.getWidth() - 1;

    const range2 = sheet.getRange('I3:I');
    const rangeRowStart2 = range2.getRow();
    const rangeRowEnd2 = rangeRowStart2 + range2.getHeight() - 1;
    const rangeColStart2 = range2.getColumn();
    const rangeColEnd2 = rangeColStart2 + range2.getWidth() - 1;
    if (
      editRow >= rangeRowStart2 &&
      editRow <= rangeRowEnd2 &&
      editCol >= rangeColStart2 &&
      editCol <= rangeColEnd2
    ) {
      const no = val[editRow - 1][editCol - 8];
      const name = val[editRow - 1][editCol - 7];
      const address = val[editRow - 1][editCol - 6];
      const Building = val[editRow - 1][editCol - 5];
      const NumberCircoit = val[editRow - 1][editCol - 4];
      const dateSend = val[editRow - 1][editCol - 3];
      const timeSend = val[editRow - 1][editCol - 2];
      const statusSend = val[editRow - 1][editCol - 1];

      // const linenotify = val[editRow - 1][editCol - 1];
      // หมายเหตุ
      const msg =
        'งานที่ Confirm  \n' +
        `ลำดับ : ${no}\n` +
        `ชื่อ-นามสกุล : ${name}\n` +
        `ที่อยู่ : ${address}\n` +
        `อาคาร : ${Building}\n` +
        `เลข Circoit : ${NumberCircoit}\n` +
        `วันที่ยืนยัน : ${dateSend}\n` +
        `เวลาที่ยืนยัน : ${timeSend}\n` +
        `สถานะงาน : ${statusSend}`;

      const response = ui.alert(
        `${'ยืนยันการ Confirm งานเพื่อส่ง Line ?'}\n${msg}`,
        ui.ButtonSet.YES_NO
      );
      if (response === ui.Button.YES) {
        ui.alert('ส่งข้อมูลการยืนยันเรียบร้อยแล้วค่ะ');
        try {
          pushMessage(msg);
        } catch (error) {
          Logger.log(error);
        }
      } else {
        // ui.alert('ยกเลิกการส่งข้อมูลไปทาง Line ');
      }
    }

    if (
      editRow >= rangeRowStart &&
      editRow <= rangeRowEnd &&
      editCol >= rangeColStart &&
      editCol <= rangeColEnd
    ) {
      const no = val[editRow - 1][editCol - 8];
      const name = val[editRow - 1][editCol - 7];
      const address = val[editRow - 1][editCol - 6];
      const Building = val[editRow - 1][editCol - 5];
      const NumberCircoit = val[editRow - 1][editCol - 4];
      const dateSend = val[editRow - 1][editCol - 3];
      const timeSend = val[editRow - 1][editCol - 2];
      // const linenotify = val[editRow - 1][editCol - 1];
      // line
      const msg =
        'งานที่ Confirm  \n' +
        `ลำดับ : ${no}\n` +
        `ชื่อ-นามสกุล : ${name}\n` +
        `ที่อยู่ : ${address}\n` +
        `อาคาร : ${Building}\n` +
        `เลข Circoit : ${NumberCircoit}\n` +
        `วันที่ยืนยัน : ${dateSend}\n` +
        `เวลาที่ยืนยัน : ${timeSend}`;

      const response = ui.alert(
        `${'ส่งสถานะงานปัจจุบัน ผ่านทาง Line ?'}\n${msg}`,
        ui.ButtonSet.YES_NO
      );
      if (response === ui.Button.YES) {
        ui.alert('ส่งข้อมูลการยืนยันเรียบร้อยแล้วค่ะ');
        try {
          pushMessage(msg);
        } catch (error) {
          Logger.log(error);
        }
      } else {
        // ui.alert('ยกเลิกการส่งข้อมูลไปทาง Line ');
      }
    }
  }
}
