/**
 * COUNCIL-HADES: Debate View Component
 * Displays the deliberation process with opinions and debate rounds
 */

import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CouncilSession, COUNCIL_AGENTS } from '@/lib/councilTypes';
import { MessageSquare, Users, Sparkles } from 'lucide-react';

interface CouncilDebateViewProps {
  session: CouncilSession;
}

export function CouncilDebateView({ session }: CouncilDebateViewProps) {
  return (
    <ScrollArea className="h-full p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Question Card */}
        <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30">
          <CardHeader>
            <div className="flex items-center gap-2 text-purple-300">
              <MessageSquare className="h-5 w-5" />
              <CardTitle className="text-xl">Question Under Deliberation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-purple-100">{session.question}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="capitalize">
                {session.mode} Mode
              </Badge>
              <Badge variant="outline">{session.modelUsed}</Badge>
              <Badge variant="outline">{session.provider}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Initial Opinions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-purple-200">
            <Users className="h-5 w-5" />
            <h2 className="text-2xl font-bold">Initial Perspectives</h2>
          </div>
          <p className="text-sm text-purple-300/70">
            Each agent provides their first perspective on the question
          </p>

          <div className="space-y-4">
            {session.initialOpinions.map((opinion, index) => {
              const agent = COUNCIL_AGENTS[opinion.agentRole];
              return (
                <Card
                  key={index}
                  className="bg-black/40 border-l-4 border-purple-500/50 hover:border-purple-400/70 transition-all"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{agent.icon}</span>
                      <div>
                        <CardTitle className="text-lg text-purple-100">{agent.name}</CardTitle>
                        <p className="text-xs text-purple-300/70">{agent.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-purple-100/90 whitespace-pre-wrap leading-relaxed">
                      {opinion.content}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Debate Rounds */}
        {session.debateRounds.length > 0 && (
          <>
            <Separator className="bg-purple-500/20" />
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-purple-200">
                <Sparkles className="h-5 w-5" />
                <h2 className="text-2xl font-bold">Debate & Refinement</h2>
              </div>
              <p className="text-sm text-purple-300/70">
                Agents respond to each other's perspectives and refine their views
              </p>

              {session.debateRounds.map((round, roundIndex) => (
                <div key={roundIndex} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-600">Round {roundIndex + 1}</Badge>
                  </div>

                  <div className="space-y-4 pl-4 border-l-2 border-purple-500/30">
                    {round.map((opinion, opinionIndex) => {
                      const agent = COUNCIL_AGENTS[opinion.agentRole];
                      return (
                        <Card
                          key={opinionIndex}
                          className="bg-black/30 border-purple-500/20 hover:border-purple-500/40 transition-all"
                        >
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{agent.icon}</span>
                              <div>
                                <CardTitle className="text-base text-purple-100">{agent.name}</CardTitle>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-purple-100/80 whitespace-pre-wrap leading-relaxed">
                              {opinion.content}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Proposals */}
        {session.proposals.length > 0 && (
          <>
            <Separator className="bg-purple-500/20" />
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-purple-200">
                <MessageSquare className="h-5 w-5" />
                <h2 className="text-2xl font-bold">Solution Proposals</h2>
              </div>
              <p className="text-sm text-purple-300/70">
                Each agent presents their concrete solution
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {session.proposals.map((proposal, index) => {
                  const agent = COUNCIL_AGENTS[proposal.agentRole];
                  const votes = session.votes.filter(v => v.proposalId === proposal.id);
                  const avgScore =
                    votes.length > 0
                      ? votes.reduce((sum, v) => sum + v.overallScore, 0) / votes.length
                      : 0;

                  return (
                    <Card
                      key={index}
                      className={`bg-black/40 border-2 ${
                        session.decision?.selectedProposalId === proposal.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-purple-500/20'
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{agent.icon}</span>
                            <div>
                              <CardTitle className="text-base text-purple-100">{proposal.title}</CardTitle>
                              <p className="text-xs text-purple-300/70">{agent.name}</p>
                            </div>
                          </div>
                          {votes.length > 0 && (
                            <Badge variant="outline" className="bg-purple-600/20">
                              {avgScore.toFixed(1)}/10
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-purple-100/80">{proposal.description}</p>

                        {proposal.steps && proposal.steps.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-purple-300/70 mb-1">Steps:</div>
                            <ol className="text-xs text-purple-100/70 space-y-1 list-decimal list-inside">
                              {proposal.steps.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {proposal.benefits && proposal.benefits.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-green-400/70 mb-1">Benefits:</div>
                            <ul className="text-xs text-green-100/70 space-y-1 list-disc list-inside">
                              {proposal.benefits.map((benefit, i) => (
                                <li key={i}>{benefit}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {proposal.risks && proposal.risks.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-yellow-400/70 mb-1">Risks:</div>
                            <ul className="text-xs text-yellow-100/70 space-y-1 list-disc list-inside">
                              {proposal.risks.map((risk, i) => (
                                <li key={i}>{risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {session.decision?.selectedProposalId === proposal.id && (
                          <Badge className="bg-purple-600 w-full justify-center">Selected Solution</Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Voting Details */}
        {session.votes.length > 0 && (
          <>
            <Separator className="bg-purple-500/20" />
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-purple-200">
                <Users className="h-5 w-5" />
                <h2 className="text-2xl font-bold">Voting Results</h2>
              </div>
              <p className="text-sm text-purple-300/70">
                Each agent evaluates all proposals across five dimensions
              </p>

              <div className="space-y-4">
                {session.proposals.map(proposal => {
                  const agent = COUNCIL_AGENTS[proposal.agentRole];
                  const votes = session.votes.filter(v => v.proposalId === proposal.id);

                  return (
                    <Card key={proposal.id} className="bg-black/40 border-purple-500/20">
                      <CardHeader>
                        <CardTitle className="text-base text-purple-100 flex items-center gap-2">
                          <span>{agent.icon}</span>
                          {proposal.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {votes.map((vote, voteIndex) => {
                          const votingAgent = COUNCIL_AGENTS[vote.agentRole];
                          return (
                            <div key={voteIndex} className="p-3 rounded bg-black/30 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{votingAgent.icon}</span>
                                  <span className="text-sm font-medium text-purple-200">
                                    {votingAgent.name}
                                  </span>
                                </div>
                                <Badge variant="outline" className="bg-purple-600/20">
                                  {vote.overallScore.toFixed(1)}/10
                                </Badge>
                              </div>

                              <div className="grid grid-cols-5 gap-2">
                                {vote.scores.map(score => (
                                  <div key={score.dimension} className="text-center">
                                    <div className="text-xs text-purple-300/70 capitalize mb-1">
                                      {score.dimension}
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${
                                        score.score >= 7
                                          ? 'bg-green-600/20'
                                          : score.score >= 5
                                          ? 'bg-yellow-600/20'
                                          : 'bg-red-600/20'
                                      }`}
                                    >
                                      {score.score}
                                    </Badge>
                                  </div>
                                ))}
                              </div>

                              {vote.notes && (
                                <p className="text-xs text-purple-100/60 italic mt-2">"{vote.notes}"</p>
                              )}

                              {vote.vetoEthics && (
                                <Badge variant="destructive" className="mt-2">
                                  ⚠️ Ethics Veto
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
}
