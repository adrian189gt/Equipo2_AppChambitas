#!/usr/bin/env node
/**
 * Arranca Expo forzando la IP del WiFi.
 *
 * Por que existe: esta maquina tiene varias tarjetas de red (VirtualBox,
 * Hyper-V/WSL) y Expo a veces escoge la equivocada o cae a 127.0.0.1.
 * Cuando eso pasa, el celular intenta bajar la app de si mismo y Expo Go
 * muestra "Something went wrong".
 *
 * Detecta la IP en cada arranque, asi que sigue sirviendo aunque el router
 * te asigne otra.
 */
const os = require('os');
const { spawn } = require('child_process');

// Redes virtuales que NO sirven para que el celular se conecte.
const VIRTUALES = /virtualbox|vethernet|vmware|hyper-v|loopback|docker|wsl/i;

function ipDelWifi() {
  const interfaces = os.networkInterfaces();
  const candidatas = [];

  for (const [nombre, direcciones] of Object.entries(interfaces)) {
    if (VIRTUALES.test(nombre)) continue;
    for (const d of direcciones || []) {
      if (d.family !== 'IPv4' || d.internal) continue;
      // VirtualBox usa 192.168.56.x por defecto.
      if (d.address.startsWith('192.168.56.')) continue;
      candidatas.push({ nombre, ip: d.address });
    }
  }

  if (!candidatas.length) return null;
  // Preferimos la tarjeta que se llame Wi-Fi; si no, la primera real.
  const wifi = candidatas.find((c) => /wi[-\s]?fi|wireless|wlan/i.test(c.nombre));
  return wifi || candidatas[0];
}

const elegida = ipDelWifi();

if (!elegida) {
  console.error('\nNo encontre una red utilizable.');
  console.error('Conectate al WiFi, o usa el tunel:  npm run tunel\n');
  process.exit(1);
}

console.log(`\nUsando ${elegida.nombre} -> ${elegida.ip}`);
console.log('Tu celular debe estar en esta MISMA red WiFi.');
console.log('Si aun falla, es que el WiFi aisla dispositivos: usa  npm run tunel\n');

const hijo = spawn(
  'npx',
  ['expo', 'start', '--host', 'lan', ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    // shell: true es obligatorio en Windows: desde Node 18.20 spawn se niega
    // a ejecutar archivos .cmd (como npx.cmd) directamente y tira EINVAL.
    shell: true,
    env: { ...process.env, REACT_NATIVE_PACKAGER_HOSTNAME: elegida.ip },
  },
);

hijo.on('exit', (codigo) => process.exit(codigo ?? 0));
