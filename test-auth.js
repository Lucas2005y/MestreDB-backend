// Teste simples para verificar importação do AuthController
console.log('🧪 Iniciando teste de importação...');

try {
  console.log('📦 Carregando reflect-metadata...');
  require('reflect-metadata');
  
  console.log('📦 Carregando AuthController...');
  const { AuthController } = require('./dist/presentation/controllers/AuthController');
  
  console.log('🔧 Criando instância do AuthController...');
  const authController = new AuthController();
  
  console.log('✅ AuthController criado com sucesso!');
} catch (error) {
  console.error('❌ Erro:', error.message);
  console.error('📋 Stack:', error.stack);
}