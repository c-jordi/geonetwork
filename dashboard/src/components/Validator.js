import "../lib/jsen.0.6.6.min.js"

class Validator {
    constructor({notify}){
        this.version = "latest";
        this.schema = "";
        this.data = null;
        this.json = null;
        this.errors = [];
        this.notify = notify || console.log
        this._schema_api = "/" 
    }

    setCallback(callback){
        this.callback = callback;
    }

    setFetch(fetch){
        this.fetch = fetch
    }

    setSchemaApi(api){
        this._schema_api = api;
    }

    async run(data){
        this.data = data;
        this.parseJSON();
    }

    parseJSON(){
        try{
            this.json = JSON.parse(this.data);
        } catch (error){
            this.errors = [new GeonetError("Can't be read as JSON!")]
            return this.report()
        }
        this.getVersion()
    }

    getVersion(){
        switch(this.json.geonet){
            case "alpha0.1":
            case "latest":
                this.fetchSchema(this.json.geonet);
                break;
            case null:
            case undefined:
            case "":
                this.fetchSchema("latest")
                break;
            default:
                this.errors.push(new GeonetError("The geonet version is not supported"))
                this.report()
                break;
        }
    }

    async fetchSchema(version){
        const resp = await fetch(this._schema_api + `schemas/${version}.json`)
        this.schema = await resp.json()
        this.validate()
    }

    validate(){
        const validator = jsen(this.schema)
        const is_valid = validator(this.json)
        if (!is_valid) this.formatErrors(validator.errors)
        this.report()
    }

    formatErrors(errors){
        this.errors = errors.map(({keyword,path})=>{
            return new GeonetError(`${keyword}: ${path}`)
        })
    }

    report(){
        this.notify({errors:this.errors, type:"update"})
    }

}

class GeonetError {
    constructor(msg, preview = ""){
        this.preview = preview;
        this.msg = msg;
        this.datetime = Date.now();
    }
}


export default Validator;