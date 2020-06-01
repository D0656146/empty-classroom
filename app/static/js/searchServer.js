var http = require('http')

var server = http.createServer(function(req, res){
    console.log(req)
}).listen(8090)