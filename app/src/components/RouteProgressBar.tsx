import { useEffect, useState } from "react";
import { useNavigation } from "react-router";

export function RouteProgressBar() {
  const navigation = useNavigation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (navigation.state === "loading") {
      setShow(true);
    } else {
      const t = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(t);
    }
  }, [navigation.state]);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-[#EDE7FF]">
      <div className="h-full bg-[#5E17EB] animate-[progress_1s_ease-in-out_infinite]" style={{ width: "60%" }} />
    </div>
  );
}
