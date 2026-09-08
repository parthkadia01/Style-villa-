/* Connect the new fitting report to existing Admin UI before runtime handlers register. */
(function(){
  document.addEventListener('click',function(e){
    const r=e.target.closest('#reportQuick');
    if(r&&typeof window.ffOpenFittingReport==='function'){e.preventDefault();e.stopImmediatePropagation();window.ffOpenFittingReport();return;}
    const menu=e.target.closest('#sideMenu > button');
    if(menu && /Admin Controls/i.test(menu.textContent||'') && typeof window.ffOpenItemMaster==='function'){
      e.preventDefault();e.stopImmediatePropagation();window.ffOpenItemMaster();return;
    }
  },true);
  const mo=new MutationObserver(()=>{
    const menu=document.getElementById('sideMenu');
    if(!menu||menu.dataset.ffReportMenu==='1')return;
    menu.dataset.ffReportMenu='1';
    const add=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>{closeSideMenu?.();fn()};menu.appendChild(b)};
    add('📊 Fitting PCS Report',()=>window.ffOpenFittingReport?.());
    add('🧾 Item Master',()=>window.ffOpenItemMaster?.());
  });
  mo.observe(document.body,{childList:true,subtree:true});
})();
