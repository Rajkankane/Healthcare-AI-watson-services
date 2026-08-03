const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'dataStore.json');

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return {
        doctors: [],
        users: [],
        appointments: [],
        contactMessages: [],
        triageLogs: [],
        bmiLogs: []
      };
    }
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading dataStore.json:', err);
    return { doctors: [], users: [], appointments: [], contactMessages: [], triageLogs: [], bmiLogs: [] };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing to dataStore.json:', err);
    return false;
  }
}

module.exports = {
  getDoctors: () => readData().doctors,

  getDoctorById: (id) => readData().doctors.find(d => d.id === parseInt(id)),

  getUsers: () => readData().users,

  addUser: (userData) => {
    const db = readData();
    const newUser = {
      id: db.users.length + 1,
      joinDate: new Date().toISOString().split('T')[0],
      ...userData
    };
    db.users.push(newUser);
    writeData(db);
    return newUser;
  },

  addAppointment: (appointmentData) => {
    const db = readData();
    const newAppointment = {
      id: `APT-${1000 + db.appointments.length + 1}`,
      createdAt: new Date().toISOString(),
      status: 'Confirmed',
      ...appointmentData
    };
    db.appointments.push(newAppointment);
    writeData(db);
    return newAppointment;
  },

  getAppointments: () => readData().appointments,

  addContactMessage: (msgData) => {
    const db = readData();
    const newMsg = {
      id: `MSG-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...msgData
    };
    db.contactMessages.push(newMsg);
    writeData(db);
    return newMsg;
  },

  addTriageLog: (triageData) => {
    const db = readData();
    const newLog = {
      id: `TRG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...triageData
    };
    db.triageLogs.push(newLog);
    writeData(db);
    return newLog;
  },

  addBmiLog: (bmiData) => {
    const db = readData();
    const newLog = {
      id: `BMI-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...bmiData
    };
    db.bmiLogs.push(newLog);
    writeData(db);
    return newLog;
  }
};
