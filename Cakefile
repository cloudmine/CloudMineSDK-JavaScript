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
  exec 'npm install qunit jsdoc-toolkit uglify-js', (err, out) ->
    console.log 'Installed dependencies:'
    console.log out
    next()

generateDocs = (next) ->
  exec "node app/run.js -D=\"generatedBy:CloudMine LLC\" -D=\"copyright:#{new Date().getFullYear()} CloudMine, LLC. All Rights Reserved.\" -d=\"../../docs\" -t=\"../../docs/template\" ../../js/cloudmine.js", {cwd: 'node_modules/jsdoc-toolkit'}, next


minify = (next) ->
  parser = require('uglify-js').parser
  ugly = require('uglify-js').uglify

  fs.readFile "js/cloudmine.js", 'utf8', (err, data) ->
    compressed = ugly.gen_code ugly.ast_squeeze ugly.ast_mangle parser.parse data
    fs.writeFile "js/cloudmine.min.js", compressed, 'utf8', next

test = (info, next) ->
  if info.app? and info.key?
    process.env.CLOUDMINE_APPID = info.app
    process.env.CLOUDMINE_APIKEY = info.key

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
  console.log "\nCloudMine Javascript Library 0.9.3"
  console.log "For more information on how to use this library, go to: http://cloudmine.me/docs/js"
  process.exit 0
