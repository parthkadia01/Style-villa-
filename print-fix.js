(function(){
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  window.printLabels=function(no,items,bill,customer,source){
    const w=window.open('','_blank','width=900,height=700');
    if(!w){alert('Allow pop-ups to print labels.');return;}
    let h='<!doctype html><html><head><title>Fashion Factory Labels</title><style>'+
      '@page{size:A4;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0;width:210mm;height:297mm;font-family:Arial,sans-serif}' +
      '.sheet{width:210mm;height:297mm;display:grid;grid-template-columns:99.1mm 99.1mm;grid-auto-rows:93.1mm;column-gap:5mm;row-gap:5mm;padding:7mm 3.4mm 0 3.4mm;align-content:start}' +
      '.label{width:99.1mm;height:93.1mm;border:1px solid #222;padding:7mm;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between}' +
      '.brand{text-align:center;font-size:12px;font-weight:900;letter-spacing:.4px}.txt{font-size:11px;line-height:1.35}.detail{font-size:12px;font-weight:800;line-height:1.3}.label svg{display:block;width:100%;height:25mm;min-height:25mm}' +
      '</style></head><body><div class="sheet">';
    items.forEach((it,i)=>{
      const s=source[i]||{};
      const d=s.item_type==='Other Item'?s.alteration_details:
        s.item_type==='Jeans'?'Length '+(s.measurements?.length||'—')+' • Kamar '+(s.measurements?.waist||'—'):
        'F '+(s.measurements?.f1||'—')+' '+(s.measurements?.f2||'—')+' • S '+(s.measurements?.s1||'—')+' '+(s.measurements?.s2||'—');
      h+='<div class="label"><div class="brand">FASHION FACTORY</div><div class="txt"><b>Bill:</b> '+esc(bill||'—')+'<br><b>Customer:</b> '+esc(customer||'—')+'<br><b>Item:</b> '+esc(s.item_type||'—')+'<br><b>Delivery:</b> '+esc(s.delivery_date||'—')+'<br><b>Qty:</b> '+esc(s.quantity||1)+'</div><div class="detail">'+esc(d)+'</div><svg id="b'+i+'"></svg><div class="detail">BAG • '+esc(it.bag_barcode)+'</div></div>';
      h+='<div class="label"><div class="brand">FASHION FACTORY</div><div class="txt"><b>Bill:</b> '+esc(bill||'—')+'<br><b>Customer:</b> '+esc(customer||'—')+'<br><b>Item:</b> '+esc(s.item_type||'—')+'<br><b>Delivery:</b> '+esc(s.delivery_date||'—')+'</div><svg id="p'+i+'"></svg><div class="detail">PRODUCT • '+esc(it.product_barcode)+'</div></div>';
    });
    h+='</div><script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\\/script><script>window.onload=function(){'+items.map((it,i)=>`JsBarcode('#b${i}','${String(it.bag_barcode||'').replace(/'/g,"\\'")}',{format:'CODE128',displayValue:true,fontSize:11,margin:0,height:65,width:1.5});JsBarcode('#p${i}','${String(it.product_barcode||'').replace(/'/g,"\\'")}',{format:'CODE128',displayValue:true,fontSize:11,margin:0,height:65,width:1.5});`).join('')+'setTimeout(function(){window.print()},900)}<\\/script></body></html>';
    w.document.write(h);w.document.close();
  };
})();
