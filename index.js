(async () => {
  const { WebSocket } = await import('ws');
  const { HttpsProxyAgent } = await import('https-proxy-agent');
  const { SocksProxyAgent } = await import('socks-proxy-agent');
  const url = await import('url');
  const fs = await import('fs');
  const fetchModule = await import('node-fetch');
  const realFetch = fetchModule.default || fetchModule;

  // ===== CHECK FOR COMMAND LINE ARGUMENTS =====
  const args = process.argv.slice(2);

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' && args[i + 1]) {
      autoStartCount = parseInt(args[i + 1]);
      autoStartMode = true;
      break;
    }
  }

  process.on('uncaughtException', function (e) { console.log(e) });
  // --- WORKER PROCESS (Bot logic) ---
  let isPaused = false;
  let currentBotInterface = {};
  let devastate = () => { };
  let target = {
    tank: 'basic',
    followMouse: true,
    feed: false,
    shift: false,
    mouseDown: false,
    rMouseDown: false,
    autofire: false,
    autospin: false,
    manualMode: false,
    manualX: 0,
    manualY: 0,
    chatSpam: ""
  };
  let lastChatAt = 0;

  let lastAutofire = false;
  let lastAutospin = false;

  //const names = fs.readFileSync("names.txt").toString().split("\n");

  const builds = {
    basic: "0/4/6/7/7/7/7/4",
    triangle: "0/2/3/7/7/7/7/7",
    smasher: "12/12/0/0/0/0/3/12/2/1"
  };

  const upgrade_map = {
    1: 50,
    2: 90,
    3: 120,
    4: 180
  };

  const tanks = {
    basic: {
      path: "",
      build: ""
    },

    // OTHER
    pursuer: {
      path: "uyiy",
      build: "0/0/0/0/0/0/0/9/0/0"
    },
    anni: {
      path: "kyu",
      build: builds.basic
    },
    shotgun: {
      path: "kj",
      build: builds.basic
    },
    penta: {
      path: "yuy",
      build: builds.basic
    },
    spread: {
      path: "yuu",
      build: builds.basic
    },
    octo: {
      path: "hyyc",
      build: "3/3/0/7/8/7/9/3/1/1"
    },
    autogunner: {
      path: "iiy",
      build: builds.basic
    },
    triplet: {
      path: "yuj",
      build: builds.basic
    },
    predator: {
      path: "uuy",
      build: builds.basic
    },
    triplex: {
      path: "yjy",
      build: builds.basic
    },
    quadruplex: {
      path: "yju",
      build: builds.basic
    },
    machinegunner: {
      path: "iih",
      build: builds.basic
    },
    cyclone: {
      path: "hyuc",
      build: builds.basic
    },
    factory: {
      path: "jhy",
      build: builds.basic
    },
    septatrap: {
      path: "hjic",
      build: "0/6/0/9/9/9/9"
    },

    // ANNIES
    obliterator: {
      path: "vkyuy",
      build: builds.basic
    },
    compound: {
      path: "kyui",
      build: builds.basic
    },
    wiper: {
      path: "kyuj",
      build: builds.basic
    },
    stomper: {
      path: ["k", "y", "u", [1, 3]],
      build: builds.basic
    },
    autoanni: {
      path: ["k", "y", "u", [2, 3]],
      build: builds.basic
    },
    shaver: {
      path: ["k", "y", "u", [2, 4]],
      build: builds.basic
    },
    eradicator: {
      path: ["k", "y", "u", [1, 4]],
      build: builds.basic
    },

    // FOR CRASH
    whirlwind: {
      path: "chyuk",
      build: "9/9/0/0/0/0/9"
    },
    tempest: {
      path: "chyuh",
      build: "9/9/0/0/0/0/9"
    },
    septamech: {
      path: "chjkh",
      build: "9/9/0/0/0/0/9"
    },
    doubleequalizer: {
      path: "yjyk",
      build: "9/9/0/0/0/0/9"
    },
    rigger: {
      path: "yjkk",
      build: "9/9/0/0/0/0/9"
    },
    doublespread: {
      path: "yuuy",
      build: "9/9/0/0/0/0/9"
    },
    palisade: {
      path: ["h", "j", "y", [3, 3]],
      build: "9/9/0/0/0/0/9"
    },

    // SMASHERS
    megasmasher: {
      path: ["r", [3, 3], "y"],
      build: builds.smasher
    },
    spike: {
      path: ["r", [3, 3], "u"],
      build: builds.smasher
    },
    autoshasher: {
      path: ["r", [3, 3], "i"],
      build: builds.smasher
    },
    landmine: {
      path: ["r", [3, 3], "h"],
      build: builds.smasher
    },

    thorn: {
      path: ["r", [2, 3], "u", "y"],
      build: builds.smasher
    },
    megaspike: {
      path: ["r", [2, 3], "u", "u"],
      build: "12/12/0/0/0/0/0/7/3/8" // bc its faster by default
    },
    claymore: {
      path: ["r", [2, 3], "u", "i"],
      build: builds.smasher
    },
    spear: {
      path: ["r", [2, 3], "u", "j"],
      build: builds.smasher
    },
    prick: {
      path: ["r", [2, 3], "u", "k"],
      build: builds.smasher
    },

    slammer: {
      path: [[2, 3], "k", "y"],
      build: "8/10/12/0/0/0/0/12"
    },
    basher: {
      path: [[2, 3], "j", "j"],
      build: "8/10/12/0/0/0/0/12"
    },
    physician: {
      path: [[2, 3], [3, 3]],
      build: "0/12/0/0/0/0/12/12/3/3"
    },

    // DPS
    toppler: {
      path: "uijh",
      build: builds.basic
    },
    crack: {
      path: "yuyj",
      build: builds.basic
    },
    autooperator: {
      path: [[1, 3], "j", "j", [2, 3]],
      build: builds.basic
    },
    lorry: {
      path: "ihyy",
      build: "3/3/0/7/8/7/9/3/1/1"
    },

    // BUILDERS
    engineer: {
      path: "kui",
      build: builds.basic
    },
    assembler: {
      path: "kuj",
      build: builds.basic
    },
    architect: {
      path: "kuk",
      build: builds.basic
    },

    // AUTO
    auto5: {
      path: "hiy",
      build: builds.basic
    },
    mega3: {
      path: "hiu",
      build: builds.basic
    },
    auto6: {
      path: "hiiy",
      build: builds.basic
    },

    auto7: {
      path: "hiyy",
      build: builds.basic
    },
    mega5: {
      path: "hiyu",
      build: builds.basic
    },
    autoauto4: {
      path: "hiii",
      build: builds.basic
    },
    hurler3: {
      path: "hiui",
      build: builds.basic
    },
    batter4: {
      path: "hiiu",
      build: builds.basic
    },

    // LAUNCHERS
    skimmer: {
      path: "khy",
      build: builds.basic
    },
    twister: {
      path: "khu",
      build: builds.basic
    },
    swarmer: {
      path: "khi",
      build: builds.basic
    },
    sidewinder: {
      path: "khh",
      build: builds.basic
    },
    fieldgun: {
      path: "khj",
      build: builds.basic
    },

    // AR LAUNCHERS
    spinner: {
      path: "khju",
      build: builds.basic
    },
    helix_ar: {
      path: "khuh",
      build: builds.basic
    },
    hypertwister: {
      path: "khui",
      build: builds.basic
    },
    gyro: {
      path: "khuk",
      build: builds.basic
    },
    coli: {
      path: ["k", "h", "u", [3, 3]],
      build: builds.basic
    },

    hyperskimmer: {
      path: "khyi",
      build: builds.basic
    },
    skidder: {
      path: "khjy",
      build: builds.basic
    },
    ream: {
      path: "khyh",
      build: builds.basic
    },

    hyperswarmer: {
      path: "khih",
      build: builds.basic
    },
    molotov: {
      path: "khij",
      build: builds.basic
    },

    firework: {
      path: "khky",
      build: builds.basic
    },
    levi: {
      path: "khkh",
      build: builds.basic
    },

    hypercluster: {
      path: ["k", "h", [4, 2], "h"],
      build: builds.basic
    },
    neutron: {
      path: ["k", "h", [4, 2], [1, 4]],
      build: builds.basic
    },

    // DRONES
    overczar: {
      path: "jyyy",
      build: builds.basic
    },
    tyrant: {
      path: "jyyk",
      build: builds.basic
    },
    autooverlord: {
      path: "jyyj",
      build: builds.basic
    },
    megaautooverseer: {
      path: "jyiy",
      build: builds.basic
    },
    tripleautooverseer: {
      path: "jyiu",
      build: builds.basic
    },
    autooverdrive: {
      path: "jyhh",
      build: builds.basic
    },
    headman: {
      path: "jkyy",
      build: builds.basic
    },
    overcheese: {
      path: "jkyu",
      build: builds.basic
    },
    overstorm: {
      path: "jjyu",
      build: builds.basic
    },

    // NECRO
    diviner: {
      path: "jiyy",
      build: builds.basic
    },
    autonecro: {
      path: "jiyi",
      build: builds.basic
    },
    necrodrive: {
      path: "jiyh",
      build: builds.basic
    },
    megaautounderdrive: {
      path: "jiiy",
      build: builds.basic
    },
    tripleautounderdrive: {
      path: "jiiu",
      build: builds.basic
    },

    pentamancer: {
      path: "jiky",
      build: builds.basic
    },
    pentadrive: {
      path: "jikh",
      build: builds.basic
    },
    warlock: {
      path: "jikj",
      build: builds.basic
    },
    autopentaseer: {
      path: "jiki",
      build: builds.basic
    },

    // CARRIER
    warship: {
      path: "juuy",
      build: builds.basic
    },
    battlerdrive: {
      path: "jjiu",
      build: builds.basic
    },
    bismarck: {
      path: "juku",
      build: builds.basic
    },
    proddrive: {
      path: "jjjj",
      build: builds.basic
    },
    manufacture: {
      path: "jukj",
      build: builds.basic
    },
    dirigible: {
      path: "jukk",
      build: builds.basic
    },
    autobattleship: {
      path: "juhh",
      build: builds.basic
    },
    autoprod: {
      path: "juki",
      build: builds.basic
    },
    autocruiserdrive: {
      path: "jjih",
      build: builds.basic
    },


    // TRI ANGLE
    rocket: {
      path: "huuy",
      build: "8/8/0/0/0/0/8/8/2/8"
    },
    fighter: {
      path: "huy",
      build: builds.triangle
    },
    bomber: {
      path: "huh",
      build: builds.triangle
    },
    autotriangle: {
      path: "huj",
      build: builds.triangle
    },
    surfer: {
      path: "huk",
      build: builds.triangle
    },
    eagle: {
      path: "kk",
      build: builds.triangle
    },
    phoenix: {
      path: "ihu",
      build: builds.triangle
    },
    vulture: {
      path: "uij",
      build: builds.triangle
    },

    // ARMS RACE TRI ANGLE
    // surfer
    browser: {
      path: "huky",
      build: builds.triangle
    },
    surferdrive: {
      path: "huki",
      build: builds.triangle
    },
    roller: {
      path: "hukh",
      build: builds.triangle
    },
    strider: {
      path: "hukk",
      build: builds.triangle
    },

    // auto tri angle
    megaautotriangle: {
      path: "hujy",
      build: builds.triangle
    },
    tripleautotriangle: {
      path: "huju",
      build: builds.triangle
    },
    autofighter: {
      path: "huji",
      build: builds.triangle
    },
    autobomber: {
      path: "hujk",
      build: builds.triangle
    },

    // taser
    kicker: {
      path: "uikj",
      build: builds.triangle
    },
    electrocutor: {
      path: "uiki",
      build: builds.triangle
    },

    // eagle
    autoeagle: {
      path: "kkk",
      build: builds.triangle
    },
    griffin: {
      path: "kkh",
      build: builds.triangle
    },

    // BASIC & TREE TANKS
    twin: {
      path: "y",
      build: builds.basic
    },
    doubletwin: {
      path: "yy",
      build: builds.basic
    },
    tripleshot: {
      path: "yu",
      build: builds.basic
    },
    sniper: {
      path: "u",
      build: builds.basic
    },
    machinegun: {
      path: "i",
      build: builds.basic
    },
    sprayer: {
      path: "ih",
      build: builds.basic
    },
    redistributor: {
      path: "ihy",
      build: builds.basic
    },
    flankguard: {
      path: "h",
      build: builds.basic
    },
    hexatank: {
      path: "hy",
      build: builds.basic
    },
    octotank: {
      path: "hyy",
      build: "3/3/0/7/8/7/9/3/1/1"
    },
    hexatrapper: {
      path: "hyi",
      build: builds.basic
    },
    triangle: {
      path: "hu",
      build: builds.basic
    },
    booster: {
      path: "huu",
      build: builds.triangle
    },
    falcon: {
      path: "hui",
      build: builds.triangle
    },
    auto3: {
      path: "hui",
      build: builds.basic
    },
    auto4: {
      path: "huii",
      build: builds.basic
    },
    banshee: {
      path: "huih",
      build: builds.basic
    },
    trapguard: {
      path: "hh",
      build: builds.basic
    },
    buchwhacker: {
      path: "hhy",
      build: builds.basic
    },
    gunnertrapper: {
      path: "hhu",
      build: builds.basic
    },
    conqueror: {
      path: "hhj",
      build: builds.basic
    },
    bulwark: {
      path: "hhk",
      build: builds.basic
    },
    parapet: {
      path: "hhjy",
      build: "3/3/0/7/8/7/8/5/1/0"
    },
    tritrapper: {
      path: "hj",
      build: builds.basic
    },
    fortress: {
      path: "hjy",
      build: builds.basic
    },
    septatrapper: {
      path: "hji",
      build: builds.basic
    },
    tripletwin: {
      path: "hk",
      build: builds.basic
    },
    director: {
      path: "j",
      build: builds.basic
    },
    pounder: {
      path: "k",
      build: builds.basic
    },
    automingler: {
      path: "hykj",
      build: "2/3/2/7/8/7/9/3/1/0"
    },
    mingler: {
      path: "hyk",
      build: builds.basic
    },
    underseer: {
      path: "ji",
      build: builds.basic
    },
    rocketeer: {
      path: "khk",
      build: builds.basic
    },
    destroyer: {
      path: "ky",
      build: builds.basic
    },
    launcher: {
      path: "kh",
      build: builds.basic
    },
    gale: {
      path: "hyyi",
      build: "3/3/0/7/8/7/9/3/1/1"
    },

    gunner: {
      path: "ii",
      build: builds.basic
    },
    nailgun: {
      path: "iiu",
      build: builds.basic
    },
    pincer: {
      path: "iiuk",
      build: builds.basic
    },
    nona: {
      path: "hjiy",
      build: builds.basic
    },
    septamachine: {
      path: "hjiu",
      build: builds.basic
    },
    assassin: {
      path: "uy",
      build: builds.basic
    },
    stalker: {
      path: "uyi",
      build: builds.basic
    },
    healer: {
      path: "x",
      build: builds.basic
    },

    overseer: {
      path: "jy",
      build: builds.basic
    },
    cruiser: {
      path: "ju",
      build: builds.basic
    },
    spawner: {
      path: "jh",
      build: builds.basic
    },
    directordrive: {
      path: "jj",
      build: builds.basic
    },
    honcho: {
      path: "jk",
      build: builds.basic
    },
    manager: {
      path: "jx",
      build: builds.basic
    },
    foundry: {
      path: "jh",
      build: builds.basic
    },
    topbanana: {
      path: "jh",
      build: builds.basic
    },
    shopper: {
      path: "jh k",
      build: builds.basic
    },
    megaspawner: {
      path: "jhi",
      build: builds.basic
    },
    ultraspawner: {
      path: "jhiy",
      build: builds.basic
    },
    chemist: {
      path: [[2, 3], [1, 2], [1, 2]],
      build: "3/3/0/7/8/7/9/3/1/1"
    },
    jerker: {
      path: [[2, 1], [3, 1], [2, 3], [3, 3]],
      build: builds.smasher
    },
    limpet: {
      path: [[2, 3], [1, 2], [1, 1]],
      build: builds.smasher
    }
  };

  const options = { start: () => { } };

  WebAssembly.instantiateStreaming = false
  const arras = (function () {
    const log = function () {
      global.console.log(`[headless]`, ...arguments)
    }

    let app = false
    const wasm = function () {
      return {
        arrayBuffer: function () {
          return app
        }
      }
    }
    let lastStatus = 0, statusData = ''
    const getStatus = function (f, s) {
      let now = global.performance.now()
      if (statusData && now - lastStatus < 15000) {
        return {
          then: function () {
            return {
              then: function (f) {
                let i = JSON.parse(statusData)
                s(i)
                f(i)
              }
            }
          }
        }
      }
      let then = function () { }
      realFetch(f).then(x => x.text()).then(x => {
        statusData = x
        let i = JSON.parse(x)
        s(i)
        then(i)
      })
      return {
        then: function () {
          return {
            then: function (f) {
              then = f
            }
          }
        }
      }
    }

    let ready = false, script = false, o = [], then = function (f) {
      if (ready) {
        f();
      } else {
        o.push(f);
      }
    };

    const initializeAndRunQueue = function () {
      ready = true;
      //log('Headless arras ready.');
      for (let i = 0, l = o.length; i < l; i++) {
        o[i]();
      }
      o = [];
      then = function (f) {
        f();
      };
    }

    let prerequisites = 0;
    const onPrerequisiteLoaded = function () {
      prerequisites++;
      if (prerequisites === 2) {
        initializeAndRunQueue();
      }
    }

    // --- CACHE LOGIC ---
    const CACHE_DIR = './.cache';
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);

    const WASM_CACHE = `${CACHE_DIR}/app.wasm`;
    const SCRIPT_CACHE = `${CACHE_DIR}/script.js`;

    // Load WASM
    if (fs.existsSync(WASM_CACHE)) {
      app = fs.readFileSync(WASM_CACHE);
      onPrerequisiteLoaded();
    } else {
      realFetch('https://arras.io/app.wasm').then(x => x.arrayBuffer()).then(x => {
        app = x;
        fs.writeFileSync(WASM_CACHE, Buffer.from(x));
        onPrerequisiteLoaded();
      });
    }

    // Load Script
    const loadScript = function () {
      const activateBot = (scriptContent) => {
        script = scriptContent;
        onPrerequisiteLoaded();
      };

      if (fs.existsSync(SCRIPT_CACHE)) {
        const stats = fs.statSync(SCRIPT_CACHE);
        // Cache script for 1 hour
        if (Date.now() - stats.mtimeMs < 60 * 60 * 1000) {
          activateBot(fs.readFileSync(SCRIPT_CACHE, 'utf8'));
          return;
        }
      }

      const extractScriptFromHtml = (html) => {
        const scriptTagStart = html.indexOf('<script>');
        if (scriptTagStart === -1) {
          log('Error: Could not find <script> tag in content.');
          return null;
        }
        let scriptContent = html.slice(scriptTagStart + 8);
        const scriptTagEnd = scriptContent.indexOf('</script');
        if (scriptTagEnd === -1) {
          log('Error: Could not find closing </script> tag.');
          return null;
        }
        scriptContent = scriptContent.slice(0, scriptTagEnd);
        return scriptContent;
      };

      realFetch('https://arras.io').then(x => x.text()).then(html => {
        const extractedScript = extractScriptFromHtml(html);
        if (extractedScript) {
          fs.writeFileSync(SCRIPT_CACHE, extractedScript);
          activateBot(extractedScript);
        }
      }).catch(err => {
        log('FATAL: Could not fetch from arras.io.', err);
      });
    }
    loadScript();

    let trigger = {};
    const run = function (x, config, oa) {
      const log = function () {
        global.console.log(`[headless ${config.id}]`, ...arguments)
      }

      const internalBotInterface = {
        log: log,
        simulateKey: (code) => {
          if (trigger.keydown && trigger.keyup) {
            trigger.keydown(code);
            setTimeout(() => trigger.keyup(code), 50);
          }
        },
        triggerJoin: () => {
          canJoin = true;
          log('Simultaneous join triggered!');
        }
      };

      const triggerReconnect = () => {
        if (!destroyed) {
          destroy()
          if (reconnectCount < config.reconnectAttempts) {
            reconnectCount++;
            const delay = config.reconnectDelay + (Math.random() * 1000); // Add jitter
            log(`Attempting to reconnect in ${(delay / 1000).toFixed(1)}s... (${reconnectCount}/${config.reconnectAttempts})`);
            global.setTimeout(function () {
              log('Reconnecting...');
              run(x, config, arras);
            }, delay);
          } else {
            log(`Max reconnection attempts reached (${config.reconnectAttempts}). Will not reconnect.`);
          }
        }
      };

      let destroy = function () {
        if (destroyed) { return }
        log('Destroying instance...')
        if (gameSocket && gameSocket.readyState < 3) {
          gameSocket.close()
          gameSocket = false
        }
        clearInterval(mainInterval)
        destroyed = true
      }, destroyed = false
      devastate = destroy;

      const setInterval = new Proxy(global.setInterval, {
        apply: function (a, b, c) {
          if (destroyed) { return }
          return Reflect.apply(a, b, c)
        }
      }), setTimeout = new Proxy(global.setTimeout, {
        apply: function (a, b, c) {
          if (destroyed) { return }
          return Reflect.apply(a, b, c)
        }
      })
      const h = function (o) {
        return new Proxy(o, {
          get: function (a, b, c) {
            let d = Reflect.get(a, b, c)
            return d
          }, set: function (a, b, c) {
            return Reflect.set(a, b, c)
          }
        })
      }
      const elementListeners = new WeakMap();
      const allElements = [];
      const handleListener = function (type, f, element) {
        if (!element) return;
        if (!elementListeners.has(element)) {
          elementListeners.set(element, {});
        }
        const listeners = elementListeners.get(element);
        if (!listeners[type]) {
          listeners[type] = [];
        }
        listeners[type].push(f);
      }
      const broadcastEvent = (type, event) => {
        const targets = [global.window, global.document, ...allElements];
        for (const target of targets) {
          const listeners = elementListeners.get(target);
          if (listeners && listeners[type]) {
            for (const f of listeners[type]) {
              try { f.call(target, event); } catch (e) { }
            }
          }
        }
      };

      trigger = {
        mousemove: function (clientX, clientY) {
          broadcastEvent('mousemove', {
            isTrusted: true,
            clientX: clientX,
            clientY: clientY
          });
        },
        mousedown: function (clientX, clientY, button) {
          broadcastEvent('mousedown', {
            isTrusted: true,
            clientX: clientX,
            clientY: clientY,
            button: button
          });
        },
        mouseup: function (clientX, clientY, button) {
          broadcastEvent('mouseup', {
            isTrusted: true,
            clientX: clientX,
            clientY: clientY,
            button: button
          });
        },
        keydown: function (code, repeat) {
          broadcastEvent('keydown', {
            isTrusted: true,
            code: code,
            key: '',
            repeat: repeat || false,
            preventDefault: function () { }
          });
        },
        keyup: function (code, repeat) {
          broadcastEvent('keyup', {
            isTrusted: true,
            code: code,
            key: '',
            repeat: repeat || false,
            preventDefault: function () { }
          });
        }
      }

      global.window = global.parent = global.top = {
        WebAssembly,
        googletag: {
          cmd: {
            push: function (f) { try { f(); } catch (e) { } }
          },
          defineSlot: function () { return this; },
          addService: function () { return this; },
          display: function () { return this; },
          pubads: function () { return this; },
          enableSingleRequest: function () { return this; },
          collapseEmptyDivs: function () { return this; },
          enableServices: function () { return this; }
        },
        arrasAdDone: true
      };

      global.crypto = global.window.crypto = {
        getRandomValues: function (a) { return a }
      };
      global.addEventListener = global.window.addEventListener = function (type, f) {
        handleListener(type, f, global.window)
      };
      global.removeEventListener = global.window.removeEventListener = function (type, f) {
      };
      global.Image = global.window.Image = function () {
        return {}
      };

      let inputs = [], setValue = function (str) {
        for (let i = 0, l = inputs.length; i < l; i++) {
          const input = inputs[i];
          input.value = str;
          const listeners = elementListeners.get(input);
          if (listeners) {
            const event = { target: input, isTrusted: true };
            if (listeners.input) {
              for (const f of listeners.input) {
                try { f.call(input, event); } catch (e) { }
              }
            }
            if (listeners.change) {
              for (const f of listeners.change) {
                try { f.call(input, event); } catch (e) { }
              }
            }
          }
        }
      }
      let position = [0, 0, 5], died = false, died2 = false, ignore = false, disconnected = false, connected = false, inGame = false, upgrade = false, reconnectCount = 0, isUpgrading = false;

      let innerWidth = global.window.innerWidth = 500
      let innerHeight = global.window.innerHeight = 500

      let st = 2, lx = 0, gd = 1, canvasRef = {}, sr = 1, s = 1;

      const g = function () {
        let w = innerWidth;
        let h = innerHeight;
        if (!canvasRef.width) canvasRef.width = w;
        if (w * 0.5625 > h) {
          s = 888.888888888 / w;
        } else {
          s = 500 / h;
        }
        sr = canvasRef.width / w;
      };
      g();

      global.document = global.window.document = (function () {
        const emptyFunc = () => { };
        const emptyStyle = { setProperty: emptyFunc };

        const simulatedContext2D = {
          isContextLost: () => false,

          fillText: function () {
            if (ignore) { return }
            let a = Array.from(arguments)
            if (this.font === 'bold 7px Ubuntu' && this.fillStyle === 'rgb(255,255,255)') {
              if (a[0] === `You have spawned! Welcome to the game.`) {
                hasJoined = firstJoin = true;
                position[0] = position[1] = 0; // Reset internal tracking on spawn
              } else if (a[0] === 'You have traveled through a portal!') {
                hasJoined = true;
                position[0] = position[1] = 0;
              }
              if (!died && (
                (a[0].startsWith('The server was ') && a[0].endsWith('% active'))
                || a[0].startsWith('Survived for ')
                || a[0].startsWith('Succumbed to ')
                || a[0] === 'You have self-destructed.'
                || a[0] === `Vanished into thin air`
                || a[0].startsWith('You have been killed by '))) {
                died = true
              }
              if (!a[0].startsWith(`You're using an ad blocker.`) && a[0] !== 'Respawn' && a[0] !== 'Back' && a[0] !== 'Reconnect' && a[0].length > 2) {
                //log('[arras]', a[0])
                if (a[0].startsWith("You have been killed by ") || a[0] === "You have died a stupid death.") {
                  died = true;
                }
              }
            }
            if (this.font === 'bold 7.5px Ubuntu' && this.fillStyle === 'rgb(231,137,109)') {
              if (a[0] === 'You have been temporarily banned from the game.' || a[0] === 'Your IP address have been blacklisted due to suspicious activities.') {
                disconnected = true
                destroy()
                log('[arras]', a[0])
              } else if (a[0].startsWith('The connection closed due to ')) {
                disconnected = true
                triggerReconnect();
                log('[arras]', a[0])
              }
            }
            if (this.font === 'bold 5.1px Ubuntu' && this.fillStyle === 'rgb(255,255,255)') {
              if (a[0].startsWith('Coordinates: (')) {
                if (died2) {
                  hasJoined = true;
                }

                let b = a[0].slice(14), l = b.length
                if (b[l - 1] === ')') {
                  b = b.slice(0, l - 1).split(', ')
                  if (b.length === 2) {
                    let x = parseFloat(b[0])
                    let y = parseFloat(b[1])
                    position[0] = x
                    position[1] = y
                    position[2] = 5
                  }
                }
              }
            }
          },

          measureText: (text) => ({ width: text.length }),
          clearRect: emptyFunc, strokeRect: emptyFunc, fillRect: emptyFunc,
          save: emptyFunc, translate: emptyFunc, clip: emptyFunc, restore: emptyFunc,
          beginPath: emptyFunc,
          moveTo: function () {
            canvasRef = this.canvas;
            if (st > 0) {
              st--;
              if (st === 1) {
                lx = arguments[0];
              } else {
                const diff = arguments[0] - lx;
                if (diff !== 0) {
                  gd = sr / diff;
                }
              }
            }
          },
          lineTo: emptyFunc, rect: emptyFunc,
          arc: emptyFunc, ellipse: emptyFunc, roundRect: emptyFunc, closePath: emptyFunc,
          fill: emptyFunc, stroke: emptyFunc, strokeText: emptyFunc, drawImage: emptyFunc,
        };

        const createElement = function (tag, options) {
          const element = {
            tag: tag ? tag.toLowerCase() : '',
            appended: false,
            value: '',
            style: emptyStyle,
            addEventListener: (type, f) => handleListener(type, f, element),
            setAttribute: emptyFunc,
            appendChild: (e) => { e.appended = true },
            focus: emptyFunc,
            blur: emptyFunc,
            remove: emptyFunc,
            getBoundingClientRect: () => ({
              width: innerWidth, height: innerHeight, top: 0, left: 0, bottom: innerHeight, right: innerWidth,
            }),
          };

          if (element.tag === 'canvas') {
            element.toDataURL = () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAADElEQVQImWNgoBMAAABpAAFEI8ARAAAAAElFTkSuQmCC';
            element.getContext = (type) => {
              if (type === '2d') {
                simulatedContext2D.canvas = element;
                return simulatedContext2D;
              }
              return null;
            };
          }

          if (element.tag === 'input') {
            inputs.push(element);
          }
          allElements.push(element);

          if (options) {
            Object.assign(element, options);
          }

          return element;
        };

        const doc = createElement('document', {
          createElement: createElement,
          body: null,
          fonts: { load: () => true },
          referrer: '',
        });
        doc.body = createElement('body');

        return doc;
      })();

      global.location = global.window.location = {
        hostname: 'arras.io',
        hash: config.hash,
        query: ''
      }
      let lastHash = global.location.hash
      global.prompt = global.window.prompt = function () {
        console.log('prompt', ...arguments)
      }
      let devicePixelRatio = global.window.devicePixelRatio = 1
      let a = false
      global.requestAnimationFrame = global.window.requestAnimationFrame = function (f) {
        st = 2;
        g();
        a = f
      }
      global.performance = {
        time: 0,
        now: function () {
          return this.time
        }
      }
      const console = {
        log: new Proxy(global.console.log, {
          apply: function (a, b, args) {
            if (args[0] === '%cStop!' || (args[0] && args[0].startsWith && args[0].startsWith('%cHackers have been known'))) { return }
            return Reflect.apply(a, b, args)
          }
        })
      }

      let proxyAgent = null;
      if (config.proxy) {
        if (config.proxy.type === 'socks') {
          proxyAgent = new SocksProxyAgent(config.proxy.url);
        } else if (config.proxy.type === 'http') {
          proxyAgent = new HttpsProxyAgent(config.proxy.url);
        }
      }

      let i = 0, controller = {
        x: 250,
        y: 250,
        mouseDown: function (button) {
          trigger.mousedown(controller.x, controller.y, button)
        },
        mouseUp: function (button) {
          trigger.mouseup(controller.x, controller.y, button)
        },
        click: async function (x, y) {
          trigger.mousedown(x, y, 0);
          await new Promise(r => setTimeout(r, 50)); // Tiny delay for click registration
          trigger.mouseup(x, y, 0);
        },
        press: function (code) {
          trigger.keydown(code)
          trigger.keyup(code)
        },
        chat: function (str) {
          if (!str) return;
          // Open chat
          controller.press('Enter');
          global.performance.time += 200;
          if (typeof a === 'function') a();

          // Type message
          setValue(str);
          global.performance.time += 200;
          if (typeof a === 'function') a();

          // Send message
          controller.press('Enter');
          global.performance.time += 200;
          if (typeof a === 'function') a();

          // Clear input buffer
          setValue("");
        },
        moveDirection: function (x, y) {
          trigger[x < 0 ? 'keydown' : 'keyup']('KeyA')
          trigger[y < 0 ? 'keydown' : 'keyup']('KeyW')
          trigger[x > 0 ? 'keydown' : 'keyup']('KeyD')
          trigger[y > 0 ? 'keydown' : 'keyup']('KeyS')
        },
        iv: 4 / Math.PI,
        dv: Math.PI / 4,
        ix: [1, 1, 0, -1, -1, -1, 0, 1],
        iy: [0, 1, 1, 1, 0, -1, -1, -1],
        moveVector: function (x, y, i) {
          let d = Math.atan2(y, x)
          let h = (Math.round(d * controller.iv) % 8 + 8) % 8
          let x2 = controller.ix[h]
          let y2 = controller.iy[h]
          controller.moveDirection(x2, y2)
          return h * controller.dv
        }
      }, statusRecieved = false, firstJoin = false, hasJoined = false, waitToJoin = false, canJoin = !config.syncJoin, timeouts = {}, timeout = function (f, t) {
        if (!(t >= 1)) { t = 1 }
        let n = i + t
        let a = timeouts[n]
        if (!a) {
          a = timeouts[n] = []
        }
        a.push(f)
      }, block = false

      // Fallback to ensure bots proceed even if /status fails
      setTimeout(() => {
        if (!statusRecieved) {
          log('Forcing statusRecieved after fallback timeout');
          statusRecieved = true;
        }
      }, 1000);

      async function waitTime(timeout) {
        await new Promise(resolve => setTimeout(resolve, timeout));
      }


      // PATH FIND FUNC
      function getDir(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
      }

      function randint(a, b) {
        return Math.floor(Math.random() * (b - a + 1)) + a;
      }

      function choice(array) {
        return array[randint(0, array.length - 1)];
      }

      function stopMoving() {
        for (const key of "WASD") {
          trigger.keyup("Key" + key);
        }
      }

      function pathfind(x, y) {
        const angle = getDir(position[0], position[1], x, y);
        let hold = {};

        // Perfect 8-direction movement
        if (angle >= -Math.PI / 8 && angle < Math.PI / 8) {
          // Right
          hold["KeyD"] = true;
        } else if (angle >= Math.PI / 8 && angle < 3 * Math.PI / 8) {
          // Down-Right
          hold["KeyS"] = true;
          hold["KeyD"] = true;
        } else if (angle >= 3 * Math.PI / 8 && angle < 5 * Math.PI / 8) {
          // Down
          hold["KeyS"] = true;
        } else if (angle >= 5 * Math.PI / 8 && angle < 7 * Math.PI / 8) {
          // Down-Left
          hold["KeyS"] = true;
          hold["KeyA"] = true;
        } else if (angle >= 7 * Math.PI / 8 || angle < -7 * Math.PI / 8) {
          // Left
          hold["KeyA"] = true;
        } else if (angle >= -7 * Math.PI / 8 && angle < -5 * Math.PI / 8) {
          // Up-Left
          hold["KeyW"] = true;
          hold["KeyA"] = true;
        } else if (angle >= -5 * Math.PI / 8 && angle < -3 * Math.PI / 8) {
          // Up
          hold["KeyW"] = true;
        } else {
          // Up-Right
          hold["KeyW"] = true;
          hold["KeyD"] = true;
        }

        for (let key of "WASD") {
          key = "Key" + key;
          trigger[hold[key] ? "keydown" : "keyup"](key);
        }
      }

      async function onJoin() {
        if (isUpgrading) return;
        isUpgrading = true;
        block = true; // Lock movement during upgrade
        died2 = false; // Prevent fillText from setting hasJoined = true while upgrading

        // Force coordinates ON immediately so we aren't blind
        controller.press('KeyL');
        position[2] = 5;

        reconnectCount = 0;
        if (config.id === 0) log(`[Bot 0] Joining as: ${target.tank}`);

        for (const key of tanks[target.tank].path) {
          if (key === "wait") {
            await waitTime(1000);
          } else if (key instanceof Array) {
            await waitTime(500);
            await controller.click(upgrade_map[key[0]], upgrade_map[key[1]]);
            await waitTime(500);
          } else {
            controller.press("Key" + key.toUpperCase());
          }
        }

        let build;
        if (target.feed) {
          build = [0, 0, 12, 0, 0, 0, 0, 8]
          controller.press("KeyR");
        } else {
          build = tanks[target.tank].build.split("/");
        }

        let i2 = 0;
        for (let i = 1; i <= build.length; i++) {
          const stat = parseInt(build[i2]);

          if (i == 10) {
            i = 0;
          }

          for (let i3 = 0; i3 < stat; i3++) {
            controller.press("Digit" + i);
          }

          if (i == 0)
            break;

          i2++;
        }

        for (const key of config.keysHold) {
          trigger.keydown("Key" + key.toUpperCase());
        }

        inGame = true

        if (target.autofire) {
          controller.press("KeyE");
        }
        lastAutofire = target.autofire;

        if (target.autospin) {
          controller.press("KeyC");
        }
        lastAutospin = target.autospin;

        block = false; // Unlock movement
        isUpgrading = false;
        hasJoined = false; // Clear any queued spawn triggers
      }

      const mainInterval = setInterval(function () {
        if (block || isPaused) {
          return
        }

        if (a) {
          switch (i) {
            case 1: {
              if (!waitToJoin) {
                log('Bot reaching ready state, notifying server...');
                process.send({ type: 'ready' });
                waitToJoin = true;
              }

              if (canJoin) {
                setValue(config.name)
                // xd setValue(choice(names))

                controller.press("Enter")
                log('Play button clicked! Joining game as:', config.name)
                break
              } else {
                // Periodically log that we are still waiting
                if (Math.random() < 0.05) {
                  log('Waiting for "can_join" signal from server...');
                }
                i--; // Keep waiting at case 1
                break
              }
            }
          }
          if (lastHash !== global.location.hash) {
            log('hash =', global.location.hash)
            lastHash = global.location.hash
          }
          let at = timeouts[i]
          if (at) {
            delete timeouts[i]
            for (let i = 0, l = at.length; i < l; i++) {
              at[i]()
            }
          }
          position[2]--
          if (position[2] < 0) {
            controller.press('KeyL')
          }
          if (hasJoined) {
            hasJoined = false;

            if (isUpgrading) return;

            firstJoin = false;

            // Ensure target.tank is valid
            if (!target.tank || !tanks[target.tank]) {
              target.tank = 'basic';
            }

            // If the tank uses coordinate clicks, delay slightly to ensure UI is ready
            const path = tanks[target.tank].path;
            if (Array.isArray(path) && path.some(key => Array.isArray(key))) {
              setTimeout(onJoin, 500); // Reduced from 1200ms to 500ms
            } else {
              onJoin();
            }
          }
          if (inGame && config.type === 'follow') {
            // if (i % 35 === 34) {
            //   controller.chat("7".repeat(randint(1, 60)))
            // }

            // if (Math.random() < 0.002) {
            //   controller.chat("#PRAISETHEPRIMORDIALNOOB");
            // }

            let moveTarget = { x: 0, y: 0 };
            let aimTarget = { x: 0, y: 0 };
            let valid = false;

            if (target.manualMode) {
              moveTarget.x = aimTarget.x = target.manualX;
              moveTarget.y = aimTarget.y = target.manualY;
              valid = true;
            } else if (target.x !== undefined && target.x !== null) {
              // Base targets
              moveTarget.x = target.x;
              moveTarget.y = target.y;
              aimTarget.x = target.x + target.mouseX;
              aimTarget.y = target.y + target.mouseY;

              if (target.followMouse) {
                // If following mouse, movement target matches aiming target
                moveTarget.x = aimTarget.x;
                moveTarget.y = aimTarget.y;
              }
              valid = true;
            }

            if (valid) {
              if (position[2] > 0) {
                pathfind(moveTarget.x, moveTarget.y);
              } else {
                stopMoving(); // Stay still if we can't see our own coordinates
              }

              let angle;
              if (target.shift) {
                angle = Math.atan2(target.mouseY, target.mouseX);
              } else {
                angle = getDir(
                  position[0],
                  position[1],
                  aimTarget.x,
                  aimTarget.y
                );
              }

              controller.x = (innerWidth / 2) + Math.cos(angle) * 200;
              controller.y = (innerHeight / 2) + Math.sin(angle) * 200;
              trigger.mousemove(controller.x, controller.y);
            }

            /*if (Math.random() < 0.01) {
              let dist = 20;
              let randomAngle = 2 * Math.PI * Math.random();
              trigger.mousemove(
                controller.x = 250 + dist * Math.cos(randomAngle),
                controller.y = 250 + dist * Math.sin(randomAngle)
              );
            }*/

            controller[target.mouseDown && !target.feed ? "mouseDown" : "mouseUp"]()
            controller[target.rMouseDown && !target.feed ? "mouseDown" : "mouseUp"](2)

            if (target.autofire !== lastAutofire) {
              controller.press("KeyE");
              lastAutofire = target.autofire;
            }
            if (target.autospin !== lastAutospin) {
              controller.press("KeyC");
              lastAutospin = target.autospin;
            }

            // Chat Spam Logic
            if (target.chatSpam && Date.now() - lastChatAt > 3000) {
              lastChatAt = Date.now();
              controller.chat(target.chatSpam);
            }
          }
          if (died) {
            inGame = false
            //log('Death detected. Clearing render cache...')
            stopMoving();
            block = true
            ignore = true
            let index = 0
            let interval = setInterval(function () {
              if (destroyed) {
                clearInterval(interval)
                return
              }
              for (let i = 0; i < 30; i++) {
                let r = 100 + 900 * Math.random(), q = 100 + 900 * Math.random(), p = 0.5 + Math.random()
                innerWidth = global.window.innerWidth = r
                innerHeight = global.window.innerHeight = q
                devicePixelRatio = global.window.devicePixelRatio = p
                global.performance.time += 50000
                a()
              }
              index++
              if (index >= 2) {
                clearInterval(interval)
                end()
              }
            }, 30), end = function () {
              innerWidth = global.window.innerWidth = 500
              innerHeight = global.window.innerHeight = 500
              devicePixelRatio = global.window.devicePixelRatio = 1
              if (config.autoRespawn) {
                //log('Render cache cleared, respawning...')
                died2 = true;
                const interv = setInterval(() => {
                  controller.press('Enter')
                  controller.press('Escape')
                  if (!died2) {
                    clearInterval(interv);
                  }
                }, 1000);
              } else {
                //log('Render cache cleared.')
              }
              block = false
              ignore = false
              global.performance.time += 50000
              a()
              if (statusRecieved) { i++ }
            }
            died = false
            return
          }
          global.performance.time += (i < 2 ? 50000 : 9000)
          a()
          if (statusRecieved) {
            i++
          }
        }
      }, 50)
      global.localStorage = global.window.localStorage = {
        setItem: function (i, v) {
          this[i] = v
        },
        getItem: function (i) {
          return this[i]
        }
      }

      global.fetch = global.window.fetch = new Proxy(realFetch, {
        apply: function (a, b, args) {
          let url = args[0];

          if (url.startsWith('./')) {
            url = args[0] = 'https://arras.io' + url.slice(1)
          } else if (url.startsWith('/')) {
            url = args[0] = 'https://arras.io' + url
          }

          let options = args[1] || {};
          if (proxyAgent) {
            options.agent = proxyAgent;
          }
          args[1] = options;

          if (url.includes('app.wasm')) { return wasm() }

          if (url.endsWith('/clientCount')) {
            // receiving clientCount instantly to improve network
            return new Promise(resolve => resolve({
              json: async () => {
                return { "ok": true, "clients": 7777 }
              }
            }));
          }

          const fetchPromise = Reflect.apply(a, b, args);

          if (url.endsWith('/status')) {
            const STATUS_CACHE = `${CACHE_DIR}/status_${config.hash.replace('#', '')}.json`;

            // Try to use cached status first to avoid rate limits
            if (fs.existsSync(STATUS_CACHE)) {
              const stats = fs.statSync(STATUS_CACHE);
              // Cache valid for 30 seconds
              if (Date.now() - stats.mtimeMs < 30000) {
                try {
                  const cachedData = JSON.parse(fs.readFileSync(STATUS_CACHE, 'utf8'));
                  log('Using cached status for', url);
                  statusRecieved = true;
                  status = Object.values(cachedData.status);
                  return new Promise(resolve => resolve({
                    ok: true,
                    headers: new Map([['content-type', 'application/json']]),
                    json: async () => cachedData,
                    clone: function () { return this; }
                  }));
                } catch (e) {
                  // Fall through to fetch if cache is corrupt
                }
              }
            }

            return fetchPromise.then(async response => {
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                const cloned = response.clone();
                cloned.json().then(i => {
                  if (i.ok && i.status) {
                    statusRecieved = true;
                    status = Object.values(i.status);
                    // Write to cache for other bots
                    try { fs.writeFileSync(STATUS_CACHE, JSON.stringify(i)); } catch (e) {}
                  } else {
                    statusRecieved = true;
                  }
                }).catch(() => {
                  statusRecieved = true;
                });
                return response;
              } else {
                log(`Warning: /status returned non-JSON content. Using fallback.`);
                statusRecieved = true;
                // Try to return cache even if expired if we get a rate limit
                if (fs.existsSync(STATUS_CACHE)) {
                   try {
                     const cachedData = JSON.parse(fs.readFileSync(STATUS_CACHE, 'utf8'));
                     return {
                       ok: true,
                       json: async () => cachedData,
                       clone: function () { return this; }
                     };
                   } catch(e) {}
                }
                return {
                  ok: true,
                  json: async () => ({ ok: false, status: {} }),
                  clone: function () { return this; }
                };
              }
            }).catch(err => {
              log(`Failed to fetch status (${url}):`, err);
              if (fs.existsSync(STATUS_CACHE)) {
                try {
                  const cachedData = JSON.parse(fs.readFileSync(STATUS_CACHE, 'utf8'));
                  statusRecieved = true;
                  return {
                    ok: true,
                    json: async () => cachedData,
                    clone: function () { return this; }
                  };
                } catch(e) {}
             }
              return {
                ok: false,
                json: async () => ({ ok: false }),
                clone: function () { return this; }
              };
            });
          }

          return fetchPromise;
        }
      })

      global.navigator = global.window.navigator = {}
      let gameSocket = false, host = false

      global.WebSocket = global.window.WebSocket = new Proxy(WebSocket, {
        construct: function (a, b, c) {
          const fullUrl = b[0];
          host = new url.URL(fullUrl).host

          let h = {
            headers: {
              'user-agent': `Mozilla/5.0 (X11; CrOS x86_64 14588.123.0) AppleWebKit/${(100 + 900 * Math.random()).toFixed(2)} (KHTML, like Gecko) Chrome 101.0.0.0 Safari ${(100 + 900 * Math.random()).toFixed(2)}`,
              'accept-encoding': 'gzip, deflate, br',
              'accept-language': 'en-US,en;q=0.9',
              'cache-control': 'no-cache',
              'connection': 'Upgrade',
              'origin': 'https://arras.io',
              'pragma': 'no-cache',
              'upgrade': 'websocket',
              'Sec-WebSocket-Protocol': b[1] ? b[1].join(', ') : '',
              'host': host
            },
            followRedirects: true,
            origin: 'https://arras.io',
          }

          if (proxyAgent) { h.agent = proxyAgent; }

          const newArgs = [fullUrl, b[1], h];
          const d = Reflect.construct(a, newArgs, c)

          d.addEventListener('open', function () {
            log('WebSocket open.')
            connected = true
          })

          d.addEventListener('close', function (e) {
            if (gameSocket === d) { gameSocket = false; }
            log(`WebSocket closed (code: ${e.code}, reason: ${e.reason || 'none'}).`);
            if (!closed && config.autoRespawn) {
              log('Server-side close detected, triggering reconnect...');
              triggerReconnect();
            }
          })

          let closed = false
          d.addEventListener('message', function (e) { let u = Array.from(new Uint8Array(e.data)) })
          d.send = new Proxy(d.send, { apply: function (f, g, h) { return Reflect.apply(f, g, h) } })
          d.close = new Proxy(d.close, {
            apply: function (f, g, h) {
              if (closed) { return }
              log('WebSocket closed by client.')
              closed = true
              Reflect.apply(f, g, h)
              if (config.autoRespawn) {
                triggerReconnect();
              }
            }
          })
          d.addEventListener = new Proxy(d.addEventListener, { apply: function (a, b, c) { return Reflect.apply(a, b, c) } })
          gameSocket = d
          return d
        }
      })
      eval(x)
      let ca = oa || {}
      ca.window = global.window
      ca.destroy = destroy
      ca.controller = controller
      ca.trigger = trigger
      return Object.assign(ca, internalBotInterface);
    }

    let arras = {
      then: (cb) => {
        then(() => cb(arras));
      },
      create: function (o) {
        if (!ready) {
          log("Warning: 'create' called before arras was ready. It will be queued.");
        }
        o.id = o.id !== undefined ? o.id : id++;
        return run(script, o)
      }
    }
    if (options.start) {
      options.start(arras)
    }
    return arras
  })()


  process.on('message', (message) => {
    if (message.type === 'start') {
      const config = message.config;
      options.token = config.token;
      options.loadFromCache = config.loadFromCache;
      options.cache = config.cache;
      options.arrasCache = config.arrasCache;

      arras.then(function () {
        currentBotInterface = arras.create(config);
      });
    } else if (message.type === 'can_join') {
      if (currentBotInterface.triggerJoin) {
        currentBotInterface.triggerJoin();
      }
    } else if (message.type === 'pause') {
      isPaused = message.paused;
      if (currentBotInterface.log) {
        currentBotInterface.log(`Bot state is now: ${isPaused ? 'PAUSED' : 'RESUMED'}`);
      }
    } else if (message.type === 'key_command') {
      const key = message.key;
      if (currentBotInterface.log) currentBotInterface.log(`CMD Key: ${key}`);

      // Find trigger functions in scope? No, they are inside run()...
      // We need 'run' scope to access 'trigger'.
      // Actually, trigger is not exposed globally. 
      // Wait, the message listener is currently OUTSIDE 'run'.
      // We need a way to pass this down.
      // currentBotInterface is the object returned by arras.create(config).
      // Does it expose trigger? No.

      // FIX: Reroute this message to the internal listeners if possible.
      // Or store a global reference to the trigger?
      // Since we are in the worker context, let's look at where 'run' is called.
      // 'arras.create(config)' calls 'run(app, config, ...)'
      // 'run' defines 'trigger' and 'listeners'.

      // We can expose an event handler on currentBotInterface.
      if (currentBotInterface.simulateKey) {
        currentBotInterface.simulateKey(key);
      }
    } else if (message.type == 'position') {
      target.x = message.x;
      target.y = message.y;

      target.mouseX = message.mouseX;
      target.mouseY = message.mouseY;

      target.mouseDown = message.mouseDown;
      target.rMouseDown = message.rMouseDown;

      target.followMouse = message.mouse;
      target.feed = message.feeding;

      target.shift = message.shift;

      target.autofire = message.autofire;
      target.autospin = message.autospin;

      target.manualMode = message.manualMode;
      target.manualX = message.manualX;
      target.manualY = message.manualY;
    } else if (message.type == 'tankselect') {
      target.tank = message.tank;
    } else if (message.type == 'chat') {
      target.chatSpam = message.spam ? message.message : "";
      if (message.message && !message.spam) {
        if (inGame && currentBotInterface.controller && currentBotInterface.controller.chat) {
          currentBotInterface.controller.chat(message.message);
        }
      }
    } else if (message.type == 'destroy') {
      console.log("why devastatee");
      devastate();
      process.exit();
    }
  });

  // setInterval(() => {
  //   const data = fs.readFileSync("active", "utf-8");

  //   if (data == "closed") {
  //     devastate();
  //     process.exit();
  //   }
  // }, 2000);
})();