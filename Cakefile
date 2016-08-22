# == Tasks ========================
task "deps", "Install dependencies for Cakefile", ->
  installDeps -> complete()
task "docs", "Generate Documentation", ->
  generateDocs -> complete()
task "build", "Produce a minified javascript version for production use", ->
  minify -> complete()
task "test", "Test javascript library", (flags) ->
  test flags, -> complete()
task "all", "Produce documentation and minify javascript for production use", ->
  installDeps ->
    generateDocs ->
      minify ->
        complete()
option '', '--key [key]', 'API Key to use with unit tests'
option '', '--app [app]', 'Application ID to use with unit tests'

# ==================================

exec = require('child_process').exec
fs = require 'fs'

installDeps = (next) ->
  exec 'npm install qunit jsdoc-toolkit uglify-js@1.x.x', (err, out) ->
    console.log 'Installed dependencies:'
    console.log out
    next()

generateDocs = (next) ->
  exec "node app/run.js -D=\"generatedBy:CloudMine Inc.\" -D=\"copyright:#{new Date().getFullYear()} CloudMine, Inc. All Rights Reserved.\" -d=\"../../docs\" -t=\"../../docs/template\" ../../js/cloudmine.js", {cwd: 'node_modules/jsdoc-toolkit'}, (err, out) ->
    if err
      console.log "Failed to generate docs"
      console.log err
    else
      console.log "Docs generated"
    console.log out
    next()


minify = (next) ->
  version = require('./js/cloudmine').WebService.VERSION
  parser = require('uglify-js').parser
  ugly = require('uglify-js').uglify

  fs.readFile "js/cloudmine.js", 'utf8', (err, data) ->
    fs.writeFile "js/cloudmine-#{version}.js", data, 'utf8', (err)->
      compressed = ugly.gen_code ugly.ast_squeeze ugly.ast_mangle parser.parse data
      fs.writeFile "js/cloudmine-#{version}.min.js", compressed, 'utf8', next

test = (info, next) ->
  if info.app? and ihostnfo.key? and info.host?
    process.env.CLOUDMINE_APPID = info.app
    process.env.CLOUDMINE_APIKEY = info.key
    process.env.CLOUDMINE_HOST = info.host

    qunit = require 'qunit'
    config =
      deps: [ "./tests/init.js", "./tests/util.js", "./tests/config.js" ]
      code: {path: "./js/cloudmine.js", namespace: "cloudmine"}
      tests: "./tests/tests.js"
    qunit.run config, next
  else
    console.log "Cannot run tests without specifying an application id and api key."
    console.log "Please specify an application id via --app flag and api key via --key flag."
    console.log "e.g. cake --app 793dcffc4f67f94c36a8f20628d3d31b --key 8b05c2e5d0e88b471c5aae8ba6cf9f7b test"
    next()

complete = ->
  cloudmine = require('./js/cloudmine');
  console.log "\nCloudMine Javascript Library v#{cloudmine.WebService.VERSION}"
  console.log "For more information on how to use this library, go to: http://cloudmine.io/docs/#/javascript"

  process.exit 0
