import { Component, type ReactNode } from "react";

export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="recovery-page" role="alert">
      <h1>暂时无法显示此页面</h1>
      <p>已保存的资料仍保留在本机。可以重新加载，或返回首页继续。</p>
      <button type="button" onClick={() => window.location.reload()}>重新加载</button>
      <a href="/">返回首页</a>
    </main>;
  }
}
