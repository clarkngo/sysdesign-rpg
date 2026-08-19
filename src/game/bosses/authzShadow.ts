import { mcq, flow, type BossEncounter, type McqCard } from '../types'

const shadowMcqs: Omit<McqCard, 'kind'>[] = [
  {
    id: 'shadow-authn-vs-authz',
    conceptId: 'authn-vs-authz',
    incomingThreat:
      'Login succeeds — then every user can read every other tenant’s records.',
    scenario:
      'The API verifies JWTs correctly but never checks resource ownership or roles on the read path. What failed?',
    category: 'security',
    choices: [
      {
        id: 'A',
        text: 'Authentication worked; authorization is broken — enforce per-resource authz after identity.',
      },
      {
        id: 'B',
        text: 'Authentication failed; delete all passwords and rely on IP allowlists only.',
      },
      {
        id: 'C',
        text: 'TLS termination is optional if the JWT signature verifies.',
      },
      {
        id: 'D',
        text: 'Public endpoints should skip both authn and authz for “simpler debugging.”',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.3,
    xp: 14,
    breakdown: {
      A: 'Authn answers who you are; authz answers what you may do — identity without permission checks is a classic breach.',
      B: 'The login path works; stripping authn makes the hole worse.',
      C: 'JWT checks do not replace transport security.',
      D: 'Skipping both guarantees unauthenticated, unauthorized access.',
    },
    beginner: {
      incomingThreat:
        'People can log in, but any logged-in user can see every tenant’s data.',
      scenario:
        'Tokens verify fine. What is actually broken?',
      choices: [
        {
          id: 'A',
          text: 'Login (authn) works; permission checks (authz) are missing — enforce them per resource.',
        },
        {
          id: 'B',
          text: 'Login failed — delete passwords and trust IP addresses only.',
        },
        {
          id: 'C',
          text: 'You can skip HTTPS if the JWT signature looks valid.',
        },
        {
          id: 'D',
          text: 'Public APIs should skip both login and permission checks.',
        },
      ],
      breakdown: {
        A: 'Knowing who someone is is not the same as allowing the action.',
        B: 'Login works; removing it makes things worse.',
        C: 'Token checks do not replace encrypted transport.',
        D: 'Skipping both is an open door.',
      },
    },
  },
  {
    id: 'shadow-least-privilege',
    conceptId: 'least-privilege-iam',
    incomingThreat:
      'A batch job’s IAM role can delete production buckets it never needs to touch.',
    scenario:
      'A confused-deputy style risk appears: a privileged service is tricked into acting on attacker-chosen resources. Best IAM posture?',
    category: 'security',
    choices: [
      {
        id: 'A',
        text: 'Least privilege: narrow actions/resources, constrain tokens/scopes, avoid overly powerful deputies.',
      },
      {
        id: 'B',
        text: 'Grant AdministratorAccess to every microservice for fewer 403s.',
      },
      {
        id: 'C',
        text: 'Embed long-lived root credentials in container images.',
      },
      {
        id: 'D',
        text: 'Share one God-mode service account across all environments.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 22,
    bossHealOnMiss: 7,
    uptimePenalty: 0.32,
    xp: 15,
    breakdown: {
      A: 'Least privilege and tight scopes shrink blast radius and blunt confused-deputy abuse.',
      B: 'Admin everywhere maximizes damage when any service is compromised.',
      C: 'Root in images is a credential-leak catastrophe.',
      D: 'Cross-env god accounts turn one breach into everywhere.',
    },
    beginner: {
      incomingThreat:
        'A job role can delete prod buckets it does not need — and might be tricked into doing so.',
      scenario:
        'What IAM posture reduces confused-deputy damage?',
      choices: [
        {
          id: 'A',
          text: 'Least privilege: narrow permissions and token scopes; avoid overpowered deputies.',
        },
        {
          id: 'B',
          text: 'Give every service full admin so nothing gets a 403.',
        },
        {
          id: 'C',
          text: 'Put root credentials inside container images.',
        },
        {
          id: 'D',
          text: 'Share one all-powerful account across every environment.',
        },
      ],
      breakdown: {
        A: 'Small permissions mean small blast radius.',
        B: 'Admin everywhere makes every hack catastrophic.',
        C: 'Root in images will leak.',
        D: 'One shared god account spreads breaches everywhere.',
      },
    },
  },
  {
    id: 'shadow-gateway-scope',
    conceptId: 'api-gateway-token-scope',
    incomingThreat:
      'Clients call internal admin RPCs with a broad user token meant only for read APIs.',
    scenario:
      'An API gateway should authenticate, authorize, and often rate-limit. Tokens arrive with oversized scopes. Correct control?',
    category: 'security',
    choices: [
      {
        id: 'A',
        text: 'Enforce authn + fine-grained authz/scopes at the gateway (and services); rate-limit; audit.',
      },
      {
        id: 'B',
        text: 'Trust any bearer token that is non-empty and skip scope checks.',
      },
      {
        id: 'C',
        text: 'Expose admin RPCs on the public internet without the gateway.',
      },
      {
        id: 'D',
        text: 'Disable rate limits during incidents so attackers can “finish faster.”',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 20,
    bossHealOnMiss: 8,
    uptimePenalty: 0.28,
    xp: 14,
    breakdown: {
      A: 'Gateway + service authz, minimal scopes, rate limits, and audit trails are the defense-in-depth path.',
      B: 'Non-empty tokens without scope checks invite privilege escalation.',
      C: 'Bypassing the gateway removes a critical control point.',
      D: 'Dropping rate limits during abuse accelerates compromise.',
    },
    beginner: {
      incomingThreat:
        'A normal user token is being used to call powerful admin APIs.',
      scenario:
        'What should the API gateway and services enforce?',
      choices: [
        {
          id: 'A',
          text: 'Verify identity, check scopes/permissions, rate-limit, and audit.',
        },
        {
          id: 'B',
          text: 'Accept any non-empty bearer token and skip scope checks.',
        },
        {
          id: 'C',
          text: 'Put admin APIs on the public internet without the gateway.',
        },
        {
          id: 'D',
          text: 'Turn off rate limits during attacks so traffic flows faster.',
        },
      ],
      breakdown: {
        A: 'Authn, authz/scopes, limits, and audits belong together.',
        B: 'Any token without scope checks is privilege escalation bait.',
        C: 'Skipping the gateway removes a major control.',
        D: 'No rate limits help attackers.',
      },
    },
  },
]

const shadowFlow = flow({
  id: 'shadow-authz-path',
  conceptId: 'shadow-authz-path',
  incomingThreat:
    'The shadow scrambled your access path — security hops are out of order.',
  scenario:
    'Order the safe request path: authenticate, authorize, rate-limit at the gateway, then audit.',
  category: 'security',
  damageOnHit: 18,
  bossHealOnMiss: 7,
  uptimePenalty: 0.3,
  xp: 16,
  stages: [
    {
      id: 'authenticate',
      label: 'Authenticate',
      rationale: 'Establish identity (token/session) before any privileged work.',
    },
    {
      id: 'authorize',
      label: 'Authorize',
      rationale: 'Check roles, scopes, and resource ownership for this action.',
    },
    {
      id: 'gateway-limit',
      label: 'Rate-limit / gateway',
      rationale: 'Enforce edge controls so abuse and confused-deputy fan-out are bounded.',
    },
    {
      id: 'audit',
      label: 'Audit',
      rationale: 'Record who did what for detection and forensics.',
    },
  ],
  distractors: [
    {
      id: 'trust-token',
      label: 'Trust any bearer string',
      rationale: 'Skipping real authn/authz is an open door.',
    },
    {
      id: 'skip-audit',
      label: 'Skip audit logs',
      rationale: 'Without audit you cannot investigate breaches.',
    },
  ],
  beginner: {
    incomingThreat:
      'The access steps are mixed up — put the secure path back in order.',
    scenario:
      'Order: prove who they are → check permissions → rate-limit at the gateway → write an audit log.',
    stages: [
      {
        id: 'authenticate',
        label: 'Authenticate',
        rationale: 'Confirm identity first.',
      },
      {
        id: 'authorize',
        label: 'Authorize',
        rationale: 'Check they are allowed to do this.',
      },
      {
        id: 'gateway-limit',
        label: 'Rate-limit at gateway',
        rationale: 'Bound abuse at the edge.',
      },
      {
        id: 'audit',
        label: 'Audit',
        rationale: 'Log the action for later review.',
      },
    ],
    distractors: [
      {
        id: 'trust-token',
        label: 'Trust any token string',
        rationale: 'That skips real security checks.',
      },
      {
        id: 'skip-audit',
        label: 'Skip audit logs',
        rationale: 'You need logs to investigate incidents.',
      },
    ],
  },
})

const shadowVariantMcqs: Record<string, Omit<McqCard, 'kind'>> = {
  'authn-vs-authz': {
    id: 'shadow-authn-vs-authz-v2',
    conceptId: 'authn-vs-authz',
    incomingThreat:
      'SSO is green, but IDOR reports keep landing in the security inbox.',
    scenario:
      'Reinforcement: valid login, unauthorized data access. What layer failed?',
    category: 'security',
    choices: [
      {
        id: 'A',
        text: 'Authorization — enforce object-level / role checks after authn.',
      },
      {
        id: 'B',
        text: 'DNSSEC — unrelated to tenant isolation.',
      },
      {
        id: 'C',
        text: 'Gzip compression settings on static assets.',
      },
      {
        id: 'D',
        text: 'CDN cache TTLs for marketing pages.',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.26,
    xp: 12,
    breakdown: {
      A: 'IDOR after successful login is an authz failure, not an authn outage.',
      B: 'DNSSEC does not enforce per-resource permissions.',
      C: 'Compression is unrelated to access control.',
      D: 'Marketing CDN TTLs do not gate tenant data APIs.',
    },
    beginner: {
      incomingThreat: 'Login works, but users can still open other people’s records.',
      scenario: 'Which layer failed?',
      choices: [
        {
          id: 'A',
          text: 'Authorization — check permissions on each object after login.',
        },
        {
          id: 'B',
          text: 'DNSSEC settings.',
        },
        {
          id: 'C',
          text: 'Gzip on static files.',
        },
        {
          id: 'D',
          text: 'CDN cache time for marketing pages.',
        },
      ],
      breakdown: {
        A: 'That is missing permission checks (authz).',
        B: 'DNSSEC is not tenant isolation.',
        C: 'Compression is unrelated.',
        D: 'Marketing CDN TTLs do not protect APIs.',
      },
    },
  },
  'least-privilege-iam': {
    id: 'shadow-least-privilege-v2',
    conceptId: 'least-privilege-iam',
    incomingThreat:
      'A support tool with wide IAM is coerced into deleting a bucket it should never touch.',
    scenario:
      'Reinforcement: confused deputy + over-permissioned role. Correct response?',
    category: 'security',
    choices: [
      {
        id: 'A',
        text: 'Shrink IAM to least privilege; constrain callable resources and token scopes.',
      },
      {
        id: 'B',
        text: 'Widen the role further so the tool never asks for elevation.',
      },
      {
        id: 'C',
        text: 'Pass end-user credentials through verbatim without audience checks.',
      },
      {
        id: 'D',
        text: 'Disable MFA on the deputy “for automation speed.”',
      },
    ],
    correct: 'A',
    hintEliminate: 'B',
    damageOnHit: 18,
    bossHealOnMiss: 7,
    uptimePenalty: 0.25,
    xp: 12,
    breakdown: {
      A: 'Least privilege and scoped authority blunt confused-deputy attacks.',
      B: 'Widening permissions increases blast radius.',
      C: 'Passthrough creds without audience checks invite abuse.',
      D: 'Dropping MFA weakens the control plane.',
    },
    beginner: {
      incomingThreat: 'A powerful support tool was tricked into a dangerous delete.',
      scenario: 'What IAM change helps?',
      choices: [
        {
          id: 'A',
          text: 'Shrink permissions to least privilege and tighten token scopes.',
        },
        {
          id: 'B',
          text: 'Give the tool even broader permissions.',
        },
        {
          id: 'C',
          text: 'Forward user credentials with no audience checks.',
        },
        {
          id: 'D',
          text: 'Turn off MFA on the tool for speed.',
        },
      ],
      breakdown: {
        A: 'Smaller permissions mean smaller damage.',
        B: 'Broader permissions make deputies more dangerous.',
        C: 'Passthrough creds without checks invite abuse.',
        D: 'No MFA weakens security.',
      },
    },
  },
  'api-gateway-token-scope': {
    id: 'shadow-gateway-scope-v2',
    conceptId: 'api-gateway-token-scope',
    incomingThreat:
      'Broad scopes let a mobile token call privileged admin routes through the gateway.',
    scenario:
      'Reinforcement: gateway auth controls. Choose the right set.',
    category: 'security',
    choices: [
      {
        id: 'A',
        text: 'Validate tokens, enforce minimal scopes/authz, rate-limit, and audit.',
      },
      {
        id: 'B',
        text: 'Strip the Authorization header and trust internal network location.',
      },
      {
        id: 'C',
        text: 'Allow scope “*” on all client apps for convenience.',
      },
      {
        id: 'D',
        text: 'Log tokens in plaintext access logs for “debuggability.”',
      },
    ],
    correct: 'A',
    hintEliminate: 'C',
    damageOnHit: 18,
    bossHealOnMiss: 6,
    uptimePenalty: 0.24,
    xp: 12,
    breakdown: {
      A: 'Identity + least scope + limits + audit is the gateway baseline.',
      B: 'Network location is not a substitute for authn/authz.',
      C: 'Wildcard scopes defeat least privilege.',
      D: 'Logging tokens creates credential leakage.',
    },
    beginner: {
      incomingThreat: 'A mobile token with huge scopes can hit admin routes.',
      scenario: 'What should the gateway enforce?',
      choices: [
        {
          id: 'A',
          text: 'Validate the token, check minimal scopes, rate-limit, and audit.',
        },
        {
          id: 'B',
          text: 'Drop the auth header and trust the internal network.',
        },
        {
          id: 'C',
          text: 'Give every app a “*” scope.',
        },
        {
          id: 'D',
          text: 'Write raw tokens into access logs.',
        },
      ],
      breakdown: {
        A: 'That is the secure gateway baseline.',
        B: 'Network location is not identity or permission.',
        C: 'Wildcard scopes break least privilege.',
        D: 'Logging tokens leaks credentials.',
      },
    },
  },
}

const shadowFlowVariant = flow({
  id: 'shadow-authz-path-v2',
  conceptId: 'shadow-authz-path',
  incomingThreat:
    'Path drill: the shadow shuffled authenticate → authorize → gateway → audit.',
  scenario:
    'Reinforcement: order the secure request path through the API gateway.',
  category: 'security',
  damageOnHit: 16,
  bossHealOnMiss: 6,
  uptimePenalty: 0.25,
  xp: 12,
  stages: [
    {
      id: 'authenticate',
      label: 'Authenticate',
      rationale: 'Prove identity first.',
    },
    {
      id: 'authorize',
      label: 'Authorize',
      rationale: 'Check permission for this action.',
    },
    {
      id: 'gateway-limit',
      label: 'Gateway rate-limit',
      rationale: 'Bound abuse at the edge.',
    },
    {
      id: 'audit',
      label: 'Audit',
      rationale: 'Record the decision and action.',
    },
  ],
  distractors: [
    {
      id: 'trust-token',
      label: 'Accept any bearer',
      rationale: 'That skips real verification.',
    },
  ],
  beginner: {
    incomingThreat: 'The secure path order got scrambled again.',
    scenario: 'Put authenticate → authorize → rate-limit → audit back in order.',
    stages: [
      {
        id: 'authenticate',
        label: 'Authenticate',
        rationale: 'Who is calling?',
      },
      {
        id: 'authorize',
        label: 'Authorize',
        rationale: 'Are they allowed?',
      },
      {
        id: 'gateway-limit',
        label: 'Rate-limit',
        rationale: 'Bound abuse.',
      },
      {
        id: 'audit',
        label: 'Audit',
        rationale: 'Log it.',
      },
    ],
    distractors: [
      {
        id: 'trust-token',
        label: 'Trust any bearer',
        rationale: 'That skips real checks.',
      },
    ],
  },
})

export const authzShadow: BossEncounter = {
  id: 'authz-shadow',
  name: 'Authz Shadow',
  blurb:
    'Identity without permission is a ghost in your APIs — authenticate, authorize, then audit what slipped through.',
  maxHp: 91,
  threatType: 'Security',
  artKey: 'shadow',
  deck: [mcq(shadowMcqs[0]), mcq(shadowMcqs[1]), shadowFlow, mcq(shadowMcqs[2])],
  variants: {
    ...Object.fromEntries(
      Object.entries(shadowVariantMcqs).map(([k, v]) => [k, mcq(v)]),
    ),
    'shadow-authz-path': shadowFlowVariant,
  },
}
