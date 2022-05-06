import { Point } from '../point';
import { GameState } from '../gameState';
import { CONTEXT_NAME } from '@angular/compiler/src/render3/view/util';
import { __assign } from 'tslib';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

export class BaseBrush {
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

    setColor(cssColor: string) {
        this.brushColor = cssColor;
    }

    onMouseMove(mousePos: Point) {
    }

    onMouseDown(mousePos: Point) {
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

export class SolidBrush extends BaseBrush {
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
        this.prevMousePos = new Point(this.mousePos.x, this.mousePos.y);
        this.mousePos = new Point(mousePos.x, mousePos.y);

        if (this.mouseDown) {
            this.line.push(new Point(mousePos.x, mousePos.y));
        }
    }

    onMouseDown(mousePos: Point) {
        this.mousePos = new Point(mousePos.x, mousePos.y);
        this.mouseDown = true;
        this.line = [];
        this.line.push(new Point(mousePos.x, mousePos.y));
    }

    onMouseUp() {
        if (!this.mouseDown) {
            return;
        }
        this.mouseDown = false;
        this.line = [];
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
        mctx.strokeStyle = "#000";
        mctx.arc(this.mousePos.x, this.mousePos.y, this.brushRadius, 0, Math.PI * 2, true);
        mctx.closePath();
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
            ctx.moveTo(startingPoint.x, startingPoint.y);
        }

        ctx.lineTo(this.mousePos.x, this.mousePos.y);
        ctx.stroke();
    }

    private drawBrushStroke_v2() {
        if (!this.line || this.line.length <= 0) {
            return;
        }

        const startPoint = new Point(this.line[0].x, this.line[0].y);
        const endPoint = new Point(this.line[this.line.length - 1].x, this.line[this.line.length - 1].y);

        var ctx = this.canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.lineCap = "round";
        ctx.strokeStyle = this.brushColor;
        ctx.lineWidth = this.brushRadius * 2;
        ctx.lineJoin = 'round';

        ctx.beginPath();
        console.log("moving to " + startPoint.x);
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

export class Eraser extends SolidBrush {
    constructor(canvas: HTMLCanvasElement,
        mouseCanvas: HTMLCanvasElement) {
        super(canvas, mouseCanvas);
        this.brushRadius = 15;
        this.brushColor = "#FFF";
    }

    setColor() {
        return; // Disallow setting color for eraser
    }
}
