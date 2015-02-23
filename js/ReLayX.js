// Design template generator
function getDesign(designName, width, height) {
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
        case "snowwhite":
            design.background = [["rect"], ["solid"], [["#eee"]], [[0, 0, width, height]]];

            design.defaultMouse = ["#fff", "#000", "round", "line", [0, 0, 1, 0, 12, 10, 12, 15, 5, 15]];
            design.dragMoveMouse = ["#fff", "#000", "round", "line", [0, 0, 1, 0, 12, 10, 12, 15, 5, 15]];
            design.gridStrokeColor = 'rgba(0,0,0, 0.5)';
            design.hightlighterColor = "rgba(0,0,0, 0.1)";

            design.itemSelectionColor = ["#cecece", "#fff"];
            design.containerElement = ["solid", ['#9a9a9a']];
            design.containerBorderColor = 'rgba(0,0,0, 0.5)';
            break;
        case "firebird":
        default:
            design.background = [["rect"], ["solid"], [["#6a0000"]], [[0, 0, width, height]]];
            design.defaultMouse = ["#fff", "#000", "round", "line", [0, 0, 1, 0, 12, 10, 12, 15, 5, 15]];
            design.dragMoveMouse = ["#fff", "#000", "round", "line", [0, 0, 1, 0, 12, 10, 12, 15, 5, 15]];
            design.gridStrokeColor = 'rgba(255,255,255, 0.2)';
            design.hightlighterColor = "rgba(255,200,0, 0.1)";

            design.itemSelectionColor = ["#aa4a00", "#8a1a00"];
            design.containerElement = ["solid", ['rgba(56, 0, 0, 0.55)']];
            design.containerBorderColor = 'rgba(0,0,0, 0.5)';

            design.resizeRightBottom = [["line", "line"], ["solid", "solid"], [["#222"], ["#fff"]], [[10, 0, 10, 10, 0, 10, 10, 0], [7, 3, 7, 7, 3, 7, 7, 3]], [-12, -12]];

            break;
    }

    return design;
}

