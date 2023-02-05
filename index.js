const { DisconnectReason, useSingleFileAuthState} = require('@adiwajshing/baileys');
const makeWASocket = require('@adiwajshing/baileys').default;

const startSock = () => {
    const {state, saveState} = useSingleFileAuthState('./auth.json');
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state
    });

    sock.ev.on('connection.update', function (update, connection2) {
        let _a, _b;
        let connection = update.connection, lastDisconnet = update.lastDisconnet;
        if (connection == 'close') {
            if (((_b = (_a = lastDisconnet.error) === null
            || _a === void 0 ? void 0 : _a.output) === null
            || _b === void 0 ? void 0 : _b.statusCode) !==  DisconnectReason.loggedOut) {
               startSock()   
            }

        } else {
            console.log('connection closed')
        }

        console.log('connection update ', update);
    });

    sock.ev.on('creds.update', saveState);

    sock.ev.on('messages.upsert', async m => {
        const message = m.messages[0];

        console.log("COBA 1 : "+message.key.remoteJid);
        
    });
}

startSock();

