/**
 * COUNCIL-HADES: Decision View Component
 * Displays the final Council decision, recommendations, and reflection
 */

import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { CouncilSession, COUNCIL_AGENTS } from '@/lib/councilTypes';
import {
  CheckCircle2,
  AlertTriangle,
  Shield,
  Lightbulb,
  TrendingUp,
  Award,
  Brain,
} from 'lucide-react';

interface CouncilDecisionViewProps {
  session: CouncilSession;
}

export function CouncilDecisionView({ session }: CouncilDecisionViewProps) {
  const decision = session.decision;
  if (!decision) return null;

  const selectedProposal = session.proposals.find(p => p.id === decision.selectedProposalId);
  const selectedAgent = selectedProposal ? COUNCIL_AGENTS[selectedProposal.agentRole] : null;

  const consensusColor =
    decision.consensus >= 8
      ? 'text-green-400'
      : decision.consensus >= 6
      ? 'text-yellow-400'
      : 'text-red-400';

  return (
    <ScrollArea className="h-full p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header - Final Decision */}
        <Card className="bg-gradient-to-br from-purple-900/60 via-pink-900/60 to-purple-900/60 border-purple-500/50 shadow-2xl">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-purple-200 mb-2">
                  <CheckCircle2 className="h-6 w-6" />
                  <CardTitle className="text-2xl">Council Decision</CardTitle>
                </div>
                <p className="text-purple-300/70 text-sm">
                  The Council has reached a collective decision through deliberation and voting
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-purple-300/70 mb-1">Final Score</div>
                <Badge variant="outline" className="text-xl px-4 py-2 bg-purple-600/20">
                  {decision.finalScore.toFixed(1)}/10
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected Solution */}
            {selectedProposal && selectedAgent && (
              <div className="p-4 rounded-lg bg-black/30 border border-purple-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{selectedAgent.icon}</span>
                  <div>
                    <div className="font-semibold text-lg text-purple-100">
                      {selectedProposal.title}
                    </div>
                    <div className="text-sm text-purple-300/70">
                      Proposed by {selectedAgent.name}
                    </div>
                  </div>
                </div>
                <p className="text-purple-100/90 leading-relaxed">
                  {selectedProposal.description}
                </p>
              </div>
            )}

            {/* Consensus Meter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-200">Council Consensus</span>
                <span className={`text-sm font-bold ${consensusColor}`}>
                  {decision.consensus.toFixed(1)}/10
                </span>
              </div>
              <Progress value={decision.consensus * 10} className="h-2" />
              <p className="text-xs text-purple-300/70 mt-1">
                {decision.consensus >= 8
                  ? 'Strong agreement across all agents'
                  : decision.consensus >= 6
                  ? 'Moderate agreement with some concerns'
                  : 'Significant disagreement, decision made with reservations'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Reasoning */}
        <Card className="bg-black/40 border-purple-500/30">
          <CardHeader>
            <div className="flex items-center gap-2 text-purple-200">
              <Brain className="h-5 w-5" />
              <CardTitle>Reasoning</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100/90 leading-relaxed whitespace-pre-wrap">
              {decision.reasoning}
            </p>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {decision.recommendations.length > 0 && (
          <Card className="bg-black/40 border-purple-500/30">
            <CardHeader>
              <div className="flex items-center gap-2 text-purple-200">
                <Lightbulb className="h-5 w-5" />
                <CardTitle>Recommendations</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {decision.recommendations.map((rec, index) => (
                  <li key={index} className="flex gap-3">
                    <Badge className="bg-purple-600 h-6 w-6 flex items-center justify-center shrink-0">
                      {index + 1}
                    </Badge>
                    <span className="text-purple-100/90 flex-1">{rec}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Risks & Mitigations */}
        {(decision.risks.length > 0 || decision.mitigations.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Risks */}
            {decision.risks.length > 0 && (
              <Card className="bg-black/40 border-red-500/30">
                <CardHeader>
                  <div className="flex items-center gap-2 text-red-300">
                    <AlertTriangle className="h-5 w-5" />
                    <CardTitle className="text-base">Identified Risks</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {decision.risks.map((risk, index) => (
                      <li key={index} className="flex gap-2 text-sm">
                        <span className="text-red-400 shrink-0">⚠️</span>
                        <span className="text-red-100/80">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Mitigations */}
            {decision.mitigations.length > 0 && (
              <Card className="bg-black/40 border-green-500/30">
                <CardHeader>
                  <div className="flex items-center gap-2 text-green-300">
                    <Shield className="h-5 w-5" />
                    <CardTitle className="text-base">Risk Mitigations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {decision.mitigations.map((mitigation, index) => (
                      <li key={index} className="flex gap-2 text-sm">
                        <span className="text-green-400 shrink-0">✓</span>
                        <span className="text-green-100/80">{mitigation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Minority Notes */}
        {decision.minorityNotes && decision.minorityNotes.length > 0 && (
          <Card className="bg-black/40 border-yellow-500/30">
            <CardHeader>
              <div className="flex items-center gap-2 text-yellow-300">
                <AlertTriangle className="h-5 w-5" />
                <CardTitle>Minority Concerns</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yellow-100/70 mb-3">
                Some agents expressed reservations that should be considered:
              </p>
              <div className="space-y-2">
                {decision.minorityNotes.map((note, index) => (
                  <div key={index} className="p-3 rounded bg-yellow-900/20 border border-yellow-500/20">
                    <p className="text-sm text-yellow-100/80 italic">"{note}"</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reflection (if available) */}
        {session.reflection && (
          <>
            <Separator className="bg-purple-500/20" />
            <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30">
              <CardHeader>
                <div className="flex items-center gap-2 text-indigo-200">
                  <TrendingUp className="h-5 w-5" />
                  <CardTitle>Council Self-Reflection</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* What Worked Well */}
                {session.reflection.whatWorkedWell.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-semibold text-indigo-200">What Worked Well</span>
                    </div>
                    <ul className="space-y-1 pl-6">
                      {session.reflection.whatWorkedWell.map((item, index) => (
                        <li key={index} className="text-sm text-indigo-100/80 list-disc">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Areas for Improvement */}
                {session.reflection.areasForImprovement.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-semibold text-indigo-200">
                        Areas for Improvement
                      </span>
                    </div>
                    <ul className="space-y-1 pl-6">
                      {session.reflection.areasForImprovement.map((item, index) => (
                        <li key={index} className="text-sm text-indigo-100/80 list-disc">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Separator className="bg-indigo-500/20" />

                {/* Meta Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 rounded bg-black/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="h-4 w-4 text-indigo-300" />
                      <span className="text-xs font-semibold text-indigo-300/70">
                        Most Valuable Agent
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {COUNCIL_AGENTS[session.reflection.mostValuableAgent].icon}
                      </span>
                      <span className="text-sm font-medium text-indigo-100">
                        {COUNCIL_AGENTS[session.reflection.mostValuableAgent].name}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded bg-black/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-indigo-300" />
                      <span className="text-xs font-semibold text-indigo-300/70">Debate Fairness</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-indigo-600/20">
                        {session.reflection.debateFairness}/10
                      </Badge>
                      <span className="text-xs text-indigo-100/70">
                        {session.reflection.debateFairness >= 8
                          ? 'Very Fair'
                          : session.reflection.debateFairness >= 6
                          ? 'Mostly Fair'
                          : 'Some Bias'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded bg-black/30">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-indigo-300" />
                      <span className="text-xs font-semibold text-indigo-300/70">Bias Detected</span>
                    </div>
                    <span className="text-sm text-indigo-100">
                      {session.reflection.biasDetected || 'None detected'}
                    </span>
                  </div>
                </div>

                {/* Learnings */}
                {session.reflection.learnings.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-indigo-300" />
                      <span className="text-sm font-semibold text-indigo-200">Key Learnings</span>
                    </div>
                    <ul className="space-y-1 pl-6">
                      {session.reflection.learnings.map((learning, index) => (
                        <li key={index} className="text-sm text-indigo-100/80 list-disc">
                          {learning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Session Metadata */}
        <Card className="bg-black/30 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-sm text-purple-300/70">Session Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="text-purple-300/70 mb-1">Mode</div>
                <Badge variant="outline" className="capitalize">
                  {session.mode}
                </Badge>
              </div>
              <div>
                <div className="text-purple-300/70 mb-1">Model</div>
                <Badge variant="outline">{session.modelUsed}</Badge>
              </div>
              <div>
                <div className="text-purple-300/70 mb-1">Provider</div>
                <Badge variant="outline">{session.provider}</Badge>
              </div>
              <div>
                <div className="text-purple-300/70 mb-1">Duration</div>
                <Badge variant="outline">
                  {session.endTime && session.startTime
                    ? `${Math.round((session.endTime - session.startTime) / 1000)}s`
                    : 'N/A'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
