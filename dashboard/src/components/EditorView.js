import TabView from "./TabView.js"
import syntaxHighlight from "./utils/syntaxHighlight.js";

class EditorView extends TabView{
    constructor(props){
        super(props);
        this.name = "editor";
        this.content = props.data;
        this._edited = false;
        

        this.inputCallback = this.inputCallback.bind(this)
    }

    draw(){
        this.drawBody()
        this.drawFooter()
        this.addListeners()
    }

    drawBody(){
        this.body.innerHTML =  `<div class="editor">
            <pre class="code" contenteditable="true" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">              
            </pre>
        </div>`
    }

    drawFooter(){
        this.footer.innerHTML = `<div class="error"></div><div class="info"></div>`
    }

    write(panel){
        this.panel = panel;
        this.content = panel.data;
        return this;
    }

    update(){
        this.updateBody()
        this.updateFooter()
        return this;
    }

    updateBody(){
        const codeHTML = syntaxHighlight(this.content)
        this.body.querySelector(".code").innerHTML = codeHTML;
    }  

    updateFooter(){
        const {errors} = this.panel;
        this._edited = this.content !== this.panel.data;
        if (this._edited){
            this.footer.querySelector(".error").innerHTML = "";
            this.footer.querySelector(".info").innerHTML = `<div class='caption'>Apply with CTRL + ENTER</div>`
        }
        else {
            this.footer.querySelector(".error").innerHTML = errors.length ? `<div class='symbol'>!</div><div class='caption'>${errors[0].msg}</div>` : "";
            this.footer.querySelector(".info").innerHTML = ""
        }
    }

    addListeners(){
        this.addInputListener()
        this.addKeydownListener()
    }

    addInputListener(){
        this.body.querySelector(".code").addEventListener("input", this.inputCallback)
    }

    inputCallback({target:{innerText}}){
        this.content = innerText;
        this.updateFooter()
    }

    getCursorPosition(){
        const {startContainer, startOffset} = window.getSelection().getRangeAt(0)
        return {startContainer, startOffset}
    }

    setCursorPosition({startContainer, startOffset}){
        var range = document.createRange()
        var sel = window.getSelection()
        
        range.setStart(startContainer, startOffset)
        range.collapse(true)
        
        sel.removeAllRanges()
        sel.addRange(range)
    }

    addKeydownListener(){
        const notify = this.notify;
        const codeblock = this.body.querySelector(".code")
        this.callbacks.keydown = function(evt){
            switch(evt.key){
                case "Enter":
                    if (evt.ctrlKey) {
                        notify({type:"update",value:evt.target.innerText})
                    }
                    break;
                case "Tab":
                    evt.preventDefault()
                    break;
                default:
                    break;
            }
        }
        codeblock.addEventListener("keydown", this.callbacks.keydown)
    }

    removeListeners(){
        this.removeInputListener()
        this.removeKeydownListener()
    }

    removeInputListener(){
        this.body.querySelector(".code").removeEventListener("input", this.callbacks.input)
    }

    removeKeydownListener(){
        this.body.querySelector(".code").removeEventListener("keydown", this.callbacks.keydown)
    }
    
}

export default EditorView