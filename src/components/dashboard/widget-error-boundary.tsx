"use client";

import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class WidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("[Widget Error]", error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-dashed border-gray-200 rounded-xl text-center">
          <p className="text-xs text-gray-400">Widget failed to load</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
