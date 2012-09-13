# == Tasks ========================
task "deps", "Install dependencies for Cakefile", -> installDeps -> complete()
task "docs", "Generate Documentation", -> generateDocs -> complete()

task "build", "Produce a minified javascript version for production use", -> minify -> complete()

task "all", "Produce documentation and minify javascript for production use", -> installDeps -> generateDocs -> minify -> complete()

# ==================================

exec = require('child_process').exec
fs = require 'fs'

installDeps = (next) ->
  exec 'npm install jsdoc-toolkit uglify-js', (err, out) ->
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

complete = ->
  process.exit 0
