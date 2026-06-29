import express from 'express';
import serverless from 'serverless-http';
import { createApp } from '../../apps/api/src/app';

const functionApp = express();

functionApp.use('/api', createApp());

export const handler = serverless(functionApp);
