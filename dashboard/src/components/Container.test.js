import Container from "./Container"
import Panel from  "./Panel"

test("Container: add panel", () => {
    const container = new Container;
    const panel = new Panel;

    container.add(panel)

    expect(container.panels.length).toBe(1)
})


function createTestSetup(panel_count=1){
    const container = new Container;
    const panels = [];

    for (let i=0;i<panel_count;i++){
        const panel = new Panel;
        panels.push(panel)
        container.add(panel)
    }

    return [container, panels]
}

test("Container: remove panel", () => {
    const [container, [panel]] = createTestSetup(1);

    container.remove(panel.uid)

    expect(container.panels.length).toBe(0);
})  


test("Container: focus panel", () => {
    const [container, panels] = createTestSetup(3);

    container.focus(panels[0].uid)
    container.focus(panels[1].uid)
    
    expect(panels[0].layer).toBe(2)
    expect(panels[1].layer).toBe(3)
    expect(panels[2].layer).toBe(1)
})

test("Container: get panel", ()=>{
    const [container, [panel]] = createTestSetup(1);

    const response = container.getPanel(panel.uid);

    expect(response.uid).toBe(panel.uid)
})

test("Container: get panel position", ()=>{
    const [container, [panel]] = createTestSetup(1);

    const response = container.getPanelPosition(panel.uid);

    expect(response).toStrictEqual([panel.x,panel.y])
})

test("Container: snap panel position", ()=>{
    const [container, [panel]] = createTestSetup(1);
    container.inner_margin = 10;
    container.setDimensions(500,500);
    
    container.snapPanelPosition(panel.uid, [5,-10])

    expect(panel.x).toBe(10)
    expect(panel.y).toBe(10)
})

test("Container: snap panel resize top (1)", ()=>{
    const [container, [panel]] = createTestSetup(1);
    panel.setPosition(10,10)
    panel.setDimensions(panel.minwidth,panel.minheight + 10);

    container.snapPanelResize(panel.uid, "top", panel.y + 10);

    expect(panel.x).toBe(10)
    expect(panel.y).toBe(20)
    expect(panel.width).toBe(panel.minwidth)
    expect(panel.height).toBe(panel.minheight)
})

test("Container: snap panel resize top (2)", ()=>{
    const [container, [panel]] = createTestSetup(1);
    panel.setPosition(10,10)
    panel.setDimensions(panel.minwidth,panel.minheight);

    container.snapPanelResize(panel.uid, "top", panel.y + 10);

    expect(panel.x).toBe(10)
    expect(panel.y).toBe(10)
    expect(panel.width).toBe(panel.minwidth)
    expect(panel.height).toBe(panel.minheight)
})

test("Container: snap panel resize top (3)", ()=>{
    const [container, [panel]] = createTestSetup(1);
    panel.setPosition(10,10)
    panel.setDimensions(panel.minwidth,panel.minheight);

    container.snapPanelResize(panel.uid, "top", panel.y - 20);

    expect(panel.x).toBe(10)
    expect(panel.y).toBe(container.inner_margin)
    expect(panel.width).toBe(panel.minwidth)
    expect(panel.height).toBe(panel.minheight + 10 - container.inner_margin)
})

test("Container: snap panel resize bottom (1)", ()=>{
    const [container, [panel]] = createTestSetup(1);
    panel.setPosition(10,10)
    panel.setDimensions(panel.minwidth,panel.minheight + 20);

    container.snapPanelResize(panel.uid, "bottom", panel.y + panel.minheight + 10);

    expect(panel.x).toBe(10)
    expect(panel.y).toBe(10)
    expect(panel.width).toBe(panel.minwidth)
    expect(panel.height).toBe(panel.minheight + 10)
})

test("Container: snap panel resize bottom (2)", ()=>{
    const [container, [panel]] = createTestSetup(1);
    panel.setPosition(10,10)
    panel.setDimensions(panel.minwidth,panel.minheight + 10);

    container.snapPanelResize(panel.uid, "bottom", panel.y + panel.minheight - 20);

    expect(panel.x).toBe(10)
    expect(panel.y).toBe(10)
    expect(panel.width).toBe(panel.minwidth)
    expect(panel.height).toBe(panel.minheight)
})

test("Container: snap panel resize bottom (3)", ()=>{
    const [container, [panel]] = createTestSetup(1);
    panel.setPosition(10,10)
    panel.setDimensions(panel.minwidth,panel.minheight);

    container.snapPanelResize(panel.uid, "bottom",  container.height + 10);

    expect(panel.x).toBe(10)
    expect(panel.y).toBe(10)
    expect(panel.width).toBe(panel.minwidth)
    expect(panel.height).toBe(container.height - container.inner_margin - 10)
})

test("Container: snap panel resize left (1)", ()=>{
    const [container, [panel]] = createTestSetup(1);
    panel.setPosition(10,10)
    panel.setDimensions(panel.minwidth + 20,panel.minheight);

    container.snapPanelResize(panel.uid, "left", panel.x + 10);

    expect(panel.x).toBe(20)
    expect(panel.y).toBe(10)
    expect(panel.width).toBe(panel.minwidth + 10)
    expect(panel.height).toBe(panel.minheight)
})

test("Container: snap panel resize left (2)", ()=>{
    const [container, [panel]] = createTestSetup(1);
    panel.setPosition(10,10)
    panel.setDimensions(panel.minwidth,panel.minheight);

    container.snapPanelResize(panel.uid, "left", panel.x + 10);

    expect(panel.x).toBe(10)
    expect(panel.y).toBe(10)
    expect(panel.width).toBe(panel.minwidth)
    expect(panel.height).toBe(panel.minheight)
})

test("Container: snap panel resize left (3)", ()=>{
    const [container, [panel]] = createTestSetup(1);
    panel.setPosition(10,10)
    panel.setDimensions(panel.minwidth,panel.minheight);

    container.snapPanelResize(panel.uid, "left", panel.x - 20);

    expect(panel.x).toBe(container.inner_margin)
    expect(panel.y).toBe(10)
    expect(panel.width).toBe(panel.minwidth + 10 - container.inner_margin)
    expect(panel.height).toBe(panel.minheight)
})

test("Container: snap panel resize right (1)", ()=>{
    const [container, [panel]] = createTestSetup(1);
    panel.setPosition(10,10)
    panel.setDimensions(panel.minwidth + 20,panel.minheight);

    container.snapPanelResize(panel.uid, "right", panel.x + panel.width - 10);

    expect(panel.x).toBe(10)
    expect(panel.y).toBe(10)
    expect(panel.width).toBe(panel.minwidth + 10)
    expect(panel.height).toBe(panel.minheight)
})

test("Container: snap panel resize right (2)", ()=>{
    const [container, [panel]] = createTestSetup(1);
    panel.setPosition(10,10)
    panel.setDimensions(panel.minwidth,panel.minheight);

    container.snapPanelResize(panel.uid, "right", panel.x + panel.minwidth - 10);

    expect(panel.x).toBe(10)
    expect(panel.y).toBe(10)
    expect(panel.width).toBe(panel.minwidth)
    expect(panel.height).toBe(panel.minheight)
})

test("Container: snap panel resize right (3)", ()=>{
    const [container, [panel]] = createTestSetup(1);
    panel.setPosition(10,10)
    panel.setDimensions(panel.minwidth,panel.minheight);

    container.snapPanelResize(panel.uid, "right", container.width + 10);

    expect(panel.x).toBe(10)
    expect(panel.y).toBe(10)
    expect(panel.width).toBe(container.width - 10 - container.inner_margin)
    expect(panel.height).toBe(panel.minheight)
})