/* Apply Admin Item Master names to the existing alteration form without changing workflow. */
(function(){
  function apply(){
    if(typeof window.ffGetItemMaster!=='function') return;
    const names=window.ffGetItemMaster().filter(i=>i.active).map(i=>i.name);
    document.querySelectorAll('.item-editor .i-type').forEach(sel=>{
      const current=sel.value;
      sel.innerHTML=names.map(n=>'<option>'+String(n).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]))+'</option>').join('');
      if(names.includes(current))sel.value=current;
    });
  }
  const oldForm=window.form;
  if(typeof oldForm==='function')window.form=async function(){const r=await oldForm.apply(this,arguments);setTimeout(apply,0);return r};
  document.addEventListener('click',e=>{if(e.target.closest('#new'))setTimeout(apply,0)},true);
  window.ffApplyItemMaster=apply;
})();
