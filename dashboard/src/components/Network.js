import styling from "./NetworkStyling.js";

class Network {
    constructor({data,notify}){
        this.data = typeof data === "string"? JSON.parse(data) : data;
        this.notify = notify
        this.datetimes = [];
        this.classes = {nodes:[],edges:[]};
        this.state = null;
        this.cursor = null;
        this.coordinates = {};
    }

    run(){
        this.extractCoordinates()
        this.extractClasses()
        this.extractDatetimes()
        this.completeLegend()
        this.completeStyling()
        this.setCursor()
        this.extractStateAtDatetime()
    }

    extractCoordinates(){
        const coordinates = {};
        this.data.nodes.forEach(node=>coordinates[node.id] = node.coordinates)
        this.coordinates = coordinates;
    }

    extractClasses(){
        this.classes.nodes = extractClassesFromArray(this.data.nodes)
        this.classes.edges = extractClassesFromArray(this.data.edges)
    }

    extractDatetimes(){
        let dates = []
        this.data.nodes.forEach((el)=>dates.push(...extractDatetimeFromObject(el)))
        this.data.edges.forEach((el)=>dates.push(...extractDatetimeFromObject(el))) 
        dates = dates.sort((a,b) =>(new Date(a) - new Date(b)))
        this.datetimes = [...new Set(dates)]
    }

    completeLegend(){
        const legend = this.data.settings.legend;
        this.classes.nodes.forEach(class_name=>{
            if (legend.find(el=>el.class === class_name && el.type === "node")) return;
            legend.push({class:class_name,label:class_name,type:"node",$fill:styling.node.fill,$stroke:styling.node.stroke, $size:styling.node.size})
        })
        this.classes.edges.forEach(class_name=>{
            if (legend.find(el=>el.class === class_name && el.type === "edge")) return;
            legend.push({class:class_name,label:class_name,type:"edge",$stroke:styling.edge.stroke, $size:styling.edge.size})
        })
        this.notify({type:'legend', legend})
    }

    completeStyling(){
        const legend = this.data.settings.legend;
        this.data.nodes = this.data.nodes.map(node=>{
            if (!node.properties) node.properties = {};
            const props = node.properties;
            const legend_style = legend.find(el=>el.class === (node.class || "") && el.type === "node") || {}
            if (!props.$fill) node.properties.$fill = legend_style.$fill || styling.node.fill;
            if (!props.$size) node.properties.$size = legend_style.$size || styling.node.size;
            if (!props.$stroke) node.properties.$stroke = legend_style.$stroke || styling.node.stroke;
            return node
        })
        this.data.edges = this.data.edges.map(edge=>{
            if (!edge.properties) edge.properties = {};
            const props = edge.properties;
            const legend_style = legend.find(el=>el.class === (edge.class || "") && el.type === "edge") || {}
            if (!props.$size) edge.properties.$size = legend_style.$size || styling.edge.size;
            if (!props.$stroke) edge.properties.$stroke = legend_style.$stroke || styling.edge.stroke;
            return edge
        })
    }

    setCursor(){
        switch(this.data.settings.cursor){
            case "start":
                this.cursor = new Date(this.datetimes[0]) - 1
                return;
            case "end":
                this.cursor = this.datetimes[this.datetimes.length-1]
                return;
            default:
                this.cursor = this.data.settings.cursor;
                return;
        }
    }

    extractStateAtDatetime(datetime){
        if (!datetime) datetime = this.cursor;
        const state = {nodes:[],edges:[]};
        this.data.nodes.forEach((el)=>{
            const node_state = extractStateFromObjectAtDatetime(el,datetime)
            if (node_state) state.nodes.push(node_state)
        })
        this.data.edges.forEach((el)=>{
            const edge_state = extractStateFromObjectAtDatetime(el,datetime)
            if (edge_state) state.edges.push(edge_state)
        })

        this.state = state;
    }
}

function extractDatetimeFromObject(obj){
    let dates = [];
    if (obj.from) dates.push(obj.from)
    if (obj.to) dates.push(obj.to)
    if (obj.states){
        obj.states.forEach(el=>dates.push(...extractDatetimeFromObject(el)))
    }
    dates = dates.sort((a,b) =>(new Date(a) - new Date(b)))
    return [...new Set(dates)]
}

function extractClassesFromArray(arr){
    let classes = [];
    arr.forEach(el=>el.class ? el.class.split(" ").forEach((e)=>classes.push(e)): null)
    classes = classes.sort()
    return [...new Set(classes)]
}

function extractStateFromObjectAtDatetime(obj, datetime){
    const is_present = isPresentAtDatetime(obj.from, obj.to, datetime)
    if (!is_present) return null;
    let new_state = {...obj};
    if (obj.states){
        obj.states.forEach(el=>{
            const is_active = isPresentAtDatetime(el.from, el.to, datetime);
            if (is_active){
                const props = getPropertiesFromState(el)
                new_state.properties = {...new_state.properties, ...props}
            }
        })
    }
    delete new_state.from;
    delete new_state.to;
    delete new_state.states;
    return new_state;
}

export function isPresentAtDatetime(from, to, datetime){
    if (!datetime) return true;
    if (from && to) return (new Date(from) <= new Date(datetime)) && (new Date(datetime) < new Date(to))
    if (from) return new Date(from) <= new Date(datetime)
    if (to) return new Date(datetime) < new Date(to)
    return true
}

export function getPropertiesFromState(state){
    const props = {...state};
    delete props.to
    delete props.from
    return props
}

export default Network;