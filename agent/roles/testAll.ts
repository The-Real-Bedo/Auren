import { runUserAgentPoC } from './userAgent';
import { GrowthAgent } from './growthAgent';
import { InvestmentAgent } from './investmentAgent';

async function main() {
  console.log('================================================================');
  console.log('🧪 RUNNING AUREN + TECHNOCORE FULL AGENT TEST SUITE');
  console.log('================================================================\n');

  // 1. User Agent PoC
  console.log('>>> [1/3] Testing User Agent End-to-End PoC...');
  const userResult = await runUserAgentPoC();
  if (!userResult.success) {
    throw new Error(`User Agent PoC failed: ${JSON.stringify(userResult)}`);
  }
  console.log('✅ User Agent PoC PASSED\n');

  // 2. Growth Agent
  console.log('>>> [2/3] Testing Growth Agent Telemetry & Strategy Analysis...');
  const growthAgent = new GrowthAgent();
  const growthRecs = await growthAgent.runAnalysis();
  if (!growthRecs || growthRecs.length === 0) {
    throw new Error('Growth Agent returned empty recommendations');
  }
  console.log('✅ Growth Agent Analysis PASSED\n');

  // 3. Investment Agent
  console.log('>>> [3/3] Testing Investment Agent LP Opportunity Evaluation...');
  const investAgent = new InvestmentAgent();
  const investBriefs = await investAgent.evaluateOpportunities();
  if (!investBriefs || investBriefs.length === 0) {
    throw new Error('Investment Agent returned empty assessments');
  }
  console.log('✅ Investment Agent Evaluation PASSED\n');

  console.log('================================================================');
  console.log('🎉 ALL 3 AGENT ROLES & TOOLS VERIFIED SUCCESSFULLY!');
  console.log('================================================================');
}

main().catch(err => {
  console.error('Agent test suite failed:', err);
  process.exit(1);
});
