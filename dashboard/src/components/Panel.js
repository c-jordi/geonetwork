import genUID from "./utils/genUID.js"

class Panel {
    constructor(){
        this.uid = genUID();
        this.width  = 400;
        this.height = 400;
        this.minwidth = 200;
        this.minheight = 200;
        this.x = 0;
        this.y = 0;
        this.layer = 1;
        this.tab = "editor";
        this.data = JSON.stringify({
            title : "New",
            geonet: "latest",
            nodes : [{id:"Zurich", class:"producer",coordinates:[47.3775499,8.4666751],properties:{owner:"Sunshine", $size: 20}}, {id:"Basel", class:"consumer", coordinates:[47.5546492,7.5594405]}],
            edges : [{source:"Zurich", target:"Basel", class:"truck", to: "2022-01-01", properties:{flow:20}},{source:"Zurich", target:"Basel", class:"train", from: "2022-01-01", properties:{flow:10}}],
            settings : {
                cursor : "start",
                legend : [
                    // {class: "truck", type:"edge", $stroke:"black", label: "Truck"},
                    // {class: "producer", type:"node", $fill: "black", $stroke: "black", label: "Producer"},
                ],
                view: [47.3775499,8.4666751],
                zoom: 10
            }
        }, undefined, 4)
        this.cache = {title:"Untitled", extended:"legend", hidden:[]}
        this.errors = []
    }

    setPosition(x,y){
        this.x = x;
        this.y = y;
        return this;
    }

    setDimensions(width,height){
        this.height = Math.max(this.minheight, height)
        this.width = Math.max(this.minwidth, width)
        return this
    }

    setLayer(layer){
        this.layer = Math.max(1,layer)
        return this
    }

    switchTab(tab){
        if (!this.errors.length) this.tab = tab;
    }

    toJson(){
        return {
            tab : this.tab,
            height : this.height,
            width : this.width,
            x : this.x,
            y : this.y,
            data : !this.errors.length? JSON.stringify(JSON.parse(this.data)) : this.data
        }
    }
    
}

export default Panel;