#!/usr/bin/env ts-node

/**
 * Script para exibir documentação das variáveis de ambiente
 *
 * Uso: npm run env:docs
 */

import { getEnvDocumentation } from '../infrastructure/config/envValidator';

console.log(getEnvDocumentation());
