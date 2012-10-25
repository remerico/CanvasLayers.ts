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
     * List of layers.
     * @param Layer The layer that contains the list.
     */
	export class LayerCollection {
		list : Layer[] = new Array();
		constructor(public layer : Layer) { }

		/**
		 * Add a layer to the end of the collection.
		 * @param layer The layer to add to the collection.
		 */
		add(layer : Layer) : void {
	        layer.setParent(this.layer);
	        this.list.push(layer);
	        
	        layer.markRectsDamaged();
		}

		/**
		 * Insert a layer at the start of the collection.
		 * @param layer The layer to insert into the collection.
		 */
		insert(layer : Layer) : void {
	        layer.setParent(this.layer);
	        this.list.splice(0, 0, layer);

	        layer.markRectsDamaged();       
		}

		/**
		 * Remove a layer from the collection.
		 * @param layer The layer to remove from the collection.
		 */
		remove(layer : Layer) : void {
	        var index = this.getLayerIndex(layer);
	        if (index > -1) {
	                this.list.splice(index, 1);
	        }
	        
	        layer.markRectsDamaged();
	        
	        layer.setParent(null);
		}

		/**
		 * Get the number of layers in the collection.
		 * @return The number of layers in the collection.
		 */
		length() : number { return this.list.length; }
		                
		/**
		 * Get the layer at the specified index.
		 * @return The layer at the specified index.
		 */
		at(index : number) : Layer { return this.list[index]; }
		                

		/**
		 * Raise the specified layer to the top (ie. end) of the collection.
		 * @param layer The layer to raise to the top of the collection.
		 */
		raiseToTop(layer : Layer) : void {           
	        var index = this.getLayerIndex(layer);
	        if (index > -1) {
                this.list.splice(index, 1);
                this.add(layer);
	        }
		}

		/**
		 * Lower the specified layer to the bottom (ie. start) of the collection.
		 * @param layer The layer to lower to the bottom of the collection.
		 */
		lowerToBottom(layer : Layer) : void {
	        var index = this.getLayerIndex(layer);
	        if (index > -1) {
                this.list.splice(index, 1);
                this.insert(layer)
	        }
		}
		                
		/**
		 * Locate layer in list.
		 * @param layer The layer to find.
		 * @return The index of the layer, or -1 if the layer is not found.
		 */
		getLayerIndex(layer : Layer) : any {
	        for (var i in this.list) {
                if (this.list[i] == layer) {
                    return i;
                }
	        }
	        
	        return -1;
		}

	}

}