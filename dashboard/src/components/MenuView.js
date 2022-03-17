class MenuView {
    constructor(dom_id){
        this.dom_id = dom_id;
        this.notify = console.log;
        this.callbacks = {};
    }

    setup(notify){
        this.notify = notify;
        this.draw();
        this.addListeners();
    }

    draw(){
        const menu = document.createElement("div")
        menu.setAttribute("id", this.dom_id)
        menu.innerHTML = `
            <div class="btn add">+</div>
            <div class="btn download">${this.downloadSVG()}</div>`
        document.querySelector("#header").appendChild(menu)
        this.dom = document.querySelector(`#${this.dom_id}`);
    }

    downloadSVG(){
        return `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 256 256" fill="none">
        <path d="M191.78 96.11H159.889V0.442017H96.1119V96.11H64.2209L127.998 191.778L191.78 96.11Z" fill="black"/>
        <path d="M223.67 159.89V223.667H32.33V159.89H0.442993V255.558H255.553V159.89H223.67Z" fill="black"/>
        </svg>`
    }

    addListeners(){
        this.addNewPanelListener()
        this.downloadListener()
    }

    addNewPanelListener(){
        const notify = this.notify;
        this.callbacks.add = function(){
            notify({type:"add_panel"})
        }
        document.querySelector("#menu .add").addEventListener("click", this.callbacks.add)
    }

    downloadListener(){
        const notify = this.notify;
        this.callbacks.link = function(){
            notify({type:"download"})
        }
        document.querySelector("#menu .download").addEventListener("click", this.callbacks.link)
    }

    teardown(){

    }
}

export default MenuView;