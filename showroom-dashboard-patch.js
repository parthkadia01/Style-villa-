/* Showroom dashboard: operational counters + due-today tailor warning. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const day=d=>{const x=new Date(d);return isNaN(x)?'':x.toISOString().slice(0,10)};
  const today=()=>day(new Date());
  const pcs=list=>list.reduce((n,j)=>n+Number(j.quantity||1),0);
  const isTailor=j=>['pending','in_progress','ready'].includes(j.status);
  const isShowroom=j=>j.status==='returned_to_showroom';
  const isDeliveredToday=j=>j.status==='delivered'&&day(j.updated_at||j.delivered_at)===today();

  function updateShowroom(){
    if(!window.user||user.role!=='showroom'||!Array.isArray(window.jobs)) return;
    const cards=[...document.querySelectorAll('.stat-grid .stat-card')];
    if(cards.length<4) return;
    const atTailor=jobs.filter(isTailor);
    const atShowroom=jobs.filter(isShowroom);
    const dueToday=jobs.filter(j=>j.delivery_date===today()&&j.status!=='delivered');
    const deliveredToday=jobs.filter(isDeliveredToday);
    const data=[['AT TAILOR',pcs(atTailor)],['AT SHOWROOM',pcs(atShowroom)],['TODAY DELIVERY',pcs(dueToday)],['DELIVERED TODAY',pcs(deliveredToday)]];
    cards.slice(0,4).forEach((card,i)=>{
      const span=card.querySelector('span'), b=card.querySelector('b'), small=card.querySelector('small');
      if(span) span.textContent=data[i][0];
      if(b) b.textContent=data[i][1];
      if(small) small.textContent='PCS';
    });
    updateWarning(atTailor.filter(j=>j.delivery_date===today()));
  }

  function updateWarning(urgent){
    let box=document.getElementById('showroomDeliveryWarning');
    if(!urgent.length){ if(box) box.remove(); return; }
    const count=pcs(urgent);
    const rows=urgent.slice(0,6).map(j=>{
      const name=j.alteration?.customers?.name||'-';
      const item=j.item_type||'-';
      const qty=Number(j.quantity||1);
      return '<div class="showroom-warning-row"><b>'+esc(name)+'</b><span>'+esc(item)+' • '+qty+' PCS • '+esc(j.tailor?.name||'TAILOR')+'</span></div>';
    }).join('');
    const extra=urgent.length>6?'<div class="showroom-warning-more">+'+(urgent.length-6)+' more items due today</div>':'';
    const html='<div id="showroomDeliveryWarning" class="showroom-delivery-warning"><div class="showroom-warning-head"><div><strong>⚠ TODAY DELIVERY — STILL WITH TAILOR</strong><small>'+count+' PCS need attention today</small></div><button type="button" class="secondary small" id="showroomWarningView">VIEW</button></div><div class="showroom-warning-list">'+rows+extra+'</div></div>';
    if(!box){
      const grid=document.querySelector('.stat-grid');
      if(grid) grid.insertAdjacentHTML('afterend',html);
      box=document.getElementById('showroomDeliveryWarning');
      box?.querySelector('#showroomWarningView')?.addEventListener('click',()=>{
        const list=document.getElementById('list');
        list?.scrollIntoView({behavior:'smooth',block:'start'});
        list?.classList.add('warning-focus');
        setTimeout(()=>list?.classList.remove('warning-focus'),1800);
      });
    } else {
      box.outerHTML=html;
      document.getElementById('showroomDeliveryWarning')?.querySelector('#showroomWarningView')?.addEventListener('click',()=>document.getElementById('list')?.scrollIntoView({behavior:'smooth',block:'start'}));
    }
  }

  function boot(){updateShowroom();}
  const observer=new MutationObserver(()=>{if(window.user?.role==='showroom') requestAnimationFrame(updateShowroom)});
  window.addEventListener('load',()=>{boot();observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});setTimeout(updateShowroom,500);setTimeout(updateShowroom,1500)});
})();
