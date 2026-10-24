import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  input,
  signal,
} from '@angular/core';
import { FixedStepLoop } from '../../../shared/sim/fixed-step-loop';
import { ProjectileSimulation } from './projectile-simulation';

interface ProjectileViewParams {
  speed: number;
  angleDeg: number;
  gravity: number;
  showVectors: boolean;
  showTrajectory: boolean;
}

interface ProjectileStats {
  range: number;
  maxHeight: number;
  flightTime: number;
  time: number;
  speed: number;
}

@Component({
  selector: 'app-projectile-visualization',
  templateUrl: './projectile-visualization.html',
  styleUrl: './projectile-visualization.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectileVisualization implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  private canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly params = input<Record<string, unknown>>({});
  protected readonly running = signal(true);
  protected readonly stats = signal<ProjectileStats>({
    range: 0,
    maxHeight: 0,
    flightTime: 0,
    time: 0,
    speed: 0,
  });

  private simulation?: ProjectileSimulation;
  private loop?: FixedStepLoop;
  private context?: CanvasRenderingContext2D;
  private resizeObserver?: ResizeObserver;
  private viewParams: ProjectileViewParams = {
    speed: 30,
    angleDeg: 45,
    gravity: 9.8,
    showVectors: true,
    showTrajectory: true,
  };
  private readonly reducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor() {
    effect(() => {
      this.viewParams = this.readParams();
      if (this.simulation) {
        this.resetSimulation();
      }
    });
  }

  ngAfterViewInit(): void {
    this.context = this.canvasRef.nativeElement.getContext('2d') ?? undefined;
    this.prepareCanvas();
    this.resetSimulation();

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.prepareCanvas();
        this.draw();
      });
      this.resizeObserver.observe(this.canvasRef.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.loop?.stop();
    this.resizeObserver?.disconnect();
  }

  protected toggleRunning(): void {
    if (this.running()) {
      this.loop?.stop();
      this.running.set(false);
      return;
    }
    if (this.simulation?.state.finished) {
      this.resetSimulation();
      return;
    }
    this.loop?.start();
    this.running.set(true);
  }

  protected reset(): void {
    this.resetSimulation();
  }

  protected currentStats(): ProjectileStats {
    return this.stats();
  }

  private resetSimulation(): void {
    this.simulation = new ProjectileSimulation({
      speed: this.viewParams.speed,
      angleDeg: this.viewParams.angleDeg,
      gravity: this.viewParams.gravity,
    });

    this.loop?.stop();
    this.loop = new FixedStepLoop(
      1 / 120,
      (dt) => this.stepSimulation(dt),
      () => this.draw(),
    );

    this.updateStats();
    if (this.reducedMotion) {
      for (let index = 0; index < 20_000 && !this.simulation.state.finished; index += 1) {
        this.simulation.step(1 / 120);
      }
      this.running.set(false);
      this.updateStats();
      this.draw();
      return;
    }

    this.loop.start();
    this.running.set(true);
  }

  private stepSimulation(dt: number): void {
    if (!this.simulation) {
      return;
    }
    this.simulation.step(dt);
    this.updateStats();
    if (this.simulation.state.finished) {
      this.loop?.stop();
      this.running.set(false);
    }
  }

  private updateStats(): void {
    if (!this.simulation) {
      return;
    }
    const state = this.simulation.state;
    this.stats.set({
      range: this.simulation.range,
      maxHeight: this.simulation.maxHeight,
      flightTime: this.simulation.flightTime,
      time: state.t,
      speed: Math.hypot(state.vx, state.vy),
    });
  }

  private prepareCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(canvas.clientWidth, 320);
    const height = Math.max(canvas.clientHeight, 320);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    this.context = canvas.getContext('2d') ?? undefined;
    this.context?.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.draw();
  }

  private draw(): void {
    const context = this.context;
    const canvas = this.canvasRef?.nativeElement;
    const simulation = this.simulation;
    if (!context || !canvas || !simulation) {
      return;
    }

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#10251f';
    context.fillRect(0, 0, width, height);

    const marginLeft = 56;
    const marginBottom = 42;
    const marginTop = 24;
    const marginRight = 24;
    const worldWidth = Math.max(simulation.range, 1);
    const worldHeight = Math.max(simulation.maxHeight, 1);
    const scale = Math.min(
      (width - marginLeft - marginRight) / worldWidth,
      (height - marginTop - marginBottom) / worldHeight,
    );
    const originX = marginLeft;
    const originY = height - marginBottom;
    const toX = (x: number) => originX + x * scale;
    const toY = (y: number) => originY - y * scale;

    context.strokeStyle = 'rgba(159, 227, 194, 0.12)';
    context.lineWidth = 1;
    for (let value = 0; value <= worldWidth; value += Math.max(worldWidth / 8, 1)) {
      context.beginPath();
      context.moveTo(toX(value), marginTop);
      context.lineTo(toX(value), originY);
      context.stroke();
    }
    for (let value = 0; value <= worldHeight; value += Math.max(worldHeight / 5, 1)) {
      context.beginPath();
      context.moveTo(originX, toY(value));
      context.lineTo(width - marginRight, toY(value));
      context.stroke();
    }

    context.strokeStyle = '#9fe3c2';
    context.lineWidth = 1.4;
    context.beginPath();
    context.moveTo(originX, marginTop);
    context.lineTo(originX, originY);
    context.lineTo(width - marginRight, originY);
    context.stroke();

    context.fillStyle = '#b9d1c2';
    context.font = '11px system-ui, sans-serif';
    context.fillText('x (m)', width - marginRight - 30, originY + 20);
    context.fillText('y (m)', originX - 36, marginTop + 10);

    if (this.viewParams.showTrajectory) {
      context.strokeStyle = '#d9a441';
      context.lineWidth = 2.2;
      context.beginPath();
      simulation.trajectory.forEach((point, index) => {
        const x = toX(point.x);
        const y = toY(point.y);
        if (index === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      });
      context.stroke();
    }

    const state = simulation.state;
    const currentX = toX(state.x);
    const currentY = toY(state.y);
    context.fillStyle = '#edf6f0';
    context.beginPath();
    context.arc(currentX, currentY, 6, 0, Math.PI * 2);
    context.fill();

    if (this.viewParams.showVectors) {
      const vectorScale = 5;
      this.drawVector(context, currentX, currentY, state.vx * vectorScale, -state.vy * vectorScale, '#9fe3c2');
      this.drawVector(context, currentX, currentY, state.vx * vectorScale, 0, '#7fb7c9');
      this.drawVector(context, currentX, currentY, 0, -state.vy * vectorScale, '#d97757');
    }

    context.fillStyle = '#b9d1c2';
    context.font = '11px system-ui, sans-serif';
    context.fillText(`alcance ${simulation.range.toFixed(1)} m`, originX, height - 10);
    context.fillText(`altura máx. ${simulation.maxHeight.toFixed(1)} m`, originX + 150, height - 10);
  }

  private drawVector(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    dx: number,
    dy: number,
    color: string,
  ): void {
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = 1.5;
    const endX = x + dx;
    const endY = y - dy;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(endX, endY);
    context.stroke();
    const angle = Math.atan2(endY - y, endX - x);
    context.beginPath();
    context.moveTo(endX, endY);
    context.lineTo(endX - 6 * Math.cos(angle - 0.4), endY - 6 * Math.sin(angle - 0.4));
    context.lineTo(endX - 6 * Math.cos(angle + 0.4), endY - 6 * Math.sin(angle + 0.4));
    context.closePath();
    context.fill();
  }

  private readParams(): ProjectileViewParams {
    const value = this.params();
    return {
      speed: this.numberParam(value['velocidade'], 30, 10, 80),
      angleDeg: this.numberParam(value['angulo'], 45, 5, 85),
      gravity: this.numberParam(value['gravidade'], 9.8, 1.6, 20),
      showVectors: value['mostrarVetores'] !== false,
      showTrajectory: value['mostrarTrajetoria'] !== false,
    };
  }

  private numberParam(value: unknown, fallback: number, min: number, max: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.min(Math.max(parsed, min), max) : fallback;
  }
}
