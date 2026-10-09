import {inflateSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {ValidationError} from './model.mjs';
const fail=message=>{throw new ValidationError(message);};
export const MAX_LOGO_BYTES=256*1024;
export function validateLogoPNG(input){
 if(input.mime!=='image/png'||typeof input.data!=='string'||input.data.length>349528||!input.data.length||!/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(input.data))fail('Upload a PNG logo up to 256 KB.');
 const bytes=Buffer.from(input.data,'base64');if(bytes.toString('base64')!==input.data||bytes.length>MAX_LOGO_BYTES||bytes.length<45||!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))fail('Use a valid PNG file.');
 let offset=8,width,height,depth,color,idat=[],ended=false;
 while(offset<bytes.length){if(offset+12>bytes.length)fail('Invalid PNG structure.');const length=bytes.readUInt32BE(offset),type=bytes.toString('ascii',offset+4,offset+8),end=offset+12+length;if(end>bytes.length)fail('Invalid PNG structure.');let crc=0xffffffff;for(const byte of bytes.subarray(offset+4,end-4)){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}if(((crc^0xffffffff)>>>0)!==bytes.readUInt32BE(end-4))fail('PNG integrity check failed.');
 if(offset===8){if(type!=='IHDR'||length!==13)fail('PNG must start with IHDR.');width=bytes.readUInt32BE(offset+8);height=bytes.readUInt32BE(offset+12);depth=bytes[offset+16];color=bytes[offset+17];const depths={0:[1,2,4,8,16],2:[8,16],3:[1,2,4,8],4:[8,16],6:[8,16]};if(!width||!height||width>2048||height>2048||!depths[color]?.includes(depth)||bytes[offset+18]||bytes[offset+19]||bytes[offset+20])fail('Use a non-interlaced PNG up to 2048 × 2048 pixels.');}
 else if(type==='IHDR')fail('Invalid duplicate PNG header.');
 if(type==='IDAT')idat.push(bytes.subarray(offset+8,end-4));if(type==='IEND'){if(length||end!==bytes.length)fail('Invalid PNG ending.');ended=true;}offset=end;
 }
 if(!ended||!idat.length)fail('PNG image data is missing.');const channels={0:1,2:3,3:1,4:2,6:4},stride=Math.ceil(width*channels[color]*depth/8),expected=(stride+1)*height;let decoded;try{decoded=inflateSync(Buffer.concat(idat),{maxOutputLength:expected});}catch{fail('Invalid PNG image data.');}if(decoded.length!==expected)fail('Invalid PNG raster dimensions.');for(let row=0;row<height;row++)if(decoded[row*(stride+1)]>4)fail('Invalid PNG scanline.');return {bytes,hash:createHash('sha256').update(bytes).digest('hex'),width,height};
}
