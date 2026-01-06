import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

type ApiHandler = (req: NextRequest, context: any) => Promise<NextResponse>;

interface ErrorResponse {
    request_id: string;
    error: {
        type: 'PRISMA_KNOWN' | 'PRISMA_INIT' | 'PRISMA_VALIDATION' | 'VALIDATION' | 'UNKNOWN';
        code?: string;
        message: string;
        details?: any;
    };
}

export function withApiErrorHandling(handler: ApiHandler): ApiHandler {
    return async (req: NextRequest, context: any) => {
        const requestId = crypto.randomUUID();
        const method = req.method;
        const url = req.url;

        try {
            // Log Request Start
            console.log(`[API] ${method} ${url} | ID: ${requestId} | Started`);

            const response = await handler(req, context);

            // Log Request Success (if no error thrown)
            console.log(`[API] ${method} ${url} | ID: ${requestId} | Success | Status: ${response.status}`);

            return response;
        } catch (error: any) {
            console.error(`[API] ${method} ${url} | ID: ${requestId} | Failed`, error);

            let status = 500;
            let errorType: ErrorResponse['error']['type'] = 'UNKNOWN';
            let errorCode: string | undefined = undefined;
            let errorMessage = 'Internal Server Error';
            let errorDetails: any = undefined;

            // Handle Prisma Client Initialization Error (DB connection issues)
            if (error instanceof Prisma.PrismaClientInitializationError) {
                status = 503; // Service Unavailable
                errorType = 'PRISMA_INIT';
                errorMessage = 'Database connection failed';
                errorDetails = 'Unable to connect to the database. Please check your connection settings.';
            }
            // Handle Prisma Known Request Errors (e.g. P2002, P2025)
            else if (error instanceof Prisma.PrismaClientKnownRequestError) {
                status = 400;
                errorType = 'PRISMA_KNOWN';
                errorCode = error.code;
                errorMessage = 'Database operation failed';

                if (error.code === 'P2002') {
                    status = 409;
                    errorMessage = 'Unique constraint violation';
                } else if (error.code === 'P2025') {
                    status = 404;
                    errorMessage = 'Record not found';
                }

                errorDetails = error.meta;
            }
            // Handle Prisma Validation Errors (e.g. Invalid field)
            else if (error instanceof Prisma.PrismaClientValidationError) {
                status = 400;
                errorType = 'PRISMA_VALIDATION';
                errorMessage = 'Invalid database input';
                errorDetails = error.message.split('\n').filter(l => l.includes('Unknown argument') || l.includes('Invalid'));
            }
            // Handle JSON parsing errors
            else if (error instanceof SyntaxError) {
                status = 400;
                errorType = 'VALIDATION';
                errorMessage = 'Invalid JSON payload';
            }
            // Fallback: Use error.message if available
            else if (error.message) {
                errorMessage = error.message;
            }

            const errorResponse: ErrorResponse = {
                request_id: requestId,
                error: {
                    type: errorType,
                    code: errorCode,
                    message: errorMessage,
                    details: errorDetails
                }
            };

            return NextResponse.json(errorResponse, { status });
        }
    };
}
