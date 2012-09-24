module.exports = (asset, packager, done) ->
    fs = require 'fs'
    fs.readFile asset.path, 'utf8', (err, body) ->
        return done(err) if err

        asset.mtime = fs.statSync(asset.path).mtime

        eco = require 'eco'
        #options = {}
        #options.filename = asset.path

        #new less.Parser(options).parse body, (err, tree) ->
        #    return done(err) if err

        #    assset.body = tree.toCSS()
        #    done()
        asset.body = "module.exports = #{eco.precompile body}"
        done()
