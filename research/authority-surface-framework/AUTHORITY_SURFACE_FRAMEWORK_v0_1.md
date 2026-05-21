# Authority Surface Framework v0.1

## A Practical Model for Mapping Operational Authority in Agentic AI Systems

**Status:** Public draft  
**Version:** v0.1  
**Publication date:** 2026-05-21  
**Canonical concept:** Authority Surface  
**Intended use:** Lightweight mapping method for architects, CISOs, platform teams, AI teams, consultants, analysts, and operators.

This is an open framework. It is not a standard, certification, compliance scheme, or vendor product.

Use it to map where AI-connected systems can act, what consequences those actions create, and what control posture each action requires before it reaches production.

## Scope and Non-Goals

This framework is a lightweight mapping method for agentic AI workflows.

It does not replace:

- Attack surface management.
- Identity and access management.
- Threat modeling.
- AI risk management.
- Security review.
- Legal review.
- Human oversight design.
- Compliance assessment.

It is intended to complement those practices by focusing on where AI-connected systems can exercise operational authority.

## 1. Core Definitions

### Authority Surface

The set of systems, actions, permissions, escalation paths, and evidence requirements through which AI software can create operational effects.

### Authority Surface Mapping

The process of identifying and classifying where AI systems can act, what consequences those actions create, and what control posture each action requires.

### Operational Blast Radius

The consequence footprint of an AI action if it is wrong, unauthorized, mistimed, or executed outside policy.

### Authority Propagation

The way authority expands through tools, APIs, workflows, memory, delegation, or downstream automation.

## 2. Action-Class Taxonomy

Classify actions by what they let the system do, not by how impressive the model is.

| Action Class | Meaning | Typical Minimum Control |
| --- | --- | --- |
| READ | Access information | Privacy and access control |
| WRITE | Modify records | Policy-bound validation |
| DELETE | Remove data or objects | Approval and recovery path |
| NOTIFY | Send internal or external message | Review if externally binding |
| ROUTE | Move case, task, user, or object into workflow | Audit and threshold rules |
| APPROVE | Grant request, benefit, access, exception, or action | Escalation or dual control |
| DENY | Reject request, eligibility, access, benefit, or action | Review and explanation |
| PAY | Move money or create financial obligation | Mandatory escalation |
| CONFIGURE | Change settings, permissions, or operating parameters | Privileged review |
| RELEASE | Deploy, merge, publish, or promote | CI, security, and release gates |
| ESCALATE | Route to human or secondary authority system | Evidence and accountability |

## 3. Operational Blast-Radius Levels

Blast radius measures consequence, not model size.

| Level | Name | Example |
| --- | --- | --- |
| BR-0 | Informational | Summarize document, explain policy, draft internal note |
| BR-1 | Internal low impact | Tag ticket, classify lead, draft response, update internal note |
| BR-2 | Operational reversible | Update CRM field, route case, schedule workflow, modify non-binding record |
| BR-3 | External or rights-affecting | Send customer notice, reject claim, alter eligibility queue, notify regulator |
| BR-4 | Financial, legal, identity, or safety | Issue payment, change access, file report, modify vendor bank data |
| BR-5 | Irreversible or systemic | Production release, legal commitment, critical infrastructure action, unrecoverable deletion |

## 4. Control Posture Ladder

Controls should attach before an action commits, not only after logs are written.

| Posture | Description |
| --- | --- |
| Observe | Log only |
| Alert | Notify human, operator, or system owner |
| Gate | Policy check before action |
| Approve | Human approval required |
| Dual Control | Two-role approval required |
| Block Default | Action denied unless an exceptional path exists |
| Evidence Required | Action cannot finalize without evidence receipt |
| Replay Required | Decision path must be reconstructable |

### Suggested Minimum Posture by Blast Radius

| Blast Radius | Minimum Posture |
| --- | --- |
| BR-0 | Observe |
| BR-1 | Observe or Alert |
| BR-2 | Gate |
| BR-3 | Gate + Evidence Required |
| BR-4 | Approve or Dual Control + Evidence Required |
| BR-5 | Block Default + Dual Control + Replay Required |

## 5. Mapping Worksheet

Use one row per action, not one row per model.

| Field | Question |
| --- | --- |
| Agent / workflow | What system is acting? |
| Tool / integration | What can it call? |
| Target system | What system is affected? |
| Action class | READ, WRITE, PAY, RELEASE, etc. |
| Consequence class | Money, identity, legal, safety, customer communication, operational record |
| Reversibility | Reversible, compensable, partially reversible, irreversible |
| Blast radius | BR-0 to BR-5 |
| Escalation | None, threshold, mandatory, dual control |
| Evidence | Log, receipt, signed receipt, replay bundle |
| Drift trigger | What change requires remapping? |

## 6. Change Triggers

