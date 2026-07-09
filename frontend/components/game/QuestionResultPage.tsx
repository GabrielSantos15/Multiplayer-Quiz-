import type { QuestionResult } from "@/interfaces/Game";


interface QuestionResultProps {
    result: QuestionResult;
}

export default function QuestionResultPage({
    result,
}: QuestionResultProps) {
    return (
        <section className="space-y-6">

            <h2 className="text-3xl font-bold text-center">
                Resposta correta
            </h2>

            <div className="rounded-xl bg-green-600 p-5 text-center text-2xl font-bold">
                {result.correctAnswer}
            </div>

            <h3 className="text-xl font-semibold">
                Ranking
            </h3>

            {result.ranking.map((player, index) => (

                <div
                    key={player.playerId}
                    className="flex items-center justify-between rounded-lg border p-4"
                >

                    <div className="flex items-center gap-3">

                        <span>
                            #{index + 1}
                        </span>

                        <img
                            src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${player.avatarSeed}`}
                            className="size-10"
                        />

                        <span>
                            {player.nickname}
                        </span>

                    </div>

                    <strong>
                        {player.score} pts
                    </strong>

                </div>

            ))}

        </section>)
}