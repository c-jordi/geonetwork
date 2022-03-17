import Panel from "./Panel.js"

test("Panel: set position", ()=> {
    const panel = new Panel()

    panel.setPosition(500,600)

    expect(panel.x).toBe(500)
    expect(panel.y).toBe(600)
})

test("Panel: set dimensions", ()=>{
    const panel = new Panel()

    panel.setDimensions(panel.minwidth - 10,600)

    expect(panel.width).toBe(panel.minwidth)
    expect(panel.height).toBe(600)
})

test("Panel: set layer", ()=>{
    const panel = new Panel()

    panel.setLayer(3)

    expect(panel.layer).toBe(3)
})

test("Panel: switch tab (1)", ()=> {
    const panel = new Panel()
    panel.tab = "editor"
    panel.errors = [1]

    panel.switchTab("map")

    expect(panel.tab).toBe("editor")
})

test("Panel: switch tab (2)", ()=> {
    const panel = new Panel()
    panel.tab = "editor"
    panel.errors = []

    panel.switchTab("map")

    expect(panel.tab).toBe("map")
})