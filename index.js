const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@adiwajshing/baileys');
const Pino = require("pino");

const startSock = async () => {
	const { state, saveCreds } = await useMultiFileAuthState('./auth');
	const sock = makeWASocket({
		logger: Pino({ level: "silent" }), // biar gak banyak log
		printQRInTerminal: true,
		auth: state,
		// Fix template Message
		patchMessageBeforeSending: (message) => {
			const requiresPatch = !!(
				message.buttonsMessage ||
				message.templateMessage ||
				message.listMessage
			);
			if (requiresPatch) {
				message = {
					viewOnceMessage: {
						message: {
							messageContextInfo: {
								deviceListMetadataVersion: 2,
								deviceListMetadata: {},
							},
							...message,
						},
					},
				};
			}
			return message;
		}
	});

	sock.ev.on('connection.update', (update) => {
		const { connection, lastDisconnect } = update;
		const reason = lastDisconnect?.error
		if (connection == "close") {
			if (reason !== DisconnectReason.loggedOut) {
				startSock();
			} else {
				console.log("Connection closed. You are logged out");
				process.exit();
			}
		}
		if (connection == "open") {
			console.log({ connection });
		}
	});

	sock.ev.on('creds.update', async ( ) => {
		await saveCreds()
	});

	sock.ev.on('messages.upsert', async (m) => {
		if (m.type == "notify") {
			const message = m.messages[0];
			console.log("COBA 1 : " + message.key.remoteJid);
			console.log((message))
		}
	});
}

startSock();

