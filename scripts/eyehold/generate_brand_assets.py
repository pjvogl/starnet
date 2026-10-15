#!/usr/bin/env python3
"""Original Eyehold installer graphics. Python standard library only.
Generates PNG, ICO, ICNS and BMP; does not copy upstream branded art.
Run: python3 scripts/eyehold/generate_brand_assets.py --output eyehold-brand-preview
"""
import argparse, os, struct, zlib

BG=(15,18,29,255); GOLD=(231,169,81,255); DIM=(108,77,52,255)
def canvas(w,h): return bytearray(bytes(BG)*(w*h))
def pixel(buf,w,h,x,y,c):
    if 0<=x<w and 0<=y<h: buf[(y*w+x)*4:(y*w+x)*4+4]=bytes(c)
def line(buf,w,h,x1,y1,x2,y2,c,thick=1):
    steps=max(abs(x2-x1),abs(y2-y1),1)
    for i in range(steps+1):
        x=round(x1+(x2-x1)*i/steps);y=round(y1+(y2-y1)*i/steps)
        for a in range(-thick//2,thick//2+1):
            for b in range(-thick//2,thick//2+1):pixel(buf,w,h,x+a,y+b,c)
def ellipse(buf,w,h,cx,cy,rx,ry,col,fill=False):
    for y in range(max(0,cy-ry-2),min(h,cy+ry+3)):
        for x in range(max(0,cx-rx-2),min(w,cx+rx+3)):
            v=((x-cx)/max(1,rx))**2+((y-cy)/max(1,ry))**2
            if (v<=1 if fill else .87<=v<=1.14):pixel(buf,w,h,x,y,col)
def emblem(buf,w,h,cx,cy,size):
    # Original Eyehold geometry: seven-pronged observation crest around a golden pupil.
    q=max(1,size//19)
    ellipse(buf,w,h,cx,cy,size,round(size*.56),DIM,False)
    for d in [-.8,-.53,-.26,0,.26,.53,.8]:
        x=round(cx+d*size*.95)
        line(buf,w,h,x,round(cy-size*.47),x,round(cy-size*(.95 if d==0 else .74)),GOLD,q)
    line(buf,w,h,cx-size,cy,cx,cy+round(size*.62),GOLD,q)
    line(buf,w,h,cx,cy+round(size*.62),cx+size,cy,GOLD,q)
    ellipse(buf,w,h,cx,cy,round(size*.44),round(size*.44),GOLD,True)
    ellipse(buf,w,h,cx,cy,round(size*.18),round(size*.18),BG,True)
def make(w,h,layout):
    b=canvas(w,h)
    if layout=='icon': emblem(b,w,h,w//2,h//2,round(min(w,h)*.31))
    else:
        center=(round(w*.23),h//2) if layout=='sidebar' else (round(w*.14),h//2)
        emblem(b,w,h,*center,round(min(h,w)*.26))
        for i in range(3):
            line(b,w,h,0,h-1-i*3,w,h-1-i*3,DIM)
    return bytes(b)
def chunk(tag,data):return struct.pack('!I',len(data))+tag+data+struct.pack('!I',zlib.crc32(tag+data)&0xffffffff)
def png(w,h,rgba):
    rows=b''.join(b'\x00'+rgba[y*w*4:(y+1)*w*4] for y in range(h))
    return b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',w,h,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(rows,9))+chunk(b'IEND',b'')
def bmp(w,h,rgba):
    stride=(w*3+3)//4*4
    rows=b''.join(b''.join(bytes((rgba[k+2],rgba[k+1],rgba[k])) for x in range(w) for k in [(y*w+x)*4])+bytes(stride-w*3) for y in range(h-1,-1,-1))
    return b'BM'+struct.pack('<IHHI',54+len(rows),0,0,54)+struct.pack('<IiiHHIIiiII',40,w,h,1,24,0,len(rows),2835,2835,0,0)+rows
def put(out,name,data):
    dest=os.path.join(out,name);os.makedirs(os.path.dirname(dest),exist_ok=True)
    with open(dest,'wb') as f:f.write(data)
def main():
    p=argparse.ArgumentParser();p.add_argument('--output',default='eyehold-brand-preview');a=p.parse_args();out=a.output
    icons={}
    for size in [16,32,64,128,256,512,1024]:
        icons[size]=png(size,size,make(size,size,'icon'))
    for size,name in [(32,'icons/32x32.png'),(128,'icons/128x128.png'),(256,'icons/128x128@2x.png')]:put(out,name,icons[size])
    sizes=[32,64,128,256]
    header=struct.pack('<HHH',0,1,len(sizes)); offset=6+16*len(sizes);records=b'';payload=b''
    for size in sizes:
        data=icons[size];records+=struct.pack('<BBBBHHII',size if size<256 else 0,size if size<256 else 0,0,0,1,32,len(data),offset);payload+=data;offset+=len(data)
    put(out,'icons/icon.ico',header+records+payload)
    icns=b''
    for size,kind in [(16,b'icp4'),(32,b'icp5'),(64,b'icp6'),(128,b'ic07'),(256,b'ic08'),(512,b'ic09'),(1024,b'ic10')]:
        data=icons[size];icns+=kind+struct.pack('!I',8+len(data))+data
    put(out,'icons/icon.icns',b'icns'+struct.pack('!I',8+len(icns))+icns)
    for name,w,h,layout in [('installer/header.bmp',150,57,'header'),('installer/sidebar.bmp',164,314,'sidebar')]:
        put(out,name,bmp(w,h,make(w,h,layout)))
    put(out,'installer/dmg-background.png',png(660,400,make(660,400,'sidebar')))
    print('Generated original Eyehold assets in',out)
if __name__=='__main__':main()
