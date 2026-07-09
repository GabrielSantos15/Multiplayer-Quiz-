import { GameProvider } from "@/providers/GameProvider";

export default function RoomLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <GameProvider>{children}</GameProvider>;
}