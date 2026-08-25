import { ethers } from 'ethers';
import { AurenTools, DAppEconomics } from '../tools/aurenTools';
import { AgentIdentity } from '../identity/didKey';
import { TechnoCoreClient } from '../technocore/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface GrowthRecommendation {
  dappId: string;
  vaultAddress: string;
  currentEfficiency: 'high' | 'moderate' | 'low';
  recoveryRatePct: number;
  recommendation: string;
  recommendedDailyBudgetAdjustmentUsdc: string;
  priorityActions: string[];
}

export class GrowthAgent {
  private agent: AgentIdentity;
  private tools: AurenTools;
  private technocore: TechnoCoreClient;

  constructor() {
    this.agent = new AgentIdentity();
    this.tools = new AurenTools();
    this.technocore = new TechnoCoreClient();
  }

  public async runAnalysis(): Promise<GrowthRecommendation[]> {
    console.log('════════════════════════════════════════════════════════════════');
    console.log(`📈 TechnoCore Growth Agent (${this.agent.did})`);
    console.log('   Role: Telemetry, CAC & Recovery Optimization Analyst');
    console.log('   Permissions: Advisory Only — Zero Direct Fund Custody');
    console.log('════════════════════════════════════════════════════════════════\n');

    const opportunities = await this.tools.listOpportunities();
    const recommendations: GrowthRecommendation[] = [];

    for (const opp of opportunities) {
      console.log(`[Analyzing DApp] ${opp.name} (${opp.vaultAddress})`);
      const econ = await this.tools.getDAppEconomics(opp.vaultAddress);

      const gasDeployed = parseFloat(econ.totalGasDeployedUsdc);
      const recovered = parseFloat(econ.totalCapitalRecoveredUsdc);
      const unrecovered = parseFloat(econ.unrecoveredCapitalUsdc);
      const tvl = parseFloat(econ.totalValueUsdc);

      const recoveryRate = gasDeployed > 0 ? (recovered / gasDeployed) * 100 : 100;

      let efficiency: 'high' | 'moderate' | 'low' = 'high';
      let recText = '';
      let budgetAdj = '0';

      if (unrecovered === 0 && tvl > 10) {
        efficiency = 'high';
        recText = 'DApp is in net profit territory with zero unrecovered capital. Recommend increasing sponsorship budget by +25 USDC/day to scale acquisition.';
        budgetAdj = '+25.0';
      } else if (recoveryRate > 75) {
        efficiency = 'moderate';
        recText = 'Healthy capital recovery velocity (>75%). Maintain current budget caps while monitoring conversion on high-value checkout endpoints.';
        budgetAdj = '+0.0';
      } else {
        efficiency = 'low';
        recText = 'Capital at risk is elevated. Recommend tightening per-user rate limits and focusing sponsorship exclusively on top-converting purchase selectors.';
        budgetAdj = '-10.0';
      }

      console.log(`    Vault TVL:          ${tvl.toFixed(2)} USDC`);
      console.log(`    Gas Deployed:       ${gasDeployed.toFixed(4)} USDC`);
      console.log(`    Capital Recovered:  ${recovered.toFixed(4)} USDC`);
      console.log(`    Unrecovered Risk:   ${unrecovered.toFixed(4)} USDC`);
      console.log(`    Recovery Rate:      ${recoveryRate.toFixed(2)}%`);
      console.log(`    Strategy Advisory:  ${recText}\n`);

      // Publish advisory to TechnoCore room /r/auren-growth
      await this.technocore.say(
        'auren-growth',
        'growth-agent',
        `[${opp.name}] Efficiency: ${efficiency.toUpperCase()} | Recovery: ${recoveryRate.toFixed(1)}% | Rec: ${recText}`
      );

      // Persist note to TechnoCore /kv/auren-growth/<dappId>
      await this.technocore.setNote(
        'auren-growth',
        opp.id,
        JSON.stringify({
          dapp: opp.name,
          vault: opp.vaultAddress,
          efficiency,
          recoveryRatePct: recoveryRate,
          budgetAdjustment: budgetAdj,
          timestamp: Date.now()
        })
      );

      recommendations.push({
        dappId: opp.id,
        vaultAddress: opp.vaultAddress,
        currentEfficiency: efficiency,
        recoveryRatePct: recoveryRate,
        recommendation: recText,
        recommendedDailyBudgetAdjustmentUsdc: budgetAdj,
        priorityActions: ['purchaseItem()']
      });
    }

    return recommendations;
  }
}

if (require.main === module) {
  const agent = new GrowthAgent();
  agent.runAnalysis().catch(err => {
    console.error('Growth agent execution failed:', err);
    process.exit(1);
  });
}
