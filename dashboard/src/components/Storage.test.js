import Storage from "./Storage"


test('Storage: add geonet', ()=>{
    const storage = new Storage;

    storage.add({
        "name": "Test geonet",
        "geonet": "alpha0.1",
        "nodes": [{"id":"Zuerich"}]
    })

    expect(storage.cache._uids.length).toBe(1)
})

function createTestSetup(geonet_count=1){
    const storage = new Storage;
    const geonets = [];

    for (let i=0;i<geonet_count;i++){
        const geonet = storage.add({
            "name": "Test geonet 1",
            "geonet": "alpha0.1",
            "nodes": [{"id":"Zuerich"}]
        })
        geonets.push(geonet)
    }

    return [storage, geonets]
}

test("Storage: get all", ()=> {
    const [storage,geonets] = createTestSetup(2)

    const output = storage.getAll()

    expect(output.length).toBe(2)
})

test('Storage: remove geonet', ()=>{
    const [storage, [geonet]] = createTestSetup(1)

    storage.remove(geonet.uid)

    expect(storage.cache._uids.length).toBe(0)
})

test("Storage: update geonet", ()=>{
    const [storage, [geonet]] = createTestSetup(1)
    geonet.name = 'updated name';

    storage.update(geonet)

    const updated = storage.get(geonet.uid);
    expect(updated.name).toBe("updated name")
})