// Main ReLayX
var system = {};
var mouse = {};
function relayx(canvasItem, codeItem, designName, width, height, gridX, gridY, gridStart, gridEnd) {

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;



    // General variables
    var canvas = document.getElementById(canvasItem);
    var codePanel = document.getElementById(codeItem);
    var dc = canvas.getContext("2d");

    // Debug console shortcut
    function lg(msg) {
        if (codePanel === null) {
            window.console.log(msg);
        } else {
            if (codePanel.innerHTML.split("\n").length > 5) {
                codePanel.innerHTML = "";
            }
            codePanel.scrollTop = codePanel.scrollHeight;
            codePanel.innerHTML += msg + "\n";


        }
    }

    // Set styles
    canvas.width = width;
    canvas.height = height;
    canvas.style.cursor = "none";



    var design = getDesign(designName, width, height, gridX, gridY);

    // Our dataholder
    //var system = {};
    system.width = width;
    system.height = height;

    // Set the grid for the current canvas based on inputs or defaults
    if (typeof (gridStart) === "object" && gridStart.length === 2) {
        system.gridStartX = gridStart[0];
        system.gridStartY = gridStart[1];
    } else {
        system.gridStartX = 0;
        system.gridStartY = 0;
    }
    if (typeof (gridStart) === "object" && gridStart.length === 2) {
        system.gridEndX = gridEnd[0];
        system.gridEndY = gridEnd[1];
    } else {
        system.gridEndX = canvas.width;
        system.gridEndY = canvas.height;
    }

    system.gridX = gridX;
    system.gridY = gridY;
    system.layoutData = [];
    system.layoutSize = 0;
    system.activeGroup = null;
    system.groups = [];
    system.lastId = 0;
    system.drawGrid = true;
    system.drawHighlight = true;
    system.copyItem = null;
    system.mirrorHorizontal = true;
    system.expandMode = "border";
    system.spaceGridX = 0;
    system.spaceGridY = 0;
    system.showHelp = true;

    // Might only work on IE11 and only if the user agent is not altered by the user
    system.isIE = window.navigator.userAgent.indexOf("Trident") !== -1 ? true : false;

    if (system.isIE) {
        system.scrollX = window.pageXOffset;
        system.scrollY = window.pageYOffset;
    } else {
        system.scrollX = window.scrollX;
        system.scrollY = window.scrollY;
    }

    //var mouse = {};
    mouse.x = 0;
    mouse.y = 0;
    mouse.threshold = 25;

    mouse.offsetX = canvas.offsetLeft + system.scrollX;
    mouse.offsetY = canvas.offsetTop + system.scrollY;
    mouse.startX = 0;
    mouse.startY = 0;
    mouse.endX = 0;
    mouse.endY = 0;
    mouse.selection = null;
    mouse.previousSelection = null;
    mouse.currentAction = null;
    mouse.snapToGrid = false;
    mouse.current = "default";


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
    function drawItem(designItemName, drawTypeIndex, styleIndex, colorIndex, drawingCoordsIndex, offsetXY) {
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
                        lg("No circle size set for designItem, use  \"circle_sizeInPx\" : " + designItemName + " at index " + index);
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
            case "dragMove":
                var activeMouse = design.dragMoveMouse;
                break;
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
    function drawGrid(startX, startY, endX, endY) {
        var stepX = 0;
        var stepY = 0;

        dc.lineWidth = 0.5;
        dc.strokeStyle = design.gridStrokeColor;

        dc.beginPath();

        while (stepY + startY <= endY) {
            dc.moveTo(startX, stepY + startY);
            dc.lineTo(endX, stepY + startY);
            stepY += gridY;
        }

        while (stepX + startX <= endX) {
            dc.moveTo(stepX + startX, startY);
            dc.lineTo(stepX + startX, endY);
            stepX += gridX;
        }

        dc.closePath();
        dc.stroke();
    }

    function checkMouseDown(evt) {
        if (system.isIE) {
            system.scrollX = window.pageXOffset;
            system.scrollY = window.pageYOffset;
        } else {
            system.scrollX = window.scrollX;
            system.scrollY = window.scrollY;
        }

        mouse.startX = evt.clientX - mouse.offsetX + system.scrollX;
        mouse.startY = evt.clientY - mouse.offsetY + system.scrollY;
        var mX = evt.clientX - mouse.offsetX + system.scrollX;
        var mY = evt.clientY - mouse.offsetY + system.scrollY;
        var hasSelection = false;

        if (mouse.currentAction === "mirrorSelection") {
            if (dc.isPointInPath(mX, mY)) {
                var mStartX = mouse.selection[2];
                var mStartY = mouse.selection[3];
                var mEndX = mouse.selection[4];
                var mEndY = mouse.selection[5];
                var containerX = mEndX - mStartX;
                var containerY = mEndY - mStartY;

                if (system.mirrorHorizontal) {

                    if (system.spaceGridX > 0) {
                        var offsetGridX = system.spaceGridX;
                        var offsetX = containerX + system.spaceGridX;
                    } else {
                        var offsetGridX = mStartX - system.gridStartX;
                        var offsetX = 0;
                    }

                    var startX = system.gridStartX + system.spaceGridX;
                    if (mX > mStartX) {

                        while (startX + offsetX <= system.gridEndX - containerX) {

                            // Dont use isPointInPath here as it would mess up with the mirror drawings
                            if (mX >= startX + offsetX && mX <= mEndX + offsetX && mY >= mStartY && mY <= mEndY) {

                                // Check that we dont have any containers at this location
                                for (var index = 0; index < system.layoutSize; index++) {
                                    var container = system.layoutData[index];
                                    if (mX >= container[2] && mX <= container[4] && mY >= container[3] && mY <= container[5]) {
                                        return;
                                    }
                                }
                                // otherwise create the container at this position
                                createLayoutContainer(mStartX + offsetX, mStartY, mEndX + offsetX, mEndY);
                                break;
                            }

                            offsetX += offsetGridX + containerX;
                        }
                    } else if (system.spaceGridX !== 0) {
                        startX = mStartX;
                        offsetX = containerX + system.spaceGridX;

                        while (startX - containerX >= system.gridStartX) {

                            // Dont use isPointInPath here as it would mess up with the mirror drawings
                            if (mX >= startX - offsetX && mX <= mEndX - offsetX && mY >= mStartY && mY <= mEndY) {

                                // Check that we dont have any containers at this location
                                for (var index = 0; index < system.layoutSize; index++) {
                                    var container = system.layoutData[index];
                                    if (mX >= container[2] && mX <= container[4] && mY >= container[3] && mY <= container[5]) {
                                        return;
                                    }
                                }
                                // otherwise create the container at this position
                                createLayoutContainer(mStartX - offsetX, mStartY, mEndX - offsetX, mEndY);
                                break;
                            }

                            offsetX += containerX + system.spaceGridX;
                        }
                    } else {
                        var offsetGridX = mStartX - system.gridStartX;

                        while (offsetX + containerX + offsetGridX <= system.gridEndX - mEndX) {
                            offsetX += offsetGridX + containerX;

                            // Dont use isPointInPath here as it would mess up with the mirror drawings
                            if (mX >= mStartX + offsetX && mX <= mEndX + offsetX && mY >= mStartY && mY <= mEndY) {

                                // Check that we dont have any containers at this location
                                for (var index = 0; index < system.layoutSize; index++) {
                                    var container = system.layoutData[index];
                                    if (mX >= container[2] && mX <= container[4] && mY >= container[3] && mY <= container[5]) {
                                        return;
                                    }
                                }
                                // otherwise create the container at this position
                                createLayoutContainer(mStartX + offsetX, mStartY, mEndX + offsetX, mEndY);
                                break;
                            }
                        }
                    }
                } else {
                    if (system.spaceGridY > 0) {
                        var offsetGridY = system.spaceGridY;
                        var offsetY = containerY + system.spaceGridY;
                    } else {
                        var offsetGridY = mStartY - system.gridStartY;
                        var offsetY = 0;
                    }
                    if (mY > mStartY) {
                        var startY = system.gridStartY + system.spaceGridY;
                        while (startY + offsetY <= system.gridEndY - containerY) {
                            // Dont use isPointInPath here as it would mess up with the mirror drawings
                            if (mX >= mStartX && mX <= mEndX && mY >= startY + offsetY && mY <= mEndY + offsetY) {

                                // Check that we dont have any containers at this location
                                for (var index = 0; index < system.layoutSize; index++) {
                                    var container = system.layoutData[index];
                                    if (mX >= container[2] && mX <= container[4] && mY >= container[3] && mY <= container[5]) {
                                        return;
                                    }
                                }

                                // otherwise create the container at this position
                                createLayoutContainer(mStartX, mStartY + offsetY, mEndX, mEndY + offsetY);
                                break;
                            }
                            offsetY += offsetGridY + containerY;
                        }
                    } else if (system.spaceGridY !== 0) {
                        startY = mStartY;
                        offsetY = containerY + system.spaceGridY;

                        while (startY - containerY >= system.gridStartY) {

                            // Dont use isPointInPath here as it would mess up with the mirror drawings
                            if (mX >= mStartX && mX <= mEndX && mY >= startY - offsetY && mY <= mEndY - offsetY) {

                                // Check that we dont have any containers at this location
                                for (var index = 0; index < system.layoutSize; index++) {
                                    var container = system.layoutData[index];
                                    if (mX >= container[2] && mX <= container[4] && mY >= container[3] && mY <= container[5]) {
                                        return;
                                    }
                                }
                                // otherwise create the container at this position
                                createLayoutContainer(mStartX, mStartY - offsetY, mEndX, mEndY - offsetY);
                                break;
                            }

                            offsetY += containerY + system.spaceGridY;
                        }
                    } else {
                        var offsetGridY = mStartY - system.gridStartY;

                        while (offsetY + containerY + offsetGridY <= system.gridEndY - mEndY) {
                            offsetY += offsetGridY + containerY;

                            // Dont use isPointInPath here as it would mess up with the mirror drawings
                            if (mX >= mStartX && mX <= mEndX && mY >= mStartY + offsetY && mY <= mEndY + offsetY) {

                                // Check that we dont have any containers at this location
                                for (var index = 0; index < system.layoutSize; index++) {
                                    var container = system.layoutData[index];
                                    if (mX >= container[2] && mX <= container[4] && mY >= container[3] && mY <= container[5]) {
                                        return;
                                    }
                                }
                                // otherwise create the container at this position
                                createLayoutContainer(mStartX, mStartY + offsetY, mEndX, mEndY + offsetY);
                                break;
                            }
                        }
                    }
                }
            }

            return;
        }

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
                if (mouse.selection[9] === -1) {
                    if (mouse.previousSelection !== null && mouse.previousSelection[9] === -1) {
                        if (mouse.previousSelection[0] !== mouse.selection[0]) {
                            system.groups.push([mouse.previousSelection[0], mouse.selection[0]]);
                        } else {
                            system.groups.push([mouse.selection[0]]);
                        }
                        system.activeGroup = system.groups.length - 1;
                        mouse.selection[9] = system.activeGroup;
                        mouse.previousSelection[9] = system.activeGroup;
                    } else {
                        system.groups[system.activeGroup].push(mouse.selection[0]);
                        mouse.selection[9] = system.activeGroup;
                    }
                } else {
                    system.activeGroup = mouse.selection[9];
                    if (mouse.previousSelection[0] === mouse.selection[0]) {
                        for (var groupItem = 0; groupItem < system.groups[system.activeGroup].length; groupItem++) {
                            if (system.groups[system.activeGroup][groupItem] === mouse.selection[0]) {
                                system.groups[system.activeGroup].splice(groupItem, 1);

                                if (system.groups[system.activeGroup].length === 1) {
                                    for (var layoutItem = 0; layoutItem < system.layoutSize; layoutItem++) {
                                        if (system.layoutData[layoutItem][0] === system.groups[system.activeGroup][0]) {
                                            system.groups.splice(system.activeGroup, 1);
                                            system.layoutData[layoutItem][9] = -1;
                                            break;
                                        }
                                    }
                                }
                                system.activeGroup = null;
                                break;
                            }
                        }
                        mouse.selection[9] = -1;
                    }
                }
            } else {
                if (mouse.selection[9] !== -1) {
                    system.activeGroup = mouse.selection[9];
                } else {
                    system.activeGroup = null;
                }
            }

            if (mouse.previousSelection !== null && mouse.currentAction === "selected" && mouse.previousSelection[0] === mouse.selection[0]) {
                mouse.currentAction = "dragContainer";
            } else {
                mouse.currentAction = "selected";
            }
            return;
        }

        mouse.currentAction = "selection";
        mouse.selection = null;
    }

    function checkMouseUp(evt) {
        if (system.isIE) {
            system.scrollX = window.pageXOffset;
            system.scrollY = window.pageYOffset;
        } else {
            system.scrollX = window.scrollX;
            system.scrollY = window.scrollY;
        }

        mouse.endX = evt.clientX - mouse.offsetX + system.scrollX;
        mouse.endY = evt.clientY - mouse.offsetY + system.scrollY;

        if (mouse.currentAction === "selection") {
            createLayoutContainer(mouse.startX, mouse.startY, mouse.endX, mouse.endY);
            mouse.currentAction = null;
        } else if (mouse.currentAction === "mirrorSelection") {
            if (mouse.snapToGrid) {
                var mStartX = Math.floor(mouse.startX / system.gridX) * system.gridX;
                var mStartY = Math.floor(mouse.startY / system.gridY) * system.gridY;
                var mEndX = Math.ceil(mouse.x / system.gridX) * system.gridX;
                var mEndY = Math.ceil(mouse.y / system.gridY) * system.gridY;
            } else {
                var mStartX = mouse.startX;
                var mStartY = mouse.startY;
                var mEndX = mouse.endX;
                var mEndY = mouse.endY;

            }

            var containerX = mEndX - mStartX;
            var containerY = mEndY - mStartY;

            if (system.mirrorHorizontal) {

                if (containerX > mouse.threshold) {
                    var containerId = createLayoutContainer(mStartX, mStartY, mEndX, mEndY);
                    system.groups.push([containerId]);
                    system.activeGroup = system.groups.length - 1;
                    system.layoutData[system.layoutSize - 1][9] = system.activeGroup;

                    if (system.spaceGridX > 0) {
                        var offsetGridX = offsetGridX = system.spaceGridX;
                        var offsetX = 0;
                    } else {
                        var offsetGridX = mStartX - system.gridStartX;
                        var offsetX = 0;
                    }

                    while (offsetX + containerX + offsetGridX <= system.gridEndX - mEndX) {
                        offsetX += offsetGridX + containerX;
                        containerId = createLayoutContainer(mStartX + offsetX, mStartY, mEndX + offsetX, mEndY);
                        system.groups[system.activeGroup].push(containerId);
                        system.layoutData[system.layoutSize - 1][9] = system.activeGroup;
                    }

                    if (system.spaceGridX > 0) {
                        var startX = mStartX;
                        var offsetX = offsetGridX + containerX;

                        while (startX - offsetX >= system.gridStartX) {
                            containerId = createLayoutContainer(mStartX - offsetX, mStartY, mEndX - offsetX, mEndY);
                            system.groups[system.activeGroup].push(containerId);
                            system.layoutData[system.layoutSize - 1][9] = system.activeGroup;
                            offsetX += offsetGridX + containerX;
                        }
                    }
                }
            } else {

                if (containerY > mouse.threshold) {

                    if (system.spaceGridY > 0) {
                        var offsetGridY = system.spaceGridY;
                        var offsetY = 0;
                    } else {
                        var offsetGridY = mStartY - system.gridStartY;
                        var offsetY = 0;
                    }

                    var containerId = createLayoutContainer(mStartX, mStartY, mEndX, mEndY);
                    system.groups.push([containerId]);
                    system.activeGroup = system.groups.length - 1;
                    system.layoutData[system.layoutSize - 1][9] = system.activeGroup;

                    while (offsetY + containerY + offsetGridY <= system.gridEndY - mEndY) {
                        offsetY += offsetGridY + containerY;
                        containerId = createLayoutContainer(mStartX, mStartY + offsetY, mEndX, mEndY + offsetY);
                        system.groups[system.activeGroup].push(containerId);
                        system.layoutData[system.layoutSize - 1][9] = system.activeGroup;
                    }

                    if (system.spaceGridY > 0) {
                        var startY = mStartY;
                        var offsetY = offsetGridY + containerY;

                        while (startY - offsetY >= system.gridStartY) {
                            containerId = createLayoutContainer(mStartX, mStartY - offsetY, mEndX, mEndY - offsetY);
                            system.groups[system.activeGroup].push(containerId);
                            system.layoutData[system.layoutSize - 1][9] = system.activeGroup;
                            offsetY += offsetGridY + containerY;
                        }
                    }
                }
            }

            mouse.currentAction = null;
        }

        if (mouse.currentAction === "dragContainer" || mouse.currentAction === "dragGroup") {
            mouse.currentAction = "selected";
        }
    }

    function createLayoutContainer(mStartX, mStartY, mEndX, mEndY) {
        var itemStartX = 0;
        var itemEndX = 0;
        var itemStartY = 0;
        var itemEndY = 0;

        if (mouse.snapToGrid) {
            mStartX = Math.floor(mStartX / system.gridX) * system.gridX;
            mStartY = Math.floor(mStartY / system.gridY) * system.gridY;
            mEndX = Math.ceil(mEndX / system.gridX) * system.gridX;
            mEndY = Math.ceil(mEndY / system.gridY) * system.gridY;
        }

        if (mStartX < mEndX) {
            itemStartX = mStartX;
            itemEndX = mEndX;
        } else {
            itemStartX = mEndX;
            itemEndX = mStartX;
        }

        if (mStartY < mEndY) {
            itemStartY = mStartY;
            itemEndY = mEndY;
        } else {
            itemStartY = mEndY;
            itemEndY = mStartY;
        }

        // Set the boundaries for the container inside the grid
        if (itemStartX < system.gridStartX) {
            itemStartX = system.gridStartX;
        }

        if (itemStartY < system.gridStartY) {
            itemStartY = system.gridStartY;
        }

        if (itemEndX < system.gridStartX) {
            itemEndX = system.gridStartX;
        } else if (itemEndX > system.gridEndX) {
            itemEndX = system.gridEndX;
        }

        if (itemEndY < system.gridStartY) {
            itemEndY = system.gridStartY;
        } else if (itemEndY > system.gridEndY) {
            itemEndY = system.gridEndY;
        }

        // If the selection height or width is smaller then the threshold, cancel the action
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
        return id;
    }

