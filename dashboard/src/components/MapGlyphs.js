class MapGlyph {
    constructor({map,data}){
        this.map = map;
        this.data = data;
        this.glyph = null;
        this.popup = null;

        this.createPopup()
    }

    createPopup(){
      const table = [];
      const props = this.data.properties;
      const keys = Object.keys(props || {})
      new Array("id","label","class", "source", "target").forEach(key=>{
        if (!this.data[key]) return;
        table.push(`<tr><td class="key">${key}</td><td>${this.data[key] || ""}</td></tr>`)
      })
      keys.forEach(key=>{
        if (key.slice(0,1) === "$") return;
        table.push(`<tr><td class="key">${key}</td><td>${props[key]}</td></tr>`)
      })

      this.popup = L.popup({autopan:false})
      .setContent(`<table class="popup">
        ${table.join("")}
        </tr>`)
    }

    hasClass(class_name){
      return this.data.class.includes(class_name)
    }

    setVisibility(visible){
      if (visible) {
        this.glyph.addTo(this.map)
      } 
      else {
        this.map.removeLayer(this.glyph)
      }
    }
}

export class MapMarker extends MapGlyph{
    constructor(props){
        super(props);
        this.draw()
    }

    draw(){
        this.glyph = L.circleMarker(this.data.coordinates, {
            color: this.data.properties.$stroke,
            fillColor: this.data.properties.$fill,
            fillOpacity: 1,
            radius: this.data.properties.$size,
            className : 'geonet-node'
        }).addTo(this.map);
        this.glyph.bindPopup(this.popup)
    }

    hide(){
        
    }

    show(){

    }
}

export class MapLine extends MapGlyph{
  constructor(props){
    super(props)
    this.draw()
  }

  draw(){
    const latlngs = [this.data.source_coord, this.data.target_coord]
    this.glyph = L.polyline(latlngs, {
      color: this.data.properties.$stroke,
      opacity: .8,
      weight: this.data.properties.$size,
      className : 'geonet-edge'
    }).addTo(this.map);
    
    this.glyph.bindPopup(this.popup)
  }

}