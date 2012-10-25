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
     * Manages the list of damaged rectangles.
     * @param Layer This should always be the top-level layer.
     * @param supportsTransparency Should be true if the layers will display
     * non-rectangular content or if the canvas tag's transparency capabilities
     * will be used to allow layers to be translucent.  This has a potential
     * performance penalty so should only be used if necessary.
     */
	export class DamagedRectManager {
		damagedRects : Rectangle[] = new Array();
		constructor(public layer : Layer, public supportsTransparency : bool) {}


        /**
         * Add a damaged rect to the list.  The method automatically clips and splits
         * the rect to ensure that only new regions are added to the list.
         * @param rect The rect to add to the list.
         */
		addDamagedRect(rect : Rectangle) {

			var newRects : Rectangle[] = new Array();
			var remainingRects : Rectangle[] = new Array();

			newRects.push(rect);

	        // Ensure that the new rect does not overlap any existing rects - we only
	        // want to draw each region once
			for (var i = 0; i < this.damagedRects.length; ++i) {
				for (var j = 0; j < newRects.length; ++j) {

					var intersection = this.damagedRects[i].splitIntersection(newRects[j], remainingRects);

                    if (intersection) {
                
                        // Intersection contains the part of the new rect that is
                        // already known to be damaged and can be discarded.
                        // remainingRects contains the rects that still need to be
                        // examined
                        newRects.splice(j, 1);
                        j--;

                        // Insert non-overlapping rects to the front of the array so
                        // that they are not examined again for this particular damaged
                        // rect
                        for (var k = 0; k < remainingRects.length; ++k) {
                                newRects.unshift(remainingRects[k]);
                                j++;
                        }

                        remainingRects = new Array();
                    }

				}
			}

			// Add any non-overlapping rects into the damaged rect array
	        for (var i = 0; i < newRects.length; ++i) {
	                this.damagedRects.push(newRects[i]);
	        }

		}


        /**
         * Redraws all damaged rects.
         */
		redraw() {
	        this.drawRects(this.layer, this.damagedRects);
	        this.damagedRects = new Array();
		}


        /**
         * Redraws the specified list of damaged rects for the specified layer.  The
         * function will recursively call itself in order to draw the layer and its
         * children in such a way as to minimise redrawing.  The algorithm looks like
         * this for layer systems that do not support transparency:
         * - Work out which parts of the damagedRects array intersect the current
         *   layer and remove them from the damagedRects array.
         * - Recursively call the method for each of the layer's children, sending the
         *   intersecting regions as a new array.
         * - Receive back from children any undrawn areas in the new array.
         * - Redraw all remaining rects in the new array.
         * For layer systems that support transparency, the algorithm is slightly
         * different:
         * - Work out which parts of the damagedRects array intersect the current
         *   layer.
         * - Draw the intersecting parts of the current layer.
         * - Recursively call the method for each of the layer's children, sending the
         *   intersecting regions as a new array.
         * The first version of the algorithm is therefore more efficient - each damaged
         * rect is only drawn once.  In the second version, each damaged rect is drawn
         * by each intersecting layer, from front to back.  We're basically using the
         * painter algorithm to redraw a small subsection of the layer system.  This
         * potentially means that a lot of redundant drawing is performed, but it is the
         * only way to support transparency.
         * @param Layer The layer to redraw.
         * @param damagedRects An array of rectangles that must be redrawn.
         */
		drawRects(layer, damagedRects) {

	        if (!layer.isVisible()) return;
	        if (damagedRects.length == 0) return;

	        var layerRect = layer.getRectClippedToHierarchy();
		        
	        var remainingRects = new Array();
	        var subRects = new Array();
		        
	        // Work out which of the damaged rects collide with the current layer
	        for (var i = 0; i < damagedRects.length; ++i) {
                var damagedRect = damagedRects[i];
		                
                // Work out which part of the damaged rect intersects the current layer
                var intersection = layerRect.splitIntersection(damagedRect, remainingRects);
		                
                if (intersection) {
                    damagedRects.splice(i, 1);
                    i--;
		                        
                    // Add the non-intersecting parts of the damaged rect back into the
                    // list of undrawn rects
                    for (var j = 0; j < remainingRects.length; ++j) {
                        damagedRects.unshift(remainingRects[j]);
                        i++;
                    }
		                        
                    remainingRects = new Array();
		                        
                    subRects.push(intersection);
		                        
                    // Push the intersection back into the damaged rects array if the
	                // rect manager supports transparency.  This ensures that all
                    // layers that collide with this intersection draw themselves.
                    if (this.supportsTransparency) {
                        damagedRects.unshift(intersection);
                        i++;
		                                
                        // Render the intersection
                        layer.render(intersection);
                        
                        // Get children to draw all parts of themselves that intersect
                        // the intersection we've found.
                        for (var j = 0; j < layer.getChildren().length(); ++j) {
                                this.drawRects(layer.getChildren().at(j), subRects);
                                
                                // Abort if all rects have been drawn
                                if (subRects.length == 0) break;
                        }
                        
                    } else {
                    
                            // Get children to draw all parts of themselves that intersect
                            // the intersection we've found.
                            for (var j = layer.getChildren().length() - 1; j >= 0; --j) {
                                    this.drawRects(layer.getChildren().at(j), subRects);
                                    
                                    // Abort if all rects have been drawn
                                    if (subRects.length == 0) break;
                            }
                    
                            // Children have drawn themselves; anything left in the subRects
                            // array must overlap this layer
                            for (var j = 0; j < subRects.length; ++j) {
                                    layer.render(subRects[j]);
                            }
                    }
                    
                    subRects = new Array();
                }
	        }
		}

	}

}