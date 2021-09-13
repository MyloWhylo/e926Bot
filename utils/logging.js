const fs = require('fs');
const si = require('systeminformation');
const path = require('path');

const logDir = path.join(__dirname, '..', 'Logs');

let currentLog = {
   events: {},
   info: {}
};

let logPath = "";
let currentEntry = 0;

function LogEntry(time, type, data = null) {
   this.time = time.toISOString();
   this.type = type;
   this.eventData = data;
}

function dateFileFormat(date) {
   return `${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}-${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}`;
}

exports.begin = async () => {
   let currentDate = new Date;
   logPath = path.join(logDir, `${dateFileFormat(currentDate)}.json`);

   let event = new LogEntry(currentDate, "ControlEvent", { comment: "Bot is now online." });
   currentLog.events[currentEntry] = event;
   currentEntry++;

   currentLog.info['time'] = si.time();
   currentLog.info['hardware'] = await si.system();
   fs.writeFileSync(logPath, JSON.stringify(currentLog));
};

exports.addEntry = (type, data = {}) => {
   let currentDate = new Date;
   let event = new LogEntry(currentDate, type, data);
   currentLog.events[currentEntry] = event;
   currentEntry++;
   fs.writeFileSync(logPath, JSON.stringify(currentLog));
}