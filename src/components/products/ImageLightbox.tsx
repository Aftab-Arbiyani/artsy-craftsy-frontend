"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

export default function ImageLightbox({
  isOpen,
  onClose,
  src,
  alt,
}: ImageLightboxProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, src]);

  const clampPosition = useCallback(
    (x: number, y: number, currentZoom: number) => {
      if (currentZoom <= 1) return { x: 0, y: 0 };
      const container = containerRef.current;
      if (!container) return { x, y };
      const maxX = (container.clientWidth * (currentZoom - 1)) / 2;
      const maxY = (container.clientHeight * (currentZoom - 1)) / 2;
      return {
        x: Math.max(-maxX, Math.min(maxX, x)),
        y: Math.max(-maxY, Math.min(maxY, y)),
      };
    },
    [],
  );

  const applyZoom = useCallback(
    (newZoom: number) => {
      const clamped = newZoom <= 1 ? { x: 0, y: 0 } : clampPosition(position.x, position.y, newZoom);
      setPosition(clamped);
      setZoom(newZoom);
    },
    [position, clampPosition],
  );

  const handleZoomIn = () => applyZoom(Math.min(zoom + ZOOM_STEP, MAX_ZOOM));
  const handleZoomOut = () => applyZoom(Math.max(zoom - ZOOM_STEP, MIN_ZOOM));
  const handleReset = () => { setZoom(1); setPosition({ x: 0, y: 0 }); };

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));
      const clamped = newZoom <= 1 ? { x: 0, y: 0 } : clampPosition(position.x, position.y, newZoom);
      setPosition(clamped);
      setZoom(newZoom);
    },
    [zoom, position, clampPosition],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return;
      e.preventDefault();
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        posX: position.x,
        posY: position.y,
      };
    },
    [zoom, position],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const newX = dragStart.current.posX + dx;
      const newY = dragStart.current.posY + dy;
      setPosition(clampPosition(newX, newY, zoom));
    },
    [isDragging, zoom, clampPosition],
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex flex-col items-center justify-center outline-none"
          onEscapeKeyDown={onClose}
        >
          <DialogPrimitive.Title className="sr-only">{alt}</DialogPrimitive.Title>

          {/* Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <span className="text-white text-sm bg-black/50 px-2 py-1 rounded-md select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomOut}
              disabled={zoom <= MIN_ZOOM}
              className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= MAX_ZOOM}
              className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button
              onClick={handleReset}
              disabled={zoom === 1}
              className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Reset zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              aria-label="Close lightbox"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Image container */}
          <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center overflow-hidden"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              cursor:
                zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="max-h-[90vh] max-w-[90vw] object-contain select-none"
              draggable={false}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transition: isDragging ? "none" : "transform 0.2s ease",
              }}
            />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
