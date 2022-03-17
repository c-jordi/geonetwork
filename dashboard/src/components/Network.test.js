import Network, {isPresentAtDatetime}  from "./Network";

test("Network: extract sorted datetime", ()=> {
    const data = {
        nodes : [
            {id:"Basel", from: "2022-12-01", states: [
                {from:"2022-12-03", to:"2022-12-04"},
                {from:"2022-12-02"}
            ]}
        ],
        edges : [
            {from: "2022-12-05",states:[
                {to:"2022-12-06"}
            ]}
        ]
    }
    const network = new Network({data})    
    
    network.extractDatetimes()

    expect(network.datetimes).toEqual(['2022-12-01','2022-12-02','2022-12-03','2022-12-04','2022-12-05','2022-12-06'])
})

test("Network: extract class names",  ()=>{
    const data = {
        nodes : [
            {id:"basel", from: "2022-12-01", class:"producer"},
            {id:"zurich", from: "2022-12-01", class:"consumer"},
            {id:"bern", from: "2022-12-01", class:"consumer"}
        ],
        edges : [
           {source:"basel", target:"zurich", class:"truck"},
           {source:"basel", target:"bern", class:"pipeline"}
        ]
    }
    const network = new Network({data})    
    
    network.extractClasses()

    expect(network.classes.nodes).toEqual(['consumer', 'producer'])
    expect(network.classes.edges).toEqual(['pipeline', 'truck'])
})

test("Network: set cursor (1)", ()=>{
    let network = new Network({data:{settings: {cursor: "start"}}}) 
    network.datetimes = ["2021-01-01", "2021-01-02", "2021-01-03"]

    network.setCursor()

    expect(new Date(network.cursor).getTime()).toBeLessThan(new Date("2021-01-01").getTime())
})

test("Network: set cursor (2)", ()=>{
    let network = new Network({data:{settings: {cursor: "end"}}}) 
    network.datetimes = ["2021-01-01", "2021-01-02", "2021-01-03"]

    network.setCursor()

    expect(new Date(network.cursor).getTime()).toEqual(new Date("2021-01-03").getTime())
})

test("Network: set cursor (3)", ()=>{
    let network = new Network({data:{settings: {cursor: "2021-01-02T09:05"}}}) 
    network.datetimes = ["2021-01-01", "2021-01-02", "2021-01-03"]

    network.setCursor()

    expect(new Date(network.cursor).getTime()).toEqual(new Date("2021-01-02T09:05").getTime())
})

test("Network: extract network state at datetime (1)", ()=> {
    const data = {
        nodes : [
            {id:"basel", from: "2022-01-01", to:"2022-01-03", class:"producer",
            properties: {value:0},
            states:[
                {to:"2022-01-02", value: 1},
                {from:"2022-01-02", value:2}
            ]},
            {id:"zurich", from: "2022-01-02", class:"consumer"},
            {id:"bern", from: "2022-01-03", class:"consumer"}
        ],
        edges : [
           {source:"basel", target:"zurich", from: "2022-01-02", class:"truck"},
           {source:"basel", target:"bern", to: "2022-01-02", class:"pipeline"}
        ]
    } 
    const network = new Network({data}) 

    network.extractStateAtDatetime("2022-01-02")

    expect(network.state.nodes).toEqual([
        {id: 'basel', class:'producer', properties: {value: 2}},
        {id: 'zurich', class:'consumer'}
    ])
    expect(network.state.edges).toEqual([
        {source: 'basel', target:'zurich', class: 'truck'}
    ])
})

test("Network: extract network state at datetime (2)", ()=> {
    const data = {
        nodes : [
            {id:"basel", from: "2022-01-01", to:"2022-01-03", class:"producer",
            properties: {value:0},
            states:[
                {to:"2022-01-02", value: 1},
                {from:"2022-01-02", value:2}
            ]},
            {id:"zurich", from: "2022-01-02", class:"consumer"},
            {id:"bern", from: "2022-01-03", class:"consumer"}
        ],
        edges : [
           {source:"basel", target:"zurich", from: "2022-01-02", class:"truck"},
           {source:"basel", target:"bern", to: "2022-01-02", class:"pipeline"}
        ]
    } 
    const network = new Network({data}) 

    network.extractStateAtDatetime(new Date("2022-01-02") - 1)

    expect(network.state.nodes).toEqual([
        {id: 'basel', class: 'producer', properties: {value: 1}},
    ])
    expect(network.state.edges).toEqual([
        {source: 'basel', target: 'bern', class: 'pipeline'}
    ])
})

test("Function: is present at datetime", ()=>{
    expect(isPresentAtDatetime("2021-01-01","2021-01-03", "2021-01-02")).toBe(true)
    expect(isPresentAtDatetime(undefined,"2021-01-03", "2021-01-02")).toBe(true)
    expect(isPresentAtDatetime("2021-01-01",undefined, "2021-01-02")).toBe(true)
    expect(isPresentAtDatetime("2021-01-01",undefined, "2021-01-01")).toBe(true)
    expect(isPresentAtDatetime(undefined,"2021-01-03", "2021-01-03")).toBe(false)
    expect(isPresentAtDatetime("2021-01-01","2021-01-03", "2021-01-04")).toBe(false)
})
