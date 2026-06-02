import React, { useMemo, useState } from 'react';
import { Player } from '../../types';
import {
  PlayerRoleConversationResult,
  PlayerRoleConversationSession,
  PlayerRoleMindflowService,
} from '../../services/PlayerRoleMindflowService';
import { PlayerMindflowConversationModal } from './PlayerMindflowConversationModal';

interface PlayerRoleMindflowModalProps {
  player: Player;
  currentDate: Date;
  sessionSeed: number;
  onResolve: (result: PlayerRoleConversationResult) => void;
  onClose: () => void;
}

export const PlayerRoleMindflowModal: React.FC<PlayerRoleMindflowModalProps> = ({
  player,
  currentDate,
  sessionSeed,
  onResolve,
  onClose,
}) => {
  const initialSession = useMemo(
    () => PlayerRoleMindflowService.createSession(player, currentDate, sessionSeed),
    [player.id, player.morale, currentDate, sessionSeed]
  );
  const [session, setSession] = useState<PlayerRoleConversationSession>(initialSession);
  const [result, setResult] = useState<PlayerRoleConversationResult | null>(null);
  const currentQuestion = session.questions[session.currentQuestionIndex];
  const progress = Math.round((session.answeredCount / session.questions.length) * 100);

  const finishConversation = (ignored = false) => {
    if (result) return;
    const nextResult = PlayerRoleMindflowService.finish(session, ignored);
    setResult(nextResult);
    onResolve(nextResult);
  };

  const answerQuestion = (answerId: string) => {
    if (!currentQuestion || result) return;
    const answer = currentQuestion.answers.find(option => option.id === answerId);
    if (!answer) return;

    const nextSession = PlayerRoleMindflowService.answer(session, player, answer);
    setSession(nextSession);
    if (nextSession.currentQuestionIndex >= nextSession.questions.length) {
      const nextResult = PlayerRoleMindflowService.finish(nextSession);
      setResult(nextResult);
      onResolve(nextResult);
    }
  };

  return (
    <PlayerMindflowConversationModal
      theme="ROLE"
      playerName={`${player.firstName} ${player.lastName}`}
      playerLastName={player.lastName}
      title="O STATUSIE W DRUŻYNIE"
      subtitle="PLAYER MINDFLOW"
      moodLabel={PlayerRoleMindflowService.getMoodLabel(session.mood)}
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
        moraleDelta: result.moraleDelta,
        isPositive: result.outcome === 'CONVINCED',
      } : null}
      onAnswer={answerQuestion}
      onEndConversation={() => finishConversation(true)}
      onClose={onClose}
    />
  );
};
