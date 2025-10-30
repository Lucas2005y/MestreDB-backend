import { Application } from 'express';
import { AppFactory } from './factories/AppFactory';

/**
 * Cria e configura a aplicação Express usando factories
 */
export async function createApp(): Promise<Application> {
  return await AppFactory.create();
}