// MillstoneController.tsx
import { useEffect, useState, useRef } from "react";

type MillstoneControllerProps = {
  motion: { x: number; z: number } | null;
  messages: string[];
  sendMessage: (message: string) => void;
};

const MillstoneController = ({
  motion,
  messages,
  sendMessage,
}: MillstoneControllerProps) => {
  const millstoneAngleRef = useRef<number>(0); // 石臼の角度 (θ)
  const [angularVelocity, setAngularVelocity] = useState<number>(0); // 角速度 (ω)

  const isStarted = messages.includes("start");
  const isFinished = messages.includes("finish");

  const inertia = 1; // 慣性モーメント (適当な値、調整可能)
  const friction = 0.4; // 摩擦による減衰率 (少しずつ減衰)

  useEffect(() => {
    if (motion && !isFinished && isStarted) {
      const dt = 0.05; // 時間間隔 (50ms)

      // 石臼の持ち手の角度に基づいて、加速度を回転方向に変換
      const tangentialAcceleration =
        motion.x * Math.cos(millstoneAngleRef.current * (Math.PI / 180)) +
        motion.z * Math.sin(millstoneAngleRef.current * (Math.PI / 180));
      // トルク τ = r × F = r × m × a (ここでは単位質量 m=1)
      const torque = tangentialAcceleration;

      // 角加速度 α = τ / I
      let angularAcceleration = torque / inertia;
      if (angularAcceleration < 0) {
        angularAcceleration = 0;
      }

      // 角速度の更新 (摩擦を考慮)
      setAngularVelocity((prev) => prev * friction + angularAcceleration * dt);

      // 角度の更新
      millstoneAngleRef.current =
        millstoneAngleRef.current + (angularVelocity * dt * 180) / Math.PI;
    }
  }, [motion]);

  // 定期的に millstoneAngleRef.current を送信する
  useEffect(() => {
    // 0.1秒ごとに角度を送信
    if (isFinished) return;
    const handlemill = () => {
      console.log("test");
      sendMessage(String(millstoneAngleRef.current));
    };
    const intervalId = setInterval(handlemill, 100);
    return () => clearInterval(intervalId);
  }, [isStarted]);

  return (
    <div>
      <h2>回転角度: {Math.round(millstoneAngleRef.current)}°</h2>
      <h3>角速度: {angularVelocity.toFixed(2)} rad/s</h3>
    </div>
  );
};

export default MillstoneController;
