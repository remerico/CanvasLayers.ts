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
     * Rectangle class.
     * @param x The x co-ordinate of the rectangle.
     * @param y The y co-ordinate of the rectangle.
     * @param width The width of the rectangle.
     * @param height The height of the rectangle.
     */
	export class Rectangle {

		constructor (
			public x : number, 
			public y : number, 
			public width : number,
			public height : number) {}

		/**
 		 * Gets the co-ordinate of the rectangle's right edge.
		 * @return The co-ordinate of the rectangle's right edge.
		 */
		getX2() : number {
	        return this.x + this.width - 1;
		}

		/**
		 * Gets the co-ordinate of the rectangle's bottom edge.
		 * @return The co-ordinate of the rectangle's bottom edge.
		 */
		getY2() : number {
	        return this.y + this.height - 1;
		}

		/**
		 * Gets the intersect of this rectangle with the supplied argument.
		 * @param rect The rectangle to intersect with this.
		 * @return A rectangle that represents the intersection of the two rectangles.
		 */
		getIntersect(rect : Rectangle) : Rectangle {
	        var x1 = this.x > rect.x ? this.x : rect.x;
	        var y1 = this.y > rect.y ? this.y : rect.y;

	        var x2 = this.getX2() < rect.getX2() ? this.getX2() : rect.getX2();
	        var y2 = this.getY2() < rect.getY2() ? this.getY2() : rect.getY2();

	        return new Rectangle(x1, y1, x2 - x1 + 1, y2 - y1 + 1);
		}

		/**
		 * Gets the smallest rectangle capable of containing this rect and the supplied
		 * argument.
		 * @param rect The rectangle to add to this.
		 * @return The smallest rectangle that can contain this rect and the argument.
		 */
		getAddition(rect : Rectangle) : Rectangle {
	        var x1 = this.x < rect.x ? this.x : rect.x;
	        var y1 = this.y < rect.y ? this.y : rect.x;

	        var x2 = this.getX2() > rect.getX2() ? this.getX2() : rect.getX2();
	        var y2 = this.getY2() > rect.getY2() ? this.getY2() : rect.getY2();

	        return new Rectangle(x1, y1, x2 - x1 + 1, y2 - y1 + 1);
		}

		/**
		 * Clips this rectangle to the intersection with the supplied argument.
		 * @param rect The rectangle to clip to.
		 */
		clipToIntersect(rect : Rectangle) : void {
	        var clipped = this.getIntersect(rect);

	        this.x = clipped.x;
	        this.y = clipped.y;
	        this.width = clipped.width;
	        this.height = clipped.height;
		}

		/**
		 * Increases the size of the rect to encompass the supplied argument.
		 * @param rect The rect to encompass.
		 */
		expandToInclude(rect : Rectangle) : void {
	        var addition = this.getAddition(rect);

	        this.x = addition.x;
	        this.y = addition.y;
	        this.width = addition.width;
	        this.height = addition.height;
		}

		/**
		 * Check if the rectangle has valid dimensions.
		 * @return True if the rectangle has valid dimensions.
		 */
		hasDimensions() : bool {
		        if (this.width < 1) return false;
		        if (this.height < 1) return false;
		        return true;
		}

		/**
		 * Check if this rectangle intersects the argument.
		 * @param rect The rect to check for an intersection.
		 * @return True if the rects intersect.
		 */
		intersects(rect : Rectangle) : bool {
        	return ((this.x + this.width > rect.x) &&
                    (this.y + this.height > rect.y) &&
                    (this.x < rect.x + rect.width) &&
                    (this.y < rect.y + rect.height));
		}

		/**
		 * Check if this rectangle contains the argument co-ordinate.
		 * @param x The x co-ordinate to check.
		 * @param y The y co-ordinate to check.
		 * @return True if this rect contains the argument co-ordinate.
		 */
		contains(x : number, y : number) : bool {
 	       return ((x >= this.x) &&
                    (y >= this.y) &&
		            (x < this.x + this.width) &&
                    (y < this.y + this.height));
		}

		/**
		 * Splits the rect argument into the area that overlaps this rect (this is
		 * the return value) and an array of areas that do not overlap (this is the
		 * remainderRects argument, which must be passed as an empty array).
		 * @param rect The rectangle to intersect with this.
		 * @param remainderRects An empty array that will be populated with the areas
		 * of the rect parameter that do not intersect with this rect.
		 * @return The intersection of this rectangle and the rect argument.
		 */
		splitIntersection(rect : Rectangle, remainderRects : Rectangle[]) : Rectangle {

			if (!this.intersects(rect)) return null;

			var intersection = new Rectangle(rect.x, rect.y, rect.width, rect.height);

			if (intersection.x < this.x) {
				var left = new Rectangle(0, 0, 0, 0);
				left.x = intersection.x;
				left.y = intersection.y;
				left.width = this.x - intersection.x;
				left.height = intersection.height;

				remainderRects.push(left);

				intersection.x = this.x;
				intersection.width -= left.width;
			}

			if (intersection.x + intersection.width > this.x + this.width) {
				var right = new Rectangle(0, 0, 0, 0);
				right.x = this.x + this.width;
				right.y = intersection.y;
				right.width = intersection.width - (this.x + this.width - intersection.x);
				right.height = intersection.height;

				remainderRects.push(right);

				intersection.width -= right.width;

			}

	        // Check for a non-overlapped rect above
	        if (intersection.y < this.y) {
	                var top = new CanvasLayers.Rectangle(0, 0, 0, 0);
	                top.x = intersection.x;
	                top.y = intersection.y;
	                top.width = intersection.width;
	                top.height = this.y - intersection.y;
	                
	                // Insert the rect
	                remainderRects.push(top);
	                
	                // Adjust the dimensions of the intersection
	                intersection.y = this.y;
	                intersection.height -= top.height;
	        }
	        
	        // Check for a non-overlapped rect below
	        if (intersection.y + intersection.height > this.y + this.height) {
	                var bottom = new CanvasLayers.Rectangle(0, 0, 0, 0);
	                bottom.x = intersection.x;
	                bottom.y = this.y + this.height;
	                bottom.width = intersection.width;
	                bottom.height = intersection.height - (this.y + this.height - intersection.y);
	                
	                // Insert the rect
	                remainderRects.push(bottom);
	                
	                // Adjust dimensions of the intersection
	                intersection.height -= bottom.height;
	        }

			return intersection;
		}

	}

}