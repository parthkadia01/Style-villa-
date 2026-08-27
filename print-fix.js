(function(){
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function jsSafe(s){return String(s??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' ');}
  function build(no,items,bill,customer,source){
    const rows=items.map((it,i)=>({it,s:source[i]||{},i}));
    let h='<!doctype html><html><head><meta charset="utf-8"><title>Fashion Factory Labels</title><style>'+
      '@page{size:78mm 36mm landscape;margin:0}'+
      '*{box-sizing:border-box}'+
      'html,body{margin:0;padding:0;width:78mm;height:36mm;background:#fff;font-family:Arial,Helvetica,sans-serif;color:#000}'+
      '.row{width:78mm;height:36mm;display:flex;flex-direction:row;flex-wrap:nowrap;gap:2mm;padding:0 2mm;margin:0;page-break-after:always;break-after:page;page-break-inside:avoid;break-inside:avoid}'+
      '.label{flex:0 0 36mm;width:36mm;height:36mm;padding:1.35mm 1.35mm 1mm;overflow:hidden;display:flex;flex-direction:column;align-items:center}'+
      '.brand{width:100%;text-align:center;font-size:7.1px;line-height:1;font-weight:900;letter-spacing:.1px;padding-bottom:1.05mm;border-bottom:1px solid #000;margin-bottom:1.25mm}'+
      '.customer{width:100%;text-align:center;font-size:7.9px;line-height:1.05;font-weight:900;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:1mm}'+
      '.bill-label{font-size:6.1px;line-height:1;font-weight:900;text-align:center;margin-bottom:.35mm}'+
      '.bill-value{font-size:8.2px;line-height:1.05;font-weight:900;text-align:center;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;margin-bottom:1mm}'+
      '.info{font-size:6.3px;line-height:1.05;font-weight:900;text-align:center;margin-bottom:.6mm}'+
      '.qty{font-size:8.1px;line-height:1;font-weight:900;text-align:center;margin:.35mm 0 .7mm}'+
      '.bag-barcode{display:block;width:31mm;height:12.5mm;margin:auto 0 0}'+
      '.bag-human{font-size:5.8px;line-height:1;font-weight:900;text-align:center;margin-top:.35mm;text-transform:uppercase;max-width:31mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
      '.item-name{font-size:6.7px;line-height:1.05;font-weight:900;text-transform:uppercase;text-align:center;margin-bottom:.65mm;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
      '.measure-wrap{width:32mm;min-height:15.3mm;border:1px solid #000;border-radius:1.5mm;display:flex;align-items:stretch;justify-content:center;margin-top:.45mm;overflow:hidden}'+
      '.side-letter{width:6mm;display:flex;align-items:center;justify-content:center;font-size:13px;line-height:1;font-weight:900}'+
      '.measure-col{width:8.2mm;display:flex;flex-direction:column;align-items:center;justify-content:center}'+
      '.measure-value{font-size:10.5px;line-height:1;font-weight:900}'+
      '.measure-line{width:7mm;border-top:1px solid #000;margin:1.05mm 0}'+
      '.measure-divider{height:100%;border-left:1px solid #000}'+
      '.jeans-row{width:32mm;display:flex;gap:1.5mm;justify-content:center;margin-top:.7mm}'+
      '.jeans-box{width:15.25mm;height:14.2mm;border:1px solid #000;border-radius:1.5mm;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:.6mm}'+
      '.jeans-title{font-size:5.3px;line-height:1.05;font-weight:900;text-transform:uppercase;margin-bottom:1.1mm}'+
      '.jeans-value{font-size:10.8px;line-height:1;font-weight:900}'+
      '.other{width:32mm;border:1px solid #000;border-radius:1.5mm;padding:2mm;font-size:6.4px;line-height:1.15;font-weight:900;text-align:center;margin-top:1mm;max-height:14mm;overflow:hidden}'+
      '.date{font-size:6.4px;line-height:1;font-weight:900;text-align:center;margin-top:auto;padding-top:.6mm}'+
      '</style></head><body>';
    rows.forEach(({it,s,i})=>{
      const type=s.item_type||'';const isJeans=type==='Jeans';const isOther=type==='Other Item';
      const f1=s.measurements?.f1||'—',f2=s.measurements?.f2||'—',s1=s.measurements?.s1||'—',s2=s.measurements?.s2||'—';
      const length=s.measurements?.length||'—',waist=s.measurements?.waist||'—';
      const billValue=bill||'—',customerValue=customer||'—';
      h+='<div class="row">';
      h+='<div class="label">'+
        '<div class="brand">FASHION FACTORY</div>'+ 
        '<div class="customer">'+esc(customerValue)+'</div>'+ 
        '<div class="bill-label">BILL NO.</div>'+ 
        '<div class="bill-value">'+esc(billValue)+'</div>'+ 
        '<div class="info">DELIVERY: '+esc(s.delivery_date||'—')+'</div>'+ 
        '<div class="qty">QTY: '+esc(s.quantity||1)+'</div>'+ 
        '<svg class="bag-barcode" id="b'+i+'"></svg>'+ 
        '<div class="bag-human">'+esc(billValue)+'</div>'+ 
      '</div>';
      h+='<div class="label">'+
        '<div class="brand">FASHION FACTORY</div>'+ 
        '<div class="customer">'+esc(customerValue)+'</div>'+ 
        '<div class="bill-label">BILL NO.</div>'+ 
        '<div class="bill-value">'+esc(billValue)+'</div>'+ 
        '<div class="item-name">'+esc(type||'—')+'</div>'+ 
        '<div class="info">QTY: '+esc(s.quantity||1)+'</div>';
      if(isJeans){
        h+='<div class="jeans-row"><div class="jeans-box"><div class="jeans-title">LENGTH CUTTING</div><div class="jeans-value">'+esc(length)+'</div></div><div class="jeans-box"><div class="jeans-title">KAMAR FITTING</div><div class="jeans-value">'+esc(waist)+'</div></div></div>';
      }else if(isOther){
        h+='<div class="other">'+esc(s.alteration_details||'—')+'</div>';
      }else{
        h+='<div class="measure-wrap">'+
          '<div class="side-letter">S</div>'+ 
          '<div class="measure-col"><div class="measure-value">'+esc(s1)+'</div><div class="measure-line"></div><div class="measure-value">'+esc(s2)+'</div></div>'+ 
          '<div class="measure-divider"></div>'+ 
          '<div class="measure-col"><div class="measure-value">'+esc(f1)+'</div><div class="measure-line"></div><div class="measure-value">'+esc(f2)+'</div></div>'+ 
          '<div class="side-letter">F</div>'+ 
        '</div>';
      }
      h+='<div class="date">DELIVERY: '+esc(s.delivery_date||'—')+'</div></div></div>';
    });
    h+='<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script><script>window.onload=function(){';
    rows.forEach(({i})=>{h+="JsBarcode('#b"+i+"','"+jsSafe(bill||'')+"',{format:'CODE128',displayValue:false,margin:0,height:47,width:1.45});";});
    h+='setTimeout(function(){window.print()},700)}<\\/script></body></html>';return h;
  }
  window.printLabels=function(no,items,bill,customer,source){const w=window.open('','_blank','width=1000,height=700');if(!w){alert('Allow pop-ups to print labels.');return;}w.document.write(build(no,items,bill,customer,source));w.document.close();};
})();