// Render the layout items
    function renderLayoutItems() {
        var layoutItem = [];
        var itemDesign = [];
        var index = system.layoutSize;
        dc.lineWidth = 0;
        if (mouse.selection === null) {
            for (var index = 0; index < system.layoutSize; index++) {
                layoutItem = system.layoutData[index];
                itemDesign = design[layoutItem[1]];
                if (itemDesign[0] === "solid") {
                    dc.fillStyle = itemDesign[1];
                }

                // Drawing the border
                if (layoutItem[6] !== 0) {
                    dc.lineWidth = layoutItem[6];
                    dc.beginPath();
                    dc.rect(layoutItem[2], layoutItem[3], layoutItem[4] - layoutItem[2], layoutItem[5] - layoutItem[3]);
                    dc.closePath();
                    dc.strokeStyle = design.containerBorderColor;
                    dc.stroke();
                } else {
                    dc.strokeStyle = "transparent";
                    dc.lineWidth = 0;
                }

                dc.beginPath();
                dc.rect(layoutItem[2], layoutItem[3], layoutItem[4] - layoutItem[2], layoutItem[5] - layoutItem[3]);
                dc.closePath();
                dc.fill();
            }
        } else {

            for (var index = 0; index < system.layoutSize; index++) {
                layoutItem = system.layoutData[index];
                itemDesign = design[layoutItem[1]];

                // Drawing the border
                if (layoutItem[6] !== 0) {
                    dc.lineWidth = layoutItem[6];
                    dc.beginPath();
                    dc.rect(layoutItem[2], layoutItem[3], layoutItem[4] - layoutItem[2], layoutItem[5] - layoutItem[3]);
                    dc.closePath();
                    dc.strokeStyle = design.containerBorderColor;
                    dc.stroke();
                } else {
                    dc.strokeStyle = "transparent";
                    dc.lineWidth = 0;
                }

                if (system.activeGroup !== null && system.groups[system.activeGroup].indexOf(layoutItem[0]) !== -1) {
                    if (mouse.selection[0] === layoutItem[0]) {
                        dc.fillStyle = design.itemSelectionColor[1];
                    } else {
                        dc.fillStyle = design.itemSelectionColor[0];
                    }

                    dc.beginPath();
                    dc.rect(layoutItem[2], layoutItem[3], layoutItem[4] - layoutItem[2], layoutItem[5] - layoutItem[3]);
                    dc.closePath();
                    dc.fill();
                } else if (mouse.selection[0] === layoutItem[0]) {
                    dc.fillStyle = design.itemSelectionColor[0];
                    dc.beginPath();
                    dc.rect(layoutItem[2], layoutItem[3], layoutItem[4] - layoutItem[2], layoutItem[5] - layoutItem[3]);
                    dc.closePath();
                    dc.fill();
                } else {
                    if (itemDesign[0] === "solid") {
                        dc.fillStyle = itemDesign[1];
                    }
                    dc.beginPath();
                    dc.rect(layoutItem[2], layoutItem[3], layoutItem[4] - layoutItem[2], layoutItem[5] - layoutItem[3]);
                    dc.closePath();
                    dc.fill();
                }
            }
        }
    }

    function drawSelection() {
        dc.strokeStyle = "#000";
        var previousFill = dc.fillStyle;
        dc.fillStyle = "rgba(255,255,255, 0.2)";
        if (mouse.selection === null) {
            if (mouse.startX < system.gridStartX) {
                mouse.startX = system.gridStartX;
            } else if (mouse.startX > system.gridEndX) {
                mouse.startX = system.gridEndX;
            }

            if (mouse.startY < system.gridStartY) {
                mouse.startY = system.gridStartY;
            } else if (mouse.startY > system.gridEndY) {
                mouse.startY = system.gridEndY;
            }

            var mStartX = mouse.startX;
            var mStartY = mouse.startY;
            var mEndX = mouse.x;
            var mEndY = mouse.y;

            if (mEndX > system.gridEndX) {
                mEndX = system.gridEndX;
            } else if (mEndX < system.gridStartX) {
                mEndX = system.gridStartX;
            }

            if (mEndY > system.gridEndY) {
                mEndY = system.gridEndY;
            } else if (mEndY < system.gridStartY) {
                mEndY = system.gridStartY;
            }

            dc.beginPath();
            if (mouse.snapToGrid) {
                var mStartX = Math.floor(mouse.startX / system.gridX) * system.gridX;
                var mStartY = Math.floor(mouse.startY / system.gridY) * system.gridY;
                var mEndX = Math.ceil(mouse.x / system.gridX) * system.gridX;
                var mEndY = Math.ceil(mouse.y / system.gridY) * system.gridY;
                dc.rect(mStartX, mStartY, mEndX - mStartX, mEndY - mStartY);
            }

            if (mouse.currentAction === "selection") {
                dc.rect(mStartX, mStartY, mEndX - mStartX, mEndY - mStartY);
            }
            dc.closePath();
            dc.stroke();
            dc.fill();
        } else {
            var mStartX = mouse.selection[2];
            var mStartY = mouse.selection[3];
            var mEndX = mouse.selection[4];
            var mEndY = mouse.selection[5];
        }

        var containerX = mEndX - mStartX;
        var containerY = mEndY - mStartY;

        dc.beginPath();
        if (mouse.currentAction === "mirrorSelection") {
            if (system.mirrorHorizontal) {
                // Repeat current selection horizontally

                if (system.spaceGridX > 0) {
                    var offsetGridX = system.spaceGridX;
                } else {
                    var offsetGridX = mStartX - system.gridStartX;
                }

                var offsetX = 0;
                dc.rect(mStartX, mStartY, mEndX - mStartX, mEndY - mStartY);

                if (containerX > mouse.threshold) {
                    while (offsetX + containerX + offsetGridX <= system.gridEndX - mEndX) {
                        offsetX += offsetGridX + containerX;
                        dc.rect(mStartX + offsetX, mStartY, containerX, containerY);
                    }

                    if (system.spaceGridX > 0) {
                        offsetX = containerX + system.spaceGridX;
                        var startX = mStartX - offsetX;
                        while (startX > system.gridStartX) {
                            dc.rect(mStartX - offsetX, mStartY, containerX, containerY);
                            offsetX += system.spaceGridX + containerX;
                            startX -= system.spaceGridX + containerX;
                        }
                    }
                }
            } else {
                // Repeat current selection vertically
                if (system.spaceGridY > 0) {
                    var offsetGridY = system.spaceGridY;
                } else {
                    var offsetGridY = mStartY - system.gridStartY;
                }

                var offsetY = 0;
                dc.rect(mStartX, mStartY, mEndX - mStartX, mEndY - mStartY);

                if (containerY > mouse.threshold) {
                    while (offsetY + containerY + offsetGridY <= system.gridEndY - mEndY) {
                        offsetY += offsetGridY + containerY;
                        dc.rect(mStartX, mStartY + offsetY, containerX, containerY);
                    }

                    if (system.spaceGridY > 0) {
                        offsetY = containerY + system.spaceGridY;
                        var startY = mStartY - offsetY;
                        while (startY > system.gridStartY) {
                            dc.rect(mStartX, mStartY - offsetY, containerX, containerY);
                            offsetY += system.spaceGridY + containerY;
                            startY -= system.spaceGridY + containerY;
                        }
                    }

                }
            }
        }
        dc.closePath();
        dc.stroke();
        dc.fill();

        dc.fillStyle = previousFill;
    }

    function renderHelp() {
        dc.fillStyle = "rgba(0,0,0, 0.3)";
        dc.beginPath();
        dc.rect(0, 0, canvas.width, canvas.height);
        dc.closePath();
        dc.fill();

        var shortcuts = ['[I] Toggles this help on/off', '[G] key toggles the grid on an off', '[D] toogles row / column highlighting',
            '[Control] cancels ongoing action or when grouping/ungrouping items',
            '[Shift] snaps to grid when drawing selection, moving an item (click and drag) and mirroring',
            '[Left click and drag movement] Moves a single item or a single item of a group',
            '[Y] Move mode on/off switch, moves a element or group if grouped, can be used with snapping',
            '[Delete] Deletes a single element or grouped elements',
            '[C] create a copy of a single item selection',
            '[V] pastes the copy at cursor location, snapping is possible',
            '[Spacebar] Mirror mode',
            'By default uses distance from grid start to cursor for mirroring.',
            'This can be changed by pressing [W] or [Q] for each axis independently',
            '[X] Toggles mirror mode horizontally or vertically',
            '[Q / W] decrease / increase mirror grid spacing on selected axis - used with [SPACE] and [X]',
            '[E] zeros/erases the grid spacing values for both mirroring axis',
            '[+ or -] Increase or decrase the border on a single item or a group of items'
        ];

        dc.fillStyle = "#000";

        dc.font = "Normal 11px sans-serif";
        dc.fillText('______________________________________ ReLayX Shortcuts ______________________________________', 20, 20);

        dc.font = "Normal 11px sans-serif";
        var offsetY = 45;
        for (var item = 0; item < shortcuts.length; item++) {
            dc.fillText(shortcuts[item], 20, (item * 22) + offsetY);
        }

        dc.font = "Normal 11px sans-serif";
        dc.fillText('___________________________________________ First steps  _________________________________________', 20, 450);

        var first = [
            "Click and drag to create a selection, release the mouse to create a container item.",
            "The container can now be moved by pressing left, to activate, and dragging. Notice the color change when selected",
            "If you want to snap the item to the grid, you can press [SHIFT] to do so, this also snaps the container into the grid.",
            "To delete the container press [DELETE]. To create a copy press [C] and [V] to paste it at the mouse cursor location,",
            "snapping can be used here too when holding [SHIFT] while pressing [V] once."
        ];

        dc.font = "Normal 11px sans-serif";
        offsetY = 480;
        for (var item = 0; item < first.length; item++) {
            dc.fillText(first[item], 20, (item * 21) + offsetY);
        }



        dc.font = "Normal 11px sans-serif";
        dc.fillText('___________________________________________ Grouping ____________________________________________', 20, 610);

        var group = [
            "If you have two or more containers, you can group them together. This can be done by selecting",
            "another ungrouped (see the color when clicking on it) and holding [CONTROL] and left click onto it",
            "they now are grouped and change there colors when selected.",
            "Grouped items can be moved each by left click and drag or as whole by pressing [Y], [Y] is a toggle, no need",
            "to hold down the key - and move the mouse around, snapping using [SHIFT] is possible too.",
            "To ungroup an item, select the grouped container and then click, while holding [CONTROL], on it again, its then ungrouped.",
            "This is also shown by its colors."
        ];

        offsetY = 640;
        for (var item = 0; item < group.length; item++) {
            dc.fillText(group[item], 20, (item * 21) + offsetY);
        }

        dc.font = "Normal 11px sans-serif";
        dc.fillText('___________________________________________ Mirroring ____________________________________________', 20, 800);

        var mirror = [
            "The simples way to test mirroring is by drawing a selection, hold the left mouse button not to finish",
            "the selection and holding [SPACE]. Press [W] once to increase  the mirror distance to one grid unit.",
            "Mirrors along the axis will appear, press [W] to increase it even once more to see the difference.",
            "If you are happy, release the left mouse button while keeping [SPACE] holded until the action finishes.",
            "Youve got a grouped row of those containers, aligned to the grid spacing you selected.",
            "",
            "Another quick way to create mirrors: Select one of those new containers, anyone will be good.",
            "Now hold [SPACE] and press [X] once, if nothing appears, press [W] again, you should now see",
            "a column of possible mirrors. Left click on one to while holding [SPACE] to create one at that location.",
            "",
            "Pressing [Q] will decreate the grid spacing by one unit to zero, while [W] will increase it. If you reach zero",
            "the default spacing is used. Meaning, if you draw a selection with 2 gridspaces away from the left, you will",
            "get mirrors when holding [SPACE] in size of the container plus 2 gridspaces away. [Q / W] avoid that limitation.",
            "",
            "If you have set spacing on any axis, this will also draw mirrors on the whole X or Y row/column. If you want",
            "to create copies, use the shadowing trick by selection the element and setting the grid axis spacing with [Q] or [W]."
        ];

        dc.font = "Normal 11px sans-serif";
        offsetY = 830;
        for (var item = 0; item < mirror.length; item++) {
            dc.fillText(mirror[item], 20, (item * 21) + offsetY);
        }

        dc.font = "Normal 11px sans-serif";
        dc.fillText('_______________ End of ReLayX manual ___ Visit http://github.com/jrie/RelayX ________', 20, 1180);
    }



