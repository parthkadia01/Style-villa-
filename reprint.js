(function(){
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  async function getJobs(){
    const s=JSON.parse(localStorage.getItem('ff_session')||'null');
    if(!s?.token) throw new Error('Please login again.');
    const c=supabase.createClient(window.FF_CONFIG.supabaseUrl,window.FF_CONFIG.supabaseKey);
    const r=await c.functions.invoke('tailor-api',{body:{action:'list_jobs',token:s.token}});
    if(r.error)throw r.error;if(r.data?.error)throw new Error(r.data.error);return r.data.jobs||[];
  }
  function addButtons(){
    const s=JSON.parse(localStorage.getItem('ff_session')||'null'),role=s?.user?.role;
    if(role==='tailor')return;
    document.querySelectorAll('#list .job').forEach(card=>{
      if(card.querySelector('.reprint-btn'))return;
      const b=card.querySelector('.job-no')?.textContent||'';
      const m=b.match(/ALT-(\d+)\s*•\s*ITEM\s*(\d+)/i);if(!m)return;
      const btn=document.createElement('button');btn.className='secondary reprint-btn';btn.textContent='🖨 REPRINT LABEL';
      btn.style.marginTop='8px';btn.dataset.alt=m[1];btn.dataset.item=m[2];
      btn.onclick=async()=>{
        btn.disabled=true;btn.textContent='Preparing…';
        try{
          const jobs=await getJobs();
          const alt=Number(btn.dataset.alt),itemNo=Number(btn.dataset.item);
          const j=jobs.find(x=>Number(x.alteration?.alteration_no)===alt&&Number(x.item_no)===itemNo);
          if(!j)throw new Error('Alteration item not found.');
          const source=[j],item={bag_barcode:j.bag_barcode||j.bag_code||('B-'+j.id),product_barcode:j.product_barcode||j.product_code||('P-'+j.id)};
          if(typeof window.printLabels==='function')window.printLabels(alt,[item],j.alteration?.item_description||'',j.alteration?.customers?.name||'',source);
          else throw new Error('Print module not loaded.');
        }catch(e){alert(e.message||'Could not reprint label.')}finally{btn.disabled=false;btn.textContent='🖨 REPRINT LABEL'}
      };
      card.querySelector('.actions')?.appendChild(btn);
    });
  }
  const obs=new MutationObserver(addButtons);obs.observe(document.body,{childList:true,subtree:true});
  setTimeout(addButtons,300);setTimeout(addButtons,1200);
})();
