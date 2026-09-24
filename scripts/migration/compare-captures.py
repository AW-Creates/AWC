from PIL import Image,ImageChops,ImageDraw
import pathlib,json
out=pathlib.Path('C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures/_venture-ops/media/awc-red-migration-2026-09-24')
rows=[]
for a in sorted(out.glob('*-source-*.png')):
 b=a.with_name(a.name.replace('-source-','-canonical-'))
 if not b.exists():continue
 im1=Image.open(a).convert('RGB');im2=Image.open(b).convert('RGB')
 diff=ImageChops.difference(im1,im2) if im1.size==im2.size else None
 bbox=diff.getbbox() if diff else 'size mismatch'
 rows.append({'source':a.name,'canonical':b.name,'size':im1.size,'identical':bbox is None,'difference_bounds':bbox})
(out/'pixel-comparison.json').write_text(json.dumps(rows,indent=2))
print(json.dumps({'pairs':len(rows),'identical':sum(r['identical'] for r in rows),'different':[r for r in rows if not r['identical']]}))
for kind in ['hero','work','quote']:
 thumbs=[]
 for theme in ['dark','light']:
  for width in [320,360,375,390,430,768,1440]:
   p=out/f'{width}-{theme}-canonical-{kind}.png'
   im=Image.open(p).convert('RGB');im.thumbnail((290,470))
   tile=Image.new('RGB',(310,510),'#dddddd');tile.paste(im,((310-im.width)//2,30));ImageDraw.Draw(tile).text((10,8),f'{width} {theme} {kind}',fill='black');thumbs.append(tile)
 sheet=Image.new('RGB',(310*7,510*2),'white')
 for i,im in enumerate(thumbs):sheet.paste(im,((i%7)*310,(i//7)*510))
 sheet.save(out/f'review-{kind}.jpg')
