import genUID from "./utils/genUID.js"

class Storage {
    constructor() {
        this.cache = {
            _uids : []
        }
    }

    generateUid(){
        let uid;
        let assigned = false;
        while (!assigned) {
            uid = genUID();
            assigned = (this.cache._uids.indexOf(uid) < 0)
        }
        return uid;
    }

    add(geonet){
        const uid = this.generateUid()
        geonet.uid = uid;
        this.cache[uid] = geonet;
        this.cache._uids.push(uid);
        return geonet;
    }

    remove(uid){
        this.cache._uids = this.cache._uids.filter(el => el!== uid);
        delete this.cache[uid];
        return {};
    }

    update(geonet){
        const {uid} = geonet;
        if (this.cache._uids.indexOf(uid) >= 0){
            this.cache[uid] = geonet
            return geonet;
        }
        throw new Error("The geonet is not contained in the storage. Use the add method first.")
    }

    get(uid){
        if (this.cache._uids.indexOf(uid) >= 0){
            return this.cache[uid]
        }
        return {}
    }

    getAll(){
        return this.cache._uids.map(uid => this.cache[uid])
    }

    clear(){
        this.cache = { _uids : []}
    }
  }

export default Storage;