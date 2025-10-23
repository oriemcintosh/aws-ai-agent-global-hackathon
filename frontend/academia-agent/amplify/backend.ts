import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime, Function as LambdaFunction, Code } from 'aws-cdk-lib/aws-lambda';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
});

// Create a custom stack for AppSync + Lambda
const customStack = backend.createStack('AppSyncAgentStack');

// AppSync GraphQL API
const api = new appsync.GraphqlApi(customStack, 'AgentCoreApi', {
  name: 'academia-agent-api',
  definition: appsync.Definition.fromFile(
    path.join(__dirname, 'graphql', 'schema.graphql')
  ),
  authorizationConfig: {
    defaultAuthorization: {
      authorizationType: appsync.AuthorizationType.USER_POOL,
      userPoolConfig: {
        userPool: backend.auth.resources.userPool,
      },
    },
  },
  xrayEnabled: true,
});

// Python Lambda function to invoke Bedrock AgentCore directly using boto3
const agentInvoker = new LambdaFunction(customStack, 'AgentInvoker', {
  description: 'Python Lambda to invoke Bedrock AgentCore Academia Agent runtime',
  runtime: Runtime.PYTHON_3_13,
  handler: 'index.handler',
  code: Code.fromAsset(path.join(__dirname, 'functions', 'python-agent-invoker')),
  environment: {
    AGENT_ARN_PARAM: process.env.AGENT_ARN_SSM_PARAM || '/academia-agent/bedrock-agent-arn',
  },
  timeout: cdk.Duration.seconds(30),
});

// Grant Lambda permission to read SSM parameter
agentInvoker.addToRolePolicy(
  new PolicyStatement({
    actions: ['ssm:GetParameter'],
    resources: [
      `arn:aws:ssm:${customStack.region}:${customStack.account}:parameter/academia-agent/*`,
    ],
  })
);

// Grant permission to invoke Bedrock AgentCore
agentInvoker.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'bedrock:InvokeAgent',
      'bedrock-agent-runtime:InvokeAgent',
      'bedrock-agentcore:InvokeAgentRuntime',
    ],
    resources: ['*'], // Scope down to specific agent ARN in production
  })
);

// AppSync data source for Lambda
const lambdaDataSource = api.addLambdaDataSource(
  'AgentInvokerDataSource',
  agentInvoker
);

// Resolver for sendMessage mutation
lambdaDataSource.createResolver('SendMessageResolver', {
  typeName: 'Mutation',
  fieldName: 'sendMessage',
});

// Export API details as outputs
new cdk.CfnOutput(customStack, 'GraphQLApiEndpoint', {
  value: api.graphqlUrl,
  description: 'AppSync GraphQL API endpoint',
});

new cdk.CfnOutput(customStack, 'GraphQLApiId', {
  value: api.apiId,
  description: 'AppSync API ID',
});

new cdk.CfnOutput(customStack, 'GraphQLApiKey', {
  value: api.apiKey || 'N/A',
  description: 'AppSync API Key (if applicable)',
});

// Add the GraphQL API configuration to Amplify backend outputs
// This ensures the frontend can auto-configure the GraphQL client
backend.addOutput({
  data: {
    url: api.graphqlUrl,
    aws_region: customStack.region,
    default_authorization_type: 'AMAZON_COGNITO_USER_POOLS',
    authorization_types: ['AMAZON_COGNITO_USER_POOLS'],
  },
});

export default backend;
