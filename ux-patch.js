/* UX refinements: simple showroom flow, clear tailor notes, no camera, seamless status updates. */
(function(){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const escUx=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  let showroomTab='pending';

  function addStyles(){
    if($('#ffUxStyles'))return;
    const st=document.createElement('style');st.id='ffUxStyles';st.textContent=`
      .ff-showroom-tabs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0 12px}
      .ff-showroom-tabs button{min-height:50px;font-size:14px;font-weight:900;border-radius:14px}
      .ff-showroom-tabs button.active{background:var(--navy2);color:#fff}
      .ff-showroom-card .actions .primary{min-height:52px;font-size:15px;font-weight:900;min-width:180px}
      .ff-tailor-note{margin:12px 0;padding:14px 16px;border:2px solid #222;border-radius:14px;background:#fff7c9}
      .ff-tailor-note-title{font-size:16px;font-weight:1000;letter-spacing:.5px;margin-bottom:7px}
      .ff-tailor-note-text{font-size:23px;line-height:1.28;font-weight:900;word-break:break-word}
      @media(max-width:480px){.ff-tailor-note-text{font-size:20px}.ff-showroom-card .actions .primary{width:100%}}
    `;document.head.appendChild(st);
  }

  function removeCamera(){
    $$('.scan-panel,#cameraBtn,#scanVideo,#closeCamera').forEach(el=>el.remove());
  }

  function showroomCard(j){
    const action=j.status==='returned_to_showroom'?'<button class="primary" data-next="'+escUx(j.id)+'" data-status="delivered">DELIVER TO CUSTOMER</button>':'';
    const measure=typeof measureView==='function'?measureView(j):'';
    return '<article class="job compact-job ff-showroom-card"><div class="job-head"><div><div class="job-no">ALT-'+String(j.alteration?.alteration_no||0).padStart(4,'0')+' • ITEM '+j.item_no+'</div><div class="bill">BILL '+escUx(j.alteration?.item_description||'—')+'</div></div><span class="status '+escUx(j.status)+'">'+escUx(statusName(j.status))+'</span></div><div class="customer">'+escUx(j.alteration?.customers?.name||'-')+'</div><div class="item">'+escUx(j.item_type)+' <strong>• QTY '+escUx(j.quantity)+'</strong></div><div class="meta"><span class="chip">DELIVERY: '+escUx(fmt(j.delivery_date))+'</span>'+(j.tailor?.name?'<span class="chip">TAILOR: '+escUx(j.tailor.name)+'</span>':'')+'</div><details><summary>View measurements</summary>'+measure+'</details><div class="actions" style="margin-top:12px">'+action+'</div></article>';
  }

  function showroomMatches(j,q){
    if(!q)return true;
    return [j.id,j.item_type,j.alteration?.alteration_no,j.alteration?.customers?.name,j.alteration?.customers?.mobile,j.alteration?.item_description,j.tailor?.name,j.bag_barcode,j.bag_code].join(' ').toLowerCase().includes(q);
  }

  function renderShowroom(){
    if(user?.role!=='showroom')return;
    addStyles();
    app.innerHTML=header()+'<main class="page dashboard-page"><div class="hero-row"><div><div class="title">Welcome, '+escUx(user.name||'')+' 👋</div><div class="muted">Simple alteration delivery desk</div></div><button class="primary" id="new">＋ NEW ALTERATION</button></div><input id="search" class="search" placeholder="Search customer, mobile, bill, alteration or barcode…" autocomplete="off"><div class="ff-showroom-tabs"><button class="filter active" data-showtab="pending">PENDING</button><button class="filter" data-showtab="delivered">DELIVERED</button></div><section id="list"></section></main>';
    $('#new')?.addEventListener('click',()=>form());
    $('#search')?.addEventListener('input',renderShowroomList);
    $$('.ff-showroom-tabs [data-showtab]').forEach(b=>b.addEventListener('click',()=>{showroomTab=b.dataset.showtab;$$('.ff-showroom-tabs button').forEach(x=>x.classList.toggle('active',x===b));renderShowroomList()}));
    renderShowroomList();
  }

  function renderShowroomList(){
    if(user?.role!=='showroom')return;
    const q=($('#search')?.value||'').trim().toLowerCase();
    const data=(jobs||[]).filter(j=>showroomTab==='delivered'?j.status==='delivered':j.status!=='delivered').filter(j=>showroomMatches(j,q));
    const list=$('#list');if(list)list.innerHTML=data.map(showroomCard).join('')||'<div class="empty">No alterations found.</div>';
  }

  function tailorNotes(){
    if(user?.role!=='tailor')return;
    $$('#list .job').forEach(card=>{
      if(card.querySelector('.ff-tailor-note'))return;
      const key=card.querySelector('.job-no')?.textContent||'';
      const m=key.match(/ALT-(\d+)\s*•\s*ITEM\s*(\d+)/i);if(!m)return;
      const no=Number(m[1]),itemNo=Number(m[2]);
      const j=(jobs||[]).find(x=>Number(x.alteration?.alteration_no)===no&&Number(x.item_no)===itemNo);
      const note=String(j?.alteration_details||'').trim();if(!note)return;
      const box=document.createElement('div');box.className='ff-tailor-note';box.innerHTML='<div class="ff-tailor-note-title">IMPORTANT NOTE</div><div class="ff-tailor-note-text">'+escUx(note)+'</div>';
      (card.querySelector('.tailor-measure-title')||card.querySelector('.actions'))?.insertAdjacentElement('beforebegin',box);
    });
  }

  function restoreScroll(y){requestAnimationFrame(()=>requestAnimationFrame(()=>window.scrollTo({top:y,behavior:'auto'})))}

  // Capture before dashboard-runtime.js so status changes stay in-place and keep scroll position.
  document.addEventListener('click',async e=>{
    const b=e.target.closest('[data-next]');
    if(!b||b.dataset.uxBusy)return;
    e.preventDefault();e.stopImmediatePropagation();
    const y=window.scrollY;
    b.dataset.uxBusy='1';b.disabled=true;
    const old=b.textContent;b.textContent='UPDATING…';
    try{
      await api('update_status',{item_id:b.dataset.next,status:b.dataset.status});
      const j=(jobs||[]).find(x=>String(x.id)===String(b.dataset.next));if(j)j.status=b.dataset.status;
      if(user?.role==='showroom')renderShowroomList();
      else if(typeof render==='function')render();
      removeCamera();tailorNotes();restoreScroll(y);
    }catch(err){alert(err.message||'Could not update status.');b.disabled=false;b.textContent=old}
    finally{delete b.dataset.uxBusy}
  },true);

  window.addEventListener('load',()=>{
    addStyles();removeCamera();
    if(user?.role==='showroom')renderShowroom();
    else if(user?.role==='tailor')setTimeout(tailorNotes,50);
  });

  const mo=new MutationObserver(()=>{removeCamera();if(user?.role==='tailor')tailorNotes()});
  mo.observe(document.body,{childList:true,subtree:true});
})();
