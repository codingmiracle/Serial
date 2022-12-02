const SerialPort = require("serialport");
const Readline = require("readline");

const hc12 = {
    interface: '/dev/serial0',
    baudRate: 9600,
}

let serialPort = new SerialPort(hc12.interface, {
    baudRate: hc12.baudRate
});

const parser = serialPort.pipe(new Readline({
    delimiter: '\n'
}))

parser.on('data', (data) => {
    console.log(data);
})

