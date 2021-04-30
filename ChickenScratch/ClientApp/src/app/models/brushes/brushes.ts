import { Point } from '../point';
import { GameState } from '../gameState';
import { CONTEXT_NAME } from '@angular/compiler/src/render3/view/util';

export class Brush {
    canvas: HTMLCanvasElement;
    mouseCanvas: HTMLCanvasElement;
    mouseDown: boolean;
    brushRadius: number;
    brushColor: string;
    drawingEnabled = true;

    constructor(canvas: HTMLCanvasElement,
        mouseCanvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.mouseCanvas = mouseCanvas;
    }

    onMouseMove(mousePos: Point) {
    }

    onMouseDown() {
    }

    onMouseUp() {
    }

    onMouseOut() {
        this.clearMouseCanvas();
    }

    clearMouseCanvas() {
        var mctx = this.mouseCanvas.getContext("2d");
        mctx.clearRect(0, 0, this.mouseCanvas.width, this.mouseCanvas.height);
    }
}

export class BlackBrush extends Brush {
    mousePos: Point;
    prevMousePos: Point;
    line: Point[];

    constructor(canvas: HTMLCanvasElement,
        mouseCanvas: HTMLCanvasElement) {
        super(canvas, mouseCanvas);
        this.brushRadius = 5;
        this.brushColor = "#000";
        this.line = [];
        this.mousePos = new Point(-10, -10);
        this.prevMousePos = new Point(-10, -10);

        window.requestAnimationFrame(this.drawLoop.bind(this));
    }

    onMouseMove(mousePos: Point) {
        this.prevMousePos = this.mousePos;
        this.mousePos = mousePos;

        if (this.mouseDown) {
            this.line.push(new Point(mousePos.x, mousePos.y));
        }

        // if (this.mouseDown) {
        //     this.drawBrushStroke();
        // }
    }

    onMouseDown() {
        // var ctx = this.canvas.getContext("2d");
        // ctx.moveTo(this.mousePos.x, this.mousePos.y);
        // ctx.beginPath();
        this.mouseDown = true;
        this.line = [];
        this.line.push(new Point(this.mousePos.x, this.mousePos.y));
    }

    onMouseUp() {
        if (!this.mouseDown) {
            return;
        }
        this.mouseDown = false;
        this.line = [];
        //this.drawBrushStroke(this.mousePos);
    }

    onMouseOut() {
        this.onMouseUp();
    }

    private drawLoop() {
        if (this.drawingEnabled) {
            this.drawBrushCursor();
            this.drawBrushStroke_v2();
        }

        window.requestAnimationFrame(this.drawLoop.bind(this));
    }

    private drawBrushCursor() {
        var mctx = this.mouseCanvas.getContext("2d");
        mctx.clearRect(0, 0, this.mouseCanvas.width, this.mouseCanvas.height);
        mctx.beginPath();
        mctx.fillStyle = this.brushColor;
        mctx.arc(this.mousePos.x, this.mousePos.y, this.brushRadius, 0, Math.PI * 2, true);
        mctx.closePath();
        mctx.fill();
    }

    private drawBrushStroke(startingPoint?: Point) {
        var ctx = this.canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.lineCap = "round";
        ctx.strokeStyle = this.brushColor;
        ctx.lineWidth = this.brushRadius * 2;
        ctx.lineJoin = 'round';

        if (!!startingPoint) {
            ctx.moveTo(startingPoint.x, startingPoint.y);
        }

        ctx.lineTo(this.mousePos.x, this.mousePos.y);
        ctx.stroke();
    }

    private drawBrushStroke_v2() {
        if (!this.line || this.line.length <= 0) {
            return;
        }

        var startPoint = this.line[0];
        var endPoint = this.line[this.line.length - 1];

        var ctx = this.canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.lineCap = "round";
        ctx.strokeStyle = this.brushColor;
        ctx.lineWidth = this.brushRadius * 2;
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        for (var i = 1; i < this.line.length - 2; i++) {
            var point = this.line[i];
            ctx.lineTo(point.x, point.y);
        }
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
        this.line = [endPoint];
    }
}

export class Eraser extends Brush {
    mousePos: Point;
    prevMousePos: Point;

    constructor(canvas: HTMLCanvasElement,
        mouseCanvas: HTMLCanvasElement) {
        super(canvas, mouseCanvas);
        this.brushRadius = 10;
        this.brushColor = "#FFF";
    }

    onMouseMove(mousePos: Point) {
        this.prevMousePos = this.mousePos;
        this.mousePos = mousePos;

        this.drawBrushCursor();

        if (this.mouseDown) {
            this.drawBrushStroke();
        }
    }

    onMouseDown() {
        var ctx = this.canvas.getContext("2d");
        ctx.moveTo(this.mousePos.x, this.mousePos.y);
        ctx.beginPath();

        this.mouseDown = true;
    }

    onMouseUp() {
        this.mouseDown = false;
        this.drawBrushStroke(this.mousePos);
    }

    private drawBrushCursor() {
        var mctx = this.mouseCanvas.getContext("2d");
        mctx.clearRect(0, 0, this.mouseCanvas.width, this.mouseCanvas.height);
        mctx.beginPath();

        // /* White Outline */
        // mctx.strokeStyle = this.brushColor
        // mctx.lineWidth = 2;
        // mctx.arc(this.mousePos.x, this.mousePos.y, this.brushRadius + 1, 0, Math.PI * 2, true);
        // mctx.stroke();

        /* Black InnerOutline */
        mctx.fillStyle = this.brushColor;
        mctx.strokeStyle = "#000";
        mctx.lineWidth = 1;
        mctx.arc(this.mousePos.x, this.mousePos.y, this.brushRadius, 0, Math.PI * 2, true);
        mctx.fill();
        mctx.stroke();
    }

    private drawBrushStroke(startingPoint?: Point) {
        var ctx = this.canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.lineCap = "round";
        ctx.strokeStyle = this.brushColor;
        ctx.lineWidth = this.brushRadius * 2;
        ctx.lineJoin = 'round';

        if (!!startingPoint) {
            ctx.moveTo(this.prevMousePos.x, this.prevMousePos.y);
        }

        ctx.lineTo(this.mousePos.x, this.mousePos.y);
        ctx.stroke();
    }
}
