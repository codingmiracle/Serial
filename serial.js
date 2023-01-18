const {SerialPort, PacketLengthParser} = require("serialport");
const SerialPortMock = require("serialport");
const crypto = require("crypto");


//hc12 module config
const hc12 = {
    interface: '/dev/serial0',
    baudRate: 9600
};

const token = "aaaaa";
const original_iv = [0x00, 0x00, 0x00, 0x00, 
                    0x00, 0x00, 0x00, 0x00,
                    0x00, 0x00, 0x00, 0x00,
                    0x00, 0x00, 0x00, 0x00]
const aes_ctx = {
    algorithm: 'aes-256-cbc',
    key: crypto.createHash('sha256').update(token).digest(),
    iv: Buffer.from(original_iv)
};
console.log(aes_ctx);

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
        let plaintext = data.slice(3, data.length).toString('hex');
        console.log(plaintext);
        /*if(!sessionKeyLoaded) {
            aes_context.key = plaintext;
            let encryptedMessage = decipher.update(plaintext, 'ascii', 'hex');
            encryptedMessage += decipher.final('hex');
            console.log(encryptedMessage);
            session_iv = encryptedMessage;
        }*/
        let decipher = crypto.createDecipheriv(aes_ctx.algorithm, aes_ctx.key, aes_ctx.iv);
        decipher.setAutoPadding(false);
        let decryptedMessage = decipher.update(plaintext, 'hex', 'hex');
        decryptedMessage.concat(decipher.final('hex'));
        console.log(decryptedMessage);
    });
}

//47 66 74 53 67 51 51 64  59 4c 46 44 48 6c 47 00
//77 56 44 63 57 61 61 54  69 7c 76 74 78 5c 77 30

init();
