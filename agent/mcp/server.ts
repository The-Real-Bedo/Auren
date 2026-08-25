import readline from 'readline';
import { AurenTools } from '../tools/aurenTools';
import { AgentIdentity } from '../identity/didKey';
import dotenv from 'dotenv';
import path from 'path';

// Load root .env
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const tools = new AurenTools();

const MCP_TOOL_DEFINITIONS = [
  {
    name: 'list_opportunities',
    description: 'Discover available Arc DApp ventures registered on Auren, including vault addresses, LP profit-sharing terms, and active status.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_dapp_economics',
    description: 'Fetch economic telemetry for a DApp: gas deployed, capital recovered, unrecovered capital, and net profit.',
    inputSchema: {
      type: 'object',
      properties: {
        vaultAddress: { type: 'string', description: 'The isolated DAppVault address on Arc' }
      },
      required: ['vaultAddress']
    }
  },
  {
    name: 'get_vault_status',
    description: 'Query real-time on-chain accounting from an isolated Mudarabah DAppVault (TVL, shares, unrecovered capital).',
    inputSchema: {
      type: 'object',
      properties: {
        vaultAddress: { type: 'string', description: 'The isolated DAppVault address on Arc' }
      },
      required: ['vaultAddress']
    }
  },
  {
    name: 'check_sponsorship',
    description: 'Pre-flight check to verify if a user or agent action is eligible for gas sponsorship under Auren policy.',
    inputSchema: {
      type: 'object',
      properties: {
        vaultAddress: { type: 'string', description: 'Target DAppVault address' },
        targetContract: { type: 'string', description: 'Target contract being invoked' },
        callData: { type: 'string', description: 'Calldata for the interaction' },
        sender: { type: 'string', description: 'Sender account address' },
        maxCost: { type: 'string', description: 'Estimated gas cost in wei' },
        chainId: { type: 'number', description: 'Chain ID (5042002 for Arc Testnet)' }
      },
      required: ['vaultAddress', 'targetContract', 'callData', 'sender', 'maxCost', 'chainId']
    }
  },
  {
    name: 'request_sponsorship',
    description: 'Submit a signed TechnoCore did:key request to obtain approved paymaster sponsorship authorization (paymasterAndData).',
    inputSchema: {
      type: 'object',
      properties: {
        did: { type: 'string', description: 'TechnoCore agent did:key identifier' },
        timestamp: { type: 'number', description: 'Unix epoch timestamp in milliseconds' },
        nonce: { type: 'string', description: 'Unique nonce' },
        action: { type: 'string', description: 'Action name (e.g. requestSponsorship)' },
        payload: {
          type: 'object',
          description: 'Sponsorship request payload containing vaultAddress, targetContract, callData, sender, maxCost, chainId'
        },
        signature: { type: 'string', description: 'Cryptographic signature from the agent did:key' }
      },
      required: ['did', 'timestamp', 'nonce', 'action', 'payload', 'signature']
    }
  },
  {
    name: 'get_transaction_status',
    description: 'Query the confirmation status, gas used, and execution result of a transaction on Arc Testnet.',
    inputSchema: {
      type: 'object',
      properties: {
        txHash: { type: 'string', description: 'Transaction hash on Arc' }
      },
      required: ['txHash']
    }
  }
];

export async function handleMcpRequest(req: any): Promise<any> {
  const { id, method, params } = req;

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: {
          name: 'auren-mcp-server',
          version: '1.0.0'
        }
      }
    };
  }

  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: { tools: MCP_TOOL_DEFINITIONS }
    };
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params;
    try {
      let resultData: any;

      switch (name) {
        case 'list_opportunities':
          resultData = await tools.listOpportunities();
          break;
        case 'get_dapp_economics':
          resultData = await tools.getDAppEconomics(args.vaultAddress);
          break;
        case 'get_vault_status':
          resultData = await tools.getVaultStatus(args.vaultAddress);
          break;
        case 'check_sponsorship':
          resultData = await tools.checkSponsorship(args);
          break;
        case 'request_sponsorship':
          resultData = await tools.requestSponsorship(args);
          break;
        case 'get_transaction_status':
          resultData = await tools.getTransactionStatus(args.txHash);
          break;
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(resultData, null, 2)
            }
          ]
        }
      };
    } catch (err: any) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: err.message || 'Internal tool execution error'
        }
      };
    }
  }

  return {
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method not found: ${method}` }
  };
}

// Stdio JSON-RPC interface for TechnoCore MCP integration
if (require.main === module) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', async (line) => {
    if (!line.trim()) return;
    try {
      const parsed = JSON.parse(line);
      const response = await handleMcpRequest(parsed);
      process.stdout.write(JSON.stringify(response) + '\n');
    } catch (e: any) {
      process.stdout.write(JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error: ' + e.message }
      }) + '\n');
    }
  });

  console.error('[Auren MCP Server] Initialized and listening on stdio');
}
