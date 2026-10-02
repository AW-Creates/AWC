from pathlib import Path
p=Path('public/index.html')
t=p.read_text(encoding='utf-8')
old='''  form.addEventListener('submit', (e) => {
    e.preventDefault();
    confirm.classList.add('show');
    // No delivery endpoint exists in this standalone preview. Preserve entered details.
  });'''
assert old in t
t=t.replace(old,'  // Live contact handling is attached by the receptionist module below.')
t=t.replace('Preview form — message delivery is not connected.','Your request goes to AWC. Consultations need human confirmation.')
t=t.replace('Your details are ready. This preview has not sent a message.','')
t=t.replace('<option>Not sure yet</option>','<option>Not sure yet</option><option>Request a consultation</option><option>Request a quote</option>')
t=t.replace('<div class="submit-row">','''<div style="display:grid;gap:12px;margin:12px 0 20px;font-size:.82rem;line-height:1.6">
          <label><input type="checkbox" id="inquiryConsent" required> I agree to send these details to AWC so it can respond to my inquiry.</label>
          <label><input type="checkbox" id="attachConversation"> Include my Ava conversation with this inquiry.</label>
          <label style="position:absolute;left:-9999px" aria-hidden="true">Website<input name="website" id="inquiryWebsite" tabindex="-1" autocomplete="off"></label>
          <details><summary>How these details are used</summary><p>Your contact details and message are saved privately for AWC to respond. Ava’s messages are processed by OpenAI; do not share passwords, payment details or sensitive information. Chat history expires after 24 hours. Submitted inquiries are kept for up to 90 days, with expired records purged on service activity. Conversation is attached only if you choose it. Email copies may remain with the email services. Consultation requests are not bookings.</p></details>
        </div><div class="submit-row">''',1)
fragment=Path('src/receptionist.html').read_text(encoding='utf-8')
t=t.replace('</body>',fragment+'\n</body>')
p.write_text(t,encoding='utf-8')
