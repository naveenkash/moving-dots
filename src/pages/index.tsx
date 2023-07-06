import { MovingDots } from "@/components/MovingDots";
import Image from "next/image";

export default function Home() {
  return (
    <div className="h-screen min-w-screen">
      <MovingDots />
    </div>
  );
}
