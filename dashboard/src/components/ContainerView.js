import PanelView from "./PanelView.js"
import DropZone from "./DropZone.js";

class ContainerView {
    constructor(dom_id){
        this.dom_id = dom_id;
        this.dom = document.querySelector("#"+this.dom_id);
        this.panel_views = [];
        this.notify = ()=>{};
        this.callbacks = {};
        this.drop_zone = null;
    }


    setup(notify){
        this.notify = notify;
        this.addDropZone();
        this.addListeners();
    }

    addDropZone(){
        const parent = this.dom;
        const notify = (msg) => this.notify({origin:"dropzone", ...msg})
        this.drop_zone = new DropZone({parent,notify})
    }

    addListeners(){
        this.addResizeListener()
    }

    getDimensions(){
        return [this.dom.clientWidth, this.dom.clientHeight]
    }

    check(){
        if (!this.dom) throw new Error("ContainerViewError: The container view is not attached to a valid dom element.")
    }

    addResizeListener(){
        this.callbacks.resize = () => this.notify({type:"resize"})
        window.addEventListener("resize", this.callbacks.resize)
    }

    
    clear(){
        this.panel_views.forEach(panel_view=>panel_view.remove())
    }

    draw(panel){
        const parent = this.dom;
        const notify = (msg) => this.notify({origin:"panel",panel_uid:panel.uid,...msg})
        const panel_view = new PanelView({panel, parent, notify})
        this.panel_views.push(panel_view)
    }

    remove(panel_uid){
        this.panel_views.find((el)=>el.uid===panel_uid).remove()
    }

    arrange(panel){
        this.panel_views.find((el)=>el.uid===panel.uid).arrange(panel)
    }

    update(panel){
        this.panel_views.find((el)=>el.uid===panel.uid).update(panel)
    }

    redraw(){

    }

    teardown(){

    }

}

export default ContainerView;