// Mainloop
    function mainloop() {
        drawItem("background", 0, 1, 2, 3, false);

        if (system.drawGrid) {
            drawGrid(system.gridStartX, system.gridStartY, system.gridEndX, system.gridEndY);
        }

        renderLayoutItems();

        if (system.drawHighlight) {
            dc.fillStyle = design.hightlighterColor;
            dc.fillRect(Math.floor(mouse.x / system.gridX) * system.gridX, 0, system.gridX, canvas.height);
            dc.fillRect(0, Math.floor(mouse.y / system.gridY) * system.gridY, canvas.width, system.gridY);
        }

        if (mouse.currentAction === "selection" || mouse.currentAction === "mirrorSelection") {
            drawSelection();
        }

        if (system.showHelp) {
            renderHelp();
        }

        drawMouse();
        window.requestAnimationFrame(mainloop);
    }


// Bind the mouse to the current window
    function handleMouseMove(evt) {
        var mousePreviousX = mouse.x;
        var mousePreviousY = mouse.y;

        if (system.isIE) {
            system.scrollX = window.pageXOffset;
            system.scrollY = window.pageYOffset;
        } else {
            system.scrollX = window.scrollX;
            system.scrollY = window.scrollY;
        }

        mouse.x = evt.clientX - mouse.offsetX + system.scrollX;
        mouse.y = evt.clientY - mouse.offsetY + system.scrollY;

        if (mouse.currentAction === "dragContainer" || (mouse.currentAction === "dragGroup" && system.activeGroup === null)) {
            mouse.selection[2] += mouse.x - mousePreviousX;
            mouse.selection[3] += mouse.y - mousePreviousY;
            mouse.selection[4] += mouse.x - mousePreviousX;
            mouse.selection[5] += mouse.y - mousePreviousY;

            if (mouse.snapToGrid) {
                mouse.selection[2] = Math.round(mouse.selection[2] / system.gridX) * system.gridX;
                mouse.selection[3] = Math.round(mouse.selection[3] / system.gridY) * system.gridY;
                mouse.selection[4] = Math.round(mouse.selection[4] / system.gridX) * system.gridX;
                mouse.selection[5] = Math.round(mouse.selection[5] / system.gridY) * system.gridY;
            }
        } else if (mouse.currentAction === "dragGroup" && system.activeGroup !== null) {
            var groupSize = system.groups[system.activeGroup].length;
            var mX = mouse.x - mousePreviousX;
            var mY = mouse.y - mousePreviousY;
            for (var groupItem = 0; groupItem < groupSize; groupItem++) {
                var itemId = system.groups[system.activeGroup][groupItem];
                for (var index = 0; index < system.layoutSize; index++) {
                    if (system.layoutData[index][0] === itemId) {
                        var item = system.layoutData[index];
                        item[2] += mX;
                        item[3] += mY;
                        item[4] += mX;
                        item[5] += mY;

                        if (mouse.snapToGrid) {
                            item[2] = Math.round(item[2] / system.gridX) * system.gridX;
                            item[3] = Math.round(item[3] / system.gridY) * system.gridY;
                            item[4] = Math.round(item[4] / system.gridX) * system.gridX;
                            item[5] = Math.round(item[5] / system.gridY) * system.gridY;
                        }
                    }
                }
            }
        }
    }

    function placeHolder() {

    }

    function handleKeyboardDown(evt) {
        if (evt.target.nodeName === "INPUT" || evt.target.nodeName === "TEXTAREA") {
            return;
        }

        if (mouse.selection !== null) {
            if (evt.keyCode === 46) {
                // Delete key
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
                                            system.activeGroup = groupIndex;
                                            break;
                                        }
                                    }
                                }

                                break;
                            }
                        }

                        system.layoutData.splice(item, 1);
                        system.layoutSize--;
                        for (var group = 0; group < system.groups.length; group++) {
                            for (var layoutItem = 0; layoutItem < system.layoutSize; layoutItem++) {
                                if (system.groups[group].indexOf(system.layoutData[layoutItem][0]) !== -1) {
                                    system.layoutData[layoutItem][9] = group;
                                }
                            }
                        }

                        if (!hasNewSelection) {
                            mouse.previousSelection = null;
                            mouse.selection = null;
                            system.activeGroup = null;
                        }

                        return;
                    }
                }
            }

            if (evt.keyCode === 17) {
                // Control key grouping of elements or ungrouping
                if (mouse.currentAction === "selected") {
                    mouse.currentAction = "grouping";
                    return;
                }
            }
        }

        if (evt.keyCode === 16) {
            // Shift key snapping
            mouse.snapToGrid = true;
            //mouse.currentAction = null;
            return;
        } else if (evt.keyCode === 89) {
            // Y key, allows moving off items when pressend once, disables if pressed a second time
            if (mouse.selection !== null) {
                if (mouse.currentAction !== "dragGroup") {
                    mouse.currentAction = "dragGroup";
                } else {
                    mouse.currentAction = "selected";
                }
            }
        } else if (evt.keyCode === 32) {
            // Space bar pressed, turns on repeatition
            evt.preventDefault();
            if (mouse.currentAction === "selection" || mouse.selection !== null) {
                mouse.currentAction = "mirrorSelection";
            }
        } else if (evt.keyCode === 171 || evt.keyCode === 107) {
            // Plus sign on keyboard or plus on numpad
            // id, designElementName, x, y, xEnd, yEnd, border, padding, margin, groupIndex
            if (mouse.selection === null) {
                return;
            } else {
                var targetIndex = 0;
                if (system.expandMode === "border") {
                    targetIndex = 6;
                } else if (system.expandMode === "margin") {
                    targetIndex = 7;
                } else if (system.expandMode === "padding") {
                    targetIndex = 8;
                } else {
                    return;
                }

                if (system.activeGroup !== null) {
                    for (var index = 0; index < system.groups[system.activeGroup].length; index++) {
                        var itemId = system.groups[system.activeGroup][index];
                        for (var item = 0; item < system.layoutSize; item++) {
                            if (system.layoutData[item][0] === itemId) {
                                system.layoutData[item][targetIndex]++;
                                break;
                            }
                        }
                    }
                } else {
                    mouse.selection[targetIndex]++;
                }
                return;
            }
        } else if (evt.keyCode === 173 || evt.keyCode === 109) {
            // Minus sign on keyboard or minus on numpad

            if (mouse.selection === null) {
                return;
            } else {
                var targetIndex = 0;
                if (system.expandMode === "border") {
                    targetIndex = 6;
                } else if (system.expandMode === "margin") {
                    targetIndex = 7;
                } else if (system.expandMode === "padding") {
                    targetIndex = 8;
                } else {
                    return;
                }

                if (system.activeGroup !== null) {
                    for (var index = 0; index < system.groups[system.activeGroup].length; index++) {
                        var itemId = system.groups[system.activeGroup][index];
                        for (var item = 0; item < system.layoutSize; item++) {
                            if (system.layoutData[item][0] === itemId) {
                                if (system.layoutData[item][targetIndex] > 0) {
                                    system.layoutData[item][targetIndex]--;
                                }
                                break;
                            }
                        }
                    }
                } else {
                    if (mouse.selection[targetIndex] > 0) {
                        mouse.selection[targetIndex]--;
                    }
                }

                return;
            }
        }
    }



    function handleKeyboardUp(evt) {
        if (evt.target.nodeName === "INPUT" || evt.target.nodeName === "TEXTAREA") {
            return;
        }

        if (evt.keyCode === 73) {
            system.showHelp = !system.showHelp;
        }

        if (evt.keyCode === 17) {
            // Control key - cancels current action, for example selection or container creation
            mouse.currentAction = null;
        } else if (evt.keyCode === 16) {
            // Shift key - grid snapping off
            mouse.snapToGrid = false;
            return;
        } else if (evt.keyCode === 71) {
            // G key toggles grid
            system.drawGrid = !system.drawGrid;
            lg("Switching grid " + (system.drawGrid ? "on" : "off"));
        } else if (evt.keyCode === 67) {
            // C key starts a copy
            if (mouse.selection !== null) {
                system.copyItem = mouse.selection;
            }
            lg("Taking a copy of layout item: " + system.copyItem[0]);
        } else if (evt.keyCode === 86) {
            // V key create a copy at cursor location
            if (system.copyItem !== null) {
                createLayoutContainer(mouse.x, mouse.y, mouse.x + system.copyItem[4] - system.copyItem[2], mouse.y + system.copyItem[5] - system.copyItem[3]);
                mouse.selection = system.layoutData[system.layoutSize - 1];
            }
        } else if (evt.keyCode === 68) {
            // D key - toggle row/column hightlight on off
            system.drawHighlight = !system.drawHighlight;
            lg("Switching colum/row highlighting " + (system.drawHighlight ? "on" : "off"));
        } else if (evt.keyCode === 32) {
            // Space key up, turn repeat action off
            if (mouse.currentAction === "mirrorSelection") {
                if (mouse.selection === null) {
                    mouse.currentAction = "selection";
                } else {
                    mouse.currentAction = "selected";
                }
            }
        } else if (evt.keyCode === 88) {
            // X key, horizontal/vertical repeation
            system.mirrorHorizontal = !system.mirrorHorizontal;
            lg("Setting mirroring to: " + (system.mirrorHorizontal ? "Horizontally" : "Vertically"));
        } else if (evt.keyCode === 66) {
            // B key
            system.expandMode = "border";
            lg("Setting border expand mode.");
        } else if (evt.keyCode === 77) {
            // M key
            system.expandMode = "margin";
            lg("Setting margin expand mode.");
        } else if (evt.keyCode === 77) {
            // P key
            system.expandMode = "padding";
            lg("Setting padding expand mode.");
        } else if (evt.keyCode === 69) {
            // E key erases the old spacing values for mirroring
            system.spaceGridX = 0;
            system.spaceGridY = 0;
            lg("Mirror spacing resetted on both axis to 0.");
        } else if (evt.keyCode === 87) {
            // W key increases the current selection axis grid spacing by one grid unit
            if (system.mirrorHorizontal) {
                system.spaceGridX += system.gridX;
            } else {
                system.spaceGridY += system.gridY;
            }
            lg("Increased grid spacing to: " + system.spaceGridX + " X and " + system.spaceGridY + " Y");
        } else if (evt.keyCode === 81) {
            // Q key decreases the current selection axis grid spacing by one grid unit
            if (system.mirrorHorizontal) {
                system.spaceGridX -= system.gridX;
                if (system.spaceGridX < 0) {
                    system.spaceGridX = 0;
                }
            } else {
                system.spaceGridY -= system.gridY;
                if (system.spaceGridY < 0) {
                    system.spaceGridY = 0;
                }
            }
            lg("Decreased grid spacing to: " + system.spaceGridX + " X and " + system.spaceGridY + " Y");
        }
    }

    canvas.addEventListener("mousemove", handleMouseMove);
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
