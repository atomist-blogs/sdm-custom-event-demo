import { HandlerContext, logger, OnEvent } from "@atomist/automation-client";

export function detectDeployment(): OnEvent {
    return async (e: any, context: HandlerContext) => {
        logger.info(`event currently untyped ${JSON.stringify(e)}`);
        return {
            code: 0,
        };
    };
}
