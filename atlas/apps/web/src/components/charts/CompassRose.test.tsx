// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CompassRose } from "./CompassRose";

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  Object.defineProperty(window, "isSecureContext", { configurable: true, value: true });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it("ignores a permission response after measurement was stopped", async () => {
  let grant!: (value: string) => void;
  const permission = new Promise<string>((resolve) => { grant = resolve; });
  vi.stubGlobal("DeviceOrientationEvent", class extends Event {
    static requestPermission = () => permission;
  });
  const onDegreeChange = vi.fn();
  await act(async () => root.render(<CompassRose degree={0} onDegreeChange={onDegreeChange} />));
  await act(async () => host.querySelector<HTMLButtonElement>(".luopan > button")!.click());
  expect(host.textContent).toContain("正在请求方向权限");
  await act(async () => host.querySelector<HTMLButtonElement>(".luopan > button")!.click());
  await act(async () => { grant("granted"); await permission; });
  window.dispatchEvent(new Event("deviceorientationabsolute"));
  expect(onDegreeChange).not.toHaveBeenCalled();
  expect(host.textContent).toContain("已停止测量");
});

it("returns to manual entry when the browser provides no absolute heading", async () => {
  vi.useFakeTimers();
  vi.stubGlobal("DeviceOrientationEvent", class extends Event {});
  await act(async () => root.render(<CompassRose degree={0} onDegreeChange={vi.fn()} />));
  await act(async () => host.querySelector<HTMLButtonElement>(".luopan > button")!.click());
  expect(host.textContent).toContain("等待方向传感器");
  await act(async () => vi.advanceTimersByTime(8000));
  expect(host.textContent).toContain("未收到有效的绝对方位");
  expect(host.querySelector<HTMLButtonElement>(".luopan > button")?.textContent).toBe("用手机测朝向");
});
