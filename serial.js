const {SerialPort, PacketLengthParser} = require("serialport");
const SerialPortMock = require("serialport");
const crypto = require("crypto");

const token = "";
let sessionKeyLoaded = false;
let session_iv = "";

//hc12 module config
const hc12 = {
    interface: '/dev/serial0',
    baudRate: 9600
};

const aes_context = {
    algorithm: 'aes-256-cbc',
    key: crypto.createHash('sha256').update(token).digest('hex'),
    iv: "000000000000000\0"
};
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

globals = {SerialPort, SerialPortMock, port};

init = () => {
    let decipher = crypto.createDecipher('aes-256-cbc', aes_context.key);

    port.on('error', console.log);

    port.open();

    parser.on('data', data => {
        let plaintext = data.slice(3, data.length).toString();
        console.log(plaintext);
        if(!sessionKeyLoaded) {
            aes_context.key = plaintext;
            let encryptedMessage = decipher.update(plaintext, 'ascii', 'hex');
            encryptedMessage += decipher.final('hex');
            console.log(encryptedMessage);
            session_iv = encryptedMessage;
        }
        let decryptedMessage = decipher.update(plaintext, 'hex', 'utf8');
        decryptedMessage += decipher.final('utf8');
        console.log(decryptedMessage);
    });
}

init();
