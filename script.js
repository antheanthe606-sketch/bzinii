/**
 * BZINI CORE ENGINE v4.5
 * Features: Multi-Category Support, Persistent Theme, Admin Tools, Smart Zoom
 */

 "use strict";

 // 1. App State & Data Management
 const BZINI_STATE = {
     theme: localStorage.getItem('theme') || 'dark',
     activeCategory: 'all',
     map: null,
     markersGroup: null,
     data: [
         { id: 1, type: 'wash', name: "ბზინი - ვაკე", coords: [41.7100, 44.7500], info: "24/7 • თვითმომსახურება", status: "თავისუფალია" },
         { id: 2, type: 'ev', name: "Fast Charge საბურთალო", coords: [41.7250, 44.7750], info: "120kW Fast Charger", status: "დაკავებულია" },
         { id: 3, type: 'gas', name: "Wissol - ისანი", coords: [41.6900, 44.8300], info: "Euro Diesel • G-Force", status: "3.15 ₾" },
         { id: 4, type: 'gas', name: "Gulf - დიღომი", coords: [41.7750, 44.7800], info: "G-Force Diesel", status: "3.12 ₾" }
     ]
 };
 
 // 2. Initialization Logic
 window.addEventListener('DOMContentLoaded', () => {
     // საწყისი თემის დაყენება
     document.body.setAttribute('data-theme', BZINI_STATE.theme);
     
     // Splash Screen-ის დაყოვნება უკეთესი UX-ისთვის
     setTimeout(() => {
         const splash = document.getElementById('splash');
         const app = document.getElementById('main-app');
         
         if(splash) splash.style.opacity = '0';
         setTimeout(() => {
             if(splash) splash.style.display = 'none';
             if(app) app.classList.add('active');
             initBZINI();
         }, 800);
     }, 2200);
 });
 
 // 3. Core Map Engine
 function initBZINI() {
     BZINI_STATE.map = L.map('map', { 
         zoomControl: false, 
         attributionControl: false 
     }).setView([41.7151, 44.8271], 13);
 
     BZINI_STATE.markersGroup = L.layerGroup().addTo(BZINI_STATE.map);
     
     updateMapTiles();
     renderMarkers(BZINI_STATE.data);
 
     // Admin Mode: Right Click (Desktop) / Long Press (Mobile)
     BZINI_STATE.map.on('contextmenu', handleAdminAdd);
 }
 
 // 4. Rendering & Visualization
 
 function renderMarkers(locations) {
     BZINI_STATE.markersGroup.clearLayers();
 
     const colors = {
         wash: '#FFD700', // Gold
         ev: '#00E676',   // Green
         gas: '#00B0FF'   // Blue
     };
 
     locations.forEach(loc => {
         const accentColor = colors[loc.type] || '#FFFFFF';
         
         const marker = L.circleMarker(loc.coords, {
             radius: window.innerWidth < 768 ? 14 : 12,
             fillColor: accentColor,
             color: '#FFFFFF',
             weight: 3,
             fillOpacity: 0.9,
             className: 'pulse-marker'
         });
 
         const popupHTML = `
             <div style="min-width:180px; font-family: 'Inter', sans-serif;">
                 <h3 style="color:${accentColor}; margin-bottom:4px; font-weight:800;">${loc.name}</h3>
                 <p style="font-size:12px; color:#949499; margin-bottom:8px;">${loc.info}</p>
                 <div style="background:${accentColor}22; color:${accentColor}; padding:5px 10px; border-radius:8px; font-size:11px; font-weight:800; display:inline-block;">
                     ${loc.status}
                 </div>
                 <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${loc.coords[0]},${loc.coords[1]}')" 
                     style="width:100%; margin-top:15px; padding:12px; border:none; border-radius:12px; background:#FFD700; color:#000; font-weight:900; cursor:pointer; transition: 0.3s;">
                     ნავიგაცია
                 </button>
             </div>
         `;
 
         marker.bindPopup(popupHTML, { closeButton: false, offset: [0, -5] });
         BZINI_STATE.markersGroup.addLayer(marker);
     });
 }
 
 // 5. Global Handlers
 window.handleFilter = (category, element) => {
     // UI Update
     document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
     element.classList.add('active');
     
     BZINI_STATE.activeCategory = category;
     const filtered = category === 'all' 
         ? BZINI_STATE.data 
         : BZINI_STATE.data.filter(l => l.type === category);
     
     renderMarkers(filtered);
 
     // Smart Auto-Focus
     if (filtered.length > 0) {
         const bounds = L.featureGroup(BZINI_STATE.markersGroup.getLayers()).getBounds();
         BZINI_STATE.map.fitBounds(bounds.pad(0.3));
     }
 };
 
 window.appThemeToggle = () => {
     BZINI_STATE.theme = BZINI_STATE.theme === 'dark' ? 'light' : 'dark';
     localStorage.setItem('theme', BZINI_STATE.theme);
     document.body.setAttribute('data-theme', BZINI_STATE.theme);
     
     document.getElementById('theme-icon').innerText = BZINI_STATE.theme === 'dark' ? 'light_mode' : 'dark_mode';
     updateMapTiles();
 };
 
 function updateMapTiles() {
     const style = BZINI_STATE.theme === 'dark' ? 'dark_all' : 'light_all';
     L.tileLayer(`https://{s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}{r}.png`).addTo(BZINI_STATE.map);
 }
 
 window.appSearch = (query) => {
     const term = query.toLowerCase();
     const results = BZINI_STATE.data.filter(l => l.name.toLowerCase().includes(term));
     renderMarkers(results);
 };
 
 // 6. Admin Tools
 function handleAdminAdd(e) {
     const name = prompt("ადმინ პანელი: ობიექტის სახელი?");
     if (!name) return;
 
     const type = prompt("ტიპი? (wash / ev / gas)");
     if (!['wash', 'ev', 'gas'].includes(type)) return alert("არასწორი ტიპი!");
 
     const newPoint = {
         id: Date.now(),
         type: type,
         name: name,
         coords: [e.latlng.lat, e.latlng.lng],
         info: "ახალი ობიექტი",
         status: "აქტიური"
     };
 
     BZINI_STATE.data.push(newPoint);
     renderMarkers(BZINI_STATE.data);
 }