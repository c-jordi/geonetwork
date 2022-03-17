import Container from "./components/Container.js"
import ContainerView from "./components/ContainerView.js"
import MenuView from "./components/MenuView.js"
import Controller from "./components/Controller.js"

class Application {
    constructor(){
        this.header = {version:"alpha0.1", date:Date()}
        this.container = new Container()
        this.view = new ContainerView("board")
        this.menu = new MenuView("menu")
        this.controller = new Controller(this.header, this.container,this.view, this.menu)
    }

    run(){
        // if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            // }
        this.controller.setup("debug")
    }
}
const App = new Application()
App.run()


