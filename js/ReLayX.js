// Design template generator
function getDesign(designName, width, height, gridX, gridY) {
    // The design item
    var design = {};

    // Variables for helper functions
    var cords = 0;
    var cordSize = 0;
    var minY = -1;
    var minX = -1;
    var maxX = -1;
    var maxY = -1;

    function pushBoundaries(item, styleOffset, coordOffset) {
        cordSize = item[coordOffset].length;
        for (var index = 0; index < cordSize; index++) {
            if (item[styleOffset][index] === "line") {
                if (minX < item[coordOffset][index][0]) {
                    minX = item[coordOffset][index][0];
                }

                if (minY < item[coordOffset][index][1]) {
                    minY = item[coordOffset][index][1];
                }

                cords = item[coordOffset][index].length;
                for (var cord = 0; cord < cords; cord += 2) {
                    if (item[coordOffset][index][cord] > minX) {
                        maxX = item[coordOffset][index][cord];
                    }

                    if (item[coordOffset][index][cord + 1] > minY) {
                        maxY = item[coordOffset][index][cord + 1];
                    }
                }
            } else if (item[styleOffset][index] === "rect") {
                minX = 0;
                minY = 0;
                maxX = item[coordOffset][index][2];
                maxY = item[coordOffset][index][3];
            }
        }

        item.push([minX, minY, maxX, maxY]);
    }

    switch (designName) {
        case "firebird":
        default:
            design.background = [["rect"], ["solid"], [["#6a0000"]], [[0, 0, width, height]]];
            design.defaultMouse = ["#fff", "#000", "round", "line", [0, 0, 1, 0, 12, 10, 12, 15, 5, 15]];

            design.itemSelectionColor = ["#fff", "#aa4a00", "#8a1a00"];
            design.containerElement = ["solid", ["#3a0000"]];
            return design;
            break;
    }
}

