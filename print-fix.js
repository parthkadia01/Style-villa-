(function(){
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function jsSafe(s){return String(s??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' ');}
  function build(no,items,bill,customer,source){
    const rows=items.map((it,i)=>({it,s:source[i]||{},i}));
    const cust=String(customer||'—').toUpperCase();
    let h='<!doctype html><html><head><meta charset="utf-8"><title>Fashion Factory Labels</title><style>'+
      '@page{size:78mm 36mm landscape;margin:0}'+
      '*{box-sizing:border-box}html,body{margin:0;padding:0;width:78mm;height:36mm;background:#fff;font-family:Arial,sans-serif}'+
      '.row{width:78mm;height:36mm;display:flex;flex-direction:row;flex-wrap:nowrap;gap:2mm;padding:0 2mm;margin:0;page-break-after:always;break-after:page;page-break-inside:avoid}'+
      '.label{flex:0 0 36mm;width:36mm;height:36mm;padding:1.5mm;overflow:hidden;display:flex;flex-direction:column}'+
      '.bag{justify-content:space-between}.product{justify-content:flex-start}'+
      '.brand{text-align:center;font-size:8px;line-height:1;font-weight:900;letter-spacing:.15px;white-space:nowrap;margin-bottom:1mm}'+
      '.name{text-align:center;font-size:9px;line-height:1.05;font-weight:900;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:1.5mm}'+
      '.bill{font-size:8px;line-height:1.25;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
      '.small{font-size:7px;line-height:1.2;font-weight:800;margin-top:.6mm}'+
      '.fit-title{text-align:center;font-size:8px;font-weight:900;line-height:1;margin:2mm 0 1.2mm}'+
      '.measure-grid{display:grid;grid-template-columns:1fr 1fr;gap:2mm;width:100%}'+
      '.measure-box{border:1px solid #111;border-radius:1mm;padding:1mm;text-align:center}'+
      '.measure-head{font-size:7px;font-weight:900;line-height:1;margin-bottom:1mm}'+
      '.measure-value{font-size:13px;font-weight:900;line-height:1.05;padding:1mm 0}'+
      '.measure-value+.measure-value{border-top:1px solid #111}'+
      '.other{font-size:7px;font-weight:800;line-height:1.2;border:1px solid #111;border-radius:1mm;padding:1.2mm}'+
      '.barcode{display:block;width:100%;height:6mm;margin-top:auto}.code{text-align:center;font-size:6px;font-weight:900;line-height:1;margin-top:.4mm}'+
      '</style></head><body>';
    rows.forEach(({it,s,i})=>{
      const m=s.measurements||{};
      h+='<div class="row">';
      h+='<div class="label bag"><div><div class="brand">FASHION FACTORY</div><div class="name">'+esc(cust)+'</div><div class="bill">BILL NO: '+esc(bill||'—')+'</div><div class="small">DELIVERY: '+esc(s.delivery_date||'—')+'</div><div class="small">QTY: '+esc(s.quantity||1)+'</div></div><svg class="barcode" id="b'+i+'"></svg><div class="code">BAG • '+esc(it.bag_barcode||'')+'</div></div>';
      h+='<div class="label product"><div class="brand">FASHION FACTORY</div><div class="bill">BILL NO: '+esc(bill||'—')+'</div><div class="name" style="font-size:8px;margin-top:1mm">'+esc(cust)+'</div>';
      if(s.item_type==='Jeans'){
        h+='<div class="fit-title">JEANS</div><div class="measure-grid"><div class="measure-box"><div class="measure-head">LENGTH CUTTING</div><div class="measure-value">'+esc(m.length||'—')+'</div></div><div class="measure-box"><div class="measure-head">KAMAR FITTING</div><div class="measure-value">'+esc(m.waist||'—')+'</div></div></div>';
      }else if(s.item_type==='Other Item'){
        h+='<div class="fit-title">OTHER ITEM</div><div class="other">'+esc(s.alteration_details||'—')+'</div>';
      }else{
        h+='<div class="fit-title">FITTING</div><div class="measure-grid"><div class="measure-box"><div class="measure-head">F</div><div class="measure-value">'+esc(m.f1||'—')+'</div><div class="measure-value">'+esc(m.f2||'—')+'</div></div><div class="measure-box"><div class="measure-head">S</div><div class="measure-value">'+esc(m.s1||'—')+'</div><div class="measure-value">'+esc(m.s2||'—')+'</div></div></div>';
      }
      h+='<div class="small" style="text-align:center;margin-top:1mm">DELIVERY: '+esc(s.delivery_date||'—')+'</div><svg class="barcode" id="p'+i+'"></svg><div class="code">PRODUCT • '+esc(it.product_barcode||'')+'</div></div></div>';
    });
    h+='<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script><script>window.onload=function(){';
    rows.forEach(({it,i})=>{h+="JsBarcode('#b"+i+"','"+jsSafe(it.bag_barcode||'')+"',{format:'CODE128',displayValue:false,margin:0,height:18,width:1.05});";h+="JsBarcode('#p"+i+"','"+jsSafe(it.product_barcode||'')+"',{format:'CODE128',displayValue:false,margin:0,height:18,width:1.05});";});
    h+='setTimeout(function(){window.print()},700)}<\\/script></body></html>';return h;
  }
  window.printLabels=function(no,items,bill,customer,source){const w=window.open('','_blank','width=1000,height=700');if(!w){alert('Allow pop-ups to print labels.');return;}w.document.write(build(no,items,bill,customer,source));w.document.close();};
  const nativeOpen=window.open.bind(window);window.open=function(url,target,features){const w=nativeOpen(url,target,features);if(url===''&&/width=(900|1000)/.test(features||'')){const ow=w?.document?.write?.bind(w.document);if(ow)w.document.write=function(html){html=String(html).replace('@page{margin:0}','@page{size:78mm 36mm landscape;margin:0}').replace('body{margin:0;font-family:Arial}','body{margin:0;padding:0;width:78mm;height:36mm;font-family:Arial}').replace('.sheet{display:flex;gap:2mm;flex-wrap:wrap}','.sheet{width:78mm;height:36mm;display:flex;flex-direction:row;flex-wrap:nowrap;gap:2mm;padding:0 2mm;box-sizing:border-box}').replace('.label{width:36mm;height:36mm;padding:2mm;box-sizing:border-box;','.label{flex:0 0 36mm;width:36mm;height:36mm;padding:2mm;box-sizing:border-box;');ow(html);};}return w;};
})();
