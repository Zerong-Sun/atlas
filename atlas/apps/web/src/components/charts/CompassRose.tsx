import { useEffect, useRef, useState } from "react";
import { absoluteHeading, bearingDetails, bearingFromPoint, luopanSvg, normalizeBearing, sittingFromFacing } from "@atlas/method-core";
import "./compass.css";

interface CompassRoseProps {
  degree: number;
  onDegreeChange?: (degree: number) => void;
  size?: number;
}

const MANUAL_STATUS = "手动定向：点击盘面、拖动指针，或输入坐向。";

export function CompassRose({ degree, onDegreeChange, size = 380 }: CompassRoseProps) {
  const details = bearingDetails(degree);
  const [status, setStatus] = useState(MANUAL_STATUS);
  const [measuring, setMeasuring] = useState(false);
  const cleanup = useRef<() => void>(() => {});
  const requestId = useRef(0);
  const mounted = useRef(true);
  const onChange = useRef(onDegreeChange);
  onChange.current = onDegreeChange;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      requestId.current += 1;
      cleanup.current();
    };
  }, []);

  const stop = () => {
    requestId.current += 1;
    cleanup.current();
    cleanup.current = () => {};
    setMeasuring(false);
    setStatus("已停止测量，保留最后一次读数。");
  };

  const measure = async () => {
    const currentRequest = ++requestId.current;
    cleanup.current();
    cleanup.current = () => {};
    if (!window.isSecureContext || typeof DeviceOrientationEvent === "undefined") {
      setStatus("此设备无法提供磁北方向。请用实体指南针读数，再输入坐向；桌面拖动不是实测。");
      return;
    }

    setMeasuring(true);
    setStatus("正在请求方向权限…");
    const orientationApi = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: (absolute?: boolean) => Promise<string>;
    };

    try {
      if (orientationApi.requestPermission && await orientationApi.requestPermission(true) !== "granted") {
        if (mounted.current && currentRequest === requestId.current) {
          setMeasuring(false);
          setStatus("方向权限未获准，可继续手动输入。");
        }
        return;
      }
      if (!mounted.current || currentRequest !== requestId.current) return;

      let timer: ReturnType<typeof setTimeout>;
      let receivedHeading = false;
      const close = () => {
        clearTimeout(timer);
        window.removeEventListener("deviceorientation", listener);
        window.removeEventListener("deviceorientationabsolute", listener);
      };
      const scheduleTimeout = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          close();
          if (!mounted.current || currentRequest !== requestId.current) return;
          cleanup.current = () => {};
          setMeasuring(false);
          setStatus(receivedHeading
            ? "方向传感器已停止更新。保留最后一次读数；请复测或手动输入。"
            : "未收到有效的绝对方位。保持手机平放，或使用实体指南针读数手动输入。");
        }, 8000);
      };
      const listener = (event: DeviceOrientationEvent) => {
        const heading = absoluteHeading(event);
        if (heading === null) return;
        receivedHeading = true;
        scheduleTimeout();
        setStatus("设备实测朝向已换算为坐向（朝向 + 180°）。请平放手机，顶部指向房屋朝向；远离金属后复测。");
        onChange.current?.(sittingFromFacing(heading));
      };
      cleanup.current = close;
      window.addEventListener("deviceorientation", listener);
      window.addEventListener("deviceorientationabsolute", listener);
      scheduleTimeout();
      setStatus("等待方向传感器：平放手机，顶部指向朝向。");
    } catch {
      if (!mounted.current || currentRequest !== requestId.current) return;
      setMeasuring(false);
      setStatus("无法读取方向传感器，请使用手动输入。");
    }
  };

  const pick = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width * 400 - 200;
    const y = (event.clientY - bounds.top) / bounds.height * 400 - 200;
    if (Math.hypot(x, y) < 25) return;
    onDegreeChange?.(Math.round(bearingFromPoint(x, y)));
  };

  return <section className="luopan" style={{ maxWidth: size + 40 }} aria-label="二十四山方位罗盘">
    <div className="luopan__face" onPointerDown={(event) => {
      if (measuring) stop();
      event.currentTarget.setPointerCapture(event.pointerId);
      pick(event);
    }} onPointerMove={(event) => { if (event.buttons === 1) pick(event); }}>
      <img src={`data:image/svg+xml,${encodeURIComponent(luopanSvg(degree))}`} alt={`罗盘坐向${details.degree}度，${details.direction}，${details.mountain}山`} draggable={false} />
    </div>
    <p><strong>坐 {details.degree.toFixed(0)}° · {details.direction} · {details.mountain}山</strong><br />向 {details.facing.toFixed(0)}° · {bearingDetails(details.facing).mountain}山</p>
    {onDegreeChange && <>
      <label>坐向角度（从北顺时针）<input aria-label="坐向角度" type="range" min="0" max="359" value={Math.round(details.degree)} onChange={(event) => {
        if (measuring) stop();
        onDegreeChange(Number(event.target.value));
      }} /></label>
      <label>输入坐向度数<input type="number" min="0" max="359" step="1" value={Math.round(details.degree)} onChange={(event) => {
        const next = Number(event.target.value);
        if (!event.target.value || !Number.isFinite(next)) return;
        if (measuring) stop();
        onDegreeChange(normalizeBearing(next));
      }} /></label>
      <div className="luopan__buttons">{[0, 90, 180, 270].map((value, index) => <button type="button" key={value} onClick={() => {
        if (measuring) stop();
        onDegreeChange(value);
      }}>{["北", "东", "南", "西"][index]} {value}°</button>)}</div>
      <button type="button" onClick={() => measuring ? stop() : void measure()}>{measuring ? "停止设备测量" : "用手机测朝向"}</button>
    </>}
    <small role="status">{status}</small>
    <p className="luopan__lesson">先确定房屋朝外的一面，站稳并让指南针水平。例：朝向正东 90°，相反的坐向就是 270°，应填“坐 270°”，而不是 90°。盘面红针表示你选定的坐向；每格 15°，临近分界时应多测几次。</p>
  </section>;
}
