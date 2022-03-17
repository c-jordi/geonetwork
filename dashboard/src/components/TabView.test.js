import TabView from "./TabView";

test("TabView: init", ()=>{
    const tab = new TabView({panel:{uid:"test-uid"}, body:"body", footer:"footer"})
    expect(tab.name).toBe("tab")
    expect(tab.body).toBe("body")
    expect(tab.footer).toBe("footer")
    expect(tab.panel).toEqual({uid:"test-uid"})
    expect(tab.callbacks).toEqual({})
})

