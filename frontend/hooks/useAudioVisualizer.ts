import { useEffect, useRef } from "react";

export function useAudioVisualizer(
  analyser: AnalyserNode | null,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  isActive: boolean,
  colorScheme: "blue" | "purple" | "cyan" | "emerald" = "blue"
) {
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let bufferLength = 64;
    let dataArray = new Uint8Array(bufferLength);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (analyser && isActive) {
        bufferLength = analyser.frequencyBinCount;
        if (dataArray.length !== bufferLength) {
          dataArray = new Uint8Array(bufferLength);
        }
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Subtle ambient idle breathing wave
        const time = Date.now() * 0.003;
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = isActive 
            ? Math.floor(40 + 35 * Math.sin(time + i * 0.2)) 
            : Math.floor(10 + 8 * Math.sin(time + i * 0.15));
        }
      }

      const barWidth = (width / bufferLength) * 2.2;
      let x = 0;

      // Color scheme gradients
      let grad = ctx.createLinearGradient(0, height, 0, 0);
      if (colorScheme === "blue") {
        grad.addColorStop(0, "rgba(37, 99, 235, 0.2)");
        grad.addColorStop(0.5, "rgba(59, 130, 246, 0.8)");
        grad.addColorStop(1, "rgba(6, 182, 212, 1)");
      } else if (colorScheme === "purple") {
        grad.addColorStop(0, "rgba(124, 58, 237, 0.2)");
        grad.addColorStop(0.5, "rgba(139, 92, 246, 0.8)");
        grad.addColorStop(1, "rgba(236, 72, 153, 1)");
      } else if (colorScheme === "cyan") {
        grad.addColorStop(0, "rgba(6, 182, 212, 0.2)");
        grad.addColorStop(0.5, "rgba(34, 211, 238, 0.8)");
        grad.addColorStop(1, "rgba(59, 130, 246, 1)");
      } else {
        grad.addColorStop(0, "rgba(16, 185, 129, 0.2)");
        grad.addColorStop(0.5, "rgba(52, 211, 153, 0.8)");
        grad.addColorStop(1, "rgba(6, 182, 212, 1)");
      }

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.85;

        // Draw centered symmetric audio visualizer bar
        const yTop = (height - barHeight) / 2;
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, yTop, Math.max(2, barWidth - 2), barHeight, [4, 4, 4, 4]);
        ctx.fill();

        x += barWidth;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, isActive, colorScheme]);
}
