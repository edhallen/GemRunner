import { useCallback, useRef, useEffect } from "react";

// Simulate keyboard events so @react-three/drei KeyboardControls picks them up
function simulateKey(code: string, type: "keydown" | "keyup") {
  window.dispatchEvent(new KeyboardEvent(type, { code, bubbles: true }));
}

interface ButtonConfig {
  label: string;
  code: string;
  className?: string;
}

function TouchButton({ label, code, className = "" }: ButtonConfig) {
  const pressed = useRef(false);

  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!pressed.current) {
      pressed.current = true;
      simulateKey(code, "keydown");
    }
  }, [code]);

  const handleEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (pressed.current) {
      pressed.current = false;
      simulateKey(code, "keyup");
    }
  }, [code]);

  // Release on unmount
  useEffect(() => {
    return () => {
      if (pressed.current) {
        simulateKey(code, "keyup");
      }
    };
  }, [code]);

  return (
    <button
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onContextMenu={(e) => e.preventDefault()}
      className={`select-none touch-none rounded-xl font-bold text-white shadow-lg active:scale-95 transition-transform ${className}`}
      style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none" }}
    >
      {label}
    </button>
  );
}

interface TouchControlsProps {
  mode: "platformer" | "tank";
}

export function TouchControls({ mode }: TouchControlsProps) {
  // Only show on touch devices
  const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (!isTouchDevice) return null;

  if (mode === "platformer") {
    return (
      <div className="fixed inset-0 pointer-events-none z-50" style={{ touchAction: "none" }}>
        {/* Left side - movement */}
        <div className="absolute bottom-6 left-4 flex gap-3 pointer-events-auto">
          <TouchButton
            label="◀"
            code="ArrowLeft"
            className="w-[72px] h-[72px] bg-blue-600/80 text-3xl flex items-center justify-center"
          />
          <TouchButton
            label="▶"
            code="ArrowRight"
            className="w-[72px] h-[72px] bg-blue-600/80 text-3xl flex items-center justify-center"
          />
        </div>

        {/* Right side - actions */}
        <div className="absolute bottom-6 right-4 flex gap-3 pointer-events-auto">
          <TouchButton
            label="🚀"
            code="KeyM"
            className="w-[72px] h-[72px] bg-purple-600/80 text-2xl flex items-center justify-center"
          />
          <TouchButton
            label="JUMP"
            code="Space"
            className="w-[88px] h-[72px] bg-green-600/80 text-lg flex items-center justify-center"
          />
        </div>
      </div>
    );
  }

  // Tank mode
  return (
    <div className="fixed inset-0 pointer-events-none z-50" style={{ touchAction: "none" }}>
      {/* Left side - D-pad */}
      <div className="absolute bottom-6 left-4 pointer-events-auto">
        <div className="grid grid-cols-3 gap-1" style={{ width: "210px" }}>
          <div /> {/* empty */}
          <TouchButton
            label="▲"
            code="ArrowUp"
            className="w-[66px] h-[66px] bg-blue-600/80 text-2xl flex items-center justify-center"
          />
          <div /> {/* empty */}
          <TouchButton
            label="◀"
            code="ArrowLeft"
            className="w-[66px] h-[66px] bg-blue-600/80 text-2xl flex items-center justify-center"
          />
          <div /> {/* empty center */}
          <TouchButton
            label="▶"
            code="ArrowRight"
            className="w-[66px] h-[66px] bg-blue-600/80 text-2xl flex items-center justify-center"
          />
          <div /> {/* empty */}
          <TouchButton
            label="▼"
            code="ArrowDown"
            className="w-[66px] h-[66px] bg-blue-600/80 text-2xl flex items-center justify-center"
          />
          <div /> {/* empty */}
        </div>
      </div>

      {/* Right side - fire buttons */}
      <div className="absolute bottom-6 right-4 flex gap-3 pointer-events-auto">
        <TouchButton
          label="🚀"
          code="KeyM"
          className="w-[72px] h-[72px] bg-purple-600/80 text-2xl flex items-center justify-center"
        />
        <TouchButton
          label="FIRE"
          code="Space"
          className="w-[88px] h-[72px] bg-red-600/80 text-lg flex items-center justify-center"
        />
      </div>
    </div>
  );
}
