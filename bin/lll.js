#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const uuid = require('node-uuid');
const inquirer = require('inquirer');
const moment = require('moment');
const matter = require('gray-matter');
const meow = require('meow');
const cli = meow(`
  Usage
    $ lll <command>

  Commands
    init        Create \`lll.config.js\`
    new         Create file

  Examples
    $ lll init
    $ lll new src/pages/index.html
`);

// let config = null;
// try {
//   config = require(path.join(process.cwd(), lll.config.js));
// } catch {
//   console.log('lll.config.js not found');
// }

switch (cli.input[0]) {
  case 'init':
    createConfigFile();
    process.exit(0);
    break;
  case 'new':
    createFile(cli.input[1]).then(() => {
      process.exit(0);
    });
    break;
  default:
    console.log(cli.help);
    process.exit(1);
}

function createConfigFile() {
  const filePath = path.join(process.cwd(), 'lll.config.js');
  const contents = `
module.exports = {
  atomId: '${uuid.v1()}',

  // for develop
  base: 'base directory of source codes',

  // for site
  sitename: 'site name',
  subtitle: 'subtitle of your site',
  siteurl: 'site url',
  author: 'your name',

  // for pages
  // symbol between page name and site name
  // e.g.) page name - site name
  titleToken: ' - ',
  // symbol of use to separate at the beginning
  headToken: '<!-- more -->',
  // symbol of use to separate pages
  pageToken: '<!-- break -->',

  // defaults for cloud
  //cloud: {
  //  path: 'path that would have been placed',
  //  parent: 'default parent name'
  //}
};

`.trim();
  fs.writeFileSync(filePath, contents);
  console.log('lll.config.js was created');
}

function createFile(relative) {
  if (!relative) {
    console.log(`
filePath required
  $ lll new <fileDirPath>
`);
    process.exit(1);
  }
  const filePath = path.join(process.cwd(), relative);
  return new Promise(resolve => {
    inquire().then((filename, answers) => {
      const data = Object.assign({}, {
        uuid: uuid.v1(),
        eyecatching: ''
      }, answers);
      const contents = matter.stringify('', data);
      fs.writeFileSync(filePath, contents);
      console.log(`${filename} was created`);
      resolve();
    });
  });
}

function inquire() {
  return new Promise(resolve => {
    inquirer.prompt([
      {
        name: 'filename',
        message: '* filename',
        default: '',
        validate(input) {
          if (input === '') {
            return 'filename was reqired';
          }
          return true;
        }
      },
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
    ]).then(answers => {
      const filename = answers.filename;
      answers = _.omit(answers, 'filename');
      resolve(filename, answers);
    });
  });
}
