/* Month-wise tailor/item PCS reporting and Admin item master. */
(function(){
  const escR=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  const KEY='ff_item_master_v1';
  const defaults=['Kurti Set','Jeans','Crop Top','Other Item'];
  function getItems(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(Array.isArray(x)&&x.length)return x; }catch(e){} return defaults.map(name=>({name,active:true}));}
  function saveItems(x){localStorage.setItem(KEY,JSON.stringify(x));window.ffItemNames=x.filter(i=>i.active).map(i=>i.name);}
  saveItems(getItems());
  window.ffItemNames=getItems().filter(i=>i.active).map(i=>i.name);
  window.ffGetItemMaster=getItems;
  window.ffOpenItemMaster=function(){
    const modal=document.getElementById('ffRuntimeModal');modal?.remove();
    const d=document.createElement('div');d.id='ffRuntimeModal';d.className='modal-backdrop';
    function render(){const items=getItems();d.innerHTML='<div class="modal"><div class="job-head"><div class="title" style="font-size:20px">ITEM MASTER</div><button class="secondary" id="ffClose">×</button></div><div class="muted" style="margin-top:6px">Add new fitting items or remove items from future alterations. Old report data stays safe.</div><div style="display:flex;gap:8px;margin-top:14px"><input id="ffNewItem" class="search" placeholder="Enter item name"><button class="primary" id="ffAdd">＋ ADD</button></div><div id="ffItems" style="margin-top:12px">'+items.map((i,n)=>'<div class="timeline-item" style="display:flex;align-items:center;justify-content:space-between;gap:10px"><div><b>'+escR(i.name)+'</b><br><span class="muted">'+(i.active?'ACTIVE':'REMOVED')+'</span></div>'+(i.active?'<button class="danger small" data-remove="'+n+'">REMOVE</button>':'<button class="secondary small" data-restore="'+n+'">RESTORE</button>')+'</div>').join('')+'</div></div>';
      d.querySelector('#ffClose').onclick=()=>d.remove();
      d.addEventListener('click',e=>{if(e.target===d)d.remove()});
      d.querySelector('#ffAdd').onclick=()=>{const v=d.querySelector('#ffNewItem').value.trim();if(!v)return;if(items.some(i=>i.name.toLowerCase()===v.toLowerCase())){alert('This item already exists.');return}items.push({name:v,active:true});saveItems(items);render()};
      d.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{items[Number(b.dataset.remove)].active=false;saveItems(items);render()});
      d.querySelectorAll('[data-restore]').forEach(b=>b.onclick=()=>{items[Number(b.dataset.restore)].active=true;saveItems(items);render()});
    }
    document.body.appendChild(d);render();
  };
  const monthKey=d=>{if(!d)return '';const x=new Date(d);return isNaN(x)?'':new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit'}).format(x)};
  const monthLabel=m=>{const [y,mo]=m.split('-');return new Date(Number(y),Number(mo)-1,1).toLocaleDateString('en-IN',{month:'long',year:'numeric'})};
  const itemOf=j=>j.item_type||'Other Item';
  const qty=j=>Number(j.quantity||1);
  function reportHtml(month){
    const all=jobs||[], active=getItems().filter(i=>i.active).map(i=>i.name), data=all.filter(j=>monthKey(j.alteration?.created_at||j.created_at)===month);
    const names=[...new Set([...active,...data.map(itemOf)])];
    const tailors=[...new Set(data.map(j=>j.tailor?.name||'Unassigned'))].sort();
    const matrix={};names.forEach(i=>matrix[i]={});tailors.forEach(t=>names.forEach(i=>matrix[i][t]=0));
    data.forEach(j=>{const t=j.tailor?.name||'Unassigned',i=itemOf(j);if(!matrix[i])matrix[i]={};matrix[i][t]=(matrix[i][t]||0)+qty(j)});
    const rows=tailors.map(t=>'<tr><td><b>'+escR(t)+'</b></td>'+names.map(i=>'<td>'+((matrix[i]||{})[t]||0)+'</td>').join('')+'<td><b>'+names.reduce((n,i)=>n+((matrix[i]||{})[t]||0),0)+'</b></td></tr>').join('');
    const totals=names.map(i=>data.filter(j=>itemOf(j)===i).reduce((n,j)=>n+qty(j),0));
    return '<table id="ffReportTable"><thead><tr><th>TAILOR</th>'+names.map(i=>'<th>'+escR(i).toUpperCase()+'</th>').join('')+'<th>TOTAL PCS</th></tr></thead><tbody>'+rows+'</tbody><tfoot><tr><th>TOTAL PCS</th>'+totals.map(n=>'<th>'+n+'</th>').join('')+'<th>'+totals.reduce((a,b)=>a+b,0)+'</th></tr></tfoot></table>';
  }
  function openReport(){
    const all=jobs||[], months=[...new Set(all.map(j=>monthKey(j.alteration?.created_at||j.created_at)).filter(Boolean))].sort().reverse();if(!months.length)months.push(monthKey(new Date()));
    const d=document.createElement('div');d.id='ffRuntimeModal';d.className='modal-backdrop';d.innerHTML='<div class="modal report-modal"><div class="job-head"><div><div class="title" style="font-size:20px">FITTING PCS REPORT</div><div class="muted">MONTH-WISE • TAILOR-WISE • ITEM-WISE</div></div><button class="secondary" id="ffClose">×</button></div><div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><select id="ffMonth" class="search" style="flex:1;min-width:190px">'+months.map(m=>'<option value="'+m+'">'+monthLabel(m)+'</option>').join('')+'</select><button class="primary" id="ffExcel">EXCEL</button><button class="secondary" id="ffPdf">PDF</button><button class="secondary" id="ffItems">ITEM MASTER</button></div><div id="ffReport" style="overflow:auto;margin-top:14px">'+reportHtml(months[0])+'</div></div>';
    document.body.appendChild(d);d.querySelector('#ffClose').onclick=()=>d.remove();d.addEventListener('click',e=>{if(e.target===d)d.remove()});
    const update=()=>d.querySelector('#ffReport').innerHTML=reportHtml(d.querySelector('#ffMonth').value);d.querySelector('#ffMonth').onchange=update;d.querySelector('#ffItems').onclick=()=>window.ffOpenItemMaster();
    d.querySelector('#ffExcel').onclick=()=>downloadExcel(d.querySelector('#ffMonth').value,d.querySelector('#ffReport').innerHTML);
    d.querySelector('#ffPdf').onclick=()=>printPdf(d.querySelector('#ffMonth').value,d.querySelector('#ffReport').innerHTML);
  }
  function downloadExcel(month,table){const html='<html><head><meta charset="UTF-8"></head><body><h2>FASHION FACTORY</h2><h3>TAILOR-WISE ITEM-WISE FITTING PCS REPORT - '+escR(monthLabel(month))+'</h3>'+table+'</body></html>';const blob=new Blob([html],{type:'application/vnd.ms-excel'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Fashion_Factory_Fitting_PCS_'+month+'.xls';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
  function printPdf(month,table){const w=window.open('','_blank','width=1000,height=700');if(!w){alert('Allow pop-ups to export PDF.');return}w.document.write('<!doctype html><html><head><meta charset="UTF-8"><title>Fitting PCS Report</title><style>body{font-family:Arial;padding:28px}h1,h2,h3{text-align:center;margin:4px}table{width:100%;border-collapse:collapse;margin-top:22px}th,td{border:1px solid #222;padding:9px;text-align:center}th:first-child,td:first-child{text-align:left}thead th{font-weight:900}tfoot th{font-weight:900}@page{size:A4 landscape;margin:12mm}</style></head><body><h2>FASHION FACTORY</h2><h3>TAILOR-WISE ITEM-WISE FITTING PCS REPORT</h3><div style="text-align:center">'+escR(monthLabel(month))+'</div>'+table+'</body></html>');w.document.close();w.focus();setTimeout(()=>w.print(),250)}
  window.ffOpenFittingReport=openReport;
})();
