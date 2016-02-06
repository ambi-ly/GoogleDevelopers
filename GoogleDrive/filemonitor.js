var ss = SpreadsheetApp.getActiveSpreadsheet(); 
var sheet = ss.getActiveSheet();
var fileName = sheet.getRange("A2").getValue();
var email = sheet.getRange("B2").getValue();

function generateReports() {
    var row = "";
    var userProperties = PropertiesService.getUserProperties();
    var previousTimeStamp = userProperties.getProperty('timeStamp');
  
    if (fileName != "") {
	var file = DriveApp.getFileById(fileName);
	var currentTimeStamp = file.getLastUpdated();
	userProperties.setProperty('timeStamp', currentTimeStamp);
    }
    if (previousTimeStamp) {
	if (Date.parse(currentTimeStamp) > Date.parse(previousTimeStamp)) {
	    row += "<a href='"+ file.getUrl() +"'>" + file.getName() + "</a>" + " was updated on "+ currentTimeStamp;
	    Logger.log(row);
	    MailApp.sendEmail(email, "Google Drive - File Activity Report", "", {htmlBody: row});
	} else {
	    Logger.log("File was not modified.");
	}
    } 
}


function onOpen() {
  var menu = [    
	      { name: "Step 1: Authorize",   functionName: "init" },
	      { name: "Step 2: Configure", functionName: "configure" },
	      null,
	      { name: "✖ Uninstall (Stop)",    functionName: "reset"     },
    null
		  ];  
  SpreadsheetApp.getActiveSpreadsheet()
      .addMenu("➪ F Activity Report", menu);
}

function onEdit() {
    email = sheet.getRange("B2").getValue();
    fileName = sheet.getRange("A2").getValue();
}

function configure() {
    try {
	reset(true);
	timeInterval = sheet.getRange("C2").getValue();
	ScriptApp.newTrigger("generateReports").timeBased().everyMinutes(timeInterval).create();
	generateReports();
	ss.toast("The program is now running. You can close this sheet.", "Success", -1);
    } catch (e) {
	Browser.msgBox(e.toString());
    }
  
}

function init() {
    var file = DriveApp.getFileById(fileName);
    var timeStamp = file.getLastUpdated();
    var userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('timeStamp', timeStamp);
    SpreadsheetApp.getActive().toast("The program is now initialized. Please run Step #2");
  
}

function reset(e) {
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
	ScriptApp.deleteTrigger(triggers[i]);    
    }
    if (!e) {
	SpreadsheetApp.getActive().toast("The script is no longer active. You can re-initialize anytime later.", "Stopped", -1);
    }
  
}