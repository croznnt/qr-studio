import QRCode from 'qrcode';
import { drawLogo, embedLogo } from './logo.js';
const $ = id => document.getElementById(id);
let type = 'url', revision = 0, ready = false, current = '';
let logo = null, logoRevision = 0;
const drafts = {url:'https://example.com',text:'',email:'',wifi:''};
const fields = {
 url:'<label for="content">Đường link muốn chia sẻ</label><textarea id="content" spellcheck="false" placeholder="https://website-cua-ban.com" maxlength="2000"></textarea>',
 text:'<label for="content">Văn bản muốn chia sẻ</label><textarea id="content" placeholder="Viết một lời nhắn, ghi chú hoặc bất cứ điều gì…" maxlength="2000"></textarea>',
 email:'<label for="content">Địa chỉ email</label><input id="content" type="email" placeholder="hello@example.com" maxlength="254"><label class="extra" for="subject">Tiêu đề (tùy chọn)</label><input id="subject" maxlength="200" placeholder="Xin chào!">',
 wifi:'<label for="content">Tên mạng WiFi (SSID)</label><input id="content" placeholder="Tên WiFi của bạn" maxlength="32"><label class="extra" for="password">Mật khẩu</label><input id="password" type="password" autocomplete="off" maxlength="63" placeholder="Mật khẩu WiFi"><label class="extra" for="security">Bảo mật</label><select id="security"><option value="WPA">WPA / WPA2 / WPA3</option><option value="WEP">WEP</option><option value="nopass">Không có mật khẩu</option></select>'
};
function escapeWifi(s){return s.replace(/([\\;,:"])/g,'\\$1');}
function payload(){
 const raw=$('content').value; const value=type==='text'?raw:raw.trim();
 if(!value) throw new Error('Nhập nội dung để tạo mã QR.');
 if(type==='url'){let url;try{url=new URL(/^https?:\/\//i.test(value)?value:'https://'+value);}catch{throw new Error('Vui lòng nhập đường link hợp lệ.');}if(!['https:','http:'].includes(url.protocol)||!url.hostname.includes('.'))throw new Error('Vui lòng nhập đường link HTTP hoặc HTTPS hợp lệ.');return url.href;}
 if(type==='email'){if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))throw new Error('Vui lòng nhập địa chỉ email hợp lệ.');return 'mailto:'+value+($('subject').value?'?subject='+encodeURIComponent($('subject').value):'');}
 if(type==='wifi'){let sec=$('security').value;if(sec!=='nopass'&&!$('password').value)throw new Error('Nhập mật khẩu hoặc chọn mạng không có mật khẩu.');return `WIFI:T:${sec};S:${escapeWifi(value)};P:${sec==='nopass'?'':escapeWifi($('password').value)};;`;}
 return value;
}
function options(){return {errorCorrectionLevel:logo?'H':'M',margin:4,width:Number($('size').value),color:{dark:$('color').value,light:'#ffffff'}};}
function validColor(){const rgb=$('color').value.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return 1.05/(.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]+.05)>=4.5;}
function setReady(value){ready=value;$('png').disabled=$('svg').disabled=!value;$('qr').hidden=!value;$('empty').hidden=value;}
async function render(){const token=++revision;setReady(false);$('count').textContent=$('content').value.length+' ký tự';try{if(!validColor())throw new Error('Chọn màu tối hơn để mã QR dễ quét.');const data=payload();const off=document.createElement('canvas');await QRCode.toCanvas(off,data,options());drawLogo(off,logo);if(token!==revision)return;const canvas=$('qr');canvas.width=off.width;canvas.height=off.height;canvas.getContext('2d').drawImage(off,0,0);current=data;setReady(true);$('status').textContent='Mã QR đã sẵn sàng';}catch(error){if(token!==revision)return;$('status').textContent=error.message.includes('amount of data')?'Nội dung quá dài. Hãy rút ngắn và thử lại.':error.message;}}
function switchType(next){drafts[type]=$('content')?.value??drafts[type];type=next;$('content-fields').innerHTML=fields[type];$('content').value=drafts[type];document.querySelectorAll('[data-type]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.type===type)));$('hint').textContent=type==='url'?'Thêm https:// tự động nếu bạn chưa nhập.':type==='wifi'?'Mật khẩu chỉ được dùng để tạo mã trên thiết bị.':'Hỗ trợ tiếng Việt và emoji.';render();}
document.querySelectorAll('[data-type]').forEach(b=>b.addEventListener('click',()=>switchType(b.dataset.type)));
$('qr-form').addEventListener('input',()=>{ $('color-value').textContent=$('color').value.toUpperCase();render();});
$('qr-form').addEventListener('change',render);
$('qr-form').addEventListener('submit',e=>{e.preventDefault();render();});
document.querySelectorAll('[data-color]').forEach(b=>b.addEventListener('click',()=>{$('color').value=b.dataset.color;$('color-value').textContent=b.dataset.color.toUpperCase();render();}));
$('reset').addEventListener('click',()=>{clearLogo();Object.assign(drafts,{url:'',text:'',email:'',wifi:''});$('color').value='#202c29';$('color-value').textContent='#202C29';$('size').value='1024';switchType('url');$('content').focus();});
async function download(format){if(!ready)return;const data=current,opts=options(),selectedLogo=logo;try{let blob;if(format==='svg'){blob=new Blob([embedLogo(await QRCode.toString(data,{...opts,type:'svg'}),selectedLogo)],{type:'image/svg+xml'});}else{const canvas=document.createElement('canvas');await QRCode.toCanvas(canvas,data,opts);drawLogo(canvas,selectedLogo);blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));}if(!blob)throw new Error();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='qr-studio.'+format;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}catch{$('status').textContent='Chưa tải được ảnh. Vui lòng thử lại.';}}
$('png').addEventListener('click',()=>download('png'));$('svg').addEventListener('click',()=>download('svg'));switchType('url');

function clearLogo(){logoRevision++;logo=null;$('logo-file').value='';$('logo-thumb').hidden=true;$('logo-thumb').removeAttribute('src');$('logo-name').textContent='Chưa chọn ảnh';$('remove-logo').hidden=true;$('logo-status').textContent='';}
$('remove-logo').addEventListener('click',()=>{clearLogo();render();});
$('logo-file').addEventListener('change',async()=>{
 const file=$('logo-file').files[0];if(!file)return;
 const token=++logoRevision;
 try{
  if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Vui lòng chọn ảnh PNG, JPG hoặc WebP.');
  if(file.size>5*1024*1024)throw new Error('Ảnh quá lớn. Vui lòng chọn ảnh tối đa 5 MB.');
  $('logo-status').textContent='Đang đọc ảnh…';
  const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Không đọc được ảnh.'));reader.readAsDataURL(file);});
  const image=new Image();image.src=data;await image.decode();
  if(token!==logoRevision)return;
  // Normalize to a small embedded PNG so both exports are self-contained.
  const canvas=document.createElement('canvas'),scale=Math.min(1,512/Math.max(image.width,image.height));
  canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
  const normalized=canvas.toDataURL('image/png'),raster=new Image();raster.src=normalized;await raster.decode();
  if(token!==logoRevision)return;
  logo={image:raster,data:normalized};$('logo-thumb').src=normalized;$('logo-thumb').hidden=false;$('logo-name').textContent=file.name;$('remove-logo').hidden=false;
  $('logo-status').textContent='Đã thêm logo. Hãy quét thử mã trước khi in hoặc chia sẻ.';render();
 }catch(error){if(token!==logoRevision)return;$('logo-file').value='';$('logo-status').textContent=error.message.startsWith('Vui lòng')||error.message.startsWith('Ảnh quá')?error.message:'Không đọc được ảnh. Hãy thử ảnh khác.';}
});
