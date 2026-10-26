(function(){
  const KEY="solidaria_applications_v2";
  const LANG="solidaria_lang";
  const $=(s)=>document.querySelector(s);
  const getApps=()=>JSON.parse(localStorage.getItem(KEY)||"[]");
  const saveApps=(v)=>localStorage.setItem(KEY,JSON.stringify(v));
  function detectLanguage(){
    const saved=localStorage.getItem(LANG); if(saved) return saved;
    const n=(navigator.language||"es").toLowerCase();
    if(n.startsWith("pt")) return "pt"; if(n.startsWith("it")) return "it"; if(n.startsWith("fr")) return "fr";
    if(n.startsWith("de")) return "de"; if(n.startsWith("rm")) return "rm"; return "es";
  }
  function applyLang(lang){
    const dict=window.SF_I18N?.[lang]||window.SF_I18N.es;
    document.documentElement.lang=lang;
    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const k=el.dataset.i18n; if(dict[k]!=null) el.innerHTML=dict[k];
    });
    const sel=$("#languageSelect"); if(sel) sel.value=lang;
    localStorage.setItem(LANG,lang);
  }
  const initial=detectLanguage(); applyLang(initial);
  $("#languageSelect")?.addEventListener("change",e=>applyLang(e.target.value));

  const form=$("#applicationForm");
  if(form){
    const params=new URLSearchParams(location.search);
    const program=params.get("program");
    if(program && form.program) form.program.value=program;
    form.addEventListener("submit",e=>{
      e.preventDefault();
      const fd=new FormData(form);
      const item={
        id:Date.now().toString(36),
        name:fd.get("name"),email:fd.get("email"),phone:fd.get("phone"),
        country:fd.get("country"),program:fd.get("program"),amount:fd.get("amount"),
        message:fd.get("message"),status:"Pendiente",createdAt:new Date().toISOString()
      };
      const apps=getApps(); apps.unshift(item); saveApps(apps);
      form.hidden=true; $("#formSuccess").hidden=false;
      window.scrollTo({top:0,behavior:"smooth"});
    });
  }

  const login=$("#loginForm");
  if(login){
    const shell=$("#adminApp"), loginBox=$("#adminLogin");
    if(sessionStorage.getItem("sf_admin")==="1"){loginBox.hidden=true;shell.hidden=false;renderAdmin();}
    login.addEventListener("submit",e=>{
      e.preventDefault();
      const u=$("#adminUser").value.trim(), p=$("#adminPass").value;
      if(u==="admin" && p==="solidaria2026"){
        sessionStorage.setItem("sf_admin","1"); loginBox.hidden=true; shell.hidden=false; renderAdmin();
      }else alert("Identificador o contraseña incorrectos.");
    });
    $("#logoutBtn")?.addEventListener("click",()=>{sessionStorage.removeItem("sf_admin");location.reload()});
    $("#refreshBtn")?.addEventListener("click",renderAdmin);
    $("#clearBtn")?.addEventListener("click",()=>{
      if(confirm("¿Borrar las solicitudes de demostración de este navegador?")){saveApps([]);renderAdmin();}
    });
  }

  function renderAdmin(){
    const apps=getApps();
    $("#totalRequests").textContent=apps.length;
    $("#pendingRequests").textContent=apps.filter(x=>x.status==="Pendiente").length;
    $("#lastRequest").textContent=apps[0]?new Date(apps[0].createdAt).toLocaleDateString():"—";
    const list=$("#requestList"); if(!list) return;
    if(!apps.length){list.innerHTML='<div class="empty-state">No hay solicitudes todavía.</div>';return;}
    list.innerHTML=apps.map(x=>`
      <article class="request-item">
        <div><span class="badge">${escapeHtml(x.status)}</span><h3>${escapeHtml(x.name)}</h3>
        <p>${escapeHtml(x.program)} · ${escapeHtml(x.country)} · ${escapeHtml(x.amount)}</p>
        <p>${escapeHtml(x.email)} · ${escapeHtml(x.phone)}</p>
        <p>${escapeHtml(x.message)}</p></div>
        <small>${new Date(x.createdAt).toLocaleString()}</small>
      </article>`).join("");
  }
  function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]))}
})();