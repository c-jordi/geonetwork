import Panel from "./Panel.js"
import genUID from "./utils/genUID.js"

class Container {
    constructor(){
        this.uid;
        this.panels = []
        this.height = 1000;
        this.width = 1000;
        this.inner_margin = 5;
        this.setup();
    }

    setup(){
        this.uid = genUID();
    }

    setDimensions(width, height){
        this.width = width;
        this.height = height;
        return this;
    }

    add(panel){
        if (panel===undefined){
            panel = new Panel;
            panel.setPosition(this.inner_margin,this.inner_margin)
        }
        panel.setLayer(this.panels.length + 1)
        this.panels.push(panel)
        return panel;
    }

    addDrop(){
        const panel = new Panel;
        panel.uid = "drop";
        panel.setPosition(this.inner_margin,this.inner_margin)
        panel.setDimensions(panel.minwidth,panel.minheight)
        panel.setLayer(this.panels.length + 1)
        this.panels.push(panel)
        return panel;
    }

    remove(panel_uid){
        this.panels = this.panels.filter(el=>el.uid !== panel_uid)
        return this;    
    }

    
    snapPanelPosition(panel_uid, [x,y]){
        const panel = this.getPanel(panel_uid);
        x = Math.min(Math.max(this.inner_margin, x),this.width - panel.width - this.inner_margin);
        y = Math.min(Math.max(this.inner_margin, y),this.height - panel.height - this.inner_margin);
        panel.setPosition(x,y).setDimensions(panel.width,panel.height);
    }

    snapPanelResize(panel_uid, side, value){
        const panel = this.getPanel(panel_uid);
        let {x,y,width,height,minwidth,minheight} = panel;
        switch (side){
            case "left":
                x = Math.min(Math.max(this.inner_margin, value), x + width - minwidth);
                width = width + panel.x - x;
                break;
            case "right":
                width = Math.min(Math.max(minwidth, value - x), this.width - this.inner_margin - x);
                break;
            case "top":
                y = Math.min(Math.max(this.inner_margin, value), y + height - minheight);
                height = height + panel.y - y;
                break;
            case "bottom":
                height = Math.min(Math.max(minheight, value - y), this.height - this.inner_margin - y);
                break;
            default:
                break;
        }
        panel.setPosition(x,y).setDimensions(width,height);
    }

    focus(panel_uid){
        const panel = this.panels.find(el => el.uid === panel_uid);
        if (!panel) return this;
        const {layer} = panel;
        const nbr_panels = this.panels.length;
        this.panels = this.panels.map(el=>{
            if (el.layer === layer){
                el.layer = nbr_panels
            }
            else if (el.layer > layer){
                el.layer = el.layer - 1;
            }
            return el
        })
    }

    getPanelIds(){
        return this.panels.map(el=>el.uid)
    }

    getPanel(panel_uid){
        return this.panels.find(el=>el.uid === panel_uid) || null;
    }

    setPanelData(panel_uid,data){
        this.getPanel(panel_uid).data = data
    }

    setPanelDimensions(panel_uid, [w,h]){
        const panel = this.getPanel(panel_uid)
        panel.setDimensions(w,h);
    }

    setPanelSetting(panel_uid, property, value){
        const panel = this.getPanel(panel_uid);
        const json = JSON.parse(panel.data);
        json.settings[property] = value;
        panel.data = JSON.stringify(json,undefined,4)
    }

    setPanelErrors(panel_uid, errors){
        this.getPanel(panel_uid).errors = errors;
    }

    getPanelPosition(panel_uid){
        const panel = this.getPanel(panel_uid);
        return [panel.x,panel.y]
    }

    getPanelDimensions(panel_uid){
        const panel = this.getPanel(panel_uid);
        return [panel.width, panel.height]
    }

    toJson(){
        return {
            panels : this.panels.map(panel=>panel.toJson())
        }
    }
}

export default Container;