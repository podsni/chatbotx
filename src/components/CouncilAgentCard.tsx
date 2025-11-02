/**
 * COUNCIL-HADES: Agent Card Component
 * Displays individual agent profiles
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgentProfile } from '@/lib/councilTypes';

interface CouncilAgentCardProps {
  agent: AgentProfile;
}

export function CouncilAgentCard({ agent }: CouncilAgentCardProps) {
  return (
    <Card className={`bg-gradient-to-br ${agent.color} bg-opacity-10 border-2 border-opacity-30 hover:border-opacity-50 transition-all`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{agent.icon}</span>
          <div className="flex-1">
            <CardTitle className="text-xl text-purple-100">{agent.name}</CardTitle>
            <CardDescription className="text-purple-300/70">{agent.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-purple-100/80 italic">"{agent.perspective}"</p>

        <div>
          <div className="text-xs font-semibold text-purple-300/70 mb-2">Primary Focus:</div>
          <div className="flex flex-wrap gap-2">
            {agent.primaryFocus.map(focus => (
              <Badge key={focus} variant="outline" className="text-xs capitalize bg-black/30">
                {focus}
              </Badge>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-purple-500/20">
          <details className="cursor-pointer">
            <summary className="text-xs font-semibold text-purple-300/70 hover:text-purple-300">
              View System Prompt
            </summary>
            <p className="text-xs text-purple-100/60 mt-2 whitespace-pre-wrap font-mono bg-black/30 p-3 rounded">
              {agent.systemPrompt}
            </p>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}
