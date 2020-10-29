const { render } = require('../functions/utils');

const Route = {};
Route.path = function (routeName, callback) {
  Route[routeName] = callback;
};

Route.path('project-list', () => {
  return render('index', {
    title: '- 🕵️‍♀️ Project List -',
  });
});

const doGet = (e) => {
  if (Route[e.parameters.v]) {
    return Route[e.parameters.v]();
  }
  return render('404');
};

const doPost = (e) => {
  let data = {};
  try {
    const Agent = Tamotsu.Table.define({
      sheetName: 'AIS',
      rowShift: 1,
      columnShift: 1,
    });

    data = JSON.parse(e.postData.contents);
    Logger.log(`saveNewData(): ${JSON.stringify(data)}`);
    Logger.log(`saveNewData(): ${JSON.stringify(data[0])}`);

    Agent.create({
      FullName: data[0].FullName,
      Address: data[0].Address,
      'Confirmation date': data[0]['Confirmation date'],
      'Confirmation time': data[0]['Confirmation time'],
    });
  } catch (error) {
    Logger.log(`saveNewData(): error ${error}`);
  }
  return ContentService.createTextOutput(JSON.stringify(e.postData.contents)).setMimeType(
    ContentService.JSON
  );
};

module.exports = {
  doGet,
  doPost,
};
