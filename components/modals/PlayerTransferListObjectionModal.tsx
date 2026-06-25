import React, { useMemo, useState } from 'react';
import { Player } from '../../types';
import {
  PlayerTransferListObjectionResult,
  PlayerTransferListObjectionService,
  PlayerTransferListObjectionSession,
} from '../../services/PlayerTransferListObjectionService';
import { PlayerMindflowConversationModal } from './PlayerMindflowConversationModal';

interface PlayerTransferListObjectionModalProps {
  player: Player;
  currentDate: Date;
  sessionSeed: number;
  onResolve: (result: PlayerTransferListObjectionResult) => void;
  onClose: () => void;
}

export const PlayerTransferListObjectionModal: React.FC<PlayerTransferListObjectionModalProps> = ({
  player,
  currentDate,
  sessionSeed,
  onResolve,
  onClose,
}) => {
  const initialSession = useMemo(
    () => PlayerTransferListObjectionService.createSession(player, currentDate, sessionSeed),
    [player.id, player.morale, player.lojalnosc, currentDate, sessionSeed]
  );
  const [session, setSession] = useState<PlayerTransferListObjectionSession>(initialSession);
  const [result, setResult] = useState<PlayerTransferListObjectionResult | null>(null);
  const currentQuestion = session.questions[session.currentQuestionIndex];
  const progress = Math.round((session.answeredCount / session.questions.length) * 100);

  const finishConversation = (ignored = false) => {
    if (result) return;
    const nextResult = PlayerTransferListObjectionService.finish(session, ignored);
    setResult(nextResult);
    onResolve(nextResult);
  };

  const answerQuestion = (answerId: string) => {
    if (!currentQuestion || result) return;
    const answer = currentQuestion.answers.find(option => option.id === answerId);
    if (!answer) return;

    const nextSession = PlayerTransferListObjectionService.answer(session, player, answer);
    setSession(nextSession);
    if (nextSession.currentQuestionIndex >= nextSession.questions.length) {
      const nextResult = PlayerTransferListObjectionService.finish(nextSession);
      setResult(nextResult);
      onResolve(nextResult);
    }
  };

  return (
    <PlayerMindflowConversationModal
      theme="TRANSFER"
      playerName={`${player.firstName} ${player.lastName}`}
      playerLastName={player.lastName}
      title="O LIŚCIE TRANSFEROWEJ"
      subtitle="PLAYER MINDFLOW"
      moodLabel={`RZUT UKRYTY: ${result ? result.diceRoll : '?'}/6`}
      currentStep={Math.min(session.currentQuestionIndex + 1, session.questions.length)}
      totalSteps={session.questions.length}
      score={session.score}
      progress={progress}
      question={currentQuestion?.playerText}
      answers={currentQuestion?.answers}
      lastReaction={session.lastReaction}
      result={result ? {
        title: result.title,
        summary: result.summary,
        score: result.score,
        targetScore: result.targetScore,
        moraleDelta: result.moraleToMinimum ? -99 : result.moraleDelta,
        isPositive: result.outcome === 'CONVINCED',
      } : null}
      onAnswer={answerQuestion}
      onEndConversation={() => finishConversation(true)}
      onClose={onClose}
    />
  );
};
