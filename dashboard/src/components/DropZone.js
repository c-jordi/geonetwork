class DropZone {
    constructor({parent, notify}){
        this.parent = parent;
        this.notify = notify;
        this.is_active = false;
        this.callbacks = {}

        this.setup();
    }

    setup(){
        this.addListeners()
    }

    addListeners(){
        this.addDragDropListener()
    }

    addDragDropListener(){
        const {drop,readFile, notify} = this;
        this.callbacks.dragdrop = async (evt) => {
            console.log(evt)
            evt.preventDefault();
            const anchor = [evt.x,evt.y-60]
            const [type,data] = await readFile(evt)
            if (type=="board") this.notify({type:"open_board", data, anchor})
            if (type=="panel") this.notify({type:"add_panel", data, anchor})
        }
        window.addEventListener("drop", this.callbacks.dragdrop)
        window.addEventListener("dragover", (evt)=>evt.preventDefault())
    }

    readFile(e){
        return new Promise((res,rej)=>{
            var file = e.dataTransfer.files[0],
            reader = new FileReader();
            reader.onload = function (event) {
                let type = null;
                if (file.name.match(/\.geonet$/g)) type = "board";
                else if (file.name.match(/\.json$/g)) type = "panel";
                res([type,event.target.result])
            };
            reader.readAsText(file);
        })
    }

}

export default DropZone;