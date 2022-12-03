const {SerialPort, InterByteTimeoutParser} = require("serialport");
const {SerialPortMock} = require("serialport");
const {crypto} = require("crypto");

//hc12 module config
const hc12 = {
    interface: '/dev/serial0',
    baudRate: 9600
};

const plainKey = 'PHilheaLthDuMmyciPHerKeyS';
const hashKey = crypto.createHash('sha256');
hashKey.update(plainKey);
const aes_context = {
    algorithm: 'aes-256-cbc',
    key: hashKey.digest(),
    iv: 0
}

port = new SerialPort({
    path: hc12.interface, baudRate: hc12.baudRate, autoOpen: false
});

globals = {SerialPort, SerialPortMock, port};

const parser = port.pipe(new InterByteTimeoutParser({
    interval: 10
}));

init = () => {

    port.open(err => {
        if (err != null) console.log(err);
        else this.write(aes_context.key);
    });

    parser.on('data', data => {
        const decipher = crypto.createDecipheriv('aes-256-cbc', aes_context.key, aes_context.iv);
        decipher.setAutoPadding(false);
        let decrypted = decipher.update(data.toString(), 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        console.log(decrypted);
    });

    let tx_task = setInterval(() => {
        port.write(aes_context.key, err => {
            if (err != null) console.log("tx: ", err);
        });
    }, 2000);
}

init();
