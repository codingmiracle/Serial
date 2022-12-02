const SerialPort = require("serialport");
const Readline = require("readline");

const hc12 = {
    interface: '/dev/serial0',
    baudRate: 9600,
}

serialPort = new SerialPort(hc12.interface, {
    baudRate: hc12.baudRate
});

const parser = serialPort.pipe(new Readline({
    delimiter: '\n'
}))

parser.on('data', (data) => {
    token = data.split(" ");
    console.log(data, typeof data);
})