#!/usr/bin/env node --harmony
'use strict'

//
// TODO:
// - Fix js-bson warning in save-to-mongo (upgrade npm modules, create PR?)
//

const SaveToMongo = require('save-to-mongo');
const JSONStream = require('JSONStream');
const program = require('commander');
const packageJson = require('./package.json');

//
// Command line interface
//

program
	.version(packageJson.version)
	.option('-d, --database <database>', 'mongo database name')
	.option('-c, --collection <collection>', 'mongo collection name')
	.option('-m, --mode <mode>', 'unordered or ordered')
	.on('--help', function () {
		console.log('  Examples:');
		console.log('');
		console.log('    $ cat input.json | json2mongo -d test -c testCollection -m unordered');
		console.log('');
	})
	.parse(process.argv);

const db = program.db || 'test';
const collection = program.collection || 'testCollection';
const mode = program.mode || 'unordered';
//
// SaveToMongo
//

const saveToMongo = SaveToMongo({
	uri: 'mongodb://127.0.0.1:27017/'+db,
	collection: collection,
	bulk: {
		mode: mode
	}
});

//
// Glueing streams together
//

process.stdin
	.pipe(JSONStream.parse('*'))
  .pipe(saveToMongo)
  .on('execute-error', function(err) {
    console.log(err);
  })
  .on('done', function() {
    console.log('All done!');
    process.exit(0);
  });
