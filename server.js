(async () => {
    process.on('uncaughtException', (err) => {
        console.error('CRITICAL: Uncaught Exception:', err);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
    });

    const { fork } = await import("child_process");
    const { WebSocketServer } = await import("ws");
    const { pack, unpack } = await import("msgpackr");
    const http = await import("http");


    const PROXIES = ["http://budget-v6.whiteproxies.com:27020"];
    const prod = false;

    // HTTP SERVER
    const server = http.createServer((req, res) => {
        res.writeHead(426, { "Content-Type": "text/plain" });
        res.end("lll elk ez big fat noob");
    });


    // WS SERVER
    function randint(a, b) {
        return Math.floor(Math.random() * (b - a + 1)) + a;
    }

    const sessions = new Map();
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws, req) => {
        const addr = req.socket.remoteAddress;
        console.log(addr, "connected");

        // Initialize or retrieve session for this IP
        if (!sessions.has(addr)) {
            sessions.set(addr, {
                workers: [],
                tank: "auto6",
                tanks: [],
                tankIdx: 0,
                proxyIdx: 0
            });
        }
        const session = sessions.get(addr);

        let challenge;
        let verified = false;

        function packet(...args) {
            ws.send(pack(args));
        }

        function close() {
            ws.close();
            // We only destroy workers if explicitly told to, or if the session is terminated.
            // For now, we don't destroy them on socket close to support refresh.
        }

        ws.on("message", (msg) => {
            try {
                const data = unpack(msg);
                const type = data.shift();

                switch (type) {
                    case "M":
                        if (challenge || data[0] != 72011) {
                            close();
                        }

                        challenge = randint(0b1000000000, 0b1111111111);
                        packet("M", challenge);
                        break;

                    case "C":
                        if (data[0] == (challenge ^ 845)) {
                            verified = true;
                            console.log(addr, "verified");
                        } else {
                            close();
                            console.log(addr, "true noob")
                        }

                        break;

                    case "Z":
                        session.tank = data[0];
                        if (session.tank instanceof Array) {
                            session.tanks = session.tank;
                            session.tankIdx = 0;

                            for (const worker of session.workers) {
                                let t = session.tanks[session.tankIdx];
                                worker.send({ type: "tankselect", tank: t });

                                session.tankIdx++;
                                if (session.tankIdx >= session.tanks.length) {
                                    session.tankIdx = 0;
                                }
                            }
                        } else {
                            session.tanks = [];
                            for (const worker of session.workers) {
                                worker.send({ type: "tankselect", tank: session.tank })
                            }
                        }

                        break;

                    case "F":
                        if (verified) {
                            const hash = data[0];
                            const count = parseInt(data[1]) || 1;

                            console.log(`Spawning ${count} bots for hash: ${hash}`);

                            const batch = [];
                            let readyCount = 0;
                            let joinTriggered = false;

                            const triggerBatchJoin = () => {
                                if (joinTriggered) return;
                                joinTriggered = true;
                                console.log(`Triggering join for ${readyCount}/${batch.length} bots...`);
                                for (let j = 0; j < batch.length; j++) {
                                      const w = batch[j];
                                      // Stagger join by a very small amount (10ms) to ensure they join "together"
                                      // but still have a tiny gap to prevent immediate socket collision
                                      setTimeout(() => {
                                          if (w.connected) {
                                              w.send({ type: "can_join" });
                                          }
                                      }, j * 10);
                                  }
                            };

                            // Fallback: If not all bots are ready within 10 seconds, join with what we have
                            const joinTimeout = setTimeout(() => {
                                if (!joinTriggered && readyCount > 0) {
                                    console.log("Join timeout reached. Joining with ready bots.");
                                    triggerBatchJoin();
                                }
                            }, 10000);

                            for (let i = 0; i < count; i++) {
                                setTimeout(() => {
                                    if (session.proxyIdx >= PROXIES.length) {
                                        session.proxyIdx = 0;
                                    }

                                    const worker = fork("index.js", []);
                                    batch.push(worker);
                                    session.workers.push(worker);

                                    worker.on("message", (msg) => {
                                        if (msg.type === "ready") {
                                            readyCount++;
                                            console.log(`Bot ready. (${readyCount}/${count})`);
                                            if (readyCount === count) {
                                                clearTimeout(joinTimeout);
                                                triggerBatchJoin();
                                            } else if (joinTriggered) {
                                                // If join was already triggered by timeout, send join signal immediately
                                                if (worker.connected) {
                                                    worker.send({ type: "can_join" });
                                                }
                                            }
                                        }
                                    });

                                    if (session.tanks.length) {
                                        worker.send({ type: "tankselect", tank: session.tanks[session.tankIdx] });
                                        session.tankIdx++;
                                        if (session.tankIdx >= session.tanks.length) {
                                            session.tankIdx = 0;
                                        }
                                    } else {
                                        worker.send({ type: "tankselect", tank: session.tank });
                                    }

                                    worker.send({
                                        type: "start", config: {
                                            id: i,
                                            proxy: {
                                                type: "http",
                                                url: PROXIES[session.proxyIdx]
                                            },
                                            hash: "#" + hash,
                                            name: "harlan",
                                            stats: [0, 0, 0, 9, 9, 9, 9, 9],
                                            type: "follow",
                                            token: "follow-8fe6ca",
                                            autoFire: false,
                                            autoRespawn: true,
                                            keys: [],
                                            keysHold: [],
                                            tank: "Auto4",
                                            chatSpam: "harlan runs arras",
                                            squadId: hash,
                                            reconnectAttempts: 10,
                                            reconnectDelay: 3000,
                                            syncJoin: true,
                                        }
                                    });

                                    session.proxyIdx++;
                                }, i * 150 + (Math.random() * 50)); // Reduced spawn delay to 150ms
                            }
                        }

                        break;

                    case "B":
                        if (verified) {
                            console.log(`Terminating ${session.workers.length} bots...`);
                            for (const worker of session.workers) {
                                if (worker.connected) {
                                    try {
                                        worker.send({ type: "destroy" });
                                    } catch (e) {
                                        console.error("Error sending destroy to worker:", e.message);
                                    }
                                }
                            }
                            session.workers = [];
                        }

                        break;

                    case "A":
                        if (verified) {
                            for (const worker of session.workers) {
                                if (worker.connected) {
                                    worker.send({
                                        type: "position",
                                        x: data[0],
                                        y: data[1],
                                        mouseX: data[2],
                                        mouseY: data[3],
                                        mouseDown: data[4],
                                        rMouseDown: data[5],
                                        mouse: data[6],
                                        feeding: data[7],
                                        shift: data[8],
                                        autofire: data[9],
                                        autospin: data[10],
                                        manualMode: data[11],
                                        manualX: data[12],
                                        manualY: data[13]
                                    });
                                }
                            }
                        }
                        break;

                    case "T":
                        if (verified) {
                            for (const worker of session.workers) {
                                if (worker.connected) {
                                    worker.send({
                                        type: "chat",
                                        message: data[0],
                                        spam: data[1]
                                    });
                                }
                            }
                        }
                        break;

                    default:
                        close();
                        break;
                }
            } catch (e) {
                console.error(e);
            }
        });

        ws.on("close", () => {
            console.log(addr, "disconnected (session retained)");
        });
    });


    const port = prod ? process.env.PORT : 8082;
    server.listen(port, () => {
        console.log("Server listening on port", port);
    });
})();