const {SerialPort, PacketLengthParser} = require("serialport");
const {SerialPortMock} = require("serialport");
const {crypto} = require("crypto");

//hc12 module config
const hc12 = {
    interface: '/dev/serial0',
    baudRate: 9600
};

const aes_context = {
    algorithm: 'aes-256-cbc',
    key: crypto.randomBytes(256).toString(),
    iv: "000000000000000\0"
}
console.log(aes_context);

port = new SerialPort({
    path: hc12.interface, baudRate: hc12.baudRate, autoOpen: false
});

const parser = port.pipe(new PacketLengthParser({
    delimiter: 0xaa,
    packetOverhead: 3,
    lengthBytes: 2,
    lengthOffset: 1,
    maxLen: 1024
}));

const decipher = crypto.createDecipheriv('aes-256-cbc', aes_context.key, aes_context.iv);

globals = {SerialPort, SerialPortMock, port};

init = () => {
    port.on('error', console.log);

    port.open();

    parser.on('data', data => {
        console.log(data.toString());
    });

    tx_task = setInterval(() => {
        port.write("Hello World!");
    }, 2000);
}

init();
