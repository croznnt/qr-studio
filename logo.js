// Keep the central white backing small and enable high error correction.
export function logoBounds(size, width, height) {
 const box = size * .14, padding = size * .012;
 const scale = (box - padding * 2) / Math.max(width, height);
 return {box, start:(size-box)/2, width:width*scale, height:height*scale};
}
export function drawLogo(canvas, logo) {
 if (!logo) return;
 const ctx=canvas.getContext('2d'),s=canvas.width;
 const b=logoBounds(s,logo.image.width,logo.image.height);
 ctx.fillStyle='#ffffff';ctx.fillRect(b.start,b.start,b.box,b.box);
 ctx.drawImage(logo.image,(s-b.width)/2,(s-b.height)/2,b.width,b.height);
}
export function embedLogo(svg, logo) {
 if (!logo) return svg;
 const match=svg.match(/viewBox="0 0 ([\d.]+) [\d.]+"/);
 if (!match) throw new Error('Không đọc được kích thước SVG.');
 const s=Number(match[1]),b=logoBounds(s,logo.image.width,logo.image.height);
 return svg.replace('</svg>',`<rect x="${b.start}" y="${b.start}" width="${b.box}" height="${b.box}" fill="#fff"/><image x="${(s-b.width)/2}" y="${(s-b.height)/2}" width="${b.width}" height="${b.height}" href="${logo.data}"/></svg>`);
}
