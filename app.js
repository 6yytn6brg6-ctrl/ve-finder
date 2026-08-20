const $ = id => document.getElementById(id);
const KEY = 'vefinder.user.v1';
let user = JSON.parse(localStorage.getItem(KEY) || '[]');
let pos = null;
let mode = 'nearby';
let markers = [];
let routeLine = null;
let seed = [];

const all = () => seed.concat(user);
const hav = (a,b,c,d) => {
  const R=6371,p=Math.PI/180,dp=(c-a)*p,dl=(d-b)*p;
  const q=Math.sin(dp/2)**2+Math.cos(a*p)*Math.cos(c*p)*Math.sin(dl/2)**2;
  return 2*R*Math.asin(Math.sqrt(q));
};

const map = L.map('map').setView([52.43,13.59],8);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom:19,
  attribution:'&copy; OpenStreetMap-Mitwirkende'
}).addTo(map);

let layer = L.layerGroup().addTo(map);
let me = null;
const yes = v => String(v).toLowerCase() === 'ja';

async function loadStations(){
  try{
    const response=await fetch('stations.json?v=20260820-10',{cache:'no-store'});
    if(!response.ok) throw new Error(`Stationsdaten HTTP ${response.status}`);
    const data=await response.json();
    if(!Array.isArray(data)) throw new Error('Stationsdaten haben kein gültiges Format');
    seed=data;
    render();
    if(!pos) $('statusMsg').textContent=`Stationsdaten geladen · ${seed.length} Einträge`;
    return true;
  }catch(err){
    console.error(err);
    seed=[];
    render();
    $('statusMsg').textContent='Stationsdaten konnten nicht geladen werden. Bitte Internetverbindung prüfen.';
    return false;
  }
}

function color(x){
  return x.color==='Grün'?'green':x.color==='Gelb'?'yellow':x.color==='Rot'?'red':'white';
}

function icon(x){
  const c={green:'#3b875b',yellow:'#e7b84a',red:'#bb5b59',white:'#fff'}[color(x)];
  return L.divIcon({
    className:'',
    html:`<div style="width:18px;height:18px;border-radius:50%;background:${c};border:3px solid white;box-shadow:0 1px 6px #0005"></div>`,
    iconSize:[18,18],
    iconAnchor:[9,9]
  });
}

function filtered(){
  const q=$('searchInput').value.toLowerCase();
  const r=+$('radiusSelect').value;
  return all()
    .map(x=>({...x,d:pos?hav(pos.lat,pos.lon,x.lat,x.lon):null}))
    .filter(x=>{
      if(q && !`${x.name} ${x.postal} ${x.state}`.toLowerCase().includes(q)) return false;
      if(mode==='nearby' && pos && x.d>r) return false;
      if($('fCassette').checked && !yes(x.cassette)) return false;
      if($('fGrey').checked && !yes(x.grey)) return false;
      if($('fWater').checked && !yes(x.water)) return false;
      if($('fTrash').checked && !yes(x.trash)) return false;
      if($('fConfirmed').checked && !['Grün','Gelb'].includes(x.color)) return false;
      return true;
    })
    .sort((a,b)=>
      $('sortSelect').value==='name' ? a.name.localeCompare(b.name,'de') :
      $('sortSelect').value==='state' ? a.state.localeCompare(b.state,'de') :
      (a.d??9999)-(b.d??9999)
    );
}

function render(){
  const v=filtered();
  $('resultCount').textContent=v.length;
  layer.clearLayers();
  markers=[];
  for(const x of v){
    const m=L.marker([x.lat,x.lon],{icon:icon(x)}).addTo(layer).on('click',()=>detail(x));
    markers.push(m);
  }
  $('results').innerHTML=v.map(x=>`<article class="result-card ${color(x)}" data-id="${x.id}">
    <div class="result-title">${x.name}</div>
    <div class="result-meta">${x.d!=null?`<span class="distance">${x.d.toFixed(1)} km</span>`:''}<span>${x.postal} ${x.state}</span></div>
    <div class="badges">${yes(x.cassette)?'<span class="badge">🚽 Kassette</span>':''}${yes(x.grey)?'<span class="badge">💧 Grau</span>':''}${yes(x.water)?'<span class="badge">🚰 Wasser</span>':''}</div>
  </article>`).join('');
  document.querySelectorAll('.result-card').forEach(el=>{
    el.onclick=()=>detail(all().find(x=>x.id===el.dataset.id));
  });
}

