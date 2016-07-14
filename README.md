# ReLayX
Relax your layouts - while layouting inside the browser

ReLayX is a layouting engine written using a canvas element. Layouting therefore can be done inside the browser itself. There a basic tools which allow quick creation of layouts onto a customizable grid size. Those tools are mirroring and grouping of elements. Grouping allows simple grouping of layout blocks, while mirroring does create mirrors of a selection, going aligned with the base grid set.

Layouts then can be saved as images from the canvas using right click save image and then send into another application like Photoshop.

The basic options for the javascript command inside the index.html are: CanvasItemId, codePanel, designName, canvasWidth, canvasHeight, gridX and gridY, [gridStartAtX, gridStartAtY], [gridEndAtX, gridEndAtY]
* canvasItemID is the canvasItemId to work the script on
* codePanel - the textarea where to place code generated (not implemented)
* designName - either "snowwhite" or "firebird" are possible options
* canvasWidth and canvasHeight - the width and height of the canvas item (will be set by the script based on this values)
* gridX and gridY - The X and Y grid sizes (pixel)
* [gridStartAtX, gridStartAtY] - Array of two values where the grid should start in the canvas in x and y
* [gridEndAtX, gridEndAtY] - Array of two values where the grid should end on x and y

There is a built-in help, but here are its contents (shortcuts first as they are required to use the tool).

### Shortcuts
* [I] Toggles this help on/off
* [G] key toggles the grid on an off / [SHIFT] + [D] toggles browser grid on and off
* [D] toogles row / column highlighting
* [Control] cancels ongoing action or when grouping/ungrouping items
* [Shift] snaps to grid when drawing selection, moving an item (click and drag) and mirroring
* [Left click and drag movement] Moves a single item or a single item of a group
* [Y / Z] Move mode on/off switch, moves a element or group if grouped, can be used with snapping
* [Delete] Deletes a single element or an item of grouped elements
* [C] create a copy of a single item selection
* [V] pastes the copy at cursor location, snapping is possible
* [Spacebar] Mirror mode*
* *By default uses distance from grid start to cursor for mirroring. This can be changed by pressing [W] or [Q] for each axis independently.
* [X key] Toggles mirror mode horizontally or vertically
* [Q / W] decrease / increase mirror grid spacing on selected axis - used with [SPACE] and [X]
* [E] zeros/erases the grid spacing values for both mirroring axis
* [+ or -] Increase or decrase the border on a single item or a group of items
* [1 to 9] - Saves design in slot 1 to 9, [SHIFT + 1 ... 9] loads a design from slot 1 to 9, [BACKSPACE] Clears all saved data

### Basic usage guides

#### First steps
Click and drag to create a selection, release the mouse to create a container item.

The container can now be moved by pressing left, to activate, and dragging. Notice the color change when selected.

If you want to snap the item to the grid, you can press [SHIFT] to do so, this also snaps the container into the grid.

To delete the container press [DELETE]. To create a copy press [C] and [V] to paste it at the mouse cursor location, snapping can be used here too when holding [SHIFT] while pressing [V] once.

#### Grouping
If you have two or more containers, you can group them together. This can be done by selecting, another ungrouped (see the color when clicking on it) and holding [CONTROL] and left click onto it they now are grouped and change there colors when selected.

Grouped items can be moved each by left click and drag or as whole by pressing [Y or Z], [Y or Z] is a toggle, no need to hold down the key - and move the mouse around, snapping using [SHIFT] is possible too."

To ungroup an item, select the grouped container and then click, while holding [CONTROL], on it again, its then ungrouped. This is also shown by its colors.

#### Mirroring

The simples way to test mirroring is by drawing a selection, hold the left mouse button not to finish the selection and holding [SPACE]. Press [W] once to increase  the mirror distance to one grid unit.
Mirrors along the axis will appear, press [W] to increase it even once more to see the difference.

If you are happy, release the left mouse button while keeping [SPACE] holded until the action finishes.
Youve got a grouped row of those containers, aligned to the grid spacing you selected.

Another quick way to create mirrors: Select one of those new containers, anyone will be good.

Now hold [SPACE] and press [X] once, if nothing appears, press [W] again, you should now see a column of possible mirrors. Left click on one to while holding [SPACE] to create one at that location.

Pressing [Q] will decrease the grid spacing by one unit to zero, while [W] will increase it. If you reach zero the default spacing is used. Meaning, if you draw a selection with 2 gridspaces away from the left, you will get mirrors when holding [SPACE] in size of the container plus 2 gridspaces away. [Q / W] avoid that limitation.

If you have set spacing on any axis, this will also draw mirrors on the whole X or Y row/column. If you want to create copies, use the shadowing trick by selection the element and setting the grid axis spacing with [Q] or [W].
