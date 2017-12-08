const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let fs = require('fs')
let path = require('path')
const execSync = require('child_process').execSync;
const chalk = require('chalk');
const log = console.log;
const boxen = require('boxen')
let command = process.argv[3]
let shell = require('shelljs')

let str = `webpack
gulp
`

let noCommand = () => {
  log(chalk.cyanBright('\n\nRemove common files and dependencies'))
  log(chalk.cyanBright('\n\nTo remove run: "enzo remove <name>"'))
  log()
  log(boxen(str, { padding: 1, borderColor: 'yellow' }));
  log()
  log()
}


let shouldUseYarn = () => {
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

let removeDependencies = (packages) => {
  let yarn = shouldUseYarn()
  if (yarn) {
    shell.exec(`yarn remove ${packages}`)
  } else {
    shell.exec(`npm uninstall ${packages}`)
  }
}

let removeGulp = () => {
  removeDependencies('babel-core babel-preset-env babelify gulp gulp-uglify gulp-rename browserify gulp-htmlmin gulp-clean-css gulp-tap gulp-buffer del run-sequence envify bundle-collapser gulp-plumber')
  removeScript('gulp')
  removeScript('gulp-prod')
  fs.unlink('./gulpfile.js', (err) => {
    if (err) throw err;
    log('successfully deleted gulpfile');
  });
}

let removeWebpack = () => {
  removeDependencies('webpack babel-loader css-loader babel-core babel-preset-env babel-preset-react style-loader webpack-merge uglifyjs-webpack-plugin sass-loader node-sass extract-text-webpack-plugin clean-webpack-plugin')
  removeScript('webpack')
  removeScript('webpack-prod')
  fs.unlink('./webpack.config.js', (err) => {
    if (err) throw err;
    log('successfully deleted webpack config');
  });
  fs.unlink('./webpack.prod.js', (err) => {
    if (err) throw err;
    log('successfully deleted webpack production config');
  });
}


let remove = () => {
  process.stdout.write('\033c')
  switch (command) {
    case 'webpack':
      removeWebpack()
      break;
    case 'gulp':
      removeGulp()
      break
    default:
      noCommand()
      break;
  }
  process.exit()
}

let removeScript = (command) => {
  let buffer = fs.readFileSync(`./package.json`)
  let json = JSON.parse(buffer)
  delete json.scripts[command]
  let newPackage = JSON.stringify(json, null, 2)
  fs.writeFileSync(`./package.json`, newPackage)
}

module.exports = remove 