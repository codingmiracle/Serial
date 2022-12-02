const {SerialPort} = require("serialport");
const { ReadlineParser } = require('@serialport/parser-readline')
const {SerialPortMock} = require("serialport");

//hc12 module config
const hc12 = {
    interface: '/dev/serial0',
    baudRate: 9600,
};

port = new SerialPort({
    path: hc12.interface,
    baudRate: hc12.baudRate,
    autoOpen: false
});

globals = { SerialPort, SerialPortMock, port};

const parser = port.pipe(new ReadlineParser({
    delimiter: '\n'
}));

port.open(err => console.log(err));

tx_task = setInterval(() => {
    port.write('Hello World', err => console.log(err));
}, 2000);

rx_task = setInterval(() => {
    console.log("rx: ", port.read())
}, 2000);