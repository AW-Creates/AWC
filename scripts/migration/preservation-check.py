import hashlib,json,pathlib
root=pathlib.Path('C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures')
preserved=root/'_recovery/AWC-red-approved-recovered'
manifest=json.loads((preserved/'RECOVERY_PROVENANCE.json').read_text(encoding='utf-8-sig'))
rows=[]
for f in manifest['files']:
    a=pathlib.Path(f['source']);b=preserved/f['name']
    rows.append({'name':f['name'],'original':hashlib.sha256(a.read_bytes()).hexdigest()==f['sha256'],'preserved':hashlib.sha256(b.read_bytes()).hexdigest()==f['sha256']})
print(json.dumps({'files':len(rows),'all_match':all(r['original'] and r['preserved'] for r in rows),'rows':rows}))
