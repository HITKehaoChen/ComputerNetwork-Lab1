/* eslint-disable no-console */
import http, { IncomingMessage, ServerResponse, IncomingHttpHeaders, RequestOptions, ClientRequest } from 'http';
import urlUtil from 'url';
import net from 'net';

const listenPort = 3000;
const server = http.createServer();

const request = (req: IncomingMessage, res: ServerResponse): void => {
  const { url, method } = req;

  const {  }: { headers: IncomingHttpHeaders } = req;
  const info = urlUtil.parse(url!);
  const ops: RequestOptions = {
    hostname: info.hostname,
    method,
    port: info.port || 80,
    path: info.path,
  };

  const proxy: ClientRequest = http
    .request(ops, (resp: http.IncomingMessage) => {
      console.log('[status]:', resp.statusCode);
      res.write('Proxy: OwlStudio');
      resp.pipe(res);
    })
    .on('error', () => {
      res.end();
    });

  req.pipe(proxy);
};

export const connect = (req: IncomingMessage, res: any, head: any): void => {
  // console.log('[test]:', 'connect', req.headers);
  const { remoteAddress, remotePort } = res;
  console.log(`[${remoteAddress}:${remotePort}] ==>`, req.method, req.url);
  const { port, hostname } = urlUtil.parse(`//${req.url}`, false, true); // extract destination host and port from CONNECT request

  const proxy = net
    .connect(+port!, hostname, () => {
      res.write(['HTTP/1.1 200 Connection Established', 'Proxy-HTTPS: OwlStudio'].join('\r\n'));
      res.write('\r\n\r\n');
      proxy.pipe(res);
    })
    .on('error', () => {
      res.end();
    });
  res.on('error', () => {});
  res.pipe(proxy);
};

server.on('request', request).on('connect', connect);
server.listen(listenPort, () => {
  console.log('[test]:', `Server listened on port:${listenPort}`);
});
