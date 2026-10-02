from pathlib import Path
for filename in ['public/index.html','src/receptionist.html']:
 p=Path(filename);t=p.read_text(encoding='utf-8')
 t=t.replace('AI website assistant','Automated service guide · no AI usage')
 t=t.replace('Hi, I’m Ava, AWC’s AI assistant. What would you like to improve in your business? I can explain our services and help you prepare a request for the studio.','Hi, I’m Ava, AWC’s automated service guide. I use prepared service information, with no generative AI calls. I can explain our services and help you prepare a request for the studio.')
 t=t.replace('AI answers can be mistaken. AWC confirms scope, pricing and appointments. Messages are processed by OpenAI and retained for 24 hours. Don’t share sensitive information. No inquiry is sent through chat; use the form to contact AWC.','Prepared answers cover AWC’s published services. The studio confirms scope, pricing and appointments. Chat stays on this site for up to 24 hours; no messages go to an AI provider in this mode. Don’t share sensitive information. Use the form to send an inquiry.')
 t=t.replace('Ava is thinking…','Finding AWC service information…')
 t=t.replace('Ava’s messages are processed by OpenAI; do not share passwords, payment details or sensitive information.','Ava uses prepared service information without an AI provider in this mode; do not share passwords, payment details or sensitive information.')
 p.write_text(t,encoding='utf-8')
