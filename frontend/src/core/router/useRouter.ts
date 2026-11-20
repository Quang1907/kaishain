import { useState, useEffect, useCallback } from "react";

/**
 * Lightweight Zero-Dependency HTML5 History API Client Router
 * Hỗ trợ URL thực tế (/admin, /technician, /material, /operator, /login)
 * Đồng bộ hai chiều với thanh địa chỉ trình duyệt & nút Back/Forward
 */
export function useRouter() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return window.location.pathname || "/";
    }
    return "/";
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || "/");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((path: string) => {
    if (typeof window !== "undefined") {
      if (window.location.pathname !== path) {
        window.history.pushState({}, "", path);
        setCurrentPath(path);
      }
    }
  }, []);

  const isPath = useCallback(
    (prefix: string) => {
      if (prefix === "/") return currentPath === "/";
      return currentPath.startsWith(prefix);
    },
    [currentPath]
  );

  return {
    currentPath,
    navigate,
    isPath,
  };
}
