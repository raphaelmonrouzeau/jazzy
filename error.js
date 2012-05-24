function stringify(data)
{
    if (data === undefined) {
        return "<undefined>";
    } else {
        return '"'+data.toString()+'"';
    }
}

function write_field(response, name, value)
{
    var len = 20 - name.length,
        i   = 0;

    for (i; i<len; i++) {
        response.write(" ");
    }
    response.write(""+name+": "+stringify(value)+"\n");
}

function error404(request, response)
{
        response.writeHead(404, {'Content-Type': 'text/plain'});
        //write_field(response, "method",           request.method);
        //write_field(response, "url",              request.url);
        //write_field(response, "pathname",         requestUrl.pathname);
        //write_field(response, "query",            requestUrl.query);
        //write_field(response, "ondrain",          request.ondrain);
        //write_field(response, "ondata",           request.ondata);
        //write_field(response, "onend",            request.onend);
        //write_field(response, "httpVersionMajor", request.httpVersionMajor);
        //write_field(response, "httpVersionMinor", request.httpVersionMinor);
        //write_field(response, "authorized",       request.authorized);
        response.write("404 File not found");
        response.end("");
}

exports.error404 = error404
