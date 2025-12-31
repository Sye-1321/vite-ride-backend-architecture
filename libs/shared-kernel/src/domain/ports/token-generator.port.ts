export interface TokenGeneratorPort {
  generateToken(length: number): string;
}
