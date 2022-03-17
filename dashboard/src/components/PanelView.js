import EditorView from "./EditorView.js"
import MapView from "./MapView.js"
import TabView from "./TabView.js"

class PanelView {
    constructor({panel, parent, notify}){
        this.uid = panel.uid;
        this.parent = parent;
        this.notify = notify;
        this.callbacks = {}
        this.dom = null;
        this.tab = null;

        this.draw(panel);
        this.drawTab(panel);
        this.addListeners();
    }

    draw(panel){
        const component = document.createElement("div");
        component.setAttribute("class","panel")
        component.setAttribute("id", "panel-" + panel.uid)
        component.setAttribute("style", `top:${panel.y}px;left:${panel.x}px;z-index:${panel.layer};width:${panel.width}px;height:${panel.height}px;`)
        component.innerHTML = (`<div class="content"><div class="header">
            <div class="tabs">
            <div class="tab" data-callback="map">Map</div> 
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
        this.parent.appendChild(component)
        this.dom = document.querySelector(`#panel-${panel.uid}`);
    }

    drawTab(panel){
        const Tab = this.selectTab(panel.tab);
        const body = this.dom.querySelector(".content .body")
        const footer = this.dom.querySelector(".content .footer")
        const notify = (msg) =>this.notify({origin:"tab",panel_uid:panel.uid,...msg})
        this.tab = new Tab({panel, body, footer, notify});
        this.tab.draw()
    }

    selectTab(tab){
        switch(tab){
            case "editor":
                return EditorView;
            case "map":
                return MapView
            default:
                return TabView;
        }
    }

    addListeners(){
        this.addNavListener()
        this.addFocusListener()
        this.addCloseListener()
        this.addResizeListener()
        this.addDragListener()
    }

    addNavListener(){
        this.callbacks.nav = ({target}) => this.notify({type:"switch", value:target.getAttribute("data-callback")})
        const nav_items = this.dom.querySelectorAll(".tab[data-callback]");
        nav_items.forEach(el=>el.addEventListener("click", this.callbacks.nav))
    }
    
    removeNavListener(){
        const nav_items = this.dom.querySelectorAll(".tab[data-callback]");
        nav_items.forEach(el=>el.removeEventListener("click", this.callbacks.nav))
    }

    addFocusListener(){
        const notify = this.notify;
        this.callbacks.focus = (evt) => {
            notify({type:"focus"});
            evt.stopPropagation()
        }
        this.dom.querySelector(".content").addEventListener("mousedown", this.callbacks.focus)
    }

    removeFocusListener(){
        this.dom.querySelector(".content").removeEventListener("mousedown", this.callbacks.focus)
    }

    addCloseListener(){
        this.callbacks.close = ({target}) => this.notify({type:"close"})
        this.dom.querySelector(".close[data-callback]").addEventListener("click",this.callbacks.close)
    }

    removeCloseListener(){
        this.dom.querySelector(".close[data-callback]").removeEventListener("click",this.callbacks.close)
    }

    addResizeListener(){
        const notify = this.notify;
        this.callbacks.resize = (evt) => {
            const facet = evt.target.getAttribute("data-callback");
            notify({type:"resize", event: "down", facet, value:[evt.clientX,evt.clientY]})
            const mousemove = (move_evt) => notify({type:"resize", event:"move", facet, value:[move_evt.clientX,move_evt.clientY]})
            const unmount = () => {
                notify({type:"resize", event:"up"})
                window.removeEventListener("mousemove", mousemove)
                window.removeEventListener("mouseup", unmount)
                window.removeEventListener("contextmenu", unmount)
            }
            window.addEventListener("mousemove", mousemove)
            window.addEventListener("mouseup", unmount)
            window.addEventListener("contextmenu", unmount)
        }
        const resizers = this.dom.querySelectorAll("[class^='resize']");
        resizers.forEach(el=>el.addEventListener("mousedown", this.callbacks.resize))
    }

    removeResizeListener(){
        const resizers = this.dom.querySelectorAll("[class^='resize']");
        resizers.forEach(el=>el.removeEventListener("mousedown", this.callbacks.resize))
    }

    addDragListener(){
        const notify = this.notify;
        this.callbacks.drag = (down_evt) => {
            notify({type:"drag", event:"down", value:[down_evt.clientX,down_evt.clientY]})
            const mousemove = (move_evt) => notify({type:"drag", event:"move", value:[move_evt.clientX,move_evt.clientY]})
            const unmount = () => {
                notify({type:"drag", event:"up"})
                window.removeEventListener("mousemove", mousemove);
                window.removeEventListener("mouseup", unmount)
                window.removeEventListener("contextmenu", unmount)
            }
            window.addEventListener("mousemove", mousemove)
            window.addEventListener("mouseup", unmount)
            window.addEventListener("contextmenu", unmount)
        }
        this.dom.querySelector(".header .title").addEventListener("mousedown", this.callbacks.drag, true)
    }

    removeDragListener(){
        this.dom.querySelector(".header .title").removeEventListener("mousedown", this.callbacks.drag, true)
    }

    arrange(panel){
        this.dom.setAttribute("style", `top:${panel.y}px;left:${panel.x}px;z-index:${panel.layer};width:${panel.width}px;height:${panel.height}px;`)
        this.tab.arrange(panel)
    } 

    update(panel){
        this.updateHeader(panel);
        this.updateTab(panel);
    }

    updateHeader(panel){
        this.updateNav(panel)
        this.updateTitle(panel)
    }

    updateTitle(panel){
        let title = panel.cache.title;
        if (!panel.errors.length){
            title = JSON.parse(panel.data).title || title;
            panel.cache.title = title;
        }
        this.dom.querySelector(".title").innerHTML = title;
    }

    updateNav(panel){
        const dom = this.dom;
        ['map','editor'].forEach(tab=>dom.querySelector(`[data-callback="${tab}"]`).setAttribute("class", "tab"))
        if (panel.errors.length){
            ['map'].forEach(tab=>dom.querySelector(`[data-callback="${tab}"]`).classList.add("deactive"))
        }
        dom.querySelector(`[data-callback="${panel.tab}"]`).classList.add("active")
    }

    updateTab(panel){
        if (this.tab.name !== panel.tab){
            this.tab.remove()
            this.drawTab(panel)
        }
        this.tab.write(panel).update()
    }

    remove(){
        this.tab.remove()
        this.removeListeners();
        this.parent.removeChild(this.dom)
    }

    removeListeners(){
        this.removeCloseListener()
        this.removeDragListener()
        this.removeNavListener()
        this.removeResizeListener()
        this.removeFocusListener()
    }

    
}

export default PanelView;