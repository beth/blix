const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let fs = require('fs')
let path = require('path')
let shell = require('shelljs')
const execSync = require('child_process').execSync;
const chalk = require('chalk');
const log = console.log;
const boxen = require('boxen')

let shouldUseYarn = () => {
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

let install = (packages) => {
  let yarn = shouldUseYarn()
  if (yarn) {
    shell.exec(`yarn add ${packages}`)
  } else {
    shell.exec(`npm install --save ${packages}`)
  }
}

let installDevDependencies = (packages) => {
  let yarn = shouldUseYarn()
  if (yarn) {
    shell.exec(`yarn add ${packages} --dev`)
  } else {
    shell.exec(`npm install --save-dev ${packages}`)
  }
}


let bundler = () => {
  rl.question('Webpack or Gulp? (W/G) ', (ans) => {
    ans = ans.toLowerCase()
    if (ans === 'w') {
      installWebpack()
    } else if (ans === 'g') {
      installGulp()
    } else {
      log(`You didn't make a selection. Please try again.`)
      bundler()
    }
  })
}

let installWebpack = () => {
  // need to ask questions like where is the index.js file
  installDevDependencies('webpack babel-loader css-loader babel-core babel-preset-env babel-preset-react style-loader webpack-merge uglifyjs-webpack-plugin')
  addScript('webpack', 'webpack --watch')
  addScript('prod', 'webpack --config webpack.prod.js')
  let webpack = fs.readFileSync(path.resolve(__dirname, './files/webpack.config.js'), 'utf8')
  let webpackProd = fs.readFileSync(path.resolve(__dirname, './files/webpack.prod.js'), 'utf8')
  fs.writeFile('./webpack.config.js', webpack, (err) => {
    if (err) throw err 
    log('Created webpack.config.js file')
  })
  fs.writeFile('./webpack.prod.js', webpackProd, (err) => {
    if (err) throw err 
    log('Created webpack.prod.js file')
  })
  rl.close()
}

let installGulp = () => {
  // need to ask what directory to watch, if they want to be setup for react?, and where to direct the output 
  installDevDependencies('babel-core babel-preset-env babelify gulp gulp-uglify gulp-rename browserify gulp-htmlmin gulp-clean-css gulp-tap gulp-buffer del run-sequence envify bundle-collapser gulp-plumber')
  rl.close()
}

let addScript = (command, script) => {
  let buffer = fs.readFileSync(`./${name}/package.json`)
  let json = JSON.parse(buffer)
  json.scripts[command] = script
  let newPackage = JSON.stringify(json, null, 2)
  fs.writeFileSync(`./${name}/package.json`, newPackage)
}

module.exports = bundler