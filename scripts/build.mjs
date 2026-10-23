// Copies the game into dist/ for hosting. No bundler: the browser loads src/ as ES modules.
import { cpSync, rmSync, mkdirSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist/vendor', { recursive: true });
cpSync('index.html', 'dist/index.html');
cpSync('src', 'dist/src', { recursive: true });
cpSync('node_modules/phaser/dist/phaser.min.js', 'dist/vendor/phaser.min.js');
console.log('Built dist/');
