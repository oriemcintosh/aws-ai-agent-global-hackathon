import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  AcademiaChat: a.conversation({
    aiModel: a.ai.model('Claude 3 Haiku'),
    systemPrompt: `You are a helpful assistant for college and university planning. Help users find information about academic programs, admissions, and costs.`,
  })
  .authorization((allow) => allow.owner()),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
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
