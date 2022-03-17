class TabView{
    constructor({panel,body,footer,notify}){
        this.name = 'tab';
        this.panel = panel;
        this.body = body;
        this.footer = footer;
        this.notify = notify;
        this.callbacks = {}
        this.whenFocused = [];
        this.whenUnfocused = [];

        this.cache = this.cache.bind(this)
    }

    focus(){
        this.whenFocused.forEach(fn => fn())
    }

    unfocus(){
        this.whenUnfocused.forEach(fn=> fn())
    }

    write(panel){
        this.panel = panel;
        return this;
    }

    draw(){}

    cache(obj){
        if (this.panel && this.panel.cache){
            this.panel.cache = {...this.panel.cache, ...obj}
        }
    }

    update(){
        return this;
    }

    arrange(panel){}

    remove(){
        this.removeListeners()
        this.removeContent()
    }

    removeContent(){
        this.body.innerHTML = ""
        this.footer.innerHTML = ""
    }

    removeListeners(){

    }
}

export default TabView;