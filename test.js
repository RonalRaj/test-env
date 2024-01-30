import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import { Stack, StackProps } from "aws-cdk-lib";

const GITHUB_ISSUER = "token.actions.githubusercontent.com";

export class GitHubActionsStack extends Construct {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id);

        const oidcProvider = new iam.OpenIdConnectProvider(this, "github-oidc-provider", {
            url: `https://${GITHUB_ISSUER}`,
            clientIds: ["sts.amazonaws.com"],
            thumbprints: ["6938fd4d98bab03faadb97b34396831e3680aea1", "1c58a3a8518e8759bf078b76b750d4f2df264fcd"],
        });

        new iam.Role(this, "github-actions-role", {
            roleName: "github-actions",
            assumedBy: new iam.OpenIdConnectPrincipal(oidcProvider, {
                StringLike: {
                    [`${GITHUB_ISSUER}:sub`]: ["repo:cloudion-ai/server-*"],
                },
            }),
            inlinePolicies: {
                cdk: new iam.PolicyDocument({
                    assignSids: true,
                    statements: [
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: [
                                "s3:*" // This grants all S3 actions, adjust permissions as needed
                            ],
                            resources: ["*"] // This allows access to all S3 resources, you may want to restrict this to specific buckets
                        }),
                    ],
                }),
            },
        });
    }
}