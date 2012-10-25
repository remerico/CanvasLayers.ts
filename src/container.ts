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
     * Top-level layer that contains the rest of the structure.  An instance of
     * this should be created in order to create a layer system.
     * @param canvas The canvas on which the system will be displayed.
     * @param supportsTransparency Should be true if the layers will display
     * non-rectangular content or if the canvas tag's transparency capabilities
     * will be used to allow layers to be translucent.  This has a potential
     * performance penalty so should only be used if necessary.
     */
	export class Container extends Layer {

		canvas : any;
		damagedRectManager : DamagedRectManager;

		constructor (canvas : any, supportsTransparency : bool) {
			super(0, 0, canvas.width, canvas.height);
			this.canvas = canvas;
			this.damagedRectManager = new CanvasLayers.DamagedRectManager(this, supportsTransparency);
			this.damagedRectManager.addDamagedRect(this.rect);
		}

		/**
		 * Gets the damaged rectangle manager.
		 * @return The damaged rectangle manager.
		 */
		getDamagedRectManager() : DamagedRectManager {
	        return this.damagedRectManager;
		}

		/**
		 * Redraws the system.
		 */
		redraw() : void {
	        this.damagedRectManager.redraw();
		}

	}

}