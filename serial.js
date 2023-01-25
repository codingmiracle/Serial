const {SerialPort, PacketLengthParser} = require("serialport");
const SerialPortMock = require("serialport");
const crypto = require("crypto");

function joinBuffers(buffers, delimiter = ' ') {
    let d = Buffer.from(delimiter);
  
    return buffers.reduce((prev, b) => Buffer.concat([prev, d, b]));
}

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
    iv: Buffer.from(original_iv),
    sessionKey: null
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
        let plaintext = data.slice(3, data.length);
        console.log("plaintext:", plaintext);

        if(aes_ctx.sessionKey == null) {
            console.log("initializing Session:");
            let decipher = crypto.createDecipheriv(aes_ctx.algorithm, aes_ctx.key, aes_ctx.iv);
            decipher.setAutoPadding(false);
            let sessionIv = decipher.update(plaintext);
            sessionIv += decipher.final();
            console.log("sessionIv:", sessionIv);

            //generate Sessionkey
            b = Buffer.concat([aes_ctx.key, Buffer.from(sessionIv)]);
            aes_ctx.sessionKey = crypto.createHash('sha256').update(b).digest();
            console.log("SessionKey:", aes_ctx.sessionKey);
            
            //send OK Flag
            let cipher = crypto.createCipheriv(aes_ctx.algorithm, aes_ctx.sessionKey, aes_ctx.iv);
            let cipherText = cipher.update("OK"); 
            cipherText = Buffer.from(cipherText + cipher.final());
            console.log("encryptedMessage:", cipherText);
            port.write(cipherText);
        } else {
            let decipher = crypto.createDecipheriv(aes_ctx.algorithm, aes_ctx.sessionKey, aes_ctx.iv);
            decipher.setAutoPadding(false);
            let decryptedMessage = decipher.update(plaintext);
            decryptedMessage += decipher.final();
            console.log("decryptedMessage:", decryptedMessage);
        }
        
    });
}

//47 66 74 53 67 51 51 64  59 4c 46 44 48 6c 47 00
//77 56 44 63 57 61 61 54  69 7c 76 74 78 5c 77 30

//ed 96 8e 84 0d 10 d2 d3  13 a8 70 bc 13 1a 4e 2c  31 1d 7a d0 9b df 32 b3  41 81 47 22 1f 51 a6 e2  6c 68 74 4d 75 43 36 52  41 36 77 48 41 32 33 00
//ed 96 8e 84 0d 10 d2 d3  13 a8 70 bc 13 1a 4e 2c  31 1d 7a d0 9b df 32 b3  41 81 47 22 1f 51 a6 e2  6c 68 74 4d 75 43 36 52  41 36 77 48 41 32 33 00
init();
