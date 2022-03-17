import GeonetEditor from "./EditorView.js"
import GeonetTab from "./TabView.js";

class View {
    constructor(view_dom_id){
        this.view_dom_id = view_dom_id;
        this.view = document.querySelector("#"+this.view_dom_id);
        this.tabs = {};
        this.drawn = [];
        this.callbacks = {};
    }

    rebase(view_dom_id){
        this.view_dom_id = view_dom_id;
        this.view = document.querySelector("#"+this.view_dom_id);
    }

    getDimensions(){
        return [this.view.clientWidth, this.view.clientHeight]
    }

    runChecks(){
        if (!this.view) throw new Error("ViewError: A valid parent id has not been provided.")
    }

    clearAll(){
        this.runChecks()
        this.view.innerHTML = "";
    }

    addMenu(){
        const menu = document.createElement("div")
        menu.setAttribute("id","menu")
        menu.innerHTML = `
            <div class="add">+</div>
            <div class="options">:</div>`
        document.querySelector("#header").appendChild(menu)
    }

    drawPanel(panel){
        this.runChecks();
        const component = document.createElement("div");
        component.setAttribute("class","panel")
        component.setAttribute("id", "panel-" + panel.uid)
        component.setAttribute("style", `top:${panel.y}px;left:${panel.x}px;z-index:${panel.layer};width:${panel.width}px;height:${panel.height}px;`)
        component.innerHTML = (`<div class="content"><div class="header">
            <div class="tabs">
            <div class="tab" data-callback="map">Map</div> 
            <div class="divider"></div>
            <div class="tab" data-callback="figure">Figure</div>
            <div class="divider"></div>
            <div class="tab active" data-callback="editor">Editor</div>
            <div class="divider"></div>
            </div>
            <div class="title" role="img"></div>
            <div class="controls"><div class="pad"></div><div class="control close" data-callback='close'>×</div></div>
            </div>
            <div class="body">
                <div class="editor">
                  
                </div>
            </div>
            <div class="footer">
            
            </div>
            </div> 
            </div>
            <div class="borders">
            <div class="resize-t" data-callback="top"></div> 
            <div class="resize-l" data-callback="left"></div> 
            <div class="resize-r" data-callback="right"></div> 
            <div class="resize-b" data-callback="bottom"></div> 
            <div class="resize-tr" data-callback="top-right"></div>
            <div class="resize-br" data-callback="bottom-right"></div>
            <div class="resize-bl" data-callback="bottom-left"></div>
            <div class="resize-tl" data-callback="top-left"></div>
            </div>`
            )
        this.view.appendChild(component)
        this.drawn.push(panel.uid)
    }

    updatePanelPosition(panel){
        const component = document.querySelector("#panel-"+panel.uid);
        component.setAttribute("style", `top:${panel.y}px;left:${panel.x}px;z-index:${panel.layer};width:${panel.width}px;height:${panel.height}px;`)
    } 

    updatePanelContent(panel){
        this.updatePanelHeader(panel)
        this.updatePanelTab(panel)
        this.tabs[panel.uid].update()
    }

    updatePanelHeader(panel){
       this.updatePanelTitle(panel)
       this.updatePanelNav(panel)
    }

    updatePanelTitle(panel){
        let title = panel.cache.title;
        if (!panel.errors.length){
            title = JSON.parse(panel.data).title || title;
            panel.cache.title = title;
        }
        const component = document.querySelector("#panel-"+panel.uid);
        component.querySelector(".title").innerHTML= title;
    }

    updatePanelNav(panel){
        const component = document.querySelector("#panel-"+panel.uid);
        ['map','figure','editor'].forEach(tab=>component.querySelector(`[data-callback="${tab}"]`).setAttribute("class", "tab"))
        if (panel.errors.length){
            ['map','figure'].forEach(tab=>component.querySelector(`[data-callback="${tab}"]`).classList.add("deactive"))
        }
        component.querySelector(`[data-callback="${panel.tab}"]`).classList.add("active")
    }

    updatePanelTab(panel){
        const name = this.tabs[panel.uid]? this.tabs[panel.uid].name : null;
        if (name && name === panel.tab) return;
        this.removePanelTab(panel)
        this.appendPanelTab(panel)
        this.view.updatePanelTab(panel)
        this.view.registerTabCallbacks(panel.uid,  (data)=>this.notify({...data,panel_uid:panel.uid}))
        
    }

    removePanelTab(panel){
        if (this.tabs[panel.uid]) {
            this.tabs[panel.uid].remove()
            this.tabs[panel.uid].deregisterCallbacks()
            delete this.tabs[panel.uid]
        }
    }

    appendPanelTab(panel){
        this.tabs[panel.uid] = this.createTab(panel)
        const component = document.querySelector("#panel-"+panel.uid);
        const body = component.querySelector(".content .body");
        const footer = component.querySelector(".content .footer");
        this.tabs[panel.uid].attach(body,footer)
        this.tabs[panel.uid].draw()
        const rootCallback = this.callbacks["container"].root
        this.tabs[panel.uid].registerCallbacks((data)=>rootCallback({...data,panel_uid:panel.uid}))
    }

    registerPanelTabCallback()

    createTab(panel){
        switch(panel.tab){
            case "editor":
                return new GeonetEditor(panel)
            default:
                return new GeonetTab(panel)
        }
    }

    registerPanelCallbacks(panel_uid, callback){
        this.callbacks[panel_uid] = {root:callback}
        const component = document.querySelector("#panel-"+panel_uid);
        this.registerPanelFocusCallback(component, panel_uid)
        this.registerPanelTabsCallback(component, panel_uid)
        this.registerPanelCloseCallback(component, panel_uid)
        this.registerPanelDragCallback(component, panel_uid)
        this.registerPanelResizeCallback(component, panel_uid)
    }

