/*
Copyright (c) 2010 Antony Dzeryn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/// <reference path="canvasLayers.ts" />

module CanvasLayers {

	/**
     * Defines a basic layer.
     * @param x The x co-ordinate of the layer, relative to its parent.
     * @param y The y co-ordinate of the layer, relataive to its parent.
     * @param width The width of the layer.
     * @param height The height of the layer.
     */
	export class Layer {

		parent : any = null;
		visible : bool = true;
		canvas : any = null;
		permeable : bool = false;

		rect : Rectangle;
		children : LayerCollection;

		onRender : any = null;

		constructor(x : number, y : number, width : number, height : number) {

			this.rect = new Rectangle(x, y, width, height);
			this.children = new LayerCollection(this);

		}

		/**
		 * Gets the absolute x co-ordinate of the layer (ie. relative to the top-level
		 * layer).
		 * @return The x co-ordinate of the layer relative to the top-level layer.
		 */
		getX() : number {
	        if (this.parent != null) {
            	return this.rect.x + this.getParent().getX();
	        }
	        
	        return this.rect.x;
		}

		/**
		 * Gets the absolute y co-ordinate of the layer (ie. relative to the top-level
		 * layer).
		 * @return The y co-ordinate of the layer relative to the top-level layer.
		 */
		getY() : number {
	        if (this.parent != null) {
            	return this.rect.y + this.getParent().getY();
	        }
	        
	        return this.rect.y;
		}

		/**
		 * Gets the x co-ordinate of the layer relative to its parent.
		 * @return The x co-ordinate of the layer relative to its parent.
		 */
		getRelativeX() : number {
	        return this.rect.x;
		}

		/**
		 * Gets the y co-ordinate of the layer relative to its parent.
		 * @return The y co-ordinate of the layer relative to its parent.
		 */
		getRelativeY() : number {
	        return this.rect.y;
		}

		/**
		 * Gets the layer's parent layer.
		 * @return The layer's parent layer, or null if the layer has no parent.
		 */
		getParent() : Layer {
	        return this.parent;
		}

		/**
		 * Sets the layer's parent layer.
		 * @param parent The new parent layer.
		 */
		setParent(parent : Layer) : void {
	        this.parent = parent;
		}

		/**
		 * Gets the layer's rect
		 * @return The layer's Rect object.
		 */
		getRect() : Rectangle {
	        return this.rect;
		}

		/**
		 * Gets a value indicating whether or not children can exceed the dimensions
		 * layer's borders.
		 * @return True if children can move beyond the borders of the layer.
		 */
		isPermeable() : bool {
	        return this.permeable;
		}

		/**
		 * Sets the layer's permeable property.
		 * @property permeable The new permeable value.  Set to true to allow children
		 * to move beyond the borders of this parent layer.
		 */
		setPermeable(permeable : bool) : void {
	        this.permeable = permeable;
		}

		/**
		 * Gets the list of child layers.
		 * @return A LayerCollection containing the layer's children.
		 */
		getChildren() : LayerCollection {
	        return this.children;
		}

		/**
		 * Gets the width of the layer.
		 * @return The width of the layer.
		 */
		getWidth() : number { return this.rect.width; }

		/**
		 * Gets the height of the layer.
		 * @return The height of the layer.
		 */
		getHeight() : number { return this.rect.height; }

		/**
		 * Gets a rectangle describing the available client space within the layer.
		 * @return A rectangle describing the client space within the layer.
		 */
		getClientRect() : Rectangle {
	        return new Rectangle(0, 0, this.getWidth(), this.getHeight());
		}

		/**
		 * Gets the layer's rectangle, clipped to the rectangles of its ancestor
		 * layers.  This is useful if a layer has been moved partially or totally
		 * out of the space available within its parent and only the visible portion
		 * should be used (ie. in clipped drawing functions).
		 * @return The layer's rectangle clipped to its ancestors.
		 */
		getRectClippedToHierarchy() : Rectangle {

	        var rect = new Rectangle(this.getX(), this.getY(), this.getWidth(), this.getHeight());

	        var parent = this.parent;
	        var layer = this;

	        while (parent) {
                // Copy parent's properties into the rect
                var parentRect = parent.getRect();

                rect.clipToIntersect(parentRect);

                // Send up to parent
                layer = parent;
                parent = parent.getParent();
	        }
	        
	        return rect;
		}

		/**
		 * Check if the layer is visible or not.  A layer is not visible if its parent
		 * is not visible.
		 * @return True if the layer and its parents are visible.
		 */
		isVisible() : bool {
	        if (!this.visible) return false;
	        if (!this.parent) return this.visible;
	        return (this.parent.isVisible());
		}

		/**
		 * Gets the layer's canvas.  Recurses up the layer tree until the top-level
		 * layer is found, which should return its reference to the current canvas.
		 * @return The layer's canvas.
		 */
		getCanvas() {
	        if (!this.canvas) {
                if (this.parent) {
                    this.canvas = this.parent.getCanvas();
                }
	        }
	        return this.canvas;
		}

		/**
		 * Gets the layer's damaged rectangle manager.  Recurses up the layer tree
		 * until the top-level layer is found, which should return its reference to the
		 * current damaged rectangle manager.
		 * @return The layer's damaged rectangle manager.
		 */
		getDamagedRectManager() : DamagedRectManager {
	        if (this.parent) return this.parent.getDamagedRectManager();
	        return null;
		}

		/**
		 * Sends the visible portions of the layer as damaged to the damaged rectangle
		 * manager for redraw.  Should be called whenever the visible state of the
		 * layer should change.
		 */
		markRectsDamaged() : void {
	        var damagedRectManager = this.getDamagedRectManager();

	        if (!damagedRectManager) return;
	        
	        if (damagedRectManager.supportsTransparency) {        
                // We are supporting transparency, so we need to mark the entire layer
                // as damaged
                damagedRectManager.addDamagedRect(this.getRectClippedToHierarchy());
	        } else {
	            // We are not supporting transparency, so we mark the visible regions
	            // as damaged.
	            var damagedRects = this.getVisibleRects();
	    
	            for (var i in damagedRects) {
	                    damagedRectManager.addDamagedRect(damagedRects[i]);
            	}
	        }
		}

		/**
		 * Sends the visible portions of the specified rect to the damaged rectangle
		 * manager for redraw.  Can be called instead of markDamagedRects() if a small
		 * portion of the layer needs to be redrawn.  The rect's co-ordinates should
		 * be relative to the layer.
		 * @param rect The rect to redraw.  It will be clipped to the visible portion of
		 * the layer as appropriate.
		 */
		markRectDamaged(rect : Rectangle) : void {
	        var visibleRects;
	        var damagedRectManager = this.getDamagedRectManager();
	        
	        if (!damagedRectManager) return;
	                
	        // If we are supporting transparency, we need to redraw the portions of the
	        // rect that overlap any part of this layer.  If not, we only need to
	        // redraw the portions of the rect that overlap the visible regions of the
	        // rect
	        if (damagedRectManager.supportsTransparency) {
                visibleRects = new Array();
                visibleRects.push(this.rect);
	        } else {
                visibleRects = this.getVisibleRects();
	        }
	        
	        // Convert the rect to the absolute position
	        var absoluteRect = new CanvasLayers.Rectangle(rect.x + this.getX(), rect.y + this.getY(), rect.width, rect.height);
	        
	        // Work out which areas of the rect intersect the visible portion of the
	        // layer
	        var damagedRects = new Array();
	        
	        for (var i in visibleRects) {
                var intersect = absoluteRect.splitIntersection(visibleRects[i], []);
                if (intersect) {
                    damagedRects.push(intersect);
                }
	        }

	        // Send all damaged rects to the manager
	        for (var i in damagedRects) {
                damagedRectManager.addDamagedRect(damagedRects[i]);
	        }
		}

		/**
		 * Gets a list of the layer's visible rectangles.  These are the portions of
		 * the layer not overlapped by other layers.  If the layer is totally
		 * obscured an empty array is returned.
		 * @return An array of all visible regions of the layer.
		 */
		getVisibleRects() : Rectangle[] {

	        var rect = new Rectangle(this.getX(), this.getY(), this.getWidth(), this.getHeight());

	        var visibleRects : Rectangle[] = new Array();
	        visibleRects.push(rect);
	        
	        var layer = this;
	        var parent = this.parent;

	        while (parent && layer) {

                // Locate layer in the list; we add one to the index to
                // ensure that we deal with the next layer up in the z-order
                var layerIndex = parseInt(parent.getChildren().getLayerIndex(layer)) + 1;

                // Layer should never be the bottom item on the screen
                if (layerIndex > 0) {

                    // Remove any overlapped rectangles
                    for (var i = layerIndex; i < parent.getChildren().length(); i++) {
                        for (var j = 0; j < visibleRects.length; ++j) {
                            var remainingRects = new Array();
                            
                            var child = parent.getChildren().at(i);
                            var childRect = new CanvasLayers.Rectangle(child.getX(), child.getY(), child.getWidth(), child.getHeight());
                            
                            if (childRect.splitIntersection(visibleRects[j], remainingRects)) {
                                visibleRects.splice(j, 1);
                                j--;
                                
                                for (var k in remainingRects) {
                                    visibleRects.unshift(remainingRects[k]);
                                    j++;
                                }
                            }
                        }
                        
                        // Stop processing if there are no more visible rects
                        if (visibleRects.length == 0) break;
                    }
                }

                if (visibleRects.length > 0) {
                    layer = parent;

                    if (parent) {
                        parent = parent.getParent();
                    }
                } else {
                    return visibleRects;
                }
	        }
	        
	        return visibleRects;
		}

		/**
		 * Closes the layer.
		 */
		close() : void {
	        if (this.parent != null) {
                this.parent.getChildren().remove(this);
	        }
		}

		/**
		 * Draws the region of the layer contained within the supplied rectangle.
		 * @param rect The region to draw.
		 */
		render(rect : Rectangle) : void {
	        if (!this.isVisible()) return;
	        
	        var context = this.getCanvas().getContext("2d");
	        
	        // Set up the clipping region
	        context.save();
	        context.beginPath();
	        context.rect(rect.x, rect.y, rect.width, rect.height);
	        context.clip();
	        
	        context.translate(this.getX(), this.getY());
	        
	        // Call user rendering code
	        if (this.onRender != null) this.onRender(this, rect, context);
	        
	        // Restore previous canvas state
	        context.closePath();
	        context.restore();
	        
	        // Enable this to draw rects around all clipping regions
	        /*
	        context.save();
	        context.beginPath();
	        context.rect(0, 0, 400, 400);
	        context.clip();
	        
	        context.strokeStyle = '#f00';
	        context.strokeRect(rect.x, rect.y, rect.width, rect.height);
	        context.closePath();
	        context.restore();
	        */
		}

		/**
		 * Check if this layer collides with the supplied layer.
		 * @param layer The layer to check for collisions.
		 * @return True if a collision has occurred.
		 */
		checkLayerCollision(layer : Layer) : bool {
	        return this.checkRectCollision(layer.getRect());
		}

		/**
		 * Check if this layer collides with the supplied rectangle.
		 * @param rect The rectangle to check for collisions.
		 * @return True if a collision has occurred.
		 */
		checkRectCollision(rect : Rectangle) : bool {
	        if (!this.isVisible()) return false;

	        var x = this.getX();
	        var y = this.getY();
	        
	        if (rect.x + rect.width <= x) return false;
	        if (rect.x >= x + this.rect.width) return false;
	        if (rect.y + rect.height <= y) return false;
	        if (rect.y >= y + this.rect.height) return false;
	        
	        return true;
		}

		/**
		 * Check if the supplied co-ordinates fall within this layer.
		 * @param x The x co-ordinate of the point.
		 * @param y The y co-ordinate of the point.
		 * @return True if the point falls within this layer.
		 */
		checkPointCollision(x : number, y : number) {
	        if (!this.isVisible()) return false;

	        var thisX = this.getX();
	        var thisY = this.getY();
	        
	        if (x < thisX) return false;
	        if (x >= thisX + this.rect.width) return false;
	        if (y < thisY) return false;
	        if (y >= thisY + this.rect.height) return false;
	        
	        return true;
		}

		/**
		 * Gets the minimum x co-ordinate available to a child layer.
		 * @return The minimum x co-ordinte available to a child layer.
		 */
		getMinChildX() : number {
	        if (this.permeable) return -Number.MAX_VALUE;
	        return 0;
		}

		/**
		 * Gets the minimum y co-ordinate available to a child layer.
		 * @return The minimum y co-ordinte available to a child layer.
		 */
		getMinChildY() : number {
	        if (this.permeable) return -Number.MAX_VALUE;
	        return 0;
		}

		/**
		 * Gets the maximum x co-ordinate available to a child layer.
		 * @return The maximum x co-ordinte available to a child layer.
		 */
		getMaxChildX() : number {
	        if (this.permeable) return Number.MAX_VALUE;
	        return this.rect.width - 1;
		}

		/**
		 * Gets the maximum y co-ordinate available to a child layer.
		 * @return The maximum y co-ordinte available to a child layer.
		 */
		getMaxChildY() : number {
	        if (this.permeable) return Number.MAX_VALUE;
	        return this.rect.height - 1;
		}

		/**
		 * Moves the layer to the specified co-ordinates.
		 * @param x The new x co-ordinate of the layer, relative to its parent.
		 * @param y The new y co-ordinate of the layer, relative to its parent.
		 */
		moveTo(x : number, y : number) {

	        // Prevent moving outside parent
	        if (this.parent != null) {
                if (!this.parent.isPermeable()) {
                    var minX = this.parent.getMinChildX();
                    var maxX = this.parent.getMaxChildX() - this.rect.width + 1;
                    var minY = this.parent.getMinChildY();
                    var maxY = this.parent.getMaxChildY() - this.rect.height + 1;
                    
                    if (x < minX) x = minX;
                    if (x > maxX) x = maxX;
                    if (y < minY) y = minY;
                    if (y > maxY) y = maxY;
                }
	        }
	        
	        // Stop if no moving occurs
	        if (this.rect.x == x && this.rect.y == y) return;
	        
	        this.hide();
	        
	        this.rect.x = x;
	        this.rect.y = y;
	                
	        this.show();
		}

		/**
		 * Resize the layer to the specified size.
		 * @param width The new width of the layer.
		 * @param height The new height of the layer.
		 */
		resize(width : number, height : number) : void {

	        // Prevent exceeding size of parent
	        if (this.parent != null) {
                if (!this.parent.isPermeable()) {
                    var maxWidth = this.parent.getMaxChildX() - this.rect.x + 1;
                    var maxHeight = this.parent.getMaxChildY() - this.rect.y + 1;
                    
                    if (width > maxWidth) width = maxWidth;
                    if (height > maxHeight) height = maxHeight;
                }
	        }
	        
	        // Stop if dimensions remain the same
	        if (this.rect.width == width && this.rect.height == height) return;
	        
	        this.hide();
	        
	        this.rect.width = width;
	        this.rect.height = height;
	        
	        this.show();
		}

		/**
		 * Hides the layer if it is visible.
		 */
		hide() : void {
	        if (this.visible) {
                this.visible = false;
                this.markRectsDamaged();
	        }
		}

		/**
		 * Shows the layer if it is hidden.
		 */
		show() : void {
	        if (!this.visible) {
                this.visible = true;
                this.markRectsDamaged();
	        }
		}

		/**
		 * Raises the layer to the top of its parent's stack.
		 */
		raiseToTop() : void {
	        if (this.parent != null) {
                this.hide();
                this.parent.raiseChildToTop(this);
                this.show();
	        }
		}

		/**
		 * Raises the child to the top of the child stack.
		 * @param child The child to raise to the top of the stack.
		 */
		raiseChildToTop(child : Layer) : void {
	        this.children.raiseToTop(child);
		}

		/**
		 * Lowers the layer to the bottom of its parent's stack.
		 */
		lowerToBottom() : void {
	        if (this.parent != null) {
                this.hide();
                this.parent.lowerChildToBottom(this);
                this.show();
	        }
		}

		/**
		 * Lowers the child to the bottom of the child stack.
		 * @param child The child to lower to the bottom of the stack.
		 */
		lowerChildToBottom(child : Layer) : void {
	        this.children.lowerToBottom(child);
		}

		/**
		 * Gets the layer at the specified co-ordinates.
		 * @param x The x co-ordinate to check.
		 * @param y The y co-ordinate to check.
		 * @return The layer at the specified co-ordinates, or null if no layer is
		 * found.
		 */
		getLayerAt(x : number, y : number) : Layer {
	        if (this.checkPointCollision(x, y)) {
                var layer = null;
                
                for (var i = 0; i < this.children.length(); ++i) {
                    layer = this.children.at(i).getLayerAt(x, y);
                    if (layer) return layer;
                }
                
                return this;
	        }
	        
	        return null;
		}

	}

}