$(document).ready(function () {
    "use strict";
    $('#navbar_search').on('input', function () {
        var search = $(this).val().toLowerCase();
        var search_result_pane = $('#navbar_search_result_area .navbar_search_result');
        $(search_result_pane).html('');
        if (search.length == 0) {
            return;
        }

        var match = $('#sidebarnav .sidebar-link').filter(function (idx, element) {
            return $(element).text().trim().toLowerCase().indexOf(search) >= 0 ? element : null;
        }).sort();

        if (match.length == 0) {
            $(search_result_pane).append('<li class="text-muted">No search result found.</li>');
            return;
        }

        match.each(function (index, element) {
            var item_url = $(element).attr('href') || $(element).data('default-url');
            var item_text = $(element).text().replace(/(\d+)/g, '').trim();
            $(search_result_pane).append(`<li><a href="${item_url}">${item_text}</a></li>`);
        });
    });

});

// PrimeBoostly presentation enhancements; no requests, credentials or data mutations.
(() => {
 'use strict';
 const enhance = () => {
  if (!document.body.classList.contains('pba-admin')) return;
  document.querySelectorAll('.form-group').forEach((group,index)=>{
   const field=group.querySelector('input:not([type=hidden]),select,textarea'), label=group.querySelector('label:not([for])');
   if(field && label){if(!field.id)field.id='pba-field-'+index;label.htmlFor=field.id;}
  });
  document.querySelectorAll('.page-wrapper table').forEach(table => {
   const headings = [...table.querySelectorAll('thead tr:last-child th')].map(n => n.textContent.trim());
   if (!headings.length) return;
   table.classList.add('pba-stack-table');
   table.querySelectorAll('tbody tr').forEach(row => [...row.cells].forEach((cell, i) => {
    if (!cell.hasAttribute('data-label') && !cell.hasAttribute('colspan')) cell.setAttribute('data-label', headings[i] || (cell.querySelector('input[type=checkbox]') ? 'Select' : ''));
   }));
  });
  document.querySelectorAll('.logo-text img').forEach(img => {
   const fallback = () => {
    img.hidden = true; img.style.setProperty('display','none','important');
    const parent = img.closest('.logo-text');
    if (parent && !parent.querySelector('.pba-brand-text')) {
     const text = document.createElement('span'); text.className='pba-brand-text'; text.textContent='PrimeBoostly'; parent.append(text);
    }
   };
   img.addEventListener('error',fallback,{once:true});
   if(img.complete && !img.naturalWidth) fallback();
  });
  document.querySelectorAll('.nav-toggler').forEach(n => n.setAttribute('aria-label','Toggle admin navigation'));
  document.querySelectorAll('.table .dropdown-toggle').forEach(n => {if(!n.textContent.trim())n.setAttribute('aria-label','Open row actions')});
  const wrapper=document.getElementById('main-wrapper'), sidebar=document.querySelector('.left-sidebar');
  if(!wrapper || !sidebar) return;
  const sync=()=>{const open=wrapper.classList.contains('show-sidebar'), mobile=matchMedia('(max-width:767px)').matches;sidebar.inert=mobile&&!open;document.querySelectorAll('.nav-toggler').forEach(n=>n.setAttribute('aria-expanded',String(open)))};
  new MutationObserver(sync).observe(wrapper,{attributes:true,attributeFilter:['class']});
  matchMedia('(max-width:767px)').addEventListener('change',sync); sync();
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&wrapper.classList.contains('show-sidebar')){wrapper.classList.remove('show-sidebar');document.querySelector('.nav-toggler')?.focus()}});
  document.addEventListener('click',e=>{if(matchMedia('(max-width:767px)').matches && wrapper.classList.contains('show-sidebar') && !e.target.closest('.left-sidebar,.nav-toggler'))wrapper.classList.remove('show-sidebar')});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();
})();
// Configure the existing provider form without saving credentials or creating records.
document.addEventListener('click', function (event) {
    var preset = event.target.closest('[data-taskletpay-preset]');
    if (!preset) return;
    var form = preset.closest('form');
    if (!form) return;
    form.elements.api_name.value = 'TaskletPay';
    form.elements.url.value = 'https://taskletpay.com/api/v2';
    if (preset.dataset.baseCurrency === 'NGN') {
        form.elements.convention_rate.value = '1';
    }
    form.elements.api_key.focus();
});
