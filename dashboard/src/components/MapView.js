import NetworkView from "./NetworkView.js";
import {MapMarker, MapLine} from "./MapGlyphs.js"


class MapView extends NetworkView{
    constructor(props){
        super(props);
        this.map = null;
        this.markers = [];
        this.lines = [];

        this.drawMarker = this.drawMarker.bind(this)
        this.drawLine = this.drawLine.bind(this)
    }


    draw(){
        this.drawBody()
        this.drawFooter()
        this.addNetworkListeners()
        this.addMapListeners()
    }

    drawBody(){
        this.body.innerHTML =  `<div class="map" id="map-${this.panel.uid}">
        </div>`
        this.buildMap()
    }

    buildMap(){
        const {view, zoom} = this.network.data.settings;
        this.map = L.map(`map-${this.panel.uid}`).setView(view).setZoom(zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

    }

    arrange(panel){
        this.map.invalidateSize()
    }

    updateBody(){
        this.drawLines()
        this.drawMarkers()
    }

    drawMarkers(){
        this.network.state.nodes.forEach(this.drawMarker) 
    }

    drawMarker(node){
        const marker = new MapMarker({data:node,map:this.map})
        this.markers.push(marker)
    }

    drawLines(){
        this.network.state.edges.forEach(this.drawLine)
    }

    drawLine(edge){
        edge.source_coord = this.network.coordinates[edge.source]
        edge.target_coord = this.network.coordinates[edge.target]
        const line = new MapLine({data:edge, map:this.map})
        this.lines.push(line)
    }

    addMapListeners(){
        const {map, notify} = this;
        const onEvent = (evt) => {
            const center = map.getCenter()
            const view = [center.lat,center.lng];
            const zoom = map.getZoom()
            notify({type:"position", zoom,view})
        }
        this.map.on('drag', onEvent);
        this.map.on('zoom', onEvent);
        this.map.on('resize', onEvent);
    }
   
    setClassVisibility(identifier, visible){
        const [type, class_name] = identifier.split("|")
        if (type === 'node'){
            this.markers.forEach(marker => marker.hasClass(class_name)? marker.setVisibility(visible):null )
        }
        if (type === 'edge'){
            this.lines.forEach(line => line.hasClass(class_name)? line.setVisibility(visible):null )
        }
        
    }


}



export default MapView;