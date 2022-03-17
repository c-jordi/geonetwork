import Validator from "./Validator.js";
import download from "./utils/download.js";
import safeJSONParse from "./utils/safeJSONParse.js";

class Controller {
    constructor(header, container, view, menu){
        this.header = header
        this.container = container;
        this.view = view;
        this.menu = menu;
        this.cache = {};

        this.notify = this.notify.bind(this)
    }

    setup(mode){
        this.view.setup((msg) => this.notify({origin: "container", ...msg}))
        this.menu.setup((msg) => this.notify({origin: "menu", ...msg}))
        this.autofit()
        if (mode === 'debug'){
            this.addPanel()
        }
    }

    notify(msg){
        switch (`${msg.origin}|${msg.type}`){
            case "tab|refresh":
                return this.refresh(msg);
            case "menu|download":
                return this.download(msg);
            case "controller|add_panel":
            case "menu|add_panel":
            case "container|add_panel":
            case "dropzone|add_panel":
                return this.addPanel(msg);
            case "dropzone|open_board":
                return this.openBoard(msg)
            case "container|resize":
                return this.autofit()
            case "controller|close_panel":
            case "panel|close":
                return this.closePanel(msg);
            case "panel|drag":
                return this.dragPanel(msg)  ;
            case "panel|resize":
                return this.resizePanel(msg);
            case "panel|focus":
                return this.focusPanel(msg);
            case "panel|switch":
                return this.switchTab(msg);
            case "tab|update":
                return this.updateData(msg);
            case "tab|cursor":
                return this.updateCursor(msg);
            case "tab|legend":
                return this.updateLegend(msg);
            case "tab|position":
                return this.updatePosition(msg);
            case "validator|update":
                return this.updateErrors(msg);
            default:
                return console.log("Not handled: ", msg)
        }
    }

    refresh({panel_uid}){
        this.update([panel_uid])
    }

    download(msg){
        const serial = this.serialize()
        const date = new Date().toLocaleDateString();
        download(serial, `Board ${date}.geonet`, "text/plain")
    }

    serialize(){
        const data = {header:this.header, ...this.container.toJson()}
        return JSON.stringify(data, undefined, 4)
    }

    openBoard(msg){
        const [valid, data] = safeJSONParse(msg.data)
        if (!valid) alert("The geonetwork board cannot be read.")
        if (confirm("Are you sure you want to leave this board?")){
            this.closeAllPanels()
            this.addPanels(data.panels)
        }
    }

    updateData({panel_uid, value}){
        this.container.setPanelData(panel_uid,value)
        const notify = (data)=>this.notify({origin:"validator",panel_uid,...data});
        const validator = new Validator({notify})
        validator.run(value)
    }

    updateLegend({panel_uid, legend}){
        this.container.setPanelSetting(panel_uid,"legend",legend)
    }

    updatePosition({panel_uid, zoom, view}){
        this.container.setPanelSetting(panel_uid,"view",view)
        this.container.setPanelSetting(panel_uid,"zoom",zoom)
    }

    updateCursor({panel_uid,datetime}){
        this.container.setPanelSetting(panel_uid,"cursor",datetime)
        this.update([panel_uid])
    }

    toggleClass({panel_uid,classname}){
        this.container.setPanelSetting(panel_uid,"cursor",classname)
        this.update([panel_uid])
    }

    updateErrors({panel_uid, errors}){
        this.container.setPanelErrors(panel_uid,errors)
        this.update([panel_uid])
    }

    switchTab({panel_uid,value}){
       this.container.getPanel(panel_uid).switchTab(value)
       this.update([panel_uid])
    }

    addPanel(msg){
        msg = msg || {}
        const panel = this.container.add() 
        this.view.draw(panel)
        this.view.update(panel)
        this.view.arrange(panel)
        if (msg.data) this.updateData({panel_uid:panel.uid,value:msg.data})
        if (msg.dimensions) this.container.setPanelDimensions(panel.uid, msg.dimensions) 
        if (msg.anchor) this.container.snapPanelPosition(panel.uid,msg.anchor)
        this.view.arrange(panel) 
    }

