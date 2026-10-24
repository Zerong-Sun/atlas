// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useNavigate, useLocation, type NavigateFunction } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Page } from "./Page";
let root: Root; let host: HTMLDivElement; let navigate: NavigateFunction;
let resize: () => void; let height = 3000;
function Scene() {
  navigate = useNavigate(); const { pathname } = useLocation();
  return <Page key={pathname}><h1>{pathname === "/a" ? "页面甲" : "页面乙"}</h1></Page>;
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("ResizeObserver", class { constructor(callback: () => void) { resize = callback; } observe() {} disconnect() {} });
  height = 3000;
  Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, get: () => height });
  Object.defineProperty(window, "scrollY", { configurable: true, writable: true, value: 0 });
  window.scrollTo = vi.fn((options?: ScrollToOptions | number) => { if (typeof options === "object") window.scrollY = Math.max(0, Math.min(options.top ?? 0, height - window.innerHeight)); });
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); });
it("restores POP position after async content grows and focuses the route without resetting that position", async () => {
  await act(async () => root.render(<MemoryRouter initialEntries={[{ pathname: "/a", key: "scroll-test" }]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Scene /></MemoryRouter>));
  window.scrollY = 1200; window.dispatchEvent(new Event("scroll"));
  // Simulate React removing old content BEFORE layout cleanup (scroll gets clamped).
  height = 800; window.scrollY = 0;
  await act(async () => navigate("/b"));
  expect(window.scrollY).toBe(0); expect(document.title).toBe("页面乙 · 诸象 Atlas");
  await act(async () => navigate(-1));
  expect(window.scrollY).toBeLessThan(1200);
  height = 3000; resize();
  expect(window.scrollY).toBe(1200); expect(document.activeElement?.id).toBe("main-content");
});
it("updates a delayed heading without moving focus or scrolling again", async () => {
  await act(async () => root.render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Page><div /></Page></MemoryRouter>));
  vi.mocked(window.scrollTo).mockClear();
  const heading = document.createElement("h2"); heading.textContent = "异步报告";
  host.querySelector("main")!.append(heading);
  await act(async () => { await Promise.resolve(); });
  expect(document.title).toBe("异步报告 · 诸象 Atlas"); expect(window.scrollTo).not.toHaveBeenCalled();
});
