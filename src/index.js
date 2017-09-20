/**
 * @Author: gyx
 * @Date: 2017-09-19 16:42
 * @Last Modified by: gyx
 * @Last Modified time:  2017-09-19 16:42
 */

'use strict';

var fs = require('fs');
var path = require('path');
var fontSpider = require('font-spider');
var exec = require('child_process').exec

var filepath = path.resolve();
var charList = [];
var tamplateHTML = '';

// 读取目录
function readFileList(readUrl, parentName) {
  var files = fs.readdirSync(readUrl, parentName);
  files.forEach(function(filename) {
    var stats = fs.statSync(path.join(readUrl, filename));
    if (stats.isFile()) {
      if (['.vue'].indexOf(path.extname(filename)) > -1) {
        readFile(path.join(readUrl, filename));
      }
    } else if (stats.isDirectory()) {
      readFileList(path.join(readUrl, filename), parentName + '/' + filename);
    }
  });
}

// 读取文件内容
function readFile(url) {
  var files = fs.readFileSync(url, 'utf-8');
  if (files.match(/[\u4e00-\u9fa5]/g)) {
    charList = unique(charList.concat(files.match(/[\u4e00-\u9fa5]/g)));
    // writeTamplate();
  }
}

// 去重
function unique(array) {
  var back = [];
  for (var i = 0; i < array.length; i++) {
    if (back.indexOf(array[i]) < 0) {
      back.push(array[i]);
    }
  }
  return back;
}

// 读取HTML模板
function readTamplate() {
  var tamplateUrl = path.resolve(path.relative('','../src/tamplate.html'));
  var fontFileUrl = path.resolve(path.relative('','fsbuild'));
  var fontFileName = '';
  var fontFiles = fs.readdirSync(fontFileUrl);
  var tamplateFiles = fs.readFileSync(tamplateUrl, 'utf-8');
  fontFiles.forEach(function(filename) {
    var stats = fs.statSync(path.join(fontFileUrl, filename));
    if (stats.isFile()) {
      if (['.woff', '.ttf', '.eot', '.svg'].indexOf(path.extname(filename)) > -1) {
        fontFileName = filename.split('.')[0];
      }
    }
  });
  tamplateHTML = tamplateFiles.replace(/\<\%.*\%\>/g, fontFileName);
}

// 写入文件内容
function writeTamplate() {
  var str = '<body>' + charList.join().replace(/\,/g, '') + '</body>';
  var html = tamplateHTML.replace(/\<body\>.*\<\/body\>/g, str);
  var htmlFileUrl = path.resolve(path.relative('','./fsbuild/index.html'));
  fs.writeFile(htmlFileUrl, html, 'utf-8', function(err, files) {
    if (err) { console.log(err); return; }
    exec('font-spider ' + htmlFileUrl, function(err, stdout, stderr) {
      if (err) { console.log(err); return; }
      console.log('font spider running success!');
    });
  });
}

readFileList(filepath, '');
readTamplate();
writeTamplate();