function detail(x){
  $('detailContent').innerHTML=`<div class="sheet-inner">
    <div class="sheet-head">
      <div><h2>${x.name}</h2><div class="statusmsg">${x.postal} ${x.state}</div></div>
      <button class="closebtn" onclick="document.getElementById('detailDialog').close()">×</button>
    </div>
    <div class="detail-grid">
      <div class="detail-item"><small>Kassette</small>${x.cassette}</div>
      <div class="detail-item"><small>Grauwasser</small>${x.grey}</div>
      <div class="detail-item"><small>Frischwasser</small>${x.water}</div>
      <div class="detail-item"><small>Müll</small>${x.trash}</div>
      <div class="detail-item"><small>Preis</small>${x.price||'—'}</div>
      <div class="detail-item"><small>Telefon</small>${x.phone||'—'}</div>
    </div>
    <div class="routebox">${x.note||''}</div>
    <div class="actions">
      <button class="primary nav-start" onclick="startOrganicNav('${x.id}')">Navigation starten</button>
      <button class="outline" onclick="routeTo('${x.id}')">Route auf Karte anzeigen</button>
      <button class="outline" onclick="openOsmRoute('${x.id}')">Route in OSM öffnen</button>
    </div>
    <div id="routeInfo"></div>
  </div>`;
  $('detailDialog').showModal();
}

window.startOrganicNav = async id => {
  const x=all().find(a=>a.id===id);
  if(!x) return;
  const box=$('routeInfo');
  try {
    await getPosition();
    const originName=encodeURIComponent('Aktueller Standort');
    const destinationName=encodeURIComponent(x.name);
    const u=`om://v2/nav?origin=${pos.lat},${pos.lon}&origin_name=${originName}&destination=${x.lat},${x.lon}&destination_name=${destinationName}&mode=drive`;
    window.location.href=u;
  } catch(err) {
    console.error(err);
    if(box) box.innerHTML='<div class="routebox">Standort konnte nicht gelesen werden. Bitte Standortfreigabe prüfen.</div>';
  }
};

function getPosition(){
  if(pos) return Promise.resolve(pos);
  return new Promise((resolve,reject)=>{
    if(!navigator.geolocation){
      reject(new Error('Geolocation nicht verfügbar'));
      return;
    }
    navigator.geolocation.getCurrentPosition(p=>{
      pos={lat:p.coords.latitude,lon:p.coords.longitude};
      $('statusMsg').textContent=`Standort aktiv · Genauigkeit ca. ${Math.round(p.coords.accuracy)} m`;
      if(me) me.remove();
      me=L.circleMarker([pos.lat,pos.lon],{radius:8,color:'#fff',weight:3,fillColor:'#2e82e6',fillOpacity:1}).addTo(map);
      render();
      resolve(pos);
    },err=>{
      $('statusMsg').textContent='Standort nicht verfügbar – bitte Safari den Standort erlauben.';
      reject(err);
    },{enableHighAccuracy:true,timeout:12000,maximumAge:30000});
  });
}

async function locate(){
  try{
    await getPosition();
    map.setView([pos.lat,pos.lon],11);
  }catch(_){ }
}

window.routeTo = async id => {
  const x=all().find(a=>a.id===id);
  if(!x) return;
  const box=$('routeInfo');
  box.innerHTML='<div class="routebox">Route wird berechnet …</div>';
  try{
    await getPosition();
    const u=`https://router.project-osrm.org/route/v1/driving/${pos.lon},${pos.lat};${x.lon},${x.lat}?overview=full&geometries=geojson&steps=false`;
    const response=await fetch(u,{cache:'no-store'});
    if(!response.ok) throw new Error(`Routing HTTP ${response.status}`);
    const j=await response.json();
    if(j.code!=='Ok' || !j.routes || !j.routes.length) throw new Error(j.message||'Keine Route gefunden');
    const rt=j.routes[0];
    const coords=rt.geometry.coordinates.map(([lon,lat])=>[lat,lon]);
    if(routeLine) routeLine.remove();
    routeLine=L.polyline(coords,{weight:6,opacity:0.85}).addTo(map);
    $('detailDialog').close();
    map.fitBounds(routeLine.getBounds().pad(0.12));
    const km=(rt.distance/1000).toFixed(1);
    const min=Math.round(rt.duration/60);
    $('statusMsg').innerHTML=`Route zu <strong>${x.name}</strong>: ${km} km · ca. ${min} min`;
    L.popup()
      .setLatLng([x.lat,x.lon])
      .setContent(`<strong>${x.name}</strong><br>${km} km · ca. ${min} min`)
      .openOn(map);
  }catch(err){
    console.error(err);
    box.innerHTML='<div class="routebox">Route konnte hier nicht berechnet werden. Bitte „Route in OSM öffnen“ versuchen.</div>';
  }
};

