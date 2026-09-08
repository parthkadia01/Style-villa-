/* Crop Top uses the same F/S four-point measurement layout as Kurti Set. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  const valid=v=>v===''||/^\d{1,2}(\.\d{1,2})?$/.test(String(v).trim());
  const fields=()=>'<div class="four-measure crop-top-four-measure"><div><span>F</span><input class="m f1" inputmode="decimal" maxlength="5" placeholder="32"></div><div><span>F</span><input class="m f2" inputmode="decimal" maxlength="5" placeholder="28"></div><div><span>S</span><input class="m s1" inputmode="decimal" maxlength="5" placeholder="18"></div><div><span>S</span><input class="m s2" inputmode="decimal" maxlength="5" placeholder="10"></div></div><small class="muted">Only numbers • 32 or 28.5</small>';
  function convertEditor(el){if(!el||el.querySelector('.i-type')?.value!=='Crop Top')return;const box=el.querySelector('.measurement-editor');if(!box)return;if(!box.querySelector('.crop-top-four-measure'))box.innerHTML=fields()}
  function renderEditors(){document.querySelectorAll('.item-editor').forEach(convertEditor)}
  document.addEventListener('change',e=>{if(e.target.classList?.contains('i-type'))convertEditor(e.target.closest('.item-editor'));},false);
  function compressPhoto(file){return new Promise((resolve,reject)=>{const im=new Image,cv=document.createElement('canvas'),rd=new FileReader;rd.onload=()=>{im.onload=()=>{const max=1600,s=Math.min(1,max/Math.max(im.width,im.height));cv.width=Math.round(im.width*s);cv.height=Math.round(im.height*s);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);resolve(cv.toDataURL('image/jpeg',.72))};im.onerror=reject;im.src=rd.result};rd.onerror=reject;rd.readAsDataURL(file)})}
  async function callApi(action,payload){if(typeof window.api==='function')return window.api(action,payload);const c=window.supabase.createClient(window.FF_CONFIG.supabaseUrl,window.FF_CONFIG.supabaseKey);const s=JSON.parse(localStorage.getItem('ff_session')||'null');const r=await c.functions.invoke('tailor-api',{body:{action,token:s?.token||'',...payload}});if(r.error)throw r.error;if(r.data?.error)throw new Error(r.data.error);return r.data}
  async function cropTopSubmit(e){
    const form=e.target;if(!form||form.id!=='newForm')return;const editors=[...form.querySelectorAll('.item-editor')];if(!editors.some(el=>el.querySelector('.i-type')?.value==='Crop Top'))return;
    e.preventDefault();e.stopImmediatePropagation();const btn=form.querySelector('.primary'),fd=new FormData(form),items=[];
    for(const el of editors){const type=el.querySelector('.i-type').value,m={};if(type==='Kurti Set'||type==='Crop Top'){m.f1=el.querySelector('.f1')?.value||'';m.f2=el.querySelector('.f2')?.value||'';m.s1=el.querySelector('.s1')?.value||'';m.s2=el.querySelector('.s2')?.value||'';if(![m.f1,m.f2,m.s1,m.s2].every(valid)){alert('Measurements must be numbers like 32 or 28.5');return}}else if(type==='Jeans'){m.length=el.querySelector('.length')?.value||'';m.waist=el.querySelector('.waist')?.value||'';if(![m.length,m.waist].every(valid)){alert('Measurements must be numbers like 40 or 32.5');return}}else m.details=el.querySelector('.other-text')?.value||'';items.push({item_type:type,quantity:Math.max(1,Number(el.querySelector('.i-qty').value||1)),assigned_tailor_id:el.querySelector('.i-tailor').value,delivery_date:el.querySelector('.i-date').value,measurements:m,alteration_details:el.querySelector('.i-detail').value})}
    btn.disabled=true;btn.textContent='Saving…';try{const r=await callApi('create_job',{job:{customer:fd.get('customer'),mobile:fd.get('mobile'),bill:fd.get('bill'),items}});for(let i=0;i<r.items.length;i++){const file=editors[i].querySelector('.i-photo')?.files?.[0];if(file)await callApi('upload_photo',{item_id:r.items[i].id,data_url:await compressPhoto(file)})}if(typeof window.loadData==='function')await window.loadData();if(typeof window.printLabels==='function')window.printLabels(r.alteration.alteration_no,r.items,fd.get('bill'),fd.get('customer'),items);if(typeof window.render==='function')window.render()}catch(x){alert(x.message||'Could not save');btn.disabled=false;btn.textContent='SAVE & PRINT LABELS'}}
  document.addEventListener('submit',cropTopSubmit,true);
  let cardJobsPromise=null;
  async function patchCards(){
    const cards=[...document.querySelectorAll('.job')];
    if(!cards.length)return;
    try{
      cardJobsPromise=cardJobsPromise||callApi('list_jobs');
      const r=await cardJobsPromise;
      const list=r.jobs||[];
      cards.forEach(card=>{
        if(!/Crop Top/i.test(card.textContent||''))return;
        const idMatch=(card.textContent||'').match(/ALT-(\d+)\s*•\s*ITEM\s*(\d+)/i);
        if(!idMatch)return;
        const j=list.find(x=>String(x.alteration?.alteration_no||'').padStart(4,'0')===idMatch[1]&&String(x.item_no)===idMatch[2]);
        if(!j)return;
        const m=j.measurements||{};
        const heading=[...card.querySelectorAll('*')].find(el=>el.children.length===0&&el.textContent.trim()==='MEASUREMENTS');
        if(!heading)return;
        const parent=heading.parentElement;
        const target=[...parent.children].find(el=>el!==heading&&el.textContent.trim());
        if(!target)return;
        if(target.dataset.cropTopRendered==='1')return;
        target.innerHTML='<div class="four-measure-view crop-top-four-measure-view"><div><span>F</span><b>'+esc(m.f1||'—')+'</b></div><div><span>F</span><b>'+esc(m.f2||'—')+'</b></div><div><span>S</span><b>'+esc(m.s1||'—')+'</b></div><div><span>S</span><b>'+esc(m.s2||'—')+'</b></div></div>';
        target.dataset.cropTopRendered='1';
      });
    }catch(_){}
  }
  const mo=new MutationObserver(()=>{renderEditors();patchCards()});mo.observe(document.body,{childList:true,subtree:true});setTimeout(()=>{renderEditors();patchCards()},0);
})();
