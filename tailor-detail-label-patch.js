/* Tailor safety: always surface alteration instructions and print them on the fitting label. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const parsePacked=s=>{const m={};String(s||'').split(';').forEach(p=>{const z=p.split('=');if(z[0]&&z[1]!==undefined)m[z[0].trim()]=z.slice(1).join('=').trim()});return m};
  function addTailorDetails(){
    if(typeof user==='undefined'||user?.role!=='tailor')return;
    document.querySelectorAll('.compact-job').forEach(card=>{
      if(card.querySelector('.ff-alteration-detail'))return;
      const itemText=card.querySelector('.item')?.textContent||'';
      const job=(jobs||[]).find(j=>String(j.id)===String(card.dataset.ffJobId)||
        (String(j.alteration?.alteration_no||'')===String((card.querySelector('.job-no')?.textContent||'').match(/ALT-(\d+)/)?.[1]||'')) &&
        String(j.item_type||'').toLowerCase()===String(itemText.split('•')[0]||'').trim().toLowerCase());
      if(!job?.alteration_details)return;
      const box=document.createElement('div');
      box.className='ff-alteration-detail';
      box.innerHTML='<div class="ff-detail-title">⚠ ALTERATION DETAIL</div><div class="ff-detail-text">'+esc(job.alteration_details)+'</div>';
      const measures=card.querySelector('.tailor-measure-title');
      if(measures)measures.insertAdjacentElement('beforebegin',box);else card.insertBefore(box,card.querySelector('.actions'));
    });
  }
  function markJobs(){
    document.querySelectorAll('.compact-job').forEach(card=>{
      if(card.dataset.ffJobId)return;
      const no=(card.querySelector('.job-no')?.textContent||'').match(/ALT-(\d+)/)?.[1];
      const item=(card.querySelector('.item')?.textContent||'').split('•')[0].trim().toLowerCase();
      const j=(jobs||[]).find(x=>String(x.alteration?.alteration_no||'')===String(no||'')&&String(x.item_type||'').toLowerCase()===item);
      if(j)card.dataset.ffJobId=j.id;
    });
  }
  const css=document.createElement('style');css.textContent='.ff-alteration-detail{margin:12px 0;padding:12px;border:2px solid #06376b;border-radius:12px;background:#fff7d6}.ff-detail-title{font-weight:900;font-size:13px;margin-bottom:5px}.ff-detail-text{font-weight:900;font-size:17px;line-height:1.25;white-space:pre-wrap}';document.head.appendChild(css);
  const mo=new MutationObserver(()=>{markJobs();addTailorDetails()});mo.observe(document.body,{childList:true,subtree:true});
  setTimeout(()=>{markJobs();addTailorDetails()},300);

  window.printLabels=function(no,items,bill,customer,source){
    const src=source||[],w=window.open('','_blank','width=1000,height=700');
    if(!w){alert('Allow pop-ups to print labels.');return}
    let h='<!doctype html><html><head><title>Fashion Factory Labels</title><style>@page{margin:0}body{margin:0;font-family:Arial}.sheet{display:flex;gap:2mm;flex-wrap:wrap}.label{width:36mm;height:36mm;padding:2mm;box-sizing:border-box;border:1px solid #222;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between}.brand{text-align:center;font-size:7px;font-weight:900;text-decoration:underline;text-underline-offset:2px}.txt{font-size:6.7px;line-height:1.15}.itemline{font-size:7.5px;font-weight:900}.detail{font-size:6.7px;font-weight:900;line-height:1.18}.measure{border:1px solid #222;border-radius:4px;padding:1.5mm;text-align:center;font-size:8px;font-weight:900}.label svg{width:100%;height:9mm}.small{font-size:6px}</style></head><body><div class="sheet">';
    items.forEach((it,i)=>{const s=src[i]||{},m=s.measurements||{},packed=parsePacked(m.details),f1=m.f1||packed.f1||'—',f2=m.f2||packed.f2||'—',s1=m.s1||packed.s1||'—',s2=m.s2||packed.s2||'—';const detail=s.alteration_details||'';const isJeans=s.item_type==='Jeans';const meas=isJeans?'LENGTH '+(m.length||'—')+' • KAMAR '+(m.waist||'—'):'F '+f1+' '+f2+' • S '+s1+' '+s2;h+='<div class="label"><div class="brand">FASHION FACTORY</div><div class="txt"><b>Customer:</b> '+esc(customer||'—')+'<br><b>Bill:</b> '+esc(bill||'—')+'<br><b>Delivery:</b> '+esc(s.delivery_date||'—')+'<br><b>Qty:</b> '+s.quantity+'</div><svg id="b'+i+'"></svg><div class="small">'+esc(it.bag_barcode||'')+'</div></div><div class="label"><div class="brand">FASHION FACTORY</div><div class="itemline">'+esc(s.item_type||'ITEM')+' • QTY '+s.quantity+'</div><div class="measure">'+esc(meas)+'</div><div class="detail">ALTERATION:<br>'+esc(detail||'—')+'</div><div class="txt"><b>Delivery:</b> '+esc(s.delivery_date||'—')+'</div><svg id="p'+i+'"></svg><div class="small">'+esc(it.product_barcode||'')+'</div></div>'});
    h+='</div><script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\\/script><script>window.onload=()=>{'+items.map((it,i)=>`JsBarcode('#b${i}','${esc(it.bag_barcode||'')}',{format:'CODE128',displayValue:false,height:34,margin:0});JsBarcode('#p${i}','${esc(it.product_barcode||'')}',{format:'CODE128',displayValue:false,height:28,margin:0});`).join('')+'}</script></body></html>';w.document.write(h);w.document.close();
  };
})();
