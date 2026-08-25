import { ethers } from 'ethers';
import { AurenTools } from '../tools/aurenTools';
import { AgentIdentity } from '../identity/didKey';
import { TechnoCoreClient } from '../technocore/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface LPInvestmentAssessment {
  dappId: string;
  name: string;
  vaultAddress: string;
  riskRating: 'Low' | 'Medium' | 'Elevated';
  totalLiquidityUsdc: string;
  unrecoveredCapitalUsdc: string;
  capitalRecoveryVelocity: string;
  profitShareModel: string;
  shariaComplianceNote: string;
  assessmentSummary: string;
}

export class InvestmentAgent {
  private agent: AgentIdentity;
  private tools: AurenTools;
  private technocore: TechnoCoreClient;

  constructor() {
    this.agent = new AgentIdentity();
    this.tools = new AurenTools();
    this.technocore = new TechnoCoreClient();
  }

  public async evaluateOpportunities(): Promise<LPInvestmentAssessment[]> {
    console.log('════════════════════════════════════════════════════════════════');
    console.log(`📊 TechnoCore Investment Agent (${this.agent.did})`);
    console.log('   Role: LP Risk, Downside Protection & Venture Analyst');
    console.log('   Permissions: Analyst Only — Zero Fund Movement Authority');
    console.log('════════════════════════════════════════════════════════════════\n');

    const opportunities = await this.tools.listOpportunities();
    const assessments: LPInvestmentAssessment[] = [];

    for (const opp of opportunities) {
      console.log(`[Evaluating LP Opportunity] ${opp.name} (${opp.category})`);
      const econ = await this.tools.getDAppEconomics(opp.vaultAddress);

      const unrecovered = parseFloat(econ.unrecoveredCapitalUsdc);
      const tvl = parseFloat(econ.totalValueUsdc);

      let riskRating: 'Low' | 'Medium' | 'Elevated' = 'Low';
      if (unrecovered > 5.0) {
        riskRating = 'Elevated';
      } else if (unrecovered > 0) {
        riskRating = 'Medium';
      }

      const summary = `Vault TVL is ${tvl.toFixed(2)} USDC with ${unrecovered.toFixed(4)} USDC unrecovered principal. ` +
        `The Mudarabah-inspired isolated vault structure ensures 100% of incoming DApp revenue flows to recover LP principal ` +
        `before any ${opp.lpProfitShareBps / 100}% profit-sharing commences. Downside is strictly limited to capital deployed for user gas.`;

      console.log(`    Risk Assessment:      ${riskRating}`);
      console.log(`    Vault TVL:            ${tvl.toFixed(2)} USDC`);
      console.log(`    Unrecovered Risk:     ${unrecovered.toFixed(4)} USDC`);
      console.log(`    LP Profit Ratio:      ${opp.lpProfitShareBps / 100}%`);
      console.log(`    Recovery Structure:   ${opp.recoveryModel}`);
      console.log(`    Analyst Briefing:     ${summary}\n`);

      // Post briefing to TechnoCore room /r/auren-lp
      await this.technocore.say(
        'auren-lp',
        'lp-analyst',
        `[LP BRIEF: ${opp.name}] Risk: ${riskRating} | TVL: ${tvl.toFixed(2)} USDC | Split: ${opp.lpProfitShareBps / 100}% LP`
      );

      // Persist note to TechnoCore /kv/auren-lp/<dappId>
      await this.technocore.setNote(
        'auren-lp',
        opp.id,
        JSON.stringify({
          dapp: opp.name,
          vault: opp.vaultAddress,
          risk: riskRating,
          tvl: tvl.toFixed(2),
          unrecovered: unrecovered.toFixed(4),
          profitShare: `${opp.lpProfitShareBps / 100}%`,
          summary,
          timestamp: Date.now()
        })
      );

      assessments.push({
        dappId: opp.id,
        name: opp.name,
        vaultAddress: opp.vaultAddress,
        riskRating,
        totalLiquidityUsdc: econ.totalValueUsdc,
        unrecoveredCapitalUsdc: econ.unrecoveredCapitalUsdc,
        capitalRecoveryVelocity: econ.recoveryPercentage,
        profitShareModel: `${opp.lpProfitShareBps / 100}% LP / ${100 - (opp.lpProfitShareBps / 100)}% Developer`,
        shariaComplianceNote: 'Designed around a non-interest, profit-sharing model; subject to qualified Sharia scholar review.',
        assessmentSummary: summary
      });
    }

    return assessments;
  }
}

if (require.main === module) {
  const agent = new InvestmentAgent();
  agent.evaluateOpportunities().catch(err => {
    console.error('Investment agent execution failed:', err);
    process.exit(1);
  });
}
