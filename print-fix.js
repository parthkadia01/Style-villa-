(function(){
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function jsSafe(s){return String(s??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' ');}
  window.printLabels=function(no,items,bill,customer,source){
    const w=window.open('','_blank','width=1000,height=700');
    if(!w){alert('Allow pop-ups to print labels.');return;}
    const rows=items.map((it,i)=>{
      const s=source[i]||{};
      let detail='';
      if(s.item_type==='Other Item') detail=s.alteration_details||'—';
      else if(s.item_type==='Jeans') detail='Length '+(s.measurements?.length||'—')+' • Kamar '+(s.measurements?.waist||'—');
      else detail='F '+(s.measurements?.f1||'—')+' '+(s.measurements?.f2||'—')+' • S '+(s.measurements?.s1||'—')+' '+(s.measurements?.s2||'—');
      return {it,s,i,detail};
    });
    let h='<!doctype html><html><head><meta charset="utf-8"><title>Fashion Factory Labels</title><style>'+
      '@page{size:78mm 36mm landscape;margin:0}'+
      '*{box-sizing:border-box}'+
      'html,body{margin:0;padding:0;width:78mm;height:auto;background:#fff;font-family:Arial,sans-serif}'+
      '.row{width:78mm;height:36mm;display:flex;flex-direction:row;flex-wrap:nowrap;gap:2mm;padding:0 2mm;margin:0;page-break-after:always;break-after:page;page-break-inside:avoid;break-inside:avoid}'+
      '.label{flex:0 0 36mm;width:36mm;height:36mm;padding:1.6mm 1.5mm 1.2mm;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between}'+
      '.brand{text-align:center;font-size:7px;line-height:1;font-weight:900;letter-spacing:.25px;margin-bottom:.4mm}'+
      '.txt{font-size:6.3px;line-height:1.2}'+
      '.detail{font-size:6.5px;line-height:1.18;font-weight:800;word-break:break-word}'+
      '.barcode{display:block;width:100%;height:8.5mm}'+
      '.code{text-align:center;font-size:5.5px;line-height:1;font-weight:700;margin-top:.2mm}'+
      '</style></head><body>';
    rows.forEach(({it,s,i,detail})=>{
      h+='<div class="row">';
      h+='<div class="label"><div class="brand">FASHION FACTORY</div><div class="txt"><b>Bill:</b> '+esc(bill||'—')+'<br><b>Customer:</b> '+esc(customer||'—')+'<br><b>Delivery:</b> '+esc(s.delivery_date||'—')+'<br><b>Qty:</b> '+esc(s.quantity||1)+'</div><svg class="barcode" id="b'+i+'"></svg><div class="code">'+esc(it.bag_barcode||'')+'</div></div>';
      h+='<div class="label"><div class="brand">FASHION FACTORY</div><div class="txt"><b>Bill:</b> '+esc(bill||'—')+'<br><b>Delivery:</b> '+esc(s.delivery_date||'—')+'</div><div class="detail">'+esc(detail)+'</div><svg class="barcode" id="p'+i+'"></svg><div class="code">'+esc(it.product_barcode||'')+'</div></div>';
      h+='</div>';
    });
    h+='<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script><script>window.onload=function(){';
    rows.forEach(({it,i})=>{
      h+="JsBarcode('#b"+i+"','"+jsSafe(it.bag_barcode||'')+"',{format:'CODE128',displayValue:false,margin:0,height:32,width:1.05});";
      h+="JsBarcode('#p"+i+"','"+jsSafe(it.product_barcode||'')+"',{format:'CODE128',displayValue:false,margin:0,height:32,width:1.05});";
    });
    h+='setTimeout(function(){window.print()},700)}<\\/script></body></html>';
    w.document.write(h);w.document.close();
  };
})();
