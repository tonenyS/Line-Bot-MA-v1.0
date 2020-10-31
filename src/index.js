import { doGet, doPost, saveDataToSpreadsheet } from './server/webapp';
import onEdit from './server/trigger';

// eslint-disable-next-line no-global-assign
Logger = BetterLog.useSpreadsheet(
  PropertiesService.getScriptProperties().getProperty('GOOGLE_SHEET_ID').toString()
);

Tamotsu.initialize();

global.doGet = doGet;
global.doPost = doPost;

global.saveDataToSpreadsheet = saveDataToSpreadsheet;

global.onEdit = onEdit;
