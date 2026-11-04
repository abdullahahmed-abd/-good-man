import React, { useState, useEffect, useRef } from 'react';
import Modal from '../../components/common/Modal';
import pedometerEngine from '../../services/pedometer/pedometerEngine';
import { Activity, Gauge, Zap, Car, CheckCircle2 } from 'lucide-react';

export default function DiagnosticsModal({ isOpen, onClose }) {
  const canvasRef = useRef(null);
  const [diagData, setDiagData] = useState({
    rawMag: 9.8,
    filteredMag: 9.8,
    dynamicThreshold: 10.5,
    currentState: 'STILL',
    speedKmh: 0,
    stepCount: 0
  });

  const bufferRef = useRef([]);

  useEffect(() => {
    if (!isOpen) return;

    const unsub = pedometerEngine.subscribeDiagnostics((data) => {
      setDiagData(data);
      bufferRef.current.push({
        raw: data.rawMag,
        filtered: data.filteredMag,
        thresh: data.dynamicThreshold
      });
      if (bufferRef.current.length > 100) {
        bufferRef.current.shift();
      }
      drawCanvas();
    });

    return () => unsub();
  }, [isOpen]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Baseline gravity grid line at 9.8 m/s²
    const midY = height * 0.6;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();

    const data = bufferRef.current;
    if (data.length < 2) return;

    const stepX = width / 100;

    // Draw Dynamic Threshold Line (Amber)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = i * stepX;
      const y = midY - (data[i].thresh - 9.8) * 12;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Filtered Magnitude (Emerald Glow)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = i * stepX;
      const y = midY - (data[i].filtered - 9.8) * 12;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Live Sensor Diagnostics & Oscilloscope"
      icon="⚡"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4 text-slate-200">
        {/* Live Oscilloscope Graph */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Live Accelerometer Waveform
            </span>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Filtered Mag
              </span>
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Adaptive Thresh
              </span>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={450}
            height={160}
            className="w-full h-36 bg-slate-950 rounded-xl border border-white/5"
          />
        </div>

        {/* Real-time Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Motion State</span>
            <p className="text-sm font-black text-white mt-0.5">{diagData.currentState}</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Raw Accel</span>
            <p className="text-sm font-black text-emerald-400 mt-0.5">{diagData.rawMag} m/s²</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">GPS Speed</span>
            <p className="text-sm font-black text-blue-400 mt-0.5">{diagData.speedKmh} km/h</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Step Buffer</span>
            <p className="text-sm font-black text-amber-400 mt-0.5">{pedometerEngine.bufferedSteps}/4</p>
          </div>
        </div>

        {/* Vehicle Rejection Info */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center space-x-2 text-rose-400 font-bold uppercase text-[10px]">
            <Car className="w-3.5 h-3.5" />
            <span>Active Vehicle Rejection Logic</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Steps are automatically suspended when GPS speed exceeds 7 km/h without rhythmic human gait periodicity, or when speed exceeds 25 km/h. Traffic light stops are debounced for 10-15s to prevent false step burst accumulation.
          </p>
        </div>
      </div>
    </Modal>
  );
}

