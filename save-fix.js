// Robust New Alteration submit handler.
// This intentionally runs in capture phase so it replaces the old submit handler
// that was targeting a missing type="submit" button.
(function () {
  const client = supabase.createClient(window.FF_CONFIG.supabaseUrl, window.FF_CONFIG.supabaseKey);

  document.addEventListener('submit', async function (event) {
    const form = event.target;
    if (!form || form.id !== 'form') return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const button = form.querySelector('button.primary');
    if (!button) return;

    const session = JSON.parse(localStorage.getItem('ff_session') || 'null');
    const token = session?.token || '';
    if (!token) {
      localStorage.removeItem('ff_session');
      alert('Session expired. Please login again.');
      location.reload();
      return;
    }

    const f = new FormData(form);
    const job = {
      customer: String(f.get('customer') || '').trim(),
      mobile: String(f.get('mobile') || '').trim(),
      bill: String(f.get('bill') || '').trim(),
      item_type: String(f.get('item') || '').trim(),
      size: String(f.get('size') || '').trim(),
      assigned_tailor_id: f.get('tailorId') || null,
      due_date: f.get('due') || null,
      alteration_details: String(f.get('details') || '').trim(),
      measurements: { raw: String(f.get('measurements') || '').trim() },
      special_instructions: String(f.get('special') || '').trim()
    };

    button.disabled = true;
    button.textContent = 'Saving…';

    try {
      const { data, error } = await client.functions.invoke('tailor-api', {
        body: { action: 'create_job', token, job }
      });

      if (error) {
        const message = error.message || 'Could not save alteration.';
        if (/401|unauthorized|session/i.test(message)) {
          localStorage.removeItem('ff_session');
          alert('Session expired. Please login again.');
          location.reload();
          return;
        }
        throw new Error(message);
      }

      if (data?.error) throw new Error(data.error);

      alert(`Alteration ALT-${String(data?.alteration?.alteration_no || '').padStart(4, '0')} saved successfully.`);
      location.reload();
    } catch (error) {
      console.error('Save alteration failed:', error);
      alert(error?.message || 'Could not save alteration. Please try again.');
      button.disabled = false;
      button.textContent = 'Save Alteration';
    }
  }, true);
})();
