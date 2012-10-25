declare module CanvasLayers {

	export interface Rectangle {

		x : number;
		y : number;
		width : number;
		height : number;

		constructor (x : number, 
					 y : number,
					 width : number,
					 height : number);

		getX2() : number;
		getY2() : number;
		getIntersect(rect : Rectangle) : Rectangle;
		getAddition(rect : Rectangle) : Rectangle;
		clipToIntersect(rect : Rectangle) : void;
		expandToInclude(rect : Rectangle) : void;
		hasDimensions() : bool;
		intersects(rect : Rectangle) : bool;
		contains(x : number, y : number) : bool;
		splitIntersection(rect : Rectangle, remainderRects : Rectangle[]) : Rectangle;

	}

	export interface DamagedRectManager {

		damagedRects : Rectangle[];
		layer : Layer;
		supportsTransparency : bool;

		constructor(layer : Layer, supportsTransparency : bool);

		addDamagedRect(rect : Rectangle);
		redraw();
		drawRects(layer, damagedRects);
	}

	export interface Layer {

		parent : any;
		visible : bool;
		canvas : any;
		permeable : bool;

		rect : Rectangle;
		children : LayerCollection;

		onRender : any;

		constructor(x : number, y : number, width : number, height : number);

		getX() : number;
		getY() : number;
		getRelativeX() : number;
		getRelativeY() : number;
		getParent() : Layer;
		setParent(parent : Layer) : void;
		getRect() : Rectangle;
		isPermeable() : bool;
		setPermeable(permeable : bool) : void;
		getChildren() : LayerCollection;
		getWidth() : number;
		getHeight() : number;
		getClientRect() : Rectangle;
		getRectClippedToHierarchy() : Rectangle;
		isVisible() : bool;
		getCanvas();
		getDamagedRectManager() : DamagedRectManager;
		markRectsDamaged() : void;
		markRectDamaged(rect : Rectangle) : void;
		getVisibleRects() : Rectangle[];
		close() : void;
		render(rect : Rectangle) : void;
		checkLayerCollision(layer : Layer) : bool;
		checkRectCollision(rect : Rectangle) : bool;
		checkPointCollision(x : number, y : number);
		getMinChildX() : number;
		getMinChildY() : number;
		getMaxChildX() : number;
		getMaxChildY() : number;
		moveTo(x : number, y : number);
		resize(width : number, height : number) : void;
		hide() : void;
		show() : void;
		raiseToTop() : void;
		raiseChildToTop(child : Layer) : void;
		lowerToBottom() : void;
		lowerChildToBottom(child : Layer) : void;
		getLayerAt(x : number, y : number) : Layer;

	}

	export interface LayerCollection {

		list : Layer[];

		constructor(layer : Layer);
		add(layer : Layer) : void;
		insert(layer : Layer) : void;
		remove(layer : Layer) : void;
		length() : number;
		at(index : number) : Layer;
		raiseToTop(layer : Layer) : void;
		lowerToBottom(layer : Layer) : void;
		getLayerIndex(layer : Layer) : any;

	}

	export interface Container extends Layer {

		canvas : any;
		damagedRectManager : DamagedRectManager;

		constructor (canvas : any, supportsTransparency : bool);
		getDamagedRectManager() : DamagedRectManager;
		redraw() : void;

	}

}