(() => {
  const cfg = window.TBF_CONFIG || {};
  const path = location.pathname.replace(/\/$/, '') || '/';
  const navItems = [['Home','/'],['About','/about'],['Our Work','/our-work'],['Impact','/impact'],['Updates','/updates'],['Volunteer','/volunteer'],['Contact','/contact']];
  const logo = `<span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M3 23h26M5 23c0-8 4.4-13 11-13s11 5 11 13M10 23v-4m12 4v-4M3 27h26" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M16 5v5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></span>`;
  const brand = `<a class="brand" href="/" aria-label="${cfg.name} home">${logo}<span><span class="brand-name">${cfg.name}</span><span class="brand-sub">COMMUNITY • CARE • CONNECTION</span></span></a>`;
  const header = `<div class="announcement">Small acts of care can create lasting change.</div><header class="site-header"><div class="container nav-wrap">${brand}<nav class="nav-links" id="primaryNav" aria-label="Main navigation">${navItems.map(([n,u])=>`<a href="${u}" ${path===u?'aria-current="page"':''}>${n}</a>`).join('')}</nav><div class="nav-actions"><a class="btn btn-primary btn-small" href="/donate">Donate now <span aria-hidden="true">→</span></a><button class="menu-toggle" id="menuToggle" aria-label="Open navigation" aria-expanded="false" aria-controls="primaryNav">☰</button></div></div></header>`;
  const footer = `<footer class="footer"><div class="container"><div class="footer-grid"><div>${brand}<p style="margin-top:20px;max-width:290px">A community-focused foundation working to connect people, care and opportunity. Add the foundation's approved mission statement here.</p><a class="social-link" href="${cfg.instagramUrl}" target="_blank" rel="noopener noreferrer">Instagram ↗</a></div><div><h4>Explore</h4><div class="footer-links"><a href="/about">About us</a><a href="/our-work">Our work</a><a href="/impact">Our impact</a><a href="/updates">Updates</a><a href="/volunteer">Volunteer</a></div></div><div><h4>Take part</h4><div class="footer-links"><a href="/donate">Make a donation</a><a href="/contact">Contact us</a><a href="/transparency">Transparency</a></div></div><div><h4>Contact</h4><p>${cfg.address}</p><p><a href="mailto:${cfg.email}">${cfg.email}</a><br><a href="tel:${(cfg.phone||'').replace(/[^+\d]/g,'')}">${cfg.phoneDisplay||cfg.phone}</a></p><a href="${cfg.mapUrl}" target="_blank" rel="noopener noreferrer">Get directions ↗</a></div></div><div class="footer-bottom"><span>© <span id="year"></span> ${cfg.name}. All rights reserved.</span><span><a href="/privacy">Privacy</a> &nbsp;·&nbsp; <a href="/terms">Terms</a> &nbsp;·&nbsp; <a href="/transparency">Transparency</a></span></div></div></footer><div class="mobile-donate"><a class="btn btn-primary" href="/donate">Support the foundation</a></div>`;
  document.getElementById('siteHeader')?.insertAdjacentHTML('afterbegin', header);
  document.getElementById('siteFooter')?.insertAdjacentHTML('afterbegin', footer);
  const toggle=document.getElementById('menuToggle'), nav=document.getElementById('primaryNav');
  toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'×':'☰';toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation')});
  document.getElementById('year')?.replaceChildren(document.createTextNode(String(new Date().getFullYear())));
  document.querySelectorAll('[data-email]').forEach(el=>{el.textContent=cfg.email;el.href=`mailto:${cfg.email}`});
  document.querySelectorAll('[data-phone]').forEach(el=>{el.textContent=cfg.phoneDisplay||cfg.phone;el.href=`tel:${(cfg.phone||'').replace(/[^+\d]/g,'')}`});
  document.querySelectorAll('[data-address]').forEach(el=>el.textContent=cfg.address);
  document.querySelectorAll('[data-map-link]').forEach(el=>el.href=cfg.mapUrl);
  document.querySelectorAll('[data-instagram]').forEach(el=>el.href=cfg.instagramUrl);
  document.querySelectorAll('[data-current-year]').forEach(el=>el.textContent=new Date().getFullYear());

  // Contact and volunteer forms: use configured endpoint if provided, otherwise open a prefilled email.
  document.querySelectorAll('form[data-contact-form]').forEach(form=>form.addEventListener('submit',async e=>{
    e.preventDefault(); const status=form.querySelector('.form-status'); const data=Object.fromEntries(new FormData(form).entries());
    if(cfg.contactEndpoint){
      try{const res=await fetch(cfg.contactEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});if(!res.ok)throw new Error('Request failed');form.reset();status.textContent='Thank you. Your message has been submitted.';status.style.color='var(--brand)';}
      catch{status.textContent='The online form is not connected yet. Please email us directly using the contact details on this page.';status.style.color='#9a4a26';}
    } else {
      const subject=encodeURIComponent(data.subject||'Website enquiry');const body=encodeURIComponent(Object.entries(data).map(([k,v])=>`${k}: ${v}`).join('\n'));
      location.href=`mailto:${cfg.email}?subject=${subject}&body=${body}`;status.textContent='Your email application should open with the message ready to send.';
    }
  }));
})();
