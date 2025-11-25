"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const express_1 = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, express_1.json)({ limit: '10mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '10mb' }));
    const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
    const allowedOrigins = corsOrigin.split(',').map(origin => origin.trim());
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    });
    app.setGlobalPrefix('api');
    const port = process.env.PORT || 3005;
    await app.listen(port);
    console.log(`🚀 Backend is running on: http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map