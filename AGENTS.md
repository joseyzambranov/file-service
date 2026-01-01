# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in this AWS CDK TypeScript file service repository.

## Build/Lint/Test Commands

### Core Commands
```bash
pnpm build      # Compile TypeScript to JavaScript
pnpm watch      # Watch for changes and compile automatically
pnpm test       # Run all Jest unit tests
pnpm lint       # Run ESLint on all files
pnpm lint:fix   # Run ESLint with auto-fix
```

### Running Single Tests
```bash
pnpm test --testNamePattern="test name"           # Run specific test by name
pnpm test test/file-service.test.ts               # Run specific test file
pnpm test --testPathPattern="file-service"        # Run tests matching pattern
pnpm test --coverage                              # Run tests with coverage report
pnpm test --watch                                 # Run tests in watch mode
```

### CDK Commands
```bash
npx cdk deploy              # Deploy stack to default AWS account/region
npx cdk deploy --profile X  # Deploy with specific AWS profile
npx cdk diff                # Compare deployed stack with current state
npx cdk synth               # Emit synthesized CloudFormation template
npx cdk bootstrap           # Bootstrap CDK (if needed)
npx cdk destroy             # Destroy deployed stack
```

## Code Style Guidelines

### TypeScript Configuration
- **Target**: ES2022 with NodeNext module system
- **Strict Mode**: All strict checks enabled (strictNullChecks, noImplicitAny, noImplicitReturns, noImplicitThis)
- **Source Maps**: Inline source maps enabled for debugging
- **Decorators**: Experimental decorators enabled for CDK patterns
- **Property Initialization**: Strict initialization disabled for CDK constructs

### Import Style
```typescript
// CDK core imports
import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

// AWS service imports
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';

// Testing imports
import { Template, Match } from 'aws-cdk-lib/assertions';

// External libraries
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
```

### Naming Conventions
- **Classes**: PascalCase (`FileServiceStack`, `BucketConstruct`)
- **Functions/Methods**: camelCase (`createBucket`, `generatePresignedUrl`)
- **Variables**: camelCase (`bucketName`, `fileKey`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `DEFAULT_REGION`)
- **Files**: kebab-case (`file-service-stack.ts`, `s3-upload-handler.ts`)
- **Interfaces**: PascalCase with 'I' prefix (`IFileServiceProps`)
- **Types**: PascalCase (`FileMetadata`, `UploadConfig`)

### Code Organization
```
bin/
  file-service.ts              # CDK app entry point
lib/
  file-service-stack.ts        # Main stack definition
  constructs/                  # Reusable CDK constructs
  lambda/                      # Lambda function code
    handlers/                  # Lambda handler functions
test/
  file-service.test.ts         # Stack tests
  unit/                        # Unit tests for Lambda functions
doc/                           # Architecture diagrams and documentation
```

### Formatting
- **Indentation**: 2 spaces (no tabs)
- **Line Length**: Soft limit of 100 characters
- **Semicolons**: Required at end of statements
- **Quotes**: Single quotes for strings, except to avoid escaping
- **Trailing Commas**: Use in multiline objects/arrays for cleaner diffs

### Error Handling
```typescript
// CDK construct validation
if (!props.bucketName) {
  throw new Error('bucketName is required');
}

// Lambda function error handling
try {
  const result = await s3Client.send(command);
  return { statusCode: 200, body: JSON.stringify(result) };
} catch (error) {
  console.error('S3 operation failed:', error);
  return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
}
```

### Lambda Function Patterns
```typescript
// Use NodejsFunction for TypeScript Lambda functions
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

const handler = new NodejsFunction(this, 'Handler', {
  entry: 'lib/lambda/handlers/upload.ts',
  handler: 'handler',
  runtime: lambda.Runtime.NODEJS_20_X,
  timeout: cdk.Duration.seconds(30),
  environment: {
    BUCKET_NAME: bucket.bucketName,
  },
});
```

### CDK Best Practices
- Use L2 constructs (e.g., `s3.Bucket`) over L1 (e.g., `CfnBucket`)
- Grant permissions with construct methods (`bucket.grantRead()`) instead of manual IAM policies
- Use `cdk.Duration` and `cdk.Size` for time and size values
- Tag resources for cost tracking and organization
- Use `RemovalPolicy.RETAIN` for production data stores
- Export values with `CfnOutput` for cross-stack references

### Testing Guidelines
```typescript
// CDK stack testing pattern
import { App } from 'aws-cdk-lib/core';
import { Template } from 'aws-cdk-lib/assertions';
import { FileServiceStack } from '../lib/file-service-stack';

test('S3 Bucket Created', () => {
  const app = new App();
  const stack = new FileServiceStack(app, 'TestStack');
  const template = Template.fromStack(stack);
  
  template.hasResourceProperties('AWS::S3::Bucket', {
    BucketEncryption: Match.objectLike({
      ServerSideEncryptionConfiguration: Match.anyValue(),
    }),
  });
});
```

### Type Safety
- Always define return types for public methods
- Use strict TypeScript types, avoid `any`
- Use Zod for runtime validation of external inputs (API requests, environment variables)
- Prefer interfaces for object shapes, types for unions/intersections

### Dependencies
- **AWS CDK**: v2.215.0 (pinned for stability)
- **Runtime Validation**: Zod v4.x
- **Unique IDs**: uuid v13.x
- **Testing**: Jest v29.x with ts-jest
- Keep CDK lib version in sync across `aws-cdk-lib` and `aws-cdk` packages

### Comments & Documentation
```typescript
/**
 * Creates an S3 bucket for file uploads with encryption and lifecycle policies.
 * @param id - Unique construct identifier
 * @param props - Bucket configuration properties
 * @returns S3 Bucket construct
 */
private createBucket(id: string, props: BucketProps): s3.Bucket {
  // Implementation
}
```

### Security Best Practices
- Enable S3 bucket encryption by default
- Block public access on S3 buckets unless explicitly required
- Use IAM roles for Lambda execution, never hardcode credentials
- Validate and sanitize all inputs with Zod schemas
- Use HTTPS-only policies for API endpoints
- Implement CORS policies restrictively
- Use AWS Secrets Manager or Parameter Store for sensitive configuration

### Common Patterns
- **Environment Variables**: Access via `process.env.VARIABLE_NAME` with fallback validation
- **Resource Naming**: Use construct IDs, let CDK generate physical names (unless specific name required)
- **Cross-Stack References**: Export outputs and import in dependent stacks
- **Conditional Resources**: Use CDK context or environment variables for feature flags