window.openOsmRoute = async id => {
  const x=all().find(a=>a.id===id);
  if(!x) return;
  const popup=window.open('about:blank','_blank');
  try{
    await getPosition();
    const route=encodeURIComponent(`${pos.lat},${pos.lon};${x.lat},${x.lon}`);
    const u=`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${route}`;
    if(popup) popup.location.href=u;
    else window.location.href=u;
  }catch(err){
    if(popup) popup.close();
    const box=$('routeInfo');
    if(box) box.innerHTML='<div class="routebox">Standort konnte nicht gelesen werden.</div>';
  }
};

function add(){
  if(!pos){
    locate();
    alert('Bitte Standort aktivieren und danach noch einmal Neu tippen.');
    return;
  }
  $('addContent').innerHTML=`<div class="sheet-inner">
    <div class="sheet-head"><h2>Neue V/E-Station</h2><button class="closebtn" onclick="document.getElementById('addDialog').close()">×</button></div>
    <form id="f" class="form-grid">
      <label>Name<input name="name" required></label>
      <label>PLZ<input name="postal"></label>
      <label>Bundesland<input name="state" value="Brandenburg"></label>
      <div class="checks">
        <label><input type="checkbox" name="cassette"> Kassette</label>
        <label><input type="checkbox" name="grey"> Grauwasser</label>
        <label><input type="checkbox" name="water"> Frischwasser</label>
        <label><input type="checkbox" name="trash"> Müll</label>
      </div>
      <label>Preis<input name="price"></label>
      <label>Telefon<input name="phone"></label>
      <label>Hinweis<textarea name="note"></textarea></label>
      <button class="primary">Am aktuellen GPS-Standort speichern</button>
    </form>
  </div>`;
  $('addDialog').showModal();
  $('f').onsubmit=e=>{
    e.preventDefault();
    const f=new FormData(e.target);
    user.push({
      id:'u'+Date.now(),name:f.get('name'),postal:f.get('postal'),state:f.get('state'),
      lat:pos.lat,lon:pos.lon,color:'Grün',cassette:f.get('cassette')?'ja':'?',
      grey:f.get('grey')?'ja':'?',water:f.get('water')?'ja':'?',trash:f.get('trash')?'ja':'?',
      price:f.get('price'),phone:f.get('phone'),note:f.get('note')
    });
    localStorage.setItem(KEY,JSON.stringify(user));
    $('addDialog').close();
    render();
  };
}

$('locateBtn').onclick=locate;
$('filterBtn').onclick=()=>$('filters').classList.toggle('hidden');
$('nearbyBtn').onclick=()=>{
  mode='nearby';
  $('nearbyBtn').classList.add('active');
  $('allBtn').classList.remove('active');
  render();
};
$('allBtn').onclick=()=>{
  mode='all';
  $('allBtn').classList.add('active');
  $('nearbyBtn').classList.remove('active');
  render();
};
$('addBtn').onclick=add;
$('dataBtn').onclick=()=>alert(`${seed.length} Datenbank-Station(en) · ${user.length} eigene Station(en) auf diesem Gerät.`);
['searchInput','radiusSelect','fCassette','fGrey','fWater','fTrash','fConfirmed','sortSelect'].forEach(id=>{
  $(id).addEventListener(id==='searchInput'?'input':'change',render);
});

async function init(){
  render();
  await loadStations();
  setTimeout(()=>locate(),400);
}

init();
