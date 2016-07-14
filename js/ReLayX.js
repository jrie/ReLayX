// Design template generator
function getDesign(designName, width, height) {
    // The design item
    var design = {};

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
            design.notificationColor = "#000";
            design.labelColor = "#000";
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
            design.notificationColor = "#aeaeae";
            design.labelColor = "#aeaeae";

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
        if (system.showNotifications) {
            system.notifications.push([0, msg]);
        }

        if (window.console) {
            window.console.log(msg);
        }
    }

    // Set styles
    canvas.width = width;
    canvas.height = height;
    canvas.style.cursor = "none";

    var design = getDesign(designName, width, height, gridX, gridY);
    system.designNames = ["snowwhite", "firebird"];
    system.currentDesign = 0;

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
    system.showHelp = false;
    system.showNotifications = true;
    system.notifications = [];
    system.showHelpNote = true;
    system.shiftPressed = false;
    system.storage = window.localStorage || null;
    system.isCalculating = false;
    system.generatedDivs = [];
    system.renderDivs = true;
    system.drawLabels = true;
    system.displayBrowserGrid = false;
    system.browserSpacingStart = window.navigator.userAgent.indexOf("Chrome") === -1 ? 113 : 0;
    system.browserSpacing = window.navigator.userAgent.indexOf("Chrome") === -1 ? 113 : 99.88;

    // Might only work on IE11 and only if the user agent is not altered by the user
    system.isIE = window.navigator.userAgent.indexOf("Trident") !== -1 ? true : false;
    system.isChrome = window.navigator.userAgent.indexOf("Chrome") !== -1 ? true : false;
    //lg(window.navigator.userAgent)

    if (system.isIE) {
        system.scrollX = window.pageXOffset;
        system.scrollY = window.pageYOffset;
    } else if (system.isChrome) {
        system.scrollX = window.scrollX;
        system.scrollY = window.scrollY;
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
                                createLayoutContainer(mStartX + offsetX, mStartY, mEndX + offsetX, mEndY, true);
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
                                createLayoutContainer(mStartX - offsetX, mStartY, mEndX - offsetX, mEndY, true);
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
                                createLayoutContainer(mStartX + offsetX, mStartY, mEndX + offsetX, mEndY, true);
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
                                createLayoutContainer(mStartX, mStartY + offsetY, mEndX, mEndY + offsetY, true);
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
                                createLayoutContainer(mStartX, mStartY - offsetY, mEndX, mEndY - offsetY, true);
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
                                createLayoutContainer(mStartX, mStartY + offsetY, mEndX, mEndY + offsetY, true);
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
                                mouse.selection[9] = -1;
                                system.groups[system.activeGroup].splice(groupItem, 1);

                                if (system.groups[system.activeGroup].length === 1) {
                                    for (var layoutItem = 0; layoutItem < system.layoutSize; layoutItem++) {
                                        if (system.layoutData[layoutItem][0] === system.groups[system.activeGroup][0]) {
                                            system.layoutData[layoutItem][9] = -1;
                                        } else if (system.layoutData[layoutItem][9] > system.activeGroup) {
                                            system.layoutData[layoutItem][9]--;
                                        }
                                    }

                                    system.groups.splice(system.activeGroup, 1);
                                }
                                system.activeGroup = null;
                                break;
                            }
                        }
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
            createLayoutContainer(mouse.startX, mouse.startY, mouse.endX, mouse.endY, true);
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
                    var containerId = createLayoutContainer(mStartX, mStartY, mEndX, mEndY, true);
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
                        containerId = createLayoutContainer(mStartX + offsetX, mStartY, mEndX + offsetX, mEndY, true);
                        system.groups[system.activeGroup].push(containerId);
                        system.layoutData[system.layoutSize - 1][9] = system.activeGroup;
                    }

                    if (system.spaceGridX > 0) {
                        var startX = mStartX;
                        var offsetX = offsetGridX + containerX;

                        while (startX - offsetX >= system.gridStartX) {
                            containerId = createLayoutContainer(mStartX - offsetX, mStartY, mEndX - offsetX, mEndY, true);
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

                    var containerId = createLayoutContainer(mStartX, mStartY, mEndX, mEndY, true);
                    system.groups.push([containerId]);
                    system.activeGroup = system.groups.length - 1;
                    system.layoutData[system.layoutSize - 1][9] = system.activeGroup;

                    while (offsetY + containerY + offsetGridY <= system.gridEndY - mEndY) {
                        offsetY += offsetGridY + containerY;
                        containerId = createLayoutContainer(mStartX, mStartY + offsetY, mEndX, mEndY + offsetY, true);
                        system.groups[system.activeGroup].push(containerId);
                        system.layoutData[system.layoutSize - 1][9] = system.activeGroup;
                    }

                    if (system.spaceGridY > 0) {
                        var startY = mStartY;
                        var offsetY = offsetGridY + containerY;

                        while (startY - offsetY >= system.gridStartY) {
                            containerId = createLayoutContainer(mStartX, mStartY - offsetY, mEndX, mEndY - offsetY, true);
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

    function createLayoutContainer(mStartX, mStartY, mEndX, mEndY, useSnapping) {
        var itemStartX = 0;
        var itemEndX = 0;
        var itemStartY = 0;
        var itemEndY = 0;

        if (mouse.snapToGrid) {
            mStartX = Math.floor(mStartX / system.gridX) * system.gridX;
            mStartY = Math.floor(mStartY / system.gridY) * system.gridY;
            if (useSnapping) {
                mEndX = Math.ceil(mEndX / system.gridX) * system.gridX;
                mEndY = Math.ceil(mEndY / system.gridY) * system.gridY;
            }
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
        system.layoutData.push([id, "containerElement", itemStartX, itemStartY, itemEndX, itemEndY, 0, 0, 0, -1, ""]);
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

                // Draw the labels
                if (system.drawLabels) {
                    dc.fillStyle = design.labelColor;
                    dc.textAlign = "center";
                    dc.fillText(layoutItem[10], layoutItem[2] + ((layoutItem[4] - layoutItem[2]) * 0.5), layoutItem[3] + ((layoutItem[5] - layoutItem[3]) * 0.5) + 3);
                }
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

                // Draw the labels
                if (system.drawLabels) {
                    dc.fillStyle = design.labelColor;
                    dc.textAlign = "center";
                    dc.fillText(layoutItem[10], layoutItem[2] + ((layoutItem[4] - layoutItem[2]) * 0.5), layoutItem[3] + ((layoutItem[5] - layoutItem[3]) * 0.5) + 3);
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
        dc.textAlign = "left";

        var shortcuts = ['[I] Toggles this help on/off',
            '[G] key toggles the grid on an off, [Shift + G] toggles custom designs',
            '[D] toogles row / column highlighting / [Shift + D] toggles browser scroll grid on/off',
            '[Control] cancels ongoing action or when grouping/ungrouping items',
            '[Shift] snaps to grid when drawing selection, moving an item (click and drag) and mirroring',
            '[Left click and drag movement] Moves a single item or a single item of a group',
            '[Y / Z] Move mode on/off switch, moves a element or group if grouped, can be used with snapping',
            '[Del] Deletes a single element or a grouped element',
            '[C] create a copy of a single item selection',
            '[V] pastes the copy at cursor location, snapping is possible',
            '[Spacebar] Mirror mode',
            'By default uses distance from grid start to cursor for mirroring.',
            'This can be changed by pressing [W] or [Q] for each axis independently',
            '[X] Toggles mirror mode horizontally or vertically',
            '[Q / W] decrease / increase mirror grid spacing on selected axis - used with [SPACE] and [X]',
            '[E] zeros/erases the grid spacing values for both mirroring axis',
            '[+ or -] Increase or decrase the border on a single item or a group of items',
            '[1 to 9] - Saves design in slot 1 to 9, [SHIFT + 1 ... 9] loads a design from slot 1 to 9, [BACKSPACE] Clears all saved data',
            '[L] Create or rename a labeled item if selected, if nothing is selected, turns label rendering on or off'
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
            "Grouped items can be moved each by left click and drag or as whole by pressing [Y or Z], [Y or Z] is a toggle, no need",
            "to hold down the key - and move the mouse around, snapping using [SHIFT] snapping is possible too.",
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
            "Pressing [Q] will decrease the grid spacing by one unit to zero, while [W] will increase it. If you reach zero",
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

    function renderNotifications() {
        var notes = system.notifications.length;

        if (system.showHelpNote) {
            var offsetY = 36;
        } else {
            var offsetY = 20;
        }

        dc.font = "10px sans-serif";
        dc.fillStyle = design.notificationColor;
        dc.textAlign = "left";

        if (!system.showHelp && system.showHelpNote) {
            dc.fillText("Press [I] to open help, [U] to hide/show this message", 20, 20);
        }

        while (notes--) {
            if (system.notifications[notes][0] < 65) {
                system.notifications[notes][0]++;
                dc.fillText(system.notifications[notes][1], 20, offsetY);
                offsetY += 16;
            } else {
                system.notifications.splice(notes, 1);
            }
        }
    }

    function renderDivs() {
        var divs = system.generatedDivs.length;
        var currentDiv = [];
        dc.beginPath();
        dc.lineWidth = 2;
        dc.strokeStyle = design.containerBorderColor;
        while (divs--) {
            currentDiv = system.generatedDivs[divs];
            dc.rect(currentDiv[0], currentDiv[1], currentDiv[2] - currentDiv[0], currentDiv[3] - currentDiv[1]);
        }
        dc.closePath();
        dc.stroke();
        dc.lineWidth = 1;
    }


    // Mainloop
    function mainloop() {
        drawItem("background", 0, 1, 2, 3, false);
        if (!system.isCalculating) {
            if (system.drawGrid) {
                drawGrid(system.gridStartX, system.gridStartY, system.gridEndX, system.gridEndY);
            }
        }

        renderLayoutItems();

        if (!system.isCalculating) {
            if (system.renderDivs) {
                renderDivs();
            }

            if (system.drawHighlight) {
                dc.fillStyle = design.hightlighterColor;
                dc.fillRect(Math.floor(mouse.x / system.gridX) * system.gridX, 0, system.gridX, canvas.height);
                dc.fillRect(0, Math.floor(mouse.y / system.gridY) * system.gridY, canvas.width, system.gridY);
            }

            if (system.displayBrowserGrid) {
                var y = system.browserSpacingStart - mouse.offsetY;
                dc.beginPath();
                dc.lineWidth = 1;
                dc.strokeStyle = "#000";
                while (y < system.height) {
                    dc.moveTo(0, y);
                    dc.lineTo(system.width, y);
                    y += system.browserSpacing;
                }
                dc.closePath();
                dc.stroke();
            }
        }

        if (mouse.currentAction === "selection" || mouse.currentAction === "mirrorSelection") {
            drawSelection();
        }


        if (system.showNotifications) {
            renderNotifications();
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

        if (system.isChrome) {
            mouse.x = evt.clientX + system.scrollX;
            mouse.y = evt.clientY + system.scrollY - canvas.offsetTop;
        } else {
            mouse.x = evt.clientX - mouse.offsetX + system.scrollX;
            mouse.y = evt.clientY - mouse.offsetY + system.scrollY;
        }

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
            } else if (evt.keyCode === 17) {
                // Control key grouping of elements or ungrouping
                if (mouse.currentAction === "selected") {
                    mouse.currentAction = "grouping";
                    return;
                }
            }
        }

        if (evt.keyCode === 76) {
            if (mouse.selection !== null) {
                var blockName = prompt("What should be the name of the block?", mouse.selection[10]);
                mouse.selection[10] = blockName;
                return;
            } else {
                system.drawLabels = !system.drawLabels;
                lg("Use labels is set to " + system.drawLabels);
            }
        }



        if (evt.keyCode === 16) {
            // Shift key snapping
            mouse.snapToGrid = true;
            //mouse.currentAction = null;
            system.shiftPressed = true;
            return;
        } else if (evt.keyCode === 89 || evt.keyCode === 90) {
            // Y key, allows moving off items when pressend once, disables if pressed a second time
            if (mouse.selection !== null) {
                if (mouse.currentAction !== "dragGroup") {
                    mouse.currentAction = "dragGroup";
                    lg("Activated dragging.");
                } else {
                    mouse.currentAction = "selected";
                    lg("Deactivated dragging.");
                }
            }
            return;
        } else if (evt.keyCode === 32) {
            // Space bar pressed, turns on repeatition
            evt.preventDefault();
            if ((mouse.currentAction === "selection" || mouse.selection !== null) && mouse.currentAction !== "mirrorSelection") {
                mouse.currentAction = "mirrorSelection";
                lg("Mirroring selection.");
            }
            return;
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

    function saveDesign(slot) {
        if (system.storage === null) {
            lg("Cannot use loading or saving function in this browser.");
            return;
        }
        var layoutKey = "layout_" + slot;
        var layoutSubKey = layoutKey + "_";
        system.storage.setItem(layoutKey, true);

        var item = 0;
        for (item = 0; item < system.layoutSize; item++) {
            system.storage.setItem(layoutSubKey + item, system.layoutData[item]);
        }
        system.storage.setItem(layoutSubKey + item, false);
        lg("Design saved in slot " + slot + ".");
        return;
    }

    function loadDesign(slot) {
        if (system.storage === null) {
            lg("Cannot use loading or saving function in this browser.");
            return;
        }

        var layoutKey = "layout_" + slot;
        var layoutSubKey = layoutKey + "_";
        var layoutIndex = 0;

        system.layoutData = [];
        system.layoutSize = 0;
        system.groups = [];
        system.activeGroup = null;
        system.generatedDivs = [];
        mouse.selection = null;

        var groupIndexes = [];

        if (system.storage.getItem(layoutKey) !== null) {
            while (system.storage.getItem(layoutSubKey + layoutIndex) !== null && system.storage.getItem(layoutSubKey + layoutIndex) !== "false") {
                var storageItemData = system.storage.getItem(layoutSubKey + layoutIndex).split(",");
                for (var key = 0; key < storageItemData.length; key++) {
                    var floatVal = parseFloat(storageItemData[key]);
                    if (!Number.isNaN(floatVal)) {
                        storageItemData[key] = floatVal;
                    }
                }

                var groupKey = storageItemData[9];
                if (groupKey !== -1) {
                    if (groupIndexes.indexOf(groupKey) === -1) {
                        groupIndexes.push(groupKey);
                        system.groups.push([storageItemData[0]]);
                    } else {
                        system.groups[groupIndexes.indexOf(groupKey)].push(storageItemData[0]);
                    }

                    storageItemData[9] = groupIndexes.indexOf(groupKey);
                }
                system.layoutData.push(storageItemData);
                system.layoutSize++;
                layoutIndex++;
            }

            system.activeGroup = null;
            mouse.selection = null;

            lg("Design loaded from slot " + slot + ".");
            return;
        }

        lg("No design to load in slot " + slot + ".");
        return;
    }

    function clearDesigns() {
        Storage.clear();
    }

    function rebindHandlers() {
        mouse.selection = null;

        if (system.isCalculating) {
            canvas.removeEventListener("mousedown", checkMouseDown);
            document.removeEventListener("keydown", handleKeyboardDown);
            document.removeEventListener("keyup", handleKeyboardUp);
        } else {
            canvas.addEventListener("mousedown", checkMouseDown);
            document.addEventListener("keydown", handleKeyboardDown);
            document.addEventListener("keyup", handleKeyboardUp);
        }
    }

    function generateRenderedView() {

        // The general starting coordinates
        var startX = system.gridStartX;
        var startY = system.gridStartY;
        var endX = system.gridEndX;
        var endY = system.gridEndY;

        // How much space we have
        var spaceX = endX - startX;
        var spaceY = endY - startY;

        // The general point we are working with
        var x = startX;
        var y = startY;

        var items = system.layoutSize;
        var item = system.layoutData[0];
        var possibleItems = getArrayCopy(system.layoutData);
        var discoveredItems = [];

        // The offsets
        var offsetStartX = startX;
        var offsetEndX = startY;
        var offsetStartY = startY;
        var offsetEndY = endY;

        // Do the actual processing
        if (system.isCalculating) {
            return;
        }

        system.isCalculating = true;
        system.generatedDivs = [];
        system.activeGroup = null;
        mouse.selection = null;
        rebindHandlers();

        var activeGroup = -1;
        var generatedDivs = [];

        function calculateDivs() {
            var item = [];

            var activeDiv = [];
            var usedGroups = [];
            for (var items = 0; items < discoveredItems.length; items++) {
                item = discoveredItems[items];
                if (item[4] === -1) {
                    // Create a single div
                    generatedDivs.push([item[0], item[1], item[2], item[3], item[5]]);
                    usedGroups.push(-1);
                } else {
                    var index = usedGroups.indexOf(item[4]);
                    if (index === -1) {
                        usedGroups.push(item[4]);
                        generatedDivs.push([item[0], item[1], item[2], item[3], item[5]]);
                    } else {
                        activeDiv = generatedDivs[index];
                        activeDiv[2] = item[2];
                        activeDiv[3] = item[3];
                    }
                }
            }

            system.generatedDivs = generatedDivs;
        }

        function doProcessing() {
            for (x = startX; x < endX; x++) {
                items = discoveredItems.length;
                while (items--) {
                    item = discoveredItems[items];
                    dc.beginPath();
                    dc.rect(item[0], item[1], item[2] - item[0], item[3] - item[1]);
                    dc.closePath();
                    if (dc.isPointInPath(x, y)) {
                        x += item[2] - item[0] + 1;
                        mouse.selection = [item[5]];
                        break;
                    }
                }

                items = possibleItems.length;
                while (items--) {
                    item = possibleItems[items];
                    dc.beginPath();
                    dc.rect(item[2], item[3], item[4], item[5]);
                    dc.closePath();
                    if (dc.isPointInPath(x, y)) {
                        discoveredItems.push([item[2], item[3], item[4], item[5], item[9], item[0]]);
                        mouse.selection = [item[0]];
                        x = item[4] + 1;
                        possibleItems.splice(items, 1);
                        break;
                    }
                }

                if (possibleItems.length === 0) {
                    lg("Processing done...");
                    system.isCalculating = false;
                    calculateDivs();
                    rebindHandlers();
                    return;
                }
            }

            lg("Processing of row " + ((y - startY) + 1) + " done.");

            y++;
            if (y > endY) {
                lg("Processing done...");
                system.isCalculating = false;
                calculateDivs();
                rebindHandlers();
                return;
            }

            window.requestAnimationFrame(doProcessing);
        }

        // Call the processor  loop first time
        doProcessing();
    }


    function handleKeyboardUp(evt) {
        if (evt.target.nodeName === "INPUT" || evt.target.nodeName === "TEXTAREA") {
            return;
        }

        if (evt.keyCode === 16) {
            mouse.snapToGrid = false;
            system.shiftPressed = false;
            return;
        } else if (evt.keyCode === 82) {
            generateRenderedView();
            lg("Generating rendered view");
            return;
        } else if (evt.keyCode === 72) {
            system.renderDivs = !system.renderDivs;
            return;
        }

        if (system.shiftPressed) {
            if (evt.keyCode >= 49 && evt.keyCode <= 57) {
                // 1 to 9 pressed on keyboard pressed
                var slot = evt.keyCode - 48;
                loadDesign(slot);
                lg("Loading design...");
            }

            if (evt.keyCode === 68) {
                system.displayBrowserGrid = !system.displayBrowserGrid;
                lg("Display browser grid set to " + system.displayBrowserGrid);
                return;
            } else if (evt.keyCode === 71) {
                if (system.currentDesign >= system.designNames.length - 1) {
                    system.currentDesign = 0;
                } else {
                    system.currentDesign++;
                }
                design = getDesign(system.designNames[system.currentDesign], system.width, system.height);
                return;
            }
        } else {
            if (evt.keyCode >= 49 && evt.keyCode <= 57) {
                // 1 to 9 pressed on keyboard pressed
                var slot = evt.keyCode - 48;
                saveDesign(slot);
                lg("Saving design...");
            }
        }

        if (evt.keyCode === 8) {
            evt.preventDefault();
            if (system.storage !== null) {
                system.storage.clear();
                lg("Storage cleared...");
                return;
            }
        } else if (evt.keyCode === 73) {
            system.showHelp = !system.showHelp;
            return;
        } else if (evt.keyCode === 85) {
            system.showHelpNote = !system.showHelpNote;
            return;
        } else if (evt.keyCode === 17) {
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
                createLayoutContainer(mouse.x, mouse.y, mouse.x + system.copyItem[4] - system.copyItem[2], mouse.y + system.copyItem[5] - system.copyItem[3], false);
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