    registerPanelFocusCallback(component, panel_uid){
        const rootCallback = this.callbacks[panel_uid].root;
        this.callbacks[panel_uid].focus = function(){
            rootCallback({type:"panel_focus"})
        }
        component.querySelector(".content").addEventListener("mousedown", this.callbacks[panel_uid].focus)
    }


    registerPanelTabsCallback(component, panel_uid){
        const rootCallback = this.callbacks[panel_uid].root;
        this.callbacks[panel_uid].tabs = function(evt){
            const {target} = evt;
            rootCallback({type:"tab_switch", value:target.getAttribute("data-callback")})
            evt.stopPropagation()
        }
        const tabs = component.querySelectorAll(".tab[data-callback]");
        tabs.forEach(el=>el.addEventListener("click", this.callbacks[panel_uid].tabs))
    }

    registerPanelCloseCallback(component, panel_uid){
        const rootCallback = this.callbacks[panel_uid].root;
        this.callbacks[panel_uid].close = function(evt){
            const {target} = evt;
            evt.stopPropagation()
            rootCallback({type:"panel_close"})
        }
        component.querySelector(".close[data-callback]").addEventListener("click",this.callbacks[panel_uid].close)
    }

    registerPanelResizeCallback(component, panel_uid){
        const rootCallback = this.callbacks[panel_uid].root;
        this.callbacks[panel_uid].resize = function(evt){
            const facet = evt.target.getAttribute("data-callback");
            rootCallback({type:"panel_resize", event: "down", facet, value:[evt.clientX,evt.clientY]})
            const mousemove = (move_evt) => rootCallback({type:"panel_resize", event:"move", facet, value:[move_evt.clientX,move_evt.clientY]})
            const unmount = () => {
                rootCallback({type:"panel_resize", event:"up"})
                window.removeEventListener("mousemove", mousemove)
                window.removeEventListener("mouseup", unmount)
                window.removeEventListener("contextmenu", unmount)
            }

            window.addEventListener("mousemove", mousemove)
            window.addEventListener("mouseup", unmount)
            window.addEventListener("contextmenu", unmount)
        }
        const resizers = component.querySelectorAll("[class^='resize']");
        resizers.forEach(el=>el.addEventListener("mousedown", this.callbacks[panel_uid].resize))
    }

    registerPanelDragCallback(component, panel_uid){
        const rootCallback = this.callbacks[panel_uid].root;
        this.callbacks[panel_uid].drag = function(down_evt){
            rootCallback({type:"panel_drag", event:"down", value:[down_evt.clientX,down_evt.clientY]})
            const mousemove = (move_evt) => rootCallback({type:"panel_drag", event:"move", value:[move_evt.clientX,move_evt.clientY]})
            const unmount = () => {
                rootCallback({type:"panel_drag", event:"up"})
                window.removeEventListener("mousemove", mousemove);
                window.removeEventListener("mouseup", unmount)
                window.removeEventListener("contextmenu", unmount)
            }

            window.addEventListener("mousemove", mousemove)
            window.addEventListener("mouseup", unmount)
            window.addEventListener("contextmenu", unmount)
        
        }

        component.querySelector(".header .title").addEventListener("mousedown", this.callbacks[panel_uid].drag, true)
    }


    deregisterContainerCallbacks(){
        this.deregisterContainerResizeCallback()
        this.deregisterAddPanelCallback()
    }

    deregisterContainerResizeCallback(){
        window.removeEventListener("resize", this.callbacks["container"].resize)
    }

    deregisterAddPanelCallback(){
        document.querySelector("#menu .add").removeEventListener("click", this.callbacks["container"].add);
    }

    deregisterPanelCallbacks(panel_uid){
        const component = document.querySelector("#panel-"+panel_uid);
        this.deregisterPanelFocusCallback(component, panel_uid);
        this.deregisterPanelTabsCallback(component, panel_uid);
        this.deregisterPanelCloseCallback(component, panel_uid);
        this.deregisterPanelDragCallback(component, panel_uid);
        this.deregisterPanelResizeCallback(component, panel_uid);
        delete this.callbacks[panel_uid]
    }

    deregisterPanelFocusCallback(component, panel_uid){
        component.querySelector(".content").addEventListener("mousedown", this.callbacks[panel_uid].focus)
    }

    deregisterPanelTabsCallback(component, panel_uid){
        const tabs = component.querySelectorAll(".tab[data-callback], .control[data-callback]");
        tabs.forEach(el=>el.removeEventListener("click", this.callbacks[panel_uid].tabs), true)
    }

    deregisterPanelCloseCallback(component, panel_uid){
        component.querySelector(".close").removeEventListener("click", this.callbacks[panel_uid].close)
    }

    deregisterPanelDragCallback(component, panel_uid){
        component.querySelector(".header .title").removeEventListener("mousedown", this.callbacks[panel_uid].drag, true)
    }

    deregisterPanelResizeCallback(component, panel_uid){
        const resizers = component.querySelectorAll("[class^='resize']");
        resizers.forEach(el=>el.removeEventListener("mousedown", this.callbacks[panel_uid].resize))
    }

    deregisterTabCallbacks(panel_uid){
        this.tabs[panel_uid].deregisterCallbacks()
        delete this.tabs[panel_uid]
    }

    clearPanel(panel_uid){
        const component = document.querySelector("#panel-" + panel_uid);
        component.parentElement.removeChild(component);
        this.drawn = this.drawn.filter(el => el.uid !== panel_uid)
    }

}

export default View;