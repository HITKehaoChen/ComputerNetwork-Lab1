/* eslint-disable no-console */
import http, { IncomingMessage, ServerResponse, IncomingHttpHeaders, RequestOptions, ClientRequest } from 'http';
import urlUtil, { UrlWithStringQuery } from 'url';
import net from 'net';

const listenPort = 3000;
const server = http.createServer();

const request = (req: IncomingMessage, res: ServerResponse) => {
  const { url, method } = req;

  const { headers }: { headers: IncomingHttpHeaders } = req;
  const info = urlUtil.parse(url!);
  const ops: RequestOptions = {
    hostname: info.hostname,
    method,
    port: info.port || 80,
    path: info.path,
  };

  console.log('[test]:', 'ops', ops);
  const proxy: ClientRequest = http
    .request(ops, (resp: http.IncomingMessage) => {
      console.log('[test]:', resp.statusCode);
      res.write('Proxy: OwlStudio')
      resp.pipe(res);
    })
    .on('error', e => {
      res.end();
    });

  req.pipe(proxy);
};

export const connect = (req: IncomingMessage, res: ServerResponse): void => {
  console.log('[test]:', 'connect', req.headers);
  const u: UrlWithStringQuery = urlUtil.parse(`http://${req.url!}`);
  console.log('[test]:', 'u', u);
  const proxy = net
    .connect(+u.port!, u.hostname, () => {
      res.write(['HTTP/1.1 200 Connection Established', 'Proxy-HTTPS: OwlStudio'].join('\r\n'));
      res.write('\r\n\r\n');
      proxy.pipe(res);
    })
    .on('error', e => {
      res.end();
    });
  res.on('error', err => {});
  res.pipe(proxy);
};

server.on('request', request).on('connect', connect);
server.listen(listenPort, () => {
  console.log('[test]:', `Server listened on port:${listenPort}`);
});
