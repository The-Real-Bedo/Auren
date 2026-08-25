import { Router, Request, Response } from 'express';
import { AurenTools } from '../tools/aurenTools';
import { defaultPolicyEngine } from '../policies/policyEngine';

export function createAgentApiRouter(tools: AurenTools): Router {
  const router = Router();

  /**
   * GET /agent/opportunities
   * List all registered Arc DApp opportunities
   */
  router.get('/opportunities', async (req: Request, res: Response): Promise<any> => {
    try {
      const opps = await tools.listOpportunities();
      return res.json({ success: true, opportunities: opps });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  /**
   * GET /agent/vault/:vaultAddress
   * Real-time on-chain metrics from an isolated vault
   */
  router.get('/vault/:vaultAddress', async (req: Request, res: Response): Promise<any> => {
    try {
      const vaultAddress = Array.isArray(req.params.vaultAddress) ? req.params.vaultAddress[0] : req.params.vaultAddress;
      const status = await tools.getVaultStatus(vaultAddress);
      return res.json({ success: true, vault: status });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  /**
   * GET /agent/economics/:vaultAddress
   * DApp economic analytics (gas deployed, recovery, net profit)
   */
  router.get('/economics/:vaultAddress', async (req: Request, res: Response): Promise<any> => {
    try {
      const vaultAddress = Array.isArray(req.params.vaultAddress) ? req.params.vaultAddress[0] : req.params.vaultAddress;
      const economics = await tools.getDAppEconomics(vaultAddress);
      return res.json({ success: true, economics });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  /**
   * POST /agent/check-sponsorship
   * Pre-flight policy eligibility check
   */
  router.post('/check-sponsorship', async (req: Request, res: Response): Promise<any> => {
    try {
      const result = await tools.checkSponsorship(req.body);
      return res.json({ success: true, ...result });
    } catch (e: any) {
      return res.status(400).json({ success: false, error: e.message });
    }
  });

  /**
   * POST /agent/request-sponsorship
   * Submit signed TechnoCore did:key envelope to receive paymaster authorization
   */
  router.post('/request-sponsorship', async (req: Request, res: Response): Promise<any> => {
    try {
      const envelope = req.body;
      const result = await tools.requestSponsorship(envelope);
      if (!result.approved) {
        return res.status(403).json({ success: false, error: result.error });
      }
      return res.json({ success: true, paymasterAndData: result.paymasterAndData });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  /**
   * GET /agent/tx/:txHash
   * Query transaction confirmation status on Arc
   */
  router.get('/tx/:txHash', async (req: Request, res: Response): Promise<any> => {
    try {
      const txHash = Array.isArray(req.params.txHash) ? req.params.txHash[0] : req.params.txHash;
      const status = await tools.getTransactionStatus(txHash);
      return res.json({ success: true, transaction: status });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  /**
   * POST /agent/emergency/pause
   * Emergency circuit breaker toggle
   */
  router.post('/emergency/pause', (req: Request, res: Response): any => {
    const { paused } = req.body;
    defaultPolicyEngine.setGlobalEmergencyPause(Boolean(paused));
    return res.json({ success: true, emergencyPaused: defaultPolicyEngine.isEmergencyPaused() });
  });

  return router;
}