// Main ReLayX
var system = {};
var mouse = {};
function relayx(canvasItem, codeItem, designName, width, height, gridX, gridY) {

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;

    // Debug console shortcut
    var hasConsole = window.console ? true : false;
    function lg(msg) {
        if (hasConsole) {
            window.console.log(msg);
        }
    }

    // General variables
    var canvas = document.getElementById(canvasItem);
    var codePanel = document.getElementById(codeItem);
    var dc = canvas.getContext("2d");

    // Set styles
    canvas.width = width;
    canvas.height = height;
    canvas.style.cursor = "none";

    //var mouse = {};
    mouse.x = 0;
    mouse.y = 0;
    mouse.threshold = 50;
    mouse.offsetX = canvas.offsetLeft;
    mouse.offsetY = canvas.offsetTop;
    mouse.actionStartX = 0;
    mouse.actionStartY = 0;
    mouse.actionEndX = 0;
    mouse.actionEndY = 0;
    mouse.selection = null;
    mouse.previousSelection = null;
    mouse.currentAction = null;

    var design = getDesign(designName, width, height, gridX, gridY);

    // Our dataholder
    //var system = {};
    system.width = width;
    system.height = height;
    system.gridX = gridX;
    system.gridY = gridY;
    system.layoutData = [];
    system.layoutSize = 0;
    system.activeGroup = null;
    system.groups = [];
    system.lastId = 0;


    // Helper functions
    // Create and return a copy of an array item
    function getArrayCopy(arrayItem) {
        var arrayCopy = [];
        var items = arrayItem.length;
        var arraySubItems = 0;
        for (var index = 0; index < items; index++) {
            if (typeof (arrayItem[index]) === "object") {
                var subArray = [];
                arraySubItems = arrayItem[index].length;
                for (var subIndex = 0; subIndex < arraySubItems; subIndex++) {
                    subArray.push(arrayItem[index][subIndex]);
                }
                arrayCopy.push(subArray);
            } else {
                arrayCopy.push(arrayItem[index]);
            }
        }

        return arrayCopy;
    }

    // Create a gradient based on a direction string, x, y coords, width, height and color
    function createGradient(direction, x, y, width, height, colors) {
        var stepSize = 0;
        var current = 0.0;
        var colorSize = colors.length;

        stepSize = (1.0 / (colors.length - 1)).toPrecision(2);
        current = 1.0;
        switch (direction) {
            case "lr":
                colors = getArrayCopy(colors).reverse();
            case "rl":
                var background = dc.createLinearGradient(x, y, x + width, y);
                break;
            case "tb":
                colors = getArrayCopy(colors).reverse();
            case "bt":
            default:
                var background = dc.createLinearGradient(x, y, x, y + height);
                break;
        }

        for (var index = 0; index < colorSize; index++) {
            background.addColorStop(current, colors[index]);
            current -= stepSize;
        }

        return background;
    }



    // Draw an design item providing the indexes for
    // drawTypes (rect, line, circle), fillStyles index, colors Index, drawingCoordinate Index
    function drawItem(designItemName, drawTypeIndex, styleIndex, colorIndex, drawingCoordsIndex) {
        if (!design.hasOwnProperty(designItemName)) {
            lg("design name for drawing not defined: " + designItemName);
            return;
        }

        var designItem = design[designItemName];
        var drawtypes = designItem[drawTypeIndex];
        var styles = designItem[styleIndex];
        var colors = designItem[colorIndex];
        var coords = designItem[drawingCoordsIndex];

        var drawtypeSize = drawtypes.length;
        var drawType = ["", ""];
        var drawStyle = ["", ""];
        var useStrokeOnly = false;

        for (var index = 0; index < drawtypeSize; index++) {
            drawType = drawtypes[index].split("_", 2);
            useStrokeOnly = false;

            dc.beginPath();
            switch (drawType[0]) {
                case "rect":
                    dc.rect(coords[index][0], coords[index][1], coords[index][2], coords[index][3]);
                    break;
                case "line":
                case "stroke":
                    var linePoints = coords[index];
                    var drawingSteps = linePoints.length;
                    dc.moveTo(linePoints[0], linePoints[1]);
                    for (var item = 0; item < drawingSteps; item += 2) {
                        dc.lineTo(linePoints[item], linePoints[coords + 1]);
                    }

                    dc.lineTo(linePoints[0], linePoints[1]);
                    break;
                case "circle":
                    dc.moveTo(coords[index][0], coords[index][1]);
                    if (parseFloat(drawType[1]) !== "NaN") {
                        dc.arc(coords[index][0], coords[index][1], drawType[1], 0, 6.3);
                    } else {
                        lg("No circle size set for designItem: " + designItemName + " at index " + index);
                        return;
                    }
                    break;
                default:
                    lg("Invalid drawing command for designItem: " + designItemName + " at index " + index);
                    return;
                    break;
            }

            dc.closePath();

            // Do the filling
            drawStyle = styles[index].split("_", 2);
            if (drawType[0] === "stroke") {
                dc.strokeStyle = colors[index][0];
                useStrokeOnly = true;
            } else if (drawStyle[0] === "solid") {
                dc.fillStyle = colors[index][0];
            } else if (drawStyle[0] === "gradient") {
                if (drawType[0] === "rect") {
                    dc.fillStyle = createGradient(drawStyle[1], coords[index][0], coords[index][1], coords[index][2], coords[index][3]);
                } else {
                    // Assume that we have boundaries provided if the last item of the design is a two length array
                    // else fall back to single color drawing
                    if (designItem[designItem.length - 1].length === 2) {
                        var boundaryCoords = designItem[designItem.length];
                        dc.fillStyle = createGradient(drawStyle[1], coords[index][0], coords[index][1], boundaryCoords[0], boundaryCoords[1]);
                    } else {
                        dc.fillStyle = colors[index][0];
                    }
                }
            }

            if (useStrokeOnly) {
                dc.stroke();
            } else {
                dc.stroke();
                dc.fill();
            }
        }
    }

    // Draw the mouse
    function drawMouse() {
        switch (mouse.current) {
            case "default":
            default:
                var activeMouse = design.defaultMouse;
                break;
        }

        var drawingCords = activeMouse[4];
        var drawingSteps = drawingCords.length;

        dc.fillStyle = activeMouse[0];
        dc.strokeStyle = activeMouse[1];
        dc.lineJoin = activeMouse[2];

        dc.moveTo(mouse.x, mouse.y);
        dc.beginPath();

        if (activeMouse[3] === "line") {
            dc.lineWidth = 2;
            for (var index = 0; index < drawingSteps; index += 2) {
                dc.lineTo(mouse.x + drawingCords[index], mouse.y + drawingCords[index + 1]);
            }

            dc.closePath();
            dc.stroke();
            dc.fill();
        } else if (activeMouse[3] === "stroke") {
            dc.lineWidth = 1;
            for (var index = 0; index < drawingSteps; index += 2) {
                dc.lineTo(mouse.x + drawingCords[index], mouse.y + drawingCords[index + 1]);
            }

            dc.closePath();
            dc.stroke();
        }

        dc.strokeStyle = "#000";
    }

    // Draw the grid
    function drawGrid(width, height) {
        var stepX = 0;
        var stepY = 0;

        dc.lineWidth = 0.5;
        dc.strokeStyle = "rgba(255, 255, 255, 0.25)";

        dc.beginPath();

        while (stepY <= height) {
            dc.moveTo(0, stepY);
            dc.lineTo(width, stepY);
            stepY += gridY;
        }

        while (stepX <= width) {
            dc.moveTo(stepX, 0);
            dc.lineTo(stepX, height);
            stepX += gridX;
        }

        dc.closePath();
        dc.stroke();
    }

    function checkMouseDown(evt) {
        mouse.actionStartX = evt.clientX - mouse.offsetX;
        mouse.actionStartY = evt.clientY - mouse.offsetY;
        var mX = evt.clientX - mouse.offsetX;
        var mY = evt.clientY - mouse.offsetY;
        var hasSelection = false;

        if (mouse.selection !== null) {
            mouse.previousSelection = mouse.selection;
        }

        // TODO: Check for splitters or other items underneath the cursor
        var layoutItem = [];
        for (var item = 0; item < system.layoutSize; item++) {
            layoutItem = system.layoutData[item];

            dc.beginPath();
            dc.rect(layoutItem[2], layoutItem[3], layoutItem[4] - layoutItem[2], layoutItem[5] - layoutItem[3]);
            dc.closePath();
            if (dc.isPointInPath(mX, mY)) {
                mouse.selection = layoutItem;
                hasSelection = true;
            }
        }

        if (hasSelection) {
            if (mouse.currentAction === "grouping") {
                if (system.activeGroup !== null) {
                    system.groups[system.activeGroup].push(mouse.selection[0]);
                } else {
                    // TODO: Check for presens in group and add if not present
                    system.activeGroup = null;
                }
            } else {
                system.activeGroup = null;
                for (var item = 0; item < system.groups.length; item++) {
                    if (system.groups[item].indexOf(mouse.selection[0]) !== -1) {
                        system.activeGroup = item;
                        break;
                    }
                }
            }
            mouse.currentAction = "selected";
            return;
        }

        mouse.currentAction = "selection";
        mouse.selection = null;
    }

    function checkMouseUp(evt) {
        mouse.actionEndX = evt.clientX - mouse.offsetX;
        mouse.actionEndY = evt.clientY - mouse.offsetY;

        if (mouse.currentAction === "selection") {
            createLayoutContainer();
            mouse.currentAction = null;
        }
    }

    function createLayoutContainer() {
        var itemStartX = 0;
        var itemEndX = 0;
        var itemStartY = 0;
        var itemEndY = 0;

        if (mouse.snapEdges) {
            if (mouse.actionStartX > mouse.actionEndX) {
                mouse.actionStartX = Math.ceil(mouse.actionStartX / system.gridX) * system.gridX;
            } else {
                mouse.actionStartX = Math.floor(mouse.actionStartX / system.gridX) * system.gridX;
            }

            if (mouse.actionStartY > mouse.actionEndY) {
                mouse.actionStartY = Math.ceil(mouse.actionStartY / system.gridY) * system.gridY;
            } else {
                mouse.actionStartY = Math.floor(mouse.actionStartY / system.gridY) * system.gridY;
            }
            mouse.actionEndX = Math.ceil(mouse.actionEndX / system.gridX) * system.gridX;
            mouse.actionEndY = Math.ceil(mouse.actionEndY / system.gridY) * system.gridY;
        }

        if (mouse.actionStartX < mouse.actionEndX) {
            itemStartX = mouse.actionStartX;
            itemEndX = mouse.actionEndX;
        } else {
            itemStartX = mouse.actionEndX;
            itemEndX = mouse.actionStartX;
        }

        if (mouse.actionStartY < mouse.actionEndY) {
            itemStartY = mouse.actionStartY;
            itemEndY = mouse.actionEndY;
        } else {
            itemStartY = mouse.actionEndY;
            itemEndY = mouse.actionStartY;
        }

        if (itemEndX - itemStartX < mouse.threshold) {
            return;
        } else if (itemEndY - itemStartY < mouse.threshold) {
            return;
        }

        var id = 0;
        while (true) {
            id = new Date().getTime();
            if (id === system.lastId) {
                continue;
            } else {
                system.lastId = id;
                break;
            }
        }

        // id, designElementName, x, y, xEnd, yEnd, border, padding, margin, groupIndex
        system.layoutData.push([id, "containerElement", itemStartX, itemStartY, itemEndX, itemEndY, 0, 0, 0, -1]);
        system.layoutSize++;
    }

    // Render the layout items
    function renderLayoutItems() {
        var layoutItem = [];
        var itemDesign = [];
        var index = system.layoutSize;
        if (mouse.selection === null) {
            for (var index = 0; index < system.layoutSize; index++) {
                layoutItem = system.layoutData[index];
                itemDesign = design[layoutItem[1]];
                if (itemDesign[0] === "solid") {
                    dc.fillStyle = itemDesign[1];
                }
                dc.fillRect(layoutItem[2], layoutItem[3], layoutItem[4] - layoutItem[2], layoutItem[5] - layoutItem[3]);
            }
        } else {
            for (var index = 0; index < system.layoutSize; index++) {
                layoutItem = system.layoutData[index];
                itemDesign = design[layoutItem[1]];
                if (system.activeGroup !== null && system.groups[system.activeGroup].indexOf(layoutItem[0]) !== -1) {
                    if (mouse.selection[0] === layoutItem[0]) {
                        dc.fillStyle = design.itemSelectionColor[2];
                    } else {
                        dc.fillStyle = design.itemSelectionColor[1];
                    }
                    dc.strokeStyle = design.itemSelectionColor[0];
                    dc.beginPath();
                    dc.rect(layoutItem[2], layoutItem[3], layoutItem[4] - layoutItem[2], layoutItem[5] - layoutItem[3]);
                    dc.closePath();
                    dc.fill();
                    dc.stroke();
                } else if (mouse.selection[0] === layoutItem[0]) {
                    dc.fillStyle = design.itemSelectionColor[1];
                    dc.strokeStyle = design.itemSelectionColor[0];
                    dc.beginPath();
                    dc.rect(layoutItem[2], layoutItem[3], layoutItem[4] - layoutItem[2], layoutItem[5] - layoutItem[3]);
                    dc.closePath();
                    dc.fill();
                    dc.stroke();
                } else {
                    if (itemDesign[0] === "solid") {
                        dc.fillStyle = itemDesign[1];
                    }
                    dc.fillRect(layoutItem[2], layoutItem[3], layoutItem[4] - layoutItem[2], layoutItem[5] - layoutItem[3]);
                }
            }
        }
    }

    function drawSelection() {
        dc.strokeStyle = "#000";
        dc.fillStyle = "rgba(255,255,255, 0.2)";
        if (mouse.snapEdges) {
            if (mouse.actionStartX > mouse.x) {
                var mStartX = Math.ceil(mouse.actionStartX / system.gridX) * system.gridX;
            } else {
                var mStartX = Math.floor(mouse.actionStartX / system.gridX) * system.gridX;
            }

            if (mouse.actionStartY > mouse.y) {
                var mStartY = Math.ceil(mouse.actionStartY / system.gridY) * system.gridY;
            } else {
                var mStartY = Math.floor(mouse.actionStartY / system.gridY) * system.gridY;
            }

            var mEndX = Math.ceil(mouse.x / system.gridX) * system.gridX;
            var mEndY = Math.ceil(mouse.y / system.gridY) * system.gridY;
            dc.rect(mStartX, mStartY, mEndX - mStartX, mEndY - mStartY);
        } else {
            dc.rect(mouse.actionStartX, mouse.actionStartY, mouse.x - mouse.actionStartX, mouse.y - mouse.actionStartY);
        }
        dc.stroke();
        dc.fill();
    }



    // Mainloop
    function mainloop() {
        drawItem("background", 0, 1, 2, 3);
        drawGrid(system.width, system.height);
        if (mouse.currentAction === "selection") {
            drawSelection();
        }
        renderLayoutItems();


        drawMouse();
        window.requestAnimationFrame(mainloop);
    }


    // Bind the mouse to the current window
    canvas.addEventListener("mousemove", function (evt) {
        mouse.x = evt.clientX - mouse.offsetX;
        mouse.y = evt.clientY - mouse.offsetY;
    });

    function placeHolder() {

    }

    function handleKeyboardDown(evt) {
        lg(evt.keyCode);

        if (mouse.selection !== null) {
            if (evt.keyCode === 46) {
                for (var item = 0; item < system.layoutSize; item++) {
                    if (system.layoutData[item][0] === mouse.selection[0]) {
                        var hasNewSelection = false;

                        for (var groupIndex = 0; groupIndex < system.groups.length; groupIndex++) {
                            var itemIndex = system.groups[groupIndex].indexOf(mouse.selection[0]);
                            if (itemIndex !== -1) {
                                if (system.groups[groupIndex].length === 1) {
                                    system.groups.splice(groupIndex, 1);
                                    system.activeGroup = null;
                                    mouse.selection = null;
                                } else {
                                    system.groups[groupIndex].splice(itemIndex, 1);
                                    var lastIndex = system.groups[groupIndex][system.groups[groupIndex].length - 1];
                                    for (var layoutIndex = 0; layoutIndex < system.layoutSize; layoutIndex++) {
                                        if (system.layoutData[layoutIndex][0] === lastIndex) {
                                            mouse.selection = system.layoutData[layoutIndex];
                                            mouse.previousSelection = null;
                                            hasNewSelection = true;
                                        }
                                    }
                                }

                                break;
                            }
                        }

                        system.layoutData.splice(item, 1);
                        system.layoutSize--;

                        if (!hasNewSelection) {
                            mouse.selection = null;
                        }

                        return;
                    }
                }
            }

            if (evt.keyCode === 17) {
                if (system.activeGroup === null || mouse.currentAction === null) {
                    if (mouse.selection === null) {
                        return;
                    }
                    mouse.currentAction = "grouping";
                    for (var item = 0; item < system.groups.length; item++) {
                        if (system.groups[item].indexOf(mouse.selection[0]) !== -1) {
                            system.activeGroup = item;
                            return;
                        }
                    }

                    system.activeGroup = 0;
                    system.groups.push([mouse.selection[0]]);
                }
            }
        }
        if (mouse.currentAction === "selection") {
            if (evt.keyCode === 16) {
                mouse.snapEdges = true;
                return;
            }

            mouse.currentAction = null;
        }
    }

    function handleKeyboardUp(evt) {
        if (evt.keyCode === 17) {
            mouse.currentAction = null;
        } else if (evt.keyCode === 16) {
            mouse.snapEdges = false;
            return;
        }
    }

    canvas.addEventListener("mousedown", checkMouseDown);
    canvas.addEventListener("mouseup", checkMouseUp);
    canvas.addEventListener("mouseout", placeHolder);
    document.addEventListener("keydown", handleKeyboardDown);
    document.addEventListener("keyup", handleKeyboardUp);

    // Get the right offset values after window resizing
    window.addEventListener("resize", function () {
        mouse.offsetX = canvas.offsetLeft;
        mouse.offsetY = canvas.offsetTop;
    });

    mainloop();
}
