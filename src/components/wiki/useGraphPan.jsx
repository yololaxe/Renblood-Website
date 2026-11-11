import { useCallback, useEffect, useRef, useState } from 'react';

// Cards retain native click/keyboard activation. A completed drag consumes its
// pointer-generated click, including when the gesture began on a portrait.
export default function useGraphPan({
  camera,
  setCamera,
  touchEnabled,
  onMoveStart,
  scope
}) {
  const session = useRef(null),
    frame = useRef(null),
    pending = useRef(null),
    suppressClick = useRef(false),
    latest = useRef(camera);
  const [panning, setPanning] = useState(false);
  latest.current = camera;
  const flush = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    if (pending.current) {
      latest.current = pending.current;
      setCamera(pending.current);
      pending.current = null;
    }
  }, [setCamera]);
  const cancel = useCallback(() => {
    const current = session.current;
    session.current = null;
    pending.current = null;
    suppressClick.current = false;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    if (current?.element.hasPointerCapture?.(current.id)) current.element.releasePointerCapture(current.id);
  }, []);
  useEffect(() => {
    cancel();
    setPanning(false);
    return cancel;
  }, [scope, cancel]);
  function finish(event, cancelled = false) {
    const current = session.current;
    if (!current || current.id !== event.pointerId) return;
    flush();
    suppressClick.current = current.moved || cancelled;
    session.current = null;
    setPanning(false);
    if (current.element.hasPointerCapture?.(current.id)) current.element.releasePointerCapture(current.id);
  }
  return {
    panning,
    handlers: {
      onDragStartCapture: event => event.preventDefault(),
      onClickCapture: event => {
        if (suppressClick.current && event.detail !== 0) {
          event.preventDefault();
          event.stopPropagation();
          suppressClick.current = false;
        }
      },
      onPointerDown: event => {
        if (!event.isPrimary || event.button !== 0 || session.current) return;
        suppressClick.current = false;
        if (event.pointerType === 'touch' && !touchEnabled) return;
        if (event.target.closest('a,input,textarea,select,[data-graph-control]')) return;
        const button = event.target.closest('button');
        if (button && !button.classList.contains('wiki-graph-node')) return;
        const element = button || event.currentTarget;
        session.current = {
          id: event.pointerId,
          element,
          x: event.clientX,
          y: event.clientY,
          camera: latest.current,
          moved: false
        };
        element.setPointerCapture(event.pointerId);
      },
      onPointerMove: event => {
        const current = session.current;
        if (!current || current.id !== event.pointerId) return;
        const dx = event.clientX - current.x,
          dy = event.clientY - current.y;
        if (!current.moved && Math.hypot(dx, dy) < 6) return;
        if (!current.moved) {
          current.moved = true;
          setPanning(true);
          onMoveStart();
        }
        pending.current = {
          ...current.camera,
          x: current.camera.x + dx,
          y: current.camera.y + dy
        };
        if (frame.current === null) frame.current = requestAnimationFrame(() => {
          frame.current = null;
          flush();
        });
      },
      onPointerUp: event => finish(event),
      onPointerCancel: event => finish(event, true),
      onLostPointerCapture: event => finish(event, true)
    }
  };
}
