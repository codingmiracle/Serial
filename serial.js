const {SerialPort, InterByteTimeoutParser} = require("serialport");
const {SerialPortMock} = require("serialport");
const {crypto} = require("crypto");
const sha256 = require("crypto-js/sha256")

//hc12 module config
const hc12 = {
    interface: '/dev/serial0',
    baudRate: 9600
};

const plainKey = 'PHilheaLthDuMmyciPHerKeyS';
const aes_context = {
    algorithm: 'aes-256-cbc',
    key: sha256(plainKey).toString(),
    iv: "000000000000000\0"
}
console.log(aes_context);

port = new SerialPort({
    path: hc12.interface, baudRate: hc12.baudRate, autoOpen: false
});

const parser = port.pipe(new InterByteTimeoutParser({
    interval: 10
}));

console.log(crypto.createDecipheriv)
const decipher = crypto.createDecipheriv('aes-256-cbc', aes_context.key, aes_context.iv);

globals = {SerialPort, SerialPortMock, port};

init = () => {

    port.open(err => {
        if (err != null) console.log(err);
        else port.write(aes_context.key);
    });

    parser.on('data', data => {
        console.log(data)
        decipher.setAutoPadding(false);
        let decrypted = decipher.update(data.toString(), 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        console.log(decrypted);
    });

    tx_task = setInterval(() => {
        port.write(aes_context.key, err => {
            if (err != null) console.log("tx: ", err);
        });
    }, 2000);
}

init();
