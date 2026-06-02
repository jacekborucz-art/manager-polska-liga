import React, { useMemo, useState } from 'react';
import { Player } from '../../types';
import {
  PlayerTransferConversationResult,
  PlayerTransferConversationSession,
  PlayerTransferMindflowService,
} from '../../services/PlayerTransferMindflowService';
import { PlayerMindflowConversationModal } from './PlayerMindflowConversationModal';

interface PlayerTransferMindflowModalProps {
  player: Player;
  currentDate: Date;
  sessionSeed: number;
  onResolve: (result: PlayerTransferConversationResult) => void;
  onClose: () => void;
}

export const PlayerTransferMindflowModal: React.FC<PlayerTransferMindflowModalProps> = ({
  player,
  currentDate,
  sessionSeed,
  onResolve,
  onClose,
}) => {
  const initialSession = useMemo(
    () => PlayerTransferMindflowService.createSession(player, currentDate, sessionSeed),
    [player.id, player.morale, currentDate, sessionSeed]
  );
  const [session, setSession] = useState<PlayerTransferConversationSession>(initialSession);
  const [result, setResult] = useState<PlayerTransferConversationResult | null>(null);
  const question = session.questions[session.currentQuestionIndex];
  const progress = Math.round((session.answeredCount / session.questions.length) * 100);

  const finishConversation = (ignored = false) => {
    if (result) return;
    const nextResult = PlayerTransferMindflowService.finish(session, ignored);
    setResult(nextResult);
    onResolve(nextResult);
  };

  const answerQuestion = (answerId: string) => {
    if (!question || result) return;
    const answer = question.answers.find(option => option.id === answerId);
    if (!answer) return;

    const nextSession = PlayerTransferMindflowService.answer(session, player, answer);
    setSession(nextSession);
    if (nextSession.currentQuestionIndex >= nextSession.questions.length) {
      const nextResult = PlayerTransferMindflowService.finish(nextSession);
      setResult(nextResult);
      onResolve(nextResult);
    }
  };

  return (
    <PlayerMindflowConversationModal
      theme="TRANSFER"
      playerName={`${player.firstName} ${player.lastName}`}
      playerLastName={player.lastName}
      title="O PRZYSZŁOŚCI"
      subtitle="PLAYER TRANSFER MINDFLOW"
      moodLabel={PlayerTransferMindflowService.getMoodLabel(session.mood)}
      currentStep={Math.min(session.currentQuestionIndex + 1, session.questions.length)}
      totalSteps={session.questions.length}
      score={session.score}
      progress={progress}
      question={question?.playerText}
      answers={question?.answers}
      lastReaction={session.lastReaction}
      result={result ? {
        title: result.title,
        summary: result.summary,
        score: result.score,
        targetScore: result.targetScore,
        moraleDelta: result.moraleDelta,
        isPositive: result.outcome === 'ACCEPTED_PLAN',
      } : null}
      onAnswer={answerQuestion}
      onEndConversation={() => finishConversation(true)}
      onClose={onClose}
    />
  );
};
