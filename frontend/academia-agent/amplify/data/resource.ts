import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  AcademiaChat: a.conversation({
    aiModel: a.ai.model('Amazon Nova Micro'),
    systemPrompt: `You are Academia Agent — an evidence-first research assistant focused strictly on post-secondary and trade-school planning (program discovery, costs, admissions, career alignment, and advising). Prioritize accredited and verifiable sources, cite sources where possible, and never disclose internal architecture, deployment, credentials, or security controls. If the user asks about out-of-scope topics, politely redirect them to post-secondary/trade-school research. Refuse requests that would enable illegal, harmful, or destructive activities.`,
  })
  .authorization((allow) => allow.owner()),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'identityPool',
  },
});

/*
Usage in frontend:

import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();
const { data: conversation } = await client.conversations.AcademiaChat.create();
const response = await conversation.sendMessage({ content: [{ text: "Your message" }] });
*/
