(function(){
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function jsSafe(s){return String(s??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' ');}
  function build(no,items,bill,customer,source){
    const rows=items.map((it,i)=>({it,s:source[i]||{},i}));
    let h='<!doctype html><html><head><meta charset="utf-8"><title>Fashion Factory Labels</title><style>'+
      '@page{size:78mm 36mm landscape;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0;width:78mm;height:36mm;background:#fff;font-family:Arial,sans-serif}'+
      '.row{width:78mm;height:36mm;display:flex;flex-direction:row;flex-wrap:nowrap;gap:2mm;padding:0 2mm;margin:0;page-break-after:always;break-after:page;page-break-inside:avoid;break-inside:avoid}'+
      '.label{flex:0 0 36mm;width:36mm;height:36mm;padding:1.4mm 1.4mm .8mm;overflow:hidden;display:flex;flex-direction:column}'+
      '.brand{text-align:center;font-size:6.6px;line-height:1;font-weight:900;letter-spacing:.1px;margin-bottom:1mm}'+
      '.customer{font-size:7.4px;line-height:1.05;font-weight:900;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:1mm}'+
      '.bill{font-size:7px;line-height:1.05;font-weight:900;margin-bottom:.8mm}.small{font-size:6.1px;line-height:1.15;font-weight:800}'+
      '.product-head{font-size:6.1px;line-height:1.1;font-weight:900;margin-bottom:.7mm}.product-customer{font-size:6.7px;line-height:1.05;font-weight:900;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:.6mm}'+
      '.fit-row{display:flex;gap:1.5mm;justify-content:center;margin-top:1mm}.fit-box{width:15.8mm;height:14.5mm;border:1px solid #111;border-radius:1.4mm;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:.7mm}'+
      '.fit-label{font-size:5.1px;line-height:1.02;font-weight:900;text-transform:uppercase}.fit-value{font-size:9.8px;line-height:1;font-weight:900;margin-top:1.5mm}.other{font-size:6px;line-height:1.1;font-weight:900;text-align:center;margin-top:2mm;max-height:12mm;overflow:hidden}'+
      '.delivery{text-align:center;font-size:6px;line-height:1;font-weight:900;margin-top:auto;margin-bottom:.6mm}.barcode{display:block;width:100%;height:6mm;margin-top:auto}.code{text-align:center;font-size:4.8px;line-height:1;font-weight:800;margin-top:.2mm}'+
      '</style></head><body>';
    rows.forEach(({it,s,i})=>{
      const type=s.item_type||''; const isJeans=type==='Jeans'; const isOther=type==='Other Item';
      const f1=s.measurements?.f1||'—',f2=s.measurements?.f2||'—',s1=s.measurements?.s1||'—',s2=s.measurements?.s2||'—';
      const length=s.measurements?.length||'—',waist=s.measurements?.waist||'—';
      h+='<div class="row"><div class="label"><div class="brand">FASHION FACTORY</div><div class="customer">'+esc(customer||'—')+'</div><div class="bill">BILL NO: '+esc(bill||'—')+'</div><div class="small">DELIVERY: '+esc(s.delivery_date||'—')+'</div><div class="small">QTY: '+esc(s.quantity||1)+'</div><svg class="barcode" id="b'+i+'"></svg><div class="code">BAG • '+esc(it.bag_barcode||'')+'</div></div>';
      h+='<div class="label"><div class="brand">FASHION FACTORY</div><div class="product-customer">'+esc(customer||'—')+'</div><div class="product-head">BILL NO: '+esc(bill||'—')+'<br>ITEM: '+esc(type||'—')+'</div>';
      if(isJeans){h+='<div class="fit-row"><div class="fit-box"><div class="fit-label">LENGTH<br>CUTTING</div><div class="fit-value">'+esc(length)+'</div></div><div class="fit-box"><div class="fit-label">KAMAR<br>FITTING</div><div class="fit-value">'+esc(waist)+'</div></div></div>';}
      else if(isOther){h+='<div class="other">'+esc(s.alteration_details||'—')+'</div>';}
      else {h+='<div class="fit-row"><div class="fit-box"><div class="fit-label">F — UP / DOWN</div><div class="fit-value">'+esc(f1)+'</div><div class="fit-value">'+esc(f2)+'</div></div><div class="fit-box"><div class="fit-label">S — UP / DOWN</div><div class="fit-value">'+esc(s1)+'</div><div class="fit-value">'+esc(s2)+'</div></div></div>';}
      h+='<div class="delivery">DELIVERY: '+esc(s.delivery_date||'—')+'</div><svg class="barcode" id="p'+i+'"></svg><div class="code">PRODUCT • '+esc(it.product_barcode||'')+'</div></div></div>';
    });
    h+='<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script><script>window.onload=function(){';
    rows.forEach(({it,i})=>{h+="JsBarcode('#b"+i+"','"+jsSafe(it.bag_barcode||'')+"',{format:'CODE128',displayValue:false,margin:0,height:23,width:1.05});";h+="JsBarcode('#p"+i+"','"+jsSafe(it.product_barcode||'')+"',{format:'CODE128',displayValue:false,margin:0,height:23,width:1.05});";});
    h+='setTimeout(function(){window.print()},700)}<\\/script></body></html>';return h;
  }
  window.printLabels=function(no,items,bill,customer,source){const w=window.open('','_blank','width=1000,height=700');if(!w){alert('Allow pop-ups to print labels.');return;}w.document.write(build(no,items,bill,customer,source));w.document.close();};
  const nativeOpen=window.open.bind(window);window.open=function(url,target,features){const w=nativeOpen(url,target,features);if(url===''&&/width=(900|1000)/.test(features||'')){const originalWrite=w?.document?.write?.bind(w.document);if(originalWrite)w.document.write=function(html){html=String(html).replace('@page{margin:0}','@page{size:78mm 36mm landscape;margin:0}').replace('body{margin:0;font-family:Arial}','body{margin:0;padding:0;width:78mm;height:36mm;font-family:Arial}').replace('.sheet{display:flex;gap:2mm;flex-wrap:wrap}', '.sheet{width:78mm;height:36mm;display:flex;flex-direction:row;flex-wrap:nowrap;gap:2mm;padding:0 2mm;box-sizing:border-box}').replace('.label{width:36mm;height:36mm;padding:2mm;box-sizing:border-box;', '.label{flex:0 0 36mm;width:36mm;height:36mm;padding:2mm;box-sizing:border-box;');originalWrite(html);};}return w;};
})();
