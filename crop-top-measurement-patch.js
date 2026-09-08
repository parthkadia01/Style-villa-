/* Crop Top uses the same F/S four-point measurement layout as Kurti Set. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  const fields=()=>'<div class="four-measure crop-top-four-measure"><div><span>F</span><input class="m f1" inputmode="decimal" maxlength="5" placeholder="32"></div><div><span>F</span><input class="m f2" inputmode="decimal" maxlength="5" placeholder="28"></div><div><span>S</span><input class="m s1" inputmode="decimal" maxlength="5" placeholder="18"></div><div><span>S</span><input class="m s2" inputmode="decimal" maxlength="5" placeholder="10"></div></div><small class="muted">Only numbers • 32 or 28.5</small><textarea class="other-text crop-top-storage" aria-hidden="true" tabindex="-1" style="display:none"></textarea>';
  const parse=s=>{const m={};String(s||'').split(';').forEach(p=>{const [k,v]=p.split('=');if(k&&v)m[k.trim()]=v.trim()});return m};
  const pack=el=>['f1','f2','s1','s2'].map(k=>k+'='+(el.querySelector('.'+k)?.value||'')).join(';');
  function convertEditor(el){
    if(!el)return;
    const type=el.querySelector('.i-type')?.value;
    if(type!=='Crop Top')return;
    const box=el.querySelector('.measurement-editor');
    if(!box)return;
    if(box.querySelector('.crop-top-four-measure'))return;
    box.innerHTML=fields();
    const old=el.dataset.cropTopDetails||'';
    const m=parse(old);
    ['f1','f2','s1','s2'].forEach(k=>{const input=box.querySelector('.'+k);if(input)input.value=m[k]||''});
  }
  function syncStorage(el){
    if(el?.querySelector('.i-type')?.value!=='Crop Top')return;
    const box=el.querySelector('.measurement-editor');
    if(!box)return;
    const hidden=box.querySelector('.crop-top-storage');
    if(hidden)hidden.value=pack(el);
  }
  function renderEditors(){document.querySelectorAll('.item-editor').forEach(convertEditor)}
  document.addEventListener('change',e=>{if(e.target.classList?.contains('i-type')){const el=e.target.closest('.item-editor');convertEditor(el);}},false);
  document.addEventListener('input',e=>{if(e.target.classList?.contains('m')&&e.target.closest('.item-editor')?.querySelector('.i-type')?.value==='Crop Top')syncStorage(e.target.closest('.item-editor'))},false);
  document.addEventListener('submit',e=>{document.querySelectorAll('.item-editor').forEach(syncStorage)},true);
  function patchCards(){
    document.querySelectorAll('.job').forEach(card=>{
      const item=card.querySelector('.item')?.textContent||'';
      if(!/Crop Top/i.test(item))return;
      const target=card.querySelector('.other-measure');
      if(!target)return;
      if(target.dataset.cropTopRendered==='1')return;
      const m=parse(target.textContent||'');
      target.innerHTML='<div class="four-measure-view crop-top-four-measure-view"><div><span>F</span><b>'+esc(m.f1||'—')+'</b></div><div><span>F</span><b>'+esc(m.f2||'—')+'</b></div><div><span>S</span><b>'+esc(m.s1||'—')+'</b></div><div><span>S</span><b>'+esc(m.s2||'—')+'</b></div></div>';
      target.dataset.cropTopRendered='1';
    });
  }
  const mo=new MutationObserver(()=>{renderEditors();patchCards()});
  mo.observe(document.body,{childList:true,subtree:true});
  setTimeout(()=>{renderEditors();patchCards()},0);
  const oldPrint=window.printLabels;
  if(typeof oldPrint==='function'&&!oldPrint.__cropTopPatched){
    const wrapped=function(no,items,bill,customer,source){
      const fixed=(source||[]).map(s=>{
        if(s?.item_type!=='Crop Top')return s;
        const m=parse(s.measurements?.details||'');
        return Object.assign({},s,{measurements:Object.assign({},s.measurements,{f1:m.f1||s.measurements?.f1,f2:m.f2||s.measurements?.f2,s1:m.s1||s.measurements?.s1,s2:m.s2||s.measurements?.s2})});
      });
      return oldPrint(no,items,bill,customer,fixed);
    };
    wrapped.__cropTopPatched=true;window.printLabels=wrapped;
  }
})();
