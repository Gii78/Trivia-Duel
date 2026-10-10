import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { handle } from './engine.mjs';
const port=Number(process.env.PORT||8080);
const addresses=Object.values(networkInterfaces()).flat().filter(n=>n&&n.family==='IPv4'&&!n.internal);
const phoneOrigin=addresses[0]?`http://${addresses[0].address}:${port}`:null;
const server=createServer(async(req,res)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/health'&&req.method==='GET'){res.setHeader('Content-Type','application/json');res.end('{"ok":true}');return;}
  const origin=req.headers.origin;
  if(origin&&new URL(origin).host!==req.headers.host){res.writeHead(403);res.end('Cross-origin requests are not allowed.');return;}
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8').replace('__PHONE_ORIGIN__',JSON.stringify(phoneOrigin));
  if(url.pathname==='/'&&req.method==='GET'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);return;}
  if(!url.pathname.startsWith('/api/')||req.method!=='POST'){res.writeHead(404);res.end('Not found');return;}
  let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>4096)throw Error('Request too large.');}
  const body=JSON.parse(raw||'{}');const result=handle(url.pathname.slice(5),body);
  res.setHeader('Content-Type','application/json');res.end(JSON.stringify(result));
 }catch(e){res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:e.message}));}
});
server.requestTimeout=15000;
server.headersTimeout=10000;
server.listen(port,'0.0.0.0',()=>{
 console.log(`Trivia Duel is ready: http://localhost:${port}`);
 for(const list of Object.values(networkInterfaces()))for(const n of list||[])if(n.family==='IPv4'&&!n.internal)console.log(`Phones on the same Wi-Fi: http://${n.address}:${port}`);
 console.log('Keep this window open. Press Ctrl+C to stop.');
});
