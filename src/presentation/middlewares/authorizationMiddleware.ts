import { Request, Response, NextFunction } from 'express';

// Middleware para verificar se o usuário é super usuário
export const requireSuperUser = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Não autenticado',
      message: 'Você precisa estar logado para acessar este recurso'
    });
    return;
  }

  if (!req.user.is_superuser) {
    res.status(403).json({
      error: 'Acesso negado',
      message: 'Apenas super usuários podem acessar este recurso'
    });
    return;
  }

  next();
};

// Middleware para verificar se o usuário pode acessar dados de outro usuário
export const requireOwnershipOrSuperUser = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Não autenticado',
      message: 'Você precisa estar logado para acessar este recurso'
    });
    return;
  }

  const targetUserId = parseInt(req.params.id);
  const currentUserId = req.user.userId;
  const isSuperUser = req.user.is_superuser;

  // Super usuário pode acessar qualquer recurso
  if (isSuperUser) {
    next();
    return;
  }

  // Usuário normal só pode acessar seus próprios dados
  if (targetUserId !== currentUserId) {
    res.status(403).json({
      error: 'Acesso negado',
      message: 'Você só pode acessar seus próprios dados'
    });
    return;
  }

  next();
};

// Middleware para verificar se o usuário pode modificar dados de outro usuário
export const requireOwnershipOrSuperUserForModification = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Não autenticado',
      message: 'Você precisa estar logado para acessar este recurso'
    });
    return;
  }

  const targetUserId = parseInt(req.params.id);
  const currentUserId = req.user.userId;
  const isSuperUser = req.user.is_superuser;

  // Super usuário pode modificar qualquer recurso
  if (isSuperUser) {
    next();
    return;
  }

  // Usuário normal só pode modificar seus próprios dados
  if (targetUserId !== currentUserId) {
    res.status(403).json({
      error: 'Acesso negado',
      message: 'Você só pode modificar seus próprios dados'
    });
    return;
  }

  // Verificar se usuário normal está tentando alterar is_superuser
  if (req.body.is_superuser !== undefined) {
    res.status(403).json({
      error: 'Acesso negado',
      message: 'Você não pode alterar seu nível de privilégio'
    });
    return;
  }

  next();
};

// Middleware para verificar se o usuário pode deletar outro usuário
export const requireSuperUserForDeletion = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Não autenticado',
      message: 'Você precisa estar logado para acessar este recurso'
    });
    return;
  }

  const targetUserId = parseInt(req.params.id);
  const currentUserId = req.user.userId;
  const isSuperUser = req.user.is_superuser;

  // Apenas super usuários podem deletar usuários
  if (!isSuperUser) {
    res.status(403).json({
      error: 'Acesso negado',
      message: 'Apenas super usuários podem deletar usuários'
    });
    return;
  }

  // Super usuário não pode deletar a si mesmo
  if (targetUserId === currentUserId) {
    res.status(403).json({
      error: 'Operação não permitida',
      message: 'Você não pode deletar sua própria conta'
    });
    return;
  }

  next();
};

// Middleware para verificar se o usuário pode listar todos os usuários
export const requireSuperUserForListing = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Não autenticado',
      message: 'Você precisa estar logado para acessar este recurso'
    });
    return;
  }

  if (!req.user.is_superuser) {
    res.status(403).json({
      error: 'Acesso negado',
      message: 'Apenas super usuários podem listar todos os usuários'
    });
    return;
  }

  next();
};

// Middleware para verificar se o usuário pode criar novos usuários
export const requireSuperUserForCreation = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Não autenticado',
      message: 'Você precisa estar logado para acessar este recurso'
    });
    return;
  }

  if (!req.user.is_superuser) {
    res.status(403).json({
      error: 'Acesso negado',
      message: 'Apenas super usuários podem criar novos usuários'
    });
    return;
  }

  next();
};