const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const root = path.resolve(__dirname, '..');
const files = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', '.expo', '.expo-home', '.npm-cache', 'flutter-lib-reference'].includes(name)) walk(p);
    } else if (/\.(js|jsx)$/.test(name)) {
      files.push(p);
    }
  }
}
walk(root);
for (const file of files) {
  babel.transformFileSync(file, {
    babelrc: false,
    configFile: path.join(root, 'babel.config.js'),
    caller: { name: 'syntax-check', supportsStaticESM: true, supportsDynamicImport: true }
  });
}
console.log('Checked ' + files.length + ' JavaScript files.');
