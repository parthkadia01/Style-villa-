(function(){
  function esc(s){return String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));}
  function barcodeSvg(value){
    try{if(typeof window.JsBarcode!=='function')return '';const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','bag-barcode');window.JsBarcode(svg,String(value||''),{format:'CODE128',displayValue:false,margin:0,height:54,width:1.55});return svg.outerHTML;}catch(e){return '';}
  }
  function build(no,items,bill,customer,source){
    const rows=items.map((it,i)=>({it,s:source[i]||{},i}));
    let h='<!doctype html><html><head><meta charset="utf-8"><title>Fashion Factory Labels</title><style>'+
      '@page{size:78mm 36mm landscape;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0;width:78mm;height:36mm;background:#fff;font-family:Arial,Helvetica,sans-serif;color:#000}'+
      '.row{width:78mm;height:36mm;display:flex;flex-direction:row;flex-wrap:nowrap;gap:2mm;padding:0 2mm;margin:0;page-break-after:always;break-after:page;page-break-inside:avoid;break-inside:avoid}'+
      '.label{flex:0 0 36mm;width:36mm;height:36mm;padding:1.05mm 1.2mm .7mm;overflow:hidden;display:flex;flex-direction:column;align-items:center;background:#fff}'+
      '.brand{width:100%;text-align:center;font-size:7.5px;line-height:1;font-weight:900;padding-bottom:.8mm;border-bottom:1px solid #000;margin-bottom:.8mm;text-transform:uppercase;white-space:nowrap;overflow:hidden}'+
      '.customer{width:100%;text-align:center;font-size:8.4px;line-height:1.02;font-weight:900;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:.65mm}'+
      '.bill-label{font-size:6px;line-height:1;font-weight:900;text-align:center;text-transform:uppercase;margin-bottom:.15mm}.bill-value{font-size:8.8px;line-height:1;font-weight:900;text-align:center;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;margin-bottom:.55mm}'+
      '.info{font-size:6.2px;line-height:1;font-weight:900;text-align:center;text-transform:uppercase;margin-bottom:.4mm;white-space:nowrap}.qty{font-size:8.8px;line-height:1;font-weight:900;text-align:center;text-transform:uppercase;margin:.1mm 0 .35mm;white-space:nowrap}'+
      '.bag-barcode{display:block;width:32mm;height:11.2mm;margin:auto 0 .1mm}.bag-human{font-size:5.8px;line-height:1;font-weight:900;text-align:center;margin-top:.15mm;text-transform:uppercase;max-width:32mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
      '.item-name{font-size:7px;line-height:1.05;font-weight:900;text-transform:uppercase;text-align:center;margin-bottom:.4mm;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
      '.measure-wrap{width:32.2mm;height:14.4mm;border:1px solid #000;border-radius:1.4mm;display:flex;align-items:stretch;justify-content:center;margin-top:.45mm;overflow:hidden;flex:0 0 auto}'+
      '.side-letter{width:5.8mm;display:flex;align-items:center;justify-content:center;font-size:13.5px;line-height:1;font-weight:900}.measure-col{width:8.1mm;display:flex;flex-direction:column;align-items:center;justify-content:center}.measure-value{font-size:10.8px;line-height:1;font-weight:900}.measure-line{width:6.8mm;border-top:1px solid #000;margin:.72mm 0}.measure-divider{height:100%;border-left:1px solid #000}'+
      '.jeans-row{width:32.2mm;display:flex;gap:1.2mm;justify-content:center;margin-top:.5mm}.jeans-box{width:15.5mm;height:13mm;border:1px solid #000;border-radius:1.4mm;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:.5mm}.jeans-title{font-size:4.8px;line-height:1;font-weight:900;text-transform:uppercase;margin-bottom:.8mm}.jeans-value{font-size:10px;line-height:1;font-weight:900}.other{width:32mm;border:1px solid #000;border-radius:1.4mm;padding:1.4mm;font-size:6px;line-height:1.1;font-weight:900;text-align:center;margin-top:.5mm;max-height:12mm;overflow:hidden}.date{font-size:6.3px;line-height:1;font-weight:900;text-align:center;text-transform:uppercase;margin-top:auto;padding-top:.45mm;white-space:nowrap}.product-label .brand{margin-bottom:.7mm}.product-label .customer{font-size:8.2px;margin-bottom:.55mm}.product-label .bill-value{margin-bottom:.45mm}.product-label .item-name{margin-bottom:.25mm}.product-label .measure-wrap{margin-top:.35mm}'+
      '</style></head><body>';
    rows.forEach(({s})=>{
      const type=s.item_type||'',isJeans=type==='Jeans',isOther=type==='Other Item';
      const f1=s.measurements?.f1||'—',f2=s.measurements?.f2||'—',s1=s.measurements?.s1||'—',s2=s.measurements?.s2||'—',length=s.measurements?.length||'—',waist=s.measurements?.waist||'—',billValue=bill||'—',customerValue=customer||'—';
      h+='<div class="row">';
      h+='<div class="label bag-label"><div class="brand">FASHION FACTORY</div><div class="customer">'+esc(customerValue)+'</div><div class="bill-label">BILL NO.</div><div class="bill-value">'+esc(billValue)+'</div><div class="info">DELIVERY: '+esc(s.delivery_date||'—')+'</div><div class="qty">QTY: '+esc(s.quantity||1)+'</div>'+barcodeSvg(billValue)+'<div class="bag-human">'+esc(billValue)+'</div></div>';
      h+='<div class="label product-label"><div class="brand">FASHION FACTORY</div><div class="customer">'+esc(customerValue)+'</div><div class="bill-label">BILL NO.</div><div class="bill-value">'+esc(billValue)+'</div><div class="item-name">'+esc(type||'—')+' • QTY '+esc(s.quantity||1)+'</div>';
      if(isJeans)h+='<div class="jeans-row"><div class="jeans-box"><div class="jeans-title">LENGTH CUTTING</div><div class="jeans-value">'+esc(length)+'</div></div><div class="jeans-box"><div class="jeans-title">KAMAR FITTING</div><div class="jeans-value">'+esc(waist)+'</div></div></div>';
      else if(isOther)h+='<div class="other">'+esc(s.alteration_details||'—')+'</div>';
      else h+='<div class="measure-wrap"><div class="side-letter">F</div><div class="measure-col"><div class="measure-value">'+esc(f1)+'</div><div class="measure-line"></div><div class="measure-value">'+esc(f2)+'</div></div><div class="measure-divider"></div><div class="measure-col"><div class="measure-value">'+esc(s1)+'</div><div class="measure-line"></div><div class="measure-value">'+esc(s2)+'</div></div><div class="side-letter">S</div></div>';
      h+='<div class="date">DELIVERY: '+esc(s.delivery_date||'—')+'</div></div></div>';
    });
    h+='</body></html>';return h;
  }
  window.printLabels=function(no,items,bill,customer,source){const w=window.open('','_blank','width=1000,height=700');if(!w){alert('Allow pop-ups to print labels.');return;}w.document.write(build(no,items,bill,customer,source));w.document.close();setTimeout(()=>w.print(),500);};
})();
