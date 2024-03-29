const {SerialPort, ByteLengthParser} = require("serialport");
const {SerialPortMock} = require("serialport");

//hc12 module config
const hc12 = {
    interface: '/dev/serial0',
    baudRate: 9600
};

port = new SerialPort({
    path: hc12.interface, baudRate: hc12.baudRate, autoOpen: false
});

globals = {SerialPort, SerialPortMock, port};

const parser = port.pipe(new ByteLengthParser({
    length: 1
}));

port.open(err => {
    if (err != null) console.log(err);
});

parser.on('data', data => {
    console.log(data.toString());
});