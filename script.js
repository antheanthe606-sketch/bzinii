/**
 * BZINI CORE ENGINE v5.0
 * Focus: Mobile Performance, Persistent Theme, Smart Navigation
 */

 "use strict";

 const BZINI_APP = {
     // 1. მონაცემთა ბაზა (მომავალში Firebase-ით ჩაანაცვლებ)
     locations: [
         { id: 1, type: 'wash', name: "ბზინი - ვაკე", coords: [41.7100, 44.7500], info: "24/7 • თვითმომსახურება", status: "თავისუფალია" },
         { id: 2, type: 'ev', name: "Fast Charge საბურთალო", coords: [41.7250, 44.7750], info: "120kW Fast Charger", status: "დაკავებულია" },
         { id: 3, type: 'gas', name: "Wissol - აღმაშენებელი", coords: [41.7700, 44.7700], info: "Efix Euro Diesel", status: "3.15 ₾" },
         { id: 4, type: 'gas', name: "Gulf - დიღომი", coords: [41.7850, 44.7600], info: "G-Force Diesel", status: "3.12 ₾" },
         { id: 5, type: 'wash', name: "ბზინი - საბურთალო", coords: [41.7300, 44.7600], info: "ავტომატური რეცხვა", status: "რიგი: 2 მანქანა" }
     ],
     
     map: null,
     markers: null,
     currentTheme: localStorage.getItem('bzini_theme') || 'dark',
 
     // 2. აპლიკაციის გაშვება
     init() {
         this.setupTheme();
         this.initMap();
         this.renderMarkers(this.locations);
         this.setupEventListeners();
     },
 
     // 3. რუკის ინიციალიზაცია
     initMap() {
         this.map = L.map('map', { 
             zoomControl: false,
             attributionControl: false 
         }).setView([41.7151, 44.8271], 13);
 
         this.markers = L.layerGroup().addTo(this.map);
         this.updateMapTiles();
     },
 
     // 4. მარკერების ხატვა რუკაზე
     renderMarkers(data) {
         this.markers.clearLayers();
         
         const colors = {
             wash: '#FFD700', // ოქროსფერი
             ev: '#00E676',   // მწვანე
             gas: '#00B0FF'   // ცისფერი
         };
 
         data.forEach(loc => {
             const color = colors[loc.type] || '#FFFFFF';
             
             // მობილურისთვის ოპტიმიზირებული დიდი მარკერი
             const marker = L.circleMarker(loc.coords, {
                 radius: window.innerWidth < 768 ? 15 : 12,
                 fillColor: color,
                 color: '#FFFFFF',
                 weight: 3,
                 fillOpacity: 0.9
             });
 
             // Popup-ის დიზაინი
             const popupContent = `
                 <div class="popup-card" style="font-family: 'Inter', sans-serif; padding: 5px;">
                     <h3 style="color:${color}; margin-bottom:4px; font-weight:900;">${loc.name}</h3>
                     <p style="font-size:12px; color: #949499; margin-bottom:10px;">${loc.info}</p>
                     <div style="background:${color}22; color:${color}; padding:6px 12px; border-radius:10px; font-size:11px; font-weight:800; display:inline-block;">
                         ${loc.status}
                     </div>
                     <button class="btn-nav" onclick="BZINI_APP.openNavigation(${loc.coords[0]}, ${loc.coords[1]})" 
                         style="width:100%; margin-top:15px; padding:12px; border:none; border-radius:12px; background:${color}; color:#000; font-weight:900; cursor:pointer;">
                         გზის დახაზვა
                     </button>
                 </div>
             `;
 
             marker.bindPopup(popupContent, { closeButton: false, offset: [0, -5] });
             this.markers.addLayer(marker);
         });
 
         // Smart Zoom: რუკა ავტომატურად პოულობს ყველა წერტილს
         if (data.length > 0) {
             const group = new L.featureGroup(this.markers.getLayers());
             this.map.fitBounds(group.getBounds().pad(0.2));
         }
     },
 
     // 5. ფუნქციონალი
     filter(type, element) {
         // UI განახლება
         document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
         element.classList.add('active');
 
         // მონაცემების გაფილტვრა
         const filtered = type === 'all' 
             ? this.locations 
             : this.locations.filter(l => l.type === type);
         
         this.renderMarkers(filtered);
     },
 
     search(query) {
         const term = query.toLowerCase();
         const results = this.locations.filter(l => l.name.toLowerCase().includes(term));
         this.renderMarkers(results);
     },
 
     openNavigation(lat, lng) {
         // ხსნის ნავიგაციას მობილურის სისტემურ აპლიკაციაში
         const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
         window.open(url, '_blank');
     },
 
     // 6. თემების მართვა
     setupTheme() {
         document.body.setAttribute('data-theme', this.currentTheme);
     },
 
     toggleTheme() {
         this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
         localStorage.setItem('bzini_theme', this.currentTheme);
         document.body.setAttribute('data-theme', this.currentTheme);
         this.updateMapTiles();
     },
 
     updateMapTiles() {
         const style = this.currentTheme === 'dark' ? 'dark_all' : 'light_all';
         L.tileLayer(`https://{s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}{r}.png`).addTo(this.map);
     },
 
     setupEventListeners() {
         // აქ შეგიძლია დაამატო სხვადასხვა ივენთები
     }
 };
 
 // გლობალური ფუნქციები HTML-ისთვის
 window.filterData = (type, el) => BZINI_APP.filter(type, el);
 window.onSearch = (val) => BZINI_APP.search(val);
 window.toggleTheme = () => BZINI_APP.toggleTheme();
 window.locateMe = () => BZINI_APP.map.locate({setView: true, maxZoom: 16});
 
 // სტარტი
 BZINI_APP.init();