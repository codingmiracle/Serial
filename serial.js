const {SerialPort, PacketLengthParser} = require("serialport");
const {SerialPortMock} = require("serialport");
const {crypto} = require("crypto");
const sha256 = require("crypto-js/sha256")


//hc12 module config
const hc12 = {
    interface: '/dev/serial0',
    baudRate: 9600
};

const aes_context = {
    algorithm: 'aes-256-cbc',
    key: null,
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

globals = {SerialPort, SerialPortMock, port};

init = () => {
    port.on('error', console.log);

    port.open();

    parser.on('data', data => {
        let plaintext = data.slice(3, data.length).toString();
        if(aes_context.key == null) {
            aes_context.key = plaintext;
            console.log(aes_context.key);
            var cipher = crypto.createCipher('aes-256-cbc', aes_context.key);
            var decipher = crypto.createDecipher('aes-256-cbc', aes_context.key)
            let encryptedMessage = cipher.update("ACK", 'utf8', 'hex');
            encryptedMessage += cipher.final('hex');
            console.log(encryptedMessage);
            port.write(encryptedMessage);
        }
        let decryptedMessage = decipher.update(plaintext, 'hex', 'utf8');
        decryptedMessage += decipher.final('utf8');
        console.log(decryptedMessage);
    });
}

init();
