(function(){
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function jsSafe(s){return String(s??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' ');}
  function build(no,items,bill,customer,source){
    const rows=items.map((it,i)=>({it,s:source[i]||{},i}));
    let h='<!doctype html><html><head><meta charset="utf-8"><title>Fashion Factory Labels</title><style>'+
      '@page{size:78mm 36mm landscape;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0;width:78mm;height:36mm;background:#fff;font-family:Arial,sans-serif}'+
      '.row{width:78mm;height:36mm;display:flex;flex-direction:row;flex-wrap:nowrap;gap:2mm;padding:0 2mm;margin:0;page-break-after:always;break-after:page;page-break-inside:avoid;break-inside:avoid}'+
      '.label{flex:0 0 36mm;width:36mm;height:36mm;padding:1.25mm 1.25mm .7mm;overflow:hidden;display:flex;flex-direction:column}'+
      '.brand{text-align:center;font-size:6.8px;line-height:1;font-weight:900;letter-spacing:.1px;margin-bottom:.9mm}'+
      '.customer{font-size:7.6px;line-height:1.05;font-weight:900;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:.8mm}'+
      '.bill{font-size:7.3px;line-height:1.05;font-weight:900;margin-bottom:.7mm}.small{font-size:6.2px;line-height:1.12;font-weight:800}'+
      '.bag-code{font-size:5.4px;line-height:1;font-weight:900;text-align:center;margin-top:.4mm}.bag-barcode{display:block;width:100%;height:13mm;margin-top:auto}'+
      '.product-customer{font-size:7.3px;line-height:1.05;font-weight:900;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:.7mm}'+
      '.product-meta{font-size:6.5px;line-height:1.12;font-weight:900;margin-bottom:.7mm}.qty{font-size:6.5px;line-height:1;font-weight:900;margin-bottom:.5mm}'+
      '.fit-row{display:flex;gap:1.5mm;justify-content:center;margin-top:.5mm}.fit-box{width:15.8mm;height:14.7mm;border:1px solid #111;border-radius:1.4mm;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:.6mm}'+
      '.fit-title{font-size:5.6px;line-height:1;font-weight:900;margin-bottom:1mm}.fit-value{font-size:10.5px;line-height:1;font-weight:900}.fit-line{width:11mm;border-top:1px solid #111;margin:1.1mm 0}.fit-single{font-size:6px;line-height:1.1;font-weight:900;text-align:center;margin-top:2mm;max-height:10mm;overflow:hidden}'+
      '.date{text-align:center;font-size:6.2px;line-height:1;font-weight:900;margin-top:auto;margin-bottom:.4mm}.product-barcode{display:block;width:100%;height:10.5mm;margin-top:.2mm}.product-code{text-align:center;font-size:4.7px;line-height:1;font-weight:800;margin-top:.15mm}'+
      '</style></head><body>';
    rows.forEach(({it,s,i})=>{
      const type=s.item_type||''; const isJeans=type==='Jeans'; const isOther=type==='Other Item';
      const f1=s.measurements?.f1||'—',f2=s.measurements?.f2||'—',s1=s.measurements?.s1||'—',s2=s.measurements?.s2||'—';
      const length=s.measurements?.length||'—',waist=s.measurements?.waist||'—';
      const billValue=bill||'—';
      h+='<div class="row"><div class="label">'+
        '<div class="brand">FASHION FACTORY</div>'+ 
        '<div class="customer">'+esc(customer||'—')+'</div>'+ 
        '<div class="bill">BILL NO: '+esc(billValue)+'</div>'+ 
        '<div class="small">DELIVERY: '+esc(s.delivery_date||'—')+'</div>'+ 
        '<div class="small">QTY: '+esc(s.quantity||1)+'</div>'+ 
        '<svg class="bag-barcode" id="b'+i+'"></svg>'+ 
        '<div class="bag-code">'+esc(billValue)+'</div>'+ 
      '</div>';
      h+='<div class="label">'+
        '<div class="brand">FASHION FACTORY</div>'+ 
        '<div class="product-customer">'+esc(customer||'—')+'</div>'+ 
        '<div class="product-meta">BILL NO: '+esc(billValue)+'<br>ITEM: '+esc(type||'—')+'</div>'+ 
        '<div class="qty">QTY: '+esc(s.quantity||1)+'</div>';
      if(isJeans){
        h+='<div class="fit-row"><div class="fit-box"><div class="fit-title">LENGTH CUTTING</div><div class="fit-value">'+esc(length)+'</div></div><div class="fit-box"><div class="fit-title">KAMAR FITTING</div><div class="fit-value">'+esc(waist)+'</div></div></div>';
      } else if(isOther){
        h+='<div class="fit-single">'+esc(s.alteration_details||'—')+'</div>';
      } else {
        h+='<div class="fit-row"><div class="fit-box"><div class="fit-title">F</div><div class="fit-value">'+esc(f1)+'</div><div class="fit-line"></div><div class="fit-value">'+esc(f2)+'</div></div><div class="fit-box"><div class="fit-title">S</div><div class="fit-value">'+esc(s1)+'</div><div class="fit-line"></div><div class="fit-value">'+esc(s2)+'</div></div></div>';
      }
      h+='<div class="date">DATE: '+esc(s.delivery_date||'—')+'</div>'+ 
        '<svg class="product-barcode" id="p'+i+'"></svg>'+ 
        '<div class="product-code">'+esc(it.product_barcode||'')+'</div>'+ 
      '</div></div>';
    });
    h+='<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script><script>window.onload=function(){';
    rows.forEach(({i})=>{
      h+="JsBarcode('#b"+i+"','"+jsSafe(bill||'')+"',{format:'CODE128',displayValue:false,margin:0,height:48,width:1.55});";
      h+="JsBarcode('#p"+i+"','"+jsSafe(rows[i].it.product_barcode||'')+"',{format:'CODE128',displayValue:false,margin:0,height:42,width:1.35});";
    });
    h+='setTimeout(function(){window.print()},700)}<\\/script></body></html>';return h;
  }
  window.printLabels=function(no,items,bill,customer,source){const w=window.open('','_blank','width=1000,height=700');if(!w){alert('Allow pop-ups to print labels.');return;}w.document.write(build(no,items,bill,customer,source));w.document.close();};
  const nativeOpen=window.open.bind(window);window.open=function(url,target,features){const w=nativeOpen(url,target,features);if(url===''&&/width=(900|1000)/.test(features||'')){const originalWrite=w?.document?.write?.bind(w.document);if(originalWrite)w.document.write=function(html){html=String(html).replace('@page{margin:0}','@page{size:78mm 36mm landscape;margin:0}').replace('body{margin:0;font-family:Arial}','body{margin:0;padding:0;width:78mm;height:36mm;font-family:Arial}').replace('.sheet{display:flex;gap:2mm;flex-wrap:wrap}', '.sheet{width:78mm;height:36mm;display:flex;flex-direction:row;flex-wrap:nowrap;gap:2mm;padding:0 2mm;box-sizing:border-box}').replace('.label{width:36mm;height:36mm;padding:2mm;box-sizing:border-box;', '.label{flex:0 0 36mm;width:36mm;height:36mm;padding:2mm;box-sizing:border-box;');originalWrite(html);};}return w;};
})();