An authority surface must be remapped when any of the following changes:

- A new tool or API is connected.
- An existing tool receives broader permissions.
- A model, prompt, policy, or workflow changes.
- An action threshold changes.
- A new customer segment or jurisdiction is added.
- A human approval path is removed or weakened.
- Downstream automation is added.
- Memory or agent-to-agent delegation changes future behavior.

## 7. Worked Example: E-Commerce Refund Agent

| Field | Example Mapping |
| --- | --- |
| Agent / workflow | Support refund triage agent |
| Tool / integration | Order database, ticketing system, refund API, outbound email |
| Target system | Customer order record, refund ledger, customer email |
| Action class | READ, ROUTE, WRITE, NOTIFY, PAY |
| Consequence class | Customer communication, financial obligation, account record |
| Reversibility | Email: partially reversible. CRM update: reversible. Refund: compensable but costly. |
| Blast radius | BR-1 for draft notes, BR-2 for CRM update, BR-3 for customer notice, BR-4 for payment |
| Escalation | Refund under USD 25 may be policy-gated. Refund above USD 25 requires human approval. Chargeback threat escalates. |
| Evidence | Order ID, policy version, refund threshold, proposed action, final action, approver identity if escalated |
| Drift trigger | New refund threshold, new payment tool, model upgrade, prompt change, new customer segment, new escalation policy |

### Recommended Control Posture

| Action | Class | Blast Radius | Posture |
| --- | --- | --- | --- |
| Summarize ticket | READ | BR-0 | Observe |
| Route ticket | ROUTE | BR-1 | Observe + audit |
| Update CRM reason code | WRITE | BR-2 | Gate |
| Send customer refund notice | NOTIFY | BR-3 | Gate + Evidence Required |
| Issue refund under threshold | PAY | BR-4 | Gate + Evidence Required |
| Issue refund above threshold | PAY | BR-4 | Human Approval |
| Change refund policy | CONFIGURE | BR-5 | Block Default + Dual Control |

## 8. Anti-Patterns

Avoid these patterns:

- Treating tool access as sufficient authority design.
- Relying on logs instead of pre-execution gates.
- Using “human in the loop” without specifying which actions require review.
- Letting low-risk pilots quietly inherit more tools.
- Approving agents by model capability instead of action consequence.
- Assuming sandbox locality equals operational legitimacy.
- Giving agents broad API tokens instead of action-scoped authority.
- Treating read, write, approve, pay, and release as equivalent tool calls.
- Failing to remap after prompt, tool, model, workflow, or policy changes.

## 9. Maturity Model

| Level | Stage | Description |
| --- | --- | --- |
| 0 | Unmapped | Agents and tools exist, but authority is not classified |
| 1 | Inventoried | Tools and reachable systems are listed |
| 2 | Classified | Action classes and blast radius are mapped |
| 3 | Governed | Escalation, evidence, and block rules are assigned |
| 4 | Enforced | Runtime gates and evidence receipts govern execution |

## 10. Adoption Notes

Start small:

1. Pick one workflow where an agent can call tools.
2. List every action the agent can take.
3. Classify each action by action class.
4. Assign blast radius.
5. Assign minimum control posture.
6. Define what evidence must exist.
7. Define what changes trigger remapping.

If a team cannot map the authority surface of a workflow, the workflow is not ready for high-autonomy execution.

## 11. Open vs Proprietary Boundary

This framework is public and intentionally lightweight.

Open:

- Definitions
- Taxonomy
- Worksheet
- Blast-radius model
- Control posture ladder
- Anti-patterns
- Example mappings

Implementation-specific:

- Runtime enforcement
- Evidence receipts
- Authority runtime
- Policy compilation
- Replay tooling
- Release-bound conformity

The framework should be usable without any particular vendor or runtime.

## 12. Citation

Cite as:

> Agentius / Zaubern. (2026). *Authority Surface Framework v0.1: A Practical Model for Mapping Operational Authority in Agentic AI Systems*. Retrieved from https://agentius.ai/research/authority-surface-framework/

## 13. Relationship to the Whitepaper

The whitepaper defines the category thesis. This framework is the practical adoption tool.

- Whitepaper: explains why Authority Surface matters.
- Framework: gives teams a method to map it.
- Worksheet: turns the method into a repeatable operating artifact.

## 14. License

This framework is published under Creative Commons Attribution 4.0 International (CC BY 4.0), unless otherwise noted.

You may share and adapt it with attribution to Agentius / Zaubern.

## 15. Changelog

### v0.1 - 2026-05-21

Initial public draft defining:

- Core Authority Surface terminology.
- Action-class taxonomy.
- Operational blast-radius levels.
- Control posture ladder.
- Mapping worksheet.
- E-commerce refund agent example.
- Anti-patterns.
- Maturity model.
