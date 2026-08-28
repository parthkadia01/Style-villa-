/* Showroom dashboard UX fix: delivery counters, compact tabs and today-at-tailor warning. */
(function(){
  const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const qty=a=>(window.jobs||[]).filter(a).reduce((n,j)=>n+Number(j.quantity||1),0);
  const atTailor=j=>['pending','in_progress','ready'].includes(j.status);
  function apply(){
    if(!window.user||user.role!=='showroom'||!window.jobs)return;
    const t=today(), at=qty(atTailor), showroom=qty(j=>j.status==='returned_to_showroom'), due=qty(j=>j.delivery_date===t&&j.status!=='delivered'), delivered=qty(j=>j.status==='delivered'&&String(j.updated_at||j.delivered_at||'').slice(0,10)===t);
    const labels=['AT TAILOR','AT SHOWROOM','TODAY DELIVERY','DELIVERED TODAY'], values=[at,showroom,due,delivered];
    document.querySelectorAll('.stat-card[data-stat]').forEach((el,i)=>{if(i>3)return;const s=el.querySelector('span'),b=el.querySelector('b');if(s)s.textContent=labels[i];if(b)b.textContent=values[i];});
    document.querySelectorAll('.filters .filter').forEach(b=>{const keep=['all','pending','delivered'].includes(b.dataset.f);b.style.display=keep?'':'none';});
    let box=document.getElementById('showroomTodayAlert');
    const dueJobs=(window.jobs||[]).filter(j=>j.delivery_date===t&&atTailor(j));
    if(dueJobs.length){
      if(!box){box=document.createElement('div');box.id='showroomTodayAlert';box.className='showroom-today-alert';const ref=document.querySelector('.section-head');ref?.parentNode?.insertBefore(box,ref)}
      box.innerHTML='<div class="sta-title">⚠ TODAY DELIVERY — STILL AT TAILOR</div><div class="sta-count">'+qty(j=>j.delivery_date===t&&atTailor(j))+' PCS need attention before today’s delivery.</div>'+dueJobs.slice(0,6).map(j=>'<div class="sta-row"><b>'+esc(j.alteration?.customers?.name||'-')+'</b><span>'+esc(j.item_type||'-')+' • QTY '+Number(j.quantity||1)+' • '+esc(j.tailor?.name||'Tailor')+'</span></div>').join('')+(dueJobs.length>6?'<div class="sta-more">+'+(dueJobs.length-6)+' more</div>':'');
    }else if(box)box.remove();
  }
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  const css=document.createElement('style');css.textContent='#showroomTodayAlert{margin:16px 0;padding:16px 18px;border:2px solid #d97706;border-radius:14px;background:#fff7ed;color:#7c2d12}.sta-title{font-size:16px;font-weight:900}.sta-count{margin:6px 0 10px;font-weight:800}.sta-row{display:flex;justify-content:space-between;gap:14px;padding:6px 0;border-top:1px solid rgba(124,45,18,.14)}.sta-row span{font-weight:700}.sta-more{font-weight:800;margin-top:5px}';document.head.appendChild(css);
  const mo=new MutationObserver(()=>{if(window.user?.role==='showroom')setTimeout(apply,0)});mo.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('load',()=>setTimeout(apply,150));
  setInterval(apply,3000);
})();
