import TabView from "./TabView.js";
import Network from './Network.js'

class NetworkView extends TabView{
    constructor(props){
        super(props)
        this.network = new Network({data:props.panel.data, notify:this.notify})
        this.legend = null;
        this.selector = null;
        this.min_slider_block = 3;

        this.appendDateTile = this.appendDateTile.bind(this)
        this.appendLegendItem = this.appendLegendItem.bind(this)
        this.onLegendItemClick = this.onLegendItemClick.bind(this)
        this.extendFooter = this.extendFooter.bind(this)
        this.update = this.update.bind(this)
        this.updateCursor = this.updateCursor.bind(this)
    }

   
    drawNetwork(){
        // override in inherited class
        console.log("Draw network:", this.network.state)
    }

    setClassVisibility(identifier, visible){
        // override in inherited class
        console.log(identifier, "will be " + (visible? "shown":"hidden")) 
    }

    drawFooter(){
        this.footer.innerHTML = `<div class="toggles">
          
           
            <div class="legend extended">
                <div class="label" data-extend="legend">Legend</div>
                <div class="items if-ext">
                </div>
            </div>
            <div class="border"></div>
            <div class="datetime">
            <div class="day" data-extend="datetime">2021-01-10</div>
            <div class="time if-ext">09:26:03</div>
            <div class="selector if-ext">
            </div>
            </div>
        </div>`
        this.legend = this.footer.querySelector(".legend .items")
        this.selector = this.footer.querySelector(".selector")
    }

    write(panel){
        this.panel = panel;
        this.network = new Network({data:panel.data, notify:this.notify})
        return this;
    }

    update(){
        this.network.run()
        this.updateFooter()
        this.updateBody()
    }

    updateFooter(){
        this.updateLegendFooter()
        this.updateDatetimeFooter()
        this.updateExtended()
    }

    updateLegendFooter(){
        if (!this.network.classes.nodes.length && this.network.classes.edges.length){
            this.legend.innerHTML = "Class names of nodes and edges will appear here."
        }
        this.legend.innerHTML = "";
        this.network.data.settings.legend.forEach(this.appendLegendItem)
    }

    appendLegendItem(el){
        const item = document.createElement("div")
        item.classList.add(el.type)
        const icon = document.createElement("div")
        icon.classList.add("icon")
        let style = "";
        if (el.type === "node") style += style + el.$fill? `background-color: ${el.$fill};` : "";
        if (el.type === "edge") style += style + el.$stroke? `background-color: ${el.$stroke};` : "";
        icon.setAttribute("style",style);
        const label = document.createElement("div")
        label.classList.add("label")
        const is_hidden = this.panel.cache.hidden.filter(i=>i.split("|")[0]===el.type && i.split("|")[1] === el.class).length
        label.setAttribute("data-id", el.type + "|" + el.class)
        if (is_hidden) label.setAttribute("data-hidden",true)
        label.innerHTML = el.label || el.class
        item.appendChild(icon)
        item.appendChild(label)
        this.legend.append(item)
        label.addEventListener("click", this.onLegendItemClick)
    }

    onLegendItemClick({target}){
        const ident = target.getAttribute("data-id");
        const hidden = target.hasAttribute("data-hidden")
        if (hidden){
            target.removeAttribute("data-hidden")
            this.panel.cache.hidden = this.panel.cache.hidden.filter(el=>el!==ident)
        }
        else {
            target.setAttribute("data-hidden",true)
            this.panel.cache.hidden.push(ident)
        }
        this.setClassVisibility(ident, hidden)
    }

    updateDatetimeFooter(){
        const {day, time} = this.formatDatetime()
        this.footer.querySelector(".datetime .day").innerText = day;
        this.footer.querySelector(".datetime .time").innerText = time;
        if (this.network.datetimes.length == 0){
            this.selector.setAttribute("style","display:none;")
        } else {
            this.selector.setAttribute("style","")
        }
        this.drawSelector()
    }

    updateExtended(){
        if (this.panel.cache.extended){
            this.extendFooter(this.panel.cache.extended)
        }
    }

    formatDatetime(){
        let cursor = 'start';
        let day = "";
        let time = "";
        if (this.network.data.settings && this.network.data.settings.cursor){
            cursor = this.network.data.settings.cursor;
        }
        if (cursor === 'start'){
            day = "<"
            cursor = this.network.datetimes[0];
        }
    
        const pad = (d) => (d < 10) ? '0' + d.toString() : d.toString()
        const d = new Date(cursor);
        day = day + d.getFullYear() + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate());
        time = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds())
        
        return {day,time}
    }


    addNetworkListeners(){
        this.addToggleListener()
    }

    addToggleListener(){
        const {footer, extendFooter, cache} = this;
        const extenders = footer.querySelectorAll("[data-extend]");
        const onextend = ({target}) => {
            const name = target.getAttribute("data-extend");
            cache({extended:name})
            extendFooter(name)
        }
        extenders.forEach(ext=>ext.addEventListener("click", onextend))
    }

    extendFooter(name){
        const footer = this.footer;
        if (footer.querySelector(`.${name}`).classList.contains("extended")) return;
        footer.querySelector(".datetime").classList.remove("extended")
        footer.querySelector(".legend").classList.remove("extended")
        footer.querySelector(`.${name}`).classList.add("extended")
    }


    drawSelector(){
        const appendDateTile = this.appendDateTile;
        const {datetimes} = this.network;
        const alpha = 100/datetimes.length;
        const range = (new Date(datetimes[datetimes.length - 1]) - new Date(datetimes[0]));
        appendDateTile("start", `calc(${alpha}% - 1px)`)
        datetimes.forEach((val,i)=>{
            if (i === datetimes.length - 1){
                appendDateTile(val,`calc(${alpha}% - 1px)`)
            }
            else{
                const width = (new Date(datetimes[i+1]) - new Date(datetimes[i]))/range * (100-2*alpha);
                appendDateTile(val, `calc(${width}% - 1px)`)
            }
        })
    }

    appendDateTile(datetime,width){
        // width as a percentage
        const tile = document.createElement("div")
        tile.classList.add("tile")
        tile.setAttribute("style", `width:${width};`)
        tile.setAttribute("data-cursor",datetime)
        this.selector.appendChild(tile)
        tile.addEventListener("click", this.updateCursor)
    }

    updateCursor({target}){
        const datetime = target.getAttribute("data-cursor")
        this.notify({type:"cursor", datetime})
    }

    removeNetworkListeners(){

    }

}

export default NetworkView;