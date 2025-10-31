/**
 * Implementação do padrão Either para tratamento funcional de erros
 * Inspirado em linguagens funcionais como Haskell e Scala
 */

export abstract class Either<L, R> {
  abstract isLeft(): this is Left<L, R>;
  abstract isRight(): this is Right<L, R>;

  /**
   * Aplica uma função se for Right, caso contrário retorna Left
   */
  abstract map<U>(fn: (value: R) => U): Either<L, U>;

  /**
   * Aplica uma função que retorna Either se for Right
   */
  abstract flatMap<U>(fn: (value: R) => Either<L, U>): Either<L, U>;

  /**
   * Aplica uma função se for Left
   */
  abstract mapLeft<U>(fn: (value: L) => U): Either<U, R>;

  /**
   * Retorna o valor Right ou um valor padrão
   */
  abstract getOrElse(defaultValue: R): R;

  /**
   * Executa uma função se for Right
   */
  abstract ifRight(fn: (value: R) => void): Either<L, R>;

  /**
   * Executa uma função se for Left
   */
  abstract ifLeft(fn: (value: L) => void): Either<L, R>;

  /**
   * Aplica uma das duas funções dependendo do tipo
   */
  abstract fold<U>(leftFn: (left: L) => U, rightFn: (right: R) => U): U;
}

export class Left<L, R> extends Either<L, R> {
  constructor(public readonly value: L) {
    super();
  }

  isLeft(): this is Left<L, R> {
    return true;
  }

  isRight(): this is Right<L, R> {
    return false;
  }

  map<U>(_fn: (value: R) => U): Either<L, U> {
    return new Left<L, U>(this.value);
  }

  flatMap<U>(_fn: (value: R) => Either<L, U>): Either<L, U> {
    return new Left<L, U>(this.value);
  }

  mapLeft<U>(fn: (value: L) => U): Either<U, R> {
    return new Left<U, R>(fn(this.value));
  }

  getOrElse(defaultValue: R): R {
    return defaultValue;
  }

  ifRight(_fn: (value: R) => void): Either<L, R> {
    return this;
  }

  ifLeft(fn: (value: L) => void): Either<L, R> {
    fn(this.value);
    return this;
  }

  fold<U>(leftFn: (left: L) => U, _rightFn: (right: R) => U): U {
    return leftFn(this.value);
  }
}

export class Right<L, R> extends Either<L, R> {
  constructor(public readonly value: R) {
    super();
  }

  isLeft(): this is Left<L, R> {
    return false;
  }

  isRight(): this is Right<L, R> {
    return true;
  }

  map<U>(fn: (value: R) => U): Either<L, U> {
    return new Right<L, U>(fn(this.value));
  }

  flatMap<U>(fn: (value: R) => Either<L, U>): Either<L, U> {
    return fn(this.value);
  }

  mapLeft<U>(_fn: (value: L) => U): Either<U, R> {
    return new Right<U, R>(this.value);
  }

  getOrElse(_defaultValue: R): R {
    return this.value;
  }

  ifRight(fn: (value: R) => void): Either<L, R> {
    fn(this.value);
    return this;
  }

  ifLeft(_fn: (value: L) => void): Either<L, R> {
    return this;
  }

  fold<U>(_leftFn: (left: L) => U, rightFn: (right: R) => U): U {
    return rightFn(this.value);
  }
}

/**
 * Funções utilitárias para criar Either
 */
export const left = <L, R>(value: L): Either<L, R> => new Left(value);
export const right = <L, R>(value: R): Either<L, R> => new Right(value);

/**
 * Executa uma função que pode lançar exceção e retorna Either
 */
export const tryCatch = <L, R>(
  fn: () => R,
  onError: (error: unknown) => L
): Either<L, R> => {
  try {
    return right(fn());
  } catch (error) {
    return left(onError(error));
  }
};

/**
 * Executa uma função assíncrona que pode lançar exceção e retorna Either
 */
export const tryCatchAsync = async <L, R>(
  fn: () => Promise<R>,
  onError: (error: unknown) => L
): Promise<Either<L, R>> => {
  try {
    const result = await fn();
    return right(result);
  } catch (error) {
    return left(onError(error));
  }
};