    addPanels(panels){
        const notify = this.notify;
        panels.forEach(({data,x,y,width,height})=>{
            const msg = {data:data,anchor:[x,y],dimensions:[width,height]}
            notify({origin:"controller",type:"add_panel",...msg})
        })
    }

    closePanel({panel_uid}){
        console.log("close panel",panel_uid)
        this.container.remove(panel_uid);
        this.view.remove(panel_uid);
    }

    closeAllPanels(){
        const notify = this.notify;
        const panel_uids = this.container.getPanelIds();
        panel_uids.forEach((panel_uid)=>notify({origin:"controller", panel_uid, type:"close_panel"}))
    }

    focusPanel({panel_uid}){
        this.container.focus(panel_uid)
        this.arrange()
    }

    dragPanel({panel_uid,event,value}){
        if (event === "down"){
            this.cache.origin = value;
            this.cache.start = this.container.getPanelPosition(panel_uid)
        }
        else if (event === "move") {
            const {origin, start} = this.cache;
            const end = [start[0] + value[0] - origin[0], start[1] + value[1] - origin[1]];
            this.container.snapPanelPosition(panel_uid, end);
            this.arrange([panel_uid])
        }
    }

    resizePanel({panel_uid,facet,event,value}){
        if (event === "down"){
            this.cache.origin = value;
            this.cache.start = this.container.getPanelPosition(panel_uid)
            this.cache.dim = this.container.getPanelDimensions(panel_uid)
            document.body.classList.add("no-select")
        }
        else if (event === "move") {
            const {origin, start, dim} = this.cache;
            switch(facet){
                case "left":
                    this.container.snapPanelResize(panel_uid, "left", start[0] + value[0] - origin[0])
                    break
                case "right":
                    this.container.snapPanelResize(panel_uid, "right", start[0] + dim[0] + value[0] - origin[0])
                    break;
                case "top":
                    this.container.snapPanelResize(panel_uid, "top", start[1] + value[1] - origin[1])
                    break;
                case "bottom":
                    this.container.snapPanelResize(panel_uid, "bottom", start[1] + dim[1] + value[1] - origin[1])
                    break
                case "top-left":
                    this.container.snapPanelResize(panel_uid, "top", start[1] + value[1] - origin[1])
                    this.container.snapPanelResize(panel_uid, "left", start[0] + value[0] - origin[0])
                    break;
                case "top-right":
                    this.container.snapPanelResize(panel_uid, "top", start[1] + value[1] - origin[1])
                    this.container.snapPanelResize(panel_uid, "right", start[0] + dim[0] + value[0] - origin[0])
                    break
                case "bottom-right":
                    this.container.snapPanelResize(panel_uid, "bottom", start[1] + dim[1] + value[1] - origin[1])
                    this.container.snapPanelResize(panel_uid, "right", start[0] + dim[0] + value[0] - origin[0])
                    break
                case "bottom-left":
                    this.container.snapPanelResize(panel_uid, "bottom", start[1] + dim[1] + value[1] - origin[1])
                    this.container.snapPanelResize(panel_uid, "left", start[0] + value[0] - origin[0])
                    break;
                default:
                    break;
            }

            this.arrange([panel_uid])
        }
        else if (event === "up") {
            document.body.classList.remove('no-select')
        }
    }

    autofit(){
        this.container.setDimensions(...this.view.getDimensions());
    }

    arrange(panel_uids){
        if (panel_uids === undefined){
            panel_uids = this.container.getPanelIds()
        }
        panel_uids.forEach(panel_uid=>{
            const panel = this.container.getPanel(panel_uid);
            this.view.arrange(panel);
        })
    }

    update(panel_uids){
        if (panel_uids === undefined){
            panel_uids = this.container.getPanelIds()
        }
        panel_uids.forEach(panel_uid=>{
        
            const panel = this.container.getPanel(panel_uid);
            this.view.update(panel);
        })
    }
}

export default Controller;