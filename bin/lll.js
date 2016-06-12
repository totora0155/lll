#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const uuid = require('node-uuid');
const inquirer = require('inquirer');
const moment = require('moment');
const meow = require('meow');
const matter = require('gray-matter');
const cli = meow(`
  Usage
    $ lll <command>

  Commands
    new         Create file

  Examples
    $ lll new src/pages/index.html
`);

// let config = null;
// try {
//   config = require(path.join(process.cwd(), lll.config.js));
// } catch {
//   console.log('lll.config.js not found');
// }

switch (cli.input[0]) {
  case 'new':
    createFile(cli.input[1]).then(() => {
      process.exit(0);
    });
    break;
  default:
    console.log(cli.help);
    process.exit(1);
}

function createFile(relative) {
  if (!relative) {
    console.log(`
filePath required
  $ lll new <filePath>
`);
    process.exit(1);
  }
  const filePath = path.join(process.cwd(), relative);
  console.log(filePath);
  return new Promise(resolve => {
    inquire().then(answers => {
      const data = Object.assign({}, {uuid: uuid.v1()}, answers);
      const contents = matter.stringify('', data);
      fs.writeFileSync(filePath, contents);
      resolve();
    });
  });
}

function inquire() {
  return new Promise(resolve => {
    inquirer.prompt([
      {
        name: 'parent',
        message: 'parent',
        default: ''
      },
      {
        name: 'title',
        message: 'title',
        default: ''
      },
      {
        name: 'summary',
        message: 'summary',
        default: ''
      },
      {
        name: 'published',
        message: 'published',
        default: moment(new Date()).format()
      },
      {
        name: 'updated',
        message: 'updated',
        default: moment(new Date()).format()
      }
    ]).then(answers => resolve(answers));
  });
}
