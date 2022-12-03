const {SerialPort, PacketLengthParser} = require("serialport");
const {SerialPortMock} = require("serialport");

//hc12 module config
const hc12 = {
    interface: '/dev/serial0',
    baudRate: 9600
};

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


globals = {SerialPort, SerialPortMock, port};

init = () => {
    port.on('error', console.log);

    port.open();

    parser.on('data', data => {
        console.log(data);
    });

    tx_task = setInterval(() => {
        port.write("Hello World!");
    }, 2000);
}

init();
