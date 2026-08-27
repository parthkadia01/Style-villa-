
const client = supabase.createClient(window.FF_CONFIG.supabaseUrl, window.FF_CONFIG.supabaseKey);
const app = document.getElementById('app');
let session = JSON.parse(localStorage.getItem('ff_session') || 'null');
let user = session?.user || null;
let jobs = [];
let tailors = [];
let filter = 'all';

const esc = s => String(s ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
const money = n => '₹' + Number(n || 0).toLocaleString('en-IN', {maximumFractionDigits:0});
const fmt = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '-';
const statusName = s => ({pending:'PENDING',received:'RECEIVED',in_progress:'IN PROGRESS',ready:'READY',returned_to_showroom:'AT SHOWROOM',delivered:'DELIVERED',cancelled:'CANCELLED'}[s] || s);

async function api(action, payload) {
  const body = Object.assign({action:action, token:session?.token || ''}, payload || {});
  const out = await client.functions.invoke('tailor-api', {body});
  if (out.error) throw out.error;
  if (out.data && out.data.error) throw new Error(out.data.error);
  return out.data;
}

function toggleSideMenu(){
  document.getElementById('sideMenu')?.classList.toggle('open');
  document.getElementById('sideBackdrop')?.classList.toggle('open');
}
function closeSideMenu(){
  document.getElementById('sideMenu')?.classList.remove('open');
  document.getElementById('sideBackdrop')?.classList.remove('open');
}
function sideMenu(){
  if (user?.role !== 'admin') return '';
  return '<div id="sideBackdrop" class="side-backdrop" onclick="closeSideMenu()"></div>' +
    '<aside id="sideMenu" class="side-menu">' +
    '<div class="side-head"><b>Admin Menu</b><button class="secondary" onclick="closeSideMenu()">×</button></div>' +
    '<button onclick="closeSideMenu();render()">⌂ Dashboard</button>' +
    '<button onclick="closeSideMenu();customers()">⌕ Customer Search</button>' +
    '<button onclick="closeSideMenu();payment()">₹ Tailor Ledger</button>' +
    '<button onclick="closeSideMenu();reportView()">▣ Reports</button>' +
    '<button onclick="closeSideMenu();packing()">▣ Packing Material</button>' +
    '<button onclick="closeSideMenu();adminControls()">⚙ Admin Controls</button>' +
    '</aside>';
}

function header(){
  const role = user?.role === 'tailor' ? 'TAILOR' : user?.role === 'showroom' ? 'SHOWROOM' : 'ADMIN';
  return '<header class="topbar"><div class="toprow"><div class="brand"><div class="brand-mark">FF</div>' +
    '<div><div class="brand-name">FASHION FACTORY</div><div class="brand-sub">ALTERATION MANAGEMENT</div></div></div>' +
    '<div class="head-actions">' + (user?.role === 'admin' ? '<button class="menu-btn" onclick="toggleSideMenu()">☰</button>' : '') +
    '<button id="logout" class="secondary">Logout</button></div></div>' +
    '<div class="role">'+role+' VIEW • '+esc(user?.name||'')+'</div></header>' + sideMenu();
}

function jobData(j){
  const m = Array.isArray(j.measurements?.rows)
    ? j.measurements.rows.map(r => r.label + (r.value ? ': '+r.value : '')).join(' • ')
    : (j.measurements?.raw || '');
  return {
    id:j.id, number:j.alteration_no, bill:j.item_description||'', customer:j.customer?.name||'-',
    mobile:j.customer?.mobile||'', item:j.item_type||'', size:j.size||'-',
    quantity:Math.max(1,Number(j.quantity||1)), tailor:j.tailor?.name||'',
    tailorId:j.assigned_tailor_id||'', due:j.due_date, status:j.status,
    details:j.alteration_details||'', measurements:m, special:j.special_instructions||'',
    rate:Number(j.tailor_rate||0), payment:j.tailor_payment_status||'pending'
  };
}
function counts(a){
  return ['pending','in_progress','ready','returned_to_showroom','delivered'].map(s => a.filter(j=>j.status===s).length);
}
function stats(a){
  const c = counts(a);
  return '<div class="stats">' +
    '<div class="stat"><b>'+c[0]+'</b><span>Pending</span></div>' +
    '<div class="stat"><b>'+c[1]+'</b><span>In Progress</span></div>' +
    '<div class="stat"><b>'+c[2]+'</b><span>Ready</span></div>' +
    '<div class="stat"><b>'+c[3]+'</b><span>At Showroom</span></div>' +
    '<div class="stat"><b>'+c[4]+'</b><span>Delivered</span></div></div>';
}
function card(raw){
  const j = jobData(raw), isTailor = user.role === 'tailor';
  let action = '';
  if (isTailor) {
    if(j.status==='pending') action='<button class="primary" data-next="'+j.id+'" data-status="in_progress">START WORK</button>';
    else if(j.status==='in_progress') action='<button class="primary" data-next="'+j.id+'" data-status="ready">MARK READY</button>';
    else if(j.status==='ready') action='<button class="primary" data-next="'+j.id+'" data-status="returned_to_showroom">DELIVER TO SHOWROOM</button>';
  } else {
    if(j.status==='returned_to_showroom') action+='<button class="primary" data-next="'+j.id+'" data-status="delivered">DELIVER TO CUSTOMER</button>';
    action+='<button class="secondary" data-history="'+j.id+'">TIMELINE</button>';
    if(j.status!=='delivered') action+='<button class="secondary" data-assign="'+j.id+'">'+(j.tailor?'REASSIGN':'ASSIGN TAILOR')+'</button>';
    if(user.role==='admin') action+='<button class="danger" data-delete="'+j.id+'">DELETE</button>';
  }
  return '<article class="job"><div class="job-head"><div><div class="job-no">ALT-'+String(j.number).padStart(4,'0')+'</div>' +
    '<div class="bill">'+(j.bill?'Bill No. '+esc(j.bill):'Bill not entered')+'</div></div>' +
    '<span class="status '+j.status+'">'+statusName(j.status)+'</span></div>' +
    '<div class="customer">'+esc(j.customer)+'</div><div class="item">'+esc(j.item)+' • '+j.quantity+' PCS • Size '+esc(j.size)+'</div>' +
    '<div class="meta"><span class="chip">Tailor: '+esc(j.tailor||'Not Assigned')+'</span><span class="chip">Due: '+fmt(j.due)+'</span></div>' +
    '<div class="muted">'+esc(j.details)+'</div><details style="margin-top:10px"><summary>View measurements & details</summary>' +
    '<div class="detail-box"><b>Measurements</b><br>'+esc(j.measurements||'-')+'<br><br><b>Instructions</b><br>'+esc(j.special||'-')+
    '<br><br><b>Mobile</b><br>'+esc(j.mobile||'-')+'<br><br><b>Tailor Rate / Piece</b><br>'+money(j.rate)+'</div></details>' +
    '<div class="actions" style="margin-top:12px">'+action+'</div></article>';
}
function list(){
  const q=(document.getElementById('search')?.value||'').toLowerCase();
  return jobs.filter(j=>filter==='all'||j.status===filter).filter(j=>{
    const x=jobData(j);
    return [x.id,x.number,x.bill,x.customer,x.mobile,x.item,x.tailor].join(' ').toLowerCase().includes(q);
  }).map(card).join('') || '<div class="empty">No alterations found.</div>';
}
async function loadData(){
  const r=await api('list_jobs');
  jobs=r.jobs||[];
  if(user.role==='admin'||user.role==='showroom'){
    const t=await api('tailor_options'); tailors=t.tailors||[];
  }
}
function dashboard(){
  const canCreate=user.role==='admin'||user.role==='showroom';
  return header()+'<main class="page"><div class="hero-row"><div><div class="title">'+(user.role==='tailor'?'Hi, '+esc(user.name)+' 👋':'Fashion Factory')+'</div>' +
    '<div class="muted">'+(user.role==='tailor'?'Only your active jobs are shown':'Showroom alteration control')+'</div></div>' +
    (canCreate?'<button class="primary" id="new">＋ NEW ALTERATION</button>':'')+'</div>'+stats(jobs)+
    '<input id="search" class="search" placeholder="Search customer, mobile, bill or alteration no..."/>' +
    '<div class="filters"><button class="filter active" data-f="all">ALL</button>'+
    ['pending','in_progress','ready','returned_to_showroom','delivered'].map(s=>'<button class="filter" data-f="'+s+'">'+statusName(s)+'</button>').join('')+
    '</div><section id="list">'+list()+'</section></main>' +
    (user.role==='admin'?'<div class="admin-quick"><button class="nav-btn" onclick="customers()">Customer Search</button><button class="nav-btn" onclick="payment()">Ledger</button><button class="nav-btn" onclick="reportView()">Reports</button><button class="nav-btn" onclick="packing()">Packing</button></div>':'');
}
function addMeasurementRow(){
  const row=document.createElement('div');
  row.className='measurement-row';
  row.innerHTML='<input name="mLabel" class="m-label" maxlength="2" placeholder="XX"><input name="mValue" class="m-value" placeholder="Enter measurement">';
  document.getElementById('measurementRows').appendChild(row);
}
async function form(){
  if(!tailors.length){const r=await api('tailor_options');tailors=r.tailors||[];}
  app.innerHTML=header()+'<main class="page"><div class="hero-row"><div><div class="title">New Alteration</div><div class="muted">Fitting sheet style entry</div></div></div>' +
    '<form class="form-card" id="form"><div class="form-grid">' +
    '<div class="field"><label>Customer Name *</label><input name="customer" required autofocus></div>' +
    '<div class="field"><label>Mobile</label><input name="mobile" inputmode="numeric"></div>' +
    '<div class="field"><label>Bill Number</label><input name="bill"></div>' +
    '<div class="field"><label>Item *</label><select name="item"><option>Kurti</option><option>Kurti Set</option><option>Jeans</option><option>Top</option><option>Pant</option><option>Jeans Cutting</option><option>Other</option></select></div>' +
    '<div class="field"><label>Item / Qty *</label><input name="quantity" type="number" min="1" value="1" required></div>' +
    '<div class="field"><label>Size</label><input name="size" placeholder="S / M / L / 32"></div>' +
    '<div class="field"><label>Tailor</label><select name="tailorId"><option value="">Not Assigned</option>'+tailors.map(t=>'<option value="'+t.id+'">'+esc(t.name)+'</option>').join('')+'</select></div>' +
    '<div class="field"><label>Due Date *</label><input name="due" type="date" required value="'+new Date().toISOString().slice(0,10)+'"></div>' +
    '<div class="field full"><label>Alteration Details *</label><textarea name="details" required placeholder="Sleeve short + waist fitting"></textarea></div>' +
    '<div class="field full"><label>Measurements — 2-letter code</label><div id="measurementRows">' +
    '<div class="measurement-row"><input name="mLabel" class="m-label" maxlength="2" placeholder="F"><input name="mValue" class="m-value" placeholder="Enter measurement"></div>' +
    '<div class="measurement-row"><input name="mLabel" class="m-label" maxlength="2" placeholder="S"><input name="mValue" class="m-value" placeholder="Enter measurement"></div>' +
    '</div><button type="button" class="secondary small" id="addMeasurementRow" style="margin-top:8px">＋ Add measurement</button>' +
    '<small class="muted">Code = 1–2 English letters only. Example: F, S, SL.</small></div>' +
    '<div class="field full"><label>Special Instructions</label><textarea name="special" placeholder="Any special note for tailor"></textarea></div>' +
    '</div><div class="form-actions"><button type="button" class="secondary" id="cancel">Cancel</button><button type="submit" class="primary">Save Alteration</button></div></form></main>';
  document.getElementById('addMeasurementRow').onclick=addMeasurementRow;
  document.getElementById('measurementRows').addEventListener('input',e=>{
    if(e.target.classList.contains('m-label')) e.target.value=e.target.value.replace(/[^A-Za-z]/g,'').toUpperCase().slice(0,2);
  });
  document.getElementById('cancel').onclick=render;
  document.getElementById('form').onsubmit=async e=>{
    e.preventDefault();
    const f=new FormData(e.target), b=e.target.querySelector('button[type=submit]');
    const labels=[...e.target.querySelectorAll('.m-label')], values=[...e.target.querySelectorAll('.m-value')], rows=[];
    labels.forEach((el,i)=>{const label=el.value.trim(),value=(values[i]?.value||'').trim();if(label||value)rows.push({label,value});});
    if(rows.some(r=>!/^[A-Za-z]{1,2}$/.test(r.label))){alert('Measurement code must be 1–2 letters.');return;}
    b.disabled=true;b.textContent='Saving…';
    try{
      await api('create_job',{job:{customer:f.get('customer'),mobile:f.get('mobile'),bill:f.get('bill'),item_type:f.get('item'),
        quantity:Math.max(1,Number(f.get('quantity')||1)),size:f.get('size'),assigned_tailor_id:f.get('tailorId')||null,
        due_date:f.get('due'),alteration_details:f.get('details'),measurements:{rows},special_instructions:f.get('special')||''}});
      await loadData();render();
    }catch(err){alert(err.message||'Could not save');b.disabled=false;b.textContent='Save Alteration';}
  };
}
async function assign(jobId){
  const job=jobs.find(x=>x.id===jobId), box=document.createElement('div');box.className='modal-backdrop';
  box.innerHTML='<div class="modal"><h3>Assign Tailor</h3><div class="field"><label>TAILOR</label><select id="assignSelect">'+
    tailors.map(t=>'<option value="'+t.id+'" '+(t.id===job?.assigned_tailor_id?'selected':'')+'>'+esc(t.name)+'</option>').join('')+
    '</select></div><div class="form-actions"><button class="secondary" id="cancelAssign">Cancel</button><button class="primary" id="saveAssign">Assign</button></div></div>';
  document.body.appendChild(box);
  box.querySelector('#cancelAssign').onclick=()=>box.remove();
  box.querySelector('#saveAssign').onclick=async()=>{
    const b=box.querySelector('#saveAssign');b.disabled=true;
    try{await api('assign',{job_id:jobId,tailor_id:box.querySelector('#assignSelect').value,item_type:job?.item_type});box.remove();await loadData();render();}
    catch(e){alert(e.message);b.disabled=false;}
  };
}
async function next(jobId,status){try{await api('status',{job_id:jobId,status});await loadData();render();}catch(e){alert(e.message||'Could not update status');}}
async function timeline(jobId){
  const r=await api('history',{job_id:jobId}),box=document.createElement('div');box.className='modal-backdrop';
  box.innerHTML='<div class="modal"><h3>Alteration Timeline</h3><div class="timeline">'+(r.history||[]).map(h=>
    '<div class="timeline-item"><b>'+statusName(h.status)+'</b><div>'+esc(h.note||'Status updated')+'</div><small>'+fmt(h.created_at)+'</small></div>').join('')+
    '</div><button class="primary" id="closeTimeline">Close</button></div>';
  document.body.appendChild(box);box.querySelector('#closeTimeline').onclick=()=>box.remove();
}
async function deleteJob(id){if(!confirm('Delete this alteration permanently?'))return;try{await api('delete_job',{job_id:id});await loadData();render();}catch(e){alert(e.message);}}
async function customers(){
  app.innerHTML=header()+'<main class="page"><div class="hero-row"><div><div class="title">Customer Search</div><div class="muted">Search by name or mobile</div></div><button class="secondary" id="back">Back</button></div>' +
    '<input id="customerQ" class="search" autofocus placeholder="Customer name or mobile..."><section id="customerList"><div class="empty">Type to search.</div></section></main>';
  document.getElementById('back').onclick=render;let timer;
  document.getElementById('customerQ').oninput=()=>{clearTimeout(timer);timer=setTimeout(async()=>{
    try{const r=await api('customers',{q:document.getElementById('customerQ').value});
      document.getElementById('customerList').innerHTML=(r.customers||[]).map(c=>'<article class="job"><div class="job-head"><div><b>'+esc(c.name)+'</b><div class="muted">'+esc(c.mobile||'No mobile')+'</div></div><button class="primary" data-customer="'+c.id+'">VIEW HISTORY</button></div></article>').join('')||'<div class="empty">No customer found.</div>';
      document.querySelectorAll('[data-customer]').forEach(b=>b.onclick=()=>customerHistory(b.dataset.customer));
    }catch(e){alert(e.message);}
  },250);};
}
async function customerHistory(id){
  const r=await api('customer_history',{customer_id:id}),box=document.createElement('div');box.className='modal-backdrop';
  box.innerHTML='<div class="modal"><h3>Customer History</h3><div class="timeline">'+(r.history||[]).map(j=>
    '<div class="timeline-item"><b>ALT-'+String(j.alteration_no).padStart(4,'0')+' • '+esc(j.item_type)+'</b><div>'+esc(j.alteration_details||'')+'</div><small>'+fmt(j.created_at)+' • '+statusName(j.status)+'</small></div>').join('')+
    '</div><button class="primary" id="closeCustomer">Close</button></div>';
  document.body.appendChild(box);box.querySelector('#closeCustomer').onclick=()=>box.remove();
}
async function payment(){
  const month=new Date().toISOString().slice(0,7);
  app.innerHTML=header()+'<main class="page"><div class="hero-row"><div><div class="title">Tailor Ledger</div><div class="muted">Monthly work, payments and balance</div></div><button class="secondary" id="back">Back</button></div>' +
    '<div class="form-card"><div class="field"><label>MONTH</label><input id="payMonth" type="month" value="'+month+'"></div><div id="ledgerRows" style="margin-top:14px"></div></div></main>';
  document.getElementById('back').onclick=render;
  document.getElementById('payMonth').onchange=()=>loadLedgerCards(document.getElementById('payMonth').value);
  await loadLedgerCards(month);
}
async function loadLedgerCards(month){
  const r=await api('monthly_payment_report',{month}), sums=r.ledger||[];
  document.getElementById('ledgerRows').innerHTML=(r.rows||[]).map(x=>{
    const s=sums.find(y=>y.tailor_id===x.tailor_id)||{opening_balance:0,current_work:x.amount||0,paid:0,balance:x.amount||0};
    return '<article class="job"><div class="job-head"><div><div class="customer">'+esc(x.name)+'</div><div class="muted">Opening: '+money(s.opening_balance)+'</div></div>' +
      '<span class="status '+(s.balance>0?'pending':'ready')+'">'+(s.balance>0?'BALANCE '+money(s.balance):'SETTLED')+'</span></div>' +
      '<div class="report-kpis"><div><b>'+money(s.current_work)+'</b><span>Work</span></div><div><b>'+money(s.paid)+'</b><span>Paid / Advance</span></div><div><b>'+money(s.balance)+'</b><span>Balance</span></div><div><b>'+x.pieces+'</b><span>Pieces</span></div></div>' +
      '<div class="actions"><button class="primary" data-ledger="'+x.tailor_id+'" data-month="'+month+'">ADD ENTRY</button><button class="secondary" data-ledger-view="'+x.tailor_id+'" data-month="'+month+'">VIEW LEDGER</button></div></article>';
  }).join('')||'<div class="empty">No tailor records.</div>';
  document.querySelectorAll('[data-ledger]').forEach(b=>b.onclick=async()=>{
    const type=prompt('Entry type: payment / advance / adjustment','payment');if(!type||!['payment','advance','adjustment'].includes(type))return;
    const amount=prompt('Amount','0');if(!amount)return;const note=prompt('Note','');
    try{await api('add_ledger_entry',{tailor_id:b.dataset.ledger,entry_type:type,amount:Number(amount),note});await loadLedgerCards(month);}catch(e){alert(e.message);}
  });
  document.querySelectorAll('[data-ledger-view]').forEach(b=>b.onclick=()=>ledgerDetail(b.dataset.ledger,b.dataset.month));
}
async function ledgerDetail(tailorId,month){
  const r=await api('tailor_ledger',{tailor_id:tailorId,month}),box=document.createElement('div');box.className='modal-backdrop';
  box.innerHTML='<div class="modal"><h3>Tailor Ledger</h3><div class="report-kpis"><div><b>'+money(r.opening_balance)+'</b><span>Opening</span></div><div><b>'+money(r.current_work)+'</b><span>Work</span></div><div><b>'+money(r.paid)+'</b><span>Paid</span></div><div><b>'+money(r.balance)+'</b><span>Balance</span></div></div>' +
    '<div class="timeline">'+(r.current_entries||[]).map(e=>'<div class="timeline-item"><b>'+esc(e.entry_type.toUpperCase())+' • '+money(e.amount)+'</b><div>'+esc(e.note||'')+'</div><small>'+fmt(e.entry_date)+'</small></div>').join('')+'</div>' +
    '<button class="primary" id="closeLedger">Close</button></div>';
  document.body.appendChild(box);box.querySelector('#closeLedger').onclick=()=>box.remove();
}
async function reportView(){
  app.innerHTML=header()+'<main class="page report-page"><div class="hero-row"><div><div class="title">Reports</div><div class="muted">Professional alteration report</div></div><button class="secondary" id="back">Back</button></div>' +
    '<div class="report-controls"><button class="filter active" data-range="7">Last 7 Days</button><button class="filter" data-range="30">Last 30 Days</button><button class="filter" data-range="custom">Custom Date</button></div>' +
    '<div id="customRange" class="form-card" style="display:none"><div class="form-grid"><div class="field"><label>FROM</label><input id="fromDate" type="date"></div><div class="field"><label>TO</label><input id="toDate" type="date"></div></div><button class="primary" id="applyCustom" style="margin-top:12px">APPLY REPORT</button></div>' +
    '<section id="reportBox" class="form-card" style="margin-top:12px"></section></main>';
  document.getElementById('back').onclick=render;
  document.querySelectorAll('[data-range]').forEach(b=>b.onclick=()=>{
    document.querySelectorAll('[data-range]').forEach(x=>x.classList.remove('active'));b.classList.add('active');
    document.getElementById('customRange').style.display=b.dataset.range==='custom'?'block':'none';
    if(b.dataset.range!=='custom')runReport(b.dataset.range);
  });
  document.getElementById('applyCustom').onclick=()=>runReport('custom');runReport('7');
}
async function runReport(range){
  let from,to;const now=new Date();
  if(range==='custom'){from=document.getElementById('fromDate').value;to=document.getElementById('toDate').value;if(!from||!to){alert('Select From and To dates');return;}}
  else{to=now.toISOString().slice(0,10);const d=new Date(now);d.setDate(d.getDate()-(Number(range)-1));from=d.toISOString().slice(0,10);}
  try{const r=await api('report',{from,to});renderReport(r,from,to);}catch(e){alert(e.message);}
}
function renderReport(r,from,to){
  const rows=r.rows||[];
  document.getElementById('reportBox').innerHTML='<div class="report-head"><div><b>FASHION FACTORY</b><h3>Alteration Report</h3><small>'+fmt(from)+' — '+fmt(to)+'</small></div><button class="primary" id="pdf">EXPORT PDF</button></div>' +
    '<div class="report-kpis"><div><b>'+r.total+'</b><span>Total Jobs</span></div><div><b>'+r.delivered+'</b><span>Delivered</span></div><div><b>'+r.ready+'</b><span>Ready</span></div><div><b>'+money(r.amount)+'</b><span>Tailor Value</span></div></div>' +
    '<div class="report-table"><div class="rt-row rt-head"><b>Alteration</b><b>Customer</b><b>Tailor</b><b>Status</b><b>Value</b></div>' +
    rows.map(x=>'<div class="rt-row"><span>ALT-'+String(x.alteration_no).padStart(4,'0')+'</span><span>'+esc(x.customer)+'</span><span>'+esc(x.tailor||'-')+'</span><span>'+statusName(x.status)+'</span><span>'+money(x.rate)+'</span></div>').join('') +
    '</div>';
  document.getElementById('pdf').onclick=()=>exportPdf(r,from,to);
}
function exportPdf(r,from,to){
  if(!window.jspdf){alert('PDF module is still loading. Please try again.');return;}
  const doc=new jspdf.jsPDF({unit:'mm',format:'a4'});
  doc.setFontSize(18);doc.text('FASHION FACTORY',15,18);doc.setFontSize(13);doc.text('Alteration Report',15,26);doc.setFontSize(9);doc.text(fmt(from)+' - '+fmt(to),15,32);
  doc.text('Total Jobs: '+(r.total||0)+'  Delivered: '+(r.delivered||0)+'  Ready: '+(r.ready||0)+'  Tailor Value: '+money(r.amount||0),15,39);
  let y=49;doc.setFontSize(8);doc.text('Alteration',15,y);doc.text('Customer',42,y);doc.text('Tailor',92,y);doc.text('Status',132,y);doc.text('Value',177,y);y+=6;
  (r.rows||[]).forEach(x=>{if(y>285){doc.addPage();y=18;}doc.text('ALT-'+String(x.alteration_no).padStart(4,'0'),15,y);doc.text(String(x.customer||'-').slice(0,28),42,y);doc.text(String(x.tailor||'-').slice(0,20),92,y);doc.text(statusName(x.status).slice(0,16),132,y);doc.text(money(x.rate),177,y);y+=5;});
  doc.save('Fashion-Factory-Report-'+from+'-to-'+to+'.pdf');
}
async function packing(){
  const r=await api('packing_report');
  app.innerHTML=header()+'<main class="page"><div class="hero-row"><div><div class="title">Packing Material</div><div class="muted">1 bag is consumed per returned piece</div></div><button class="secondary" id="back">Back</button></div>' +
    '<div class="form-card"><div class="report-kpis"><div><b>'+r.rows.reduce((a,x)=>a+x.supplied,0)+'</b><span>Total Issued</span></div><div><b>'+r.rows.reduce((a,x)=>a+x.used,0)+'</b><span>Total Used</span></div><div><b>'+r.rows.reduce((a,x)=>a+x.balance,0)+'</b><span>Total Balance</span></div></div><div id="packingRows">'+packingRows(r.rows||[])+'</div></div></main>';
  document.getElementById('back').onclick=render;wirePacking();
}
function packingRows(rows){
  return rows.map(r=>'<div class="payment-row"><div><b>'+esc(r.name)+'</b><div class="muted">Issued '+r.supplied+' • Used '+r.used+' • Available '+r.balance+'</div></div>' +
    '<div><button class="secondary small" data-bags="'+r.tailor_id+'">ADD BAGS</button> <button class="secondary small" data-reset-bags="'+r.tailor_id+'">SET STOCK</button></div></div>').join('')||'<div class="empty">No tailor records.</div>';
}
function wirePacking(){
  document.querySelectorAll('[data-bags]').forEach(b=>b.onclick=async()=>{const q=prompt('How many bags to issue?','100');if(q===null)return;try{await api('packing_adjust',{tailor_id:b.dataset.bags,transaction_type:'supply',qty:Number(q),note:'Bags issued by showroom'});packing();}catch(e){alert(e.message);}});
  document.querySelectorAll('[data-reset-bags]').forEach(b=>b.onclick=async()=>{const q=prompt('Set current available stock to:','0');if(q===null)return;try{await api('packing_adjust',{tailor_id:b.dataset.resetBags,transaction_type:'reset',qty:Number(q),note:'Admin stock reset'});packing();}catch(e){alert(e.message);}});
}
function adminControls(){
  app.innerHTML=header()+'<main class="page"><div class="hero-row"><div><div class="title">Admin Controls</div><div class="muted">Tailors, rates, logins and security</div></div><button class="secondary" id="back">Back</button></div>' +
    '<div class="form-card"><h3>ADD TAILOR</h3><form id="addTailor"><div class="form-grid"><div class="field"><label>Name</label><input name="name" required></div><div class="field"><label>Phone</label><input name="phone"></div><div class="field"><label>PIN</label><input name="pin" inputmode="numeric" maxlength="4" required></div></div><button class="primary" style="margin-top:12px">Add Tailor</button></form></div>' +
    '<div class="form-card" style="margin-top:12px"><h3>SHOWROOM LOGIN</h3><form id="showroomPin" style="margin-top:10px"><div class="form-grid"><div class="field"><label>NAME</label><input name="name" value="Showroom"></div><div class="field"><label>4-DIGIT PIN</label><input name="pin" inputmode="numeric" maxlength="4" required></div></div><button class="primary" style="margin-top:12px">SAVE SHOWROOM LOGIN</button></form></div>' +
    '<div class="form-card" style="margin-top:12px"><h3>ADMIN PIN</h3><form id="adminPin" style="margin-top:10px"><div class="field"><label>NEW 4-DIGIT PIN</label><input name="pin" inputmode="numeric" maxlength="4" required></div><button class="primary" style="margin-top:12px">CHANGE ADMIN PIN</button></form></div>' +
    '<div class="form-card" style="margin-top:12px"><h3>TAILOR RATES</h3><div id="ratesBox">Loading…</div></div></main>';
  document.getElementById('back').onclick=render;
  document.getElementById('addTailor').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);try{await api('add_tailor',{name:f.get('name'),phone:f.get('phone'),pin:f.get('pin')});alert('Tailor added');e.target.reset();loadRates();}catch(x){alert(x.message);}};
  document.getElementById('showroomPin').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);try{await api('set_showroom_pin',{name:f.get('name'),pin:f.get('pin')});alert('Showroom login saved');e.target.reset();}catch(x){alert(x.message);}};
  document.getElementById('adminPin').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);try{await api('change_pin',{target:'admin',pin:f.get('pin')});alert('Admin PIN changed');e.target.reset();}catch(x){alert(x.message);}};
  loadRates();
}
async function loadRates(){
  const r=await api('rates');const box=document.getElementById('ratesBox');if(!box)return;
  box.innerHTML=(r.rates||[]).map(x=>'<div class="payment-row"><div><b>'+esc(x.tailor?.name||'-')+'</b><div class="muted">'+esc(x.item_type)+'</div></div>' +
    '<div class="rate-edit"><input data-rate-id="'+x.tailor_id+'" data-item="'+esc(x.item_type)+'" value="'+x.rate+'"><button class="secondary small" data-save-rate="1">Save</button></div></div>').join('')||'<div class="empty">No rates configured.</div>';
  document.querySelectorAll('[data-save-rate]').forEach(b=>b.onclick=async()=>{const row=b.parentElement;try{await api('set_rate',{tailor_id:row.querySelector('[data-rate-id]').dataset.rateId,item_type:row.querySelector('[data-rate-id]').dataset.item,rate:row.querySelector('[data-rate-id]').value});alert('Rate saved');}catch(e){alert(e.message);}});
}
function bind(){
  document.getElementById('logout')?.addEventListener('click',logout);
  document.getElementById('new')?.addEventListener('click',form);
  document.getElementById('search')?.addEventListener('input',()=>{document.getElementById('list').innerHTML=list();});
  document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-f]').forEach(x=>x.classList.remove('active'));b.classList.add('active');filter=b.dataset.f;document.getElementById('list').innerHTML=list();});
  document.querySelectorAll('[data-next]').forEach(b=>b.onclick=()=>next(b.dataset.next,b.dataset.status));
  document.querySelectorAll('[data-history]').forEach(b=>b.onclick=()=>timeline(b.dataset.history));
  document.querySelectorAll('[data-assign]').forEach(b=>b.onclick=()=>assign(b.dataset.assign));
  document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>deleteJob(b.dataset.delete));
}
function logout(){localStorage.removeItem('ff_session');session=null;user=null;jobs=[];login();}
function render(){filter='all';app.innerHTML=dashboard();bind();}
async function login(){
  app.innerHTML='<div class="login"><div class="login-card login-modern"><div class="login-brand"><div class="brand-mark">FF</div><h2>FASHION FACTORY</h2><div class="muted">ALTERATION MANAGEMENT</div></div>' +
    '<div class="login-title">Secure Login</div><div class="login-sub">Choose your access</div><div class="login-modes">' +
    '<button class="mode active" data-mode="admin">ADMIN</button><button class="mode" data-mode="showroom">SHOWROOM</button><button class="mode" data-mode="tailor">TAILOR</button></div><div id="loginForm"></div></div></div>';
  let mode='admin', opts=[];
  const draw=()=>{
    const tailor=mode==='tailor';
    document.getElementById('loginForm').innerHTML=(tailor?'<div class="field"><label>TAILOR</label><select id="tailorChoice">'+
      opts.map(t=>'<option value="'+t.id+'">'+esc(t.name)+'</option>').join('')+'</select></div>':'')+
      '<div class="field" style="margin-top:12px"><label>4-DIGIT PIN</label><input id="pin" class="pin" inputmode="numeric" maxlength="4" placeholder="••••" autocomplete="off"></div>' +
      '<button class="primary" style="width:100%;margin-top:16px" id="go">LOGIN</button><div class="muted" style="text-align:center;margin-top:12px">'+
      (mode==='admin'?'Administrator access':mode==='showroom'?'Showroom counter access':'Tailor work dashboard')+'</div>';
  };
  document.querySelectorAll('.mode').forEach(b=>b.onclick=()=>{document.querySelectorAll('.mode').forEach(x=>x.classList.remove('active'));b.classList.add('active');mode=b.dataset.mode;draw();});
  try{const r=await client.functions.invoke('tailor-api',{body:{action:'login_options'}});opts=r.data?.tailors||[];}catch(e){}
  draw();
  document.getElementById('loginForm').onclick=async e=>{
    if(e.target.id!=='go')return;const pin=document.getElementById('pin').value,b=e.target;b.disabled=true;b.textContent='Signing in…';
    try{
      const payload=mode==='tailor'?{role:'tailor',pin,tailor_id:document.getElementById('tailorChoice')?.value}:{role:mode,pin};
      const r=await api('login',payload);session={token:r.token,user:r.user};user=r.user;localStorage.setItem('ff_session',JSON.stringify(session));await loadData();render();
    }catch(err){alert(err.message||'Login failed');b.disabled=false;b.textContent='LOGIN';}
  };
  document.getElementById('loginForm').onkeydown=e=>{if(e.key==='Enter')document.getElementById('go')?.click();};
}
if(session?.token&&user){loadData().then(render).catch(()=>logout());}else login();
